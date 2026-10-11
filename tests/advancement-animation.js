'use strict';
(function(A){
  const $=id=>document.getElementById(id),settings={reducedMotion:false,achievementPosition:'top'},plaque=$('advancement-plaque');
  // This isolated page never loads Save, Game, Audio or any gameplay state.
  // The stub supplies only the settings read by the production paint method.
  A.Save={data:{settings}};
  const painter={activeAchievement:null,plaquePaint:null},paint=()=>A.UI.prototype.paintAchievementPlaque.call(painter);
  let last=0,paused=false,lastPhase='';
  function play(type){
    const title={task:'First Capture',goal:'Keeper of Worlds',challenge:'Two Horizons, One'}[type];
    const description={task:'Absorb your first asteroid.',goal:'Maintain three stable planets for twelve seconds.',challenge:'Accrete at least half of a captured black hole.'}[type];
    painter.activeAchievement={age:0,duration:type==='challenge'?6.3:type==='goal'?5.5:4.8,systemReduced:!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches};
    painter.plaquePaint=null;paused=false;lastPhase='';plaque.className='advancement-plaque plaque-'+type+(settings.achievementPosition==='bottom'?' plaque-bottom':'');
    $('advancement-plaque-icon').innerHTML=A.achievementIcon({task:'rock',goal:'system',challenge:'binary'}[type]);
    $('advancement-plaque-kind').textContent={task:'ADVANCEMENT MADE',goal:'GOAL ACHIEVED',challenge:'CHALLENGE COMPLETE'}[type];
    $('advancement-plaque-title').textContent=title;$('advancement-plaque-description').textContent=description;plaque.hidden=false;paint();
    $('preview-pause').disabled=false;$('preview-pause').textContent='Pause';$('preview-state').textContent='Playing the '+type+' reveal.';
  }
  document.addEventListener('click',e=>{const button=e.target.closest('[data-preview]');if(button)play(button.dataset.preview);});
  $('preview-pause').addEventListener('click',()=>{paused=!paused;$('preview-pause').textContent=paused?'Resume':'Pause';$('preview-state').textContent=paused?'Paused at the current reveal phase.':'Resumed from the same phase.';});
  $('preview-position').addEventListener('change',()=>{settings.achievementPosition=$('preview-position').value;plaque.classList.toggle('plaque-bottom',settings.achievementPosition==='bottom');paint();});
  $('preview-reduced').addEventListener('change',()=>{settings.reducedMotion=$('preview-reduced').checked;paint();});
  function frame(time){
    const dt=last?Math.max(0,Math.min(.08,(time-last)/1000)):0;last=time;
    const notice=painter.activeAchievement;
    if(notice&&!paused&&!document.hidden){notice.age+=dt;if(notice.age>=notice.duration){plaque.hidden=true;painter.activeAchievement=null;$('preview-pause').disabled=true;$('preview-state').textContent='Finished. Replay any plaque above.';}else{paint();if(lastPhase!==plaque.dataset.phase){lastPhase=plaque.dataset.phase;$('preview-state').textContent='Preview phase: '+lastPhase+'.';}}}
    requestAnimationFrame(frame);
  }
  play('challenge');requestAnimationFrame(frame);
})(window.AC);
