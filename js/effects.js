'use strict';
(function (A) {
  A.Effects = class {
    constructor(game) { this.game = game; this.particles = []; this.pool = []; this.rings = []; this.labels = [];this.drawBins=new Map(); }
    // Called on restart so nothing from the previous universe survives into the next one.
    reset() { for (const p of this.particles) if (this.pool.length < 1400) this.pool.push(p); this.particles.length = 0; this.rings.length = 0; this.labels.length = 0;this.drawBins.clear(); }
    particle(x, y, vx, vy, life, size, color, z=0, vz=0) {
      const max = Math.round((A.Save.data.settings.quality === 'low' ? 420 : 1200)*Math.max(.45,this.game.detail||1));
      if (this.particles.length >= max) return;
      const p = this.pool.pop() || {}; Object.assign(p, { x, y, z, vx, vy, vz, life, maxLife: life, size, color }); this.particles.push(p);
    }
    burst(x, y, count, speed, color, z=this.game.player?.z||0) {
      const r = this.game.world ? this.game.world.random : Math.random;
      for (let i = 0; i < count; i++) { const a = r() * A.TAU, v = speed * (.15 + r()); this.particle(x, y, Math.cos(a) * v, Math.sin(a) * v, .3 + r() * 1.4, A.unit(this.game.player.m) * (1 + r() * 2), color,z); }
    }
    jet(p, d, boost, s) {
      const random = this.game.world.random, x = p.x - d.x * p.r, y = p.y - d.y * p.r;
      const v = (boost ? 65 : 30) * s;
      this.particle(x, y, p.vx - d.x * v + (random() - .5) * 12 * s, p.vy - d.y * v + (random() - .5) * 12 * s, .25 + random() * .4, (boost ? 3 : 1.7) * s, boost ? '#b8f5ed' : '#a6bbb9',p.z||0,p.vz||0);
    }
    ring(x, y, radius, color, large = false,z=this.game.player?.z||0) { this.rings.push({ x, y,z, radius, color, life: large ? 2.8 : 1, maxLife: large ? 2.8 : 1, speed: radius * (large ? 12 : 5) }); if (this.rings.length > 24) this.rings.shift(); }
    label(x, y, text, color, bodyId=null, z=this.game.player?.z||0) { this.labels.push({ x, y, z, text, color, bodyId, life: 1.8 }); if (this.labels.length > 15) this.labels.shift(); }
    update(dt) {
      let n = 0;
      for (const p of this.particles) { p.life -= dt; if (p.life <= 0) { if (this.pool.length < 1400) this.pool.push(p); continue; } p.x += p.vx * dt; p.y += p.vy * dt;p.z+=p.vz*dt; p.vx *= Math.exp(-dt * .5); p.vy *= Math.exp(-dt * .5);p.vz*=Math.exp(-dt*.5); this.particles[n++] = p; } this.particles.length = n;
      this.rings = this.rings.filter(r => { r.life -= dt; r.radius += r.speed * dt; return r.life > 0; });
      if (this.rings.length > 24) this.rings.splice(0, this.rings.length - 24);
      this.labels = this.labels.filter(l => { l.life -= dt; const b=l.bodyId&&this.game.cosmic?.byId.get(l.bodyId);if(b){l.x=b.x;l.y=b.y;l.z=b.z||0;}else l.y-=15*A.unit(this.game.player.m)*dt; return l.life > 0; });
      if (this.labels.length > 15) this.labels.splice(0, this.labels.length - 15);
    }
    draw(ctx, renderer) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for(const bin of this.drawBins.values())bin.length=0;
      const budget=Math.round((A.Save.data.settings.quality==='low'?420:1200)*Math.max(.35,this.game.detail||1)),stride=Math.max(1,Math.ceil(this.particles.length/budget));
      for(let i=0;i<this.particles.length;i+=stride){const p=this.particles[i],pos=renderer.screen(p.x,p.y,p.z);if(pos.x<-20||pos.x>renderer.w+20||pos.y<-20||pos.y>renderer.h+20)continue;const alpha=Math.min(3,Math.floor(A.clamp(p.life/p.maxLife,0,1)*4)),key=p.color+':'+alpha;let bin=this.drawBins.get(key);if(!bin){bin=[];this.drawBins.set(key,bin);}bin.push(pos.x,pos.y,Math.max(.7,p.size*renderer.camera.zoom));}
      for(const [key,bin] of this.drawBins){if(!bin.length)continue;const split=key.lastIndexOf(':');ctx.fillStyle=key.slice(0,split);ctx.globalAlpha=(Number(key.slice(split+1))+.5)/4*.8;ctx.beginPath();for(let i=0;i<bin.length;i+=3){const s=bin[i+2];ctx.rect(bin[i]-s/2,bin[i+1]-s/2,s,s);}ctx.fill();}
      if(this.drawBins.size>80)for(const [key,bin] of this.drawBins)if(!bin.length)this.drawBins.delete(key);
      ctx.globalCompositeOperation = 'source-over';
      for (const r of this.rings) { const pos = renderer.screen(r.x, r.y,r.z||0);const radius=r.radius*renderer.camera.zoom;if(radius>Math.max(renderer.w,renderer.h)*2||pos.x+radius<0||pos.x-radius>renderer.w||pos.y+radius<0||pos.y-radius>renderer.h)continue; ctx.globalAlpha = r.life / r.maxLife * .55; ctx.strokeStyle = r.color; ctx.lineWidth = 1 + r.life / r.maxLife; ctx.beginPath(); ctx.arc(pos.x, pos.y,radius, 0, A.TAU); ctx.stroke(); }
      ctx.font = '11px ui-monospace, monospace'; ctx.textAlign = 'center';
      for (const l of this.game.photo?.active&&!this.game.photo.labels?[]:this.labels) { const pos = renderer.screen(l.x,l.y,l.z||0); ctx.globalAlpha = Math.min(1, l.life * 2); ctx.fillStyle = l.color; ctx.fillText(l.text, pos.x, pos.y - 18); }
      ctx.restore();
    }
  };
})(window.AC);
