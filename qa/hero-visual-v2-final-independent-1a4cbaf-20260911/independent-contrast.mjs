// Independent QA execution: audited measurement algorithm; new time and pointer challenges. Does not modify product.
// External browser tooling; inject a bundle of the live drawKnowledgeScene + createKnowledgeScene.
// HERO_CONTRAST_RENDERER points to that test-only IIFE bundle (global ContrastRenderer).
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const {chromium,webkit}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=process.env.CONTRAST_EVIDENCE_DIR;await mkdir(out,{recursive:true});
const renderer=await readFile(process.env.HERO_CONTRAST_RENDERER,'utf8');const results=[];
for(const [engineName,engine,executablePath] of [['chromium',chromium,process.env.CHROMIUM_EXECUTABLE],['webkit',webkit,process.env.WEBKIT_EXECUTABLE]]) {
 const browser=await engine.launch({...(executablePath?{executablePath}:{})});
 for(const [width,height] of (process.env.CONTRAST_DIAGNOSTIC ? [[1440,900],[1024,768]] : [[1440,900],[1280,800],[1024,768],[768,1024],[430,932],[390,844],[320,568]])) {
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});await page.goto(process.env.HERO_URL||'http://127.0.0.1:4197/',{waitUntil:'networkidle'});
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));document.documentElement.style.scrollBehavior='auto';});
  await page.addScriptTag({content:renderer});
  for(const state of [{time:0},{time:1.7},{time:9.3},{time:19.7},{time:37.2},{time:73.1},{time:11.1,pointer:true,dx:-300,dy:-130},{time:23.5,pointer:true,dx:-80,dy:90},{time:41.8,pointer:true,dx:90,dy:-20},{time:28,static:true}]) {
   await page.evaluate(state=>{
    const root=document.querySelector('.hero-knowledge'),canvas=root.querySelector('canvas'),r=root.getBoundingClientRect(),a=document.querySelector('.hero-section__mark').getBoundingClientRect();const mobile=innerWidth<=780;
    const layout={cx:a.x+a.width/2-r.x,cy:a.y+a.height/2-r.y,scale:r.width/(mobile?430*76/57:1440),flatten:1};
    ContrastRenderer.drawKnowledgeScene(canvas.getContext('2d'),ContrastRenderer.createKnowledgeScene(),layout,r.width,r.height,state.time,{x:layout.cx+(state.dx??-180),y:layout.cy+(state.dy??-20),strength:state.pointer?1:0},!!state.static);
   },state);
   // Include below-fold CTA labels on the narrowest phone without resizing the layout.
   const records=await page.evaluate(()=>{
    const selectors=['.hero-section__eyebrow','.hero-section h1 > span','.hero-section__body','.hero-section__support','.hero-section__actions a','.desktop-navigation a'];
    return selectors.flatMap(selector=>Array.from(document.querySelectorAll(selector)).filter(e=>e.getBoundingClientRect().width&&getComputedStyle(e).visibility!=='hidden').map(e=>{
     const s=getComputedStyle(e),r=e.getBoundingClientRect(),id='contrast-'+document.querySelectorAll('[data-contrast-id]').length;e.dataset.contrastId=id;
     const walker=document.createTreeWalker(e,NodeFilter.SHOW_TEXT),rects=[];while(walker.nextNode()){if(!walker.currentNode.textContent.trim())continue;const range=document.createRange();range.selectNodeContents(walker.currentNode);for(const b of range.getClientRects())rects.push({x:b.x,y:b.y+scrollY,width:b.width,height:b.height});}
     return{id,selector,text:e.textContent.trim(),fontSize:s.fontSize,fontWeight:s.fontWeight,color:s.color,fill:s.webkitTextFillColor,gradient:s.backgroundClip==='text'?s.backgroundImage:null,rect:{x:r.x,y:r.y+scrollY,width:r.width,height:r.height},rects};
    }));
   });
   const glyph=(await page.screenshot({fullPage:true})).toString('base64');
   const style=await page.addStyleTag({content:'[data-contrast-id], [data-contrast-id] * {color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important} [data-contrast-id].gradient-text{background-image:none!important}'});
   const bg=(await page.screenshot({fullPage:true})).toString('base64');await style.evaluate(e=>e.remove());
   const gradStyle=await page.addStyleTag({content:'.hero-section .gradient-text{background-clip:border-box!important;-webkit-background-clip:border-box!important;color:transparent!important;-webkit-text-fill-color:transparent!important}'});
   const fg=(await page.screenshot({fullPage:true})).toString('base64');await gradStyle.evaluate(e=>e.remove());
   const measured=await page.evaluate(async({bg,fg,glyph,records})=>{
    const decode=async data=>{const i=new Image();i.src='data:image/png;base64,'+data;await i.decode();const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const ctx=c.getContext('2d');ctx.drawImage(i,0,0);return{data:ctx.getImageData(0,0,c.width,c.height).data,width:c.width,height:c.height};};
    const b=await decode(bg),f=await decode(fg),g=await decode(glyph);const lum=rgb=>rgb.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
    return records.map(r=>{let min=Infinity,worst=null,count=0,coreMin=Infinity,coreWorst=null,coreCount=0;const solid=r.color.match(/[\d.]+/g).map(Number);for(const rect of r.rects){for(let y=Math.max(0,Math.ceil(rect.y));y<Math.min(b.height,Math.floor(rect.y+rect.height));y++)for(let x=Math.max(0,Math.ceil(rect.x));x<Math.min(b.width,Math.floor(rect.x+rect.width));x++){
     if(r.gradient&&(x<r.rect.x||x>=r.rect.x+r.rect.width||y<r.rect.y||y>=r.rect.y+r.rect.height))continue;
     const i=(y*b.width+x)*4,B=Array.from(b.data.slice(i,i+3)),F=r.gradient?Array.from(f.data.slice(i,i+3)):solid.slice(0,3).map((v,j)=>v*(solid[3]??1)+B[j]*(1-(solid[3]??1)));const Lb=lum(B),Lf=lum(F),ratio=(Math.max(Lb,Lf)+.05)/(Math.min(Lb,Lf)+.05);const G=Array.from(g.data.slice(i,i+3));const denom=F.reduce((v,c,j)=>v+(c-B[j])**2,0);const coverage=denom?F.reduce((v,c,j)=>v+(G[j]-B[j])*(c-B[j]),0)/denom:0;if(coverage>=.95&&coverage<=1.05){coreCount++;if(ratio<coreMin){coreMin=ratio;coreWorst={x,y,foreground:F,background:B,coverage};}}count++;if(ratio<min){min=ratio;worst={x,y,foreground:F,background:B};}
    }}const size=parseFloat(r.fontSize),threshold=size>=24||(Number(r.fontWeight)>=700&&size>=18.6666667)?3:4.5;return{...r,minimumRatio:min,worst,sampledPixels:count,glyphCoreMinimum:Number.isFinite(coreMin)?coreMin:null,glyphCoreWorst:coreWorst,glyphCorePixels:coreCount,threshold,meetsSampledThreshold:(r.gradient?coreMin:min)>=threshold,assessmentMinimum:r.gradient?coreMin:min,assessmentBasis:r.gradient?'solid glyph interiors; rectangular gradient-panel edge samples excluded':'conservative text-line rectangles'};});
   },{bg,fg,glyph,records});
   results.push({engine:engineName,width,height,state,measured});
   if([1440,1024,768,390].includes(width)&&state.time===9.3){await writeFile(`${out}/${engineName}-${width}-t9.3-background.png`,Buffer.from(bg,'base64'));await page.screenshot({path:`${out}/${engineName}-${width}-t9.3.png`});}
   await page.evaluate(()=>document.querySelectorAll('[data-contrast-id]').forEach(e=>delete e.dataset.contrastId));
  }
  console.log(engineName,width);await page.close();
 }
 await browser.close();
}
await writeFile(`${out}/contrast-results.json`,JSON.stringify({method:'Authored solid colors or un-clipped browser-painted gradient; paired full-page text-hidden composited background screenshots; every pixel inside text-node line rectangles; deterministic direct calls to the live renderer at stated seconds, matching existing canvas transform and DOM layout. Sampling is conservative over line rectangles, not a guarantee over all time/pointers.',results},null,2)+'\n');
console.log('failed samples',results.flatMap(r=>r.measured.filter(m=>!m.meetsSampledThreshold).map(m=>({engine:r.engine,width:r.width,state:r.state,text:m.text,ratio:m.assessmentMinimum}))));
