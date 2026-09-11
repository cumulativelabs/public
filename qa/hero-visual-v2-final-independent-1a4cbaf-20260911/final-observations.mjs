import {writeFile,mkdir,readFile} from 'node:fs/promises';
const {chromium,webkit}=await import(process.env.PLAYWRIGHT_MODULE);const out=process.env.EXTRA_DIR;await mkdir(out+'/review',{recursive:true});const results=[];
for(const [name,engine,executablePath] of [['chromium',chromium,process.env.CHROMIUM_EXECUTABLE],['webkit',webkit,process.env.WEBKIT_EXECUTABLE]]){
 const b=await engine.launch({executablePath});const p=await b.newPage({viewport:{width:320,height:568}});const requests=[];p.on('request',r=>requests.push(r.url()));await p.goto('https://db4b833b.cumulative-labs.pages.dev/',{waitUntil:'networkidle'});
 await p.locator('.hero-section__actions').scrollIntoViewIfNeeded();await p.screenshot({path:`${out}/${name}-320-scrolled.png`});results.push({engine:name,version:b.version(),requests:[...new Set(requests)],ctaHrefs:await p.locator('.hero-section__actions a').evaluateAll(es=>es.map(e=>({text:e.textContent,href:e.getAttribute('href')})))});
 if(name==='chromium')for(const origin of ['local','immutable'])for(const engineName of ['chromium','webkit']){
  const sizes=['1440x900','1280x800','1024x768','768x1024','430x932','390x844','320x568'];let html='<body style="margin:0;background:#ddd;display:grid;grid-template-columns:repeat(4,350px);font:12px sans-serif">';for(const size of sizes){const data=await readFile(`${out}/${origin}/after-${engineName}-${size}.png`);html+=`<div style="height:420px;padding:5px;box-sizing:border-box">${engineName} ${size}<br><img style="max-width:340px;max-height:385px" src="data:image/png;base64,${data.toString('base64')}"></div>`}
  await p.setViewportSize({width:1400,height:840});await p.setContent(html);await p.screenshot({path:`${out}/review/${origin}-${engineName}-overview.png`});
 }
 await b.close();
}
await writeFile(`${out}/network-versions.json`,JSON.stringify(results,null,2)+'\n');
