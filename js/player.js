'use strict';
(function (A) {
  A.Input = class {
    constructor(game, canvas) {
      this.keys = new Set(); this.mouse = { x: 0, y: 0, held: false }; this.game = game;
      window.addEventListener('keydown', e => {
        if (e.target.matches('input,select,textarea')) { if (e.code === 'Escape') game.ui.back(); return; }
        if(e.target.closest?.('#flight-dock')&&['Tab','Space','Enter','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))return;
        if(game.ui.handleWorkspaceKey(e))return;
        if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
        if(e.code==='Tab'&&game.state==='playing'&&A.scaleStage(game.player)>=9)e.preventDefault();
        if (!e.repeat) {
          if (e.code === 'Escape') game.togglePause();
          if(game.state==='playing'&&A.scaleStage(game.player)>=9){if(e.code==='Tab')game.systemView=!game.systemView;if(e.code==='KeyL')game.ui.system();if(e.code==='KeyC')game.cosmic.collapse(game.selectedBody);}
          if(e.code==='KeyG'&&game.state==='playing')game.ui.galaxy();
          if(e.code==='KeyP'&&game.state==='playing')game.ui.photoMode();
          if(e.code==='KeyV'&&game.state==='playing')game.ui.replayView();
          if(game.state==='playing'&&!e.repeat){if(e.code==='KeyX')game.command?.setAim('attack');if(e.code==='KeyZ')game.command?.setAim('drones');if(e.code==='KeyI')game.command?.setAim('mining');if(e.code==='KeyT')game.ui.quickChat();if(e.code==='KeyY')game.command?.taunt(0);if(e.code==='KeyK')game.ui.showUpgrades('engineering');}
          if(e.code==='KeyB'&&game.state==='playing'&&A.Save.mode==='sandbox')game.ui.sandbox();
          if (e.code === 'KeyU' && game.state === 'playing') game.ui.showUpgrades('adaptations');
          if (e.code === 'KeyH' && game.state === 'playing') game.ui.toggleHud();
          if (e.code === 'KeyN' && ['playing','menu'].includes(game.state)) game.ui.showLab();
          if (e.code === 'KeyM') game.ui.toggleMute();
          if (e.code === 'KeyE' && game.state === 'playing') game.pulse();
          if (e.code === 'KeyQ' && game.state === 'playing') game.amplify();
          if (e.code === 'KeyR' && game.state === 'playing') game.renderer.resetCamera();
          // Upgrade buttons are deterministic; digits remain HUD shortcuts in flight.
        }
        this.keys.add(e.code);
      });
      window.addEventListener('keyup', e => this.keys.delete(e.code));
      window.addEventListener('blur', () => { this.clear(); if (game.state === 'playing') game.pause(); });
      document.addEventListener('visibilitychange', () => { if (document.hidden) { this.clear(); if (game.state === 'playing') game.pause(); } });
      canvas.addEventListener('mousemove', e => { this.mouse.x = e.clientX; this.mouse.y = e.clientY; });
      canvas.addEventListener('mouseleave', () => { this.mouse.held=false; });
      canvas.addEventListener('mousedown', e => { if(e.button===0&&game.state==='playing'){this.mouse.x=e.clientX;this.mouse.y=e.clientY;if(game.systemView)game.cosmic.selectAt(e.clientX,e.clientY);else if(game.command?.aimMode==='drones')game.command.orderDrones();else this.mouse.held=true;} });
      window.addEventListener('mouseup', () => this.mouse.held = false);
      canvas.addEventListener('wheel', e => { if (game.state === 'playing') { e.preventDefault(); game.renderer.manualZoom = A.clamp(game.renderer.manualZoom * Math.exp(-e.deltaY * .001), .5, 1.6); } }, { passive: false });
    }
    clear() { this.keys.clear(); this.mouse.held = false; }
    direction() {
      const k = this.keys; let x = +(k.has('KeyD') || k.has('ArrowRight')) - +(k.has('KeyA') || k.has('ArrowLeft')), y = +(k.has('KeyS') || k.has('ArrowDown')) - +(k.has('KeyW') || k.has('ArrowUp'));
      if (A.Save.data.settings.mouse && this.mouse.held && (!this.game.command||this.game.command.aimMode==='flight')) { const r=this.game.renderer,p=this.game.state==='playing'&&!this.game.photo?.active?{x:r.w/2,y:r.h/2}:r.bodyPoint(this.game.player); x = this.mouse.x - p.x; y = this.mouse.y - p.y; if(Math.hypot(x,y)<8){x=0;y=0;}else y/=r.tilt||1; }
      const d = Math.hypot(x, y); return d ? { x: x / d, y: y / d } : { x: 0, y: 0 };
    }
    update(dt) {
      const g = this.game, p = g.player, u = g.upgrades, s = A.unit(p.m), d = this.direction();
      let accel = A.FLIGHT.acceleration * s * A.Supernova.buffs(p).speed * (1 + .2 * u.get('thrust')) * (1+(g.life?.buffs().thrust||0)) * (g.industry?.flightMultiplier()||1);
      const counter = d.x * p.vx + d.y * p.vy < 0;
      if (counter) accel *= 1 + .2 * u.get('brake') + .25*u.get('turning') + (g.life?.buffs().brake || 0) * .4;
      g.boosting = false;
      if (this.keys.has('Space') && u.get('boost') && g.boostEnergy > .02 && (d.x || d.y)) {
        g.boosting = true; accel *= 3.5; g.boostEnergy = Math.max(0, g.boostEnergy - dt / (2.4 + u.get('boost') * .6));
        if (g.boostSound <= 0) { g.audio.play('boost'); g.boostSound = .22; }
      } else g.boostEnergy = Math.min(1, g.boostEnergy + dt * .105 * (1 + (g.life?.buffs().burn || 0)));
      g.boostSound -= dt;
      p.controlAx=d.x*accel; p.controlAy=d.y*accel; p.ax += d.x * accel; p.ay += d.y * accel;
      const brake = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
      const brakeRate = 1.1 + .5 * u.get('brake') + (g.life?.buffs().brake || 0);
      if (brake) { p.vx *= Math.exp(-dt * brakeRate); p.vy *= Math.exp(-dt * brakeRate); }
      p.thrustX = d.x; p.thrustY = d.y;
      if(g.tick%6===0)g.audio.setMotion?.(!!(d.x||d.y),g.boosting,brake,A.clamp((g.cosmic?.rate||0)/p.m*120,0,1));
      if ((d.x || d.y) && g.world.random() < .62) g.effects.jet(p, d, g.boosting, s);
      p.invulnerable = Math.max(0, p.invulnerable - dt);
      if (g.time - g.lastDamage > 6) p.hp = Math.min(A.cohesionLimit(g), p.hp + dt * 3.3);
      for (const key of ['pulseCooldown', 'amplifyCooldown', 'amplifyTime', 'shellCooldown']) g[key] = Math.max(0, g[key] - dt);
    }
  };
})(window.AC);
