// Compare inherited automatic menu focus separately from explicit-focus contrast tests.
import {writeFile} from 'node:fs/promises';
const {chromium,webkit}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');const results=[];
for(const [engineName,engine,executablePath] of [['chromium',chromium,process.env.CHROMIUM_EXECUTABLE],['webkit',webkit,process.env.WEBKIT_EXECUTABLE]]){
 const b=await engine.launch({executablePath});
 for(const [build,url] of [['starting',process.env.BASELINE_URL],['candidate',process.env.HERO_URL]])for(const reducedMotion of ['reduce','no-preference']){
 const p=await b.newPage({viewport:{width:390,height:844},reducedMotion});await p.goto(url,{waitUntil:'networkidle'});await p.bringToFront();await p.getByRole('button',{name:'Open navigation menu'}).click();await p.waitForTimeout(600);
 const initial=await p.evaluate(()=>({tag:document.activeElement.tagName,name:document.activeElement.getAttribute('aria-label'),expanded:document.querySelector('.mobile-menu-button').getAttribute('aria-expanded')}));
 await p.keyboard.press('Escape');const escaped=await p.getByRole('button',{name:'Open navigation menu'}).evaluate(e=>({restored:e===document.activeElement,expanded:e.getAttribute('aria-expanded')}));results.push({engine:engineName,build,reducedMotion,initial,escaped});await p.close();
 }await b.close();
}
await writeFile(process.env.MENU_EVIDENCE_FILE,JSON.stringify(results,null,2)+'\n');console.log(results);
