/* Developer pages use an in-memory vault. Never write the player's storage. */
'use strict';
(function(A){
 const S=A.Save,base=S.cleanProfile({version:1}),clone=q=>JSON.parse(JSON.stringify(q));let memory=null;
 S.vault={version:2,activeSlot:0,mode:'journey',settings:base.settings,slots:[0,1,2].map(()=>({everyThree:false,savedAt:0,evolutionBase:0,data:clone(base)})),sandbox:{everyThree:false,savedAt:0,evolutionBase:0,data:clone(base)}};S.vault.scenarios=Object.fromEntries(['boss','salvage','multiplayer'].map(mode=>[mode,{everyThree:false,savedAt:0,evolutionBase:0,data:clone(base)}]));S.activate(0);S.sessionOpen=false;
 S.write=function(commit=false){const slot=this.slot;if(commit||!this.sessionOpen){slot.data=clone(this.data);slot.savedAt=Date.now();slot.evolutionBase=this.data.run?.player.evolution||0;}this.vault.settings=this.data.settings;memory=clone(this.vault);this.available=true;return true;};
 S.load=function(){if(memory)this.vault=clone(memory);this.sessionOpen=false;this.activate(this.vault.activeSlot,this.vault.mode);return this.data;};
 A.diagnosticsIsolated=true;
})(window.AC);
