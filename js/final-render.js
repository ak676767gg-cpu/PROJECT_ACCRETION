'use strict';
/* Procedural black-hole rendering, isolated from simulation and its RNG.
 * Public: AC.FinalRay {orbit, images}, FinalRender {draw, advance, reset,
 * memoryBytes}, legacy flag. Depends on core, CosmicRenderer and FINAL_LOOK.
 * Schwarzschild null-orbit equation: Luminet 1979; critical impact sqrt(27)/2
 * in Schwarzschild-radius units. Point-source lens images are a separate
 * weak-field display approximation, not a Kerr image or DNGR implementation.
 * Stage bodies use original live Canvas geometry. The separate landmark
 * reuses sampled rays at T0/T1 and integrates them in local WebGL at T2/T3.
 * See sources.html, FINAL_INTERSTALLAR.md and tests/final-interstallar-lab.html.
 */
/* Original procedural light paths. No image data, dependencies or requests. */
(function(A){
  const PI=Math.PI,TAU=PI*2,CRIT=Math.sqrt(27)/2;
  const surface=n=>{const c=document.createElement('canvas');c.width=c.height=n;return c;};
  const smooth=(a,b,x)=>{const t=A.clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
  // The Schwarzschild null-orbit equation u'' + u = 3u²/2 is the angular
  // form of x'' = -(3/2) r_s h² x / |x|⁵, with r_s=1. RK4 conserves the
  // impact parameter at infinity. It supplies all disk-plane intersections.
  function orbit(impact,steps=1100){
    const h=.009,b=Math.max(.0001,impact)*CRIT,values=new Float32Array(steps+1);
    let u=0,v=1/b,theta=0,captured=false,end=0;
    for(let i=1;i<=steps;i++){
      const k1=v,l1=-u+1.5*u*u,k2=v+l1*h*.5,u2=u+k1*h*.5,l2=-u2+1.5*u2*u2;
      const k3=v+l2*h*.5,u3=u+k2*h*.5,l3=-u3+1.5*u3*u3,k4=v+l3*h,u4=u+k3*h,l4=-u4+1.5*u4*u4;
      const before=u;u+=(k1+2*k2+2*k3+k4)*h/6;v+=(l1+2*l2+2*l3+l4)*h/6;theta=i*h;
      values[i]=u;
      if(u>=1){captured=true;end=theta;break;}
      if(u<=0){end=theta-h+h*before/(before-u);break;}
      end=theta;
    }
    return{values,h,end,captured,deflection:captured?null:end-PI};
  }
  A.FinalRay={orbit,criticalImpact:CRIT,
    // Two images of a point-mass lens, finite at perfect alignment. No allocation
    // when the caller provides out. Radius is an Einstein-radius screen measure.
    images(x,y,cx,cy,r,out){out=out||{};const dx=x-cx,dy=y-cy,d=Math.hypot(dx,dy),beta=Math.max(.0001,d/Math.max(r,.001));
      const root=Math.sqrt(beta*beta+4),plus=(beta+root)/2,minus=(beta-root)/2,nx=d>.00001?dx/d:1,ny=d>.00001?dy/d:0;
      out.x=cx+nx*r*plus;out.y=cy+ny*r*plus;out.sx=cx+nx*r*minus;out.sy=cy+ny*r*minus;
      const f=(beta*beta+2)/(beta*root);out.primary=Math.min(20,(f+1)/2);out.secondary=Math.min(20,(f-1)/2);out.stretch=Math.min(8,plus/beta);return out;
    }
  };
  const VERTEX='attribute vec2 p; varying vec2 uv; void main(){uv=p;gl_Position=vec4(p,0.,1.);}';
  // Embedded, independently generated sky and disk. Relative coordinates and
  // wrapped phases avoid world-coordinate precision loss. No texture uploads.
  const FRAGMENT=`precision highp float;
    varying vec2 uv; uniform float extent,inc,phase,phaseOther,phaseMix,innerR,outerR,exposure,beam,stepsScale,bandY,archOffset,textureScale,bandWidth;
    const float PI=3.14159265359;const float C=2.59807621135;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float sm(float a,float b,float v){float t=clamp((v-a)/(b-a),0.,1.);return t*t*(3.-2.*t);}
    vec3 shoulder(vec3 v){return mix(v,vec3(.706)+vec3(.294)*(1.-exp(-(v-vec3(.706))*2.55)),step(vec3(.706),v));}
    vec3 grade(float hot){return mix(vec3(.31,.14,.09),mix(vec3(.77,.45,.30),vec3(.98,.87,.80),sm(.2,.85,hot)),sm(0.,.6,hot));}
    vec3 emit(float r,float phi,float order){float g=pow(max(.1,1.-1./max(r,1.01)),1.5);
      float denom=pow(max(r/innerR,1.),1.5),t=phase/denom,tb=phaseOther/denom,n=.76+.12*sin(phi*17.-t*17.+r*3.*textureScale)+.08*sin(phi*37.-t*37.+r*14.*textureScale);
      float nb=.76+.12*sin(phi*17.-tb*17.+r*3.*textureScale)+.08*sin(phi*37.-tb*37.+r*14.*textureScale);n=mix(nb,n,phaseMix);float lane=.97+.03*sin(r*23.*textureScale+sin(phi*4.-t)*1.3);float hot=exp(-(r-innerR)*.15);
      float power=pow(innerR/max(r,innerR),2.05)*n*lane*exposure*g*(order<.5?1.:order<1.5?1.05:.04);
      power*=sm(innerR,innerR+.55,r);power*=mix(1.,clamp(pow(1.+.28*sin(phi)*sin(inc)/sqrt(r),3.),.3,2.),beam);
      return grade(hot)*power*(1.-sm(outerR*.72,outerR,r));}
    void main(){vec2 p=uv*extent;float b=length(p),rayB=length(p-vec2(archOffset,0.)),impact=max(rayB*C,.001),u=0.,v=1./impact,theta=0.;
      float ny=rayB>.0001?p.y/rayB:0.;float first=atan(-cos(inc),ny*sin(inc));if(first<0.)first+=PI;
      float crossing=first;float order=0.;vec3 light=vec3(0.);float opacity=0.;bool captured=false;
      float h=.05*stepsScale;
      for(int j=0;j<128;j++){float k1=v,l1=-u+1.5*u*u,k2=v+l1*h*.5,u2=u+k1*h*.5,l2=-u2+1.5*u2*u2;
        float k3=v+l2*h*.5,u3=u+k2*h*.5,l3=-u3+1.5*u3*u3,k4=v+l3*h,u4=u+k3*h,l4=-u4+1.5*u4*u4;
        float before=u;u+=(k1+2.*k2+2.*k3+k4)*h/6.;v+=(l1+2.*l2+2.*l3+l4)*h/6.;theta+=h;
        if(crossing<=theta&&order<3.){float f=clamp((crossing-theta+h)/h,0.,1.),ur=mix(before,u,f),r=1./max(ur,.0001);
          float x=r*(sin(inc)*cos(crossing)-ny*cos(inc)*sin(crossing)),z=rayB>.0001?r*(p.x-archOffset)/rayB*sin(crossing):0.;
          if(r>=innerR&&r<=outerR){float a=order<.5?.95:order<1.5?.90:.06;light+=(1.-opacity)*emit(r,atan(z,x),order)*a;opacity+=(1.-opacity)*a;}
          crossing+=PI;order+=1.;}
        if(u>=1.){captured=true;break;}if(j>2&&u<=0.)break;if(stepsScale>1.5&&j>=55)break;
      }
      // Finite-height front photosphere. It is an emitting disk surface,
      // not a painted opaque stripe or a replacement for the ray intersections.
      float rr=sqrt(p.x*p.x+innerR*innerR/(C*C)),front=exp(-pow((p.y+bandY)/bandWidth,4.));
      float frontLight=pow(1.4/max(rr,1.4),.58)*(1.-sm(outerR*.65/C,outerR/C,abs(p.x)));
      float tex=.86+.10*sin(33.*atan(p.x,p.y+.4)-phase*3.+rr*23.*textureScale);light=mix(light,vec3(.98,.88,.82)*frontLight*tex,front*.94);
      float ring=exp(-pow((b-1.014)/.017,2.));light+=vec3(.79,.63,.55)*ring*.83;
      if(front<.25)light=shoulder(light);if(b<.985&&(front<.003||abs(p.y)<.03))light=vec3(0.);
      float a=captured||b<1.03?1.:max(opacity,front);a=max(a,ring);
      // Matched procedural background within the local footprint, feathered at
      // its edge. High orders terminate finitely rather than producing NaNs.
      vec2 grid=floor(p*23.);float star=step(.997,hash(grid))*pow(1.-length(fract(p*23.)-.5)*1.4,8.);
      vec3 sky=vec3(.002,.006,.009)+star*vec3(.35,.40,.43);light+=sky*(1.-a);a=1.;
      float feather=1.-sm(extent*.91,extent,max(abs(p.x),abs(p.y)));gl_FragColor=vec4(clamp(light,0.,1.)*feather,a*feather);
    }`;
  const lookCache=new WeakMap(),anchors={Ember:Object.freeze({extent:3.1,outer:8,arch:.18,kind:'Ember'}),Halo:Object.freeze({extent:4.4,outer:11.25,arch:.65,kind:'Halo'}),Full:Object.freeze({extent:5.6,outer:14.5,arch:1,kind:'Full'})},uniformNames=['extent','inc','phase','phaseOther','phaseMix','innerR','outerR','exposure','beam','stepsScale','bandY','archOffset','textureScale','bandWidth'];
  // Each class has its own geometric language, not a recoloured shared image.
  // These are original Canvas paths. Emitting gas is lit by the owner's real
  // captured mass; unfed horizons retain only faint returned-light arcs.
  const horizonProfiles=Object.freeze([
    {stage:15,id:'ember',tilt:-.38,flat:.46,outer:2.8,lanes:16,arms:2,warp:.11,spin:2.4,jets:0,hot:'#fff0cb',warm:'#ef985c',cool:'#783a28',rim:'#eeba8b'},
    {stage:16,id:'copper-vortex',tilt:.36,flat:.69,outer:3.25,lanes:20,arms:3,warp:.07,spin:1.95,jets:0,hot:'#fce3bd',warm:'#cfa46c',cool:'#478a98',rim:'#b8dad9'},
    {stage:17,id:'polar-engine',tilt:-.19,flat:.23,outer:3.6,lanes:20,arms:2,warp:.04,spin:2.1,jets:2.7,hot:'#eafaff',warm:'#8ecbdc',cool:'#38697e',rim:'#c4eef6'},
    {stage:18,id:'golden-torus',tilt:.12,flat:.36,outer:4.05,lanes:24,arms:4,warp:.045,spin:1.7,jets:0,hot:'#fff4d2',warm:'#e8b873',cool:'#82654b',rim:'#f6dbab'},
    {stage:19,id:'galactic-maelstrom',tilt:-.53,flat:.77,outer:4.5,lanes:24,arms:3,warp:.09,spin:1.5,jets:0,hot:'#e6fff2',warm:'#8ad5b8',cool:'#3c6e7d',rim:'#b5e6db'},
    {stage:20,id:'quasar-crown',tilt:.26,flat:.3,outer:4.9,lanes:26,arms:4,warp:.03,spin:1.4,jets:4.3,hot:'#ffffff',warm:'#bbd9ee',cool:'#49778e',rim:'#eaf3fb'},
    {stage:21,id:'interstallar',tilt:-.075,flat:.13,outer:5.45,lanes:30,arms:2,warp:.022,spin:1.85,jets:0,hot:'#fff5df',warm:'#ebbf90',cool:'#885c49',rim:'#ffe5c6'}
  ].map(Object.freeze));
  A.FinalRender=class{
    constructor(r){this.r=r;this.cache=new Map();this.jobs=[];this.paths=null;this.gl=null;this.glCanvas=null;this.failedGL=false;
      this.status={tier:'T0',reason:'Baked Canvas',gpu:'not requested'};this.frame=0;this.rivalDetail=0;this.requested=2;this.lowFor=0;this.highFor=0;this.upAt=-1e6;this.lossCount=0;this.secondaryCount=0;this.point={};this.lastFeed=0;
      this.uniforms={};this.gpuValues={};this.landmarkPoint={x:0,y:0};this.listenersInstalled=false;this.phase=0;
    }
    static legacy=false;
    static shader={vertex:VERTEX,fragment:FRAGMENT};
    static profiles=horizonProfiles;
    static profile(b){return horizonProfiles[A.clamp(A.scaleStage(b)-15,0,6)];}
    static extent(b){return A.FinalRender.look(b).extent+.7;}
    static look(b){const stage=A.scaleStage(b),fraction=A.clamp(Math.log(Math.max(1,b.m))/Math.log(5)-Math.floor(Math.log(Math.max(1,b.m))/Math.log(5)),0,1),t=A.clamp((stage+fraction-15)/4,0,1);let q=lookCache.get(b);if(!q){q={};lookCache.set(b,q);}q.extent=A.lerp(3.1,5.6,t);q.outer=A.lerp(8,14.5,t);q.arch=A.lerp(.18,1,t);q.kind=t<.5?'Ember':t<1?'Halo':'Full';q.growth=t;return q;}
    static anchor(kind){return anchors[kind]||anchors.Full;}
    memoryBytes(){let bytes=this.paths?this.paths.reduce((total,p)=>total+p.values.byteLength,0):0;for(const v of this.cache.values())bytes+=(v.data?.data.byteLength||0)+(v.map?.byteLength||0)+(v.baseData?.byteLength||0)+(v.texIndex?.byteLength||0)+(v.shade?.byteLength||0)+(v.palette?.byteLength||0)+(v.canvas?.width||0)*(v.canvas?.height||0)*4+(v.contours?.reduce((sum,line)=>sum+line.points.byteLength,0)||0)+(v.detailCanvas?.width||0)*(v.detailCanvas?.height||0)*4;if(this.glCanvas)bytes+=this.glCanvas.width*this.glCanvas.height*8;return bytes;}
    reset(){this.jobs.length=0;this.cache.clear();this.paths=null;this.lastFeed=0;this.rivalDetail=0;this.disposeGL();this.failedGL=false;this.failedRender=false;this.status={tier:'T0',reason:'Baked Canvas',gpu:'not requested'};}
    disposeGL(){if(this.gl){try{if(this.program)this.gl.deleteProgram(this.program);if(this.buffer)this.gl.deleteBuffer(this.buffer);const extension=this.gl.getExtension?.('WEBGL_lose_context');extension?.loseContext();}catch(_){/* A lost context owns no usable resources. */}}this.program=null;this.buffer=null;this.gl=null;if(this.glCanvas){this.glCanvas.width=this.glCanvas.height=1;}this.glCanvas=null;this.listenersInstalled=false;}
    startFrame(dt){this.frame++;this.rivalDetail=0;this.secondaryCount=0;const g=this.r.game,s=A.Save.data.settings;
      if(this.physicalSetting!==undefined&&this.physicalSetting!==s.finalPhysical){this.cache.clear();this.jobs.length=0;}this.physicalSetting=s.finalPhysical;
      if(s.finalQuality==='auto'&&g.fpsMeasured&&s.adaptive){this.lowFor=g.fps<45?this.lowFor+dt:0;this.highFor=g.fps>58?this.highFor+dt:0;
        if(this.lowFor>=3){this.requested=Math.max(0,this.requested-1);this.lowFor=0;this.highFor=0;this.upAt=g.time;}
        if(this.highFor>=10&&g.time-this.upAt>=30){this.requested=Math.min(3,this.requested+1);this.highFor=0;this.upAt=g.time;}}
      this.advance(3.8);
    }
    tier(radius,important){const s=A.Save.data.settings,g=this.r.game;
      if(s.shaderMode==='off'||radius<60||!important||s.reducedMotion||g.state==='menu'||s.quality==='low'||(g.detail||1)<.5||s.finalQuality==='low')return 0;
      if(s.finalQuality==='medium'||s.shaderMode==='balanced')return 1;
      return s.finalQuality==='high'?3:this.requested;
    }
    ensureGL(tier){if(this.failedGL)return false;if(this.gl&&this.program)return true;
      try{const c=this.glCanvas||surface(tier===3?1024:640);this.glCanvas=c;const gl=c.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false,depth:false,stencil:false,preserveDrawingBuffer:false,failIfMajorPerformanceCaveat:true,powerPreference:'high-performance'});
        if(!gl)throw Error('WebGL unavailable');this.gl=gl;
        const prec=gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER,gl.HIGH_FLOAT);if(!prec||prec.precision<16)throw Error('Fragment highp unavailable');
        const compile=(type,src)=>{const shader=gl.createShader(type);gl.shaderSource(shader,src);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){gl.deleteShader(shader);throw Error('Shader compilation failed');}return shader;};
        const v=compile(gl.VERTEX_SHADER,VERTEX),f=compile(gl.FRAGMENT_SHADER,FRAGMENT),p=gl.createProgram();gl.attachShader(p,v);gl.attachShader(p,f);gl.linkProgram(p);gl.deleteShader(v);gl.deleteShader(f);if(!gl.getProgramParameter(p,gl.LINK_STATUS)){gl.deleteProgram(p);throw Error('Shader linking failed');}
        this.program=p;this.buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
        for(const key of uniformNames)this.uniforms[key]=gl.getUniformLocation(p,key);
        if(!this.listenersInstalled){this.listenersInstalled=true;c.addEventListener('webglcontextlost',e=>{e.preventDefault();this.lossCount++;this.program=null;this.gl=null;this.failedGL=true;this.status={tier:'T1',reason:'Context lost; Canvas fallback',gpu:'context lost'};});
        c.addEventListener('webglcontextrestored',()=>{this.failedGL=false;this.gl=null;this.program=null;this.status.gpu='restored; rebuilding on demand';});}
        this.status.gpu='WebGL ready';return true;
      }catch(e){this.failedGL=true;this.disposeGL();this.status.gpu=e.message||'WebGL unavailable';return false;}
    }
    gpu(q,radius,look,tier,time,feed){if(!this.ensureGL(tier))return false;const gl=this.gl,c=this.glCanvas,n=Math.max(64,Math.min(tier===3?1024:640,Math.ceil(radius*look.extent*2*this.r.dpr)));
      if(c.width!==n)c.width=c.height=n;gl.viewport(0,0,n,n);gl.useProgram(this.program);gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);const p=gl.getAttribLocation(this.program,'p');gl.enableVertexAttribArray(p);gl.vertexAttribPointer(p,2,gl.FLOAT,false,0,0);
      const L=A.FINAL_LOOK,v=this.gpuValues;v.extent=look.extent;v.inc=(90-L.inclination)*PI/180;v.phase=(time%240)*TAU/12;v.phaseOther=((time+120)%240)*TAU/12;v.phaseMix=Math.sin(Math.PI*(time%240)/240)**2;v.innerR=L.innerRadius;v.outerR=look.outer;v.exposure=L.exposure*(1+feed*(A.Save.data.settings.finalFlashSafe?.07:.12));v.beam=A.Save.data.settings.finalPhysical?1:0;v.stepsScale=tier===3?1:2;v.bandY=L.bandOffset;v.archOffset=L.archOffset;v.textureScale=L.textureScale||1;v.bandWidth=L.bandThickness;v.beam*=L.beamingScale??1;
      for(let i=0;i<uniformNames.length;i++){const key=uniformNames[i];gl.uniform1f(this.uniforms[key],v[key]);}gl.drawArrays(gl.TRIANGLES,0,6);
      // Same-task copy is required when preserveDrawingBuffer is false.
      this.r.ctx.drawImage(c,q.x-radius*look.extent,q.y-radius*look.extent,radius*look.extent*2,radius*look.extent*2);this.status.tier='T'+tier;this.status.reason='Local null-ray integration';this.core(q,radius);return true;
    }
    requestMap(look,n=256){const key=n+':'+look.kind;let entry=this.cache.get(key);if(entry)return entry;
      entry={key,look,n,canvas:surface(n),data:null,map:new Float32Array(n*n*8),row:0,paintRow:0,shadeRow:0,shade:new Float32Array(256*128*3),ready:false,baked:false,stamp:-1e9,texIndex:new Uint16Array(n*n),palette:new Float32Array(4096),crop:{x:n,y:n,right:0,bottom:0}};entry.data=entry.canvas.getContext('2d').createImageData(n,n);
      this.cache.set(key,entry);this.jobs.push(entry);while(this.cache.size>5||this.memoryBytes()>11.7*1024*1024){const first=this.cache.keys().next().value;if(first===key)break;this.cache.delete(first);this.jobs=this.jobs.filter(j=>j.key!==first);}return entry;
    }
    advance(budget=3.8){if(!this.jobs.length)return;const start=performance.now();
      if(!this.paths){this.paths=[];this.pathBuild=0;}
      // Radial symmetry lets all screen rays reuse impact-parameter trajectories.
      // It saves hundreds of millions of pixel integrator steps without a sprite trace.
      while(this.pathBuild<600&&performance.now()-start<budget){const b=.08+this.pathBuild/599*8.1;this.paths.push(orbit(b));this.pathBuild++;}
      if(this.pathBuild<600)return;
      const e=this.jobs[0],L=A.FINAL_LOOK,inc=(90-L.inclination)*PI/180,si=Math.sin(inc),ci=Math.cos(inc),n=e.n;
      while(e.row<n&&performance.now()-start<budget){const y=e.row++;for(let x=0;x<n;x++){
        const px=((x+.5)/n*2-1)*e.look.extent,py=-((y+.5)/n*2-1)*e.look.extent,rayX=px-L.archOffset,b=Math.hypot(rayX,py),ny=b>.00001?py/b:0,k=(y*n+x)*8;
        const bi=A.clamp((b-.08)/8.1*599,0,599),i=Math.floor(bi),a=this.paths[i],z=this.paths[Math.min(599,i+1)],f=bi-i;
        let theta=Math.atan2(-ci,ny*si);if(theta<0)theta+=PI;
        for(let order=0;order<3;order++,theta+=PI){const at=theta/a.h,index=Math.floor(at),fraction=at-index;
          if(theta>Math.min(a.end,z.end)||index>=a.values.length-1){e.map[k+order*2]=0;continue;}
          const ua=A.lerp(a.values[index],a.values[index+1],fraction),uz=A.lerp(z.values[index],z.values[index+1],fraction),u=A.lerp(ua,uz,f),rd=1/Math.max(u,.0001);
          const xx=rd*(si*Math.cos(theta)-ny*ci*Math.sin(theta)),zz=b>.00001?rd*rayX/b*Math.sin(theta):0;e.map[k+order*2]=rd;e.map[k+order*2+1]=Math.atan2(zz,xx);
        }
        e.map[k+6]=Math.hypot(px,py);e.map[k+7]=Math.hypot(px,py)<1?1:0;
      }}
      if(e.row>=n){while(e.shadeRow<256&&performance.now()-start<budget*.80)this.shadeRow(e,e.shadeRow++);while(e.shadeRow===256&&e.paintRow<n&&performance.now()-start<budget*.78){const row=e.paintRow++;this.paint(e,0,0,row,row+1);}
        while(e.paintRow>=n&&e.contours?.length!==56&&performance.now()-start<budget*.85)this.makeContours(e);
        if(e.paintRow>=n&&e.contours?.length===56){if(n>=256&&!e.detailCanvas)this.contourAsset(e);e.canvas.getContext('2d').putImageData(e.data,0,0);e.baseData=new Uint8ClampedArray(e.data.data);e.ready=e.baked=true;this.jobs.shift();while(this.memoryBytes()>11.7*1048576&&this.cache.size>1){const key=this.cache.keys().next().value;if(key===e.key)break;this.cache.delete(key);this.jobs=this.jobs.filter(job=>job.key!==key);}}}

    }
    shadeRow(e,row){const L=A.FINAL_LOOK,warm=L.ramp,r=L.innerRadius+(e.look.outer-L.innerRadius)*(row+.5)/256,hot=Math.exp(-(r-L.innerRadius)*.15)*(.98+.02*Math.sin(r*23*(L.textureScale||1)+Math.sin(r*5))),q=hot*(warm.length-1),q0=q|0,q1=q0+1<warm.length?q0+1:q0,f=q-q0;
      const base=smooth(L.innerRadius,L.innerRadius+.55,r)*Math.pow(L.innerRadius/r,L.emissivity)*L.exposure*Math.pow(Math.max(.1,1-1/r),1.5)*(1-smooth(e.look.outer*.72,e.look.outer,r));
      const red=A.lerp(warm[q0][0],warm[q1][0],f),green=A.lerp(warm[q0][1],warm[q1][1],f),blue=A.lerp(warm[q0][2],warm[q1][2],f);
      for(let a=0;a<128;a++){const phi=(a+.5)/128*TAU-PI,n=.91+.045*Math.sin(phi*7+r*1.2)+.045*Math.sin(phi*17+r*3),lane=.97+.03*Math.sin(r*23*(L.textureScale||1)+Math.sin(phi*4)*1.3);let v=base*n*lane;if(A.Save.data.settings.finalPhysical)v*=A.clamp(Math.pow(1+.28*(L.beamingScale??1)*Math.sin(phi)/Math.sqrt(r),3),.3,2);const k=(row*128+a)*3;e.shade[k]=red*v;e.shade[k+1]=green*v;e.shade[k+2]=blue*v;}
    }
    paint(e,time,feed,first=0,last=e.n){const L=A.FINAL_LOOK,n=e.n,data=e.data.data,m=e.map,look=e.look,phase=(time%240)*TAU/12,step=256/(look.outer-L.innerRadius);
      for(let y=first;y<last;y++)for(let x=0;x<n;x++){
        const i=(y*n+x)*8,k=(y*n+x)*4,b=m[i+6],px=((x+.5)/n*2-1)*look.extent,py=((y+.5)/n*2-1)*look.extent;
        let red=0,green=0,blue=0,alpha=0,mr=0,mp=0;
        for(let order=0;order<3;order++){const r=m[i+order*2],phi=m[i+order*2+1];if(r<L.innerRadius||r>look.outer)continue;
          const rf=A.clamp((r-L.innerRadius)*step,0,255),af=((phi+PI)/TAU*128+128)%128,ri=rf|0,ai=af|0,rt=rf-ri,at=af-ai,ri2=Math.min(255,ri+1),ai2=(ai+1)%128,idx=(ri*128+ai)*3,idx2=(ri*128+ai2)*3,idx3=(ri2*128+ai)*3,idx4=(ri2*128+ai2)*3,opacity=order===0?.95:order===1?.90:.06,weight=(1-alpha)*opacity,power=order===1?1.05*look.arch:order===2?.04*look.arch:1;
          red+=weight*A.lerp(A.lerp(e.shade[idx],e.shade[idx2],at),A.lerp(e.shade[idx3],e.shade[idx4],at),rt)*power;green+=weight*A.lerp(A.lerp(e.shade[idx+1],e.shade[idx2+1],at),A.lerp(e.shade[idx3+1],e.shade[idx4+1],at),rt)*power;blue+=weight*A.lerp(A.lerp(e.shade[idx+2],e.shade[idx2+2],at),A.lerp(e.shade[idx3+2],e.shade[idx4+2],at),rt)*power;alpha+=weight;if(!mr){mr=r;mp=phi;}
        }
        const delta=(py-L.bandOffset)/L.bandThickness;let front=0;
        if(delta>-5&&delta<5){front=Math.exp(-delta*delta*delta*delta);const rr=Math.sqrt(px*px+(L.innerRadius/CRIT)**2),light=Math.pow(1.4/Math.max(rr,1.4),.58)*(1-smooth(look.outer*.65/CRIT,look.outer/CRIT,Math.abs(px))),tex=1.06+.04*Math.sin(13*Math.atan2(px,py+.4)-phase*3+rr*7),af=front*.94;
          red=red+(250*light*tex-red)*af;green=green+(225*light*tex-green)*af;blue=blue+(209*light*tex-blue)*af;if(front>alpha)alpha=front;}
        const dr=(b-L.ringRadius)/L.ringWidth,ring=dr>-5&&dr<5?Math.exp(-dr*dr)*.83:0;red+=201*ring;green+=161*ring;blue+=140*ring;if(ring>alpha)alpha=ring;
        if(b<.985&&(front<.003||Math.abs(py)<.03)){red=green=blue=0;alpha=1;}if(b<1.035)alpha=1;
        const absx=px<0?-px:px,absy=py<0?-py:py,edge=1-smooth(look.extent*.91,look.extent,absx>absy?absx:absy);
        if(b>1.03&&b<3.8){const d=b>1.28?b-1.28:0,glow=.04*(L.bloom/.19)*Math.exp(-d*d/1.1)*look.arch;red+=glow*130;green+=glow*73;blue+=glow*50;if(glow>alpha)alpha=glow;}
        const brightness=1+feed*(A.Save.data.settings.finalFlashSafe?.07:.12),div=brightness/(alpha>.001?alpha:.001);let rv=red*div,gv=green*div,bv=blue*div;if(front<.25){if(rv>180)rv=180+75*(1-Math.exp(-(rv-180)/100));if(gv>180)gv=180+75*(1-Math.exp(-(gv-180)/100));if(bv>180)bv=180+75*(1-Math.exp(-(bv-180)/100));}data[k]=rv;data[k+1]=gv;data[k+2]=bv;data[k+3]=(x===0||y===0||x===n-1||y===n-1)?0:alpha*edge*255;if(data[k+3]){const box=e.crop;box.x=Math.min(box.x,x);box.y=Math.min(box.y,y);box.right=Math.max(box.right,x+1);box.bottom=Math.max(box.bottom,y+1);}
        const tx=((mp+PI)/TAU*64)|0,ty=Math.floor(Math.sqrt(A.clamp((mr-L.innerRadius)/(look.outer-L.innerRadius),0,1))*63);e.texIndex[y*n+x]=b<.985&&(front<.003||Math.abs(py)<.03)?65535:ty*64+(tx<64?tx:0);
      }
      if(first===0&&last===n){e.canvas.getContext('2d').putImageData(e.data,0,0);e.stamp=time;e.baked=true;}
    }
    crossingAt(b,ny,order){const inc=(90-A.FINAL_LOOK.inclination)*PI/180;let theta=Math.atan2(-Math.cos(inc),ny*Math.sin(inc));if(theta<0)theta+=PI;theta+=order*PI;
      const bi=A.clamp((b-.08)/8.1*599,0,599),i=bi|0,a=this.paths[i],z=this.paths[Math.min(599,i+1)],index=(theta/a.h)|0,f=theta/a.h-index;
      if(theta>Math.min(a.end,z.end)||index>=Math.min(a.values.length,z.values.length)-1)return 0;
      const u=A.lerp(A.lerp(a.values[index],a.values[index+1],f),A.lerp(z.values[index],z.values[index+1],f),bi-i);return 1/Math.max(u,.0001);
    }
    makeContours(e){if(!this.paths)return;const lines=e.contours||(e.contours=[]);const index=lines.length;if(index>=56)return;
      // High-resolution isoradius filaments use the same cached null rays as
      // the image map. They preserve curved disk geometry at large footprints
      // without allocating a much larger per-pixel ray buffer.
      {const order=index<28?0:1,lane=index%28,rd=A.FINAL_LOOK.innerRadius+.10+lane*.113+Math.sin(lane*2.39)*.025,points=new Float32Array(65*2);
        for(let j=0;j<=64;j++){const a=.014+j/64*(PI-.028),ny=Math.sin(a)*(order? -1:1);let lo=.87,hi=2.8;
          for(let k=0;k<15;k++){const b=(lo+hi)/2,r=this.crossingAt(b,ny,order);if(r>rd)hi=b;else lo=b;}
          const b=(lo+hi)/2,valid=Math.abs(this.crossingAt(b,ny,order)-rd)<rd*.08;points[j*2]=valid?b*Math.cos(a)+A.FINAL_LOOK.archOffset:NaN;points[j*2+1]=valid?-b*ny:NaN;
        }lines.push({points,rd,lane,order});
      }
    }
    contours(e,q,radius,time,force=false){if(!force&&radius<60||!e.contours)return;const c=this.r.ctx,L=A.FINAL_LOOK;c.save();c.translate(q.x,q.y);c.lineWidth=Math.max(.45,radius*.006);c.lineJoin='round';
      for(const line of e.contours){const row=Math.min(255,Math.floor((line.rd-L.innerRadius)/(e.look.outer-L.innerRadius)*256)),k=(row*128+64)*3,red=Math.min(250,e.shade[k]),green=Math.min(228,e.shade[k+1]),blue=Math.min(215,e.shade[k+2]);c.strokeStyle='rgb('+Math.round(red)+','+Math.round(green)+','+Math.round(blue)+')';
        const phase=time*TAU/(12*Math.pow(line.rd/L.innerRadius,1.5));c.globalAlpha=(.18+.12*Math.sin(line.lane*2.4+phase)**2)*e.look.arch*(line.order?.85:1);c.beginPath();
        const points=line.points;let pen=false;for(let j=0;j<points.length;j+=2){const x=points[j]*radius,y=points[j+1]*radius;if(!Number.isFinite(x)){pen=false;continue;}if(!pen)c.moveTo(x,y);else c.lineTo(x,y);pen=true;}c.stroke();
      }c.restore();
    }
    blit(e,q,radius){const b=e.crop,n=e.n,side=radius*e.look.extent*2;if(b.right<=b.x||b.bottom<=b.y)return;this.r.ctx.drawImage(e.canvas,b.x,b.y,b.right-b.x,b.bottom-b.y,q.x-side/2+b.x/n*side,q.y-side/2+b.y/n*side,(b.right-b.x)/n*side,(b.bottom-b.y)/n*side);}
    contourAsset(e){const canvas=surface(512),ctx=canvas.getContext('2d'),previous=this.r.ctx;this.r.ctx=ctx;
      // Bake the expensive, static isoradius geometry once. Material shimmer
      // and the small advected filaments still use the original paused clock.
      try{this.contours(e,{x:256,y:256},256/e.look.extent,0,true);e.detailCanvas=canvas;
        // Derive the transparent crop from cached geometry, without a Canvas
        // readback. Only the curved light occupies this secondary layer.
        const crop={x:512,y:512,right:0,bottom:0},scale=256/e.look.extent;
        for(const line of e.contours)for(let i=0;i<line.points.length;i+=2){const x=line.points[i]*scale+256,y=line.points[i+1]*scale+256;if(!Number.isFinite(x)||!Number.isFinite(y))continue;crop.x=Math.min(crop.x,Math.floor(x-4));crop.y=Math.min(crop.y,Math.floor(y-4));crop.right=Math.max(crop.right,Math.ceil(x+4));crop.bottom=Math.max(crop.bottom,Math.ceil(y+4));}
        crop.x=Math.max(0,crop.x);crop.y=Math.max(0,crop.y);crop.right=Math.min(512,crop.right);crop.bottom=Math.min(512,crop.bottom);e.detailCrop=crop;
      }finally{this.r.ctx=previous;}
    }
    contourImage(e,q,radius,opacity=1){if(radius<60||!e.detailCanvas||opacity<=0)return;const c=this.r.ctx,b=e.detailCrop,side=radius*e.look.extent*2;c.save();c.globalAlpha*=opacity;c.drawImage(e.detailCanvas,b.x,b.y,b.right-b.x,b.bottom-b.y,q.x-side/2+b.x/512*side,q.y-side/2+b.y/512*side,(b.right-b.x)/512*side,(b.bottom-b.y)/512*side);c.restore();}
    core(q,radius){const c=this.r.ctx,L=A.FINAL_LOOK;c.save();c.beginPath();c.rect(q.x-radius*1.04,q.y-radius*1.04,radius*2.08,radius*(1.04+L.bandOffset-.07));c.rect(q.x-radius*1.04,q.y+radius*(L.bandOffset+.07),radius*2.08,radius*(1.04-L.bandOffset-.07));c.clip();c.fillStyle='#000';c.beginPath();c.arc(q.x,q.y,radius*.996,0,TAU);c.fill();c.beginPath();c.arc(q.x+L.archOffset*radius,q.y,radius*.996,0,TAU);c.fill();c.restore();
      c.save();c.strokeStyle='#c9a18c';c.globalAlpha*=.8;c.lineWidth=Math.max(.55,radius*L.ringWidth);c.beginPath();c.arc(q.x,q.y,radius*L.ringRadius,0,TAU);c.stroke();c.restore();
    }
    material(e,time,feed){const phase=(time%240)*TAU/12,other=((time+120)%240)*TAU/12,blend=Math.sin(Math.PI*(time%240)/240)**2,n=e.n,look=e.look,inner=A.FINAL_LOOK.innerRadius;
      for(let r=0;r<64;r++){const rd=inner+(look.outer-inner)*(r/63)*(r/63),denom=Math.pow(rd/inner,1.5),t=phase/denom,tb=other/denom;for(let a=0;a<64;a++){const phi=a/64*TAU,na=.97+.06*Math.sin(phi*7-t*7+r*.13)+.04*Math.sin(phi*17-t*17+r*.3),nb=.97+.06*Math.sin(phi*7-tb*7+r*.13)+.04*Math.sin(phi*17-tb*17+r*.3);e.palette[r*64+a]=nb+(na-nb)*blend;}}
      const data=e.data.data,base=e.baseData,idx=e.texIndex,brightness=1+feed*(A.Save.data.settings.finalFlashSafe?.07:.12);
      for(let i=0,k=0;i<idx.length;i++,k+=4){const cell=idx[i],v=cell===65535?1:e.palette[cell]*brightness;data[k]=base[k]*v;data[k+1]=base[k+1]*v;data[k+2]=base[k+2]*v;data[k+3]=base[k+3];}
      e.canvas.getContext('2d').putImageData(e.data,0,0);e.stamp=time;
    }
    motion(q,radius,look,time,feed){const c=this.r.ctx;if(feed>0){c.save();const gr=c.createRadialGradient(q.x,q.y,radius*1.05,q.x,q.y,radius*2.3);gr.addColorStop(0,'#eed3b100');gr.addColorStop(.4,'#edc198');gr.addColorStop(1,'#ad715200');c.fillStyle=gr;c.globalAlpha*=Math.min(.085,feed*.085);c.fillRect(q.x-radius*2.3,q.y-radius*2.3,radius*4.6,radius*4.6);c.restore();}
      c.save();c.translate(q.x,q.y);c.rotate(-.075);this.liveDisk(radius,horizonProfiles[6],time,feed,0,true,A.Save.data.settings.quality==='low');c.restore();
      if(A.Save.data.settings.reducedMotion)return;c.save();c.translate(q.x,q.y);c.strokeStyle='#e8c3a0';c.globalAlpha*=.40;c.lineWidth=Math.max(.6,radius*.025);
      for(let i=0;i<(A.Save.data.settings.quality==='low'?4:8);i++){const d=1.14+i*.11,a=time*TAU/(12*Math.pow(d,1.5))+i*2.39996;c.beginPath();c.arc(-radius*.1,0,radius*d,a,a+.14);c.stroke();}c.restore();
    }
    emergency(q,radius,look){const c=this.r.ctx;c.save();c.translate(q.x,q.y);c.fillStyle='#000';c.beginPath();c.arc(0,0,radius,0,TAU);c.fill();
      // Bounded fallback: far-side light is curved above and below the shadow.
      // It remains available during the first asynchronous bake and all failures.
      for(let i=13;i>=0;i--){const d=1.10+i*.032;c.strokeStyle=i<3?'#ecd2be':i<8?'#b98366':'#644033';c.globalAlpha=(i<3?.45:.18)*look.arch;c.lineWidth=Math.max(.6,radius*.032);c.beginPath();c.arc(-radius*.12,0,radius*d,PI+.06,TAU-.06);c.stroke();c.globalAlpha*=.82;c.beginPath();c.arc(-radius*.08,0,radius*(1.08+i*.027),.08,PI-.08);c.stroke();}
      c.globalAlpha=1;c.strokeStyle='#c9a18c';c.lineWidth=Math.max(.5,radius*.025);c.beginPath();c.arc(0,0,radius*1.014,0,TAU);c.stroke();
      const gradient=c.createLinearGradient(-radius*look.extent,0,radius*look.extent,0);gradient.addColorStop(0,'#61423400');gradient.addColorStop(.25,'#b78665');gradient.addColorStop(.5,'#ead5c5');gradient.addColorStop(.75,'#b78665');gradient.addColorStop(1,'#61423400');c.strokeStyle=gradient;c.lineWidth=Math.max(.8,radius*.06);c.beginPath();c.moveTo(-radius*look.extent,radius*A.FINAL_LOOK.bandOffset);c.lineTo(radius*look.extent,radius*A.FINAL_LOOK.bandOffset);c.stroke();c.restore();}
    liveHorizon(b,q,radius){
      if(!Number.isFinite(radius)||radius<.3)return true;
      const r=this.r,g=r.game,c=r.ctx,p=A.FinalRender.profile(b),important=b===g.player||b.id===g.selectedBody;
      if(radius*p.outer<3){c.fillStyle=p.rim;c.fillRect(q.x-.65,q.y-.65,1.3,1.3);return true;}
      if(!important&&this.rivalDetail++>=2){this.marker(q,radius,p);this.labels(b,q,radius);return true;}
      const s=A.Save.data.settings,detail=Math.min(A.cpuScale(),g.detail||1,s.quality==='low'||s.finalQuality==='low'?.45:s.finalQuality==='medium'?.75:1),low=detail<.6||radius<12;
      const time=A.animationEnabled('Horizon')?r.animationTime():0,raw=A.clamp((g.cosmic?.ownerMass.get(b.id)||0)/Math.max(1e-10,b.m)*8,0,1);
      this.feeds||=new WeakMap();let f=this.feeds.get(b);if(!f||f.id!==b.id){f={value:raw,time,id:b.id};this.feeds.set(b,f);}
      // Integration uses the same interpolated simulation clock as the body,
      // so pausing, photography, and drawing twice never advances the flow.
      if(time>f.time){f.value=A.lerp(f.value,raw,A.ease(1.1,Math.min(.1,time-f.time)));f.time=time;}
      else if(time<f.time||s.reducedMotion){f.value=raw;f.time=time;}
      const feed=f.value,glow=Math.sqrt(feed),seed=(b.seed||0)%997/997;
      c.save();try{c.translate(q.x,q.y);c.rotate(p.tilt+(p.stage===19?.025*Math.sin(time*.12):0));
      const light=c.createRadialGradient(0,0,radius*.95,0,0,radius*Math.min(4.6,p.outer));
      light.addColorStop(0,p.hot+'00');light.addColorStop(.15,p.warm+'24');light.addColorStop(.56,p.cool+'12');light.addColorStop(1,p.cool+'00');
      c.globalAlpha=.26+glow*.65;c.fillStyle=light;c.fillRect(-radius*p.outer,-radius*p.outer,radius*p.outer*2,radius*p.outer*2);
      if(p.jets&&feed>.001)this.liveJets(radius,p,time,glow,low);
      this.liveDisk(radius,p,time,feed,seed,false,low);
      // No texture or reference photo is blitted into the centre.
      c.globalAlpha=1;c.globalCompositeOperation='source-over';c.fillStyle='#010305';c.beginPath();c.arc(0,0,radius,0,TAU);c.fill();
      this.returnedLight(radius,p,time,feed,low);
      this.liveDisk(radius,p,time,feed,seed,true,low);
      // Thin critical curve; its broken bright images travel visibly rather
      // than rotating a rotationally symmetric bitmap.
      c.globalCompositeOperation='screen';c.strokeStyle=p.rim;c.globalAlpha=.55+glow*.2;c.lineWidth=Math.max(.55,radius*.018);c.beginPath();c.arc(0,0,radius*1.018,0,TAU);c.stroke();
      const spots=low?2:p.stage>=20?5:3;
      for(let i=0;i<spots;i++){const a=time*(p.spin*1.55)/(1+i*.2)+i*2.39996+seed*TAU;c.strokeStyle=i%2?p.warm:p.hot;c.globalAlpha=.72;c.lineWidth=Math.max(.7,radius*(i===0?.035:.02));c.beginPath();c.arc(0,0,radius*(1.024+i*.007),a,a+.22+(i===0?.22:0));c.stroke();}
      }finally{c.restore();}this.labels(b,q,radius);
      if(important){this.status.tier=low?'T0':'T1';this.status.reason='Live Canvas · '+p.id;this.status.gpu='Ray integration reserved for the final landmark';}
      return true;
    }
    liveDisk(radius,p,time,feed,seed,front,low){
      const c=this.r.ctx,glow=Math.sqrt(feed),lines=low?7:p.lanes,outer=p.outer,beam=A.Save.data.settings.finalPhysical?(front?1.16:.79):1;
      c.globalCompositeOperation='screen';c.lineCap='round';
      // Near and far halves are drawn on opposite sides of the physical shadow.
      // A low-opacity unfed outline is lensed sky light, not a reservoir of gas.
      for(let i=lines-1;i>=0;i--){const f=i/(lines-1),d=1.2+(outer-1.2)*f,heat=Math.pow(1-f,1.3),flat=p.flat+(p.stage===15?.08*Math.sin(time*.3+f*4):0);
        const color=f<.21?p.hot:f<.62?p.warm:p.cool,start=front?0:PI,end=front?PI:TAU,delta=(outer-1.2)/(lines-1)*.57,inner=Math.max(1.12,d-delta),edge=d+delta;
        if(feed>.0001){c.fillStyle=color;c.globalAlpha=glow*(.10+.20*heat)*(front?1:.7)*beam*(1+.06*Math.sin(time*p.spin/Math.pow(d,1.5)+f*9));c.beginPath();c.ellipse(0,radius*.07,radius*edge,radius*edge*flat,0,start,end);c.lineTo(Math.cos(end)*inner*radius,radius*.07+Math.sin(end)*inner*radius*flat);c.ellipse(0,radius*.07,radius*inner,radius*inner*flat,0,end,start,true);c.closePath();c.fill();}
        c.strokeStyle=color;c.lineWidth=Math.max(.4,radius*.014);c.globalAlpha=(.016+glow*(.065+.07*heat))*(front?1:.62)*beam;
        c.beginPath();c.ellipse(0,radius*.07,radius*d,radius*d*flat,0,start,end);c.stroke();
        // Differential rotation: outer lanes travel more slowly. Identifiable
        // bright clumps and dark gaps make that relationship easy to see.
        if(feed>.0001){const omega=p.spin/Math.pow(d,1.5),a=time*omega+f*6.7+seed*TAU;
          for(let j=0;j<(low?1:2);j++){const angle=(a+j*PI)%TAU;if((Math.sin(angle)>=0)!==front)continue;
            c.strokeStyle=f<.3?p.hot:p.warm;c.globalAlpha=(.16+glow*.56)*(.45+.55*heat)*beam;c.lineWidth=Math.max(.7,radius*(.026+.04*heat));c.beginPath();c.ellipse(0,radius*.07,radius*d,radius*d*flat,0,angle,Math.min(angle+.26+.21*heat,front?PI:TAU));c.stroke();
          }
        }
      }
      if(feed>.0001){
        const arms=low?Math.min(2,p.arms):p.arms,steps=low?14:28;
        for(let arm=0;arm<arms;arm++){c.strokeStyle=arm%2?p.warm:p.hot;c.globalAlpha=(.065+glow*.17)*(front?1:.6);c.lineWidth=Math.max(.8,radius*.048);c.beginPath();let pen=false;
          for(let n=0;n<=steps;n++){const f=n/steps,d=1.28+f*(outer-1.4),a=arm*TAU/arms+seed*TAU+time*p.spin/Math.pow(d,1.5)-Math.log(d)*3.4;
            if((Math.sin(a)>=0)!==front){pen=false;continue;}const wave=1+p.warp*Math.sin(a*3+time*.7+f*4),x=Math.cos(a)*d*radius*wave,y=radius*.07+Math.sin(a)*d*radius*p.flat*(1+p.warp*.35*Math.sin(a*5-time));
            if(pen)c.lineTo(x,y);else c.moveTo(x,y);pen=true;
          }c.stroke();
        }
        // Sparse advected knots are a visual sampling of captured material.
        const knots=low?9:24+p.stage-15;
        c.fillStyle=p.hot;for(let i=0;i<knots;i++){const f=(i+.5)/knots,d=1.26+(outer-1.32)*f,a=i*2.39996+seed*TAU+time*p.spin/Math.pow(d,1.5);
          if((Math.sin(a)>=0)!==front)continue;const x=Math.cos(a)*radius*d,y=radius*.07+Math.sin(a)*radius*d*p.flat,k=Math.max(.7,radius*(.012+(1-f)*.009));c.globalAlpha=(.15+glow*.65)*(1-.7*f);c.fillRect(x-k/2,y-k/2,k,k);
        }
      }
    }
    returnedLight(radius,p,time,feed,low){
      const c=this.r.ctx,glow=Math.sqrt(feed),bands=low?4:p.stage===21?16:9;c.globalCompositeOperation='screen';
      for(let i=bands-1;i>=0;i--){const f=i/(bands-1),d=1.07+f*(p.stage===21?.8:p.stage===20?.64:.4),height=d*(p.stage===16?1.05:p.stage===19?1.04:.95),bias=p.stage===15?-.09:p.stage===18?.07:0;
        c.lineWidth=Math.max(.5,radius*(low?.024:.016));c.strokeStyle=f<.2?p.hot:f<.64?p.warm:p.cool;c.globalAlpha=(.12+glow*.34)*(1-.55*f);
        c.beginPath();c.ellipse(bias*radius,0,radius*d,radius*height,0,PI+.15,TAU-.15);c.stroke();
        if(p.stage>=18){c.globalAlpha*=.42;c.beginPath();c.ellipse(bias*radius,0,radius*(d+.025),radius*height*.89,0,.16,PI-.16);c.stroke();}
        // A clearly traveling segment on every lensed image. This follows a
        // projected null-light contour, rather than a pasted light stripe.
        const phase=(time*p.spin/Math.pow(d,1.5)+i*.83)%PI;
        c.globalAlpha=.48+glow*.25;c.strokeStyle=f<.45?p.hot:p.warm;c.lineWidth=Math.max(.65,radius*.023);c.beginPath();c.ellipse(bias*radius,0,radius*d,radius*height,0,PI+.15+phase*.89,Math.min(TAU-.15,PI+.15+phase*.89+.23));c.stroke();
      }
      if(p.stage===21){
        // Interstallar outer filaments are deliberately readable in motion.
        // They are separate paths, not rotation of an unchanged full ring.
        for(let n=0;n<(low?3:7);n++){const d=2.65+n*.39,a=(time*1.8/Math.pow(d,1.5)+n*.92)%TAU;c.strokeStyle=n<2?p.hot:p.warm;c.globalAlpha=.2+glow*.5;c.lineWidth=Math.max(.8,radius*.025);c.beginPath();c.ellipse(0,radius*.07,radius*d,radius*d*(.12+.009*n),0,a,a+.45);c.stroke();}
      }else if(p.stage===19){
        c.strokeStyle=p.rim;c.globalAlpha=.2+glow*.26;c.lineWidth=Math.max(.7,radius*.017);
        for(let n=0;n<(low?2:4);n++){const a=time*.43+n*1.56;c.beginPath();c.ellipse(0,0,radius*(2.2+n*.43),radius*(1.48+n*.28),-.1,a,a+.7);c.stroke();}
      }
    }
    liveJets(radius,p,time,feed,low){
      const c=this.r.ctx,length=radius*p.jets,width=radius*(p.stage===20?.25:.13),pulse=A.Save.data.settings.finalFlashSafe?1:.88+.12*Math.sin(time*.8)**2;
      for(const sign of [-1,1]){const gradient=c.createLinearGradient(0,sign*radius,0,sign*length);gradient.addColorStop(0,p.hot);gradient.addColorStop(.23,p.warm+'90');gradient.addColorStop(1,p.cool+'00');c.fillStyle=gradient;c.globalAlpha=Math.min(.48,feed*.5)*pulse;c.beginPath();c.moveTo(-width*.28,sign*radius*.8);c.quadraticCurveTo(-width,sign*length*.5,-width*.3,sign*length);c.lineTo(width*.3,sign*length);c.quadraticCurveTo(width,sign*length*.5,width*.28,sign*radius*.8);c.closePath();c.fill();
        c.strokeStyle=p.hot;c.globalAlpha=feed*.45;c.lineWidth=Math.max(.5,radius*.022);c.beginPath();c.moveTo(0,sign*radius*1.05);c.lineTo(0,sign*length*.82);c.stroke();
        for(let n=0;n<(low?2:5);n++){const f=(time*.45+n*.2)%1,y=sign*radius*(1.3+(p.jets-1.3)*f);c.strokeStyle=p.warm;c.globalAlpha=feed*(1-f)*.5;c.lineWidth=Math.max(.5,radius*.017);c.beginPath();c.ellipse(0,y,width*(.5+f),Math.max(.1,width*.22),0,0,TAU);c.stroke();}
      }
    }
    draw(b,q,radius,landmark=false){if(!landmark)return this.liveHorizon(b,q,radius);const r=this.r,g=r.game,c=r.ctx;if(radius<.3)return true;const look=landmark?anchors.Full:A.FinalRender.look(b),important=landmark||b===g.player,footprint=radius*look.extent*2;
      if(footprint<6){c.fillStyle='#a69480';c.fillRect(q.x-.65,q.y-.65,1.3,1.3);return true;}
      let tier=this.tier(radius,important);if(!important&&this.rivalDetail++>=2){this.marker(q,radius);this.labels(b,q,radius);return true;}
      const time=A.animationEnabled('Horizon')?r.animationTime():0,rawFeed=landmark?b.feed||0:A.clamp((g.cosmic?.ownerMass.get(b.id)||0)/Math.max(b.m,1e-10)*8,0,1);this.feeds||=new WeakMap();let envelope=this.feeds.get(b);if(!envelope){envelope={value:0};this.feeds.set(b,envelope);}if(g.state==='playing'&&!g.photo?.active)envelope.value=A.lerp(envelope.value,rawFeed,A.ease(.45,this.r.finalDt||1/60));else envelope.value=rawFeed;const feed=envelope.value;
      if(tier>=2&&this.gpu(q,radius,look,tier,time,feed)){this.motion(q,radius,look,time,feed);this.labels(b,q,radius);return true;}
      if(tier>=2)tier=1;const growth=landmark?1:look.growth,blend=growth<.5?growth*2:(growth-.5)*2,left=A.FinalRender.anchor(growth<.5?'Ember':'Halo'),right=A.FinalRender.anchor(growth<.5?'Halo':'Full');const base=blend<.001?left:blend>.999?right:left,e=this.requestMap(base,tier?256:192),other=blend>.001&&blend<.999?this.requestMap(right,tier?256:192):null;
      if(!e.ready){this.emergency(q,radius,look);this.motion(q,radius,look,time,feed);this.labels(b,q,radius);this.status.tier='T0';this.status.reason='Baking null-ray map';return true;}
      if(tier&&time-e.stamp>1/24&&!A.Save.data.settings.reducedMotion)this.material(e,time,feed);
      if(other?.ready){if(tier&&time-other.stamp>1/24&&!A.Save.data.settings.reducedMotion)this.material(other,time,feed);c.save();c.globalAlpha*=1-blend;this.blit(e,q,radius);c.restore();c.save();c.globalAlpha*=blend;this.blit(other,q,radius);c.restore();}else this.blit(e,q,radius);
      if(tier){this.contourImage(e,q,radius,other?.ready?1-blend:1);if(other?.ready)this.contourImage(other,q,radius,blend);}this.core(q,radius);this.motion(q,radius,look,time,feed);this.labels(b,q,radius);
      if(important){this.status.tier='T'+tier;this.status.reason=tier?'Cached ray map, 24 Hz material':'Baked ray map, advected striations';}return true;
    }
    marker(q,radius,p=horizonProfiles[0]){const c=this.r.ctx;c.save();c.fillStyle='#000';c.beginPath();c.arc(q.x,q.y,radius,0,TAU);c.fill();c.strokeStyle=p.rim;c.globalAlpha*=.65;c.lineWidth=.6;c.beginPath();c.arc(q.x,q.y,radius*1.015,0,TAU);c.stroke();c.restore();}
    labels(b,q,radius){const g=this.r.game;if(g.photo?.active&&!g.photo.labels||b.kind==='landmark'||radius<8)return;const c=this.r.ctx;c.save();c.fillStyle=b===g.player?'#cddbd7':'#c5bdab';c.font='9px ui-monospace,monospace';c.textAlign='center';const label=b===g.player?(g.finalInterstallar?.done?A.FINAL.name:A.appearance(b).name):b.kind==='ai'?b.name+' · '+A.massText(b.m):'';if(label)c.fillText(label.toUpperCase(),q.x,q.y+radius*Math.max(2.4,A.appearance(b).type==='blackhole'?A.FinalRender.profile(b).outer*A.FinalRender.profile(b).flat+.22:2.4)+16);c.restore();}
    secondaryStar(c,x,y,size,brightness,lenses){if(A.Save.data.settings.shaderMode==='off'||A.Save.data.settings.finalLensing===false||this.secondaryCount>=80||(this.r.game.detail||1)<.5)return;let lens=null,best=Infinity;for(const l of lenses){const d=Math.hypot(x-l.x,y-l.y);if(d<l.r*5&&d<best){best=d;lens=l;}}if(!lens)return;
      const p=A.FinalRay.images(x,y,lens.x,lens.y,lens.r*1.65,this.point);if(p.secondary<.025||Math.hypot(p.sx-lens.x,p.sy-lens.y)<lens.r*1.025)return;this.secondaryCount++;c.save();c.globalAlpha=Math.min(.65,brightness*p.secondary*.55);c.translate(p.sx,p.sy);c.rotate(Math.atan2(p.sy-lens.y,p.sx-lens.x)+Math.PI/2);c.fillRect(-Math.min(5,p.stretch)*size/2,-size*.25,Math.min(5,p.stretch)*size,size*.5);c.restore();
    }
    landmark(){const r=this.r,g=r.game,f=g.finalInterstallar;if(!f?.active||!f.found||g.state==='menu')return;
      const q=this.landmarkPoint,radius=f.r*r.camera.zoom;q.x=(f.x-r.camera.x)*r.camera.zoom+r.w/2;q.y=((f.y-r.camera.y)*(r.tilt||1)-(r.camera.z||0)*.7)*r.camera.zoom+r.h/2;if(q.x+radius*5.6<0||q.x-radius*5.6>r.w||q.y+radius*5.6<0||q.y-radius*5.6>r.h)return;
      this.r.ctx.save();if(A.Save.data.settings.reducedMotion&&f.merging)this.r.ctx.globalAlpha*=1-smooth(.5,1,f.merge);this.draw(f,q,radius,true);this.mergeOverlay(q,radius);this.r.ctx.restore();
    }
    mergeOverlay(q,radius){const g=this.r.game,f=g.finalInterstallar;if(!f?.merging)return;const c=this.r.ctx,t=smooth(0,1,f.merge);
      c.save();c.strokeStyle='#f0d3a6';c.globalAlpha=.06+.10*t;c.lineWidth=radius*.08;c.beginPath();c.arc(q.x,q.y,radius*(1.05+.18*t),0,TAU);c.stroke();c.restore();}
    fadeBody(b,q){const f=this.r.game.finalInterstallar;if(!f?.fieldEnabled||f.done||b===this.r.game.player)return 1;const d=Math.hypot(b.x-f.x,b.y-f.y)/f.r;return smooth(1,1.15,d);}
  };
  const originalDraw=A.FinalRender.prototype.draw;
  A.FinalRender.prototype.safeFallback=function(b,q,radius,landmark){const look=landmark?anchors.Full:A.FinalRender.look(b);try{this.emergency(q,radius,look);}catch(_){this.r.ctx.fillStyle='#000';this.r.ctx.fillRect(q.x-Math.max(1,radius),q.y-Math.max(1,radius),Math.max(2,radius*2),Math.max(2,radius*2));}return true;};
  A.FinalRender.prototype.draw=function(b,q,radius,landmark=false){if(this.failedRender)return this.safeFallback(b,q,radius,landmark);try{return originalDraw.call(this,b,q,radius,landmark);}catch(_){this.failedRender=true;this.jobs.length=0;this.status.tier='T0';this.status.reason='Renderer failure; safe Canvas fallback';return this.safeFallback(b,q,radius,landmark);}};
  const oldSpecial=A.CosmicRenderer.prototype.specialBody;
  A.CosmicRenderer.prototype.specialBody=function(b,q,radius){if(A.appearance(b).type==='blackhole'&&!A.FinalRender.legacy){this.r.final=this.r.final||new A.FinalRender(this.r);return this.r.final.draw(b,q,radius);}return oldSpecial.call(this,b,q,radius);};
  const oldPrepare=A.CosmicRenderer.prototype.prepare;
  A.CosmicRenderer.prototype.prepare=function(){oldPrepare.call(this);const r=this.r,g=r.game;
    if(!g.player||g.state==='menu')return;const early=g.player.m<5**A.FINAL.discoverStage&&(g.player.evolution||0)<A.FINAL.discoverStage&&!g.player.path,bh=!early&&A.appearance(g.player).type==='blackhole',f=g.finalInterstallar;if(bh||f?.active||this.lenses.length){r.final=r.final||new A.FinalRender(r);try{r.final.startFrame(r.finalDt||1/60);}catch(_){r.final.failedRender=true;r.final.jobs.length=0;r.final.status.reason='Bake failure; safe Canvas fallback';}}
    if(A.Save.data.settings.shaderMode==='off'||A.Save.data.settings.finalLensing===false||this.detail<.5){if(this.oldLensCount)this.gasCamera=null;this.oldLensCount=0;if(this.oldLenses)this.oldLenses.length=0;this.lenses.length=0;return;}
    if(f?.active&&f.found){const q=r.final.landmarkPoint,radius=f.r*r.camera.zoom;q.x=(f.x-r.camera.x)*r.camera.zoom+r.w/2;q.y=((f.y-r.camera.y)*(r.tilt||1)-(r.camera.z||0)*.7)*r.camera.zoom+r.h/2;if(q.x+radius*7>0&&q.x-radius*7<r.w&&q.y+radius*7>0&&q.y-radius*7<r.h){const l=this.finalLens||(this.finalLens={x:0,y:0,r:0,final:true});l.x=q.x;l.y=q.y;l.r=radius;this.lenses.push(l);}}
    let moved=this.lenses.length!==(this.oldLensCount||0);for(let i=0;i<this.lenses.length;i++){const l=this.lenses[i],o=this.oldLenses?.[i];if(!o||Math.hypot(l.x-o.x,l.y-o.y)>1.5||Math.abs(l.r-o.r)>.7)moved=true;}
    if(moved)this.gasCamera=null;this.oldLenses=this.oldLenses||[];for(let i=0;i<this.lenses.length;i++){const target=this.oldLenses[i]||(this.oldLenses[i]={});target.x=this.lenses[i].x;target.y=this.lenses[i].y;target.r=this.lenses[i].r;}this.oldLenses.length=this.lenses.length;this.oldLensCount=this.lenses.length;
  };
  A.CosmicRenderer.prototype.warp=function(q){if(A.Save.data.settings.shaderMode==='off'||A.Save.data.settings.finalLensing===false)return q;
    for(const l of this.lenses){const dx=q.x-l.x,dy=q.y-l.y,d=Math.hypot(dx,dy),range=l.r*7;if(d<.001||d>=range)continue;
      const beta=d/Math.max(l.r*1.65,.001),theta=(beta+Math.sqrt(beta*beta+4))/2,k=(theta/beta-1)*(1-d/range)**2;q.x+=dx*k;q.y+=dy*k;}return q;};

})(window.AC);
