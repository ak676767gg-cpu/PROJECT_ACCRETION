'use strict';
(function(A){
  const $=id=>document.getElementById(id),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  A.ORBIT_HELP={FLYBY:'The current path is unbound. A passing body may bend around you and leave.',CAPTURE:'Bound for now. Several seconds of a surface-clearing path establish stability.','STABLE ORBIT':'A bound, surface-clearing orbit has remained within the gravity well. Strong encounters can still disturb it.',COLLISION:'The predicted closest approach crosses the parent body. Change the trajectory or prepare for impact.',ESCAPE:'The body has left its previous gravitational binding.','UNSTABLE ORBIT':'An eccentric path or another gravity well threatens this orbit.',ACCRETION:'Angular momentum is draining. Matter is moving toward its parent.',disk:'Disk mass is captured matter currently rotating outside the inner boundary. It has not yet increased your mass.',captured:'Captured matter includes rotating disk material and incoming or plunging streams. Rivals can strip exposed matter.',rate:'Only matter crossing the inner boundary increases your mass. This rate is a percentage of your current simulation mass per second.',radius:'Your gravity radius marks the approximate reach of local gravitational influence.'};
  const action=A.UI.prototype.action;
  A.UI.prototype.action=function(a){const g=this.game;
    if(a.startsWith('system-tab:')){this.systemMode=['matter','blueprints'].includes(a.slice(11))?a.slice(11):'worlds';this.system();return;}
    if(a.startsWith('term:')){this.teach(a.slice(5),true);return;}
    if(a==='system'){this.system();return;}
    if(a==='overview'){g.systemView=!g.systemView;return;}
    if(a.startsWith('body:')){g.selectedBody=Number(a.slice(5));this.system();return;}
    if(a==='collapse'){g.cosmic.collapse(g.selectedBody);this.system();return;}
    action.call(this,a);
  };
  A.UI.prototype.teach=function(code,force=false){
    if(!A.ORBIT_HELP[code])return;const seen=A.Save.data.hintsSeen||=[];
    this.hintQueue||=[];
    if(!force&&(seen.includes(code)||this.hintQueue.includes(code)))return;
    if(force){this.hintQueue.unshift(code);this.hintTime=0;}else this.hintQueue.push(code);
  };
  A.UI.prototype.system=function(){
    const g=this.game,p=g.player;if(!p||A.scaleStage(p)<9||['menu','over'].includes(g.state))return;
    const u=g.cosmic,s=u.summary,b=u.byId.get(g.selectedBody),o=b?.orbit;
    $('system-summary').innerHTML='<span>'+s.bound+' bound bodies</span><span>'+Math.round(s.stability*100)+'% stable</span><span class="'+(s.atRisk?'risk-text':'')+'">'+(s.atRisk||0)+' at risk</span><span>'+esc(A.formatKg(s.mass))+' orbiting</span>';
    const rows=u.members.slice();if(b&&!rows.includes(b))rows.push(b);
    rows.sort((a,b)=>(a.risk==='EJECTION'||a.risk==='COLLISION'?-1:0)-(b.risk==='EJECTION'||b.risk==='COLLISION'?-1:0)||b.m-a.m);
    const label=(body,i)=>body.name||(body.parentId!==u.root(body)?.id?'Moon ':'World ')+(i+1);
    const entry=(body,i,moon)=>{
      const risk=body.risk==='EJECTION'||body.risk==='COLLISION',owner=u.root(body),foreign=owner&&owner!==p,parent=u.byId.get(body.parentId);
      return '<button class="system-body '+(moon?'is-moon ':'')+(body.id===g.selectedBody?'selected ':'')+(risk?'at-risk':'')+'" data-action="body:'+body.id+'" aria-pressed="'+(body.id===g.selectedBody)+'" title="'+esc(A.ORBIT_HELP[body.orbitState]||'')+'"><span>'+(moon?'<i class="moon-branch" aria-hidden="true">→</i>':'')+esc(label(body,i))+' <i class="orbit-status">'+(risk?'△ '+body.risk:foreign?'RIVAL':'●')+'</i></span><small>'+esc(A.massText(body.m))+' · '+esc(body.orbitState)+'</small><small>'+esc(foreign?(owner.name||'Rival')+' system':parent===p?'Your primary orbit':parent?.name||'Moon orbit')+'</small></button>';
    };
    // Moons render indented beneath their parent so the hierarchy reads without selecting each body.
    const index=new Map(rows.map((body,i)=>[body.id,i])),placed=new Set(),html=[];
    for(const body of rows){
      if(placed.has(body.id))continue;
      const parent=u.byId.get(body.parentId);
      if(parent&&parent!==p&&index.has(parent.id))continue; // emitted under its parent below
      placed.add(body.id);html.push(entry(body,index.get(body.id),false));
      for(const moon of rows){
        if(placed.has(moon.id)||moon.parentId!==body.id)continue;
        placed.add(moon.id);html.push(entry(moon,index.get(moon.id),true));
      }
    }
    for(const body of rows)if(!placed.has(body.id)){placed.add(body.id);html.push(entry(body,index.get(body.id),false));}
    $('system-list').innerHTML=html.join('')||'<p class="subtle">No bound bodies yet. Coast near drifting worlds or a dust cloud. A little sideways momentum can turn a passing encounter into an orbit.</p>';
    const owner=b&&u.root(b),owned=u.members.includes(b),parent=b&&u.byId.get(b.parentId),profile=u.profile(p);
    $('system-inspect').innerHTML=b&&o?'<div class="eyebrow">'+esc(owned?'YOUR SYSTEM':owner?.name||'PASSING BODY')+'</div><h3>'+esc(b.name||A.classFor(b.m).name)+'</h3><p class="orbit-class '+(b.risk!=='CLEAR'?'risk-text':'')+'">'+esc(b.orbitState)+'</p><p class="subtle">'+esc(A.ORBIT_HELP[b.orbitState]||'')+'</p><dl><dt>Mass</dt><dd>'+esc(A.massText(b.m))+'</dd><dt>Parent</dt><dd>'+esc(parent===p?'You':parent?.name||'Unbound')+'</dd><dt>Distance</dt><dd>'+(o.d/A.unit(p.m)).toFixed(1)+' u</dd><dt>Relative speed</dt><dd>'+(o.speed/A.unit(p.m)).toFixed(1)+' u/s</dd><dt>Eccentricity</dt><dd>'+o.e.toFixed(3)+'</dd><dt>Inclination</dt><dd>'+(o.inclination*180/Math.PI).toFixed(1)+'°</dd><dt>Moons</dt><dd>'+u.allMembers.filter(q=>q.parentId===b.id).length+'</dd></dl>'+(owned?'<button class="secondary" data-action="collapse">'+(b.collapse?'Release collapse':'Collapse orbit')+'</button><p class="subtle">Consume this mass over time, or preserve it for mature-system bonuses. Releasing collapse does not restore its earlier orbit.</p>':'<p class="subtle">You can inspect this body, but only your own orbits can be collapsed.</p>'):'<div class="orbit-empty">◎</div><p>Select a world to inspect its path. Amber warns of ejection risk; coral marks a predicted collision.</p><p class="subtle">Mature system: gravity +'+Math.round(profile.gravity*100)+'% · survey +'+Math.round(profile.survey*100)+'% · gas intake +'+Math.round(profile.intake*100)+'%. Bonuses build over thirty quiet seconds and fade when the system is disturbed.</p>';
    this.systemMode||=A.scaleStage(p)>=15?'matter':'worlds';const matter=this.systemMode==='matter';$('system-worlds').hidden=this.systemMode!=='worlds';$('system-blueprints').hidden=this.systemMode!=='blueprints';$('system-tab-blueprints').setAttribute('aria-pressed',String(this.systemMode==='blueprints'));$('system-matter').hidden=!matter;
    $('system-tab-worlds').setAttribute('aria-pressed',String(this.systemMode==='worlds'));$('system-tab-matter').setAttribute('aria-pressed',String(matter));
    this.matterView();this.drawSystemDiagram();this.showPanel('system',false);
  };
  A.UI.prototype.matterView=function(){const g=this.game,u=g.cosmic,p=g.player,total=u.capturedMass||0,feed=u.feedingMass||0,disk=u.diskMass||0,incoming=u.incomingMass||0,capacity=p.m*(.45+.2*g.upgrades.get('disk'));
    const columns=[['Incoming streams',incoming,'Bound matter is still travelling. A rival or escape trajectory can take it away.','#96b8c6'],['Rotating disk',disk,'Stored mass retains orbital motion. It becomes yours only after inward transport.','#d3b889'],['Inner flow',feed,'Matter has reached the assimilation region. Credit is gradual, not an instant pickup.','#c0dfb1']];
    $('system-matter').innerHTML='<div class="matter-columns">'+columns.map(([title,mass,note])=>'<article><h3>'+title+'</h3><strong>'+esc(A.massText(mass))+'</strong><p>'+note+'</p></article>').join('')+'</div><div class="matter-flow" aria-label="Captured mass distribution">'+columns.map(([,mass])=>'<i style="width:'+(total?mass/total*100:0).toFixed(2)+'%"></i>').join('')+'</div><p class="matter-ledger">Assimilation <b>'+(u.rate/p.m*100).toFixed(3)+'% / s</b> · stored <b>'+((total/p.m)*100).toFixed(2)+'%</b> of your mass · gas capacity <b>'+Math.round(Math.min(1,total/capacity)*100)+'%</b><br>'+(total&&u.rate>p.m*.000001?'At the current inward rate: approximately '+A.timeText(total/u.rate)+' to process the stored mass. The rate changes as streams settle.':total?'Waiting for matter to reach and settle in the inner flow.':'No captured matter. Approach a finite cloud or intercept a smaller body.')+'</p><p class="subtle">'+(A.scaleStage(p)>=15?'Black-hole matter settles for at least six simulated seconds before credit, then drains over time. Inner flow resists your propulsion; the exposed outer disk can still be stripped.':'Preserved worlds do not add immediate body mass. A mature system improves gravity, survey range and gas intake; collapse a selected orbit when you need its mass instead.')+'</p>';
  };
  A.UI.prototype.drawSystemDiagram=function(){
    const g=this.game,u=g.cosmic,p=g.player,canvas=$('system-diagram'),c=canvas.getContext('2d'),w=canvas.width,h=canvas.height,matter=this.systemMode==='matter',range=Math.max(p.r*14,Math.min(u.radius||400*A.unit(p.m),1400*A.unit(p.m))),scale=(h-32)/(range*2),project=(x,y,z=0)=>({x:w/2+(x-p.x)*scale,y:h/2+((y-p.y)*.72+(z-(p.z||0))*.45)*scale});
    const palette=A.themePalette();c.fillStyle=palette.bg;c.fillRect(0,0,w,h);c.strokeStyle=palette.raised;c.lineWidth=.7;c.beginPath();c.moveTo(0,h/2);c.lineTo(w,h/2);c.moveTo(w/2,0);c.lineTo(w/2,h);c.stroke();this.systemDiagramPoints=[];
    if(matter){for(const q of u.packets){if(q.owner!==p.id)continue;const pos=project(q.x,q.y,q.z);c.strokeStyle=q.feeding?'#c0dfb1':q.inDisk?'#d3b889':'#96b8c6';c.globalAlpha=.45;c.beginPath();for(let i=0;i<q.trail.length;i+=2){const t=q.trail[i],v=project(t.x,t.y,t.z);if(i)c.lineTo(v.x,v.y);else c.moveTo(v.x,v.y);}c.stroke();c.globalAlpha=.85;c.fillStyle=c.strokeStyle;c.fillRect(pos.x-1,pos.y-1,2,2);}}
    else{const chosen=u.byId.get(g.selectedBody),rows=u.members.slice(0,72);if(chosen&&!rows.includes(chosen))rows.push(chosen);
      for(const b of rows){const o=b.orbit,parent=u.byId.get(b.parentId);if(!o||!parent||!Number.isFinite(o.apo))continue;c.strokeStyle=b.risk==='COLLISION'?'#ef977d':b.risk==='EJECTION'?'#e5bc79':b.orbitStable?'#9ecfba':'#8caaa1';c.globalAlpha=b.id===g.selectedBody?.7:.24;c.lineWidth=.8;c.setLineDash(b.risk!=='CLEAR'?[3,5]:[]);c.beginPath();for(let i=0;i<=48;i++){const a=i*A.TAU/48,cs=Math.cos(a),sn=Math.sin(a),d=o.h*o.h/o.mu/(1+o.e*cs),q=project(parent.x+d*(o.u[0]*cs+o.tangent[0]*sn),parent.y+d*(o.u[1]*cs+o.tangent[1]*sn),(parent.z||0)+d*(o.u[2]*cs+o.tangent[2]*sn));if(i)c.lineTo(q.x,q.y);else c.moveTo(q.x,q.y);}c.stroke();c.setLineDash([]);const q=project(b.x,b.y,b.z);if(q.x<-10||q.x>w+10||q.y<-10||q.y>h+10)continue;this.systemDiagramPoints.push({id:b.id,...q});c.globalAlpha=1;c.fillStyle=c.strokeStyle;c.beginPath();c.arc(q.x,q.y,b.parentId===p.id?3:1.6,0,A.TAU);c.fill();if(b.id===g.selectedBody){c.strokeRect(q.x-7,q.y-7,14,14);c.font='9px monospace';c.fillText((b.name||'Selected world').slice(0,22),q.x+11,q.y-8);}}
    }
    c.globalAlpha=1;const star=project(p.x,p.y,p.z);c.fillStyle=A.scaleStage(p)>=15?'#000205':A.appearance(p).color;c.beginPath();c.arc(star.x,star.y,Math.max(4,p.r*scale),0,A.TAU);c.fill();c.strokeStyle=palette.gold;c.lineWidth=1;c.stroke();c.font='9px monospace';c.fillStyle=palette.muted;c.fillText('YOU',star.x+Math.max(4,p.r*scale)+8,star.y+3);
    $('system-diagram-caption').textContent=matter?'Actual parcel positions: blue incoming, amber rotating, green inner flow. Only green matter can increase your body mass.':'Current positions and cached orbital paths. Click a world to inspect it. Dashed amber or coral paths are at risk.';
  };
  const update=A.UI.prototype.update;
  A.UI.prototype.update=function(dt){
    update.call(this,dt);const g=this.game,p=g.player,show=p&&A.scaleStage(p)>=9&&!['menu','over'].includes(g.state);$('cosmic-hud').hidden=!show;if(!show){$('cosmic-tip').hidden=true;return;}
    if(g.state==='playing')this.hintTime=Math.max(0,(this.hintTime||0)-dt);
    if(!this.hintTime&&this.hintQueue?.length){const code=this.hintQueue.shift();$('cosmic-tip-title').textContent=code.toUpperCase();$('cosmic-tip-text').textContent=A.ORBIT_HELP[code];$('cosmic-tip').hidden=false;this.hintTime=9;const seen=A.Save.data.hintsSeen||=[];if(!seen.includes(code)){seen.push(code);A.Save.write();}}
    else if(!this.hintTime)$('cosmic-tip').hidden=true;
    this.cosmicIn=(this.cosmicIn||0)-dt;if(this.cosmicIn>0)return;this.cosmicIn=.3;
    const bh=A.scaleStage(p)>=15,u=g.cosmic,s=u.summary,capacity=p.m*(.45+.2*g.upgrades.get('disk'));
    $('cosmic-title').textContent=bh?'ACCRETION OBSERVATORY':'STAR SYSTEM';
    const term=(label,key)=>'<button class="term-button" data-action="term:'+key+'" title="'+esc(A.ORBIT_HELP[key])+'">'+label+' <small>?</small></button>';
    const rows=bh?[[term('Captured matter','captured'),A.massText(u.capturedMass)],[term('Rotating disk','disk'),A.massText(u.diskMass)],[term('Inner flow','rate'),(u.rate/p.m*100).toFixed(3)+'% / s'],[term('Gravity radius','radius'),Math.round(A.Physics.influence(g,p)/A.unit(p.m))+' u'],['Intake capacity',Math.round(Math.min(1,u.capturedMass/capacity)*100)+'%']]:[['Bound / companions',s.bound+' / '+s.companions],['Planets / moons',s.planets+' / '+s.moons],['Dwarfs / belts',s.dwarfs+' / '+u.belts.length],['At risk',s.atRisk||0],['Stable orbits',Math.round(s.stability*100)+'%']];
    $('cosmic-metrics').innerHTML=rows.map(([k,v])=>'<div><span>'+k+'</span><b>'+esc(v)+'</b></div>').join('');
    $('cosmic-hud').classList.toggle('system-danger',!!s.atRisk);
    const foreign=u.allMembers.find(q=>{const o=u.root(q);return o&&o!==p&&Math.hypot(q.x-p.x,q.y-p.y)<1400*A.unit(p.m);});
    const foreignOwner=foreign&&u.root(foreign);
    $('cosmic-note').textContent=bh?u.regionName+' · nearby gas '+(u.density*100).toFixed(1)+'%':s.atRisk?'△ Orbits disturbed · L to inspect':foreignOwner?'Nearby world held by '+(foreignOwner.name||'a rival'):u.bonus?'Mature system · gravity +'+Math.round(u.bonus*100)+'%':'Coast to preserve orbits · O paths · C collapse';
    if(bh){this.teach('captured');this.teach('rate');this.teach('radius');}
    $('guide-text').innerHTML=bh?'Exposed disk matter can be stolen.<br>Follow rich gas streams; keep rival horizons at a distance.':'Your rivals can build systems too.<br>Tab surveys nearby orbits. L inspects captured worlds.';
  };
})(window.AC);
