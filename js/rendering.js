'use strict';
(function (A) {
  const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  A.Renderer = class {
    constructor(game, surface) {
      this.game = game; this.canvas = surface; this.ctx = surface.getContext('2d', { alpha: false }); this.camera = { x: 0, y: 0, z:0, zoom: .9 };
      this.manualZoom = 1; this.shake = 0; this.clock = 0; this.sprites = new Map(); this.dpr = 1;
      this.resetSurfaces();
      const random = A.rng(87193); this.stars = Array.from({ length: 540 }, () => ({ x: random(), y: random(), z: .1 + random() * .9, brightness: .12 + random() * .6, tint: random() }));
      this.nebula = this.makeNebula(); this.minimap = document.getElementById('minimap'); this.mapctx = this.minimap.getContext('2d');
      this.resize(); window.addEventListener('resize', () => this.resize());
    }
    resize() {
      this.w = window.innerWidth; this.h = window.innerHeight; const settings=A.Save.data.settings,choice=settings.resolution,auto=Math.min(window.devicePixelRatio || 1, settings.quality === 'low' ? 1 : 1.75) * (this.renderScale || 1);this.dpr=choice==='native'?Math.min(2,window.devicePixelRatio||1):choice&&choice!=='auto'?A.clamp(Number(choice)/this.h,.2,3):auto;this.dpr=Math.min(this.dpr,Math.sqrt(16777216/(this.w*this.h)));
      this.canvas.width = Math.round(this.w * this.dpr); this.canvas.height = Math.round(this.h * this.dpr); this.canvas.style.width = this.w + 'px'; this.canvas.style.height = this.h + 'px';
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.backdrop = canvas(this.canvas.width, this.canvas.height);
      this.backdrop.getContext('2d', { alpha: false }).drawImage(this.nebula, 0, 0, this.backdrop.width, this.backdrop.height);
    }
    screen(x, y, z=0, out=null) { const tilt=this.tilt||1,q=out||{};q.x=(x-this.camera.x)*this.camera.zoom+this.w/2;q.y=((y-this.camera.y)*tilt+(z-(this.camera.z||0))*.7)*this.camera.zoom+this.h/2;return q; }
    renderPosition(b) {
      const alpha=this.game.state==='playing'?A.clamp((this.game.accumulator||0)*60,0,1):1;
      return {x:A.lerp(Number.isFinite(b.px)?b.px:b.x,b.x,alpha),y:A.lerp(Number.isFinite(b.py)?b.py:b.y,b.y,alpha),z:A.lerp(b.pz||0,b.z||0,alpha)};
    }
    bodyPoint(b) { const q=this.renderPosition(b);return this.screen(q.x,q.y,q.z); }
    animationTime() {
      if(A.Save.data.settings.reducedMotion)return 0;
      const g=this.game;
      if(!g.player||g.state==='menu')return this.clock;
      // Match position interpolation: the latest fixed step is the end of this frame's
      // interval. Fractional accumulator time keeps surface motion smooth above 60 Hz.
      return Math.max(0,(g.time||0)-(g.state==='playing'&&!g.photo?.active?(1-A.clamp((g.accumulator||0)*60,0,1))/60:0));
    }
    bodyAngle(b) {
      if(!A.animationEnabled('Planets'))return (b.seed||0)%628/100;
      const alpha=this.game.state==='playing'?A.clamp((this.game.accumulator||0)*60,0,1):1;
      return A.lerp(Number.isFinite(b.pa)?b.pa:b.angle,b.angle||0,alpha);
    }
    bodyRadius(b) {
      const alpha=this.game.state==='playing'?A.clamp((this.game.accumulator||0)*60,0,1):1;
      return A.lerp(Number.isFinite(b.pr)?b.pr:b.r,b.r,alpha);
    }
    resetSurfaces() {
      this.surfaceMaps=new Map();this.surfaceStates=new WeakMap();this.surfaceColumns=new Map();this.surfaceJobs=new Map();this.surfaceFrame=0;
      this.surfaceDraws=0;this.surfaceBuilds=0;this.surfaceBuildBudget=1;this.surfaceBudget=A.Save.data.settings.quality==='low'?1:3;
    }
    lockCamera() {
      const g=this.game;if(!g.player||g.state==='menu'||g.photo?.active)return;
      // Body interpolation already smooths the fixed-step simulation. Following that same
      // point avoids a second follow lag, velocity look-ahead, and depth-induced drift.
      const q=this.renderPosition(g.player);this.camera.x=q.x;this.camera.y=q.y;this.camera.z=q.z;
    }
    resetCamera() { this.manualZoom=1;this.lockCamera(); }
    makeNebula() {
      const c = canvas(1200, 800), ctx = c.getContext('2d'), r = A.rng(12253); ctx.fillStyle = '#050b12'; ctx.fillRect(0, 0, c.width, c.height);
      for (let i = 0; i < 58; i++) {
        const x = r() * 1400 - 100, y = 600 - x * .36 + (r() - .5) * 220, radius = 95 + r() * 260;
        const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
        g.addColorStop(0, i % 3 ? 'rgba(40,75,77,.075)' : 'rgba(95,80,57,.055)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      }
      for (let i = 0; i < 1800; i++) { const x = r() * c.width, y = 570 - x * .32 + (r() - .5) * 120; ctx.fillStyle = 'rgba(161,190,194,' + r() * .12 + ')'; ctx.fillRect(x, y, 1, 1); }
      return c;
    }
    surfaceKey(b,low=false) {
      const cl=A.appearance(b),type=cl.type,variant=(b.seed||0)%12;
      const material=b.composition?A.Composition.dominant(b):b.material==='ice'?'ice':'rock';
      const climate=type==='planet'?(b.climate==='Scorched'?'scorched':b.climate==='Airless'?'airless':b.climate==='Frozen'||material==='ice'?'frozen':'ocean'):'';
      return [type,variant,Math.min(21,A.scaleStage(b)),cl.color,material,climate,low?'low':A.Save.data.settings.textureDetail||'high'].join(':');
    }
    surfaceMap(b,low=false,deferred=false,priority=false) {
      const key=this.surfaceKey(b,low);let asset=this.surfaceMaps.get(key);
      if(asset){this.surfaceMaps.delete(key);this.surfaceMaps.set(key,asset);return asset;}
      const pending=this.surfaceJobs.get(key);
      if(pending){pending.requestFrame=this.surfaceFrame;if(deferred)return null;pending.paintRows(pending.row,pending.height);this.surfaceJobs.delete(key);return pending.complete();}
      if(deferred&&this.surfaceJobs.size>=2){if(!priority)return null;const discard=[...this.surfaceJobs].find(([,job])=>!job.priority);if(!discard)return null;this.surfaceJobs.delete(discard[0]);}
      const cl=A.appearance(b),type=cl.type,variant=(b.seed||0)%12,seed=variant*12791+Math.min(21,A.scaleStage(b))*371;
      const w=low||A.Save.data.settings.textureDetail==='low'?128:A.Save.data.settings.textureDetail==='medium'?256:384,h=w/2,albedo=canvas(w,h),clouds=canvas(w,h),ctx=albedo.getContext('2d'),cloudCtx=clouds.getContext('2d');
      const image=ctx.createImageData(w,h),vapour=cloudCtx.createImageData(w,h),random=A.rng(seed),lattice=new Float32Array(4096);
      for(let i=0;i<lattice.length;i++)lattice[i]=random();
      // Longitude repeats seamlessly. Generate once, then project cached longitude strips;
      // no surface texels, noise fields or physical particles are regenerated each frame.
      const noise=(x,y,o,period=8)=>{const ix=Math.floor(x),iy=Math.floor(y),mask=period-1,x0=(ix+o)&mask,x1=(x0+1)&mask,y0=((iy+o*3)&63)*64,y1=((iy+o*3+1)&63)*64;let fx=x-ix,fy=y-iy;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);const a=lattice[y0+x0],b=lattice[y0+x1],c=lattice[y1+x0],d=lattice[y1+x1];return (a+(b-a)*fx)*(1-fy)+(c+(d-c)*fx)*fy;};
      const fbm=(u,v,o)=>noise(u,v,o)*.57+noise(u*2,v*2,o+11,16)*.29+noise(u*4,v*4,o+23,32)*.14;
      const rgb=[1,3,5].map(i=>parseInt(cl.color.slice(i,i+2),16)),material=b.composition?A.Composition.dominant(b):b.material==='ice'?'ice':'rock';
      const frozen=key.includes(':frozen:'),dry=key.includes(':scorched:')||key.includes(':airless:');
      const paintRows=(first,last)=>{for(let y=first;y<last;y++){
        const lat=Math.asin(A.clamp((y+.5)/h*2-1,-1,1)),v=lat*2.3+6;
        for(let x=0;x<w;x++){
          const u=x/w*8,k=(y*w+x)*4,warp=fbm(u,v,91)-.5,terrain=fbm(u+warp*.62,v+(noise(u,v,31)-.5)*.6,seed),grain=(noise(u*8,v*8,17,64)-.5)*10;
          let red,green,blue,cloud=0;
          if(type==='planet'){
            const coast=.475+(variant%3)*.018,land=terrain>coast,shore=A.clamp((terrain-(coast-.07))/.075,0,1),mountain=Math.max(0,terrain-.58)*230;
            if(dry){red=land?116+mountain:64+shore*34;green=land?82+mountain*.7:49+shore*25;blue=land?55+mountain*.4:35+shore*16;}
            else if(land){const desert=A.clamp((.55-Math.abs(lat))*.95+(noise(u,v,78)-.5)*1.8,0,1);red=A.lerp(33,155,desert)+mountain;green=A.lerp(74,128,desert)+mountain*.63;blue=A.lerp(47,79,desert)+mountain*.5;const edge=A.clamp(1-(terrain-coast)*75,0,1);red=A.lerp(red,177,edge*.4);green=A.lerp(green,162,edge*.4);blue=A.lerp(blue,113,edge*.4);}
            else {red=7+shore*18;green=27+shore*58;blue=53+shore*64;}
            const ice=frozen?A.clamp(.7+(terrain-.5)*2,.35,1):A.clamp((Math.abs(lat)-1.05+(terrain-.5)*.4)*8,0,1);
            red=A.lerp(red,201,ice);green=A.lerp(green,223,ice);blue=A.lerp(blue,226,ice);
            const wind=Math.sin(u*A.TAU/8+v*1.9)*.5+warp*.6;
            cloud=A.clamp((fbm(u*2+wind,v*1.8+wind*.3,seed+37)-.49)*5.4,0,.94)*(dry?.14:1);
          }else if(type==='gas'||type==='brown'){
            const ripple=fbm(u,v*2,23),bands=.5+.5*Math.sin(lat*37+(ripple-.5)*3.6),fine=.5+.5*Math.sin(lat*113+(terrain-.5)*5);
            if(type==='gas'){red=151+bands*64+fine*11;green=113+bands*66+fine*9;blue=87+bands*55+fine*8;}
            else {red=98+bands*96+fine*17;green=40+bands*55+fine*12;blue=35+bands*29;}
            cloud=A.clamp((fbm(u*2,v*2,45)-.56)*3.7,0,.6);
          }else if(type==='star'){
            const cells=fbm(u*4,v*4,29),boil=.76+cells*.4,hot=A.clamp((terrain-.55)*4,0,.8);
            red=rgb[0]*boil+hot*35;green=rgb[1]*boil+hot*32;blue=rgb[2]*boil+hot*25;
            cloud=A.clamp((fbm(u*4,v*4,51)-.51)*2.6,0,.72);
          }else{
            const basalt=terrain<.46,ice=material==='ice'? .65+terrain*.25:Math.abs(lat)>1.24?.22:0;
            red=(type==='moon'?142:137)+(terrain-.5)*72-(basalt?20:0);green=(type==='moon'?144:125)+(terrain-.5)*69-(basalt?20:0);blue=(type==='moon'?136:106)+(terrain-.5)*64-(basalt?14:0);
            red=A.lerp(red,179,ice);green=A.lerp(green,211,ice);blue=A.lerp(blue,218,ice);
          }
          image.data[k]=red+grain;image.data[k+1]=green+grain;image.data[k+2]=blue+grain;image.data[k+3]=255;
          vapour.data[k]=type==='brown'?251:243;vapour.data[k+1]=type==='brown'?160:248;vapour.data[k+2]=type==='brown'?99:248;vapour.data[k+3]=cloud*255;
        }
      }
      };
      const complete=()=>{
      ctx.putImageData(image,0,0);cloudCtx.putImageData(vapour,0,0);
      if(type==='moon'||type==='dwarf'){
        for(let i=0;i<(low?32:85);i++){
          const x=random()*w,y=(.08+random()*.84)*h,rx=1.3+random()*w*.033,ry=rx*.63;
          // Repeat edge craters so their rims never pop at the longitude seam.
          for(const off of [-w,0,w]){const X=x+off;if(X+rx<0||X-rx>w)continue;ctx.fillStyle='#151a213f';ctx.beginPath();ctx.ellipse(X,y,rx,ry,0,0,A.TAU);ctx.fill();ctx.strokeStyle='#e1d7b06e';ctx.lineWidth=Math.max(.5,rx*.14);ctx.beginPath();ctx.ellipse(X,y,rx,ry,0,Math.PI*.94,Math.PI*1.92);ctx.stroke();ctx.strokeStyle='#11151e66';ctx.beginPath();ctx.ellipse(X,y,rx,ry,0,0,Math.PI*.85);ctx.stroke();}
        }
      }
      this.sphereLighting||=new Map();const lightKey=type==='star'?'emissive':'solid';let lighting=this.sphereLighting.get(lightKey);if(!lighting){lighting=canvas(128,128);const light=lighting.getContext('2d'),shade=light.createImageData(128,128);
      // Orthographic sphere normals give a real terminator and a shaded limb.
      for(let y=0;y<128;y++)for(let x=0;x<128;x++){const nx=(x-63.5)/63.5,ny=(y-63.5)/63.5,rr=nx*nx+ny*ny;if(rr>1)continue;const nz=Math.sqrt(1-rr),day=Math.max(0,-nx*.49-ny*.34+nz*.8),edge=Math.pow(1-nz,2),k=(y*128+x)*4;
        const darkness=type==='star'?.12+edge*.3:.87*(1-Math.pow(day,.52));shade.data[k]=2;shade.data[k+1]=7;shade.data[k+2]=15;shade.data[k+3]=darkness*255;
      }light.putImageData(shade,0,0);this.sphereLighting.set(lightKey,lighting);}
      asset={key,type,albedo,clouds,lighting,storms:Array.from({length:low?2:4},(_,i)=>({lon:random()*A.TAU,lat:(random()-.5)*1.2,size:.08+random()*.08,speed:.16+random()*.14,i})),ringed:type==='gas'||type==='planet'&&(b.seed||0)%3===0};
      if(asset.ringed){asset.rings=[canvas(384,384),canvas(384,384)];for(let front=0;front<2;front++){const c=asset.rings[front].getContext('2d');c.translate(192,192);c.rotate(-.35);for(let i=0;i<(low?15:36);i++){const f=i/(low?14:35),d=1.35+f*.6;c.strokeStyle=i%6===3?'#342d28':'#d6bea0';c.globalAlpha=(i%6===3?.27:.19)*(1-f*.45);c.lineWidth=low?2.4:1.1;c.beginPath();c.ellipse(0,0,d*94,d*94*.26,0,front?0:Math.PI,front?Math.PI:A.TAU);c.stroke();}}}
      this.surfaceMaps.set(key,asset);const limit=low?12:24;while(this.surfaceMaps.size>limit)this.surfaceMaps.delete(this.surfaceMaps.keys().next().value);
      if(!deferred)this.surfaceBuilds++;return asset;
      };
      if(deferred){this.surfaceJobs.set(key,{row:0,height:h,paintRows,complete,priority,requestFrame:this.surfaceFrame});this.surfaceBuilds++;return null;}
      paintRows(0,h);return complete();
    }
    advanceSurfaces() {
      this.surfaceFrame++;
      for(const [key,job] of this.surfaceJobs)if(this.surfaceFrame-job.requestFrame>3)this.surfaceJobs.delete(key);
      if(!this.surfaceJobs.size)return;
      const low=A.Save.data.settings.quality==='low'||(this.game.detail||1)<.6;
      const deadline=performance.now()+(low?1.2:2);
      const jobs=[...this.surfaceJobs].sort((a,b)=>Number(b[1].priority)-Number(a[1].priority));
      for(const [key,job] of jobs){
        if(performance.now()>=deadline)break;
        // Finishing is a separate frame when necessary, so crater/ring stamping never
        // follows a full row-generation budget in the same frame.
        if(job.row===job.height){job.complete();this.surfaceJobs.delete(key);continue;}
        while(job.row<job.height&&performance.now()<deadline){job.paintRows(job.row,job.row+1);job.row++;}
      }
    }
    projectSurface(image,radius,phase,columns,rows=1,shear=0) {
      const c=this.ctx,w=image.width,h=image.height,settings=A.Save.data.settings;
      rows=Math.max(rows,radius<35?4:settings.textureDetail==='low'||A.cpuScale()<.6?6:radius>85?14:8);columns=Math.min(columns,radius<25?6:radius<55?10:settings.textureDetail==='low'?12:24);
      const key=columns+':'+rows;let strips=this.surfaceColumns.get(key);
      if(!strips){strips=[];for(let row=0;row<rows;row++){const top=-1+2*row/rows,bottom=top+2/rows,y=(top+bottom)/2,limb=Math.sqrt(Math.max(0,1-y*y));for(let col=0;col<columns;col++){const a=-Math.PI/2+col*Math.PI/columns,z=a+Math.PI/columns;strips.push({x:Math.sin(a)*limb,width:(Math.sin(z)-Math.sin(a))*limb,u:a/A.TAU+.5,row,y});}}this.surfaceColumns.set(key,strips);}
      const sourceWidth=w/(columns*2);
      for(const q of strips){const shift=phase+shear*(1-q.y*q.y),sx=((q.u+shift)%1+1)%1*w,sy=q.row*h/rows,sh=h/rows,dx=q.x*radius,dw=q.width*radius+.5,dy=-radius+q.row*radius*2/rows,dh=radius*2/rows+.5;
        if(sx+sourceWidth<=w)c.drawImage(image,sx,sy,sourceWidth,sh,dx,dy,dw,dh);
        else{const part=(w-sx)/sourceWidth;c.drawImage(image,sx,sy,w-sx,sh,dx,dy,dw*part+.25,dh);c.drawImage(image,0,sy,sourceWidth-(w-sx),sh,dx+dw*part,dy,dw*(1-part)+.25,dh);}
      }
    }
    livingBody(b,q,radius,detail) {
      const type=A.appearance(b).type,g=this.game,important=b===g.player||b.kind==='player'||b.id===g.selectedBody;
      if(!['dwarf','moon','planet','gas','brown','star'].includes(type)||radius<(detail<.6?15:10)||!important&&this.surfaceDraws>=this.surfaceBudget)return false;
      const low=detail<.6||radius<22||!important,targetKey=this.surfaceKey(b,low);
      if(!important&&!this.surfaceMaps.has(targetKey)&&this.surfaceBuilds>=this.surfaceBuildBudget)return false;
      const map=this.surfaceMap(b,low,true,important)||this.surfaceMaps.get(this.surfaceStates.get(b)?.key);if(!map)return false;if(!important)this.surfaceDraws++;
      const key=map.key;
      const t=A.animationEnabled('Planets')?this.animationTime():0,cloudTime=A.animationEnabled('Clouds')?this.animationTime():0,seed=(b.seed||0)*.001,state=this.surfaceStates.get(b);
      let current=state;
      if(!current||current.id!==b.id||current.seed!==b.seed){current={id:b.id,seed:b.seed,key,previous:null,intro:g.state==='playing'&&!g.photo?.active,at:t};this.surfaceStates.set(b,current);}
      else if(current.key!==key){current.previous=g.state==='playing'&&!g.photo?.active?current.key:null;current.key=key;current.at=t;}
      const fade=!A.animationEnabled('Planets')?1:A.clamp((t-current.at)/.8,0,1),previous=fade<1?this.surfaceMaps.get(current.previous):null;
      if(fade===1){current.previous=null;current.intro=false;}
      const c=this.ctx,ringScale=radius*384/94/2,phase=seed+t*(type==='star'?.035:type==='gas'||type==='brown'?.032:.012);
      const transition=previous||current.intro?fade:1;
      if(current.intro&&fade<1){const sprite=this.texture(b,false),image=radius<40?sprite.smallSprite:sprite,extent=radius*1.36*sprite.width/256;c.drawImage(image,q.x-extent,q.y-extent,extent*2,extent*2);}
      if(map.ringed){c.globalAlpha=transition;c.drawImage(map.rings[0],q.x-ringScale,q.y-ringScale,ringScale*2,ringScale*2);c.globalAlpha=1;}
      if(type==='star'&&this.cosmic)this.cosmic.glow(q,radius*2.6,A.appearance(b).color,.28);
      c.save();c.translate(q.x,q.y);c.beginPath();c.arc(0,0,radius,0,A.TAU);c.clip();
      const gas=type==='gas'||type==='brown',columns=low?8:radius>75?24:gas?12:16;
      if(previous){c.globalAlpha=1;this.projectSurface(previous.albedo,radius,phase,columns);}c.globalAlpha=transition;
      this.projectSurface(map.albedo,radius,phase,columns,gas&&!low?3:1,gas?t*.009:0);c.globalAlpha=1;
      if(['planet','gas','brown','star'].includes(type)){
        const atmosphere=type==='planet'?A.clamp(b.atmosphere??.55,0,1):1;
        c.globalAlpha=(type==='star'?.32:gas?.2:.62*atmosphere)*transition;
        if(type==='star')c.globalCompositeOperation='screen';
        this.projectSurface(map.clouds,radius,phase+cloudTime*(type==='star'?-.052:.014),low?8:12);c.globalAlpha=1;c.globalCompositeOperation='source-over';
        if(gas)this.gasStorms(map,b,radius,cloudTime,low);
      }
      c.globalAlpha=transition;c.drawImage(map.lighting,-radius,-radius,radius*2,radius*2);c.globalAlpha=1;
      // A stationary specular lobe reinforces ocean depth without rotating the light source.
      if(type==='planet'&&b.climate!=='Scorched'&&b.climate!=='Airless'&&b.climate!=='Frozen'){
        c.globalAlpha=.10;c.fillStyle='#c1e5ee';c.beginPath();c.ellipse(-radius*.33,-radius*.32,radius*.16,radius*.23,-.7,0,A.TAU);c.fill();c.globalAlpha=1;
      }
      c.restore();
      if(type==='planet')this.atmosphere(b,q,radius,t,low);
      if(type==='star')this.stellarSurface(b,q,radius,t,low);
      if(map.ringed){c.globalAlpha=transition;c.drawImage(map.rings[1],q.x-ringScale,q.y-ringScale,ringScale*2,ringScale*2);c.globalAlpha=1;this.ringFilaments(b,q,radius,t,low);}
      return true;
    }
    gasStorms(map,b,radius,time,low) {
      const c=this.ctx;
      for(const s of map.storms){const lon=s.lon+time*s.speed,depth=Math.cos(lon);if(depth<=.05)continue;
        const x=Math.sin(lon)*Math.cos(s.lat)*radius,y=Math.sin(s.lat)*radius,rx=radius*s.size*depth,ry=radius*s.size*.48;c.save();c.translate(x,y);c.rotate(.12*Math.sin(time*.3+s.i));c.globalAlpha=.38*depth;c.fillStyle=map.type==='gas'?'#935438':'#e09853';c.beginPath();c.ellipse(0,0,rx,ry,0,0,A.TAU);c.fill();c.strokeStyle='#eed8ad';c.lineWidth=Math.max(.4,radius*.012);c.globalAlpha=.45*depth;c.beginPath();c.ellipse(0,0,rx*.75,ry*.67,0,time*.65+s.i,time*.65+s.i+4.7);c.stroke();c.restore();
      }
    }
    atmosphere(b,q,radius,time,low) {
      const c=this.ctx,a=A.clamp(b.atmosphere??.55,0,1);if(a<.04)return;
      const hot=b.climate==='Scorched'||b.flareHeat>100,color=hot?'#e9ac75':'#92d7e1';
      c.save();c.lineWidth=Math.max(.65,radius*.025);c.strokeStyle=color;c.globalAlpha=.18+a*.2;c.beginPath();c.arc(q.x,q.y,radius*1.015,Math.PI*.8,Math.PI*1.84);c.stroke();
      c.lineWidth=Math.max(.45,radius*.06);c.globalAlpha=.04+a*.07;c.beginPath();c.arc(q.x,q.y,radius*1.025,0,A.TAU);c.stroke();
      // Aurora reflects ice/gas content, and remains an inexpensive pair of polar arcs.
      if(!low&&b.composition?.ice>.18&&!hot){c.strokeStyle='#9dd8bd';c.globalAlpha=.09*a*(.8+.2*Math.sin(time*.7+b.seed));for(const side of [-1,1]){c.beginPath();c.ellipse(q.x,q.y+side*radius*.77,radius*.52,radius*.13,0,side<0?Math.PI:0,side<0?A.TAU:Math.PI);c.stroke();}}
      c.restore();
    }
    stellarSurface(b,q,radius,time,low) {
      const c=this.ctx,color=A.appearance(b).color,stage=Math.min(14,A.scaleStage(b)),count=low?3:5+Math.floor((stage-9)/2),seed=(b.seed||0)*.036;
      c.save();c.translate(q.x,q.y);c.globalCompositeOperation='screen';c.lineCap='round';
      for(let i=0;i<count;i++){
        const a=seed+i*2.39996+time*(.085+i*.012),beat=.5+.5*Math.sin(time*(.6+i*.06)+i*1.9),height=radius*(.13+.13*beat);c.save();c.rotate(a);c.translate(radius*.94,0);c.globalAlpha=.2+.15*beat;c.strokeStyle=color;c.lineWidth=Math.max(.55,radius*.018);c.beginPath();c.ellipse(0,0,height,radius*.13,.45,-Math.PI*.5,Math.PI*.5);c.stroke();c.globalAlpha=.28;c.strokeStyle='#fff3d4';c.lineWidth=Math.max(.35,radius*.009);c.beginPath();c.ellipse(0,0,height*.75,radius*.075,.45,-Math.PI*.5,Math.PI*.5);c.stroke();c.restore();
      }
      c.restore();
    }
    ringFilaments(b,q,radius,time,low) {
      const c=this.ctx;c.save();c.translate(q.x,q.y);c.rotate(-.35);c.lineCap='round';c.strokeStyle='#e7d1ae';c.lineWidth=Math.max(.35,radius*.017);
      for(let i=0;i<(low?2:4);i++){const d=1.43+i*.13,a=(b.seed||0)*.031+i*2.4+time*.24/Math.pow(d,1.5);c.save();if(Math.sin(a)<0){c.beginPath();c.rect(-radius*2.2,-radius*1.5,radius*4.4,radius*3);c.arc(0,0,radius*1.01,0,A.TAU);c.clip('evenodd');}c.globalAlpha=.13;c.beginPath();c.ellipse(0,0,radius*d,radius*d*.26,0,a,a+.2);c.stroke();c.restore();}
      c.restore();
    }
    rockDetail(b,q,radius) {
      if(radius<10||b!==this.game.player&&b.id!==this.game.selectedBody)return;
      const c=this.ctx,ice=b.material==='ice'||b.composition?.ice>.4;c.save();c.translate(q.x,q.y);c.rotate(this.bodyAngle(b));c.strokeStyle=ice?'#c1eced':'#ead6b0';c.lineWidth=Math.max(.45,radius*.014);c.globalAlpha=.18;
      for(let i=0;i<3;i++){const a=(b.seed||0)*.02+i*2.4;c.beginPath();c.moveTo(Math.cos(a)*radius*.26,Math.sin(a)*radius*.26);c.lineTo(Math.cos(a+.15)*radius*.48,Math.sin(a+.15)*radius*.48);c.lineTo(Math.cos(a)*radius*.64,Math.sin(a)*radius*.64);c.stroke();}c.restore();
    }
    texture(body, detailed = true) {
      const cl = A.appearance(body), type = cl.type, variant = body.seed % (type === 'planet' || type === 'star' ? 6 : 12), stage = Math.min(14, A.scaleStage(body)), key = type + '-' + variant + '-' + stage+'-'+cl.color+'-'+(body.composition?A.Composition.dominant(body):'rock')+(detailed?'':'-distant');
      if (this.sprites.has(key)) return this.sprites.get(key);
      const c = canvas(256, 256), ctx = c.getContext('2d'), random = A.rng(variant * 9271 + 335), radius = 94, center = 128;
      ctx.save(); ctx.translate(center, center);
      if (type !== 'rock' && type !== 'dwarf' && type !== 'moon') {
        const glow = ctx.createRadialGradient(0, 0, 80, 0, 0, 126);
        glow.addColorStop(0, cl.color + '99'); glow.addColorStop(.5, cl.color + (type === 'star' ? '60' : '25')); glow.addColorStop(1, cl.color + '00'); ctx.fillStyle = glow; ctx.fillRect(-128, -128, 256, 256);
      }
      ctx.beginPath();
      if (type === 'rock') {
        const rough = .22 - Math.min(2, stage) * .065;
        for (let i = 0; i < 22; i++) { const a = i / 22 * A.TAU, r = radius * (1 - rough + random() * rough); if (i) ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); else ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath();
      } else ctx.arc(0, 0, radius, 0, A.TAU);
      ctx.clip();
      let base = type === 'planet' ? '#245465' : type === 'gas' ? '#b29377' : type === 'brown' ? '#7d3631' : type === 'star' ? cl.color : type === 'moon' ? '#a8aaa1' : '#7e786b';
      ctx.fillStyle = base; ctx.fillRect(-100, -100, 200, 200);
      if (type === 'planet') {
        ctx.drawImage(this.proceduralSurface(type, variant * 12373 + stage * 811, cl.color,detailed?96:32), -96, -96, 192, 192);
      } else if (type === 'gas' || type === 'brown') {
        for (let y = -96; y < 100; y += 3 + random() * 7) {
          ctx.fillStyle = type === 'gas' ? ['#cfb494', '#a8785f', '#d8c6a9', '#8d7770'][Math.floor(random() * 4)] : ['#b06343', '#ad4a37', '#5f3537', '#db7c4a'][Math.floor(random() * 4)];
          ctx.beginPath(); ctx.moveTo(-100, y); ctx.bezierCurveTo(-35, y - 8, 40, y + 8, 100, y); ctx.lineTo(100, y + 5); ctx.bezierCurveTo(25, y + 13, -50, y - 2, -100, y + 6); ctx.fill();
        }
        ctx.fillStyle = type === 'gas' ? '#ad7258' : '#df8c5a'; ctx.beginPath(); ctx.ellipse(34, 23, 21, 10, -.08, 0, A.TAU); ctx.fill();
      } else if (type === 'star') {
        ctx.drawImage(this.proceduralSurface(type, variant * 239 + stage * 29, cl.color,detailed?96:32), -96, -96, 192, 192);
      } else {
        for (let i = 0; i < (detailed?700:90); i++) { ctx.fillStyle = random() > .5 ? 'rgba(230,220,195,.075)' : 'rgba(19,21,22,.10)'; const size = .5 + random() * 7; ctx.fillRect((random() - .5) * 200, (random() - .5) * 200, size, size); }
        for (let i = 0; i < (detailed?45:8); i++) {
          const x = (random() - .5) * 185, y = (random() - .5) * 185, r = 2 + random() * 13;
          ctx.fillStyle = 'rgba(220,216,190,.2)'; ctx.beginPath(); ctx.arc(x + 1, y + 1.8, r, 0, A.TAU); ctx.fill();
          const gr = ctx.createRadialGradient(x - r * .2, y - r * .3, 0, x, y, r); gr.addColorStop(0, '#343631'); gr.addColorStop(1, '#74746a'); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, r, 0, A.TAU); ctx.fill();
        }
      }
      const shade = ctx.createRadialGradient(-42, -40, 8, 5, 5, 128);
      if (type === 'star') { shade.addColorStop(0, 'rgba(255,255,240,.58)'); shade.addColorStop(.7, 'rgba(255,239,215,.02)'); shade.addColorStop(1, 'rgba(107,66,41,.32)'); }
      else { shade.addColorStop(0, 'rgba(244,239,215,.24)'); shade.addColorStop(.55, 'rgba(6,12,16,.10)'); shade.addColorStop(.86, 'rgba(3,7,11,.72)'); shade.addColorStop(1, 'rgba(1,5,9,.97)'); }
      ctx.fillStyle = shade; ctx.fillRect(-100, -100, 200, 200); ctx.restore();
      if (this.sprites.size > 160) this.sprites.delete(this.sprites.keys().next().value);
      // The old four ellipse strokes per ringed body dominated crowded planetary fields.
      // Cache both halves with the shaded surface; 384px leaves room for the outer ring.
      const ringed=type==='gas'||type==='planet'&&body.seed%3===0;let result=c;
      if(ringed){result=canvas(384,384);const x=result.getContext('2d'),paint=front=>{x.save();x.translate(192,192);x.rotate(-.35);x.strokeStyle='rgba(200,182,147,.28)';x.lineWidth=94*.14;x.beginPath();x.ellipse(0,0,94*1.7,94*.42,0,front?0:Math.PI,front?Math.PI:A.TAU);x.stroke();x.strokeStyle='rgba(200,182,147,.12)';x.lineWidth=94*.04;x.beginPath();x.ellipse(0,0,94*1.93,94*.5,0,front?0:Math.PI,front?Math.PI:A.TAU);x.stroke();x.restore();};paint(false);x.drawImage(c,64,64);paint(true);}
      result.smallSprite = canvas(64, 64); result.smallSprite.getContext('2d').drawImage(result, 0, 0, 64, 64);
      result.tinySprite = canvas(32, 32); result.tinySprite.getContext('2d').drawImage(result.smallSprite, 0, 0, 32, 32);
      this.sprites.set(key, result); return result;
    }
    proceduralSurface(type, seed, color, resolution=128) {
      const surface = canvas(resolution, resolution), ctx = surface.getContext('2d'), image = ctx.createImageData(resolution, resolution), pixels = image.data;
      // Reuse a periodic noise lattice instead of hashing each corner for every texel.
      const lattice = new Float32Array(16384), random = A.rng(seed);
      for (let i = 0; i < lattice.length; i++) lattice[i] = random();
      const noise = (x, y, offset) => {
        const ix = x | 0, iy = y | 0, x0 = (ix + offset) & 127, x1 = (x0 + 1) & 127, y0 = ((iy + offset * 7) & 127) * 128, y1 = ((iy + offset * 7 + 1) & 127) * 128;
        let fx = x - ix, fy = y - iy; fx *= fx * (3 - 2 * fx); fy *= fy * (3 - 2 * fy);
        const a = lattice[y0 + x0], b = lattice[y0 + x1], c = lattice[y1 + x0], d = lattice[y1 + x1];
        return (a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy;
      };
      const fbm = (x, y, offset) => noise(x, y, offset) * .54 + noise(x * 2, y * 2, offset + 59) * .27 + noise(x * 4, y * 4, offset + 131) * .13 + noise(x * 8, y * 8, offset + 291) * .06;
      const rgb = [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16));
      for (let y = 0; y < resolution; y++) for (let x = 0; x < resolution; x++) {
        const nx = (x - (resolution-1)/2) / (resolution/2), ny = (y - (resolution-1)/2) / (resolution/2), r2 = nx * nx + ny * ny, i = (y * resolution + x) * 4;
        if (r2 > 1) continue;
        const nz = Math.sqrt(1 - r2), longitude = Math.atan2(nx, nz), latitude = Math.asin(ny), u = longitude * 2.3 + 10, v = latitude * 3.5 + 10;
        let red, green, blue;
        if (type === 'planet') {
          const warp = noise(u * .8, v * .8, seed + 5), height = fbm(u + warp * 2, v + warp, seed), land = height > .5;
          const shallow = A.clamp((height - .36) / .15, 0, 1), warmth = fbm(u * 1.2, v * 1.2, seed + 701);
          if (land) { red = 56 + warmth * 58 + (height - .5) * 70; green = 76 + warmth * 43; blue = 55 + warmth * 31; }
          else { red = 17 + shallow * 12; green = 48 + shallow * 35; blue = 68 + shallow * 36; }
          const ice = A.clamp((Math.abs(latitude) - 1.09 + (height - .5) * .3) * 10, 0, 1);
          red = A.lerp(red, 211, ice); green = A.lerp(green, 224, ice); blue = A.lerp(blue, 221, ice);
          const wind = Math.sin(v * 1.2 + u) * .55, clouds = A.clamp((fbm(u * 1.9 + wind, v * 2.5, seed + 972) - .55) * 4.8, 0, .86);
          red = A.lerp(red, 228, clouds); green = A.lerp(green, 234, clouds); blue = A.lerp(blue, 224, clouds);
          const detail = (noise(u * 22, v * 22, seed + 914) - .5) * 12; red += detail; green += detail; blue += detail;
        } else {
          const boil = fbm(u * 6, v * 6, seed), grain = noise(u * 36, v * 36, seed + 71), flame = .78 + boil * .35 + grain * .15;
          red = rgb[0] * flame; green = rgb[1] * flame * (.93 + boil * .1); blue = rgb[2] * flame * (.83 + boil * .24);
        }
        pixels[i] = A.clamp(red, 0, 255); pixels[i + 1] = A.clamp(green, 0, 255); pixels[i + 2] = A.clamp(blue, 0, 255); pixels[i + 3] = 255;
      }
      ctx.putImageData(image, 0, 0); return surface;
    }
    background() {
      const c = this.ctx, w = this.w, h = this.h, g = this.game, s = g.player ? A.unit(g.player.m) : 1;
      c.drawImage(this.backdrop, 0, 0, w, h);
      const cx = this.camera.x / s, cy = this.camera.y / s;
      const starStep=Math.min(g.detail||1,A.Save.data.settings.quality==='low'?.5:1)<.6?2:1;
      for (let i=0;i<this.stars.length;i+=starStep) {const star=this.stars[i];
        let x = ((star.x * w - cx * star.z * .04) % w + w) % w, y = ((star.y * h - cy * star.z * .04) % h + h) % h;
        const rawX=x,rawY=y;if(this.cosmic){const raw=this.starPoint||(this.starPoint={x:0,y:0});raw.x=x;raw.y=y;const q=this.cosmic.warp(raw);x=q.x;y=q.y;}
        c.globalAlpha = star.brightness * (.85 + .15 * Math.sin(this.clock * .5 + star.x * 50)); c.fillStyle = star.tint > .8 ? '#e4cbb3' : '#c9dbe0';
        const size = star.z > .92 ? 1.7 : .9; c.fillRect(x, y, size, size);
        if(this.final&&this.cosmic?.lenses.length)this.final.secondaryStar(c,rawX,rawY,size,c.globalAlpha,this.cosmic.lenses);
        if (star.z > .992) { c.globalAlpha *= .4; c.fillRect(x - 3, y + .6, 7, .5); c.fillRect(x + .6, y - 3, .5, 7); }
      }
      c.globalAlpha = 1;
    }
    menuScene() {
      const c = this.ctx, x = this.w * .76, y = this.h * .49, radius = Math.min(172, this.w * .15, this.h * .24), t = this.clock;
      c.save(); c.strokeStyle = 'rgba(181,217,201,.12)'; c.lineWidth = 1;
      for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(x, y, radius * (1.45 + i * .42), radius * (.7 + i * .16), -.48, 0, A.TAU); c.stroke(); }
      for (let i = 0; i < 14; i++) {
        const a = i * 2.4 + t * (.015 + (i % 3) * .01), r = radius * (1.5 + (i % 4) * .29), px = x + Math.cos(a) * r, py = y + Math.sin(a) * r * .6;
        const b = { m: .01, seed: i + 1 }, sz = i % 3 === 0 ? 7 : 3; c.drawImage(this.texture(b), px - sz, py - sz, sz * 2, sz * 2);
      }
      const glow = c.createRadialGradient(x - radius * .2, y - radius * .2, radius * .6, x, y, radius * 1.5); glow.addColorStop(0, 'rgba(118,196,173,.14)'); glow.addColorStop(1, 'rgba(118,196,173,0)'); c.fillStyle = glow; c.fillRect(x - radius * 1.5, y - radius * 1.5, radius * 3, radius * 3);
      c.translate(x, y); c.rotate(-.12 + Math.sin(t * .03) * .025); c.drawImage(this.texture({ m: 125, seed: 5 }), -radius * 1.36, -radius * 1.36, radius * 2.72, radius * 2.72); c.restore();
      c.fillStyle = '#6a8988'; c.font = '10px ui-monospace, monospace'; c.textAlign = 'center'; c.fillText('FIG. 01   /   THE FIRST GRAVITY WELL', x, y + radius * 1.72);
      const fade = c.createLinearGradient(0, 0, this.w * .68, 0); fade.addColorStop(0, 'rgba(4,10,16,.42)'); fade.addColorStop(1, 'rgba(4,10,16,0)'); c.fillStyle = fade; c.fillRect(0, 0, this.w, this.h);
    }
    draw(dt) {
      this.finalDt=dt;this.cosmic ||= new A.CosmicRenderer(this); const g = this.game, p = g.player, c = this.ctx;
      if(g.state==='menu'&&!A.Save.data.settings.reducedMotion)this.clock+=dt;
      else if(p&&g.state==='playing')this.clock=this.animationTime();
      const visualDetail=Math.min(g.detail||1,A.Save.data.settings.quality==='low'?.5:1,A.cpuScale());const desiredScale=visualDetail<.4?.45:visualDetail<.55?.6:visualDetail<.8?.8:1; if(this.renderScale!==desiredScale){this.renderScale=desiredScale;this.resize();}
      this.surfaceDraws=0;this.surfaceBuilds=0;this.surfaceBudget=visualDetail<.6?1:3;this.surfaceBuildBudget=1;
      this.advanceSurfaces();
      if(!g.photo?.active)this.tilt=A.lerp(this.tilt||1,p&&A.scaleStage(p)>=9?.72:1,A.ease(1,dt));
      if (g.state === 'menu' || !p) { this.cosmic.prepare();this.background();this.menuScene();return; }
      const s = A.unit(p.m), reduced = !A.animationEnabled('Events');
      const cine = g.evolutionTime > 0 && !reduced ? .72 + .28 * (A.clamp(1-g.evolutionTime/(g.supernovaAnimation?.duration||3.4),0,1)) : g.momentTime>0&&!reduced?.9+.1*(1-g.momentTime/g.momentDuration):1;
      const targetZoom = (g.systemView?Math.min(.94/s,Math.min(this.w*.6,this.h*.75)/(2*(g.cosmic?.radius||500*s))):.94/s) * this.manualZoom * cine * Math.min(1, this.h / 720 + .1);
      if(!g.photo?.active){this.camera.zoom = A.lerp(this.camera.zoom, targetZoom, A.ease(2, dt));
      this.lockCamera();
      }
      // Backdrop, lensing, bodies and forecast share the same frame's camera transform.
      this.cosmic.prepare();this.background();
      c.save(); this.shake *= Math.exp(-dt * 7);
      if (A.Save.data.settings.shake && !reduced && this.shake > .1) c.translate(Math.sin(this.clock * 117) * Math.min(6,this.shake), Math.cos(this.clock * 103) * Math.min(6,this.shake) * .6);
      g.expedition?.collision.draw(this);this.cosmic.behind();g.expedition?.planetary.draw(this);g.expedition?.weather.draw(this);if(!g.photo?.active||g.photo.paths){this.fieldMarkers();this.gravityRing();}
      if ((!g.photo?.active&&A.Save.data.settings.prediction)||g.photo?.active&&g.photo.paths) this.trajectory();
      if(!g.photo?.active||g.photo.paths)this.apsides();
      const visible = this.visiblePool||=[];let visibleCount=0;
      for (const b of g.world.bodies) {
        if (!b.alive) continue;
        const q = this.bodyPoint(b), radius = this.bodyRadius(b) * this.camera.zoom;
        const extent=A.appearance(b).type==='blackhole'&&A.FinalRender&&!A.FinalRender.legacy?A.FinalRender.extent(b):A.appearance(b).visual==='interstallar'?5.5:2;
        if (q.x + radius * extent < -40 || q.x - radius * extent > this.w + 40 || q.y + radius * extent < -40 || q.y - radius * extent > this.h + 40) continue;
        const item=visible[visibleCount]||{};item.b=b;item.q=q;item.radius=radius;visible[visibleCount++]=item;
      }
      visible.length=visibleCount;this.visibleCount=visibleCount;
      if (A.Save.data.settings.trails) {let ordinary=0;const budget=Math.round(64*visualDetail);for(const {b} of visible){const important=b===p||b.kind==='ai'||b.kind==='comet'||b.id===g.selectedBody;if(!important&&ordinary++>=budget)continue;this.trail(b);}}
      visible.sort((a, b) => a.radius - b.radius);
      this.smallBodies(visible,visualDetail);
      for (const item of visible) if(!item.batched){const fade=this.final?.fadeBody(item.b,item.q)??1;if(fade<=0)continue;if(fade>=1)this.body(item.b,item.q,item.radius);else{c.save();c.globalAlpha=fade;this.body(item.b,item.q,item.radius);c.restore();}}
      this.cosmic.front();this.infrastructure?.();this.commandVisuals?.(); g.life?.draw(c,this); g.effects.draw(c, this); if(!g.photo?.active)this.threatArrows(); c.restore();
      if (p.hp < 40) { const vignette = c.createRadialGradient(this.w / 2, this.h / 2, this.h * .25, this.w / 2, this.h / 2, this.w * .65); vignette.addColorStop(0, 'rgba(100,30,23,0)'); vignette.addColorStop(1, 'rgba(140,40,27,' + (.18 + Math.sin(this.clock * 2) * .03) + ')'); c.fillStyle = vignette; c.fillRect(0, 0, this.w, this.h); }
      if (g.tick % 6 === 0 || g.state !== 'playing') this.drawMap();
    }
    smallBodies(visible,detail){
      // Low-detail bodies remain real physical entities. Shared paths draw their seeded
      // silhouettes in six calls instead of hundreds of tiny filtered sprite blits.
      const c=this.ctx,p=this.game.player,bins=this.rockBins||=[[],[],[],[],[],[]],colors=['#89887b','#9fa7a0','#aacbd0','#586d70','#acd5bf','#d7b781'];for(const bin of bins)bin.length=0;
      for(const item of visible){const b=item.b;item.batched=false;if(b===p||b.kind==='ai'||b.id===this.game.selectedBody||b.hit>.1||item.radius>(detail<.6?9:6)||!['rock','debris'].includes(b.kind)||A.scaleStage(b)>=3)continue;item.batched=true;const cue=b.noticeUntil>this.game.time?(b.orbitStable?4:5):null;bins[cue??(b.material==='ice'?2:b.kind==='debris'?3:b.seed%2)].push(item);}
      c.save();for(let n=0;n<bins.length;n++){if(!bins[n].length)continue;c.fillStyle=colors[n];c.globalAlpha=n===3?.65:.85;c.beginPath();for(const {b,q,radius} of bins[n]){const rr=Math.max(.65,radius),a=b.seed*.01,sx=Math.cos(a),sy=Math.sin(a);c.moveTo(q.x+sx*rr,q.y+sy*rr);c.lineTo(q.x-sy*rr*.85,q.y+sx*rr*.85);c.lineTo(q.x-sx*rr*.8,q.y-sy*rr*.8);c.lineTo(q.x+sy*rr*.6,q.y-sx*rr*.6);c.closePath();}c.fill();}c.restore();
    }
    gravityRing() {
      if(A.Physics.mu(this.game,this.game.player)<=0)return;
      const g = this.game, p = g.player, c = this.ctx, q = this.bodyPoint(p), range = A.Physics.influence(g, p) * this.camera.zoom;
      c.save(); c.strokeStyle = g.amplifyTime > 0 ? 'rgba(169,238,208,.33)' : 'rgba(169,238,208,.095)'; c.lineWidth = 1; c.setLineDash([2, 9]); c.beginPath(); c.arc(q.x, q.y, range, 0, A.TAU); c.stroke(); c.setLineDash([]);
      if (!A.Save.data.settings.reducedMotion) { c.strokeStyle = 'rgba(169,238,208,.10)'; const r = range * (1 - (this.clock * .15 % 1)); c.beginPath(); c.arc(q.x, q.y, Math.max(1, r), 0, A.TAU); c.stroke(); }
      c.restore();
    }
    trail(b) {
      if (b.trail.length < 2) return;
      const c = this.ctx, g = this.game; c.save(); c.strokeStyle = b === g.player ? 'rgba(169,235,211,.20)' : b.bound === g.player.id ? 'rgba(160,203,202,.14)' : b.kind === 'comet' ? 'rgba(161,222,239,.4)' : 'rgba(212,182,153,.1)';
      c.lineWidth = b.kind === 'comet' ? 3 : 1; c.beginPath(); let started = false;
      for (const t of b.trail) { const q = this.screen(t.x,t.y,t.z||0); if (!started) { c.moveTo(q.x, q.y); started = true; } else c.lineTo(q.x, q.y); } c.stroke(); c.restore();
    }
    body(b, q, radius) {
      const visualDetail=Math.min(this.game.detail||1,A.Save.data.settings.quality==='low'?.5:1,A.cpuScale());const c = this.ctx, g = this.game, p = g.player, cl = A.appearance(b); if(this.cosmic?.specialBody(b,q,radius))return; if (radius < .9) { c.fillStyle = '#9baea9'; c.globalAlpha = .5; c.fillRect(q.x, q.y, 1, 1); c.globalAlpha = 1; return; }
      const living=this.livingBody(b,q,radius,visualDetail);
      if (!living && cl.type === 'star') {
        if(this.cosmic&&(visualDetail> .6||b===p||b.kind==='ai'))this.cosmic.glow(q,radius*3,cl.color,.22);
        if(radius>10&&(b===p||b.kind==='ai')&&visualDetail>.6){ c.save(); c.translate(q.x, q.y); c.rotate(this.animationTime() * .07); c.strokeStyle = cl.color + '44'; for (let i = 0; i < 12; i++) { c.rotate(A.TAU / 12); c.beginPath(); c.ellipse(radius * .85, 0, radius * .45, radius * .1, .3, 0, A.TAU); c.stroke(); } c.restore(); }
      }
      if(!living){
      const pending=cl.type!=='rock'&&this.surfaceJobs.has(this.surfaceKey(b,visualDetail<.6||radius<22||!(b===p||b.kind==='player'||b.id===g.selectedBody)));
      const sprite = this.texture(b,!pending&&(radius>=14||b===p||b.kind==='ai')), image = radius < 12 ? sprite.tinySprite : radius < 40 ? sprite.smallSprite : sprite;
      const extent=radius*1.36*sprite.width/256;
      if (radius < 35 && b !== p && b.kind !== 'ai') {
        c.drawImage(image, q.x-extent,q.y-extent,extent*2,extent*2);
      } else {
        c.save(); c.translate(q.x, q.y); c.rotate(this.bodyAngle(b) * (cl.type === 'rock' ? 1 : .12));
        c.drawImage(image,-extent,-extent,extent*2,extent*2); c.restore();
      }
      if(cl.type==='rock')this.rockDetail(b,q,radius);
      }
      if (b.hit > .1) { c.fillStyle = '#e4f5df'; c.globalAlpha = b.hit * .25; c.beginPath(); c.arc(q.x, q.y, radius, 0, A.TAU); c.fill(); c.globalAlpha = 1; }
      if (b === p) {
        c.strokeStyle = p.invulnerable > 0 || p.grace > 0 ? '#ceeadf' : '#a8e4c9'; c.globalAlpha = .65; c.lineWidth = 1;
        for (let i = 0; i < 4; i++) { const a = A.TAU * i / 4 + Math.PI / 4; c.beginPath(); c.arc(q.x, q.y, radius + 7, a, a + .27); c.stroke(); } c.globalAlpha = 1;
        c.font = '9px ui-monospace, monospace'; c.textAlign = 'center'; c.fillStyle = '#bbd7ca'; if(!g.photo?.active||g.photo.labels)c.fillText('YOU', q.x, q.y + radius + 24);
        if (p.invulnerable > 0) { c.strokeStyle = 'rgba(173,236,226,.5)'; c.beginPath(); c.arc(q.x, q.y, radius + 12, 0, A.TAU); c.stroke(); }
        // A mature system pays a gravity bonus. One slow ring every three seconds says so quietly.
        if (g.cosmic?.bonus > 0 && !A.Save.data.settings.reducedMotion) {
          const phase = (this.clock / 3) % 1;
          c.strokeStyle = '#a9eed0'; c.globalAlpha = .26 * (1 - phase) * A.clamp(g.cosmic.bonus / .08, .25, 1);
          c.lineWidth = 1.4; c.beginPath(); c.arc(q.x, q.y, radius * (1.12 + phase * 1.5), 0, A.TAU); c.stroke();
          c.globalAlpha = 1; c.lineWidth = 1;
        }
      } else if ((!g.photo?.active||g.photo.labels)&&(b.kind === 'ai' || b.kind === 'wanderer' && b.m > p.m || b.kind === 'comet')) {
        const danger = b.m > p.m * 1.55, safe = b.m < p.m / 1.58;
        c.font = '10px ui-monospace, monospace'; c.textAlign = 'center'; c.fillStyle = danger ? '#e6a18c' : safe ? '#a8cfc1' : '#c6bda5';
        c.fillText((b.name || b.tag || cl.name).toUpperCase(), q.x, q.y - radius - 22); c.globalAlpha = .65; c.font = '9px ui-monospace, monospace'; c.fillText(A.massText(b.m), q.x, q.y - radius - 9);if(b.kind==='ai'&&g.systemView&&b.intent)c.fillText(b.intent,q.x,q.y+radius+16); c.globalAlpha = 1;
        if (danger) { c.strokeStyle = 'rgba(235,150,126,.18)'; c.setLineDash([3, 5]); c.beginPath(); c.arc(q.x, q.y, radius + 8, 0, A.TAU); c.stroke(); c.setLineDash([]); }
      }
    }
    planetRings(q, r, front) {
      const c = this.ctx; c.save(); c.translate(q.x, q.y); c.rotate(-.35); c.strokeStyle = 'rgba(200,182,147,.28)'; c.lineWidth = Math.max(1, r * .14);
      c.beginPath(); c.ellipse(0, 0, r * 1.7, r * .42, 0, front ? 0 : Math.PI, front ? Math.PI : A.TAU); c.stroke();
      c.strokeStyle = 'rgba(200,182,147,.12)'; c.lineWidth = Math.max(1, r * .04); c.beginPath(); c.ellipse(0, 0, r * 1.93, r * .5, 0, front ? 0 : Math.PI, front ? Math.PI : A.TAU); c.stroke(); c.restore();
    }
    clipForecast(a,b,inset=32) {
      const bounds={left:inset,right:this.w-inset,top:inset,bottom:this.h-inset};
      if(a.x<bounds.left||a.x>bounds.right||a.y<bounds.top||a.y>bounds.bottom)return null;
      const dx=b.x-a.x,dy=b.y-a.y;let t=1;
      if(b.x<bounds.left)t=Math.min(t,(bounds.left-a.x)/dx);
      if(b.x>bounds.right)t=Math.min(t,(bounds.right-a.x)/dx);
      if(b.y<bounds.top)t=Math.min(t,(bounds.top-a.y)/dy);
      if(b.y>bounds.bottom)t=Math.min(t,(bounds.bottom-a.y)/dy);
      return {x:a.x+dx*t,y:a.y+dy*t,t};
    }
    forecast() {
      const g=this.game,p=g.player,s=A.unit(p.m),origin=this.renderPosition(p),start=this.screen(origin.x,origin.y,origin.z);
      if(Math.hypot(p.vx,p.vy,p.vz||0)<.4*s)return null;
      if(!this.clipForecast(start,start))return null;
      const low=A.Save.data.settings.quality==='low'||(g.detail||1)<.6;
      const horizon=Math.min(6,(low?3.5:4)+.5*g.upgrades.get('scanner')+(g.life?.buffs().predict||0)*.04);
      const candidates=[];
      for(const b of g.world.sources){
        if(b===p||!b.alive)continue;
        const q=this.renderPosition(b),range=A.Physics.influence(g,b),distance=Math.hypot(q.x-origin.x,q.y-origin.y,q.z-origin.z);
        if(distance>range*1.4+Math.hypot(b.vx-p.vx,b.vy-p.vy,(b.vz||0)-(p.vz||0))*horizon)continue;
        const mu=A.Physics.mu(g,b),soft=Math.max(b.r*.18,p.r*.4);
        candidates.push({b,q,range,mu,soft,score:mu/Math.max(distance*distance,soft*soft)});
      }
      candidates.sort((a,b)=>b.score-a.score);const sources=candidates.slice(0,low?6:12);
      let x=origin.x,y=origin.y,z=origin.z,vx=p.vx,vy=p.vy,vz=p.vz||0,elapsed=0,collision=false,clipped=false;
      const dt=1/60,steps=Math.ceil(horizon/dt),stride=low?6:3,points=[start];
      // This is an unpowered forecast: sum gravity, then integrate and limit velocity in
      // the same order and at the same fixed step as the flight simulation.
      const cap=A.FLIGHT.cruise*(1+.1*g.upgrades.get('thrust'))*s;
      for(let i=0;i<steps;i++){
        let ax=0,ay=0,az=0;
        for(const v of sources){
          const b=v.b,dx=v.q.x+b.vx*elapsed-x,dy=v.q.y+b.vy*elapsed-y,dz=v.q.z+(b.vz||0)*elapsed-z,r2=dx*dx+dy*dy+dz*dz;
          if(r2>v.range*v.range||r2<.01)continue;
          let force=v.mu/Math.pow(r2+v.soft*v.soft,1.5)*A.clamp((v.range-Math.sqrt(r2))/(v.range*.2),0,1);
          if(b.m>p.m){force*=1-.2*g.upgrades.get('resist');if(p.grace>elapsed||p.invulnerable>elapsed)force*=.22;}
          ax+=dx*force;ay+=dy*force;az+=dz*force;
        }
        vx+=ax*dt;vy+=ay*dt;vz+=az*dt;
        const speed=Math.hypot(vx,vy);if(!p.parentId&&speed>cap){const f=A.lerp(1,cap/speed,A.ease(3,dt));vx*=f;vy*=f;}
        let fraction=1;
        // Relative swept contact catches a fast fly-through instead of waiting until
        // one sampled endpoint happens to overlap a moving threat.
        for(const v of sources){
          const b=v.b;if(b.m<=p.m*.65)continue;
          const rx=x-v.q.x-b.vx*elapsed,ry=y-v.q.y-b.vy*elapsed,rz=z-v.q.z-(b.vz||0)*elapsed;
          const dx=(vx-b.vx)*dt,dy=(vy-b.vy)*dt,dz=(vz-(b.vz||0))*dt,r=p.r+b.r;
          const aa=dx*dx+dy*dy+dz*dz,bb=2*(rx*dx+ry*dy+rz*dz),cc=rx*rx+ry*ry+rz*rz-r*r;
          if(cc<=0){fraction=0;collision=true;continue;}
          const disc=bb*bb-4*aa*cc;if(aa>1e-12&&disc>=0){const t=(-bb-Math.sqrt(disc))/(2*aa);if(t>=0&&t<=fraction){fraction=t;collision=true;}}
        }
        x+=vx*dt*fraction;y+=vy*dt*fraction;z+=vz*dt*fraction;elapsed+=dt*fraction;
        const point=this.screen(x,y,z),edge=this.clipForecast(points[points.length-1],point);
        if(!edge)break;
        if(edge.t<1){points.push({x:edge.x,y:edge.y});clipped=true;break;}
        if(i%stride===stride-1||collision||i===steps-1)points.push(point);
        if(collision)break;
      }
      return {points,collision:collision&&!clipped,clipped,elapsed,horizon,sourceCount:sources.length,terminal:{x,y,z,vx,vy,vz},origin};
    }
    trajectory() {
      // Restore the original dotted path and circular endpoint. Keep the corrected
      // camera transform, fixed-step estimate and screen-edge clipping underneath it.
      const g=this.game,p=g.player,c=this.ctx;
      const data=Math.hypot(p.vx,p.vy,p.vz||0)>=6*A.unit(p.m)?this.forecast():null;
      this.prediction=data;if(!data||data.points.length<2)return;
      const points=data.points,collision=data.collision;
      c.save();c.setLineDash([3,6]);c.lineWidth=1;
      const stroke=(from,to,style)=>{c.beginPath();c.moveTo(points[from].x,points[from].y);for(let i=from+1;i<=to;i++)c.lineTo(points[i].x,points[i].y);c.strokeStyle=style;c.stroke();};
      const near=Math.max(1,Math.floor(points.length/3));
      stroke(0,points.length-1,collision?'rgba(234,160,137,.3)':'rgba(171,217,207,.16)');
      stroke(0,near,collision?'rgba(234,160,137,.6)':'rgba(171,217,207,.38)');
      const end=points[points.length-1];
      c.setLineDash([]);c.strokeStyle=collision?'rgba(234,160,137,.7)':'rgba(171,217,207,.45)';
      c.beginPath();c.arc(end.x,end.y,3,0,A.TAU);c.stroke();
      if(collision){c.beginPath();c.moveTo(end.x-5,end.y-5);c.lineTo(end.x+5,end.y+5);c.moveTo(end.x+5,end.y-5);c.lineTo(end.x-5,end.y+5);c.stroke();}
      c.restore();
    }
    // Periapsis and apoapsis for the selected body, drawn on the flight canvas rather than only in
    // the observatory panel. Both distances already exist on the cached orbit elements.
    apsides() {
      const g = this.game, c = this.ctx, u = g.cosmic; if (!u || !g.selectedBody) return;
      const b = u.byId.get(g.selectedBody); if (!b || !b.orbit || !b.alive) return;
      const parent = u.byId.get(b.parentId); if (!parent || u.root(b) !== g.player) return;
      const o = b.orbit; if (!(o.energy < 0) || !Number.isFinite(o.apo)) return;
      const mark = (distance, sign, label, color) => {
        if (!Number.isFinite(distance) || distance <= 0) return;
        const q = this.screen(parent.x + sign * o.u[0] * distance, parent.y + sign * o.u[1] * distance, (parent.z || 0) + sign * o.u[2] * distance);
        if (q.x < -40 || q.x > this.w + 40 || q.y < -40 || q.y > this.h + 40) return;
        c.strokeStyle = color; c.fillStyle = color; c.globalAlpha = .75; c.lineWidth = 1;
        c.beginPath(); c.moveTo(q.x - 4, q.y); c.lineTo(q.x + 4, q.y); c.moveTo(q.x, q.y - 4); c.lineTo(q.x, q.y + 4); c.stroke();
        c.beginPath(); c.arc(q.x, q.y, 6, 0, A.TAU); c.globalAlpha = .3; c.stroke();
        c.globalAlpha = .8; c.font = '9px ui-monospace, monospace'; c.textAlign = 'center'; c.fillText(label, q.x, q.y - 11); c.globalAlpha = 1;
      };
      c.save(); mark(o.peri, 1, 'PERI', '#e3c79a'); mark(o.apo, -1, 'APO', '#9fd8cd'); c.restore();
    }
    fieldMarkers() {
      const c = this.ctx, g = this.game,labels=[],player=this.bodyPoint(g.player),clearance=g.player.r*this.camera.zoom+28;
      c.font='9px ui-monospace, monospace';c.textAlign='left';c.fillStyle='#8eb2ac';
      for (const f of g.world.fields) {
        if (f.age > 65||f.r*this.camera.zoom<28||labels.length>=6) continue; const q = this.screen(f.x, f.y,f.z??g.player.z??0);
        if (q.x < 30 || q.x > this.w - 30 || q.y < 80 || q.y > this.h - 90) continue;
        const text=f.name.toUpperCase(),x=q.x-f.r*this.camera.zoom,y=q.y-f.r*this.camera.zoom*.7-15,width=Math.min(200,c.measureText(text).width);
        if(x<16||x+width>this.w-16||y<24||y>this.h-24)continue;
        if(x<player.x+clearance&&x+width>player.x-clearance&&Math.abs(y-player.y)<clearance)continue;
        if(labels.some(b=>x<b.x+b.width+12&&x+width+12>b.x&&Math.abs(y-b.y)<18))continue;
        labels.push({x,y,width});c.globalAlpha=.23;c.fillText(text,x,y,200);c.globalAlpha=1;
      }
    }
    threatArrows() {
      const g = this.game, p = g.player, c = this.ctx, threats = g.world.sources.filter(b => b !== p && b.alive && b.m > p.m * 1.55).sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y)).slice(0, 3);
      for (const b of threats) {
        const q = this.screen(b.x, b.y);
        if (q.x > 30 && q.x < this.w - 30 && q.y > 90 && q.y < this.h - 100) continue;
        const d = Math.hypot(b.x - p.x, b.y - p.y); if (d > 1600 * A.unit(p.m)) continue;
        const a = Math.atan2(q.y - this.h / 2, q.x - this.w / 2), rx = this.w / 2 - 34, ry = this.h / 2 - 105, t = Math.min(rx / Math.abs(Math.cos(a)), ry / Math.abs(Math.sin(a)));
        const x = this.w / 2 + Math.cos(a) * t, y = this.h / 2 + Math.sin(a) * t;
        c.save(); c.translate(x, y); c.rotate(a); c.fillStyle = '#ce8b77'; c.globalAlpha = .7; c.beginPath(); c.moveTo(6, 0); c.lineTo(-5, -4); c.lineTo(-5, 4); c.closePath(); c.fill(); c.restore();
        // Name the pressure. The label sits inboard of the arrow so it never clips the edge.
        const label = b.kind === 'ai' ? (b.name || '') : (b.tag || '');
        if (label && !g.hudHidden) {
          c.save(); c.globalAlpha = .62; c.fillStyle = '#e0a894'; c.font = '9px ui-monospace, monospace'; c.textAlign = 'center';
          c.fillText(label.toUpperCase(), x - Math.cos(a) * 16, y - Math.sin(a) * 16 + 3); c.restore();
        }
      }
    }
    drawMap() {
      const c = this.mapctx, g = this.game, p = g.player, w = 176, center = w / 2, range = 1400 * A.unit(p.m) * (1+(g.cosmic?.profile(p).survey||0)) * (1 + .35 * g.upgrades.get('scanner'));
      c.clearRect(0, 0, w, w); c.save(); c.beginPath(); c.arc(center, center, center - 7, 0, A.TAU); c.clip();
      const palette=A.themePalette();c.fillStyle=palette.bg;c.fillRect(0,0,w,w);c.strokeStyle=palette.raised;c.lineWidth=.7;
      for (const r of [27, 54, 80]) { c.beginPath(); c.arc(center, center, r, 0, A.TAU); c.stroke(); }
      c.beginPath(); c.moveTo(center, 8); c.lineTo(center, 168); c.moveTo(8, center); c.lineTo(168, center); c.stroke();
      for (const b of g.world.bodies) {
        if (!b.alive || b === p) continue; const x = center + (b.x - p.x) / range * 80, y = center + (b.y - p.y) / range * 80;
        if (Math.hypot(x - center, y - center) > 80) continue;
        const isAI = b.kind === 'ai', tone = b.m > p.m * 1.55 ? '#e09a80' : b.m > p.m * .64 ? '#cabc8d' : isAI ? '#a9ddc6' : '#536a66';
        c.globalAlpha = isAI ? 1 : .7;
        if (isAI) {
          // A hollow ring plus an initial keeps rivals readable in a crowded late-game sector.
          c.strokeStyle = tone; c.lineWidth = 1; c.beginPath(); c.arc(x, y, 3, 0, A.TAU); c.stroke();
          const initial = (b.name || '?').trim().charAt(0).toUpperCase();
          if (initial) { c.fillStyle = tone; c.font = '7px ui-monospace, monospace'; c.textAlign = 'left'; c.fillText(initial, x + 5, y + 2.5); }
        } else { c.fillStyle = tone; const r = b.m > p.m ? 2 : 1; c.beginPath(); c.arc(x, y, r, 0, A.TAU); c.fill(); }
      }
      if (g.world.event) { const e = g.world.event, x = center + (e.x - p.x) / range * 80, y = center + (e.y - p.y) / range * 80; c.strokeStyle = '#dcc399'; c.globalAlpha = .8; c.strokeRect(x - 4, y - 4, 8, 8); }
      c.globalAlpha=1;c.fillStyle=palette.accent;c.beginPath();c.moveTo(center,center-4);c.lineTo(center+3,center+4);c.lineTo(center-3,center+4);c.fill();c.restore();
    }
  };
  A.paintCosmeticMark=function(c,q,r,id){
    if(id==='none'||r<7)return;c.save();c.translate(q.x,q.y);c.strokeStyle='#e8dfb5';c.lineWidth=Math.max(.7,Math.min(1.6,r*.025));c.globalAlpha=.8;
    if(id==='capture'){c.beginPath();c.ellipse(0,0,r*.35,r*.16,-.45,0,A.TAU);c.stroke();c.fillStyle=c.strokeStyle;c.beginPath();c.arc(r*.26,-r*.12,r*.05,0,A.TAU);c.fill();}
    if(id==='survey'){c.beginPath();for(let i=-1;i<=1;i++){c.ellipse(0,0,r*.55,r*(.15+.12*(i+1)),.3,0,A.TAU);}c.stroke();}
    if(id==='keeper'){for(let i=0;i<3;i++){c.beginPath();c.arc(0,0,r*(.18+i*.13),-.85,2.2);c.stroke();}}
    if(id==='architect'){c.beginPath();for(let i=0;i<=6;i++){const a=i*A.TAU/6-r*.001;c.lineTo(Math.cos(a)*r*.42,Math.sin(a)*r*.42);}c.closePath();c.moveTo(-r*.36,-r*.21);c.lineTo(r*.36,r*.21);c.moveTo(-r*.36,r*.21);c.lineTo(r*.36,-r*.21);c.stroke();}
    if(id==='legacy'){c.beginPath();for(let i=0;i<4;i++){const a=i*A.TAU/4;c.moveTo(Math.cos(a)*r*.12,Math.sin(a)*r*.12);c.lineTo(Math.cos(a)*r*.42,Math.sin(a)*r*.42);}c.stroke();c.strokeRect(-r*.17,-r*.17,r*.34,r*.34);}
    c.restore();
  };
  A.Renderer.prototype.drawHeritage=function(b,q,r){
    const c=this.ctx,g=this.game,type=A.appearance(b).type;
    if(r>=9&&b.scars?.length){const limit=A.Save.data.settings.quality==='low'||g.detail<.7?3:6;c.save();c.translate(q.x,q.y);c.rotate(this.bodyAngle(b)*(type==='rock'?1:.12));
      if(type==='rock'||type==='dwarf'||type==='planet'||type==='moon'){c.beginPath();c.arc(0,0,r*.9,0,A.TAU);c.clip();for(const s of b.scars.slice(-limit)){const x=Math.cos(s.a)*s.d*r,y=Math.sin(s.a)*s.d*r,rs=s.r*r;c.globalAlpha=.22+s.power*.25;c.strokeStyle='#0a1318';c.fillStyle='#0b151c';c.lineWidth=Math.max(.7,rs*.18);
          c.beginPath();c.ellipse(x,y,rs,rs*.68,s.a,0,A.TAU);c.fill();c.stroke();c.strokeStyle='#eed7a8';c.globalAlpha=.26;c.beginPath();c.ellipse(x-rs*.1,y-rs*.14,rs,rs*.68,s.a,.1,2.9);c.stroke();if(s.type==='fracture'){c.strokeStyle='#101820';c.globalAlpha=.5;c.beginPath();c.moveTo(x-rs*2,y);c.lineTo(x-rs*.4,y+rs*.4);c.lineTo(x+rs*.6,y-rs*.3);c.lineTo(x+rs*2.2,y+rs*.4);c.stroke();}}}
      else if(type==='gas'||type==='brown'){c.beginPath();c.arc(0,0,r*.98,0,A.TAU);c.clip();for(const s of b.scars.slice(-limit)){c.globalAlpha=.18+s.power*.12;c.strokeStyle='#f2d1a2';c.lineWidth=Math.max(1,r*.035);c.beginPath();c.ellipse(0,Math.sin(s.a)*r*.5,r*1.05,r*.12,.05,0,Math.PI);c.stroke();}}
      // Stars and horizons have no solid surface. Keep history as asymmetric plasma/disk imprints.
      else if(type==='star'||type==='blackhole'||type==='neutron'){for(const s of b.scars.slice(-2)){c.strokeStyle='#e9c9a0';c.globalAlpha=.16+s.power*.08;c.lineWidth=Math.max(.7,r*.025);c.beginPath();c.ellipse(0,0,r*(type==='blackhole'?(A.FinalRender&&!A.FinalRender.legacy?A.FinalRender.extent(b)*.86:2):1.12),r*(type==='blackhole'?.57:1.12),.12,s.a,s.a+.4+s.power*.4);c.stroke();}}
      c.restore();
    }
    if(b===g.player){const mark=A.cosmeticEquipped('mark');if(mark!=='none'){const pos=type==='blackhole'?{x:q.x+r*.2,y:q.y+r*(A.FinalRender&&!A.FinalRender.legacy?2.05:.9)}:q;A.paintCosmeticMark(c,pos,type==='blackhole'?r*.65:r,mark);}}
  };
})(window.AC);
