'use strict';
(function(A){
  // Fifty procedural species. Only the equipped creature and one lab preview animate.
  A.RARITIES=[{name:'Common',color:'#b9dfcf',water:12,dna:4,time:20},{name:'Uncommon',color:'#78cfd5',water:30,dna:10,time:30},{name:'Rare',color:'#8fabf4',water:80,dna:25,time:45},{name:'Epic',color:'#ce996c',water:200,dna:60,time:90},{name:'Legendary',color:'#eed198',water:600,dna:180,time:180}];
  const names=['Pebble Pup','Moss Mite','Dewdrop','Orbit Otter','Comet Kit','Lichen Loaf','Frost Finch','Bubble Ray','Dust Bunny','Sprout Slug','Mint Moth','Puddle Pip','Crater Crab','Icy Wisp','Moon Mallow','Spore Sprite','Tumble Tardigrade','Silica Snail','Drift Jelly','Fern Fox','Aurora Axolotl','Prism Pip','Cobalt Crab','Vapor Vole','Ring Ray','Nacre Newt','Glacier Gecko','Amber Moth','Ripple Rabbit','Mica Manta','Cloud Caterpillar','Polar Puff','Opal Otter','Lunar Lynx','Nebula Nautilus','Starlace Sprite','Quasar Quill','Velvet Vortex','Iridescent Imp','Eclipse Owl','Sapphire Seraph','Celestial Cuttle','Nova Nymph','Plasma Phoenix','Gravity Griffin','Photon Fox','Stellar Leviathan','Horizon Dragon','Cosmic Bloom','Genesis Guardian'];
  const habitats=['rests in frost-lined pores','drifts on tiny magnetic currents','grows luminous mineral fronds','glides with translucent fins','leaves a trail of soft sparks','curls inside a crystal shell','senses the rhythm of nearby orbits','collects dew on its antennae','unfurls a miniature starlit mantle','naps in pockets of ancient ice'];
  const shapes=[0,1,2,0,13,5,6,3,0,9,8,2,10,4,5,1,11,12,4,13,14,2,10,0,3,14,14,8,0,3,11,5,0,13,12,1,2,5,6,15,8,4,6,16,16,13,17,18,1,19];
  A.PETS=names.map((name,i)=>({id:'pet-'+String(i+1).padStart(2,'0'),name,rarity:i<20?0:i<34?1:i<42?2:i<47?3:4,shape:shapes[i],seed:i,description:'A small cosmic lifeform that '+habitats[i%10]+'.'}));
  A.cleanNickname=value=>typeof value==='string'?Array.from(value.replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g,'').replace(/\s+/g,' ').trim()).slice(0,24).join(''):'';
  A.lifeDefaults=()=>({water:0,dna:0,owned:[],nicknames:{},evolutions:{},equipped:null,eggs:[],samples:0,waterCollected:0});
  A.cleanLife=data=>{const d=Object.assign(A.lifeDefaults(),data||{}),ids=new Set(A.PETS.map(p=>p.id));for(const k of ['water','dna','samples','waterCollected'])d[k]=Number.isFinite(d[k])?A.clamp(Math.floor(d[k]),0,1e9):0;d.owned=Array.isArray(d.owned)?[...new Set(d.owned.filter(id=>ids.has(id)))]:[];d.equipped=d.owned.includes(d.equipped)?d.equipped:null;const nicknames={};for(const id of d.owned){const name=A.cleanNickname(d.nicknames?.[id]);if(name)nicknames[id]=name;}d.nicknames=nicknames;const seen=new Set();d.eggs=Array.isArray(d.eggs)?d.eggs.filter(e=>e&&ids.has(e.id)&&!d.owned.includes(e.id)&&!seen.has(e.id)&&Number.isFinite(e.remaining)&&(seen.add(e.id),true)).slice(0,3).map(e=>{const tier=A.PETS.find(p=>p.id===e.id).rarity,max=A.RARITIES[tier].time,duration=Number.isFinite(e.duration)?A.clamp(e.duration,1,max):[20,30,40,50,60][tier];return{id:e.id,duration,remaining:A.clamp(e.remaining,0,duration)};}):[];const evolutions={};for(const id of d.owned){const e=d.evolutions?.[id];if(e)evolutions[id]={bond:Number.isFinite(e.bond)?A.clamp(e.bond,0,1e7):0,ice:Number.isFinite(e.ice)?A.clamp(e.ice,0,1e7):0,distance:Number.isFinite(e.distance)?A.clamp(e.distance,0,1e7):0,danger:Number.isFinite(e.danger)?A.clamp(e.danger,0,1e7):0,branch:["scout","warden","forager"].includes(e.branch)?e.branch:null,form:["swift","survey","shield","anchor","harvest","tide"].includes(e.form)?e.form:null};}d.evolutions=evolutions;return d;};
  A.PET_BUFFS=[{thrust:.03,gravity:.02,defense:.02},{thrust:.05,gravity:.04,defense:.04},{thrust:.08,gravity:.06,defense:.06},{thrust:.12,gravity:.10,defense:.10},{thrust:.18,gravity:.15,defense:.15}];
  // Each silhouette family carries one secondary passive. Every value feeds a multiplier the
  // simulation already applies, so nothing here needs a new physics path or new save state.
  A.PET_PASSIVES={
    pulse:{name:'Jelly resonance',values:[.08,.13,.19,.26,.35],text:v=>'Gravity pulse occasionally recharges at half cost · '+Math.round(v*100)+'% chance'},
    predict:{name:'Crystalline foresight',values:[5,9,14,20,28],text:v=>'Trajectory forecast extended by '+v+' steps'},
    brake:{name:'Winged trim',values:[.10,.17,.25,.36,.50],text:v=>'Braking response +'+Math.round(v*100)+'%'},
    scan:{name:'Serpentine sense',values:[.10,.16,.24,.34,.48],text:v=>'Icy-body life scanner radius +'+Math.round(v*100)+'%'},
    yield:{name:'Patient grazing',values:[.008,.014,.021,.030,.042],text:v=>'Capture efficiency +'+(v*100).toFixed(1)+' points'},
    harmony:{name:'Many-limbed shepherding',values:[.02,.035,.05,.07,.10],text:v=>'Stable orbits inherit +'+Math.round(v*100)+'% more of your thrust'},
    burn:{name:'Ember metabolism',values:[.10,.17,.25,.36,.50],text:v=>'Escape-burn recharge +'+Math.round(v*100)+'%'}
  };
  A.PET_PASSIVE_SHAPES={3:'pulse',4:'pulse',1:'predict',2:'predict',19:'predict',6:'brake',8:'brake',15:'brake',16:'brake',17:'scan',18:'scan',0:'yield',13:'yield',9:'yield',12:'yield',10:'harmony',11:'harmony',14:'harmony',5:'burn'};
  A.PASSIVE_KEYS=Object.keys(A.PET_PASSIVES);
  A.petPassive=pet=>{const key=A.PET_PASSIVE_SHAPES[pet.shape]||'burn',def=A.PET_PASSIVES[key],value=def.values[pet.rarity];return{key,value,name:def.name,text:def.text(value)};};
  A.petBuffs=pet=>{const b={...A.PET_BUFFS[pet.rarity]};for(const k of A.PASSIVE_KEYS)b[k]=0;const p=A.petPassive(pet);b[p.key]=p.value;b.passive=p;return b;};
  A.petScale=()=>({small:.7,medium:1,large:1.5}[A.Save.data.settings.petSize]||1);
  A.NO_PET_BUFFS=(()=>{const b={thrust:0,gravity:0,defense:0};for(const k of A.PASSIVE_KEYS)b[k]=0;b.passive=null;return b;})();
  A.petBuffText=rarity=>{const b=A.PET_BUFFS[rarity];return 'Thrust +'+Math.round(b.thrust*100)+'% · Gravity +'+Math.round(b.gravity*100)+'% · Collision damage −'+Math.round(b.defense*100)+'%';};
  A.petPassiveText=pet=>{const p=A.petPassive(pet);return p.name+' · '+p.text;};
  // Four procedural incubation bands per rarity, reported at roughly 25/50/75/100% complete.
  A.EGG_FLAVOUR=[
    ['The shell is cool and quiet','A slow pulse answers your gravity','Traces of warmth inside the shell','Small deliberate movements within','Ready: something is waiting'],
    ['Condensation beads on the shell','Faint tidal ripples cross the surface','A steady warmth has settled inside','The shell flexes with each turn','Ready: it is pressing outward'],
    ['Mineral veins begin to brighten','Light moves under the surface','A clear rhythm has taken hold','Bright filaments trace the shell','Ready: the shell is thinning'],
    ['The shell hums at a low frequency','Interference patterns bloom and fade','Layered signals, strengthening','An intricate structure is resolving','Ready: the hum has become a voice'],
    ['Something vast is folded very small','The shell bends light around itself','A strong biosignature is forming','A strong biosignature, almost ready','Ready: it already knows your orbit']
  ];
  A.Life=class{
    constructor(game){this.game=game;this.pendingWater=0;this.pendingDNA=0;this.pendingRaw=0;this.clock=0;this.x=game.player?.x||0;this.y=game.player?.y||0;this.vx=0;this.vy=0;this.scan=[];this.scanIn=0;this.filter='all';}
    static decorate(world,b){if(b.material!=='ice')return;b.composition=A.Composition.seed(b);b.setMass(b.m);b.water=1+Math.floor(world.random()*2);b.dna=world.random()<.20?1:0;b.lifeClaimed=false;}
    receive(water,dna,raw=0){const sample=this.game.industry?.samples(water,dna)||{water,dna};this.pendingWater+=sample.water;this.pendingDNA+=sample.dna;if(this.game.difficulty==='hardcore')this.pendingRaw+=raw;return sample;}
    collect(b){if(!b.alive||b.lifeClaimed||!(b.water>0||b.rawPayload>0))return false;b.lifeClaimed=true;const g=this.game,raw=g.difficulty==='hardcore'?(b.rawPayload||0):0,sample=this.receive(b.water||0,b.dna||0,raw);b.rawPayload=0;g.effects.label(b.x,b.y,'+'+sample.water+' WATER'+(sample.dna?'  +'+sample.dna+' DNA':'')+(raw?'  +'+raw+' RAW':''),raw?'#d8bd7c':b.dna?'#b9dfcf':'#8dcddd',null,b.z||0);g.audio.play('sample',b.dna?.7:.2);return true;}
    commit(){if(!this.pendingWater&&!this.pendingDNA&&!this.pendingRaw)return false;const d=A.Save.data.lifeLab;d.water+=this.pendingWater;d.waterCollected+=this.pendingWater;d.dna+=this.pendingDNA;d.samples+=this.pendingDNA;if(this.pendingRaw&&this.game.industry){const i=this.game.industry,added=Math.min(this.pendingRaw,1e7-i.raw);if(added>0)i.deposit(added);}this.pendingWater=0;this.pendingDNA=0;this.pendingRaw=0;return true;}
    // Called from mu(), input.update() and the HUD every frame, so the resolved table is cached
    // per equipped companion rather than rebuilt on each lookup.
    buffs(){const d=A.Save.data.lifeLab,id=d.owned.includes(d.equipped)?d.equipped:null;
      if(this.buffId!==id){this.buffId=id;const p=id&&this.recipe(id);this.buffTable=p?A.petBuffs(p):A.NO_PET_BUFFS;}
      return this.buffTable;}
    passive(){return this.buffs().passive;}
    eggStatus(e){const pet=this.recipe(e.id);if(!pet)return '';const duration=e.duration||A.RARITIES[pet.rarity].time,progress=A.clamp(1-e.remaining/duration,0,1);
      const band=e.remaining<=0?4:progress<.25?0:progress<.5?1:progress<.75?2:3;return A.EGG_FLAVOUR[pet.rarity][band];}
    recipe(id){return A.PETS.find(p=>p.id===id);}
    displayName(id){return A.Save.data.lifeLab.nicknames?.[id]||this.recipe(id)?.name||'';}
    rename(value){const d=A.Save.data.lifeLab,id=d.equipped;if(!id||!d.owned.includes(id))return false;const name=A.cleanNickname(value);d.nicknames||={};if(name)d.nicknames[id]=name;else delete d.nicknames[id];A.Save.write();return true;}
    static wheelTier(value){return value<.59?0:value<.94?2:value<.99?3:4;}
    spin(){const d=A.Save.data.lifeLab,ui=this.game.ui;if(ui.wheelTime>0||d.eggs.length>=3||d.water<500||d.dna<100||d.owned.length===50)return false;
      const roll=Math.random(),tier=A.Life.wheelTier(roll),pool=A.PETS.filter(p=>(tier===0?p.rarity<=1:p.rarity===tier)&&!d.owned.includes(p.id)&&!d.eggs.some(e=>e.id===p.id));
      ui.wheelTime=A.Save.data.settings.reducedMotion?.1:2.4;const angle=roll*360;ui.wheelAngle=Math.ceil((ui.wheelAngle||0)/360)*360+1800+360-angle;
      if(!pool.length){ui.wheelResult='This sector is complete or already incubating. No resources spent.';return true;}
      const p=pool[Math.floor(Math.random()*pool.length)],duration=A.RARITIES[p.rarity].time;d.water-=500;d.dna-=100;d.eggs.push({id:p.id,remaining:duration,duration});A.Save.write();ui.wheelResult=p.name+' · '+A.RARITIES[p.rarity].name+' · Egg placed in incubation';this.game.audio.play('egg');return true;
    }
    craft(id){const p=this.recipe(id),d=A.Save.data.lifeLab;if(!p||d.owned.includes(id)||d.eggs.some(e=>e.id===id)||d.eggs.length>=3)return false;const r=A.RARITIES[p.rarity];if(d.water<r.water||d.dna<r.dna)return false;d.water-=r.water;d.dna-=r.dna;d.eggs.push({id,remaining:r.time,duration:r.time});A.Save.write();this.game.audio.play('egg');return true;}
    hatch(id){const d=A.Save.data.lifeLab,i=d.eggs.findIndex(e=>e.id===id&&e.remaining<=0);if(i<0||d.owned.includes(id))return false;d.eggs.splice(i,1);d.owned.push(id);if(!d.equipped)d.equipped=id;this.buffId=undefined;
      // Hatching is guarded by the owned-set above, so this counts exactly once per companion per slot.
      const life=A.Save.data.lifetime;life.lifetimeHatched=(life.lifetimeHatched||0)+1;
      A.Save.achievement('companion',this.game);if(d.owned.length===50)A.Save.achievement('lifeArchive',this.game);
      if((this.game.cosmic?.summary?.stablePlanets||0)>=3)A.Save.achievement('symbiosis',this.game);
      this.checkRarityComplete();A.Save.write();this.game.audio.play('hatch');this.game.ui.toast('A NEW COMPANION',this.recipe(id).name+' is ready to explore.','aqua');return true;}
    equip(id){const d=A.Save.data.lifeLab;if(id!==null&&!d.owned.includes(id))return false;d.equipped=id;this.buffId=undefined;
      if(id&&this.recipe(id)?.rarity===4)A.Save.achievement('legendaryBond',this.game);
      A.Save.write();return true;}
    checkRarityComplete(){const owned=new Set(A.Save.data.lifeLab.owned);
      for(let tier=0;tier<A.RARITIES.length;tier++){const all=A.PETS.filter(p=>p.rarity===tier);
        if(all.length&&all.every(p=>owned.has(p.id))){A.Save.achievement('rarityComplete',this.game);return true;}}
      return false;}
    update(dt){const g=this.game,p=g.player,d=A.Save.data.lifeLab;this.clock+=dt;for(const e of d.eggs){const old=e.remaining;e.remaining=Math.max(0,e.remaining-dt);if(old>0&&e.remaining===0){g.ui.toast('DNA EGG READY',this.recipe(e.id).name+' · Open Life Lab [N] to hatch.','gold');g.audio.play('egg');}}
      if(this.pendingWater||this.pendingDNA||this.pendingRaw){A.Save.checkpoint(g);if(d.samples>0)A.Save.achievement('biosignature',g);}
      const s=A.unit(p.m),angle=this.clock*.35;
      // The orbit scales with A.unit(p.m), so at stellar mass it would sit far off screen.
      // Convert the comfortable pixel band back into world units before placing the target.
      const zoom=g.renderer?.camera?.zoom||1,cap=A.clamp(72/Math.max(zoom,1e-6),0,Infinity);
      const distance=Math.min(p.r+48*s,Math.max(p.r*1.35,cap));
      const tx=p.x+Math.cos(angle)*distance,ty=p.y+Math.sin(angle)*distance*.62;const f=1-Math.exp(-dt*2.5);this.x=A.lerp(this.x,tx,f);this.y=A.lerp(this.y,ty,f);
      const reach=(d.equipped?650*(1+(this.buffs().scan||0)):330)*s;
      this.scanIn-=dt;if(this.scanIn<=0){this.scanIn=.25;this.scan.length=0;g.world.hash.query(p.x,p.y,reach,b=>{if(b.alive&&!b.lifeClaimed&&b.water>0&&Math.hypot(b.x-p.x,b.y-p.y)<=reach&&this.scan.length<32)this.scan.push(b);});}
    }
    static paint(c,p,x,y,size,time=0,accessory='none'){
      const rawHue=(p.seed*137.5+155)%360,h=rawHue>245&&rawHue<325?185:rawHue,t=time*1.8+p.seed,breathe=Math.sin(t)*.7,accent=A.RARITIES[p.rarity].color;
      c.save();c.translate(x,y+breathe*size/28);c.scale(size/28,size/28);c.lineJoin='round';c.lineCap='round';
      const shade=(x,y,r,light=66)=>{const g=c.createRadialGradient(x-r*.3,y-r*.45,1,x,y,r);g.addColorStop(0,'hsl('+h+',55%,'+light+'%)');g.addColorStop(.5,'hsl('+h+',43%,35%)');g.addColorStop(1,'hsl('+((h+30)%360)+',50%,12%)');return g;};
      const oval=(x,y,rx,ry,a=0,light=66)=>{c.beginPath();c.ellipse(x,y,rx,ry,a,0,A.TAU);c.fillStyle=shade(x,y,Math.max(rx,ry),light);c.fill();c.strokeStyle='hsla('+h+',70%,78%,.55)';c.lineWidth=.65;c.stroke();};
      const line=(points,color,width=1)=>{c.beginPath();c.moveTo(...points[0]);for(let i=1;i<points.length;i++)c.lineTo(...points[i]);c.strokeStyle=color;c.lineWidth=width;c.stroke();};
      const poly=(points,light=65)=>{c.beginPath();c.moveTo(...points[0]);for(let i=1;i<points.length;i++)c.lineTo(...points[i]);c.closePath();c.fillStyle=shade(0,-3,40,light);c.fill();c.strokeStyle=accent;c.lineWidth=.65;c.stroke();};
      const gem=(x,y,r)=>{poly([[x,y-r],[x+r*.7,y],[x,y+r],[x-r*.7,y]],85);line([[x,y-r],[x,y+r]],'#ffffff80',.5);};
      const eyes=(x,y,w=6)=>{for(const d of [-1,1]){oval(x+d*w,y,3.8,2.8,d*-.2,20);c.fillStyle=accent;c.beginPath();c.ellipse(x+d*w,y,1,2,0,0,A.TAU);c.fill();c.fillStyle='#fff';c.fillRect(x+d*w-.7,y-1.4,.8,.8);}};
      const wing=(d,phoenix=false)=>{for(let i=4;i>=0;i--){const lift=Math.sin(t)*4,xx=d*(20+i*4);poly([[d*6,1],[xx,-27+i*3+lift],[d*(30+i*2),-7+i*5],[d*12,12]],45+i*5);line([[d*8,1],[xx,-23+i*3+lift]],accent,.5);}if(phoenix)for(let i=-1;i<=1;i++)poly([[i*4,12],[i*9+Math.sin(t+i)*3,37-Math.abs(i)*5],[i*4+3,13]],80);};
      // Articulated silhouettes share a shaded material, not a flat face stamp.
      switch(p.shape){
        case 0:case 13:{
          c.beginPath();c.moveTo(-12,7);c.bezierCurveTo(-37,17,-39,-8+Math.sin(t)*5,-23,-16);c.bezierCurveTo(-28,0,-20,0,-8,3);c.fillStyle=shade(-25,0,22);c.fill();
          for(const d of [-1,1])for(let j=0;j<2;j++){const xx=d*(j?14:7),yy=14+Math.sin(t+j+d)*2;line([[xx,5],[xx+d*3,yy],[xx+d*6,yy+2]],'#37676b',5);oval(xx+d*6,yy+2,4,2);}
          oval(-3,1,20,11,-.15);oval(12,-6,12,11,.1);poly([[3,-12],[3,-29],[13,-15]],80);poly([[17,-14],[25,-26],[23,-7]],75);oval(21,-1,7,5);eyes(15,-7,5);line([[7,0],[12,3]],accent,1);break;}
        case 6:case 8:case 15:case 16:{wing(-1,p.shape===16);wing(1,p.shape===16);oval(0,0,10,17);oval(0,-13,12,10);poly([[-11,-17],[-14,-28],[-3,-21]],80);poly([[11,-17],[14,-28],[3,-21]],80);eyes(0,-14);poly([[-2,-8],[0,-3],[3,-8]],90);for(let i=0;i<3;i++)gem(0,i*6,2);break;}
        case 3:{poly([[0,-20],[-13,-8],[-42,-15-Math.sin(t)*5],[-22,13],[-7,10],[0,20],[7,10],[22,13],[42,-15-Math.sin(t)*5],[13,-8]],75);c.beginPath();c.moveTo(0,12);c.bezierCurveTo(19,29,-15,38,Math.sin(t)*10,43);c.strokeStyle=accent;c.lineWidth=2;c.stroke();oval(0,-3,8,17);eyes(0,-11,4);for(const d of [-1,1])for(let i=0;i<3;i++)line([[d*5,-7+i*5],[d*(32-i*4),-8+i*6]],accent,.6);break;}
        case 4:case 7:{for(let i=-3;i<=3;i++){c.beginPath();c.moveTo(i*4,3);c.bezierCurveTo(i*9,16,i*3+Math.sin(t+i)*8,33,i*7+Math.sin(t+i)*6,37);c.strokeStyle=i%2?accent:'hsla('+h+',65%,66%,.7)';c.lineWidth=i%2?1.1:2.2;c.stroke();}oval(0,-6,21,17);c.globalAlpha=.7;oval(0,-7,8,11,0,90);c.globalAlpha=1;line([[-20,3],[-10,7],[0,8],[10,7],[20,3]],accent,2);gem(0,-8,5);break;}
        case 17:case 18:{if(p.shape===18){wing(-1);wing(1);}for(let i=13;i>=0;i--){const xx=Math.sin(t*.55+i*.37)*15,yy=-17+i*3.5;oval(xx,yy,Math.max(1,10-i*.58),Math.max(1,7-i*.35),-.25);if(i%2===0)gem(xx,yy-3,2.3-i*.1);}const xx=Math.sin(t*.55)*15;oval(xx,-20,12,9);poly([[xx-8,-25],[xx-14,-36],[xx-2,-26]],90);poly([[xx+8,-25],[xx+14,-36],[xx+2,-26]],90);eyes(xx,-21);break;}
        case 10:case 11:case 14:{for(const d of [-1,1])for(let i=0;i<4;i++){const yy=i*6-10;line([[d*9,yy],[d*(22-i),yy+Math.sin(t+i)*3],[d*26,yy+6]],accent,1.6);oval(d*(22-i),yy,2,2);}oval(0,3,16,18);for(let i=0;i<4;i++)line([[-12,i*6-7],[0,i*6-4],[12,i*6-7]],accent,.6);oval(0,-14,11,9);eyes(0,-15,5);if(p.shape===10)for(const d of [-1,1]){oval(d*23,-19,7,9,d*.5);poly([[d*25,-20],[d*29,-32],[d*20,-25]],75);}else if(p.shape===14)for(const d of [-1,1])for(let i=0;i<3;i++)line([[d*9,-14],[d*(21+i*3),-24+i*8],[d*(24+i*3),-27+i*8]],accent,1.8);break;}
        case 12:case 9:{oval(0,11,25,7);oval(16,1,8,11);for(const d of [-1,1]){line([[16+d*4,-3],[17+d*7,-19+Math.sin(t)*2]],accent,1.4);oval(17+d*7,-19+Math.sin(t)*2,2,2);}if(p.shape===12){oval(-5,-2,19,20);const pts=[];for(let i=0;i<80;i++){const a=i*.15,rad=i*.19;pts.push([-5+Math.cos(a)*rad,-2+Math.sin(a)*rad]);}line(pts,accent,1);}else for(let i=0;i<5;i++)gem(-16+i*6,3,4);break;}
        case 1:{for(let layer=1;layer>=0;layer--)for(let i=0;i<7;i++){const a=i*A.TAU/7+layer*.45+Math.sin(t*.3)*.1;c.save();c.rotate(a);oval(0,-(14+layer*7),6+layer*2,13,Math.sin(t+i)*.1,70);line([[0,-8],[0,-32]],accent,.4);c.restore();}oval(0,0,10,10,0,85);gem(0,0,7);break;}
        case 2:{for(let i=0;i<7;i++){c.save();c.rotate(i*A.TAU/7+Math.sin(t*.3)*.08);gem(0,-19,9+(i%2)*4);c.restore();}oval(0,0,9,10,0,90);gem(0,0,8);break;}
        case 19:{for(const d of [-1,1]){poly([[d*7,-16],[d*21,-27],[d*28,-9],[d*16,14],[d*8,9]],65);poly([[d*8,9],[d*21,20+Math.sin(t)*2],[d*15,31],[d*5,18]],55);}oval(0,0,11,18);gem(0,0,9);poly([[-8,-19],[0,-30],[8,-19],[0,-14]],90);c.strokeStyle=accent;c.lineWidth=.7;c.beginPath();c.ellipse(0,0,32,10,Math.sin(t*.3)*.4,0,A.TAU);c.stroke();break;}
        default:{for(let i=0;i<8;i++){const a=i*A.TAU/8;oval(Math.cos(a)*12,Math.sin(a)*9,9,10,a,60+i*3);}oval(0,0,15,12);eyes(0,-3);poly([[-10,-9],[-8,-24],[-3,-12]],80);poly([[10,-9],[8,-24],[3,-12]],80);}
      }
      if(p.rarity>=2){const count=p.rarity+1;c.globalAlpha=.75;for(let i=0;i<count;i++){const a=t*.35+i*A.TAU/count,xx=Math.cos(a)*36,yy=Math.sin(a)*25;line([[xx-1.5,yy],[xx+1.5,yy]],accent,.8);line([[xx,yy-1.5],[xx,yy+1.5]],accent,.8);}}
      if(accessory==='charm'){line([[4,12],[7,22]],'#e9d6a1',1.2);gem(7,23,4);}
      if(accessory==='frond'){for(const d of [-1,1]){line([[d*5,-18],[d*10,-27],[d*16,-31]],'#a8d4b3',1);for(let i=0;i<3;i++)oval(d*(9+i*3),-24-i*3,4,1.5,d*.6,75);}}
      if(accessory==='halo'){c.strokeStyle='#f0dda3';c.lineWidth=1.3;c.beginPath();c.ellipse(0,-34,18,5,-.1,0,A.TAU);c.stroke();}
      if(accessory==='crest')poly([[-9,-26],[-12,-38],[-3,-32],[0,-42],[4,-32],[12,-38],[9,-26]],90);
      if(accessory==='ribbon'){poly([[-14,7],[-27,20],[-17,20],[-22,28],[-6,11]],78);poly([[14,7],[27,20],[17,20],[22,28],[6,11]],78);gem(0,13,4);}
      c.restore();
    }
    static thumbnail(p){A.Life.thumbs||=new Map();if(!A.Life.thumbs.has(p.id+"-"+(p.evolved||""))){const c=document.createElement('canvas');c.width=144;c.height=112;A.Life.paint(c.getContext('2d'),p,72,51,31);if(A.Life.thumbs.size>=80)A.Life.thumbs.delete(A.Life.thumbs.keys().next().value);A.Life.thumbs.set(p.id+"-"+(p.evolved||""),c.toDataURL());}return A.Life.thumbs.get(p.id+"-"+(p.evolved||""));}
    draw(c,r){const g=this.game,p=g.player;if(!p||g.state==='menu')return;const d=A.Save.data.lifeLab;c.save();c.font='9px monospace';let n=0;
      // A healthy system and an active companion reinforce each other: markers brighten and breathe
      // while the system-stability bonus is paying out. Purely visual, no extra save state.
      const reinforced=d.equipped&&(g.cosmic?.bonus||0)>0,pulse=reinforced&&!A.Save.data.settings.reducedMotion?.78+.22*Math.sin(this.clock*2.1):1;
      for(const b of g.photo?.active&&!g.photo.labels?[]:this.scan){if(!b.alive||b.lifeClaimed||n++>20)continue;const q=r.bodyPoint(b),rad=Math.max(5,b.r*r.camera.zoom);if(q.x<-20||q.x>r.w+20||q.y<-20||q.y>r.h+20)continue;c.strokeStyle=b.dna?'#b9dfcf':'#8dcddd';c.globalAlpha=A.clamp((reinforced?.95:.7)*pulse,0,1);c.lineWidth=reinforced?1.4:1;c.beginPath();c.arc(q.x,q.y,rad+5,0,A.TAU);c.stroke();
        if(reinforced){c.globalAlpha=A.clamp(.22*pulse,0,1);c.beginPath();c.arc(q.x,q.y,rad+9,0,A.TAU);c.stroke();}
        c.lineWidth=1;c.globalAlpha=A.clamp((reinforced?.95:.7)*pulse,0,1);
        if(b.dna||rad>5){c.fillStyle=c.strokeStyle;c.fillText(b.hardcoreCache?'CACHE · DNA + H₂O'+(b.rawPayload?' + '+b.rawPayload+' RAW':''):b.dna?'DNA + H₂O':'H₂O',q.x+rad+9,q.y+3);}}
      const pet=this.visualRecipe(d.equipped);
      // The portrait is the most expensive per-frame vector draw here, so it follows the same
      // adaptive-detail gate as every other decorative layer.
      const detail=Math.min(g.detail||1,A.Save.data.settings.quality==='low'?.5:1);
      if(pet&&detail>.42){const q=r.screen(this.x,this.y,p.z||0);const size=A.clamp(19*r.camera.zoom*A.unit(p.m),9,24)*A.petScale();A.Life.paint(c,pet,q.x,q.y,size,A.animationEnabled('Companions')?this.clock:0,A.cosmeticEquipped('companion'));
        if(!g.hudHidden&&A.Save.data.settings.companionLabel!==false&&(!g.photo?.active||g.photo.labels)){c.globalAlpha=.7;c.fillStyle=A.RARITIES[pet.rarity].color;const left=q.x<r.bodyPoint(p).x;c.textAlign=left?'right':'left';c.fillText(this.displayName(pet.id),q.x+(left?-1:1)*size*.6,q.y+size*1.7+10);}}
      c.restore();}
  };
})(window.AC);
