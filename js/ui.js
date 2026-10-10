'use strict';
(function (A) {
  const $ = id => document.getElementById(id);
  const escape = str => String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  A.achievementIcon=icon=>{
    const paths={
      rock:'<path d="M13 9 29 7 39 18 35 34 19 40 8 28Z" fill="#899d98"/><path d="m13 9 8 13 18-4M8 28l13-6 14 12M21 22l-2 18"/>',
      fragments:'<path d="m11 8 11 3 4 10-10 6-10-8Zm20 17 9 4-3 11-11-4ZM29 7l7-2 5 9-8 5Z" fill="#8d9c94"/>',
      moon:'<path d="M30 7a17 17 0 1 0 11 27A18 18 0 0 1 30 7Z" fill="#dedcc3"/><circle cx="15" cy="22" r="3"/><circle cx="23" cy="34" r="2"/>',
      planet:'<circle cx="24" cy="24" r="16" fill="#73aab0"/><path d="m14 12 4 7-4 6 5 5-1 9m12-29-5 9 4 5 8 1-5 8" stroke="#d9d8ab" stroke-width="4"/>',
      gas:'<circle cx="24" cy="24" r="15" fill="#c4a071"/><path d="M11 16c9 5 18-4 27 1M9 23c9 5 22-3 30 1m-28 7c9-4 18 4 26 0" stroke="#f2d6a3" stroke-width="3"/><ellipse cx="24" cy="25" rx="23" ry="8" transform="rotate(-22 24 25)"/>',
      ember:'<circle cx="24" cy="24" r="14" fill="#b9724e"/><path d="M14 18c8-5 13 4 21-1m-23 8c8-3 14 4 25-1m-21 8c6-3 10 1 17 0" stroke="#f0c98f"/>',
      star:'<path d="m24 3 5 14 14 7-14 5-5 16-6-16-15-5 15-7Z" fill="#e6c47e"/><circle cx="24" cy="24" r="7" fill="#fff4cc"/>',
      sun:'<circle cx="24" cy="24" r="11" fill="#f4d994"/><path d="M24 2v7m0 30v7M2 24h7m30 0h7M8 8l5 5m22 22 5 5M8 40l5-5m22-22 5-5"/>',
      horizon:'<ellipse cx="24" cy="25" rx="22" ry="8" transform="rotate(-18 24 25)"/><circle cx="24" cy="24" r="12" fill="#111b23"/><path d="M14 16a12 12 0 0 1 21 12M13 29a12 12 0 0 0 17 6" stroke="#ffe3a2" stroke-width="3"/><path d="M4 30c12-10 27 2 39-8" stroke="#efd8a7" stroke-width="3"/>',
      orbit:'<circle cx="23" cy="25" r="7" fill="#ddc78b"/><ellipse cx="24" cy="24" rx="21" ry="13" transform="rotate(-28 24 24)"/><circle cx="36" cy="11" r="4" fill="#83c3bb"/>',
      system:'<circle cx="23" cy="24" r="5" fill="#eaca81"/><circle cx="23" cy="24" r="12"/><ellipse cx="23" cy="24" rx="22" ry="17"/><circle cx="30" cy="14" r="3" fill="#8bc3c2"/><circle cx="7" cy="35" r="4" fill="#c8c2a9"/>',
      gravity:'<path d="M3 14c8 0 12 5 21 17 8-12 12-17 21-17M3 22c8 0 12 5 21 17 8-12 12-17 21-17M3 6c8 0 12 5 21 17C32 11 36 6 45 6"/><circle cx="24" cy="31" r="4" fill="#cfbe8f"/>',
      escape:'<path d="M8 35c4-19 17-27 31-19M32 9l9 7-10 5M7 41l6-1"/><circle cx="15" cy="26" r="6" fill="#bfcbbd"/>',
      shield:'<path d="m24 5 16 7v14c-2 8-7 13-16 17-9-4-14-9-16-17V12Z" fill="#3b625a"/><path d="m16 24 6 6 11-13" stroke="#d9e4c8" stroke-width="3"/>',
      comet:'<path d="M26 24 42 6M20 21 29 6M29 29l13-10"/><path d="M7 29c-4 13 13 20 21 10 9-12-13-23-21-10Z" fill="#b9d9d4"/>',
      belt:'<circle cx="24" cy="24" r="6" fill="#ddc186"/><ellipse cx="24" cy="24" rx="21" ry="14" stroke-dasharray="2 5" stroke-width="4"/><ellipse cx="24" cy="24" rx="16" ry="10" stroke-dasharray="1 5"/>',
      resonance:'<path d="M3 26c6-24 14 24 20 0s14 24 22 0M3 18c11-20 31 20 42 0"/><circle cx="23" cy="26" r="3" fill="#e2cd95"/>',
      disk:'<ellipse cx="24" cy="26" rx="22" ry="15"/><ellipse cx="24" cy="26" rx="16" ry="10"/><path d="M8 25c7-10 16 2 28-8m-20 23c8-8 19-2 23-11" stroke="#e8c68c" stroke-width="3"/><circle cx="24" cy="26" r="6" fill="#d4c198"/>',
      binary:'<ellipse cx="24" cy="24" rx="22" ry="15" transform="rotate(-24 24 24)"/><circle cx="15" cy="29" r="8" fill="#111b23"/><circle cx="33" cy="18" r="9" fill="#111b23"/><path d="M8 29a7 7 0 0 1 12-5m5-6a8 8 0 0 1 15 0" stroke="#e9cf8d" stroke-width="3"/>',
      dna:'<path d="M14 5c28 13-8 25 20 38M34 5C6 18 42 30 14 43" stroke-width="3"/><path d="M16 9h16m-17 8h18m-15 7h12m-15 7h18m-17 8h16" stroke="#8bc9c2"/>',
      pet:'<path d="m13 15-3-10 12 6m13 4 3-10-12 6" fill="#b7cdb7"/><path d="M9 27C8 9 39 8 39 27c0 17-29 17-30 0Z" fill="#87b9ad"/><path d="m19 31 5 4 5-4"/><circle cx="17" cy="24" r="3" fill="#182822"/><circle cx="31" cy="24" r="3" fill="#182822"/>',
      chart:'<path d="m5 10 12-4 14 6 12-6v32l-12 4-14-6-12 6Zm12-4v30m14-24v30" fill="#34554f"/><path d="m10 30 11-14 13 12 5-9" stroke="#ebd493" stroke-dasharray="3 3"/><circle cx="21" cy="16" r="3" fill="#efd296"/>'
    };
    return '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">'+(paths[icon]||paths.star)+'</svg>';
  };
  // The existing UI clock owns every reveal phase. Hiding a notice freezes it,
  // so reopening a menu never restarts an animation or its chime.
  A.advancementMotion=(age,duration,reduced=false)=>{
    const t=Math.max(0,Number.isFinite(age)?age:0),end=Math.max(1.6,Number.isFinite(duration)?duration:4.8);
    const smooth=x=>{const v=A.clamp(x,0,1);return v*v*(3-2*v);};
    if(reduced)return{phase:'hold',opacity:1,panel:1,wash:0,glow:0,copy:1,blur:0,copyY:0,badge:1,badgeScale:1,offset:0,scale:1};
    const enter=smooth(t/.26),leave=smooth((t-(end-.48))/.48),badgeTime=A.clamp((t-.28)/.52,0,1),badge=smooth(badgeTime),copy=smooth((t-.54)/.54);
    return{
      phase:t<.28?'forming':t<.54?'illuminating':t<1.08?'revealing':t<end-.48?'hold':'fading',
      opacity:enter*(1-leave),panel:smooth((t-.08)/.44),
      wash:.72*smooth((t-.12)/.30)*(1-smooth((t-.46)/.56)),
      glow:.24*Math.sin(Math.PI*A.clamp(t/1.08,0,1)),
      copy,blur:3*(1-copy),copyY:3*(1-copy),badge,
      badgeScale:.86+.14*badge+.10*Math.sin(Math.PI*badgeTime),
      offset:-3*(1-enter)-8*leave,scale:.992+.008*enter
    };
  };
  A.UI = class {
    constructor(game) {
      this.game = game; this.panel = null; this.history = []; this.updateIn = 0; this.toastQueue = []; this.lastFocus = null;
      this.achievementBranch='flight';this.achievementFilter='all';this.achievementQuery='';this.selectedAchievement='first';this.resetAchievementNotices();
      document.addEventListener('click', e => { const target = e.target.closest('[data-action]'); if (target) this.action(target.dataset.action); const card = e.target.closest('[data-upgrade]'); if (card) game.upgrades.select(card.dataset.upgrade); });
      for (const key of Object.keys(A.Save.data.settings)) {
        const el = $('setting-' + key); if (!el) continue;
        const event = el.type === 'range' ? 'input' : 'change';
        el.addEventListener(event, () => {
          if(key==='theme'&&!A.themeAvailable(el.value)){el.value=A.interfaceTheme();return;}
          A.Save.data.settings[key] = el.type === 'checkbox' ? el.checked : el.type === 'range' ? Number(el.value) : el.value;
          A.Save.write(); game.audio.setVolume(); this.refreshAudioButton(); if(key==='theme')this.applyTheme();
          if (key === 'quality'){game.renderer.resize();document.body.classList.toggle('performance-mode',A.Save.data.settings.quality==='low');}
          document.body.classList.toggle('reduced-motion', A.Save.data.settings.reducedMotion);
        });
      }
      document.addEventListener('keydown', e => {
        if(e.key==='Enter'&&!e.isComposing&&e.target.id==='pet-nickname'){e.preventDefault();this.action('life:rename');return;}
        if (e.key !== 'Tab' || $('overlay').hidden) return;
        const focusables = Array.from(document.querySelector('.dialog').querySelectorAll('button:not([disabled]),input,select,a[href]')).filter(el => !el.closest('[hidden]'));
        if (!focusables.length) return;
        if (e.shiftKey && (document.activeElement === focusables[0] || document.activeElement.classList.contains('dialog'))) { e.preventDefault(); focusables[focusables.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === focusables[focusables.length - 1]) { e.preventDefault(); focusables[0].focus(); }
      });
      document.body.classList.toggle('reduced-motion', A.Save.data.settings.reducedMotion);
      document.body.classList.toggle('performance-mode',A.Save.data.settings.quality==='low');
      this.applyTheme();this.refreshAudioButton();this.installWorkspace();this.installAchievementControls();
    }
    action(action) {
      const g = this.game; g.audio.start();
      if(action.startsWith('dock-panel:')){this.toggleInstrument(action.slice(11));return;}
      if(action.startsWith('dock-window:')){this.toggleWindow(action.slice(12));return;}
      if(action==='dock-toggle'){this.revealDock(false);return;}
      if(action==='dock-restore'){this.restoreInstruments();return;}
      if(action==='dock-last'){if(this.lastMinimized)this.toggleWindow(this.lastMinimized);return;}
      if(action==='window-minimize'){this.minimizeWindow();return;} if (action !== 'mute') g.audio.play('ui');
      if(action.startsWith('archive-view:')){this.showArchive(action.split(':')[1]);return;}
      if(action.startsWith('achievement-branch:')){const id=action.split(':')[1];if(A.achievementBranches.some(b=>b.id===id)){this.achievementBranch=id;this.achievementQuery='';$('achievement-search').value='';this.selectedAchievement=Object.keys(A.achievementInfo).find(k=>A.achievementInfo[k].branch===id);this.renderAchievements();}return;}
      if(action.startsWith('achievement-filter:')){const id=action.split(':')[1];if(['all','earned','locked'].includes(id)){this.achievementFilter=id;this.renderAchievements();}return;}
      if(action.startsWith('achievement-select:')){const id=action.split(':')[1];if(A.achievementInfo[id]){this.selectedAchievement=id;this.inspectAchievement();for(const n of $('achievements').querySelectorAll('.advancement-node'))n.setAttribute('aria-pressed',String(n.dataset.achievement===id));}return;}
      if(action.startsWith('achievement-follow:')){const id=action.split(':')[1];if(A.achievementInfo[id]){this.achievementBranch=A.achievementInfo[id].branch;this.achievementQuery='';this.achievementFilter='all';$('achievement-search').value='';this.selectedAchievement=id;this.renderAchievements();}return;}
      if(action.startsWith('life:')){const [,verb,id]=action.split(':');if(verb==='tab'){this.labTab=id;this.showLab();return;}if(verb==='spin')g.life.spin();else if(verb==='rename')g.life.rename($('pet-nickname').value);else if(verb==='reset-name')g.life.rename('');else if(verb==='inspect')g.life.inspected=id;else if(verb==='filter')g.life.filter=id;else if(verb==='craft')g.life.craft(id);else if(verb==='hatch'){if(g.life.hatch(id)){this.startHatch(id);return;}}else if(verb==='equip')g.life.equip(id==='none'?null:id);this.showLab();return;}
      if(action.startsWith('slot:')){const id=Number(action.slice(5));if(id!==A.Save.vault.activeSlot||A.Save.mode!=='journey'){g.mainMenu();A.Save.selectSlot(id);g.life=new A.Life(g);this.wheelTime=0;this.wheelResult='';this.wheelAngle=0;this.main();}this.showSlots();return;}
      if(action.startsWith('pet-size:')){A.Save.data.settings.petSize=action.slice(9);A.Save.write();this.showLab();return;}
      switch (action) {
        case 'slots':this.showSlots();break;
        case 'slot-cadence':A.Save.setCadence(!A.Save.slot.everyThree,g);this.showSlots();break;
        case 'save-now':if(A.Save.checkpoint(g,'manual'))this.toast('JOURNEY SAVED','Your current slot is up to date.','aqua');else if(!A.Save.available)this.toast('SAVE UNAVAILABLE','Browser storage could not be written.','gold');if(this.panel==='slots')this.showSlots();break;
        case 'lab':this.showLab();break;
        case 'play': g.start(false); break;
        case 'continue': g.start(true); break;
        case 'pause': g.pause(); break;
        case 'resume': g.resume(); break;
        case 'restart': g.restart(); break;
        case 'main': g.mainMenu(); break;
        case 'settings': this.showSettings(); break;
        case 'help': this.showPanel('help'); break;
        case 'credits': this.showPanel('credits'); break;
        case 'archive': this.showArchive(); break;
        case 'advancements':this.showArchive('advancements');break;
        case 'upgrades': this.showUpgrades(); break;
        case 'back': this.back(); break;
        case 'mute': this.toggleMute(); break;
        case 'pulse': g.pulse(); break;
        case 'surge': g.amplify(); break;
      }
    }
    main() {
      this.resetAchievementNotices();A.Save.checkAdvancements(null,true);
      this.hidePanel(); $('main-menu').hidden = false; $('hud').hidden = true; $('evolution').hidden = true; this.applyHudVisibility();
      const saved = !!A.Save.data.run; $('continue-button').hidden = !saved;
      $('play-button').className = saved ? 'secondary' : 'primary'; $('play-button').innerHTML = saved ? 'New journey' : 'Start new game';
      $('active-slot').textContent='SLOT 0'+(A.Save.vault.activeSlot+1)+' · CHANGE SAVE';
      const d = A.Save.data;
      $('personal-record').textContent = d.bestMass > 1 ? 'PERSONAL RECORD   ' + A.massText(d.bestMass) + '  /  ' + (d.bestClassName||A.classFor(Math.pow(5,d.bestStage)).name) : 'NO SAVED RECORD IN THIS SLOT.';
      if (!A.Save.available) $('personal-record').textContent = 'Browser storage is unavailable. Records will last for this session only.';
    }
    flight() { this.loadWorkspace();this.hintTime=0; this.hintQueue=[]; this.hidePanel(); $('main-menu').hidden = true; $('hud').hidden = false; this.applyHudVisibility(); this.updateIn = 0; document.activeElement?.blur(); }
    showPanel(name, remember = true) {
      const g = this.game;this.revealDock(false);
      if(this.panel==='hatch'&&name!=='hatch')this.hatching=null;
      if (g.state === 'playing') { g.state = 'paused';g.previousFlightStamp=undefined; g.input.clear(); g.audio.setActive(false); A.Save.checkpoint(g); }
      if (remember && this.panel && this.panel !== name) this.history.push(this.panel);
      this.applyHudVisibility();
      this.lastFocus = document.activeElement;
      for (const panel of document.querySelectorAll('.panel')) panel.hidden = true;
      $('panel-' + name).hidden = false; $('overlay').hidden = false; this.panel = name; this.applyTheme();document.querySelector('.dialog').dataset.panel=name;
      document.querySelector('.dialog').setAttribute('aria-label',({supernova:'Evolution paths',galaxy:'Galaxy map',sandbox:'Sandbox experiments',replay:'Encounter replay',photo:'Photo mode',lab:'Companion collection',settings:'Game settings',slots:'Save slots',pause:'Game paused',archive:'Records and achievements',help:'Flight manual',credits:'About ACCRETION',system:'Solar system',cosmetics:'Appearance',legacy:'Expeditions',hatch:'Companion hatching',upgrades:'Adaptations',over:'Journey ended'})[name]||'Game menu');
      document.querySelector('.dialog').classList.toggle('advancement-dialog',name==='archive');
      $('window-minimize').hidden=!g.player||['menu','over'].includes(g.state);$('window-caption').textContent=document.querySelector('.dialog').getAttribute('aria-label');
      document.querySelector('.dialog').scrollTop = 0; document.querySelector('.dialog').focus();
    }
    applyHudVisibility(){const g=this.game,quiet=g.state==='playing'&&!!g.hudHidden;$('hud').hidden=g.state==='menu'||quiet;document.body.classList.toggle('flight-hud-hidden',quiet);}
    toggleHud(){if(this.game.state!=='playing')return;this.game.hudHidden=!this.game.hudHidden;this.applyHudVisibility();}
    hidePanel() { this.hatching=null; $('overlay').hidden = true; this.panel = null; this.history = [];document.querySelector('.dialog').classList.toggle('advancement-dialog',false); }
    back() {
      if (this.history.length) { this.showPanel(this.history.pop(), false); return; }
      if (this.game.state === 'menu') this.hidePanel(); else if (this.game.state === 'over') this.showPanel('over', false); else this.game.resume();
    }
    installWorkspace(){
      this.instrumentNames={mass:'Mass',rivals:'Rivals',radar:'Radar',system:'System',telemetry:'Telemetry',notes:'Flight notes',abilities:'Abilities',final:'Final horizon'};
      this.instrumentKeys=Object.keys(this.instrumentNames);this.hiddenInstruments=new Set();this.lastMinimized=null;this.dockOpen=false;this.dockHover=false;this.dockFocus=false;this.dockKeyboard=true;this.dockPeek=0;this.dockIn=0;
      const dock=$('flight-dock');
      dock.addEventListener('mouseenter',()=>{this.dockHover=true;});
      dock.addEventListener('pointermove',()=>{if(this.dockOpen)this.dockPeek=5;});
      dock.addEventListener('mouseleave',()=>{this.dockHover=false;this.dockPeek=Math.min(this.dockPeek,.65);});
      dock.addEventListener('pointerdown',()=>{this.dockKeyboard=false;this.dockFocus=false;if(this.dockOpen)this.dockPeek=5;});
      dock.addEventListener('keydown',e=>{if(this.dockOpen)this.dockPeek=5;if(e.code==='Tab'){this.dockKeyboard=true;this.dockFocus=true;}});
      dock.addEventListener('focusin',()=>{this.dockFocus=this.dockKeyboard&&this.dockOpen;if(this.dockOpen)this.dockPeek=5;});
      dock.addEventListener('focusout',e=>{if(!dock.contains(e.relatedTarget)){this.dockFocus=false;this.dockPeek=Math.min(this.dockPeek,.65);}});
      this.loadWorkspace();
    }
    loadWorkspace(){
      this.hiddenInstruments=new Set(A.Save.data.workspace.hiddenPanels);
      for(const id of this.instrumentKeys)$(id==='system'?'cosmic-hud':id==='notes'?'flight-guide':'hud-panel-'+id).classList.toggle('panel-minimized',this.hiddenInstruments.has(id));
      this.dockIn=0;
    }
    toggleInstrument(id){
      if(!this.instrumentKeys.includes(id)||!this.game.player)return false;
      if(this.hiddenInstruments.has(id))this.hiddenInstruments.delete(id);else this.hiddenInstruments.add(id);
      $(id==='system'?'cosmic-hud':id==='notes'?'flight-guide':'hud-panel-'+id).classList.toggle('panel-minimized',this.hiddenInstruments.has(id));
      A.Save.data.workspace.hiddenPanels=[...this.hiddenInstruments];A.Save.write();this.dockIn=0;return true;
    }
    restoreInstruments(){
      this.hiddenInstruments.clear();A.Save.data.workspace.hiddenPanels=[];
      for(const id of this.instrumentKeys)$(id==='system'?'cosmic-hud':id==='notes'?'flight-guide':'hud-panel-'+id).classList.toggle('panel-minimized',false);
      this.game.hudHidden=false;this.applyHudVisibility();A.Save.write();this.dockIn=0;
    }
    minimizeWindow(){
      const g=this.game,name=this.panel;if(!name||!g.player||['menu','over'].includes(g.state))return false;
      this.lastMinimized=name==='hatch'?'lab':name;if(name==='hatch')this.labTab='collection';g.photo?.exit();this.hidePanel();g.resume();this.dockIn=0;return true;
    }
    toggleWindow(name){
      const g=this.game;if(!g.player||['menu','over'].includes(g.state))return false;
      if(name==='system'&&A.scaleStage(g.player)<9)return false;
      if(name==='sandbox'&&A.Save.mode!=='sandbox')return false;
      if(this.panel===name)return this.minimizeWindow();
      const actions={supernova:'supernova',lab:'lab',system:'system',galaxy:'galaxy',upgrades:'upgrades',replay:'replay',photo:'photo',settings:'settings',help:'help',archive:'archive',credits:'credits',slots:'slots',cosmetics:'cosmetics',legacy:'legacy',sandbox:'sandbox'};
      if(name==='pause'){this.showPanel('pause',false);return true;}
      if(!actions[name])return false;
      if(this.lastMinimized===name)this.lastMinimized=null;
      this.history=[];this.action(actions[name]);this.dockIn=0;return true;
    }
    revealDock(open=true){
      this.dockOpen=!!open;this.dockPeek=open?5:0;
      $('flight-dock').inert=!this.dockOpen;$('flight-dock').setAttribute('aria-hidden',String(!this.dockOpen));
      if(!open)$('dock-instruments').open=false;
      if(!open&&$('flight-dock').contains(document.activeElement)){this.dockFocus=false;document.activeElement.blur();}
      $('flight-dock').classList.toggle('dock-expanded',this.dockOpen);$('dock-handle').setAttribute('aria-expanded',String(this.dockOpen));
      // F is the only opening path. The invisible shelf cannot take pointer or keyboard focus.
      $('dock-content').hidden=false;$('dock-content').inert=!this.dockOpen;
      $('dock-content').setAttribute('aria-hidden',String(!this.dockOpen));
    }
    handleWorkspaceKey(e){
      const g=this.game;if(!g.player||!['playing','paused','upgrade'].includes(g.state)||e.ctrlKey||e.altKey||e.metaKey)return false;
      const digit=this.instrumentKeys[Number(e.code.replace('Digit',''))-1];
      if(g.state==='playing'&&e.code.startsWith('Digit')&&digit){e.preventDefault();if(!e.repeat)this.toggleInstrument(digit);return true;}
      if(e.code==='Backquote'){e.preventDefault();if(!e.repeat)this.minimizeWindow();return true;}
      if(e.code==='Escape'&&this.dockOpen){e.preventDefault();this.revealDock(false);return true;}
      if(e.code==='KeyF'){e.preventDefault();if(!e.repeat){if(this.panel)this.minimizeWindow();this.dockKeyboard=true;this.revealDock(!this.dockOpen);if(this.dockOpen)$('dock-handle').focus();}return true;}
      if(e.code==='KeyJ'){e.preventDefault();if(!e.repeat){if(this.panel==='archive'&&this.archiveView==='advancements')this.minimizeWindow();else this.action('advancements');}return true;}
      const windowKeys={KeyN:'lab',KeyL:'system',KeyG:'galaxy',KeyU:'upgrades',KeyV:'replay',KeyP:'photo',KeyB:'sandbox'};
      if(windowKeys[e.code]){if(windowKeys[e.code]==='system'&&A.scaleStage(g.player)<9||windowKeys[e.code]==='sandbox'&&A.Save.mode!=='sandbox')return false;e.preventDefault();if(!e.repeat)this.toggleWindow(windowKeys[e.code]);return true;}
      return false;
    }
    updateWorkspace(dt){
      const g=this.game,live=!!g.player&&g.state==='playing'&&!g.photo?.active;
      $('flight-dock').hidden=!live;if(!live){this.dockHover=false;this.dockFocus=false;if(this.dockOpen)this.revealDock(false);return;}
      $('dock-content').hidden=false;$('dock-content').inert=!this.dockOpen;
      if(this.dockOpen){this.dockPeek-=dt;if(this.dockPeek<=0)this.revealDock(false);}
      this.dockIn-=dt;if(this.dockIn>0)return;this.dockIn=.15;
      for(const id of this.instrumentKeys){const visible=!this.hiddenInstruments.has(id),button=$('dock-panel-'+id);button.setAttribute('aria-pressed',String(visible));$('dock-state-'+id).textContent=visible?'Shown':'Hidden';if(id==='system')button.disabled=A.scaleStage(g.player)<9;}
      $('dock-window-system').disabled=A.scaleStage(g.player)<9;$('dock-window-sandbox').hidden=A.Save.mode!=='sandbox';
      $('dock-last').hidden=!this.lastMinimized;$('dock-last-name').textContent=this.lastMinimized?({lab:'Life Lab',help:'Flight manual',slots:'Save slots',system:'Solar system',cosmetics:'Appearance',legacy:'Expeditions',hatch:'Companion hatching',upgrades:'Adaptations',galaxy:'Galaxy map',replay:'Replay',photo:'Photo mode',pause:'Pause menu',settings:'Settings',archive:'Archive',credits:'Credits',cosmetics:'Appearance',legacy:'Expeditions',hatch:'Hatching',sandbox:'Sandbox',supernova:'Evolution paths'})[this.lastMinimized]||this.lastMinimized:'';
      $('dock-quiet').textContent=g.hudHidden?'HUD hidden · H restores it':'F closes · hides after 5 seconds idle';
    }
    applyTheme() {
      const p=A.themePalette(),rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)).join(',');
      document.body.dataset.theme=A.interfaceTheme();
      for(const key of ['bg','surface','raised','text','muted','accent','gold','frame','frameInk'])document.body.style.setProperty('--'+key,p[key]);
      for(const key of ['surface','raised','accent','muted','gold'])document.body.style.setProperty('--'+key+'-rgb',rgb(p[key]));
      document.body.style.setProperty('--aqua',p.accent);
      document.body.style.setProperty('--line','rgba('+rgb(p.muted)+',.24)');
      document.body.style.setProperty('--panel','rgba('+rgb(p.surface)+',.9)');
      $('theme-title').textContent=p.name;$('theme-description').textContent=p.note;
    }
    showSettings() {
      $('setting-theme').innerHTML=Object.entries(A.THEMES).map(([id,q])=>{const ready=A.themeAvailable(id),reward=A.COSMETICS.frame.find(c=>c.id===id);return '<option value="'+id+'"'+(!ready?' disabled':'')+'>'+q.name+(!ready?' · Earn '+(reward.achievement?A.achievementDefs[reward.achievement][0]:'expedition rank '+reward.rank):'')+'</option>';}).join('');
      this.applyTheme();
      for (const [key, value] of Object.entries(A.Save.data.settings)) { const el = $('setting-' + key); if (el) { if (el.type === 'checkbox') el.checked = value; else el.value = value; } }
      this.showPanel('settings');
    }
    showUpgrades() {
      const g = this.game; if (!g.player || g.state === 'menu' || g.state === 'over') return;
      const u = g.upgrades, choices = u.points > 0 ? (u.choices.length ? u.choices : u.offer()) : [];
      this.showPanel('upgrades'); g.state = 'upgrade'; g.input.clear(); g.audio.setActive(false);
      $('upgrades-title').textContent = u.points ? 'Choose your next advantage.' : 'Your evolving nature.';
      $('upgrades-intro').textContent = u.points ? u.points + ' point' + (u.points === 1 ? '' : 's') + ' available. Choose one adaptation; press 1, 2, or 3.' : 'Reach a new mass class to earn an adaptation point.';
      $('upgrade-cards').innerHTML = choices.map((v, i) => '<button class="upgrade-card" data-upgrade="' + v.id + '"><span class="upgrade-icon" aria-hidden="true">' + String(A.UPGRADES.indexOf(v)+1).padStart(2,'0') + '</span><small>' + v.type + '</small><h3>' + v.name + '</h3><p>' + v.description + '</p><span class="card-rank">RANK ' + (u.get(v.id) + 1) + ' / ' + v.max + ' <span style="float:right">[' + (i + 1) + ']</span></span></button>').join('');
      if(u.points&&!choices.length)$('upgrades-intro').textContent=g.player.evolution<1?'Your point is banked. The first evolution unlocks adaptations.':'Every available adaptation is developed. Later classes may unlock more.';
      const installed = A.UPGRADES.filter(v => u.get(v.id));
      $('installed-upgrades').innerHTML = '<b>INSTALLED ADAPTATIONS</b><br>' + (installed.length ? installed.map(v => '<span class="installed-chip">' + v.name + ' ×' + u.get(v.id) + '</span>').join('') : 'No adaptations yet. Your first evolution opens new possibilities.');
    }
    showSlots(){
      this.showPanel('slots');const save=A.Save,esc2=escape;
      $('slot-list').innerHTML=save.vault.slots.map((slot,i)=>{const d=i===save.vault.activeSlot&&save.mode==='journey'?save.data:slot.data,r=d.run,active=i===save.vault.activeSlot&&save.mode==='journey';return '<button class="save-slot" aria-pressed="'+active+'" data-action="slot:'+i+'"><span class="eyebrow">SLOT 0'+(i+1)+' · '+(active?'SELECTED':'SELECT')+'</span><strong>'+(r?A.appearance(r.player).name:'No active journey')+'</strong><span>'+(r?A.timeText(r.time)+' · '+A.massText(r.player.m):'Ready for a new journey')+'</span><small>'+d.lifeLab.owned.length+' companions · '+d.achievements.length+' achievements</small><small class="slot-record">'+esc2((r?A.appearance(r.player).name:d.bestClassName||A.classFor(5**d.bestStage).name))+' · best '+esc2(A.massText(d.bestMass))+'</small></button>';}).join('');
      $('slot-cadence').setAttribute('aria-pressed',String(save.slot.everyThree));$('slot-cadence').textContent=(save.slot.everyThree?'ON':'OFF')+' · Autosave every 3 evolutions';
      $('slot-status').textContent=save.status(this.game);$('slot-save-now').disabled=!save.sessionOpen;
    }
    // Lab tutorial text reuses the same hintsSeen memory the orbital terms use, so it does not
    // repeat across sessions or slots. Active tab is transient UI state and is not saved.
    labHint(key,text){
      const seen=A.Save.data.hintsSeen||=[];
      if(seen.includes(key))return '';
      seen.push(key);A.Save.write();return text;
    }
    showLab() {
      const g=this.game,d=A.Save.data.lifeLab;this.showPanel('lab');
      const tabs=[['discover','DISCOVER'],['incubator','INCUBATOR'],['collection','COLLECTION'],['equipped','EQUIPPED']];
      if(!tabs.some(t=>t[0]===this.labTab))this.labTab='discover';
      const tab=this.labTab;
      $('lab-tabs').innerHTML=tabs.map(([id,label])=>'<button role="tab" class="lab-tab'+(tab===id?' active':'')+'" aria-selected="'+(tab===id)+'" data-action="life:tab:'+id+'">'+label+(id==='incubator'&&d.eggs.length?' <i>'+d.eggs.length+'</i>':'')+(id==='collection'?' <i>'+d.owned.length+'</i>':'')+'</button>').join('');
      for(const el of document.querySelectorAll('[data-lab-tab]'))el.hidden=el.dataset.labTab!==tab;
      const hint=tab==='discover'?this.labHint('lab-wheel','The wheel selects an undiscovered companion from a rarity sector and places its egg in incubation. Resources are only spent when a sector still has something to find.')
        :tab==='incubator'?this.labHint('lab-egg','Eggs develop only during flight. Return here when one reads ready, then hatch it.')
        :tab==='equipped'?this.labHint('lab-equip','An equipped companion grants its rarity bonuses plus one secondary passive drawn from its body shape.'):'';
      $('lab-hint').hidden=!hint;if(hint)$('lab-hint').textContent=hint;
      const featured=g.life.visualRecipe(g.life.inspected||d.equipped||d.owned[0])||A.PETS[0];this.previewPet=featured;this.petPreviewIn=0;$('pet-preview-name').textContent=g.life.displayName(featured.id);$('pet-preview-rarity').textContent=A.RARITIES[featured.rarity].name.toUpperCase()+' · LIVING COMPANION';$('pet-preview-description').textContent=featured.description;$('pet-size-controls').innerHTML=['small','medium','large'].map(size=>'<button aria-pressed="'+(A.Save.data.settings.petSize===size)+'" data-action="pet-size:'+size+'">'+size[0].toUpperCase()+size.slice(1)+'</button>').join('');this.drawPetPreview(0);
      $('discovery-wheel').style.transform='rotate('+(this.wheelAngle||0)+'deg)';$('wheel-result').textContent=this.wheelTime>0?'Discovering…':(this.wheelResult||'An undiscovered companion from the selected sector enters incubation.');$('wheel-spin').disabled=!!(this.wheelTime>0||d.eggs.length>=3||d.water<500||d.dna<100||d.owned.length===50);
      const equipped=g.life.recipe(d.equipped);$('pet-rename').hidden=!equipped||tab!=='equipped';$('pet-nickname').value=equipped?(d.nicknames?.[equipped.id]||''):'';$('pet-nickname').placeholder=equipped?equipped.name:'';$('pet-rename-species').textContent=equipped?'Equipped: '+equipped.name+' · '+A.petBuffText(equipped.rarity):'';
      $('lab-equipped').innerHTML=equipped?'<div class="eyebrow">ACTIVE COMPANION</div><h3>'+escape(g.life.displayName(equipped.id))+'</h3><p class="subtle">'+escape(equipped.description)+'</p><p class="pet-buffs">'+A.petBuffText(equipped.rarity)+'</p><p class="pet-passive">'+escape(A.petPassiveText(equipped))+'</p>':'<p class="subtle">No companion equipped. Choose one from the Collection tab to gain its rarity bonuses and its shape passive.</p>';
      $('lab-resources').innerHTML='<span><b>'+d.water+'</b> WATER</span><span><b>'+d.dna+'</b> DNA SAMPLES</span><span><b>'+d.owned.length+' / 50</b> DISCOVERED</span>'+(d.equipped?'<button data-action="life:equip:none">Unequip companion</button>':'');
      $('lab-eggs').innerHTML='<div class="eyebrow">INCUBATOR · '+d.eggs.length+' / 3</div>'+(d.eggs.length?d.eggs.map(e=>{const p=g.life.recipe(e.id),r=A.RARITIES[p.rarity];return '<div class="lab-egg"><span class="egg-symbol" style="--pet-color:'+r.color+'">◉</span><div><b>'+p.name+'</b><p class="egg-flavour">'+escape(g.life.eggStatus(e))+'</p><p>'+ (e.remaining>0?Math.ceil(e.remaining)+' seconds of flight remaining':'Ready to hatch')+'</p><div class="progress-track"><div style="width:'+100*(1-e.remaining/(e.duration||[20,30,40,50,60][p.rarity]))+'%;background:'+r.color+'"></div></div></div><button '+(e.remaining>0?'disabled':'')+' data-action="life:hatch:'+p.id+'">Hatch</button></div>';}).join(''):'<p class="subtle">Use the discovery wheel above. Incubation progresses during flight; menus pause it.</p>');
      $('lab-filters').innerHTML=['all','owned',...A.RARITIES.map(r=>r.name)].map(f=>'<button aria-pressed="'+(g.life.filter===f)+'" data-action="life:filter:'+f+'">'+(f==='all'?'All 50':f==='owned'?'Collected':f)+'</button>').join('');
      const pets=A.PETS.filter(p=>g.life.filter==='all'||g.life.filter==='owned'&&d.owned.includes(p.id)||g.life.filter===A.RARITIES[p.rarity].name);
      $('lab-pets').innerHTML=pets.map(p=>{const r=A.RARITIES[p.rarity],owned=d.owned.includes(p.id),egg=d.eggs.some(e=>e.id===p.id),equipped=d.equipped===p.id,can=!egg&&d.eggs.length<3&&d.water>=r.water&&d.dna>=r.dna;
        return '<article class="pet-card '+(equipped?'equipped':'')+'" style="--pet-color:'+r.color+'"><button class="pet-inspect" data-action="life:inspect:'+p.id+'" aria-label="Preview '+p.name+'"><img src="'+A.Life.thumbnail(g.life.visualRecipe(p.id))+'" alt="'+p.name+'" width="96" height="80"></button><div><small>'+r.name.toUpperCase()+' · '+p.id.slice(4)+'</small><h3>'+escape(g.life.displayName(p.id))+'</h3>'+ (d.nicknames?.[p.id]?'<small>'+p.name+'</small>':'')+'<p>'+p.description+'</p><p class="pet-buffs">'+A.petBuffText(p.rarity)+'</p><p class="pet-passive">'+escape(A.petPassiveText(p))+'</p></div><footer>'+(owned?'<span>DISCOVERED</span><button data-action="life:equip:'+p.id+'" '+(equipped?'disabled':'')+'>'+(equipped?'Equipped':'Equip')+'</button>':'<span>'+r.time+'s incubation</span><span>'+(egg?'INCUBATING':'DISCOVER VIA WHEEL')+'</span>')+'</footer></article>';}).join('')||'<p class="subtle">Your first companion is waiting to be discovered.</p>';
    }
    drawPetPreview(dt){
      this.petAnimClock=(this.petAnimClock||0)+dt;this.petPreviewIn=(this.petPreviewIn||0)-dt;if(this.petPreviewIn>0||!this.previewPet)return;
      this.petPreviewIn=A.Save.data.settings.quality==='low'?1/20:1/30;
      const canvas=$('pet-preview'),c=canvas.getContext('2d'),w=canvas.width,h=canvas.height,t=A.Save.data.settings.reducedMotion?0:this.petAnimClock;
      c.clearRect(0,0,w,h);const glow=c.createRadialGradient(w/2,h*.48,8,w/2,h*.48,190);glow.addColorStop(0,'#1b4148');glow.addColorStop(1,'#09151f');c.fillStyle=glow;c.fillRect(0,0,w,h);
      c.strokeStyle='#72979c30';c.lineWidth=1;c.beginPath();c.ellipse(w/2,h*.78,130,22,0,0,A.TAU);c.stroke();c.beginPath();c.ellipse(w/2,h*.78,105,16,0,0,A.TAU);c.stroke();
      const count=A.Save.data.settings.quality==='low'?8:20;c.fillStyle='#9bc9c866';for(let i=0;i<count;i++){const x=(i*113.71)%w,y=(i*67.93+t*3)%h;c.fillRect(x,y,1.2,1.2);}
      A.Life.paint(c,this.previewPet,w/2,h*.44,43*A.petScale(),t,this.previewPet.id===A.Save.data.lifeLab.equipped?A.cosmeticEquipped('companion'):'none');
    }
    installAchievementControls(){
      $('achievement-search').addEventListener('input',()=>{this.achievementQuery=$('achievement-search').value.slice(0,80);this.renderAchievements();});
      $('achievements').addEventListener('keydown',e=>{
        if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))return;
        const current=e.target.closest('.advancement-node');if(!current)return;
        const nodes=this.achievementNodePositions||[],p=nodes.find(n=>n.id===current.dataset.achievement);if(!p)return;
        const horizontal=e.code==='ArrowLeft'||e.code==='ArrowRight',sign=e.code==='ArrowLeft'||e.code==='ArrowUp'?-1:1;let nearest=null,score=Infinity;
        for(const q of nodes){const along=(horizontal?q.x-p.x:q.y-p.y)*sign,across=horizontal?q.y-p.y:q.x-p.x;if(along<=0)continue;const distance=along*along+across*across*3;if(distance<score){nearest=q;score=distance;}}
        if(nearest){e.preventDefault();const button=$('achievements').querySelector('[data-achievement="'+nearest.id+'"]');button?.focus();button?.scrollIntoView?.({block:'nearest',inline:'nearest',behavior:'instant'});this.selectedAchievement=nearest.id;this.inspectAchievement();for(const n of $('achievements').querySelectorAll('.advancement-node'))n.setAttribute('aria-pressed',String(n.dataset.achievement===nearest.id));}
      });
    }
    resetAchievementNotices(){
      this.achievementQueue=[];this.activeAchievement=null;this.achievementGap=0;this.plaquePaint=null;
      const plaque=$('advancement-plaque');plaque.hidden=true;plaque.style.cssText='';delete plaque.dataset.phase;
      $('advancement-announcer').textContent='';
    }
    achievementNotice(id){
      if(!A.achievementInfo[id]||!A.Save.data.settings.achievementNotices||A.Save.mode==='sandbox')return false;
      if(this.activeAchievement?.id===id||this.achievementQueue.includes(id))return false;
      this.achievementQueue.push(id);return true;
    }
    updateAchievementNotices(dt){
      const g=this.game,el=$('advancement-plaque'),settings=A.Save.data.settings;
      if(!settings.achievementNotices){if(this.activeAchievement||this.achievementQueue.length)this.resetAchievementNotices();return;}
      const visible=g.state==='playing'&&!g.hudHidden&&!g.photo?.active&&!(g.evolutionTime>0)&&!(g.momentTime>0);
      el.hidden=!visible||!this.activeAchievement;
      if(!visible)return;
      this.achievementGap=Math.max(0,this.achievementGap-dt);
      if(!this.activeAchievement&&this.achievementQueue.length&&this.achievementGap===0){
        const id=this.achievementQueue.shift(),q=A.achievementInfo[id],def=A.achievementDefs[id];
        this.activeAchievement={id,age:0,duration:q.type==='challenge'?6.3:q.type==='goal'?5.5:4.8,systemReduced:!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches};
        el.className='advancement-plaque plaque-'+q.type+(settings.achievementPosition==='bottom'?' plaque-bottom':'');el.dataset.achievement=id;el.hidden=false;
        $('advancement-plaque-icon').innerHTML=A.achievementIcon(q.icon);
        $('advancement-plaque-kind').textContent={task:'ADVANCEMENT MADE',goal:'GOAL ACHIEVED',challenge:'CHALLENGE COMPLETE'}[q.type];
        $('advancement-plaque-title').textContent=def[0];$('advancement-plaque-description').textContent=def[1];
        $('advancement-announcer').textContent='Advancement earned: '+def[0]+'. '+def[1];
        this.paintAchievementPlaque();g.audio.play('advancement-'+q.type);return;
      }
      if(this.activeAchievement){this.activeAchievement.age+=dt;if(this.activeAchievement.age>=this.activeAchievement.duration){el.hidden=true;this.activeAchievement=null;this.achievementGap=.3;}else this.paintAchievementPlaque();}
      el.classList.toggle('plaque-bottom',settings.achievementPosition==='bottom');
    }
    paintAchievementPlaque(){
      const notice=this.activeAchievement;if(!notice)return;
      const el=$('advancement-plaque'),settings=A.Save.data.settings,m=A.advancementMotion(notice.age,notice.duration,settings.reducedMotion||notice.systemReduced),n=value=>value.toFixed(4);
      el.dataset.frame=A.cosmeticEquipped('frame');
      if(el.dataset.phase!==m.phase)el.dataset.phase=m.phase;
      // One inline style update drives the frame, its light wash and both inset
      // contents. There are no CSS animation clocks, timers or additional RAFs.
      const style='--plaque-opacity:'+n(m.opacity)+';--plaque-panel:'+n(m.panel)+';--plaque-wash:'+n(m.wash)+';--plaque-glow:'+n(m.glow)+';--plaque-copy:'+n(m.copy)+';--plaque-copy-blur:'+n(m.blur)+'px;--plaque-copy-y:'+n(m.copyY)+'px;--plaque-badge:'+n(m.badge)+';--plaque-badge-scale:'+n(m.badgeScale)+';--plaque-offset:'+n(m.offset*(settings.achievementPosition==='bottom'?-1:1))+'px;--plaque-scale:'+n(m.scale)+';';
      if(this.plaquePaint!==style){el.style.cssText=style;this.plaquePaint=style;}
    }
    renderAchievements(){
      const priorAction=document.activeElement?.getAttribute?.('data-action');
      const d=A.Save.data,branch=A.achievementBranches.find(b=>b.id===this.achievementBranch)||A.achievementBranches[0],query=this.achievementQuery.trim().toLowerCase(),filter=this.achievementFilter;
      const all=Object.keys(A.achievementDefs).map(id=>A.achievementStatus(id,this.game)),earned=all.filter(q=>q.earned).length;
      $('achievement-total').textContent=earned+' / '+all.length+' EARNED';
      $('achievement-overall-fill').style.width=(earned/all.length*100)+'%';
      $('achievement-branches').innerHTML=A.achievementBranches.map(b=>{const entries=all.filter(q=>q.branch===b.id),count=entries.filter(q=>q.earned).length;return '<button type="button" data-action="achievement-branch:'+b.id+'" aria-pressed="'+(b.id===branch.id)+'">'+A.achievementIcon(b.icon)+'<span>'+escape(b.name)+'<small>'+count+' / '+entries.length+' earned</small></span></button>';}).join('');
      const entries=all.filter(q=>(query||q.branch===branch.id)&&(filter==='all'||(filter==='earned')===q.earned)&&(!query||(q.title+' '+q.description+' '+q.type).toLowerCase().includes(query)));
      $('achievement-branch-title').textContent=query?'Search results':branch.name;
      $('achievement-branch-note').textContent=query?entries.length+' matching '+(entries.length===1?'milestone':'milestones')+' across all branches.':branch.note;
      for(const id of ['all','earned','locked'])$('achievement-filter-'+id).setAttribute('aria-pressed',String(filter===id));
      if(!entries.some(q=>q.id===this.selectedAchievement))this.selectedAchievement=entries[0]?.id||null;
      const positions=entries.map((q,i)=>({...q,x:20+(query?i%4:q.column)*144,y:20+(query?Math.floor(i/4):q.row)*104}));
      this.achievementNodePositions=positions;
      const byId=new Map(positions.map(q=>[q.id,q])),width=Math.max(448,...positions.map(q=>q.x+148)),height=Math.max(334,...positions.map(q=>q.y+108));
      let paths='';for(const q of positions)for(const parent of q.parents){const p=byId.get(parent);if(!p||query)continue;let path;if(q.column===p.column){const sign=q.y>p.y?1:-1,x=p.x+62;path='M'+x+' '+(p.y+(sign>0?86:0))+'V'+(q.y+(sign>0?0:86));}else{const sign=q.x>p.x?1:-1,x=p.x+(sign>0?124:0),y=p.y+43,end=q.x+(sign>0?0:124),mid=(x+end)/2;path='M'+x+' '+y+'H'+mid+'V'+(q.y+43)+'H'+end;}paths+='<path class="'+(p.earned&&q.earned?'link-earned':p.earned?'link-open':'link-locked')+'" d="'+path+'"/>';}
      $('achievements').innerHTML=entries.length?'<div class="advancement-surface" style="width:'+width+'px;height:'+height+'px"><svg class="advancement-links" viewBox="0 0 '+width+' '+height+'" aria-hidden="true" focusable="false">'+paths+'</svg>'+positions.map(q=>'<button type="button" class="advancement-node '+q.type+(q.earned?' earned':' locked')+'" data-action="achievement-select:'+q.id+'" data-achievement="'+q.id+'" style="left:'+q.x+'px;top:'+q.y+'px" aria-pressed="'+(q.id===this.selectedAchievement)+'" aria-label="'+escape(q.title+'. '+(q.earned?'Earned. ':'Locked. ')+q.description)+'"><span class="advancement-badge">'+A.achievementIcon(q.icon)+'</span><strong>'+escape(q.title)+'</strong><span class="advancement-check">'+(q.earned?'EARNED':q.type.toUpperCase())+'</span></button>').join('')+'</div>':'<div class="advancement-empty"><b>No milestones match</b><p>Choose another branch, clear your search or change the earned filter.</p></div>';
      this.inspectAchievement();
      if(priorAction?.startsWith('achievement-branch:'))$('achievement-branches').querySelector('[data-action="'+priorAction+'"]')?.focus();
      else if(priorAction?.startsWith('achievement-select:'))$('achievements').querySelector('[data-action="'+priorAction+'"]')?.focus();
    }
    inspectAchievement(){
      const q=this.selectedAchievement&&A.achievementStatus(this.selectedAchievement,this.game);
      if(!q){$('achievement-inspect').innerHTML='<div class="eyebrow">MILESTONE INSPECTION</div><h3>Select a milestone</h3><p>Its requirement, observed progress and related milestones appear here.</p>';return;}
      const branch=A.achievementBranches.find(b=>b.id===q.branch);
      $('achievement-inspect').innerHTML='<div class="advancement-detail-badge '+q.type+'">'+A.achievementIcon(q.icon)+'</div><div class="eyebrow">'+q.type.toUpperCase()+' · '+(q.earned?'EARNED':'LOCKED')+'</div><h3>'+escape(q.title)+'</h3><p>'+escape(q.description)+'</p><div class="advancement-detail-progress" role="progressbar" aria-label="'+escape(q.title)+' progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+Math.floor(q.progress*100)+'"><i style="width:'+Math.floor(q.progress*100)+'%"></i></div><p class="advancement-observed">'+escape(q.label)+'</p><div class="advancement-detail-category">'+escape(branch.name)+'</div>'+(q.parents.length?'<div class="advancement-related"><span>RELATED MILESTONES</span>'+q.parents.map(id=>'<button type="button" data-action="achievement-follow:'+id+'">'+escape(A.achievementDefs[id][0])+'</button>').join('')+'</div>':'')+'<p class="advancement-detail-note">Connections show a route through the catalogue. Each milestone is earned when its own requirement is met.</p>';
    }
    showArchive(view) {
      A.Save.checkAdvancements(this.game,this.game.state==='menu');
      this.archiveView=['advancements','records','journal'].includes(view)?view:this.archiveView||'records';
      const d = A.Save.data;
      $('archive-stats').innerHTML = this.statsMarkup([['COMPANIONS DISCOVERED',d.lifeLab.owned.length+' / 50'],['DNA COLLECTED',d.lifeLab.samples],['WATER COLLECTED',d.lifeLab.waterCollected],['HIGHEST MASS', A.massText(d.bestMass)], ['BEST CLASS', (d.bestClassName||A.classFor(Math.pow(5,d.bestStage)).name)], ['COMPLETED JOURNEYS', d.lifetime.runs], ['LIFETIME CAPTURES', d.lifetime.captures],['PLANETS CAPTURED',d.lifetime.planetsCaptured||0],['SYSTEMS BUILT',d.lifetime.systemsBuilt||0],['GALACTIC ENCOUNTERS',d.lifetime.galaxyCollisions||0],['SUPERNOVAS',d.lifetime.supernovas||0],['MATTER DISSOLVED · SIM MASS',(d.lifetime.cloudDissolved||0).toExponential(2)],['MATTER CONVERTED · SIM MASS',(d.lifetime.strangeConverted||0).toExponential(2)],['WORLDS FROM DUST',d.lifetime.condensatesBorn||0],['SECTORS CHARTED',d.lifetime.sectorsCharted||0],['JOURNEY GOALS',d.lifetime.directivesCompleted||0],['ORBITAL BLUEPRINTS',d.legacy.blueprints.length],['PRESTIGE EXPEDITIONS',d.legacy.rank],['EXPEDITION PROMISES KEPT',d.legacy.trials.length],['MATTER ACCRETED · SIM MASS',(d.lifetime.totalMatterAccreted||0).toExponential(2)], ['STABLE ORBITS ESTABLISHED', d.lifetime.lifetimeOrbits||0], ['COMPANIONS HATCHED', d.lifetime.lifetimeHatched||0], ['LONGEST SINGLE JOURNEY', A.timeText(d.lifetime.longestRun||0)], ['TIME IN SPACE', A.timeText(d.lifetime.seconds)], ['RIVALS DEFEATED', d.lifetime.defeats]]);
      this.renderAchievements();
      for(const id of ['advancements','records','journal']){$('archive-tab-'+id).setAttribute('aria-pressed',String(this.archiveView===id));$(id==='advancements'?'archive-advancements':id==='records'?'archive-stats':'journey-archive').hidden=this.archiveView!==id;}
      $('archive-title').textContent={advancements:'Advancements',records:'Personal records',journal:'Journey log'}[this.archiveView];
      const log=(!['menu','over'].includes(this.game.state)?this.game.expedition?.journal:this.game.state==='over'?this.game.expedition?.journal:A.Save.data.run?.expedition?.journal)||[];$('journey-log').innerHTML=log.length?log.slice().reverse().map(q=>'<article class="journey-entry"><time>'+A.timeText(q.time)+'</time><div><b>'+escape(q.title)+'</b><p>'+escape(q.detail)+'</p></div></article>').join(''):'<p class="subtle">Discoveries and completed goals from your journey appear here.</p>';this.showPanel('archive');
    }
    statsMarkup(stats) { return stats.map(([label, value]) => '<div class="stat"><span>' + escape(label) + '</span><b>' + escape(value) + '</b></div>').join(''); }
    gameOver(reason) {
      const g = this.game, s = g.stats;
      $('evolution').hidden = true; $('over-reason').textContent = 'Your body fragmented in an encounter with ' + reason + '. Your matter will become part of another story.';
      $('final-stats').innerHTML = this.statsMarkup([['TOTAL MASS REACHED', A.massText(s.peak)], ['LARGEST EVOLUTION CLASS', (s.peakClass||A.appearance(g.player).name)], ['OBJECTS ABSORBED', s.captures], ['AI BODIES DEFEATED', s.defeats],['GALACTIC ENCOUNTERS',s.galaxyCollisions||0], ['TIME SURVIVED', A.timeText(g.time)], ['LARGEST COLLISION · BODY MASS', s.largestCollision ? A.massText(s.largestCollision) : 'No major collisions'], ['MAXIMUM VELOCITY', s.maxVelocity.toFixed(1) + ' local u/s'], ['ADAPTATIONS INSTALLED', Object.values(g.upgrades.levels).reduce((a, b) => a + b, 0)], ['LAST RIVAL ENCOUNTERED', s.lastRival || 'No rival came close']]);
      this.showPanel('over', false);
    }
    refreshAudioButton(){const muted=A.Save.data.settings.mute;$('mute-button').textContent=muted?'Off':'On';$('mute-button').setAttribute('aria-label',muted?'Unmute sound':'Mute sound');$('mute-button').setAttribute('title',muted?'Sound off (M)':'Sound on (M)');}
    toggleMute(){A.Save.data.settings.mute=!A.Save.data.settings.mute;A.Save.write();this.game.audio.setVolume();this.refreshAudioButton();}
    toast(title, message, style = 'aqua') {
      const el = document.createElement('div'); el.className = 'toast ' + style; el.innerHTML = '<small>' + escape(title) + '</small><p>' + escape(message) + '</p>'; $('toasts').appendChild(el);
      while ($('toasts').children.length > 3) $('toasts').firstChild.remove();
      this.toastQueue.push({ el, time: title === 'GRAVITATIONAL CAPTURE' ? 6 : 4.8 });
    }
    evolve(stage) {
      const cl = A.classFor(Math.pow(5, stage)); $('evolution-name').textContent = cl.name; $('evolution-description').textContent = cl.description;
      $('evolution-mass').textContent = '≈ ' + A.formatKg(cl.kg); $('evolution').hidden = false;
    }
    updateStage(p) {
      const n=A.Supernova,route=n?.route(p),cl=A.appearance(p),level=route?n.level(p):p.evolution;
      const final=route?level===A.SUPERNOVA_PATHS[route].classes.length-1:level>=14;
      const base=route?n.baseMass(p)*5**level:5**level,nextMass=base*5;
      const next=route&&!final?n.classAt(p,route,level+1):A.classFor(nextMass);
      const progress=A.clamp((p.m-base)/(nextMass-base),0,1);
      $('hud-stage').textContent=cl.name.toUpperCase();
      $('hud-class').textContent=A.routeCaption(p);
      $('hud-next').textContent=final?(route?'Route complete':'Stellar path complete'):next.name;
      $('hud-percent').textContent=final?'COMPLETE':Math.floor(progress*100)+'%';
      $('mass-progress').style.width=final?'100%':progress*100+'%';
      $('hud-goal').textContent=final?(route?'Continue gathering':'Path choice remains available'):A.massText(nextMass);
    }
    update(realDt) {
      this.updateAchievementNotices(realDt);
      this.updateWorkspace(realDt);
      if(this.panel==='lab')this.drawPetPreview(realDt);
      if(this.wheelTime>0){this.wheelTime=Math.max(0,this.wheelTime-realDt);if(this.wheelTime===0&&this.panel==='lab')this.showLab();}
      for (const item of this.toastQueue) { item.time -= realDt; if (item.time < .4) item.el.classList.add('exiting'); if (item.time <= 0) item.el.remove(); }
      this.toastQueue = this.toastQueue.filter(t => t.time > 0 && t.el.isConnected);
      this.updateIn -= realDt; if (this.updateIn > 0 || !this.game.player || this.game.state === 'menu') return; this.updateIn = .15;
      $('life-resources').textContent=A.Save.data.lifeLab.water+' H₂O · '+A.Save.data.lifeLab.dna+' DNA'+(A.Save.data.lifeLab.eggs.some(e=>e.remaining===0)?' · EGG READY':'');
      const g = this.game, p = g.player, u = g.upgrades, stage = A.scaleStage(p), cl = A.appearance(p);
      this.updateStage(p); $('hud-mass').textContent = A.massText(p.m); $('hud-time').textContent = A.timeText(g.time);
      $('hud-fps').textContent=g.fpsMeasured?Math.round(g.fps):'--';
      $('hud-velocity').innerHTML = (Math.hypot(p.vx, p.vy) / A.unit(p.m)).toFixed(1) + '<small>u/s</small>';
      $('hud-gravity').innerHTML = (Math.pow(p.m, .25) * (1 + .22 * u.get('pull')) * (g.amplifyTime ? 2 : 1) * (1+(g.life?.buffs().gravity||0))).toFixed(p.m > 1e7 ? 0 : 1) + '<small>×</small>';
      $('hud-hp').title = g.difficulty==='hardcore'?'Hardcore · maximum cohesion 50%':'Maximum cohesion 100%'; $('hud-hp').innerHTML = Math.max(0, Math.round(p.hp)) + '<small>%</small>'; $('hp-progress').style.width = Math.max(0, p.hp) + '%'; $('hp-progress').style.background = p.hp < 40 ? 'var(--danger)' : 'var(--aqua)';
      $('upgrade-points').textContent = u.points; $('upgrade-button').classList.toggle('has-points', u.points > 0);
      $('boost-ability').classList.toggle('ready', !!u.get('boost')); $('boost-label').textContent = u.get('boost') ? 'BURN · ' + Math.round(g.boostEnergy * 100) + '%' : 'BURN · LOCKED'; $('boost-fill').style.width = u.get('boost') ? g.boostEnergy * 100 + '%' : '0%';
      $('pulse-ability').hidden = !u.get('pulse'); $('pulse-label').textContent = g.pulseCooldown > 0 ? Math.ceil(g.pulseCooldown) + 's' : 'PULSE'; $('pulse-ability').classList.toggle('ready', g.pulseCooldown <= 0);
      $('surge-ability').hidden = !u.get('amplify'); $('surge-label').textContent = g.amplifyTime > 0 ? 'ACTIVE' : g.amplifyCooldown > 0 ? Math.ceil(g.amplifyCooldown) + 's' : 'SURGE'; $('surge-ability').classList.toggle('ready', g.amplifyCooldown <= 0);
      $('scale-note').textContent = 'SCALE ' + A.unit(p.m).toFixed(A.unit(p.m) < 10 ? 1 : 0) + '× · SIMULATION UNITS' + (g.difficulty==='hardcore'?' · HARDCORE · COHESION CAP 50%':''); $('scanner-range').textContent = (1.4*(1+(g.cosmic?.profile(p).survey||0)) * (1 + .35 * u.get('scanner'))).toFixed(1) + ' ku';
      const leaders = g.world.bodies.filter(b => b.alive && (b.kind === 'ai' || b === p)).sort((a, b) => b.m - a.m), rank = leaders.indexOf(p) + 1;
      const display = leaders.slice(0, 5); if (!display.includes(p)) display.push(p);
      $('leader-list').innerHTML = display.map(b => '<li title="'+escape(b===p?'Your body':b.personality+' · '+(b.intent||'Exploring'))+'" class="' + (b === p ? 'you' : '') + '"><span class="rank">' + (leaders.indexOf(b) + 1).toString().padStart(2, '0') + '</span><span>' + escape(b.name) + '</span><span class="lb-mass">' + escape(A.massText(b.m)) + '</span></li>').join('');
      $('body-count').textContent = g.world.bodies.filter(b => b.alive).length + ' bodies in sector'; $('player-rank').textContent = 'YOU #' + rank;
      $('threat-banner').hidden = !g.threat;
      if (g.threat) {
        $('threat-banner').classList.toggle('escaping', g.escape); $('threat-title').textContent = g.escape ? 'ESCAPE TRAJECTORY DETECTED' : p.bound === g.threat.id ? 'GRAVITATIONAL CAPTURE' : 'NEARBY GRAVITY WELL';
        $('threat-detail').textContent = (g.threat.name || A.classFor(g.threat.m).name) + ' · ' + (g.threat.m / p.m).toFixed(1) + '× your simulation mass';
      }
      const tips = [
        'Move gently through the nearby field.<br>Your gravity will bring smaller fragments into orbit.',
        'Coast near resources and let them spiral inward.<br>Hold Shift to slow down without turning around.',
        'Red markers reveal larger bodies.<br>Thrust sideways to escape a deep gravity well.',
        'Each evolution grants an adaptation.<br>Press U to shape the kind of world you become.'
      ];
      const tip = Math.min(3, Math.floor(g.time / 28)); $('guide-counter').textContent = g.expedition?.directive?A.routeCaption(p):'0' + (tip + 1) + ' / 04';
      $('guide-text').innerHTML = g.world.event ? '<span style="color:var(--gold)">' + escape(g.world.event.name) + '</span><br>' + escape(g.world.event.description) : tips[tip];
      $('flight-guide').style.opacity = g.time > 160 && !g.world.event ? '.48' : '1';
      $('save-note').textContent = A.Save.available ? A.Save.status(g)+' · Save now for an immediate checkpoint.' : 'Browser storage is unavailable. Keep this tab open to retain the current journey.';
    }
  };
})(window.AC);
