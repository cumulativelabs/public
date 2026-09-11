import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {sampleContrast} from './contrast-sample.mjs';
const {chromium,webkit}=await import(process.env.PLAYWRIGHT_MODULE);
const out=new URL('.',import.meta.url).pathname;await mkdir(out+'contrast',{recursive:true});await mkdir(out+'supplemental',{recursive:true});
const result={contrast:[],keyboard:[],static:[],performance:[],spot:[],errors:[],requests:[],failures:[]};
const save=()=>writeFile(out+'supplemental-results.json',JSON.stringify(result,null,2)+'\n');
const check=(ok,label)=>{if(!ok)result.failures.push(label)};
const instrument=()=>{window.__qa={freeze:false,draws:0,tether:0,cls:0};const raf=window.requestAnimationFrame;window.requestAnimationFrame=cb=>raf.call(window,t=>{if(!window.__qa.freeze)cb(t)});const clear=CanvasRenderingContext2D.prototype.clearRect;CanvasRenderingContext2D.prototype.clearRect=function(...a){if(this.canvas.classList.contains('hero-knowledge__canvas'))window.__qa.draws++;if(this.canvas.classList.contains('hero-knowledge__tethers'))window.__qa.tether++;return clear.apply(this,a)};try{new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__qa.cls+=e.value}).observe({type:'layout-shift',buffered:true})}catch{}};
const candidate=process.env.HERO_URL,baseline=process.env.BASELINE_URL;
for(const [name,engine,executablePath] of [['chromium',chromium,process.env.CHROMIUM_EXECUTABLE],['webkit',webkit,process.env.WEBKIT_EXECUTABLE]]){
 const browser=await engine.launch({executablePath});
 // Contrast captures use only actual normal-motion production rendering, then freeze callbacks.
 for(const [width,height,label,x,dy] of [[1440,900,'center150',150,0],[1440,900,'center280',280,0],[1440,900,'upper',150,-210],[1440,900,'lower',120,280],[1024,768,'center280',280,0]]){
  const p=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});await p.addInitScript(instrument);p.on('pageerror',e=>result.errors.push({name,label,message:e.message}));
  await p.goto(candidate,{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);
  const cy=await p.locator('.hero-section__mark').evaluate(e=>{const r=e.getBoundingClientRect();return r.y+r.height/2});await p.mouse.move(x,Math.min(height-70,cy+dy));await p.waitForTimeout(1200);
  const data=await p.evaluate(()=>{window.__qa.freeze=true;const e=document.querySelector('.hero-knowledge');return{...e.dataset,fonts:document.fonts.status}});await p.waitForTimeout(80);
  const measured=await sampleContrast(p,out+'contrast',`${name}-${width}-${label}`);result.contrast.push({engine:name,width,height,label,data,measured});check(measured.every(m=>m.meetsSampledThreshold),`${name} ${width} ${label}: contrast`);await save();await p.close();console.log(name,'contrast',width,label);
 }
 // Menu behavior compared against the exact read-only production build; real keyboard entry/trap/exit.
 for(const [build,url] of [['baseline',baseline],['candidate',candidate]])for(const reducedMotion of ['reduce','no-preference']){
  const p=await browser.newPage({viewport:{width:390,height:844},reducedMotion});await p.goto(url,{waitUntil:'networkidle'});await p.bringToFront();const toggle=p.getByRole('button',{name:'Open navigation menu'});await toggle.focus();await p.keyboard.press('Enter');await p.waitForTimeout(600);
  const initial=await p.evaluate(()=>({tag:document.activeElement.tagName,name:document.activeElement.getAttribute('aria-label'),text:document.activeElement.textContent?.trim().slice(0,50),inMenu:!!document.activeElement.closest('.mobile-navigation'),inert:document.querySelector('main').inert}));
  const sequence=[];for(let i=0;i<8;i++){await p.keyboard.press(name==='webkit'?'Alt+Tab':'Tab');sequence.push(await p.evaluate(()=>({tag:document.activeElement.tagName,name:document.activeElement.getAttribute('aria-label')||document.activeElement.textContent?.trim().slice(0,45),inMenu:!!document.activeElement.closest('.mobile-navigation')})))}
  await p.keyboard.press('Escape');const exit=await toggle.evaluate(e=>({restored:e===document.activeElement,expanded:e.getAttribute('aria-expanded'),inert:document.querySelector('main').inert}));
  if(build==='candidate'){check(exit.restored&&exit.expanded==='false'&&!exit.inert,`${name} ${reducedMotion}: menu escape`);check(sequence.every(s=>s.inMenu),`${name} ${reducedMotion}: menu traversal`)}
  result.keyboard.push({engine:name,build,reducedMotion,initial,sequence,exit});await p.close();await save();
 }
 // Reduced motion has deterministic real-rendered pixels; compare both origins without scene replacement.
 for(const [width,height] of [[768,1024],[430,932],[390,844],[320,568]]){
  const hashes={};for(const [build,url] of [['baseline',baseline],['candidate',candidate]]){
   const p=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,isMobile:true,hasTouch:true,reducedMotion:'reduce'});await p.goto(url,{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(200);const buffer=await p.screenshot({path:out+`supplemental/${name}-${build}-${width}-static.png`});hashes[build]=createHash('sha256').update(buffer).digest('hex');await p.close();
  }result.static.push({engine:name,width,height,hashes,equal:hashes.baseline===hashes.candidate});check(hashes.baseline===hashes.candidate,`${name} ${width}: static baseline parity`);await save();
 }
 // Fresh hosted DPR2 page, resize across portal breakpoint, scroll, delayed-font alignment, CTA hits and axe.
 const p=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:2});await p.addInitScript(instrument);p.on('pageerror',e=>result.errors.push({name,label:'spot',message:e.message}));p.on('console',m=>{if(m.type()==='error')result.errors.push({name,label:'spot-console',message:m.text()})});p.on('request',r=>{const u=new URL(r.url());if(!['data:','blob:'].includes(u.protocol)&&!result.requests.includes(u.origin))result.requests.push(u.origin)});
 await p.goto('https://a8683876.cumulative-labs.pages.dev/',{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);await p.mouse.move(280,418);await p.waitForTimeout(1100);await p.screenshot({path:out+`supplemental/${name}-hosted-dpr2.png`});
 for(const [width,height] of [[768,1024],[1024,768]]){await p.setViewportSize({width,height});await p.waitForTimeout(400)}
 await p.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';scrollTo(0,140)});await p.waitForTimeout(250);await p.mouse.move(150,260);await p.waitForTimeout(1100);await p.screenshot({path:out+`supplemental/${name}-resized-scrolled.png`});
 const spot=await p.evaluate(()=>{const r=document.querySelector('.hero-knowledge').getBoundingClientRect(),c=document.querySelector('.hero-knowledge__tethers').getBoundingClientRect(),e=document.querySelector('.hero-knowledge');return{data:{...e.dataset},offset:{x:c.x-r.x,y:c.y-r.y},overflow:document.documentElement.scrollWidth>innerWidth,fonts:document.fonts.status,maskPresent:getComputedStyle(document.querySelector('.hero-knowledge__tethers')).maskImage!=='none'}});check(!spot.overflow&&Math.abs(spot.offset.x)<.5&&Math.abs(spot.offset.y)<.5,`${name}: resize scroll layer alignment`);check(Math.hypot(+spot.data.intakePointerX+await p.locator('.hero-knowledge').evaluate(e=>e.getBoundingClientRect().x)-150,+spot.data.intakePointerY+await p.locator('.hero-knowledge').evaluate(e=>e.getBoundingClientRect().y)-260)<1,`${name}: scrolled pointer mapping`);
 await p.addScriptTag({content:await readFile(process.env.AXE_PATH,'utf8')});const axe=await p.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return{violations:r.violations.map(v=>({id:v.id,impact:v.impact,targets:v.nodes.map(n=>n.target)})),incomplete:r.incomplete.map(v=>v.id)}});check(!axe.violations.length,`${name}: axe violations`);result.spot.push({engine:name,...spot,axe});await save();await p.close();
 // Explicit no-canvas fallback ordinary image for visual inspection.
 const f=await browser.newPage({viewport:{width:390,height:844}});await f.addInitScript(()=>HTMLCanvasElement.prototype.getContext=()=>null);await f.goto(candidate,{waitUntil:'networkidle'});await f.screenshot({path:out+`supplemental/${name}-no-canvas.png`});await f.close();
 if(name==='chromium'){
  for(const [build,url] of [['baseline',baseline],['candidate',candidate]]){
   const p=await browser.newPage({viewport:{width:1440,height:900}});await p.addInitScript(instrument);const cdp=await p.context().newCDPSession(p);await cdp.send('Performance.enable');await p.goto(url,{waitUntil:'networkidle'});await p.mouse.move(150,431);await p.waitForTimeout(1200);
   for(const state of ['active','offscreen','hidden']){
    if(state==='offscreen')await p.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';scrollTo(0,document.body.scrollHeight)});
    if(state==='hidden')await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))});await p.waitForTimeout(250);
    const a=await cdp.send('Performance.getMetrics'),qa=await p.evaluate(()=>({...window.__qa}));await p.waitForTimeout(2000);const b=await cdp.send('Performance.getMetrics'),qb=await p.evaluate(()=>({...window.__qa,data:{...document.querySelector('.hero-knowledge').dataset}}));const m=(d,k)=>d.metrics.find(x=>x.name===k)?.value??0;
    result.performance.push({build,state,scriptMsPerSecond:(m(b,'ScriptDuration')-m(a,'ScriptDuration'))*500,layoutCount:m(b,'LayoutCount')-m(a,'LayoutCount'),draws:qb.draws-qa.draws,tether:qb.tether-qa.tether,cls:qb.cls,mode:qb.data.renderMode,quality:qb.data.quality??'normal'});if(build==='candidate')check(qb.cls===0&&(state==='active'||qb.draws===qa.draws&&qb.tether===qa.tether),`performance ${state}: shift or paused draw`);await save();
   }await p.close();
  }
 }
 await browser.close();
}
check(!result.errors.length,'browser errors');await save();console.log(JSON.stringify({contrastStates:result.contrast.length,failures:result.failures}));if(result.failures.length)process.exitCode=1;
