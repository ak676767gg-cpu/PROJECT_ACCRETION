/* Orbital infrastructure uses the existing fixed step, spatial hash and save slots. */
'use strict';
(function(A){
  const finite=(v,lo=0,hi=1e9)=>Number.isFinite(v)&&v>=lo&&v<=hi;
  A.Industry=class{
    static migrateState(s){if(!s)return s;return{...s,salvage:Array.isArray(s.salvage)?s.salvage.map(A.migrateCachePayload):s.salvage,cargo:Array.isArray(s.cargo)?s.cargo.map(A.migrateCachePayload):s.cargo};}
    static valid(s){
      s=this.migrateState(s);
      if(!s||s.version!==1||!['raw','research','researchTime','batch','battery','overclockLeft','overclockGain','duration','shield','waterCarry','dnaCarry'].every(k=>finite(s[k],0,k==='raw'||k==='research'?1e7:1e8)))return false;
      if(!Number.isInteger(s.research)||s.batch>18||s.duration<5||s.duration>60||s.overclockLeft>60||s.overclockGain<1||s.overclockGain>2.5||s.waterCarry>=1||s.dnaCarry>=1)return false;
      if(!['balanced','charge','standby'].includes(s.mode)||typeof s.followers!=='boolean'||!Array.isArray(s.claims)||s.claims.length>100||!s.claims.every(k=>typeof k==='string'&&/^\d+\.\d{6}:(half|full)$/.test(k)))return false;
      if(!Array.isArray(s.salvage)||s.salvage.length>64||!s.salvage.every(q=>['id','x','y','vx','vy','raw','ttl'].every(k=>finite(q[k],k==='x'||k==='y'||k==='vx'||k==='vy'?-1e12:0,1e12))&&q.raw<=100&&['water','dna','rawPayload'].every(k=>q[k]===undefined||Number.isInteger(q[k])&&q[k]>=0&&q[k]<=(k==='rawPayload'?500000:10000))))return false;
      if(s.cargo&&(!Array.isArray(s.cargo)||s.cargo.length>10||!s.cargo.every(q=>['miner','collector'].includes(q.type)&&Number.isInteger(q.number)&&q.number>=0&&q.number<6&&finite(q.cargo,0,100)&&['water','dna','rawPayload'].every(k=>q[k]===undefined||Number.isInteger(q[k])&&q[k]>=0&&q[k]<=(k==='rawPayload'?500000:10000)))))return false;
      if(!['guardianReady','laserHeat','extractionCarry'].every(k=>s[k]===undefined||finite(s[k],0,1e8)))return false;
      return Number.isInteger(s.serial)&&s.serial>=0&&s.serial<=1e9;
    }
    constructor(g,s){
      s=A.Industry.migrateState(s);
      this.g=g;Object.assign(this,{raw:0,research:0,researchTime:0,batch:0,battery:0,overclockLeft:0,overclockGain:1,duration:20,mode:'balanced',followers:true,shield:0,waterCarry:0,dnaCarry:0,serial:0,guardianReady:0,laserHeat:0,extractionCarry:0,output:0,demand:0,power:1,multiplier:1,scanIn:0,fireIn:0,shieldHit:-100});
      this.drones=[];this.salvage=[];this.salvagePool=[];this.shots=[];this.shotPool=[];this.beams=[];this.beamPool=[];this.targets=[];this.byId=new Map();this.installs=new Map();
      if(A.Industry.valid(s)){for(const k of ['raw','research','researchTime','batch','battery','overclockLeft','overclockGain','duration','mode','followers','shield','waterCarry','dnaCarry','serial'])this[k]=s[k];for(const k of ['guardianReady','laserHeat','extractionCarry'])this[k]=Number.isFinite(s[k])?s[k]:0;this.salvage=s.salvage.map(q=>({...q}));}
      g.upgrades.restoreClaims(A.Industry.valid(s)?s.claims:null);
      this.syncDrones();if(A.Industry.valid(s))for(const saved of s.cargo||[]){const d=this.drones.find(q=>q.type===saved.type&&q.number===saved.number);if(d){d.cargo=saved.cargo;d.water=saved.water||0;d.dna=saved.dna||0;d.rawPayload=saved.rawPayload||0;if(d.cargo||d.water||d.dna||d.rawPayload)d.phase='return';}}
    }
    rank(id){return this.g.upgrades.get(id);}
    unlocked(){return A.scaleStage(this.g.player)>=4;}
    station(){const p=this.g.player,u=A.unit(p.m),a=this.g.time*.12,r=p.r+78*u;return{x:p.x+Math.cos(a)*r,y:p.y+Math.sin(a)*r*.85,z:p.z||0};}
    installed(id){this.installs.set(id,this.g.time);if(id==='shield_grid')this.shield=this.shieldCapacity();this.syncDrones();}
    syncDrones(){
      const station=this.station(),wanted=this.rank('outpost')?1+this.rank('miner'):0,haulers=this.rank('collector');
      for(const type of ['miner','collector']){const n=type==='miner'?wanted:haulers,current=this.drones.filter(d=>d.type===type).length;for(let i=current;i<n;i++)this.drones.push({type,number:i,x:station.x,y:station.y,px:station.x,py:station.y,vx:0,vy:0,target:0,phase:'idle',cargo:0,water:0,dna:0,rawPayload:0,think:0});}
      this.drones=this.drones.filter(d=>d.number<(d.type==='miner'?wanted:haulers));
    }
    capacity(){return this.rank('battery')*60;}
    shieldCapacity(){return this.rank('shield_grid')?10+this.rank('shield_grid')*20:0;}
    protect(damage){
      damage=this.guardianDefense(damage);
      if(!this.rank('shield_grid')||!(damage>0)||this.shield<=0)return damage;
      const absorbed=Math.min(this.shield,damage*.65);this.shield-=absorbed;this.shieldHit=this.g.time;return damage-absorbed;
    }
    generatorOutput(){return (this.rank('outpost')?2:0)+4*this.rank('steam')+8*this.rank('nuclear')+14*this.rank('fusion')+16*this.rank('solar')+28*this.rank('dyson');}
    machineDemand(){return (.8*(this.rank('outpost')?1+this.rank('miner'):0)+.45*this.rank('collector')+(this.rank('research_centre')?1:0)+.9*this.rank('turret')+.3*this.rank('shield_grid'))*(1-.12*this.rank('power_efficiency'));}
    overclockPreview(){const available=Math.min(this.battery,this.capacity()),eff=1+.15*this.rank('overclock')+.1*this.rank('power_efficiency'),demand=Math.max(1,this.machineDemand());return{gain:A.clamp(1+available*eff/(this.duration*demand*3),1,2.5),duration:this.duration,cost:available};}
    activate(){if(!this.rank('overclock')||this.overclockLeft>0||this.battery<8||this.mode==='standby')return false;const q=this.overclockPreview();this.battery-=q.cost;this.overclockGain=q.gain;this.overclockLeft=q.duration;this.mode='balanced';this.g.audio.play('boost',.5);this.g.ui.toast('FLEET OVERCLOCK',q.gain.toFixed(2)+'× for '+q.duration+' simulated seconds.','gold');return true;}
    energy(dt){
      this.output=this.generatorOutput();this.demand=this.machineDemand();const cap=this.capacity(),rate=6*(1+.35*this.rank('charge_rate')),eff=.8+.04*this.rank('power_efficiency');this.battery=Math.min(this.battery,cap);
      if(this.overclockLeft>0){this.overclockLeft=Math.max(0,this.overclockLeft-dt);this.power=1;this.multiplier=this.overclockGain;}
      else if(this.mode==='standby'){this.power=0;this.multiplier=0;}
      else if(this.mode==='charge'){this.battery=Math.min(cap,this.battery+Math.min(rate,this.output)*eff*dt);this.power=0;this.multiplier=0;}
      else{const shortage=Math.max(0,this.demand-this.output),draw=Math.min(shortage,this.battery/Math.max(dt,1e-9));this.battery=Math.max(0,this.battery-draw*dt);this.power=this.demand>0?A.clamp((this.output+draw)/this.demand,0,1):1;const excess=Math.max(0,this.output-this.demand);this.battery=Math.min(cap,this.battery+Math.min(rate,excess)*eff*dt);this.multiplier=this.power;}
      if(this.shieldHit<this.g.time-3&&this.power>0)this.shield=Math.min(this.shieldCapacity(),this.shield+dt*3*(1+.25*this.rank('shield_recharge'))*this.multiplier);
    }
    flightMultiplier(){return this.overclockLeft>0?1+Math.min(.25,(this.overclockGain-1)*.18):1;}
    samples(water,dna){
      const w=water*(1+.25*this.rank('water_recovery'))+this.waterCarry,d=dna*(1+.1*this.rank('dna_recovery'))+this.dnaCarry;
      const result={water:Math.floor(w+1e-9),dna:Math.floor(d+1e-9)};this.waterCarry=Math.max(0,w-result.water);this.dnaCarry=Math.max(0,d-result.dna);return result;
    }
    isRock(b){return b.alive&&['rock','debris','comet'].includes(b.kind)&&!['star','brown','blackhole','cluster','singularity','neutron','magnetar','strange','gravastar','nebula','gas'].includes(A.appearance(b).type)&&b.m<this.g.player.m*.35&&b.parentId!==this.g.player.id&&b.systemOwner!==this.g.player.id;}
    ore(b){if(b.ore===undefined)b.ore=4+(b.seed%6);if(b.integrity===undefined)b.integrity=100;return b.ore;}
    scan(){
      const g=this.g,p=g.player,u=A.unit(p.m),range=(290+75*this.rank('mining_range'))*u;this.targets.length=0;this.byId.clear();for(const b of g.world.bodies)if(b.alive)this.byId.set(b.id,b);
      g.world.hash.query(p.x,p.y,range,b=>{if(this.isRock(b)&&Math.abs((b.z||0)-(p.z||0))<90*u&&Math.hypot(b.x-p.x,b.y-p.y)<range&&Math.hypot(b.x-p.x,b.y-p.y)>p.r+b.r+8*u&&this.ore(b)>0)this.targets.push(b);});
      this.targets.sort((a,b)=>(a.x-p.x)**2+(a.y-p.y)**2-(b.x-p.x)**2-(b.y-p.y)**2);if(this.targets.length>36)this.targets.length=36;
    }
    crate(b,raw){if(!(raw>0))return;let q;if(this.salvage.length>=64){q=this.salvage.reduce((a,c)=>Math.hypot(a.x-b.x,a.y-b.y)<Math.hypot(c.x-b.x,c.y-b.y)?a:c);if(q.raw+raw>100)return;q.raw+=raw;return q;}q=this.salvagePool.pop()||{};Object.assign(q,{id:++this.serial,x:b.x,y:b.y,vx:b.vx*.2,vy:b.vy*.2,raw,water:0,dna:0,rawPayload:0,ttl:180});this.salvage.push(q);return q;}
    deposit(raw){if(!(raw>0))return;this.raw=Math.min(1e7,this.raw+raw);this.g.stats.rawMined=(this.g.stats.rawMined||0)+raw;const q=this.station();this.g.effects.label(q.x,q.y,'+'+Math.round(raw)+' RAW','#d8bd7c',null,q.z);this.g.audio.play('absorb',.15);}
    breakRock(b,drone=null){
      if(!this.isRock(b)||b.integrity>0)return false;const g=this.g,w=g.world,raw=Math.round(this.ore(b)*(1+.2*this.rank('ore_yield'))),start=w.bodies.length,water=b.lifeClaimed?0:b.water||0,dna=b.lifeClaimed?0:b.dna||0,bonusRaw=b.lifeClaimed?0:b.rawPayload||0;
      b.ore=0;b.water=0;b.dna=0;b.rawPayload=0;b.lifeClaimed=true;b.alive=false;w.fragments(b,b.m,3,8*A.unit(g.player.m));
      for(let i=start;i<w.bodies.length;i++){const f=w.bodies[i];f.ore=0;f.integrity=100;f.formationHost=b.formationHost||g.player.id;f.systemGroup=b.systemGroup;f.form='rock';f.material=b.material;f.water=i===start?water:0;f.dna=i===start?dna:0;f.rawPayload=i===start?bonusRaw:0;f.hardcoreCache=i===start&&!!b.hardcoreCache;f.lifeClaimed=false;}
      // Samples remain on physical fragments; a full body pool carries them on the crate.
      if(start===w.bodies.length&&(water||dna||bonusRaw)){if(drone){drone.water+=water;drone.dna+=dna;drone.rawPayload+=bonusRaw;}else{const crate=this.crate(b,Math.max(1,raw));if(crate){crate.water=(crate.water||0)+water;crate.dna=(crate.dna||0)+dna;crate.rawPayload=(crate.rawPayload||0 )+bonusRaw;}}}
      if(drone){drone.cargo+=raw;drone.phase='return';drone.target=0;}else if(start!==w.bodies.length||!(water||dna||bonusRaw))this.crate(b,raw);
      g.effects.burst(b.x,b.y,12,24*A.unit(g.player.m),'#c8b58d');g.audio.play('mining',.2);return true;
    }
    beam(a,b,color){if(this.beams.length>=16)return;const q=this.beamPool.pop()||{};Object.assign(q,{x:a.x,y:a.y,tx:b.x,ty:b.y,color,ttl:.14});this.beams.push(q);}
    moveDrone(d,x,y,dt){const u=A.unit(this.g.player.m),dx=x-d.x,dy=y-d.y,dist=Math.hypot(dx,dy)||1,max=(d.type==='collector'?115:90)*u,desired=Math.min(max,dist*3),f=A.ease(5,dt);d.vx=A.lerp(d.vx,dx/dist*desired,f);d.vy=A.lerp(d.vy,dy/dist*desired,f);d.x+=d.vx*dt;d.y+=d.vy*dt;}
    droneStep(d,dt){
      d.px=d.x;d.py=d.y;const g=this.g,p=g.player,station=this.station(),u=A.unit(p.m),speed=Math.max(.15,this.multiplier);d.think-=dt;
      if(Math.hypot(d.x-p.x,d.y-p.y)>1200*u){d.phase='return';d.target=0;}
      if(d.phase==='return'){this.moveDrone(d,station.x,station.y,dt*speed);if(Math.hypot(d.x-station.x,d.y-station.y)<9*u){this.deposit(d.cargo);if(d.water||d.dna||d.rawPayload)g.life.receive(d.water,d.dna,d.rawPayload||0);d.cargo=d.water=d.dna=d.rawPayload=0;d.phase='idle';}return;}
      if(this.multiplier<=0){const a=g.time*.32+d.number*1.7;this.moveDrone(d,station.x+Math.cos(a)*10*u,station.y+Math.sin(a)*10*u,dt);return;}
      let target=d.type==='collector'?this.salvage.find(q=>q.id===d.target):this.byId.get(d.target);
      if(d.type==='miner'&&target&&target.id!==d.target)target=null;
      if(d.think<=0||!target||target.alive===false){d.think=.6;const occupied=new Set(this.drones.filter(q=>q!==d&&q.type===d.type).map(q=>q.target));if(d.type==='miner'){const order=this.g.command?.droneOrder,assigned=order&&this.byId.get(order.id);target=assigned&&this.isRock(assigned)&&this.ore(assigned)>0?assigned:this.targets.filter(b=>this.isRock(b)&&this.ore(b)>0&&!occupied.has(b.id)).sort((a,b)=>order?Math.hypot(a.x-order.x,a.y-order.y)-Math.hypot(b.x-order.x,b.y-order.y):0)[0];}else target=this.salvage.find(q=>q.raw>0&&!occupied.has(q.id));d.target=target?.id||0;}
      if(!target){const a=g.time*.32+d.number*1.7;this.moveDrone(d,station.x+Math.cos(a)*14*u,station.y+Math.sin(a)*14*u,dt*speed);return;}
      if(Math.hypot(target.x-p.x,target.y-p.y)>(400+75*this.rank('mining_range'))*u){d.target=0;d.phase='return';return;}
      const reach=d.type==='miner'?(target.r+u*(this.rank('mining_laser')?30:10)):7*u,dx=d.x-target.x,dy=d.y-target.y,dist=Math.hypot(dx,dy)||1;
      this.moveDrone(d,target.x+dx/dist*reach*.8,target.y+dy/dist*reach*.8,dt*speed);
      if(dist<reach+4*u){if(d.type==='collector'){d.cargo+=target.raw;d.water+=target.water||0;d.dna+=target.dna||0;d.rawPayload+=target.rawPayload||0;target.raw=target.water=target.dna=target.rawPayload=0;d.phase='return';d.target=0;}else{target.integrity-=dt*12.5*(1+.25*this.rank('mining_rate'))*(this.rank('mining_laser')?2+.25*(this.rank('mining_laser')-1):1)*this.multiplier;if(g.tick%6===0)this.beam(d,target,this.rank('mining_laser')?'#b7e6da':'#d8bd7c');this.breakRock(target,d);}}
    }
    researchStep(dt){if(!this.rank('research_centre')||this.multiplier<=0)return;this.researchTime+=dt;if(this.batch<=0&&this.raw>=50){this.raw-=50;this.batch=18;}if(this.batch>0){this.batch=Math.max(0,this.batch-dt*(1+.25*this.rank('research_rate'))*this.multiplier);if(this.batch===0){this.research=Math.min(1e7,this.research+1);this.g.stats.researchMade=(this.g.stats.researchMade||0)+1;this.g.ui.toast('RESEARCH COMPLETE','+1 Research Point · 50 Raw Material refined.','aqua');this.g.audio.play('upgrade',.3);}}}
    fire(dt){
      this.fireIn-=dt;if(!this.rank('turret')||this.multiplier<=0||this.fireIn>0)return;const g=this.g,p=g.player,u=A.unit(p.m),reach=360*u;let target=null,best=Infinity;
      const manual=g.command?.aimMode==='attack';if(manual&&!g.input.mouse.held)return;
      if(manual)target=g.command.aimTarget(reach,false);else g.world.hash.query(p.x,p.y,reach,b=>{if(!b.alive||b===p||b.systemOwner===p.id||b.guardianOwner===p.id||b.grace>0||b.invulnerable>0||Math.abs((b.z||0)-(p.z||0))>70*u)return;const enemy=b.kind==='ai'||b.boss,rock=this.isRock(b)&&this.ore(b)>0;if(!enemy&&!rock)return;const d=Math.hypot(b.x-p.x,b.y-p.y);if(d>reach||d<p.r+b.r)return;const priority=d-(enemy?reach:0);if(priority<best){best=priority;target=b;}});
      this.fireIn=(1.5/(1+.2*this.rank('attack_rate')))/Math.max(.1,this.multiplier);if(!target&&manual)target={...g.command.aimPoint(),id:0,vx:0,vy:0};if(!target)return;
      for(let t=0;t<this.rank('turret');t++){const a=this.g.time*.12+t*A.TAU/this.rank('turret'),muzzle={x:p.x+Math.cos(a)*(p.r+5*u),y:p.y+Math.sin(a)*(p.r+5*u)};
        if(this.rank('attack_laser')&&(t+Math.floor(g.time))%2===0){this.beam(muzzle,target,'#efb7a0');g.audio.play('laser',.2);if(target.id)this.hit(target,16*(1+.2*this.rank('attack_damage'))*(1+.15*this.rank('attack_laser')));}
        else if(this.shots.length<48){const dist=Math.hypot(target.x-muzzle.x,target.y-muzzle.y),lead=dist/(210*u),dx=target.x+target.vx*lead-muzzle.x,dy=target.y+target.vy*lead-muzzle.y,d=Math.hypot(dx,dy)||1,q=this.shotPool.pop()||{};Object.assign(q,{x:muzzle.x,y:muzzle.y,vx:dx/d*210*u,vy:dy/d*210*u,target:target.id,ttl:3,damage:18*(1+.2*this.rank('attack_damage'))});this.shots.push(q);g.audio.play('turret',.18);}
      }
    }
    hit(b,damage){
      if(!b.alive||b.invulnerable>0||b.grace>0)return;
      const g=this.g,p=g.player,u=A.unit(p.m);if(b.boss){g.command?.damageBoss(b,damage);return;}if(b.kind==='ai'){const dm=Math.min(b.m*.0015*damage/18,p.m*.0015*damage/18);if(!(dm>0)||g.world.bodies.length>=g.world.budget())return;b.setMass(b.m-dm);const start=g.world.bodies.length;g.world.fragments(b,dm,1,14*u);for(let n=start;n<g.world.bodies.length;n++)g.world.bodies[n].ore=0;b.hit=.5;b.vx+=(b.x-p.x)/Math.max(1,Math.hypot(b.x-p.x,b.y-p.y))*2*u;b.vy+=(b.y-p.y)/Math.max(1,Math.hypot(b.x-p.x,b.y-p.y))*2*u;}
      else if(this.isRock(b)){this.ore(b);b.integrity-=damage;this.breakRock(b);}g.effects.burst(b.x,b.y,4,16*u,'#de9380');
    }
    projectiles(dt){
      const g=this.g,u=A.unit(g.player.m);for(let i=this.shots.length-1;i>=0;i--){const q=this.shots[i],x=q.x,y=q.y;q.x+=q.vx*dt;q.y+=q.vy*dt;q.ttl-=dt;const dx=q.x-x,dy=q.y-y,len=dx*dx+dy*dy||1;let hit=null,first=2;for(const b of this.byId.values()){if(!b.alive||b===g.player||b.systemOwner===g.player.id||b.guardianOwner===g.player.id||(!b.boss&&b.kind!=='ai'&&!this.isRock(b)))continue;const t=A.clamp(((b.x-x)*dx+(b.y-y)*dy)/len,0,1);if(t<first&&Math.hypot(b.x-x-dx*t,b.y-y-dy*t)<b.r+2*u){hit=b;first=t;}}if(hit){this.hit(hit,q.damage);q.ttl=0;}if(q.ttl<=0){this.shots.splice(i,1);this.shotPool.push(q);}}
      for(let i=this.beams.length-1;i>=0;i--)if((this.beams[i].ttl-=dt)<=0)this.beamPool.push(...this.beams.splice(i,1));
    }
    personalLaser(dt){
      const g=this.g,cmd=g.command,p=g.player,u=A.unit(p.m);
      this.laserHeat=Math.max(0,(this.laserHeat||0)-dt*.15);if(this.laserLocked&&this.laserHeat<.22)this.laserLocked=false;
      if(!cmd||cmd.aimMode!=='mining'||!g.input.mouse.held||!this.rank('mining_laser')||this.multiplier<=0||this.laserLocked)return;
      const range=(430+70*this.rank('mining_range'))*u,target=cmd.aimTarget(range,true),end=target||cmd.aimPoint(range);
      if(g.tick%4===0)this.beam(p,end,this.laserHeat>.75?'#efbb91':'#b7e6da');this.laserHeat+=dt*.3;this.laserLocked=this.laserHeat>=1;
      if(g.tick%18===0)g.audio.play('laser',.1);
      if(!target)return;
      if(this.isRock(target)){this.ore(target);target.integrity-=dt*30*(1+.25*this.rank('mining_laser'))*this.multiplier;this.breakRock(target);}
      else if(A.appearance(target).type==='blackhole'&&this.rank('horizon_mining')){
        // A horizon is not solid ore. Recover actual stored matter from its outer disk.
        const packet=g.cosmic.packets.find(q=>q.owner===target.id&&q.inDisk&&q.m>0&&!q.feeding);
        if(packet){const dm=Math.min(packet.m,p.m*.000025*dt*this.multiplier);packet.m-=dm;this.extractionCarry=(this.extractionCarry||0)+dm/p.m*80000;
          if(this.extractionCarry>=1){const raw=Math.min(6,Math.floor(this.extractionCarry)),crate=this.crate(packet,raw);if(crate){this.extractionCarry-=raw;crate.vx=(p.x-crate.x)*.16;crate.vy=(p.y-crate.y)*.16;}}
        }else if(g.time>(this.extractHintAt||0)){this.extractHintAt=g.time+5;g.ui.toast('NO EXTRACTABLE DISK','This horizon has no stored outer-disk matter.','aqua');}
      }
    }
    guardianDefense(damage){
      const g=this.g,p=g.player;if(!(damage>0)||!this.rank('guardian'))return damage;
      const worlds=g.world.bodies.filter(b=>b.alive&&b.guardianOwner===p.id&&b.systemOwner===p.id&&b.parentId===p.id&&b.orbitStable&&!b.collapse);
      if(!worlds.length)return damage;
      const b=worlds.reduce((a,b)=>a.m>b.m?a:b),cover=Math.min(.65,.18+.06*worlds.length+.1*this.rank('guardian_armor')+.05*this.rank('guardian_belt'));
      const absorbed=damage*cover,loss=b.m*Math.min(.2,absorbed*.004);b.setMass(b.m-loss);g.world.fragments(b,loss,1,5*A.unit(p.m));b.hit=.7;
      if(b.m<p.m*.00003){b.guardianOwner=null;g.ui.toast('GUARDIAN EXHAUSTED',b.name+' no longer provides orbital cover.','gold');}
      g.effects.ring(b.x,b.y,b.r,'#b7d6a0');return damage-absorbed;
    }
    assembleGuardian(){
      const g=this.g,p=g.player,black=A.appearance(p).type==='blackhole',cost=black?200:80;
      const existing=g.world.bodies.filter(b=>b.alive&&b.guardianOwner===p.id&&b.parentId===p.id);
      if(!this.rank('guardian')||existing.length>=this.rank('guardian')||this.raw<cost||black&&!this.rank('galaxy_core')||!['star','brown','blackhole'].includes(A.appearance(p).type)||g.time<(this.guardianReady||0)||g.world.bodies.length>g.world.budget()-14)return false;
      const a=g.world.random()*A.TAU,u=A.unit(p.m),d=(210+existing.length*145)*u+p.r*2,m=p.m*(black?.005:.003);
      const create=(parent,d,a,m,form,name)=>{const b=g.world.make(parent.x+Math.cos(a)*d,parent.y+Math.sin(a)*d,m);b.form=form;b.name=name;b.material=form==='star'?'stellar':'rock';b.z=b.pz=parent.z||0;b.composition=A.Composition.seed(b);b.setMass(m);const v=Math.sqrt((A.Physics.mu(g,parent)+A.Physics.mu(g,b))/d);b.vx=parent.vx-Math.sin(a)*v;b.vy=parent.vy+Math.cos(a)*v;b.vz=parent.vz||0;b.formationHost=parent.id;b.systemGroup=p.id;b.grace=3;return b;};
      this.raw-=cost;p.setMass(p.m-m);const world=create(p,d,a,m,black?'star':'planet',black?'Guardian star '+(existing.length+1):'Guardian world '+(existing.length+1));world.guardianOwner=p.id;world.parentId=p.id;world.systemOwner=p.id;world.orbitState='CAPTURE';
      if(black||this.rank('guardian_belt')){const count=black?3:2,childMass=world.m*(black?.00015:.0005);for(let n=0;n<count;n++){const cd=(world.r*3.2+10*A.unit(world.m))*(1+n*.4);create(world,cd,a+n*2.4,childMass,black?'planet':'moon',black?'Guardian system planet':'Guardian moon');world.setMass(world.m-childMass);}
        for(let n=0;n<6;n++){const bm=world.m*.000003;create(world,world.r*6,a+n*A.TAU/6,bm,'rock','Guardian belt');world.setMass(world.m-bm);}}
      this.guardianReady=g.time+35;g.world.rebuild();g.ui.toast('ORBITAL ASSEMBLY','Core mass transferred into a guardian. Coast while its orbit settles.','aqua');g.audio.play('stableOrbit',.4);A.Save.checkpoint(g);return true;
    }
    update(dt){
      if(!this.g.player?.alive)return;this.g.upgrades.updateProgress();if(!this.rank('outpost'))return;
      this.energy(dt);this.scanIn-=dt;if(this.scanIn<=0){this.scanIn=.5;this.scan();}
      this.researchStep(dt);for(const d of this.drones)this.droneStep(d,dt);this.fire(dt);this.personalLaser(dt);this.projectiles(dt);
      const p=this.g.player;for(let i=this.salvage.length-1;i>=0;i--){const q=this.salvage[i];q.x+=q.vx*dt;q.y+=q.vy*dt;q.ttl-=dt;if(q.raw>0&&Math.hypot(q.x-p.x,q.y-p.y)<p.r+3*A.unit(p.m)){this.deposit(q.raw);if(q.water||q.dna||q.rawPayload)this.g.life.receive(q.water||0,q.dna||0,q.rawPayload||0);q.raw=q.water=q.dna=q.rawPayload=0;}if(q.raw<=0||q.ttl<=0)this.salvagePool.push(...this.salvage.splice(i,1));}
    }
    rebase(x,y){for(const list of [this.drones,this.salvage,this.shots,this.beams])for(const q of list){q.x-=x;q.y-=y;if(Number.isFinite(q.px)){q.px-=x;q.py-=y;}if(Number.isFinite(q.tx)){q.tx-=x;q.ty-=y;}}}
    scale(f){const p=this.g.player;for(const list of [this.drones,this.salvage,this.shots,this.beams])for(const q of list){q.x=p.x+(q.x-p.x)*f;q.y=p.y+(q.y-p.y)*f;if(Number.isFinite(q.px)){q.px=q.x;q.py=q.y;}if(Number.isFinite(q.vx)){q.vx*=f;q.vy*=f;}if(Number.isFinite(q.tx)){q.tx=p.x+(q.tx-p.x)*f;q.ty=p.y+(q.ty-p.y)*f;}}this.targets.length=0;this.byId.clear();this.scanIn=0;}
    serialize(){return{version:1,guardianReady:this.guardianReady||0,laserHeat:this.laserHeat||0,extractionCarry:this.extractionCarry||0,raw:this.raw,research:this.research,researchTime:this.researchTime,batch:this.batch,battery:this.battery,overclockLeft:this.overclockLeft,overclockGain:this.overclockGain,duration:this.duration,mode:this.mode,followers:this.followers,shield:this.shield,waterCarry:this.waterCarry,dnaCarry:this.dnaCarry,serial:this.serial,claims:[...this.g.upgrades.claims],salvage:this.salvage.map(q=>({...q})),cargo:this.drones.map(d=>({type:d.type,number:d.number,cargo:d.cargo,water:d.water,dna:d.dna,rawPayload:d.rawPayload}))};}
  };
})(window.AC);
