import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {sampleContrast} from './contrast.mjs';
const {chromium,webkit}=await import(process.env.PLAYWRIGHT_MODULE);
const out=new URL('.',import.meta.url).pathname;await mkdir(out+'supplemental',{recursive:true});
const result={assets:[],predecessorAssets:[],hosted:[],negativeControl:[],static:[],keyboard:[],performance:[],errors:[],failures:[]};
const save=()=>writeFile(out+'supplemental-results.json',JSON.stringify(result,null,2)+'\n');
const check=(ok,label)=>{if(!ok)result.failures.push(label)};
const sha=b=>createHash('sha256').update(b).digest('hex');
const candidate=process.env.HERO_URL,before='http://127.0.0.1:4322/',hosted='https://5b0eeaaa.cumulative-labs.pages.dev/';
const freeze=()=>{window.__freeze=false;const raf=requestAnimationFrame;window.requestAnimationFrame=cb=>raf.call(window,t=>{if(!window.__freeze)cb(t)})};
for(const [name,engine,executablePath] of [['chromium',chromium,process.env.CHROMIUM_EXECUTABLE],['webkit',webkit,process.env.WEBKIT_EXECUTABLE]]){
 const browser=await engine.launch({executablePath});
 if(name==='chromium'){
  const p=await browser.newPage();
  const manifest=JSON.parse(await readFile(process.env.PRIOR_MANIFEST,'utf8'));
  for(const a of manifest){const r=await p.request.get(before+(a.path==='index.html'?'':a.path));const data=await r.body();result.predecessorAssets.push({path:a.path,status:r.status(),sha256:sha(data),expected:a.sha256,equal:sha(data)===a.sha256});}check(result.predecessorAssets.every(x=>x.equal),'predecessor asset identity');
  const creator=JSON.parse(await readFile('docs/website/hero-desktop-intake-polish/fan-correction/dpr-mask-remediation/build-assets.json','utf8'));
  for(const a of creator){const local=await readFile('dist/'+a.path);const r=await p.request.get(hosted+(a.path==='index.html'?'':a.path));const remote=await r.body();result.assets.push({path:a.path,status:r.status(),noindex:r.headers()['x-robots-tag'],localSha256:sha(local),remoteSha256:sha(remote),equal:local.equals(remote),creatorCrosscheck:sha(local)===a.sha256});}
  check(result.assets.every(x=>x.equal),'hosted asset identity');check(result.assets.find(x=>x.path==='index.html')?.noindex?.includes('noindex'),'hosted noindex');await save();await p.close();
 }
 for(const [build,url] of [['predecessor',before],['hosted',hosted]]){
  const p=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:2,reducedMotion:'no-preference'});await p.addInitScript(freeze);const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  const response=await p.goto(url,{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);await p.mouse.move(120,711);await p.waitForTimeout(1300);await p.evaluate(()=>window.__freeze=true);await p.waitForTimeout(80);
  const measured=await sampleContrast(p,out+'supplemental',`${name}-${build}-lower`);const row={engine:name,version:browser.version(),origin:url,status:response.status(),noindex:response.headers()["x-robots-tag"],measured,errors};
  result[build==='predecessor'?'negativeControl':'hosted'].push(row);if(build==='hosted'){check(measured.every(x=>x.meetsSampledThreshold),'hosted contrast '+name);check(!errors.length,'hosted browser errors '+name)}else check(measured.some(x=>x.selector==='.hero-section__body'&&!x.meetsSampledThreshold),'predecessor negative control '+name);await save();await p.close();
 }
 for(const [width,height] of [[768,1024],[430,932],[390,844],[320,568]]){
  const hashes={};for(const [build,url] of [['predecessor',before],['candidate',candidate]]){
   const p=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,isMobile:true,hasTouch:true,reducedMotion:'reduce'});await p.goto(url,{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(200);
   const buf=await p.screenshot();hashes[build]=sha(buf);if(build==='candidate'&&[390,768].includes(width))await writeFile(out+`supplemental/${name}-${width}-static.png`,buf);await p.close();
  }result.static.push({engine:name,width,height,hashes,equal:hashes.predecessor===hashes.candidate});check(hashes.predecessor===hashes.candidate,`${name} ${width} static parity`);await save();
 }
 for(const reducedMotion of ['reduce','no-preference']){
  const p=await browser.newPage({viewport:{width:390,height:844},reducedMotion});await p.goto(candidate,{waitUntil:'networkidle'});await p.bringToFront();const toggle=p.getByRole('button',{name:'Open navigation menu'});await toggle.focus();await p.keyboard.press('Enter');await p.waitForTimeout(600);
  const initial=await p.evaluate(()=>({tag:document.activeElement.tagName,inMenu:!!document.activeElement.closest('.mobile-navigation'),inert:document.querySelector('main').inert}));
  const sequence=[];for(let i=0;i<8;i++){await p.keyboard.press(name==='webkit'?'Alt+Tab':'Tab');sequence.push(await p.evaluate(()=>({tag:document.activeElement.tagName,name:document.activeElement.getAttribute('aria-label')||document.activeElement.textContent?.trim().slice(0,45),inMenu:!!document.activeElement.closest('.mobile-navigation')})))}
  await p.keyboard.press('Escape');const exit=await toggle.evaluate(e=>({restored:e===document.activeElement,expanded:e.getAttribute('aria-expanded'),inert:document.querySelector('main').inert}));
  check(exit.restored&&exit.expanded==='false'&&!exit.inert,`${name} ${reducedMotion} menu escape`);check(sequence.every(s=>s.inMenu),`${name} ${reducedMotion} traversal`);result.keyboard.push({engine:name,reducedMotion,initial,sequence,exit});await save();await p.close();
 }
 if(name==='chromium'){
  const p=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:2});await p.addInitScript(()=>{window.__qa={draws:0,cls:0};const clear=CanvasRenderingContext2D.prototype.clearRect;CanvasRenderingContext2D.prototype.clearRect=function(...a){if(this.canvas.classList.contains('hero-knowledge__tethers'))window.__qa.draws++;return clear.apply(this,a)};new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__qa.cls+=e.value}).observe({type:'layout-shift',buffered:true})});
  const cdp=await p.context().newCDPSession(p);await cdp.send('Performance.enable');await p.goto(candidate,{waitUntil:'networkidle'});await p.mouse.move(150,431);await p.waitForTimeout(1300);
  for(const state of ['active','offscreen','hidden']){
   if(state==='offscreen')await p.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';scrollTo(0,document.body.scrollHeight)});
   if(state==='hidden')await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))});await p.waitForTimeout(250);
   const a=await cdp.send('Performance.getMetrics'),qa=await p.evaluate(()=>({...window.__qa}));await p.waitForTimeout(2000);const b=await cdp.send('Performance.getMetrics'),qb=await p.evaluate(()=>({...window.__qa,data:{...document.querySelector('.hero-knowledge').dataset}}));const m=(d,k)=>d.metrics.find(x=>x.name===k)?.value??0;
   result.performance.push({state,scriptMsPerSecond:(m(b,'ScriptDuration')-m(a,'ScriptDuration'))*500,layoutCount:m(b,'LayoutCount')-m(a,'LayoutCount'),draws:qb.draws-qa.draws,cls:qb.cls,mode:qb.data.renderMode,quality:qb.data.quality??'normal'});check(qb.cls===0&&(state==='active'||qb.draws===qa.draws),`performance ${state}`);await save();
  }await p.close();
 }
 await browser.close();
}
await save();console.log(JSON.stringify({failures:result.failures}));if(result.failures.length)process.exitCode=1;
