// Double-tap zoom guard test with REAL touches (CDP Input.dispatchTouchEvent) + computed touch-action audit.
// iOS itself cannot be tested here: this only proves OUR logic (2nd quick tap near the 1st is cancelled on any element, single / slow / far taps and swipes
// are not, pointer events still fire, the non-passive touchstart listener is only alive during the ~0.5s window, touch-action:none where intended).
// usage: node .claude/tools/dbltap.js [W H]
const {chromium}=require('playwright');
const W=+process.argv[2]||393,H=+process.argv[3]||852;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let bad=0;const ok=(name,cond,extra='')=>{if(!cond)bad++;console.log(cond?'ok  ':'BAD ',name,extra)};
(async()=>{
 const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
 const c=await b.newContext({viewport:{width:W,height:H},hasTouch:true,isMobile:true});
 const p=await c.newPage();const cdp=await c.newCDPSession(p);
 const errs=[];p.on('pageerror',e=>errs.push(String(e)));
 const T=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts});
 const tap=async(x,y,hold=45)=>{await T('touchStart',[{x,y}]);await sleep(hold);await T('touchEnd',[])};
 const swipe=async(x,y0,y1,steps=10)=>{await T('touchStart',[{x,y:y0}]);for(let i=1;i<=steps;i++){await T('touchMove',[{x,y:y0+(y1-y0)*i/steps}]);await sleep(14)}await T('touchEnd',[])};
 await p.goto('http://localhost:8766/index.html');await sleep(800);
 // probes in the BUBBLE phase on document: they run after every capture listener of main.js, so defaultPrevented shows the final decision
 await p.evaluate(()=>{started=true;go(1);window.__ev=[];
  ['touchstart','touchend','pointerdown','pointerup','click'].forEach(t=>document.addEventListener(t,e=>__ev.push([t,e.defaultPrevented,e.target.id||e.target.className||e.target.tagName]),true));
  // probes must see the final value -> register in bubble phase too (separate list)
  window.__fin=[];['touchstart','touchend','click','pointerdown'].forEach(t=>document.addEventListener(t,e=>__fin.push([t,e.defaultPrevented,e.target.id||'']),false));
  for(const [id,l,t] of [['tbA',60,300],['tbB',260,300],['tbC',60,520]]){const x=document.createElement('button');x.id=id;x.textContent=id;x.style.cssText=`position:fixed;left:${l}px;top:${t}px;width:110px;height:70px;z-index:99999;font-size:20px`;x.dataset.n=0;x.onclick=()=>x.dataset.n=+x.dataset.n+1;document.body.appendChild(x)}});
 await sleep(2500);
 const rect=id=>p.evaluate(id=>{const r=document.getElementById(id).getBoundingClientRect();return [Math.round(r.left+r.width/2),Math.round(r.top+r.height/2)]},id);
 const clicks=id=>p.evaluate(id=>+document.getElementById(id).dataset.n,id);
 const reset=async()=>{await p.evaluate(()=>{__fin.length=0;for(const id of ['tbA','tbB','tbC'])document.getElementById(id).dataset.n=0});await sleep(700)};
 const fin=()=>p.evaluate(()=>__fin.slice());
 const [ax,ay]=await rect('tbA'),[bx,by]=await rect('tbB'),[cx,cy]=await rect('tbC');

 // 1 single tap
 await reset();await tap(ax,ay);await sleep(120);
 ok('single tap clicks',await clicks('tbA')===1,'clicks='+await clicks('tbA'));
 ok('single tap not prevented',(await fin()).every(e=>!e[1]),JSON.stringify(await fin()));

 // 2 fast double tap, same place: 2nd tap must be cancelled (touchstart+touchend), click only once
 await reset();await tap(ax,ay);await sleep(110);await tap(ax+3,ay+2);await sleep(150);
 let f=await fin();const ts=f.filter(e=>e[0]==='touchstart'),te=f.filter(e=>e[0]==='touchend');
 ok('fast double tap: 1st touchstart free, 2nd cancelled',!ts[0][1]&&ts[1][1],JSON.stringify(ts));
 ok('fast double tap: 2nd touchend cancelled',!te[0][1]&&te[1][1],JSON.stringify(te));
 ok('fast double tap: button clicked once',await clicks('tbA')===1,'clicks='+await clicks('tbA'));
 ok('fast double tap: both pointerdowns still delivered',f.filter(e=>e[0]==='pointerdown').length===2);

 // 3 slow double tap: both are normal taps
 await reset();await tap(ax,ay);await sleep(600);await tap(ax,ay);await sleep(150);
 ok('slow double tap: 2 clicks',await clicks('tbA')===2,'clicks='+await clicks('tbA'));
 ok('slow double tap: nothing cancelled',(await fin()).every(e=>!e[1]));

 // 4 fast taps on two different buttons (far apart): not a double tap
 await reset();await tap(ax,ay);await sleep(110);await tap(bx,by);await sleep(150);
 ok('quick taps on different buttons both click',await clicks('tbA')===1&&await clicks('tbB')===1,`A=${await clicks('tbA')} B=${await clicks('tbB')}`);
 ok('quick taps far apart: nothing cancelled',(await fin()).every(e=>!e[1]),JSON.stringify((await fin()).filter(e=>e[1])));

 // 5 triple tap: 1st free, 2nd+3rd cancelled
 await reset();await tap(ax,ay);await sleep(100);await tap(ax,ay);await sleep(100);await tap(ax,ay);await sleep(150);
 ok('triple tap: one click only',await clicks('tbA')===1,'clicks='+await clicks('tbA'));

 // 6 tap then a swipe that starts inside the window: documented trade-off (cancelled once); the NEXT swipe works
 await reset();await tap(cx,cy);await sleep(100);await swipe(cx,cy,cy-120);await sleep(100);
 f=await fin();console.log('info  tap+quick swipe: touchstart prevented =',f.filter(e=>e[0]==='touchstart')[1][1]);

 // 7 swipe first, then a quick tap: the swipe is not a tap, so the tap is not cancelled
 await reset();await swipe(ax,ay+100,ay+20);await sleep(80);await tap(ax,ay);await sleep(150);
 ok('tap right after a swipe is a normal tap',await clicks('tbA')===1,'clicks='+await clicks('tbA'));

 // 8 long press then tap: not a tap-tap
 await reset();await tap(ax,ay,750);await sleep(100);await tap(ax,ay);await sleep(150);
 ok('tap after a long press is a normal tap',await clicks('tbA')===2,'clicks='+await clicks('tbA'));

 // 9 two-finger touch resets the state
 await reset();await tap(ax,ay);await sleep(60);await T('touchStart',[{x:ax,y:ay},{x:ax+80,y:ay+80}]);await sleep(40);await T('touchEnd',[]);await sleep(60);await tap(ax,ay);await sleep(150);
 ok('after a 2-finger touch the next tap is normal',await clicks('tbA')===2,'clicks='+await clicks('tbA'));

 // 10 the non-passive touchstart listener only lives during the window
 const nonPassive=async()=>{const {result}=await cdp.send('Runtime.evaluate',{expression:'window'});const {listeners}=await cdp.send('DOMDebugger.getEventListeners',{objectId:result.objectId});return listeners.filter(l=>l.type==='touchstart'&&!l.passive).length};
 await reset();const idle0=await nonPassive();await tap(ax,ay);await sleep(120);const armed=await nonPassive();await sleep(800);const idle1=await nonPassive();
 ok('non-passive touchstart: idle 0 -> armed 1 -> idle 0',idle0===0&&armed===1&&idle1===0,`${idle0} -> ${armed} -> ${idle1}`);

 // 11 games: 2 quick taps on a balloon area on p6 -> both pointerdown reach the game
 await p.evaluate(()=>{go(6)});await sleep(3200);
 const bal=await p.evaluate(()=>{const e=document.querySelector('#bfield .bal,#bfield');const r=e.getBoundingClientRect();return [Math.round(r.left+r.width/2),Math.round(r.top+r.height/2)]});
 await p.evaluate(()=>{__fin.length=0});await sleep(700);await tap(bal[0],bal[1]);await sleep(100);await tap(bal[0]+4,bal[1]);await sleep(150);
 f=await fin();console.log('info  p6 events',JSON.stringify(f),'at',bal);const ts6=f.filter(e=>e[0]==='touchstart');ok('p6: 2 quick taps -> 2 pointerdown, 2nd touchstart cancelled',f.filter(e=>e[0]==='pointerdown').length===2&&ts6.length===2&&ts6[1][1]);

 // 11b a tap that only stops a momentum scroll (a scroll event just before it) must not arm the double-tap guard
 await p.evaluate(()=>{go(1)});await sleep(2500);await reset();
 await p.evaluate(()=>document.dispatchEvent(new Event('scroll')));await tap(ax,ay);await sleep(110);await tap(ax,ay);await sleep(150);
 ok('tap right after a scroll event is not a double-tap start',await clicks('tbA')===2,'clicks='+await clicks('tbA'));

 // 11c html.dtw: idle off -> on right after a tap -> off again; the scroller pages are touch-action:none only while it is on
 await p.evaluate(()=>{go(7)});await sleep(2600);
 await p.evaluate(()=>{const g=document.querySelector('#g7');g.classList.remove('hid');g.classList.add('show')});await sleep(1600);
 const ta=()=>p.evaluate(()=>({dtw:document.documentElement.classList.contains('dtw'),sc:document.querySelector('#p7').classList.contains('sc'),page:getComputedStyle(document.querySelector('#p7')).touchAction,kid:getComputedStyle(document.querySelector('#p7 .upc,#p7 .pol')||document.querySelector('#p7')).touchAction,car:getComputedStyle(document.querySelector('#car')).touchAction}));
 await sleep(600);const d0=await ta();await tap(Math.round(W/2),Math.round(H*.2));await sleep(120);const d1=await ta();await sleep(800);const d2=await ta();
 ok('p7 is a scroller now (.sc)',d0.sc,JSON.stringify(d0));
 ok('html.dtw: off -> on -> off, page pan-x pan-y -> none -> pan-x pan-y',!d0.dtw&&d1.dtw&&!d2.dtw&&d0.page==='pan-x pan-y'&&d1.page==='none'&&d2.page==='pan-x pan-y',JSON.stringify([d0.page,d1.page,d2.page]));
 ok('p7 carousel follows: pan-x pan-y -> none -> pan-x pan-y',d0.car==='pan-x pan-y'&&d1.car==='none'&&d2.car==='pan-x pan-y',JSON.stringify([d0.car,d1.car,d2.car]));
 // a swipe after the window scrolls the page, a swipe inside the window does not (documented trade-off)
 const sc=()=>p.evaluate(()=>Math.round(document.querySelector('#p7').scrollTop));
 await p.evaluate(()=>{document.querySelector('#p7').scrollTop=0});await sleep(300);await tap(Math.round(W*.5),Math.round(H*.2));await sleep(700);await swipe(Math.round(W*.5),Math.round(H*.78),Math.round(H*.78)-220);await sleep(600);
 const after=await sc();ok('swipe after the window scrolls the page',after>100,'scrollTop='+after);
 await p.evaluate(()=>{document.querySelector('#p7').scrollTop=0});await sleep(300);await tap(Math.round(W*.5),Math.round(H*.2));await sleep(80);await swipe(Math.round(W*.5),Math.round(H*.2),Math.round(H*.2)-220);await sleep(600);
 console.log('info  swipe started 80ms after a tap near it: scrollTop =',await sc(),'(blocked once by design)');

 // 12 computed touch-action audit (visit p7 first so the carousel exists)
 await p.evaluate(()=>{go(7)});await sleep(3000);
 const audit=await p.evaluate(()=>{const out=[];const ta=e=>getComputedStyle(e).touchAction;
  for(const pg of document.querySelectorAll('.pg')){const kids=[pg,...pg.querySelectorAll('.btn,button,.top,svg,canvas,img,p,div')].slice(0,60);out.push([pg.id,pg.classList.contains('sc'),[...new Set(kids.map(ta))].join('|')])}
  const g=s=>{const e=document.querySelector(s);return e?ta(e):'-'};
  return {pages:out,car:g('#car'),pol:g('#car .pol'),letter:g('#letter'),ltxt:g('#ltxt'),mus:g('#mus'),lb:g('#lb'),p2:g('#p2'),s2:g('#s2')}});
 for(const [id,sc,v] of audit.pages){const good=id==='p2'?v.includes('pan-x pan-y'):sc?v.includes('pan-x pan-y'):(id==='p7'||id==='p10'||id==='p6'||id==='p16'||id==='p17'||id==='p18')?(v==='none'||v.includes('pan-x pan-y')):v==='none';ok(`touch-action ${id}${sc?' (.sc)':''}`,good,v)}
 console.log('car/pol/letter/ltxt/mus/lb/p2/s2 =',audit.car,'/',audit.pol,'/',audit.letter,'/',audit.ltxt,'/',audit.mus,'/',audit.lb,'/',audit.p2,'/',audit.s2);
 ok('#car keeps panning',audit.car==='pan-x pan-y'&&audit.pol==='pan-x pan-y');ok('#letter keeps panning',audit.letter==='pan-x pan-y'&&audit.ltxt==='pan-x pan-y');
 ok('#mus / #lb are none',audit.mus==='none'&&audit.lb==='none');ok('#p2 / #s2 keep panning',audit.p2==='pan-x pan-y'&&audit.s2==='pan-x pan-y');
 ok('no page errors',errs.length===0,errs.join(' | '));
 console.log(bad?`FAILED ${bad}`:'ALL OK');await b.close();process.exit(bad?1:0)})();
