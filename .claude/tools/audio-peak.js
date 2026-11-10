// usage: node audio-peak.js chime key burst star:14:90 ...
//   name            -> SFX.name() once
//   name:N:ms       -> SFX.name(i) for i=0..N-1, one every ms milliseconds (worst case of overlapping notes)
// prints peak after the master saturator (must stay < .95)
const {chromium}=require('playwright');const URL=process.env.URL||'http://localhost:8766/index.html';
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const p=await(await b.newContext()).newPage();
await p.goto(URL);await p.waitForTimeout(800);await p.evaluate(()=>{AC.resume();window.__an=AC.createAnalyser();__an.fftSize=2048;SAT.connect(__an)});
for(const spec of process.argv.slice(2)){const [n,cnt='1',ms='0']=spec.split(':');
const peak=await p.evaluate(async([n,cnt,ms])=>{const d=new Float32Array(2048);let m=0;const t0=performance.now();
 if(cnt===1)SFX[n]();else for(let i=0;i<cnt;i++)setTimeout(()=>SFX[n](i),i*ms);
 const T=2200+cnt*ms;while(performance.now()-t0<T){__an.getFloatTimeDomainData(d);for(const v of d)m=Math.max(m,Math.abs(v));await new Promise(r=>setTimeout(r,8))}return m},[n,+cnt,+ms]);
console.log(spec,peak.toFixed(3),peak>.95?'TOO LOUD':'ok')}
await b.close()})();
