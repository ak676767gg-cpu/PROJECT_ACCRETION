/* Optional developer diagnostics. This file is not loaded by the game. */
'use strict';
(function (root) {
  function runTests(A) {
    const results = [], originalData = A.Save.data, originalWrite = A.Save.write,originalVault=A.Save.vault,originalSession=A.Save.sessionOpen;
    A.Save.vault=JSON.parse(JSON.stringify(originalVault));A.Save.vault.mode='journey';A.Save.sessionOpen=false;
    A.Save.data = JSON.parse(JSON.stringify(originalData)); A.Save.write = () => {};
    const assert = (condition, message) => { if (!condition) throw new Error(message); };
    const near = (a, b, epsilon = 1e-8) => Math.abs(a - b) <= epsilon * Math.max(1, Math.abs(b));
    const noop = () => {};
    function game(m = 1) {
      const g = { state: 'playing', time: 0, tick: 0, difficulty: 'standard', stats: { peak: m, stage: A.stage(m), captures: 0, defeats: 0, totalGained: 0, maxVelocity: 0, largestCollision: 0 },
        renderer: { shake: 0 }, ui: { toast: noop }, audio: { play: noop }, effects: { burst: noop, ring: noop, label: noop, jet: noop },
        boostEnergy: 1, boostSound: 0, boosting: false, pulseCooldown: 0, amplifyCooldown: 0, amplifyTime: 0, shellCooldown: 0, lastDamage: -20, lastWarning: 0,
        resume() { this.state = 'playing'; }, end(reason) { this.state = 'over'; this.player.alive = false; this.reason = reason; } };
      g.world = new A.World(g, 981726); g.player = g.world.make(0, 0, m, 'player'); g.player.name = 'You'; g.upgrades = new A.Upgrades(g);g.industry=new A.Industry(g);g.ui.showUpgrades=noop;
      g.input = { keys: new Set(), direction: () => ({ x: 0, y: 0 }), game: g, update: A.Input.prototype.update };
      g.step = (n = 1) => { for (let i = 0; i < n && g.state === 'playing'; i++) { g.time += 1 / 60; g.tick++; A.Physics.step(g, 1 / 60); } };
      return g;
    }
    function test(name, fn) { const start = performance.now(); try { fn(); results.push({ name, pass: true, ms: performance.now() - start }); } catch (e) { results.push({ name, pass: false, error: e.message, ms: performance.now() - start }); } }
    try {
      test('Astronomical landmarks, continuity, and tiny-fragment units', () => {
        for (let i = 0; i < A.STAGES.length; i++) { assert(A.stage(5 ** i) === i, 'Wrong stage ' + i); assert(near(A.kg(5 ** i), A.STAGES[i].kg), 'Wrong mass landmark ' + i); assert(A.kg(5 ** i * 1.01) > A.kg(5 ** i), 'Nonmonotonic scale'); }
        assert(near(A.kg(.01), 10000), 'Sub-starting mass lost'); assert(A.classFor(5 ** 22).name === 'The Interstallar', 'Final class lost during continued growth'); assert(A.kg(5 ** 22) > A.kg(5 ** 21), 'Final-class mass stopped growing');
      });
      test('Ordinary classes keep uniform movement and compact remnants apply their speed multiplier',()=>{
        let reference=null;
        for(let stage=0;stage<A.STAGES.length;stage++){
          const g=game(5**stage),p=g.player,u=A.unit(p.m);g.input.direction=()=>({x:1,y:0});g.step(300);
          const v=p.vx/u/A.Supernova.buffs(p).speed;
          if(reference===null)reference=v;
          assert(near(v,reference,1e-7),'Movement changed at class '+stage);
          assert(near(p.controlAx/u,A.FLIGHT.acceleration*A.Supernova.buffs(p).speed),'Thrust changed at class '+stage);
        }
      });
      test('Boost, upgrades and braking retain scale-relative movement with remnant modifiers',()=>{
        let reference=null;
        for(const stage of [0,4,5,6,7,8,9,15,20,21]){
          const g=game(5**stage),p=g.player,u=A.unit(p.m);g.upgrades.levels.thrust=2;g.upgrades.levels.boost=1;
          g.input.direction=()=>({x:1,y:0});g.input.keys.add('Space');g.step(30);
          const v=p.vx/u/A.Supernova.buffs(p).speed;
          if(reference===null)reference=v;
          assert(near(v,reference),'Boost changed at class '+stage);
          g.input.clear=()=>{};g.input.keys.clear();g.input.direction=()=>({x:0,y:0});g.input.keys.add('ShiftLeft');
          g.step(60);assert(p.vx/u<reference*.5,'Braking failed at class '+stage);
        }
      });
      test('Spatial partition finds neighbors across cell boundaries', () => {
        const h = new A.SpatialHash(), bodies = [new A.Body().reset(1, -1, -1, 1, 'rock', 1), new A.Body().reset(2, 150, 150, 1, 'rock', 2)];
        h.build(bodies, 150); const found = []; h.query(0, 0, 155, b => found.push(b.id)); assert(found.length === 2, 'Boundary neighbor missing');
        const all = []; h.query(0, 0, 1e20, b => all.push(b.id)); assert(all.length === 2, 'Huge-query fallback failed');
      });
      test('Bound objects follow curved orbits instead of radial homing', () => {
        const g = game(10), p = g.player, d = 110 * A.unit(p.m), b = g.world.make(d, 0, .1); b.vy = Math.sqrt(A.Physics.mu(g, p) / d) * .85;
        g.step(120); assert(b.alive && b.bound === p.id, 'Orbit not bound'); assert(b.y > 20 && b.x < d, 'No curved motion'); assert(b.boundTime > 1, 'Capture tracking lost');
      });
      test('Bound orbits dissipate energy into eventual absorption', () => {
        const g = game(10), p = g.player, d = 90 * A.unit(p.m), b = g.world.make(d, 0, .1); b.vy = Math.sqrt(A.Physics.mu(g, p) / d) * .8;
        for (let i = 0; i < 7200 && b.alive; i++) g.step();
        assert(!b.alive && p.m > 10 && g.stats.captures > 0, 'Orbit never settled');
      });
      test('Above-escape-speed objects can leave a gravity well', () => {
        const g = game(10), p = g.player, d = 180 * A.unit(p.m), b = g.world.make(d, 0, .1); b.vx = Math.sqrt(2 * A.Physics.mu(g, p) / d) * 1.5;
        g.step(180); assert(b.alive && !b.bound, 'Escaping body falsely captured'); assert(Math.hypot(b.x, b.y) > d, 'Escape failed');
      });
      test('Massive bodies deflect passing flight trajectories', () => {
        const g = game(), p = g.player; p.x = -320; p.y = 150; p.vx = 110; g.world.make(0, 0, 8, 'wanderer');
        g.step(180); assert(p.alive && Math.abs(p.vy) > 2, 'No slingshot deflection'); assert(Number.isFinite(p.vx), 'Unstable slingshot');
      });
      test('Absorption conserves mass including shed fragments and mixes momentum', () => {
        const g = game(10), p = g.player, b = g.world.make(12, 0, 1); p.vx = 10; b.vx = -5;
        A.Physics.collide(g, p, b); const total = g.world.bodies.filter(b => b.alive).reduce((sum, b) => sum + b.m, 0);
        assert(near(total, 11), 'Mass disappeared in capture'); assert(near(p.vx, (100 - 5 * .86) / 10.86), 'Captured momentum incorrect'); assert(!b.alive, 'Absorbed body still active');
      });
      test('Similar-mass collisions bounce and produce recoverable debris', () => {
        const g = game(); g.player.x = 1000; const a = g.world.make(0, 0, 1), b = g.world.make(20, 0, 1); a.vx = 20; b.vx = -20;
        A.Physics.collide(g, a, b); assert(a.vx < 0 && b.vx > 0, 'No collision impulse'); assert(g.world.bodies.some(b => b.kind === 'debris'), 'No debris');
        assert(near(g.world.bodies.filter(b => b.alive).reduce((sum, b) => sum + b.m, 0), 3), 'Impact lost matter');
      });
      test('High-speed impacts shed more mass than slow captures', () => {
        const slow = game(10), fast = game(10), a = slow.world.make(10, 0, 1), b = fast.world.make(10, 0, 1); b.vx = 200;
        A.Physics.collide(slow, slow.player, a); A.Physics.collide(fast, fast.player, b);
        assert(fast.player.m < slow.player.m, 'Speed does not change accretion'); assert(fast.world.bodies.filter(b => b.kind === 'debris').length > slow.world.bodies.filter(b => b.kind === 'debris').length, 'Speed does not change debris');
      });
      test('A stronger rival cannot end a healthy player in one impact', () => {
        const g = game(), p = g.player, b = g.world.make(20, 0, 20, 'ai'); b.vx = -200;
        A.Physics.collide(g, p, b); const hp = p.hp; assert(g.state === 'playing' && hp > 0, 'Instant absorption'); assert(p.invulnerable > 2, 'No escape window');
        p.cooldown = b.cooldown = 0; A.Physics.collide(g, p, b); assert(near(p.hp, hp), 'Invulnerability failed');
      });
      test('Spawn protection allows safe captures but blocks dangerous impacts', () => {
        const g = game(), p = g.player; p.grace = 12; const food = g.world.make(10, 0, .1); A.Physics.collide(g, p, food);
        assert(!food.alive && p.m > 1, 'Safe starter capture was blocked'); const threat = g.world.make(10, 0, 10, 'ai'); A.Physics.collide(g, p, threat);
        assert(p.hp === 100 && g.state === 'playing', 'Spawn protection failed');
      });
      test('Repeated severe impacts eventually produce game over', () => {
        const g = game(), p = g.player, b = g.world.make(20, 0, 30, 'ai'); b.name = 'Test rival';
        for (let i = 0; i < 5 && g.state !== 'over'; i++) { p.invulnerable = p.cooldown = b.cooldown = 0; p.vx = 200; b.vx = -200; A.Physics.collide(g, p, b); }
        assert(g.state === 'over' && !p.alive, 'Cohesion never failed');
      });
      test('Relaxed difficulty reduces damage and fragmentation', () => {
        const a = game(), b = game(); b.difficulty = 'relaxed'; A.Physics.collide(a, a.player, a.world.make(20, 0, 10)); A.Physics.collide(b, b.player, b.world.make(20, 0, 10));
        assert(b.player.hp > a.player.hp && b.player.m > a.player.m, 'Relaxed modifier missing');
      });
      test('AI competitors absorb and evolve without player participation', () => {
        const g = game(); g.player.x = -4000;
        const a = g.world.make(0, 0, 4.9, 'ai'); a.name = 'Grower'; a.personality = 'efficient'; a.evolution = 0;
        const prey = g.world.make(15, 0, 1, 'ai'); prey.name = 'Prey'; prey.personality = 'cautious';
        A.Physics.collide(g, a, prey); g.step(5); assert(!prey.alive && a.m > 5 && a.evolution === 1, 'Independent AI growth/evolution failed');
      });
      test('Cautious AI flees a nearby dominant body', () => {
        const g = game(); g.player.x = 1000; const ai = g.world.make(0, 0, 1, 'ai'); ai.personality = 'cautious'; g.world.make(100, 0, 10, 'wanderer'); g.world.rebuild(); A.AI.choose(g, ai); assert(ai.steerX < -.5, 'Cautious AI did not retreat');
      });
      test('Aggressive AI hunts a weaker player', () => {
        const g = game(.5); g.player.x = 100; const ai = g.world.make(0, 0, 1, 'ai'); ai.personality = 'aggressive'; g.world.rebuild(); A.AI.choose(g, ai); assert(ai.target === g.player.id && ai.steerX > 0, 'Aggressor ignored prey');
      });
      test('Deterministic branch upgrades require both currencies and prerequisites',()=>{
        const g=game(5**4),u=g.upgrades;assert(u.select('outpost'),'Free mining unavailable');g.industry.raw=25;assert(u.select('research_centre'),'Raw-only research build failed');u.points=1;assert(!u.select('tech_speed'),'Research requirement bypassed');g.industry.research=2;assert(u.select('tech_speed'),'Branch not installed');u.points=1;assert(u.select('thrust')&&u.get('thrust')===1,'Stackable drive not installed');const before=A.Physics.mu(g,g.player);u.levels.pull=2;assert(near(A.Physics.mu(g,g.player)/before,1.44),'Gravity ranks do not stack');
      });
      test('Boost consumes energy and increases acceleration', () => {
        const g = game(); g.input.direction = () => ({ x: 1, y: 0 }); g.input.keys.add('Space'); g.upgrades.levels.boost = 1; g.step();
        assert(g.boosting && g.boostEnergy < 1 && g.player.vx > 2, 'Boost did not engage');
      });
      test('Save serialization preserves position, velocity, rivals and upgrades', () => {
        const g = game(25); g.player.x = 1024; g.player.vx = 23; g.time = 42; g.upgrades.levels.pull = 2; g.upgrades.points = 1; g.world.make(600, 20, 31, 'ai').name = 'Atlas';
        A.Save.checkpoint(g); const data = JSON.parse(JSON.stringify(A.Save.data.run)); assert(A.Save.validRun(data), 'Saved run rejected');
        const restore = game(); restore.world = new A.World(restore, data.seed); restore.world.restore(data);
        assert(restore.player.x === 1024 && restore.player.vx === 23 && restore.player.m === 25, 'Player state changed'); assert(restore.world.bodies.some(b => b.name === 'Atlas'), 'Rival missing'); assert(data.upgrades.pull === 2 && data.points === 1, 'Upgrades missing');
      });
      test('Repeated checkpoints do not double-count lifetime statistics', () => {
        const g = game(); const before = A.Save.data.lifetime.seconds; g.time = 30; A.Save.checkpoint(g); A.Save.checkpoint(g); assert(near(A.Save.data.lifetime.seconds - before, 30), 'Time counted twice'); g.time = 45; A.Save.finish(g); assert(near(A.Save.data.lifetime.seconds - before, 45), 'Finish counted twice');
      });
      test('Corrupt and non-finite saved bodies are rejected', () => {
        const g = game(); A.Save.checkpoint(g); const bad = JSON.parse(JSON.stringify(A.Save.data.run)); bad.player.vx = Infinity; assert(!A.Save.validRun(bad), 'Infinite velocity accepted'); bad.player.vx = 0; bad.player.m = -10; assert(!A.Save.validRun(bad), 'Negative mass accepted');
      });
      test('Procedural streaming maintains resources while travelling', () => {
        const g = game(); for (let i = 0; i < 22; i++) { g.player.x += 500; g.world.rebuild(); g.world.update(1); }
        assert(g.world.bodies.filter(b => b.alive).length > 150, 'Empty universe'); assert(g.world.bodies.length < 1250, 'Unbounded population'); assert(g.world.bodies.some(b => b.kind === 'ai'), 'No competitors');
      });
      test('Gravity remains finite at fifteen astronomical stages', () => {
        for (let stage = 0; stage < 15; stage++) {
          const g = game(5 ** stage), s = A.unit(g.player.m); g.world.make(80 * s, 15 * s, g.player.m * .03); g.world.make(350 * s, -80 * s, g.player.m * 3, 'wanderer'); g.step(30);
          assert(g.world.bodies.every(b => [b.x, b.y, b.vx, b.vy, b.r, b.m].every(Number.isFinite)), 'Non-finite stage ' + stage);
        }
      });
      test('Very unequal masses avoid pathological spatial scans', () => {
        const g = game(); const big = g.world.make(1e8, 1e8, 1e20, 'ai'); big.personality = 'explorer'; g.step(2); assert(Number.isFinite(big.x), 'Extreme competitor destabilized simulation');
      });
      // Integrated cosmic fixtures keep the same isolated runtime and never touch the live save.
      function cosmicGame(stage=9) {
        const g=game(5**stage);g.cosmic=new A.Cosmic(g);g.cosmic.stage=stage;g.cosmic.spawnIn=1e9;g.cosmic.condenseIn=1e9;
        g.step=(n=1)=>{for(let i=0;i<n&&g.state==='playing';i++){g.time+=1/60;g.tick++;A.Physics.step(g,1/60);g.cosmic.update(1/60);}};
        return g;
      }
      function satellite(g,owner,d,ratio=.002,phase=0,inclination=0) {
        const b=g.world.make(owner.x+Math.cos(phase)*d,owner.y+Math.sin(phase)*d,owner.m*ratio),v=Math.sqrt((A.Physics.mu(g,owner)+A.Physics.mu(g,b))/d);
        b.vx=owner.vx-Math.sin(phase)*v;b.vy=owner.vy+Math.cos(phase)*v*Math.cos(inclination);b.vz=v*Math.sin(inclination);return b;
      }
      test('Stable orbit classification distinguishes circular capture and escape',()=>{
        const g=cosmicGame(),p=g.player,u=A.unit(p.m),b=satellite(g,p,230*u);
        assert(A.orbitElements(g,b,p).e<.001,'Circular orbit incorrect');g.step(900);assert(b.orbitStable&&b.parentId===p.id,'Stable capture failed');
        b.vx+=100*u;g.step(120);assert(!b.parentId&&b.orbitState==='ESCAPE'||b.orbitState==='FLYBY','Escape classification failed');
      });
      test('Rival star builds a stable hierarchical planet and moon system',()=>{
        const g=cosmicGame(),u=A.unit(g.player.m);g.player.x=-2500*u;
        const rival=g.world.make(0,0,g.player.m,'ai');rival.personality='efficient';rival.name='Kepler';
        const planet=satellite(g,rival,440*u,.008);planet.parentId=rival.id;
        const moon=satellite(g,planet,20*u,.003,0,.12);g.step(1500);
        assert(planet.orbitStable&&planet.parentId===rival.id,'Rival planet not stable');assert(moon.orbitStable&&moon.parentId===planet.id,'Rival moon hierarchy lost');assert(g.cosmic.systems.get(rival.id).bound>=2,'Rival summary missing');
      });
      test('Player can steal a rival world when the new gravity well dominates',()=>{
        const g=cosmicGame(),p=g.player,u=A.unit(p.m);p.x=-2500*u;
        const rival=g.world.make(0,0,p.m,'ai');rival.personality='efficient';const b=satellite(g,rival,300*u);g.step(900);assert(b.systemOwner===rival.id,'Original ownership missing');
        p.x=b.x-150*u;p.y=b.y;p.vx=b.vx;p.vy=b.vy;p.setMass(rival.m*4);g.world.rebuild();g.cosmic.byId=new Map(g.world.bodies.filter(b=>b.alive).map(b=>[b.id,b]));g.cosmic.detect(.3);
        assert(b.parentId===p.id&&b.systemOwner===p.id,'World not transferred');assert(!b.orbitStable,'Transfer falsely retained stability');
      });
      test('Passing massive rival destabilizes the player outer system',()=>{
        const g=cosmicGame(),p=g.player,u=A.unit(p.m),b=satellite(g,p,400*u);g.step(900);assert(b.orbitStable,'Initial orbit missing');
        const rival=g.world.make(b.x+170*u,b.y,p.m*2,'ai');rival.personality='aggressive';rival.vx=b.vx;rival.vy=b.vy;g.world.rebuild();g.cosmic.byId.set(rival.id,rival);g.cosmic.detect(.3);
        assert(!b.orbitStable||b.systemOwner!==p.id,'Encounter had no consequence');
      });
      test('Rival black hole strips stored disk matter without instant mass credit',()=>{
        const g=cosmicGame(15),p=g.player,u=A.unit(p.m),b=satellite(g,p,p.r*6,.002);g.cosmic.packet(p,b,b.m,true);b.alive=false;
        const q=g.cosmic.packets[0],rival=g.world.make(q.x+35*u,q.y,p.m*3,'ai');rival.personality='cautious';rival.vx=q.vx;rival.vy=q.vy;
        const before=q.m,rivalMass=rival.m;g.world.rebuild();g.cosmic.parcelSources=g.world.sources.map(b=>({b,mu:A.Physics.mu(g,b),range:A.Physics.influence(g,b)}));
        for(let i=0;i<80;i++)g.cosmic.disturbParcel(q,p,1/60);
        assert(q.owner===rival.id,'Disk not stripped');assert(q.m===before&&rival.m===rivalMass,'Transfer immediately accreted or lost mass');
      });
      test('Black-hole inner transfer has a meaningful delay and conserves mass',()=>{
        const g=cosmicGame(15),p=g.player,b=satellite(g,p,p.r*1.03,.002),m=p.m,amount=b.m;
        g.cosmic.packet(p,b,amount,true);b.alive=false;g.step(300);assert(p.m===m,'Credited before minimum delay');g.step(600);
        assert(p.m>m&&p.m<m+amount*.6,'Delay is absent or feeding stalled');const stored=g.cosmic.packets.reduce((s,q)=>s+q.m,0);assert(near(p.m+stored,m+amount),'Inner transfer lost mass');
      });
      test('Gentle stellar movement preserves bound, independent orbital motion',()=>{
        const g=cosmicGame(),p=g.player,u=A.unit(p.m),b=satellite(g,p,230*u,.0003);
        g.step(840);assert(b.orbitStable,'No initial stable orbit');const before=b.x-p.x;
        g.input.direction=()=>({x:1,y:0});g.step(180);
        assert(b.alive&&b.parentId===p.id,'Normal cruise ejected body');
        assert(Math.abs(b.x-p.x-before)>u,'Rigid attachment replaced orbital motion');
        assert(p.vx/u>140,'Class-dependent speed reduction returned');
      });
      test('Orbital assistance retains existing stress, harmony ranks and disruptive boosts',()=>{
        for(const stage of [9,15]){
          const g=cosmicGame(stage),p=g.player,u=A.unit(p.m),b=satellite(g,p,230*u,.0003);
          b.parentId=p.id;b.orbitStable=true;g.cosmic.allMembers=[b];p.controlAx=p.ax=A.FLIGHT.acceleration*u;
          g.cosmic.forces(1/60);assert(near((p.controlAx-b.ax)/u,(stage>=15?3:6)*.18),'Base orbital stress changed');
          g.upgrades.levels.harmony=3;b.ax=0;g.cosmic.forces(1/60);
          assert(near((p.controlAx-b.ax)/u,(stage>=15?3:6)*.06),'Harmony lost its relative effect');
          b.ax=0;g.boosting=true;g.cosmic.forces(1/60);assert(b.ax===0,'Boost was stabilized');
        }
      });
      test('Orbit carry stops accelerating satellites when the star reaches cruise equilibrium',()=>{
        const g=cosmicGame(),p=g.player,u=A.unit(p.m),b=satellite(g,p,230*u,.0003),dt=1/60;
        b.parentId=p.id;b.orbitStable=true;g.cosmic.allMembers=[b];p.controlAx=p.ax=A.FLIGHT.acceleration*u;
        p.vx=(A.FLIGHT.cruise+A.FLIGHT.acceleration*dt/Math.expm1(3*dt))*u;
        g.cosmic.forces(dt);assert(Math.abs(b.ax/u)<1e-8,'Satellite kept receiving cruise thrust');
      });
      test('Extended achievements and lifetime counters are idempotent',()=>{
        const g=cosmicGame(),p=g.player,u=A.unit(p.m);for(let i=0;i<3;i++)satellite(g,p,(220+i*70)*u,.002,i*2);
        const base={...A.Save.data.lifetime};g.step(2400);assert(A.Save.data.achievements.includes('orbit')&&A.Save.data.achievements.includes('system'),'Orbit/system achievements missing');
        assert(g.stats.planetsCaptured===3&&g.stats.systemsBuilt===1,'Capture counters incorrect');A.Save.checkpoint(g);A.Save.checkpoint(g);
        assert(A.Save.data.lifetime.planetsCaptured-(base.planetsCaptured||0)===3,'Repeated checkpoint duplicated planets');assert(A.Save.data.lifetime.systemsBuilt-(base.systemsBuilt||0)===1,'Repeated checkpoint duplicated system');
      });
      test('A genuine rotating reservoir unlocks the disk achievement',()=>{
        const g=cosmicGame(15),p=g.player,b=satellite(g,p,p.r*4,.002);g.cosmic.packet(p,b,b.m,true);b.alive=false;g.step(240);assert(A.Save.data.achievements.includes('disk'),'Disk achievement missing');assert(g.cosmic.diskMass>0,'Disk mass missing');
      });
      test('Black-hole merger achievement requires substantial inner assimilation',()=>{
        const g=cosmicGame(17),p=g.player,b=satellite(g,p,p.r*1.02,.05);b.form='blackhole';g.cosmic.packet(p,b,b.m,false);b.alive=false;g.step(300);
        assert(!g.cosmic.milestones.merger,'Merger credited at capture');g.step(1500);assert(g.cosmic.milestones.merger,'Merger not credited after assimilation');
      });
      test('Surviving a disturbance awards the existing achievement system',()=>{
        const g=cosmicGame(),p=g.player,u=A.unit(p.m);satellite(g,p,220*u);g.step(900);g.cosmic.disturbance={until:g.time+.5,hadSystem:true};g.step(60);assert(g.cosmic.milestones.endured,'Survival not recognized');
      });
      test('Rival hierarchy, disk ownership and new counters survive checkpoint',()=>{
        const g=cosmicGame(),p=g.player,u=A.unit(p.m);p.x=-2500*u;const rival=g.world.make(0,0,p.m,'ai');rival.personality='efficient';const b=satellite(g,rival,230*u);g.step(900);g.cosmic.packet(rival,b,b.m*.1,true);A.Save.checkpoint(g);
        const saved=JSON.parse(JSON.stringify(A.Save.data.run));assert(A.Save.validRun(saved),'Snapshot rejected');const restored=cosmicGame();restored.world=new A.World(restored,saved.seed);restored.world.restore(saved);restored.cosmic=new A.Cosmic(restored,saved.cosmic);restored.world.rebuild();restored.step(30);
        const world=restored.world.bodies.find(q=>q.id===b.id);assert(world.systemOwner===rival.id&&world.parentId===rival.id,'Rival ownership lost');assert(restored.cosmic.packets.some(q=>q.owner===rival.id),'Rival disk lost');
      });
      test('A destroyed parent safely releases children without a reference error',()=>{
        const g=cosmicGame(),p=g.player,u=A.unit(p.m),planet=satellite(g,p,430*u,.008);planet.parentId=p.id;const moon=satellite(g,planet,20*u,.003);g.step(1000);planet.alive=false;g.step(2);assert(Number.isFinite(moon.x),'Orphan moon failed');
      });
      test('System adaptations stack in the deterministic researched tree',()=>{
        const g=cosmicGame();g.player.evolution=9;g.upgrades.levels.tech_stellar=1;g.industry.research=1;g.upgrades.points=1;g.upgrades.offer();assert(g.upgrades.choices.some(q=>q.id==='harmony'),'Deterministic system upgrade not available');assert(g.upgrades.select('harmony'),'Selection failed');assert(g.upgrades.get('harmony')===1&&g.upgrades.points===0,'Rank not recorded');
      });
      test('Fifty unique companion recipes span five disclosed rarities',()=>{
        assert(A.PETS.length===50&&new Set(A.PETS.map(p=>p.id)).size===50,'Catalog count');assert(A.RARITIES.map((r,i)=>A.PETS.filter(p=>p.rarity===i).length).join(',')==='20,14,8,5,3','Rarities');for(const p of A.PETS){const r=A.RARITIES[p.rarity];assert(r.water>0&&r.dna>0&&r.time>=20,'Invalid recipe');}
      });
      test('Asteroid collisions collect water and DNA once, without instant mass credit',()=>{
        A.Save.data.lifeLab=A.lifeDefaults();const g=cosmicGame(0);g.life=new A.Life(g);const b=g.world.make(g.player.r,0,.1);b.material='ice';b.water=3;b.dna=2;A.Physics.collide(g,g.player,b);assert(g.life.pendingWater===3&&g.life.pendingDNA===2,'No collision collection');assert(g.player.m===1,'Instant mass credit');g.life.collect(b);assert(g.life.pendingWater===3,'Double collection');A.Save.checkpoint(g);assert(A.Save.data.lifeLab.water===3&&A.Save.data.lifeLab.dna===2,'Resources missing');assert(!A.Save.data.run.bodies.some(q=>q.id===b.id),'Consumed resource asteroid persisted');
      });
      test('Spawned fields carry finite life samples and pooled bodies reset resources',()=>{
        const g=game();for(let i=0;i<12;i++)g.world.field(i*100,0,24,80,1);const icy=g.world.bodies.filter(b=>b.water>0);assert(icy.length>0&&icy.some(b=>b.dna>0),'Seeded fields contain no life samples');const b=icy[0];b.reset(100,0,0,.1,'rock',2);assert(b.water===0&&b.dna===0&&!b.lifeClaimed,'Recycled resources leaked');
      });
      test('DNA egg recipes deduct exact costs and reject duplicates or insufficient resources',()=>{
        A.Save.data.lifeLab=A.lifeDefaults();const g=game();g.life=new A.Life(g);const d=A.Save.data.lifeLab;assert(!g.life.craft('pet-01'),'Free egg');d.water=100;d.dna=40;assert(g.life.craft('pet-01'),'No egg');assert(d.water===88&&d.dna===36,'Wrong costs');assert(!g.life.craft('pet-01')&&!g.life.craft('unknown'),'Duplicate or unknown egg');g.life.craft('pet-02');g.life.craft('pet-03');assert(!g.life.craft('pet-04')&&d.eggs.length===3,'Unbounded incubator');
      });
      test('Every named DNA recipe can hatch and equip its exact companion',()=>{
        A.Save.data.lifeLab=A.lifeDefaults();const g=game();g.life=new A.Life(g);const d=A.Save.data.lifeLab;d.water=10000;d.dna=10000;for(const p of A.PETS){assert(g.life.craft(p.id),'Craft '+p.id);assert(!g.life.hatch(p.id),'Premature hatch');g.life.update(A.RARITIES[p.rarity].time);assert(g.life.hatch(p.id),'Hatch '+p.id);assert(!g.life.hatch(p.id),'Repeated hatch');assert(g.life.equip(p.id)&&d.equipped===p.id,'Equip '+p.id);}assert(d.owned.length===50&&d.eggs.length===0,'Catalog incomplete');assert(A.Save.data.achievements.includes('lifeArchive'),'Archive achievement missing');
      });
      test('Companion buffs resolve all five rarity tiers including the new shape passives',()=>{
        A.Save.data.lifeLab=A.lifeDefaults();const g=game();g.life=new A.Life(g);const d=A.Save.data.lifeLab;
        for(let tier=0;tier<A.RARITIES.length;tier++){
          const pet=A.PETS.find(p=>p.rarity===tier);assert(pet,'No companion at tier '+tier);
          d.owned=[pet.id];d.equipped=pet.id;g.life.buffId=undefined;
          const b=g.life.buffs(),base=A.PET_BUFFS[tier];
          assert(near(b.thrust,base.thrust)&&near(b.gravity,base.gravity)&&near(b.defense,base.defense),'Universal buffs wrong at tier '+tier);
          const p=A.petPassive(pet);
          assert(A.PET_PASSIVES[p.key],'Unknown passive key '+p.key);
          assert(near(b[p.key],A.PET_PASSIVES[p.key].values[tier]),'Passive value wrong at tier '+tier);
          assert(b.passive&&b.passive.key===p.key&&typeof p.text==='string'&&p.text.length>0,'Passive not described at tier '+tier);
          for(const key of A.PASSIVE_KEYS)if(key!==p.key)assert(b[key]===0,'Unrelated passive leaked at tier '+tier);
        }
        // Every catalogued shape must resolve to a real passive, and passives must rise with rarity.
        for(const pet of A.PETS){const p=A.petPassive(pet);assert(Number.isFinite(p.value)&&p.value>0,'Bad passive for '+pet.id);}
        for(const key of A.PASSIVE_KEYS){const v=A.PET_PASSIVES[key].values;for(let i=1;i<v.length;i++)assert(v[i]>v[i-1],'Passive '+key+' not monotonic');}
        d.owned=[];d.equipped=null;g.life.buffId=undefined;
        const none=g.life.buffs();assert(none.thrust===0&&none.passive===null,'Unequipped state not neutral');
        for(const key of A.PASSIVE_KEYS)assert(none[key]===0,'Unequipped passive not zero: '+key);
      });
      test('Discovery wheel maps the documented 59/35/5/1 odds across ten thousand samples',()=>{
        // Seeded rather than Math.random: at n=10,000 a one-point tolerance is only about two
        // standard deviations for the 35% bucket, so an unseeded sample would fail intermittently.
        const roll=A.rng(20260917),counts={0:0,2:0,3:0,4:0};
        for(let i=0;i<10000;i++){const t=A.Life.wheelTier(roll());assert(counts[t]!==undefined,'Unexpected tier '+t);counts[t]++;}
        const pct=t=>counts[t]/10000*100;
        // The same mapping over an exact even sweep, where the proportions are analytic.
        const even={0:0,2:0,3:0,4:0};
        for(let i=0;i<10000;i++)even[A.Life.wheelTier((i+.5)/10000)]++;
        assert(even[0]===5900&&even[2]===3500&&even[3]===500&&even[4]===100,'Even sweep mismatch '+JSON.stringify(even));
        // One percentage point of tolerance, as documented in the Life Lab panel.
        assert(Math.abs(pct(0)-59)<=1,'Common odds '+pct(0).toFixed(2)+'%');
        assert(Math.abs(pct(2)-35)<=1,'Rare odds '+pct(2).toFixed(2)+'%');
        assert(Math.abs(pct(3)-5)<=1,'Epic odds '+pct(3).toFixed(2)+'%');
        assert(Math.abs(pct(4)-1)<=1,'Legendary odds '+pct(4).toFixed(2)+'%');
        // Deterministic boundary checks so the mapping itself cannot drift.
        assert(A.Life.wheelTier(0)===0&&A.Life.wheelTier(.5899)===0,'Common boundary');
        assert(A.Life.wheelTier(.59)===2&&A.Life.wheelTier(.9399)===2,'Rare boundary');
        assert(A.Life.wheelTier(.94)===3&&A.Life.wheelTier(.9899)===3,'Epic boundary');
        assert(A.Life.wheelTier(.99)===4&&A.Life.wheelTier(.9999)===4,'Legendary boundary');
      });
      test('New lifetime statistics initialise, increment once, and survive a save round trip',()=>{
        const fresh=A.Save.cleanProfile(null);
        for(const key of ['lifetimeOrbits','lifetimeHatched','longestRun'])
          assert(fresh.lifetime[key]===0&&typeof fresh.lifetime[key]==='number','Missing default '+key);
        const g=cosmicGame(),p=g.player,u=A.unit(p.m);
        A.Save.data.lifetime.lifetimeOrbits=0;A.Save.data.lifetime.lifetimeHatched=0;A.Save.data.lifetime.longestRun=0;
        const b=satellite(g,p,230*u);g.step(900);
        assert(g.stats.orbitsEstablished>=1,'No orbit recorded');
        A.Save.checkpoint(g,'manual');
        const afterFirst=A.Save.data.lifetime.lifetimeOrbits;
        assert(afterFirst===g.stats.orbitsEstablished,'Orbit counter mismatch '+afterFirst+' vs '+g.stats.orbitsEstablished);
        // A second checkpoint with no new orbits must not double count.
        A.Save.checkpoint(g,'manual');
        assert(A.Save.data.lifetime.lifetimeOrbits===afterFirst,'Orbit counter double counted');
        // Hatching increments exactly once per companion.
        A.Save.data.lifeLab=A.lifeDefaults();g.life=new A.Life(g);
        const d=A.Save.data.lifeLab;d.water=10000;d.dna=10000;
        g.life.craft('pet-01');g.life.update(A.RARITIES[0].time);
        assert(g.life.hatch('pet-01'),'Hatch failed');
        assert(A.Save.data.lifetime.lifetimeHatched===1,'Hatch counter wrong');
        assert(!g.life.hatch('pet-01'),'Repeat hatch allowed');
        assert(A.Save.data.lifetime.lifetimeHatched===1,'Hatch counter double counted');
        g.time=412.5;A.Save.finish(g);
        assert(A.Save.data.lifetime.longestRun===412.5,'longestRun not recorded');
        // Round trip through the serialised vault without truncation or type coercion.
        const snapshot=JSON.parse(JSON.stringify(A.Save.data));
        const restored=A.Save.cleanProfile(snapshot);
        for(const key of ['lifetimeOrbits','lifetimeHatched','longestRun']){
          assert(typeof restored.lifetime[key]==='number','Type coerced for '+key);
          assert(restored.lifetime[key]===snapshot.lifetime[key],'Value changed for '+key);
        }
        assert(restored.lifetime.longestRun===412.5,'longestRun truncated to '+restored.lifetime.longestRun);
        // A shorter later run must not lower the record.
        A.Save.data.lifetime.longestRun=412.5;const g2=cosmicGame();g2.time=10;A.Save.finish(g2);
        assert(A.Save.data.lifetime.longestRun===412.5,'longestRun regressed');
      });
      test('System stability bonus is zero after a disturbance and returns after thirty quiet seconds',()=>{
        const g=cosmicGame(),p=g.player,u=A.unit(p.m);
        for(const d of [210,300,400])satellite(g,p,d*u,.004);
        g.step(60);
        // Advance the simulation clock directly rather than waiting out thirty real seconds.
        for(let i=0;i<70;i++)g.cosmic.detect(1);
        const s=g.cosmic.systems.get(p.id);
        assert(s&&s.stablePlanets>=3,'Expected three stable planets, got '+(s?s.stablePlanets:0));
        assert(g.cosmic.bonus>0,'No mature-system bonus after quiet time');
        const matured=g.cosmic.bonus;
        // A real destabilising event: collapsing the orbits makes them unsafe, which drains
        // stableTime, then stability, then healthyTime, and the bonus follows to zero.
        for(const b of g.cosmic.members)b.collapse=true;
        for(let i=0;i<40;i++)g.cosmic.detect(1);
        assert(g.cosmic.bonus===0,'Bonus survived destabilisation: '+g.cosmic.bonus);
        for(const b of g.cosmic.members)b.collapse=false;
        for(let i=0;i<80;i++)g.cosmic.detect(1);
        assert(g.cosmic.bonus>0&&near(g.cosmic.bonus,matured,1e-6),'Bonus did not recover');
      });
      test('Companion collection normalization preserves valid discoveries and rejects invalid eggs',()=>{
        const d=A.cleanLife({water:-1,dna:NaN,owned:['pet-01','pet-01','bad'],equipped:'bad',eggs:[{id:'pet-02',remaining:13},{id:'pet-02',remaining:13},{id:'pet-01',remaining:0},{id:'bad',remaining:4}]});assert(d.water===0&&d.dna===0&&d.owned.length===1&&d.equipped===null,'Bad metadata');assert(d.eggs.length===1&&d.eggs[0].remaining===13,'Bad egg normalization');
      });
      test('Planetary composition conserves weighted fractions and affects density',()=>{
        const g=cosmicGame(),b=g.world.make(0,0,5**5);b.composition={iron:1,rock:0,ice:0,gas:0};b.setMass(b.m);const r=b.r,m=b.m;A.Composition.mix(b,{iron:0,rock:0,ice:1,gas:0},m);b.setMass(m*2);assert(near(b.composition.iron,.5)&&near(b.composition.ice,.5),'Mixture not conserved');assert(b.r>r,'Density has no radius effect');
      });
      test('Boosted black-hole infall retains mass and resources after entering inner flow',()=>{
        A.Save.data.lifeLab=A.lifeDefaults();const g=cosmicGame(15),p=g.player,u=A.unit(p.m),m=p.m;g.life=new A.Life(g);
        p.vx=155*u;g.upgrades.levels.boost=1;g.input.keys.add('Space');g.input.direction=()=>({x:1,y:0});
        const b=g.world.make(p.r*4,0,m*.04);b.material='ice';b.water=2;b.dna=1;b.setMass(b.m);g.step(18);
        assert(!b.alive&&g.cosmic.packets.length>0,'No tidal stream');assert(g.life.pendingWater===0,'Remote capture credited resources');
        g.step(270);assert(p.m===m,'Six-second accretion delay removed');g.step(900);g.life.commit();
        assert(p.m>m&&g.stats.captures>0,'Boost outran accepted matter');assert(A.Save.data.lifeLab.water===2&&A.Save.data.lifeLab.dna===1,'Stream dropped resources');
      });
      test('An escaping tidal stream retains unclaimed resources without awarding them',()=>{
        A.Save.data.lifeLab=A.lifeDefaults();const g=cosmicGame(15),p=g.player,u=A.unit(p.m);g.life=new A.Life(g);
        const b=g.world.make(p.r*4,p.r*3,p.m*.001);b.water=2;b.dna=1;b.material='ice';b.vx=160*u;
        assert(g.cosmic.capture(p,b),'No stream');g.step(1500);g.life.commit();
        assert(A.Save.data.lifeLab.water===0&&A.Save.data.lifeLab.dna===0,'Flyby awarded resources');
        assert(g.world.bodies.some(q=>q.alive&&q.water===2&&q.dna===1),'Escaping stream lost its resources');
      });
      test('Physical collection cannot be awarded again by the transferred stream',()=>{
        A.Save.data.lifeLab=A.lifeDefaults();const g=cosmicGame(0),p=g.player;g.life=new A.Life(g);
        const b=g.world.make(p.r*.9,0,.1);b.water=2;b.dna=1;b.material='ice';A.Physics.collide(g,p,b);g.life.commit();g.step(900);g.life.commit();
        assert(A.Save.data.lifeLab.water===2&&A.Save.data.lifeLab.dna===1,'Resources awarded twice');assert(p.m>1,'Early accretion regressed');
      });
      test('Dense gas leaves parcel capacity for coherent asteroid captures',()=>{
        const g=cosmicGame(15),p=g.player;
        for(let i=0;i<160;i++)g.cosmic.packet(p,{x:i*p.r*2,y:0,vx:0,vy:0,m:p.m*.00001,seed:i+1,material:'gas'},p.m*.00001,true);
        assert(g.cosmic.packets.length===148,'Gas occupied collision reserve');const b=g.world.make(p.r*.9,0,p.m*.001);
        assert(g.cosmic.capture(p,b)&&!b.alive&&g.cosmic.packets.length===149,'Dense cloud blocked contact capture');
      });
      test('Escaped parcels reclaim inactive world slots while conserving payloads',()=>{
        const g=cosmicGame(15),p=g.player,b=g.world.make(p.r*4,0,p.m*.001);b.water=2;b.dna=1;b.material='ice';g.cosmic.packet(p,b,b.m,false);b.alive=false;
        while(g.world.bodies.length<g.world.budget())g.world.make(10000*A.unit(p.m),0,p.m*.00001);
        const q=g.cosmic.packets[0],m=q.m;g.cosmic.release(q);
        assert(q.m===0&&g.world.bodies.length===g.world.budget(),'Inactive slot not reclaimed');assert(g.world.bodies.some(b=>b.alive&&near(b.m,m)&&b.water===2&&b.dna===1),'Released matter lost');
      });
      test('Save validation accepts legacy parcels and rejects invalid new payloads',()=>{
        const g=cosmicGame(15),p=g.player,b=g.world.make(p.r,0,p.m*.001);g.cosmic.packet(p,b,b.m,false);b.alive=false;A.Save.checkpoint(g,'manual');
        const saved=JSON.parse(JSON.stringify(A.Save.data.run));assert(A.Save.validRun(saved),'New packet rejected');
        const q=saved.cosmic.packets[0];delete q.water;delete q.dna;delete q.feeding;delete q.carrierVx;delete q.carrierVy;delete q.carrierVz;assert(A.Save.validRun(saved),'Legacy packet rejected');
        q.water=-1;assert(!A.Save.validRun(saved),'Invalid resource payload accepted');delete q.water;q.feeding=true;q.carrierVx=0;q.carrierVy=0;q.carrierVz=null;assert(!A.Save.validRun(saved),'Invalid inner-flow velocity accepted');
      });
      test('Moving habitable zones and surface climate use the current stellar source',()=>{
        const g=cosmicGame(),p=g.player,z=A.Composition.zone(p),b=g.world.make(z.center,0,5**5);b.parentId=p.id;b.composition={iron:.1,rock:.75,ice:.1,gas:.05};b.atmosphere=.4;g.world.rebuild();g.cosmic.byId.set(p.id,p);g.cosmic.byId.set(b.id,b);const q=new A.Planetary(g);q.update(.5);assert(b.climate==='Temperate','Temperate zone lost');p.setMass(p.m*5);assert(A.Composition.zone(p).center>z.center,'Zone did not move');
      });
      test('Measured 2:1 stable orbits earn and lose the resonance bonus',()=>{
        const g=cosmicGame(),p=g.player,d=260*A.unit(p.m),a=satellite(g,p,d,.00015),b=satellite(g,p,d*2**(2/3),.00015,2),q=new A.Planetary(g);for(let i=0;i<2100;i++){g.step();q.update(1/60);}assert(a.orbitStable&&b.orbitStable&&p.resonanceBonus===.02,'Resonance was not observed');b.vx+=100*A.unit(p.m);g.step(60);q.update(1);assert(p.resonanceBonus===0,'Broken resonance retained bonus');
      });
      test('Orbital element reuse preserves three-dimensional invariants without mutating bodies',()=>{
        const g=cosmicGame(),p=g.player,d=280*A.unit(p.m),b=satellite(g,p,d,.0002,0,.35),before=JSON.stringify(b),out={};
        const o=A.orbitElements(g,b,p,out);assert(o===out&&near(o.a,d,1e-7),'Semimajor axis incorrect');assert(o.e<.001&&near(o.inclination,.35,1e-7),'Circular inclined orbit lost');assert(near(o.u.reduce((s,n)=>s+n*n,0),1),'Basis not normalized');assert(JSON.stringify(b)===before,'Element solver mutated body');assert(A.orbitElements(g,b,p,out)===out,'Output storage not reused');
      });
      test('Gravity cache responds to source mass, gravity ranks and amplification',()=>{
        const g=cosmicGame(),p=g.player,first=A.Physics.mu(g,p);assert(A.Physics.mu(g,p)===first,'Cache changed value');g.upgrades.levels.pull=2;assert(A.Physics.mu(g,p)>first*1.4,'Gravity rank was cached out');const boosted=A.Physics.mu(g,p);g.amplifyTime=2;assert(near(A.Physics.mu(g,p),boosted*2),'Amplification stale');p.setMass(p.m*2);assert(A.Physics.mu(g,p)>boosted*2,'Mass cache stale');
      });
      test('Valid composition objects are reused and invalid mixtures are repaired',()=>{
        const b=new A.Body().reset(1,0,0,5**5,'rock',2);b.composition={iron:.2,rock:.5,ice:.2,gas:.1};const q=b.composition;assert(A.Composition.ensure(b)===q,'Valid mixture copied');b.composition={iron:2,rock:5,ice:2,gas:1};assert(near(A.Composition.ensure(b).rock,.5),'Mixture not normalized');b.composition={iron:NaN,rock:-1,ice:0,gas:0};assert(Object.values(A.Composition.ensure(b)).every(Number.isFinite),'Bad mixture retained');
      });
      test('Asteroid ribbons have narrow seeded geometry and respect the entity budget',()=>{
        const g=game();g.world.field(300,200,90,120,1,false,'ribbon');const f=g.world.fields[0],rows=g.world.bodies.slice(1);let long=0,short=0;for(const b of rows){const dx=b.x-f.x,dy=b.y-f.y;long+=(dx*Math.cos(f.angle)+dy*Math.sin(f.angle))**2;short+=(-dx*Math.sin(f.angle)+dy*Math.cos(f.angle))**2;}assert(long>short*15,'Ribbon is a generic blob');g.world.field(0,0,10000,120,1);assert(g.world.bodies.length===g.world.budget(),'Field exceeded body cap');
      });
      test('Comet corridors retain coherent motion instead of direct inward attraction',()=>{
        const g=game();g.world.field(320,0,30,120,1,false,'stream');const f=g.world.fields[0];for(const b of g.world.bodies.slice(1))assert((b.vx*Math.cos(f.angle)+b.vy*Math.sin(f.angle))>21,'Stream lost its drift');
      });
      test('Stellar world passages include genuine capturable planetary masses',()=>{
        const g=cosmicGame(),p=g.player,s=A.unit(p.m);g.world.field(320*s,0,64,90*s,p.m,false,'worlds');const worlds=g.world.bodies.filter(b=>b.m<p.m*.006);assert(worlds.length>=20&&worlds.some(b=>g.cosmic.isPlanet(b)),'No planetary-scale resources');const primary=g.world.bodies.find(b=>b.kind==='wanderer');assert(primary&&worlds.every(b=>A.orbitElements(g,b,primary).energy<0),'System velocities are not bound to their own primary');
      });
      test('Rival orbital fields use their own host velocity and gravity well',()=>{
        const g=cosmicGame(),p=g.player,u=A.unit(p.m);p.x=-3000*u;const rival=g.world.make(0,0,p.m,'ai');rival.vx=3*u;rival.personality='cautious';g.world.field(130*u,0,48,60*u,rival.m,false,'worlds',rival);const worlds=g.world.bodies.filter(b=>b!==p&&b!==rival&&b.m<rival.m*.006);assert(worlds.every(b=>A.orbitElements(g,b,rival).energy<0),'Rival worlds orbit the distant player');g.step(660);assert(g.cosmic.systems.get(rival.id)?.members.length>0,'Rival did not keep a system');
      });
      test('Class goals reward an adaptation once without granting mass or laboratory resources',()=>{
        const g=cosmicGame(0),e=g.expedition=new A.Expedition(g);e.journey(.1);const water=A.Save.data.lifeLab.water,dna=A.Save.data.lifeLab.dna,m=g.player.m;g.stats.captures=20;e.journey(.1);assert(e.directive.done&&g.upgrades.points===1,'Goal not credited');for(let i=0;i<20;i++)e.journey(.1);assert(g.upgrades.points===1,'Goal farmed twice');assert(g.player.m===m&&A.Save.data.lifeLab.water===water&&A.Save.data.lifeLab.dna===dna,'Goal generated resources');
      });
      test('Coasting goals measure control state and never count braking or boosting',()=>{
        const g=cosmicGame(1),e=g.expedition=new A.Expedition(g);g.player.vx=30*A.unit(g.player.m);e.journey(1);const first=e.coast;g.player.thrustX=1;e.journey(1);assert(e.coast===first,'Thrust counted as coasting');g.player.thrustX=0;g.boosting=true;e.journey(1);assert(e.coast===first,'Boost counted');g.boosting=false;g.input.keys.add('ShiftLeft');e.journey(1);assert(e.coast===first,'Braking counted');g.input.keys.clear();e.journey(1);assert(e.coast>first,'Quiet momentum did not count');
      });
      test('Solar-system goals require sustained health and decay when disturbed',()=>{
        const g=cosmicGame(),e=g.expedition=new A.Expedition(g);g.cosmic.summary={stablePlanets:2,stability:1,atRisk:0};e.journey(10);assert(!e.directive.done&&e.directive.progress===10,'Goal completed too early');g.cosmic.summary.atRisk=1;e.journey(4);assert(e.directive.progress===8,'Disturbance did not reduce progress');g.cosmic.summary.atRisk=0;e.journey(12);assert(e.directive.done,'Healthy system goal failed');
      });
      test('Black-hole goals count accreted mass rather than captured mass',()=>{
        const g=cosmicGame(15),e=g.expedition=new A.Expedition(g);e.journey(.1);g.cosmic.capturedMass=g.player.m*.5;e.journey(1);assert(e.directive.progress===0,'Stored matter counted as assimilation');g.stats.totalMatterAccreted=e.directive.target;e.journey(1);assert(e.directive.done,'Accreted matter not credited');
      });
      test('Encounters retain finite clouds and defer when the physical budget is full',()=>{
        const g=cosmicGame(15),e=g.expedition=new A.Expedition(g);assert(e.discover(),'Discovery failed');assert(e.encounter.style==='filament'&&g.cosmic.regions.length===1,'No physical filament');assert(g.cosmic.regions[0].cells.length===28&&g.cosmic.regions[0].cells.every(q=>q.m>0&&q.m===q.initial),'Finite gas lost');while(g.world.bodies.length<g.world.budget())g.world.make(10000,0,1);assert(!e.discover()&&g.world.bodies.length===g.world.budget(),'Full scene spawned more entities');
      });
      test('Condensation previews identify eligible matter and birth conserves total mass',()=>{
        const g=cosmicGame(),p=g.player,d=p.r*5,b=satellite(g,p,d,.003);g.cosmic.packet(p,b,b.m,true);b.alive=false;const q=g.cosmic.packets[0];q.age=30;const before=p.m+q.m;g.cosmic.previewClumps();assert(g.cosmic.clumps.length===1,'Real clump missing');g.cosmic.condense();const formed=g.world.bodies.find(b=>b.alive&&b!==p);assert(formed&&formed.birthAt===g.time&&g.stats.condensatesBorn===1,'Birth not tracked');assert(near(p.m+q.m+formed.m,before),'Matter created or lost');
      });
      test('Empty or plunging disks do not render fictitious formation previews',()=>{
        const g=cosmicGame(),p=g.player;g.cosmic.previewClumps();assert(g.cosmic.clumps.length===0,'Empty disk faked a clump');const b=g.world.make(p.r*4,0,p.m*.001);g.cosmic.packet(p,b,b.m,true);g.cosmic.packets[0].age=40;g.cosmic.previewClumps();assert(g.cosmic.clumps.length===0,'Plunging matter promised a planet');
      });
      test('Matter observatory partitions stored mass into real incoming, disk and inner-flow states',()=>{
        const g=cosmicGame(15),p=g.player,b=satellite(g,p,p.r*4,.002);g.cosmic.packet(p,b,b.m,true);b.alive=false;g.step(5);const c=g.cosmic;assert(near(c.capturedMass,c.diskMass+c.feedingMass+c.incomingMass),'Stored masses overlap or disappear');assert(c.diskMass>0&&c.rate===0,'Outer disk credited immediately');
      });
      test('Completed goals, encounters, field geometry and rival intentions survive a validated snapshot',()=>{
        const g=cosmicGame(0),e=g.expedition=new A.Expedition(g);e.journey(.1);g.stats.captures=20;e.journey(.1);e.discover();const rival=g.world.make(500,0,2,'ai');rival.intent='Seeking an unclaimed field';rival.waypoint={x:600,y:300};A.Save.checkpoint(g,'manual');const r=JSON.parse(JSON.stringify(A.Save.data.run));assert(A.Save.validRun(r),'New snapshot invalid');const copy=cosmicGame(0);copy.world=new A.World(copy,r.seed);copy.world.restore(r);copy.expedition=new A.Expedition(copy,r.expedition);assert(copy.expedition.directive.done&&copy.expedition.completed.includes(0),'Completed goal lost');assert(copy.world.fields.length===g.world.fields.length&&copy.world.bodies.some(b=>b.intent===rival.intent),'Field or rival state lost');
      });
      test('Save validation rejects malformed goals while accepting old checkpoints',()=>{
        const g=cosmicGame(0);g.expedition=new A.Expedition(g);g.expedition.journey(.1);A.Save.checkpoint(g,'manual');const r=JSON.parse(JSON.stringify(A.Save.data.run));r.expedition.directive.target=-1;assert(!A.Save.validRun(r),'Invalid target accepted');delete r.expedition.directive;delete r.expedition.completed;delete r.expedition.visited;delete r.expedition.journal;delete r.fields;assert(A.Save.validRun(r),'Legacy checkpoint broken');
      });
      test('Extended lifetime statistics account each new counter exactly once',()=>{
        const g=cosmicGame();Object.assign(g.stats,{condensatesBorn:2,sectorsCharted:3,directivesCompleted:1,encountersFound:4});const keys=['condensatesBorn','sectorsCharted','directivesCompleted','encountersFound'],before=Object.fromEntries(keys.map(k=>[k,A.Save.data.lifetime[k]||0]));A.Save.account(g);A.Save.account(g);for(const k of keys)assert(A.Save.data.lifetime[k]===before[k]+g.stats[k],'Double count '+k);
      });
      test('The fifty-nine milestone catalogue preserves all legacy IDs and has valid acyclic routes',()=>{
        const ids=Object.keys(A.achievementDefs);assert(ids.length===59&&A.newAchievementKeys.length===25,'Catalogue count changed');
        const visit=(id,path=[])=>{assert(A.achievementInfo[id]&&!path.includes(id),'Invalid route '+id);for(const p of A.achievementInfo[id].parents)visit(p,[...path,id]);};
        for(const id of ids){visit(id);assert(A.achievementBranches.some(b=>b.id===A.achievementInfo[id].branch),'Missing branch');}
        for(const id of ['first','moon','planet','gas','star','well','escape','predator','traveller','titan','orbit','system','disk','merger','endured','biosignature','companion','lifeArchive','legendaryBond','rarityComplete','symbiosis','wayfinder','charted','coalescence'])assert(ids.includes(id),'Lost existing milestone '+id);
      });
      test('New evolution achievements use attained classes and award exactly once',()=>{
        const g=game(5);A.Save.data.achievements=[];A.Save.data.bestStage=0;A.Save.data.stageRecords=[0];A.Save.data.run=null;g.player.evolution=0;A.Save.checkAdvancements(g);assert(!A.Save.data.achievements.includes('growing'),'Mass alone credited a class');g.player.evolution=1;A.Save.checkAdvancements(g);A.Save.checkAdvancements(g);assert(A.Save.data.achievements.filter(id=>id==='growing').length===1,'Class milestone duplicated');
      });
      test('Capture milestones measure one journey and keep lifetime totals separate',()=>{
        const g=game();A.Save.data.achievements=[];A.Save.data.bestStage=0;A.Save.data.lifetime.captures=10000;g.stats.captures=99;A.Save.checkAdvancements(g);assert(!A.Save.data.achievements.includes('manyCaptures'),'Lifetime total credited this journey');g.stats.captures=100;A.Save.checkAdvancements(g);assert(A.Save.data.achievements.includes('manyCaptures')&&!A.Save.data.achievements.includes('massHarvest'),'Capture threshold incorrect');g.stats.captures=500;A.Save.checkAdvancements(g);assert(A.Save.data.achievements.includes('massHarvest'),'Five hundred captures not credited');
      });
      test('Old achievements and new plaque settings normalize without losing a save',()=>{
        const p=A.Save.cleanProfile({version:1,achievements:['first','first','orbit','unknown'],settings:{achievementPosition:'outside',achievementNotices:false}});assert(p.achievements.join(',')==='first,orbit','Legacy achievements lost or duplicated');assert(p.settings.achievementPosition==='top'&&!p.settings.achievementNotices,'Settings defaults incorrect');const old=A.Save.cleanProfile({version:1});assert(old.settings.achievementNotices&&old.settings.achievementPosition==='top','Older saves do not get safe notification defaults');
      });
      test('Sandbox advancement checks cannot mutate normal achievements or resources',()=>{
        const g=game(5**20),before=JSON.stringify(A.Save.data);g.player.evolution=20;g.stats.captures=500;A.Save.vault.mode='sandbox';A.Save.checkAdvancements(g);assert(JSON.stringify(A.Save.data)===before,'Sandbox awarded normal milestones');A.Save.vault.mode='journey';
      });
      test('Prestige requires a living stellar journey and four distinct class goals',()=>{
        const g=cosmicGame(9);g.expedition=new A.Expedition(g);A.Save.data.legacy.rank=0;g.expedition.completed=[0,0,1,1];assert(!A.Legacy.eligibility(g).ready,'Duplicate goals allowed prestige');g.expedition.completed=[0,1,3,5];assert(A.Legacy.eligibility(g).ready,'Completed stellar journey was blocked');g.player.alive=false;assert(!A.Legacy.eligibility(g).ready,'Dead body could prestige');
      });
      test('Cosmetic migration rejects locked looks and allows earned companion accessories',()=>{
        const d=A.Save.cleanProfile({version:1,achievements:['companion'],cosmetics:{mark:'legacy',companion:'charm',frame:'horizon'}});assert(d.cosmetics.mark==='none'&&d.cosmetics.companion==='charm'&&d.cosmetics.frame==='brass','Cosmetic gating failed');assert(d.legacy.rank===0&&d.legacy.history.length===0,'Legacy default corrupt');
      });
      test('Scar history caps at six, counts survived damage and resets with pooled bodies',()=>{
        const g=game(),b=g.player;g.stats.impactsSurvived=0;for(let i=0;i<10;i++)A.recordImpact(g,b,{x:20,y:40},.8);assert(b.scars.length===6&&g.stats.impactsSurvived===10,'Impact history unbounded');b.hp=0;A.recordImpact(g,b,{x:20,y:40},.8);assert(g.stats.impactsSurvived===10,'Fatal damage counted as surviving');b.reset(99,0,0,1,'player',1);assert(b.scars.length===0,'Pool retained scars');
      });
      test('Collision scars and sprite orientation survive checkpoint restoration',()=>{
        const g=cosmicGame(5),b=g.player;A.recordImpact(g,b,{x:100,y:80},.5);b.angle=.7;b.spin=.2;A.Save.checkpoint(g,'manual');const r=JSON.parse(JSON.stringify(A.Save.data.run)),copy=cosmicGame(5);copy.world=new A.World(copy,r.seed);copy.world.restore(r);assert(copy.player.scars.length===1&&near(copy.player.scars[0].power,.5),'Scar lost');assert(near(copy.player.angle,.7)&&near(copy.player.spin,.2),'Surface orientation lost');r.player.scars[0].r=10;assert(!A.Save.validRun(r),'Malformed crater accepted');
      });
      test('An orbital blueprint requires owned, stable physical planets and a continuous hold',()=>{
        const g=cosmicGame(9),c=g.cosmic,e=g.expedition=new A.Expedition(g);A.Save.data.legacy.blueprints=[];c.summary.stability=1;c.summary.atRisk=0;for(let i=0;i<3;i++){const b=g.world.make((200+i*100)*A.unit(g.player.m),0,5**5);b.composition={iron:.2,rock:.7,ice:.1,gas:0};b.parentId=g.player.id;b.orbitStable=true;b.risk='CLEAR';b.orbit={a:200+i*100};c.members.push(b);}assert(A.blueprintStatus(g,'inner').ready,'Real arrangement not recognized');e.selectBlueprint('inner');e.updateBlueprints(10);assert(e.blueprints.progress===10,'Hold did not count');c.members[0].risk='EJECTION';e.updateBlueprints(1);assert(e.blueprints.progress===0,'Disturbed hold remained');c.members[0].risk='CLEAR';e.updateBlueprints(20);assert(e.blueprints.completed.length===1,'Completion missing');e.updateBlueprints(20);assert(g.stats.blueprintsBuilt===1,'Completion repeated');
      });
      test('Custodian promises require stable nested moons and reset on a disturbed system',()=>{
        const g=cosmicGame(9),c=g.cosmic,e=g.expedition=new A.Expedition(g);e.trial={rank:2,kind:'custodian',hold:0,progress:0,done:false};c.summary.stability=1;c.summary.atRisk=0;for(let i=0;i<3;i++){const b=g.world.make(200+i*100,0,5**5);b.parentId=g.player.id;b.orbitStable=true;b.risk='CLEAR';c.members.push(b);}e.updateTrial(20);assert(e.trial.hold===0,'Missing moon ignored');const moon=g.world.make(220,0,1);moon.parentId=c.members[0].id;moon.orbitStable=true;moon.risk='CLEAR';c.members.push(moon);e.updateTrial(20);assert(e.trial.hold===20&&!e.trial.done,'Stable hold failed');c.summary.atRisk=1;e.updateTrial(1);assert(e.trial.hold===0,'Promise ignored disturbance');
      });
      test('Black-hole expedition promises cannot count captured disk mass',()=>{
        const g=cosmicGame(15),e=g.expedition=new A.Expedition(g);e.trial={rank:1,kind:'feeder',hold:0,progress:0,done:false};g.cosmic.capturedMass=g.player.m;g.stats.totalMatterAccreted=0;e.updateTrial(1);assert(e.trial.progress===0,'Captured matter counted');g.stats.totalMatterAccreted=5**15*.04;e.updateTrial(1);assert(e.trial.done,'True accretion not recognized');
      });
      test('Blueprint and legacy lifetime counters account once in the existing profile',()=>{
        const g=cosmicGame();const keys=['blueprintsBuilt','trialsCompleted'],before=Object.fromEntries(keys.map(k=>[k,A.Save.data.lifetime[k]||0]));Object.assign(g.stats,{blueprintsBuilt:2,trialsCompleted:1});A.Save.account(g);A.Save.account(g);for(const key of keys)assert(A.Save.data.lifetime[key]===before[key]+g.stats[key],'Repeated account '+key);
      });
      test('Hatching uses bounded stages and reduced motion reveals the actual creature immediately',()=>{
        const m=A.hatchMotion(0,5),half=A.hatchMotion(3,5),end=A.hatchMotion(5,5),quiet=A.hatchMotion(0,5,true);assert(m.phase==='stirring'&&m.reveal===0,'Egg revealed too soon');assert(half.crack>0&&half.open>0&&half.reveal>0,'Emergence missing');assert(end.done&&end.reveal===1,'Reveal never completes');assert(quiet.done&&quiet.open===1,'Reduced motion retained sequence');
      });
      function novaStart(path) {
        const g=cosmicGame(11);g.evolutionTime=0;g.ui.evolve=noop;g.audio.setStage=noop;g.effects.particle=noop;g.life=new A.Life(g);A.Supernova.prepare(g);assert(A.Supernova.choose(g,path),'Route choice failed');return g;
      }
      function novaGame(path) {
        const g=novaStart(path);for(let i=1;i<=3;i++){g.player.setMass(g.player.pathBaseMass*5**i);g.evolutionTime=0;A.Supernova.handleEvolution(g);}g.evolutionTime=0;g.supernovaAnimation=null;g.cosmic.stage=A.scaleStage(g.player);return g;
      }
      test('Path selection keeps the starting star, momentum and adaptation balance',()=>{
        for(const path of ['singularity','nebula','neutron','gravastar']){const g=cosmicGame(11),p=g.player;g.evolutionTime=0;p.vx=17;p.vy=-3;p.hp=51;const mass=p.m,radius=p.r,points=g.upgrades.points,mu=A.Physics.mu(g,p);assert(A.Supernova.choose(g,path),'Choice failed');assert(p.m===mass&&p.r===radius&&p.vx===17&&p.vy===-3&&p.hp===51,'Body changed on selection');assert(p.evolution===11&&g.upgrades.points===points&&!g.supernovaAnimation&&g.evolutionTime===0,'Selection triggered an evolution');assert(A.appearance(p).name==='Massive star'&&A.Physics.mu(g,p)===mu,'Star prematurely became a remnant');}
      });
      test('Four distinct precursor sequences replace the ordinary stellar stages',()=>{
        const names={singularity:['Contracting supergiant','Collapsing core'],nebula:['Mass-shedding star','Expanding stellar shell'],neutron:['Compressed stellar core','Proto-neutron core'],gravastar:['Dense shell star','Vacuum-transition core']};for(const path of Object.keys(names)){const g=novaStart(path),p=g.player;for(let i=1;i<=2;i++){p.setMass(p.pathBaseMass*5**i);g.evolutionTime=0;A.Supernova.handleEvolution(g);assert(A.appearance(p).name===names[path][i-1]&&A.appearance(p).type==='star','Wrong precursor');assert(A.Supernova.buffs(p).speed===1&&A.Supernova.buffs(p).gravity===1,'Premature remnant modifiers');assert(!g.supernovaAnimation,'Premature supernova');}}
      });
      test('A path can change at the origin star but locks after its first branch evolution',()=>{
        const g=novaStart('singularity'),p=g.player,points=g.upgrades.points;assert(A.Supernova.choose(g,'neutron'),'Origin switch blocked');assert(g.upgrades.points===points&&p.evolution===11,'Switch minted an adaptation');p.setMass(p.pathBaseMass*5);A.Supernova.handleEvolution(g);g.evolutionTime=0;assert(!A.Supernova.choose(g,'nebula')&&p.path==='neutron','Branch switched after evolution');
      });
      test('Path selection preserves a partly filled mass goal and respects fivefold thresholds',()=>{
        const g=cosmicGame(11),p=g.player;g.evolutionTime=0;g.audio.setStage=noop;g.ui.evolve=noop;p.setMass(5**11*3);assert(A.Supernova.choose(g,'nebula'),'Choice failed');assert(p.pathBaseMass===5**11&&p.m===5**11*3,'Current progress was reset');p.setMass(p.pathBaseMass*5*.999);A.Supernova.handleEvolution(g);assert(p.remnantLevel===0,'Premature branch evolution');p.setMass(p.pathBaseMass*5);A.Supernova.handleEvolution(g);assert(p.remnantLevel===1&&g.upgrades.points===1,'Missing first branch evolution');
      });
      test('Earlier 3.4 remnant states migrate without regressions, bonus points or repeat explosions',()=>{
        for(const path of ['singularity','nebula','neutron','gravastar']){const g=cosmicGame(11),p=g.player;Object.assign(p,{path,pathSchema:0,pathBaseMass:5**11,pathBaseEvolution:12,remnantLevel:1,evolution:13,starPeak:11});p.setMass(5**12);const mass=p.m,name=A.appearance(p).name,points=g.upgrades.points;A.Supernova.prepare(g);assert(p.pathSchema===2&&p.remnantLevel===4&&p.pathBaseMass===5**8&&p.evolution===13,'Route migration wrong');assert(p.m===mass&&A.appearance(p).name===name&&g.upgrades.points===points&&!g.supernovaAnimation,'Migration altered an attained remnant');A.Supernova.prepare(g);assert(p.remnantLevel===4&&p.pathBaseMass===5**8,'Migration repeated');}
      });
      test('A reached precursor cannot silently de-evolve after mass loss',()=>{
        const g=novaStart('neutron'),p=g.player;p.setMass(p.pathBaseMass*5);A.Supernova.handleEvolution(g);g.evolutionTime=0;p.setMass(p.pathBaseMass);A.Supernova.handleEvolution(g);assert(p.remnantLevel===1&&A.appearance(p).name==='Compressed stellar core','Attained class regressed');assert(!A.Supernova.eligible(g),'Mass loss reopened switching');
      });
      test('Remnant abilities and route crests wait for the third branch evolution',()=>{
        A.Save.data.achievements=[];const g=novaStart('nebula'),p=g.player;for(let i=1;i<=2;i++){p.setMass(p.pathBaseMass*5**i);g.evolutionTime=0;A.Supernova.handleEvolution(g);assert(!A.Save.data.achievements.includes('nova_nebula')&&A.Physics.mu(g,p)>0,'Nebula activated early');}p.setMass(p.pathBaseMass*125);g.evolutionTime=0;A.Supernova.handleEvolution(g);assert(A.appearance(p).type==='nebula'&&A.Physics.mu(g,p)===0&&g.supernovaAnimation.path==='nebula'&&A.Save.data.achievements.includes('nova_nebula'),'Transformation did not activate');
      });
      test('Massive Star supernova stays optional and the stellar class stops at Colossus',()=>{
        const g=cosmicGame(11);g.evolutionTime=0;assert(A.Supernova.eligible(g),'No Massive Star choice');g.player.evolution=14;g.player.starPeak=14;g.player.setMass(5**20);assert(A.appearance(g.player).name==='Stellar colossus','Stellar route became a black hole');assert(A.Supernova.eligible(g),'Final stellar choice disappeared');g.player.setMass(5**9);assert(!A.Supernova.eligible(g),'A smaller body can switch paths');
      });
      test('Singularity multiplies actual gravity by two and thrust by two-thirds',()=>{
        const normal=cosmicGame(11),g=novaGame('singularity');normal.player.setMass(g.player.m);const mu=A.Physics.mu(normal,normal.player);assert(near(A.Physics.mu(g,g.player),mu*2),'Gravity buff is cosmetic');g.input.direction=()=>({x:1,y:0});g.input.update(1/60);assert(near(g.player.controlAx/A.unit(g.player.m),A.FLIGHT.acceleration*2/3),'Speed modifier missing');
      });
      test('Singularity progresses through the original black-hole classes with a finite endpoint',()=>{
        const g=novaGame('singularity'),p=g.player;for(let i=1;i<=7;i++){p.setMass(p.pathBaseMass*125*5**i);g.evolutionTime=0;A.Supernova.handleEvolution(g);assert(A.appearance(p).name===A.STAGES[14+i].name,'Missing black-hole tier');}const points=g.upgrades.points;p.setMass(p.pathBaseMass*125*5**9);g.evolutionTime=0;A.Supernova.handleEvolution(g);assert(g.upgrades.points===points&&A.appearance(p).visual==='interstallar','Final class created extra evolutions');
      });
      test('Nebula erodes coherent bodies without gravity or instant contact absorption',()=>{
        const g=novaGame('nebula'),p=g.player,b=g.world.make(p.r*.5,0,p.m*.001),old=b.m;g.upgrades.levels.pull=5;g.amplifyTime=7;assert(A.Physics.mu(g,p)===0,'Cloud still attracts bodies');A.Physics.collide(g,p,b);assert(b.alive&&b.m===old,'Cloud contact consumed a whole body');g.world.rebuild();A.Supernova.update(g,1/60);assert(b.alive&&b.m<old&&g.cosmic.packets.some(q=>q.flow==='diffuse'),'No real gradual dissolution');
      });
      test('Diffuse assimilation delays credit and conserves coherent plus stored mass',()=>{
        const g=novaGame('nebula'),p=g.player,b=g.world.make(p.r*.5,0,p.m*.001),old=p.m,all=p.m+b.m;for(let i=0;i<30;i++){g.step();A.Supernova.update(g,1/60);}assert(p.m===old,'Stored matter credited too early');for(let i=0;i<180;i++){g.step();A.Supernova.update(g,1/60);}assert(p.m>old,'Stored matter never assimilates');const total=g.world.bodies.filter(q=>q.alive).reduce((m,q)=>m+q.m,0)+g.cosmic.packets.reduce((m,q)=>m+q.m,0);assert(near(total,all,1e-9),'Dissolution loses or duplicates mass');
      });
      test('Neutron, Magnetar and Strange Matter have distinct actual modifiers and conversion',()=>{
        const g=novaGame('neutron'),p=g.player;assert(A.Supernova.buffs(p).speed===1.35,'Neutron speed missing');p.setMass(p.pathBaseMass*125*5);A.Supernova.handleEvolution(g);assert(A.appearance(p).name==='Magnetar'&&A.Supernova.buffs(p).gravity===1.5,'Magnetar bonus missing');p.setMass(p.pathBaseMass*125*25);g.evolutionTime=0;A.Supernova.handleEvolution(g);const b=g.world.make(p.r*2,0,p.m*.001),old=b.m;g.world.rebuild();A.Supernova.update(g,1/60);assert(A.appearance(p).name==='Strange Matter'&&b.m<old&&g.cosmic.packets.some(q=>q.flow==='conversion'),'Strange conversion is cosmetic');
      });
      test('Gravastar shell protection and gravity increase with attained tier',()=>{
        const g=novaGame('gravastar'),p=g.player;for(let i=0;i<3;i++){p.setMass(p.pathBaseMass*125*5**i);g.evolutionTime=0;A.Supernova.handleEvolution(g);const buffs=A.Supernova.buffs(p);assert(near(buffs.gravity,[1.25,1.4,1.6][i])&&near(buffs.damage,[.6,.5,.45][i]),'Shell modifiers incorrect');assert(buffs.speed===.9,'Gravastar speed changed');}
      });
      test('New routes preserve saved identity, mass baseline and partial-reaction fields',()=>{
        for(const path of ['singularity','nebula','neutron','gravastar']){const g=novaGame(path);const b=g.world.make(g.player.r,0,g.player.m*.001);b.reactionTime=.8;b.reactionCredit=b.m*.2;A.Supernova.takeMatter(g,b,b.m*.1,'diffuse');A.Save.checkpoint(g,'manual');const run=JSON.parse(JSON.stringify(A.Save.data.run));assert(A.Save.validRun(run),'New checkpoint rejected');assert(run.player.path===path&&run.player.pathBaseMass===g.player.pathBaseMass,'Route identity missing');assert(run.bodies[0].reactionTime===.8&&run.cosmic.packets[0].flow==='diffuse','Partial conversion missing');}
      });
      test('Rerouted stellar milestones cannot incorrectly grant skipped black-hole achievements',()=>{
        A.Save.data.achievements=[];A.Save.data.stageRecords=[0];const g=novaGame('neutron');g.player.setMass(g.player.pathBaseMass*125*25);A.Supernova.handleEvolution(g);g.evolutionTime=0;A.Supernova.handleEvolution(g);A.Save.checkAdvancements(g);assert(!A.Save.data.achievements.includes('horizon')&&!A.Save.data.achievements.includes('colossus'),'Skipped route earned an achievement');
      });
      test('Old compact checkpoints migrate without losing their class or momentum',()=>{
        const g=cosmicGame(20),p=g.player;p.vx=123;const m=p.m;A.Supernova.prepare(g);assert(p.path==='singularity'&&p.remnantLevel===9&&p.pathBaseMass===5**11,'Migration wrong');assert(A.appearance(p).name==='Ultramassive black hole'&&p.m===m&&p.vx===123,'Migration changed the body');
      });
      test('Surface clock follows sub-step simulation time without running ahead',()=>{
        const r=Object.create(A.Renderer.prototype);r.game={state:'playing',player:{},time:12,accumulator:0};r.clock=0;A.Save.data.settings.reducedMotion=false;
        assert(near(r.animationTime(),12-1/60),'Clock not aligned to position interpolation');r.game.accumulator=1/120;assert(near(r.animationTime(),12-1/120),'No half-step surface interpolation');r.game.accumulator=1/60;assert(near(r.animationTime(),12),'Surface runs ahead of physics');
      });
      test('Surface clock freezes in pause and photo mode and never becomes negative',()=>{
        const r=Object.create(A.Renderer.prototype);r.game={state:'paused',player:{},time:12};r.clock=999;A.Save.data.settings.reducedMotion=false;assert(r.animationTime()===12,'Pause uses wall time');r.game.state='playing';r.game.photo={active:true};assert(r.animationTime()===12,'Photo uses accumulator');r.game.photo.active=false;r.game.time=0;r.game.accumulator=0;assert(r.animationTime()===0,'Negative initial phase');
      });
      test('Reduced Motion freezes optional surface animation independently of physics',()=>{
        const r=Object.create(A.Renderer.prototype),b=new A.Body().reset(7,0,0,1,'rock',71);r.game={state:'playing',player:b,time:50,accumulator:.01};r.clock=333;A.Save.data.settings.reducedMotion=true;b.angle+=1;assert(r.animationTime()===0&&r.bodyAngle(b)===.71,'Decorative rotation continues');assert(b.angle>1,'Reduced Motion changed physics orientation');A.Save.data.settings.reducedMotion=false;
      });
      test('Body size and angle interpolate the same fixed-step interval as position',()=>{
        const r=Object.create(A.Renderer.prototype);r.game={state:'playing',accumulator:1/120};const b={r:20,pr:10,angle:2,pa:1,seed:1};assert(r.bodyRadius(b)===15&&r.bodyAngle(b)===1.5,'Interpolation is not continuous');r.game.state='paused';assert(r.bodyRadius(b)===20&&r.bodyAngle(b)===2,'Pause does not show the current body');
      });
      test('Physics records previous size and spin before integrating the next step',()=>{
        const g=game(),p=g.player,old=p.angle;p.spin=.5;p.pr=999;p.pa=999;g.step();assert(p.pr===p.r&&p.pa===old,'Previous interval not captured');assert(near(p.angle-old,.5/60),'Physical spin changed');
      });
      test('Surface caches and body histories reset together without creating another loop',()=>{
        const r=Object.create(A.Renderer.prototype);r.resetSurfaces();const first=r.surfaceStates;r.surfaceMaps.set('stale',{});r.surfaceColumns.set(20,[]);r.resetSurfaces();assert(r.surfaceMaps.size===0&&r.surfaceColumns.size===0&&r.surfaceStates!==first,'Restart retains old surfaces');assert(r.surfaceDraws===0&&r.surfaceBuilds===0,'Detail counters survive restart');
      });
      function collisionFixture(){const g=game(5**9);g.cosmic=new A.Cosmic(g);g.expedition=new A.Expedition(g);g.moment=noop;g.world.rebuild();return g;}
      test('A galactic encounter is optional, stellar and backed by finite matter',()=>{
        const g=collisionFixture(),q=g.expedition.collision,m=g.player.m;assert(q.state==='ready'&&q.start(),'Encounter did not start');assert(!q.start(),'Duplicate encounter');assert(q.emit(),'No gas released');assert(g.player.m===m,'Emission instantly credited mass');assert(near(q.budget,q.reservoir+q.released),'Ledger lost matter');assert(g.cosmic.regions[0].cells.length===24,'Wrong grouped-cell count');
      });
      test('The two-hour encounter awards once and pauses with the existing game state',()=>{
        const g=collisionFixture(),q=g.expedition.collision;q.start();g.state='paused';q.advance(500);assert(q.elapsed===0,'Pause advanced time');g.state='playing';q.advance(7199);assert(q.state==='active','Finished early');q.advance(1);assert(q.state==='complete'&&g.upgrades.points===3,'Missing completion reward');q.advance(7200);assert(g.stats.galaxyCollisions===1&&g.upgrades.points===3,'Repeated reward');assert(near(g.cosmic.profile(g.player).gravity,.1),'Gravity benefit missing');
      });
      test('Galactic encounters serialize alongside their real gas and preserve older checkpoints',()=>{
        const g=collisionFixture(),q=g.expedition.collision;q.start();q.advance(2345);q.emit();A.Save.checkpoint(g,'manual');const save=JSON.parse(JSON.stringify(A.Save.data.run));assert(A.Save.validRun(save),'New snapshot rejected');const restored=new A.Expedition(g,save.expedition);assert(restored.collision.elapsed===2345&&restored.collision.phase===1,'Clock or phase lost');assert(near(restored.collision.budget,restored.collision.reservoir+restored.collision.released),'Restored ledger changed');delete save.expedition.collision;assert(A.Save.validRun(save),'Old snapshot rejected');
      });
      test('The global palette catalogue preserves existing earned frames and resource rules',()=>{
        assert(Object.keys(A.THEMES).join(',')===A.COSMETICS.frame.map(q=>q.id).join(','),'Theme catalogue diverged');const water=A.Save.data.lifeLab.water,dna=A.Save.data.lifeLab.dna;A.Save.data.achievements.push('moon');A.Save.data.settings.theme='silver';assert(A.interfaceTheme()==='silver'&&A.cosmeticEquipped('frame')==='silver','Shared frame palette failed');assert(water===A.Save.data.lifeLab.water&&dna===A.Save.data.lifeLab.dna,'Appearance changed resources');
      });
      test('Branch HUD captions follow the selected journey and its actual attained tier',()=>{
        const g=game(5**12),p=g.player;Object.assign(p,{path:'neutron',pathSchema:2,pathOriginStage:11,pathBaseMass:5**11,pathBaseEvolution:11,remnantLevel:1,evolution:12,starPeak:11});assert(A.appearance(p).name==='Compressed stellar core','Branch stage replaced by raw mass stage');assert(A.routeCaption(p)==='NEUTRON STAR · 2 / 6','Wrong route caption');p.setMass(5**11);assert(A.routeCaption(p)==='NEUTRON STAR · 2 / 6','Mass loss replaced branch progression');
      });
      test('Halfway and full evolution rewards are deterministic and cannot be farmed by mass loss',()=>{
        const g=game(),u=g.upgrades;g.player.setMass(2.9);u.updateProgress();assert(u.points===0,'Awarded before halfway');g.player.setMass(3);u.updateProgress();assert(u.points===1,'No halfway point');g.player.setMass(1);u.updateProgress();g.player.setMass(5);u.updateProgress();u.award(5);assert(u.points===2,'Wrong full reward');u.award(5);u.updateProgress();assert(u.points===2,'Reward duplicated');
      });
      test('Free mining and raw-only Research Centre bootstrap without research or adaptation points',()=>{
        const g=game(625),u=g.upgrades,i=g.industry;assert(u.select('outpost'),'Free mine failed');assert(i.drones.length===1,'No first miner');assert(!u.select('research_centre'),'Raw requirement bypassed');i.raw=25;assert(u.select('research_centre'),'Centre unavailable');assert(i.raw===0&&u.points===0&&i.research===0,'Bootstrap currency changed');
      });
      test('Research batches spend 50 material before gradually producing one Research Point',()=>{
        const g=game(625),i=g.industry;g.upgrades.levels={outpost:1,research_centre:1};i.raw=50;i.energy(1/60);i.researchStep(1/60);assert(i.raw===0&&i.research===0&&i.batch>17,'Batch not delayed');for(let n=0;n<1081;n++)i.researchStep(1/60);assert(i.research===1&&i.batch===0,'Batch transfer wrong');
      });
      test('Research cost escalates by rank and elapsed powered research time',()=>{
        const g=game(625),u=g.upgrades;assert(u.cost('miner').rp===1,'Early cost');u.levels.miner=2;assert(u.cost('miner').rp===2,'Later rank cost');g.industry.researchTime=600;assert(u.cost('collector').rp===2,'Research age cost');
      });
      test('Mining laser requires coherent optics through an installed attack laser',()=>{
        const g=game(3125),u=g.upgrades;u.points=10;g.industry.research=10;u.levels={outpost:1,research_centre:1,tech_mining:1,tech_attack:1,tech_optics:1,turret:2,miner:2,mining_rate:1};assert(!u.select('mining_laser'),'Skipped weapons laser');assert(u.select('attack_laser')&&u.select('mining_laser'),'Laser chain failed');
      });
      test('Mining fractures finite material without duplicating asteroid mass or sample payloads',()=>{
        const g=game(625),i=g.industry;g.upgrades.levels.outpost=1;i.syncDrones();const b=g.world.make(600,0,1);b.form='rock';b.water=2;b.dna=1;b.ore=8;b.integrity=0;assert(i.breakRock(b,i.drones[0]),'Rock not fractured');const bits=g.world.bodies.filter(q=>q.alive&&q!==g.player);assert(near(bits.reduce((n,q)=>n+q.m,0),1),'Mass changed');assert(bits.reduce((n,q)=>n+q.water,0)===2&&bits.reduce((n,q)=>n+q.dna,0)===1,'Samples duplicated');assert(bits.every(q=>q.ore===0),'Recursive ore');assert(i.drones[0].cargo===8&&!i.breakRock(b,i.drones[0]),'Ore duplicate');
      });
      test('Turret dislodging transfers real enemy mass into collectible debris',()=>{
        const g=game(625),b=g.world.make(500,0,300,'ai'),before=b.m;iHit();function iHit(){g.industry.hit(b,18);}assert(b.m<before,'No mass loss');assert(near(g.world.bodies.filter(q=>q.alive&&q!==g.player).reduce((n,q)=>n+q.m,0),before),'Matter duplicated');
      });
      test('Charging mode pauses refining and powered shield recovery',()=>{
        const g=game(625),i=g.industry;g.upgrades.levels={outpost:1,research_centre:1,steam:1,battery:1,shield_grid:1};i.mode='charge';i.raw=50;i.shield=10;for(let n=0;n<600;n++){i.energy(1/60);i.researchStep(1/60);}assert(i.battery>0&&i.batch===0&&i.raw===50&&i.shield===10,'Charge diversion failed');
      });
      test('Overclock duration inversely changes strength and spends stored energy exactly once',()=>{
        const g=game(625),i=g.industry;g.upgrades.levels={outpost:1,battery:2,overclock:1};i.battery=100;i.duration=10;const quick=i.overclockPreview();i.duration=40;assert(i.overclockPreview().gain<quick.gain,'No duration tradeoff');assert(i.activate()&&i.battery===0,'Battery not consumed');assert(!i.activate(),'Repeated activation');i.energy(1/60);assert(i.multiplier>1&&i.flightMultiplier()<=1.25,'Unbounded overclock');
      });
      test('Powered shield capacity absorbs a bounded fraction of an impact',()=>{
        const g=game(625),i=g.industry;g.upgrades.levels.shield_grid=1;i.shield=30;assert(near(i.protect(20),7)&&i.shield===17,'Shield transfer');i.shield=2;assert(i.protect(20)===18&&i.shield===0,'Shield overdraw');
      });
      test('Resource recovery uses deterministic fractional DNA and water carry',()=>{
        const g=game(625),i=g.industry;g.upgrades.levels.water_recovery=1;g.upgrades.levels.dna_recovery=1;let w=0,d=0;for(let n=0;n<20;n++){const q=i.samples(1,1);w+=q.water;d+=q.dna;}assert(w===25&&d===22,'Recovery wrong');assert(A.Life.wheelTier(.6)===2&&A.Life.wheelTier(.999)===4,'Wheel odds changed');
      });
      test('Infrastructure serialization preserves pending research, cargo, battery and progress claims',()=>{
        const g=game(625),i=g.industry;g.upgrades.levels.outpost=1;i.syncDrones();i.raw=13;i.research=2;i.batch=7;i.battery=12;i.mode='charge';i.drones[0].cargo=8;i.waterCarry=.25;g.upgrades.award(5);const state=i.serialize();assert(A.Industry.valid(state),'Invalid serialized industry');const restored=new A.Industry(g,state);assert(restored.raw===13&&restored.research===2&&restored.batch===7&&restored.battery===12&&restored.mode==='charge'&&restored.waterCarry===.25,'State lost');assert(restored.drones[0].cargo===8&&restored.drones[0].phase==='return','Carried ore lost');
      });
      test('Malformed infrastructure checkpoints are rejected and version-five checkpoints still load',()=>{
        const g=game(625);A.Save.checkpoint(g,'manual');const run=JSON.parse(JSON.stringify(A.Save.data.run));assert(A.Save.validRun(run),'Modern run rejected');run.industry.batch=19;assert(!A.Save.validRun(run),'Bad batch accepted');delete run.industry;run.version=5;assert(A.Save.validRun(run),'Old save rejected');
      });
      test('Galactic resource fields contain a few primaries with planets and finite asteroid belts',()=>{
        const g=game(5**19);g.cosmic=new A.Cosmic(g);g.world.field(500*A.unit(g.player.m),0,32,280*A.unit(g.player.m),g.player.m);const primaries=g.world.bodies.filter(b=>b.kind==='wanderer'&&!b.formationHost),belts=g.world.bodies.filter(b=>b.tag==='Finite belt ore');assert(primaries.length===1&&belts.length>=5,'Random stellar bombardment returned');const worlds=g.world.bodies.filter(b=>b.form==='planet'||b.form==='gas');assert(worlds.length>=1&&g.world.bodies.filter(b=>b.form==='star').length>=2&&worlds.every(b=>A.orbitElements(g,b,g.world.bodies.find(q=>q.id===b.formationHost)||primaries[0]).energy<0),'Unbound generated planets');
      });
      test('All new upgrade dependencies resolve to known nodes with no cycles',()=>{
        const ids=new Set(A.UPGRADES.map(q=>q.id)),walk=(id,path=new Set())=>{assert(!path.has(id),'Dependency cycle '+id);const node=A.UPGRADES.find(q=>q.id===id),next=new Set(path);next.add(id);for(const [key]of node.requires){assert(ids.has(key),'Unknown dependency '+key);walk(key,next);}};for(const q of A.UPGRADES)walk(q.id);assert(ids.size===A.UPGRADES.length&&ids.size===62,'Duplicate or missing definition');
      });
      test('Tiny stellar belts survive streaming long enough for mining and stable capture',()=>{
        const g=game(5**19);g.cosmic=new A.Cosmic(g);g.world.field(500*A.unit(g.player.m),0,24,200*A.unit(g.player.m),g.player.m);const ids=g.world.bodies.filter(b=>b.tag==='Finite belt ore').map(b=>b.id);assert(ids.length>=5,'No belt');g.world.update(1);assert(ids.every(id=>g.world.bodies.some(b=>b.id===id&&b.alive)),'Microscopic culling erased the belt');
      });
      test('Raw extraction and research lifetime counters account only once per checkpoint',()=>{
        const g=game(625),raw=A.Save.data.lifetime.rawMined||0,rp=A.Save.data.lifetime.researchMade||0;g.stats.rawMined=17;g.stats.researchMade=2;A.Save.account(g);A.Save.account(g);assert((A.Save.data.lifetime.rawMined||0)-raw===17&&(A.Save.data.lifetime.researchMade||0)-rp===2,'Engineering counters duplicated');
      });
      test('Hardcore creates a 50-percent player without weakening rival cohesion',()=>{
        const g=game();g.difficulty='hardcore';const p=g.world.make(1000,0,1,'player'),r=g.world.make(2000,0,2,'ai');assert(p.hp===50&&r.hp===100&&A.cohesionLimit(g)===50,'Hardcore cohesion cap missing');
      });
      test('Hardcore regeneration stops at 50 and standard regeneration still reaches 100',()=>{
        const hard=game(),normal=game();hard.difficulty='hardcore';hard.player.hp=48;normal.player.hp=98;for(let n=0;n<200;n++){hard.input.update(1/60);normal.input.update(1/60);}assert(hard.player.hp===50&&normal.player.hp===100,'Regeneration escaped its cap');
      });
      test('Hardcore peers become rarer with class while lower-stage matter remains available',()=>{
        const rates=[];for(const stage of [4,11,19]){const g=game(5**stage);g.difficulty='hardcore';let peers=0;for(let n=0;n<5000;n++)if(A.stage(g.world.ambientMass(g.player.m*1.8))>=stage)peers++;rates.push(peers/5000);assert(g.world.ambientMass(g.player.m*.01)===g.player.m*.01,'Small resources removed');}assert(rates[0]>.3&&rates[1]<rates[0]*.4&&rates[2]<rates[1]*.35&&rates[2]>.005,'Peer rarity does not scale');
      });
      test('Hardcore stellar systems have fewer worlds but preserve mineable belts',()=>{
        function sample(difficulty){const g=game(5**11);g.difficulty=difficulty;let worlds=0,belts=0;for(let n=0;n<80;n++){g.world.bodies=[g.player];g.world.field(500*A.unit(g.player.m),0,24,160*A.unit(g.player.m),g.player.m);worlds+=g.world.bodies.filter(b=>b.form==='planet'||b.form==='gas').length;belts+=g.world.bodies.filter(b=>b.tag==='Finite belt ore').length;}return{worlds,belts};}
        const normal=sample('standard'),hard=sample('hardcore');assert(hard.worlds<normal.worlds*.5&&hard.worlds>0,'Planet scarcity missing or planets impossible');assert(hard.belts>=normal.belts,'Asteroid belts starved');
      });
      test('Standard and Relaxed ambient mass preserve the prior distribution and RNG state',()=>{
        for(const difficulty of ['standard','relaxed']){const g=game(5**19);g.difficulty=difficulty;const before=g.world.random.getState();assert(g.world.ambientMass(g.player.m*2)===g.player.m*2&&g.world.random.getState()===before,'Existing difficulty changed');assert(g.world.scarcity().worlds===1,'Existing worlds reduced');}
      });
      test('Hardcore scarcity does not resize captured worlds or destroy fragmented matter',()=>{
        const g=game(5**9);g.difficulty='hardcore';const b=g.world.make(500,0,g.player.m*.001);b.parentId=g.player.id;b.orbitStable=true;const original=b.m;g.world.field(3000,0,16,140,g.player.m);assert(b.m===original&&b.parentId===g.player.id&&b.orbitStable,'Existing system overwritten');const before=g.world.bodies.filter(q=>q.alive).reduce((n,q)=>n+q.m,0);g.world.fragments(b,original,8,10);b.alive=false;assert(near(g.world.bodies.filter(q=>q.alive).reduce((n,q)=>n+q.m,0),before),'Fragment mass biased');
      });
      test('Hardcore is retained by settings, checkpoints and validation',()=>{
        const g=game();g.difficulty='hardcore';g.player.hp=50;A.Save.data.settings.difficulty='hardcore';A.Save.checkpoint(g,'manual');const run=JSON.parse(JSON.stringify(A.Save.data.run));assert(A.Save.validRun(run)&&run.difficulty==='hardcore'&&run.player.hp===50,'Hardcore run lost');const d=A.Save.cleanProfile(JSON.parse(JSON.stringify(A.Save.data)));assert(d.settings.difficulty==='hardcore'&&d.run.difficulty==='hardcore','Hardcore profile rejected');run.difficulty='invalid';assert(!A.Save.validRun(run),'Invalid difficulty accepted');assert(A.Save.cleanProfile({settings:{difficulty:'invalid'}}).settings.difficulty==='standard','Invalid setting not normalized');
      });
      test('Hardcore rare caches scale their DNA, water and Raw Material rewards without changing other modes',()=>{
        for(const stage of [4,9,19]){const g=game(5**stage);g.difficulty='hardcore';const b=g.world.make(500,0,g.player.m*.01);assert(g.world.rewardRare(b,true),'No cache');const tier=stage>=15?2:stage>=9?1:0,scale=2**tier;assert(b.water>=12*scale&&b.water<=24*scale&&b.dna>=3*scale&&b.dna<=6*scale&&b.rawPayload===50*(1+tier),'Cache scale wrong');}
        for(const difficulty of ['standard','relaxed']){const g=game(625);g.difficulty=difficulty;const b=g.world.make(500,0,10);assert(!g.world.rewardRare(b,true)&&b.water===0&&b.dna===0&&b.rawPayload===0,'Bonus leaked into other mode');}
      });
      test('Hardcore cache collection credits all three resources once through the existing ledger',()=>{
        const g=game(625);g.difficulty='hardcore';g.life=new A.Life(g);const b=g.world.make(500,0,5);g.world.rewardRare(b,true);const water=b.water,dna=b.dna,cacheRaw=b.rawPayload,before={water:A.Save.data.lifeLab.water,dna:A.Save.data.lifeLab.dna,raw:g.industry.raw};assert(g.life.collect(b)&&!g.life.collect(b),'Cache claimed twice');assert(g.industry.raw===before.raw,'Raw awarded before commit');g.life.commit();assert(A.Save.data.lifeLab.water===before.water+water&&A.Save.data.lifeLab.dna===before.dna+dna&&g.industry.raw===before.raw+cacheRaw,'Resource transfer wrong');assert(g.industry.research===0&&!g.stats.researchMade,'Cache still grants Research Points');assert(!g.life.commit(),'Commit repeated');
      });
      test('Accretion and escape preserve the rare cache without paying for orbital capture',()=>{
        const g=game(5**9);g.difficulty='hardcore';g.life=new A.Life(g);g.cosmic=new A.Cosmic(g);const b=g.world.make(g.player.r*4,0,g.player.m*.001);g.world.rewardRare(b,true);const cacheRaw=b.rawPayload,w=b.water;assert(g.cosmic.capture(g.player,b),'Capture failed');const q=g.cosmic.packets[0];assert(q.rawPayload===cacheRaw&&q.water===w&&g.life.pendingRaw===0&&g.industry.raw===0,'Premature payout or payload lost');g.cosmic.release(q);const escaped=g.world.bodies.find(x=>x!==b&&x.alive&&x.hardcoreCache);assert(escaped&&escaped.rawPayload===cacheRaw&&escaped.water===w,'Escape lost cache');
      });
      test('Mining puts rare cache Raw Material on one physical fragment rather than cloning rewards',()=>{
        const g=game(625);g.difficulty='hardcore';g.life=new A.Life(g);g.upgrades.levels.outpost=1;g.industry.syncDrones();const b=g.world.make(600,0,1);g.world.rewardRare(b,true);b.ore=8;b.integrity=0;const cacheRaw=b.rawPayload;assert(g.industry.breakRock(b,g.industry.drones[0]),'Mining failed');const fragments=g.world.bodies.filter(q=>q.alive&&q.kind==='debris');assert(fragments.reduce((n,q)=>n+q.rawPayload,0)===cacheRaw&&g.industry.raw===0,'Cache Raw Material duplicated or remote');for(const f of fragments)g.life.collect(f);g.life.commit();assert(g.industry.raw===cacheRaw,'Fragment Raw Material not delivered');assert(!g.industry.breakRock(b,g.industry.drones[0]),'Dead rock regenerated a cache');
      });
      test('Failed rare-world rolls become smaller resource rocks without hidden cache payouts',()=>{
        const g=game(5**8*4.9);g.difficulty='hardcore';g.world.random=()=>.99;g.world.field(4000,0,16,140,g.player.m);const spawned=g.world.bodies.filter(b=>b!==g.player);assert(spawned.length===16&&spawned.every(b=>A.stage(b.m)<5&&!b.hardcoreCache&&b.rawPayload===0),'Failed world roll retained a planet or cache');
      });
      test('Legacy unclaimed research caches migrate once and claimed caches remain empty',()=>{
        const old={researchPayload:2,hardcoreCache:true,tag:'Hardcore cache · 2 RP'},raw=A.migrateCachePayload(old);assert(raw.rawPayload===100&&!Object.hasOwn(raw,'researchPayload')&&raw.tag.includes('100 RAW'),'Legacy cache not converted');assert(A.migrateCachePayload(raw).rawPayload===100,'Conversion repeated');assert(A.migrateCachePayload({...old,lifeClaimed:true}).rawPayload===0,'Claimed cache resurrected');
      });
      test('Old cache bodies and carried payloads remain compatible with saved profiles',()=>{
        const g=game(625);g.difficulty='hardcore';g.upgrades.levels.outpost=1;g.industry.syncDrones();const b=g.world.make(500,0,1);b.water=12;b.dna=3;b.hardcoreCache=true;A.Save.checkpoint(g,'manual');const profile=JSON.parse(JSON.stringify(A.Save.data)),old=profile.run.bodies.find(q=>q.id===b.id);delete old.rawPayload;old.researchPayload=2;const cargo=profile.run.industry.cargo[0];delete cargo.rawPayload;cargo.researchPayload=3;profile.run.industry.research=7;const migrated=A.Save.cleanProfile(profile);assert(migrated.run&&migrated.run.bodies.find(q=>q.id===b.id).rawPayload===100,'Body cache migration lost the run');assert(migrated.run.industry.cargo[0].rawPayload===150&&migrated.run.industry.research===7,'Cargo migration changed earned research');assert(A.Save.validRun(migrated.run),'Migrated checkpoint rejected');
      });
      test('Cache Raw Material still requires a timed Research Centre batch to produce research',()=>{
        const g=game(625);g.difficulty='hardcore';g.life=new A.Life(g);const b=g.world.make(500,0,1);g.world.rewardRare(b,true);g.life.collect(b);g.life.commit();assert(g.industry.raw===50&&g.industry.research===0,'Direct research reward returned');g.upgrades.levels.research_centre=1;g.industry.multiplier=1;g.industry.researchStep(.01);assert(g.industry.raw===0&&g.industry.research===0&&g.industry.batch>17,'Refinement delay bypassed');for(let n=0;n<181;n++)g.industry.researchStep(.1);assert(g.industry.research===1,'Raw could not be refined');
      });
      test('Cache collection respects the raw inventory cap and counts accepted material once',()=>{
        const g=game(625);g.difficulty='hardcore';g.life=new A.Life(g);g.industry.raw=1e7-10;const b=g.world.make(500,0,1);g.world.rewardRare(b,true);g.life.collect(b);g.life.commit();assert(g.industry.raw===1e7&&g.stats.rawMined===10&&g.industry.research===0,'Raw overflow or false statistic');assert(!g.life.collect(b)&&!g.life.commit(),'Cap collection duplicated');
      });
    } finally { A.Save.data = originalData; A.Save.write = originalWrite;A.Save.vault=originalVault;A.Save.sessionOpen=originalSession; }
    return results;
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = runTests;
  else root.runAccretionTests = runTests;
})(typeof window === 'undefined' ? this : window);
