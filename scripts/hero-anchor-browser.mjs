// Actual SVG-art, rendered Canvas-ring, and logo alignment. External Playwright only.
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const { chromium, webkit } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const url = process.env.HERO_URL || 'http://127.0.0.1:4191/';
const out = process.env.ANCHOR_EVIDENCE_DIR || fileURLToPath(new URL('../docs/website/hero-visual-v2/anchor-fix/', import.meta.url));
await mkdir(out, { recursive: true });
const results = [], failures = [];
const check = (ok, message) => { if (!ok) failures.push(message); };
const instrument = () => {
  window.__nexus = { arcs: [], draws: 0 };
  const p = CanvasRenderingContext2D.prototype, clear = p.clearRect, arc = p.arc;
  p.clearRect = function(...args) { if (this.canvas.classList.contains('hero-knowledge__canvas')) { window.__nexus.arcs = []; window.__nexus.draws++; } return clear.apply(this,args); };
  p.arc = function(...args) { if (this.canvas.classList.contains('hero-knowledge__canvas')) window.__nexus.arcs.push(args); return arc.apply(this,args); };
};
const measure = async page => page.evaluate(async () => {
  const field = document.querySelector('.hero-knowledge'), image = field.querySelector('picture img');
  const logo = document.querySelector('.hero-section__mark .brand-symbol').getBoundingClientRect();
  const mark = document.querySelector('.hero-section__mark'), markBox = mark.getBoundingClientRect();
  const rect = image.getBoundingClientRect(), canvas = field.querySelector('canvas').getBoundingClientRect();
  const art = new DOMParser().parseFromString(await (await fetch(image.currentSrc)).text(), 'image/svg+xml');
  const svg = art.documentElement, vb = svg.getAttribute('viewBox').split(' ').map(Number);
  const axis = { x: Number(svg.dataset.nexusCx), y: Number(svg.dataset.nexusCy) };
  const center = { x: logo.x + logo.width / 2, y: logo.y + logo.height / 2 };
  const project = (x,y) => ({ x: rect.x + x / vb[2] * rect.width, y: rect.y + y / vb[3] * rect.height });
  const delta = p => Math.hypot(p.x - center.x, p.y - center.y);
  const mapped = project(axis.x, axis.y), inlet = art.querySelector('#nexus-inlet-glow');
  const flare = project(Number(inlet.getAttribute('cx')),Number(inlet.getAttribute('cy')));
  const nativePortRadius = axis.x - Number(svg.dataset.nexusInlet);
  const scale = canvas.width / vb[2] * nativePortRadius / 76;
  const rings = window.__nexus.arcs.filter(a => Math.abs(a[2]-76*scale)<0.05);
  const allRings = window.__nexus.arcs.filter(a => [76,85.5,95,104.5,114,123.5].some(r=>Math.abs(a[2]-r*scale)<0.05));
  const coreOffset = allRings.map(a=>delta({x:canvas.x+a[0],y:canvas.y+a[1]}));
  const fallback = field.querySelector('svg.hero-knowledge__fallback');
  const transform = fallback.getScreenCTM();
  return { center, artCenter:mapped, artOffset:delta(mapped), flare, flareAxisOffset:Math.abs(flare.y-center.y), flarePortError:Math.abs(flare.x-(center.x-76*scale)), ringCount:rings.length, permanentRings:allRings.length, ringOffsets:coreOffset, fallbackOffset:transform?delta({x:transform.e,y:transform.f}):null, overflow:document.documentElement.scrollWidth>innerWidth, extraCssRing:getComputedStyle(mark,'::after').content, ready:field.dataset.ready, mode:field.dataset.renderMode, image:image.currentSrc, draws:window.__nexus.draws };
});
const verify = (m,label,paint=true) => {
  check(m.artOffset<0.5,`${label}: art offset ${m.artOffset}`);
  check(m.flareAxisOffset<0.5&&m.flarePortError<0.5,`${label}: intake mismatch`);
  check(!m.overflow,`${label}: overflow`);
  check(m.extraCssRing==='none',`${label}: duplicate CSS ring`);
  if(paint) check(m.permanentRings===6&&m.ringOffsets.every(n=>n<0.5),`${label}: painted ring centers/count`);
  else check(m.fallbackOffset<0.5,`${label}: fallback center`);
};
for(const [engineName,engine,exe] of [['chromium',chromium,process.env.CHROMIUM_EXECUTABLE],['webkit',webkit,process.env.WEBKIT_EXECUTABLE]]) {
  const browser=await engine.launch({headless:true,...(exe?{executablePath:exe}:{})});
  for(const [width,height] of [[1440,900],[1280,800],[1024,768],[768,1024],[430,932],[390,844],[320,568]]) {
    const mobile=width<=780, label=`${engineName}-${width}x${height}`;
    const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:mobile?2:1,isMobile:mobile,hasTouch:mobile});
    await page.addInitScript(instrument); const errors=[];
    page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    const response=await page.goto(url,{waitUntil:'networkidle'});await page.waitForTimeout(180);
    const initial=await measure(page);verify(initial,label);
    if(width===1440||width===390||width===430) await page.screenshot({path:`${out}/after-${label}.png`});
    if(width===390&&engineName==='webkit') {
      await page.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';scrollTo(0,document.querySelector('.hero-section__body').getBoundingClientRect().top-100);});
      await page.waitForTimeout(120);await page.screenshot({path:`${out}/after-mobile-scrolled.png`});
      verify(await measure(page),label+' scrolled');
    }
    const buttons=page.locator('.hero-section__actions a');
    for(let i=0;i<await buttons.count();i++) {
      await buttons.nth(i).scrollIntoViewIfNeeded();
      check(await buttons.nth(i).evaluate(a=>{const r=a.getBoundingClientRect();return a.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}),`${label}: CTA obstructed`);
    }
    await page.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';scrollTo(0,0);});await page.waitForTimeout(80);
    let pointer=null;
    if(!mobile) {
      const c=initial.center; await page.mouse.move(c.x-130,c.y-20,{steps:8});await page.waitForTimeout(200);
      pointer=await page.locator('.hero-knowledge').evaluate(e=>({active:e.dataset.pointerActive,x:Number(e.dataset.pointerX),y:Number(e.dataset.pointerY),left:e.getBoundingClientRect().left,top:e.getBoundingClientRect().top}));
      check(pointer.active==='true'&&Math.abs(pointer.x-(Math.floor(c.x-130)-pointer.left))<1.2,`${label}: pointer mapping`);
      verify(await measure(page),label+' pointer');
    }
    await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(150);
    const reducedBefore=await page.locator('.hero-knowledge canvas').evaluate(c=>c.toDataURL());
    const draws=await page.evaluate(()=>window.__nexus.draws);await page.waitForTimeout(180);
    check(draws===await page.evaluate(()=>window.__nexus.draws),`${label}: reduced motion redrawing`);
    check(reducedBefore===await page.locator('.hero-knowledge canvas').evaluate(c=>c.toDataURL()),`${label}: reduced motion pixel change`);
    verify(await measure(page),label+' reduced');
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
    const hiddenDraws=await page.evaluate(()=>window.__nexus.draws);await page.waitForTimeout(150);
    check(hiddenDraws===await page.evaluate(()=>window.__nexus.draws),`${label}: hidden redraw`);
    await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
    await page.evaluate(()=>scrollTo(0,document.body.scrollHeight));await page.waitForTimeout(180);
    const offscreenDraws=await page.evaluate(()=>window.__nexus.draws);await page.waitForTimeout(150);
    check(offscreenDraws===await page.evaluate(()=>window.__nexus.draws),`${label}: offscreen redraw`);
    await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(100);
    if(width===390) {
      await page.evaluate(()=>{document.querySelector('.hero-section__body').append(document.createElement('br'),document.createTextNode('Temporary browser-test line wrap.'));});
      await page.waitForTimeout(100);verify(await measure(page),label+' copy-height change');
      await page.setViewportSize({width:844,height:390});await page.waitForTimeout(150);verify(await measure(page),label+' orientation change');
      await page.setViewportSize({width,height});await page.waitForTimeout(150);
      await page.evaluate(()=>{document.querySelector('.hero-section__body').style.fontSize='1.25rem';});await page.waitForTimeout(100);verify(await measure(page),label+' text resize');
    }
    if(width<=1000) {
      const toggle=page.getByRole('button',{name:'Open navigation menu'});await toggle.click();await page.keyboard.press('Escape');
      check(await toggle.getAttribute('aria-expanded')==='false',`${label}: menu Escape`);
      check(await toggle.evaluate(e=>document.activeElement===e),`${label}: menu focus restoration`);
    }
    check(errors.length===0,`${label}: browser errors ${errors.join('; ')}`);
    results.push({label,status:response.status(),noindex:(await response.allHeaders())['x-robots-tag'],initial,pointer,errors});
    console.log(label);await page.close();
  }
  for(const kind of ['no-js','no-canvas']) {
    const page=await browser.newPage({viewport:{width:390,height:844},javaScriptEnabled:kind!=='no-js'});
    await page.addInitScript(instrument);
    if(kind==='no-canvas')await page.addInitScript(()=>{HTMLCanvasElement.prototype.getContext=()=>null;});
    await page.goto(url,{waitUntil:'networkidle'});
    if(kind==='no-js')await page.evaluate(()=>{window.__nexus={arcs:[],draws:0};});
    const geometry=await measure(page);verify(geometry,engineName+' '+kind,false);
    check(await page.locator('.hero-knowledge__fallback').isVisible(),engineName+' '+kind+' fallback absent');
    results.push({label:engineName+' '+kind,geometry});await page.close();
  }
  await browser.close();
}
await writeFile(`${out}/browser-results.json`,JSON.stringify({url,results,failures},null,2)+'\n');
console.log(JSON.stringify({cases:results.length,failures},null,2));if(failures.length)process.exitCode=1;
