'use strict';
(function (A) {
  A.Audio = class {
    constructor() { this.ctx = null; this.last = {}; this.active = false; this.ambientVoices=[];this.phase=null;this.density=0;this.tension=0;this.profile=null; }
    start() {
      try {
        if (!this.ctx) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (!AudioContext) return;
          this.ctx = new AudioContext(); this.master = this.ctx.createGain();
          if(this.ctx.createDynamicsCompressor){this.limiter=this.ctx.createDynamicsCompressor();this.limiter.threshold.value=-14;this.limiter.knee.value=10;this.limiter.ratio.value=5;this.limiter.attack.value=.008;this.limiter.release.value=.25;this.master.connect(this.limiter);this.limiter.connect(this.ctx.destination);}else this.master.connect(this.ctx.destination);
          this.ambientGain = this.ctx.createGain(); this.ambientGain.connect(this.master);
          const noiseLength = this.ctx.sampleRate * 2; this.noise = this.ctx.createBuffer(1, noiseLength, this.ctx.sampleRate);
          const data = this.noise.getChannelData(0), random = A.rng(37814); let last = 0;
          for (let i = 0; i < noiseLength; i++) { last = (last + (random() * 2 - 1) * .08) / 1.08; data[i] = last * 3.5; }
          for (const frequency of [43.65, 65.41, 87.4]) {
            const osc = this.ctx.createOscillator(), gain = this.ctx.createGain(); osc.type = 'sine'; osc.frequency.value = frequency; gain.gain.value = .13;
            osc.connect(gain); gain.connect(this.ambientGain); osc.start();this.ambientVoices.push({osc,gain});
          }
        }
        if(!this.finalGain){this.finalGain=this.ctx.createGain();this.finalGain.gain.value=0;this.finalGain.connect(this.master);}
        if(!this.ambientNoise){this.ambientNoise=this.ctx.createBufferSource();this.ambientNoise.buffer=this.noise;this.ambientNoise.loop=true;this.ambientFilter=this.ctx.createBiquadFilter();this.ambientFilter.type='lowpass';this.noiseGain=this.ctx.createGain();this.noiseGain.gain.value=.018;this.ambientNoise.connect(this.ambientFilter);this.ambientFilter.connect(this.noiseGain);this.noiseGain.connect(this.ambientGain);this.ambientNoise.start();}
        if(!this.tensionNoise){
          // A low filtered bed that sits under the ambient mix. Felt rather than heard.
          this.tensionNoise=this.ctx.createBufferSource();this.tensionNoise.buffer=this.noise;this.tensionNoise.loop=true;
          this.tensionFilter=this.ctx.createBiquadFilter();this.tensionFilter.type='lowpass';this.tensionFilter.frequency.value=90;
          this.tensionGain=this.ctx.createGain();this.tensionGain.gain.value=0;
          this.tensionNoise.connect(this.tensionFilter);this.tensionFilter.connect(this.tensionGain);this.tensionGain.connect(this.ambientGain);this.tensionNoise.start();
        }
        if(!this.motionNoise){
          this.motionNoise=this.ctx.createBufferSource();this.motionNoise.buffer=this.noise;this.motionNoise.loop=true;
          this.motionFilter=this.ctx.createBiquadFilter();this.motionFilter.type='lowpass';this.motionFilter.frequency.value=220;
          this.motionGain=this.ctx.createGain();this.motionGain.gain.value=0;this.motionNoise.connect(this.motionFilter);this.motionFilter.connect(this.motionGain);this.motionGain.connect(this.master);this.motionNoise.start();
          this.feedOsc=this.ctx.createOscillator();this.feedOsc.type='sine';this.feedOsc.frequency.value=35;this.feedGain=this.ctx.createGain();this.feedGain.gain.value=0;this.feedOsc.connect(this.feedGain);this.feedGain.connect(this.master);this.feedOsc.start();
        }
        if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
        this.setVolume();
      } catch (_) { this.ctx = null; }
    }
    setStage(stage,type) {
      const phase=['nebula','neutron','magnetar','strange','gravastar'].includes(type)?type:stage>=15?'blackhole':stage>=9?'stellar':stage>=3?'planetary':'asteroid';
      if(!this.ctx||phase===this.phase)return;this.phase=phase;
      const profiles={asteroid:{f:[43.65,65.41,87.4],g:[.10,.035,.02],cutoff:180,noise:.018},planetary:{f:[55,82.41,110],g:[.09,.075,.035],cutoff:360,noise:.026},stellar:{f:[65.41,98,130.81],g:[.08,.06,.05],cutoff:720,noise:.018},blackhole:{f:[29.14,43.65,58.27],g:[.12,.07,.04],cutoff:130,noise:.05},nebula:{f:[43.65,69.3,87.4],g:[.05,.025,.02],cutoff:380,noise:.038},neutron:{f:[82.41,123.47,164.81],g:[.055,.022,.016],cutoff:880,noise:.007},magnetar:{f:[65.41,130.81,196],g:[.075,.035,.02],cutoff:520,noise:.026},strange:{f:[58.27,87.31,116.54],g:[.085,.042,.025],cutoff:320,noise:.019},gravastar:{f:[43.65,65.41,130.81],g:[.08,.025,.035],cutoff:240,noise:.012}};
      const p=profiles[phase],t=this.ctx.currentTime;this.profile=p;
      this.ambientVoices.forEach((v,i)=>{v.osc.type=phase==='planetary'&&i===2?'triangle':'sine';v.osc.frequency.setTargetAtTime(p.f[i],t,2);v.gain.gain.setTargetAtTime(p.g[i],t,2);});
      this.ambientFilter.frequency.setTargetAtTime(p.cutoff,t,2);this.noiseGain.gain.setTargetAtTime(p.noise,t,2);
    }
    // Nearby gas density lifts the noise bed and opens the filter slightly, so busy regions
    // read as "full" without any additional synthesis.
    setDensity(density){
      if(!this.ctx||!this.profile||!this.noiseGain)return;
      const d=A.clamp(Number(density)||0,0,1);if(Math.abs(d-this.density)<.02)return;this.density=d;
      const t=this.ctx.currentTime;
      this.noiseGain.gain.setTargetAtTime(this.profile.noise*(1+d*1.35),t,1.2);
      this.ambientFilter.frequency.setTargetAtTime(this.profile.cutoff*(1+d*.55),t,1.2);
    }
    setTension(level){
      if(!this.ctx||!this.tensionGain)return;
      const target=A.clamp(Number(level)||0,0,1);if(Math.abs(target-this.tension)<.02)return;
      const rising=target>this.tension;this.tension=target;
      // Two-second release when the threat clears; a touch quicker on the way up.
      this.tensionGain.gain.setTargetAtTime(this.active?target*.055:0,this.ctx.currentTime,rising?.55:.7);
      this.tensionFilter.frequency.setTargetAtTime(70+target*130,this.ctx.currentTime,.8);
    }
    setMotion(thrust,boost,brake,feeding=0){
      if(!this.ctx||!this.motionGain)return;const q=boost?1:brake?.16:thrust?.3:0,f=A.clamp(feeding,0,1),t=this.ctx.currentTime;
      if(this.motionLevel!==q){this.motionLevel=q;this.motionGain.gain.setTargetAtTime(this.active?q*.038:0,t,.08);this.motionFilter.frequency.setTargetAtTime(boost?740:brake?145:280,t,.12);}
      if(this.feedLevel===undefined||Math.abs(this.feedLevel-f)>.025){this.feedLevel=f;this.feedGain.gain.setTargetAtTime(this.active?f*.025:0,t,.65);this.feedOsc.frequency.setTargetAtTime((this.phase==='blackhole'?32:65)+f*18,t,.8);}
    }
    setFinalProximity(value){if(!this.ctx||!this.profile||!this.ambientVoices.length)return;const q=A.clamp(value,0,1);if(Math.abs(q-(this.finalProximity||0))<.02)return;this.finalProximity=q;const t=this.ctx.currentTime;this.ambientVoices[0].osc.frequency.setTargetAtTime(this.profile.f[0]*(1-q*.16),t,2);this.ambientFilter?.frequency.setTargetAtTime(this.profile.cutoff*(1+this.density*.55)*(1-q*.25),t,2);}
    setVolume() {
      if (!this.ctx) return;
      const s = A.Save.data.settings;
      this.master.gain.setTargetAtTime(s.mute ? 0 : A.clamp(Number(s.volume) || 0, 0, 1) * .55, this.ctx.currentTime, .04);
      this.ambientGain.gain.setTargetAtTime(this.active ? A.clamp(Number(s.ambient) || 0, 0, 1) : 0, this.ctx.currentTime, .6);
      if(this.finalGain)this.finalGain.gain.setTargetAtTime(this.active?1:0,this.ctx.currentTime,.12);
      if(this.tensionGain)this.tensionGain.gain.setTargetAtTime(this.active&&!s.mute?this.tension*.055:0,this.ctx.currentTime,.4);
      if(this.motionGain)this.motionGain.gain.setTargetAtTime(this.active?(this.motionLevel||0)*.038:0,this.ctx.currentTime,.08);
      if(this.feedGain)this.feedGain.gain.setTargetAtTime(this.active?(this.feedLevel||0)*.025:0,this.ctx.currentTime,.4);
    }
    setActive(active) { this.active = active; this.setVolume(); }
    tone(freq, end, length, volume, type = 'sine', delay = 0, final = false) {
      const c = this.ctx, t = c.currentTime + delay, osc = c.createOscillator(), gain = c.createGain();
      osc.type = type; osc.frequency.setValueAtTime(freq, t); osc.frequency.exponentialRampToValueAtTime(Math.max(15, end), t + length);
      gain.gain.setValueAtTime(0, t); gain.gain.linearRampToValueAtTime(volume, t + (final?Math.min(.35,length*.3):.012)); gain.gain.exponentialRampToValueAtTime(.0001, t + length);
      osc.connect(gain); gain.connect(final&&this.finalGain?this.finalGain:this.master); osc.start(t); osc.stop(t + length + .025);
      osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    }
    noiseHit(length, volume, cutoff = 800) {
      const c = this.ctx, t = c.currentTime, src = c.createBufferSource(), gain = c.createGain(), filter = c.createBiquadFilter();
      src.buffer = this.noise; filter.type = 'lowpass'; filter.frequency.value = cutoff;
      gain.gain.setValueAtTime(volume, t); gain.gain.exponentialRampToValueAtTime(.0001, t + length);
      src.connect(filter); filter.connect(gain); gain.connect(this.master); src.start(t); src.stop(t + length);
      src.onended = () => { src.disconnect(); filter.disconnect(); gain.disconnect(); };
    }
    play(name, strength = .3) {
      if (!this.ctx || this.ctx.state !== 'running' || A.Save.data.settings.mute) return;
      if(name.startsWith('final')&&!this.active)return;
      strength=A.clamp(Number(strength)||.01,.01,1);
      const now = this.ctx.currentTime, limit = ['stableOrbit','ejection','infall'].includes(name)?.6:['orbitCapture','diskEntry'].includes(name)?.35: name === 'absorb' ? .085 : name === 'collision' ? .13 : .045;
      if (now - (this.last[name] ?? -100) < limit) return; this.last[name] = now;
      const size=Math.log1p(strength*60)/Math.log(61), pitch=700-size*480, volume=.025+size*.12;
      switch (name) {
        case 'finalZone':this.tone(58.27,87.31,.8,.035,'sine',0,true);this.tone(116.54,130.81,.9,.018,'sine',.12,true);break;
        case 'finalPulse':this.tone(35,29.14,.65,.012,'sine',0,true);break;
        case 'finalMerge':[29.14,43.65,58.27,87.31].forEach((f,i)=>this.tone(f,f*1.06,1.8,.02,'sine',i*.18,true));break;
        case 'finalArrival':[130.81,196,261.63].forEach((f,i)=>this.tone(f,f,.9,.03,'sine',i*.20,true));break;
        case 'advancement-task':this.tone(523.25,523.25,.35,.045);this.tone(659.25,659.25,.42,.036,'sine',.09);break;
        case 'advancement-goal':[392,523.25,659.25].forEach((f,i)=>this.tone(f,f,.65,.05,'sine',i*.12));break;
        case 'advancement-challenge':this.tone(130.81,196,.8,.055);[523.25,659.25,783.99,1046.5].forEach((f,i)=>this.tone(f,f*1.003,.9,.045,'sine',i*.13));break;
        case 'objective':[261.63,329.63,392].forEach((f,i)=>this.tone(f,f,.55,.055,'sine',i*.11));break;
        case 'discovery':this.tone(196,261.63,.7,.035);this.tone(392,523.25,.7,.022,'sine',.16);break;
        case 'condensate':this.tone(160,320,.8,.03+size*.055);this.tone(240,360,.7,.02+size*.03,'sine',.1);break;
        case 'forecast':this.tone(330,330,.2,.055);this.tone(440,440,.25,.04,'sine',.3);break;
        case 'flare':this.noiseHit(1.2,.09,700);this.tone(85,170,1.1,.06);break;
        case 'magnetar':this.tone(55,220,.7,.1,'triangle');this.noiseHit(.6,.1,1400);break;
        case 'resonance':this.tone(220,220,.6,.05);this.tone(330,330,.8,.04,'sine',.15);break;
        case 'petEvolution':[330,440,660].forEach((f,i)=>this.tone(f,f, .5,.05,'sine',i*.13));break;
        case 'sample': this.tone(480,840,.18,.06);if(strength>.5)this.tone(960,1200,.3,.04,'sine',.08);break;
        case 'egg':this.tone(320,640,.5,.07);this.tone(480,720,.5,.04,'sine',.1);break;
        case 'hatch':[523.25,659.25,783.99,1046.5].forEach((f,i)=>this.tone(f,f*1.005,.6,.065,'sine',i*.11));break;
        case 'shellCrack':this.noiseHit(.12,.035+size*.025,1400);this.tone(340,180,.16,.025);break;
        case 'hatchReveal':[392,523.25,659.25].forEach((f,i)=>this.tone(f,f,.4+size*.4,.025+size*.025,'sine',i*.12));break;
        case 'legendaryHatch':this.tone(98,196,1.2,.045);[392,587.33,783.99,1174.66].forEach((f,i)=>this.tone(f,f*1.002,1.3,.042,'sine',i*.2));break;
        case 'legacy':[196,261.63,392,523.25].forEach((f,i)=>this.tone(f,f,.9,.045,'sine',i*.19));break;
        case 'orbitCapture': this.tone(pitch,pitch*.72,.22+size*.5,volume); if(size>.5)this.tone(80,60,.65,volume*.4);break;
        case 'stableOrbit': this.tone(pitch*.6,pitch*.6,.5+size*.7,volume);this.tone(pitch*.9,pitch*.9,.7+size*.5,volume*.65,'sine',.12);break;
        case 'ejection': this.tone(pitch*.6,pitch*1.5,.35+size*.7,volume,'triangle');break;
        // A rising major triad, lightly arpeggiated, for an already-existing milestone.
        case 'moment': [392,493.88,587.33].forEach((f,i)=>this.tone(f,f*1.004,1.1,.05,'sine',i*.13));break;
        case 'infall': this.tone(pitch*.65,28,.4+size*.8,volume);this.noiseHit(.25+size*.65,volume*.6,400+size*650);break;
        case 'diskEntry': this.tone(pitch,pitch*.42,.3+size*.6,volume*.55);this.noiseHit(.3+size*.7,volume*.4,250+size*450);break;
        case 'mining':this.noiseHit(.13,.025+strength*.025,1350);this.tone(180,95,.17,.022);break;
        case 'laser':this.tone(620,190,.13,.018+strength*.02,'triangle');break;
        case 'turret':this.noiseHit(.08,.024+strength*.02,700);this.tone(130,65,.12,.021);break;
        case 'absorb': { const n = 300 + (Math.floor(now * 5) % 5) * 53; this.tone(n, n * 1.75, .23, .055 + strength * .08); this.tone(85, 52, .2, .07); break; }
        case 'collision': this.noiseHit(.55, .28 + strength * .25, 1200); this.tone(110, 24, .65, .24); break;
        case 'supernova-singularity':this.noiseHit(1.8,.32,1100);this.tone(125,24,3.2,.2);this.tone(392,36,2.5,.065,'sine',.5);break;
        case 'supernova-nebula':this.noiseHit(3.5,.22,640);[130.81,196,261.63].forEach((f,i)=>this.tone(f,f*1.5,3.2,.055,'sine',i*.18));break;
        case 'supernova-neutron':this.noiseHit(1.1,.27,1400);this.tone(65,260,1,.15,'triangle');[0,.35,.7,1.05].forEach(t=>this.tone(523.25,392,.3,.06,'sine',t));break;
        case 'supernova-gravastar':this.noiseHit(1.8,.22,520);this.tone(55,110,2.3,.16);[220,330,440].forEach((f,i)=>this.tone(f,f,2.5,.05,'sine',i*.23));break;
        case 'evolution': this.noiseHit(1.7, .5, 1600); this.tone(45, 95, 2.3, .25); [130.81, 196, 261.63, 392, 523.25].forEach((f, i) => this.tone(f, f * 1.006, 2.5, .09, 'sine', i * .16)); break;
        case 'upgrade': [392, 493.88, 587.33].forEach((f, i) => this.tone(f, f, .45, .075, 'sine', i * .1)); break;
        case 'danger': this.tone(196, 174.61, .45, .11, 'triangle'); this.tone(196, 174.61, .45, .08, 'triangle', .4); break;
        case 'boost': this.noiseHit(.35, .09, 560); this.tone(60, 95, .28, .06); break;
        case 'pulse': this.tone(65, 260, .55, .15); this.noiseHit(.6, .15, 1400); break;
        case 'event': this.tone(110, 164.81, 1.4, .14); this.tone(220, 329.63, 1.4, .065, 'sine', .15); break;
        case 'over': this.tone(146.83, 36.7, 2, .2); this.noiseHit(1.3, .18, 500); break;
        default: this.tone(600, 820, .07, .045);
      }
    }
  };
})(window.AC);
