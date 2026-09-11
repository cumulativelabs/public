import {mkdir,writeFile} from 'node:fs/promises';
const {chromium,webkit}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');const out=process.env.TABLET_EVIDENCE_DIR;await mkdir(out,{recursive:true});const results=[];
for(const [name,engine,executablePath] of [['chromium',chromium,process.env.CHROMIUM_EXECUTABLE],['webkit',webkit,process.env.WEBKIT_EXECUTABLE]]) {
 const browser=await engine.launch({executablePath});
 const p=await browser.newPage({viewport:{width:767,height:1024}});await p.goto(process.env.HERO_URL,{waitUntil:'networkidle'});
 for(const width of [767,779,780,781,820,780,430]){await p.setViewportSize({width,height:1024});await p.waitForTimeout(300);const geometry=await p.evaluate(()=>{const e=document.querySelector('.hero-knowledge'),r=e.getBoundingClientRect();return{bounds:r.toJSON(),mask:getComputedStyle(e).maskImage,overflow:document.documentElement.scrollWidth>innerWidth,image:e.querySelector('img').currentSrc};});await p.screenshot({path:`${out}/${name}-resize-${width}.png`});results.push({engine:name,width,geometry});}await p.close();
 for(const kind of ['save-data','low-core','no-js','no-canvas']){
 const page=await browser.newPage({viewport:{width:390,height:844},javaScriptEnabled:kind!=='no-js'});
 await page.addInitScript(k=>{window.__draws=0;const clear=CanvasRenderingContext2D.prototype.clearRect;CanvasRenderingContext2D.prototype.clearRect=function(...a){if(this.canvas.classList.contains('hero-knowledge__canvas'))window.__draws++;return clear.apply(this,a)};if(k==='save-data')Object.defineProperty(navigator,'connection',{value:Object.assign(new EventTarget(),{saveData:true})});if(k==='low-core')Object.defineProperty(navigator,'hardwareConcurrency',{value:2});if(k==='no-canvas')HTMLCanvasElement.prototype.getContext=()=>null;},kind);
 await page.goto(process.env.HERO_URL,{waitUntil:'networkidle'});await page.waitForTimeout(200);
 const sample=()=>page.evaluate(()=>({draws:window.__draws||0,pixels:document.querySelector('canvas.hero-knowledge__canvas').toDataURL(),mode:document.querySelector('.hero-knowledge').dataset.renderMode,fallback:getComputedStyle(document.querySelector('.hero-knowledge__fallback')).display}));
 const a=await sample();await page.waitForTimeout(800);const b=await sample();await page.screenshot({path:`${out}/${name}-${kind}.png`});results.push({engine:name,kind,drawsDelta:b.draws-a.draws,pixelsStable:a.pixels===b.pixels,mode:a.mode,fallback:a.fallback});await page.close();
 }
 await browser.close();
}
await writeFile(`${out}/tablet-results.json`,JSON.stringify(results,null,2)+'\n');
