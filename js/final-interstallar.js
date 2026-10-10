'use strict';
/* Persistent late-game landmark. Public: AC.FINAL, FINAL_LOOK, cleanFinal,
 * FinalInterstallar {update, forces, accelerationOn, advanceReal, rebase,
 * serialize, place}. Dependencies: core, Physics, Cosmic, Save, Input, AI.
 * It is deliberately outside Body/hash/budgets. Its pure field reads cached
 * real player mu; only horizon crossing consumes finite existing matter.
 * Run tests/final-interstallar-tests.html; pacing/migration evidence is in tests.
 */
(function(A){
  const TAU=Math.PI*2;
  A.FINAL=Object.freeze({name:'The Final Interstallar',discoverStage:15,apexClass:22,mergeStage:21,mass:5**22,
    gravityCap:24,softening:.5,accelerationCap:.74,mergeSeconds:10,mergeHold:1.5,mergeSpeed:38,innerFlowSpeed:42,
    // Pacing proof: 60R at the preserved class-21 cruise takes ~20 seconds.
    // 1000R takes ~5.3 minutes; placement gives class 15 ~5 minutes to the lens.
    zones:Object.freeze({beacon:1000,lens:250,disk:18,photon:5,last:1.6}),placementLensOffset:31000,
    edgeStress:.015,innerStress:3.2,warningSeconds:5,escapeTime:8,photoLimit:9999});
  A.FINAL_LOOK=Object.freeze({hero:'R1',
    inclination:5, // M4 R1: line of sight above disk plane 5° ±3° (inferred).
    bandOffset:.073, // M5 R1: foreground centre 0.0726R below the shadow centre.
    bandThickness:.066, // M5/M13 R1: finite photosphere half-height fitted to band samples.
    ringRadius:1.014, // M8 R1: isolated narrow critical-impact feature at the rim.
    ringWidth:.0266, // M8 R1: Gaussian FWHM 0.0443R.
    archOffset:-.15, // M9 R1: asymmetric outer dark gap, approximate display fit.
    innerRadius:2.05, // M6/R1: fitted emitting plunge region; not the Schwarzschild ISCO.
    textureScale:1,beamingScale:1, // Model controls; M14 inferred striation scale.
    emissivity:2.05, // M11 R1 fit is unreliable/cropped; bounded model assumption.
    exposure:5.0, // M17 R1: white luminance ~0.90; fitted procedural radiance.
    bloom:.19, // M15 R1: 10% halo reach ~0.19R, uncertainty ±0.09R.
    // M13 R1: short fitted warm ramp, observations only. No pixel strips/textures.
    ramp:Object.freeze([Object.freeze([68,38,26]),Object.freeze([148,89,65]),Object.freeze([224,183,167]),Object.freeze([250,227,215])])
  });
  const zones=['none','beacon','lens','disk','photon','last'];
  // Invalid/future landmark state is ignored independently of the old run.
  A.cleanFinal=function(q){if(!q||q.v!==1||typeof q!=='object')return null;
    const bounded=(k,a,b,integer=false)=>Number.isFinite(q[k])&&q[k]>=a&&q[k]<=b&&(!integer||Number.isInteger(q[k]));
    if(!bounded('x',-1e12,1e12)||!bounded('y',-1e12,1e12)||!bounded('ang',0,TAU)||!bounded('near',0,1e6)||!bounded('lens',0,1e7)||!bounded('shots',0,9999,true)||!bounded('warn',0,3,true)||!bounded('merge',0,1)||!zones.includes(q.zone))return null;
    if(!['found','chart','done'].every(k=>typeof q[k]==='boolean')||!Array.isArray(q.seen)||q.seen.length>8||!q.seen.every(s=>typeof s==='string'&&s.length<=48))return null;
    if(q.consumed!==undefined&&!bounded('consumed',0,1e22))return null;
    return{x:q.x,y:q.y,ang:q.ang,found:q.found,chart:q.chart,near:q.near,lens:q.lens,shots:q.shots,zone:q.zone,warn:q.warn,merge:q.merge,done:q.done,seen:[...new Set(q.seen)],v:1,consumed:q.consumed||0};
  };
  A.FinalInterstallar=class{
    constructor(g,saved){this.g=g;this.id=-38;this.kind='landmark';this.seed=(g.world.seed^0xF17A38)>>>0;this.m=A.FINAL.mass;this.r=A.radius(this.m);this.x=this.y=this.z=0;this.ang=0;this.found=false;this.chart=false;this.near=1e6;this.lens=0;this.shots=0;this.zone='none';this.warn=0;this.merge=0;this.done=false;this.seen=[];this.consumed=0;this.positioned=false;this.merging=false;this.hold=0;this.warningIn=0;this.recordIn=0;this.out={x:0,y:0};this.mergeStart=null;this.approachSpeed=0;this.distanceR=1e6;
      const s=A.cleanFinal(saved);if(s){Object.assign(this,s);this.positioned=true;this.m=A.clamp(A.FINAL.mass+this.consumed,1,1e22);this.zone='none';if(s.merge>0&&s.merge<1&&!s.done){this.merging=true;this.mergeOriginPhase=s.merge;this.mergeStart={x:g.player.x,y:g.player.y,vx:g.player.vx,vy:g.player.vy};g.evolutionTime=(1-s.merge)*A.FINAL.mergeSeconds;}}
      this.resetForBody();this.refreshField();
    }
    get radius(){return this.r;}get mass(){return this.m;}get discovered(){return this.found;}get charted(){return this.chart;}get closest(){return this.near;}get timeInLens(){return this.lens;}get photos(){return this.shots;}get merged(){return this.done;}
    get trapped(){return !this.merging&&this.active&&this.warn===3&&this.distanceR<=A.FINAL.zones.last&&A.scaleStage(this.g.player)<A.FINAL.mergeStage;}
    get eligible(){const p=this.g.player;return !!p&&A.appearance(p).type==='blackhole'&&A.scaleStage(p)>=A.FINAL.discoverStage;}
    get active(){return !!this.positioned&&!this.done&&(this.eligible||A.Save.mode==='sandbox'&&this.sandboxPlaced);}
    resetForBody(){if(this.positioned)return;const p=this.g.player;if(p.evolution<A.FINAL.discoverStage&&p.m<5**A.FINAL.discoverStage)return;if(!this.eligible)return;const anchor=this.g.cosmic?.stage>=15?this.g.cosmic.anchor:this.g.player,random=A.rng(this.seed);this.ang=random()*TAU;
      const dist=this.r*A.FINAL.zones.lens+A.FINAL.placementLensOffset*A.unit(5**A.FINAL.discoverStage);this.x=anchor.x+Math.cos(this.ang)*dist;this.y=anchor.y+Math.sin(this.ang)*dist;this.positioned=true;
    }
    refreshField(){const g=this.g,p=g.player;this.fieldEnabled=this.active;this.fieldMu=A.Physics.mu(g,p);const route=A.Supernova.buffs(p);this.fieldThrust=A.FLIGHT.acceleration*A.unit(p.m)*route.speed*(1+.2*g.upgrades.get('thrust'))*(1+(g.life?.buffs().thrust||0));}
    zoneAt(r){const z=A.FINAL.zones;return r<=z.last?'last':r<=z.photon?'photon':r<=z.disk?'disk':r<=z.lens?'lens':r<=z.beacon?'beacon':'none';}
    accelerationOn(body,out){out=out||this.out;out.x=out.y=0;if(!this.fieldEnabled||this.done||this.merging)return out;
      const dx=this.x-body.x,dy=this.y-body.y,d=Math.hypot(dx,dy),range=this.r*A.FINAL.zones.lens;if(!Number.isFinite(d)||d<.0001||d>=range)return out;
      const p=this.g.player,unit=A.unit(p.m),mu=Math.min(18000*this.m/unit,A.FINAL.gravityCap*this.fieldMu);
      const soft=this.r*A.FINAL.softening,raw=mu*d/Math.pow(d*d+soft*soft,1.5),thrust=this.fieldThrust;
      const taper=d>range*.8?(range-d)/(range*.2):1,cap=d>this.r*A.FINAL.zones.last?thrust*A.FINAL.accelerationCap:thrust*4;
      const a=Math.min(raw,cap)*taper;out.x=dx/d*a;out.y=dy/d*a;return out;
    }
    forces(dt){if(!this.active)return;this.refreshField();const g=this.g,p=g.player,q=this.accelerationOn(p,this.out);p.ax+=q.x;p.ay+=q.y;if(this.trapped){const dx=this.x-p.x,dy=this.y-p.y,d=Math.hypot(dx,dy)||1,s=A.unit(p.m),f=1-Math.exp(-dt*4);p.vx=A.lerp(p.vx,dx/d*A.FINAL.innerFlowSpeed*s,f);p.vy=A.lerp(p.vy,dy/d*A.FINAL.innerFlowSpeed*s,f);p.bound=this.id;}
      const disk=this.r*A.FINAL.zones.disk,disk2=disk*disk;
      for(const parcel of g.cosmic?.packets||[]){const dx=parcel.x-this.x,dy=parcel.y-this.y;if(dx*dx+dy*dy>disk2)continue;this.accelerationOn(parcel,q);parcel.vx+=q.x*dt;parcel.vy+=q.y*dt;}
      // Grouped gas cells, not new physics particles. They retain their finite mass.
      for(const region of g.cosmic?.regions||[])for(const cell of region.cells){const dx=cell.x-this.x,dy=cell.y-this.y;if(cell.m<=0||dx*dx+dy*dy>disk2)continue;this.accelerationOn(cell,q);cell.vx+=q.x*dt;cell.vy+=q.y*dt;}
    }
    takeMass(amount){if(!(amount>0)||!Number.isFinite(amount))return;this.feed=A.clamp((this.feed||0)+amount/this.m*12,0,1);this.consumed=Math.min(1e22-A.FINAL.mass,this.consumed+amount);this.m=A.FINAL.mass+this.consumed;}
    absorbMatter(dt){const g=this.g,horizon=this.r;
      let n=0;for(const q of g.cosmic.packets){const d=Math.hypot(q.x-this.x,q.y-this.y);if(d<=horizon){this.takeMass(q.m);q.m=0;q.water=q.dna=0;q.trail.length=0;g.cosmic.packetPool.push(q);}else g.cosmic.packets[n++]=q;}g.cosmic.packets.length=n;
      for(const region of g.cosmic.regions)for(const c of region.cells){const d=Math.hypot(c.x-this.x,c.y-this.y);if(c.m>0&&d<this.r*1.12){const dm=Math.min(c.m,c.initial*dt*.07);c.m-=dm;this.takeMass(dm);g.expedition?.atlas.extract(c,dm);}}
      for(const b of g.world.bodies){if(b===g.player||!b.alive)continue;if(Math.hypot(b.x-this.x,b.y-this.y)>horizon)continue;this.takeMass(b.m);b.alive=false;if(b.kind==='ai'){g.effects.label(b.x,b.y,'HORIZON CROSSING','#d9b68f');g.expedition?.replay.event('Rival crossed the final horizon',b);}}
    }
    mark(key){if(A.Save.mode==='sandbox')return false;return A.Save.achievement(key,this.g);}
    note(id,title,text,style='gold'){if(this.seen.includes(id))return;this.seen.push(id);this.seen=this.seen.slice(-8);this.g.ui.toast(title,text,style);}
    update(dt){this.resetForBody();if(!this.active)return;const g=this.g,p=g.player,d=Math.hypot(p.x-this.x,p.y-this.y),R=d/this.r;this.distanceR=R;this.near=Math.min(this.near,R);this.warningIn=Math.max(0,this.warningIn-dt);
      this.feed=(this.feed||0)*Math.exp(-dt*.7);
      if(!this.merging&&['photon','last'].includes(this.zone)){this.pulseIn=(this.pulseIn||0)-dt;if(this.pulseIn<=0){g.audio.play('finalPulse',.2);this.pulseIn=1/A.clamp(.45+Math.max(0,this.approachSpeed)/150,.45,2);}}
      if(this.merging&&Math.floor(this.merge*5)!==this.mergeBeat){this.mergeBeat=Math.floor(this.merge*5);g.audio.play('finalMerge',.3);}
      this.approachSpeed=d>0?-((p.x-this.x)*p.vx+(p.y-this.y)*p.vy)/d/A.unit(p.m):0;
      const zone=this.zoneAt(R),old=this.zone;this.zone=zone;
      if(!this.found&&zone!=='none'){this.found=this.chart=true;this.mark('finalSignal');this.note('beacon','SIGNAL IN THE DARK','A distant horizon has entered your chart. Open G to plot a course.');g.expedition?.replay.event('The Final Interstallar charted',p);A.Save.checkpoint(g,'manual');}
      if(['lens','disk','photon','last'].includes(zone)){this.lens=Math.min(1e7,this.lens+dt);this.mark('finalLens');}
      if(zone==='photon'||zone==='last'){this.mark('finalLight');this.warn=Math.max(this.warn,2);if(old!==zone)g.audio.play('finalZone',.3);}
      if(this.near<2.5&&R>A.FINAL.zones.photon&&this.found){this.mark('finalReturn');this.note('returned','TURNED BACK','Your trajectory is carrying you beyond the photon region.','aqua');}
      if(zone!==old&&zone==='lens')this.note('lens','EDGE OF THE LENS','Light is bending. Your course still belongs to you.');
      if(zone!==old&&zone==='disk')this.note('disk','DISK APPROACH','Heat and tides are stressing your cohesion. Shift brakes; thrust outward to leave.','danger');
      if(zone!==old&&zone==='photon'){g.ui.teach?.('finalEscape');this.note('photon','LIGHT THAT CIRCLES',A.scaleStage(p)<A.FINAL.mergeStage?'Your horizon is too small to merge. Turn outward while you have room.':'Reduce speed and hold a steady approach to merge.','danger');}
      const eta=this.approachSpeed>1?(d-this.r*A.FINAL.zones.last)/(this.approachSpeed*A.unit(p.m)):Infinity;if(A.scaleStage(p)<A.FINAL.mergeStage&&eta<=A.FINAL.warningSeconds&&eta>0)this.note('earlyWarning','INNER FLOW AHEAD','Five seconds or less to irreversible inflow. Turn outward and use full thrust.','danger');
      if(zone==='last'&&this.warningIn===0&&!this.merging){this.warningIn=6;this.warn=3;g.ui.toast('HORIZON WARNING','Crossing the dark boundary ends this journey. Escape depends on your remaining momentum.','danger');}
      if(this.merging)return;
      if(R<=1){g.expedition?.replay.event('Final horizon crossing',p);g.finalEnding=true;g.end(A.FINAL.name);return;}
      if(R<A.FINAL.zones.disk&&p.invulnerable<=0&&p.grace<=0){const f=A.clamp((A.FINAL.zones.disk-R)/(A.FINAL.zones.disk-1),0,1),base=(A.FINAL.edgeStress+A.FINAL.innerStress*f*f)*dt;
        let damage=A.Physics.defendedDamage(g,p,base);if(p.hp<45&&g.upgrades.get('shield')&&g.shellCooldown<=0){g.shellCooldown=65-10*g.upgrades.get('shield');p.invulnerable=A.FINAL.escapeTime;damage=0;g.effects.ring(p.x,p.y,p.r,'#b0fff2');g.ui.toast('EMERGENCY SHELL','Cohesion stabilized. Thrust away from the horizon.','aqua');}
        p.hp-=damage;if(damage>0)g.lastDamage=g.time;if(p.hp<=0){g.finalEnding=true;g.end(A.FINAL.name);return;}}
      // Existing coherent-body fields make the hazard readable without a new
      // population or automatic credit. Mass is transferred only at the horizon.
      for(const b of g.world.bodies){if(b===p||!b.alive)continue;const d=Math.hypot(b.x-this.x,b.y-this.y)/this.r;if(d>=A.FINAL.zones.disk)continue;const stress=A.clamp(1-d/A.FINAL.zones.disk,0,1);b.heat=Math.max(b.heat||0,stress);b.tidalStress=Math.max(b.tidalStress||0,stress*stress);if(b.parentId&&d<5){b.orbitStable=false;b.stableTime=0;b.risk='EJECTION';}}
      this.absorbMatter(dt);
      const eligible=this.eligible&&A.scaleStage(p)>=A.FINAL.mergeStage,Rspeed=Math.hypot(p.vx,p.vy)/A.unit(p.m);
      if(eligible&&R<3&&R>1&&Rspeed<=A.FINAL.mergeSpeed&&p.invulnerable<=0&&g.evolutionTime<=0&&g.time-(g.lastEvolutionAt??-1e6)>=3)this.hold+=dt;else this.hold=0;
      if(this.hold>=A.FINAL.mergeHold)this.beginMerge();
    }
    beginMerge(){if(this.done||this.merging)return;const g=this.g;this.merging=true;this.merge=0;this.mergeOriginPhase=0;this.hold=0;this.mergeStart={x:g.player.x,y:g.player.y,vx:g.player.vx,vy:g.player.vy};g.input.clear();g.evolutionTime=A.FINAL.mergeSeconds;g.ui.finalSequence?.(0);g.audio.play('finalMerge',.6);}
    advanceReal(dt){if(!this.merging||this.g.state!=='playing'||document.hidden)return;this.merge=Math.min(1,this.merge+Math.min(.5,Math.max(0,dt))/A.FINAL.mergeSeconds);const g=this.g,p=g.player,t=this.merge,local=(t-(this.mergeOriginPhase||0))/Math.max(.001,1-(this.mergeOriginPhase||0)),s=local*local*(3-2*local),start=this.mergeStart;
      if(!A.Save.data.settings.reducedMotion){p.x=A.lerp(start.x,this.x,s*.9);p.y=A.lerp(start.y,this.y,s*.9);p.px=p.x;p.py=p.y;}
      p.vx=p.vy=0;p.invulnerable=.5;g.ui.finalSequence?.(t);if(t>=1)this.complete();
    }
    complete(){if(this.done)return;const g=this.g,p=g.player,before=A.stage(p.m),old=p.m;this.done=true;this.merging=false;this.merge=1;p.setMass(Math.min(1e22,p.m+this.m));
      // An explicit merger reward for each crossed numeric mass threshold. It does
      // not extend the class table, change route levels or duplicate old evolution.
      const crossed=Math.max(0,A.stage(p.m)-before);g.upgrades.points=Math.min(100,g.upgrades.points+crossed);g.stats.totalGained+=p.m-old;g.stats.peak=Math.max(g.stats.peak,p.m);g.stats.peakClass=A.FINAL.name;g.stats.finalMergers=(g.stats.finalMergers||0)+1;
      p.hp=A.cohesionLimit(g);p.invulnerable=4;p.x=this.x;p.y=this.y;p.px=p.x;p.py=p.y;p.vx=this.mergeStart?.vx||0;p.vy=this.mergeStart?.vy||0;g.evolutionTime=0;this.mark('finalMerged');g.expedition?.replay.event('Final merger',p);g.audio.play('finalArrival',.4);g.ui.finalSequence?.(1,true);A.Save.checkpoint(g,'manual');g.ui.finalAfterglow?.();
    }
    place(zone){if(A.Save.mode!=='sandbox')return false;this.done=false;this.positioned=true;this.sandboxPlaced=true;this.found=this.chart=true;this.m=A.FINAL.mass;this.r=A.radius(this.m);const p=this.g.player,random=A.rng(this.seed);this.ang=random()*TAU;
      const distance={beacon:A.FINAL.zones.beacon*.97,lens:A.FINAL.zones.lens*.95,disk:A.FINAL.zones.disk*.9,photon:3.7}[zone]||A.FINAL.zones.beacon*.97;this.x=p.x+Math.cos(this.ang)*distance*this.r;this.y=p.y+Math.sin(this.ang)*distance*this.r;this.zone='none';this.near=distance;this.merge=0;this.merging=false;this.hold=0;this.refreshField();return true;
    }
    rebase(x,y){if(this.positioned){this.x-=x;this.y-=y;}if(this.mergeStart){this.mergeStart.x-=x;this.mergeStart.y-=y;}}
    serialize(){if(!this.positioned)return null;return{v:1,x:this.x,y:this.y,ang:this.ang,found:this.found,chart:this.chart,near:Math.min(1e6,this.near),lens:this.lens,shots:this.shots,zone:this.zone,warn:this.warn,merge:this.merge,done:this.done,seen:this.seen.slice(-8),consumed:this.consumed};}
  };
  const updateInput=A.Input.prototype.update;
  A.Input.prototype.update=function(dt){if(this.game.finalInterstallar?.merging||this.game.finalInterstallar?.trapped){const p=this.game.player;p.controlAx=p.controlAy=p.thrustX=p.thrustY=0;this.game.boosting=false;if(this.game.finalInterstallar.merging)p.invulnerable=.5;else p.invulnerable=Math.max(0,p.invulnerable-dt);return;}return updateInput.call(this,dt);};
  const choose=A.AI.choose;
  A.AI.choose=function(g,b){choose.call(this,g,b);const f=g.finalInterstallar;if(!f?.active)return;const dx=b.x-f.x,dy=b.y-f.y,d=Math.hypot(dx,dy),range=f.r*A.FINAL.zones.disk*1.3;if(d>range||d<.001)return;
    const strength=(1-d/range)*(b.personality==='cautious'?3:2),x=b.steerX+dx/d*strength,y=b.steerY+dy/d*strength,n=Math.hypot(x,y)||1;b.steerX=x/n;b.steerY=y/n;b.intent='Avoiding the final disk';};
})(window.AC);
