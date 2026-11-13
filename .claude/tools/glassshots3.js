const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const W=+process.argv[2]||393,H=+process.argv[3]||852;const c=await b.newContext({viewport:{width:W,height:H},hasTouch:true,isMobile:true});const p=await c.newPage();
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(800);
const shots=[[12,7000],[2,4500],[6,3500],[16,2500]];
for(const [n,w] of shots){await p.evaluate(n=>{started=true;go(n)},n);await p.waitForTimeout(w);
 if(n===2)await p.evaluate(()=>scrollTo(0,0));
 await p.screenshot({path:`/tmp/shots/g3_${W}_${n}.png`})}
await b.close()})();
