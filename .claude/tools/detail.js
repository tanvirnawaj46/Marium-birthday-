// detail screenshots at DPR 2 with optional crop: node detail.js W H page waitMs out.png [x y w h]  (page 2 + sec 13 => page "13")
const {chromium}=require('playwright');
const W=+process.argv[2]||393,H=+process.argv[3]||852,n=+process.argv[4],wait=+process.argv[5]||3000,out=process.argv[6]||`/tmp/shots/d${n}_${W}.png`;
const clip=process.argv[7]?{x:+process.argv[7],y:+process.argv[8],width:+process.argv[9],height:+process.argv[10]}:null;
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const c=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:2,hasTouch:true,isMobile:true});const p=await c.newPage();
await p.goto(process.env.URL||'http://localhost:8766/index.html');await p.waitForTimeout(800);
await p.evaluate(n=>{started=true;if(n===13){go(2);}else go(n)},n);await p.waitForTimeout(wait);
if(n===13){await p.evaluate(()=>{const s=document.querySelector('#s13');s&&s.scrollIntoView({behavior:'instant'})});await p.waitForTimeout(2500)}
if(process.env.EVAL){await p.evaluate(process.env.EVAL);await p.waitForTimeout(+process.env.EVALWAIT||800)}
await p.screenshot({path:out,...(clip?{clip}:{})});await b.close()})();
