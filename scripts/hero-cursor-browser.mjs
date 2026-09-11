const {chromium,webkit}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
import {writeFile} from 'node:fs/promises';
const out=process.env.CURSOR_EVIDENCE_DIR;const results=[];
for(const [name,engine,executablePath] of [['chromium',chromium,process.env.CHROMIUM_EXECUTABLE],['webkit',webkit,process.env.WEBKIT_EXECUTABLE]]){
 const browser=await engine.launch({executablePath});const page=await browser.newPage({viewport:{width:1440,height:900}});
 await page.addInitScript(()=>{window.__qa={arcs:[],curves:[],ambiguous:[]};const p=CanvasRenderingContext2D.prototype;for(const m of ['clearRect','arc','bezierCurveTo','restore']){const f=p[m];p[m]=function(...a){if(this.canvas.classList.contains('hero-knowledge__canvas')){const q=window.__qa;if(m==='clearRect'){q.arcs=[];q.curves=[]}if(m==='arc')q.arcs.push({a,composite:this.globalCompositeOperation,style:typeof this.strokeStyle==='string'?this.strokeStyle:'gradient'});if(m==='bezierCurveTo')q.curves.push(a);if(m==='restore'){const scale=this.canvas.getBoundingClientRect().width/1440;const matched=q.arcs.filter(v=>[76,85.5,95,104.5,114,123.5].some(r=>Math.abs(v.a[2]-r*scale)<.05));if(matched.length!==6&&q.ambiguous.length<5)q.ambiguous.push(matched)}}return f.apply(this,a)}}});
 await page.goto(process.env.HERO_URL,{waitUntil:'networkidle'});await page.waitForTimeout(600);
 const measure=()=>page.evaluate(()=>{const field=document.querySelector('.hero-knowledge'),r=field.getBoundingClientRect(),logo=document.querySelector('.hero-section__mark .brand-symbol').getBoundingClientRect();return{data:{...field.dataset},bounds:r.toJSON(),logo:logo.toJSON(),arcs:window.__qa.arcs,curves:window.__qa.curves}});
 const initial=await measure();await page.screenshot({path:`${out}/screenshots/${name}-cursor-before.png`});
 const moves=[];
 for(const stage of ['initial','scrolled','resized']){
  if(stage==='scrolled'){await page.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';scrollTo(0,120)});await page.waitForTimeout(200)}
  if(stage==='resized'){await page.setViewportSize({width:1024,height:768});await page.waitForTimeout(200)}
  const b=await measure(),x=Math.floor(b.logo.x+b.logo.width/2-180),y=Math.floor(b.logo.y+b.logo.height/2-20);
  await page.mouse.move(x,y,{steps:10});await page.waitForTimeout(700);const a=await measure();
  const maxDelta=Math.max(...a.curves.map((c,i)=>Math.max(...c.map((v,j)=>Math.abs(v-(b.curves[i]?.[j]??v))))));
  moves.push({stage,x,y,mappingErrorX:Math.abs(Number(a.data.pointerX)-(x-a.bounds.x)),mappingErrorY:Math.abs(Number(a.data.pointerY)-(y-a.bounds.y)),active:a.data.pointerActive,logoBefore:b.logo,logoAfter:a.logo,maxCurveCoordinateDelta:maxDelta,coreArcs:a.arcs.filter(v=>v.composite==='source-over'&&v.style==='gradient')});
  if(stage==='initial')await page.screenshot({path:`${out}/screenshots/${name}-cursor-after.png`});
 }
 // Capture radius-only assertion collisions during active pulse; preserve original failures.
 await page.waitForTimeout(2200);results.push({engine:name,moves,ambiguousRadiusMatches:await page.evaluate(()=>window.__qa.ambiguous)});await browser.close();
}
await writeFile(out+'/cursor-followup.json',JSON.stringify(results,null,2));console.log(results.map(r=>({engine:r.engine,moves:r.moves.map(({coreArcs,logoBefore,logoAfter,...m})=>({...m,logoStable:JSON.stringify(logoBefore)===JSON.stringify(logoAfter),coreArcCount:coreArcs.length})),ambiguousCount:r.ambiguousRadiusMatches.length})));
