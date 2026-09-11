// Verify the added desktop attractor respects the existing capability gates.
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium,webkit}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=process.env.POLICY_EVIDENCE_DIR;await mkdir(out,{recursive:true});const results=[],failures=[];
for(const [name,engine,executablePath] of [['chromium',chromium,process.env.CHROMIUM_EXECUTABLE],['webkit',webkit,process.env.WEBKIT_EXECUTABLE]]){
 const browser=await engine.launch({executablePath});
 for(const policy of ['reduced-motion','save-data','low-core','touch']){
  const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:policy==='reduced-motion'?'reduce':'no-preference'});
  if(policy==='save-data')await page.addInitScript(()=>{const c=new EventTarget();c.saveData=true;Object.defineProperty(navigator,'connection',{get:()=>c})});
  if(policy==='low-core')await page.addInitScript(()=>Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>2}));
  await page.goto(process.env.HERO_URL,{waitUntil:'networkidle'});await page.waitForTimeout(200);
  const before=await page.locator('canvas').evaluate(c=>c.toDataURL());
  if(policy==='touch')await page.locator('.hero-section').dispatchEvent('pointermove',{pointerType:'touch',clientX:288,clientY:486});
  else await page.mouse.move(288,486);
  await page.waitForTimeout(500);
  const after=await page.locator('canvas').evaluate(c=>c.toDataURL());
  const data=await page.locator('.hero-knowledge').evaluate(e=>({...e.dataset}));
  const pass=policy==='touch'?data.pointerActive!=='true':before===after&&data.pointerInteraction==='disabled'&&['static-budget','reduced-motion'].includes(data.renderMode);
  if(!pass)failures.push(name+' '+policy);results.push({engine:name,policy,pixelIdentical:before===after,data,pass});await page.close();
 }
 await browser.close();
}
await writeFile(out+'/results.json',JSON.stringify({results,failures},null,2)+'\n');console.log({cases:results.length,failures});if(failures.length)process.exitCode=1;
