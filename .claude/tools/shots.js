const {chromium}=require('playwright');const fs=require('fs');
const w=+process.argv[2]||393,h=+process.argv[3]||852;let pages=process.argv.slice(4).map(Number);const OUT=process.env.OUT||'/tmp/shots',URL=process.env.URL||'http://localhost:8766/index.html';fs.mkdirSync(OUT,{recursive:true});
const WAIT={4:6000,5:2500,6:3500,7:3500,8:2500,10:9000,11:2500,12:7000,14:3500,2:4500,3:6500,13:3500};
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:true});const p=await c.newPage();const er=[];p.on('pageerror',e=>er.push(e.message));
await p.goto(URL);await p.waitForTimeout(800);
if(!pages.length)pages=await p.evaluate(()=>typeof FLOW!=='undefined'?FLOW:[0,1,3,2,4,5,6,7,14,8,10,11,12]);
for(const n of pages){await p.evaluate(n=>{started=true;go(n)},n);await p.waitForTimeout(WAIT[n]||3000);await p.screenshot({path:`${OUT}/p${n}_${w}.png`})}
console.log('errors:',er);await b.close()})();
