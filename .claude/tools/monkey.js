// random-tap monkey: taps a grid of NON-button spots on every page and reports what reacted (page change, sounds, video restart, errors, long tasks)
const {chromium}=require('playwright');
const W=+process.argv[2]||393,H=+process.argv[3]||852,only=(process.argv[4]||'').split(',').filter(Boolean).map(Number),late=process.argv[5]==='late';
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const c=await b.newContext({viewport:{width:W,height:H},hasTouch:true,isMobile:true});const p=await c.newPage();const er=[];
p.on('pageerror',e=>er.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/agent-proxy|Allowed|googleapis|ERR_|Failed to load/.test(m.text()))er.push(m.text())});
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(900);
await p.evaluate(()=>{window.__sfx={};window.__lt=0;try{new PerformanceObserver(l=>{for(const e of l.getEntries())window.__lt+=e.duration}).observe({type:'longtask',buffered:true})}catch(e){}
 for(const k of Object.keys(SFX)){const f=SFX[k];if(typeof f==='function')SFX[k]=function(){window.__sfx[k]=(window.__sfx[k]||0)+1;return f.apply(this,arguments)}}});
const pages=only.length?only:[0,1,3,2,4,5,19,6,16,7,14,17,20,8,10,11,18,12];
for(const n of pages){
 await p.evaluate(n=>{started=true;go(n)},n);await p.waitForTimeout(late?(n===5?13500:3500):2600);
 if(late&&n===11)await p.evaluate(()=>{const v=$('#vid');v.pause();v.dispatchEvent(new Event('ended'))});
 await p.waitForTimeout(300);
 const pre=await p.evaluate(()=>({cur,vt:$('#vid').currentTime,vp:$('#vid').paused,dom:document.getElementsByTagName('*').length,pl:(typeof P!=='undefined'?P.length:-1)}));
 await p.evaluate(()=>{window.__sfx={};window.__lt=0});
 // taps on a grid; skip the top-right music chip and the bottom 70px (dock) so we only hit "empty" screen
 const pts=[];for(const fy of [.12,.22,.32,.42,.52,.62,.72])for(const fx of [.15,.38,.62,.85])pts.push([Math.round(W*fx),Math.round(H*fy)]);
 const t0=Date.now();let moved=[];
 for(const [x,y] of pts){await p.touchscreen.tap(x,y);await p.waitForTimeout(70);const cc=await p.evaluate(()=>cur);if(cc!==pre.cur){moved.push([x,y,cc]);break}}
 await p.waitForTimeout(500);
 const post=await p.evaluate(()=>({cur,vt:$('#vid').currentTime,vp:$('#vid').paused,dom:document.getElementsByTagName('*').length,pl:(typeof P!=='undefined'?P.length:-1),sfx:window.__sfx,lt:Math.round(window.__lt)}));
 const flags=[];if(moved.length)flags.push('PAGE-CHANGED->'+moved[0][2]);if(pre.vp!==post.vp)flags.push('video paused '+pre.vp+'->'+post.vp);if(post.vt<pre.vt-.5)flags.push('VIDEO RESTARTED');if(post.dom-pre.dom>80)flags.push('dom+'+(post.dom-pre.dom));if(post.pl>pre.pl+400)flags.push('particles '+pre.pl+'->'+post.pl);if(post.lt>200)flags.push('longtask '+post.lt+'ms');
 console.log('p'+n,flags.length?'!! '+flags.join(' | '):'ok','| sfx:',JSON.stringify(post.sfx),'| loop',Date.now()-t0,'ms');
}
console.log('errors',er);await b.close()})();
