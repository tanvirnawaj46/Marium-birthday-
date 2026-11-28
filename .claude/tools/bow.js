// Job 12: p1 "Cupid's Bow" game test.  usage: node .claude/tools/bow.js W H [outdir]   (server: cd repo && python3 -m http.server 8766)
// Real mouse events on #arena + the ?dbg hook window.__bow (plan(dx,dy) = what a drag would do). Prints OK/FAIL lines, exit code 1 on any FAIL.
// Covers: layout (arena = page, hearts + bow inside the viewport, 26px top/bottom clear), empty taps silent, aim sweep (raw / assisted windows),
// miss -> re-nock, decoy pop + respawn, main hit (slow-mo, arrow sticks, thunk, goes to p3), reduced motion, frame times under 4x CPU throttle.
// Shots (device scale 2): OUT/bow_W_<name>.png  -> READ them.
const {chromium}=require('playwright');
const W=+process.argv[2]||393,H=+process.argv[3]||852,OUT=process.argv[4]||'/tmp/shots';
let bad=0;const ck=(ok,msg,x='')=>{console.log((ok?'OK   ':'FAIL ')+msg+(x?'  '+x:''));if(!ok)bad++};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
const br=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
const er=[];
const fresh=async(opts={})=>{const c=await br.newContext({viewport:{width:W,height:H},deviceScaleFactor:2,hasTouch:true,isMobile:true,...opts});const p=await c.newPage();
 p.on('pageerror',e=>er.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|googleapis|fonts/.test(m.text()))er.push('console:'+m.text())});
 await p.goto('http://localhost:8766/index.html?dbg');await sleep(700);
 await p.evaluate(()=>{started=true;window.__s=[];Object.keys(SFX).forEach(k=>{const f=SFX[k];SFX[k]=(...a)=>{__s.push(k);return f(...a)}});go(1)});
 await sleep(3300);return{c,p}};
const sx=W/2,sy=H*.84;
const drag=async(p,dx,dy,steps=14)=>{await p.mouse.move(sx,sy);await p.mouse.down();for(let i=1;i<=steps;i++)await p.mouse.move(sx+dx*i/steps,sy+Math.max(0,dy)*i/steps)};
const vec=(a,pw)=>{const d=pw*150,r=a*Math.PI/180;return[-Math.sin(r)*d,Math.cos(r)*d]};
const sfx=p=>p.evaluate(()=>__s.slice());
const shot=(p,n)=>p.screenshot({path:`${OUT}/bow_${W}_${n}.png`});
const waitState=(p,s,t=4000)=>p.waitForFunction(s=>__bow.state()===s,s,{timeout:t}).then(()=>1,()=>0);

// ================= 1. layout + empty taps + aim sweep =================
let {c,p}=await fresh();
const L=await p.evaluate(()=>{const R=e=>{const b=e.getBoundingClientRect();return[b.left,b.top,b.right,b.bottom]};return{arena:R(document.querySelector('#arena')),page:R(document.querySelector('#p1')),hearts:[...document.querySelectorAll('.hrt')].map(e=>({r:R(e),m:e.classList.contains('main')})),bow:R(document.querySelector('#bwL')),sig:R(document.querySelector('#bsig')),pm:R(document.querySelector('#pm')),W:innerWidth,H:innerHeight}});
ck(L.arena[0]===0&&L.arena[1]===0&&Math.abs(L.arena[2]-W)<1&&Math.abs(L.arena[3]-H)<1,'arena = whole page',JSON.stringify(L.arena.map(Math.round)));
ck(L.hearts.length===3&&L.hearts.filter(h=>h.m).length===1,'3 hearts, exactly 1 main');
ck(L.hearts.every(h=>h.r[0]>=0&&h.r[2]<=W&&h.r[1]>=30&&h.r[3]<=H-30),'hearts inside the viewport, 30px clear of the top/bottom bars',JSON.stringify(L.hearts.map(h=>h.r.map(Math.round))));
ck(L.bow[0]>=0&&L.bow[2]<=W&&L.bow[1]>=60&&L.bow[3]<=H-30,'bow inside the viewport',JSON.stringify(L.bow.map(Math.round)));
ck(L.sig[3]<=H-26,'magic circle clear of the bottom 26px',Math.round(L.sig[3])+' <= '+(H-26));
// empty taps: nothing happens, no sound
const s0=(await sfx(p)).length;
for(const [x,y] of [[40,300],[W-40,H*.62],[W/2,H*.5],[30,H-80]]){await p.mouse.click(x,y);await sleep(120)}
const s1=await sfx(p);
ck(s1.length===s0,'empty taps are silent',s1.slice(s0).join(','));
ck(await p.evaluate(()=>__bow.state())===0,'empty taps leave the bow idle');
// aim sweep
const sw=await p.evaluate(()=>{const o=[];for(const pw of [.4,.6,.8,1])for(let a=-45;a<=45;a++){const d=pw*150,r=a*Math.PI/180,q=__bow.plan(-Math.sin(r)*d,Math.cos(r)*d);o.push({a,pw,raw:q.raw,hit:q.hit,as:q.as})}return o});
const win=(pw,f)=>{const a=sw.filter(r=>r.pw===pw&&f(r)).map(r=>r.a);return a.length?`${a[0]}..${a[a.length-1]} (${a.length}°)`:'none'};
for(const pw of [.4,.6,.8,1])console.log(`     p=${pw}: raw main ${win(pw,r=>r.raw==='main')} | with assist ${win(pw,r=>r.hit==='main')} | decoys ${win(pw,r=>r.hit==='decoy')}`);
const raws=sw.filter(r=>r.pw===.8&&r.raw==='main'),assisted=sw.filter(r=>r.pw===.8&&r.hit==='main'&&r.raw!=='main');
ck(raws.length>=3,'there is a raw hit window for the big heart (>= 3 degrees)',raws.length+'°');
ck(assisted.length>=4,'aim assist widens it (>= 4 extra degrees)',assisted.length+'°');
const missU=sw.find(r=>r.pw===.8&&r.a<-9&&r.a>-16&&r.hit==='miss'),decL=sw.filter(r=>r.pw===.8&&r.a<0&&r.hit==='decoy'),aEdge=assisted.sort((x,y)=>Math.abs(y.a)-Math.abs(x.a))[0],aMid=raws.sort((x,y)=>Math.abs(x.a)-Math.abs(y.a))[0];
console.log('     vectors: miss',missU&&missU.a,' decoyL',decL.length&&decL[(decL.length/2)|0].a,' assist-edge',aEdge&&aEdge.a,' raw',aMid&&aMid.a);
await c.close();

// ================= 2. miss -> re-nock =================
({c,p}=await fresh());
let m=vec(missU?missU.a:-12,.8);
await drag(p,...m);await sleep(60);await shot(p,'draw');await p.mouse.up();
await sleep(150);await shot(p,'miss_flight');
ck(await waitState(p,0,3500),'miss: arrow flies out, bow re-nocks (state 0)');
let ss=await sfx(p);
ck(ss.includes('shoot')&&ss.filter(k=>k==='bwTick').length>=3,'miss: shoot + power ticks played',ss.join(','));
ck(await p.evaluate(()=>__bow.miss())===1,'miss counter = 1');
await sleep(400);await shot(p,'miss_renock');
ck(await p.evaluate(()=>{const a=document.querySelector('#arw');return a.style.display!=='none'&&+a.style.opacity>.9}),'arrow is back on the string');
// a tiny pull (< MINP) springs back, no shot
const nS=(await sfx(p)).filter(k=>k==='shoot').length;
await drag(p,10,30);await p.mouse.up();await sleep(600);
ck((await sfx(p)).filter(k=>k==='shoot').length===nS&&await p.evaluate(()=>__bow.state())===0,'short pull: string springs back, no shot');
await c.close();

// ================= 3. decoy pop + respawn =================
({c,p}=await fresh());
m=vec(decL.length?decL[(decL.length/2)|0].a:-22,.8);
await drag(p,...m);await p.mouse.up();
await p.waitForFunction(()=>document.querySelectorAll('.hrt.gone').length===1,null,{timeout:3000}).then(()=>ck(true,'decoy: pops (.gone)'),()=>ck(false,'decoy: pops (.gone)'));
await sleep(250);await shot(p,'decoy_pop');
ck(await waitState(p,0,3000),'decoy: bow re-nocks');
await p.waitForFunction(()=>!document.querySelector('.hrt.gone'),null,{timeout:4500}).then(()=>ck(true,'decoy: respawns after ~3s'),()=>ck(false,'decoy: respawns after ~3s'));
await c.close();

// ================= 4. main hit via the aim-assist edge: slow-mo, arrow sticks, thunk, goes to p3 =================
({c,p}=await fresh());
m=vec(aEdge?aEdge.a:7,.8);
await drag(p,...m);await sleep(80);await shot(p,'main_draw');await p.mouse.up();
await sleep(110);await shot(p,'main_flight');
const slow=await p.waitForFunction(()=>document.querySelector('#p1').classList.contains('slow'),null,{timeout:3000}).then(()=>1,()=>0);
ck(slow,'main hit: slow-mo + camera push + vignette start');
if(slow){await sleep(120);await shot(p,'main_slowmo')}
ck(await waitState(p,4,4000),'main hit: arrow sticks (state 4)');
await sleep(60);await shot(p,'main_impact');
ck(await p.evaluate(()=>!!document.querySelector('.hrt.main svg.stk g')),'stuck arrow lives inside the heart');
await sleep(450);await shot(p,'main_after');
ss=await sfx(p);
ck(ss.includes('thunk')&&ss.includes('burst'),'thunk + burst played',ss.filter(k=>k!=='bwTick').join(','));
await p.waitForFunction(()=>cur===3,null,{timeout:4000}).then(()=>ck(true,'goes to the tree page (p3)'),()=>ck(false,'goes to the tree page (p3)'));
await c.close();

// ================= 5. raw centre hit (no assist needed) =================
({c,p}=await fresh());
m=vec(aMid?aMid.a:0,.8);
await drag(p,...m);await p.mouse.up();
await waitState(p,4,4000).then(ok=>ck(ok,'raw centre shot hits the big heart'));
await c.close();

// ================= 6. help after misses: assist radius grows (miss counter 3 / 5) =================
({c,p}=await fresh());
const wide=async n=>{await p.evaluate(n=>__bow.setMiss(n),n);return p.evaluate(()=>{const o=[];for(let a=-45;a<=45;a++){const d=.8*150,r=a*Math.PI/180,q=__bow.plan(-Math.sin(r)*d,Math.cos(r)*d);if(q.hit==='main')o.push(a)}return o.length})};
const w0=await wide(0),w3=await wide(3),w5=await wide(5);
ck(w3>=w0&&w5>=w3&&w5>w0,'hit window grows with misses',`0 misses ${w0}° | 3 misses ${w3}° | 5 misses ${w5}°`);
await c.close();

// ================= 7. reduced motion: no slow-mo / push, still works =================
({c,p}=await fresh({reducedMotion:'reduce'}));
m=vec(aEdge?aEdge.a:7,.8);
await drag(p,...m);await p.mouse.up();
let sawSlow=false;const t0=Date.now();while(Date.now()-t0<2500){if(await p.evaluate(()=>document.querySelector('#p1')&&document.querySelector('#p1').classList.contains('slow')))sawSlow=true;await sleep(60)}
ck(!sawSlow,'reduced motion: no slow-mo / camera push');
ck((await sfx(p)).includes('thunk'),'reduced motion: arrow still hits');
await c.close();

// ================= 8. frame times under 4x CPU throttle (drag + flight) =================
({c,p}=await fresh());
const cdp=await c.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
await p.evaluate(()=>{window.__f=[];window.__fon=1;let l=performance.now();const t=n=>{if(!window.__fon)return;__f.push(n-l);l=n;requestAnimationFrame(t)};requestAnimationFrame(t)});
m=vec(missU?missU.a:-12,.8);
await drag(p,...m,30);await sleep(300);await p.mouse.up();
await waitState(p,0,5000);
const fr=await p.evaluate(()=>{window.__fon=0;return __f.slice(2)});
fr.sort((a,b)=>a-b);const avg=fr.reduce((a,b)=>a+b,0)/fr.length,p95=fr[Math.floor(fr.length*.95)],mx=fr[fr.length-1];
ck(mx<260&&p95<80,'4x CPU throttle: no gross hitches while drawing + flying (software-rendered canvas = pessimistic)',`frames ${fr.length}, avg ${avg.toFixed(1)}ms, p95 ${p95.toFixed(1)}ms, max ${mx.toFixed(1)}ms`);
await c.close();

ck(er.length===0,'no console / page errors',JSON.stringify(er));
console.log(bad?`\n${bad} FAIL`:'\nALL OK');await br.close();process.exit(bad?1:0)})();
