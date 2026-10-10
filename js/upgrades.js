'use strict';
(function (A) {
  A.UPGRADES = [
    { id: 'pull', name: 'Deep gravity', type: 'GRAVITY', icon: '◎', description: '+22% gravitational attraction per rank. Bend more distant trajectories.', max: 5, stage: 1 },
    { id: 'range', name: 'Extended influence', type: 'GRAVITY', icon: '◌', description: '+20% gravity radius per rank. Begin captures earlier.', max: 5, stage: 1 },
    { id: 'capture', name: 'Orbital resonance', type: 'GRAVITY', icon: '⌁', description: '+35% early capture drag. Stellar planetary orbits retain angular momentum.', max: 4, stage: 1 },
    { id: 'thrust', name: 'Vector drive', type: 'MOVEMENT', icon: '↗', description: '+20% acceleration and +10% speed ceiling per rank.', max: 5, stage: 1 },
    { id: 'brake', name: 'Inertial control', type: 'MOVEMENT', icon: '⊙', description: '+45% braking strength and +20% counter-thrust. Hold Shift to brake.', max: 3, stage: 1 },
    { id: 'boost', name: 'Escape burn', type: 'MOVEMENT', icon: '»', description: 'Unlock Space: a powerful, rechargeable propulsion burn. Further ranks extend the burn.', max: 3, stage: 1 },
    { id: 'yield', name: 'Accretion efficiency', type: 'GROWTH', icon: '✧', description: 'Recover 4 percentage points more mass from each capture. Less material escapes.', max: 4, stage: 1 },
    { id: 'armor', name: 'Cohesive mantle', type: 'DEFENSE', icon: '◇', description: 'Reduce collision damage and fragmentation by 18% per rank.', max: 4, stage: 1 },
    { id: 'resist', name: 'Tidal stabilizer', type: 'DEFENSE', icon: '≋', description: 'Reduce acceleration toward larger bodies by 20% per rank. Safer escapes.', max: 3, stage: 2 },
    { id: 'scanner', name: 'Deep-space survey', type: 'UTILITY', icon: '⌖', description: '+35% scanner range. Highlight rich fields and extend the trajectory forecast.', max: 3, stage: 1 },
    { id: 'pulse', name: 'Gravity pulse', type: 'SPECIAL', icon: '◉', description: 'Unlock E: disrupt nearby orbits and repel threats. Further ranks shorten its cooldown.', max: 3, stage: 2 },
    { id: 'amplify', name: 'Accretion surge', type: 'SPECIAL', icon: '✺', description: 'Unlock Q: double gravity for 7 seconds. Further ranks reduce the cooldown.', max: 3, stage: 3 },
    { id: 'shield', name: 'Emergency shell', type: 'DEFENSE', icon: '⬡', description: 'Automatically block a critical collision once per 55 seconds. Ranks shorten recharge.', max: 3, stage: 2 },
    { id: 'magnet', name: 'Debris affinity', type: 'GROWTH', icon: '⋆', description: 'Small debris feels 35% more attraction per rank. High-speed impacts leave opportunities.', max: 4, stage: 2 }
  ];
  A.UPGRADES.push({id:'flow',name:'Inner flow',type:'ACCRETION',icon:'≋',description:'+25% disk angular-momentum transport and +20% assimilation speed per rank.',max:4,stage:9},{id:'intake',name:'Gas collector',type:'MATTER',icon:'✧',description:'+25% bound gas transfer into your disk per rank.',max:4,stage:9},{id:'disk',name:'Disk stability',type:'BLACK HOLE',icon:'◎',description:'Store another 20% of your mass in captured gas. Incoming streams remain vulnerable to rivals.',max:4,stage:15});
  A.UPGRADES.push({id:'harmony',name:'System shepherd',type:'GRAVITY',icon:'◌',description:'Each rank reduces residual orbital stress during gentle thrust by 22% of its base amount. Boosts remain disruptive.',max:3,stage:9});
  // Existing adaptation IDs keep their ranks and physical effects in older saves.
  A.BRANCHES={mining:{name:'Mining',color:'#d8bd7c',gate:null},science:{name:'Science',color:'#84c7b8',gate:null},attack:{name:'Attack',color:'#de9380',gate:'tech_attack'},defense:{name:'Defense',color:'#94b5d6',gate:'tech_defense'},speed:{name:'Speed',color:'#c1cb8f',gate:'tech_speed'},energy:{name:'Energy',color:'#ddb06d',gate:'tech_energy'},cosmetics:{name:'Cosmetics',color:'#b7c7c6',gate:'tech_cosmetics'}};
  const placement={pull:['science','tech_gravity'],range:['science','tech_gravity'],capture:['science','tech_gravity'],scanner:['science','research_centre'],pulse:['attack','turret'],amplify:['attack','tech_gravity'],thrust:['speed','tech_speed'],brake:['speed','tech_speed'],boost:['speed','thrust'],armor:['defense','tech_defense'],resist:['defense','armor'],shield:['defense','armor'],yield:['mining','tech_mining'],magnet:['mining','collector'],flow:['science','tech_stellar'],intake:['mining','tech_stellar'],disk:['defense','tech_stellar'],harmony:['science','tech_stellar']};
  for(const u of A.UPGRADES){const q=placement[u.id];u.branch=q[0];u.requires=[];u.legacy=true;}
  const node=(id,name,branch,description,max=1,requires=[],stage=4,extra={})=>({id,name,branch,type:branch.toUpperCase(),description,max,requires,stage,...extra});
  A.UPGRADES.push(
    node('outpost','Orbital outpost','mining','Free station with one mining drone. Break finite rocks, carry ore home, and deposit Raw Material.',1,[],4,{free:true}),
    node('research_centre','Research Centre','science','Build for 25 Raw Material. Each batch consumes 50 Raw Material and produces 1 Research Point in 18 powered seconds.',1,[['outpost',1]],4,{raw:25}),
    node('tech_mining','Advanced extraction','science','Unlock more mining drones, collectors and ore-processing equipment.',1,[['research_centre',1]]),
    node('tech_attack','Weapons engineering','science','Unlock Attack. Turrets fracture rocks and knock real mass loose from rivals.',1,[['research_centre',1]]),
    node('tech_defense','Field engineering','science','Unlock Defense and powered shield segments.',1,[['research_centre',1]]),
    node('tech_speed','Propulsion engineering','science','Unlock Speed, engine pods and improved control.',1,[['research_centre',1]]),
    node('tech_energy','Power engineering','science','Unlock generators, batteries and fleet-wide overclocking.',1,[['research_centre',1]]),
    node('tech_gravity','Gravity laboratory','science','Unlock gravity instruments and orbit control.',1,[['research_centre',1],['scanner',1]],5),
    node('tech_optics','Coherent optics','science','Unlock attack lasers. Mining lasers need installed attack lasers first.',1,[['tech_attack',1],['research_rate',1]],5),
    node('tech_biology','Sample laboratory','science','Unlock deterministic recovery bonuses for scarce water and DNA.',1,[['research_centre',1],['research_rate',1]],5),
    node('tech_cosmetics','Orbital design','science','Unlock decorative follower worlds. These are visuals, not captured planets.',1,[['research_centre',1]],5),
    node('tech_stellar','Stellar engineering','science','Unlock engineered guardian systems and advanced horizon extraction. Original stellar adaptations remain in the Adaptations panel.',1,[['tech_gravity',1],['research_rate',2]],9),
    node('research_rate','Parallel research','science','Research batches complete 25% faster per rank. The 50-material cost stays fixed.',4,[['research_centre',1]]),
    node('miner','Mining fleet','mining','Add one mining drone per rank, up to six in total.',5,[['outpost',1],['tech_mining',1]]),
    node('collector','Collection fleet','mining','Add an ore hauler per rank. Haulers recover material crates and carry them to the station.',4,[['tech_mining',1]]),
    node('mining_rate','Drill assemblies','mining','25% faster rock cutting per rank.',4,[['tech_mining',1]]),
    node('ore_yield','Ore separation','mining','Recover 20% more Raw Material from a finite rock per rank. Does not create mass.',3,[['miner',1]]),
    node('mining_range','Prospecting array','mining','Extend drone operating range by 25% per rank.',3,[['tech_mining',1],['scanner',1]]),
    node('mining_laser','Mining lasers','mining','Install cutting lasers on miners. Double cutting rate and increase standoff distance.',3,[['attack_laser',1],['miner',2],['mining_rate',1]],5),
    node('turret','Defense turrets','attack','Add a turret per rank, up to four. Prioritize nearby rival threats, otherwise fracture rocks.',4,[['tech_attack',1]]),
    node('attack_rate','Rapid cycling','attack','Increase turret firing rate by 20% per rank.',3,[['turret',1]]),
    node('attack_damage','Impact chambers','attack','Increase rock damage and rival mass dislodged by 20% per rank.',3,[['turret',1]]),
    node('attack_laser','Attack lasers','attack','Replace alternating turret shots with coherent beams. Required before mining lasers.',3,[['tech_optics',1],['turret',2]],5),
    node('shield_grid','Shield grid','defense','Powered shield with 30 + 20 capacity per additional rank. Recharges after three safe seconds.',4,[['tech_defense',1]]),
    node('shield_recharge','Shield capacitors','defense','Increase shield recovery by 25% per rank.',3,[['shield_grid',1],['battery',1]]),
    node('turning','Vector nozzles','speed','Add 25% counter-thrust per rank. Turn your momentum without steering lag.',3,[['thrust',1]]),
    node('steam','Closed-cycle turbine','energy','Add 4 power per rank. This is a sealed working-fluid cycle, not a fire in space.',3,[['tech_energy',1]]),
    node('nuclear','Fission reactor','energy','Add 8 power per rank. Requires a turbine and a planet-scale body.',2,[['steam',1],['research_rate',1]],5),
    node('fusion','Fusion reactor','energy','Add 14 power per rank. Requires fission and parallel research.',2,[['nuclear',1],['research_rate',2]],7),
    node('solar','Stellar collectors','energy','Add 16 power per rank. Solar collectors unlock around stellar-scale bodies.',2,[['fusion',1]],9),
    node('dyson','Dyson swarm','energy','Add 28 power per rank with a visible swarm. Requires collectors and advanced storage.',2,[['solar',1],['battery',2]],10,{advanced:true}),
    node('battery','Battery banks','energy','Store 60 power per rank. Charging mode diverts generator output away from machines.',4,[['tech_energy',1],['steam',1]]),
    node('charge_rate','Charge controllers','energy','Increase charge throughput by 35% per rank, reducing charging time.',3,[['battery',1]]),
    node('overclock','Fleet overclock','energy','Spend stored power to accelerate every powered branch at once. More intensity means less duration.',3,[['battery',1]]),
    node('power_efficiency','Power conversion','energy','Reduce machine demand by 12% per rank and improve overclock efficiency.',3,[['tech_energy',1],['research_rate',1]]),
    node('water_recovery','Water condenser','science','Recover 25% more water per rank from actual samples; fractional recovery is carried forward.',3,[['tech_biology',1]]),
    node('dna_recovery','DNA sequencer','science','Recover 10% more DNA per rank from actual samples. Does not alter wheel odds.',3,[['tech_biology',1]]),
    node('follower','Follower worlds','cosmetics','Add one decorative orbiting world per rank. Toggle the entire display at any time.',3,[['tech_cosmetics',1]])
  );
  A.BRANCHES.orbital={name:'Solar systems',color:'#b7d6a0',gate:'tech_orbital'};
  A.UPGRADES.push(
    node('tech_orbital','Orbital architecture','science','Unlock construction of real guardian worlds around stars, and satellite stellar systems around black holes.',1,[['tech_stellar',1]],9),
    node('guardian','Guardian worlds','orbital','One additional guardian slot per rank. Assemble a world for 80 Raw Material and 0.3% of your mass. Guardians intercept damage while they remain bound.',4,[['tech_orbital',1]],9),
    node('guardian_armor','Planetary bulwarks','orbital','Guardians intercept 10% more incoming damage per rank. Damaged guardians lose physical mass.',3,[['guardian',1],['tech_defense',1]],9),
    node('guardian_belt','Debris screens','orbital','Construction includes six real belt fragments and two small moons. Extra orbital cover improves interception.',1,[['guardian',2],['tech_mining',1]],9),
    node('galaxy_core','Galactic architecture','orbital','Black holes can assemble orbiting stars with planets and belts. Each stellar assembly costs 200 Raw Material and 0.5% core mass.',1,[['guardian',3],['tech_stellar',1]],15),
    node('horizon_mining','Horizon extraction','mining','The personal laser can strip a finite amount of accretion-disk matter from black holes into recoverable ore. It cannot mine the event horizon.',2,[['mining_laser',2],['tech_stellar',1]],15)
  );
  A.Upgrades = class {
    constructor(game){this.game=game;this.levels={};this.points=0;this.choices=[];this.claims=new Set();this.branch='mining';}
    get(id){return this.levels[id]||0;}
    definition(id){return A.UPGRADES.find(q=>q.id===id);}
    goal(){const p=this.game.player;if(!p)return null;const n=A.Supernova,route=n?.route(p),level=route?n.level(p):p.evolution,max=route?A.SUPERNOVA_PATHS[route].classes.length-1:14;if(level>=max)return null;const base=route?n.baseMass(p)*5**level:5**level;return{base,next:base*5,ratio:A.clamp((p.m-base)/(base*4),0,1)};}
    claimKey(next,half){return (Math.log(next)/Math.log(5)).toFixed(6)+':'+(half?'half':'full');}
    award(next,half=false){const key=this.claimKey(next,half);if(this.claims.has(key))return false;this.claims.add(key);if(A.Save.mode==='sandbox')return false;this.points=Math.min(100,this.points+1);if(half)this.game.ui.toast('HALFWAY · +1 ADAPTATION POINT','Spend it in Adaptations. Engineering branches open at Moon scale.','aqua');return true;}
    updateProgress(){const q=this.goal();if(q&&q.ratio>=.5)this.award(q.next,true);}
    restoreClaims(saved){if(saved){for(const k of saved)this.claims.add(k);return;}const q=this.goal(),base=q?.base||this.game.player.m;for(let i=1;i<=40;i++){const next=5**i;if(next<=base*(1+1e-10)){this.claims.add(this.claimKey(next,true));this.claims.add(this.claimKey(next,false));}}if(q&&q.ratio>=.5)this.claims.add(this.claimKey(q.next,true));}
    cost(id){const u=this.definition(id);if(!u)return null;if(u.legacy)return{ap:1,rp:0,raw:0};if(u.free)return{ap:0,rp:0,raw:0};if(u.raw)return{ap:0,rp:0,raw:u.raw};const late=this.get(id)>=2||(this.game.industry?.researchTime||0)>=600;return{ap:0,rp:late||u.advanced?2:1,raw:0};}
    requirements(id){const u=this.definition(id),g=this.game,i=g.industry;if(!u)return['Unknown adaptation'];const out=[];if(g.network?.active&&(!u.legacy||!['pull','range','capture','thrust','brake','boost','yield','armor','resist','scanner','magnet'].includes(id)))out.push('Unavailable in the shared arena');if(this.get(id)>=u.max)out.push('Fully developed');if(!g.player||A.scaleStage(g.player)<u.stage)out.push(A.STAGES[u.stage]?.name+' required');const gate=u.legacy?null:A.BRANCHES[u.branch].gate;if(gate&&!this.get(gate)&&!u.requires.some(([key])=>key===gate))out.push(this.definition(gate).name+' required');for(const [key,rank]of u.requires||[])if(this.get(key)<rank)out.push(this.definition(key).name+' rank '+rank+' required');if(g.player&&A.appearance(g.player).type==='nebula'&&['pull','range','capture','amplify','magnet','harmony','disk','yield'].includes(id))out.push('No gravitational core on this route');if(id==='guardian'&&g.player&&!['star','brown','blackhole'].includes(A.appearance(g.player).type))out.push('A star or black hole is required');if(id==='galaxy_core'&&g.player&&A.appearance(g.player).type!=='blackhole')out.push('A black hole is required');const c=this.cost(id);if(this.points<c.ap)out.push(c.ap+' adaptation point required');if((i?.research||0)<c.rp)out.push(c.rp+' Research Point'+(c.rp===1?'':'s')+' required');if((i?.raw||0)<c.raw)out.push(c.raw+' Raw Material required');return out;}
    offer(){this.choices=A.UPGRADES.filter(u=>!this.requirements(u.id).length);return this.choices;}
    select(id){if(this.game.network?.active)return this.game.network.buy(id);if(this.requirements(id).length)return false;const c=this.cost(id),g=this.game,i=g.industry;this.points-=c.ap;i.research-=c.rp;i.raw-=c.raw;this.levels[id]=this.get(id)+1;this.choices=[];i.installed(id);g.audio.play('upgrade');g.ui.toast(this.definition(id).legacy?'ADAPTATION DEVELOPED':'INSTALLATION COMPLETE',this.definition(id).name+' · rank '+this.get(id),'aqua');A.Save.checkpoint(g);g.ui.showUpgrades(this.definition(id).legacy?'adaptations':'engineering');return true;}
  };
})(window.AC);
