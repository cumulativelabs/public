// Capture final composited pages, not isolated canvas alpha. Pair each scene with only the tether hidden.
const {chromium,webkit} = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import {mkdir,writeFile,readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const out=process.env.VISIBILITY_EVIDENCE_DIR; if (!out) throw new Error('Set VISIBILITY_EVIDENCE_DIR');await mkdir(out,{recursive:true});
const rows=[];
for(const [name,engine,executablePath] of [['chromium',chromium,process.env.CHROMIUM_EXECUTABLE],['webkit',webkit,process.env.WEBKIT_EXECUTABLE]]){
 if(process.env.QUICK&&name==='webkit')continue;
 const b=await engine.launch({executablePath});
 for(const [width,height] of [[1440,900],[1280,800]]){
 const p=await b.newPage({viewport:{width,height},deviceScaleFactor:2,reducedMotion:'no-preference'});
 await p.addInitScript(()=>{const raf=window.requestAnimationFrame;window.requestAnimationFrame=cb=>raf.call(window,t=>{if(!window.__freeze)cb(t)});window.__strokes=[];let path=[];for(const n of ['clearRect','beginPath','moveTo','bezierCurveTo','stroke']){const orig=CanvasRenderingContext2D.prototype[n];CanvasRenderingContext2D.prototype[n]=function(...a){if(this.canvas.classList.contains('hero-knowledge__tethers')){if(n==='clearRect')window.__strokes=[];if(n==='beginPath')path=[];if(n==='moveTo')path=a;if(n==='bezierCurveTo')path=[...path.slice(0,2),...a];if(n==='stroke')window.__strokes.push({curve:path,width:this.lineWidth,alpha:this.globalAlpha});}return orig.apply(this,a)}}});
 await p.goto(process.env.HERO_URL||'http://127.0.0.1:4226/',{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);
 if(width===1440&&name==='chromium'&&process.env.VERIFY){const assets=[];for(const f of await readdir('dist',{recursive:true})){if(!/\.(html|css|js|svg|png|webp|ico|jpg)$/.test(f))continue;const local=await readFile('dist/'+f);const r=await p.request.get(new URL(f==='index.html'?'/':f,process.env.HERO_URL).href);const remote=await r.body();assets.push({path:f,status:r.status(),noindex:r.headers()['x-robots-tag'],equal:local.equals(remote),sha256:createHash('sha256').update(remote).digest('hex')});}await writeFile(out+'/identity.json',JSON.stringify(assets,null,2));console.log('identity',assets.every(a=>a.equal),assets[0]?.noindex);}
 const cy=await p.locator('.hero-section__mark').evaluate(e=>{const r=e.getBoundingClientRect();return r.y+r.height/2});
 const edge=await p.locator('.hero-knowledge').evaluate(e=>{const r=e.getBoundingClientRect(),m=document.querySelector('.hero-section__mark').getBoundingClientRect();return m.x+m.width/2-550*r.width/1440});
 const cases=[['center150',150,cy],['upper',150,cy-210],['lower',120,Math.min(height-110,cy+280)]];
 for(const [label,x,y] of cases){await p.reload({waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);await p.mouse.move(x,y);await p.waitForTimeout(1250);const state=await p.evaluate(()=>{window.__freeze=true;const r=document.querySelector('.hero-knowledge').getBoundingClientRect(),e=document.querySelector('.hero-knowledge');return{bounds:r.toJSON(),dataset:{...e.dataset},strokes:window.__strokes}});await p.waitForTimeout(80);const file=`${name}-${width}-${label}`;await p.screenshot({path:out+'/'+file+'.png'});await p.locator('.hero-knowledge__tethers').evaluate(e=>e.style.visibility='hidden');await p.screenshot({path:out+'/'+file+'-hidden.png'});rows.push({engine:name,width,height,label,pointer:{x,y},...state,file});}
 await p.close();console.log(name,width);
 }await b.close();}
await writeFile(out+'/states.json',JSON.stringify(rows,null,2));
