// Job 11: REAL touch swipes on every UD page AT PAGE OPEN (job not done yet, no card): the DOCUMENT must follow a finger that starts almost anywhere,
// so Safari can collapse its bar on the cake page and every page after it. The one drag surface that needs every direction (p18 stars #cst) may refuse; its top/bottom margins must still scroll.
// usage: node .claude/tools/touchopen.js [W H] [pages]
const {chromium}=require('playwright');
const W=+process.argv[2]||393,H=+process.argv[3]||852,pages=(process.argv[4]||'3,4,5,19,6,16,7,14,17,20,8,10,11,18,12').split(',').map(Number);
const starts=[[.5,.78],[.5,.5],[.2,.3],[.82,.62],[.5,.2],[.15,.85],[.3,.07],[.6,.93]];
// start points that are ALLOWED not to scroll (rect = fractions of the screen) : drag-only surfaces
const NOSCROLL={18:[[0,.16,1,.86]]};
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const c=await b.newContext({viewport:{width:W,height:H},hasTouch:true,isMobile:true});const p=await c.newPage();
const cdp=await c.newCDPSession(p);let bad=0;const er=[];
p.on('pageerror',e=>er.push(e.message));
const swipe=async(x,y0,y1,steps=14,dt=16)=>{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y:y0}]});
 for(let i=1;i<=steps;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y0+(y1-y0)*i/steps}]});await new Promise(r=>setTimeout(r,dt))}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})};
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(800);
for(const n of pages){
 await p.evaluate(n=>{started=true;go(n)},n);await p.waitForTimeout(2300);
 if(n===4)await p.evaluate(()=>{window.__og=go;go=function(){}}); // p4 has its own 5.3s auto-advance: hold it while we swipe
 const st0=await p.evaluate(n=>({dg:document.documentElement.classList.contains('dg'),sc:document.querySelector('#p'+n).classList.contains('sc'),sxr:document.documentElement.classList.contains('sxr'),range:document.scrollingElement.scrollHeight-innerHeight}),n);
 const res=[],why=[];
 for(const [fx,fy] of starts){
  await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(250);
  await swipe(Math.round(W*fx),Math.round(H*fy),Math.round(H*fy)-200);
  await p.waitForTimeout(650);
  const y=await p.evaluate(()=>Math.round(scrollY)),inner=await p.evaluate(n=>Math.round(document.querySelector('#p'+n).scrollTop),n);
  const rects=NOSCROLL[n]||[],inRect=rects.some(([a,b2,c2,d])=>fx>=a&&fx<=c2&&fy>=b2&&fy<=d);
  const scrolled=y>60;res.push((scrolled?'S':'-')+(inRect?'*':''));
  if(!scrolled&&!inRect)why.push('start '+fx+','+fy+' did not scroll the document (y='+y+')');
  if(inner!==0)why.push('inner page scrolled '+inner);
 }
 if(!st0.dg||!st0.sc)why.push('dg/sc not on at page open');
 if(st0.sxr&&n!==7)why.push('sxr on before the job is done');
 if(n===4)await p.evaluate(()=>{go=window.__og});
 if(why.length)bad++;
 console.log(String(n).padEnd(3),why.length?'BAD':'OK ','open',JSON.stringify(st0),'swipes',res.join(' '),why.length?'\n    '+why.join('\n    '):'');
}
console.log('errors',er);console.log(bad||er.length?'FAILED '+bad:'ALL OK');await b.close();process.exit(bad||er.length?1:0)})();
