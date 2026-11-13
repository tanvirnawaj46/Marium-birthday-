const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const er=[];
for(const [W,H] of [[393,852],[428,926]]){const c=await b.newContext({viewport:{width:W,height:H},hasTouch:true,isMobile:true});const p=await c.newPage();p.on('pageerror',e=>er.push(e.message));
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(800);
await p.evaluate(()=>{window.__s={};for(const k of Object.keys(SFX)){const f=SFX[k];if(typeof f==='function')SFX[k]=function(){window.__s[k]=(window.__s[k]||0)+1;return f.apply(this,arguments)}}});
const out={};
// p19: box taps play, empty taps don't
await p.evaluate(()=>{started=true;go(19)});await p.waitForTimeout(2500);
const r=await p.evaluate(()=>{const b=$('#mbx').getBoundingClientRect();return [b.x+b.width/2,b.y+b.height/2,b.bottom]});
await p.touchscreen.tap(60,Math.round(r[2]+60));await p.waitForTimeout(150);out.p19_empty=await p.evaluate(()=>window.__s.mb||0);
await p.touchscreen.tap(r[0],r[1]);await p.waitForTimeout(250);out.p19_box=await p.evaluate(()=>window.__s.mb||0);
// p5: after 12s only Continue moves on
await p.evaluate(()=>{started=true;go(5)});await p.waitForTimeout(13500);
out.p5_tapVisible=await p.evaluate(()=>[$('#tap').classList.contains('vis'),getComputedStyle($('#tap')).pointerEvents]);
await p.touchscreen.tap(W/2,120);await p.waitForTimeout(700);out.p5_afterEmptyTap=await p.evaluate(()=>cur);
const bb=await p.evaluate(()=>{const b=$('#tap').getBoundingClientRect();return [b.x+b.width/2,b.y+b.height/2]});
await p.touchscreen.tap(bb[0],bb[1]);await p.waitForTimeout(2800);out.p5_afterContinue=await p.evaluate(()=>cur);
// p5 early: invisible Continue/blow buttons must not react
await p.evaluate(()=>{started=true;go(5)});await p.waitForTimeout(2500);
out.p5_early=await p.evaluate(()=>[getComputedStyle($('#tap')).pointerEvents,getComputedStyle($('#blow')).pointerEvents]);
// p11: pause button
await p.evaluate(()=>{started=true;go(11)});await p.waitForTimeout(3200);
out.p11_playing=await p.evaluate(()=>!$('#vid').paused);
await p.tap('#vpp');await p.waitForTimeout(400);out.p11_afterBtn=await p.evaluate(()=>[$('#vid').paused,$('#vpp').textContent]);
await p.touchscreen.tap(W/2,H/2);await p.waitForTimeout(400);out.p11_afterPictureTap=await p.evaluate(()=>$('#vid').paused);
await p.tap('#vpp');await p.waitForTimeout(400);out.p11_resumed=await p.evaluate(()=>!$('#vid').paused);
await p.evaluate(()=>{const v=$('#vid');v.pause();v.dispatchEvent(new Event('ended'))});await p.waitForTimeout(800);
out.p11_end=await p.evaluate(()=>({gone:$('#vpp').classList.contains('gone'),pe:getComputedStyle($('#vpp')).pointerEvents}));
await p.touchscreen.tap(W/2,H/2);await p.waitForTimeout(500);out.p11_afterEndTapRestarted=await p.evaluate(()=>!$('#vid').paused);
// go(sameplace)
out.sameGo=await p.evaluate(async()=>{const a=cur;go(cur);go(cur);return [a,cur]});
console.log(W,JSON.stringify(out));await c.close()}
console.log('errors',er);await b.close()})();
