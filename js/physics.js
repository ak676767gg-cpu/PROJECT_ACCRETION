'use strict';
(function (A) {
  A.Physics = {
    muCache:new WeakMap(),
    influence(g, b) { return Math.min(1300 * A.unit(g.player.m), (A.scaleStage(b)>=9?780:295) * A.unit(b.m) * (b === g.player ? 1 + .2 * g.upgrades.get('range') : 1)); },
    mu(g, b) {
      const route=(A.Supernova?.buffs(b).gravity??1)*(A.Save.mode==='sandbox'?g.command?.options.gravity??1:1);if(route===0)return 0;
      const player=b===g.player,pull=player?g.upgrades.get('pull'):0,amp=player&&g.amplifyTime>0?2:1,bonus=player?g.cosmic?.bonus||0:g.cosmic?.profile(b).gravity||0,pet=player?g.life?.buffs().gravity||0:0,old=this.muCache.get(b);
      if(old&&old.m===b.m&&old.pm===g.player.m&&old.pull===pull&&old.amp===amp&&old.bonus===bonus&&old.pet===pet&&old.route===route)return old.mu;
      const mu=18000*b.m/A.unit(g.player.m)*(1+.22*pull)*amp*(1+bonus)*(1+pet)*route;this.muCache.set(b,{route,m:b.m,pm:g.player.m,pull,amp,bonus,pet,mu});return mu;
    },
    // Same arithmetic order as structural collision defense. Landmark heat uses
    // these existing multipliers; it does not create collision scars or debris.
    defendedDamage(g,body,base){if(body===g.player&&A.Save.mode==='sandbox'&&g.command?.options.damage===false)return 0;const player=body===g.player,armor=player?(1-.18*g.upgrades.get('armor'))*(1-(g.life?.buffs().defense||0))*A.Supernova.buffs(body).damage:.92;const damage=(player&&g.difficulty==='relaxed'?.65:1)*base*armor;return player&&g.industry?g.industry.protect(damage):damage;},
    step(g, dt) {
      const w = g.world, p = g.player, scale = A.unit(p.m),resistance=1-.2*g.upgrades.get('resist'),debrisPull=1+.35*g.upgrades.get('magnet'),captureDrag=1+.35*g.upgrades.get('capture'); w.rebuild();
      for (const b of w.bodies) {
        b.pr=b.r; b.pa=b.angle;
        b.ax = 0; b.ay = 0; b.az=0; b.previousBound = b.bound; b.bound = null; b.binding = 0;
        b.hit = Math.max(0, b.hit - dt * 3); b.cooldown = Math.max(0, b.cooldown - dt); b.grace = Math.max(0, b.grace - dt);
        if (b.ttl > 0) { b.ttl -= dt; if (b.ttl <= 0) b.alive = false; }
      }
      g.input.update(dt);
      for (const b of w.bodies) if (b.alive && b.kind === 'ai' && g.command?.options.rivals!==false) A.AI.update(g, b, dt);
      for (const source of w.sources) {
        if (!source.alive) continue;
        const range = this.influence(g, source), range2=range*range,mu = this.mu(g, source),early=A.scaleStage(source)<9&&!source.parentId,sourceSoft=source.r*.18;
        if(mu<=0)continue;
        w.hash.query(source.x, source.y, range, b => {
          if (b === source || !b.alive) return;
          const dx = source.x - b.x, dy = source.y - b.y, dz=(source.z||0)-(b.z||0), r2 = dx * dx + dy * dy + dz*dz;
          if (r2 > range2 || r2 < .01) return;
          const d = Math.sqrt(r2), soft = Math.max(sourceSoft, b.r * .4), softened=r2+soft*soft,softDistance=Math.sqrt(softened);
          let strength=mu/(softened*softDistance);if(d>range*.8)strength*=(range-d)/(range*.2);
          if (b === p && source.m > p.m) strength *= resistance*A.Supernova.buffs(p).resist;
          if (source === p && b.kind === 'debris') strength *= debrisPull;
          if (b === p && (p.grace > 0 || p.invulnerable > 0) && source.m > p.m) strength *= .22;
          b.ax += dx * strength; b.ay += dy * strength; b.az+=dz*strength;
          const rvx = b.vx - source.vx, rvy = b.vy - source.vy,rvz=(b.vz||0)-(source.vz||0), energy = .5 * (rvx * rvx + rvy * rvy+rvz*rvz) - mu / softDistance;
          if (source.m > b.m * 1.55 && energy < 0 && mu / d > b.binding) {
            b.bound = source.id; b.binding = mu / d;
            if (b.kind !== 'player' && b.kind !== 'ai' && early && d < range * .62) {
              // Only bound close orbits lose energy: tangential momentum remains and decays smoothly.
              const damping = .09 * (1 - d / range) * (source === p ? captureDrag : 1);
              b.vx -= rvx * (1 - Math.exp(-damping * dt)); b.vy -= rvy * (1 - Math.exp(-damping * dt));
            }
          }
        });
      }
      g.cosmic?.forces(dt);if(g.finalInterstallar?.positioned&&!g.finalInterstallar.done)g.finalInterstallar.forces(dt);
      let captures = 0;
      for (const b of w.bodies) {
        if (!b.alive) continue;
        b.boundTime = b.bound && b.bound === b.previousBound ? b.boundTime + dt : 0;
        if (b.bound === p.id) captures++;
        b.px = b.x; b.py = b.y; b.pz=b.z||0;
        b.vx += b.ax * dt; b.vy += b.ay * dt; b.vz=(b.vz||0)+b.az*dt;
        const speed = Math.hypot(b.vx, b.vy), max = (b === p ? (g.boosting ? A.FLIGHT.boost : A.FLIGHT.cruise) * A.Supernova.buffs(p).speed * (1 + .1 * g.upgrades.get('thrust')) * (g.industry?.flightMultiplier()||1) : 235) * Math.max(scale, A.unit(b.m));
        if (!b.parentId && speed > max) { const factor = A.lerp(1, max / speed, A.ease(3, dt)); b.vx *= factor; b.vy *= factor; }
        b.x += b.vx * dt; b.y += b.vy * dt; b.z=(b.z||0)+b.vz*dt; b.angle += b.spin * dt;
        if (g.tick % 5 === 0 && (b.kind === 'player' || b.kind === 'ai' || b.kind === 'comet' || b.bound && b.boundTime > .4)) {
          b.trail.push({ x: b.x, y: b.y, z:b.z }); if (b.trail.length > (b === p ? 48 : 24)) b.trail.shift();
        }
      }
      if (captures >= 5) A.Save.achievement('well', g);
      // Continuous closest-approach collision tests prevent tunnelling during fast burns.
      w.hash.build(w.bodies, w.cellSize());
      const seen = new Set();
      for (const source of w.sources) {
        if (!source.alive) continue;
        w.hash.query(source.x, source.y, source.r + 95 * scale + Math.hypot(source.vx, source.vy) * dt, b => {
          if (b === source || !b.alive || !source.alive) return;
          const dx = b.px - source.px, dy = b.py - source.py, vx = (b.x - b.px) - (source.x - source.px), vy = (b.y - b.py) - (source.y - source.py);
          const t = A.clamp(-(dx * vx + dy * vy) / (vx * vx + vy * vy || 1), 0, 1);
          const cx=dx+vx*t,cy=dy+vy*t,cz=(b.z||0)-(source.z||0),contact=(b.r+source.r)*.94;
          if(cx*cx+cy*cy+cz*cz>=contact*contact)return;
          const key = Math.min(b.id, source.id) + ':' + Math.max(b.id, source.id);if(seen.has(key))return;seen.add(key);this.collide(g,source,b);
        });
      }
      // Nearby small-body collisions enrich the field without an all-pairs universe.
      if (g.tick % 3 === 0) {
        let budget = 100;
        w.hash.query(p.x, p.y, 420 * scale, a => {
          if (!a.alive || a.kind !== 'rock' || budget-- <= 0) return;
          w.hash.query(a.x, a.y, a.r * 3, b => {
            if (!a.alive || !b.alive || b.id <= a.id || b.kind !== 'rock' || a.cooldown || b.cooldown) return;
            if (Math.hypot(a.x - b.x, a.y - b.y,(a.z||0)-(b.z||0)) < a.r + b.r) this.collide(g, a, b);
          });
        });
      }
      this.threats(g, dt);
      g.stats.maxVelocity = Math.max(g.stats.maxVelocity, Math.hypot(p.vx, p.vy) / scale);
    },
    collide(g, a, b) {
      if (!a.alive || !b.alive || A.Save.mode==='sandbox'&&g.command?.options.collisions===false) return;
      if(A.appearance(a).type==='nebula'||A.appearance(b).type==='nebula')return;
      const protectedContact = (body, other) => body.grace > 0 && (!['player', 'ai'].includes(body.kind) || other.m >= body.m / 1.58);
      // Spawn protection blocks dangerous contacts without delaying the first safe captures.
      if (protectedContact(a, b) || protectedContact(b, a)) return;
      let big = a.m >= b.m ? a : b, small = big === a ? b : a;
      const relative = Math.hypot(a.vx - b.vx, a.vy - b.vy), scale = A.unit(g.player.m), ratio = big.m / small.m, involvesPlayer = a === g.player || b === g.player;
      if(big===g.player&&small.m<big.m&&small.water>0)g.life?.collect(small);
      if (ratio >= 1.58 && small !== g.player) {
        if(g.cosmic){
          // Below stellar scale a captured body used to simply vanish on contact. Matter parcels
          // only become visible at star and black-hole scale, so give earlier captures the same
          // sense of continuity with one burst in the body's own colour.
          const visible=A.scaleStage(big)<9&&small.r*(g.renderer?.camera?.zoom||0)>1.1&&Math.hypot(small.x-g.player.x,small.y-g.player.y)<900*scale;
          if(visible)g.effects.burst(small.x,small.y,Math.min(14,4+Math.round(small.r*.5)),small.r*3+10*scale,A.appearance(small).color);
          g.cosmic.capture(big,small);return;}
        const amount = small.m, old = big.m;
        const fast = relative / Math.max(1, scale) > 72;
        const efficiency = A.clamp(.86 + (big === g.player ? .04 * g.upgrades.get('yield') : 0) - (fast ? .12 : 0), .55, 1);
        big.vx = (big.vx * old + small.vx * amount * efficiency) / (old + amount * efficiency);
        big.vy = (big.vy * old + small.vy * amount * efficiency) / (old + amount * efficiency);
        big.setMass(old + amount * efficiency); small.alive = false; big.hit = .48;
        g.world.fragments(small, amount * (1 - efficiency), fast ? 6 : 2, relative * .28 + 14 * scale);
        const near = Math.hypot(big.x - g.player.x, big.y - g.player.y) < 1000 * scale;
        if (near) g.effects.burst(small.x, small.y, fast ? 25 : 9, scale * (fast ? 55 : 20), small.kind === 'ai' ? '#efb585' : '#acdccc');
        if (big === g.player) {
          g.stats.captures++; g.stats.totalGained += amount * efficiency; A.Save.achievement('first', g);
          if (small.kind === 'ai') { g.stats.defeats++; if (amount > old * .35) A.Save.achievement('predator', g); g.ui.toast('RIVAL ABSORBED', small.name + ' · ' + A.massText(amount), 'gold'); }
          g.audio.play(fast ? 'collision' : 'absorb', A.clamp(amount / old, .02, .8));
          g.renderer.shake = Math.max(g.renderer.shake, fast ? 4 : 1.3);
          if (amount > old * .025) g.effects.label(small.x, small.y, '+' + (amount * efficiency / old * 100).toFixed(1) + '%', '#b6f2d8');
        }
        if (involvesPlayer) g.stats.largestCollision = Math.max(g.stats.largestCollision, amount);
        return;
      }
      if (a.cooldown > 0 || b.cooldown > 0) return;
      if(involvesPlayer)g.expedition?.replay.event("Structural collision",a===g.player?b:a);
      const dx = small.x - big.x, dy = small.y - big.y, d = Math.hypot(dx, dy) || 1, nx = dx / d || 1, ny = dy / d;
      const closing = (small.vx - big.vx) * nx + (small.vy - big.vy) * ny;
      const impulse = -(1 + .68) * Math.min(0, closing) / (1 / big.m + 1 / small.m);
      big.vx -= impulse / big.m * nx; big.vy -= impulse / big.m * ny; small.vx += impulse / small.m * nx; small.vy += impulse / small.m * ny;
      const separation = Math.max(0, (big.r + small.r) * 1.14 - d);
      small.x += nx * separation * big.m / (big.m + small.m); small.y += ny * separation * big.m / (big.m + small.m);
      big.x -= nx * separation * small.m / (big.m + small.m); big.y -= ny * separation * small.m / (big.m + small.m);
      a.cooldown = b.cooldown = 1.5; a.hit = b.hit = 1;
      const violence = A.clamp(relative / scale / 120, .12, 1);
      for (const body of [a, b]) {
        const other = body === a ? b : a, player = body === g.player;
        if (player && body.invulnerable > 0) continue;
        let damage = this.defendedDamage(g,body,other.m > body.m * 1.5 ? 32 + violence * 18 : 8 + violence * 18);
        if (player && g.upgrades.get('shield') && g.shellCooldown <= 0 && (body.hp < 45 || other.m > body.m * 2)) {
          damage = 0; g.shellCooldown = 65 - 10 * g.upgrades.get('shield'); g.effects.ring(body.x, body.y, body.r, '#b0fff2'); g.ui.toast('EMERGENCY SHELL', 'Collision stabilized. Accelerate away.', 'aqua');
        }
        if(A.scaleStage(body)>=3&&A.scaleStage(body)<=8){const q=A.Composition.ensure(body);damage*=A.clamp(1+q.ice*.3-q.iron*.18,.82,1.3);}
        body.hp -= damage;
        if(damage>0)A.recordImpact(g,body,other,violence);
        const lost = body.m * A.clamp(damage * .0035, 0, .19); body.setMass(body.m - lost);
        g.world.fragments(body, lost, 5, 34 * scale + relative * .3);
        if (player) {
          body.invulnerable = 2.6; g.lastDamage = g.time;
          const away = body === small ? 1 : -1; body.vx += nx * 72 * scale * away; body.vy += ny * 72 * scale * away;
          g.audio.play('collision', violence); g.renderer.shake = 9 * violence + 3;
          g.stats.largestCollision = Math.max(g.stats.largestCollision, other.m);
          g.ui.toast(body.hp < 35 ? 'MASS CRITICAL' : 'STRUCTURAL IMPACT', 'Hold thrust away from the gravity well. Shift brakes; Space boosts if installed.', 'danger');
          if (body.hp <= 0 || body.m < .19) { g.world.fragments(body, body.m, 10, 55 * scale); g.end(other.name || A.classFor(other.m).name); }
        } else if (body.hp <= 0) {
          body.alive = false; g.world.fragments(body, body.m, 10, 42 * scale);
          if (body.kind === 'ai' && involvesPlayer) { g.stats.defeats++; g.ui.toast('RIVAL FRAGMENTED', body.name + ' has become a debris field.', 'gold'); }
        }
      }
      if (Math.hypot(a.x - g.player.x, a.y - g.player.y) < 1000 * scale) { g.effects.burst((a.x + b.x) / 2, (a.y + b.y) / 2, 34, 80 * scale, '#ecb894'); g.effects.ring(a.x, a.y, a.r, '#eeb88c'); }
    },
    threats(g, dt) {
      const p = g.player; let nearest = null, score = 0;
      for (const b of g.world.sources) {
        if (!b.alive || b === p || b.m < p.m * 1.55) continue;
        const d = Math.hypot(p.x - b.x, p.y - b.y), range = this.influence(g, b), q = range * 1.7 / d;
        if (q > score && d < range * 1.7) { score = q; nearest = b; }
      }
      g.threat = nearest;
      if (nearest) {
        const d = Math.hypot(p.x - nearest.x, p.y - nearest.y), rvx = p.vx - nearest.vx, rvy = p.vy - nearest.vy;
        const radial = ((p.x - nearest.x) * rvx + (p.y - nearest.y) * rvy) / d;
        const escape = Math.sqrt(2 * this.mu(g, nearest) / d);
        g.escape = radial > 0 && Math.hypot(rvx, rvy) > escape;
        if (nearest.m >= p.m * 4 && p.bound === nearest.id) g.escapeChallenge = { id: nearest.id, time: g.time };
        if (g.escapeChallenge && g.escape && d > this.influence(g, nearest) * .9 && nearest.id === g.escapeChallenge.id) { A.Save.achievement('escape', g); g.escapeChallenge = null; }
        if (p.bound === nearest.id && g.time - g.lastWarning > 7) { g.lastWarning = g.time; g.audio.play('danger'); g.ui.toast('GRAVITATIONAL CAPTURE', 'Build sideways velocity, then accelerate outward.', 'danger'); }
      } else {
        g.escape = false;
        if (g.escapeChallenge) {
          const escaped = g.world.bodies.find(b => b.id === g.escapeChallenge.id && b.alive);
          if (escaped && g.time - g.escapeChallenge.time < 40) {
            const dx = p.x - escaped.x, dy = p.y - escaped.y;
            if (Math.hypot(dx, dy) > this.influence(g, escaped) && dx * (p.vx - escaped.vx) + dy * (p.vy - escaped.vy) > 0) A.Save.achievement('escape', g);
          }
          g.escapeChallenge = null;
        }
      }
    }
  };
})(window.AC);
