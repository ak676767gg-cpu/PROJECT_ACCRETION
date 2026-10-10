'use strict';
(function (A) {
  const names = ['Helios', 'Nova', 'Atlas', 'Vesper', 'Kepler', 'Nyx', 'Orion', 'Ceres', 'Solace', 'Rigel', 'Echo', 'Aster'];
  const personalities = ['aggressive', 'cautious', 'opportunistic', 'explorer', 'efficient'];
  A.ENCOUNTERS={
    ribbon:{name:'Silicate ribbon',note:'A thin moving field. Match its drift for slow, efficient captures.',color:'#b7b9a6'},
    shoal:{name:'Icy shoal',note:'Cold fragments share a gentle drift. Samples remain scarce.',color:'#a3c5cc'},
    stream:{name:'Comet crossing',note:'Fast ice follows a narrow corridor. Sideways passes beat head-on impacts.',color:'#b6d4dc'},
    archipelago:{name:'Moonlet archipelago',note:'Several dense knots are separated by quiet lanes.',color:'#b8bdab'},
    worlds:{name:'Rogue-world passage',note:'Small worlds arrive with sideways momentum. Coast to keep new orbits.',color:'#91bcae'},
    nursery:{name:'Circumstellar nursery',note:'A finite dust cloud can feed your surface or form new worlds.',color:'#b5bc95'},
    filament:{name:'Molecular filament',note:'Gas and stellar fragments flow along a dense galactic lane.',color:'#b6bdc5'},
    association:{name:'Stellar association',note:'A compact gathering of stars offers mass and crossing trajectories.',color:'#d4c5a4'}
  };
  A.encounterStyle=(stage,n)=>{const keys=stage>=15?['filament','association','stream']:stage>=9?['worlds','nursery','ribbon']:stage>=4?['archipelago','ribbon','shoal']:['ribbon','shoal','stream','archipelago'];return keys[Math.floor(n*keys.length)%keys.length];};
  A.World = class {
    constructor(game, seed) {
      this.game = game; this.seed = seed; this.random = A.rng(seed); this.bodies = []; this.pool = []; this.nextId = 1;
      this.hash = new A.SpatialHash(); this.sources = []; this.streamIn = 0; this.eventIn = 70 + this.random() * 40; this.event = null; this.fields = []; this.aiSerial = 0;
    }
    budget(){const base=(this.game.player?A.scaleStage(this.game.player):0)>=15?(A.Save.data.settings.quality==='low'?260:340):(this.game.player?A.scaleStage(this.game.player):0)>=9?(A.Save.data.settings.quality==='low'?400:520):1120;return Math.max(160,Math.floor(base*A.cpuScale()*(A.Save.mode==='sandbox'?this.game.command?.options.density??1:1)));}
    orbitBody(parent,d,a,m,form,name,group){if(this.bodies.length>=this.budget())return null;const b=this.make(parent.x+Math.cos(a)*d,parent.y+Math.sin(a)*d,m);b.form=form;b.name=name;b.material=form==='star'?'stellar':form==='gas'?'gas':'rock';b.z=b.pz=parent.z||0;b.formationHost=parent.id;b.systemGroup=group||parent.systemGroup||parent.id;b.composition=A.Composition.seed(b);b.setMass(m);const v=Math.sqrt((A.Physics.mu(this.game,parent)+A.Physics.mu(this.game,b))/d);b.vx=parent.vx-Math.sin(a)*v;b.vy=parent.vy+Math.cos(a)*v;b.vz=parent.vz||0;b.grace=4;return b;}
    seedBelt(parent,d,count=20,mass=null){const g=this.game;for(let n=0;n<count&&this.bodies.length<this.budget();n++){const a=this.random()*A.TAU,b=this.orbitBody(parent,d*(.91+this.random()*.18),a,mass||parent.m*(.000001+this.random()*.000004),'rock','Asteroid belt');if(!b)break;b.material=this.random()<.2?'ice':'rock';b.tag='Finite belt ore';b.ore=4+b.seed%6;b.integrity=100;A.Life.decorate(this,b);}}
    buildSystem(primary,galaxy=false){
      const existing=this.bodies.filter(b=>b.alive&&b.formationHost===primary.id&&['planet','gas','star'].includes(b.form));if(existing.length>=3)return;
      primary.systemGroup||=primary.id;const u=A.unit(primary.m),n=galaxy?4:3+Math.floor(this.random()*3),s=this.scarcity();
      for(let k=existing.length;k<n;k++){
        if(s.hardcore&&this.random()>s.worlds)continue;const d=primary.r*(galaxy?4:3.5)+(galaxy?270+k*135:90+k*85)*u,a=k*2.39996+this.random()*.6,m=primary.m*(galaxy?.015+this.random()*.015:.0015+this.random()*.008),b=this.orbitBody(primary,d,a,m,galaxy?'star':k===n-1?'gas':'planet',galaxy?'Spiral-arm star '+(k+1):'System planet '+(k+1));if(!b)break;this.rewardRare(b,true);
        if(galaxy){b.kind='wanderer';const hill=d*Math.cbrt(b.m/(primary.m*3)),pd=Math.max(b.r*3.5,Math.min(hill*.25,b.r*6));for(let j=0;j<2;j++)this.orbitBody(b,pd*(1+j*.45),a+j*2.2,b.m*.00004,'planet','Arm-system world');this.seedBelt(b,pd*1.8,6);}
        else {const hill=d*Math.cbrt(b.m/(primary.m*3)),md=Math.min(hill*.3,b.r*4.5);if(md>b.r*2.6&&k%2===0)this.orbitBody(b,md,a+1,b.m*.001,'moon','Planetary moon');}
      }
      if(!galaxy)this.seedBelt(primary,primary.r*3.5+(125+n*85)*u,Math.round(24*A.cpuScale()));
      this.fields.push({x:primary.x,y:primary.y,z:primary.z||0,r:(galaxy?1250:700)*u,age:0,name:galaxy?'Spiral galaxy':'Planetary system',style:galaxy?'association':'worlds',structure:galaxy?'galactic':'system',primary:primary.id,angle:this.random()*A.TAU,vx:primary.vx,vy:primary.vy});if(this.fields.length>28)this.fields.shift();
    }
    scarcity(){
      const stage=this.game.player?Math.min(A.FINAL_STAGE,A.scaleStage(this.game.player)):0;
      const hardcore=this.game.difficulty==='hardcore'&&stage>=4, progress=Math.max(0,stage-4);
      const threshold=this.game.player?A.appearance(this.game.player).threshold:1;
      return {stage,threshold,hardcore,worlds:hardcore?Math.max(.12,.55*Math.pow(.90,progress)):1,peers:hardcore?Math.max(.015,.40*Math.pow(.80,progress)):1};
    }
    ambientMass(m){
      const q=this.scarcity();
      // Bias only newly generated ambient bodies. Existing worlds, rivals, fragments and
      // captured matter retain their real mass and ownership.
      if(q.hardcore&&m>=q.threshold&&this.random()>=q.peers)return q.threshold*(.04+this.random()*.13);
      return m;
    }
    rewardRare(b,world=false){
      const q=this.scarcity();if(!q.hardcore||(!world&&b.m<q.threshold))return false;
      const tier=q.stage>=15?2:q.stage>=9?1:0,scale=2**tier;
      b.hardcoreCache=true;b.water=(12+Math.floor(this.random()*13))*scale;b.dna=(3+Math.floor(this.random()*4))*scale;
      b.rawPayload=50*(1+tier);b.lifeClaimed=false;b.tag='Hardcore cache · '+b.rawPayload+' RAW';return true;
    }
    make(x, y, m, kind = 'rock') {
      const b = (this.pool.pop() || new A.Body()).reset(this.nextId++, x, y, m, kind, Math.floor(this.random() * 1e8));
      if(kind==='player')b.hp=A.cohesionLimit(this.game);
      A.Composition.ensure(b);b.setMass(m);this.bodies.push(b); return b;
    }
    initial() {
      const p = this.make(0, 0, 1, 'player'); p.name = 'You'; p.grace = 12; this.game.player = p;
      this.field(80, -25, 24, 90, 1);
      for (let i = 0; i < 16; i++) {
        const a = this.random() * A.TAU, d = 280 + this.random() * 1450;
        this.field(Math.cos(a) * d, Math.sin(a) * d, 32, 145, 1);
      }
      for (let i = 0; i < 9; i++) this.spawnAI(i === 0 ? 4.5 : null);
      for (let i = 0; i < 7; i++) this.wanderer();
      return p;
    }
    stellarField(field,count,mass,host=null){
      const g=this.game,p=g.player,u=A.unit(p.m),stage=A.scaleStage(p),galactic=stage>=15,near=this.bodies.filter(b=>b.alive&&b!==p&&!b.parentId&&['star','blackhole','brown'].includes(A.appearance(b).type)&&Math.hypot(b.x-field.x,b.y-field.y)<1100*u);
      let primary=host&&A.scaleStage(host)>=9?host:near.sort((a,b)=>Math.hypot(a.x-field.x,a.y-field.y)-Math.hypot(b.x-field.x,b.y-field.y))[0];
      const localHosts=this.bodies.filter(b=>b.alive&&b.kind==='wanderer'&&!b.parentId&&Math.hypot(b.x-p.x,b.y-p.y)<2200*u).length;
      if(!primary&&localHosts<(galactic?2:3)&&this.bodies.length<this.budget()-35){
        primary=this.make(field.x,field.y,this.ambientMass(mass*(galactic?.16:.32)),'wanderer');primary.form=galactic?'blackhole':'star';primary.name=galactic?'Wandering galactic core':'Wandering stellar system';primary.material='stellar';primary.z=primary.pz=field.z||0;primary.vx=field.vx;primary.vy=field.vy;primary.grace=8;primary.systemGroup=primary.id;primary.composition=A.Composition.seed(primary);primary.setMass(primary.m);this.rewardRare(primary);this.buildSystem(primary,galactic);
      }
      if(!primary){const candidates=this.bodies.filter(b=>b.alive&&(b===p||b.kind==='ai')&&['star','blackhole'].includes(A.appearance(b).type));primary=candidates.sort((a,b)=>Math.hypot(a.x-field.x,a.y-field.y)-Math.hypot(b.x-field.x,b.y-field.y))[0];}
      if(!primary)return;field.primary=primary.id;field.structure=galactic?'galactic':'system';field.name=galactic?'Galactic dust and stellar systems':'Planetary system and asteroid belt';
      const companions=this.bodies.filter(b=>b.alive&&b.formationHost===primary.id);if(companions.length<4)this.buildSystem(primary,A.appearance(primary).type==='blackhole');
      if(companions.filter(b=>b.form==='rock').length<45)this.seedBelt(primary,primary.r*4+(120+this.random()*180)*A.unit(primary.m),Math.min(16,count));
    }
    field(x, y, count, radius, mass, debris = false, style = null, host = null) {
      if(A.stage(mass)>=15&&this.game.cosmic)count=Math.ceil(count*(.3+.75*this.game.cosmic.galactic(x,y)));
      const angle = this.random() * A.TAU, driftX = Math.cos(angle) * A.unit(mass) * 4, driftY = Math.sin(angle) * A.unit(mass) * 4;
      const stage = host?A.scaleStage(host):this.game.player&&mass===this.game.player.m?A.scaleStage(this.game.player):A.stage(mass);style=style&&A.ENCOUNTERS[style]?style:A.encounterStyle(stage,this.random());
      const field={x,y,r:radius,age:0,name:debris?'Debris nursery':A.ENCOUNTERS[style].name,style,angle,vx:driftX,vy:driftY,z:host?.z??this.game.player?.z??0};this.fields.push(field);
      if (this.fields.length > 28) this.fields.shift();
      if(stage>=9&&!debris){this.stellarField(field,count,mass,host);return;}
      for (let i = 0; i < count && this.bodies.length < this.budget(); i++) {
        const a = this.random() * A.TAU, d = Math.sqrt(this.random()) * radius;
        let lx=Math.cos(a)*d,ly=Math.sin(a)*d*.68;
        if(style==='ribbon'||style==='filament'||style==='stream'){lx=(this.random()-.5)*radius*2;ly=(this.random()-.5)*radius*(style==='stream'?.12:.26);}
        else if(style==='archipelago'){const knot=i%3,ka=knot*A.TAU/3;lx=Math.cos(ka)*radius*.65+lx*.27;ly=Math.sin(ka)*radius*.45+ly*.27;}
        const smallWorld=stage>=9&&stage<15&&(style==='worlds'||style==='nursery')&&i%4!==0;
        const fraction=smallWorld?.00018+this.random()**2*.0045:.018+Math.pow(this.random(),1.4)*.115;
        let spawnMass=mass*fraction,rareWorld=false;
        if(!debris){const q=this.scarcity();if(q.hardcore&&A.stage(spawnMass)>=5){rareWorld=this.random()<=q.worlds;if(!rareWorld)spawnMass=Math.min(spawnMass*.03,5**5*.5);}spawnMass=this.ambientMass(spawnMass);}
        const b=this.make(x+lx*Math.cos(angle)-ly*Math.sin(angle),y+lx*Math.sin(angle)+ly*Math.cos(angle),spawnMass,debris?'debris':'rock');
        b.z=b.pz=host?.z??this.game.player?.z??0;b.vz=host?.vz??this.game.player?.vz??0;
        if(stage>=15){b.form=this.random()<.18?'cluster':'star';b.material='stellar';}else if(this.random()<.12)b.material='ice';
        b.composition=A.Composition.seed(b);b.setMass(b.m);if(!debris&&stage<15)A.Life.decorate(this,b);
        if(!debris)this.rewardRare(b,rareWorld);
        if(!debris&&stage>=15&&i===0){b.form='rock';b.material='ice';b.tag='Preserved icy fragments';A.Life.decorate(this,b);}
        const streamSpeed=style==='stream'?23:style==='filament'?8:4;
        b.vx=driftX*streamSpeed/4+(this.random()-.5)*A.unit(mass)*(style==='stream'?2:7);b.vy=driftY*streamSpeed/4+(this.random()-.5)*A.unit(mass)*(style==='stream'?2:7);
        if(smallWorld&&this.game.player){const p=host||this.game.player,dx=b.x-p.x,dy=b.y-p.y,rd=Math.hypot(dx,dy)||1,v=Math.sqrt(A.Physics.mu(this.game,p)/Math.max(rd,p.r*3))*(.82+this.random()*.35);b.vx=p.vx-dy/rd*v+driftX*.2;b.vy=p.vy+dx/rd*v+driftY*.2;b.name='Rogue world';}
      }
    }
    spawnAI(multiplier) {
      const p = this.game.player, s = A.unit(p.m), a = this.random() * A.TAU, d = (950 + this.random() * 1100) * s;
      const b = this.make(p.x + Math.cos(a) * d, p.y + Math.sin(a) * d, p.m * (multiplier || (.45 + this.random() * 2.25)), 'ai');
      b.name = names[this.aiSerial % names.length] + (this.aiSerial >= names.length ? ' ' + (Math.floor(this.aiSerial / names.length) + 1) : '');
      b.personality = personalities[this.aiSerial++ % personalities.length]; b.grace = 8;b.z=b.pz=p.z||0;
      this.field(b.x + 80 * s, b.y - 60 * s, 16, 110 * s, b.m * .7,false,null,b);
      return b;
    }
    wanderer() {
      const scarcity=this.scarcity();if(scarcity.hardcore&&this.random()>scarcity.worlds)return null;
      const p = this.game.player, s = A.unit(p.m), a = this.random() * A.TAU, d = ((A.scaleStage(p)>=9?1200:650) + this.random() * 1250) * s;
      const b = this.make(p.x + Math.cos(a) * d, p.y + Math.sin(a) * d, this.ambientMass(p.m * (.35 + Math.pow(this.random(), 3) * 4.5)), 'wanderer');
      b.z=b.pz=p.z||0;
      this.rewardRare(b,true);
      b.vx = (this.random() - .5) * 16 * s; b.vy = (this.random() - .5) * 16 * s;
      if(A.scaleStage(p)>=9){b.form=A.scaleStage(p)>=15?'blackhole':'star';b.material='stellar';b.name='Wandering stellar system';b.setMass(b.m);this.field(b.x,b.y,18,280*s,b.m,false,'nursery',b);return;}
      // Satellites start tangentially, so players can encounter genuine orbiting systems.
      for (let i = 0; i < 7; i++) {
        const t = this.random() * A.TAU, r = (55 + this.random() * 85) * A.unit(b.m);
        const v = Math.sqrt(18000 / A.unit(p.m) * b.m / r);
        const moon = this.make(b.x + Math.cos(t) * r, b.y + Math.sin(t) * r, b.m * (.003 + this.random() * .016));
        moon.z=moon.pz=b.z;
        moon.vx = b.vx - Math.sin(t) * v; moon.vy = b.vy + Math.cos(t) * v;
      }
    }
    fragments(parent, mass, count, speed) {
      if (mass <= 0) return;
      const slots = this.budget() - this.bodies.length;
      if (slots <= 0) {
        // Coalesce unresolved dust into an existing fragment instead of allocating beyond the cap.
        const dust = this.bodies.find(b => b.alive && b.kind === 'debris');
        if (dust) { const old = dust.m; dust.vx = (dust.vx * old + parent.vx * mass) / (old + mass); dust.vy = (dust.vy * old + parent.vy * mass) / (old + mass); dust.setMass(old + mass);dust.ore=0; }
        return;
      }
      // Shed matter coalesces into fewer, larger clumps at stellar scale. The same mass is
      // conserved, but dust no longer occupies half the body budget that capturable worlds need.
      const stage = (this.game.player?A.scaleStage(this.game.player):0), stellar = stage >= 9 && stage < 15;
      count = Math.max(1, Math.min(count, stellar ? 2 : 14, slots));
      for (let i = 0; i < count; i++) {
        const a = A.TAU * i / count + this.random() * .3, radius = parent.r * (1.6 + this.random() * .6);
        const b = this.make(parent.x + Math.cos(a) * radius, parent.y + Math.sin(a) * radius, mass / count, 'debris');b.ore=0;b.integrity=100;b.composition={...A.Composition.ensure(parent)};b.setMass(b.m);
        b.z=b.pz=parent.z||0;b.vz=parent.vz||0;
        b.vx = parent.vx + Math.cos(a) * speed * (.5 + this.random() * .5); b.vy = parent.vy + Math.sin(a) * speed * (.5 + this.random() * .5);
        b.grace = 1.3; b.ttl = stellar ? 45 : 75;
      }
    }
    update(dt) {
      const p = this.game.player, s = A.unit(p.m); this.streamIn -= dt; this.eventIn -= dt;
      for (const f of this.fields) {f.age+=dt;f.x+=(f.vx||0)*dt;f.y+=(f.vy||0)*dt;}
      if (this.event) { this.event.time -= dt; if (this.event.time <= 0) this.event = null; }
      if (this.eventIn <= 0) this.celestialEvent();
      if (this.streamIn > 0) return;
      this.streamIn = .85;
      let near = 0, ais = 0, large = 0;const liveIDs=new Set(this.bodies.filter(b=>b.alive).map(b=>b.id));
      this.bodies = this.bodies.filter(b => {
        if (b === p) return true;
        const d = Math.hypot(b.x - p.x, b.y - p.y);
        if (b.kind === 'ai' && b.alive) {
          ais++;
          if (d > Math.max(4400 * s, b.r * 16 + 1400 * s)) { const a = this.random() * A.TAU, distance = Math.max(2200 * s, b.r * 8 + 700 * s); const nx=p.x+Math.cos(a)*distance,ny=p.y+Math.sin(a)*distance;this.game.cosmic?.relocateSystem(b,nx-b.x,ny-b.y);b.x=nx;b.y=ny; b.px = b.x; b.py = b.y; b.trail.length = 0; }
        } else if (!b.parentId && (d > 2800 * s || (b.ttl && b.ttl < .01) || b.m < p.m * 1e-5&&!(b.formationHost&&liveIDs.has(b.formationHost)&&b.m>p.m*1e-10))) b.alive = false;
        if (!b.alive) { this.pool.push(b); return false; }
        if (d < 430 * s && b.m < p.m * .65) near++;
        if (b.kind === 'wanderer') large++;
        return true;
      });
      if(this.game.command?.options.spawning===false)return;
      if (near < (A.scaleStage(p)>=9?12:38)) {
        const heading = Math.hypot(p.vx, p.vy) > 4 * s ? Math.atan2(p.vy, p.vx) : this.random() * A.TAU;
        const a = heading + (this.random() - .5) * 1.7, d = (320 + this.random() * 160) * s;
        this.field(p.x + Math.cos(a) * d, p.y + Math.sin(a) * d, 26, 120 * s, p.m);
      }
      const target = Math.min(this.budget()-50,A.Save.data.settings.quality === 'low' ? 520 : 740);
      if (this.bodies.length < target) {
        const a = this.random() * A.TAU, d = (650 + this.random() * 1500) * s;
        this.field(p.x + Math.cos(a) * d, p.y + Math.sin(a) * d, Math.min(30, target - this.bodies.length), 155 * s, p.m);
      }
      if (ais < 9&&this.game.command?.options.rivals!==false) this.spawnAI();
      const scarcity=this.scarcity(),baseWanderers=A.scaleStage(p)>=15?2:A.scaleStage(p)>=9?3:6,wandererTarget=scarcity.hardcore?Math.max(1,Math.floor(baseWanderers*scarcity.worlds)):baseWanderers;
      if (large < wandererTarget&&this.game.time>(this.wandererReady||0)){this.wandererReady=this.game.time+(A.scaleStage(p)>=9?35:8);this.wanderer();}
      // Far competitors retain mass and use the same finite resources as everyone else.
      const ai = this.bodies.filter(b => b.kind === 'ai');
      const farmer = ai[Math.floor(this.random() * ai.length)];
      if (farmer && this.bodies.length < target + 90) {
        let food = 0; this.hash.query(farmer.x, farmer.y, 250 * A.unit(farmer.m), b => { if (b.m < farmer.m * .6) food++; });
        if (food < 8) this.field(farmer.x + 120 * s, farmer.y, 14, 100 * s, farmer.m * .65,false,null,farmer);
      }
    }
    celestialEvent() {
      const g = this.game, p = g.player, s = A.unit(p.m), a = this.random() * A.TAU, x = p.x + Math.cos(a) * 650 * s, y = p.y + Math.sin(a) * 650 * s;
      this.eventIn = A.scaleStage(p)>=9?150+this.random()*90:95+this.random()*60;
      let n = Math.floor(this.random() * 3);
      const scarcity=this.scarcity();if(n===1&&scarcity.hardcore&&this.random()>scarcity.worlds)n=0;
      if (n === 2 && this.bodies.filter(b => b.alive && b.kind === 'ai').length >= 14) n = 0;
      if (n === 0) {
        this.field(x, y, 65, 175 * s, p.m * 1.3, true);
        this.event = { name: 'Fragmentation bloom', description: 'A rich debris cloud has appeared.', x, y, time: 35, color: '#deb985' };
      } else if (n === 1) {
        const c = this.make(x,y,p.m*(A.scaleStage(p)>=9&&A.scaleStage(p)<15?.001+this.random()*.006:.48),'comet'); c.z=c.pz=p.z||0;c.material='ice';c.composition=A.Composition.seed(c);c.setMass(c.m); c.vx = -Math.sin(a) * 65 * s; c.vy = Math.cos(a) * 65 * s; c.tag = A.scaleStage(p)>=15?'Stellar visitor':A.scaleStage(p)>=9?'Rogue planet' : A.scaleStage(p) >= 7 ? 'Rogue world' : A.scaleStage(p) >= 4 ? 'Wandering moon' : 'Interstellar comet';
        this.rewardRare(c,true);
        this.event = { name: c.tag, description: 'A fast, mass-rich visitor is passing through.', x, y, time: 35, color: '#a4e8f0' };
      } else {
        const b = this.spawnAI(6 + this.random() * 5); b.name = 'Peregrine'; b.personality = 'explorer';
        this.event = { name: 'Rogue gravity well', description: 'A massive wanderer has entered the sector.', x: b.x, y: b.y, time: 35, color: '#ef9b86' };
      }
      g.ui.toast('DEEP-SPACE EVENT', this.event.name + ' · ' + this.event.description, 'gold'); g.audio.play('event');
    }
    cellSize() {
      const p = this.game.player, base = 150 * A.unit(p.m), stage = A.scaleStage(p);
      // Retune on evolution boundaries only: the scan is O(n) and the ideal size is stable within a class.
      if (this.cellStage !== stage || !Number.isFinite(this.cellCache)) { this.cellStage = stage; this.cellCache = this.hash.tune(this.bodies, base); this.cellBase = base; }
      else if (base !== this.cellBase) { this.cellCache *= base / this.cellBase; this.cellBase = base; }
      return this.cellCache;
    }
    rebuild() {
      const p = this.game.player; this.hash.build(this.bodies, this.cellSize());
      this.sources = this.bodies.filter(b => b.alive && (b.kind === 'player' || b.kind === 'ai' || b.kind === 'wanderer'));
      const other = this.bodies.filter(b => b.alive && !['player', 'ai', 'wanderer'].includes(b.kind) && (b.m > p.m * .55 || b.parentId && b.m>p.m*.00003));
      other.sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) / A.unit(a.m) - Math.hypot(b.x - p.x, b.y - p.y) / A.unit(b.m));
      this.sources.push(...other.slice(0, 32));
    }
    restore(data) {
      const unpack = raw => { const d=A.migrateCachePayload(raw),b = this.make(d.x, d.y, d.m, d.kind); Object.assign(b, d); b.setMass(b.m); b.px = b.x; b.py = b.y; b.pz=b.z||0; b.grace = 3; this.nextId = Math.max(this.nextId, b.id + 1); return b; };
      this.game.player = unpack(data.player); for (const b of data.bodies) unpack(b);
      this.aiSerial = this.bodies.filter(b => b.kind === 'ai').length; this.eventIn = Math.max(15, data.eventIn || 60);this.fields=(data.fields||[]).slice(-28).map(f=>({...f}));
      this.random.setState(data.rngState);
      return this.game.player;
    }
  };
})(window.AC);
