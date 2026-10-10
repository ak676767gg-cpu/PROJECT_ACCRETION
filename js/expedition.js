/* Expedition systems use the existing fixed step, save vault and procedural renderer. */
'use strict';
(function(A){
  const finite=(n,f=0)=>Number.isFinite(n)?n:f,clone=q=>JSON.parse(JSON.stringify(q));
  A.Atlas=class{
    constructor(g,s){this.g=g;this.seed=finite(s?.seed,g.world.seed);this.x=finite(s?.x);this.y=finite(s?.y);this.lastX=g.player.x;this.lastY=g.player.y;this.cells=new Map((Array.isArray(s?.cells)?s.cells:[]).slice(-256).filter(q=>q&&Number.isFinite(q.x)&&Number.isFinite(q.y)).map(q=>[q.x+','+q.y,{x:Math.floor(q.x),y:Math.floor(q.y),visits:Math.max(0,finite(q.visits)),depletion:A.clamp(finite(q.depletion),0,.85)}]));this.rivals=(s?.rivals||[]).slice(0,12).filter(q=>Number.isFinite(q.x)&&Number.isFinite(q.y));this.target=s?.target&&Number.isFinite(s.target.x)&&Number.isFinite(s.target.y)?s.target:null;this.scan=0;}
    project(x,y){const s=1000*A.unit(this.g.player.m);return{x:this.x+(x-this.g.player.x)/s,y:this.y+(y-this.g.player.y)/s};}
    density(x,y){const r=Math.hypot(x+3,y-2)+.2,a=Math.cos(2*Math.atan2(y-2,x+3)-Math.log(r)*3.4+this.seed%100/30);return A.clamp((this.g.expedition?.collision?.density(x,y)||0)*.5+.12+.7*((a+1)/2)**4+.2*Math.exp(-r*.15),.08,1);}
    densityAt(x,y){const q=this.project(x,y);return this.density(q.x,q.y)*this.remaining(x,y);}
    key(x,y){return Math.floor(x)+','+Math.floor(y);}
    remaining(x,y){const q=this.project(x,y);return 1-(this.cells.get(this.key(q.x,q.y))?.depletion||0);}
    cell(x,y){const k=this.key(x,y);if(!this.cells.has(k)){if(this.cells.size>=256)this.cells.delete(this.cells.keys().next().value);this.cells.set(k,{x:Math.floor(x),y:Math.floor(y),visits:0,depletion:0});}return this.cells.get(k);}
    extract(b,m){if(!b||b.atlasClaimed)return;const p=this.project(b.x,b.y),k=b.atlasKey||this.key(p.x,p.y),[x,y]=k.split(',').map(Number);b.atlasKey=k;const c=this.cell(x,y);c.depletion=Math.min(.85,c.depletion+m/this.g.player.m*.12);if(!b.initial)b.atlasClaimed=true;}
    update(dt){const p=this.g.player,u=1000*A.unit(p.m);this.x+=(p.x-this.lastX)/u;this.y+=(p.y-this.lastY)/u;this.lastX=p.x;this.lastY=p.y;this.scan-=dt;if(this.scan>0)return;this.scan=2;this.cell(this.x,this.y).visits++;
      for(const b of this.g.world.bodies){if(!b.alive||b.kind!=='ai'||Math.hypot(b.x-p.x,b.y-p.y)>1300*A.unit(p.m))continue;const q=this.project(b.x,b.y),old=this.rivals.find(r=>r.name===b.name),r={name:b.name,x:q.x,y:q.y,m:b.m,seen:this.g.time};if(old)Object.assign(old,r);else{if(this.rivals.length>=12)this.rivals.shift();this.rivals.push(r);}}
    }
    serialize(){return{seed:this.seed,x:this.x,y:this.y,cells:[...this.cells.values()],rivals:this.rivals,target:this.target};}
    draw(canvas,center={x:this.x,y:this.y},zoom=52){const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;c.fillStyle=A.themePalette().bg;c.fillRect(0,0,w,h);const scale=zoom,screen=(x,y)=>[w/2+(x-center.x)*scale,h/2+(y-center.y)*scale];
      for(let y=Math.floor(center.y-h/scale/2);y<center.y+h/scale/2;y++)for(let x=Math.floor(center.x-w/scale/2);x<center.x+w/scale/2;x++){const d=this.density(x+.5,y+.5),known=this.cells.get(x+','+y),q=screen(x,y);c.fillStyle=known?'rgba(95,151,143,'+(.12+d*.38)*(1-known.depletion)+')':'rgba(152,131,98,'+(.04+d*.13)+')';c.fillRect(q[0],q[1],scale-1,scale-1);if(known){c.fillStyle='#89aaa4';c.font='9px monospace';c.fillText(Math.round((1-known.depletion)*100)+'%',q[0]+4,q[1]+14);}}
      c.strokeStyle='#40615d';c.lineWidth=1;const p=screen(this.x,this.y);c.beginPath();c.arc(...p,5,0,A.TAU);c.stroke();c.fillStyle='#ddf1e4';c.fillRect(p[0]-2,p[1]-2,4,4);
      for(const r of this.rivals){const q=screen(r.x,r.y);c.globalAlpha=this.g.time-r.seen>60?.35:.85;c.fillStyle='#dfaa88';c.fillRect(q[0]-2,q[1]-2,4,4);c.font='10px monospace';c.fillText(r.name,q[0]+7,q[1]);}c.globalAlpha=1;
      if(this.target){const q=screen(this.target.x,this.target.y);c.strokeStyle='#f0ca85';c.strokeRect(q[0]-6,q[1]-6,12,12);c.setLineDash([3,5]);c.beginPath();c.moveTo(...p);c.lineTo(...q);c.stroke();c.setLineDash([]);}
    }
  };
  A.StellarWeather=class{
    constructor(g,s){this.g=g;this.next=finite(s?.next,65);this.forecast=s?.forecast&&Number.isFinite(s.forecast.at)?s.forecast:null;this.wave=s?.wave&&Number.isFinite(s.wave.radius)?{...s.wave,hit:new Set((s.wave.hit||[]).slice(0,1800))}:null;}
    schedule(type='flare',source=this.g.player){if(A.scaleStage(source)<9&&type!=='magnetar')return false;const g=this.g;this.forecast={type,source:source.id,x:source.x,y:source.y,z:source.z||0,at:g.time+12,range:Math.min(1000*A.unit(g.player.m),540*A.unit(source.m)),severity:type==='magnetar'?1:.6};g.audio.play('forecast');g.ui.toast(type==='magnetar'?'MAGNETAR PULSE FORECAST':'SOLAR FLARE FORECAST','Twelve seconds to clear the amber hazard radius.','gold');return true;}
    update(dt){const g=this.g,p=g.player;this.next-=dt;
      if(this.next<=0&&!this.forecast&&!this.wave){this.next=75+g.world.random()*50;const stars=g.world.sources.filter(b=>A.appearance(b).type==='star'||b.form==='neutron');if(stars.length&&A.scaleStage(p)>=9){const source=stars[Math.floor(g.world.random()*stars.length)];this.schedule(source.form==='neutron'?'magnetar':'flare',source);}}
      if(this.forecast){const f=this.forecast,b=g.cosmic.byId.get(f.source);if(b){f.x=b.x;f.y=b.y;f.z=b.z||0;}if(g.time>=f.at){this.wave={...f,radius:0,hit:new Set()};this.forecast=null;g.audio.play(f.type==='magnetar'?'magnetar':'flare',f.severity);}}
      if(!this.wave)return;const w=this.wave,old=w.radius;w.radius+=dt*60*A.unit(p.m);
      for(const b of g.world.bodies){if(!b.alive||b.id===w.source||w.hit.has(b.id))continue;const dx=b.x-w.x,dy=b.y-w.y,d=Math.hypot(dx,dy);if(d-b.r>w.radius||d+b.r<old||d>w.range)continue;w.hit.add(b.id);const strength=(1-d/w.range)*w.severity,impulse=8*A.unit(p.m)*strength/Math.max(.65,Math.cbrt(b.m/p.m));b.vx+=dx/Math.max(1,d)*impulse;b.vy+=dy/Math.max(1,d)*impulse;b.flareHeat=(b.flareHeat||0)+130*strength;if(b.atmosphere>0)b.atmosphere=Math.max(0,b.atmosphere-.12*strength);if(b===p&&b.grace<=0){p.hp=Math.max(1,p.hp-10*strength*(1-(g.life?.buffs().defense||0)));g.expedition.replay.event(w.type==='magnetar'?'Magnetar pulse':'Flare passage',b);} }
      for(const q of g.cosmic.packets){if(q.weatherAt===w.at)continue;const dx=q.x-w.x,dy=q.y-w.y,d=Math.hypot(dx,dy);if(d<old||d>w.radius||d>w.range)continue;q.weatherAt=w.at;q.vx+=dx/Math.max(1,d)*6*A.unit(p.m)*w.severity;q.vy+=dy/Math.max(1,d)*6*A.unit(p.m)*w.severity;}
      if(w.radius>w.range){this.wave=null;}
    }
    draw(r){const w=this.forecast||this.wave;if(!w)return;const c=r.ctx,q=r.screen(w.x,w.y,w.z||0),radius=(this.wave?this.wave.radius:w.range)*r.camera.zoom;if(radius>r.w*4)return;c.save();c.strokeStyle=w.type==='magnetar'?'#aacbdb':'#e6b87a';c.globalAlpha=this.wave?.5:.18;c.lineWidth=this.wave?3:1;c.setLineDash(this.wave?[]:[5,10]);c.beginPath();c.ellipse(q.x,q.y,radius,radius*r.tilt,0,0,A.TAU);c.stroke();c.restore();}
    serialize(){return {next:this.next,forecast:this.forecast,wave:this.wave?{...this.wave,hit:[...this.wave.hit]}:null};}
    rebase(x,y){for(const q of [this.wave,this.forecast])if(q){q.x-=x;q.y-=y;}}
  };
  A.EncounterReplay=class{
    constructor(g){this.g=g;this.frames=[];this.in=0;this.pending=null;this.latest=A.EncounterReplay.clean(A.Save.data.replay);}
    static clean(q){if(!q||typeof q.title!=='string'||!Array.isArray(q.frames)||q.frames.length<2||q.frames.length>84)return null;const frames=q.frames.filter(f=>Number.isFinite(f.t)&&Array.isArray(f.bodies)&&f.bodies.length<=25&&f.bodies.every(b=>['x','y','m','r'].every(k=>Number.isFinite(b[k]))&&b.m>0&&b.r>0));return frames.length===q.frames.length?{title:q.title.slice(0,80),frames:clone(frames)}:null;}
    sample(){const g=this.g,p=g.player;const near=g.world.bodies.filter(b=>b.alive&&b!==p).sort((a,b)=>(a.x-p.x)**2+(a.y-p.y)**2-(b.x-p.x)**2-(b.y-p.y)**2).slice(0,A.Save.data.settings.quality==='low'?12:24);return{t:g.time,hp:p.hp,bodies:[p,...near].map(b=>({id:b.id,x:b.x,y:b.y,m:b.m,r:b.r,kind:b.kind,form:b.form,name:b.name,color:A.appearance(b).color}))};}
    event(title,b){if(this.pending||this.g.time<2||b!==this.g.player&&b.m<this.g.player.m*.08)return;this.pending={title,until:this.g.time+4,frames:clone(this.frames.slice(-36))};}
    update(dt){this.in+=dt;if(this.in<(A.Save.data.settings.quality==='low'?1/4:1/6))return;this.in=0;const f=this.sample();if(this.frames.length>=60)this.frames.shift();this.frames.push(f);if(this.pending){if(this.pending.frames.length<84)this.pending.frames.push(clone(f));if(this.g.time>=this.pending.until)this.flush();}}
    flush(){if(!this.pending)return;this.pending.frames.push(this.sample());const clip=A.EncounterReplay.clean(this.pending);if(clip){this.latest=clip;A.Save.data.replay=clip;}this.pending=null;}
    rebase(x,y){for(const list of [this.frames,this.pending?.frames||[]])for(const f of list)for(const b of f.bodies){b.x-=x;b.y-=y;}}
    draw(canvas,t=0,clip=this.latest||A.EncounterReplay.clean(A.Save.data.replay)){const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;c.fillStyle=A.themePalette().bg;c.fillRect(0,0,w,h);if(!clip)return;const n=A.clamp(t,0,1)*(clip.frames.length-1),i=Math.floor(n),f=clip.frames[i],next=clip.frames[Math.min(i+1,clip.frames.length-1)],p=f.bodies[0],pn=next.bodies[0],cx=A.lerp(p.x,pn.x,n-i),cy=A.lerp(p.y,pn.y,n-i),u=A.unit(p.m),scale=Math.min(w,h)/(900*u);for(const b of f.bodies){if(b.kind==='player'||b.kind==='ai'){c.beginPath();c.strokeStyle=b.color||'#9eb7ac';c.globalAlpha=.22;let started=false;for(let j=Math.max(0,i-18);j<=i;j++){const past=clip.frames[j].bodies.find(q=>q.id===b.id);if(!past)continue;const px=w/2+(past.x-cx)*scale,py=h/2+(past.y-cy)*scale;if(!started){c.moveTo(px,py);started=true;}else c.lineTo(px,py);}c.stroke();c.globalAlpha=1;}const bn=next.bodies.find(q=>q.id===b.id)||b,x=A.lerp(b.x,bn.x,n-i),y=A.lerp(b.y,bn.y,n-i);c.fillStyle=b.color||'#9eb7ac';c.beginPath();c.arc(w/2+(x-cx)*scale,h/2+(y-cy)*scale,Math.max(1,b.r*scale),0,A.TAU);c.fill();if(b.name){c.font='10px monospace';c.fillText(b.name,w/2+(x-cx)*scale+8,h/2+(y-cy)*scale);}}c.fillStyle='#b9ceca';c.font='12px monospace';c.fillText(A.timeText(f.t)+' · '+A.massText(p.m)+' · integrity '+Math.round(f.hp)+'%',16,h-18);}
  };
  A.Photo=class{
    constructor(g){this.g=g;this.active=false;this.paths=false;this.labels=false;this.exposure=0;}
    enter(){const g=this.g;if(!g.player||['menu','over'].includes(g.state)||this.active)return false;this.previous={state:g.state,camera:{...g.renderer.camera},zoom:g.renderer.manualZoom,view:g.systemView,hud:g.hudHidden};this.active=true;g.previousFlightStamp=undefined;g.state='paused';g.input.clear();g.audio.setActive(false);g.renderer.shake=0;document.body.classList.toggle('photo-active',true);return true;}
    exit(){if(!this.active)return;const g=this.g,q=this.previous;this.active=false;g.renderer.camera={...q.camera};g.renderer.manualZoom=q.zoom;g.systemView=q.view;g.hudHidden=q.hud;g.state=q.state;g.previousFlightStamp=undefined;g.accumulator=0;document.body.classList.toggle('photo-active',false);g.audio.setActive(g.state==='playing');}
    move(dx,dy){const r=this.g.renderer;r.camera.x+=dx*90/r.camera.zoom;r.camera.y+=dy*90/r.camera.zoom;}
    image(){const src=this.g.renderer.canvas,c=document.createElement('canvas'),factor=Math.min(1,1920/src.width);c.width=Math.round(src.width*factor);c.height=Math.round(src.height*factor);const ctx=c.getContext('2d');ctx.drawImage(src,0,0,c.width,c.height);if(this.exposure){ctx.fillStyle=this.exposure>0?'rgba(255,255,255,'+this.exposure*.2+')':'rgba(0,0,0,'+-this.exposure*.35+')';ctx.fillRect(0,0,c.width,c.height);}return c;}
    export(){const a=document.createElement('a');a.download='accretion-'+Math.floor(this.g.time)+'.png';a.href=this.image().toDataURL('image/png');document.body.appendChild(a);a.click();a.remove();}
  };
  A.Sandbox={
    setClass(g,stage,save=true){if(A.Save.mode!=='sandbox'||!Number.isInteger(stage)||stage<0||stage>=A.STAGES.length)return false;const p=g.player,old=p.m,m=5**stage,f=m/old,scale=A.unit(m)/A.unit(old);
      for(const b of g.world.bodies){b.x=p.x+(b.x-p.x)*scale;b.y=p.y+(b.y-p.y)*scale;b.px=b.x;b.py=b.y;b.z*=scale;b.pz=b.z;b.vx*=scale;b.vy*=scale;b.vz*=scale;b.setMass(b.m*f);b.pr=b.r;b.pa=b.angle;b.parentId=null;b.orbitStable=false;b.orbit=null;b.stableTime=0;b.trail.length=0;b.resonanceTime=0;}
      g.industry?.scale(scale);p.setMass(m);p.evolution=stage;p.hp=A.cohesionLimit(g);p.grace=5;p.vx=p.vy=0;g.cosmic=new A.Cosmic(g);g.expedition=new A.Expedition(g);g.world.fields.length=0;g.world.rebuild();g.renderer.camera={x:p.x,y:p.y,zoom:.94/A.unit(m)};g.renderer.cosmic?.reset();g.evolutionTime=0;g.upgrades.points=Math.max(g.upgrades.points,12);g.audio.setStage(stage);if(save)A.Save.checkpoint(g,'manual');return true;},
    orbit(g,type='planet'){if(A.Save.mode!=='sandbox'||A.scaleStage(g.player)<9)return false;const p=g.player,u=A.unit(p.m),a=g.world.random()*A.TAU,d=(type==='resonance'?260:220+g.world.random()*270)*u;const create=(distance,angle,m)=>{const b=g.world.make(p.x+Math.cos(angle)*distance,p.y+Math.sin(angle)*distance,m,'rock');b.form='planet';b.name='Experimental world';b.grace=3;const v=Math.sqrt((A.Physics.mu(g,p)+A.Physics.mu(g,b))/distance);b.vx=p.vx-Math.sin(angle)*v;b.vy=p.vy+Math.cos(angle)*v;return b;};const b=create(d,a,p.m*.00015);
      if(type==='resonance')create(d*2**(2/3),a+2,p.m*.00015);
      if(type==='moon'){const md=12*A.unit(b.m)+b.r*3,moon=g.world.make(b.x+md,b.y,b.m*.001);moon.name='Experimental moon';moon.vx=b.vx;moon.vy=b.vy+Math.sqrt((A.Physics.mu(g,b)+A.Physics.mu(g,moon))/md);moon.grace=3;}
      g.world.rebuild();return true;},
    magnetar(g){if(A.Save.mode!=='sandbox')return false;const p=g.player,s=A.unit(p.m),b=g.world.make(p.x+600*s,p.y,p.m*.025,'wanderer');b.form='neutron';b.material='stellar';b.name='Magnetar';b.setMass(b.m);b.grace=5;g.world.rebuild();return g.expedition.weather.schedule('magnetar',b);}
  };
  // Goals inspect the real orbital hierarchy. Selecting one creates no bodies.
  A.blueprintStatus=function(g,id){
    const c=g.cosmic,p=g.player,def=A.BLUEPRINTS.find(q=>q.id===id);if(!c||!p||!def)return{ready:false,checks:[]};
    const safe=b=>b.alive&&b.orbitStable&&!b.collapse&&b.risk==='CLEAR'&&b.orbit&&Number.isFinite(b.orbit.a);
    const worlds=c.members.filter(b=>b.parentId===p.id&&c.isPlanet(b)&&safe(b)),rocky=worlds.filter(b=>(b.composition?.rock||0)+(b.composition?.iron||0)>=.5),gas=worlds.filter(b=>(b.composition?.gas||0)>=.5),withMoons=worlds.filter(b=>c.members.some(m=>m.parentId===b.id&&safe(m)));
    const check=(label,ok)=>({label,ok:!!ok}),checks=[check('Star or compact stellar primary',A.scaleStage(p)>=9)];
    if(id==='inner')checks.push(check('Three stable rocky planets ('+rocky.length+'/3)',rocky.length>=3));
    if(id==='guardian')checks.push(check('Two stable rocky planets ('+rocky.length+'/2)',rocky.length>=2),check('Stable gas world at least 1.4× farther out than both',gas.some(b=>rocky.filter(r=>b.orbit.a>=r.orbit.a*1.4).length>=2)));
    if(id==='moons')checks.push(check('Two stable planets with stable moons ('+withMoons.length+'/2)',withMoons.length>=2));
    if(id==='belt')checks.push(check('Two stable planets ('+worlds.length+'/2)',worlds.length>=2),check('Real belt of six or more stable small bodies',c.belts.some(bs=>bs.filter(safe).length>=6)));
    if(id==='resonant')checks.push(check('Three stable planets ('+worlds.length+'/3)',worlds.length>=3),check('Established planetary period relationship',worlds.some(b=>b.resonanceTime>=15&&worlds.some(m=>m.id===b.resonancePartner))));
    checks.push(check('At least 75% stable with no endangered member',c.summary.stability>=.75&&!c.summary.atRisk));return{ready:checks.every(q=>q.ok),checks,worlds:worlds.length};
  };
  A.Legacy={
    eligibility(g){const rank=A.Save.data.legacy.rank,active=!!g?.player&&g.player.alive&&['playing','paused','upgrade'].includes(g.state),saved=A.Save.data.run,attained=active?Math.max(g.stats.stage||0,g.player.evolution||0):saved?.player?.evolution||0,completed=active?g.expedition?.completed:saved?.expedition?.completed,goals=new Set((completed||[]).filter(n=>Number.isInteger(n)&&n>=0&&n<=attained)).size,stellar=attained>=9;return{ready:active&&A.Save.mode==='journey'&&stellar&&goals>=4&&rank<20,active,stellar,goals,rank};},
    begin(g,kind){const q=this.eligibility(g);if(!q.ready||!A.LEGACY_TRIALS.some(t=>t.id===kind))return false;
      if(!A.Save.checkpoint(g,'manual')){g.ui.toast('JOURNEY KEPT','Storage could not save this expedition. No prestige was applied.','gold');return false;}
      const backup=clone(A.Save.data),open=A.Save.sessionOpen,d=A.Save.data,rank=d.legacy.rank+1;
      d.legacy.rank=rank;d.legacy.trial=kind;d.legacy.history.push({rank,stage:g.stats.stage,className:g.stats.peakClass||A.appearance(g.player).name,mass:g.stats.peak,time:g.time,goals:q.goals,trial:kind});d.legacy.history=d.legacy.history.slice(-12);d.lifetime.runs++;d.lifetime.longestRun=Math.max(d.lifetime.longestRun||0,g.time);d.run=null;
      const earned=A.Save.achievement('legacy',null,false);A.Save.sessionOpen=false;
      if(!A.Save.write(true)){A.Save.data=backup;A.Save.data.settings=A.Save.vault.settings;A.Save.sessionOpen=open;g.ui.toast('JOURNEY KEPT','Storage could not record the expedition. Your old journey is intact.','gold');return false;}
      g.start(false);if(earned)g.ui.achievementNotice('legacy');g.audio.play('legacy');g.ui.toast('EXPEDITION '+String(rank).padStart(2,'0'),A.LEGACY_TRIALS.find(t=>t.id===kind).name+' · collection, records and looks preserved.','gold');return true;
    }
  };
  // Evolution is attached to each existing companion; rarity and wheel odds do not change.
  const oldBuffs=A.Life.prototype.buffs,oldLifeUpdate=A.Life.prototype.update,oldCollect=A.Life.prototype.collect;
  A.Life.prototype.evolution=function(id=A.Save.data.lifeLab.equipped){if(!id||!A.Save.data.lifeLab.owned.includes(id))return null;return A.Save.data.lifeLab.evolutions[id]||=( {bond:0,ice:0,distance:0,danger:0,branch:null,form:null});};
  A.Life.prototype.visualRecipe=function(id){const p=this.recipe(id);if(!p)return null;const e=A.Save.data.lifeLab.evolutions[id];if(!e?.branch)return p;return {...p,shape:({swift:16,survey:6,shield:19,anchor:18,harvest:1,tide:4}[e.form]??{scout:3,warden:17,forager:9}[e.branch]),evolved:e.form||e.branch,seed:p.seed+(e.form?67:31)};};
  A.Life.prototype.branch=function(choice){const e=this.evolution();if(!e)return false;const choices={scout:e.distance>=.3,warden:e.danger>=12,forager:e.ice>=4};if(!e.branch&&e.bond>=180&&(choices[choice]||e.bond>=300)&&Object.hasOwn(choices,choice)){e.branch=choice;}else if(e.branch&&!e.form&&e.bond>=600&&({scout:['swift','survey'],warden:['shield','anchor'],forager:['harvest','tide']}[e.branch].includes(choice))){e.form=choice;}else return false;A.Save.checkAdvancements(this.game);A.Save.write();this.game.audio.play('petEvolution');return true;};
  A.Life.prototype.buffs=function(){const b=oldBuffs.call(this),e=this.evolution();if(!e?.branch)return b;const key=A.Save.data.lifeLab.equipped+'-'+e.branch+'-'+e.form;if(key===this.buffKey)return this.evolvedBuffs;this.buffKey=key;const q={...b};if(e.branch==='scout')q.thrust+=.03;if(e.branch==='warden')q.defense+=.04;if(e.branch==='forager')q.gravity+=.03;if(e.form==='swift')q.thrust+=.03;if(e.form==='shield')q.defense+=.04;if(e.form==='anchor'||e.form==='tide')q.gravity+=.025;if(e.form==='harvest')q.gravity+=.015;this.evolvedBuffs=q;return q;};
  A.Life.prototype.collect=function(b){const collected=oldCollect.call(this,b);const e=this.evolution();if(collected&&e){e.ice++;if(e.form==='harvest')this.pendingWater++;}return collected;};
  A.Life.prototype.update=function(dt){oldLifeUpdate.call(this,dt);const e=this.evolution();if(!e)return;e.bond+=dt;const p=this.game.player;e.distance+=Math.hypot(p.vx,p.vy)*dt/(1000*A.unit(p.m));if(this.game.threat)e.danger+=dt;};
  // One optional encounter extends the existing atlas, finite gas cells and save snapshot.
  // Time is active render time; dynamics use the same fixed step as the rest of the universe.
  A.GALAXY_COLLISION_SECONDS=7200;
  A.GALAXY_PHASES=[
    {name:'Approach',factor:2,note:'Two stellar regions approach. Follow the charted bridge to find finite dust and gas.'},
    {name:'First passage',factor:3,note:'Tidal tails stretch the regions. Compressed gas and condensed worlds enter the bridge.'},
    {name:'Tidal return',factor:4,note:'The regions return through their tails. Outer orbits feel a mild differential tide.'},
    {name:'Core coalescence',factor:6,note:'The cores settle into a merged region. Dense clouds and young stars feed the final passage.'}
  ];
  A.GalaxyCollision=class{
    constructor(e,s){
      this.e=e;this.g=e.g;this.state=s?.state||'ready';this.elapsed=finite(s?.elapsed);this.phase=finite(s?.phase);
      this.seed=finite(s?.seed,(this.g.world.seed^914705)>>>0);this.x=finite(s?.x);this.y=finite(s?.y);
      this.budget=finite(s?.budget);this.reservoir=finite(s?.reservoir);this.released=finite(s?.released);this.emissions=finite(s?.emissions);
      this.rewarded=!!s?.rewarded;this.supplyIn=finite(s?.supplyIn,12);this.checkpointIn=finite(s?.checkpointIn,60);this.tideIn=0;
      const R=A.rng(this.seed);this.tracers=Array.from({length:960},(_,i)=>({galaxy:i%2,r:.07+R()*1.13,a:R()*A.TAU,arm:R()<.5?0:Math.PI,b:R(),size:R()>.94?2:1}));
      this.modelCache={at:-1,cores:[{x:0,y:0,turn:0},{x:0,y:0,turn:0}],bridge:0};
    }
    eligible(){return !!this.g.player&&!['menu','over'].includes(this.g.state)&&A.scaleStage(this.g.player)>=9;}
    start(){if(this.state!=='ready'||!this.eligible())return false;this.state='active';this.x=this.e.atlas.x+.16;this.y=this.e.atlas.y;this.elapsed=0;this.phase=0;this.addSupply(0);this.course();
      this.e.record('Galactic encounter','A two-hour active-flight passage has begun. Pause, menus and offline time do not advance it.');this.g.ui.toast('GALACTIC ENCOUNTER','Follow the bridge on G. Two hours of active flight, saved in this journey.','gold');this.g.audio.play('event',.35);A.Save.checkpoint(this.g,'manual');return true;}
    addSupply(phase){const m=Math.min(2e22,this.g.player.m*A.GALAXY_PHASES[phase].factor);this.budget+=m;this.reservoir+=m;}
    advance(seconds){if(this.state!=='active'||this.g.state!=='playing'||this.g.photo?.active||document.hidden||!Number.isFinite(seconds)||seconds<=0)return;
      this.elapsed=Math.min(A.GALAXY_COLLISION_SECONDS,this.elapsed+seconds);const target=Math.min(3,Math.floor(this.elapsed/1800));
      while(this.phase<target){this.phase++;this.addSupply(this.phase);const q=A.GALAXY_PHASES[this.phase];this.e.record(q.name,q.note);this.g.ui.toast('GALACTIC ENCOUNTER',q.name+' · '+q.note,'aqua');this.g.audio.play('event',.28);}
      if(this.elapsed>=A.GALAXY_COLLISION_SECONDS){this.complete();return;}
      this.checkpointIn-=seconds;if(this.checkpointIn<=0){this.checkpointIn=60;A.Save.collisionProgress(this.g);}
    }
    complete(){if(this.rewarded)return false;this.state='complete';this.elapsed=A.GALAXY_COLLISION_SECONDS;this.rewarded=true;this.g.cosmic.bonus=this.g.cosmic.profile(this.g.player).gravity;
      const old=this.g.upgrades.points;this.g.upgrades.points=Math.min(100,old+3);const awarded=this.g.upgrades.points-old;
      this.g.stats.galaxyCollisions=(this.g.stats.galaxyCollisions||0)+1;
      this.e.record('Galactic confluence','Encounter complete: gravity +10%, gas intake +20%, '+awarded+' adaptation points.');
      this.g.ui.toast('GALACTIC CONFLUENCE','+'+awarded+' adaptation points · gravity +10% · gas intake +20% for this journey.','gold');this.g.moment('GALACTIC CONFLUENCE',this.g.player);this.g.audio.play('evolution',.6);A.Save.checkpoint(this.g,'manual');return true;
    }
    distance(){return Math.hypot(this.e.atlas.x-this.x,this.e.atlas.y-this.y);}
    course(){this.e.atlas.target={x:this.x,y:this.y};return true;}
    model(){const q=this.modelCache;if(q.at===this.elapsed)return q;q.at=this.elapsed;const n=this.elapsed/1800,p=Math.min(3,Math.floor(n)),t=A.clamp(n-p,0,1),ease=t*t*(3-2*t);
      const sep=p===0?3.3-2.35*ease:p===1?.95+1.75*Math.sin(t*Math.PI*.7):p===2?2.37-1.55*ease:.82*(1-ease);
      const angle=.24+this.elapsed/7200*3.1;for(let i=0;i<2;i++){const sign=i?1:-1,c=q.cores[i];c.x=Math.cos(angle)*sep*.5*sign;c.y=Math.sin(angle)*sep*.29*sign;c.turn=angle+(i?-.35:.1);}
      q.bridge=p===0?.12+t*.2:p===1?.42:p===2?.55:.48*(1-t);return q;
    }
    density(x,y){if(this.state==='ready')return 0;const d=Math.hypot(x-this.x,y-this.y);if(d>6)return 0;const m=this.model(),bridge=Math.exp(-d*d*.36)*(this.phase+1)*.15;let value=bridge;
      for(const c of m.cores){const dx=x-this.x-c.x,dy=y-this.y-c.y,r=Math.hypot(dx,dy/.65);value+=Math.exp(-r*r*.55)*.5;}
      return A.clamp(value,0,1);
    }
    update(dt){if(this.state==='ready'||!this.eligible())return;this.tideIn-=dt;if(this.tideIn<=0){this.tideIn=1;this.tides();}
      this.supplyIn-=dt;if(this.supplyIn<=0){this.supplyIn=this.emit()?12:3;}
    }
    tides(){if(this.phase<1||this.distance()>2.6)return;const g=this.g,amp=Math.sin((this.elapsed%1800)/1800*Math.PI)*.1,a=this.elapsed*.0017;
      for(const b of g.cosmic.allMembers){if(!b.alive||!b.parentId)continue;const owner=g.cosmic.byId.get(b.parentId);if(!owner)continue;const dx=b.x-owner.x,dy=b.y-owner.y,u=A.unit(owner.m),d=Math.hypot(dx,dy);if(d<380*u)continue;const k=amp*Math.min(1,d/(800*u))/Math.max(d,1)*u;b.vx+=(dx*Math.cos(a)+dy*Math.sin(a))*k;b.vy+=(dx*Math.sin(a)-dy*Math.cos(a))*k;}
    }
    emit(){const g=this.g,p=g.player,u=A.unit(p.m);if(this.reservoir<=0||this.distance()>2.6)return false;
      const regions=g.cosmic.regions;if(regions.length>=8){const index=regions.findIndex(r=>r.cells.every(c=>c.m<c.initial*.01)||Math.hypot(r.x-p.x,r.y-p.y)>3400*u);if(index<0)return false;regions.splice(index,1);}
      const R=g.world.random,amount=Math.min(this.reservoir,p.m*(this.phase<2?.055:.09));if(amount<=0)return false;
      const heading=Math.atan2(this.y-this.e.atlas.y,this.x-this.e.atlas.x)+(R()-.5)*1.1,d=(240+R()*160)*u,x=p.x+Math.cos(heading)*d,y=p.y+Math.sin(heading)*d,r=(110+R()*55)*u;
      const birth=this.phase>=1&&(this.emissions+1)%5===0&&g.world.bodies.length+3<g.world.budget(),coherent=birth?amount*.2:0,gas=amount-coherent;
      const region={x,y,r,name:this.phase>=2?'Collision star-forming bridge':'Collision tidal gas',color:'#abbed2',material:'gas',cells:[]};
      for(let i=0;i<24;i++){const a=R()*A.TAU,rd=Math.sqrt(R())*r,cx=x+Math.cos(a)*rd,cy=y+Math.sin(a)*rd*.65,rx=cx-p.x,ry=cy-p.y,dist=Math.hypot(rx,ry)||1,v=Math.sqrt(Math.max(0,A.Physics.mu(g,p))/Math.max(dist,p.r*3))*.78;
        region.cells.push({x:cx,y:cy,z:(p.z||0)+(R()-.5)*r*.16,vx:p.vx-ry/dist*v,vy:p.vy+rx/dist*v,vz:0,m:gas/24,initial:gas/24,r:r*(.2+R()*.08),seed:Math.floor(R()*1e8),material:'gas',trail:[]});}
      regions.push(region);
      if(birth){for(let i=0;i<3;i++){const a=heading+(i-1)*.22,b=g.world.make(p.x+Math.cos(a)*d,p.y+Math.sin(a)*d,coherent/3,'wanderer');b.form=A.scaleStage(p)>=15?'star':'planet';b.material=b.form==='star'?'stellar':'rock';b.name=b.form==='star'?'Tidal-born star':'Tidal-born world';b.tag=b.name;const v=Math.sqrt(Math.max(0,A.Physics.mu(g,p))/Math.max(d,p.r*3))*(.95+i*.04);b.vx=p.vx-Math.sin(a)*v;b.vy=p.vy+Math.cos(a)*v;b.setMass(b.m);}g.world.rebuild();}
      this.reservoir=Math.max(0,this.reservoir-amount);this.released+=amount;this.emissions++;return true;
    }
    trace(c,project,scale,time,detail,preview=false){const m=this.model(),stride=detail<=.5?6:2;c.save();c.globalCompositeOperation='screen';
      for(let i=0;i<this.tracers.length;i+=stride){const t=this.tracers[i],core=m.cores[t.galaxy],spin=A.Save.data.settings.reducedMotion?0:time*.032/Math.pow(.3+t.r,1.25),a=t.arm+Math.log(.18+t.r)*2.45+t.a*.065+core.turn+spin;
        let x=core.x+Math.cos(a)*t.r*1.6,y=core.y+Math.sin(a)*t.r*.7;
        if(t.b>.7){const k=m.bridge*(t.b-.7)*1.6;x=A.lerp(x,m.cores[1-t.galaxy].x,k);y=A.lerp(y,m.cores[1-t.galaxy].y,k);}
        const q=project(x,y);if(q.x<-4||q.y<-4||q.x>c.canvas.width+4||q.y>c.canvas.height+4)continue;c.globalAlpha=(preview?.56:.3)+t.b*.3;c.fillStyle=t.galaxy?'#a6cddd':'#e6c78e';const size=Math.max(1,Math.min(2.2,scale*.006))*t.size;c.fillRect(q.x,q.y,size,size);
      }
      c.globalAlpha=1;if(detail>.5){for(let i=0;i<2;i++){const core=m.cores[i],q=project(core.x,core.y);this.glows||=new Map();const color=i?'#aacdde':'#e6c68d';if(!this.glows.has(color)){const stamp=document.createElement('canvas');stamp.width=stamp.height=96;const x=stamp.getContext('2d'),gr=x.createRadialGradient(48,48,0,48,48,48);gr.addColorStop(0,color+'90');gr.addColorStop(.23,color+'40');gr.addColorStop(1,color+'00');x.fillStyle=gr;x.fillRect(0,0,96,96);this.glows.set(color,stamp);}const radius=Math.min(scale*.24,Math.max(c.canvas.width,c.canvas.height)*.65);if(q.x+radius<0||q.y+radius<0||q.x-radius>c.canvas.width||q.y-radius>c.canvas.height)continue;c.drawImage(this.glows.get(color),q.x-radius,q.y-radius,radius*2,radius*2);}}
      c.restore();
    }
    draw(r){if(this.state==='ready'||this.distance()>6)return;const u=1000*A.unit(this.g.player.m),a=this.e.atlas,detail=Math.min(this.g.detail||1,A.Save.data.settings.quality==='low'?.5:1),scale=u*r.camera.zoom;
      this.trace(r.ctx,(x,y)=>{const q=r.screen(this.g.player.x+(this.x-a.x+x)*u,this.g.player.y+(this.y-a.y+y)*u);return r.cosmic?r.cosmic.warp(q):q;},scale,r.animationTime(),detail);
    }
    diagram(canvas){const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height,p=A.themePalette(),scale=Math.min(w/6,h/3.5);c.fillStyle=p.bg;c.fillRect(0,0,w,h);this.trace(c,(x,y)=>({x:w/2+x*scale,y:h/2+y*scale}),scale,this.g.renderer.animationTime(),Math.min(this.g.detail||1,A.Save.data.settings.quality==='low'?.5:1),true);
      c.fillStyle=p.muted;c.font='10px monospace';c.fillText(this.state==='ready'?'PROPOSED GALACTIC ENCOUNTER':A.GALAXY_PHASES[this.phase].name.toUpperCase(),14,22);c.fillText('Compressed geometry · actual encounter phase',14,h-13);
    }
    serialize(){const q={};for(const k of ['state','elapsed','phase','seed','x','y','budget','reservoir','released','emissions','rewarded','supplyIn','checkpointIn'])q[k]=this[k];return q;}
  };

  A.Expedition=class{
    constructor(g,s){this.g=g;this.atlas=new A.Atlas(g,s?.atlas);this.collision=new A.GalaxyCollision(this,s?.collision);this.weather=new A.StellarWeather(g,s?.weather);this.planetary=new A.Planetary(g);this.replay=new A.EncounterReplay(g);this.eventIn=finite(s?.eventIn,100);
      this.encounterIn=Math.max(0,finite(s?.encounterIn,22));this.encounterSerial=Math.max(0,finite(s?.encounterSerial));this.encounter=s?.encounter&&A.ENCOUNTERS[s.encounter.style]?{...s.encounter}:null;
      this.journal=(s?.journal||[]).filter(q=>q&&typeof q.title==='string'&&Number.isFinite(q.time)).slice(-24).map(q=>({title:q.title.slice(0,100),detail:String(q.detail||'').slice(0,220),time:q.time}));
      this.completed=(s?.completed||[]).filter(Number.isInteger).slice(-64);this.directive=s?.directive&&Number.isFinite(s.directive.stage)?{...s.directive,baseline:{...s.directive.baseline}}:null;this.directiveIn=0;this.coast=finite(s?.coast);this.visited=new Set((s?.visited||[]).filter(q=>typeof q==='string').slice(-256));
      this.blueprints={selected:s?.blueprints?.selected||null,progress:finite(s?.blueprints?.progress),completed:[...(s?.blueprints?.completed||[])]};
      const l=A.Save.data.legacy;this.trial=l.rank>0&&A.Save.mode!=='sandbox'?(s?.trial&&s.trial.rank===l.rank?{...s.trial}:{kind:l.trial,rank:l.rank,progress:0,hold:0,done:false}):null;
    }
    selectBlueprint(id){if(id!==null&&!A.BLUEPRINTS.some(q=>q.id===id)||A.scaleStage(this.g.player)<9)return false;this.blueprints.selected=id;this.blueprints.progress=0;this.blueprintIn=0;this.blueprintCheck=null;return true;}
    updateBlueprints(dt){const q=this.blueprints,def=A.BLUEPRINTS.find(b=>b.id===q.selected);if(!def||q.completed.includes(def.id)||A.Save.mode==='sandbox')return;
      this.blueprintIn=(this.blueprintIn||0)-dt;if(this.blueprintIn<=0||!this.blueprintCheck){this.blueprintIn=.2;this.blueprintCheck=A.blueprintStatus(this.g,def.id);}
      const safe=this.blueprintCheck.ready&&this.g.cosmic.summary.stability>=.75&&!this.g.cosmic.summary.atRisk&&A.scaleStage(this.g.player)>=9;q.progress=safe?Math.min(def.hold,q.progress+dt):0;if(q.progress<def.hold)return;if(!A.blueprintStatus(this.g,def.id).ready){q.progress=0;this.blueprintIn=0;return;}const g=this.g;q.completed.push(def.id);const records=A.Save.data.legacy.blueprints;if(!records.includes(def.id))records.push(def.id);g.stats.blueprintsBuilt=(g.stats.blueprintsBuilt||0)+1;this.record('Blueprint complete',def.name+' · assembled through gravity');A.Save.achievement('architect',g);g.audio.play('objective');g.ui.toast('BLUEPRINT COMPLETE',def.name+' · observatory record added.','aqua');
    }
    trialStatus(){const q=this.trial;if(!q)return null;const g=this.g,r=Math.min(q.rank,12),s=g.stats;
      if(q.kind==='pilgrim')return{progress:Math.min((s.sectorsCharted||0)/(12+3*r),s.captures/(120+30*r)),note:(s.sectorsCharted||0)+' / '+(12+3*r)+' sectors · '+s.captures+' / '+(120+30*r)+' accreted bodies'};
      if(q.kind==='custodian'){const worlds=g.cosmic.members.filter(b=>b.parentId===g.player.id&&g.cosmic.isPlanet(b)&&b.orbitStable&&!b.collapse&&b.risk==='CLEAR'),moon=worlds.some(b=>g.cosmic.members.some(m=>m.parentId===b.id&&m.orbitStable&&!m.collapse&&m.risk==='CLEAR')),healthy=worlds.length>=3&&moon&&g.cosmic.summary.stability>=.75&&!g.cosmic.summary.atRisk;return{progress:q.hold/(30+10*r),healthy,hold:30+10*r,note:Math.floor(q.hold)+' / '+(30+10*r)+' quiet seconds · three worlds and a stable moon'};}
      const target=5**15*(.03+.01*r);return{progress:A.appearance(g.player).type==='blackhole'||A.appearance(g.player).type==='singularity'?(s.totalMatterAccreted||0)/target:0,note:A.massText(s.totalMatterAccreted||0)+' / '+A.massText(target)+' actually accreted at black-hole scale'};
    }
    updateTrial(dt){const q=this.trial;if(!q||q.done||A.Save.mode==='sandbox')return;let status=this.trialStatus();if(q.kind==='custodian'){q.hold=status.healthy?Math.min(status.hold,q.hold+dt):0;status.progress=q.hold/status.hold;}q.progress=A.clamp(status.progress,0,1);if(q.progress<1)return;q.done=true;const key=q.rank+':'+q.kind,d=A.Save.data.legacy;if(!d.trials.includes(key)){d.trials.push(key);this.g.stats.trialsCompleted=(this.g.stats.trialsCompleted||0)+1;}this.record('Expedition promise kept',A.LEGACY_TRIALS.find(t=>t.id===q.kind).name);A.Save.achievement('legacyTrial',this.g);this.g.audio.play('objective');this.g.ui.toast('PROMISE KEPT','Expedition '+q.rank+' · challenge recorded without changing your power.','gold');
    }
    record(title,detail=''){this.journal.push({title,detail,time:this.g.time});if(this.journal.length>24)this.journal.shift();}
    beginDirective(){
      const g=this.g,stage=g.player.path?g.player.evolution:Math.min(A.FINAL_STAGE,A.scaleStage(g.player)),stats=g.stats,cycle=stage%3;
      let kind,target,title,note;
      if(A.Supernova?.precursor(g.player)&&A.Supernova.level(g.player)>0){const route=g.player.path,level=A.Supernova.level(g.player);if(route==='singularity')[kind,target,title,note]=['growth',g.player.m*.35,'Gather into the core','Accrete 35% of your class-entry mass while your collapse journey develops.'];else if(route==='nebula')[kind,target,title,note]=level===1?['survey',5,'Trace the stellar winds','Chart five new sectors while your mass-shedding star still holds its system.']:['growth',g.player.m*.4,'Build the expanding shell','Accrete 40% of your class-entry mass before the nebula transformation.'];else if(route==='neutron')[kind,target,title,note]=level===1?['coast',25,'Settle the spinning core','Coast above 18 u/s for twenty-five seconds without thrust or boost.']:['captures',15,'Feed the proto-neutron core','Assimilate fifteen coherent bodies as your compact core develops.'];else [kind,target,title,note]=['growth',g.player.m*.35,'Concentrate the shell','Accrete 35% of your class-entry mass before the vacuum remnant forms.'];}
      else if(A.appearance(g.player).type==='nebula'){[kind,target,title,note]=cycle===1?['survey',5,'Explore with the cloud','Chart five new sectors. Drift through matter-rich lanes.']:['accretion',g.player.m*.1,'Mix matter into the cloud','Dissolve nearby bodies, then assimilate 10% of your class-entry mass. Stored matter has not yet counted.'];}
      else if(A.appearance(g.player).type==='strange'){[kind,target,title,note]=['accretion',g.player.m*.12,'Convert surrounding matter','Keep bodies inside the conversion field, then assimilate 12% of your class-entry mass.'];}
      else if(stage<4){[kind,target,title,note]=cycle===0?['captures',20+stage*4,'Gather a field','Accrete coherent bodies. Matter only counts after it reaches you.']:cycle===1?['coast',35,'Learn the drift','Coast above 18 u/s with no thrust or boost. Braking pauses the count.']:['survey',4,'Chart quiet space','Enter four new sectors. Open the galaxy map with G.'];}
      else if(stage<9){[kind,target,title,note]=cycle===2?['survey',4,'Find new territory','Chart four new sectors while your mass and camera scale grow.']:['growth',g.player.m*.65,'Build a heavier world','Accrete 65% of your class-entry mass. Capture slowly to recover more.'];}
      else if(stage<15){[kind,target,title,note]=cycle===0?['system',20,'Keep two worlds','Maintain two stable planets and at least 60% system stability for twenty seconds.']:cycle===1?['condensates',1,'Grow from dust','Let captured, cooled gas clump into a new body. A nursery helps.']:['survey',5,'Survey beyond the star','Chart five new sectors without abandoning your inner system.'];}
      else {[kind,target,title,note]=cycle===1?['survey',5,'Follow galactic lanes','Chart five new sectors. Dense lanes contain finite gas reservoirs.']:['accretion',g.player.m*.16,'Feed the horizon','Accrete 16% of your class-entry mass. Stored disk mass does not count yet.'];}
      this.directive={stage,kind,target,title,note,progress:0,done:this.completed.includes(stage),baseline:{captures:stats.captures,growth:stats.totalGained,accretion:stats.totalMatterAccreted||0,condensates:stats.condensatesBorn||0,survey:this.visited.size,coast:this.coast}};
      this.record('New class: '+A.appearance(g.player).name,title);
    }
    journey(dt){
      const g=this.g;if(A.Save.mode==='sandbox')return;
      if(!this.directive||this.directive.stage!==(g.player.path?g.player.evolution:Math.min(A.FINAL_STAGE,A.scaleStage(g.player))))this.beginDirective();
      const key=this.atlas.key(this.atlas.x,this.atlas.y);if(!this.visited.has(key)){if(this.visited.size>=256)this.visited.delete(this.visited.values().next().value);this.visited.add(key);g.stats.sectorsCharted=(g.stats.sectorsCharted||0)+1;}
      const p=g.player,keys=g.input.keys;if(!p.thrustX&&!p.thrustY&&!g.boosting&&!keys.has('ShiftLeft')&&!keys.has('ShiftRight')&&Math.hypot(p.vx,p.vy)>18*A.unit(p.m))this.coast+=dt;
      const q=this.directive;if(q.done)return;
      if(q.kind==='system'){const s=g.cosmic.summary;if(s.stablePlanets>=2&&s.stability>=.6&&!s.atRisk)q.progress+=dt;else q.progress=Math.max(0,q.progress-dt*.5);}
      else{const values={captures:g.stats.captures,growth:g.stats.totalGained,accretion:g.stats.totalMatterAccreted||0,condensates:g.stats.condensatesBorn||0,survey:g.stats.sectorsCharted||0,coast:this.coast};if(q.kind==='survey'&&q.baseline.surveyCounter===undefined)q.baseline.surveyCounter=values.survey;q.progress=Math.max(0,values[q.kind]-(q.kind==='survey'?q.baseline.surveyCounter:q.baseline[q.kind]||0));}
      if(q.progress>=q.target){q.progress=q.target;q.done=true;this.completed.push(q.stage);if(this.completed.length>64)this.completed.shift();g.stats.directivesCompleted=(g.stats.directivesCompleted||0)+1;g.upgrades.points++;this.record('Journey goal complete',q.title+' · one adaptation point earned');g.ui.toast('JOURNEY GOAL COMPLETE',q.title+' · +1 adaptation point · U to choose','aqua');g.audio.play('objective');A.Save.achievement('wayfinder',g);}
      if((g.stats.sectorsCharted||0)>=12)A.Save.achievement('charted',g);
    }
    discover(){
      const g=this.g,p=g.player,w=g.world,R=w.random,stage=A.scaleStage(p),s=A.unit(p.m),slots=w.budget()-w.bodies.length;
      if(slots<12){this.encounterIn=12;return false;}
      const styles=stage>=15?['filament','association']:stage>=9?['worlds','nursery']:stage>=4?['archipelago','shoal']:['ribbon','stream','shoal'];
      const style=styles[this.encounterSerial++%styles.length],def=A.ENCOUNTERS[style],heading=Math.hypot(p.vx,p.vy)>3*s?Math.atan2(p.vy,p.vx):R()*A.TAU,a=heading+(R()-.5)*1.1,d=(stage>=9?280:320)*s,x=p.x+Math.cos(a)*d,y=p.y+Math.sin(a)*d;
      w.field(x,y,Math.min(slots,stage>=9?24:34),140*s,p.m,false,style);
      if((style==='nursery'||style==='filament')&&g.cosmic.regions.length<8){g.cosmic.spawn(true);const region=g.cosmic.regions[g.cosmic.regions.length-1],dx=x-region.x,dy=y-region.y;region.x=x;region.y=y;region.name=style==='filament'?'Molecular filament':region.name;for(const c of region.cells){c.x+=dx;c.y+=dy;if(style==='filament'){const lx=c.x-x,ly=c.y-y;c.x=x+lx*1.45;c.y=y+ly*.32;}const rx=c.x-p.x,ry=c.y-p.y,rd=Math.hypot(rx,ry)||1,v=Math.sqrt(A.Physics.mu(g,p)/Math.max(rd,p.r*3))*.83;c.vx=p.vx-ry/rd*v;c.vy=p.vy+rx/rd*v;}}
      this.encounter={style,x,y,z:p.z||0,until:g.time+55};this.encounterIn=95+R()*45;g.stats.encountersFound=(g.stats.encountersFound||0)+1;this.record(def.name,def.note);g.ui.toast('SECTOR DISCOVERY',def.name+' · '+def.note,'aqua');g.audio.play('discovery',.15);return true;
    }
    update(dt){this.atlas.update(dt);this.collision.update(dt);this.planetary.update(dt);this.weather.update(dt);this.replay.update(dt);this.journey(dt);this.updateBlueprints(dt);this.updateTrial(dt);this.encounterIn-=dt;if(this.encounterIn<=0)this.discover();if(this.encounter&&this.encounter.until<this.g.time)this.encounter=null;this.eventIn-=dt;if(this.eventIn<=0){this.eventIn=150+this.g.world.random()*100;if(A.scaleStage(this.g.player)>=9&&this.g.world.random()<.18){const g=this.g,p=g.player,s=A.unit(p.m),b=g.world.make(p.x+800*s,p.y+300*s,p.m*.015,'wanderer');b.form='neutron';b.material='stellar';b.name='Magnetar';b.tag='Magnetar';b.vy=-4*s;b.setMass(b.m);g.world.rebuild();this.weather.schedule('magnetar',b);}}}
    serialize(){return{collision:this.collision.serialize(),blueprints:clone(this.blueprints),trial:this.trial?{...this.trial}:null,atlas:this.atlas.serialize(),weather:this.weather.serialize(),eventIn:this.eventIn,encounterIn:this.encounterIn,encounterSerial:this.encounterSerial,encounter:this.encounter,journal:this.journal,completed:this.completed,directive:this.directive,coast:this.coast,visited:[...this.visited]};}
    rebase(x,y){this.atlas.lastX-=x;this.atlas.lastY-=y;this.weather.rebase(x,y);this.replay.rebase(x,y);if(this.encounter){this.encounter.x-=x;this.encounter.y-=y;}}
  };
  const body=A.Renderer.prototype.body;
  A.Renderer.prototype.body=function(b,q,radius){const c=this.ctx,g=this.game;body.call(this,b,q,radius);
    if(radius>(A.Save.data.settings.quality==='low'?18:8)&&A.scaleStage(b)>=3&&A.scaleStage(b)<=8){c.save();c.globalAlpha=.18;c.strokeStyle={iron:'#d9af85',rock:'#a4bea9',ice:'#9edce8',gas:'#dbc58e'}[A.Composition.dominant(b)];c.lineWidth=Math.min(3,radius*.12);c.beginPath();c.arc(q.x,q.y,radius*.94,0,A.TAU);c.stroke();c.restore();}
    this.drawHeritage(b,q,radius);
    if(b.resonanceTime>=15&&radius>2&&!g.photo?.active){c.fillStyle='#9ccdc4';c.font='9px monospace';c.fillText(b.resonanceRatio,q.x+radius+5,q.y-5);}
  };
  const profile=A.Cosmic.prototype.profile;
  A.Cosmic.prototype.profile=function(owner){const q={...profile.call(this,owner)};if(owner===this.g.player){if(this.g.expedition?.collision?.rewarded){q.gravity=(1+q.gravity)*1.1-1;q.intake=(1+q.intake)*1.2-1;}const e=this.g.life?.evolution();if(e?.form==='survey')q.survey+=.08;const temperate=this.members.filter(b=>b.orbitStable&&b.climate==='Temperate').length;q.survey+=Math.min(.06,temperate*.02);}return q;};
  const scanUpdate=A.Life.prototype.update;
  // Scanner branches enlarge the existing finite scan, rather than adding another scanner.
  A.Life.prototype.update=function(dt){scanUpdate.call(this,dt);if(this.evolution()?.branch==='scout'&&this.scanIn===.25){const p=this.game.player;this.game.world.hash.query(p.x,p.y,780*A.unit(p.m),b=>{if(b.alive&&!b.lifeClaimed&&b.water>0&&Math.hypot(b.x-p.x,b.y-p.y)<=780*A.unit(p.m)&&!this.scan.includes(b)&&this.scan.length<32)this.scan.push(b);});}};
  if(A.Save.data.replay)A.Save.data.replay=A.EncounterReplay.clean(A.Save.data.replay);
})(window.AC);
