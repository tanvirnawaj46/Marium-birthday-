// Job 12: p1 bow game states (idle, draw 50%, full draw aimed left, flight, after the shot, big-heart draw + hit). usage: node .claude/tools/bowshots.js W H [outdir] [tag]  -> outdir/tag_W_0..6.png (device scale 2). READ them.
// p1 states after the redesign: idle, draw 50%, full draw (aimed left), flight, after the hit, big heart hit
const {chromium}=require('playwright');
const W=+process.argv[2]||393,H=+process.argv[3]||852,OUT=process.argv[4]||'/tmp/shots',TAG=process.argv[5]||'p1a';
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
const c=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:2,hasTouch:true,isMobile:true});const p=await c.newPage();const er=[];p.on('pageerror',e=>er.push(e.message));p.on('console',m=>{if(m.type()==='error')er.push('console:'+m.text())});
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(800);
await p.evaluate(()=>{started=true;go(1)});await p.waitForTimeout(3400);
const shot=async n=>{await p.screenshot({path:`${OUT}/${TAG}_${W}_${n}.png`})};
await shot(0);
const sx=W/2,sy=H*.82;
await p.mouse.move(sx,sy);await p.mouse.down();
for(let i=1;i<=6;i++)await p.mouse.move(sx-i*2,sy+i*10);
await p.waitForTimeout(120);await shot(1);
for(let i=1;i<=10;i++)await p.mouse.move(sx-12-i*9,sy+60+i*9);
await p.waitForTimeout(150);await shot(2);
await p.mouse.up();await p.waitForTimeout(110);await shot(3);
await p.waitForTimeout(1300);await shot(4);
await p.mouse.move(sx,sy);await p.mouse.down();
for(let i=1;i<=12;i++)await p.mouse.move(sx,sy+i*12);
await p.waitForTimeout(100);await shot(5);
await p.mouse.up();await p.waitForTimeout(300);await shot(6);
console.log('errors',JSON.stringify(er));await b.close()})();
