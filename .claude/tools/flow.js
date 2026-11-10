const {chromium}=require('playwright');const URL=process.env.URL||'http://localhost:8766/index.html';
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:393,height:852},hasTouch:true,isMobile:true});const p=await c.newPage();const er=[];p.on('pageerror',e=>er.push(e.message));
await p.goto(URL);await p.waitForTimeout(800);
const F=await p.evaluate(()=>typeof FLOW!=='undefined'?FLOW:[0,1,3,2,4,5,6,7,14,8,10,11,12]);
for(const n of F){await p.evaluate(n=>{started=true;go(n)},n);await p.waitForTimeout(1800);
console.log(n,JSON.stringify(await p.evaluate(()=>[cur,[...document.querySelectorAll('.pg.on')].map(e=>e.id),innerHeight,document.documentElement.scrollHeight])))}
console.log('errors:',er);await b.close()})();
