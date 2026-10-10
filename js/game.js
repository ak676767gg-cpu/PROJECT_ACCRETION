'use strict';
(function (A) {
  A.Game = class {
    constructor() {
      this.state = 'menu'; this.player = null; this.world = null; this.time = 0; this.tick = 0;
      this.audio = new A.Audio(); this.upgrades = new A.Upgrades(this); this.effects = new A.Effects(this);
      this.ui = new A.UI(this); this.renderer = new A.Renderer(this, document.getElementById('universe')); this.input = new A.Input(this, document.getElementById('universe'));
      this.ui.installExpeditionControls();this.ui.installCommandControls(); this.network=new A.Multiplayer(this); this.life=new A.Life(this); this.evolutionTime = 0; this.ui.main(); this.lastFrame = null; this.accumulator = 0; this.fps = 60;this.fpsMeasured=false;this.fpsSeconds=0;this.fpsFrames=0;
      window.addEventListener('pagehide', () => A.Save.checkpoint(this));
      this.boundFrame = t => this.frame(t); requestAnimationFrame(this.boundFrame);
    }
    start(continuing = false) {
      this.ui.resetAchievementNotices();this.advancementIn=0;this.previousFlightStamp=undefined;this.fpsMeasured=false;this.fpsSeconds=0;this.fpsFrames=0;
      const saved = continuing && A.Save.data.run && A.Save.validRun(A.Save.data.run) ? A.Save.data.run : null;
      this.time = 0; this.tick = 0; this.accumulator = 0; this.stats = { galaxyCollisions:0, peak: 1, stage: 0, captures: 0, defeats: 0, totalGained: 0, maxVelocity: 0, largestCollision: 0, planetsCaptured:0, systemsBuilt:0, totalMatterAccreted:0, orbitsEstablished:0,condensatesBorn:0,sectorsCharted:0,directivesCompleted:0,encountersFound:0, impactsSurvived:0,blueprintsBuilt:0,trialsCompleted:0, supernovas:0,cloudDissolved:0,strangeConverted:0,peakClass:'Tiny asteroid', lastRival:'' };
      this.upgrades = new A.Upgrades(this); this.effects = new A.Effects(this);this.renderer.final?.reset();this.renderer.final=null;this.finalEnding=false;this.lastEvolutionAt=-1e6;
      const seed = saved ? saved.seed : (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
      const chosenDifficulty = saved ? saved.difficulty : A.Save.data.settings.difficulty;
      this.difficulty = Object.hasOwn(A.DIFFICULTIES,chosenDifficulty) ? chosenDifficulty : 'standard';
      this.world = new A.World(this, seed);
      if (saved) {
        this.world.restore(saved); this.time = saved.time; this.stats = { ...this.stats, ...saved.stats };
        for (const u of A.UPGRADES) this.upgrades.levels[u.id] = A.clamp(Math.floor(saved.upgrades?.[u.id] || 0), 0, u.max);
        this.upgrades.points = A.clamp(Math.floor(saved.points || 0), 0, 100);
      } else { this.world.initial(); }
      this.player.hp = Number.isFinite(this.player.hp) ? A.clamp(this.player.hp,0,A.cohesionLimit(this)) : A.cohesionLimit(this);
      Object.assign(this, { hudHidden:false, boostEnergy: 1, boostSound: 0, boosting: false, pulseCooldown: 0, amplifyCooldown: 0, amplifyTime: 0, shellCooldown: 0, evolutionTime: 0, momentTime:0, momentDuration:1.4, lastDamage: -10, lastWarning: -10, threat: null, escape: false, escapeChallenge: null, autosaveIn: 15 });
      if (saved) {
        for (const key of ['boostEnergy', 'pulseCooldown', 'amplifyCooldown', 'amplifyTime', 'shellCooldown']) if (Number.isFinite(saved.abilities?.[key])) this[key] = A.clamp(saved.abilities[key], 0, key === 'boostEnergy' ? 1 : 120);
        if (Number.isFinite(saved.sinceDamage)) this.lastDamage = this.time - saved.sinceDamage;
      }
      A.Supernova.prepare(this);
      this.renderer.camera = { x: this.player.x, y: this.player.y, zoom: .94 / A.unit(this.player.m) }; this.renderer.manualZoom = 1; this.renderer.shake = 0;
      for(const b of this.world.bodies){b.pr=b.r;b.pa=b.angle;}
      this.renderer.resetSurfaces();
      this.life=new A.Life(this); this.cosmic=new A.Cosmic(this,saved?.cosmic); this.renderer.cosmic?.reset(); this.renderer.sprites.clear(); this.effects.reset?.(); this.systemView=false; this.selectedBody=null; this.detail=1;this.ui.systemMode=null;this.ui.systemDiagramPoints=[];if(this.renderer.visiblePool)this.renderer.visiblePool.length=0;if(this.renderer.rockBins)for(const bin of this.renderer.rockBins)bin.length=0;
      this.ui.lastMinimized=null;this.ui.dockHover=false;this.ui.dockFocus=false;this.ui.revealDock(false);
      this.expedition=new A.Expedition(this,saved?.expedition);this.finalInterstallar=new A.FinalInterstallar(this,saved?.final);this.cosmic.bonus=this.cosmic.profile(this.player).gravity;this.photo=new A.Photo(this);this.industry=new A.Industry(this,saved?.industry);this.command=new A.Command(this,saved?.command);this.command.start(!saved);this.world.rebuild(); A.Save.sessionOpen=true; this.state = 'playing'; this.input.clear(); this.ui.flight(); this.audio.start(); this.audio.setStage?.(A.scaleStage(this.player),A.appearance(this.player).type); this.audio.setTension?.(0);this.audio.setMotion?.(false,false,false,0); this.threatLevel = 0; this.audio.setActive(true);
      document.getElementById('evolution').hidden = true;
      const lastRival = saved && this.stats.lastRival ? ' Last rival encountered: ' + this.stats.lastRival + '.' : '';
      this.ui.toast(saved ? 'JOURNEY RESTORED' : 'A SMALL BEGINNING', saved ? 'Your momentum, mass, and adaptations are intact.' + lastRival : 'WASD to thrust. Shift to brake. Let gravity do the gathering.', 'aqua');
      if(A.Save.mode==='sandbox'&&!saved){A.Sandbox.setClass(this,9,false);this.command.seedSandbox();}A.Save.checkpoint(this,'start');
    }
    pause() { if (this.state !== 'playing') return; this.state = 'paused'; this.previousFlightStamp=undefined; this.input.clear(); this.audio.setActive(false); A.Save.checkpoint(this); this.ui.showPanel('pause', false); }
    resume() { if(this.photo?.active)this.photo.exit(); if (!this.player || this.state === 'over' || this.state === 'menu') return; this.state = 'playing'; this.previousFlightStamp=undefined; this.input.clear(); this.accumulator = 0; this.ui.flight(); this.audio.setActive(true); }
    togglePause() { if (this.ui.panel && !['pause', 'upgrades'].includes(this.ui.panel)) this.ui.back(); else if (this.state === 'playing') this.pause(); else if (this.state === 'paused' || this.state === 'upgrade') this.resume(); else if (this.state === 'menu') this.ui.back(); }
    restart() { this.photo?.exit(); if (this.player && this.state !== 'over' && this.state !== 'menu') A.Save.finish(this); this.start(false); }
    mainMenu() {
      this.network?.disconnect();this.photo?.exit();
      if (this.player && !['over', 'menu'].includes(this.state)) A.Save.checkpoint(this,'manual');
      A.Save.sessionOpen=false;if(A.Save.mode==='multiplayer')A.Save.selectMode('journey');
      this.renderer.final?.disposeGL();this.state = 'menu'; this.input.clear(); this.audio.setActive(false); this.ui.main(); this.threat = null;
    }
    end(reason) {
      if (this.state === 'over') return;
      this.stats.peak = Math.max(this.stats.peak, this.player.m); this.stats.stage = Math.max(this.stats.stage, this.player.evolution);
      this.expedition?.replay.flush();this.state = 'over'; this.player.alive = false; this.input.clear(); this.audio.play('over'); this.audio.setActive(false); A.Save.finish(this); this.ui.gameOver(reason);
    }
    pulse() {
      if (this.state !== 'playing' || !this.upgrades.get('pulse') || this.pulseCooldown > 0) return;
      const p = this.player, s = A.unit(p.m), range = 250 * s;
      this.world.hash.query(p.x, p.y, range, b => {
        if (b === p || !b.alive) return; const dx = b.x - p.x, dy = b.y - p.y, d = Math.hypot(dx, dy) || 1; if (d > range) return;
        const force = (1 - d / range) * 105 * s;
        const direction = A.Supernova.buffs(p).gravity===0?1:b.m < p.m * .6 ? -.65 : 1;
        b.vx += dx / d * force * direction; b.vy += dy / d * force * direction;
        if (b.m > p.m) { p.vx -= dx / d * force * .65; p.vy -= dy / d * force * .65; }
      });
      // A jelly-form companion occasionally carries part of the pulse cost.
      const assisted = Math.random() < (this.life?.buffs().pulse || 0);
      this.pulseCooldown = (24 - this.upgrades.get('pulse') * 4) * (assisted ? .45 : 1);
      if (assisted) this.effects.label(p.x, p.y, 'COMPANION ASSIST', '#b9dfcf');
      this.effects.ring(p.x, p.y, p.r * 2, '#b0ecdc', true); this.audio.play('pulse'); this.renderer.shake = 4;
    }
    amplify() { if (A.Supernova.buffs(this.player).gravity===0||this.state !== 'playing' || !this.upgrades.get('amplify') || this.amplifyCooldown > 0) return; this.amplifyTime = 7; this.amplifyCooldown = 43 - 5 * this.upgrades.get('amplify'); this.effects.ring(this.player.x, this.player.y, this.player.r * 3, '#dab887', true); this.audio.play('event'); }
    evolve() {
      if(A.Supernova.handleEvolution(this))return;
      const p = this.player, stage = Math.min(14,A.stage(p.m));
      if (stage <= p.evolution || this.evolutionTime > 0) return;
      this.upgrades.award(5**(p.evolution+1));this.lastEvolutionAt=this.time;p.evolution++;p.starPeak=Math.max(p.starPeak||0,p.evolution); this.stats.stage = Math.max(this.stats.stage, p.evolution); this.evolutionTime = 3.4;
      p.hp = Math.min(A.cohesionLimit(this), p.hp + 25); p.invulnerable = 4; this.renderer.shake = 16;
      const cl = A.classFor(Math.pow(5, p.evolution));
      this.effects.burst(p.x, p.y, 145, 150 * A.unit(p.m), cl.color); this.effects.ring(p.x, p.y, p.r * 2, cl.color, true); this.effects.ring(p.x, p.y, p.r * 5, cl.color, true);
      this.cosmic?.evolve(); this.audio.setStage?.(p.evolution); this.audio.play('evolution'); this.ui.evolve(p.evolution);
      const achievements = { 4: 'moon', 5: 'planet', 7: 'gas', 9: 'star', 11: 'titan' }; if (achievements[p.evolution]) A.Save.achievement(achievements[p.evolution], this);
      A.Save.checkAdvancements(this);
      A.Save.checkpoint(this);
    }
    moment(title,body){if(this.evolutionTime>0)return;this.momentDuration=1.4;this.momentTime=1.4;this.effects.ring(body.x,body.y,body.r*1.5,'#b9dfcf');this.audio.play('moment');this.ui.toast(title,'A new rhythm in your journey.','aqua');}
    step(dt) {
      if (this.state !== 'playing') return;
      if(this.network?.active){this.network.step(dt);return;}
      this.tick++; this.time += dt;this.command?.update(dt); this.world.update(dt); A.Physics.step(this, dt);if(this.state==='playing'&&(this.finalInterstallar?.positioned||this.player.evolution>=A.FINAL.discoverStage||this.player.m>=5**A.FINAL.discoverStage))this.finalInterstallar?.update(dt); if(this.state==='playing')this.cosmic.update(dt);
      if (this.state !== 'playing') return;
      A.Supernova.update(this,dt);this.expedition.update(dt);this.life.update(dt);
      if(this.player.m>=this.stats.peak)this.stats.peakClass=this.finalInterstallar?.done?A.FINAL.name:A.appearance(this.player).name;
      this.stats.peak = Math.max(this.stats.peak, this.player.m); this.industry?.update(dt);this.evolve();
      this.ambience(dt);
      this.advancementIn-=dt;if(this.advancementIn<=0){this.advancementIn=1;A.Save.checkAdvancements(this);}
      if (this.time >= 1200) A.Save.achievement('traveller', this);
      this.autosaveIn -= dt; if (this.autosaveIn <= 0) { this.autosaveIn = 15; A.Save.checkpoint(this); }
      // Floating origin retains precision over very long journeys without changing local motion.
      if (Math.abs(this.player.x) > 1e9 || Math.abs(this.player.y) > 1e9) this.rebase();
    }
    // Drives the two continuous ambient layers from state the simulation already tracks.
    ambience(dt) {
      this.ambientIn = (this.ambientIn || 0) - dt; if (this.ambientIn > 0) return; this.ambientIn = .35;
      this.audio.setDensity?.(A.clamp((this.cosmic?.density || 0) * 2.2, 0, 1));
      const t = this.threat;
      if (t && t.alive) {
        const d = Math.hypot(this.player.x - t.x, this.player.y - t.y), range = A.Physics.influence(this, t) * 1.7;
        this.threatLevel = A.clamp(1 - d / Math.max(range, 1), 0, 1) * A.clamp(t.m / (this.player.m * 1.55), .4, 1.6);
        this.stats.lastRival = t.name || this.stats.lastRival;
      } else this.threatLevel = 0;
      const f=this.finalInterstallar,proximity=f?.active?A.clamp(1-f.distanceR/A.FINAL.zones.lens,0,1):0;this.audio.setFinalProximity?.(proximity);this.audio.setTension?.(Math.max(A.clamp(this.threatLevel || 0, 0, 1),f?.active&&f.distanceR<A.FINAL.zones.photon?.5:0));
      this.audio.setMotion?.(!!(this.player.thrustX||this.player.thrustY),this.boosting,this.input.keys.has('ShiftLeft')||this.input.keys.has('ShiftRight'),A.clamp((this.cosmic?.rate||0)/this.player.m*120,0,1));
    }
    rebase() {
      const x = this.player.x, y = this.player.y;
      for (const b of this.world.bodies) { b.x -= x; b.y -= y; b.px -= x; b.py -= y; for (const t of b.trail) { t.x -= x; t.y -= y; } if (b.waypoint) { b.waypoint.x -= x; b.waypoint.y -= y; } }
      for (const f of this.world.fields) { f.x -= x; f.y -= y; }
      for (const list of [this.effects.particles, this.effects.rings, this.effects.labels]) for (const e of list) { e.x -= x; e.y -= y; }
      if (this.world.event) { this.world.event.x -= x; this.world.event.y -= y; } this.cosmic?.rebase(x,y);this.industry?.rebase(x,y);this.command?.rebase(x,y);this.expedition?.rebase(x,y);this.finalInterstallar?.rebase(x,y); this.life.x-=x;this.life.y-=y; this.renderer.camera.x -= x; this.renderer.camera.y -= y; this.world.rebuild();
    }
    frame(timestamp) {
      const cap=A.frameCap(),interval=cap?1000/cap:0;if(this.frameLimitUsed!==cap){this.frameLimitUsed=cap;this.nextRenderAt=timestamp;}if(cap&&this.lastFrame!==null&&timestamp<(this.nextRenderAt??timestamp)-.25){requestAnimationFrame(this.boundFrame);return;}if(cap)this.nextRenderAt=timestamp-(this.nextRenderAt??timestamp)>interval*3?timestamp+interval:(this.nextRenderAt??timestamp)+interval;
      const rawDt=this.lastFrame===null?0:Math.max(0,(timestamp-this.lastFrame)/1000);
      const dt = this.lastFrame ? Math.min(.08, Math.max(0, (timestamp - this.lastFrame) / 1000)) : 1 / 60; this.lastFrame = timestamp;
      if(rawDt>0&&rawDt<=2&&!document.hidden){this.fpsSeconds+=rawDt;this.fpsFrames++;if(this.fpsSeconds>=.5){this.fps=this.fpsFrames/this.fpsSeconds;this.fpsMeasured=true;this.fpsSeconds=0;this.fpsFrames=0;}}
      else if(document.hidden||rawDt>2){this.fpsSeconds=0;this.fpsFrames=0;this.fpsMeasured=false;}
      if(this.network?.active)this.network.sendInput(dt);
      if (this.state === 'playing') {
        const activeSeconds=this.previousFlightStamp!==undefined&&timestamp-this.previousFlightStamp<=500?Math.max(0,(timestamp-this.previousFlightStamp)/1000):0;
        this.expedition?.collision.advance(activeSeconds);this.finalInterstallar?.advanceReal(activeSeconds);
        const slow = A.animationEnabled('Events')?(this.evolutionTime > 0 ? .24 : this.momentTime>0?.45:1):1;
        this.momentTime=Math.max(0,(this.momentTime||0)-dt);
        this.accumulator = Math.min(.1, this.accumulator + dt * slow * (A.Save.mode==='sandbox'?this.command?.options.speed??1:1));
        let steps = 0; while (this.accumulator >= 1 / 60 && steps++ < 6 && this.state === 'playing') { this.step(1 / 60); this.accumulator -= 1 / 60; }
        this.effects.update(dt * slow);
        if (this.evolutionTime > 0) {
          this.evolutionTime -= dt;
          if (this.evolutionTime <= 0) { this.evolutionTime = 0; this.supernovaAnimation=null;document.getElementById('evolution').hidden = true; if(this.state==='playing'&&A.scaleStage(this.player)>=4)this.ui.toast('ENGINEERING AVAILABLE','K opens engineering. U opens original adaptations.','aqua'); }
        }
      }
      this.detail=A.Save.data.settings.adaptive?A.clamp((this.detail||1)+(this.fps<Math.min(53,Number(A.Save.data.settings.frameLimit)||60)*.94?-dt*.35:this.fps>Math.min(58,Number(A.Save.data.settings.frameLimit)||60)*.96?dt*.025:0),.35,1):1;
      this.renderer.draw(dt); this.ui.update(dt);this.previousFlightStamp=this.state==='playing'&&!document.hidden?timestamp:undefined; requestAnimationFrame(this.boundFrame);
    }
  };
  A.game = new A.Game();
})(window.AC);
