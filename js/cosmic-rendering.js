'use strict';
(function(A){
  A.lensPoint=(x,y,cx,cy,r)=>{const dx=x-cx,dy=y-cy,d=Math.hypot(dx,dy);if(d<.001||d>r*7)return{x,y};const k=r*r*.8/(d*d+r*r*.35)*(1-d/(r*7))**2;return{x:x+dx*k,y:y+dy*k};};
  A.CosmicRenderer=class{
    constructor(r){this.r=r;this.stamps=new Map();this.lenses=[];this.gasLayer=document.createElement("canvas");this.gasFrame=0;this.unitCircle=Array.from({length:73},(_,i)=>({c:Math.cos(i/72*A.TAU),s:Math.sin(i/72*A.TAU)}));const R=A.rng(893);this.galaxy=Array.from({length:1200},()=>{const rad=.1+R()*8,a=(R()<.5?0:Math.PI)+Math.log(rad)*1.7+(R()-.5)*.28;return{x:Math.cos(a)*rad,y:Math.sin(a)*rad,b:R()};});}
    stamp(color){if(this.stamps.has(color))return this.stamps.get(color);const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,color+'a0');gr.addColorStop(.32,color+'48');gr.addColorStop(1,color+'00');x.fillStyle=gr;x.fillRect(0,0,64,64);this.stamps.set(color,c);return c;}
    glow(q,r,color,alpha=1){if(r<.1)return;const c=this.r.ctx;c.globalAlpha=alpha;c.drawImage(this.stamp(color),q.x-r,q.y-r,r*2,r*2);c.globalAlpha=1;}
    // Cached body/lens sprites belong to the previous universe's masses and feed states, so the
    // stamp cache is dropped here too rather than left to grow across restarts.
    reset(){this.lenses=[];this.interstallarDetailed=0;this.gasFrame=0;this.gasCamera=null;this.stamps.clear();this.paintingBH=false;const c=this.gasLayer.getContext("2d");c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,this.gasLayer.width,this.gasLayer.height);}
    prepare(){
      const r=this.r,g=r.game;this.detail=Math.min(g.detail||1,A.Save.data.settings.quality==='low'?.5:1,A.cpuScale());this.lenses=[];this.interstallarDetailed=0;this.horizonDetailed=0;
      if(!g.player||g.state==='menu')return;
      // The lensing pass warps every projected point it touches. It is the one decorative layer
      // that used to run regardless of quality, so it now follows the same adaptive detail gate.
      if(this.detail<.5||A.Save.data.settings.shaderMode==='off')return;
      for(const b of g.world.sources){if(A.appearance(b).type!=='blackhole')continue;const q=r.bodyPoint(b),radius=r.bodyRadius(b)*r.camera.zoom;if(q.x+radius*7<0||q.x-radius*7>r.w||q.y+radius*7<0||q.y-radius*7>r.h)continue;this.lenses.push({x:q.x,y:q.y,r:radius});if(this.lenses.length>=3)break;}
    }
    warp(q){for(const l of this.lenses)q=A.lensPoint(q.x,q.y,l.x,l.y,l.r);return q;}
    behind(){const r=this.r,g=r.game,p=g.player,c=r.ctx,u=g.cosmic;if(!u)return;c.save();
      if(A.scaleStage(p)>=15){const anchor=u.anchor,scale=anchor.scale*1400;c.fillStyle='#a6b8cc';for(let i=0;i<this.galaxy.length;i+=(this.detail<.6?4:2)){const a=this.galaxy[i],q=this.warp(r.screen(anchor.x+a.x*scale,anchor.y+a.y*scale,0,this.galaxyPoint||(this.galaxyPoint={x:0,y:0})));if(q.x<0||q.x>r.w||q.y<0||q.y>r.h)continue;c.globalAlpha=.12+a.b*.3;c.fillRect(q.x,q.y,a.b>.9?2:1,a.b>.9?2:1);}c.globalAlpha=1;}
      this.drawGas();this.r.final?.landmark();
      this.structuredGalaxies?.();this.orbits();this.streams();this.condensation();c.restore();}
    condensation(){
      const r=this.r,g=r.game,p=g.player,c=r.ctx,u=g.cosmic;
      if(!u||A.scaleStage(p)<9||A.scaleStage(p)>=15||this.detail<.5)return;
      // Mark only real, bound, surface-clearing concentrations from the same grouping used
      // by condensation. The cached preview does not create or credit any matter.
      c.save();for(const clump of u.clumps||[]){const q=r.screen(clump.x,clump.y,clump.z),size=A.clamp(A.radius(clump.m*.45)*r.camera.zoom*.5,2,13);if(q.x<-30||q.x>r.w+30||q.y<-30||q.y>r.h+30)continue;this.glow(q,size*3,'#dfc899',clump.ready*.2);c.strokeStyle='#c9d8aa';c.globalAlpha=.15+clump.ready*.35;c.lineWidth=.8;c.beginPath();c.arc(q.x,q.y,size+3,0,A.TAU*clump.ready);c.stroke();}c.restore();}
    drawGas(){
      if(A.Save.data.settings.gasDetail==='off')return;const r=this.r,g=r.game,u=g.cosmic,outer=r.ctx,scale=this.detail<.6||A.Save.data.settings.gasDetail==='low'?.25:.38;
      const w=Math.max(1,Math.round(r.w*scale)),h=Math.max(1,Math.round(r.h*scale));
      const changed=this.gasLayer.width!==w||this.gasLayer.height!==h;
      if(changed){this.gasLayer.width=w;this.gasLayer.height=h;}
      const old=this.gasCamera,dx=old?(old.x-r.camera.x)*r.camera.zoom:0,dy=old?((old.y-r.camera.y)*(r.tilt||1)+((old.z||0)-(r.camera.z||0))*.7)*r.camera.zoom:0,ratio=old?r.camera.zoom/old.zoom:1;
      if(changed||!old||Math.abs(dx)>45||Math.abs(dy)>45||Math.abs(ratio-1)>.04||Math.abs((old.tilt||1)-(r.tilt||1))>.02||this.gasFrame++%(this.detail<.6?5:3)===0){
        const c=this.gasLayer.getContext('2d');c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,w,h);c.setTransform(scale,0,0,scale,0,0);r.ctx=c;
      for(const region of u.regions){const stride=this.detail<.6?2:1;for(let j=0;j<region.cells.length;j+=stride){const cell=region.cells[j];if(cell.m<cell.initial*.005)continue;const q=this.warp(r.screen(cell.x,cell.y,cell.z,this.gasPoint||(this.gasPoint={x:0,y:0}))),size=Math.min(280,cell.r*r.camera.zoom);if(q.x<-size||q.x>r.w+size||q.y<-size||q.y>r.h+size)continue;const fraction=cell.m/cell.initial;this.nebulaWisp(q,size*1.3,region.color,fraction*Math.sqrt(stride),cell);
          if(this.detail>.55&&cell.trail.length>1){c.strokeStyle=region.color;c.globalAlpha=.17*fraction;c.lineWidth=Math.max(1,size*.025);c.beginPath();for(let i=0;i<cell.trail.length;i++){const t=cell.trail[i],v=this.warp(r.screen(t.x,t.y,t.z,this.gasTrailPoint||(this.gasTrailPoint={x:0,y:0})));if(i)c.lineTo(v.x,v.y);else c.moveTo(v.x,v.y);}c.stroke();}
          c.fillStyle=region.color;c.globalAlpha=.35*fraction;for(let i=0;i<Math.round(3*this.detail);i++){const a=cell.seed+i*2.4+(A.animationEnabled('Nebula')?r.animationTime():0)*.018,rr=size*(.1+cell.seed%7*.025);c.fillRect(q.x+Math.cos(a)*rr,q.y+Math.sin(a)*rr*.6,1.2,1.2);}c.globalAlpha=1;}
        if(g.systemView){const q=r.screen(region.x,region.y);c.fillStyle=region.color;c.globalAlpha=.5;c.font='9px ui-monospace,monospace';c.fillText(region.name.toUpperCase(),q.x,q.y-region.r*r.camera.zoom*.6);c.globalAlpha=1;}}
        r.ctx=outer;this.gasCamera={...r.camera,tilt:r.tilt||1};
      }
      const saved=this.gasCamera,offsetX=(saved.x-r.camera.x)*r.camera.zoom,offsetY=((saved.y-r.camera.y)*(r.tilt||1)+((saved.z||0)-(r.camera.z||0))*.7)*r.camera.zoom,k=r.camera.zoom/saved.zoom;
      outer.save();outer.translate(r.w/2+offsetX,r.h/2+offsetY);outer.scale(k,k);outer.drawImage(this.gasLayer,-r.w/2,-r.h/2,r.w,r.h);outer.restore();
    }
    orbits(){const r=this.r,g=r.game,c=r.ctx,u=g.cosmic;let drawn=0;
      // Holding O is a light overlay: faint ellipses for anything already on screen, without
      // switching to the full system view. It stays gated behind the prediction setting.
      const overlay=A.Save.data.settings.prediction&&g.input.keys.has('KeyO');
      for(const b of u.allMembers){const selected=b.id===g.selectedBody,recent=g.time-b.capturedAt<7;
        if(!selected&&!recent&&!g.systemView&&!overlay)continue;
        if(overlay&&!selected&&!recent&&!g.systemView){const q=r.bodyPoint(b);if(q.x<-120||q.x>r.w+120||q.y<-120||q.y>r.h+120)continue;}
        if(!selected&&drawn++>36*this.detail)continue;const o=b.orbit,parent=u.byId.get(b.parentId);if(!o||!parent||o.energy>=0||o.e>=.98)continue;const risk=b.risk==='EJECTION'||b.risk==='COLLISION',foreign=b.systemOwner!==g.player.id;c.strokeStyle=risk?(b.risk==='COLLISION'?'#ef977d':'#e5bc79'):b.collapse?'#d1b898':b.resonanceTime>=15?'#b4e0cc':b.orbitStable?(foreign?'#92b7d4':'#9fd8cd'):'#cbb58f';c.globalAlpha=selected?.6:risk?.22:g.systemView?.18:recent?.23:overlay?.13:.075;
        if(risk){c.setLineDash([4,6]);
          // A slow 1 Hz breath so at-risk orbits catch the eye without opening the system panel.
          if(!A.Save.data.settings.reducedMotion)c.globalAlpha=(selected?.7:.48)*(.25+.45*(.5+.5*Math.sin(r.clock*A.TAU)))/.7;
        }else c.setLineDash([]);c.lineWidth=selected?1.1:.65;c.beginPath();const steps=this.detail<.6?24:72;for(let i=0;i<=steps;i++){const cs=this.unitCircle[i*(72/steps)],d=o.h*o.h/o.mu/(1+o.e*cs.c),q=r.screen(parent.x+d*(o.u[0]*cs.c+o.tangent[0]*cs.s),parent.y+d*(o.u[1]*cs.c+o.tangent[1]*cs.s),(parent.z||0)+d*(o.u[2]*cs.c+o.tangent[2]*cs.s));if(i)c.lineTo(q.x,q.y);else c.moveTo(q.x,q.y);}c.stroke();c.setLineDash([]);c.globalAlpha=1;
        if(b.m>parent.m*.15){const q=r.screen((parent.x*parent.m+b.x*b.m)/(parent.m+b.m),(parent.y*parent.m+b.y*b.m)/(parent.m+b.m));c.strokeStyle='#c9bda4';c.globalAlpha=.4;c.strokeRect(q.x-2,q.y-2,4,4);c.globalAlpha=1;}}
      // Flecks represent fractions of existing belt-body mass, not extra resources.
      c.fillStyle='#9bafa8';c.globalAlpha=.35;for(const belt of u.belts)for(const b of belt)for(let i=0;i<Math.ceil(8*this.detail);i++){const o=b.orbit,a=g.time*A.TAU/o.period+i*2.4+b.seed,d=o.a*(1+.025*Math.sin(i+b.seed)),q=r.screen(g.player.x+Math.cos(a)*d,g.player.y+Math.sin(a)*d);c.fillRect(q.x,q.y,1,1);}c.globalAlpha=1;}
    streams(){let fragmentsDrawn=0,trailDrawn=0;const r=this.r,g=r.game,c=r.ctx,u=g.cosmic;for(const q of u.packets){const owner=u.byId.get(q.owner);if(!owner)continue;const point=r.screen(q.x,q.y,q.z),d=Math.hypot(q.x-owner.x,q.y-owner.y),hot=A.clamp(1-d/(owner.r*8),0,1),color=q.material==='ice'?'#bfeeff':A.scaleStage(owner)<5?'#b6c5b8':hot>.75?'#fff1c8':hot>.4?'#e8b57d':q.material==='dust'?'#9cabba':'#9fb7b5';if(point.x<-160||point.x>r.w+160||point.y<-160||point.y>r.h+160)continue;const width=A.clamp(q.r*r.camera.zoom*Math.pow(q.m/q.initial,.3)*.2,.7,14);
        if(q.trail.length>1&&(trailDrawn++<Math.round(100*this.detail)||q.initial/owner.m>.02)){c.strokeStyle=color;c.globalAlpha=.35;c.lineWidth=this.detail<.6?Math.min(4,width):width;c.beginPath();for(let i=0;i<q.trail.length;i+=(this.detail<.6?4:1)){const t=q.trail[i],p=r.screen(t.x,t.y,t.z);if(i)c.lineTo(p.x,p.y);else c.moveTo(p.x,p.y);}c.stroke();c.globalAlpha=1;}if(this.detail>.55)this.glow(point,width*3,color,.65);c.fillStyle=color;c.fillRect(point.x-1,point.y-1,2,2);
        if(!q.gas&&q.age<1.8&&fragmentsDrawn++<(this.detail<.6?10:32)){c.save();c.translate(point.x,point.y);c.rotate(Math.atan2(q.vy-owner.vy,q.vx-owner.vx));const size=Math.max(1,q.r*r.camera.zoom*(1-q.age/2)),sprite=r.texture({m:q.initial,seed:q.seed,form:q.form==='gas'?'':q.form},size>=14&&this.detail>.6),lod=this.detail<.6||size<12?sprite.tinySprite:size<40?sprite.smallSprite:sprite;c.drawImage(lod,-size*1.4,-size*.5,size*2.8,size);c.restore();}}}
    specialBody(b,q,radius){const r=this.r,c=r.ctx,g=r.game,type=A.appearance(b).type;
      if(type==='cluster'){this.glow(q,radius*2,'#acc7ee',.35);c.fillStyle='#dbe6f0';for(let i=0;i<Math.ceil(24*this.detail);i++){const a=b.seed+i*2.4,d=radius*Math.sqrt(i/24);c.globalAlpha=.25+i%4*.15;c.fillRect(q.x+Math.cos(a)*d,q.y+Math.sin(a)*d*.65,1.5,1.5);}c.globalAlpha=1;return true;}
      if(type==='neutron'){if(this.novaCompact)this.novaCompact(b,q,radius,type);else {this.glow(q,radius*3,'#83c4ee',.6);c.fillStyle='#ecfbff';c.beginPath();c.arc(q.x,q.y,Math.max(2,radius*.3),0,A.TAU);c.fill();}return true;}
      if(type!=='blackhole')return false;
      if(A.appearance(b).visual==='interstallar')return this.interstallarBody(b,q,radius);
      if(!this.paintingBH){
        const feed=(g.cosmic?.ownerMass.get(b.id)||0)/b.m,key='bh-'+(feed>0?1:0)+'-'+Math.round(A.clamp(feed*8,0,1)*8);
        let sprite=this.stamps.get(key);
        if(!sprite){sprite=document.createElement('canvas');sprite.width=sprite.height=256;const original=r.ctx;r.ctx=sprite.getContext('2d');this.paintingBH=true;this.specialBody(b,{x:128,y:128},28);this.paintingBH=false;r.ctx=original;this.stamps.set(key,sprite);}
        const size=radius*256/28;c.drawImage(sprite,q.x-size/2,q.y-size/2,size,size);
        this.horizonMotion(b,q,radius);
        if(b===g.player&&(!g.photo?.active||g.photo.labels)){c.fillStyle='#cbd9d4';c.font='9px ui-monospace,monospace';c.textAlign='center';c.fillText('EVENT HORIZON',q.x,q.y+radius+24);}return true;
      }
      const feeding=(g.cosmic?.ownerMass.get(b.id)||0)/b.m,light=A.clamp(feeding*8,0,1);this.glow(q,radius*4.5,'#a8b5b1',.15+light*.5);
      if(feeding>0){c.save();c.translate(q.x,q.y);for(let i=7;i>=0;i--){c.strokeStyle=i<3?'#fff0c2':i<5?'#efb882':'#889ea5';c.globalAlpha=(.06+light*.09)*(1-i*.035);c.lineWidth=radius*.12;c.beginPath();c.ellipse(0,-radius*.22,radius*(1.35+i*.15),radius*(1.1+i*.07),0,Math.PI,A.TAU);c.stroke();}c.restore();}
      c.fillStyle='#010205';c.beginPath();c.arc(q.x,q.y,radius,0,A.TAU);c.fill();for(let i=0;i<3;i++){c.strokeStyle=i===0?'#ffe8b2':'#b39683';c.globalAlpha=i===0?.7:.15;c.lineWidth=i===0?1.1:2;c.beginPath();c.arc(q.x,q.y,radius*(1.03+i*.055),0,A.TAU);c.stroke();}c.globalAlpha=1;
      if(feeding>0){c.save();c.translate(q.x,q.y);for(let i=0;i<9;i++){c.strokeStyle=i<3?'#fff0bc':i<6?'#edaf75':'#8ea6b0';c.globalAlpha=.1+light*.12;c.lineWidth=radius*.15;c.beginPath();c.ellipse(0,0,radius*(1.3+i*.22),radius*(.25+i*.07),-.13,0,Math.PI);c.stroke();}c.restore();}
      return true;}
    horizonMotion(b,q,radius){
      if(radius<3)return;const r=this.r,g=r.game,c=r.ctx,important=b===g.player||b.id===g.selectedBody;
      const low=this.detail<.6||!important&&(this.horizonDetailed||0)>=2;
      if(!important&&!low)this.horizonDetailed=(this.horizonDetailed||0)+1;
      const time=A.animationEnabled('Horizon')?r.animationTime():0,phase=(b.seed||0)*.013,feeding=A.clamp((g.cosmic?.ownerMass.get(b.id)||0)/Math.max(b.m,1e-8)*8,0,1);
      c.save();c.translate(q.x,q.y);c.lineCap='round';c.globalCompositeOperation='screen';
      // Photon-ring light can orbit an unfed horizon. Disk lanes require actual stored matter.
      const count=feeding>0?(low?3:8):2;
      for(let i=0;i<count;i++){
        const f=(i+.5)/count,d=feeding>0?1.3+f*1.6:1.036+i*.018,a=phase+i*2.39996+time*2.8/Math.pow(d,1.5),near=Math.sin(a)>=0;
        c.save();if(feeding>0&&!near){c.beginPath();c.rect(-radius*4,-radius*3,radius*8,radius*6);c.arc(0,0,radius*1.01,0,A.TAU);c.clip('evenodd');}
        c.strokeStyle=f<.35?'#fff0cf':f<.7?'#eaba8b':'#94b8c4';c.globalAlpha=feeding>0?.25+feeding*.5:.27;c.lineWidth=Math.max(.4,radius*(feeding>0?.03:.018));c.beginPath();c.ellipse(0,feeding>0?-radius*.01:0,radius*d,radius*(feeding>0?.25+f*.52:d),feeding>0?-.13:0,a,a+.22+(1-f)*.48);c.stroke();c.restore();
      }
      c.restore();
    }
    interstallarSprite(low){
      const key='interstallar-'+(low?'low':'high');if(this.stamps.has(key))return this.stamps.get(key);
      const u=low?24:80,s=document.createElement('canvas');s.width=u*11;s.height=u*6;
      const c=s.getContext('2d'),random=A.rng(631944);c.translate(s.width/2,s.height/2);c.rotate(-.075);
      const arc=(rx,ry,a,z,color,alpha,width)=>{c.strokeStyle=color;c.globalAlpha=alpha;c.lineWidth=width;c.beginPath();c.ellipse(0,0,u*rx,u*ry,0,a,z);c.stroke();};
      // A bounded, reusable radiance layer. No image asset or extra matter is created.
      const halo=c.createRadialGradient(0,0,u*.98,0,0,u*3.1);halo.addColorStop(0,'#fff4d22a');halo.addColorStop(.26,'#eec5a91e');halo.addColorStop(.68,'#bb71510a');halo.addColorStop(1,'#b66d4000');c.fillStyle=halo;c.fillRect(-u*5,-u*3,u*10,u*6);
      for(let i=0;i<4;i++)arc(1.28+i*.12,1.19+i*.115,0,A.TAU,'#ffe5c2',.025,u*.28);
      // Edge-on far disk, then the lensed upper and lower images around the shadow.
      c.fillStyle='#cf8c5a';c.globalAlpha=.06;c.beginPath();c.ellipse(0,0,u*4.9,u*.54,0,0,A.TAU);c.fill();
      const diskLines=low?34:74;
      for(let i=diskLines-1;i>=0;i--){const f=i/(diskLines-1),d=1.22+3.7*f;arc(d,.06+d*.095,Math.PI,A.TAU,f<.26?'#ffe8be':f<.6?'#d9a17e':'#8a5646',(.13+.4*(1-f))*(.55+random()*.45),u*((low?.04:.025)+.028*f));}
      const lensLines=low?30:66;
      for(let i=lensLines-1;i>=0;i--){const f=i/(lensLines-1),d=1.075+.79*f,color=f<.16?'#fff9e2':f<.43?'#fce4bd':f<.74?'#dbac90':'#945c4e',alpha=(.18+.66*Math.pow(1-f,.6))*(.65+random()*.35),width=u*(low?.026:.012);
        const height=d*(.97-.035*f);c.strokeStyle=color;c.globalAlpha=alpha;c.lineWidth=width;c.beginPath();c.moveTo(-u*(4.2+.65*f),0);c.bezierCurveTo(-u*d*1.65,0,-u*d*1.04,-u*height*.16,-u*d*Math.cos(.36),-u*height*Math.sin(.36));c.ellipse(0,0,u*d,u*height,0,Math.PI+.36,A.TAU-.36);c.bezierCurveTo(u*d*1.04,-u*height*.16,u*d*1.65,0,u*(4.2+.65*f),0);c.stroke();
        arc(d,d*(.88-.018*f),0,Math.PI,color,alpha*.72,width);
      }
      // Fine radial seams retain the filamentary surface at photo zoom.
      for(let i=0;i<(low?35:160);i++){const d=1.13+random()*.69,a=random()*A.TAU;arc(d,d*(Math.sin(a)<0?.95:.87),a,a+.05+random()*.24,i%3?'#f6d6ad':'#4e2d25',.06+random()*.14,u*.007);}
      c.globalAlpha=1;c.fillStyle='#010205';c.beginPath();c.arc(0,0,u,0,A.TAU);c.fill();
      arc(1.026,1.026,0,A.TAU,'#fff6d7',.9,u*.012);arc(1.052,1.052,0,A.TAU,'#e3c2a1',.22,u*.02);
      // The near disk crosses the shadow. A dark edge gives its thin white core depth.
      for(let i=diskLines-1;i>=0;i--){const f=i/(diskLines-1),d=1.2+3.75*f;c.save();c.translate(0,u*.025);arc(d,.065+d*.083,0,Math.PI,f<.2?'#fff8d9':f<.48?'#ecc6a0':f<.75?'#bb8262':'#6f4940',(.22+.72*(1-f))*(.65+random()*.35),u*(low?.033:.018));c.restore();}
      c.globalAlpha=.22;c.lineWidth=u*.035;c.strokeStyle='#1b1111';c.beginPath();c.moveTo(-u*4.65,u*.085);c.bezierCurveTo(-u*2.2,u*.41,u*2.2,u*.41,u*4.65,u*.085);c.stroke();
      const line=c.createLinearGradient(-u*4.7,0,u*4.7,0);line.addColorStop(0,'#fce0b700');line.addColorStop(.28,'#ffd3a06e');line.addColorStop(.5,'#fff8d9ec');line.addColorStop(.72,'#ffe7c088');line.addColorStop(1,'#fce0b700');c.strokeStyle=line;c.globalAlpha=1;c.lineWidth=u*.034;c.beginPath();c.moveTo(-u*4.7,u*.03);c.bezierCurveTo(-u*2,u*.12,u*2,u*.12,u*4.7,u*.03);c.stroke();
      c.globalAlpha=1;this.stamps.set(key,s);return s;
    }
    interstallarBody(b,q,radius){
      if(radius<=0)return true;
      const r=this.r,g=r.game,c=r.ctx,detail=Math.min(this.detail||1,g.detail||1,A.Save.data.settings.quality==='low'?.5:1);
      // Keep at most two rivals at full filament detail; the player has its own budget.
      const rivalLow=b!==g.player&&(this.interstallarDetailed||0)>=2,low=detail<.6||radius<9||rivalLow;
      if(b!==g.player&&!low)this.interstallarDetailed=(this.interstallarDetailed||0)+1;
      const small=low||radius<28,sprite=this.interstallarSprite(small),u=small?24:80,scale=radius/u;
      const feeding=A.clamp((g.cosmic?.ownerMass.get(b.id)||0)/Math.max(b.m,1e-8)*8,0,1);
      const time=A.animationEnabled('Horizon')?r.animationTime():0,phase=(b.seed%997)*.0063;
      c.save();c.drawImage(sprite,q.x-sprite.width*scale/2,q.y-sprite.height*scale/2,sprite.width*scale,sprite.height*scale);
      c.translate(q.x,q.y);c.rotate(-.075);c.globalCompositeOperation='lighter';c.lineCap='round';
      // Angular drift shears with radius. The shadow and disk plane remain fixed while
      // luminous filaments travel around them. Simulation time freezes on pause/photo.
      const bands=radius<3?0:low?(b===g.player?8:4):18;
      for(let i=0;i<bands;i++){
        const f=(i+.5)/bands,d=1.105+.67*f,a=phase+i*2.39996+time*4.8/Math.pow(d,1.5),upper=Math.sin(a)<0;
        const length=.32+.5*(.5+.5*Math.sin(i*1.7+time*.3));
        c.strokeStyle=f<.27?'#fff9de':f<.66?'#f5d1a7':'#cf9175';c.globalAlpha=(.65+.22*feeding)*(1-f*.3);c.lineWidth=Math.max(.4,radius*(.036+.012*feeding));
        c.beginPath();c.ellipse(0,0,radius*d,radius*d*(upper?.952:.878),0,a,a+length);c.stroke();
      }
      const streams=radius<3?0:low?(b===g.player?8:4):18;
      for(let i=0;i<streams;i++){
        const f=(i+.5)/streams,d=1.25+3.55*f,a=phase+i*2.814+time*3.9/Math.pow(d,.9),near=Math.sin(a)>=0;
        // Far-side streaks cannot cross the actual opaque horizon.
        c.save();if(!near){c.beginPath();c.rect(-radius*5.1,-radius*3,radius*10.2,radius*6);c.arc(0,0,radius*1.04,0,A.TAU);c.clip('evenodd');}
        c.strokeStyle=f<.22?'#fff8dc':f<.55?'#f8cc97':'#d58d68';c.globalAlpha=(.75+.22*feeding)*(1-f*.48);c.lineWidth=Math.max(.4,radius*(.035+.016*feeding));c.beginPath();c.ellipse(0,radius*.025,radius*d,radius*(.065+d*.083),0,a,a+.3+.42*(1-f));c.stroke();
        // Bright heads visibly travel with the same differentially rotating disk lanes.
        if(radius>7){const angle=a+.3+.42*(1-f),x=radius*d*Math.cos(angle),y=radius*.025+radius*(.065+d*.083)*Math.sin(angle);c.globalAlpha=(.75+.2*feeding)*(1-f*.35);c.fillStyle=f<.3?'#fff8dc':'#f0c18e';c.beginPath();c.ellipse(x,y,Math.max(.65,radius*.045),Math.max(.4,radius*.023),0,0,A.TAU);c.fill();}c.restore();
      }
      c.restore();
      if((!g.photo?.active||g.photo.labels)&&(b===g.player||b.kind==='ai')){c.save();c.fillStyle='#e4d5bb';c.font='9px ui-monospace,monospace';c.textAlign='center';c.fillText(b===g.player?'THE INTERSTALLAR':b.name.toUpperCase(),q.x,q.y+radius*1.85+20);if(b!==g.player){c.globalAlpha=.7;c.fillText(A.massText(b.m),q.x,q.y+radius*1.85+33);}c.restore();}
      return true;
    }
    front(){const r=this.r,g=r.game;if(g.photo?.active&&!g.photo.labels&&!g.photo.paths)return;const c=r.ctx,b=g.cosmic.byId.get(g.selectedBody);if(b){if(!b.parentId&&b.orbit){let x=b.x,y=b.y,z=b.z||0,vx=b.vx,vy=b.vy,vz=b.vz||0;const p=g.player,mu=A.Physics.mu(g,p);c.save();c.setLineDash([3,7]);c.strokeStyle='#d6b795';c.globalAlpha=.35;c.beginPath();for(let i=0;i<60;i++){const q=r.screen(x,y,z);if(i)c.lineTo(q.x,q.y);else c.moveTo(q.x,q.y);const dx=p.x+p.vx*i*.25-x,dy=p.y+p.vy*i*.25-y,dz=(p.z||0)-z,k=mu/Math.pow(dx*dx+dy*dy+dz*dz+p.r*p.r*.1,1.5);vx+=dx*k*.25;vy+=dy*k*.25;vz+=dz*k*.25;x+=vx*.25;y+=vy*.25;z+=vz*.25;}c.stroke();c.restore();}const q=r.bodyPoint(b),rad=b.r*r.camera.zoom;c.strokeStyle='#b2e5d0';c.strokeRect(q.x-rad-5,q.y-rad-5,rad*2+10,rad*2+10);c.font='10px ui-monospace,monospace';c.fillStyle='#c4e7d8';c.textAlign='center';c.fillText(b.orbitState,q.x,q.y-rad-15);}}
  };
})(window.AC);
