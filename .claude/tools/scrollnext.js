// Scroll-to-continue 3.1 test (Job 10 + 11: DOCUMENT scroll, Safari collapses its bar; dg is on FROM PAGE OPEN, ready adds sxr + card + mark): per gated page -> open (dg/sc on, small range) -> ready (sxr + mark) -> native wheel scroll of the DOCUMENT
// -> 'Up next' card (ring/live/full) -> tap its button -> nextOf. Also asserts: the page itself (.pg.sc) never scrolls (scrollTop 0), it is position:absolute 100svh,
// #dgbg carries the background, the card sits below the scene, and the page returns to normal (no dg, scrollY 0) after leaving.
// usage: node .claude/tools/scrollnext.js [W H] [pages]   (shots: /tmp/shots/sx_W_n_{h,m,e}.png)
const {chromium}=require('playwright');
const W=+process.argv[2]||393,H=+process.argv[3]||852,pages=(process.argv[4]||'3,6,7,10,11,14,16,17,18,19,20,12').split(',').map(Number);
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const c=await b.newContext({viewport:{width:W,height:H},hasTouch:true,isMobile:true,deviceScaleFactor:1});const p=await c.newPage();const er=[];
p.on('pageerror',e=>er.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/agent-proxy|Allowed|googleapis|ERR_|Failed to load/.test(m.text()))er.push(m.text())});
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(800);
const Q={3:'#g3',6:'#p6 .go',7:'#g7',10:'#p10 .go',11:'#g11',14:'#g14',16:'#g16',17:'#g17',18:'#g18',19:'#g19',20:'#g20',12:'#replay'};
require('fs').mkdirSync('/tmp/shots',{recursive:true});let bad=0;
for(const n of pages){
 await p.evaluate(n=>{started=true;go(n)},n);await p.waitForTimeout(2300);
 const pre=await p.evaluate(n=>{const pg=document.querySelector('#p'+n);return{dg:document.documentElement.classList.contains('dg'),sc:pg.classList.contains('sc'),pos:getComputedStyle(pg).position,real:getComputedStyle(document.querySelector(NXB[n])).visibility,btnShown:getComputedStyle(document.querySelector(NXB[n])).display!=='none',sxr:document.documentElement.classList.contains('sxr'),range:document.scrollingElement.scrollHeight-innerHeight,docH:document.scrollingElement.scrollHeight,innerH:innerHeight}},n);
 // pretend the page's own job is done
 await p.evaluate(q=>{const g=document.querySelector(q);g.classList.remove('hid');g.classList.add('show')},Q[n]);
 await p.waitForTimeout(1300);
 const hint=await p.evaluate(n=>{const pg=document.querySelector('#p'+n),m=document.querySelector('#mark'),se=document.scrollingElement,cs=getComputedStyle(pg),g=document.querySelector('#dgbg'),gs=getComputedStyle(g),z=document.querySelector('.upn'),zr=z.getBoundingClientRect();
  return{dg:document.documentElement.classList.contains('dg'),sc:pg.classList.contains('sc'),sxr:document.documentElement.classList.contains('sxr'),pos:cs.position,pgH:Math.round(pg.getBoundingClientRect().height),pgBg:cs.backgroundImage,dgbg:gs.display+'/z'+gs.zIndex+'/'+(gs.backgroundImage==='none'?'none':'img'),mark:m.classList.contains('on'),markOp:getComputedStyle(m).opacity,range:se.scrollHeight-innerHeight,zoneTop:Math.round(zr.top+scrollY),zoneH:Math.round(zr.height),force:!!document.querySelector('.upn.force'),title:(document.querySelector('.upx b')||{}).textContent,real:getComputedStyle(document.querySelector(NXB[n])).visibility,D:Math.round(SX.D)}},n);
 await p.screenshot({path:`/tmp/shots/sx_${W}_${n}_h.png`});
 // range stability (animated things must not change the scroll range)
 const ranges=[];for(let i=0;i<6;i++){ranges.push(await p.evaluate(()=>document.scrollingElement.scrollHeight-innerHeight));await p.waitForTimeout(450)}
 // real wheel scroll (halfway), then to the end
 await p.mouse.move(W/2,H*.4);await p.mouse.wheel(0,Math.round(hint.D*.5));await p.waitForTimeout(500);
 const mid=await p.evaluate(n=>{const pg=document.querySelector('#p'+n),u=document.querySelector('.upn .upc');return{st:Math.round(scrollY),inner:Math.round(pg.scrollTop),op:u.style.opacity,live:u.classList.contains('live'),off:getComputedStyle(u.querySelector('.upf')).strokeDashoffset,mark:document.querySelector('#mark').classList.contains('on')}},n);
 await p.screenshot({path:`/tmp/shots/sx_${W}_${n}_m.png`});
 await p.mouse.wheel(0,ranges[0]*2);await p.waitForTimeout(900);
 const end=await p.evaluate(n=>{const pg=document.querySelector('#p'+n),u=document.querySelector('.upn .upc'),k=u.querySelector('.upk'),r=k.getBoundingClientRect();return{st:Math.round(scrollY),inner:Math.round(pg.scrollTop),live:u.classList.contains('live'),full:u.classList.contains('full'),btn:k.textContent,inView:r.top>=0&&r.bottom<=innerHeight,r:[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)],pgTop:Math.round(pg.getBoundingClientRect().top)}},n);
 await p.screenshot({path:`/tmp/shots/sx_${W}_${n}_e.png`});
 await p.touchscreen.tap(end.r[0]+end.r[2]/2,end.r[1]+end.r[3]/2); // real touch at the button centre (the ready pulse keeps the box moving, so locator.tap() would wait forever)
 await p.waitForTimeout(2600);
 const after=await p.evaluate(n=>[cur,document.documentElement.classList.contains('dg'),document.querySelector('#p'+n).classList.contains('sc'),Math.round(scrollY),document.querySelectorAll('.upn').length,document.querySelector('#p'+cur).classList.contains('sc')],n);
 const exp=n===12?1:await p.evaluate(n=>nextOf(n),n); // p12 'Play again' restarts at page 1
 // assertions
 const why=[];
 if(!pre.dg||!pre.sc)why.push('dg/sc not on from the moment the page opened');
 if(pre.pos!=='absolute')why.push('page not absolute before ready');
 if(pre.sxr&&!pre.btnShown)why.push('sxr on although the page job is not done');
 if(!pre.btnShown&&(pre.range<120||pre.range>260))why.push('pre-ready range '+pre.range+' (expected ~170)');
 if(!hint.dg||!hint.sc)why.push('dg/sc not on when ready');
 if(hint.pos!=='absolute')why.push('page not absolute');
 if(Math.abs(hint.pgH-H)>2)why.push('page height '+hint.pgH+' != '+H);
 if(hint.pgBg!=='none')why.push('page still has a bg');
 if(!/^block/.test(hint.dgbg))why.push('#dgbg not shown');
 if(hint.range<hint.D+20)why.push('scroll range '+hint.range+' < D '+hint.D);
 if(hint.force)why.push('force mode');
 if(!hint.mark)why.push('mark not shown');
 if(Math.max(...ranges)-Math.min(...ranges)>2)why.push('range unstable '+ranges.join(','));
 if(mid.inner!==0||end.inner!==0)why.push('inner page scrolled');
 if(!(mid.st>0))why.push('document did not scroll');
 if(mid.mark)why.push('mark still on while scrolled');
 if(!end.full||!end.live)why.push('card not full at end');
 if(after[0]!==exp)why.push('went to '+after[0]+' not '+exp);
 if(after[2])why.push('old page still .sc after leaving');
 if(after[1]!==!!after[5])why.push('html.dg ('+after[1]+') does not match the new page .sc ('+after[5]+')');
 if(after[3]!==0)why.push('scrollY not reset '+after[3]);
 if(after[4]>1)why.push('stale card(s) '+after[4]);
 if(why.length)bad++;
 console.log(n,why.length?'BAD ':'OK ',why.join('; '),'\n   pre',JSON.stringify(pre),'\n   ready',JSON.stringify(hint),'\n   ranges',ranges.join(','),'| mid',JSON.stringify(mid),'| end',JSON.stringify(end),'| after',JSON.stringify(after),'exp',exp);
}
console.log('errors:',er);console.log(bad||er.length?'FAILED '+bad:'ALL OK');await b.close();process.exit(bad||er.length?1:0)})();
