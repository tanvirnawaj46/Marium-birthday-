// Job 11: run the REAL order p3 -> p2 (chapter, scroll to p13) -> p4 -> p5 -> p19 ... and report per page whether the DOCUMENT can scroll (= Safari bar can collapse). usage: node .claude/tools/realflow.js [W H]
// usage: node realflow.js [W H]
const {chromium}=require('playwright');
const W=+process.argv[2]||393,H=+process.argv[3]||852;
const NXB={3:'#g3',6:'#p6 .go',7:'#g7',10:'#p10 .go',11:'#g11',14:'#g14',16:'#g16',17:'#g17',18:'#g18',19:'#g19',20:'#g20',12:'#replay'};
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const c=await b.newContext({viewport:{width:W,height:H},hasTouch:true,isMobile:true,deviceScaleFactor:1});const p=await c.newPage();const er=[];
p.on('pageerror',e=>er.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/agent-proxy|Allowed|googleapis|ERR_|Failed to load/.test(m.text()))er.push(m.text())});
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(800);
const st=async(label)=>{const r=await p.evaluate(()=>{const se=document.scrollingElement,R=document.documentElement,pg=document.querySelector('.pg.on');return{cur,pg:pg&&pg.id,dg:R.classList.contains('dg'),ds:R.classList.contains('ds'),sxr:R.classList.contains('sxr'),sc:pg&&pg.classList.contains('sc'),range:se.scrollHeight-innerHeight,sy:Math.round(scrollY)}});console.log(label.padEnd(26),JSON.stringify(r));return r};
await p.evaluate(()=>{started=true;go(3)});await p.waitForTimeout(5800);await st('p3 (job done)');
await p.evaluate(()=>go(2));await p.waitForTimeout(2600);await st('p2 wish');
await p.mouse.move(W/2,H/2);await p.mouse.wheel(0,H);await p.waitForTimeout(1500);await st('p13 voice (scrolled)');
await p.evaluate(()=>go(4));await p.waitForTimeout(1500);await st('p4 cake (after chapter)');
await p.mouse.wheel(0,200);await p.waitForTimeout(500);await st('p4 after wheel 200');
// p4 has its own timer, let it run
await p.waitForTimeout(5500);await st('p4 +5.5s');
for(const n of [5,19,6,16,7,14,17,20,8,10,11,18,12]){
 await p.evaluate(n=>go(n),n);await p.waitForTimeout(n===8||n===10?2500:2300);
 const a=await st('p'+n+' opened');
 if(NXB[n]){await p.evaluate(q=>{const g=document.querySelector(q);g.classList.remove('hid');g.classList.add('show')},NXB[n]);await p.waitForTimeout(1300);await st('p'+n+' ready');}
 await p.mouse.wheel(0,260);await p.waitForTimeout(600);const s2=await st('p'+n+' after wheel 260');
 console.log('   => document scrolls:',s2.sy>0?'YES':'NO');
}
console.log('errors',er);await b.close()})();
