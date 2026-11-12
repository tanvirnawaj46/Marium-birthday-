const C=CONFIG,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
// older iPhones (no dvh): keep --vh equal to the visible height
if(!(window.CSS&&CSS.supports&&CSS.supports('height','1dvh'))){const sv=()=>document.documentElement.style.setProperty('--vh',innerHeight*.01+'px');sv();addEventListener('resize',sv);addEventListener('orientationchange',()=>setTimeout(sv,300))}
// status-bar / address-bar tint follows each page's background (no stray bar colour)
let THEME={"0":["#fbe0f1","#f2dff3"],"1":["#fbe0f1","#f2dff3"],"2":["#fbe0f1","#f2dff3"],"3":["#fbe0f1","#f2dff3"],"4":["#fbe0f1","#f2dff3"],"5":["#fbe0f1","#f2dff3"],"6":["#fbe0f1","#f2dff3"],"7":["#fbe0f1","#f2dff3"],"8":["#fbe0f1","#f2dff3"],"9":["#fbe0f1","#f2dff3"],"10":["#fbe0f1","#f2dff3"],"11":["#fbe0f1","#f2dff3"],"12":["#fbe0f1","#f2dff3"],"13":["#fbe0f1","#f2dff3"],"14":["#fbe0f1","#f2dff3"],"15":["#fbe0f1","#f2dff3"],"16":["#fbe0f1","#f2dff3"],"17":["#fbe0f1","#f2dff3"],"18":["#fbe0f1","#f2dff3"],"19":["#fbe0f1","#f2dff3"],"20":["#fbe0f1","#f2dff3"]},TM=document.querySelector('meta[name=theme-color]');
function setTheme(n){const t=THEME[n]||['#fbe0f2','#d9dfff'];if(TM)TM.setAttribute('content',t[0]);const g=`linear-gradient(${t[0]},${t[1]})`;
 [document.documentElement,document.body].forEach(el=>{el.style.backgroundImage=g;el.style.backgroundColor=t[0]});}
// Safari tints its status bar / bottom bar from solid fixed elements sitting on the screen edges (and from theme-color).
// Every page gets a solid top strip + bottom strip in that page's real edge colour, painted under the page content.
$$('.pg').forEach(pg=>{const t=THEME[+pg.id.slice(1)];if(!t)return;['T','B'].forEach((k,i)=>{const s=document.createElement('i');s.className='edge e'+k;s.style.setProperty('--ec',t[i]);pg.append(s)})});
let cur=0,timers=[];const later=(f,t)=>timers.push(setTimeout(f,t));
// ---------- stars ----------
for(let i=0;i<70;i++){const s=document.createElement('i');s.style.cssText=`left:${Math.random()*100}%;top:${Math.random()*100}%;animation-delay:${Math.random()*3}s;opacity:${.3+Math.random()*.7}`;$('#stars').append(s)}
// ---------- audio ----------
const AC=new(window.AudioContext||window.webkitAudioContext)();
try{if(navigator.audioSession)navigator.audioSession.type='playback'}catch(e){} // iPhone: play even with silent switch on
// ================= MIXER =================
// priority: voice > scratch > typing > arrow/heart/click > music
// effects -> SB -> compressor ; music -> MG ; voice -> VG ; all -> sum -> hard limiter -> speakers
const SB=AC.createGain();SB.gain.value=1.5;
const CP=AC.createDynamicsCompressor();CP.threshold.value=-5;CP.knee.value=10;CP.ratio.value=2.5;CP.attack.value=.002;CP.release.value=.16;
const MG=AC.createGain();MG.gain.value=.26;
const VG=AC.createGain();VG.gain.value=5.5;
const VC=AC.createDynamicsCompressor();VC.threshold.value=-26;VC.knee.value=10;VC.ratio.value=5;VC.attack.value=.003;VC.release.value=.15;
const MXB=AC.createGain();
const LM=AC.createDynamicsCompressor();LM.threshold.value=-2;LM.knee.value=0;LM.ratio.value=20;LM.attack.value=.001;LM.release.value=.08;
SB.connect(CP);CP.connect(MXB);MG.connect(MXB);VG.connect(VC);VC.connect(MXB);const PG=AC.createGain();PG.gain.value=.5;
const SAT=AC.createWaveShaper();(()=>{const N=4096,c=new Float32Array(N);for(let i=0;i<N;i++){const x=(i/(N-1)*2-1)*2,a=Math.abs(x);c[i]=Math.sign(x)*(a<=.6?a:.6+.4*Math.tanh((a-.6)/.4))}SAT.curve=c})();
MXB.connect(LM);LM.connect(PG);PG.connect(SAT);SAT.connect(AC.destination);
const RV=AC.createConvolver(),RG=AC.createGain();RG.gain.value=.5;
(()=>{const n=Math.floor(AC.sampleRate*1.8),b=AC.createBuffer(2,n,AC.sampleRate);for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2.6)}RV.buffer=b})();
RV.connect(RG);RG.connect(SB);
const NB=(()=>{const n=AC.sampleRate*2,b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;return b})();
let LVL=1;
function out(g,rv){g.connect(SB);if(rv){const s=AC.createGain();s.gain.value=rv;g.connect(s);s.connect(RV)}}
function tone(f,d,type='sine',v=.12,sl=0,dl=0,rv=.25){if(AC.state!=='running')return;v*=LVL;const t=AC.currentTime+dl,o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(sl)o.frequency.exponentialRampToValueAtTime(sl,t+d);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);out(g,rv);o.start(t);o.stop(t+d+.03)}
function noise(d,v=.2,o={}){if(AC.state!=='running')return;v*=LVL;const t=AC.currentTime+(o.dl||0),s=AC.createBufferSource(),g=AC.createGain();s.buffer=NB;s.loop=true;let n=s;
 if(o.hp){const f=AC.createBiquadFilter();f.type='highpass';f.frequency.value=o.hp;n.connect(f);n=f}
 if(o.bp){const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.setValueAtTime(o.bp,t);if(o.bp2)f.frequency.exponentialRampToValueAtTime(o.bp2,t+d);f.Q.value=o.q||1;n.connect(f);n=f}
 if(o.lp){const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=o.lp;n.connect(f);n=f}
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,v),t+(o.a||.004));g.gain.exponentialRampToValueAtTime(.0001,t+d);n.connect(g);out(g,o.rv||0);s.start(t,Math.random()*1.5);s.stop(t+d+.03)}
// ---- music level state: voice/video push music way down, effects dip it briefly ----
const WA=/^https?:/.test(location.protocol); // WebAudio routing needs same-origin (https / localhost)
const MIXS={voice:0,video:0,dip:1,base:.3,vduck:.035,dt:0};
let MUSIC_WA=false;
function musicLevel(){return !musOn?0:MIXS.voice?MIXS.vduck:MIXS.video?.03:MIXS.base*MIXS.dip}
function applyMix(tc=.25){const t=AC.currentTime,v=musicLevel();
 if(MUSIC_WA)MG.gain.setTargetAtTime(v,t,tc);else if(typeof bgm!=='undefined')bgm.volume=Math.min(1,v*2.4);
 SB.gain.setTargetAtTime(MIXS.voice?.6:1.5,t,.12)}
function dip(d,ms){if(MIXS.voice||MIXS.video)return;MIXS.dip=d;applyMix(.04);clearTimeout(MIXS.dt);MIXS.dt=setTimeout(()=>{MIXS.dip=1;applyMix(.35)},ms)}
const KP=[.9,1,1.09,1.2];
// mechanical-keyboard "thock": click transient + resonant body + plate noise, then a quieter key-up tick; varied per key
function kbHit(o){if(AC.state!=='running')return;const t=AC.currentTime,V=(o.v||1)*LVL,p=o.p||1,d=o.d||.085,mk=()=>{const g=AC.createGain();let n=g;if(AC.createStereoPanner){const sp=AC.createStereoPanner();sp.pan.value=o.pan||0;g.connect(sp);n=sp}out(n,.07);return g};
 const nz=(at,len,v,f,q,hp)=>{const s=AC.createBufferSource(),g=mk(),b=AC.createBiquadFilter();s.buffer=NB;b.type='bandpass';b.frequency.value=f;b.Q.value=q;let n=s;if(hp){const h=AC.createBiquadFilter();h.type='highpass';h.frequency.value=hp;s.connect(h);n=h}n.connect(b);b.connect(g);g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(Math.max(.0002,v),at+.0012);g.gain.exponentialRampToValueAtTime(.0001,at+len);s.start(at,Math.random()*1.5);s.stop(at+len+.02)};
 const ts=(at,f0,f1,len,v,type)=>{const os=AC.createOscillator(),g=mk();os.type=type||'sine';os.frequency.setValueAtTime(f0,at);os.frequency.exponentialRampToValueAtTime(f1,at+len);g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(v,at+.003);g.gain.exponentialRampToValueAtTime(.0001,at+len);os.start(at);os.stop(at+len+.02)};
 nz(t,.014,.55*V,3300*p,1.1,2200);                 // top-out click
 ts(t,185*p,92*p,d,.62*V);ts(t,430*p,250*p,.03,.14*V,'triangle');  // thock body
 nz(t+.002,.04,.26*V,1050*p,2.2);nz(t,.022,.3*V,420,.7);           // case + plate
 if(o.sp){nz(t+.007,.012,.2*V,2600,1.4,1800);nz(t+.017,.012,.16*V,3100,1.4,1800)}  // spacebar stabiliser rattle
 if(o.up!==0){const u=t+.058+Math.random()*.035;nz(u,.01,.22*V*(o.sp?1.3:1),4300,1.6,3000);ts(u,520*p,380*p,.022,.05*V)}   // key-up
};
const MEL=[[392,.75],[392,.25],[440,1],[392,1],[523,1],[494,2],[392,.75],[392,.25],[440,1],[392,1],[587,1],[523,2],[392,.75],[392,.25],[784,1],[659,1],[523,1],[494,1],[440,1],[698,.75],[698,.25],[659,1],[523,1],[587,1],[523,2]];
const PENT=[523,587,659,784,880,1047,1175,1319,1568,1760,1976,2349,2637,3136];
const SFX={
 tap(){tone(680,.14,'sine',.2,980,0,.15);tone(1360,.07,'triangle',.06,0,0,.1);tone(150,.14,'sine',.22,55,0,0)},
 btn(){tone(130,.28,'sine',.36,46,0,0);noise(.04,.1,{hp:3500});tone(880,.4,'sine',.14,0,.02,.35);tone(1320,.5,'sine',.1,0,.07,.4);tone(1760,.6,'triangle',.05,0,.12,.4)},
 photo(){noise(.03,.32,{bp:3800,q:.8});noise(.04,.28,{bp:2400,q:.8,dl:.07});tone(1760,.4,'sine',.16,0,.1,.4);tone(2349,.5,'sine',.1,0,.16,.4)},
 pop(){noise(.1,.5,{hp:900,lp:9000});tone(320,.12,'square',.12,60,0,.05);tone(90,.16,'sine',.3,40,0,0)},
 pop2(){noise(.08,.35,{hp:700});tone(260,.18,'sine',.2,90,0,.2);tone(520,.1,'triangle',.07,260,0,.1)},
 good(){SFX.pop();[784,988,1175,1568].forEach((f,i)=>tone(f,.45,'triangle',.11,0,.08+i*.07,.45))},
 burst(){tone(70,.7,'sine',.5,28,0,0);noise(.6,.3,{bp:900,bp2:200,q:.7});tone(600,.5,'triangle',.12,150,0,.3);[1046,1318,1568,2093].forEach((f,i)=>tone(f,.8,'sine',.08,0,.05+i*.06,.5))},
 cake(){tone(520+Math.random()*200,.25,'triangle',.18,0,0,.25)},
 open(){noise(.5,.32,{bp:1800,bp2:600,q:.6,a:.1,rv:.2});tone(200,.6,'sawtooth',.09,500,0,.1);tone(800,.8,'sine',.11,0,0,.4);tone(1320,.9,'sine',.08,0,.25,.5)},
 chime(){[660,880,1100].forEach((f,i)=>tone(f,.6,'sine',.17,0,i*.09,.4))},
 shoot(){tone(420,.35,'triangle',.2,120,0,.1);tone(210,.5,'sine',.16,90,0,0);noise(.22,.25,{bp:2500,bp2:6000,q:.9,rv:.1})},
 stretch(p){tone(150+p*2.2,.09,'sawtooth',.03,0,0,0);noise(.1,.1,{bp:650+p*7,q:2.2,a:.01})},
 scrF(sp,pr){const c=2800+pr*3200+Math.random()*600;noise(.17,.2+.22*sp,{bp:c,q:1.1,a:.03,hp:1400});noise(.15,.16+.16*sp,{bp:1100+Math.random()*500,q:.8,a:.03});if(Math.random()<.4)tone(3200+Math.random()*2800,.09,'sine',.05,0,0,.3)},
 scrM(sp){ // watery: soft liquid swish over wet glass + bubbly water droplets + faint glass squeak
  noise(.26,.14+.2*sp,{bp:1500+Math.random()*700,bp2:900+Math.random()*500,q:.5,lp:4200,hp:350,a:.09});
  noise(.22,.08+.1*sp,{bp:380+Math.random()*120,q:.7,lp:900,a:.08});
  noise(.1,.03+.05*sp,{hp:7000,lp:11000,a:.05});
  const n=1+(Math.random()<.5)+(sp>.5&&Math.random()<.5);
  for(let i=0;i<n;i++){const f=500+Math.random()*900,dl=Math.random()*.16;tone(f,.07+Math.random()*.05,'sine',.07+.09*sp,f*(1.8+Math.random()*1.2),dl,.15);if(Math.random()<.5)tone(f*2.4,.04,'sine',.025,f*3.5,dl+.01,.1)}
  if(Math.random()<.35)noise(.03,.16,{bp:1300+Math.random()*900,q:3,a:.002,dl:Math.random()*.15});
  if(sp>.4&&Math.random()<.25){const f=2000+Math.random()*1200;tone(f,.09,'sine',.03+.04*sp,f*1.12,0,.4)}},
 foilDone(){tone(80,.9,'sine',.45,30,0,0);noise(.9,.3,{bp:500,bp2:5000,q:.6,a:.25,rv:.35});[1046,1318,1568,2093,2637].forEach((f,i)=>tone(f,.9,'triangle',.11,0,.1+i*.07,.55));tone(3136,1.2,'sine',.06,0,.5,.6)},
 key(c){kbHit({p:KP[(c?c.charCodeAt(0):Math.random()*4|0)%4]*(.96+Math.random()*.08),v:.82+Math.random()*.3,pan:(Math.random()-.5)*.5,up:1})},
 keyS(){kbHit({p:.6+Math.random()*.04,v:1.05,d:.15,pan:(Math.random()-.5)*.2,up:1,sp:1})},
 enter(){kbHit({p:.52,v:1.2,d:.18,pan:0,up:1,sp:1})},
 back(){kbHit({p:.82,v:.8,pan:(Math.random()-.5)*.3,up:0})},
 scribble(){noise(.8,.2,{bp:3300,bp2:2300,q:.8,a:.12,hp:1600,rv:.1});[.1,.26,.42,.58].forEach(d=>noise(.05,.1,{hp:5000,dl:d}))},
 sign(){noise(.3,.28,{bp:2500,bp2:6500,q:.9,a:.05,rv:.2});[1568,2093,2637].forEach((f,i)=>tone(f,.5,'sine',.1,0,.12+i*.08,.5))},
 seal(){noise(.07,.5,{hp:1500});tone(240,.22,'sine',.4,70,0,0);tone(1800,.16,'triangle',.12,900,0,.2);noise(.25,.2,{bp:3000,bp2:1500,q:.6,dl:.05})},
 whoosh(){noise(.7,.32,{bp:400,bp2:3200,q:.5,a:.18,rv:.3});tone(300,.6,'sine',.1,900,0,.3)},
 flap(){noise(.26,.42,{bp:2000,bp2:800,q:.5,a:.02,rv:.15});noise(.05,.3,{hp:4500,dl:.04});tone(120,.16,'sine',.4,58,.78,0);noise(.04,.3,{bp:1500,q:.8,dl:.8})},
 stamp(){tone(120,.14,'sine',.55,50,0,0);noise(.05,.3,{bp:2800,q:.8});tone(1568,.35,'sine',.08,0,.08,.4);tone(2093,.3,'sine',.04,0,.14,.4)},
 star(i){const f=PENT[Math.max(0,Math.min(13,i|0))];tone(f,.9,'sine',.12,0,0,.5);tone(f*2,.5,'sine',.04,0,0,.4)},
 meter(){tone(300,1.6,'sine',.12,1400,0,.3)},
 mb(f=0){if(f<60)f=MEL[f%MEL.length][0];tone(f,1.2,'sine',.14,0,0,.5);tone(f*3,.4,'sine',.035,0,0,.3);tone(f*2,.6,'sine',.05,0,0,.4)},
 puff(){noise(.5,.3,{bp:500,bp2:1400,q:.4,a:.1})},
 plant(k){const f=PENT[Math.max(0,Math.min(13,k|0))];tone(f,.6,'sine',.1,0,0,.4);noise(.05,.12,{bp:1800,q:.6})},
 meteor(){tone(3520,.9,'sine',.07,700,0,.5);noise(.8,.16,{bp:5200,bp2:1400,q:.7,a:.06,rv:.25});[2093,2637,3136,3951].forEach((f,i)=>tone(f,.55,'sine',.045,0,.2+i*.09,.5))},
 slide(){noise(1,.34,{bp:2300,bp2:4300,q:.45,a:.28,hp:900,rv:.1});noise(.5,.2,{bp:3600,q:.6,a:.1,dl:.45})},
 unfold(){[0,45,100,160,230,320,420].forEach((ms,i)=>noise(.035+Math.random()*.03,.3-i*.02,{bp:2600+Math.random()*3000,q:.7,a:.002,dl:ms/1000}));noise(.4,.28,{bp:700,bp2:2200,q:.4,a:.08,rv:.1})},
 paper(){noise(.4,.34,{bp:2600,bp2:1200,q:.4,a:.05});noise(.28,.24,{hp:5000,dl:.12})},
 frostDone(){noise(.55,.2,{bp:2600,bp2:900,q:.4,hp:600,a:.12,rv:.3});noise(.4,.1,{hp:6000,a:.1,dl:.05});[1318,1976,2637,3322].forEach((f,i)=>tone(f,1.4,'sine',.07/(1+i*.3),0,.12+i*.09,.7));[0,.17,.31].forEach(d=>noise(.012,.18,{bp:5200,q:2,a:.001,dl:.25+d}))}
};
// priority: scratch (loudest effect) > typing > arrow/heart > ui clicks ; each effect also dips the music briefly so it always cuts through
const CAT={star:1.3,puff:1.2,mb:1.2,meter:1.2,plant:1.2,meteor:1.2,stamp:1.3,ret:1.1,scrF:6.5,scrM:6.5,foilDone:.9,frostDone:.9,key:1.5,keyS:1.4,enter:1.4,back:1.3,scribble:1.6,sign:1,shoot:1.1,stretch:9,pop:1.1,pop2:1.1,good:1.05,burst:.8,btn:.95,seal:.9,photo:1.4,chime:1.2,open:1.4,whoosh:1.4,paper:1.3,sign:1.4,flap:1.5,slide:1.5,unfold:1.5};
const DIP={star:[.6,400],puff:[.6,600],mb:[.55,700],meter:[.6,1700],plant:[.6,350],meteor:[.55,1000],stamp:[.55,500],ret:[.55,500],scrF:[.5,380],scrM:[.5,380],foilDone:[.45,1400],frostDone:[.5,1200],key:[.55,420],keyS:[.55,420],enter:[.55,500],back:[.6,300],scribble:[.6,900],sign:[.55,800],shoot:[.5,600],stretch:[.6,300],pop:[.5,600],pop2:[.55,500],good:[.5,900],burst:[.45,1200],tap:[.6,450],btn:[.55,550],photo:[.6,500],cake:[.7,300],open:[.55,900],chime:[.6,700],seal:[.5,600],whoosh:[.55,800],paper:[.6,500],flap:[.6,700],slide:[.6,1100],unfold:[.6,900]};
Object.keys(SFX).forEach(k=>{const f=SFX[k],g=CAT[k]||1,d=DIP[k];SFX[k]=(...a)=>{const o=LVL;LVL=g;try{if(d)dip(d[0],d[1]);return f(...a)}finally{LVL=o}}});
const bgm=new Audio(C.music);bgm.loop=true;bgm.preload='auto';let musOn=true,started=false,bgmOk=true,hold=0;
bgm.onerror=()=>bgmOk=false;
if(WA){try{AC.createMediaElementSource(bgm).connect(MG);MG.gain.value=0;MUSIC_WA=true}catch(e){MUSIC_WA=false}}
if(!MUSIC_WA)bgm.volume=Math.min(1,MIXS.base*2.4);
function startMusic(){if(started)return;started=true;AC.resume();if(musOn){bgm.play().catch(()=>{});applyMix(.9)}}
const wake=()=>{if(AC.state!=='running')AC.resume().catch(()=>{})};
document.addEventListener('visibilitychange',()=>{if(!document.hidden){wake();if(started&&musOn&&!hold&&bgm.paused)bgm.play().catch(()=>{})}});
addEventListener('pointerdown',startMusic,{once:true});
// iOS only accepts audio from touchend/click, not pointerdown: keep retrying on every gesture until the music is really playing
(()=>{const ev=['pointerdown','touchstart','touchend','click'],f=()=>{AC.resume().catch(()=>{});if(musOn&&!hold&&bgm.paused){started=true;const p=bgm.play();if(p&&p.then)p.then(()=>applyMix(.9)).catch(()=>{})}if(AC.state==='running'&&!bgm.paused)ev.forEach(t=>removeEventListener(t,f,true))};ev.forEach(t=>addEventListener(t,f,true))})();
// every tap/click gets its own sound (bow, balloons and scratch cards have their own)
addEventListener('pointerdown',e=>{const t=e.target;if(!t||!t.closest)return;const kind=t.closest('#arena,.bal,canvas,#cst')?0:t.closest('.pol,.fr')?'photo':t.closest('#mus')?'tap':t.closest('.btn,button')?'btn':'tap';if(!kind)return;const go_=()=>SFX[kind]();if(AC.state!=='running'){AC.resume().then(go_).catch(()=>{})}else go_()},true);
function bgmResume(){if(musOn&&started&&!hold&&bgm.paused)bgm.play().catch(()=>{});applyMix(.5)}
const VS=[].concat(C.voice||[]);let vi=0,voiceOk=false;const voice=new Audio();voice.preload='auto';
let VOICE_WA=false;if(WA){try{AC.createMediaElementSource(voice).connect(VG);VOICE_WA=true}catch(e){VOICE_WA=false}}
function vtry(){if(vi<VS.length)voice.src=VS[vi++]}voice.onerror=()=>{voiceOk=false;vtry()};voice.oncanplay=()=>voiceOk=true;vtry();
$('#mus').onclick=e=>{e.stopPropagation();musOn=!musOn;$('#mus').textContent=musOn?'♪ On':'♪ Off';if(musOn){if(started&&!hold)bgm.play().catch(()=>{});applyMix(.4)}else{applyMix(.12);setTimeout(()=>{if(!musOn)bgm.pause()},600)}};
// ---------- particles ----------
const cv=$('#fx'),cx=cv.getContext('2d');let P=[],W,H;
function rs(){W=innerWidth;H=innerHeight;const d=Math.min(devicePixelRatio||1,2);cv.width=Math.round(W*d);cv.height=Math.round(H*d);cx.setTransform(d,0,0,d,0,0)}rs();let rt;const rsd=()=>{clearTimeout(rt);rt=setTimeout(()=>{if(Math.abs(innerWidth-W)>2||Math.abs(innerHeight-H)>140)rs()},200)};addEventListener('resize',rsd);addEventListener('orientationchange',()=>setTimeout(rs,300));
const COL=['#f472b6','#fbbf24','#fff','#818cf8','#22d3ee','#fb923c'];
function burst(x,y,n=60,hearts=false){if(RM)n=15;for(let i=0;i<n;i++){const a=Math.random()*6.28,s=2+Math.random()*7;P.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,g:.12,l:1,d:.014+Math.random()*.01,r:3+Math.random()*5,c:COL[i%6],h:hearts&&i%2==0})}}
function rain(n,hearts){for(let i=0;i<n;i++)P.push({x:Math.random()*W,y:-10,vx:Math.random()*2-1,vy:1+Math.random()*2.5,g:0,l:1,d:.003,r:4+Math.random()*4,c:COL[i%6],h:hearts,rect:!hearts})}
let rainOn=null;
function heartPath(x,y,r){cx.beginPath();cx.moveTo(x,y+r*.4);cx.bezierCurveTo(x-r,y-r*.4,x-r*.5,y-r*1.1,x,y-r*.4);cx.bezierCurveTo(x+r*.5,y-r*1.1,x+r,y-r*.4,x,y+r*.4);cx.fill()}
let dirty=0;(function loop(){if(P.length||dirty){cx.clearRect(0,0,W,H);dirty=P.length>0;P=P.filter(p=>p.l>0&&p.y<H+20);if(P.length>420)P=P.slice(-420);for(const p of P){p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.l-=p.d;cx.globalAlpha=Math.max(0,Math.min(1,p.l));cx.fillStyle=p.c;if(p.h)heartPath(p.x,p.y,p.r*1.6);else if(p.rect)cx.fillRect(p.x,p.y,p.r,p.r*1.6);else{cx.beginPath();cx.arc(p.x,p.y,p.r,0,6.28);cx.fill()}}}requestAnimationFrame(loop)})();
function startRain(hearts,rate=400){stopRain();rainOn=setInterval(()=>rain(1,hearts&&Math.random()<.7),RM?900:rate*.4)}
function stopRain(){clearInterval(rainOn);rainOn=null}
let QUIET=0; // 1 while the microphone listens (no chimes then, they would be heard as a blow)
function fireworks(){const i=setInterval(()=>{if(!rainOn&&cur!==12&&cur!==5)return clearInterval(i);if(QUIET)return;burst(W*(.15+Math.random()*.7),H*(.1+Math.random()*.4),40);SFX.chime()},1500);timers.push(i)}
// ---------- floating dreamy layer (per page) ----------
const FLT={
 0:{e:['🦋','🎀','⭐','🫧','🌸','💗','✨'],m:['bob'],o:['#ff9ec9','#b9a3ff','#9fd2ff']},
 1:{e:['💗','🎀','🫧','✨','🦋','💕'],m:['rise'],o:['#ffb3d1','#cfe3ff','#e3d1ff']},
 2:{e:['🫧','✨','💖','🌟','🎀'],m:['rise','bob'],o:['#ffb8dc','#c4b5fd','#ff9ed1']},
 3:{e:['🌸','🦋','🌷','🍃','✨','💮'],m:['fall','bob'],o:['#ffd9a8','#ffb8d9','#fff0b8']},
 4:{e:['✨','💫','⭐','🫧','💗'],m:['rise','bob'],o:['#ff7ab8','#ffa05a','#a78bfa']},
 6:{e:['🎈','🫧','✨','🎀','💗','🦋'],m:['rise'],o:['#ffcfa0','#c084fc','#7aa2ff']},
 7:{e:['✨','💛','⭐','🫧','🌸'],m:['bob','fall'],o:['#ff8fb8','#a78bfa','#ffd27a']},
 8:{e:['✨','⭐','🌙','💫','🫧'],m:['bob','fall'],o:['#8aa0ff','#c4a1ff','#6ee7f9']},
 10:{e:['🌸','💌','💗','🎀','✨','🌷'],m:['fall'],o:['#ff9ec6','#f0abfc','#fcd5a5']},
 11:{e:['🎉','✨','🎈','⭐','🫧'],m:['rise'],o:['#f472b6','#818cf8','#fbbf24']},
 12:{e:['🎈','🌷','🌸','🦋','✨','💖','🎀','⭐','🫧'],m:['rise','bob'],n:10,o:['#6366f1','#ec4899','#22d3ee']},
 13:{e:['🎵','🎶','💗','✨','🫧','🎀'],m:['rise'],o:['#ff9ed1','#a78bfa','#7dd3fc']},
 14:{e:['🦋','🌸','💗','✨','🎀','🌷'],m:['bob','fall'],o:['#ffb4a8','#f9a8d4','#c4b5fd']}
};FLT[5]=FLT[4];FLT[9]=FLT[8];
(function(){const R=(a,b)=>a+Math.random()*(b-a);
 $$('.pg').forEach(pg=>{const t=FLT[+pg.id.slice(1)];if(!t)return;const L=document.createElement('div');L.className='fl';
  t.o.forEach((c,i)=>{const o=document.createElement('b');o.className='orb';o.style.cssText=`--c:${c};--t:${R(14,22).toFixed(1)}s;left:${[8,92,45][i]}%;top:${[8,45,100][i]}%;animation-delay:-${R(0,10).toFixed(1)}s`;L.append(o)});
  const n=RM?6:(t.n||9);
  for(let i=0;i<n;i++){const s=document.createElement('span'),m=t.m[i%t.m.length];s.className=m;s.textContent=t.e[i%t.e.length];
   const T=m==='bob'?R(5,9):R(11,20);
   s.style.cssText=`left:${R(2,94).toFixed(1)}%;${m==='bob'?`top:${R(4,92).toFixed(1)}%;`:''}--z:${R(17,36).toFixed(0)}px;--t:${T.toFixed(1)}s;--w:${R(2.5,5).toFixed(1)}s;--dl:-${R(0,T).toFixed(1)}s;--dx:${R(-40,40).toFixed(0)}px;--op:${R(.6,.92).toFixed(2)}`;L.append(s)}
  pg.prepend(L)})})();
// ---------- navigation ----------
const FLOW=[0,1,3,2,4,5,19,6,16,7,14,17,20,8,10,15,11,18,12];const nextOf=n=>{const i=FLOW.indexOf(n);return i<0?n+1:(FLOW[i+1]??n)};
function go0(n,seam,fast){if(n>20)n=20;const old=seam?$$('.pg.on'):[];voice.pause();$('#vid').pause();hold=0;bgmResume();timers.forEach(t=>{clearTimeout(t);clearInterval(t)});timers=[];stopRain();$$('.pg').forEach(p=>{if(!old.includes(p))p.classList.remove('on')});if(seam)setTimeout(()=>old.forEach(p=>p.classList.remove('on')),900);cur=n;setTheme(n);document.documentElement.classList.remove('ds');scrollTo(0,0);$('#chd').classList.remove('show');$('#chh').classList.remove('show');
 later(()=>{$('#p'+n).classList.add('on');(init[n]||(()=>{}))();tagBn($('#p'+n));wrapEmoji($('#p'+n))},seam||cur===0&&!started?0:fast?40:350)}
// ---- N8d: iris wipe between pages (pink circle grows from the last tap, page swaps under it, then it fades) ----
let tapPt=[0,0,0],irisOn=0;addEventListener('pointerdown',e=>{tapPt=[e.clientX,e.clientY,performance.now()]},true);
function go(n,seam){const ir=$('#iris');if(n>20)n=20;if(irisOn&&!seam)return; // ignore double taps while the wipe runs
 if(!ir||seam||RM||!started||n===5||n===8||n===10)return go0(n,seam);
 irisOn=1;setTimeout(()=>{irisOn=0},2500);const t=performance.now()-tapPt[2]<2000,x=t?tapPt[0]:innerWidth/2,y=t?tapPt[1]:innerHeight*.6,sz=Math.max(innerWidth,innerHeight)*.4,
  sc=(2*Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y))/sz*1.08).toFixed(2);
 ir.style.translate=x+'px '+y+'px';
 ir.animate([{transform:'scale(0)',opacity:1},{transform:'scale('+sc+')',opacity:1}],{duration:520,easing:'cubic-bezier(.45,0,.75,.55)',fill:'forwards'}).onfinish=()=>{go0(n,seam,1);
  ir.animate([{transform:'scale('+sc+')',opacity:1},{transform:'scale('+sc+')',opacity:0}],{duration:420,easing:'ease-out',fill:'forwards'}).onfinish=()=>{ir.getAnimations().forEach(a=>a.cancel());irisOn=0}}}
$$('.go').forEach(b=>b.addEventListener('click',()=>go(nextOf(+b.closest('.pg').id.slice(1)))));
const init={};
// ---------- 1: bow & arrow (aim at the hearts) ----------
const HSV=(i,c,main)=>`<svg viewBox="-4 -4 108 98"><defs><radialGradient id="hg${i}" cx="34%" cy="24%" r="85%"><stop offset="0" stop-color="${c[0]}"/><stop offset=".55" stop-color="${c[1]}"/><stop offset="1" stop-color="${c[2]}"/></radialGradient></defs><path d="M50 88C10 55 0 35 0 22 0 9 10 0 24 0c11 0 21 6 26 15C55 6 65 0 76 0c14 0 24 9 24 22 0 13-10 33-50 66z" fill="url(#hg${i})" stroke="${main?'#ffd36e':c[2]}" stroke-opacity="${main?1:.35}" stroke-width="${main?3.5:1.5}" stroke-linejoin="round"/><path d="M14 21c0-8 5-13 13-13" stroke="#fff" stroke-opacity=".9" stroke-width="5.5" fill="none" stroke-linecap="round"/><ellipse cx="36" cy="14" rx="8" ry="3.5" fill="#fff" opacity=".45" transform="rotate(-20 36 14)"/><path d="M73 20c3 3 5 6 5 10" stroke="#fff" stroke-opacity=".5" stroke-width="3" fill="none" stroke-linecap="round"/>${main?'<path d="M50 30l3.4 7.2 7.8 1-5.7 5.3 1.6 7.7L50 47.4l-7.1 3.8 1.6-7.7-5.7-5.3 7.8-1z" fill="#fff" opacity=".9"/>':''}</svg>`;
init[1]=()=>{const A=$('#arena'),arc=$('#bowArc'),str=$('#str'),sh=$('#shaft'),shl=$('#shl'),shg=$('#shg'),hd=$('#head'),ft=$('#fth'),arw=$('#arrow'),gd=$('#guide'),tt=$('#toast');
 A.querySelectorAll('.hrt').forEach(x=>x.remove());
 const w=A.clientWidth,h=A.clientHeight,bx=w/2,by=h-110,tl=[bx-64,by+14],tr=[bx+64,by+14],rest=[bx,by+14],L=96,MAXP=135;
 arc.setAttribute('d',`M${tl} Q${bx},${by-76} ${tr}`);
 [['#capL',tl],['#capR',tr],['#grip',[bx,by-31]],['#bowglow',[bx,by-10]]].forEach(([q,p])=>{const e=$(q);e.setAttribute('cx',p[0]);e.setAttribute('cy',p[1])});
 // hearts: 1 big golden one = goes to next page, 2 small = just pop
 const mw=Math.min(w*.36,168),dw=Math.min(w*.17,78);
 const HD=[{m:1,x:.5,y:.025,w:mw,c:['#fff0c2','#ff4d84','#a80f55'],g:'#ff3d7f'},{x:.17,y:.4,w:dw,c:['#f3e6ff','#b78cff','#5b2fa0'],g:'#b78cff'},{x:.83,y:.27,w:dw*1.1,c:['#ffe3d1','#ff9a76','#c2410c'],g:'#ff9a76'}];
 const hearts=HD.map((d,i)=>{const el=document.createElement('div');el.className='hrt'+(d.m?' main':'');el.style.cssText=`width:${d.w}px;left:${d.x*w-d.w/2}px;top:${d.y*h}px;--g:${d.g};--d:${(2.6+i*.7).toFixed(1)}s`;el.innerHTML=HSV(i,d.c,d.m);A.insertBefore(el,A.firstChild);return{el,m:!!d.m}});
 let P=rest.slice(),u=[0,-1],state=0,sx=0,sy=0;
 const toast=t=>{tt.textContent=t;tt.classList.remove('show');void tt.offsetWidth;tt.classList.add('show')};
 const draw=(sp,tp)=>{str.setAttribute('points',`${tl} ${sp} ${tr}`);const tip=[tp[0]+u[0]*L,tp[1]+u[1]*L],n=[-u[1],u[0]],pt=(b,a,c)=>`${(b[0]+u[0]*a+n[0]*c).toFixed(1)},${(b[1]+u[1]*a+n[1]*c).toFixed(1)}`,se=[tip[0]-u[0]*10,tip[1]-u[1]*10];
  [[sh,0],[shg,0],[shl,-1.3]].forEach(([e,o])=>{e.setAttribute('x1',tp[0]+n[0]*o);e.setAttribute('y1',tp[1]+n[1]*o);e.setAttribute('x2',se[0]+n[0]*o);e.setAttribute('y2',se[1]+n[1]*o)});
  hd.setAttribute('d',`M${pt(tip,0,0)} L${pt(tip,-22,9.5)} L${pt(tip,-15,0)} L${pt(tip,-22,-9.5)}Z`);
  ft.setAttribute('d',[2,15].map(k=>`M${pt(tp,k,0)} L${pt(tp,k+15,11)} L${pt(tp,k+25,11)} L${pt(tp,k+10,0)}Z M${pt(tp,k,0)} L${pt(tp,k+15,-11)} L${pt(tp,k+25,-11)} L${pt(tp,k+10,0)}Z`).join(' '))};
 const aim=()=>{const vx=rest[0]-P[0],vy=rest[1]-P[1],vm=Math.hypot(vx,vy);u=vm>4?[vx/vm,vy/vm]:[0,-1]};
 const pull=()=>Math.hypot(P[0]-rest[0],P[1]-rest[1]);
 const guide=()=>{const p=pull(),tp=[P[0]+u[0]*L,P[1]+u[1]*L],len=Math.min(430,60+p*3);gd.setAttribute('x1',tp[0]+u[0]*18);gd.setAttribute('y1',tp[1]+u[1]*18);gd.setAttribute('x2',tp[0]+u[0]*(18+len));gd.setAttribute('y2',tp[1]+u[1]*(18+len));gd.setAttribute('stroke',p>=70?'#f59e0b':'#ec4899');gd.style.opacity=p<12?0:Math.min(.9,p/60)};
 const nock=()=>{P=rest.slice();u=[0,-1];draw(P,P);arw.style.display='';arw.classList.remove('nock');void arw.getBoundingClientRect();arw.classList.add('nock');state=0};
 const land=b=>{
  if(!b){arw.style.display='none';toast(['so close 💫','try again ✨','almost! 💕'][Math.random()*3|0]);later(nock,450);return}
  const r=b.h.el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height*.45;b.h.el.classList.add('gone');
  if(b.h.m){later(()=>arw.style.display='none',250);burst(x,y,130,true);SFX.burst();later(()=>go(3),1700);return}
  b.h.dead=true;arw.style.display='none';burst(x,y,45,true);SFX.pop2();toast(['oops, not this one 💕','the big one! 💘','aim higher ✨'][Math.random()*3|0]);later(nock,600);
  later(()=>{b.h.el.classList.remove('gone');b.h.el.classList.add('spawn');b.h.dead=false},3000)};
 nock();later(()=>toast('hit the big golden heart 💘'),900);
 A.onpointerdown=e=>{if(state)return;startMusic();state=1;sx=e.clientX;sy=e.clientY;A.setPointerCapture(e.pointerId)};
 A.onpointermove=e=>{if(state!==1)return;let dx=e.clientX-sx,dy=Math.max(0,e.clientY-sy),m=Math.hypot(dx,dy);if(m>MAXP){dx*=MAXP/m;dy*=MAXP/m}P=[rest[0]+dx,rest[1]+dy];aim();draw(P,P);guide();const nw=performance.now();if(nw-(A._st||0)>110&&pull()>12){A._st=nw;SFX.stretch(pull())}};
 A.onpointerup=A.onpointercancel=()=>{if(state!==1)return;gd.style.opacity=0;
  if(pull()<70){state=2;const p0=P.slice(),t0=performance.now();(function f(t){const k=Math.min(1,(t-t0)/400),q=(1-k)*Math.cos(k*14);P=[rest[0]+(p0[0]-rest[0])*q,rest[1]+(p0[1]-rest[1])*q];aim();draw(P,P);if(k<1)requestAnimationFrame(f);else{P=rest.slice();aim();draw(P,P);state=0}})(t0);return}
  state=3;SFX.shoot();
  const ab=A.getBoundingClientRect(),from=[P[0]+u[0]*L,P[1]+u[1]*L],p0=P.slice(),u0=u.slice();let best=null;
  hearts.forEach(h=>{if(h.dead)return;const r=h.el.getBoundingClientRect(),c=[r.left+r.width/2-ab.left,r.top+r.height*.46-ab.top],R=Math.min(r.width,r.height)*.47,dx=c[0]-from[0],dy=c[1]-from[1],t=dx*u0[0]+dy*u0[1];if(t<0)return;const d=Math.abs(dx*u0[1]-dy*u0[0]);if(d>R)return;const s=Math.max(0,t-Math.sqrt(R*R-d*d)*.6);if(!best||s<best.s)best={h,s}});
  const S=best?best.s:1500,D=Math.max(260,Math.min(600,S/2)),t0=performance.now();
  (function f(t){const k=Math.min(1,(t-t0)/D),s=S*k*k,tipP=[from[0]+u0[0]*s,from[1]+u0[1]*s],q=Math.max(0,1-k*4)*Math.cos(k*60);
   draw([rest[0]+(p0[0]-rest[0])*q,rest[1]+(p0[1]-rest[1])*q],[tipP[0]-u0[0]*L,tipP[1]-u0[1]*L]);
   if(k<1)return requestAnimationFrame(f);land(best)})(t0)}};
// ---------- 2: HB ----------
init[2]=()=>{const e=$('#hb');e.innerHTML='';'Happy|Birthday'.split('|').forEach((w,i,a)=>{[...w].forEach((c,j)=>{const s=document.createElement('span');s.textContent=c;s.style.setProperty('--d',(i*.7+j*.08).toFixed(2)+'s');s.style.setProperty('--i',i*5+j);e.append(s)});if(!i)e.append(document.createElement('br'))});SFX.chime();chapter()};
// ---------- 3: tree ----------
const HG=[['#ff9db3','#f0365f','#9f1239'],['#ffc2d4','#f43f78','#be185d'],['#ffd9e6','#f472b6','#c026a3'],['#ffb8a6','#fb5470','#be123c'],['#fff1a8','#fbbf24','#d97706']];
const HP='M50 88C10 55 0 35 0 22 0 9 10 0 24 0c11 0 21 6 26 15C55 6 65 0 76 0c14 0 24 9 24 22 0 13-10 33-50 66z';
function treeSVG(n){
 const defs=HG.map((c,i)=>`<radialGradient id="tg${i}" cx="34%" cy="26%" r="85%"><stop offset="0" stop-color="${c[0]}"/><stop offset=".55" stop-color="${c[1]}"/><stop offset="1" stop-color="${c[2]}"/></radialGradient><symbol id="th${i}" viewBox="-2 -2 104 94"><path d="${HP}" fill="url(#tg${i})" stroke="${c[2]}" stroke-opacity=".5" stroke-width="1.5"/><path d="M13 21c0-8 5-12 12-12" stroke="#fff" stroke-opacity=".85" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="33" cy="15" rx="8" ry="4" fill="#fff" opacity=".4" transform="rotate(-20 33 15)"/></symbol>`).join('');
 const O=Array.from({length:240},(_,i)=>{const a=i/240*6.283;return[200+16*Math.pow(Math.sin(a),3)*10.8,165-(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a))*9.6]});
 const inside=(x,y)=>{let c=false;for(let i=0,j=O.length-1;i<O.length;j=i++){const[xi,yi]=O[i],[xj,yj]=O[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c}return c};
 const hs=[];let guard=0;while(hs.length<n&&guard++<20000){const x=27+Math.random()*346,y=40+Math.random()*295;if(inside(x,y))hs.push({cx:x,cy:y,s:20+Math.random()*22})}
 O.filter((_,i)=>i%4===0).forEach(([x,y])=>hs.push({cx:x,cy:y,s:24+Math.random()*12}));
 hs.forEach((h,i)=>{h.rot=(Math.random()-.5)*70;h.k=Math.random()<.08?4:[0,0,1,1,2,3][i%6]});hs.sort((a,b)=>a.s-b.s);
 const heartsSVG=hs.map(h=>{const d=(1.3+(1-(h.cy-40)/300)*1.8+Math.random()*.3).toFixed(2);return`<g class="th" style="animation-delay:${d}s"><use href="#th${h.k}" x="${(h.cx-h.s/2).toFixed(1)}" y="${(h.cy-h.s*.45).toFixed(1)}" width="${h.s.toFixed(1)}" height="${(h.s*.9).toFixed(1)}" transform="rotate(${h.rot.toFixed(0)} ${h.cx.toFixed(1)} ${h.cy.toFixed(1)})"/></g>`}).join('');
 const br=[['M200 425C194 380 206 330 200 262',18,0,1.2],['M200 330C170 310 148 280 128 232',9,.7,.9],['M200 318C232 296 258 270 276 226',9,.8,.9],['M200 285C188 250 172 220 160 176',7,1,.8],['M200 280C214 244 232 214 244 170',7,1.05,.8],['M200 262C200 230 198 200 200 150',6,1.1,.8]].map(([d,w,dl,du])=>`<path class="tk" pathLength="1" d="${d}" stroke-width="${w}" style="animation-delay:${dl}s;animation-duration:${du}s"/>`).join('');
 const sp=Array.from({length:30},(_,i)=>{const x=40+Math.random()*320,y=20+Math.random()*320,s=3+Math.random()*5;return`<path class="spk2" style="animation-delay:${(Math.random()*3).toFixed(2)}s" d="M${x} ${y-s}l${s*.3} ${s*.7} ${s*.7} ${s*.3}-${s*.7} ${s*.3}-${s*.3} ${s*.7}-${s*.3}-${s*.7}-${s*.7}-${s*.3} ${s*.7}-${s*.3}z" fill="#fff"/>`}).join('');
 return`<svg viewBox="0 0 400 440" xmlns="http://www.w3.org/2000/svg"><defs>${defs}<radialGradient id="glw"><stop offset="0" stop-color="#ff5c8a" stop-opacity=".55"/><stop offset=".6" stop-color="#ff8fb0" stop-opacity=".18"/><stop offset="1" stop-color="#ff8fb0" stop-opacity="0"/></radialGradient><linearGradient id="tkg" gradientUnits="userSpaceOnUse" x1="120" y1="0" x2="280" y2="0"><stop offset="0" stop-color="#8a5668"/><stop offset=".5" stop-color="#5a3347"/><stop offset="1" stop-color="#8a5668"/></linearGradient></defs>
<ellipse class="halo" cx="200" cy="175" rx="215" ry="205" fill="url(#glw)"/><ellipse cx="200" cy="428" rx="95" ry="9" fill="#f472b6" opacity=".35"/>
<g stroke="url(#tkg)" fill="none" stroke-linecap="round">${br}</g><g class="canopy">${heartsSVG}</g>${sp}</svg>`}
init[3]=()=>{const p3=$('#p3');p3.classList.remove('in');void p3.offsetWidth;p3.classList.add('in');$('#g3').onclick=()=>go(2);$('#tree').innerHTML=treeSVG(RM?110:210);$('#t3n').innerHTML=`Happy<br>Birthday, ${C.name}`;$('#t3a').textContent=`and just like that, you're turning ${C.age} ✨`;startRain(true,300);later(SFX.chime,1200)};
// ---------- cake ----------
const dripsRow=(y,xs,hs,d)=>xs.map((x,i)=>`<rect class="dr" style="animation-delay:${d+i*.12}s" x="${x}" y="${y}" width="9" height="${hs[i]}" rx="4.5" fill="#fff"/>`).join('');
const cakeSVG=(c)=>`<svg class="cake${c?' static':''}" viewBox="0 0 260 210"><defs>
<linearGradient id="a${c}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f9a8d4"/><stop offset="1" stop-color="#e8559a"/></linearGradient>
<linearGradient id="b${c}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbcfe8"/><stop offset="1" stop-color="#f08cbc"/></linearGradient></defs>
<ellipse cx="130" cy="197" rx="122" ry="9" fill="#fdf2f8" opacity=".95"/>
<g class="l" style="animation-delay:.2s"><rect x="28" y="144" width="204" height="52" rx="10" fill="url(#a${c})"/><rect x="28" y="162" width="204" height="5" fill="#fff" opacity=".18"/><rect x="28" y="180" width="204" height="5" fill="#fff" opacity=".18"/><circle cx="52" cy="174" r="3" fill="#fde68a"/><circle cx="98" cy="188" r="3" fill="#a5f3fc"/><circle cx="150" cy="172" r="3" fill="#fde68a"/><circle cx="200" cy="186" r="3" fill="#c4b5fd"/></g>
<g class="l" style="animation-delay:1s"><rect x="50" y="102" width="160" height="46" rx="10" fill="url(#b${c})"/><rect x="50" y="120" width="160" height="5" fill="#fff" opacity=".25"/><circle cx="78" cy="132" r="3" fill="#fff"/><circle cx="130" cy="138" r="3" fill="#fde68a"/><circle cx="180" cy="130" r="3" fill="#fff"/></g>
<g class="l" style="animation-delay:1.8s"><rect x="72" y="66" width="116" height="42" rx="10" fill="url(#a${c})"/><rect x="72" y="86" width="116" height="5" fill="#fff" opacity=".2"/></g>
<g class="ic" style="animation-delay:2.6s"><rect x="26" y="140" width="208" height="12" rx="6" fill="#fff"/><rect x="48" y="98" width="164" height="12" rx="6" fill="#fff"/><rect x="70" y="62" width="120" height="12" rx="6" fill="#fff"/></g>
${dripsRow(148,[40,82,125,168,205],[16,10,22,12,18],2.9)}${dripsRow(106,[62,100,140,185],[14,20,12,18],3.1)}${dripsRow(70,[80,112,150,172],[16,10,20,12],3.3)}
<g class="pop" style="animation-delay:3.7s"><circle cx="96" cy="58" r="7" fill="#e11d48"/><circle cx="164" cy="58" r="7" fill="#e11d48"/><path d="M96 51q3-8 8-9M164 51q-3-8-8-9" stroke="#4d7c0f" stroke-width="2" fill="none"/></g>
${c?`<rect x="124" y="22" width="12" height="42" rx="3" fill="#fff"/><path d="M124 32l12-5M124 42l12-5M124 52l12-5" stroke="#f472b6" stroke-width="3"/>
<circle class="chit" cx="130" cy="20" r="38" fill="#0000"/><g class="fl"><path class="flame" d="M130 0c11 11 7 21 0 21s-11-10 0-21z" fill="#ffb347"/><path class="flame" d="M130 8c5 5 3 11 0 11s-5-6 0-11z" fill="#fff6c8"/></g>
${[[40,40,0],[220,30,.4],[24,110,.8],[238,96,.2],[60,8,1],[200,6,.6]].map(([x,y,d])=>`<path class="spk" style="animation-delay:${d}s" d="M${x} ${y-8}l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#fde68a"/>`).join('')}`:''}</svg>`;
let tapOk=false;
init[4]=()=>{$('#cake1').innerHTML=cakeSVG(0);[300,1100,1900,2700,3900].forEach(t=>later(SFX.cake,t));later(()=>go(nextOf(4)),5300)};
// ---- microphone "blow" detector: low-band level of the mic (never connected to the speakers) ----
let micStop=null;
function listenBlow(onBlow,onFail){
 let stream=null,src=null,lp=null,an=null,done=false,raf=0;
 const stop=()=>{if(done)return;done=true;cancelAnimationFrame(raf);try{src&&src.disconnect();lp&&lp.disconnect()}catch(e){}try{stream&&stream.getTracks().forEach(t=>t.stop())}catch(e){}stream=src=lp=an=null;
  try{if(navigator.audioSession)navigator.audioSession.type='playback'}catch(e){}try{AC.resume()}catch(e){}dip(1,40);bgmResume();applyMix(.9);micStop=null};
 micStop=stop;
 const md=navigator.mediaDevices;if(!md||!md.getUserMedia){stop();later(onFail,0);return}
 later(()=>{if(!done&&!stream){stop();onFail()}},20000); // permission prompt never answered
 md.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}}).then(s=>{
  if(done||cur!==5){s.getTracks().forEach(t=>t.stop());return}
  stream=s;try{AC.resume()}catch(e){}
  src=AC.createMediaStreamSource(s);lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1500;an=AC.createAnalyser();an.fftSize=512;an.smoothingTimeConstant=0;
  src.connect(lp);lp.connect(an);
  const fb=new Float32Array(an.fftSize),bb=new Uint8Array(an.fftSize),t0=performance.now();let base=0,nb=0,ema=0,above=0,thr=.05,armed=false;
  const step=now=>{if(done)return;if(cur!==5){stop();return}
   let q=0;if(an.getFloatTimeDomainData){an.getFloatTimeDomainData(fb);for(let i=0;i<fb.length;i++)q+=fb[i]*fb[i]}else{an.getByteTimeDomainData(bb);for(let i=0;i<bb.length;i++){const v=(bb[i]-128)/128;q+=v*v}}
   const rms=Math.sqrt(q/fb.length);ema=ema*.6+rms*.4;const el=now-t0;
   if(el<500){base+=rms;nb++}else{if(!armed){armed=true;thr=Math.max((base/Math.max(1,nb))*3,.05)}
    if(ema>thr){if(!above)above=now;if(now-above>=300){stop();onBlow();return}}else above=0;
    if(el>10500){stop();onFail();return}}
   raf=requestAnimationFrame(step)};
  raf=requestAnimationFrame(step)
 }).catch(()=>{if(!done){stop();onFail()}})}
init[5]=()=>{if(micStop)micStop();QUIET=0;$('#cake2').innerHTML=cakeSVG(1);$('#hb5').textContent=`Happy Birthday, ${C.name}!`;
 const hb=$('#hb5'),wi=$('#wish'),bl=$('#blow'),tp=$('#tap'),mic=C.blowMic!==false&&!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia);
 [hb,wi,bl,tp].forEach(x=>x.classList.remove('vis'));bl.classList.remove('on');bl.style.display=mic?'':'none';bl.textContent='🎤 blow here';
 wi.textContent=mic?'Make a wish… then blow out the candle 🕯️':'Make a wish… then tap the candle to blow it out 🕯️';
 tapOk=false;let lit=true,listening=false;
 const enableTap=()=>{if(tapOk)return;tapOk=true;tp.classList.add('vis')};
 later(()=>{SFX.chime();burst(W/2,H*.45,90)},700);later(()=>{startRain(false,300);fireworks()},1500);
 later(()=>hb.classList.add('vis'),1200);later(()=>wi.classList.add('vis'),2200);later(()=>{if(mic&&lit)bl.classList.add('vis')},3000);
 later(()=>{if(lit)enableTap()},12000); // fallback: tap anywhere to continue
 const smoke=()=>{const sv=$('#cake2 .cake'),pr=$('#p5').getBoundingClientRect(),r=sv.getBoundingClientRect(),sc=Math.min(r.width/260,r.height/210),x=r.left+(r.width-260*sc)/2+130*sc-pr.left,y=r.top+(r.height-210*sc)/2+8*sc-pr.top;
  for(let k=0;k<5;k++){const e=document.createElement('i');e.className='smk';$('#p5').appendChild(e);const dx=(Math.random()-.5)*60;
   const a=e.animate([{transform:`translate(${x}px,${y}px) scale(.6)`,opacity:0},{transform:`translate(${x+dx*.4}px,${y-40}px) scale(1.3)`,opacity:.85,offset:.25},{transform:`translate(${x+dx}px,${y-110-Math.random()*50}px) scale(2.8)`,opacity:0}],{duration:1800+Math.random()*700,delay:k*140,easing:'ease-out',fill:'backwards'});a.onfinish=()=>e.remove()}};
 const blowOut=()=>{if(!lit)return;lit=false;if(micStop)micStop();QUIET=0;bl.style.display='none';bl.classList.remove('vis');
  const sv=$('#cake2 .cake');if(sv)sv.classList.add('out');SFX.puff();smoke();
  later(()=>{burst(W/2,H*.4,80,true);SFX.good();wi.textContent='…and your wish is on its way ✨'},600);later(()=>SFX.chime(),1150);
  later(enableTap,1700);later(()=>{if(cur===5&&tapOk){tapOk=false;go(nextOf(5))}},3200)};
 const fail=()=>{listening=false;QUIET=0;if(!lit)return;bl.classList.remove('on');bl.style.display='none';wi.textContent='tap the candle to blow it out ✨'};
 bl.onclick=e=>{e.stopPropagation();if(!lit||listening)return;listening=true;QUIET=1;bl.classList.add('on');bl.textContent='🎤 now blow on your phone 💨';dip(.25,12000);listenBlow(blowOut,fail)};
 $('#p5').onclick=e=>{if(lit&&e.target.closest('.chit')){blowOut();return}if(tapOk){tapOk=false;go(nextOf(5))}}};
// ---------- 6: balloon game (many drifting balloons, only some hold a reason) ----------
const balSVG=(c,i)=>`<svg viewBox="0 0 100 160"><defs><radialGradient id="bg${i}" cx="34%" cy="26%" r="78%"><stop offset="0" stop-color="${c[0]}"/><stop offset=".5" stop-color="${c[1]}"/><stop offset="1" stop-color="${c[2]}"/></radialGradient></defs><path class="body" d="M50 2C21 2 4 27 4 54c0 31 26 58 46 62C70 112 96 85 96 54 96 27 79 2 50 2z" fill="url(#bg${i})"/><path d="M41 121l9-9 9 9z" fill="${c[2]}"/><path class="str" d="M50 121c-9 9 9 17 0 27s-7 9-2 12" stroke="#fffb" stroke-width="1.8" fill="none" stroke-linecap="round"/><ellipse cx="29" cy="30" rx="8" ry="15" fill="#fff" opacity=".6" transform="rotate(25 29 30)"/><ellipse cx="72" cy="88" rx="7" ry="3" fill="#fff" opacity=".22" transform="rotate(-30 72 88)"/></svg>`;
let balRAF=0;
init[6]=()=>{cancelAnimationFrame(balRAF);const f=$('#bfield'),cd=$('#cards'),R=C.balloons,n=R.length,dn=C.decoyBalloons==null?5:C.decoyBalloons,tot=n+dn;
 f.innerHTML=cd.innerHTML='';$('#g6').classList.remove('show');$('#bsub').textContent=C.balloonTitle+' 🎈';
 let found=0,sayT=0;const cnt=$('#bcnt'),count=()=>{cnt.textContent=`💗 ${found} / ${n} found`};count();
 const say=t=>{cnt.textContent=t;clearTimeout(sayT);sayT=setTimeout(count,1400)};
 const BC=[['#ffc1d6','#f2457f','#a3124a'],['#bdeeff','#1fb5d9','#0a6a8a'],['#ffe08a','#f5a623','#b5640a'],['#e2d4ff','#8b5cf6','#4c1d95'],['#c9f7d4','#34c77b','#14693f']];
 const real=[...Array(tot).keys()].sort(()=>Math.random()-.5).slice(0,n),FW=f.clientWidth,FH=f.clientHeight,bs=[];
 for(let i=0;i<tot;i++){const w=64+Math.random()*42,h=w*1.6,el=document.createElement('div');el.className='bal mv';el.style.width=w+'px';el.style.zIndex=i;el.innerHTML=balSVG(BC[i%5],i);
  const s={el,w,h,x:Math.random()*(FW-w),y:Math.random()*(FH-h),vx:0,vy:0,tx:0,ty:0,nt:0,ph:Math.random()*6,real:real.includes(i)};bs.push(s);f.append(el);
  el.onpointerdown=e=>{e.preventDefault();if(s.dead)return;s.dead=true;const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height*.35,c=BC[i%5];burst(x,y,25);for(let k=0;k<26;k++){const a=Math.random()*6.28,sp=2+Math.random()*6;P.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,g:.16,l:1,d:.018,r:3+Math.random()*4,c:c[1],rect:true})}
   el.remove();
   if(s.real){SFX.good();found++;const d=document.createElement('div');d.className='card';d.innerHTML=`<small>REASON NO.${found} ❤️</small><div>${R[found-1]}</div>`;cd.prepend(d);tagBn(cd);count();if(found===n)later(()=>$('#g6').classList.add('show'),700)}
   else{SFX.pop2();say(['empty one 🎈 keep looking','nothing inside! try another','oops, just air 💨','not this one — keep going ✨'][Math.random()*4|0])}}}
 let last=performance.now();
 (function tick(t){const dt=Math.min(.05,(t-last)/1000);last=t;
  bs.forEach(s=>{if(s.dead)return;s.nt-=dt;if(s.nt<=0){s.nt=1+Math.random()*2;const sp=55+Math.random()*95,a=Math.random()*6.283;s.tx=Math.cos(a)*sp;s.ty=Math.sin(a)*sp}
   s.vx+=(s.tx-s.vx)*Math.min(1,dt*2.2);s.vy+=(s.ty-s.vy)*Math.min(1,dt*2.2);s.x+=s.vx*dt;s.y+=s.vy*dt;
   if(s.x<0){s.x=0;s.tx=Math.abs(s.tx);s.vx=Math.abs(s.vx)}if(s.x>FW-s.w){s.x=FW-s.w;s.tx=-Math.abs(s.tx);s.vx=-Math.abs(s.vx)}
   if(s.y<0){s.y=0;s.ty=Math.abs(s.ty);s.vy=Math.abs(s.vy)}if(s.y>FH-s.h){s.y=FH-s.h;s.ty=-Math.abs(s.ty);s.vy=-Math.abs(s.vy)}
   s.el.style.translate=`${s.x.toFixed(1)}px ${s.y.toFixed(1)}px`;s.el.style.rotate=`${(Math.sin(t/600+s.ph)*6).toFixed(1)}deg`});
  if(cur===6)balRAF=requestAnimationFrame(tick)})(last)};
// ---------- 7: gallery ----------
// ---- N8a: photos "develop" like instant film (cream overlay fades out; tap = instant reveal) ----
function develop(d,im,delay){const o=document.createElement('i');o.className='dev';d.append(o);d.classList.add('dvl');
 const fit=()=>{if(!im.offsetWidth)return;o.style.cssText=`left:${im.offsetLeft-4}px;top:${im.offsetTop-4}px;width:${im.offsetWidth+8}px;height:${im.offsetHeight+8}px;right:auto;bottom:auto;aspect-ratio:auto`};later(fit,80);later(fit,700);
 let a=null,ia=null;const end=()=>{o.remove();d.classList.remove('dvl')};
 const start=()=>{if(a||!o.isConnected)return;a=o.animate([{opacity:1},{opacity:1,offset:.12},{opacity:0}],{duration:2400,delay,easing:'ease-in-out',fill:'both'});a.onfinish=end;ia=im.animate([{scale:1.02},{scale:1}],{duration:2800,delay,easing:'ease-out',fill:'both'})};
 const reveal=()=>{if(!o.isConnected)return;if(a)a.cancel();if(ia)ia.cancel();fit();o.animate([{opacity:.9},{opacity:0}],{duration:260,fill:'forwards'}).onfinish=end;SFX.photo()};
 d._dev={start,reveal};return d._dev}
init[7]=()=>{const car=$('#car'),dots=$('#dots'),LT=$('#lights');car.innerHTML=dots.innerHTML=LT.innerHTML='';
 for(let i=0;i<16;i++){const b=document.createElement('i'),k=i/15;b.style.cssText=`--c:${['#fde68a','#fda4af','#a5f3fc','#d8b4fe'][i%4]};animation-delay:${(i%5)*.3}s;left:${k*100}%;top:${Math.sin(k*Math.PI)*21}px`;LT.append(b)}
 C.photos.forEach((p,i)=>{const d=document.createElement('div');d.className='pol';d.style.cssText=`--r:${(i%2?1:-1)*(1.5+Math.random()*2.5)}deg;--dl:${(.3+i*.2).toFixed(2)}s;--fd:${(4+Math.random()*2.5).toFixed(1)}s`;
  const im=new Image();im.decoding='async';im.className='im';im.src=p.src;im.alt=p.caption||'';im.onerror=()=>{im.removeAttribute('src');im.style.visibility='hidden'};
  d.append(im);d.insertAdjacentHTML('beforeend',`<p>${p.caption||''} 💛</p>`);d.onclick=()=>{if(d.classList.contains('dvl')){d._dev.reveal();return}if(!im.getAttribute('src'))return;$('#lb img').src=p.src;$('#lb p').textContent=p.caption||'';$('#lb').classList.add('on')};car.append(d);develop(d,im,i?200:700);dots.insertAdjacentHTML('beforeend','<i></i>')});
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){io.unobserve(e.target);if(e.target._dev)e.target._dev.start()}}),{root:car,threshold:.55});[...car.children].forEach(x=>io.observe(x));
 const dd=$$('#dots i'),n=dd.length,fx=()=>{const c=car.scrollLeft+car.clientWidth/2,ps=[...car.children];let best=null,bd=9;const v=ps.map(p=>{const w=p.offsetWidth,d=Math.min(1,Math.abs(p.offsetLeft+w/2-c)/w);if(d<bd){bd=d;best=p}return d});ps.forEach((p,i)=>{const d=v[i];p.style.setProperty('--s',(1.09-.26*d).toFixed(3));p.style.setProperty('--k',(.2+.8*d).toFixed(3));p.style.setProperty('--o',(1-.55*d).toFixed(3));p.classList.toggle('act',p===best)})},
 idx=()=>Math.round(car.scrollLeft/((car.scrollWidth-car.clientWidth)||1)*(n-1));let last=-1;const mark=()=>{const k=idx();if(k!==last){if(last>=0){const r=car.getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height*.45,12,true);SFX.cake()}last=k}dd.forEach((x,i)=>x.classList.toggle('a',i===k));fx()};
 let raf=0;car.onscroll=()=>{if(!raf)raf=requestAnimationFrame(()=>{raf=0;mark()})};mark();
 let auto=true;['pointerdown','touchstart','wheel'].forEach(ev=>car.addEventListener(ev,()=>auto=false,{passive:true}));
 const iv=setInterval(()=>{if(!auto)return clearInterval(iv);const k=idx()+1;if(k>=n)return clearInterval(iv);car.scrollTo({left:k*((car.scrollWidth-car.clientWidth)/(n-1)),behavior:'smooth'})},3200);timers.push(iv)};
$('#lb').onclick=()=>$('#lb').classList.remove('on');
// ---------- bangla auto-tag ----------
const BN=/[\u0980-\u09FF]/;
function wrapEmoji(r){(r||document).querySelectorAll('.top').forEach(e=>{if(e.children.length||e.dataset.em)return;e.dataset.em=1;e.innerHTML=e.textContent.replace(/(\p{Extended_Pictographic}\uFE0F?)/gu,'<span class="em">$1</span>')})}
function tagBn(r){(r||document).querySelectorAll('h1,h2,h3,p,small,div,span,button').forEach(e=>{if(!e.parentElement.closest('.bn')&&[...e.childNodes].some(n=>n.nodeType==3&&BN.test(n.textContent)))e.classList.add('bn')})}
// ---------- 14: gallery 2 ----------
$('#g7').onclick=()=>go(nextOf(7));$('#g14').onclick=()=>go(nextOf(14));
init[14]=()=>{$('#t14').textContent=C.gallery2Title||'';$('#s14').textContent=C.gallery2Sub||'';const g=$('#g2'),b=$('#g14');g.innerHTML='';b.classList.remove('show');
 (C.photos2||[]).slice(0,5).forEach((p,i)=>{const d=document.createElement('div');d.className='fr f'+(i+1);const im=new Image();im.decoding='async';im.src=p.src;im.alt=p.caption||'';im.onerror=()=>{im.removeAttribute('src');im.style.visibility='hidden'};d.append(im);d.insertAdjacentHTML('beforeend',`<span>${p.caption||''}</span>`);
  d.onclick=()=>{if(d.classList.contains('dvl')){d._dev.reveal();return}if(!im.getAttribute('src'))return;$('#lb img').src=p.src;$('#lb p').textContent=p.caption||'';$('#lb').classList.add('on')};g.append(d);develop(d,im,[1100,2000,2900,3600,4400][i]).start()});
 later(()=>burst(W/2,H*.4,60,true),900);[1.3,2.2,3.1,3.8,4.6].forEach((t,i)=>later(()=>{const f=$('#g2 .f'+(i+1));if(!f)return;const r=f.getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height/2,16,true);SFX.cake()},t*1000));later(()=>b.classList.add('show'),5000);startRain(true,700)};
// ---------- 8/9: envelope ----------
init[8]=()=>{$('#h8').textContent=`One last thing, ${C.name}...`;$('#s8').textContent=`${C.from} wrote you a letter.`;
 $$('#seal b').forEach(b=>b.textContent=C.name[0].toUpperCase());$('#mto').textContent=`For ${C.name} ♥`;
 const pg=$('#p8'),e=$('#env1');pg.classList.remove('opening');e.classList.remove('run');delete e.dataset.d;
 // measure where the real letter will be, so the paper lands exactly on it
 const geo=()=>{const L=$('#letter'),lr=L.getBoundingClientRect(),er=e.getBoundingClientRect(),ew=e.offsetWidth,eh=e.offsetHeight,lw=lr.width,lh=lr.height,s0=.9*ew/lw;
  const cx=er.left+ew/2,cy=er.top+eh*.55,S=e.style;
  S.setProperty('--s0',s0.toFixed(4));S.setProperty('--ty1',(-(eh*.55+lh*s0/6+8)).toFixed(1)+'px');
  S.setProperty('--tx2',(lr.left+lw/2-cx).toFixed(1)+'px');S.setProperty('--ty2',(lr.top+lh/2-cy).toFixed(1)+'px');
  S.setProperty('--drop',(eh*.55).toFixed(0)+'px');pg.style.setProperty('--lcx',(lr.left+lw/2)+'px');pg.style.setProperty('--lcy',(lr.top+lh/2)+'px')};
 geo();
 e.onclick=()=>{if(e.dataset.d)return;e.dataset.d=1;startMusic();
  if(RM){go(nextOf(8));return}
  geo();pg.classList.add('opening');void e.offsetWidth;e.classList.add('run');
  const sr=$('#seal').getBoundingClientRect();SFX.seal();burst(sr.left+sr.width/2,sr.top+sr.height/2,28);
  later(()=>SFX.flap(),380);later(()=>SFX.slide(),1450);
  later(()=>{const r=$('#sheet').getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height/2,22,true)},2450);
  later(()=>SFX.whoosh(),2550);later(()=>SFX.unfold(),3500);later(()=>SFX.unfold(),4100);
  later(()=>{burst(W/2,H/2,46,true);SFX.chime()},4900);later(()=>go(nextOf(8),true),5500)}};
init[9]=()=>{const e=$('#env2');e.classList.remove('play');void e.offsetWidth;e.classList.add('play');later(()=>SFX.paper(),700);later(()=>burst(W/2,H*.4,60,true),1500);later(()=>SFX.whoosh(),2700);startRain(true,500);later(()=>go(10),4100)};
// ---------- 10: letter ----------
// neighbouring keys, so a typo looks like a real slip of the finger
const KN={q:'wa',w:'qes',e:'wrd',r:'etf',t:'ryg',y:'tuh',u:'yij',i:'uok',o:'ipl',p:'ol',a:'qsz',s:'awdx',d:'sefc',f:'drgv',g:'fthb',h:'gyjn',j:'hukm',k:'jil',l:'kop',z:'asx',x:'zsc',c:'xdv',v:'cfb',b:'vgn',n:'bhm',m:'nj'};
init[10]=()=>{const t=$('#ltxt'),s=$('#lsign'),g=$('#g10'),L=$('#letter'),dr=$('#ldear');
 dr.textContent=`Dear ${C.name},`;dr.classList.remove('show');s.textContent='';s.classList.remove('show');g.classList.remove('show');L.scrollTop=0;
 L.querySelectorAll('.dust').forEach(x=>x.remove());
 const bn=BN.test(C.letter),ink=!bn&&!RM;L.classList.toggle('bn',bn);
 const ch=Array.from(C.letter),cr=document.createElement('span');cr.className='cr';t.textContent='';t.append(cr);
 let i=0,w=null,tn=null,ly=-1,typos=0;
 // put one character on the paper
 const add=c=>{if(c==='\n'){t.insertBefore(document.createElement('br'),cr);w=null;return}
  if(!ink){if(!tn||tn.nextSibling!==cr){tn=document.createTextNode('');t.insertBefore(tn,cr)}tn.nodeValue+=c;return}
  if(/\s/.test(c)){t.insertBefore(document.createTextNode(c),cr);w=null;return}
  if(!w){w=document.createElement('span');w.className='w';t.insertBefore(w,cr)}
  const k=document.createElement('span');k.className='c';k.textContent=c;w.append(k)};
 const erase=()=>{if(w&&w.lastChild){w.lastChild.remove();if(!w.lastChild){w.remove();w=null}}};
 const fx=c=>{if(RM)return;c==='\n'?SFX.enter():/\s/.test(c)?SFX.keyS():SFX.key(c)};
 const dust=()=>{if(RM||Math.random()>.4)return;const d=document.createElement('i');d.className='dust';d.style.left=(cr.offsetLeft+1)+'px';d.style.top=(cr.offsetTop+6)+'px';d.style.setProperty('--dx',(Math.random()*34-17)+'px');L.append(d);setTimeout(()=>d.remove(),950)};
 const follow=()=>{const y=cr.offsetTop;if(y!==ly){ly=y;L.scrollTo({top:Math.max(0,y-L.clientHeight*.55),behavior:'smooth'})}};
 const press=c=>{add(c);fx(c);dust();follow()};
 const base=RM?2:Math.max(24,Math.min(46,8200/ch.length));
 // human rhythm: quick inside words, a beat after spaces, longer after commas / full stops, a rare thinking pause, sometimes a fast burst
 const delay=(c,prev)=>{if(RM)return 2;let d=base*(.6+Math.random()*.8);if(/\s/.test(prev||''))d+=16;if(Math.random()<.16)d*=.55;
  if(/[,;:]/.test(c))d+=130;else if(/[.!?]/.test(c))d+=300;else if(c==='\n')d+=420;else if(Math.random()<.02)d+=320+Math.random()*260;return d};
 const fin=()=>{cr.remove();SFX.sign();s.innerHTML=`${C.signoff}<br>— ${C.from}`;s.classList.add('show');L.scrollTo({top:L.scrollHeight,behavior:'smooth'});burst(W/2,H*.55,22,true);later(()=>g.classList.add('show'),1000)};
 const step=()=>{if(i>=ch.length)return fin();const c=ch[i],prev=ch[i-1];
  // the odd slip: wrong neighbouring key, a beat, backspace, then the right one
  if(ink&&typos<3&&i>14&&i<ch.length-30&&/[a-z]/i.test(c)&&Math.random()<.022){typos++;const ks=KN[c.toLowerCase()],wr=ks[Math.random()*ks.length|0];
   press(c===c.toLowerCase()?wr:wr.toUpperCase());cr.classList.add('idle');
   later(()=>{erase();SFX.back();cr.classList.remove('idle');later(()=>{i++;press(c);later(step,delay(c,prev))},150)},360);return}
  i++;press(c);const d=delay(c,prev);cr.classList.toggle('idle',d>230);later(step,d)};
 // "Dear ...," is written first with a pen, then the keys start
 later(()=>{dr.classList.add('show');if(!RM)SFX.scribble()},RM?0:500);
 later(step,RM?0:1900)};
// ---------- 11: video (autoplays; unlocked by the Continue tap on the letter page) ----------
let vprime=Promise.resolve();
function primeVideo(){const v=$('#vid');v.onplay=v.onpause=v.onended=null;if(v.dataset.s!==C.video){v.dataset.s=C.video;v.src=C.video;v.poster=C.videoPoster}
 v.muted=true;try{const p=v.play();vprime=p&&p.then?p.then(()=>{v.pause();try{v.currentTime=0}catch(e){}}).catch(()=>{}):Promise.resolve()}catch(e){vprime=Promise.resolve()}}
$('#g10').addEventListener('click',primeVideo);
init[11]=()=>{const v=$('#vid'),pl=$('#vplay'),g=$('#g11'),sk=$('#skip'),um=$('#unm');g.classList.remove('show');um.classList.remove('show');um.classList.add('hid');sk.style.display='';pl.style.display='none';
 if(v.dataset.s!==C.video){v.dataset.s=C.video;v.src=C.video;v.poster=C.videoPoster}v.controls=true;v.playsInline=true;
 const fin=()=>{g.classList.add('show');sk.style.display='none';burst(W/2,H/3,80)};
 v.onerror=()=>{pl.style.display='';pl.textContent='Video not found — continue ›';pl.onclick=()=>go(nextOf(11))};
 v.onplay=()=>{MIXS.video=1;applyMix(.25)};
 v.onpause=()=>{MIXS.video=0;applyMix(.7)};
 v.onended=()=>{MIXS.video=0;applyMix(.7);fin()};
 pl.onclick=()=>{pl.style.display='none';v.muted=false;v.volume=1;v.play().catch(()=>{})};
 sk.onclick=()=>{v.pause();go(nextOf(11))};
 const unmute=()=>{um.classList.remove('hid');um.classList.add('show');um.onclick=()=>{v.muted=false;v.volume=1;um.classList.remove('show');um.classList.add('hid')}};
 // 1) try with sound  2) browser said no -> autoplay muted + "tap for sound" chip  3) last resort -> big play button
 vprime.then(()=>{try{v.currentTime=0}catch(e){}v.muted=false;v.volume=1;return v.play()})
  .then(()=>{if(v.paused)throw 0})
  .catch(()=>{v.muted=true;return v.play().then(unmute)})
  .catch(()=>{v.muted=false;pl.style.display=''});
 startRain(false,600)};
// ---------- 12: final ----------
init[15]=()=>{const V=C.vouchers||[],L=$('#vlist'),p=$('#p15'),hint=$('#vh15'),g=$('#g15');let got=[];try{got=JSON.parse(localStorage.getItem('vouch')||'[]')}catch(e){}
 $('#t15').textContent=C.voucherTitle||'A few little gifts 🎁';hint.textContent=C.voucherHint||'tap a gift to redeem it ✦';
 L.innerHTML=V.map((v,i)=>`<div class="vw" style="--k:${i}"><div class="vt${got.includes(i)?' done':''}" data-i="${i}"><div class="ve">${v.e||'🎁'}</div><div class="vb"><b>${v.t||''}</b><span>${v.n||''}</span></div><div class="vr">REDEEM</div><div class="vs">REDEEMED ♡</div></div></div>`).join('');
 L.scrollTop=0;p.classList.remove('in');void p.offsetWidth;p.classList.add('in');
 const show=()=>{g.classList.remove('hid');g.classList.add('show')};g.classList.remove('show');g.classList.add('hid');if(got.length)show();else later(show,6500);
 L.onclick=e=>{const t=e.target.closest('.vt');if(!t||t.classList.contains('done'))return;t.classList.add('done');got.push(+t.dataset.i);try{localStorage.setItem('vouch',JSON.stringify(got))}catch(e){}
  const r=t.getBoundingClientRect();SFX.stamp();burst(r.left+r.width*.78,r.top+r.height/2,26,true);hint.textContent='show this to '+C.from+' 💌';show()};
 g.onclick=()=>go(nextOf(15))};
// ---------- p19: tiny music box (Happy Birthday, one note per tap or auto) ----------
init[19]=()=>{const p=$('#p19'),bx=$('#mbx'),ball=$('#mbb'),nt=$('#mbn'),lyr=$('#mbl'),bar=$('#mbf'),pl=$('#mbplay'),end=$('#mbend'),hint=$('#mbh'),g=$('#g19'),hand=$('#mbhand');
 const nm=(C.name||'').trim()||'you',cut=Math.ceil(nm.length/2),n1=nm.length>1?nm.slice(0,cut)+'-':nm+' ',n2=nm.length>1?nm.slice(cut):'♡';
 const syl=['Hap-','py ','birth-','day ','to ','you','Hap-','py ','birth-','day ','to ','you','Hap-','py ','birth-','day ','dear ',n1,n2,'Hap-','py ','birth-','day ','to ','you'],starts=[0,6,12,19],T=MEL.length;
 let i=0,auto=false,fin=false,sg=0;
 nt.innerHTML='';ball.classList.remove('spin');lyr.textContent='';end.textContent='Happy birthday, '+C.name+' ♡';end.classList.remove('in');bar.style.transform='scaleX(0)';
 pl.textContent='▶ play it for me';pl.classList.remove('hid');g.classList.remove('show');g.classList.add('hid');hand.style.display='block';hint.textContent='tap anywhere to play the tune, one note at a time ✦';
 const lineOf=k=>starts.filter(s=>s<=k).pop();
 const float=k=>{if(nt.children.length>=8)nt.firstChild.remove();const e=document.createElement('i');e.className='mbn';e.textContent='♪ '+syl[k].trim().replace(/-$/,'');
  e.style.cssText='left:'+(18+Math.random()*50)+'%;top:8%;color:'+['#d6428f','#8a4fd1','#e8821c','#2f9e8f'][k%4];nt.appendChild(e);
  const a=e.animate([{transform:'translate(0,0) scale(.7)',opacity:0},{transform:'translate(0,-26px) scale(1)',opacity:1,offset:.2},{transform:'translate('+((Math.random()-.5)*60)+'px,-90px) scale(1.05)',opacity:0}],{duration:1900,easing:'ease-out'});a.onfinish=()=>e.remove()};
 const finish=()=>{fin=true;auto=false;
  later(()=>{end.classList.add('in');burst(innerWidth/2,innerHeight*.4,90,true);SFX.chime()},800);
  later(()=>{pl.textContent='↺ play again';pl.classList.remove('hid');pl.classList.add('show');g.classList.remove('hid');g.classList.add('show')},1900)};
 const note=k=>{SFX.mb(MEL[k][0]);const r=bx.getBoundingClientRect();burst(r.left+r.width*(.35+Math.random()*.3),r.top+r.height*.28,6);float(k);
  ball.classList.add('spin');const my=++sg;later(()=>{if(my===sg)ball.classList.remove('spin')},1700);
  bx.animate([{transform:'scale(1)'},{transform:'scale(.975)'},{transform:'scale(1)'}],{duration:220,easing:'ease-out'});
  lyr.textContent=syl.slice(lineOf(k),k+1).join('');bar.style.transform='scaleX('+((k+1)/T)+')';if(k===T-1)finish()};
 p.onpointerdown=e=>{if(auto||fin||e.target.closest('button'))return;hand.style.display='none';hint.textContent='';note(i++)};
 pl.onclick=()=>{if(auto)return;auto=true;fin=false;i=0;end.classList.remove('in');lyr.textContent='';bar.style.transform='scaleX(0)';hand.style.display='none';hint.textContent='';pl.classList.add('hid');pl.classList.remove('show');
  let t=350;MEL.forEach((n,k)=>{later(()=>{if(auto)note(k)},t);t+=n[1]*500})};
 later(()=>{g.classList.remove('hid');g.classList.add('show')},60000);
 g.onclick=()=>go(nextOf(19))};
// ---------- p16: a very serious question (love meter) ----------
init[16]=()=>{const w=$('#lmw'),t=$('#lmt'),f=$('#lmf'),th=$('#lmth'),hr=$('#lmh'),nv=$('#lmv'),q=$('#lmq'),hint=$('#lmh16'),b2=$('#lm2'),g=$('#g16');
 const Q1=C.loveQ1||'How much do you love me?',Q2=C.loveQ2||'How much do I love you?',QE=C.loveEnd||'Always one more ♡';
 let v=0,phase=0,down=false,gen=0,lastB=0;const W=t.clientWidth;
 const setNum=s=>{nv.textContent=s;nv.style.fontSize=Math.min(3.4,33/Math.max(5,s.length))+'rem'};
 const paint=()=>{f.style.transform='scaleX('+(v/100)+')';th.style.translate=(v/100*W-17)+'px 0';hr.style.scale=1+v/200};
 const say=s=>{q.textContent=s;q.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:450,easing:'ease-out'})};
 const show=b=>{b.classList.remove('hid');b.classList.add('show')},hide=b=>{b.classList.remove('show');b.classList.add('hid')};
 th.classList.remove('wig');t.classList.remove('shk');hr.classList.remove('shake');hide(b2);hide(g);
 q.textContent=Q1;setNum('0%');paint();hint.textContent='drag the heart to answer ✦';
 const heartBurst=n=>{const r=hr.getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height/2,n,true)};
 const overflow=()=>{if(phase)return;phase=1;down=false;v=100;paint();setNum('100%');hint.textContent='';
  th.classList.add('wig');t.classList.add('shk');hr.classList.add('shake');hr.style.scale=1.6;say("Wait, that doesn't fit on a scale 😅");SFX.meter();
  const my=++gen,t0=performance.now();
  const step=now=>{if(cur!==16||my!==gen)return;const u=Math.min(1,(now-t0)/2500);
   if(u>=1){setNum('∞');heartBurst(60);SFX.good();later(()=>show(b2),800);return}
   const lg=2+4.8*Math.pow(u,2.2);setNum((lg>=6?1000000:Math.round(Math.pow(10,lg))).toLocaleString('en-US')+'%');requestAnimationFrame(step)};
  requestAnimationFrame(step)};
 const move=e=>{const r=t.getBoundingClientRect();v=Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100));setNum(Math.round(v)+'%');paint();hint.textContent='';
  const b=Math.min(13,Math.floor(v/7.2));if(b!==lastB){lastB=b;if(b>0)SFX.star(b)}if(v>=99.5)overflow()};
 w.onpointerdown=e=>{if(phase)return;e.preventDefault();down=true;try{w.setPointerCapture(e.pointerId)}catch(_){}move(e)};
 w.onpointermove=e=>{if(down&&!phase)move(e)};
 w.onpointerup=w.onpointercancel=()=>{down=false};
 // part 2: my turn
 b2.onclick=()=>{if(phase!==1)return;phase=2;gen++;hide(b2);th.classList.remove('wig');t.classList.remove('shk');hr.classList.remove('shake');
  v=0;paint();setNum('0%');say(Q2);const my=++gen;
  later(()=>{const t0=performance.now(),step=now=>{if(cur!==16||my!==gen)return;const u=Math.min(1,(now-t0)/900);v=100*(1-Math.pow(1-u,3));setNum(Math.round(v)+'%');paint();
    if(u<1){requestAnimationFrame(step);return}
    setNum('∞ + 1');hr.style.scale=1.7;hr.classList.add('shake');burst(innerWidth/2,innerHeight*.4,120,true);SFX.burst();say(QE);later(()=>show(g),1800)};
   requestAnimationFrame(step)},650)};
 g.onclick=()=>go(nextOf(16))};
// ---------- p17: garden (one flower for every year) ----------
const GB=[
 ()=>'<path d="M10 11C8 26 14 38 24 41C18 30 15 20 10 11Z" fill="#e8409a"/><path d="M38 11C40 26 34 38 24 41C30 30 33 20 38 11Z" fill="#cf2a86"/><path d="M24 5C13 12 12 29 24 41C36 29 35 12 24 5Z" fill="#ff7db8"/><path d="M24 10C20 17 20 26 24 33" fill="none" stroke="#ffd0e6" stroke-width="2" stroke-linecap="round" opacity=".85"/>',
 ()=>{let s='';for(let a=0;a<360;a+=30)s+=`<ellipse cx="24" cy="9.5" rx="3.7" ry="8" transform="rotate(${a} 24 24)" fill="#fff" stroke="#f3b6d8" stroke-width=".8"/>`;return s+'<circle cx="24" cy="24" r="6" fill="#ffc83d"/><circle cx="24" cy="24" r="3.2" fill="#ff9a1f"/>'},
 ()=>{let s='';for(let a=0;a<360;a+=45)s+=`<circle cx="24" cy="9.5" r="6.2" transform="rotate(${a} 24 24)" fill="#ff9cc4"/>`;return s+'<circle cx="24" cy="24" r="15" fill="#ff80b1" stroke="#f0589a" stroke-width="1"/><circle cx="24" cy="24" r="10.5" fill="#ff5f9f" stroke="#e03f89" stroke-width="1"/><path d="M24 15C31 16 33 23 28.5 27C24 30.5 18.5 27.5 19.5 23C20.5 19.5 25 19 26.5 21.5" fill="none" stroke="#c42a76" stroke-width="1.6" stroke-linecap="round"/><circle cx="24" cy="24" r="2.6" fill="#c42a76"/>'},
 ()=>{let s='';const c=['#a073e6','#8a58d4','#b693ee'];for(let i=0;i<10;i++){const y=42-i*4,r=4.4-i*.3;[-1,1].forEach((d,j)=>{s+=`<circle cx="${24+d*(3+(i%2)*1.2)}" cy="${(y+(j?1.8:0)).toFixed(1)}" r="${r.toFixed(2)}" fill="${c[(i+j)%3]}"/>`})}return s+'<circle cx="24" cy="4.5" r="2.4" fill="#b693ee"/>'},
 ()=>{let s='';for(let a=0;a<360;a+=45)s+=`<ellipse cx="24" cy="11" rx="6.4" ry="10.5" transform="rotate(${a} 24 24)" fill="#ff8f78"/>`;for(let a=22.5;a<360;a+=45)s+=`<ellipse cx="24" cy="13" rx="3.6" ry="7.5" transform="rotate(${a} 24 24)" fill="#ffb09b"/>`;return s+'<circle cx="24" cy="24" r="5" fill="#ffcf3f"/><circle cx="24" cy="24" r="2.4" fill="#f59a1b"/>'},
 ()=>{let s='';for(let a=0;a<360;a+=60)s+=`<g transform="translate(24 24) rotate(${a})"><path d="M0 0C-4-3-12-10-9-17C-6-23 0-19 0-15C0-19 6-23 9-17C12-10 4-3 0 0Z" fill="${a%120?'#ff8fbe':'#ff6fa8'}"/></g>`;return s+'<circle cx="24" cy="24" r="4.5" fill="#ffd45a"/><circle cx="24" cy="24" r="2" fill="#ff9a1f"/>'}];
const mkFlower=(t,s,x,y,z,sw)=>{const e=document.createElement('div'),a=(Math.random()<.5?-1:1)*(2+Math.random()*3);e.className='fl';
 e.style.cssText=`--s:${s.toFixed(3)};--sw:${sw.toFixed(1)}s;--sd:-${(Math.random()*4).toFixed(2)}s;translate:${(x-30*s).toFixed(1)}px ${(y-120*s).toFixed(1)}px;z-index:${z}`;
 e.innerHTML=`<svg class="sm" viewBox="0 0 60 120"><path d="M30 119C${(30+a).toFixed(1)} 102 ${(30-a).toFixed(1)} 84 30 50" fill="none" stroke="url(#gstm)" stroke-width="3.2" stroke-linecap="round"/><path d="M30 99C21 98 14 91 12 84C21 84 28 90 30 99Z" fill="#7acf9d"/><path d="M30 87C39 86 46 79 48 72C39 72 32 78 30 87Z" fill="#62bb8b"/></svg><svg class="bm" viewBox="0 0 48 48">${GB[t]()}</svg>`;return e};
init[17]=()=>{const st=$('#gst'),fl=$('#gfl'),big=$('#gbig'),chip=$('#fcn'),hint=$('#gh17'),g=$('#g17'),dn=$('#gdn'),hand=$('#ghand'),p=$('#p17'),gw=$('#gw'),ring=$('#gring'),gl=$('#gglow');
 const N=Math.max(1,Math.min(40,+C.age||19)),w=st.clientWidth,h=st.clientHeight,gy=Math.round(p.clientHeight*.66-st.offsetTop);
 fl.innerHTML='';big.innerHTML='';gw.classList.remove('br');dn.classList.remove('in');g.classList.remove('show');g.classList.add('hid');p.classList.remove('done');ring.classList.remove('on');
 gl.style.top=gy+'px';gw.style.transformOrigin='50% '+gy+'px';
 $('#gend').textContent=(C.gardenEnd||'{n} flowers for {n} years, and one more to grow with you ♡').replace(/\{n\}/g,N);
 chip.textContent='0 / '+N;hint.textContent='tap anywhere to plant ✦';hand.style.display='block';
 const rows=[[-34,.7],[0,.85],[34,1]],BASE=1.45,xs=[[],[],[]],lim=x=>Math.max(.08*w,Math.min(.92*w,x));let k=0,done=false,down=false,fx=0,fy=0,gen=0;
 const showBtn=()=>{g.classList.remove('hid');g.classList.add('show')};
 const finish=()=>{done=true;down=false;hand.style.display='none';hint.textContent='';p.classList.add('done');
  const s=BASE*2.2,by=gy-6,cy=by-120*s+38*s,rc=()=>st.getBoundingClientRect();
  later(()=>{gw.classList.add('br');const e=mkFlower(5,s,w/2,by,0,6);e.classList.add('big');big.appendChild(e);ring.style.translate=(w/2)+'px '+cy+'px';SFX.chime()},700);
  later(()=>{ring.classList.add('on');SFX.burst();const r=rc();burst(r.left+w/2,r.top+cy,90,true);rain(40,true)},2000);
  later(()=>rain(30,true),3400);later(()=>dn.classList.add('in'),2900);later(showBtn,5200)};
 const plant=(px,py)=>{if(done||k>=N)return;
  const r=py<h*.42?0:py<h*.72?1:2;let x=lim(px);
  for(let t=0;t<6&&xs[r].some(q=>Math.abs(q-x)<36);t++)x=lim(x+(t%2?-1:1)*(22+t*16));
  xs[r].push(x);
  const s=rows[r][1]*BASE,y=gy+rows[r][0]+(Math.random()*10-5);
  fl.appendChild(mkFlower(k%5,s,x,y,r+1,3+Math.random()*2));
  const rc=st.getBoundingClientRect();burst(rc.left+x,rc.top+y-95*s,8);
  SFX.plant(Math.round(k*13/Math.max(1,N-1)));
  k++;chip.textContent=k+' / '+N;chip.animate([{transform:'scale(1.22)'},{transform:'scale(1)'}],{duration:300,easing:'ease-out'});
  if(k===1){hand.style.display='none';hint.textContent='hold your finger down to plant faster ✿'}
  if(k>=N)finish()};
 const pos=e=>{const r=st.getBoundingClientRect();return[(e.clientX-r.left)*w/r.width,(e.clientY-r.top)*h/r.height]};
 const hold=()=>later(()=>{if(down&&!done){plant(fx,fy);hold()}},260);
 // nobody gets stuck: after 8s without a touch the garden plants itself, one flower per 0.9s
 const arm=()=>{const my=++gen;later(()=>{const step=()=>{if(my!==gen||done)return;plant(w*(.12+Math.random()*.76),h*Math.random());later(step,900)};if(my===gen&&!done)step()},8000)};
 st.onpointerdown=e=>{if(done)return;e.preventDefault();down=true;try{st.setPointerCapture(e.pointerId)}catch(_){}[fx,fy]=pos(e);plant(fx,fy);hold();arm()};
 st.onpointermove=e=>{if(down)[fx,fy]=pos(e)};
 st.onpointerup=st.onpointercancel=()=>{down=false;if(!done)arm()};
 arm();later(showBtn,70000);
 g.onclick=()=>go(nextOf(17))};
// ---------- p20: reasons jar ----------
init[20]=()=>{const st=$('#rjs'),wr=$('#rjw'),box=$('#rjh'),chip=$('#rjn'),hint=$('#rjhint'),g=$('#g20'),dn=$('#rjdn'),hand=$('#rjhand'),p=$('#p20'),ov=$('#rjo'),card=$('#rjc'),lid=$('#rjlid'),tx=$('#rjt');
 let R=(Array.isArray(C.reasons)?C.reasons.filter(Boolean):[]).slice(0,16);if(R.length<2)R=['your smile','your kindness','you'];
 const N=R.length;$('#t20').textContent=C.reasonsTitle||'A jar full of reasons 💌';$('#rjend').textContent=C.reasonsEnd||"…and a thousand more I haven't said yet ♡";
 box.innerHTML='';p.querySelectorAll('.rfly').forEach(e=>e.remove());ov.classList.remove('on');card.getAnimations().forEach(a=>a.cancel());lid.getAnimations().forEach(a=>a.cancel());
 dn.classList.remove('in');g.classList.remove('show');g.classList.add('hid');p.classList.remove('done');
 chip.textContent='0 / '+N;hint.textContent='tap a little heart to read it ✦';
 const jw=wr.clientWidth,k=jw/300,cols=N>12?4:3,sz=Math.round(60*k*(N>12?.88:1)),rows=Math.ceil(N/cols);
 let sd=7;const rn=()=>(sd=sd*16807%2147483647)/2147483647;
 const CL=['#ff8fb8','#f7a6d3','#c4a2f2','#ffa9a0','#ffc68a','#e58ae0','#ff7fa8','#b9b3f7'];
 const HS=c=>`<svg viewBox="0 0 64 60"><path d="M32 57C10 40 3 28 3 18 3 9 10 3 18 3c6 0 11 3 14 8 3-5 8-8 14-8 8 0 15 6 15 15 0 10-7 22-29 39z" fill="${c}"/><path d="M32 11C29 6 24 3 18 3 10 3 3 9 3 18c0 10 7 22 29 39z" fill="#fff" opacity=".26"/><path d="M8 14L32 38L56 14" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.4" stroke-linejoin="round"/><path d="M32 11V57" stroke="#000" stroke-opacity=".07" stroke-width="1.2"/></svg>`;
 // shuffle which reason sits in which heart (seeded), so the order is a surprise
 const ord=R.map((_,i)=>i);for(let i=N-1;i>0;i--){const j=Math.floor(rn()*(i+1));[ord[i],ord[j]]=[ord[j],ord[i]]}
 let top=null,k0=0,busy=false,done=false,canClose=false,gen=0;const hs=[];
 for(let i=0;i<N;i++){const r=Math.floor(i/cols),c=i%cols,inRow=Math.min(cols,N-r*cols),step=sz*.92,x0=(jw-inRow*step)/2+(r%2?sz*.16:-sz*.16);
  let x=x0+c*step+step/2+(rn()-.5)*8*k;x=Math.max(40*k+sz/2,Math.min(260*k-sz/2,x));
  const y=316*k-sz*.5-r*sz*.7+(rn()-.5)*6*k,col=CL[(i*3+r)%CL.length],rot=Math.round((rn()-.5)*50);
  const e=document.createElement('div');e.className='rh';e.style.cssText=`left:${(x-sz/2).toFixed(1)}px;top:${(y-sz*.47).toFixed(1)}px;width:${sz}px;height:${(sz*.94).toFixed(1)}px;rotate:${rot}deg;z-index:${r+1}`;
  e.style.setProperty('--bd',(2.6+rn()*1.6).toFixed(2)+'s');e.style.setProperty('--dl',(-rn()*3).toFixed(2)+'s');e.innerHTML=HS(col);e.dataset.i=ord[i];e.dataset.rot=rot;
  e.onclick=()=>open(e);box.appendChild(e);hs.push(e);if(!top||y<top.y)top={e,y,x}}
 hand.style.display='block';hand.style.left=(top.x-14)+'px';hand.style.top=(top.y-6)+'px';
 const showBtn=()=>{g.classList.remove('hid');g.classList.add('show')};
 const finish=()=>{done=true;hint.textContent='';p.classList.add('done');
  later(()=>{SFX.chime();lid.animate([{transform:'translateY(0) rotate(0deg)'},{transform:'translateY(-30px) rotate(-9deg)',offset:.4},{transform:'translateY(0) rotate(0deg)'}],{duration:900,easing:'cubic-bezier(.3,1.4,.5,1)'})},300);
  later(()=>{SFX.burst();const r=wr.getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height*.2,90,true);rain(36,true);dn.classList.add('in')},1100);
  later(()=>rain(26,true),3000);later(showBtn,3400)};
 const close=()=>{if(!canClose)return;canClose=false;
  card.animate([{transform:'translateY(0) scale(1)',opacity:1},{transform:'translateY(-46px) scale(.72)',opacity:0}],{duration:330,easing:'ease-in',fill:'forwards'});
  later(()=>{ov.classList.remove('on');card.getAnimations().forEach(a=>a.cancel());busy=false;if(k0>=N)finish();else arm()},340)};
 ov.onclick=close;
 const showCard=i=>{k0++;chip.textContent=k0+' / '+N;chip.animate([{transform:'scale(1.22)'},{transform:'scale(1)'}],{duration:300,easing:'ease-out'});
  $('#rjk').textContent='reason no. '+k0;const t=R[i];tx.textContent=t;tx.style.fontSize=t.length>34?'1.65rem':t.length>18?'1.9rem':'2.3rem';
  hint.textContent='';
  card.getAnimations().forEach(a=>a.cancel());ov.classList.add('on');
  card.animate([{transform:'scale(.16,.08) rotate(-14deg)',opacity:0},{transform:'scale(1,.1) rotate(-3deg)',opacity:1,offset:.34},{transform:'scale(1,1) rotate(0deg)',opacity:1}],{duration:780,easing:'cubic-bezier(.25,.9,.3,1.05)'});
  tx.animate([{opacity:0},{opacity:1}],{duration:520,delay:420,fill:'backwards'});
  SFX.unfold();later(()=>SFX.star(Math.round((k0-1)*13/Math.max(1,N-1))),420);
  later(()=>{const r=card.getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height/2,12,true)},700);
  canClose=false;later(()=>{canClose=true},900)};
 const open=e=>{if(busy||done||e.classList.contains('gone'))return;busy=true;gen++;hand.style.display='none';
  e.classList.add('gone');const pr=p.getBoundingClientRect(),er=e.getBoundingClientRect(),sr=st.getBoundingClientRect();
  const ex=er.left+er.width/2-pr.left,ey=er.top+er.height/2-pr.top,tX=sr.left+sr.width/2-pr.left,tY=sr.top+sr.height/2-pr.top-H*.04;
  const f=document.createElement('div');f.className='rfly';f.style.cssText=`left:${ex-er.width/2}px;top:${ey-er.height/2}px;width:${er.width}px;height:${er.height}px`;f.innerHTML=e.innerHTML;p.appendChild(f);
  const rot=+e.dataset.rot||0,dx=tX-ex,dy=tY-ey;SFX.pop();
  f.animate([{transform:`translate(0,0) rotate(${rot}deg) scale(1)`},{transform:`translate(${dx*.45}px,${dy*.5-80}px) rotate(${rot*.3}deg) scale(1.9)`,offset:.5},{transform:`translate(${dx}px,${dy}px) rotate(0deg) scale(2.7)`}],{duration:620,easing:'cubic-bezier(.3,.7,.3,1)',fill:'forwards'});
  later(()=>{f.remove();showCard(+e.dataset.i)},620)};
 // nobody gets stuck: show the hand again after 10s idle, and the button after 90s whatever happens
 const arm=()=>{const my=++gen;later(()=>{if(my===gen&&!busy&&!done){const rem=hs.filter(e=>!e.classList.contains('gone'));if(rem.length){const e=rem[rem.length-1],r=e.getBoundingClientRect(),s=wr.getBoundingClientRect();hand.style.left=(r.left-s.left+r.width/2-14)+'px';hand.style.top=(r.top-s.top+r.height*.3)+'px';hand.style.display='block'}}},10000)};
 arm();later(showBtn,90000);
 g.onclick=()=>go(nextOf(20))};
// ---------- p18: connect our stars (constellation heart) ----------
init[18]=()=>{const st=$('#cst'),cv=$('#cvc'),cf=$('#cvf'),ring=$('#cring'),hand=$('#chand'),hint=$('#ch18'),g=$('#g18'),dn=$('#cdn'),p=$('#p18'),met=$('#met');
 const nm=$('#cnm');nm.textContent=C.name;nm.style.fontSize=Math.min(3.2,20/Math.max(C.name.length,4))+'rem';$('#cln').textContent=C.starLine||'my favourite constellation';
 const w=st.clientWidth,h=st.clientHeight,dpr=Math.min(devicePixelRatio||1,2);
 [cv,cf].forEach(c=>{c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);c.getContext('2d').setTransform(dpr,0,0,dpr,0,0)});
 const g2=cv.getContext('2d'),gf=cf.getContext('2d');g2.clearRect(0,0,w,h);gf.clearRect(0,0,w,h);
 st.querySelectorAll('.cstar').forEach(e=>e.remove());cf.classList.remove('on');dn.classList.remove('in');g.classList.remove('show');g.classList.add('hid');p.classList.remove('done');ring.classList.remove('on');hand.style.display='none';
 // 14 stars on a heart curve, equally spaced along its length, starting at the bottom tip
 const hp=t=>[16*Math.sin(t)**3,-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))],M=1400,N=14,cum=[0],raw=[];let pv=hp(Math.PI);raw.push(pv);
 for(let i=1;i<=M;i++){const q=hp(Math.PI+i/M*2*Math.PI);cum.push(cum[i-1]+Math.hypot(q[0]-pv[0],q[1]-pv[1]));raw.push(q);pv=q}
 const L=cum[M],S=.78*w/32,ox=w/2,oy=h*.4-2.55*S;let sd=11;const rn=()=>(sd=sd*16807%2147483647)/2147483647,Pt=[];
 for(let k=0;k<N;k++){const tg=k/N*L;let i=1;while(i<M&&cum[i]<tg)i++;const f=(tg-cum[i-1])/((cum[i]-cum[i-1])||1),a=raw[i-1],b=raw[i];Pt.push({x:ox+(a[0]+(b[0]-a[0])*f)*S+(rn()-.5)*12,y:oy+(a[1]+(b[1]-a[1])*f)*S+(rn()-.5)*12})}
 const dots=Pt.map((q,i)=>{const e=document.createElement('div');e.className='cstar'+([1,3,5,8,10,12].includes(i)?' tw':'');e.style.left=q.x+'px';e.style.top=q.y+'px';e.style.setProperty('--d',(i*.37%2.4).toFixed(2)+'s');e.innerHTML='<b></b>';st.insertBefore(e,ring);return e});
 let n=0,done=false,down=false,lx=0,ly=0,fx=0,fy=0,gen=0,hAn=null;const nxt=()=>n<N?n:0,R=34;
 const draw=()=>{g2.clearRect(0,0,w,h);g2.lineCap=g2.lineJoin='round';
  if(n>1){g2.beginPath();g2.moveTo(Pt[0].x,Pt[0].y);for(let i=1;i<Math.min(n,N);i++)g2.lineTo(Pt[i].x,Pt[i].y);if(n>N)g2.lineTo(Pt[0].x,Pt[0].y);g2.lineWidth=10;g2.strokeStyle='rgba(255,140,200,.26)';g2.stroke();g2.lineWidth=3;g2.strokeStyle='rgba(192,40,110,.85)';g2.stroke()}
  if(down&&!done&&n>0){const a=Pt[(n-1)%N];g2.beginPath();g2.moveTo(a.x,a.y);g2.lineTo(fx,fy);g2.lineWidth=3;g2.strokeStyle='rgba(192,40,110,.4)';g2.stroke()}};
 const placeRing=()=>{const q=Pt[nxt()];ring.style.translate=q.x+'px '+q.y+'px';ring.classList.add('on')};
 const hideHand=()=>{if(hAn){hAn.cancel();hAn=null}hand.style.display='none'};
 const showHand=()=>{if(done||down)return;const a=n?Pt[(n-1)%N]:Pt[0],b=n?Pt[nxt()]:Pt[1];hand.style.display='block';hAn=hand.animate([{transform:`translate(${a.x}px,${a.y}px)`,opacity:0},{transform:`translate(${a.x}px,${a.y}px)`,opacity:1,offset:.18},{transform:`translate(${b.x}px,${b.y}px)`,opacity:1,offset:.8},{transform:`translate(${b.x}px,${b.y}px)`,opacity:0}],{duration:2200,iterations:Infinity,easing:'ease-in-out'})};
 const arm=()=>{const my=++gen;later(()=>{if(my===gen)showHand()},10000)};
 const showBtn=()=>{g.classList.remove('hid');g.classList.add('show')};
 const finish=()=>{done=true;down=false;ring.classList.remove('on');hideHand();hint.textContent='';p.classList.add('done');
  const mid=(a,b)=>[(a.x+b.x)/2,(a.y+b.y)/2],m0=mid(Pt[N-1],Pt[0]);gf.beginPath();gf.moveTo(m0[0],m0[1]);Pt.forEach((q,i)=>{const m1=mid(q,Pt[(i+1)%N]);gf.quadraticCurveTo(q.x,q.y,m1[0],m1[1])});gf.closePath();gf.fillStyle='rgba(255,170,210,.32)';gf.fill();cf.classList.add('on');
  SFX.chime();later(()=>{SFX.meteor();const W=p.clientWidth,H=p.clientHeight,y0=H*.1;met.animate([{transform:`translate(${W}px,${y0}px) rotate(133deg)`,opacity:0},{opacity:1,offset:.12},{transform:`translate(${-W*.2}px,${y0+H*.6}px) rotate(133deg)`,opacity:0}],{duration:1100,easing:'cubic-bezier(.5,0,.9,.6)'})},500);
  later(()=>burst(innerWidth/2,innerHeight*.36,80,true),900);later(()=>dn.classList.add('in'),1300);later(showBtn,2600)};
 const link=()=>{const i=nxt();n++;if(n<=N){dots[i].classList.add('on');SFX.star(i)}
  hint.textContent=n>=N?'now back to the first star ♡':n>0?'follow the glow ✨':'';
  draw();if(n>N){finish();return}placeRing();arm()};
 const near=(ax,ay,bx,by,px,py)=>{const dx=bx-ax,dy=by-ay,l=dx*dx+dy*dy;let t=l?((px-ax)*dx+(py-ay)*dy)/l:0;t=Math.max(0,Math.min(1,t));return Math.hypot(ax+dx*t-px,ay+dy*t-py)};
 const test=(ax,ay,bx,by)=>{let c=0;while(!done&&c++<4){const q=Pt[nxt()];if(near(ax,ay,bx,by,q.x,q.y)<R)link();else break}};
 const pos=e=>{const r=st.getBoundingClientRect();return[(e.clientX-r.left)*w/r.width,(e.clientY-r.top)*h/r.height]};
 st.onpointerdown=e=>{if(done)return;e.preventDefault();down=true;try{st.setPointerCapture(e.pointerId)}catch(_){}[lx,ly]=pos(e);fx=lx;fy=ly;hideHand();test(lx,ly,lx,ly);draw();arm()};
 st.onpointermove=e=>{if(!down||done)return;const[x,y]=pos(e);test(lx,ly,x,y);lx=fx=x;ly=fy=y;draw()};
 st.onpointerup=st.onpointercancel=()=>{down=false;if(!done){draw();arm()}};
 hint.textContent='touch the glowing star, then drag to the next ✦';placeRing();arm();later(showBtn,45000);
 g.onclick=()=>go(nextOf(18))};
// ---------- keepsake wallpaper (p12): draws a 1179x2556 lock-screen picture ----------
let wallF=null,wallP=null;
async function makeWall(){
 const W=1179,H=2556,cx=W/2,cy=1380,R=340,RR=R+64,cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');
 const SER='"Cormorant Garamond",Georgia,"Times New Roman",serif',SAN='Fredoka,system-ui,-apple-system,sans-serif';
 try{await Promise.all([document.fonts.load('italic 600 170px "Cormorant Garamond"'),document.fonts.load('italic 500 54px "Cormorant Garamond"'),document.fonts.load('600 40px Fredoka'),document.fonts.load('400 26px Fredoka')]);await document.fonts.ready}catch(e){}
 const nm=(C.name||'').trim()||'You',fr=(C.from||'').trim(),line=C.finalLine||'Another year of you, my favourite part of every single day.';
 const stops=(q,a)=>{a.forEach(([o,c])=>q.addColorStop(o,c));return q};
 g.fillStyle=stops(g.createLinearGradient(0,0,0,H),[[0,'#fbe0f1'],[.3,'#f9cfe8'],[.68,'#ecd0f4'],[1,'#f2dff3']]);g.fillRect(0,0,W,H);
 const glow=(x,y,r,a)=>{g.fillStyle=stops(g.createRadialGradient(x,y,0,x,y,r),a);g.fillRect(x-r,y-r,r*2,r*2)};
 glow(cx,H*.3,1000,[[0,'rgba(255,255,255,.72)'],[1,'rgba(255,255,255,0)']]);
 glow(W*.1,H*.62,640,[[0,'rgba(255,170,215,.24)'],[1,'rgba(255,170,215,0)']]);glow(W*.94,H*.8,640,[[0,'rgba(190,160,255,.24)'],[1,'rgba(190,160,255,0)']]);
 // seeded stars + dust
 let sd=20261110;const rnd=()=>{sd=(sd+0x6D2B79F5)|0;let t=Math.imul(sd^sd>>>15,1|sd);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
 const spark=(x,y,r,col,a)=>{g.globalAlpha=a;g.fillStyle=col;g.beginPath();for(let k=0;k<8;k++){const rr=k%2?r*.24:r,an=k*Math.PI/4-Math.PI/2;g.lineTo(x+Math.cos(an)*rr,y+Math.sin(an)*rr)}g.closePath();g.fill();g.globalAlpha=1};
 const bad=(x,y)=>Math.hypot(x-cx,y-cy)<RR+130||(y>cy-RR-180&&y<cy-RR-60&&Math.abs(x-cx)<430)||(y>cy+RR+30&&y<2240&&Math.abs(x-cx)<500);
 for(let i=0,n=0;n<40&&i<900;i++){const x=40+rnd()*(W-80),y=40+rnd()*(H-80);if(bad(x,y))continue;
  const calm=y<H*.3||y>H*.88,r=(calm?7:9)+rnd()*(calm?9:17),gold=n%3!==1;if(r>15)glow(x,y,r*3,gold?[[0,'rgba(255,214,130,.5)'],[1,'rgba(255,214,130,0)']]:[[0,'rgba(255,150,205,.45)'],[1,'rgba(255,150,205,0)']]);
  spark(x,y,r,gold?'#f5b83d':'#ff8fc7',calm?.6:.95);n++}
 for(let i=0;i<70;i++){const x=rnd()*W,y=rnd()*H;if(Math.hypot(x-cx,y-cy)<RR+30)continue;g.fillStyle=`rgba(255,255,255,${.35+rnd()*.5})`;g.beginPath();g.arc(x,y,1.5+rnd()*3,0,6.2832);g.fill()}
 // glass orb
 glow(cx,cy,R*1.95,[[0,'rgba(255,150,205,0)'],[.5,'rgba(255,150,205,.42)'],[1,'rgba(255,150,205,0)']]);
 g.beginPath();g.arc(cx,cy,R,0,6.2832);g.fillStyle=stops(g.createRadialGradient(cx-R*.28,cy-R*.4,0,cx-R*.28,cy-R*.4,R*1.5),[[0,'rgba(255,255,255,.88)'],[.4,'rgba(255,255,255,.4)'],[.8,'rgba(255,196,230,.42)'],[1,'rgba(255,255,255,.12)']]);g.fill();
 g.lineWidth=4;g.strokeStyle='rgba(255,255,255,.92)';g.stroke();g.beginPath();g.arc(cx,cy,R-16,0,6.2832);g.lineWidth=1.5;g.strokeStyle='rgba(255,255,255,.55)';g.stroke();
 // ring of text
 let fz=26;g.font=`400 ${fz}px ${SAN}`;const cw=c=>g.measureText(c).width,ph=`made with love ✦ for ${nm} ✦ ${fr?'by '+fr+' ✦ ':''}`,circ=2*Math.PI*RR;
 const w1=[...ph].reduce((a,c)=>a+cw(c),0);if(w1+ph.length*5>circ){fz=Math.max(12,Math.floor(fz*circ/(w1+ph.length*5)));g.font=`400 ${fz}px ${SAN}`}
 const one=[...ph].reduce((a,c)=>a+cw(c),0),k=Math.max(1,Math.floor(circ/(one+ph.length*10))),all=[...ph.repeat(k)],tot=all.reduce((a,c)=>a+cw(c),0),gap=Math.max(1,(circ-tot)/all.length);
 g.fillStyle='#9b2f78';g.globalAlpha=.78;g.textAlign='left';g.textBaseline='alphabetic';let an=-Math.PI/2;
 all.forEach(c=>{const w=cw(c),th=an+(w/2)/RR;g.save();g.translate(cx+Math.cos(th)*RR,cy+Math.sin(th)*RR);g.rotate(th+Math.PI/2);g.fillText(c,-w/2,0);g.restore();an+=(w+gap)/RR});g.globalAlpha=1;
 // HAPPY BIRTHDAY (spaced)
 g.font=`600 40px ${SAN}`;g.fillStyle='#9b2f78';g.globalAlpha=.9;{const cs=[...'HAPPY BIRTHDAY'],ws=cs.map(cw),gp=26,tw=ws.reduce((a,b)=>a+b,0)+gp*(cs.length-1);let px=cx-tw/2;cs.forEach((c,i)=>{g.fillText(c,px,cy-RR-112);px+=ws[i]+gp})}g.globalAlpha=1;
 // name
 let fs=170;g.font=`italic 600 ${fs}px ${SER}`;const w0=g.measureText(nm).width,mw=R*1.62;if(w0>mw){fs=Math.floor(fs*mw/w0);g.font=`italic 600 ${fs}px ${SER}`}
 const tw=g.measureText(nm).width;g.fillStyle=stops(g.createLinearGradient(cx-tw/2,0,cx+tw/2,0),[[0,'#b0286e'],[.5,'#cf4496'],[1,'#8a4fd1']]);g.textAlign='center';g.fillText(nm,cx,cy+fs*.18);
 {const x=cx,y=cy+118,s=22;g.beginPath();g.moveTo(x,y+s*.9);g.bezierCurveTo(x-s*1.5,y-s*.1,x-s*.7,y-s,x,y-s*.35);g.bezierCurveTo(x+s*.7,y-s,x+s*1.5,y-s*.1,x,y+s*.9);g.closePath();g.fillStyle=stops(g.createLinearGradient(x,y-s,x,y+s),[[0,'#f06aa8'],[1,'#c0286e']]);g.fill()}
 // ornament + final line + signature
 const oy=cy+RR+84;g.strokeStyle='rgba(155,47,120,.35)';g.lineWidth=2;g.beginPath();g.moveTo(cx-200,oy);g.lineTo(cx-44,oy);g.moveTo(cx+44,oy);g.lineTo(cx+200,oy);g.stroke();spark(cx,oy,15,'#f5b83d',1);
 const wrap=(t,m)=>{const out=[];let c='';t.split(/\s+/).forEach(w=>{const tt=c?c+' '+w:w;if(g.measureText(tt).width>m&&c){out.push(c);c=w}else c=tt});if(c)out.push(c);return out};
 let ls=[],lf=54;for(const f of [54,50,46,42,38,34]){lf=f;g.font=`italic 500 ${f}px ${SER}`;ls=wrap(line,860);if(ls.length<=2||(ls.length<=3&&f<=46))break}
 g.fillStyle='#8a2a78';g.globalAlpha=.92;g.textAlign='center';const lh=lf*1.4;ls.forEach((t,i)=>g.fillText(t,cx,oy+96+i*lh));g.globalAlpha=1;
 const sy=Math.min(2150,oy+96+(ls.length-1)*lh+100);
 if(fr){g.font=`italic 500 50px ${SER}`;g.fillStyle='#9b2f78';g.globalAlpha=.88;g.fillText('— '+fr,cx,sy);g.globalAlpha=1}
 {g.font=`400 28px ${SAN}`;g.fillStyle='#9b2f78';g.globalAlpha=.6;const cs=[...String(new Date().getFullYear())],ws=cs.map(cw),gp=16,tw2=ws.reduce((a,b)=>a+b,0)+gp*(cs.length-1);let px=cx-tw2/2;g.textAlign='left';cs.forEach((c,i)=>{g.fillText(c,px,sy+(fr?58:0));px+=ws[i]+gp});g.globalAlpha=1}
 return new Promise((res,rej)=>cv.toBlob(b=>{cv.width=cv.height=0;b?res(b):rej(new Error('blob'))},'image/png'))}
function wallShow(f){let o=$('#wp');if(!o){o=document.createElement('div');o.id='wp';o.innerHTML='<button id="wpx" type="button" aria-label="close">✕</button><div class="wpc"><img id="wpi" alt="wallpaper"><p>press &amp; hold the picture, then <b>Save to Photos</b></p><a id="wpd">⬇ download</a></div>';document.body.appendChild(o);$('#wpx').onclick=()=>o.classList.remove('on')}
 const u=URL.createObjectURL(f);$('#wpi').src=u;const a=$('#wpd');a.href=u;a.download=f.name;o.classList.add('on')}
function wallInit(){const keep=$('#keep'),T0='✦ keep this as a wallpaper';keep.textContent=T0;keep.classList.remove('busy');
 const prep=()=>wallP||(wallP=makeWall().then(b=>{wallF=new File([b],`happy-birthday-${(C.name||'').replace(/[^\w-]+/g,'')||'you'}.png`,{type:'image/png'});return wallF}).catch(e=>{wallP=null;throw e}));
 if(!wallF)later(()=>{prep().catch(()=>{})},4800);
 const reset=()=>{keep.textContent=T0;keep.classList.remove('busy')},done=()=>{keep.textContent='saved ✓';keep.classList.remove('busy');SFX.chime()};
 const send=f=>{let can=false;try{can=!!(navigator.share&&navigator.canShare&&navigator.canShare({files:[f]}))}catch(e){}
  if(!can){wallShow(f);reset();return}
  navigator.share({files:[f]}).then(done,e=>{if(e&&e.name==='AbortError')reset();else{wallShow(f);reset()}})};
 keep.onclick=()=>{if(keep.classList.contains('busy'))return;keep.classList.add('busy');if(wallF)return send(wallF);keep.textContent='✦ making it…';prep().then(send,()=>{keep.textContent='couldn’t make it, tap to retry';keep.classList.remove('busy')})}}
// ---------- p12 extras: secret note (N8b) + live counters (N8c) ----------
function p12Extras(){
 const sec=$('#sec12'),orb=$('#p12>.orb'),cn=$('#cnt12');sec.textContent=C.secret||'P.S. You are my favourite thing, always. ♡';sec.classList.remove('show');
 let taps=[];const toggle=()=>{if(sec.classList.contains('show')){sec.classList.remove('show');return}sec.classList.add('show');burst(innerWidth/2,innerHeight*.48,60,true);SFX.chime()};
 orb.onpointerdown=()=>{const n=performance.now();taps=taps.filter(t=>n-t<1200);taps.push(n);if(taps.length>=3){taps=[];toggle()}};sec.onclick=()=>sec.classList.remove('show');
 const pd=s=>{const q=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s||'').trim());if(!q)return null;const d=new Date(+q[1],+q[2]-1,+q[3]);return isNaN(d)?null:d},since=pd(C.since),dob=pd(C.dob);
 cn.textContent='';cn.style.display=since||dob?'':'none';if(!(since||dob))return;
 const ymd=(a,b)=>{let y=b.getFullYear()-a.getFullYear(),m=b.getMonth()-a.getMonth(),d=b.getDate()-a.getDate();if(d<0){m--;d+=new Date(b.getFullYear(),b.getMonth(),0).getDate()}if(m<0){y--;m+=12}return[y,m,d]};
 const un=(n,w)=>n+' '+w+(n===1?'':'s'),z=n=>String(n).padStart(2,'0');
 const render=()=>{const now=new Date(),clock=z(now.getHours())+':'+z(now.getMinutes())+':'+z(now.getSeconds()),L=[];
  if(since&&since<=now){const[y,m,d]=ymd(since,now),P=[];if(y)P.push(un(y,'year'));if(m)P.push(un(m,'month'));if(d||!P.length)P.push(un(d,'day'));L.push('together for '+P.join(' ')+' · '+clock)}
  if(dob&&dob<=now){const[y]=ymd(dob,now),days=Math.floor((now-dob)/864e5);L.push(un(y,'year')+' = '+days.toLocaleString('en-US')+' days')}
  cn.textContent=L.join('\n')};
 cn.style.whiteSpace='pre-line';const tick=()=>{if(cur!==12)return;render();later(tick,1000)};tick()}
init[12]=()=>{const p=$('#p12'),sky=$('#sky');p.classList.remove('run');void p.offsetWidth;p.classList.add('run');sky.innerHTML='';
 const nm=$('#n12');nm.textContent=C.name;nm.style.fontSize=Math.min(3.8,22/Math.max(C.name.length,4))+'rem';$('#fl').textContent=C.finalLine||'Another year of you, my favourite part of every single day.';
 const ph=`made with love ✦ for ${C.name} ✦ by ${C.from} ✦ `;$('#rt').textContent=ph+ph;SFX.chime();
 if(!RM){const lan=()=>{if(cur!==12)return;const W=p.clientWidth,H=p.clientHeight,el=document.createElement('div');el.className='ln';const x=Math.max(60,Math.min(W-60,W*(.12+.76*Math.random())));el.style.left=(x-32)+'px';el.style.top=(H-100)+'px';el.innerHTML='<div class="lb"></div>';sky.appendChild(el);
  el.animate([{transform:'translate(0,0) scale(1)',opacity:0},{opacity:.95,offset:.1},{opacity:.95,offset:.75},{transform:`translate(${(Math.random()-.5)*90}px,${-H*.95}px) scale(.45)`,opacity:0}],{duration:16000,easing:'cubic-bezier(.3,.12,.3,1)',fill:'both'}).onfinish=()=>el.remove();later(lan,7000)};later(lan,2500);later(lan,6500)}
 $('#replay').onclick=()=>{bgm.currentTime=0;go(1)};wallInit();p12Extras();p12Para()};
// ---------- p12: gentle parallax (iPhone: motion sensor after the first tap; elsewhere: finger / mouse move) ----------
const PARA={tx:0,ty:0,x:0,y:0,raf:0,gyro:0,asked:0,l:0,bx:null,by:null};
function p12Para(){
 const p=$('#p12'),orb=$('#p12>.orb'),ring=$('#p12 .ring'),sky=$('#sky');
 PARA.tx=PARA.ty=PARA.x=PARA.y=0;PARA.bx=PARA.by=null;PARA.gyro=0;[orb,ring,sky].forEach(e=>{e.style.translate=''});
 if(RM||C.gyro===false)return;
 const tr=(e,x,y)=>{e.style.translate=x.toFixed(2)+'px '+y.toFixed(2)+'px'};
 const step=()=>{PARA.raf=0;if(cur!==12)return;
  PARA.x+=(PARA.tx-PARA.x)*.09;PARA.y+=(PARA.ty-PARA.y)*.09;
  tr(orb,PARA.x*4,PARA.y*4);tr(ring,PARA.x*4,PARA.y*4);tr(sky,-PARA.x*8,-PARA.y*8); // orb 4px + ring 4px more = 8px; sky moves the other way
  if(Math.abs(PARA.tx-PARA.x)>.002||Math.abs(PARA.ty-PARA.y)>.002)PARA.raf=requestAnimationFrame(step)};
 const set=(x,y)=>{PARA.tx=Math.max(-1,Math.min(1,x));PARA.ty=Math.max(-1,Math.min(1,y));if(!PARA.raf&&cur===12)PARA.raf=requestAnimationFrame(step)};
 p.onpointermove=e=>{if(PARA.gyro)return;const r=p.getBoundingClientRect();set((e.clientX-r.left)/r.width*2-1,(e.clientY-r.top)/r.height*2-1)};
 p.onpointerup=p.onpointercancel=e=>{if(!PARA.gyro&&e.pointerType==='touch')set(0,0)};
 p.onpointerleave=()=>{if(!PARA.gyro)set(0,0)};
 const onO=e=>{if(cur!==12||e.gamma==null||e.beta==null)return;
  if(PARA.bx==null){PARA.bx=e.gamma;PARA.by=e.beta}PARA.gyro=1;
  PARA.bx+=(e.gamma-PARA.bx)*.004;PARA.by+=(e.beta-PARA.by)*.004; // slowly re-centre, so however she holds the phone becomes the middle
  set((e.gamma-PARA.bx)/18,(e.beta-PARA.by)/18)};
 const listen=()=>{if(PARA.l)return;PARA.l=1;window.addEventListener('deviceorientation',onO)};
 if(PARA.asked===2)listen(); // already allowed earlier this visit
 // iOS only allows the motion-sensor prompt inside a real tap (click), so ask on the first tap of this page (not on buttons)
 p.onclick=e=>{if(PARA.asked||e.target.closest('button'))return;PARA.asked=1;
  try{const D=window.DeviceOrientationEvent;
   if(D&&typeof D.requestPermission==='function')D.requestPermission().then(r=>{if(r==='granted'){PARA.asked=2;listen()}else PARA.asked=3}).catch(()=>{PARA.asked=3});
   else if(D){PARA.asked=2;listen()}else PARA.asked=3}catch(_){PARA.asked=3}}}
// ---------- scratch cards ----------
const REC=/[?&]record/.test(location.search),hnd=$('#hnd');
function scratchInit(cv,type,onDone,hint){
 const r=cv.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2),w=r.width,h=r.height;cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);
 cv.style.transition='none';cv.style.opacity=1;cv.style.pointerEvents='auto';if(hint)hint.style.display='';
 const g=cv.getContext('2d',{willReadFrequently:true});g.setTransform(dpr,0,0,dpr,0,0);g.globalCompositeOperation='source-over';g.clearRect(0,0,w,h);
 if(type==='foil'){const gr=g.createLinearGradient(0,0,w,h);[[0,'#a78bfa'],[.3,'#f5d0fe'],[.5,'#fed7aa'],[.7,'#d8b4fe'],[1,'#7c6cf0']].forEach(([o,c])=>gr.addColorStop(o,c));g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.strokeStyle='rgba(255,255,255,.2)';g.lineWidth=6;for(let x=-h;x<w;x+=26){g.beginPath();g.moveTo(x,h);g.lineTo(x+h,0);g.stroke()}
  for(let i=0;i<w*h/70;i++){g.fillStyle=`rgba(255,255,255,${Math.random()*.8})`;g.fillRect(Math.random()*w,Math.random()*h,1.6,1.6)}
  g.font='600 15px Fredoka,system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='rgba(70,35,130,.6)';g.fillText('✦  scratch here  ✦',w/2,h/2)}
 else{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'rgba(228,238,255,.98)');gr.addColorStop(1,'rgba(196,212,250,.98)');g.fillStyle=gr;g.fillRect(0,0,w,h);
  for(let i=0;i<w*h/35;i++){g.fillStyle=`rgba(255,255,255,${Math.random()*.6})`;g.beginPath();g.arc(Math.random()*w,Math.random()*h,Math.random()*1.8,0,6.3);g.fill()}
  g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=1;for(let i=0;i<34;i++){const x=Math.random()*w,y=Math.random()*h,s=6+Math.random()*12;for(let k=0;k<3;k++){const a=k*Math.PI/3;g.beginPath();g.moveTo(x-Math.cos(a)*s,y-Math.sin(a)*s);g.lineTo(x+Math.cos(a)*s,y+Math.sin(a)*s);g.stroke()}}
  g.font='600 22px Fredoka,system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='rgba(80,100,170,.65)';g.fillText('wipe the mist ❄',w/2,h/2)}
 let down=false,lx,ly,fin=false,tick=0,sfx=0,prog=0;const th=type==='foil'?.5:.55,BR=type==='foil'?20:34;
 const P=e=>{const b=cv.getBoundingClientRect();return[e.clientX-b.left,e.clientY-b.top]};
 const dot=(x,y)=>{g.globalCompositeOperation='destination-out';if(type==='foil'){g.beginPath();g.arc(x,y,BR,0,6.3);g.fill()}else{const q=g.createRadialGradient(x,y,0,x,y,BR);q.addColorStop(0,'rgba(0,0,0,1)');q.addColorStop(.6,'rgba(0,0,0,.8)');q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.beginPath();g.arc(x,y,BR,0,6.3);g.fill()}};
 const stroke=(x,y)=>{const d=Math.hypot(x-lx,y-ly),n=Math.max(1,Math.ceil(d/6));for(let i=1;i<=n;i++)dot(lx+(x-lx)*i/n,ly+(y-ly)*i/n);lx=x;ly=y};
 const check=()=>{const d=g.getImageData(0,0,cv.width,cv.height).data;let c=0,t=0;const st=Math.max(1,Math.round(8*dpr));for(let y=0;y<cv.height;y+=st)for(let x=0;x<cv.width;x+=st){t++;if(d[(y*cv.width+x)*4+3]<40)c++}return c/t};
 const done=()=>{if(fin)return;fin=true;down=false;hnd.style.display='none';cv.style.transition='opacity .7s';cv.style.opacity=0;cv.style.pointerEvents='none';type==='foil'?SFX.foilDone():SFX.frostDone();onDone&&onDone()};
 const mv=e=>{hnd.style.left=e.clientX-16+'px';hnd.style.top=e.clientY-8+'px'};
 cv.onpointerdown=e=>{if(fin)return;e.preventDefault();startMusic();down=true;cv.setPointerCapture(e.pointerId);[lx,ly]=P(e);dot(lx,ly);type==='foil'?SFX.scrF(.6,prog):SFX.scrM(.6);if(hint)hint.style.display='none';hnd.style.display='block';mv(e)};
 cv.onpointermove=e=>{if(!down||fin)return;const[x,y]=P(e),dd=Math.hypot(x-lx,y-ly);stroke(x,y);mv(e);const now=performance.now();if(now-sfx>(type==='foil'?55:75)&&dd>2){sfx=now;const sp=Math.min(1,dd/30);type==='foil'?SFX.scrF(sp,prog):SFX.scrM(sp)}if(now-tick>180){tick=now;prog=Math.min(1,check()/th);if(prog>=1)done()}};
 cv.onpointerup=cv.onpointercancel=()=>{down=false;hnd.style.display='none';if(!fin&&check()>th)done()}}
// ---------- 0 override: foil scratch on "Unwrap it" ----------
init[0]=()=>{$('#n0').textContent=C.name;$('#f0').textContent=`${C.from} made this — just for you.`;const b=$('#unwrap');b.style.pointerEvents='none';
 b.onclick=()=>{b.onclick=null;startMusic();SFX.chime();const r=b.getBoundingClientRect();burst(r.left+r.width/2,r.top,70);go(1)};
 later(()=>scratchInit($('#sc1'),'foil',()=>{b.style.pointerEvents='auto';const r=b.getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height/2,50)},$('#hand1')),50)};
// ---------- 13: voice message (frost-wipe scratch) ----------
init[13]=()=>{document.body.classList.toggle('rec',REC);const vo=$('#vo'),g=$('#g13'),wave=$('#wave'),msg=$('#vmsg');g.classList.remove('show');g.onclick=()=>go(4);$('#vtxt').textContent=`${C.from} recorded this for you`;msg.textContent='';vo.textContent='▶ Tap to listen';wave.classList.remove('on');
 if(REC){recorderInit();g.classList.add('show');return}
 vo.onclick=()=>{msg.textContent='';if(!voice.paused){voice.pause();return}if(voice.ended)voice.currentTime=0;const p=voice.play();if(p&&p.catch)p.catch(()=>{msg.textContent=voice.error?'Voice message is not added yet':'Tap once more to play'})};
 voice.onplay=()=>{MIXS.voice=1;applyMix(.18);wave.classList.add('on');vo.textContent='❚❚ Pause'};
 voice.onpause=voice.onended=()=>{MIXS.voice=0;applyMix(.6);wave.classList.remove('on');vo.textContent=voice.ended?'↺ Listen again':'▶ Tap to listen'};
 later(()=>scratchInit($('#sc2'),'frost',()=>g.classList.add('show'),$('#hand2')),50)};
function recorderInit(){const b=$('#recbtn'),pl=$('#recplay'),dl=$('#recdl'),note=$('#recnote');let mr,ch=[],st;
 b.onclick=async()=>{if(mr&&mr.state==='recording'){mr.stop();return}
  try{st=await navigator.mediaDevices.getUserMedia({audio:true})}catch(e){note.textContent='Mic permission dao (https ba localhost-e kaj kore).';return}
  bgm.pause();hold=1;ch=[];const mt=['audio/webm;codecs=opus','audio/mp4','audio/webm','audio/ogg'].find(t=>window.MediaRecorder&&MediaRecorder.isTypeSupported(t))||'';mr=new MediaRecorder(st,mt?{mimeType:mt}:{});
  mr.ondataavailable=e=>e.data.size&&ch.push(e.data);
  mr.onstop=()=>{st.getTracks().forEach(t=>t.stop());hold=0;const type=mr.mimeType||'audio/webm',ext=/mp4/.test(type)?'m4a':/ogg/.test(type)?'ogg':'webm',url=URL.createObjectURL(new Blob(ch,{type}));pl.src=url;pl.classList.remove('hid');dl.href=url;dl.download='voice.'+ext;dl.classList.remove('hid');dl.textContent='⬇ Save voice.'+ext;note.textContent=`Save kore "voice.${ext}" file ta assets folder-e rakho. Tarpor birthday site normal link-e kholo.`;b.textContent='● Record again'};
  mr.start();b.textContent='■ Stop recording'}}
go(REC?13:0);


// ---------- one continuous scroll page: wish -> tree -> voice ----------
let chIO=null;
function chapter(){const root=document.documentElement,dots=[...$('#chd').children],hint=$('#chh'),S=[$('#s2'),$('#s13')],seen={};root.classList.add('ds');scrollTo(0,0);if(chIO)chIO.disconnect();
 $('#chd').classList.add('show');hint.classList.remove('show');later(()=>hint.classList.add('show'),3400);
 const fire=i=>{if(seen[i])return;seen[i]=1;if(i===1)init[13]()};
 chIO=new IntersectionObserver(es=>es.forEach(e=>{const i=S.indexOf(e.target);if(e.isIntersecting&&e.intersectionRatio>=.4){fire(i);S[i].classList.add('in')}}),{threshold:[.4,.7]});S.slice(1).forEach(s=>chIO.observe(s));
 const upd=()=>{if(cur!==2)return;const H=innerHeight,k=Math.round(scrollY/H);dots.forEach((d,j)=>d.classList.toggle('on',j===Math.min(k,1)));hint.classList.toggle('gone',scrollY>60)};
 onscroll=upd;upd();
 $('#chh').onclick=()=>{const k=Math.round(scrollY/innerHeight);S[Math.min(k+1,1)].scrollIntoView({behavior:'smooth'})};
}

// block double-tap zoom and pinch zoom (iOS Safari ignores user-scalable on its own)
['gesturestart','gesturechange','gestureend'].forEach(t=>addEventListener(t,e=>e.preventDefault(),{passive:false}));
(()=>{let lt=0;addEventListener('touchend',e=>{const n=Date.now(),t=e.target;if(n-lt<350&&!(t.closest&&t.closest('button,a,input,[onclick]')))e.preventDefault();lt=n},{passive:false})})();
