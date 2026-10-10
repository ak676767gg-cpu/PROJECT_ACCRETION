/* ACCRETION ; no imports, requests, build tools, or external assets. */
'use strict';
window.AC = {};
(function (A) {
  A.VERSION = '4.0.0';
  A.animationEnabled=kind=>!A.Save?.data.settings.reducedMotion&&A.Save?.data.settings['anim'+kind]!==false;
  A.cpuScale=()=>({eco:.48,balanced:.72,full:1}[A.Save?.data.settings.cpuBudget]||1);
  A.COMMAND_SETTINGS={resolution:'auto',cpuBudget:'full',shaderMode:'balanced',frameLimit:60,textureDetail:'high',gasDetail:'high',animPlanets:true,animClouds:true,animHorizon:true,animNebula:true,animHardware:true,animCompanions:true,animEvents:true,animTaunts:true,showTaunts:true,sharedMedia:false};
  A.cleanCommandSettings=s=>{const choices={resolution:['auto','native','2160','1440','1080','900','720','540','360'],cpuBudget:['eco','balanced','full'],shaderMode:['off','balanced','high'],textureDetail:['low','medium','high'],gasDetail:['off','low','high']};for(const [k,v]of Object.entries(A.COMMAND_SETTINGS))if(typeof v==='boolean')s[k]=s[k]!==false;else if(choices[k]&&!choices[k].includes(s[k]))s[k]=v;s.frameLimit=s.frameLimit==='unlimited'?245:Number.isFinite(Number(s.frameLimit))?Math.max(30,Math.min(245,Math.round(Number(s.frameLimit)/5)*5)):60;s.sharedMedia=s.sharedMedia===true;return s;};
  A.frameCap=()=>Number(A.Save.data.settings.frameLimit)===245?0:Number(A.Save.data.settings.frameLimit)||60;
  A.cleanTaunts=list=>Array.from({length:4},(_,i)=>{const q=Array.isArray(list)?list[i]:null,text=typeof q?.text==='string'?q.text.replace(/[\u0000-\u001f\u007f<>]/g,'').slice(0,96):['Good orbit.','Catch me if you can.','Mining this sector.','Need backup.'][i],media=typeof q?.media==='string'&&q.media.length<=132000&&/^data:image\/(png|jpeg|gif|webp);base64,[A-Za-z0-9+/=]+$/.test(q.media)?q.media:'';return{text,media,shape:['speech','angular','banner','circle'].includes(q?.shape)?q.shape:'speech'};});
  // Old unclaimed Hardcore RP caches retain their value as the centre's 50-raw recipe.
  // Already earned Research Points are untouched; only pending physical payloads migrate.
  A.migrateCachePayload = data => {
    if(!data||typeof data!=='object'||!Object.hasOwn(data,'researchPayload'))return data;
    const old=data.researchPayload,valid=Number.isInteger(old)&&old>=0&&old<=10000;
    const raw=data.rawPayload!==undefined?data.rawPayload:data.lifeClaimed?0:valid?old*50:NaN;
    const converted={...data,rawPayload:raw};delete converted.researchPayload;
    if(converted.hardcoreCache&&typeof converted.tag==='string'&&converted.tag.startsWith('Hardcore cache ·'))converted.tag='Hardcore cache · '+raw+' RAW';
    return converted;
  };
  A.DIFFICULTIES = Object.freeze({ standard:{cohesion:100}, relaxed:{cohesion:100}, hardcore:{cohesion:50} });
  A.cohesionLimit = game => (A.DIFFICULTIES[game.difficulty] || A.DIFFICULTIES.standard).cohesion;
  // Shared, scale-relative propulsion profile for every astronomical class.
  A.FLIGHT = Object.freeze({ acceleration:48, cruise:155, boost:275 });
  A.TAU = Math.PI * 2;
  A.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  A.lerp = (a, b, t) => a + (b - a) * t;
  A.ease = (rate, dt) => 1 - Math.exp(-rate * dt);
  A.rng = function (seed) {
    let s = seed >>> 0;
    const random = () => { s = (s + 0x6D2B79F5) >>> 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    random.getState = () => s; random.setState = value => { if (Number.isFinite(value)) s = value >>> 0; }; return random;
  };
  A.unit = m => Math.pow(Math.max(0.000001, m), 0.25);
  A.radius = m => m >= 5**15 ? 22*A.unit(m) : 12 * Math.pow(Math.max(0.000001, m), 0.30);
  A.stage = m => Math.max(0, Math.floor(Math.log(Math.max(1, m)) / Math.log(5) + 1e-9));
  const E = 5.9722e24, J = 1.89813e27, S = 1.98847e30;
  A.STAGES = [
    ['Tiny asteroid', 1e6, '#b9b5a5', 'A fragment with an extraordinary future.', 'rock'],
    ['Growing asteroid', 1e10, '#c0b6a5', 'A rubble pile begins to hold together.', 'rock'],
    ['Massive asteroid', 1e15, '#bdad91', 'Your gravity is shaping the field.', 'rock'],
    ['Dwarf planet', 9.3835e20, '#c4ad92', 'Stone settles into a world.', 'dwarf'],
    ['Moon-scale body', 7.342e22, '#d5d5cc', 'A familiar landmark in an unfamiliar sky.', 'moon'],
    ['Terrestrial planet', E, '#82bfc5', 'An atmosphere gathers at the edge of space.', 'planet'],
    ['Super-Earth', 5 * E, '#9cbeb5', 'A vast, restless world of rock and cloud.', 'planet'],
    ['Gas giant', J, '#d6b184', 'Cloud bands wrap a deep ocean of gas.', 'gas'],
    ['Brown dwarf', 13 * J, '#eb8964', 'A warm ember at the boundary of starlight.', 'brown'],
    ['Red dwarf star', 0.08 * S, '#ffae83', 'Hydrogen ignites. Your first stellar light.', 'star'],
    ['Sun-like star', S, '#ffe9ad', 'A luminous heart in the dark.', 'star'],
    ['Massive star', 8 * S, '#c8e6ff', 'Your light crosses a field of worlds.', 'star'],
    ['Blue supergiant', 25 * S, '#a8d5ff', 'An immense, brilliant stellar body.', 'star'],
    ['Stellar titan', 80 * S, '#c1d9ff', 'Entire systems fall into your influence.', 'star'],
    ['Stellar colossus', 150 * S, '#e5eaff', 'The threshold of gravitational collapse.', 'star'],
    ['Stellar-origin black hole',200*S,'#ffd8a0','A dark horizon surrounded by luminous matter.','blackhole'],
    ['Intermediate-mass black hole',1e4*S,'#ffd8a0','Star clusters feed your expanding gravity well.','blackhole'],
    ['Massive black hole',1e5*S,'#ffe6c0','Follow galactic rivers of dust and starlight.','blackhole'],
    ['Supermassive black hole',1e6*S,'#fff0d0','A galactic heart begins to form.','blackhole'],
    ['Galactic-core black hole',1e8*S,'#fff0dc','Whole stellar regions cross your horizon.','blackhole'],
    ['Ultramassive black hole',1e10*S,'#ffffff','Beyond the familiar cosmic frontier.','blackhole'],
    ['The Interstallar',5e10*S,'#fff2d7','A final horizon. Rivers of light turn around the darkness.','blackhole','interstallar']
  ].map((s, i) => ({ name: s[0], kg: s[1], color: s[2], description: s[3], type: s[4], visual:s[5]||'', threshold: Math.pow(5, i) }));
  A.FINAL_STAGE = A.STAGES.length - 1;
  // Mass continues to grow after the final named class, with continuous display units.
  A.classFor = m => { const n = A.stage(m),last=A.STAGES[A.FINAL_STAGE]; return A.STAGES[n] || { ...last, threshold: Math.pow(5, n), kg: last.kg * Math.pow(2, n - A.FINAL_STAGE) }; };
  A.scaleStage = b => A.Supernova?.scaleStage(b) ?? A.stage(b.m);
  A.kg = m => { if (m < 1) return Math.max(0, m) * A.STAGES[0].kg; if(m>=A.STAGES[A.STAGES.length-1].threshold){const last=A.STAGES[A.STAGES.length-1];return last.kg*m/last.threshold;}const n = A.stage(m), a = A.classFor(m), b = A.classFor(Math.pow(5, n + 1)); return a.kg * Math.pow(b.kg / a.kg, A.clamp(Math.log(Math.max(1, m) / a.threshold) / Math.log(5), 0, 1)); };
  A.formatKg = kg => {
    const num = v => v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2);
    if (kg >= S * 0.075) return num(kg / S) + ' M⊙';
    if (kg >= J * 0.1) return num(kg / J) + ' M_J';
    if (kg >= E * 0.1) return num(kg / E) + ' M⊕';
    if (kg >= 7.342e22 * 0.1) return num(kg / 7.342e22) + ' Moon masses';
    if (kg >= 1e12) return kg.toExponential(2).replace('e+', ' × 10^') + ' kg';
    if (kg >= 1e9) return num(kg / 1e9) + ' million tonnes';
    return Math.round(kg).toLocaleString('en-US') + ' kg';
  };
  A.massText = m => A.formatKg(A.kg(m));
  A.timeText = s => Math.floor(s / 60).toString().padStart(2, '0') + ':' + Math.floor(s % 60).toString().padStart(2, '0');
  A.achievementDefs = {
    first: ['First Capture', 'Absorb your first asteroid.'],
    moon: ['Moon Maker', 'Reach moon-scale mass.'], planet: ['Planetary', 'Become a terrestrial planet.'],
    gas: ['Gas Giant', 'Reach gas-giant scale.'], star: ['Stellar Birth', 'Become a star.'],
    well: ['Gravity Well', 'Bind five smaller bodies at once.'],
    escape: ['David vs Goliath', 'Escape the gravity of a body at least four times your simulation mass.'],
    predator: ['Cosmic Predator', 'Absorb a rival with at least 35% of your simulation mass.'],
    traveller: ['Void Voyager', 'Survive for twenty minutes.'], titan: ['A Larger Light', 'Become a massive star.']
  };
  // Cosmetic catalogues and optional goals live in the same offline namespace.
  // None of these rewards alters movement, gravity, resources or rarity odds.
  A.COSMETICS={
    mark:[
      {id:'none',name:'Unmarked',note:'Keep your original body appearance.',icon:'rock'},
      {id:'capture',name:'Capture sigil',note:'A small engraved orbit on your body.',icon:'orbit',achievement:'first'},
      {id:'survey',name:'Survey lines',note:'Fine chart lines around your surface.',icon:'chart',achievement:'charted'},
      {id:'keeper',name:'Worldkeeper crest',note:'Three quiet arcs remember the worlds you kept.',icon:'system',achievement:'system'},
      {id:'architect',name:'Architect marks',note:'A geometric crest earned through an orbital blueprint.',icon:'resonance',achievement:'architect'},
      {id:'legacy',name:'Legacy crown',note:'A restrained crest for your next beginning.',icon:'sun',rank:1}
    ],
    companion:[
      {id:'none',name:'Natural',note:'Your companion without an accessory.',icon:'pet'},
      {id:'charm',name:'Orbit charm',note:'A small brass ornament above the companion.',icon:'orbit',achievement:'companion'},
      {id:'frond',name:'Living frond',note:'Two luminous mineral leaves.',icon:'dna',achievement:'biosignature'},
      {id:'halo',name:'Legendary halo',note:'A thin halo for an extraordinary bond.',icon:'sun',achievement:'legendaryBond'},
      {id:'crest',name:'Archive crest',note:'A tiny mantle for a complete collection.',icon:'pet',achievement:'lifeArchive'},
      {id:'ribbon',name:'Expedition ribbon',note:'A silver ribbon carried into later journeys.',icon:'chart',rank:2}
    ],
    frame:[
      {id:'brass',name:'Engraved brass',note:'The original advancement frame.',icon:'rock'},
      {id:'silver',name:'Lunar silver',note:'A silver frame earned at moon scale.',icon:'moon',achievement:'moon'},
      {id:'verdigris',name:'Orbital patina',note:'A weathered green and bronze frame.',icon:'orbit',achievement:'orbit'},
      {id:'solar',name:'Solar gold',note:'A warm frame for your first stellar light.',icon:'star',achievement:'star'},
      {id:'horizon',name:'Horizon alloy',note:'A dark engraved surround and pale lettering.',icon:'binary',achievement:'merger'},
      {id:'ivory',name:'Legacy ivory',note:'An ivory and gold frame for three expeditions.',icon:'sun',rank:3}
    ]
  };
  A.cosmeticAvailable=(category,id,d=A.Save?.data)=>{const q=A.COSMETICS[category]?.find(v=>v.id===id);return !!q&&(!q.achievement||d?.achievements?.includes(q.achievement))&&(!q.rank||(d?.legacy?.rank||0)>=q.rank);};
  A.cosmeticEquipped=category=>{if(category==='frame')return A.interfaceTheme();const id=A.Save?.data.cosmetics?.[category];return A.cosmeticAvailable(category,id)?id:category==='frame'?'brass':'none';};

  A.THEMES={
    brass:{name:'Engraved brass',note:'Brass instrument edges on a deep blue flight surface.',bg:'#080e15',surface:'#101c26',raised:'#182a36',text:'#e9eee9',muted:'#a0b3bc',accent:'#b9dace',gold:'#dfc598',frame:'#cdb384',frameInk:'#3c3020'},
    silver:{name:'Lunar silver',note:'Cool graphite instruments and silver lunar lettering.',bg:'#0b1118',surface:'#16222d',raised:'#22313d',text:'#edf2f2',muted:'#acbec8',accent:'#bbdce8',gold:'#d1dce0',frame:'#c9d8dc',frameInk:'#29333c'},
    verdigris:{name:'Orbital patina',note:'Weathered green instruments with restrained bronze highlights.',bg:'#0a1412',surface:'#142721',raised:'#223a31',text:'#e7eee5',muted:'#a8bdae',accent:'#b0dbc4',gold:'#d6c293',frame:'#9fcab7',frameInk:'#23382e'},
    solar:{name:'Solar gold',note:'Warm graphite instruments and bright stellar gold.',bg:'#15120b',surface:'#292318',raised:'#3a3021',text:'#f2eddd',muted:'#c4b69a',accent:'#f1d5a1',gold:'#efd18e',frame:'#ead499',frameInk:'#59421f'},
    horizon:{name:'Horizon alloy',note:'Pale blue instruments against a dark horizon.',bg:'#090f19',surface:'#142132',raised:'#22334a',text:'#e7eff5',muted:'#a6b9ce',accent:'#b8d6ec',gold:'#d5dbc6',frame:'#c3d8ed',frameInk:'#1a293d'},
    ivory:{name:'Legacy ivory',note:'Ivory lettering, subdued gold and dark archival panels.',bg:'#14130e',surface:'#24251c',raised:'#34372a',text:'#f1eddb',muted:'#bfbfa8',accent:'#e2e3bd',gold:'#e2c98e',frame:'#ece5cb',frameInk:'#463c2b'}
  };
  A.themeAvailable=id=>!!A.THEMES[id]&&[A.Save?.data,...(A.Save?.vault?.slots||[]).map(q=>q.data),A.Save?.vault?.sandbox?.data].some(d=>A.cosmeticAvailable('frame',id,d));
  A.interfaceTheme=()=>A.themeAvailable(A.Save?.data.settings.theme)?A.Save.data.settings.theme:'brass';
  A.themePalette=()=>A.THEMES[A.interfaceTheme()];
  A.BLUEPRINTS=[
    {id:'inner',name:'Inner worlds',icon:'planet',hold:20,note:'Keep three stable primary rocky planets for twenty seconds. Each needs at least 50% rock and iron.'},
    {id:'guardian',name:'Outer guardian',icon:'gas',hold:25,note:'Keep two rocky planets and a gas-rich outer planet. Its orbital distance must exceed both inner worlds by at least 40%.'},
    {id:'moons',name:'Moon garden',icon:'moon',hold:30,note:'Keep two stable primary planets, each with its own stable moon, for thirty seconds.'},
    {id:'belt',name:'Ringkeeper',icon:'belt',hold:30,note:'Keep two stable planets and a real belt of at least six stable small bodies for thirty seconds.'},
    {id:'resonant',name:'Resonant family',icon:'resonance',hold:30,note:'Keep three stable planets and an established period relationship for thirty seconds.'}
  ];
  A.LEGACY_TRIALS=[
    {id:'pilgrim',name:'Far traveller',icon:'chart',note:'Chart new sectors and absorb coherent bodies. Later expeditions require more of both.'},
    {id:'custodian',name:'Patient custodian',icon:'system',note:'Keep three stable planets and a stable planetary moon. Later expeditions require a longer uninterrupted hold.'},
    {id:'feeder',name:'Horizon watcher',icon:'horizon',note:'Reach black-hole scale and accrete a measured amount of matter. Captured disk mass does not count.'}
  ];
  A.cleanScars=scars=>Array.isArray(scars)?scars.filter(q=>q&&['a','d','r','power','at'].every(k=>Number.isFinite(q[k]))&&q.d>=0&&q.d<=.9&&q.r>=.02&&q.r<=.32&&q.power>=0&&q.power<=1&&['crater','fracture'].includes(q.type)).slice(-6).map(q=>({...q})):[];
  A.recordImpact=(g,b,other,violence)=>{
    if(b!==g.player&&b.kind!=='ai'&&!b.parentId&&A.stage(b.m)<3)return;
    const angle=Math.atan2(other.y-b.y,other.x-b.x)-b.angle*(A.appearance(b).type==='rock'?1:.12),seed=(b.seed+Math.floor(g.time*31))>>>0;
    b.scars||=[];b.scars.push({a:angle,d:.48+(seed%29)/100,r:.07+violence*.12,power:violence,at:g.time,type:violence>.65?'fracture':'crater'});if(b.scars.length>6)b.scars.shift();
    if(b===g.player&&b.hp>0){g.stats.impactsSurvived=(g.stats.impactsSurvived||0)+1;if(g.stats.impactsSurvived>=5&&b.hp>0)A.Save.achievement('scarred',g);}
  };
  class Body {
    reset(id, x, y, m, kind, seed) {
      Object.assign(this, { id, x, y, px: x, py: y, m, r: A.radius(m), pr: A.radius(m), pa: seed % 628 / 100, kind, seed, vx: 0, vy: 0, ax: 0, ay: 0,
        alive: true, guardianOwner:null, boss:false, bossMax:0, extractionLeft:undefined, angle: seed % 628 / 100, spin: ((seed % 101) / 100 - 0.5) * .35,
        hit: 0, invulnerable: 0, cooldown: 0, grace: 0, bound: null, boundTime: 0, hp: 100,
        trail: [], scars:[], hardcoreCache:false,rawPayload:0, path:null,pathSchema:0,pathOriginStage:0,remnantLevel:0,pathBaseMass:0,pathBaseEvolution:0,starPeak:0, reactionTime:0, reactionCredit:0, name: '', personality: '', think: 0, steerX: 0, steerY: 0, target: null, intent:'Exploring',waypoint:null,waypointIn:0,retreatUntil:0,birthAt:-100,
        evolution: A.stage(m), heat: 0, tag: '', ttl: 0, z:0, pz:0, vz:0, az:0, parentId:null, orbitStable:false, stableTime:0, orbitState:'FLYBY', orbit:null, collapse:false, form:'', material:'rock', capturedAt:-100, controlAx:0, controlAy:0, systemOwner:null, risk:"CLEAR", tidalStress:0, playerCaptureCredited:false, systemHealthyTime:0, noticeUntil:0, lastCue:-100,composition:null,atmosphere:null,climate:"Unlit",temperature:30,flareHeat:0,zoneStar:null,resonanceTime:0,resonancePartner:null,resonanceRatio:"",resonanceNotified:false,resonanceBonus:0,atlasKey:null,atlasClaimed:false,water:0,dna:0,lifeClaimed:false,ore:undefined,integrity:undefined,systemGroup:null,formationHost:null });
      return this;
    }
    setMass(m) { this.m = A.clamp(m, 1e-8, 1e22); this.r = (A.Supernova?.radius(this)||A.radius(this.m))*(A.Composition?.factor(this)||1); }
  }
  const appearances=new WeakMap();A.appearance=b=>{const old=appearances.get(b);if(old&&old.m===b.m&&old.form===b.form&&old.path===b.path&&old.level===b.remnantLevel&&old.base===b.pathBaseMass&&old.schema===b.pathSchema&&old.origin===b.pathOriginStage&&old.evolution===b.evolution&&old.kind===b.kind)return old.value;const cl=A.Supernova?.appearance(b)||A.classFor(b.m),value=b.form?{...cl,type:b.form}:cl;appearances.set(b,{m:b.m,form:b.form,path:b.path,level:b.remnantLevel,base:b.pathBaseMass,schema:b.pathSchema,origin:b.pathOriginStage,evolution:b.evolution,kind:b.kind,value});return value;};
  A.Body = Body;
  class SpatialHash {
    constructor() { this.cells = new Map(); this.size = 150; this.pool = []; this.tuned = 0; this.occupancy = 0; }
    // Cell size tracks the live body count and spread so occupancy stays near TARGET even as
    // the influence radius grows by orders of magnitude between asteroid and black-hole scales.
    static get TARGET() { return 6; }
    tune(bodies, base) {
      let count = 0, minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (const b of bodies) { if (!b.alive) continue; count++; if (b.x < minX) minX = b.x; if (b.x > maxX) maxX = b.x; if (b.y < minY) minY = b.y; if (b.y > maxY) maxY = b.y; }
      if (count < 2 || !Number.isFinite(minX)) return base;
      const area = Math.max(1, (maxX - minX)) * Math.max(1, (maxY - minY));
      const ideal = Math.sqrt(area * SpatialHash.TARGET / count);
      return A.clamp(Number.isFinite(ideal) ? ideal : base, base, base * 6);
    }
    build(bodies, size) {
      for (const bucket of this.cells.values()) { bucket.length = 0; this.pool.push(bucket); }
      this.cells.clear(); this.size = size;
      for (const b of bodies) {
        if (!b.alive) continue;
        const key = Math.floor(b.x / size) + ',' + Math.floor(b.y / size);
        let list = this.cells.get(key);
        if (!list) { list = this.pool.pop() || []; this.cells.set(key, list); }
        list.push(b);
      }
      let total = 0; for (const list of this.cells.values()) total += list.length;
      this.occupancy = this.cells.size ? total / this.cells.size : 0;
      if (this.pool.length > 512) this.pool.length = 512;
    }
    query(x, y, radius, fn) {
      const s = this.size, x0 = Math.floor((x - radius) / s), x1 = Math.floor((x + radius) / s), y0 = Math.floor((y - radius) / s), y1 = Math.floor((y + radius) / s);
      // Extremely unequal mass scales must not scan millions of empty cells.
      if ((x1 - x0 + 1) * (y1 - y0 + 1) > 1600) {
        for (const list of this.cells.values()) for (const b of list) if (Math.abs(b.x - x) <= radius && Math.abs(b.y - y) <= radius) fn(b);
        return;
      }
      for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) {
        const list = this.cells.get(cx + ',' + cy);
        if (list) for (let i = 0; i < list.length; i++) fn(list[i]);
      }
    }
  }
  A.SpatialHash = SpatialHash;
})(window.AC);
