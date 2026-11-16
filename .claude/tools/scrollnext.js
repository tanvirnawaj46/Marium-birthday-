// Scroll-to-continue 2.0 test (page-as-scroller): per gated page -> ready -> mark -> native scroll -> Up-next card -> tap -> nextOf
// usage: node .claude/tools/scrollnext.js [W H] [pages]   (shots: /tmp/shots/sx_W_n_{h,m,e}.png)
const {chromium}=require('playwright');
const W=+process.argv[2]||393,H=+process.argv[3]||852,pages=(process.argv[4]||'3,6,7,10,11,14,16,17,18,19,20,12').split(',').map(Number);
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const c=await b.newContext({viewport:{width:W,height:H},hasTouch:true,isMobile:true,deviceScaleFactor:1});const p=await c.newPage();const er=[];
p.on('pageerror',e=>er.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/agent-proxy|Allowed|googleapis|ERR_|Failed to load/.test(m.text()))er.push(m.text())});
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(800);
const Q={3:'#g3',6:'#p6 .go',7:'#g7',10:'#p10 .go',11:'#g11',14:'#g14',16:'#g16',17:'#g17',18:'#g18',19:'#g19',20:'#g20',12:'#replay'};
require('fs').mkdirSync('/tmp/shots',{recursive:true});
for(const n of pages){
 await p.evaluate(n=>{started=true;go(n)},n);await p.waitForTimeout(2300);
 const pre=await p.evaluate(n=>{const pg=document.querySelector('#p'+n);return{sc:pg.classList.contains('sc'),real:getComputedStyle(document.querySelector(NXB[n])).visibility,docH:document.documentElement.scrollHeight,card:!!pg.querySelector(':scope>.upn')}},n);
 // pretend the page's own job is done
 await p.evaluate(q=>{const g=document.querySelector(q);g.classList.remove('hid');g.classList.add('show')},Q[n]);
 await p.waitForTimeout(1300);
 const hint=await p.evaluate(n=>{const pg=document.querySelector('#p'+n),m=document.querySelector('#mark');return{sc:pg.classList.contains('sc'),sxr:document.documentElement.classList.contains('sxr'),mark:m.classList.contains('on'),markOp:getComputedStyle(m).opacity,range:pg.scrollHeight-pg.clientHeight,force:!!pg.querySelector('.upn.force'),title:(pg.querySelector('.upx b')||{}).textContent,real:getComputedStyle(document.querySelector(NXB[n])).visibility}},n);
 await p.screenshot({path:`/tmp/shots/sx_${W}_${n}_h.png`});
 // range stability (animated things must not change the scroll range)
 const ranges=[];for(let i=0;i<6;i++){ranges.push(await p.evaluate(n=>{const pg=document.querySelector('#p'+n);return pg.scrollHeight-pg.clientHeight},n));await p.waitForTimeout(450)}
 // real wheel scroll (halfway), then to the end
 await p.mouse.move(W/2,H*.4);await p.mouse.wheel(0,Math.round(ranges[0]*.5));await p.waitForTimeout(500);
 const mid=await p.evaluate(n=>{const pg=document.querySelector('#p'+n),u=pg.querySelector('.upc');return{st:Math.round(pg.scrollTop),op:u.style.opacity,live:u.classList.contains('live'),off:(u.style.strokeDashoffset||'')+getComputedStyle(pg.querySelector('.upf')).strokeDashoffset,mark:document.querySelector('#mark').classList.contains('on')}},n);
 await p.screenshot({path:`/tmp/shots/sx_${W}_${n}_m.png`});
 await p.mouse.wheel(0,ranges[0]*2);await p.waitForTimeout(900);
 const end=await p.evaluate(n=>{const pg=document.querySelector('#p'+n),u=pg.querySelector('.upc'),k=u.querySelector('.upk'),r=k.getBoundingClientRect();return{st:Math.round(pg.scrollTop),live:u.classList.contains('live'),full:u.classList.contains('full'),btn:k.textContent,inView:r.top>=0&&r.bottom<=innerHeight,r:[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)],docScroll:scrollY}},n);
 await p.screenshot({path:`/tmp/shots/sx_${W}_${n}_e.png`});
 await p.touchscreen.tap(end.r[0]+end.r[2]/2,end.r[1]+end.r[3]/2); // real touch at the button centre (the ready pulse keeps the box moving, so locator.tap() would wait forever)
 await p.waitForTimeout(2600);
 const after=await p.evaluate(()=>[cur,document.documentElement.classList.contains('sxr')]);
 const exp=n===12?1:await p.evaluate(n=>nextOf(n),n); // p12 'Play again' restarts at page 1
 console.log(n,after[0]===exp?'OK ':'BAD','pre',JSON.stringify(pre),'| ready',JSON.stringify(hint),'| ranges',ranges.join(','),'| mid',JSON.stringify(mid),'| end',JSON.stringify(end),'| after',JSON.stringify(after),'exp',exp);
}
console.log('errors:',er);await b.close()})();
