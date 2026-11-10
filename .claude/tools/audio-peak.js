// usage: node audio-peak.js chime key burst ...   (SFX names)  -> prints peak after the master saturator
const {chromium}=require('playwright');const URL=process.env.URL||'http://localhost:8766/index.html';
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const p=await(await b.newContext()).newPage();
await p.goto(URL);await p.waitForTimeout(800);await p.evaluate(()=>{AC.resume();window.__an=AC.createAnalyser();__an.fftSize=2048;SAT.connect(__an)});
for(const n of process.argv.slice(2)){const peak=await p.evaluate(async n=>{const d=new Float32Array(2048);let m=0;const t0=performance.now();SFX[n]();while(performance.now()-t0<2200){__an.getFloatTimeDomainData(d);for(const v of d)m=Math.max(m,Math.abs(v));await new Promise(r=>setTimeout(r,8))}return m},n);console.log(n,peak.toFixed(3),peak>.95?'TOO LOUD':'ok')}
await b.close()})();
