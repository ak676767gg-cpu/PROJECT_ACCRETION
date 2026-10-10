'use strict';
(function (A) {
  A.AI = {
    update(g, b, dt) {
      const s = A.unit(b.m), p = g.player, far = Math.hypot(b.x - p.x, b.y - p.y) > 1500 * A.unit(p.m);
      b.think -= dt;
      if (b.think <= 0) { this.choose(g, b); b.think = far ? 1.1 : .3 + g.world.random() * .15; }
      let accel = (A.scaleStage(b)>=15?2:A.scaleStage(b)>=9?4:32) * s * (b.personality === 'aggressive' ? 1.12 : b.personality === 'efficient' ? 1.08 : .96);
      // An efficient rival on the edge of a class stops chasing and consolidates what it holds.
      const base = Math.pow(5, A.scaleStage(b)), toNext = (b.m - base) / (base * 4);
      b.consolidating = b.personality === 'efficient' && toNext > .82;
      if (b.consolidating) { accel *= .35; b.vx *= Math.exp(-.35 * dt); b.vy *= Math.exp(-.35 * dt);b.intent='Consolidating'; }
      b.controlAx=b.steerX*accel;b.controlAy=b.steerY*accel;b.ax+=b.controlAx;b.ay+=b.controlAy;
      const cap = 90 * s;
      if (Math.hypot(b.vx, b.vy) > cap) { b.vx *= Math.exp(-.45 * dt); b.vy *= Math.exp(-.45 * dt); }
      const stage = A.scaleStage(b);
      if (stage > b.evolution) {
        b.evolution = stage;
        if (!far) { g.effects.ring(b.x, b.y, b.r, A.classFor(b.m).color,false,b.z); g.effects.burst(b.x, b.y, 22, s * 45, A.classFor(b.m).color,b.z); }
      }
      b.hp = Math.min(100, b.hp + dt * 1.8);
    },
    systemIntent(g,b,prey) {
      const c=g.cosmic;if(!c||A.scaleStage(b)<9)return false;
      const system=c.systems.get(b.id),s=A.unit(b.m),personality=b.personality;
      const steer=(x,y,speed)=>{const dx=x-b.x,dy=y-b.y,d=Math.hypot(dx,dy)||1,desired=Math.min(speed*s,d*.1),vx=dx/d*desired-b.vx,vy=dy/d*desired-b.vy,l=Math.max(8*s,Math.hypot(vx,vy));b.steerX=vx/l;b.steerY=vy/l;};
      if(system?.stablePlanets&&b.hp<45){const food=system.members.find(q=>q.parentId===b.id&&!q.collapse);if(food)food.collapse=true;}
      // A stolen world is answered directly: a short pursuit burst, then normal logic resumes.
      const theft=c.thefts?.get(b.id);
      if(theft&&personality==='aggressive'){
        if(g.time-theft.at<9){steer(g.player.x,g.player.y,16);b.target=g.player.id;b.intent='Contesting a stolen world';return true;}
        c.thefts.delete(b.id);
      }
      // Three stable bodies is enough to settle: the cautious rival holds its system centre.
      if(personality==='cautious'&&(system?.stablePlanets||0)>=3){b.waypoint=null;steer(b.x,b.y,0);b.target=null;b.intent='Guarding its worlds';return true;}
      if(personality==='cautious'&&system?.bound){steer(b.x,b.y,0);b.target=null;b.intent='Settling its system';return true;}
      if(personality==='aggressive'||personality==='opportunistic'){
        let target=null,dist=800*s;
        const resources=personality==='opportunistic'?c.packets:c.allMembers;
        for(const q of resources){const owner=personality==='opportunistic'?c.byId.get(q.owner):c.root(q);if(!owner||owner===b||owner.m>b.m*1.5)continue;const d=Math.hypot(q.x-b.x,q.y-b.y);if(d<dist){dist=d;target=q;}}
        if(target){b.target=target.id||target.owner;steer(target.x,target.y,personality==='aggressive'?12:8);b.intent=personality==='aggressive'?'Contesting a system':'Stripping exposed matter';return true;}
      }
      if(personality==='efficient'&&(system?.bound||prey?.bound===b.id)){steer(b.x,b.y,0);b.target=null;b.intent='Shepherding stable orbits';return true;}
      if(personality==='explorer'&&system?.bound){if(!b.waypoint)return false;steer(b.waypoint.x,b.waypoint.y,8);b.intent='Travelling with its system';return true;}
      return false;
    },
    choose(g, b) {
      const s = A.unit(b.m), radius = Math.min(1600 * A.unit(g.player.m), 600 * s), personality = b.personality;
      let prey = null, best = -Infinity, fearX = 0, fearY = 0, fears = 0;
      g.world.hash.query(b.x, b.y, radius, o => {
        if (o === b || !o.alive || o.grace > 0 && o.kind === 'player') return;
        const dx = o.x - b.x, dy = o.y - b.y, d = Math.hypot(dx, dy);
        if (d < 1 || d > radius) return;
        // Aggressive rivals tolerate a worse mass ratio before retreating; cautious rivals keep a
        // wider berth from anything heavier than themselves.
        if (o.m > b.m * (personality === 'aggressive' ? 2.4 : personality === 'cautious' ? 1.2 : 1.35)) {
          const safe = (personality === 'cautious' ? 430 : personality === 'aggressive' ? 170 : 205) * A.unit(o.m);
          if (d < safe) { const q = (1 - d / safe) * (personality === 'cautious' ? 5.2 : 4); fearX -= dx / d * q; fearY -= dy / d * q; fears++; }
        }
        if (o.m < b.m * .64 && o.grace <= 0) {
          let score = Math.pow(o.m / b.m, .6) / (d / s + 35);
          if (personality === 'opportunistic' && o.kind === 'debris') score *= 4;
          // Opportunists prefer matter already held in someone else's well over free-floating debris.
          if (personality === 'opportunistic' && o.bound && o.bound !== b.id) score *= 3.2;
          if (personality === 'aggressive' && ['player', 'ai'].includes(o.kind)) score *= 6.5;
          if (personality === 'cautious' && ['player', 'ai'].includes(o.kind)) score *= .35;
          // Cautious rivals favour quiet debris fields over contested company.
          if (personality === 'cautious' && o.kind === 'debris') score *= 2.4;
          if (personality === 'cautious' && o.bound && o.bound !== b.id) score *= .4;
          if (personality === 'efficient' && o.bound === b.id) score *= .35;
          if(o.systemOwner===b.id&&o.orbitStable&&!b.consolidating&&b.hp>45)score*=.025;
          if(personality==='efficient'){const approach=((o.vx-b.vx)*dx+(o.vy-b.vy)*dy)/d;score/=1+Math.max(0,approach)/(25*s);}
          if (score > best) { best = score; prey = o; }
        }
      });
      if (fears) {
        const d = Math.hypot(fearX, fearY) || 1; b.steerX = fearX / d; b.steerY = fearY / d; b.target = null;b.intent='Escaping a larger well';b.retreatUntil=g.time+3; return;
      }
      if(this.systemIntent(g,b,prey))return;
      if (prey) {
        b.target = prey.id;
        b.intent=prey.kind==='ai'||prey.kind==='player'?'Hunting a weaker body':prey.kind==='debris'?'Recovering collision debris':'Gathering a field';
        const dx = prey.x - b.x, dy = prey.y - b.y, dist = Math.hypot(dx, dy), lead = Math.min(1.5, dist / (60 * s));
        let tx = dx + (prey.vx - b.vx) * lead, ty = dy + (prey.vy - b.vy) * lead;
        const speed = personality === 'efficient' ? 23 : 42;
        let d = Math.hypot(tx, ty) || 1;
        const desired = Math.min(speed * s, dist * (personality === 'efficient' ? .25 : .65));
        tx = tx / d * desired - b.vx + prey.vx * .6; ty = ty / d * desired - b.vy + prey.vy * .6;
        d = Math.hypot(tx, ty) || 1; b.steerX = tx / Math.max(d, 12 * s); b.steerY = ty / Math.max(d, 12 * s);
      } else {
        b.waypointIn = (b.waypointIn || 0) - 1;
        // Explorers roam further and re-plan sooner, so their tracks stay visibly restless.
        const arrive = (personality === 'explorer' ? 150 : 90) * s;
        if (!b.waypoint || Math.hypot(b.waypoint.x - b.x, b.waypoint.y - b.y) < arrive || (personality === 'explorer' && b.waypointIn <= 0)) {
          const d=(personality==='explorer'?1850:500)*s;let best=-Infinity,point=null;
          for(let i=0;i<5;i++){const a=g.world.random()*A.TAU,x=b.x+Math.cos(a)*d,y=b.y+Math.sin(a)*d;let score=g.expedition?.atlas.densityAt(x,y)||.5;
            for(const source of g.world.sources){if(source===b||source.m<b.m*1.2)continue;const distance=Math.hypot(x-source.x,y-source.y)/s;score-=Math.max(0,1-distance/450)*(personality==='cautious'?2:.6);}
            if(score>best){best=score;point={x,y};}}
          b.waypoint=point;
          b.waypointIn = personality === 'explorer' ? 22 : 90;
        }
        const dx = b.waypoint.x - b.x, dy = b.waypoint.y - b.y, d = Math.hypot(dx, dy) || 1;
        b.steerX = dx / d; b.steerY = dy / d; b.target = null;b.intent=personality==='explorer'?'Surveying richer sectors':'Seeking an unclaimed field';
      }
    }
  };
})(window.AC);
