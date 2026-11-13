const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const W=+process.argv[2]||393,H=+process.argv[3]||852;const c=await b.newContext({viewport:{width:W,height:H},hasTouch:true,isMobile:true});const p=await c.newPage();
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(800);
for(const [n,w,fn] of [[5,13500],[11,3500],[17,2500],[19,2500]]){await p.evaluate(n=>{started=true;go(n)},n);await p.waitForTimeout(w);
 if(n===17||n===19)await p.evaluate(q=>{const g=document.querySelector(q);g.classList.remove('hid');g.classList.add('show')},n===17?'#g17':'#g19');
 await p.waitForTimeout(1500);await p.screenshot({path:`/tmp/shots/g2_${W}_${n}.png`})}
await b.close()})();
