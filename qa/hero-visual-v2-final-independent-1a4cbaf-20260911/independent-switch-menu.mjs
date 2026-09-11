import {mkdir,writeFile} from 'node:fs/promises';
const {chromium,webkit}=await import(process.env.PLAYWRIGHT_MODULE);
const out=process.env.EXTRA_DIR;await mkdir(out,{recursive:true});const results=[];
for(const [name,engine,executablePath] of [['chromium',chromium,process.env.CHROMIUM_EXECUTABLE],['webkit',webkit,process.env.WEBKIT_EXECUTABLE]]){
 const browser=await engine.launch({executablePath});
 for(const direction of ['to-mobile','to-desktop'])for(const fallback of [false,true]){
  const start=direction==='to-mobile'?1440:768,end=direction==='to-mobile'?768:1440,asset=direction==='to-mobile'?'mobile':'desktop';
  const page=await browser.newPage({viewport:{width:start,height:1024}});
  if(fallback)await page.addInitScript(()=>HTMLCanvasElement.prototype.getContext=()=>null);
  let release;const held=new Promise(r=>release=r);let requested=false;
  await page.route(`**/hero-nexus-anchored-${asset}.svg`,async route=>{requested=true;await held;await route.continue()});
  await page.goto(process.env.HERO_URL,{waitUntil:'networkidle'});
  await page.evaluate(()=>{window.__frames=[];window.__record=true;const sample=()=>{if(!window.__record)return;const e=document.querySelector('.hero-knowledge'),i=e.querySelector('img'),r=e.getBoundingClientRect();window.__frames.push({width:innerWidth,source:i.currentSrc.split('/').pop(),complete:i.complete,ready:e.dataset.artReady,visible:getComputedStyle(e.querySelector('picture')).visibility,planeWidth:r.width});requestAnimationFrame(sample)};requestAnimationFrame(sample)});
  await page.setViewportSize({width:end,height:1024});await page.waitForTimeout(40);await page.screenshot({path:`${out}/${name}-${direction}-${fallback?'fallback':'canvas'}-held.png`});await page.waitForTimeout(200);
  const frames=await page.evaluate(()=>window.__frames);release();await page.waitForLoadState('networkidle');await page.waitForTimeout(100);
  const sequence=[];for(const width of [start,end,779,781,780,820,767,1440,768]){await page.setViewportSize({width,height:1024});await page.waitForTimeout(60);sequence.push(await page.evaluate(()=>({width:innerWidth,ready:document.querySelector('.hero-knowledge').dataset.artReady,src:document.querySelector('.hero-knowledge img').currentSrc.split('/').pop()})));}
  const all=await page.evaluate(()=>{window.__record=false;return window.__frames});
  const wrong=all.filter(f=>f.visible==='visible'&&f.source!==`hero-nexus-anchored-${f.width<=780?'mobile':'desktop'}.svg`);
  results.push({engine:name,kind:'responsive-delay',direction,fallback,requested,heldFrames:frames,allFrameCount:all.length,wrongVisibleFrames:wrong,sequence});await page.close();
 }
 for(const [build,url] of [['baseline',process.env.BASELINE_URL],['candidate',process.env.HERO_URL]])for(const reducedMotion of ['reduce','no-preference'])for(const openMethod of ['click','keyboard']){
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url,{waitUntil:'networkidle'});await page.bringToFront();const toggle=page.getByRole('button',{name:'Open navigation menu'});
  if(openMethod==='click')await toggle.click();else{await toggle.focus();await page.keyboard.press('Enter')};await page.waitForTimeout(650);
  const active=()=>page.evaluate(()=>{const e=document.activeElement;return{tag:e.tagName,name:e.getAttribute('aria-label')||e.textContent.trim().slice(0,80),inMenu:!!e.closest('.mobile-navigation'),focusVisible:e.matches(':focus-visible'),rect:e.getBoundingClientRect().toJSON()}});
  const initial=await active();const tabs=[];for(let i=0;i<8;i++){await page.keyboard.press(name==='webkit'?'Alt+Tab':'Tab');tabs.push(await active())}
  if(build==='candidate'&&reducedMotion==='reduce'&&openMethod==='keyboard')await page.screenshot({path:`${out}/${name}-menu-keyboard-reduced.png`});
  await page.keyboard.press('Escape');const returned=await toggle.evaluate(e=>({focused:document.activeElement===e,expanded:e.getAttribute('aria-expanded')}));
  await toggle.click();await page.getByRole('navigation',{name:'Mobile navigation'}).getByRole('link').first().click();await page.waitForTimeout(400);const navigation=await page.evaluate(()=>({hash:location.hash,inert:document.querySelector('main').inert,expanded:document.querySelector('.mobile-menu-button').getAttribute('aria-expanded')}));
  results.push({engine:name,kind:'menu',build,reducedMotion,openMethod,initial,tabs,returned,navigation,errors});await page.close();
 }
 await browser.close();
}
await writeFile(`${out}/results.json`,JSON.stringify({method:'Independent rAF observations during held uncached image loads both directions, repeated cached breakpoint switches; independent baseline and candidate menu entry and traversal without manually focusing a menu control.',results},null,2)+'\n');
