import {mkdir,writeFile} from 'node:fs/promises';import {createHash} from 'node:crypto';
import {sampleContrast} from './contrast.mjs';const {chromium,webkit}=await import(process.env.PLAYWRIGHT_MODULE);
const out=process.env.TRANSITION_EVIDENCE_DIR;await mkdir(out,{recursive:true});const rows={transitions:[],static:[],keyboard:[],failures:[]};const save=()=>writeFile(out+'/results.json',JSON.stringify(rows,null,2));const check=(ok,s)=>{if(!ok)rows.failures.push(s)};
for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
 const b=await engine.launch({executablePath:name==='chromium'?process.env.CHROMIUM_EXECUTABLE:process.env.WEBKIT_EXECUTABLE});
 for(const label of ['scroll','tablet-desktop','loaded-font-refresh',...(name==='chromium'?['density-transition-1.25','density-transition-2']:[])]){
 const p=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:2});await p.addInitScript(()=>{const raf=requestAnimationFrame;window.__freeze=false;window.requestAnimationFrame=cb=>raf.call(window,t=>{if(!window.__freeze)cb(t)})});
 await p.goto(process.env.HERO_URL,{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);
 const measure=async label=>{await p.mouse.move(20,150);await p.mouse.move(150,260);await p.waitForTimeout(1300);await p.evaluate(()=>window.__freeze=true);await p.waitForTimeout(80);const meta=await p.evaluate(()=>{const c=document.querySelector('.hero-knowledge__tethers'),r=document.querySelector('.hero-knowledge'),a=r.getBoundingClientRect(),z=c.getBoundingClientRect();return{data:{...r.dataset},canvas:a.toJSON(),tether:z.toJSON(),maskSize:getComputedStyle(c).maskSize,dpr:devicePixelRatio,fonts:document.fonts.status,overflow:document.documentElement.scrollWidth>innerWidth}});const m=await sampleContrast(p,out,`${name}-${label}`);const error=Math.hypot(+meta.data.intakePointerX+meta.canvas.x-150,+meta.data.intakePointerY+meta.canvas.y-260);check(error<1,name+' '+label+' pointer mapping');check(!meta.overflow,name+' '+label+' overflow');check(m.filter(x=>x.selector.includes('hero')&&x.glyphCorePixels).every(x=>x.meetsSampledThreshold),name+' '+label+' contrast');rows.transitions.push({engine:name,label,meta,pointerError:error,measured:m});await save();};
 if(label==='scroll'){await p.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';scrollTo(0,140)});await p.waitForTimeout(150);}
 if(label==='tablet-desktop'){await p.setViewportSize({width:768,height:1024});await p.waitForTimeout(400);await p.setViewportSize({width:1440,height:900});await p.waitForTimeout(400);}
 if(label==='loaded-font-refresh'){await p.reload({waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);}
 if(label.startsWith('density-transition')){const cdp=await p.context().newCDPSession(p);await cdp.send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});await p.waitForTimeout(200);await cdp.send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:Number(label.split('-').at(-1)),mobile:false});await p.waitForTimeout(250);}
 await measure(label);await p.close();
 }
 await b.close();
}await save();console.log(JSON.stringify({transitions:rows.transitions.length,static:rows.static.length,keyboard:rows.keyboard.length,failures:rows.failures}));
