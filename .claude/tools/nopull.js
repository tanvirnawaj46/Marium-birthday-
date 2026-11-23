// Job 11: pull-to-refresh guard (main.js 'no pull-to-refresh'), REAL touches via CDP. A downward drag that starts at the top of a scrolling page must be cancelled
// (touchmove defaultPrevented, no pan => no pointercancel); upward drags, taps, horizontal drags and the letter's own scroll must still work; with C.noPull=false nothing is cancelled.
// usage: node .claude/tools/nopull.js [W H]
const {chromium}=require('playwright');
const W=+process.argv[2]||393,H=+process.argv[3]||852;
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});let bad=0;const ck=(n,ok,i)=>{if(!ok){bad++;console.log('BAD ',n,i===undefined?'':JSON.stringify(i))}else console.log('ok  ',n,i===undefined?'':JSON.stringify(i))};
const mk=async(off)=>{const c=await b.newContext({viewport:{width:W,height:H},hasTouch:true,isMobile:true});const p=await c.newPage();const er=[];p.on('pageerror',e=>er.push(e.message));
 if(off)await p.route('**/config.js*',async r=>{const res=await r.fetch();await r.fulfill({response:res,body:(await res.text())+'\nCONFIG.noPull=false;'})});
 await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(700);
 await p.evaluate(()=>{window.__e={prevented:0,moves:0,cancel:0,click:0,pm:0,pd:0};
  addEventListener('touchmove',e=>{__e.moves++;if(e.defaultPrevented)__e.prevented++},{capture:true,passive:true});
  addEventListener('pointercancel',()=>__e.cancel++,true);addEventListener('pointermove',()=>__e.pm++,true);addEventListener('click',()=>__e.click++,true);addEventListener('pointerdown',()=>__e.pd++,true)});
 const cdp=await c.newCDPSession(p);const T=(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y}]});
 const drag=async(x0,y0,x1,y1,steps=14)=>{await T('touchStart',x0,y0);for(let i=1;i<=steps;i++){await T('touchMove',x0+(x1-x0)*i/steps,y0+(y1-y0)*i/steps);await new Promise(r=>setTimeout(r,16))}await T('touchEnd')};
 const E=()=>p.evaluate(()=>({...__e,sy:Math.round(scrollY)}));const R=()=>p.evaluate(()=>{__e.prevented=__e.moves=__e.cancel=__e.click=__e.pm=__e.pd=0});
 return{c,p,er,T,drag,E,R}};

// A: guard on, p19 (music box: taps only, pannable; empty area so no element is removed under the finger)
{const{c,p,er,drag,E,R,T}=await mk(false);console.log('--- guard ON, p19');
 await p.evaluate(()=>{started=true;go(19)});await p.waitForTimeout(2600);
 await R();await drag(W*.5,H*.62,W*.5,H*.62+200);await p.waitForTimeout(400);let e=await E();
 ck('downward drag at the top is cancelled (touchmove defaultPrevented)',e.prevented>=5&&e.sy===0,e);
 ck('...and starts no pan (no pointercancel)',e.cancel===0,e);
 await R();await drag(W*.5,H*.7,W*.5,H*.7-220);await p.waitForTimeout(700);e=await E();ck('upward drag still scrolls the document',e.sy>=100&&e.prevented===0,e);
 await R();const y0=e.sy;await drag(W*.5,H*.3,W*.5,H*.3+120);await p.waitForTimeout(700);e=await E();ck('drag down from a scrolled page scrolls back up (guard not active)',e.sy<y0&&e.prevented===0,{y0,...e});
 await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(300);
 // taps with small downward jitter must still click (a plain tap, then 5px jitter)
 await R();await T('touchStart',W*.5,H*.9);await T('touchMove',W*.5,H*.9+5);await T('touchEnd');await p.waitForTimeout(300);e=await E();ck('tap with 5px jitter still clicks',e.click>=1,e);
 // horizontal drag (slider-like) with some vertical drift is not cancelled
 await R();await drag(W*.2,H*.5,W*.8,H*.5+30);await p.waitForTimeout(300);e=await E();ck('mostly horizontal drag is not cancelled',e.prevented===0,e);
 ck('no page errors',er.length===0,er);await c.close()}

// B: guard on, p10 letter inner scroll: a downward drag on a letter that can still scroll up must scroll the letter, not be cancelled
{const{c,p,er,drag,E,R}=await mk(false);console.log('--- guard ON, p10 letter');
 await p.evaluate(()=>{started=true;go(10)});await p.waitForTimeout(2500);
 await p.evaluate(()=>{const L=document.querySelector('#letter');L.scrollTo=()=>{};const f=document.createElement('div');f.style.height='900px';L.appendChild(f);L.scrollTop=400});await p.waitForTimeout(300);
 const l0=await p.evaluate(()=>Math.round(document.querySelector('#letter').scrollTop));await R();
 const r=await p.evaluate(()=>{const b=document.querySelector('#letter').getBoundingClientRect();return[b.left+b.width/2,b.top+b.height*.4]});
 await drag(r[0],r[1],r[0],r[1]+160);await p.waitForTimeout(500);const e=await E();const l1=await p.evaluate(()=>Math.round(document.querySelector('#letter').scrollTop));
 ck('downward drag on a scrolled letter scrolls the letter (not cancelled)',l1<l0&&e.prevented===0,{l0,l1,...e});
 ck('no page errors',er.length===0,er);await c.close()}

// C: guard on, p17 garden: a downward hold-drag keeps delivering pointer events and does not scroll/refresh
{const{c,p,er,drag,E,R}=await mk(false);console.log('--- guard ON, p17 garden');
 await p.evaluate(()=>{started=true;go(17)});await p.waitForTimeout(2600);await R();
 await drag(W*.5,H*.3,W*.5,H*.3+300,20);await p.waitForTimeout(300);const e=await E();
 ck('garden: downward drag cancelled, pointer events keep flowing, page stays at 0',e.prevented>=5&&e.pm>=10&&e.cancel===0&&e.sy===0,e);
 ck('no page errors',er.length===0,er);await c.close()}

// D: guard OFF (C.noPull=false): nothing is cancelled any more
{const{c,p,er,drag,E,R}=await mk(true);console.log('--- guard OFF (noPull:false), p19');
 await p.evaluate(()=>{started=true;go(19)});await p.waitForTimeout(2600);await R();
 await drag(W*.5,H*.62,W*.5,H*.62+200);await p.waitForTimeout(400);const e=await E();
 ck('with noPull:false the drag is not cancelled',e.prevented===0,e);ck('no page errors',er.length===0,er);await c.close()}

// E: p0 / p1 (no document scroll) are not touched by the guard
{const{c,p,er,drag,E,R}=await mk(false);console.log('--- guard ON, p1 (not a scrolling page)');
 await p.evaluate(()=>{started=true;go(1)});await p.waitForTimeout(2600);await R();
 await drag(W*.5,H*.4,W*.5,H*.4+200);await p.waitForTimeout(300);const e=await E();ck('p1: guard inactive (html has no dg/ds)',e.prevented===0,e);await c.close()}
console.log(bad?'FAILED '+bad:'ALL OK');await b.close();process.exit(bad?1:0)})();
