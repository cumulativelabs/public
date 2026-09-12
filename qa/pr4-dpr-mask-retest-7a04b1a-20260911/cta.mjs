import {writeFile} from 'node:fs/promises';
const {chromium,webkit}=await import(process.env.PLAYWRIGHT_MODULE);const rows=[],failures=[];
for(const [name,engine,executablePath] of [['chromium',chromium,process.env.CHROMIUM_EXECUTABLE],['webkit',webkit,process.env.WEBKIT_EXECUTABLE]]){
 const b=await engine.launch({executablePath}),p=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:2});await p.goto(process.env.HERO_URL,{waitUntil:'networkidle'});await p.bringToFront();const sequence=[];
 for(let i=0;i<15;i++){await p.keyboard.press(name==='webkit'?'Alt+Tab':'Tab');const state=await p.evaluate(()=>({tag:document.activeElement.tagName,text:document.activeElement.textContent?.trim().slice(0,80),href:document.activeElement.getAttribute('href'),hero:!!document.activeElement.closest('.hero-section__actions'),outline:getComputedStyle(document.activeElement).outlineStyle}));sequence.push(state);if(state.hero&&state.href==='#contact')break;}
 const ctas=sequence.filter(x=>x.hero);if(ctas.length!==2||ctas.some(x=>x.outline==='none'))failures.push(name+' CTA first traversal/focus');
 await p.locator('.hero-section__actions a').first().click();await p.waitForTimeout(1000);const target=await p.evaluate(()=>({hash:location.hash,scrollY,top:document.querySelector('#work').getBoundingClientRect().top}));if(target.hash!=='#work'||target.scrollY<=0)failures.push(name+' work CTA target');rows.push({engine:name,sequence,target});await b.close();
}
await writeFile(new URL('cta-results.json',import.meta.url),JSON.stringify({rows,failures},null,2)+'\n');console.log(JSON.stringify({failures}));if(failures.length)process.exitCode=1;
