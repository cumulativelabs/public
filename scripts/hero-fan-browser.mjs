// Browser-painted geometry parity against the immutable production intake fixture.
import { readFile, mkdir, writeFile } from 'node:fs/promises';
const { chromium, webkit } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const production = JSON.parse(await readFile(new URL('../src/visuals/fixtures/production-intake.json', import.meta.url),'utf8'));
const out = process.env.FAN_EVIDENCE_DIR; await mkdir(out,{recursive:true});
const results = [], failures = [];
const check = (ok,message) => { if (!ok) failures.push(message); };
const instrument = () => {
  window.__fan = { curves: [], start: [0,0] };
  for (const name of ['clearRect','moveTo','bezierCurveTo']) {
    const original = CanvasRenderingContext2D.prototype[name];
    CanvasRenderingContext2D.prototype[name] = function(...args) {
      if (this.canvas.classList.contains('hero-knowledge__canvas')) {
        if (name==='clearRect') window.__fan.curves=[];
        if (name==='moveTo') window.__fan.start=args;
        if (name==='bezierCurveTo') { window.__fan.curves.push([...window.__fan.start,...args]); window.__fan.start=args.slice(-2); }
      }
      return original.apply(this,args);
    };
  }
};
for (const [name,engine,executablePath] of [['chromium',chromium,process.env.CHROMIUM_EXECUTABLE],['webkit',webkit,process.env.WEBKIT_EXECUTABLE]]) {
  const browser=await engine.launch({executablePath});
  for (const [width,height] of [[1440,900],[1280,800],[1024,768]]) {
    const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'}); await page.addInitScript(instrument);
    const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
    await page.goto(process.env.HERO_URL,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(500);
    const parity=await page.evaluate(async production=>{
      const root=document.querySelector('.hero-knowledge'), image=root.querySelector('img'), r=root.getBoundingClientRect(), mark=document.querySelector('.hero-section__mark').getBoundingClientRect();
      const s=r.width/1440,cx=mark.x+mark.width/2-r.x,cy=mark.y+mark.height/2-r.y;
      const art=new DOMParser().parseFromString(await(await fetch(image.currentSrc)).text(),'image/svg+xml');
      const parse=p=>p.match(/d="M([^"]+)"/)[1].replace('C','').split(/[ ,]+/).map(Number);
      const base=production.svgPaths.map(parse);
      const current=[...art.querySelector('g[clip-path]').querySelectorAll('path')].map(e=>e.outerHTML).filter(p=>production.svgPaths.some(b=>parse(b).join(',')===(p.match(/d="M([^"]+)"/)?parse(p).join(','):''))).map(parse);
      const raw=[...new Map(window.__fan.curves.map(c=>[JSON.stringify(c),c])).values()];
      const live=raw.filter(c=>Math.abs(c[6]-(cx-76*s))<.001).map(c=>c.map((v,i)=>(v-(i%2?cy:cx))/s));
      const yAt=(c,x)=>{if(x<c[0]||x>c[6])return null;const at=(t,k)=>(1-t)**3*c[k]+3*(1-t)**2*t*c[k+2]+3*(1-t)*t*t*c[k+4]+t**3*c[k+6];let l=0,h=1;for(let i=0;i<50;i++){const m=(l+h)/2;if(at(m,0)<x)l=m;else h=m}return at((l+h)/2,1)};
      const span=(curves,x)=>{const ys=curves.map(c=>yAt(c,x)).filter(y=>y!==null);return Math.max(...ys)-Math.min(...ys)};
      const staticSlices=[550,650,750,850,950].map(x=>({nativeX:x,viewportX:r.x+x*s,production:span(base,x)*s,current:span(current,x)*s}));
      const liveSlices=[-460,-420,-360,-300,-240,-180,-120,-80].map(x=>({sceneX:x,viewportX:r.x+cx+x*s,production:span(production.canvasCurves,x)*s,current:span(live,x)*s}));
      return {originalStaticPaths:current.length,originalLiveCurves:live.length,staticSlices,liveSlices,cx,cy,scale:s,left:r.x,top:r.y};
    },production);
    check(parity.originalStaticPaths===115&&parity.originalLiveCurves===86,`${name} ${width}: original curves missing`);
    check([...parity.staticSlices,...parity.liveSlices].every(x=>Math.abs(x.production-x.current)<.001),`${name} ${width}: fan-width parity`);
    await page.screenshot({path:`${out}/${name}-${width}x${height}.png`});
    await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(200);
    const read=()=>page.evaluate(()=>({curves:[...new Map(window.__fan.curves.map(c=>[JSON.stringify(c),c])).values()],mark:document.querySelector('.hero-section__mark').getBoundingClientRect().toJSON(),data:{...document.querySelector('.hero-knowledge').dataset}}));
    const rest=await read(); const x=parity.left+parity.cx-720*parity.scale,y=parity.top+parity.cy+50*parity.scale;
    await page.mouse.move(x,y);await page.waitForTimeout(50);const early=await read();await page.waitForTimeout(550);const active=await read();
    await page.screenshot({path:`${out}/${name}-${width}-attraction.png`});
    await page.mouse.move(width-1,height-1);await page.waitForTimeout(800);const settled=await read();
    const deltas=state=>state.curves.map((c,i)=>Math.max(...c.map((v,j)=>Math.abs(v-rest.curves[i][j]))));
    const ad=deltas(active), sd=deltas(settled), ed=deltas(early);
    const changed=ad.map((delta,i)=>({delta,curve:active.curves[i]})).filter(v=>v.delta>.01);
    const attraction={pointer:{x,y},earlyDelta:Math.max(...ed),activeDelta:Math.max(...ad),settledDelta:Math.max(...sd),changedCurves:changed.length,onlyExtensions:changed.every(v=>v.curve[6]<parity.cx-470*parity.scale),coreStable:JSON.stringify(rest.mark)===JSON.stringify(active.mark),active:active.data.pointerActive};
    check(attraction.active==='true'&&attraction.activeDelta>.5&&attraction.activeDelta<17,`${name} ${width}: attraction amplitude`);
    check(attraction.earlyDelta<attraction.activeDelta&&attraction.settledDelta<.1,`${name} ${width}: easing/settle`);
    check(attraction.changedCurves>0&&attraction.changedCurves<86&&attraction.onlyExtensions&&attraction.coreStable,`${name} ${width}: attraction isolation`);
    check(!errors.length,`${name} ${width}: browser errors`);
    results.push({engine:name,width,height,parity,attraction,errors});await page.close();
  }
  await browser.close();
}
await writeFile(`${out}/results.json`,JSON.stringify({sourceCommit:production.sourceCommit,results,failures},null,2)+'\n');console.log(JSON.stringify({cases:results.length,failures}));if(failures.length)process.exitCode=1;
