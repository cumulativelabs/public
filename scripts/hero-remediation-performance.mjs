// Repeatable local comparison, not a field Core Web Vitals or battery certification.
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{})});
const samples=[];
for(const width of [1440,768,390]) for(let trial=0;trial<3;trial++) for(const [name,url] of [['starting',process.env.BASELINE_URL||'http://127.0.0.1:4180/'],['v2',process.env.HERO_URL||'http://127.0.0.1:4179/']]) {
  const page=await browser.newPage({viewport:{width,height:width===390?844:900},isMobile:width===390,hasTouch:width===390,deviceScaleFactor:width===390?2:1});
  await page.addInitScript(()=>{
    window.__vitals={lcp:0,cls:0};window.__frames=0;
    new PerformanceObserver(l=>{for(const e of l.getEntries())window.__vitals.lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});
    new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__vitals.cls+=e.value;}).observe({type:'layout-shift',buffered:true});
    const clear=CanvasRenderingContext2D.prototype.clearRect;
    CanvasRenderingContext2D.prototype.clearRect=function(...a){if(this.canvas.closest('.hero-section'))window.__frames++;return clear.apply(this,a);};
  });
  const cdp=await page.context().newCDPSession(page);await cdp.send('Performance.enable');
  await page.goto(url,{waitUntil:'networkidle'});await page.waitForTimeout(200);
  const before=await cdp.send('Performance.getMetrics');const frames=await page.evaluate(()=>window.__frames);const start=Date.now();
  await page.waitForTimeout(2000);
  const after=await cdp.send('Performance.getMetrics');const stats=await page.evaluate(()=>({...window.__vitals,frames:window.__frames,heroHeight:document.querySelector('.hero-section').getBoundingClientRect().height,copy:document.querySelector('main').innerText}));
  const metric=(data,key)=>data.metrics.find(m=>m.name===key)?.value||0;
  samples.push({name,width,trial,lcpMs:stats.lcp,cls:stats.cls,heroHeight:stats.heroHeight,framesPerSecond:(stats.frames-frames)/((Date.now()-start)/1000),scriptMsPerSecond:(metric(after,'ScriptDuration')-metric(before,'ScriptDuration'))*500,heapBytes:metric(after,'JSHeapUsedSize'),copy:stats.copy});
  await page.close();
}
await browser.close();
const copyUnchanged=samples.filter(s=>s.name==='starting').every(s=>samples.find(t=>t.name==='v2'&&t.width===s.width&&t.trial===s.trial)?.copy===s.copy);
samples.forEach(s=>delete s.copy);
const report={method:'Fresh Chromium contexts, three alternating local production-build samples per viewport. Two-second idle windows. No network/CPU throttling. Not field data or battery measurement.',copyUnchanged,samples};
await writeFile(process.env.PERFORMANCE_EVIDENCE_FILE,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
