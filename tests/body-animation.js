'use strict';
(function(A){
  const $=id=>document.getElementById(id),select=$('preview-stage'),options=A.STAGES.map((cl,stage)=>({name:cl.name,stage}));
  for(const [path,route] of Object.entries(A.SUPERNOVA_PATHS))for(let level=1;level<route.classes.length;level++)if(!(path==='singularity'&&level>3))options.push({name:route.name+' / '+route.classes[level].name,path,level,stage:11});
  options.forEach((q,i)=>{const option=document.createElement('option');option.value=String(i);option.textContent=q.name;select.appendChild(option);});select.value='5';$('preview-detail').value='high';$('preview-motion').value='normal';$('preview-speed').value='1';
  const g={time:0,state:'paused',detail:1,accumulator:0,photo:{active:true,labels:false},world:{sources:[]},cosmic:{ownerMass:new Map(),bonus:0},upgrades:{get:()=>0},player:null};
  const r=g.renderer=new A.Renderer(g,$('surface-preview'));r.cosmic=new A.CosmicRenderer(r);
  r.resize=function(){this.w=Math.max(280,Math.min(1080,window.innerWidth-48));this.h=Math.min(560,Math.max(280,this.w*.52));this.dpr=Math.min(window.devicePixelRatio||1,A.Save.data.settings.quality==='low'?1:1.5);this.canvas.width=Math.round(this.w*this.dpr);this.canvas.height=Math.round(this.h*this.dpr);this.canvas.style.width='100%';this.canvas.style.height='auto';this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);};r.resize();
  let paused=false,last=0;
  function choose(){const q=options[Number(select.value)],b=new A.Body().reset(1,0,0,5**q.stage,'player',103);b.evolution=q.stage;b.starPeak=Math.min(14,q.stage);if(q.path)Object.assign(b,{path:q.path,pathSchema:2,pathOriginStage:11,pathBaseMass:5**11,pathBaseEvolution:11,remnantLevel:q.level,evolution:11+q.level});if(q.path)b.setMass(5**(11+q.level));else b.setMass(b.m);b.pr=b.r;b.pa=b.angle;b.composition=A.Composition.ensure(b);b.atmosphere=.65;b.climate='Temperate';g.player=b;g.world.sources=[b];g.cosmic.ownerMass=new Map([[b.id,b.m*.08]]);g.time=0;r.resetSurfaces();r.cosmic.reset();$('preview-readout').textContent=A.appearance(b).name+' · '+A.massText(b.m)+' · '+(q.path?A.SUPERNOVA_PATHS[q.path].name+' journey':'Original astronomical class');}
  function detail(){A.Save.data.settings.quality=$('preview-detail').value;r.resize();}
  select.addEventListener('change',choose);$('preview-detail').addEventListener('change',detail);$('preview-motion').addEventListener('change',()=>A.Save.data.settings.reducedMotion=$('preview-motion').value==='reduced');
  $('preview-pause').addEventListener('click',()=>{paused=!paused;$('preview-pause').textContent=paused?'Resume':'Pause';$('preview-pause').setAttribute('aria-pressed',String(paused));});
  $('preview-rewind').addEventListener('click',choose);
  detail();A.Save.data.settings.reducedMotion=false;choose();
  function draw(timestamp){const dt=last?Math.min(.05,Math.max(0,(timestamp-last)/1000)):0;last=timestamp;if(!paused&&!document.hidden){g.time+=dt*Number($('preview-speed').value);g.player.pa=g.player.angle;g.player.angle+=g.player.spin*dt;}
    const b=g.player,type=A.appearance(b).type,compact=['blackhole','neutron','magnetar'].includes(type),radius=compact?Math.min(40,r.h*.11):type==='nebula'?Math.min(90,r.h*.15):Math.min(128,r.h*.24),c=r.ctx;
    r.camera={x:0,y:0,z:0,zoom:radius/b.r};r.cosmic.prepare();r.surfaceDraws=r.surfaceBuilds=0;r.advanceSurfaces();c.fillStyle='#070e16';c.fillRect(0,0,r.w,r.h);c.fillStyle='#c0d0cf';for(let i=0;i<80;i++){const x=(i*137.36)%r.w,y=(i*83.19)%r.h;c.globalAlpha=.12+(i%5)*.035;c.fillRect(x,y,1,1);}c.globalAlpha=1;r.body(b,{x:r.w/2,y:r.h/2},radius);$('preview-time').textContent=g.time.toFixed(1)+' s';requestAnimationFrame(draw);
  }requestAnimationFrame(draw);
})(window.AC);
