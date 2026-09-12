import {mkdir,writeFile} from 'node:fs/promises';
import {sampleContrast} from './contrast.mjs';
const {chromium,webkit}=await import(process.env.PLAYWRIGHT_MODULE);
const out=process.env.OUT;await mkdir(out,{recursive:true});const rows=[];
const before=process.env.PHASE==='before';
for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await engine.launch({executablePath:name==='chromium'?process.env.CHROMIUM_EXECUTABLE:process.env.WEBKIT_EXECUTABLE});
 const cases=before?[[1440,900,2,'lower',120,711],[1440,900,2,'center',150],[1280,800,2,'center',280]]:[[1440,900,1,'center',150],[1440,900,1.25,'center',150],[1440,900,1.5,'lower',120,711],[1440,900,2,'lower',120,711],[1440,900,2,'center',150],[1440,900,2,'upper',150,'upper'],[1280,800,2,'center',280],[1440,900,3,'center',150]];
 for(const [width,height,dpr,label,x,yarg] of cases){
  const p=await browser.newPage({viewport:{width,height},deviceScaleFactor:dpr,reducedMotion:'no-preference'});const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await p.addInitScript(()=>{window.__freeze=false;const raf=requestAnimationFrame;window.requestAnimationFrame=cb=>raf.call(window,t=>{if(!window.__freeze)cb(t)})});
  await p.goto(process.env.HERO_URL,{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);
  const cy=await p.locator('.hero-section__mark').evaluate(e=>{const r=e.getBoundingClientRect();return r.y+r.height/2});const y=yarg==='upper'?cy-210:yarg??cy;
  await p.mouse.move(x,y);await p.waitForTimeout(1300);await p.evaluate(()=>window.__freeze=true);await p.waitForTimeout(80);
  const mask=await p.locator('.hero-knowledge__tethers').evaluate(async c=>{const s=getComputedStyle(c),i=new Image();i.src=s.maskImage.slice(5,-2);await i.decode();return {css:c.getBoundingClientRect().toJSON(),bitmap:{width:i.width,height:i.height},maskSize:s.maskSize,webkitMaskSize:s.webkitMaskSize,position:s.maskPosition,repeat:s.maskRepeat}});
  const id=`${name}-${width}-dpr${dpr}-${label}`;await p.screenshot({path:`${out}/${id}-ordinary.png`});
  const measured=await sampleContrast(p,out,id);
  rows.push({engine:name,width,height,dpr,label,pointer:{x,y},mask,errors,measured});await writeFile(out+'/results.json',JSON.stringify(rows,null,2));
  console.log(id,JSON.stringify(measured.filter(m=>m.selector.includes('hero')).map(m=>({s:m.selector,ratio:m.assessmentMinimum,core:m.glyphCorePixels,pass:m.meetsSampledThreshold}))));await p.close();
 }await browser.close();
}
