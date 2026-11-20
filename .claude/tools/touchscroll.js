// REAL touch swipes on every gated page (Job 10: the DOCUMENT must follow a finger that starts anywhere; the page itself must never scroll, so Safari can collapse its bar)
// usage: node .claude/tools/touchscroll.js [W H] [pages]
const {chromium}=require('playwright');
const W=+process.argv[2]||393,H=+process.argv[3]||852,pages=(process.argv[4]||'3,6,7,10,11,14,16,17,18,19,20,12').split(',').map(Number);
const Q={3:'#g3',6:'#p6 .go',7:'#g7',10:'#p10 .go',11:'#g11',14:'#g14',16:'#g16',17:'#g17',18:'#g18',19:'#g19',20:'#g20',12:'#replay'};
const starts=[[.5,.78],[.5,.5],[.2,.3],[.82,.62],[.5,.2]];
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const c=await b.newContext({viewport:{width:W,height:H},hasTouch:true,isMobile:true});const p=await c.newPage();
const cdp=await c.newCDPSession(p);let bad=0;
// real finger: touchStart -> 14 touchMoves -> touchEnd through the browser input pipeline (honours touch-action, scroll chaining, momentum)
const swipe=async(x,y0,y1,steps=14,dt=16)=>{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y:y0}]});
 for(let i=1;i<=steps;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y0+(y1-y0)*i/steps}]});await new Promise(r=>setTimeout(r,dt))}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})};
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(800);
for(const n of pages){
 await p.evaluate(n=>{started=true;go(n)},n);await p.waitForTimeout(n===12?7500:2300);
 await p.evaluate(q=>{const g=document.querySelector(q);g.classList.remove('hid');g.classList.add('show')},Q[n]);await p.waitForTimeout(1300);
 const res=[],inner=[];
 for(const [fx,fy] of starts){
  await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(250);
  await swipe(Math.round(W*fx),Math.round(H*fy),Math.round(H*fy)-220);
  await p.waitForTimeout(700);
  const st=await p.evaluate(n=>[Math.round(scrollY),Math.round(document.querySelector('#p'+n).scrollTop)],n);res.push(st[0]);inner.push(st[1]);
 }
 const ok=res.every(v=>v>100)&&inner.every(v=>v===0);if(!ok)bad++;
 console.log(n,ok?'OK ':'BAD','document scrollY after each swipe',JSON.stringify(res),'inner page scrollTop',JSON.stringify(inner));
}
console.log(bad?'FAILED '+bad:'ALL OK');await b.close();process.exit(bad?1:0)})();
