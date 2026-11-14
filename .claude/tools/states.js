// end/complete-state screenshots (glass check): node states.js W H [pages]  -> /tmp/shots/st_W_<name>.png
const {chromium}=require('playwright');
const W=+process.argv[2]||393,H=+process.argv[3]||852,only=(process.argv[4]||'').split(',').filter(Boolean);
const want=n=>!only.length||only.includes(String(n));
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const c=await b.newContext({viewport:{width:W,height:H},hasTouch:true,isMobile:true});const p=await c.newPage();const er=[];
p.on('pageerror',e=>er.push(e.message));
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(800);
const shot=async n=>{await p.screenshot({path:`/tmp/shots/st_${W}_${n}.png`});console.log('shot',n)};
const go=async(n,w)=>{await p.evaluate(n=>{started=true;go(n)},n);await p.waitForTimeout(w)};
const rect=async sel=>p.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}},sel);
const step=async(name,fn)=>{try{await fn()}catch(e){console.log('FAIL',name,e.message.split('\n')[0])}};
if(want(16))await step('p16',async()=>{await go(16,2500);const t=await rect('#lmt'),th=await rect('#lmth');
 await p.mouse.move(th.x+th.w/2,th.y+th.h/2);await p.mouse.down();await p.mouse.move(t.x+t.w*.6,t.y+t.h/2,{steps:12});await shot('16a_60');
 await p.mouse.move(t.x+t.w*1.02,t.y+t.h/2,{steps:10});await p.mouse.up();await p.waitForTimeout(1500);await shot('16b_count');await p.waitForTimeout(3500);await shot('16c_inf');
 await p.evaluate(()=>{const b=document.querySelector('#lm2');b&&b.click()});await p.waitForTimeout(3500);await shot('16d_part2')});
if(want(17))await step('p17',async()=>{await go(17,2500);const s=await rect('#gst');for(let i=0;i<7;i++){await p.touchscreen.tap(s.x+s.w*(.12+.12*i),s.y+s.h*(.55+.05*(i%3)));await p.waitForTimeout(350)}await p.waitForTimeout(1200);await shot('17a_7');
 for(let i=0;i<12;i++){await p.touchscreen.tap(s.x+s.w*(.1+.075*i),s.y+s.h*(.5+.07*(i%3)));await p.waitForTimeout(300)}await p.waitForTimeout(6500);await shot('17b_full')});
if(want(18))await step('p18',async()=>{await go(18,2500);const pts=await p.evaluate(()=>[...document.querySelectorAll('#cst .cstar')].map(e=>{const r=e.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]}));
 console.log('stars',pts.length);await p.mouse.move(pts[0][0],pts[0][1]);await p.mouse.down();
 for(let i=1;i<pts.length;i++){await p.mouse.move(pts[i][0],pts[i][1],{steps:8});await p.waitForTimeout(80);if(i===7)await shot('18a_half')}
 await p.mouse.move(pts[0][0],pts[0][1],{steps:8});await p.mouse.up();await p.waitForTimeout(1800);await shot('18b_mid');await p.waitForTimeout(3500);await shot('18c_done')});
if(want(19))await step('p19',async()=>{await go(19,2500);const r=await rect('#mbx');for(let i=0;i<9;i++){await p.touchscreen.tap(r.x+r.w/2,r.y+r.h/2);await p.waitForTimeout(260)}await shot('19a_mid');
 for(let i=0;i<20;i++){await p.touchscreen.tap(r.x+r.w/2,r.y+r.h/2);await p.waitForTimeout(220)}await p.waitForTimeout(2500);await shot('19b_end')});
if(want(20))await step('p20',async()=>{await go(20,2500);const hs=await p.evaluate(()=>[...document.querySelectorAll('#rjh .rh, .rh')].slice(0,3).map(e=>{const r=e.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]}));console.log('hearts',hs.length);
 await p.touchscreen.tap(hs[0][0],hs[0][1]);await p.waitForTimeout(1800);await shot('20a_card')});
if(want(12))await step('p12',async()=>{await go(12,6500);const r=await rect('.f-head');for(let i=0;i<3;i++){await p.touchscreen.tap(r.x+r.w/2,r.y+r.h/2);await p.waitForTimeout(150)}await p.waitForTimeout(1500);await shot('12a_secret')});
if(want(7))await step('p7',async()=>{await go(7,3500);const r=await rect('#car .pol');await p.touchscreen.tap(r.x+r.w/2,r.y+r.h/2);await p.waitForTimeout(1200);await shot('7a_lightbox')});
if(want(6))await step('p6',async()=>{await go(6,3000);await shot('6a')});
console.log('errors',er);await b.close()})();
