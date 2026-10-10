/* Remnant surfaces and transformation light share the existing canvas, clock and quality budget. */
'use strict';
(function(A){
  const P=A.CosmicRenderer.prototype,previousBody=P.specialBody,prepare=P.prepare;
  const orbit=(c,x,y,r,flat,angle,color,alpha,width=1,start=0,end=A.TAU)=>{c.save();c.translate(x,y);c.rotate(angle);c.strokeStyle=color;c.globalAlpha=alpha;c.lineWidth=width;c.beginPath();c.ellipse(0,0,Math.max(.1,r),Math.max(.1,r*flat),0,start,end);c.stroke();c.restore();};
  P.prepare=function(){prepare.call(this);const p=this.r.game.player;if(!p||this.detail<.5)return;const type=A.appearance(p).type;if(!['singularity','gravastar'].includes(type))return;const q=this.r.bodyPoint(p);if(this.lenses.length>=3)this.lenses.pop();this.lenses.unshift({x:q.x,y:q.y,r:this.r.bodyRadius(p)*this.r.camera.zoom});};
  P.novaCloud=function(b,q,radius){
    const c=this.r.ctx,g=this.r.game,color=A.appearance(b).color,t=A.animationEnabled('Horizon')?this.r.animationTime():0*.38;
    const key='nova-cloud-'+b.seed;let knots=this.stamps.get(key);if(!knots){const random=A.rng(b.seed||851);knots=Array.from({length:36},(_,i)=>({a:random()*A.TAU,d:Math.sqrt(random())*.92,w:.24+random()*.38,phase:random()*A.TAU,speed:.08+random()*.16}));this.stamps.set(key,knots);}
    c.save();c.globalCompositeOperation='screen';this.glow(q,radius*2.35,color,.24);const stride=this.detail<.6?3:1;
    for(let i=0;i<knots.length;i+=stride){const k=knots[i],a=k.a+t*k.speed,d=radius*k.d*(1+.045*Math.sin(t+k.phase)),v={x:q.x+Math.cos(a)*d,y:q.y+Math.sin(a)*d*.8};this.glow(v,radius*k.w,color,.3);if(i%3===0)this.glow(v,radius*k.w*.55,'#dfe8c8',.13);}
    c.lineWidth=this.detail<.6?.7:1.1;const lanes=this.detail<.6?2:5;
    for(let lane=0;lane<lanes;lane++){c.strokeStyle=lane%2?'#203938':color;c.globalAlpha=lane%2?.18:.24;c.beginPath();for(let i=0;i<14;i++){const a=lane*A.TAU/lanes+t*.21+i*.16,d=radius*(.18+i*.067)*(1+.025*Math.sin(t+i)),x=q.x+Math.cos(a)*d,y=q.y+Math.sin(a)*d*.8;if(i)c.lineTo(x,y);else c.moveTo(x,y);}c.stroke();}
    c.globalCompositeOperation='source-over';c.globalAlpha=.24;c.strokeStyle=color;c.setLineDash([2,10]);c.lineWidth=.7;c.beginPath();c.arc(q.x,q.y,radius*2.35,0,A.TAU);c.stroke();c.setLineDash([]);c.restore();
  };
  P.novaCompact=function(b,q,radius,type){
    const c=this.r.ctx,g=this.r.game,t=A.animationEnabled('Horizon')?this.r.animationTime():0,color=A.appearance(b).color,small=Math.max(3,radius*.42);
    c.save();c.globalCompositeOperation='screen';this.glow(q,radius*3.3,color,.6);
    if(type==='neutron'||type==='magnetar'){
      const spin=t*(type==='magnetar'?1.35:1.7)+b.seed%6;c.translate(q.x,q.y);c.rotate(spin);
      const pulse=.72+.28*Math.sin(t*3.4+b.seed%6)**2;c.fillStyle=color;c.globalAlpha=.17*pulse;c.beginPath();c.moveTo(-small*.4,0);c.lineTo(0,-radius*5.5);c.lineTo(small*.4,0);c.lineTo(0,radius*5.5);c.closePath();c.fill();c.globalAlpha=.5*pulse;c.fillRect(-.8,-radius*3.5,1.6,radius*7);c.rotate(-spin);c.translate(-q.x,-q.y);
      if(type==='magnetar')for(let i=0;i<(this.detail<.6?3:7);i++){const a=t*.3+i*.85;orbit(c,q.x,q.y,radius*(1.3+i*.14),.45,a,color,.22,.85,.1,A.TAU-.5);}
      c.globalAlpha=1;c.fillStyle='#f4fdff';c.beginPath();c.arc(q.x,q.y,small,0,A.TAU);c.fill();orbit(c,q.x,q.y,small*1.3,.9,0,color,.6,.8);
    }else if(type==='strange'){
      for(let i=0;i<(this.detail<.6?2:5);i++)orbit(c,q.x,q.y,radius*(1.2+i*.3),.6,t*.14+i*.5,color,.12+(i===0?.18:0),1);
      c.globalCompositeOperation='source-over';c.fillStyle='#eef3d5';c.globalAlpha=.95;c.beginPath();const points=this.detail<.6?20:48;for(let i=0;i<points;i++){const a=i*A.TAU/points,d=small*(1+.09*Math.sin(a*5-t*.8)+.04*Math.sin(a*9+t*.3)),x=q.x+Math.cos(a)*d,y=q.y+Math.sin(a)*d;if(i)c.lineTo(x,y);else c.moveTo(x,y);}c.closePath();c.fill();
      c.globalCompositeOperation='screen';for(let i=0;i<(this.detail<.6?2:4);i++){const a=t*(i%2?-.55:.36)+i*1.7;orbit(c,q.x,q.y,small*(.58+i*.1),.63,a,color,.37,.75,a,a+2.1);}
      c.strokeStyle=color;c.globalAlpha=.3;c.setLineDash([2,8]);c.beginPath();c.arc(q.x,q.y,radius*4.5,0,A.TAU);c.stroke();
    }else if(type==='gravastar'){
      c.globalCompositeOperation='source-over';c.globalAlpha=1;const core=c.createRadialGradient(q.x-radius*.2,q.y-radius*.2,0,q.x,q.y,radius);core.addColorStop(0,'#33574f');core.addColorStop(.72,'#132b29');core.addColorStop(.94,'#24443c');core.addColorStop(1,'#b9dbc5');c.fillStyle=core;c.beginPath();c.arc(q.x,q.y,radius,0,A.TAU);c.fill();
      // Very thin physical boundary. Bright bands are moving surface waves, not a photon ring.
      orbit(c,q.x,q.y,radius,1,0,'#c6e3cc',.85,Math.max(.8,radius*.022));
      for(let n=0;n<(this.detail<.6?3:6);n++){const a=t*(n%2?-.25:.2)+n*1.05;orbit(c,q.x,q.y,radius*(.965+.004*Math.sin(t+n)),1,0,color,.45,Math.max(.7,radius*.018),a,a+.55);}
      c.strokeStyle='#83bfa8';c.lineWidth=.6;c.globalAlpha=.3;for(let lane=0;lane<(this.detail<.6?2:4);lane++){const a=lane*.78+t*.06;c.beginPath();c.ellipse(q.x,q.y,radius*.78,radius*.2,a,0,A.TAU);c.stroke();}
    }else{
      c.globalCompositeOperation='source-over';c.globalAlpha=1;c.fillStyle='#010506';c.beginPath();c.arc(q.x,q.y,Math.max(2,radius*.72),0,A.TAU);c.fill();c.globalCompositeOperation='screen';orbit(c,q.x,q.y,radius*.82,.86,0,color,.9,Math.max(1,radius*.07));
      for(let n=0;n<(this.detail<.6?3:7);n++){const a=t*-.65+n*.9;orbit(c,q.x,q.y,radius*(.98+n*.085),.48,.1,color,.18+.12*(n%2),1,a,a+1.9);}
      c.strokeStyle='#9ebfc7';c.globalAlpha=.4;c.lineWidth=.8;for(let lane=0;lane<(this.detail<.6?2:4);lane++){c.beginPath();for(let n=0;n<14;n++){const d=radius*(.7+n*.14),a=lane*1.57+Math.log(d/radius)*3.2-t*.42,x=q.x+Math.cos(a)*d,y=q.y+Math.sin(a)*d*.48;if(n)c.lineTo(x,y);else c.moveTo(x,y);}c.stroke();}
    }
    c.restore();
  };
  P.novaPrecursor=function(b,q,radius){const route=A.Supernova.route(b),level=A.Supernova.level(b);if(!route||level<1||level>=A.Supernova.REMNANT||radius<3)return;const c=this.r.ctx,g=this.r.game,t=A.animationEnabled('Horizon')?this.r.animationTime():0,color=A.appearance(b).color,count=this.detail<.6?3:6;c.save();c.globalCompositeOperation='screen';
    for(let i=0;i<count;i++){const angle=i*2.39996+t*(route==='nebula'?.15:route==='neutron'?.8:route==='gravastar'?(i%2?-.3:.3):-.35),rad=radius*(1.08+i*.075+(route==='nebula'?.12*level:0));orbit(c,q.x,q.y,rad,route==='neutron'?.65:.86,route==='gravastar'?angle*.07:0,color,.16+.1*level,.8,angle,angle+1.25);}
    if(route==='neutron'&&level===2){const angle=t*.8;c.translate(q.x,q.y);c.rotate(angle);c.fillStyle=color;c.globalAlpha=.1;c.beginPath();c.moveTo(-radius*.12,0);c.lineTo(0,-radius*3);c.lineTo(radius*.12,0);c.lineTo(0,radius*3);c.closePath();c.fill();}
    c.restore();
  };
  P.specialBody=function(b,q,radius){this.novaPrecursor(b,q,radius);const type=A.appearance(b).type;if(type==='nebula'){this.novaCloud(b,q,radius);return true;}if(['singularity','gravastar','magnetar','strange'].includes(type)||type==='neutron'&&A.Supernova.route(b)==='neutron'){this.novaCompact(b,q,radius,type);return true;}return previousBody.call(this,b,q,radius);};
  P.supernova=function(){
    const r=this.r,g=r.game,a=g.supernovaAnimation,p=g.player;if(!a||!p||g.evolutionTime<=0||['menu','over'].includes(g.state))return;
    const c=r.ctx,q=r.bodyPoint(p),age=A.clamp(a.duration-g.evolutionTime,0,a.duration),fraction=age/a.duration,color=A.appearance(p).color,unit=A.unit(p.m)*r.camera.zoom,detail=this.detail;
    c.save();c.globalCompositeOperation='screen';
    if(!A.animationEnabled('Events')){this.glow(q,unit*95,color,.2);c.restore();return;}
    const flash=Math.exp(-age*4),front=520*unit*A.clamp(age/2.2,0,1),fade=Math.max(0,1-fraction);
    this.glow(q,unit*(70+age*90),color,flash*.9);c.fillStyle='#fff3d4';c.globalAlpha=flash*.08;c.fillRect(0,0,r.w,r.h);c.globalAlpha=1;
    orbit(c,q.x,q.y,Math.max(1,front),.95,0,color,fade*.27,1.5);
    if(a.path==='nebula'){
      const count=detail<.6?10:24;for(let i=0;i<count;i++){const angle=i*2.39996,d=front*(.4+.3*Math.sin(i*3.1)),pos={x:q.x+Math.cos(angle)*d,y:q.y+Math.sin(angle)*d*.8};this.glow(pos,unit*(22+age*14),i%3===0?'#d5dfb8':color,fade*.3);}
    }else if(a.path==='singularity'){
      c.globalCompositeOperation='source-over';c.globalAlpha=Math.min(.8,age*.45)*fade;c.fillStyle='#020608';c.beginPath();c.arc(q.x,q.y,unit*(15+70*Math.exp(-age)),0,A.TAU);c.fill();c.globalCompositeOperation='screen';
      const count=detail<.6?5:12;for(let i=0;i<count;i++){const d=unit*(20+180*(1-((fraction*2+i/count)%1)));orbit(c,q.x,q.y,d,.55,age*.25,color,fade*.28,1,i*.53,i*.53+2.2);}
    }else if(a.path==='neutron'){
      c.translate(q.x,q.y);c.rotate(age*.35);c.fillStyle='#dff7ff';c.globalAlpha=fade*.19;c.beginPath();c.moveTo(-unit*10,0);c.lineTo(0,-Math.min(r.h,front*1.4));c.lineTo(unit*10,0);c.lineTo(0,Math.min(r.h,front*1.4));c.closePath();c.fill();c.rotate(-age*.35);c.translate(-q.x,-q.y);orbit(c,q.x,q.y,Math.max(1,front*.6),.33,.12,'#b0dfdf',fade*.42,1.5);
    }else{
      const shell=unit*(25+105*Math.exp(-age*.7));orbit(c,q.x,q.y,shell,.92,age*.18,color,fade*.6,unit*1.5);orbit(c,q.x,q.y,shell*1.4,.68,-age*.23,'#dce8c9',fade*.36,1.2);orbit(c,q.x,q.y,Math.max(1,front*.72),.95,0,color,fade*.16,.8);
    }
    c.restore();
  };
  const draw=A.Renderer.prototype.draw;
  A.Renderer.prototype.draw=function(dt){draw.call(this,dt);this.cosmic?.supernova();};
})(window.AC);
