// real touch checks for scrollers that are NOT .sc pages: p2 document scroll, p7 carousel (pre-ready), p10 letter scroller
// usage: node .claude/tools/touchmisc.js [W H]
const {chromium}=require('playwright');
const W=+process.argv[2]||393,H=+process.argv[3]||852;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let bad=0;const ok=(n,c,x='')=>{if(!c)bad++;console.log(c?'ok  ':'BAD ',n,x)};
(async()=>{
 const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
 const c=await b.newContext({viewport:{width:W,height:H},hasTouch:true,isMobile:true});
 const p=await c.newPage();const cdp=await c.newCDPSession(p);const errs=[];p.on('pageerror',e=>errs.push(String(e)));
 const T=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts});
 const drag=async(x0,y0,x1,y1,steps=12)=>{await T('touchStart',[{x:x0,y:y0}]);for(let i=1;i<=steps;i++){await T('touchMove',[{x:x0+(x1-x0)*i/steps,y:y0+(y1-y0)*i/steps}]);await sleep(14)}await T('touchEnd',[])};
 await p.goto('http://localhost:8766/index.html');await sleep(800);

 // p2: document scroll (html.ds). Swipe up from a few places; scrollY must grow
 await p.evaluate(()=>{started=true;go(2)});await sleep(2600);
 const ds=await p.evaluate(()=>({ds:document.documentElement.classList.contains('ds'),sh:document.scrollingElement.scrollHeight,ta:getComputedStyle(document.querySelector('#s2')).touchAction}));
 console.log('info  p2 state',JSON.stringify(ds));
 for(const [fx,fy] of [[.5,.7],[.3,.4],[.7,.2]]){await p.evaluate(()=>scrollTo(0,0));await sleep(400);await drag(Math.round(W*fx),Math.round(H*fy),Math.round(W*fx),Math.round(H*fy)-300);await sleep(900);
  const y=await p.evaluate(()=>Math.round(scrollY));ok(`p2 swipe from ${fx},${fy} scrolls the document`,y>120,'scrollY='+y)}

 // p7: carousel horizontal swipe BEFORE the page is a scroller (page itself is touch-action:none)
 await p.evaluate(()=>{go(7)});await sleep(2600);
 const pre=await p.evaluate(()=>({sc:document.querySelector('#p7').classList.contains('sc'),car:getComputedStyle(document.querySelector('#car')).touchAction,pol:getComputedStyle(document.querySelector('#car .pol')).touchAction,pg:getComputedStyle(document.querySelector('#p7')).touchAction}));
 console.log('info  p7 pre-ready',JSON.stringify(pre));
 const carY=await p.evaluate(()=>{const r=document.querySelector('#car').getBoundingClientRect();return Math.round(r.top+r.height/2)});
 await p.evaluate(()=>{const c=document.querySelector('#car');c.style.scrollBehavior='auto';c.scrollLeft=0});await sleep(500);
 await drag(Math.round(W*.8),carY,Math.round(W*.2),carY);await sleep(900);
 const sl=await p.evaluate(()=>Math.round(document.querySelector('#car').scrollLeft));ok('p7 carousel scrolls sideways with a finger (page not .sc yet)',sl>60,'scrollLeft='+sl);

 // same carousel with the page forced back to NON-scroller state (page = touch-action:none, #car keeps pan-x pan-y)
 await p.evaluate(()=>{document.querySelector('#p7').classList.remove('sc');const c=document.querySelector('#car');c.scrollLeft=0});await sleep(400);
 const pre2=await p.evaluate(()=>({sc:document.querySelector('#p7').classList.contains('sc'),pg:getComputedStyle(document.querySelector('#p7')).touchAction,car:getComputedStyle(document.querySelector('#car')).touchAction,pol:getComputedStyle(document.querySelector('#car .pol')).touchAction,dots:getComputedStyle(document.querySelector('#p7 .top')).touchAction}));
 console.log('info  p7 forced non-scroller',JSON.stringify(pre2));
 ok('non-scroller p7: page none, carousel pan-x pan-y',pre2.pg==='none'&&pre2.car==='pan-x pan-y'&&pre2.pol==='pan-x pan-y'&&pre2.dots==='none');
 await drag(Math.round(W*.8),carY,Math.round(W*.2),carY);await sleep(900);
 const sl2=await p.evaluate(()=>Math.round(document.querySelector('#car').scrollLeft));ok('carousel still swipes sideways when the page itself is touch-action:none',sl2>60,'scrollLeft='+sl2);

 // p10: letter scroller (vertical) while the page itself is touch-action:none
 await p.evaluate(()=>{go(10)});await sleep(9000);
 const L=await p.evaluate(()=>{const l=document.querySelector('#letter');const r=l.getBoundingClientRect();return {sh:l.scrollHeight,ch:l.clientHeight,top:Math.round(r.top),h:Math.round(r.height),left:Math.round(r.left),w:Math.round(r.width),ta:getComputedStyle(l).touchAction}});
 console.log('info  p10 letter',JSON.stringify(L));
 if(L.sh>L.ch+20){await p.evaluate(()=>{document.querySelector('#letter').scrollTop=0});await sleep(300);await drag(Math.round(L.left+L.w/2),Math.round(L.top+L.h*.8),Math.round(L.left+L.w/2),Math.round(L.top+L.h*.8)-160);await sleep(800);
  const st=await p.evaluate(()=>Math.round(document.querySelector('#letter').scrollTop));ok('p10 letter scrolls with a finger',st>40,'scrollTop='+st)}
 else console.log('info  letter does not overflow yet (nothing to scroll)');
 ok('no page errors',errs.length===0,errs.join(' | '));
 console.log(bad?'FAILED '+bad:'ALL OK');await b.close();process.exit(bad?1:0)})();
