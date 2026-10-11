'use strict';
(function(A){
 const $=id=>document.getElementById(id),g=A.game,r=g.renderer,defaults=A.FINAL_LOOK,anchor=A.FinalRender.anchor;
 document.body.classList.add('final-lab');A.Save.selectSandbox();g.start();g.player.setMass(5**21);g.player.evolution=21;A.Supernova.prepare(g);g.world.bodies=[g.player];g.pause();g.ui.hidePanel();
 const f=new A.FinalRender(r);r.final=f;let reference=null,time=0,nextRead=0,drag=null,readout={},lastCost=0,frameCount=0;
 const look={extent:5.6,outer:14.5,arch:1,kind:'Full',growth:1};A.FinalRender.anchor=kind=>kind==='Full'?look:anchor(kind);A.FinalRender.look=()=>look;
 r.resize=function(){this.w=Math.max(240,innerWidth-(innerWidth<=700?260:350));this.h=innerHeight;this.dpr=Math.min(2,devicePixelRatio||1);this.canvas.width=Math.round(this.w*this.dpr);this.canvas.height=Math.round(this.h*this.dpr);};r.resize();
 const download=(blob,name)=>{const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),30000);};
 const luminance=(data,i)=>(data[i]*.2126+data[i+1]*.7152+data[i+2]*.0722)/255;
 function measure(canvas,cx,cy,R){const data=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height),d=data.data,w=data.width,h=data.height,x=Math.max(0,Math.min(w-1,Math.round(cx)));let upper={y:0,value:0},lower={y:0,value:0};for(let y=0;y<h;y++){const value=luminance(d,(y*w+x)*4);if(y<cy-R*1.04&&value>upper.value)upper={y,value};if(y>cy+R*1.04&&value>lower.value)lower={y,value};}return{shadowRadiusPixels:R,shadowDiameterFraction:+(2*R/h).toFixed(4),upperArchBeyondR:+((cy-upper.y-R)/R).toFixed(3),lowerArchBeyondR:+((lower.y-cy-R)/R).toFixed(3),lowerToUpper:+(lower.value/Math.max(.001,upper.value)).toFixed(3),photonRingExpectedFwhmR:2*Math.sqrt(Math.log(2))*A.FINAL_LOOK.ringWidth,measurement:'Axis luminance maxima, excluding photon rim. Colour and full M1–M17 fidelity require the private reference comparison.'};}
 A.FinalLab={measure,get readout(){return readout;},get renderer(){return f;},get look(){return look;}};
 function controls(){nextRead=0;readout={};const inc=+$('lab-inc').value,spin=+$('lab-spin').value,outer=+$('lab-outer').value,exp=+$('lab-exposure').value,bloom=+$('lab-bloom').value;
  A.FINAL_LOOK=Object.freeze({...defaults,inclination:90-inc,archOffset:-spin,exposure:exp,bloom,textureScale:+$('lab-texture').value,beamingScale:+$('lab-beam').value});look.outer=outer;A.Save.data.settings.quality=$('lab-quality').value;$('lab-texture-value').textContent=(+$('lab-texture').value).toFixed(2);$('lab-beam-value').textContent=(+$('lab-beam').value).toFixed(2);A.Save.data.settings.finalPhysical=$('lab-physical').checked;A.Save.data.settings.finalQuality=$('lab-tier').value;f.reset();
  $('lab-inc-value').textContent=inc+'°';$('lab-spin-value').textContent=spin.toFixed(2)+' R';$('lab-outer-value').textContent=outer.toFixed(1)+' rₛ';$('lab-exposure-value').textContent=exp.toFixed(2);$('lab-bloom-value').textContent=bloom.toFixed(2);
 }
 for(const id of ['lab-inc','lab-spin','lab-outer','lab-exposure','lab-bloom','lab-physical','lab-tier','lab-texture','lab-beam','lab-quality'])$(id).addEventListener('input',controls);
 $('lab-lens').addEventListener('input',()=>{$('lab-lens-value').textContent=(+$('lab-lens').value).toFixed(2)+' R';});
 $('lab-time').addEventListener('input',()=>{time=+$('lab-time').value;$('lab-motion').checked=false;});
 $('lab-preset').addEventListener('change',()=>{const name=$('lab-preset').value;$('lab-inc').value=85;$('lab-exposure').value=name==='cool'?3.2:5.0;look.rotation=name==='tilted'?-10:0;controls();if(name==='cool')A.FINAL_LOOK=Object.freeze({...A.FINAL_LOOK,ramp:[[25,40,70],[65,98,156],[153,190,228],[230,238,248]].map(Object.freeze)});});
 $('lab-reference').addEventListener('change',()=>{const file=$('lab-reference').files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{const image=new Image();image.onload=()=>{reference=image;};image.onerror=()=>{$('lab-readout').textContent='The local image could not be decoded.';};image.src=reader.result;};reader.readAsDataURL(file);});
 $('lab-clear').addEventListener('click',()=>{reference=null;$('lab-reference').value='';});
 r.canvas.addEventListener('pointerdown',e=>{if(reference){drag={x:e.clientX,y:e.clientY,dx:+$('lab-x').value,dy:+$('lab-y').value};r.canvas.setPointerCapture?.(e.pointerId);}});r.canvas.addEventListener('pointermove',e=>{if(drag){$('lab-x').value=drag.dx+e.clientX-drag.x;$('lab-y').value=drag.dy+e.clientY-drag.y;}});r.canvas.addEventListener('pointerup',()=>{drag=null;});
 function draw(dt,withReference=true){const start=performance.now(),c=r.ctx;if($('lab-motion').checked)time=(time+Math.min(.1,dt))%240;r.finalDt=dt;r.clock=time;r.animationTime=()=>time;f.startFrame(dt);c.setTransform(r.dpr,0,0,r.dpr,0,0);c.globalAlpha=1;c.fillStyle='#000506';c.fillRect(0,0,r.w,r.h);
  if($('lab-checker').checked){c.fillStyle='#263139';for(let y=0;y<r.h;y+=24)for(let x=0;x<r.w;x+=24)if(((x+y)/24)%2===0)c.fillRect(x,y,24,24);}
  const q={x:r.w*.5,y:r.h*.5},R=Math.min(r.w/11.8,r.h/4.6),lens=+$('lab-lens').value;
  if(lens>0){c.fillStyle='#9eb5bb';for(let i=0;i<170;i++){const x=((i*271.63)%r.w),y=((i*137.91)%r.h),p=A.FinalRay.images(x,y,q.x,q.y,R*lens,f.point);c.globalAlpha=.12+(i%5)*.04;c.fillRect(p.x,p.y,1,1);if(p.secondary>.025&&Math.hypot(p.sx-q.x,p.sy-q.y)>R*1.03){c.globalAlpha*=Math.min(1,p.secondary);c.fillRect(p.sx,p.sy,2,1);}}c.globalAlpha=1;}
  c.save();if(look.rotation){c.translate(q.x,q.y);c.rotate(look.rotation*Math.PI/180);c.translate(-q.x,-q.y);}f.draw(g.player,q,R,true);c.restore();lastCost=performance.now()-start;frameCount++;if(nextRead<=time||!Object.keys(readout).length){nextRead=time+1;readout={...measure(r.canvas,q.x*r.dpr,q.y*r.dpr,R*r.dpr),tier:f.status.tier,reason:f.status.reason,frameMilliseconds:+lastCost.toFixed(2),extraMiB:+(f.memoryBytes()/1048576).toFixed(2),frameCount,verification:'Local render submission time; not a GPU timer-query measurement or complete game FPS.',parameters:{...A.FINAL_LOOK,outer:look.outer,screenRotation:look.rotation||0,time}};}
  if(withReference&&reference){const scale=+$('lab-scale').value,opacity=+$('lab-opacity').value,w=reference.width*scale,h=reference.height*scale;c.globalAlpha=opacity;c.drawImage(reference,(r.w-w)/2+(+$('lab-x').value),(r.h-h)/2+(+$('lab-y').value),w,h);c.globalAlpha=1;}
  $('lab-time-value').textContent=time.toFixed(1)+' s';$('lab-readout').textContent=JSON.stringify(readout,null,2);
 }
 r.draw=dt=>draw(dt,true);
 $('lab-export').addEventListener('click',()=>{try{draw(0,false);r.canvas.toBlob(blob=>{if(blob)download(blob,'accretion-final-lab.png');},'image/png');}catch(_){$('lab-readout').textContent='Canvas export is unavailable in this runtime.';}});
 $('lab-json').addEventListener('click',()=>download(new Blob([JSON.stringify(readout,null,2)],{type:'application/json'}),'accretion-final-measurements.json'));
 controls();
})(window.AC);
