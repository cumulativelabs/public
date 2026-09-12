import {readFile,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const b=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE}),p=await b.newPage();
for(const label of process.argv.slice(2)){
 const dir=label,states=JSON.parse(await readFile(dir+'/states.json'));
 const results=[];
 for(const s of states){const shown=(await readFile(dir+'/'+s.file+'.png')).toString('base64'),hidden=(await readFile(dir+'/'+s.file+'-hidden.png')).toString('base64');
 const samples=await p.evaluate(async({s,shown,hidden})=>{
 const decode=async data=>{const i=new Image();i.src='data:image/png;base64,'+data;await i.decode();const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const ctx=c.getContext('2d');ctx.drawImage(i,0,0);return{data:ctx.getImageData(0,0,c.width,c.height).data,width:c.width,height:c.height}};
 const a=await decode(shown),b=await decode(hidden);const rgb=(im,x,y)=>Array.from(im.data.slice((y*im.width+x)*4,(y*im.width+x)*4+3));
 const lum=rgb=>rgb.reduce((s,v,i)=>{v/=255;return s+(v<=.04045?v/12.92:((v+.055)/1.055)**2.4)*[.2126,.7152,.0722][i]},0);
 const result=[];
 const tips=s.strokes.filter(v=>v.width<2&&Math.hypot(v.curve[6]+s.bounds.x-s.pointer.x,v.curve[7]+s.bounds.y-s.pointer.y)<25);
 for(const [strand,v] of tips.entries()){
 let near32=.99;for(;near32>.01;near32-=.01){const c=v.curve,m=1-near32,x=m**3*c[0]+3*m*m*near32*c[2]+3*m*near32**2*c[4]+near32**3*c[6]+s.bounds.x,y=m**3*c[1]+3*m*m*near32*c[3]+3*m*near32**2*c[5]+near32**3*c[7]+s.bounds.y;if(Math.hypot(x-s.pointer.x,y-s.pointer.y)>=32)break;}
 for(const [region,t] of [['join',.08],['gap',.45],['near',.85],['near32',near32]]){
 const c=v.curve,m=1-t;const x=m**3*c[0]+3*m*m*t*c[2]+3*m*t*t*c[4]+t**3*c[6]+s.bounds.x,y=m**3*c[1]+3*m*m*t*c[3]+3*m*t*t*c[5]+t**3*c[7]+s.bounds.y;
 const dx=3*m*m*(c[2]-c[0])+6*m*t*(c[4]-c[2])+3*t*t*(c[6]-c[4]),dy=3*m*m*(c[3]-c[1])+6*m*t*(c[5]-c[3])+3*t*t*(c[7]-c[5]),len=Math.hypot(dx,dy);
 let best=null;
 for(let Y=Math.floor(y)-1;Y<=Math.ceil(y)+1;Y++)for(let X=Math.floor(x)-1;X<=Math.ceil(x)+1;X++){
 if(X<5||Y<5||X>=a.width-5||Y>=a.height-5||Math.hypot(X-x,Y-y)>1.5||Math.hypot(X-s.pointer.x,Y-s.pointer.y)<22)continue;
 const bg=rgb(b,X,Y),fg=rgb(a,X,Y);if(Math.max(...bg)>70)continue; // Exclude text, cursor and bright original artwork.
 const ratio=(lum(fg)+.05)/(lum(bg)+.05);const side=[-1,1].map(sign=>rgb(a,Math.round(X+sign*-dy/len*3),Math.round(Y+sign*dx/len*3)));
 const ridgeRatio=(lum(fg)+.05)/(Math.min(...side.map(lum))+.05);
 if(!best||ratio>best.ratio)best={x:X,y:Y,foreground:fg,background:bg,ratio,ridgeRatio};
 }
 result.push({strand,region,t,point:{x,y},...best,distinguishable:!!best&&best.ratio>=2&&best.ridgeRatio>=1.3});
 }
 }
 return result;
 },{s,shown,hidden});
 results.push({engine:s.engine,width:s.width,height:s.height,label:s.label,pointer:s.pointer,activation:s.strokes[0]?.alpha??0,cursorTips:s.strokes.filter(v=>v.width<2&&Math.hypot(v.curve[6]+s.bounds.x-s.pointer.x,v.curve[7]+s.bounds.y-s.pointer.y)<25).map(v=>({x:v.curve[6]+s.bounds.x,y:v.curve[7]+s.bounds.y,distance:Math.hypot(v.curve[6]+s.bounds.x-s.pointer.x,v.curve[7]+s.bounds.y-s.pointer.y)})),regions:Object.fromEntries(['join','gap','near','near32'].map(r=>{const a=samples.filter(x=>x.region===r),distinct=[];for(const v of a.filter(x=>x.distinguishable).sort((a,b)=>b.ratio-a.ratio))if(distinct.every(d=>Math.hypot(d.x-v.x,d.y-v.y)>=2))distinct.push(v);return[r,{distinctFilaments:distinct.length,sampled:a.filter(x=>x.ratio).length,distinguishable:a.filter(x=>x.distinguishable).length,maxRatio:Math.max(0,...a.map(x=>x.ratio??0))}]})),samples});
 }
 await writeFile(dir+'/visibility.json',JSON.stringify({method:'Frozen paired final-page PNGs, identical animation/pointer state with only tether CSS visibility changed. Samples within 1.5 CSS px of instrumented thin filament center at t=.08/.45/.85 plus first center point >=32px from mouse while stepping back from tip in .01 increments; exclude pixels within 22px of mouse and backgrounds with any RGB channel >70 (text/bright art). Authored target >=2:1 shown/hidden local luminance and >=1.3:1 lateral ridge at 3px, ensuring thin filaments rather than broad glow. Occlusion and overlapping strands may reduce eligible counts; raw samples retained. Distinct qualifying samples are separated by >=2 CSS px to avoid counting coincident centers as separate filaments.',results},null,2));
 console.log(label,results.map(r=>`${r.engine} ${r.width} ${r.label}: ${Object.values(r.regions).map(v=>v.distinguishable).join('/')}`).join('\n'));
}await b.close();
