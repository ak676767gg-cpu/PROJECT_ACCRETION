/* Optional WebSocket transport. Constructing the offline game opens no socket. */
'use strict';
(function(A){
  A.Multiplayer=class{
    constructor(g){this.g=g;this.active=false;this.socket=null;this.room='';this.status='Offline';this.self=0;this.sendIn=0;this.receivedAt=0;this.targets=new Map();this.generation=0;}
    note(text){this.status=text;const e=document.getElementById('network-status');if(e)e.textContent=text;}
    connect(config){let url;try{url=new URL(config.url);if(!['ws:','wss:'].includes(url.protocol)||url.username||url.password||url.hash)throw Error();}catch{this.note('Enter a ws:// or wss:// server address.');return false;}
      const room=String(config.room).trim().toUpperCase(),name=String(config.name).trim().slice(0,24)||'Pilot';if(!/^[A-Z0-9_-]{1,24}$/.test(room)){this.note('Room codes use 1–24 letters, numbers, underscores or hyphens.');return false;}
      if(typeof WebSocket==='undefined'){this.note('This browser does not provide WebSocket support.');return false;}
      this.g.mainMenu();this.g.ui.showPanel('network');this.disconnect();const generation=++this.generation;this.room=room;this.note('Connecting…');let ws;try{ws=new WebSocket(url.href);}catch{this.note('The browser blocked this connection. See the backend guide.');return false;}this.socket=ws;
      this.timeout=setTimeout(()=>{if(this.socket===ws&&!this.active){ws.close();this.note('Connection timed out. Check the server address and firewall.');}},10000);
      ws.onopen=()=>{if(this.socket!==ws)return;this.send({type:'hello',version:1,room,name,key:String(config.key||'').slice(0,128)});};
      ws.onmessage=e=>{if(generation!==this.generation||typeof e.data!=='string'||e.data.length>350000)return;let msg;try{msg=JSON.parse(e.data);}catch{return;}if(msg.type==='welcome'){
          clearTimeout(this.timeout);A.Save.selectMode('multiplayer');this.self=msg.id;this.g.start(false);this.active=true;this.g.command.aimMode='attack';this.note('Connected · server controls this arena');this.sendIn=0;this.applySnapshot(msg);this.g.ui.flight();
        }else if(msg.type==='snapshot'&&this.active)this.applySnapshot(msg);else if(msg.type==='taunt'&&this.active){const q=A.cleanTaunts([{text:msg.text,media:msg.media,shape:msg.shape}])[0];if(msg.id!==this.self)this.g.command.addTaunt(msg.id,q);}
        else if(msg.type==='event'&&this.active){this.g.ui.toast(msg.title||'ARENA',String(msg.text||'').slice(0,160),'gold');if(msg.kind==='hit')this.g.audio.play('collision',.3);}
        else if(msg.type==='error'){this.note(String(msg.message||'Connection rejected.').slice(0,180));if(!this.active)ws.close();}
      };
      ws.onerror=()=>{if(this.socket===ws)this.note('Connection failed. Start the backend, check its address, and use wss:// from HTTPS pages.');};
      ws.onclose=()=>{if(this.socket!==ws)return;clearTimeout(this.timeout);const was=this.active;this.active=false;this.socket=null;if(was){this.note('Disconnected. Your ordinary saves are safe.');this.g.pause();this.g.ui.showPanel('network');}else if(this.status==='Connecting…')this.note('Server closed the connection before joining.');};return true;
    }
    send(data){if(this.socket?.readyState===1&&this.socket.bufferedAmount<250000){this.socket.send(JSON.stringify(data));return true;}return false;}
    disconnect(){clearTimeout(this.timeout);this.generation++;const ws=this.socket;this.socket=null;this.active=false;this.targets.clear();if(ws){ws.onopen=ws.onmessage=ws.onerror=ws.onclose=null;ws.close();}this.note('Offline');}
    buy(id){const u=A.UPGRADES.find(u=>u.id===id);if(!u?.legacy){this.g.ui.toast('ARENA EQUIPMENT','The shared arena uses original adaptations and its supplied turret. Engineering remains available in offline modes.','gold');return false;}return this.send({type:'upgrade',id});}
    sendInput(dt){if(!this.active)return;this.sendIn-=dt;if(this.sendIn>0)return;this.sendIn=.05;const g=this.g,playing=g.state==='playing'&&!document.hidden,d=playing?g.input.direction():{x:0,y:0},point=g.command.aimPoint(),p=g.player;this.send({type:'input',x:d.x,y:d.y,brake:playing&&(g.input.keys.has('ShiftLeft')||g.input.keys.has('ShiftRight')),boost:playing&&g.input.keys.has('Space'),fire:playing&&g.input.mouse.held&&g.command.aimMode==='attack',aim:Math.atan2(point.y-p.y,point.x-p.x)});}
    applySnapshot(msg){if(!Array.isArray(msg.bodies)||msg.bodies.length>500)return;const g=this.g,w=g.world,existing=new Map(w.bodies.map(b=>[b.id,b])),list=[],now=performance.now();
      for(const q of msg.bodies){if(!q||!['id','x','y','m','vx','vy','hp','r'].every(k=>Number.isFinite(q[k]))||q.m<=0||q.m>1e22)continue;let b=existing.get(q.id);if(!b||this.targets.get(q.id)?.kind!==q.kind){b=new A.Body().reset(q.id,q.x,q.y,q.m,q.id===this.self?'player':q.kind==='player'?'ai':'rock',q.seed||q.id*731);b.px=b.x;b.py=b.y;}
        b.alive=true;b.kind=q.id===this.self?'player':q.kind==='player'?'ai':'rock';b.name=String(q.name||'').slice(0,24);b.personality='efficient';b.hp=q.hp;b.vx=q.vx;b.vy=q.vy;b.setMass(q.m);b.r=q.r;b.evolution=q.stage??A.stage(q.m);b.form=q.form||'';b.grace=q.grace||0;b.z=b.pz=b.vz=0;b.material=q.kind==='player'?'rock':q.material||'rock';b.pr=b.r;this.targets.set(q.id,{...q,kind:q.kind});list.push(b);if(q.id===this.self)g.player=b;
      }for(const id of this.targets.keys())if(!list.some(b=>b.id===id))this.targets.delete(id);w.bodies=list;w.pool.length=0;w.fields.length=0;w.rebuild();g.cosmic.byId=new Map(list.map(b=>[b.id,b]));g.cosmic.packets.length=0;g.cosmic.regions.length=0;this.receivedAt=now;
      if(msg.you){g.upgrades.points=A.clamp(msg.you.points||0,0,100);for(const u of A.UPGRADES)g.upgrades.levels[u.id]=A.clamp(msg.you.levels?.[u.id]||0,0,u.max);g.boostEnergy=A.clamp(msg.you.boost??1,0,1);g.stats.captures=msg.you.captures||0;g.stats.defeats=msg.you.defeats||0;g.industry.syncDrones();}
      const age=Math.max(0,(now-(msg.echo||now))/1000);this.status=list.filter(b=>['ai','player'].includes(b.kind)).length+' pilots · '+(msg.tickRate||30)+' Hz server · menus do not pause';this.shots=Array.isArray(msg.shots)?msg.shots.slice(0,100):[];
    }
    step(dt){const g=this.g;g.tick++;g.time+=dt;const lag=performance.now()-this.receivedAt;if(lag>5000){this.note('Waiting for server…');return;}for(const b of g.world.bodies){const q=this.targets.get(b.id);if(!q)continue;b.px=b.x;b.py=b.y;b.pr=b.r;b.pa=b.angle;b.x=A.lerp(b.x,q.x+q.vx*Math.min(.12,lag/1000),A.ease(18,dt));b.y=A.lerp(b.y,q.y+q.vy*Math.min(.12,lag/1000),A.ease(18,dt));b.angle+=b.spin*dt;}const d=g.input.direction();g.player.thrustX=d.x;g.player.thrustY=d.y;g.boosting=g.input.keys.has('Space')&&g.boostEnergy>.05;g.stats.peak=Math.max(g.stats.peak,g.player.m);g.command.update(dt);g.industry.shots=(this.shots||[]).map(s=>({...s,ttl:1}));g.world.rebuild();}
  };
})(window.AC);
