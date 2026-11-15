// perf audit: node perf.js W H [pages] [cpuThrottle]
// per page: (a) animation audit (SVG-internal / non-compositor props, infinite count) (b) backdrop-filter count (c) rAF frame times idle + while wheel-scrolling under CPU throttle (d) CDP layout/style counts during scroll
const {chromium}=require('playwright');
const W=+process.argv[2]||393,H=+process.argv[3]||852,pages=(process.argv[4]||'0,1,3,4,5,19,6,16,7,14,17,20,8,10,11,18,12').split(',').map(Number),TH=+process.argv[5]||4;
const Q={3:'#g3',6:'#p6 .go',7:'#g7',10:'#p10 .go',11:'#g11',14:'#g14',16:'#g16',17:'#g17',18:'#g18',19:'#g19',20:'#g20',12:'#replay'};
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const c=await b.newContext({viewport:{width:W,height:H},hasTouch:true,isMobile:true,deviceScaleFactor:2});const p=await c.newPage();
const cdp=await c.newCDPSession(p);await cdp.send('Performance.enable');
await p.goto(process.env.URL||'http://localhost:8766/index.html');await p.waitForTimeout(900);
if(process.env.NOSCR)await p.evaluate(()=>{const cl=document.documentElement.classList,add=cl.add.bind(cl);cl.add=(...a)=>{if(a[0]==='scr')return;add(...a)}});
await cdp.send('Emulation.setCPUThrottlingRate',{rate:TH});
const met=async()=>{const m=(await cdp.send('Performance.getMetrics')).metrics;const o={};m.forEach(x=>o[x.name]=x.value);return o};
const frames=(ms)=>p.evaluate(ms=>new Promise(r=>{const d=[];let l=performance.now();const t0=l;(function f(t){d.push(t-l);l=t;if(t-t0<ms)requestAnimationFrame(f);else{d.shift();d.sort((a,b)=>a-b);const n=d.length;r({n,avg:+(d.reduce((a,b)=>a+b,0)/n).toFixed(1),p95:+d[Math.floor(n*.95)].toFixed(1),max:+d[n-1].toFixed(1),jank:d.filter(x=>x>50).length})}})(l)}),ms);
for(const n of pages){
 await p.evaluate(n=>{started=true;go(n)},n);await p.waitForTimeout(3800);
 if(Q[n])await p.evaluate(q=>{const g=document.querySelector(q);if(g){g.classList.remove('hid');g.classList.add('show')}},Q[n]);
 await p.waitForTimeout(1600);
 const au=await p.evaluate(()=>{const A=document.getAnimations().filter(a=>a.playState==='running');const SAFE=new Set(['offset','easing','composite','computedOffset','transform','opacity','translate','rotate','scale']);let inf=0,svg=0,heavy=0;const hv={},sv={};
  let hid=0;A.forEach(a=>{const e=a.effect,t=e&&e.target;if(!t)return;const pg=t.closest&&t.closest('.pg');if(pg&&!pg.classList.contains('on')&&pg.id!=='p2'){hid++;return}const it=e.getComputedTiming().iterations;if(it===Infinity)inf++;const nm=(t.tagName||'')+(t.id?'#'+t.id:'')+(t.className&&t.className.baseVal!==undefined?'.'+t.className.baseVal:t.className?'.'+String(t.className).split(' ')[0]:'');
   const inner=t instanceof SVGElement&&!(t instanceof SVGSVGElement);if(inner&&it===Infinity){svg++;sv[nm]=(sv[nm]||0)+1}
   const ps=new Set();(e.getKeyframes?e.getKeyframes():[]).forEach(k=>Object.keys(k).forEach(x=>{if(!SAFE.has(x))ps.add(x)}));if(ps.size&&it===Infinity){heavy++;const key=nm+' ['+[...ps].join(',')+']';hv[key]=(hv[key]||0)+1}});
  let bf=0;const bl=[];document.querySelectorAll('*').forEach(e=>{const s=getComputedStyle(e),f=s.backdropFilter||s.webkitBackdropFilter;if(f&&f!=='none'){const r=e.getBoundingClientRect();const pg2=e.closest('.pg');if(r.width>0&&r.height>0&&s.visibility!=='hidden'&&+s.opacity>0&&r.bottom>0&&r.top<innerHeight&&!(pg2&&!pg2.classList.contains('on'))){bf++;bl.push(e.tagName+(e.id?'#'+e.id:'')+'.'+String(e.className&&e.className.baseVal!==undefined?'':e.className).split(' ')[0])}}});
  return {hiddenRunning:hid,running:A.length-hid,infinite:inf,svgInfinite:svg,svgTop:Object.entries(sv).sort((a,b)=>b[1]-a[1]).slice(0,3),nonCompositorInfinite:heavy,heavyTop:Object.entries(hv).slice(0,4),backdrop:bf,bl:bl.slice(0,8),nodes:document.querySelectorAll('.pg.on *').length}});
 const idle=await frames(1800);
 const m0=await met();
 const sc=(async()=>{for(let i=0;i<40;i++){await p.mouse.wheel(0,i<20?24:-24);await p.waitForTimeout(16)}})();
 const sf=await frames(1500);await sc;
 const m1=await met();
 const d=k=>+(m1[k]-m0[k]).toFixed(3);
 console.log(`p${n} nodes=${au.nodes} hiddenAnim=${au.hiddenRunning} anim=${au.running} inf=${au.infinite} svgInf=${au.svgInfinite}${au.svgInfinite?JSON.stringify(au.svgTop):''} nonComp=${au.nonCompositorInfinite}${au.nonCompositorInfinite?JSON.stringify(au.heavyTop):''} backdrop=${au.backdrop}${au.backdrop?' '+au.bl.join(','):''}\n   idle ${JSON.stringify(idle)}\n   scroll ${JSON.stringify(sf)} layouts=${d('LayoutCount')} recalc=${d('RecalcStyleCount')} layoutMs=${(d('LayoutDuration')*1000).toFixed(0)} styleMs=${(d('RecalcStyleDuration')*1000).toFixed(0)} scriptMs=${(d('ScriptDuration')*1000).toFixed(0)}`);
}
await b.close()})();
