'use strict';
(function (A) {
  Object.assign(A.achievementDefs,{orbit:['A Place in Orbit','Establish your first stable orbit.'],system:['Keeper of Worlds','Maintain three stable planets for twelve seconds.'],disk:['A Luminous Horizon','Maintain a rotating accretion disk for three seconds.'],merger:['Two Horizons, One','Accrete at least half of a captured black hole.'],endured:['Weathering the Tide','Retain a stable body after a destabilizing encounter.']});
  Object.assign(A.achievementDefs,{biosignature:['Signs of Life','Collect a DNA sample from an icy asteroid.'],companion:['Small Company','Hatch your first DNA egg.'],lifeArchive:['A Living Archive','Discover all fifty companions.']});
  Object.assign(A.achievementDefs,{legendaryBond:['A Rare Understanding','Equip a Legendary companion.'],rarityComplete:['One Whole Branch','Collect every companion of a single rarity.'],symbiosis:['Life Among Worlds','Hatch a companion while three planets hold stable orbits.']});
  Object.assign(A.achievementDefs,{wayfinder:['A Course of Your Own','Complete your first journey goal.'],charted:['Beyond the Familiar','Chart twelve sectors in one journey.'],coalescence:['From Dust, a World','Form a coherent body from captured disk matter.']});
  Object.assign(A.achievementDefs,{
    growing:['A Little More Gravity','Evolve into a growing asteroid.'],
    massive:['A Mountain in Motion','Become a massive asteroid.'],
    dwarf:['A World Takes Shape','Reach the dwarf-planet class.'],
    superEarth:['More Than Earth','Become a super-Earth.'],
    ember:['Before the First Light','Evolve into a brown dwarf.'],
    solar:['A Familiar Sun','Become a Sun-like star.'],
    supergiant:['Blue Fire','Reach the blue-supergiant class.'],
    colossus:['At the Edge of Collapse','Become a stellar colossus.'],
    horizon:['The Light Cannot Leave','Form your first stellar-origin black hole.'],
    intermediate:['A Cluster in Your Hands','Reach intermediate-mass black-hole scale.'],
    supermassive:['A Heart for a Galaxy','Become a supermassive black hole.'],
    ultramassive:['Beyond the Last Horizon','Reach the ultramassive black-hole class.'],
    interstallar:['The Interstallar','Reach the final evolution and its luminous horizon.'],
    manyCaptures:['A Hundred Small Beginnings','Absorb 100 coherent bodies in one journey.'],
    massHarvest:['Nothing Goes to Waste','Absorb 500 coherent bodies in one journey.'],
    moonFamily:['A World with Company','Keep a stable moon orbiting a planet in your system.'],
    beltKeeper:['A Ring of Small Worlds','Establish a belt of at least six stable rocky bodies.'],
    harmony:['The Music of Orbits','Maintain a measured planetary period relationship for fifteen seconds.'],
    companionForm:['Growing Together','Develop an owned companion into its final specialization.'],
    fieldNotes:['A Sky Full of Stories','Discover six procedural encounters in one journey.'],
    pathfinder:['A Journey with Purpose','Complete six different class goals in one journey.']
  });
  Object.assign(A.achievementDefs,{legacy:['Another Beginning','Retire a stellar journey and begin a prestige expedition.'],legacyTrial:['A Promise Kept','Complete an optional prestige expedition trial.'],architect:['Designed by Gravity','Complete a solar-system blueprint using real stable orbits.'],scarred:['Written in Stone','Survive five damaging structural impacts in one journey.']});
  Object.assign(A.achievementDefs,{supernova:['A Different Ending','Complete the stellar transformation on your selected evolution path.'],nova_singularity:['Into the Collapse','Reach Singularity on the collapse journey.'],nova_nebula:['Scattered Light','Become an Emission Nebula.'],nova_neutron:['A Pulse Remains','Become a Small Neutron Star.'],nova_gravastar:['Behind a Living Shell','Become a Compact Gravastar.']});
  Object.assign(A.achievementDefs,{finalSignal:['Signal in the Dark','Chart The Final Interstallar.'],finalLens:['Edge of the Lens','Enter the landmark light-bending field.'],finalLight:['Light That Circles','Reach the photon region and retain your horizon.'],finalReturn:['Turned Back','Leave the photon region after approaching within 2.5 shadow radii.'],finalMerged:['The Final Interstallar','Merge horizons with the final landmark.']});
  A.achievementBranches=[
    {id:'flight',name:'First gravity',note:'Gather matter, master momentum and survive rival gravity.',icon:'rock'},
    {id:'evolution',name:'Astronomical ascent',note:'Follow the path from drifting stone to the largest dark horizons.',icon:'star'},
    {id:'systems',name:'Keeper of worlds',note:'Build moons, belts and lasting planetary systems.',icon:'orbit'},
    {id:'accretion',name:'Matter and light',note:'Watch finite matter become disks, new worlds and mergers.',icon:'horizon'},
    {id:'companions',name:'Life in the dark',note:'Discover, hatch and grow your companions.',icon:'dna'},
    {id:'exploration',name:'Beyond the familiar',note:'Chart sectors and complete the goals of your journey.',icon:'chart'}
  ];
  // Presentation and observable progress extend the existing achievement catalogue.
  // Connections describe a journey; they never gate an otherwise valid achievement.
  A.achievementInfo={};
  const info=(id,branch,type,icon,column,row,parents=[],metric='event',target=1)=>
    A.achievementInfo[id]={id,branch,type,icon,column,row,parents,metric,target};
  info('first','flight','task','rock',0,1,[],'firstCapture');
  info('well','flight','goal','gravity',1,0,['first'],'bound',5);
  info('escape','flight','challenge','escape',2,0,['well']);
  info('predator','flight','challenge','shield',2,1,['well']);
  info('manyCaptures','flight','goal','fragments',1,2,['first'],'captures',100);
  info('massHarvest','flight','challenge','fragments',2,2,['manyCaptures'],'captures',500);
  info('traveller','flight','challenge','comet',3,1,['first'],'survival',1200);
  const ascent=[['growing',1,'rock'],['massive',2,'fragments'],['dwarf',3,'planet'],['moon',4,'moon'],['planet',5,'planet'],['superEarth',6,'planet'],['gas',7,'gas'],['ember',8,'ember'],['star',9,'star'],['solar',10,'sun'],['titan',11,'star'],['supergiant',12,'sun'],['colossus',14,'star'],['horizon',15,'horizon'],['intermediate',16,'horizon'],['supermassive',18,'horizon'],['ultramassive',20,'horizon'],['interstallar',21,'horizon']];
  ascent.forEach(([id,stage,icon],i)=>{const row=Math.floor(i/5),column=row%2?4-i%5:i%5;info(id,'evolution',stage>=15?'challenge':'goal',icon,column,row,i?[ascent[i-1][0]]:['first'],'stage',stage);});
  info('orbit','systems','task','orbit',0,1,[]);
  info('system','systems','goal','system',1,0,['orbit'],'systemTime',12);
  info('moonFamily','systems','goal','moon',1,1,['orbit'],'moons');
  info('beltKeeper','systems','goal','belt',1,2,['orbit'],'belts');
  info('harmony','systems','challenge','resonance',2,0,['system'],'resonance');
  info('endured','systems','challenge','shield',2,1,['moonFamily']);
  info('disk','accretion','task','disk',0,1,[]);
  info('coalescence','accretion','goal','planet',1,0,['disk']);
  info('merger','accretion','challenge','binary',1,2,['disk']);
  info('biosignature','companions','task','dna',0,1,[],'samples');
  info('companion','companions','goal','pet',1,1,['biosignature'],'owned');
  info('legendaryBond','companions','challenge','pet',2,0,['companion']);
  info('companionForm','companions','goal','pet',2,1,['companion'],'forms');
  info('rarityComplete','companions','goal','dna',2,2,['companion']);
  info('symbiosis','companions','challenge','system',3,0,['legendaryBond']);
  info('lifeArchive','companions','challenge','pet',3,2,['rarityComplete'],'owned',50);
  info('wayfinder','exploration','task','chart',0,1,[],'goals');
  info('charted','exploration','goal','chart',1,0,['wayfinder'],'sectors',12);
  info('fieldNotes','exploration','goal','comet',1,2,['wayfinder'],'encounters',6);
  info('pathfinder','exploration','challenge','chart',2,1,['charted','fieldNotes'],'goals',6);
  info('legacy','exploration','goal','sun',3,1,['pathfinder'],'legacy');
  info('legacyTrial','exploration','challenge','shield',4,1,['legacy'],'trials');
  info('architect','systems','challenge','resonance',3,0,['system'],'blueprints');
  info('scarred','flight','goal','shield',3,2,['manyCaptures'],'impacts',5);
  info('supernova','accretion','goal','sun',2,1,['disk']);
  info('nova_singularity','accretion','challenge','horizon',3,0,['supernova']);
  info('nova_nebula','accretion','goal','disk',3,1,['supernova']);
  info('nova_neutron','accretion','goal','star',3,2,['supernova']);
  info('nova_gravastar','accretion','challenge','shield',4,1,['supernova']);
  info('finalSignal','exploration','task','chart',5,0,['charted']);
  info('finalLens','exploration','goal','horizon',6,0,['finalSignal']);
  info('finalLight','accretion','challenge','horizon',5,0,['merger']);
  info('finalReturn','accretion','challenge','escape',5,2,['finalLight']);
  info('finalMerged','evolution','challenge','binary',4,4,['interstallar']);
  A.newAchievementKeys=['growing','massive','dwarf','superEarth','ember','solar','supergiant','colossus','horizon','intermediate','supermassive','ultramassive','interstallar','manyCaptures','massHarvest','moonFamily','beltKeeper','harmony','companionForm','fieldNotes','pathfinder','legacy','legacyTrial','architect','scarred'];
  A.achievementStatus=(id,game)=>{
    const meta=A.achievementInfo[id],def=A.achievementDefs[id];if(!meta||!def)return null;
    const d=A.Save.data,live=game?.player&&game.state!=='menu',g=live?game:null,s=g?.stats||d.run?.stats||{},c=g?.cosmic,p=g?.player;
    const earned=d.achievements.includes(id);let value=0,label='Not yet observed in this save';
    switch(meta.metric){
      case 'stage':value=A.Supernova?A.Supernova.milestoneValue(meta.target,d,g||{player:d.run?.player}):Math.max(d.bestStage||0,p?.evolution||d.run?.player.evolution||0);label='Class '+String(Math.min(value,meta.target)+1).padStart(2,'0')+' / '+String(meta.target+1).padStart(2,'0');break;
      case 'captures':value=s.captures||0;label=Math.min(value,meta.target)+' / '+meta.target+' captures this journey';break;
      case 'firstCapture':value=Math.max(d.lifetime.captures||0,s.captures||0);label=value?'A coherent body has been absorbed':'Absorb a coherent body during flight';break;
      case 'survival':value=Math.max(g?.time||d.run?.time||0,d.lifetime.longestRun||0);label=A.timeText(Math.min(value,meta.target))+' / '+A.timeText(meta.target)+' survived';break;
      case 'bound':value=g?.world?.bodies?.filter(b=>b.alive&&b.bound===p.id).length||0;label=Math.min(value,meta.target)+' / '+meta.target+' bodies bound at once';break;
      case 'systemTime':value=(c?.summary.stablePlanets||0)>=3?c.summary.healthyTime||0:0;label=Math.floor(Math.min(value,meta.target))+' / '+meta.target+' seconds with three stable planets';break;
      case 'moons':value=c?.members.filter(b=>{const parent=c.byId.get(b.parentId);return b.orbitStable&&!b.collapse&&b.parentId!==p.id&&parent?.orbitStable&&c.isPlanet(parent);}).length||0;label=value?'A stable planetary moon is present':'Keep a stable planet and its stable moon';break;
      case 'belts':value=c?.belts.length||0;label=value+' stable asteroid '+(value===1?'belt':'belts');break;
      case 'resonance':value=(p?.resonanceBonus||0)>0?1:0;label=value?'A measured period relationship is established':'Keep a 2:1, 3:2 or 4:3 pair stable for fifteen seconds';break;
      case 'samples':value=d.lifeLab.samples||0;label=value+' DNA '+(value===1?'sample':'samples')+' collected';break;
      case 'owned':value=d.lifeLab.owned.length;label=Math.min(value,meta.target)+' / '+meta.target+' companions discovered';break;
      case 'forms':value=d.lifeLab.owned.filter(id=>d.lifeLab.evolutions[id]?.form).length;label=value+' final companion '+(value===1?'form':'forms');break;
      case 'sectors':value=s.sectorsCharted||0;label=Math.min(value,meta.target)+' / '+meta.target+' sectors this journey';break;
      case 'encounters':value=s.encountersFound||0;label=Math.min(value,meta.target)+' / '+meta.target+' encounters this journey';break;
      case 'goals':value=s.directivesCompleted||0;label=Math.min(value,meta.target)+' / '+meta.target+' class goals this journey';break;
      case 'legacy':value=d.legacy.rank;label=value+' prestige '+(value===1?'expedition':'expeditions')+' begun';break;
      case 'trials':value=d.legacy.trials.length;label=value+' expedition '+(value===1?'trial':'trials')+' completed';break;
      case 'blueprints':value=d.legacy.blueprints.length;label=value+' orbital '+(value===1?'blueprint':'blueprints')+' completed';break;
      case 'impacts':value=s.impactsSurvived||0;label=Math.min(value,meta.target)+' / '+meta.target+' damaging impacts survived';break;
    }
    return{...meta,title:def[0],description:def[1],earned,value,target:meta.target,progress:earned?1:A.clamp(value/meta.target,0,1),label:earned?'Recorded in this save slot':label};
  };
  const KEY = 'accretion.v1';
  const defaults = () => ({ version: 1, settings: { ...A.COMMAND_SETTINGS, finalQuality:'auto',finalLensing:true,finalBeacon:true,finalFlashSafe:true,finalPhysical:false,theme:'brass', volume: .42, ambient: .2, mute: false, quality: 'high', adaptive: true, shake: true, trails: true, prediction: true, mouse: false, reducedMotion: false, difficulty: 'standard', petSize:'medium', companionLabel: true,achievementNotices:true,achievementPosition:'top' }, bestMass: 1, bestStage: 0, bestClassName:'Tiny asteroid', stageRecords:[0], achievements: [], lifetime: { finalCharted:0,finalNearest:1e6,finalLensSeconds:0,finalShots:0,finalMergers:0,galaxyCollisions:0, rawMined:0,researchMade:0, runs: 0, seconds: 0, captures: 0, defeats: 0, planetsCaptured:0, systemsBuilt:0, totalMatterAccreted:0, lifetimeOrbits:0, lifetimeHatched:0, longestRun:0,condensatesBorn:0,sectorsCharted:0,directivesCompleted:0,encountersFound:0,blueprintsBuilt:0,trialsCompleted:0,supernovas:0,cloudDissolved:0,strangeConverted:0 }, legacy:{rank:0,trial:'pilgrim',trials:[],blueprints:[],history:[]},cosmetics:{mark:'none',companion:'none',frame:'brass'},taunts:A.cleanTaunts(), hintsSeen:[], lifeLab:A.lifeDefaults(), replay:null, workspace:{hiddenPanels:[]}, run: null });
  A.Save = {
    available: true,
    sessionOpen:false,
    cleanProfile(raw) {
      const data=raw&&raw.version===1?raw:{},base=defaults(),d=Object.assign(base,data);
      delete d.previewReadyAt;
      const panels=['mass','rivals','radar','system','telemetry','notes','abilities','final'];
      d.workspace={hiddenPanels:Array.isArray(data.workspace?.hiddenPanels)?[...new Set(data.workspace.hiddenPanels.filter(k=>panels.includes(k)))]:[]};
      d.lifeLab=A.cleanLife(data.lifeLab);d.taunts=A.cleanTaunts(data.taunts);d.settings=A.cleanCommandSettings(Object.assign(defaults().settings,data.settings||{}));
      if(!Object.hasOwn(A.DIFFICULTIES,d.settings.difficulty))d.settings.difficulty='standard';
      if(!['auto','high','medium','low'].includes(d.settings.finalQuality))d.settings.finalQuality='auto';
      for(const k of ['finalLensing','finalBeacon','finalFlashSafe'])d.settings[k]=d.settings[k]!==false;d.settings.finalPhysical=d.settings.finalPhysical===true;
      if(!A.THEMES[d.settings.theme])d.settings.theme='brass';
      if(!['small','medium','large'].includes(d.settings.petSize))d.settings.petSize='medium';
      d.settings.achievementNotices=d.settings.achievementNotices!==false;
      if(!['top','bottom'].includes(d.settings.achievementPosition))d.settings.achievementPosition='top';
      d.lifetime=Object.assign(defaults().lifetime,data.lifetime||{});
      for(const key of Object.keys(defaults().lifetime))d.lifetime[key]=Number.isFinite(Number(d.lifetime[key]))?Math.max(0,Number(d.lifetime[key])):0;
      d.hintsSeen=Array.isArray(data.hintsSeen)?data.hintsSeen.filter(k=>typeof k==='string').slice(0,40):[];
      d.achievements=Array.isArray(data.achievements)?[...new Set(data.achievements.filter(k=>A.achievementDefs[k]))]:[];
      const oldLegacy=data.legacy||{},trialIds=A.LEGACY_TRIALS.map(q=>q.id),blueprintIds=A.BLUEPRINTS.map(q=>q.id);
      d.legacy={rank:Number.isFinite(oldLegacy.rank)?A.clamp(Math.floor(oldLegacy.rank),0,20):0,trial:trialIds.includes(oldLegacy.trial)?oldLegacy.trial:'pilgrim',trials:Array.isArray(oldLegacy.trials)?[...new Set(oldLegacy.trials.filter(q=>typeof q==='string'&&/^(?:[1-9]|1\d|20):(pilgrim|custodian|feeder)$/.test(q)))].slice(-60):[],blueprints:Array.isArray(oldLegacy.blueprints)?[...new Set(oldLegacy.blueprints.filter(q=>blueprintIds.includes(q)))]:[],history:Array.isArray(oldLegacy.history)?oldLegacy.history.filter(q=>q&&trialIds.includes(q.trial)&&['rank','stage','mass','time','goals'].every(k=>Number.isFinite(q[k]))&&q.rank>=1&&q.rank<=20&&q.mass>0&&q.mass<=1e22&&q.time>=0).slice(-12).map(q=>({...q,rank:Math.floor(q.rank),stage:A.clamp(Math.floor(q.stage),0,100),goals:A.clamp(Math.floor(q.goals),0,64)})):[]};
      d.cosmetics={};for(const category of Object.keys(A.COSMETICS)){const id=data.cosmetics?.[category];d.cosmetics[category]=A.cosmeticAvailable(category,id,d)?id:category==='frame'?'brass':'none';}
      if(!data.settings?.theme&&A.cosmeticAvailable('frame',d.cosmetics.frame,d))d.settings.theme=d.cosmetics.frame;
      if(!Number.isFinite(d.bestMass)||d.bestMass<1)d.bestMass=1;
      if(!Number.isFinite(d.bestStage))d.bestStage=0;
      d.bestClassName=typeof data.bestClassName==='string'&&data.bestClassName.length<=80?data.bestClassName:A.classFor(5**Math.min(21,d.bestStage)).name;
      d.stageRecords=Array.isArray(data.stageRecords)?[...new Set(data.stageRecords.filter(n=>Number.isInteger(n)&&n>=0&&n<=21))]:Array.from({length:Math.min(21,Math.max(0,Math.floor(d.bestStage)))+1},(_,i)=>i);
      if(d.replay&&A.EncounterReplay?.clean)d.replay=A.EncounterReplay.clean(d.replay);
      if(d.run){const r=d.run;d.run={...r,player:A.migrateCachePayload(r.player),bodies:Array.isArray(r.bodies)?r.bodies.map(A.migrateCachePayload):r.bodies,industry:A.Industry.migrateState(r.industry)};if(r.cosmic)d.run.cosmic={...r.cosmic,packets:Array.isArray(r.cosmic.packets)?r.cosmic.packets.map(A.migrateCachePayload):r.cosmic.packets};}
      if(d.run&&!this.validRun(d.run))d.run=null;
      if(d.run?.final&&A.cleanFinal&&!A.cleanFinal(d.run.final)){d.run={...d.run};delete d.run.final;}
      return d;
    },
    load() {
      let raw=null;this.available=true;this.sessionOpen=false;
      try{raw=JSON.parse(localStorage.getItem(KEY)||'null');}catch(_){this.available=false;}
      const old=this.cleanProfile(raw),modern=raw?.version===2&&Array.isArray(raw.slots);
      this.vault={version:2,activeSlot:modern?A.clamp(Math.floor(raw.activeSlot)||0,0,2):0,settings:modern?this.cleanProfile({version:1,settings:raw.settings}).settings:old.settings,slots:[]};
      for(let i=0;i<3;i++){
        const slot=modern?raw.slots[i]:null,data=this.cleanProfile(slot?.data||(i===0&&!modern?old:null));
        this.vault.slots.push({everyThree:slot?.everyThree!==false,savedAt:Number.isFinite(slot?.savedAt)?slot.savedAt:0,evolutionBase:Number.isFinite(data.run?.player.evolution)?data.run.player.evolution:0,data});
      }
      if(modern&&!raw.settings?.theme){const profile=this.vault.slots[this.vault.activeSlot].data;this.vault.settings.theme=profile.settings.theme||'brass';}
      this.vault.sandbox={everyThree:false,savedAt:raw?.sandbox?.savedAt||0,evolutionBase:0,data:this.cleanProfile(raw?.sandbox?.data)};this.vault.scenarios={};for(const mode of ['boss','salvage','multiplayer'])this.vault.scenarios[mode]={everyThree:false,savedAt:raw?.scenarios?.[mode]?.savedAt||0,evolutionBase:0,data:this.cleanProfile(raw?.scenarios?.[mode]?.data)};this.activate(this.vault.activeSlot,['sandbox','boss','salvage'].includes(raw?.mode)?raw.mode:'journey');return this.data;
    },
    get mode(){return this.vault.mode||'journey';},
    selectSandbox(){return this.selectMode('sandbox');},
    selectMode(mode){if(this.sessionOpen||!A.MODES[mode])return false;this.activate(this.vault.activeSlot,mode);this.write();return true;},
    activate(index,mode='journey'){this.vault.activeSlot=index;this.vault.mode=mode;this.data=this.cleanProfile(JSON.parse(JSON.stringify(mode==='sandbox'?this.vault.sandbox.data:mode==='journey'?this.vault.slots[index].data:this.vault.scenarios[mode].data)));this.data.settings=this.vault.settings;},
    get slot(){return this.mode==='sandbox'?this.vault.sandbox:this.mode==='journey'?this.vault.slots[this.vault.activeSlot]:this.vault.scenarios[this.mode];},
    selectSlot(index){if(!Number.isInteger(index)||index<0||index>2||this.sessionOpen)return false;this.activate(index);this.write();return true;},
    write(commit=false) {
      const slot=this.slot,previous={data:slot.data,savedAt:slot.savedAt,evolutionBase:slot.evolutionBase};
      if(commit||!this.sessionOpen){slot.data=JSON.parse(JSON.stringify(this.data));slot.savedAt=Date.now();slot.evolutionBase=this.data.run?.player.evolution||0;}
      this.vault.settings=this.data.settings;
      try{localStorage.setItem(KEY,JSON.stringify(this.vault));this.available=true;return true;}catch(_){Object.assign(slot,previous);this.available=false;return false;}
    },
    setCadence(enabled,game){this.slot.everyThree=!!enabled;if(this.sessionOpen)return this.checkpoint(game,'manual');return this.write(true);},
    status(game){const count=this.sessionOpen?A.clamp((game.player?.evolution||0)-this.slot.evolutionBase,0,3):0;return (this.mode==='journey'?'Slot '+(this.vault.activeSlot+1):A.MODES[this.mode].name)+' · '+(this.slot.everyThree?count+'/3 evolutions to autosave':'Autosave every 15 seconds');},
    validRun(r) {
      if (!r || ![1,2,3,4,5,6].includes(r.version) || !r.player || !Array.isArray(r.bodies) || r.bodies.length>1800 || !Number.isFinite(r.time)) return false;
      if(r.difficulty!==undefined&&!Object.hasOwn(A.DIFFICULTIES,r.difficulty))return false;
      if(r.industry&&!A.Industry?.valid(r.industry))return false;
      if(r.command&&!A.Command.valid(r.command))return false;
      if(![r.player,...r.bodies].every(b=>(b.boss===undefined||typeof b.boss==='boolean')&&(b.bossMax===undefined||Number.isFinite(b.bossMax)&&b.bossMax>=0&&b.bossMax<=1e7)&&(b.guardianOwner===undefined||b.guardianOwner===null||Number.isInteger(b.guardianOwner)&&b.guardianOwner>0)))return false;
      if(![r.player,...r.bodies].every(b=>['ore','integrity'].every(k=>b[k]===undefined||Number.isFinite(b[k])&&b[k]>=0&&b[k]<=1000)))return false;
      if(![r.player,...r.bodies,...(Array.isArray(r.cosmic?.packets)?r.cosmic.packets:[])].every(data=>{const b=A.migrateCachePayload(data);return b&&(b.rawPayload===undefined||Number.isInteger(b.rawPayload)&&b.rawPayload>=0&&b.rawPayload<=50000)&&(b.hardcoreCache===undefined||typeof b.hardcoreCache==='boolean');}))return false;
      const finite=b=>b&&['x','y','m','vx','vy'].every(k=>Number.isFinite(b[k]))&&b.m>0&&b.m<=1e22&&['z','vz'].every(k=>b[k]===undefined||Number.isFinite(b[k]));
      if(![r.player,...r.bodies].every(finite))return false;
      if(![r.player,...r.bodies].every(b=>(b.scars===undefined||Array.isArray(b.scars)&&b.scars.length<=6&&A.cleanScars(b.scars).length===b.scars.length)&&['angle','spin'].every(k=>b[k]===undefined||Number.isFinite(b[k]))))return false;
      if(![r.player,...r.bodies].every(b=>(!b.waypoint||['x','y'].every(k=>Number.isFinite(b.waypoint[k])))&&(b.intent===undefined||typeof b.intent==='string'&&b.intent.length<120)))return false;
      const routes={singularity:[7,10],nebula:[3,6],neutron:[2,5],gravastar:[2,5]};
      if(![r.player,...r.bodies].every(b=>{if(!b.path)return b.pathSchema===undefined||b.pathSchema===0;if(!Object.hasOwn(routes,b.path)||![undefined,0,2].includes(b.pathSchema))return false;const modern=b.pathSchema===2;return Number.isFinite(b.pathBaseMass)&&b.pathBaseMass>0&&b.pathBaseMass<=1e22&&Number.isInteger(b.pathBaseEvolution)&&b.pathBaseEvolution>=0&&b.pathBaseEvolution<=100&&Number.isInteger(b.remnantLevel)&&b.remnantLevel>=0&&b.remnantLevel<=routes[b.path][modern?1:0]&&(!modern||Number.isInteger(b.pathOriginStage)&&b.pathOriginStage>=11&&b.pathOriginStage<=14);} ))return false;
      if(![r.player,...r.bodies].every(b=>(b.starPeak===undefined||b.starPeak<=14)&&['reactionTime','reactionCredit','starPeak'].every(k=>b[k]===undefined||Number.isFinite(b[k])&&b[k]>=0)))return false;
      if(r.cosmic){const q=r.cosmic,packets=q.packets||[],regions=q.regions||[];
        if(!Array.isArray(packets)||packets.length>160||!packets.every(b=>finite(b)&&Number.isFinite(b.age)&&Number.isFinite(b.initial)&&b.initial>0&&Number.isFinite(b.owner)))return false;
        if(!packets.every(b=>!b.flow||['diffuse','conversion'].includes(b.flow)&&Number.isFinite(b.donor)))return false;
        if(!packets.every(b=>['water','dna'].every(k=>b[k]===undefined||Number.isInteger(b[k])&&b[k]>=0)&&(!b.feeding||['carrierVx','carrierVy','carrierVz'].every(k=>Number.isFinite(b[k])))))return false;
        if(!Array.isArray(regions)||regions.length>8||!regions.every(b=>Number.isFinite(b.x)&&Number.isFinite(b.y)&&Number.isFinite(b.r)&&b.r>0&&Array.isArray(b.cells)&&b.cells.length<=32&&b.cells.every(c=>finite(c)&&Number.isFinite(c.initial)&&c.initial>0&&Number.isFinite(c.r)&&c.r>0)))return false;
        if(q.anchor&&!['x','y','scale'].every(k=>Number.isFinite(q.anchor[k])))return false;
        if(q.thefts&&(!Array.isArray(q.thefts)||q.thefts.length>16||!q.thefts.every(t=>['owner','at','body'].every(k=>Number.isFinite(t[k])))))return false;
      }
      if(r.expedition){const e=r.expedition,a=e.atlas,w=e.weather;
        const c=e.collision;if(c){
          if(!['ready','active','complete'].includes(c.state)||!['elapsed','phase','seed','x','y','budget','reservoir','released','emissions','supplyIn','checkpointIn'].every(k=>Number.isFinite(c[k]))||typeof c.rewarded!=='boolean')return false;
          if(c.elapsed<0||c.elapsed>7200||!Number.isInteger(c.phase)||c.phase<0||c.phase>Math.min(3,Math.floor(c.elapsed/1800))||c.budget<0||c.budget>8e22||c.reservoir<0||c.released<0||Math.abs(c.reservoir+c.released-c.budget)>Math.max(1,c.budget*1e-8)||!Number.isInteger(c.emissions)||c.emissions<0)return false;
          if(c.state==='ready'&&(c.elapsed!==0||c.budget!==0||c.rewarded)||c.state==='active'&&(c.elapsed>=7200||c.rewarded)||c.state==='complete'&&(c.elapsed!==7200||c.phase!==3||!c.rewarded))return false;
        }
        if(e.blueprints&&(!A.BLUEPRINTS.some(q=>q.id===e.blueprints.selected)&&e.blueprints.selected!==null||!Number.isFinite(e.blueprints.progress)||e.blueprints.progress<0||e.blueprints.progress>60||!Array.isArray(e.blueprints.completed)||e.blueprints.completed.length>5||!e.blueprints.completed.every(id=>A.BLUEPRINTS.some(q=>q.id===id))))return false;
        if(e.trial&&(!A.LEGACY_TRIALS.some(q=>q.id===e.trial.kind)||!Number.isInteger(e.trial.rank)||e.trial.rank<1||e.trial.rank>20||!Number.isFinite(e.trial.progress)||e.trial.progress<0||e.trial.progress>1||!Number.isFinite(e.trial.hold)||e.trial.hold<0||e.trial.hold>300||typeof e.trial.done!=='boolean'))return false;
        if(a&&(!['x','y','seed'].every(k=>Number.isFinite(a[k]))||!Array.isArray(a.cells)||a.cells.length>256||!a.cells.every(c=>c&&['x','y','depletion','visits'].every(k=>Number.isFinite(c[k])))||!Array.isArray(a.rivals)||a.rivals.length>12||!a.rivals.every(c=>c&&['x','y','m','seen'].every(k=>Number.isFinite(c[k])))))return false;
        if(w){if(!Number.isFinite(w.next))return false;for(const q of [w.forecast,w.wave])if(q&&(!['x','y','at','range','severity','source'].every(k=>Number.isFinite(q[k]))||q.range<=0||!['flare','magnetar'].includes(q.type)))return false;if(w.wave&&(!Number.isFinite(w.wave.radius)||!Array.isArray(w.wave.hit)||w.wave.hit.length>1800||!w.wave.hit.every(Number.isFinite)))return false;}
        if(e.directive){const q=e.directive;if(!Number.isInteger(q.stage)||q.stage<0||!['captures','growth','survey','coast','system','condensates','accretion'].includes(q.kind)||!Number.isFinite(q.target)||q.target<=0||!Number.isFinite(q.progress)||q.progress<0||!q.baseline||!Object.values(q.baseline).every(Number.isFinite))return false;}
        if(e.completed&&(!Array.isArray(e.completed)||e.completed.length>64||!e.completed.every(n=>Number.isInteger(n)&&n>=0)))return false;
        if(e.visited&&(!Array.isArray(e.visited)||e.visited.length>256||!e.visited.every(n=>typeof n==='string'&&n.length<48)))return false;
        if(e.journal&&(!Array.isArray(e.journal)||e.journal.length>24||!e.journal.every(q=>q&&typeof q.title==='string'&&typeof q.detail==='string'&&Number.isFinite(q.time))))return false;
        if(e.encounter&&(!['ribbon','shoal','stream','archipelago','worlds','nursery','filament','association'].includes(e.encounter.style)||!['x','y','until'].every(k=>Number.isFinite(e.encounter[k]))))return false;
      }
      if(r.fields&&(!Array.isArray(r.fields)||r.fields.length>28||!r.fields.every(f=>f&&['x','y','r','age'].every(k=>Number.isFinite(f[k]))&&f.r>0&&typeof f.name==='string')))return false;
      return true;
    },
    account(game) {
      if(this.mode!=='journey')return;A.Supernova?.recordStages(this.data,game);const s = game.stats, l = this.data.lifetime;
      l.seconds += Math.max(0, game.time - (s.savedTime || 0)); l.captures += Math.max(0, s.captures - (s.savedCaptures || 0)); l.defeats += Math.max(0, s.defeats - (s.savedDefeats || 0));
      for(const key of ['rawMined','researchMade','galaxyCollisions','planetsCaptured','systemsBuilt','totalMatterAccreted','orbitsEstablished','condensatesBorn','sectorsCharted','directivesCompleted','encountersFound','blueprintsBuilt','trialsCompleted','supernovas','cloudDissolved','strangeConverted']){const amount=Number.isFinite(s[key])?Math.max(0,s[key]):0,previous=s['saved_'+key]||0;const target=key==='orbitsEstablished'?'lifetimeOrbits':key;l[target]=(l[target]||0)+Math.max(0,amount-previous);s['saved_'+key]=amount;}
      const f=game.finalInterstallar;if(f?.found){l.finalCharted=Math.max(l.finalCharted||0,1);l.finalNearest=Math.min(l.finalNearest??1e6,f.near);for(const [record,current] of [['finalLensSeconds',f.lens],['finalShots',f.shots]]){const prev=s['saved_'+record]||0;l[record]=(l[record]||0)+Math.max(0,current-prev);s['saved_'+record]=current;}}
      const mergers=s.finalMergers||0;l.finalMergers=(l.finalMergers||0)+Math.max(0,mergers-(s.saved_finalMergers||0));s.saved_finalMergers=mergers;
      s.savedTime = game.time; s.savedCaptures = s.captures; s.savedDefeats = s.defeats;
    },
    checkpoint(game,reason='auto') {
      if (!game.player || game.network?.active || this.mode==='multiplayer' || game.state === 'over' || game.state === 'menu') return false;
      game.life?.commit();
      if(this.sessionOpen&&this.slot.everyThree&&!['manual','start'].includes(reason)&&game.player.evolution-this.slot.evolutionBase<3)return false;
      this.account(game);
      const pack = b => ({ id: b.id, x: b.x, y: b.y, m: b.m, vx: b.vx, vy: b.vy, kind: b.kind, seed: b.seed, hp: b.hp, name: b.name, personality: b.personality, evolution: b.evolution, tag: b.tag, ttl:b.ttl,z:b.z||0,vz:b.vz||0,parentId:b.parentId,orbitStable:b.orbitStable,stableTime:b.stableTime,collapse:b.collapse,form:b.form,material:b.material,systemOwner:b.systemOwner,risk:b.risk,playerCaptureCredited:b.playerCaptureCredited,systemHealthyTime:b.systemHealthyTime,orbitState:b.orbitState,water:b.water,dna:b.dna,lifeClaimed:b.lifeClaimed,rawPayload:b.rawPayload,hardcoreCache:b.hardcoreCache,composition:b.composition,atmosphere:b.atmosphere,climate:b.climate,temperature:b.temperature,flareHeat:b.flareHeat,resonanceTime:b.resonanceTime,resonancePartner:b.resonancePartner,resonanceRatio:b.resonanceRatio,atlasKey:b.atlasKey,atlasClaimed:b.atlasClaimed,intent:b.intent,waypoint:b.waypoint,waypointIn:b.waypointIn,retreatUntil:b.retreatUntil,birthAt:b.birthAt,angle:b.angle,spin:b.spin,scars:A.cleanScars(b.scars),path:b.path,pathSchema:b.pathSchema,pathOriginStage:b.pathOriginStage,remnantLevel:b.remnantLevel,pathBaseMass:b.pathBaseMass,pathBaseEvolution:b.pathBaseEvolution,starPeak:b.starPeak,reactionTime:b.reactionTime,reactionCredit:b.reactionCredit,ore:b.ore,integrity:b.integrity,systemGroup:b.systemGroup,formationHost:b.formationHost,guardianOwner:b.guardianOwner,boss:b.boss,bossMax:b.bossMax });
      if(this.mode==='journey'){if(game.stats.peak>=this.data.bestMass)this.data.bestClassName=game.stats.peakClass||A.appearance(game.player).name;this.data.bestMass = Math.max(this.data.bestMass, game.stats.peak);
      this.data.bestStage = Math.max(this.data.bestStage, game.player.evolution);}
      const abilities = {}; for (const key of ['boostEnergy', 'pulseCooldown', 'amplifyCooldown', 'amplifyTime', 'shellCooldown']) abilities[key] = game[key] || 0;
      this.data.run = { version: 6, command:game.command?.serialize()||null, industry:game.industry?.serialize()||null, final:game.finalInterstallar?.serialize()||null, mode:this.mode, expedition:game.expedition?.serialize(), cosmic:game.cosmic?.serialize(), player: pack(game.player), bodies: game.world.bodies.filter(b => b.alive && b !== game.player).map(pack), upgrades: { ...game.upgrades.levels }, points: game.upgrades.points, time: game.time, seed: game.world.seed, fields:game.world.fields.map(f=>({...f})), rngState: game.world.random.getState(), stats: { ...game.stats }, eventIn: game.world.eventIn, difficulty: game.difficulty, abilities, sinceDamage: Math.max(0, game.time - game.lastDamage) };
      return this.write(true);
    },
    collisionProgress(game){
      const live=game.expedition?.collision,stored=this.slot.data.run?.expedition?.collision,current=this.data.run?.expedition?.collision;
      if(!this.sessionOpen||game.state!=='playing'||live?.state!=='active'||!stored||!current||stored.state!=='active'||stored.seed!==live.seed)return false;
      const a=stored.elapsed,b=current.elapsed;stored.elapsed=Math.max(a,live.elapsed);current.elapsed=Math.max(b,live.elapsed);
      if(this.write())return true;stored.elapsed=a;current.elapsed=b;return false;
    },
    checkAdvancements(game, silent=false) {
      if(this.mode!=='journey')return;
      let changed=false;for(const id of A.newAchievementKeys){if(this.data.achievements.includes(id))continue;const q=A.achievementStatus(id,game);if(q&&q.value>=q.target)changed=this.achievement(id,silent?null:game,false)||changed;}
      if(changed)this.write();return changed;
    },
    achievement(key, game, persist=true) {
      if (this.mode!=='journey'||this.data.achievements.includes(key) || !A.achievementDefs[key]) return false;
      this.data.achievements.push(key); if(persist)this.write();
      if(game?.ui?.achievementNotice)game.ui.achievementNotice(key);
      else{if(game?.ui)game.ui.toast('ACHIEVEMENT UNLOCKED',A.achievementDefs[key][0],'gold');if(game?.audio)game.audio.play('upgrade');}
      return true;
    },
    finish(game) {
      const d = this.data; game.life?.commit();
      this.checkAdvancements(game);
      if(this.mode==='journey'){if(game.stats.peak>=d.bestMass)d.bestClassName=game.stats.peakClass||A.appearance(game.player).name;d.bestMass = Math.max(d.bestMass, game.stats.peak); d.bestStage = Math.max(d.bestStage, game.stats.stage);}
      this.account(game); if(this.mode==='journey')d.lifetime.runs++;
      if(this.mode==='journey')d.lifetime.longestRun = Math.max(d.lifetime.longestRun || 0, Math.max(0, game.time));
      d.run = null; this.sessionOpen=false; this.write(true);
    }
  };
  A.Save.load();
})(window.AC);
