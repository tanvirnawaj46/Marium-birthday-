const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
for(const [W,H] of [[393,852],[428,926]]){const c=await b.newContext({viewport:{width:W,height:H},hasTouch:true,isMobile:true});const p=await c.newPage();const er=[];p.on('pageerror',e=>er.push(e.message));
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(800);
await p.evaluate(()=>{started=true;go(11)});await p.waitForTimeout(3000);
await p.evaluate(()=>{const v=$('#vid');v.pause();v.dispatchEvent(new Event('ended'))});await p.waitForTimeout(3200);
const end=await p.evaluate(()=>({cls:$('#vf').className,g:getComputedStyle($('#g11')).display,sc:$('#p11').classList.contains('sc'),mark:$('#mark').className,skip:getComputedStyle($('#skip')).display,txt:$('#vend').textContent}));
await p.screenshot({path:`/tmp/shots/v11_${W}_d.png`});
await p.mouse.move(200,300);await p.mouse.wheel(0,600);await p.waitForTimeout(700);await p.screenshot({path:`/tmp/shots/v11_${W}_e.png`});
const kr=await p.evaluate(()=>{const r=$('.upn .upk').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]});await p.touchscreen.tap(kr[0],kr[1]);await p.waitForTimeout(3000);
console.log(W,JSON.stringify(end),'-> after card button cur',await p.evaluate(()=>cur),'(expect 18)',er);await c.close()}
await b.close()})();
