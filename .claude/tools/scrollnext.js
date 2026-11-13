const {chromium}=require('playwright');
const W=+process.argv[2]||393,H=+process.argv[3]||852,pages=(process.argv[4]||'3,6,7,10,11,14,16,17,18,19,20,12').split(',').map(Number);
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:W,height:H},hasTouch:true,isMobile:true,deviceScaleFactor:1});const p=await c.newPage();const er=[];
p.on('pageerror',e=>er.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/agent-proxy|Allowed|googleapis|ERR_|Failed to load/.test(m.text()))er.push(m.text())});
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(800);
const Q={3:'#g3',6:'#p6 .go',7:'#g7',10:'#p10 .go',11:'#g11',14:'#g14',16:'#g16',17:'#g17',18:'#g18',19:'#g19',20:'#g20',12:'#replay'};
for(const n of pages){
 await p.evaluate(n=>{started=true;go(n)},n);await p.waitForTimeout(2300);
 const pre=await p.evaluate(()=>({sx:document.documentElement.classList.contains('sx'),sh:document.documentElement.scrollHeight,ih:innerHeight,cls:$('#nxd').className}));
 // pretend the page's own job is done
 await p.evaluate(q=>{const g=document.querySelector(q);g.classList.remove('hid');g.classList.add('show')},Q[n]);
 await p.waitForTimeout(500);
 const hint=await p.evaluate(()=>({cls:$('#nxd').className,vis:getComputedStyle($('#nxh')).visibility,op:getComputedStyle($('#nxh')).opacity,orig:getComputedStyle(document.querySelector('.pg.on .btn.show:not(#nxb)')||document.body).visibility}));
 await p.screenshot({path:`/tmp/shots/sx_${W}_${n}_h.png`});
 const rg=await p.evaluate(()=>document.documentElement.scrollHeight-innerHeight);
 await p.evaluate(r=>scrollTo(0,r*.45),rg);await p.waitForTimeout(450);
 const mid=await p.evaluate(()=>({sp:$('#nxd').style.getPropertyValue('--sp'),cls:$('#nxd').className}));
 await p.screenshot({path:`/tmp/shots/sx_${W}_${n}_m.png`});
 await p.evaluate(r=>scrollTo(0,r),rg);await p.waitForTimeout(600);
 const end=await p.evaluate(()=>({sp:$('#nxd').style.getPropertyValue('--sp'),cls:$('#nxd').className,y:scrollY,btn:$('#nxb').textContent,r:JSON.stringify($('#nxb').getBoundingClientRect())}));
 await p.screenshot({path:`/tmp/shots/sx_${W}_${n}_e.png`});
 await p.tap('#nxb',{timeout:3000}).catch(e=>er.push('tap fail '+n+' '+e.message.split('\n')[0]));
 await p.waitForTimeout(2600);
 const after=await p.evaluate(()=>[cur,scrollY,document.documentElement.classList.contains('sx')]);
 console.log(n,'pre',JSON.stringify(pre),'| hint',JSON.stringify(hint),'| mid',JSON.stringify(mid),'| end',JSON.stringify(end),'| after',JSON.stringify(after),'exp',await p.evaluate(n=>nextOf(n),n));
}
console.log('errors:',er);await b.close()})();
