const C=CONFIG,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
// older iPhones (no dvh): keep --vh equal to the visible height
if(!(window.CSS&&CSS.supports&&CSS.supports('height','1dvh'))){const sv=()=>document.documentElement.style.setProperty('--vh',innerHeight*.01+'px');sv();addEventListener('resize',sv);addEventListener('orientationchange',()=>setTimeout(sv,300))}
// status-bar / address-bar tint follows each page's background (no stray bar colour)
const THEME={"0":["#fbe0f2","#d9dfff"],"1":["#ffe5f6","#f4e6fe"],"2":["#ffcee8","#c5c1fd"],"3":["#fff4f1","#ffeaf3"],"4":["#5d2567","#6d2c58"],"5":["#5d2567","#6e2d57"],"6":["#e56f9e","#4f52d2"],"7":["#642764","#311953"],"8":["#2b3091","#392383"],"9":["#3c3192","#402587"],"10":["#743882","#662f6a"],"11":["#4e2268","#401756"],"12":["#0f0a2e","#762676"],"13":["#845fcf","#ac499a"],"14":["#de7a98","#8b3f7c"]},TM=document.querySelector('meta[name=theme-color]');
function setTheme(n){const t=THEME[n]||['#1a0f3a','#1a0f3a'];if(TM)TM.setAttribute('content',t[0]);const g=`linear-gradient(${t[0]},${t[1]})`;
 [document.documentElement,document.body].forEach(el=>{el.style.backgroundImage=g;el.style.backgroundColor=t[0]})}
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
 slide(){noise(1,.34,{bp:2300,bp2:4300,q:.45,a:.28,hp:900,rv:.1});noise(.5,.2,{bp:3600,q:.6,a:.1,dl:.45})},
 unfold(){[0,45,100,160,230,320,420].forEach((ms,i)=>noise(.035+Math.random()*.03,.3-i*.02,{bp:2600+Math.random()*3000,q:.7,a:.002,dl:ms/1000}));noise(.4,.28,{bp:700,bp2:2200,q:.4,a:.08,rv:.1})},
 paper(){noise(.4,.34,{bp:2600,bp2:1200,q:.4,a:.05});noise(.28,.24,{hp:5000,dl:.12})},
 frostDone(){noise(.55,.2,{bp:2600,bp2:900,q:.4,hp:600,a:.12,rv:.3});noise(.4,.1,{hp:6000,a:.1,dl:.05});[1318,1976,2637,3322].forEach((f,i)=>tone(f,1.4,'sine',.07/(1+i*.3),0,.12+i*.09,.7));[0,.17,.31].forEach(d=>noise(.012,.18,{bp:5200,q:2,a:.001,dl:.25+d}))}
};
// priority: scratch (loudest effect) > typing > arrow/heart > ui clicks ; each effect also dips the music briefly so it always cuts through
const CAT={ret:1.1,scrF:6.5,scrM:6.5,foilDone:.9,frostDone:.9,key:1.5,keyS:1.4,enter:1.4,back:1.3,scribble:1.6,sign:1,shoot:1.1,stretch:9,pop:1.1,pop2:1.1,good:1.05,burst:.8,btn:.95,seal:.9,photo:1.4,chime:1.2,open:1.4,whoosh:1.4,paper:1.3,sign:1.4,flap:1.5,slide:1.5,unfold:1.5};
const DIP={ret:[.55,500],scrF:[.5,380],scrM:[.5,380],foilDone:[.45,1400],frostDone:[.5,1200],key:[.55,420],keyS:[.55,420],enter:[.55,500],back:[.6,300],scribble:[.6,900],sign:[.55,800],shoot:[.5,600],stretch:[.6,300],pop:[.5,600],pop2:[.55,500],good:[.5,900],burst:[.45,1200],tap:[.6,450],btn:[.55,550],photo:[.6,500],cake:[.7,300],open:[.55,900],chime:[.6,700],seal:[.5,600],whoosh:[.55,800],paper:[.6,500],flap:[.6,700],slide:[.6,1100],unfold:[.6,900]};
Object.keys(SFX).forEach(k=>{const f=SFX[k],g=CAT[k]||1,d=DIP[k];SFX[k]=(...a)=>{const o=LVL;LVL=g;try{if(d)dip(d[0],d[1]);return f(...a)}finally{LVL=o}}});
const bgm=new Audio(C.music);bgm.loop=true;bgm.preload='auto';let musOn=true,started=false,bgmOk=true,hold=0;
bgm.onerror=()=>bgmOk=false;
if(WA){try{AC.createMediaElementSource(bgm).connect(MG);MG.gain.value=0;MUSIC_WA=true}catch(e){MUSIC_WA=false}}
if(!MUSIC_WA)bgm.volume=Math.min(1,MIXS.base*2.4);
function startMusic(){if(started)return;started=true;AC.resume();if(musOn){bgm.play().catch(()=>{});applyMix(.9)}}
const wake=()=>{if(AC.state!=='running')AC.resume().catch(()=>{})};
document.addEventListener('visibilitychange',()=>{if(!document.hidden){wake();if(started&&musOn&&!hold&&bgm.paused)bgm.play().catch(()=>{})}});
addEventListener('pointerdown',startMusic,{once:true});
// every tap/click gets its own sound (bow, balloons and scratch cards have their own)
addEventListener('pointerdown',e=>{const t=e.target;if(!t||!t.closest)return;const kind=t.closest('#arena,.bal,canvas')?0:t.closest('.pol,.fr')?'photo':t.closest('#mus')?'tap':t.closest('.btn,button')?'btn':'tap';if(!kind)return;const go_=()=>SFX[kind]();if(AC.state!=='running'){AC.resume().then(go_).catch(()=>{})}else go_()},true);
function bgmResume(){if(musOn&&started&&!hold&&bgm.paused)bgm.play().catch(()=>{});applyMix(.5)}
const VS=[].concat(C.voice||[]);let vi=0,voiceOk=false;const voice=new Audio();voice.preload='auto';
let VOICE_WA=false;if(WA){try{AC.createMediaElementSource(voice).connect(VG);VOICE_WA=true}catch(e){VOICE_WA=false}}
function vtry(){if(vi<VS.length)voice.src=VS[vi++]}voice.onerror=()=>{voiceOk=false;vtry()};voice.oncanplay=()=>voiceOk=true;vtry();
$('#mus').onclick=e=>{e.stopPropagation();musOn=!musOn;$('#mus').textContent=musOn?'♪ On':'♪ Off';if(musOn){if(started&&!hold)bgm.play().catch(()=>{});applyMix(.4)}else{applyMix(.12);setTimeout(()=>{if(!musOn)bgm.pause()},600)}};
// ---------- particles ----------
const cv=$('#fx'),cx=cv.getContext('2d');let P=[],W,H;
function rs(){W=innerWidth;H=innerHeight;const d=Math.min(devicePixelRatio||1,2);cv.width=Math.round(W*d);cv.height=Math.round(H*d);cx.setTransform(d,0,0,d,0,0)}rs();addEventListener('resize',rs);addEventListener('orientationchange',()=>setTimeout(rs,300));if(window.visualViewport)visualViewport.addEventListener('resize',rs);
const COL=['#f472b6','#fbbf24','#fff','#818cf8','#22d3ee','#fb923c'];
function burst(x,y,n=60,hearts=false){if(RM)n=15;for(let i=0;i<n;i++){const a=Math.random()*6.28,s=2+Math.random()*7;P.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,g:.12,l:1,d:.014+Math.random()*.01,r:3+Math.random()*5,c:COL[i%6],h:hearts&&i%2==0})}}
function rain(n,hearts){for(let i=0;i<n;i++)P.push({x:Math.random()*W,y:-10,vx:Math.random()*2-1,vy:1+Math.random()*2.5,g:0,l:1,d:.003,r:4+Math.random()*4,c:COL[i%6],h:hearts,rect:!hearts})}
let rainOn=null;
function heartPath(x,y,r){cx.beginPath();cx.moveTo(x,y+r*.4);cx.bezierCurveTo(x-r,y-r*.4,x-r*.5,y-r*1.1,x,y-r*.4);cx.bezierCurveTo(x+r*.5,y-r*1.1,x+r,y-r*.4,x,y+r*.4);cx.fill()}
(function loop(){cx.clearRect(0,0,W,H);P=P.filter(p=>p.l>0&&p.y<H+20);for(const p of P){p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.l-=p.d;cx.globalAlpha=Math.max(0,Math.min(1,p.l));cx.fillStyle=p.c;cx.shadowColor=p.c;cx.shadowBlur=8;if(p.h)heartPath(p.x,p.y,p.r*1.6);else if(p.rect)cx.fillRect(p.x,p.y,p.r,p.r*1.6);else{cx.beginPath();cx.arc(p.x,p.y,p.r,0,6.28);cx.fill()}}requestAnimationFrame(loop)})();
function startRain(hearts,rate=400){stopRain();rainOn=setInterval(()=>rain(1,hearts&&Math.random()<.7),RM?900:rate*.4)}
function stopRain(){clearInterval(rainOn);rainOn=null}
function fireworks(){const i=setInterval(()=>{if(!rainOn&&cur!==12&&cur!==5)return clearInterval(i);burst(W*(.15+Math.random()*.7),H*(.1+Math.random()*.4),40);SFX.chime()},1500);timers.push(i)}
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
 12:{e:['🎈','🌷','🌸','🦋','✨','💖','🎀','⭐','🫧'],m:['rise','bob'],n:18,o:['#6366f1','#ec4899','#22d3ee']},
 13:{e:['🎵','🎶','💗','✨','🫧','🎀'],m:['rise'],o:['#ff9ed1','#a78bfa','#7dd3fc']},
 14:{e:['🦋','🌸','💗','✨','🎀','🌷'],m:['bob','fall'],o:['#ffb4a8','#f9a8d4','#c4b5fd']}
};FLT[5]=FLT[4];FLT[9]=FLT[8];
(function(){const R=(a,b)=>a+Math.random()*(b-a);
 $$('.pg').forEach(pg=>{const t=FLT[+pg.id.slice(1)];if(!t)return;const L=document.createElement('div');L.className='fl';
  t.o.forEach((c,i)=>{const o=document.createElement('b');o.className='orb';o.style.cssText=`--c:${c};--t:${R(14,22).toFixed(1)}s;left:${[8,92,45][i]}%;top:${[8,45,100][i]}%;animation-delay:-${R(0,10).toFixed(1)}s`;L.append(o)});
  const n=RM?6:(t.n||14);
  for(let i=0;i<n;i++){const s=document.createElement('span'),m=t.m[i%t.m.length];s.className=m;s.textContent=t.e[i%t.e.length];
   const T=m==='bob'?R(5,9):R(11,20);
   s.style.cssText=`left:${R(2,94).toFixed(1)}%;${m==='bob'?`top:${R(4,92).toFixed(1)}%;`:''}--z:${R(17,36).toFixed(0)}px;--t:${T.toFixed(1)}s;--w:${R(2.5,5).toFixed(1)}s;--dl:-${R(0,T).toFixed(1)}s;--dx:${R(-40,40).toFixed(0)}px;--op:${R(.6,.92).toFixed(2)}`;L.append(s)}
  pg.prepend(L)})})();
// ---------- navigation ----------
function go(n,seam){if(n>14)n=14;const old=seam?$$('.pg.on'):[];voice.pause();$('#vid').pause();hold=0;bgmResume();timers.forEach(t=>{clearTimeout(t);clearInterval(t)});timers=[];stopRain();$$('.pg').forEach(p=>{if(!old.includes(p))p.classList.remove('on')});if(seam)setTimeout(()=>old.forEach(p=>p.classList.remove('on')),900);cur=n;setTheme(n);$('#chd').classList.remove('show');$('#chh').classList.remove('show');
 later(()=>{$('#p'+n).classList.add('on');(init[n]||(()=>{}))();tagBn($('#p'+n))},seam||cur===0&&!started?0:350)}
$$('.go').forEach(b=>b.addEventListener('click',()=>go(+b.closest('.pg').id.slice(1)+1)));
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
  if(b.h.m){later(()=>arw.style.display='none',250);burst(x,y,130,true);SFX.burst();later(()=>go(2),1700);return}
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
init[2]=()=>{const e=$('#hb');e.innerHTML='';'Happy|Birthday'.split('|').forEach((w,i,a)=>{[...w].forEach((c,j)=>{const s=document.createElement('span');s.textContent=c;s.style.animationDelay=(i*.7+j*.08)+'s';e.append(s)});if(!i)e.append(document.createElement('br'))});SFX.chime();chapter()};
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
init[3]=()=>{$('#tree').innerHTML=treeSVG(RM?110:210);$('#t3n').innerHTML=`Happy<br>Birthday, ${C.name}`;$('#t3a').textContent=`and just like that, you're turning ${C.age} ✨`;startRain(true,300);later(SFX.chime,1200)};
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
<g class="fl"><path class="flame" d="M130 0c11 11 7 21 0 21s-11-10 0-21z" fill="#ffb347"/><path class="flame" d="M130 8c5 5 3 11 0 11s-5-6 0-11z" fill="#fff6c8"/></g>
${[[40,40,0],[220,30,.4],[24,110,.8],[238,96,.2],[60,8,1],[200,6,.6]].map(([x,y,d])=>`<path class="spk" style="animation-delay:${d}s" d="M${x} ${y-8}l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#fde68a"/>`).join('')}`:''}</svg>`;
let tapOk=false;
init[4]=()=>{$('#cake1').innerHTML=cakeSVG(0);[300,1100,1900,2700,3900].forEach(t=>later(SFX.cake,t));later(()=>go(5),5300)};
init[5]=()=>{$('#cake2').innerHTML=cakeSVG(1);$('#hb5').textContent=`Happy Birthday, ${C.name}!`;const f=['#hb5','#wish','#tap'].map(s=>$(s));f.forEach(x=>x.classList.remove('vis'));tapOk=false;
 later(()=>{SFX.chime();burst(W/2,H*.45,90)},700);later(()=>{startRain(false,300);fireworks()},1500);
 later(()=>f[0].classList.add('vis'),1200);later(()=>f[1].classList.add('vis'),2200);later(()=>{f[2].classList.add('vis');tapOk=true},3000);
 $('#p5').onclick=()=>{if(tapOk){tapOk=false;go(6)}}};
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
init[7]=()=>{const car=$('#car'),dots=$('#dots'),LT=$('#lights');car.innerHTML=dots.innerHTML=LT.innerHTML='';
 for(let i=0;i<16;i++){const b=document.createElement('i'),k=i/15;b.style.cssText=`--c:${['#fde68a','#fda4af','#a5f3fc','#d8b4fe'][i%4]};animation-delay:${(i%5)*.3}s;left:${k*100}%;top:${Math.sin(k*Math.PI)*21}px`;LT.append(b)}
 C.photos.forEach((p,i)=>{const d=document.createElement('div');d.className='pol';d.style.cssText=`--r:${(i%2?1:-1)*(1.5+Math.random()*2.5)}deg;--dl:${(.3+i*.2).toFixed(2)}s;--fd:${(4+Math.random()*2.5).toFixed(1)}s`;
  const im=new Image();im.decoding='async';im.className='im';im.src=p.src;im.alt=p.caption||'';im.onerror=()=>{im.removeAttribute('src');im.style.visibility='hidden'};
  d.append(im);d.insertAdjacentHTML('beforeend',`<p>${p.caption||''} 💛</p>`);d.onclick=()=>{if(!im.getAttribute('src'))return;$('#lb img').src=p.src;$('#lb p').textContent=p.caption||'';$('#lb').classList.add('on')};car.append(d);dots.insertAdjacentHTML('beforeend','<i></i>')});
 const dd=$$('#dots i'),n=dd.length,fx=()=>{const c=car.scrollLeft+car.clientWidth/2,ps=[...car.children];let best=null,bd=9;const v=ps.map(p=>{const w=p.offsetWidth,d=Math.min(1,Math.abs(p.offsetLeft+w/2-c)/w);if(d<bd){bd=d;best=p}return d});ps.forEach((p,i)=>{const d=v[i];p.style.setProperty('--s',(1.09-.26*d).toFixed(3));p.style.setProperty('--k',(.2+.8*d).toFixed(3));p.style.setProperty('--o',(1-.55*d).toFixed(3));p.classList.toggle('act',p===best)})},
 idx=()=>Math.round(car.scrollLeft/((car.scrollWidth-car.clientWidth)||1)*(n-1));let last=-1;const mark=()=>{const k=idx();if(k!==last){if(last>=0){const r=car.getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height*.45,12,true);SFX.cake()}last=k}dd.forEach((x,i)=>x.classList.toggle('a',i===k));fx()};
 let raf=0;car.onscroll=()=>{if(!raf)raf=requestAnimationFrame(()=>{raf=0;mark()})};mark();
 let auto=true;['pointerdown','touchstart','wheel'].forEach(ev=>car.addEventListener(ev,()=>auto=false,{passive:true}));
 const iv=setInterval(()=>{if(!auto)return clearInterval(iv);const k=idx()+1;if(k>=n)return clearInterval(iv);car.scrollTo({left:k*((car.scrollWidth-car.clientWidth)/(n-1)),behavior:'smooth'})},3200);timers.push(iv)};
$('#lb').onclick=()=>$('#lb').classList.remove('on');
// ---------- bangla auto-tag ----------
const BN=/[\u0980-\u09FF]/;
function tagBn(r){(r||document).querySelectorAll('h1,h2,h3,p,small,div,span,button').forEach(e=>{if(!e.parentElement.closest('.bn')&&[...e.childNodes].some(n=>n.nodeType==3&&BN.test(n.textContent)))e.classList.add('bn')})}
// ---------- 14: gallery 2 ----------
$('#g7').onclick=()=>go(14);$('#g14').onclick=()=>go(8);
init[14]=()=>{$('#t14').textContent=C.gallery2Title||'';$('#s14').textContent=C.gallery2Sub||'';const g=$('#g2'),b=$('#g14');g.innerHTML='';b.classList.remove('show');
 (C.photos2||[]).slice(0,5).forEach((p,i)=>{const d=document.createElement('div');d.className='fr f'+(i+1);const im=new Image();im.decoding='async';im.src=p.src;im.alt=p.caption||'';im.onerror=()=>{im.removeAttribute('src');im.style.visibility='hidden'};d.append(im);d.insertAdjacentHTML('beforeend',`<span>${p.caption||''}</span>`);
  d.onclick=()=>{if(!im.getAttribute('src'))return;$('#lb img').src=p.src;$('#lb p').textContent=p.caption||'';$('#lb').classList.add('on')};g.append(d)});
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
  if(RM){go(10);return}
  geo();pg.classList.add('opening');void e.offsetWidth;e.classList.add('run');
  const sr=$('#seal').getBoundingClientRect();SFX.seal();burst(sr.left+sr.width/2,sr.top+sr.height/2,28);
  later(()=>SFX.flap(),380);later(()=>SFX.slide(),1450);
  later(()=>{const r=$('#sheet').getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height/2,22,true)},2450);
  later(()=>SFX.whoosh(),2550);later(()=>SFX.unfold(),3500);later(()=>SFX.unfold(),4100);
  later(()=>{burst(W/2,H/2,46,true);SFX.chime()},4900);later(()=>go(10,true),5500)}};
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
 v.onerror=()=>{pl.style.display='';pl.textContent='Video not found — continue ›';pl.onclick=()=>go(12)};
 v.onplay=()=>{MIXS.video=1;applyMix(.25)};
 v.onpause=()=>{MIXS.video=0;applyMix(.7)};
 v.onended=()=>{MIXS.video=0;applyMix(.7);fin()};
 pl.onclick=()=>{pl.style.display='none';v.muted=false;v.volume=1;v.play().catch(()=>{})};
 sk.onclick=()=>{v.pause();go(12)};
 const unmute=()=>{um.classList.remove('hid');um.classList.add('show');um.onclick=()=>{v.muted=false;v.volume=1;um.classList.remove('show');um.classList.add('hid')}};
 // 1) try with sound  2) browser said no -> autoplay muted + "tap for sound" chip  3) last resort -> big play button
 vprime.then(()=>{try{v.currentTime=0}catch(e){}v.muted=false;v.volume=1;return v.play()})
  .then(()=>{if(v.paused)throw 0})
  .catch(()=>{v.muted=true;return v.play().then(unmute)})
  .catch(()=>{v.muted=false;pl.style.display=''});
 startRain(false,600)};
// ---------- 12: final ----------
init[12]=()=>{$('#n12').textContent=C.name+'!';startRain(false,120);fireworks();rain(30,true);SFX.chime();$('#replay').onclick=()=>{bgm.currentTime=0;go(1)}};
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
function chapter(){const sc=$('#p2'),dots=[...$('#chd').children],hint=$('#chh'),S=[$('#s2'),$('#s3'),$('#s13')],seen={};sc.scrollTop=0;if(chIO)chIO.disconnect();
 $('#chd').classList.add('show');hint.classList.remove('show');later(()=>hint.classList.add('show'),3400);
 const fire=i=>{if(seen[i])return;seen[i]=1;if(i===1)init[3]();if(i===2)init[13]()};
 chIO=new IntersectionObserver(es=>es.forEach(e=>{const i=S.indexOf(e.target);if(e.isIntersecting&&e.intersectionRatio>=.4){fire(i);S[i].classList.add('in')}}),{root:sc,threshold:[.4,.7]});S.slice(1).forEach(s=>chIO.observe(s));
 const upd=()=>{const k=Math.round(sc.scrollTop/sc.clientHeight);dots.forEach((d,j)=>d.classList.toggle('on',j===Math.min(k,2)));$('#chd').classList.toggle('lt',k===1);hint.classList.toggle('lt',k===1);hint.classList.toggle('gone',sc.scrollTop>sc.clientHeight*1.6)};
 sc.onscroll=upd;upd();
 $('#chh').onclick=()=>{const k=Math.round(sc.scrollTop/sc.clientHeight);S[Math.min(k+1,2)].scrollIntoView({behavior:'smooth'})};
 $('#g3').onclick=()=>S[2].scrollIntoView({behavior:'smooth'})}
