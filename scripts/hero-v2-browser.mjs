// Owner browser checks. Requires Playwright externally; no application dependency.
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const { chromium, webkit } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const url = process.env.HERO_URL || 'http://127.0.0.1:4179/';
const directory = fileURLToPath(new URL('../docs/website/hero-visual-v2/evidence/', import.meta.url));
await mkdir(directory, { recursive: true });
const results = []; const failures = [];
function check(condition, message) { if (!condition) failures.push(message); }
const sizes = [[1440,900],[1280,800],[1024,768],[768,1024],[430,932],[390,844],[320,568]];
const instrument = () => {
  document.addEventListener('pointermove',e=>{window.__lastPointer={x:e.clientX,y:e.clientY};},true);
  window.__heroDraws = 0; window.__heroFrame = { rects: [], arcs: [] }; window.__durations = [];
  let started = 0; let ended = 0;
  const proto = CanvasRenderingContext2D.prototype;
  for (const method of ['clearRect','arc','strokeRect','stroke','fill']) {
    const original = proto[method];
    proto[method] = function(...args) {
      if (this.canvas.classList.contains('hero-knowledge__canvas')) {
        if (method === 'clearRect') {
          if (started && ended >= started) window.__durations.push(ended - started);
          started = performance.now(); window.__heroDraws++; window.__heroFrame = { rects: [], arcs: [] };
        } else if (method === 'strokeRect') window.__heroFrame.rects.push(args);
        else if (method === 'arc') window.__heroFrame.arcs.push(args);
        ended = performance.now();
      }
      return original.apply(this, args);
    };
  }
  window.__vitals = { lcp: 0, cls: 0 };
  try { new PerformanceObserver(list => { for (const e of list.getEntries()) window.__vitals.lcp = e.startTime; }).observe({type:'largest-contentful-paint',buffered:true}); } catch {}
  try { new PerformanceObserver(list => { for (const e of list.getEntries()) if (!e.hadRecentInput) window.__vitals.cls += e.value; }).observe({type:'layout-shift',buffered:true}); } catch {}
};
for (const [name,engine,executablePath] of [['chromium',chromium,process.env.CHROMIUM_EXECUTABLE],['webkit',webkit,process.env.WEBKIT_EXECUTABLE]]) {
  const browser = await engine.launch({headless:true,...(executablePath ? {executablePath} : {})});
  for (const [width,height] of sizes) {
    const mobile = width <= 780;
    const page = await browser.newPage({viewport:{width,height},deviceScaleFactor:mobile?2:1,isMobile:mobile,hasTouch:mobile});
    await page.addInitScript(instrument);
    const errors = []; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error') errors.push(m.text());});
    await page.goto(url,{waitUntil:'networkidle'}); await page.waitForTimeout(1800);
    const label = `${name}-${width}x${height}`;
    const geometry = await page.evaluate(() => {
      const rect = selector => document.querySelector(selector).getBoundingClientRect().toJSON();
      return {hero:rect('.hero-section'),copy:rect('.hero-section__copy'),mark:rect('.hero-section__mark'),overflow:document.documentElement.scrollWidth>innerWidth,mode:document.querySelector('.hero-knowledge').dataset.renderMode,vitals:window.__vitals,brokenLinks:[...document.querySelectorAll('a[href^="#"]')].filter(a=>!document.getElementById(a.hash.slice(1))).length};
    });
    check(!geometry.overflow,`${label}: horizontal overflow`); check(geometry.brokenLinks===0,`${label}: broken anchor`);
    await page.screenshot({path:`${directory}v2-${label}.png`});
    const actions = page.locator('.hero-section__actions a');
    for (let i=0;i<await actions.count();i++) {
      await actions.nth(i).scrollIntoViewIfNeeded();
      const reachable = await actions.nth(i).evaluate(a=>{const r=a.getBoundingClientRect();return a.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));});
      check(reachable,`${label}: CTA ${i} obstructed`);
    }
    await page.evaluate(()=>scrollTo(0,0)); await page.waitForTimeout(400);
    let pointerResult = null;
    if (!mobile) {
      const rects = await page.evaluate(()=>window.__heroFrame.rects);
      const index = rects.findIndex(r=>r[0]>width*0.46&&r[0]<width-85&&r[1]>120&&r[1]<height-90);
      check(index>=0,`${label}: no visible evidence node to exercise`);
      if(index>=0) {
        const before = rects[index];
        if(width===1440&&name==='chromium') await page.screenshot({path:`${directory}cursor-before.png`});
        await page.mouse.move(before[0]+42,before[1]+2,{steps:8}); await page.waitForTimeout(450);
        const after = await page.evaluate(i=>({node:window.__heroFrame.rects[i],dataset:{...document.querySelector('.hero-knowledge').dataset},mark:document.querySelector('.hero-section__mark').getBoundingClientRect().toJSON()}),index);
        const displacement = Math.hypot(after.node[0]-before[0],after.node[1]-before[1]);
        pointerResult = {nodeIndex:index,displacementCssPixels:displacement,before:before.slice(0,2),after:after.node.slice(0,2),active:after.dataset.pointerActive};
        check(displacement>7.5&&displacement<23,`${label}: cursor displacement ${displacement}`);
        check(after.dataset.pointerActive==='true',`${label}: pointer gate did not activate`);
        check(Math.abs(after.mark.x-geometry.mark.x)<0.1,`${label}: core moved with pointer`);
        if(width===1440&&name==='chromium') await page.screenshot({path:`${directory}cursor-after.png`});
        await page.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';scrollTo(0,120);}); await page.waitForTimeout(150);
        await page.mouse.move(before[0]+42,before[1]-118); await page.waitForTimeout(180);
        const mapped = await page.evaluate(()=>{const r=document.querySelector('.hero-knowledge');const box=r.getBoundingClientRect();return {y:Number(r.dataset.pointerY),expected:(window.__lastPointer.y-box.top)*Math.round(box.height)/box.height};});
        pointerResult.scrollMappingError = Math.abs(mapped.y-mapped.expected);
        check(pointerResult.scrollMappingError<0.2,`${label}: scrolled pointer mapping`);
      }
    }
    await page.evaluate(()=>scrollTo(0,0)); await page.waitForTimeout(150);
    await page.emulateMedia({reducedMotion:'reduce'}); await page.waitForTimeout(200);
    const staticBefore = await page.locator('.hero-knowledge canvas').evaluate(c=>c.toDataURL());
    const staticCount = await page.evaluate(()=>window.__heroDraws);
    await page.mouse.move(width*0.75,height*0.5); await page.waitForTimeout(350);
    const staticAfter = await page.locator('.hero-knowledge canvas').evaluate(c=>c.toDataURL());
    const reduced = await page.evaluate(()=>({frames:window.__heroDraws,mode:document.querySelector('.hero-knowledge').dataset.renderMode,running:document.querySelector('.hero-section').getAnimations({subtree:true}).filter(a=>a.playState==='running').length}));
    check(staticBefore===staticAfter&&reduced.frames===staticCount,`${label}: reduced motion repaints`);
    check(reduced.mode==='reduced-motion'&&reduced.running===0,`${label}: reduced motion incomplete`);
    if(width===390&&name==='webkit') await page.screenshot({path:`${directory}reduced-motion-mobile.png`});
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.evaluate(()=>scrollTo(0,document.body.scrollHeight)); await page.waitForTimeout(300);
    const offscreenCount = await page.evaluate(()=>window.__heroDraws); await page.waitForTimeout(250);
    const offscreenPaused = offscreenCount===await page.evaluate(()=>window.__heroDraws);
    check(offscreenPaused,`${label}: offscreen repaints`);
    await page.evaluate(()=>scrollTo(0,0)); await page.waitForTimeout(200);
    await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
    const hiddenCount=await page.evaluate(()=>window.__heroDraws); await page.waitForTimeout(250);
    const syntheticVisibilityPaused=hiddenCount===await page.evaluate(()=>window.__heroDraws);
    check(syntheticVisibilityPaused,`${label}: visibility handler did not stop animation`);
    await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));}); await page.waitForTimeout(200);
    const resumed=hiddenCount<await page.evaluate(()=>window.__heroDraws);
    check(resumed,`${label}: animation did not resume`);
    let menu='desktop navigation';
    if(width<=1000) {
      const toggle=page.getByRole('button',{name:'Open navigation menu'});
      await toggle.click();
      check(await page.getByRole('button',{name:'Close navigation menu'}).count()>0,`${label}: menu did not open`);
      await page.keyboard.press('Escape');
      check(await toggle.getAttribute('aria-expanded')==='false',`${label}: Escape did not close menu`);
      check(await toggle.evaluate(e=>document.activeElement===e),`${label}: focus not restored`);
      await toggle.click();
      await page.locator('#mobile-navigation nav a[href="#work"]').click();
      check(await toggle.getAttribute('aria-expanded')==='false',`${label}: navigation did not close menu`);
      menu='open, Escape, focus restoration, Work navigation passed';
    }
    const timing=await page.evaluate(()=>{const a=window.__durations.sort((a,b)=>a-b);return {samples:a.length,medianDrawMs:a[Math.floor(a.length/2)],p95DrawMs:a[Math.floor(a.length*0.95)]};});
    check(errors.length===0,`${label}: console/page errors ${errors.join(';')}`);
    results.push({label,geometry,pointer:pointerResult,reducedMotionPixelIdentical:staticBefore===staticAfter,offscreenPaused,syntheticVisibilityPaused,resumed,menu,timing,errors});
    console.log(label,'checked'); await page.close();
  }
  // Loading without JavaScript and losing Canvas both retain a composed static fallback.
  for(const fallback of ['no-javascript','no-canvas','save-data','low-core']) {
    const page=await browser.newPage({viewport:{width:390,height:844},javaScriptEnabled:fallback!=='no-javascript'});
    if(fallback==='no-canvas') await page.addInitScript(()=>{HTMLCanvasElement.prototype.getContext=()=>null;});
    if(fallback==='save-data') await page.addInitScript(()=>{const c=new EventTarget();c.saveData=true;Object.defineProperty(navigator,'connection',{get:()=>c});});
    if(fallback==='low-core') await page.addInitScript(()=>Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>2}));
    await page.goto(url,{waitUntil:'networkidle'});
    check(await page.locator('h1').count()===1,`${name} ${fallback}: no heading`);
    if(fallback==='no-javascript'||fallback==='no-canvas') check(await page.locator('.hero-knowledge__fallback').isVisible(),`${name} ${fallback}: fallback absent`);
    else check(await page.locator('.hero-knowledge').getAttribute('data-render-mode')==='static-budget',`${name} ${fallback}: budget not honored`);
    results.push({label:`${name}-${fallback}`,fallback:true}); await page.close();
  }
  await browser.close();
}
await writeFile(`${directory}browser-results.json`,JSON.stringify({url,results,failures},null,2)+'\n');
console.log(JSON.stringify({cases:results.length,failures},null,2));
if(failures.length) process.exitCode=1;
