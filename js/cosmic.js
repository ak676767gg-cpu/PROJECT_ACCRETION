/* Persistent orbital hierarchies and finite matter reservoirs. All units are gameplay-compressed. */
'use strict';
(function(A){
  A.orbitElements=function(g,b,p,out){
    // Scalar vector algebra avoids eight temporary arrays per orbital classification.
    const rx=b.x-p.x,ry=b.y-p.y,rz=(b.z||0)-(p.z||0),vx=b.vx-p.vx,vy=b.vy-p.vy,vz=(b.vz||0)-(p.vz||0),d=Math.max(1e-6,Math.hypot(rx,ry,rz)),mu=A.Physics.mu(g,p)+A.Physics.mu(g,b);
    const hx=ry*vz-rz*vy,hy=rz*vx-rx*vz,hz=rx*vy-ry*vx,hn=Math.hypot(hx,hy,hz),ex=(vy*hz-vz*hy)/mu-rx/d,ey=(vz*hx-vx*hz)/mu-ry/d,ez=(vx*hy-vy*hx)/mu-rz/d,e=Math.hypot(ex,ey,ez),energy=(vx*vx+vy*vy+vz*vz)*.5-mu/d,a=energy<0?-mu/(2*energy):Infinity;
    const ux=e>.001?ex/e:rx/d,uy=e>.001?ey/e:ry/d,uz=e>.001?ez/e:rz/d,nx=hn>1e-9?hx/hn:0,ny=hn>1e-9?hy/hn:0,nz=hn>1e-9?hz/hn:1,o=out||{};
    o.u||=[0,0,0];o.tangent||=[0,0,0];o.u[0]=ux;o.u[1]=uy;o.u[2]=uz;o.tangent[0]=ny*uz-nz*uy;o.tangent[1]=nz*ux-nx*uz;o.tangent[2]=nx*uy-ny*ux;
    Object.assign(o,{d,mu,h:hn,e,energy,a,peri:hn*hn/mu/(1+e),apo:energy<0?a*(1+e):Infinity,period:energy<0?A.TAU*Math.sqrt(a*a*a/mu):Infinity,speed:Math.hypot(vx,vy,vz),escape:Math.sqrt(2*mu/d),inclination:Math.acos(A.clamp(nz,-1,1))});return o;
  };
  A.ORBIT_COLORS={'FLYBY':'#99a9b7','CAPTURE':'#d8bc8d','STABLE ORBIT':'#a7dbc7','COLLISION':'#ef977d','ESCAPE':'#d89cab','UNSTABLE ORBIT':'#e5bc79','ACCRETION':'#9ecfc4'};
  const TYPES=[['Emission nebula','#b77e62','gas'],['Dark molecular cloud','#344052','dust'],['Stellar nursery','#72adb7','gas'],['Supernova remnant','#ad795f','plasma'],['Galactic dust lane','#8a8b9c','dust']];
  A.Cosmic=class{
    constructor(g,s){this.g=g;this.packets=(s?.packets||[]).slice(0,160).map(q=>({...A.migrateCachePayload(q),trail:[]}));this.regions=(s?.regions||[]).slice(0,8).map(r=>({...r,cells:r.cells.map(c=>({...c,trail:[]}))}));this.formed=s?.formed||0;this.stage=s?.stage??-1;this.spawnIn=s?.spawnIn||0;this.serial=s?.serial||0;this.anchor=s?.anchor||{x:g.player.x,y:g.player.y,scale:A.unit(g.player.m)};this.orbitIn=0;this.flowIn=0;this.condenseIn=s?.condenseIn||12;this.members=[];this.belts=[];this.bonus=0;this.rate=0;this.diskMass=0;this.feedingMass=0;this.incomingMass=0;this.capturedMass=0;this.density=0;this.regionName='Interstellar drift';this.radius=400*A.unit(g.player.m);this.totalAccreted=s?.totalAccreted||0;this.byId=new Map();this.ownerMass=new Map();this.ownerDisk=new Map();this.systems=new Map();this.allMembers=[];this.packetPool=[];this.milestones={...(s?.milestones||{})};this.thefts=new Map((s?.thefts||[]).slice(-16).map(q=>[q.owner,{at:q.at,body:q.body}]));this.disturbance=s?.disturbance||null;this.diskObserve=s?.diskObserve||0;this.summary={bound:0,planets:0,moons:0,dwarfs:0,companions:0,mass:0,stability:0};}
    root(b) {
      let q=b, n=0;
      while(q?.parentId&&n++<4)q=this.byId.get(q.parentId);
      return n<=4?q:null;
    }
    isPlanet(b) { return !['star','blackhole','neutron','magnetar','strange','singularity','gravastar','nebula','cluster'].includes(A.appearance(b).type)&&A.kg(b.m)>=.1*5.9722e24; }
    rank(owner,id) { return owner===this.g.player?this.g.upgrades.get(id):Math.min(2,Math.max(0,Math.floor((A.scaleStage(owner)-8)/4))); }
    profile(owner) {
      const s=this.systems.get(owner.id), stable=s?.stablePlanets||0, maturity=Math.min(1,(s?.healthyTime||0)/30);
      const resonance=owner.resonanceBonus||0;this.profileCache||=new WeakMap();const old=this.profileCache.get(owner);if(old&&old.stable===stable&&old.maturity===maturity&&old.resonance===resonance)return old.value;
      const value={gravity:Math.min(.08,stable*.02)*maturity+resonance, survey:Math.min(.3,stable*.075)*maturity, intake:Math.min(.16,stable*.04)*maturity};this.profileCache.set(owner,{stable,maturity,resonance,value});return value;
    }
    mark(key,body) {
      if(this.milestones[key])return;
      this.milestones[key]=true; A.Save.achievement(key,this.g);
      if(['orbit','disk'].includes(key))this.g.moment?.(key==='orbit'?'FIRST STABLE ORBIT':'ACCRETION DISK FORMED',body);
    }
    transition(b,state,owner,previousOwner) {
      const g=this.g,old=b.orbitState;
      b.orbitState=state;
      if(old===state&&previousOwner===(owner?.id||null))return;
      b.noticeUntil=g.time+2.6;
      const local=Math.hypot(b.x-g.player.x,b.y-g.player.y)<900*A.unit(g.player.m);
      if(local&&g.time-(b.lastCue??-100)>2.5){
        b.lastCue=g.time;if(b.id===g.selectedBody||b.m>g.player.m*.00005||b.kind==='comet')g.effects.label(b.x,b.y,state,A.ORBIT_COLORS[state]||'#cbb58f',b.id,b.z||0);
        const cue=state==='STABLE ORBIT'?'stableOrbit':state==='ESCAPE'?'ejection':state==='ACCRETION'?'infall':state==='CAPTURE'?'orbitCapture':null;
        // Losing one of your own worlds should sound like what it was: a wider mass response than
        // the generic cue, so a departing gas giant and a departing moonlet are clearly different.
        const mine=state==='ESCAPE'&&previousOwner===g.player.id;
        if(cue)g.audio.play(cue,mine?A.clamp(Math.sqrt(b.m/Math.max(1e-9,g.player.m))*4,.02,1):A.clamp(b.m/(owner?.m||g.player.m)*20,.02,1));
      }
      if(owner===g.player)g.ui.teach?.(state);
      if(state==='STABLE ORBIT'&&owner===g.player){
        // transition() returns early when nothing changed, so each entry into the state counts once.
        g.stats.orbitsEstablished=(g.stats.orbitsEstablished||0)+1;
        this.mark('orbit',b);
        if(this.isPlanet(b)&&!b.playerCaptureCredited){b.playerCaptureCredited=true;g.stats.planetsCaptured=(g.stats.planetsCaptured||0)+1;}
      }
      if(previousOwner&&previousOwner!==g.player.id&&owner===g.player){
        // A world just changed hands away from a rival. Aggressive rivals answer this directly.
        (this.thefts||=new Map()).set(previousOwner,{at:g.time,body:b.id});
      }
      if(previousOwner===g.player.id&&owner!==g.player&&b.m>g.player.m*.00003){
        this.disturbance={until:g.time+18,hadSystem:true};
        if(local&&g.time-(this.lastLoss??-100)>8){this.lastLoss=g.time;g.ui.toast('SYSTEM DISTURBED',owner?'A nearby gravity well has taken a body.':'An orbiting body is escaping.','gold');}
      }
    }
    forces(dt) {
      const g=this.g;
      this.byId.clear();for(const b of g.world.bodies)if(b.alive)this.byId.set(b.id,b);
      const p=g.player,tx=p.vx+(p.ax||0)*dt,ty=p.vy+(p.ay||0)*dt;
      const speed=Math.hypot(tx,ty),limit=A.FLIGHT.cruise*(A.Supernova?.buffs(p).speed||1)*(1+.1*g.upgrades.get('thrust'))*A.unit(p.m);
      const cap=speed>limit?A.lerp(1,limit/speed,A.ease(3,dt)):1;
      // Carry actual gentle input after the cruise limiter, so satellites do not keep
      // accelerating indefinitely while their star has already reached cruise speed.
      const flightAx=(p.controlAx||0)+(tx*cap-tx)/dt,flightAy=(p.controlAy||0)+(ty*cap-ty)/dt;
      for(const b of this.allMembers){
        if(!b.alive||!b.parentId)continue;
        const parent=this.byId.get(b.parentId),owner=this.root(b);
        if(!parent||!owner){const old=b.systemOwner;b.parentId=null;b.orbitStable=false;b.stableTime=0;b.systemOwner=null;this.transition(b,'ESCAPE',null,old);continue;}
        if(b.orbitStable&&(owner!==g.player||!g.boosting)){
          const coupling=Math.min(.97,.82+.04*this.rank(owner,'harmony')+(owner===g.player?(g.life?.buffs().harmony||0):0));
          // Preserve the old differential system stress with the now-uniform flight thrust.
          // This is the existing gentle-acceleration approximation, not a rigid position attachment.
          const assist=owner===g.player?1-(1-coupling)*(A.scaleStage(owner)>=15?3:6)/A.FLIGHT.acceleration:coupling;
          b.ax+=(owner===p?flightAx:owner.controlAx||0)*assist;b.ay+=(owner===p?flightAy:owner.controlAy||0)*assist;
        }
        if(b.collapse){const f=1-Math.exp(-dt*.11);b.vx-=(b.vx-parent.vx)*f;b.vy-=(b.vy-parent.vy)*f;b.vz-=(b.vz-(parent.vz||0))*f;}
        b.ttl=0;
      }
    }
    detect(elapsed) {
      const g=this.g,p=g.player,w=g.world,roots=w.sources.filter(b=>b.alive&&A.scaleStage(b)>=9&&!b.parentId&&A.Physics.mu(g,b)>0);
      if(!roots.length){for(const b of w.bodies)if(b.parentId){const previous=b.systemOwner;b.parentId=null;b.systemOwner=null;b.orbitStable=false;b.stableTime=0;this.transition(b,'ESCAPE',null,previous);}this.members=[];this.allMembers=[];this.systems.clear();this.belts=[];this.bonus=0;p.systemHealthyTime=0;p.resonanceBonus=0;this.summary={bound:0,planets:0,moons:0,dwarfs:0,companions:0,mass:0,stability:0,atRisk:0,stablePlanets:0,healthyTime:0};return;}
      const candidates=w.bodies.filter(b=>b.alive&&b!==p&&b.kind!=='ai'),selected=new Set(),ordered=[];
      // Each root gets its own candidate quota. Distant rivals cannot be starved by a crowded player belt.
      for(const owner of roots){
        const range=A.Physics.influence(g,owner),near=candidates.filter(b=>b!==owner&&(b.parentId||Math.hypot(b.x-owner.x,b.y-owner.y)<range));
        near.sort((a,b)=>(a.systemOwner===owner.id?0:1)-(b.systemOwner===owner.id?0:1)||(a.x-owner.x)**2+(a.y-owner.y)**2-(b.x-owner.x)**2-(b.y-owner.y)**2);
        for(const b of near.slice(0,owner===p?112:20))if(!selected.has(b.id)){selected.add(b.id);ordered.push(b);}
      }
      const tracked=ordered.slice(0,288),rootIds=new Set(roots.map(b=>b.id));
      const cache=w.sources.filter(q=>q.alive&&(rootIds.has(q.id)||q.parentId)).map(q=>{
        const host=this.byId.get(q.parentId),owner=this.root(q);
        return {q,mu:A.Physics.mu(g,q),range:A.Physics.influence(g,q),local:host&&owner&&host===owner,hill:host?Math.hypot(q.x-host.x,q.y-host.y)*Math.cbrt(q.m/(3*host.m)):0};
      });
      for(const b of tracked){
        let parent=null,best=0,oldScore=0;const old=b.parentId,previousOwner=b.systemOwner??(b.parentId?this.root(b)?.id:null);
        for(const {q,mu,range,local,hill} of cache){
          if(mu<=0||q===b||q.m<b.m*1.05||q.parentId===b.id||q.parentId&&!local)continue;
          const dx=b.x-q.x,dy=b.y-q.y,dz=(b.z||0)-(q.z||0),d2=dx*dx+dy*dy+dz*dz;
          if(d2>range*range||d2<.01||local&&d2>(hill*.5)**2)continue;
          const d=Math.sqrt(d2),energy=((b.vx-q.vx)**2+(b.vy-q.vy)**2+((b.vz||0)-(q.vz||0))**2)*.5-mu/d;
          if(energy>=0)continue;
          const score=mu/d2*(local?100:1);
          if(q.id===old)oldScore=score;
          if(score>best){best=score;parent=q;}
        }
        if(parent&&oldScore>0&&parent.id!==old&&best<oldScore*1.25)parent=this.byId.get(old);
        if(!parent){
          b.parentId=null;b.systemOwner=null;b.orbitStable=false;b.stableTime=0;
          const reference=this.byId.get(previousOwner)||p;b.orbit=A.orbitElements(g,b,reference,b.orbit);b.orbitReference=reference.id;
          this.transition(b,old?'ESCAPE':b.orbit.peri<reference.r+b.r?'COLLISION':'FLYBY',null,previousOwner);continue;
        }
        const o=A.orbitElements(g,b,parent,b.orbit),host=this.byId.get(parent.parentId);
        b.orbit=o;b.orbitReference=parent.id;
        if(host&&o.apo>Math.hypot(parent.x-host.x,parent.y-host.y)*Math.cbrt(parent.m/(3*host.m))*.5){b.parentId=null;b.systemOwner=null;b.orbitStable=false;b.stableTime=0;this.transition(b,'UNSTABLE ORBIT',null,previousOwner);continue;}
        b.parentId=parent.id;const owner=this.root(b);b.systemOwner=owner?.id||null;
        if(old!==parent.id)b.collapse=false; // A stolen body does not inherit its former owner's collapse command.
        let tide=0;
        for(const q of roots)if(q!==parent&&q!==b&&q.id!==parent.parentId){const d=Math.hypot(q.x-b.x,q.y-b.y,(q.z||0)-(b.z||0));tide+=q.m/parent.m*Math.pow(o.d/Math.max(d,1),3);}
        b.tidalStress=tide;
        const safe=o.energy<0&&o.e<.78&&o.peri>parent.r*1.18+b.r&&o.apo<A.Physics.influence(g,parent)*.78&&tide<.2&&!b.collapse;
        b.stableTime=safe?(old===parent.id?b.stableTime+elapsed:elapsed):Math.max(0,b.stableTime-elapsed*4);
        const stable=safe&&b.stableTime>=Math.min(12,Math.max(5,o.period*.04));
        b.orbitStable=stable;
        b.risk=b.collapse?'INFALL':o.peri<parent.r+b.r?'COLLISION':tide>.2||o.e>.78||o.apo>A.Physics.influence(g,parent)*.78?'EJECTION':'CLEAR';
        this.transition(b,b.collapse?'ACCRETION':stable?'STABLE ORBIT':b.risk==='COLLISION'?'COLLISION':safe?'CAPTURE':'UNSTABLE ORBIT',owner,previousOwner);
        if(stable)b.capturedAt=b.capturedAt<0?g.time:b.capturedAt;
      }
      this.allMembers=w.bodies.filter(b=>b.alive&&b.parentId&&this.root(b));
      const oldSystems=this.systems;this.systems=new Map();
      for(const owner of roots){
        const members=this.allMembers.filter(b=>this.root(b)===owner),s={owner:owner.id,members,bound:members.length,planets:0,moons:0,dwarfs:0,companions:0,mass:0,logicalMass:0,stability:0,stablePlanets:0,atRisk:0,healthyTime:0,radius:400*A.unit(owner.m)};let stable=0;
        for(const b of members){s.mass+=A.kg(b.m);s.logicalMass+=b.m;if(b.orbitStable)stable++;if(b.risk==='EJECTION'||b.risk==='COLLISION')s.atRisk++;
          if(b.parentId!==owner.id)s.moons++;else if(['star','blackhole','neutron','magnetar','strange','singularity','gravastar'].includes(A.appearance(b).type))s.companions++;else if(this.isPlanet(b)){s.planets++;if(b.orbitStable)s.stablePlanets++;}else if(A.scaleStage(b)>=3)s.dwarfs++;
          s.radius=Math.max(s.radius,Math.min(b.orbit?.apo||0,1400*A.unit(owner.m)));}
        s.stability=s.bound?stable/s.bound:0;
        s.healthyTime=s.stablePlanets>=2&&s.stability>.6?(oldSystems.get(owner.id)?.healthyTime||owner.systemHealthyTime||0)+elapsed:Math.max(0,(oldSystems.get(owner.id)?.healthyTime||0)-elapsed*2);
        owner.systemHealthyTime=s.healthyTime;this.systems.set(owner.id,s);
      }
      const s=this.systems.get(p.id)||{bound:0,planets:0,moons:0,dwarfs:0,companions:0,mass:0,stability:0,atRisk:0,stablePlanets:0};
      this.members=s.members||[];this.summary=s;this.radius=s.radius||400*A.unit(p.m);this.bonus=this.profile(p).gravity;
      const bins=new Map();for(const b of this.members)if(b.parentId===p.id&&b.orbitStable&&b.m<p.m*.00003){const k=Math.round(Math.log(Math.max(1,b.orbit.a))/Math.log(1.3));if(!bins.has(k))bins.set(k,[]);bins.get(k).push(b);}
      this.belts=[...bins.values()].filter(b=>b.length>=6);
      if(s.stablePlanets>=3&&s.healthyTime>=12&&!this.milestones.system){g.stats.systemsBuilt=(g.stats.systemsBuilt||0)+1;this.mark('system',p);}
      if(s.atRisk&&s.bound>=2)this.disturbance={until:g.time+18,hadSystem:true};
      if(this.disturbance&&g.time>this.disturbance.until&&p.alive){if(s.bound>=1&&s.stability>.5)this.mark('endured',p);this.disturbance=null;}
    }
    relocateSystem(owner,dx,dy){
      for(const b of this.g.world.bodies)if(b!==owner&&b.alive&&(b.systemOwner===owner.id||this.root(b)===owner)){b.x+=dx;b.y+=dy;b.px+=dx;b.py+=dy;b.trail.length=0;}
      for(const q of this.packets)if(q.owner===owner.id){q.x+=dx;q.y+=dy;q.trail.length=0;}
    }
    collapse(id){const b=this.members.find(q=>q.id===Number(id));if(!b)return false;b.collapse=!b.collapse;b.orbitStable=false;b.stableTime=0;this.g.ui.toast(b.collapse?'ORBIT COLLAPSE':'COLLAPSE RELEASED',b.collapse?'Angular momentum is draining. Matter will spiral inward.':'The body retains its current trajectory.','gold');return true;}
    selectAt(x,y){let best=28,id=null;for(const b of this.g.world.bodies){if(!b.alive||!b.orbit||b===this.g.player)continue;const q=this.g.renderer.bodyPoint(b),d=Math.hypot(q.x-x,q.y-y);if(d<best){best=d;id=b.id;}}this.g.selectedBody=id;}
    evolve(){for(const b of this.members){b.stableTime=0;b.orbitStable=false;b.heat=Math.max(0,1-(b.orbit?.peri||Infinity)/(this.g.player.r*3));}}
    packet(owner,b,m,gas=false){if(!(m>0))return false;
      // Coarse gas cells combine only with nearby like-material parcels, conserving mass and momentum.
      let merge=gas?this.packets.find(q=>q.gas&&q.owner===owner.id&&q.material===b.material&&Math.hypot(q.x-b.x,q.y-b.y)<owner.r*.8):null;
      if(merge){const q=merge,t=q.m+m;for(const k of ['x','y','vx','vy'])q[k]=(q[k]*q.m+b[k]*m)/t;q.z=(q.z*q.m+(b.z||0)*m)/t;q.vz=(q.vz*q.m+(b.vz||0)*m)/t;q.m=t;q.initial+=m;return true;}
      // Leave room for coherent bodies when a dense cloud fills the coarse gas budget.
      if(this.packets.length>=(gas?148:160)||owner!==this.g.player&&this.packets.filter(q=>q.owner!==this.g.player.id).length>=64)return false;
      const q=this.packetPool.pop()||{};Object.assign(q,{flow:null,donor:0,owner:owner.id,x:b.x,y:b.y,z:b.z||0,vx:b.vx,vy:b.vy,vz:b.vz||0,m,initial:m,seed:b.seed||1,material:b.material||'rock',r:b.r||A.radius(m),age:0,gas,kind:b.kind||'gas',name:b.name||'',composition:A.Composition.ensure(b),trail:q.trail||[],counted:false,form:gas?'gas':A.appearance(b).type,playerAccreted:0,inDisk:false,diskEntered:false,stripTime:0,stripTo:null,alive:true,water:gas||b.lifeClaimed?0:b.water||0,dna:gas||b.lifeClaimed?0:b.dna||0,rawPayload:gas||b.lifeClaimed?0:b.rawPayload||0,hardcoreCache:!!b.hardcoreCache,lifeClaimed:false,feeding:false,carrierVx:0,carrierVy:0,carrierVz:0});this.packets.push(q);return true;
    }
    capture(owner,b){if(!owner.alive||!b.alive||b.boss||owner.boss)return false;const g=this.g,fast=Math.hypot(owner.vx-b.vx,owner.vy-b.vy)>72*A.unit(g.player.m);let eff=A.clamp(.86+(owner===g.player?.04*g.upgrades.get('yield')+(g.life?.buffs().yield||0):0)-(fast?.12:0),.55,1);if(g.world.bodies.length>=g.world.budget()&&!g.world.bodies.some(q=>q.alive&&q.kind==='debris'))eff=1;if(!this.packet(owner,b,b.m*eff))return false;g.world.fragments(b,b.m*(1-eff),fast?5:2,12*A.unit(g.player.m));g.expedition?.atlas.extract(b,b.m);g.expedition?.replay.event("Gravitational capture",b);b.alive=false;if(owner===g.player){if(b.parentId)this.transition(b,'ACCRETION',owner,b.systemOwner);g.stats.largestCollision=Math.max(g.stats.largestCollision,b.m);g.audio.play('absorb',.08);}return true;}
    disturbParcel(q,owner,dt) {
      const ownerMu=this.parcelIndex?.get(owner.id)?.mu||A.Physics.mu(this.g,owner),ox=q.x-owner.x,oy=q.y-owner.y,oz=q.z-(owner.z||0);
      let rival=null,strongest=ownerMu/Math.max(owner.r*owner.r,ox*ox+oy*oy+oz*oz)*1.35;
      for(const source of this.parcelSources){
        const b=source.b;if(b===owner)continue;
        const dx=b.x-q.x,dy=b.y-q.y,dz=(b.z||0)-q.z,d2=dx*dx+dy*dy+dz*dz;if(d2>source.range*source.range||d2<1)continue;
        const soft=d2+b.r*b.r*.15,force=source.mu/(soft*Math.sqrt(soft));
        q.vx+=dx*force*dt;q.vy+=dy*force*dt;q.vz+=dz*force*dt;
        const e=((q.vx-b.vx)**2+(q.vy-b.vy)**2+(q.vz-(b.vz||0))**2)*.5-source.mu/Math.sqrt(d2),strength=source.mu/d2;
        if(e<0&&strength>strongest&&d2<source.range*source.range*.64){rival=b;strongest=strength;}
      }
      if(!rival){q.stripTime=0;q.stripTo=null;return owner;}
      q.stripTime=q.stripTo===rival.id?(q.stripTime||0)+dt:dt;q.stripTo=rival.id;
      if(q.stripTime<.9)return owner;
      q.owner=rival.id;q.stripTime=0;q.age=0;q.diskEntered=false;q.feeding=false;
      if(owner===this.g.player){this.disturbance={until:this.g.time+18,hadSystem:true};if(this.g.time-(this.lastStrip??-100)>6){this.lastStrip=this.g.time;this.g.ui.toast('DISK STRIPPING',rival.name+' is taking exposed matter. Accelerate away.','danger');this.g.audio.play('ejection',.5);}}
      this.g.effects.label(q.x,q.y,'MATTER TRANSFER','#dfa290');return rival;
    }
    enterInnerFlow(q,owner,mu) {
      // A tidal stream can fly past. Once it reaches the inner compact flow, shocks
      // dissipate its relative impact speed; propulsion cannot leave that material behind.
      const dx=q.x-owner.x,dy=q.y-owner.y,dz=q.z-(owner.z||0),d=Math.hypot(dx,dy,dz);
      if(d>=owner.r*1.08)return false;
      q.feeding=true;q.carrierVx=owner.vx;q.carrierVy=owner.vy;q.carrierVz=owner.vz||0;
      const vx=q.vx-owner.vx,vy=q.vy-owner.vy,vz=q.vz-(owner.vz||0),speed=Math.hypot(vx,vy,vz),limit=Math.sqrt(mu/Math.max(d,owner.r*.3))*.8,f=speed>limit?limit/speed:1;
      q.vx=owner.vx+vx*f;q.vy=owner.vy+vy*f;q.vz=(owner.vz||0)+vz*f;
      if(owner===this.g.player)this.g.life?.collect(q);
      return true;
    }
    accrete(dt) {
      const g=this.g,p=g.player;let gained=0;
      this.parcelSources=g.world.sources.filter(b=>b.alive&&A.scaleStage(b)>=9).map(b=>({b,mu:A.Physics.mu(g,b),range:A.Physics.influence(g,b)}));
      this.parcelIndex||=new Map();this.parcelIndex.clear();for(const source of this.parcelSources)this.parcelIndex.set(source.b.id,source);
      if(g.tick%12===0)for(const source of this.parcelSources.filter(s=>['blackhole','singularity','neutron','magnetar','gravastar'].includes(A.appearance(s.b).type)).slice(0,6).map(s=>s.b))g.world.hash.query(source.x,source.y,source.r*9,b=>{
        if(!b.alive||b===p||b===source||b.grace>0||source.m<b.m*1.58)return;
        const roche=Math.min(source.r*9,Math.max(source.r*2,b.r*Math.cbrt(2*source.m/b.m)*(b.material==='ice'?1.4:1)));
        if(Math.hypot(b.x-source.x,b.y-source.y,(b.z||0)-(source.z||0))<roche)this.capture(source,b);
      });
      for(const q of this.packets){
        let owner=this.byId.get(q.owner);if(!owner){this.release(q);continue;}
        owner=this.disturbParcel(q,owner,dt);q.age+=dt;
        const reaction=A.Supernova?.parcel(this,q,owner,dt);if(reaction!==null&&reaction!==undefined){gained+=reaction;continue;}
        const stellar=A.scaleStage(owner)>=9,bh=['blackhole','singularity'].includes(A.appearance(owner).type),mu=A.Physics.mu(g,owner),distance=Math.hypot(q.x-owner.x,q.y-owner.y,q.z-(owner.z||0));
        q.alive=true;
        if(bh&&q.feeding){
          // Advect accepted inner flow with the source's changing velocity, retaining
          // relative orbital motion. Outer disk parcels still escape or can be stripped.
          q.vx+=owner.vx-q.carrierVx;q.vy+=owner.vy-q.carrierVy;q.vz+=(owner.vz||0)-q.carrierVz;
          q.carrierVx=owner.vx;q.carrierVy=owner.vy;q.carrierVz=owner.vz||0;
        }
        const steps=Math.min(6,Math.max(1,Math.ceil(dt/Math.max(.003,Math.sqrt(Math.pow(Math.max(distance,owner.r),3)/mu)*.04)))),h=dt/steps;
        // Stellar disks need viscous inflow: at the old gas drag a parcel orbited for minutes
        // without ever crossing the inner boundary, which stalled every star-class evolution.
        const drag=(bh?(q.feeding?.45:.030):stellar&&q.gas?.032:stellar?.22:.7)*(1+this.rank(owner,'flow')*.25);
        for(let i=0;i<steps;i++){
          if(bh&&!q.feeding)this.enterInnerFlow(q,owner,mu);
          const dx=q.x-owner.x,dy=q.y-owner.y,dz=q.z-(owner.z||0),d=Math.max(owner.r*.3,Math.hypot(dx,dy,dz)),k=mu/Math.pow(d*d+owner.r*owner.r*.09,1.5),f=Math.exp(-drag*h);
          q.vx=owner.vx+(q.vx-owner.vx)*f-dx*k*h;q.vy=owner.vy+(q.vy-owner.vy)*f-dy*k*h;q.vz=(owner.vz||0)+(q.vz-(owner.vz||0))*Math.exp(-h*(drag+(q.gas?.12:0)))-dz*k*h;
          if(d<owner.r*1.02&&!q.feeding){const vr=((q.vx-owner.vx)*dx+(q.vy-owner.vy)*dy+(q.vz-(owner.vz||0))*dz)/d;if(vr<0){q.vx-=dx/d*vr;q.vy-=dy/d*vr;q.vz-=dz/d*vr;}}
          q.x+=q.vx*h;q.y+=q.vy*h;q.z+=q.vz*h;
        }
        const dx=q.x-owner.x,dy=q.y-owner.y,d=Math.hypot(dx,dy,q.z-(owner.z||0)),rvx=q.vx-owner.vx,rvy=q.vy-owner.vy,energy=(rvx*rvx+rvy*rvy+(q.vz-(owner.vz||0))**2)*.5-mu/Math.max(d,1),angular=Math.abs(dx*rvy-dy*rvx);
        if(bh&&!q.feeding)this.enterInnerFlow(q,owner,mu);
        if(owner===p&&d<owner.r*1.08)g.life?.collect(q);
        q.inDisk=stellar&&energy<0&&d>owner.r*1.04&&d<owner.r*12&&angular>.15*Math.sqrt(mu*d);
        if(q.inDisk&&!q.diskEntered){q.diskEntered=true;if(owner===p){g.audio.play('diskEntry',A.clamp(q.initial/p.m*20,.01,1));g.ui.teach?.('disk');}}
        if((q.feeding||d<owner.r*1.08)&&q.age>(bh?6:stellar?1.8:.3)){
          const dm=Math.min(q.m,q.initial*dt*(bh?.035:stellar?.52:1.6)*(1+this.rank(owner,'flow')*.2)),old=owner.m;
          owner.vx=(owner.vx*old+q.vx*dm)/(old+dm);owner.vy=(owner.vy*old+q.vy*dm)/(old+dm);owner.vz=((owner.vz||0)*old+q.vz*dm)/(old+dm);A.Composition.mix(owner,q.composition,dm);owner.setMass(old+dm);q.m-=dm;
          if(owner===p){
            gained+=dm;g.stats.totalGained+=dm;this.totalAccreted+=dm;g.stats.totalMatterAccreted=(g.stats.totalMatterAccreted||0)+dm;q.playerAccreted=(q.playerAccreted||0)+dm;
            if(!q.gas&&q.form==='blackhole'&&q.playerAccreted>=q.initial*.5)this.mark('merger',p);
            if(!q.counted&&!q.gas){q.counted=true;g.stats.captures++;A.Save.achievement('first',g);if(q.kind==='ai'){g.stats.defeats++;if(q.initial>old*.35)A.Save.achievement('predator',g);g.ui.toast('RIVAL ACCRETED',q.name,'gold');}g.audio.play(stellar?'infall':'absorb',A.clamp(q.initial/old*10,.02,1));}
          }
        }
        if(g.tick%5===0){const t=q.trail.length>=24?q.trail.shift():{};t.x=q.x;t.y=q.y;t.z=q.z;q.trail.push(t);}
        if(!q.feeding&&d>A.Physics.influence(g,owner)*1.4&&energy>0)this.release(q);
      }
      let n=0;for(const q of this.packets){if(q.m>q.initial*1e-10)this.packets[n++]=q;else{q.trail.length=0;this.packetPool.push(q);}}this.packets.length=n;
      this.rate=A.lerp(this.rate,gained/dt,A.ease(2,dt));
      this.feedbackMass=(this.feedbackMass||0)+gained;this.feedbackIn=(this.feedbackIn||0)-dt;
      if(this.feedbackIn<=0&&this.feedbackMass>p.m*(A.scaleStage(p)>=9?.014:.007)){g.effects.label(p.x,p.y,'+'+(this.feedbackMass/p.m*100).toFixed(1)+'% MASS','#b9ddc4',p.id,p.z);this.feedbackMass=0;this.feedbackIn=1.6;}
      this.capturedMass=0;this.diskMass=0;this.feedingMass=0;this.incomingMass=0;this.ownerMass.clear();this.ownerDisk.clear();
      for(const q of this.packets){this.ownerMass.set(q.owner,(this.ownerMass.get(q.owner)||0)+q.m);if(q.inDisk)this.ownerDisk.set(q.owner,(this.ownerDisk.get(q.owner)||0)+q.m);if(q.owner===p.id){this.capturedMass+=q.m;if(q.feeding||Math.hypot(q.x-p.x,q.y-p.y,q.z-(p.z||0))<p.r*1.08)this.feedingMass+=q.m;else if(q.inDisk)this.diskMass+=q.m;else this.incomingMass+=q.m;}}
      this.diskObserve=this.diskMass>p.m*.0001?this.diskObserve+dt:0;
      if(this.diskObserve>=3)this.mark('disk',p);
    }
    release(q){const w=this.g.world;if(!(q.m>0))return;
      if(w.bodies.length>=w.budget()){
        // Reclaim inactive slots before allowing escaped matter to clog the parcel pool.
        const dead=w.bodies.findIndex(b=>!b.alive&&b!==this.g.player);
        if(dead>=0)w.pool.push(w.bodies.splice(dead,1)[0]);
        else return;
      }
      const b=w.make(q.x,q.y,q.m,'debris');Object.assign(b,{vx:q.vx,vy:q.vy,z:q.z,vz:q.vz,material:q.material,composition:{...q.composition},water:q.lifeClaimed?0:q.water||0,dna:q.lifeClaimed?0:q.dna||0,rawPayload:q.lifeClaimed?0:q.rawPayload||0,hardcoreCache:!!q.hardcoreCache,lifeClaimed:false,grace:2});b.setMass(b.m);q.m=0;q.alive=false;
    }
    clumpGroups(owner=this.g.player,young=false){const bins=new Map(),scratch={};for(const q of this.packets){if(q.owner!==owner.id||!q.gas||q.age<(young?6:22))continue;const o=A.orbitElements(this.g,q,owner,scratch);if(o.energy>=0||o.peri<owner.r*2||o.e>.6)continue;const k=Math.floor(Math.log(o.a/owner.r)*4)+':'+Math.floor((Math.atan2(q.y-owner.y,q.x-owner.x)+Math.PI)*3);if(!bins.has(k))bins.set(k,[]);bins.get(k).push(q);}return [...bins.values()];}
    previewClumps(){const p=this.g.player;if(A.Physics.mu(this.g,p)<=0||A.scaleStage(p)<9||A.scaleStage(p)>=15){this.clumps=[];return;}
      this.clumps=this.clumpGroups(p,true).map(group=>{const m=group.reduce((s,q)=>s+q.m,0),q={x:0,y:0,z:0,m,ready:0};for(const b of group){q.x+=b.x*b.m/m;q.y+=b.y*b.m/m;q.z+=b.z*b.m/m;q.ready+=A.clamp(b.age/22,0,1)*b.m/m;}return q;}).filter(q=>q.m*.45>=p.m*.000008).sort((a,b)=>b.m-a.m).slice(0,8);
    }
    condense(owner=this.g.player){const g=this.g,p=owner;if(A.Physics.mu(g,p)<=0||A.scaleStage(p)<9||A.scaleStage(p)>=15||g.world.bodies.length>=g.world.budget())return;
      const group=this.clumpGroups(p).sort((a,b)=>b.reduce((s,q)=>s+q.m,0)-a.reduce((s,q)=>s+q.m,0))[0];if(!group)return;const m=group.reduce((s,q)=>s+q.m*.45,0);if(m<p.m*.000008)return;const state={x:0,y:0,z:0,vx:0,vy:0,vz:0};for(const q of group){const take=q.m*.45;for(const k in state)state[k]+=q[k]*take/m;q.m-=take;}const mixture={iron:0,rock:0,ice:0,gas:0};for(const q of group){const comp=A.Composition.ensure(q),weight=(q.m/.55)*.45/m;for(const k in mixture)mixture[k]+=comp[k]*weight;}const b=g.world.make(state.x,state.y,m);b.composition=A.Composition.clean(mixture);b.setMass(m);Object.assign(b,state,{px:state.x,py:state.y,pz:state.z,grace:2,name:'Condensate '+(++this.formed),birthAt:g.time});
      if(p===g.player){g.stats.condensatesBorn=(g.stats.condensatesBorn||0)+1;A.Save.achievement('coalescence',g);g.expedition?.record('A world condensed',A.massText(m)+' · finite disk matter became a coherent body');g.ui.toast('PLANETESIMAL FORMED','A dense region of the disk condensed into a coherent body.','aqua');g.audio.play('condensate',A.clamp(m/p.m*40,.03,1));}g.effects.ring(b.x,b.y,b.r*2,'#c8d6a8',false,b.z);this.previewClumps();}
    galactic(x,y){if(this.g.expedition)return this.g.expedition.atlas.densityAt(x,y);const s=this.anchor.scale*1400,dx=(x-this.anchor.x)/s,dy=(y-this.anchor.y)/s,r=Math.hypot(dx,dy)+.2,arm=Math.cos(2*Math.atan2(dy,dx)-Math.log(r)*3.4);return A.clamp(.13+.72*((arm+1)/2)**4+.22*Math.exp(-r*.5),.08,1);}
    spawn(near=false){const g=this.g,p=g.player,w=g.world,R=w.random,s=A.unit(p.m),stage=A.scaleStage(p),stellar=stage>=9&&stage<15,angle=R()*A.TAU,
      // Stellar nebulae must form inside the star's own influence radius, or their gas drifts
      // past unbound and is culled before any of it can be drawn into the disk.
      d=(near?240:stellar?300+R()*430:500+R()*1500)*s,x=p.x+Math.cos(angle)*d,y=p.y+Math.sin(angle)*d,type=TYPES[this.serial++%5],radius=(near?220:stellar?200+R()*170:180+R()*200)*s,density=stage>=15?this.galactic(x,y):.65,region={x,y,r:radius,name:type[0],color:type[1],material:type[2],cells:[]},total=p.m*(stage>=15?.08+density*.34:stage>=9?.17:.01);
      for(let i=0;i<28;i++){const a=R()*A.TAU,rd=Math.sqrt(R())*radius,cx=x+Math.cos(a)*rd,cy=y+Math.sin(a)*rd*.65,pr=Math.hypot(cx-p.x,cy-p.y),pa=Math.atan2(cy-p.y,cx-p.x),v=stage>=9?Math.sqrt(A.Physics.mu(g,p)/Math.max(pr,p.r*3))*(near?.8:.3):4*s;region.cells.push({x:cx,y:cy,z:(p.z||0)+(R()-.5)*radius*.22,vx:p.vx-Math.sin(pa)*v+(R()-.5)*s*3,vy:p.vy+Math.cos(pa)*v+(R()-.5)*s*3,vz:0,m:total/28,initial:total/28,r:radius*(.17+R()*.12),seed:Math.floor(R()*1e8),material:type[2],trail:[]});}if(g.expedition){const remaining=g.expedition.atlas.remaining(x,y);for(const c of region.cells){c.m*=remaining;c.initial*=remaining;}}this.regions.push(region);
      // Dense nebula cells are the resource. Additional stars belong to structured fields.
    }
    flow(h){const g=this.g,p=g.player,sources=g.world.sources.filter(b=>(b===p||A.scaleStage(b)>=9)&&A.Physics.mu(g,b)>0).sort((a,b)=>(a.x-p.x)**2+(a.y-p.y)**2-(b.x-p.x)**2-(b.y-p.y)**2).slice(0,4).map(b=>({b,mu:A.Physics.mu(g,b),range:A.Physics.influence(g,b)}));let local=0;
      for(const r of this.regions)for(const c of r.cells){if(c.m<c.initial*1e-8)continue;let owner=null,energy=0;for(const {b,mu,range} of sources){const dx=b.x-c.x,dy=b.y-c.y,dz=(b.z||0)-c.z,d2=dx*dx+dy*dy+dz*dz;if(d2>range*range*1.69)continue;const d=Math.sqrt(d2),force=mu/Math.pow(d2+b.r*b.r*.4,1.5);c.vx+=dx*force*h;c.vy+=dy*force*h;c.vz+=dz*force*h;const e=.5*((c.vx-b.vx)**2+(c.vy-b.vy)**2+(c.vz-(b.vz||0))**2)-mu/Math.max(d,b.r);if(e<energy&&d<range*.78){owner=b;energy=e;}}
        c.vx+=Math.sin(c.y/r.r+g.time*.02)*A.unit(p.m)*h*.08;c.vy+=Math.cos(c.x/r.r-g.time*.015)*A.unit(p.m)*h*.08;c.x+=c.vx*h;c.y+=c.vy*h;c.z+=c.vz*h;
        if(owner){const d=Math.hypot(c.x-owner.x,c.y-owner.y),f=Math.exp(-h*.025);c.vx=owner.vx+(c.vx-owner.vx)*f;c.vy=owner.vy+(c.vy-owner.vy)*f;c.vz*=Math.exp(-h*.15);if(d<Math.max(owner.r*8,A.Physics.influence(g,owner)*(A.scaleStage(owner)>=9&&A.scaleStage(owner)<15?.85:.65))&&((this.ownerMass.get(owner.id)||0)<owner.m*(.45+.2*this.rank(owner,'disk')))){const dm=Math.min(c.m,c.initial*h*(A.scaleStage(owner)>=15?.045:A.scaleStage(owner)>=9?.055:.025)*(1+.25*this.rank(owner,'intake'))*(1+this.profile(owner).intake));if(this.packet(owner,c,dm,true)){c.m-=dm;g.expedition?.atlas.extract(c,dm);}}}
        if(Math.hypot(c.x-p.x,c.y-p.y)<500*A.unit(p.m))local+=c.m;c.trail.push({x:c.x,y:c.y,z:c.z});if(c.trail.length>10)c.trail.shift();}
      this.density=local/p.m;const d=this.galactic(p.x,p.y);this.regionName=A.scaleStage(p)>=15?(d>.7?'Dense galactic arm':d>.4?'Star-forming region':'Sparse outer region'):'Circumstellar medium';
    }
    update(dt){const g=this.g,p=g.player,stage=A.scaleStage(p);this.byId.clear();for(const b of g.world.bodies)if(b.alive)this.byId.set(b.id,b);this.orbitIn+=dt;if(this.orbitIn>=.3){this.detect(this.orbitIn);this.orbitIn=0;}this.accrete(dt);this.previewIn=(this.previewIn||0)-dt;if(this.previewIn<=0){this.previewIn=1.5;this.previewClumps();}
      if(stage>=5){if(stage!==this.stage){if(stage>=15&&this.stage<15)this.anchor={x:p.x,y:p.y,scale:A.unit(p.m)};this.stage=stage;if(this.regions.length<Math.max(3,Math.round(8*A.cpuScale()))&&g.command?.options.spawning!==false)this.spawn(true);}this.spawnIn-=dt;if(this.spawnIn<=0){this.spawnIn=stage>=9&&stage<15?9:18;this.regions=this.regions.filter(r=>Math.hypot(r.x-p.x,r.y-p.y)<3200*A.unit(p.m)||r.cells.some(c=>Math.hypot(c.x-p.x,c.y-p.y)<900*A.unit(p.m)));if(this.regions.length<Math.max(3,Math.round(8*A.cpuScale()))&&g.command?.options.spawning!==false)this.spawn();}this.flowIn+=dt;if(this.flowIn>=.12){this.flow(this.flowIn);this.flowIn=0;}}
      this.condenseIn-=dt;if(this.condenseIn<=0){this.condenseIn=9;this.condense();const rivals=[...this.systems.keys()].filter(id=>id!==p.id);if(rivals.length){const owner=this.byId.get(rivals[(this.formed+g.tick)%rivals.length]);if(owner)this.condense(owner);}}}
    serialize(){return{packets:this.packets.map(({trail,...q})=>q),regions:this.regions.map(r=>({...r,cells:r.cells.map(({trail,...c})=>c)})),formed:this.formed,stage:this.stage,spawnIn:this.spawnIn,serial:this.serial,anchor:this.anchor,condenseIn:this.condenseIn,totalAccreted:this.totalAccreted,milestones:{...this.milestones},disturbance:this.disturbance,diskObserve:this.diskObserve,thefts:[...this.thefts].slice(-16).map(([owner,q])=>({owner,...q}))};}
    rebase(x,y){this.anchor.x-=x;this.anchor.y-=y;for(const q of this.packets){q.x-=x;q.y-=y;for(const t of q.trail){t.x-=x;t.y-=y;}}for(const r of this.regions){r.x-=x;r.y-=y;for(const q of r.cells){q.x-=x;q.y-=y;for(const t of q.trail){t.x-=x;t.y-=y;}}}}
  };
})(window.AC);
