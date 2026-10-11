/* Optional diagnostics only. The main game does not load this instrumentation. */
'use strict';
(function(){
  if(typeof EventTarget==='undefined')return;
  const counts=window.__testListeners={},metrics=window.__testMetrics={rafCalls:0};
  const listen=EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener=function(type,fn,options){const key=(this.id||this.tagName||'surface')+':'+type;(counts[key]||=[]).push(fn);return listen.call(this,type,fn,options);};
  const request=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=function(fn){metrics.rafCalls++;return request(fn);};
})();
