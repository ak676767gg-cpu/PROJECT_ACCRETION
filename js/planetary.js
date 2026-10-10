'use strict';
(function(A){
  const keys=['iron','rock','ice','gas'];
  A.Composition={
    clean(q){if(!q||!keys.every(k=>Number.isFinite(q[k])&&q[k]>=0))return null;const n=keys.reduce((s,k)=>s+q[k],0);return n>0?Object.fromEntries(keys.map(k=>[k,q[k]/n])):null;},
    seed(b){const r=A.rng(b.seed+917);let q=b.material==='ice'?{iron:.03,rock:.22,ice:.7,gas:.05}:['gas','plasma','stellar'].includes(b.material)?{iron:.01,rock:.04,ice:.1,gas:.85}:{iron:.08+r()*.48,rock:.4+r()*.6,ice:r()*.25,gas:r()*.1};return this.clean(q);},
    ensure(b){const q=b.composition;if(q&&keys.every(k=>Number.isFinite(q[k])&&q[k]>=0)&&Math.abs(q.iron+q.rock+q.ice+q.gas-1)<1e-7)return q;b.composition=this.clean(q)||this.seed(b);return b.composition;},
    mix(b,q,m){if(!(m>0))return;const a=this.ensure(b),c=this.clean(q)||a;for(const k of keys)a[k]=(a[k]*b.m+c[k]*m)/(b.m+m);},
    factor(b){if(b.form==='neutron')return .55;if(A.scaleStage(b)<3||A.scaleStage(b)>8||b.form==='star'||b.form==='blackhole')return 1;const q=this.ensure(b);return Math.cbrt(1/(q.iron*1.75+q.rock+q.ice*.65+q.gas*.38));},
    dominant(b){const q=this.ensure(b);return keys.reduce((a,k)=>q[k]>q[a]?k:a,'rock');},
    zone(star){const center=240*A.unit(star.m)*Math.pow(star.m/5**9,.14);return {center,inner:center*.83,outer:center*1.35};},
    describe(b){const q=this.ensure(b);return keys.map(k=>k+' '+Math.round(q[k]*100)+'%').join(' · ');}
  };
  A.Planetary=class{
    constructor(g){this.g=g;this.in=0;}
    update(dt){this.in+=dt;if(this.in<(A.Save.data.settings.quality==='low'?1:.5))return;const h=this.in;this.in=0;const g=this.g,c=g.cosmic;
      for(const b of g.world.bodies){if(!b.alive)continue;b.flareHeat=Math.max(0,(b.flareHeat||0)*Math.exp(-h/24));
        if(A.scaleStage(b)<3||A.scaleStage(b)>8)continue;
        A.Composition.ensure(b);const root=c.root(b),star=root&&A.appearance(root).type==='star'?root:g.world.sources.filter(s=>A.appearance(s).type==='star').sort((a,d)=>(a.x-b.x)**2+(a.y-b.y)**2-(d.x-b.x)**2-(d.y-b.y)**2)[0];
        if(!star){b.climate='Unlit';b.temperature=30;continue;}
        const z=A.Composition.zone(star),d=Math.max(star.r,Math.hypot(b.x-star.x,b.y-star.y)),q=b.composition;
        if(b.atmosphere===null||b.atmosphere===undefined)b.atmosphere=A.clamp(q.gas*3+q.ice*.3,0,1);
        b.temperature=278*Math.sqrt(z.center/d)*(1+.16*b.atmosphere)+b.flareHeat;
        b.climate=q.gas>.55?'Gas envelope':b.atmosphere<.05?'Airless':b.temperature<240?'Frozen':b.temperature>340?'Scorched':'Temperate';
        b.zoneStar=star.id;
      }
      for(const owner of g.world.sources){owner.resonanceBonus=0;const members=c.allMembers.filter(b=>b.parentId===owner.id&&b.orbitStable&&!b.collapse&&b.orbit?.e<.4).sort((a,b)=>a.orbit.period-b.orbit.period);const used=new Set();
        for(let i=0;i<members.length-1;i++){const a=members[i],b=members[i+1],ratio=b.orbit.period/a.orbit.period;const match=[[2,'2:1'],[1.5,'3:2'],[4/3,'4:3']].find(([v])=>Math.abs(ratio/v-1)<.018);
          if(!match||a.risk!=='CLEAR'||b.risk!=='CLEAR')continue;
          used.add(a.id);used.add(b.id);const same=a.resonancePartner===b.id&&a.resonanceRatio===match[1];a.resonanceTime=same?(a.resonanceTime||0)+h:h;a.resonancePartner=b.id;a.resonanceRatio=match[1];b.resonancePartner=a.id;b.resonanceRatio=match[1];b.resonanceTime=a.resonanceTime;
          if(a.resonanceTime>=15){owner.resonanceBonus=Math.min(.06,owner.resonanceBonus+.02);if(owner===g.player&&!a.resonanceNotified){a.resonanceNotified=true;g.ui.toast('RESONANT PAIR',match[1]+' period relationship held for fifteen seconds. Gravity efficiency +2%.','aqua');g.audio.play('resonance');}}
        }
        for(const b of c.allMembers)if(b.parentId===owner.id&&!used.has(b.id)){b.resonanceTime=0;b.resonancePartner=null;b.resonanceRatio='';b.resonanceNotified=false;}
      }
      c.bonus=c.profile(g.player).gravity;
    }
    draw(r){const g=this.g;if(!(g.systemView||g.input.keys.has('KeyO'))||A.scaleStage(g.player)<9||A.scaleStage(g.player)>=15)return;const c=r.ctx;
      for(const star of g.world.sources.filter(b=>A.appearance(b).type==='star').slice(0,4)){const z=A.Composition.zone(star),p=r.screen(star.x,star.y),zoom=r.camera.zoom;if(z.outer*zoom>r.w*3)continue;c.save();c.strokeStyle='#93b9a1';c.globalAlpha=.09;c.lineWidth=(z.outer-z.inner)*zoom;c.beginPath();c.ellipse(p.x,p.y,(z.inner+z.outer)/2*zoom,(z.inner+z.outer)/2*zoom*r.tilt,0,0,A.TAU);c.stroke();c.restore();}
    }
  };
})(window.AC);
