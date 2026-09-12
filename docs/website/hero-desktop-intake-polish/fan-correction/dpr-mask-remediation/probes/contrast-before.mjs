import {writeFile} from 'node:fs/promises';
// Reused reviewed paired-compositor pixel sampler. No scene renderer injection.
export async function sampleContrast(page,out,label){
   const records=await page.evaluate(()=>{
    const selectors=['.hero-section__eyebrow','.hero-section h1 > span','.hero-section__body','.hero-section__support','.hero-section__actions a','.desktop-navigation a'];
    return selectors.flatMap(selector=>Array.from(document.querySelectorAll(selector)).filter(e=>e.getBoundingClientRect().width&&getComputedStyle(e).visibility!=='hidden').map(e=>{
     const s=getComputedStyle(e),r=e.getBoundingClientRect(),id='contrast-'+document.querySelectorAll('[data-contrast-id]').length;e.dataset.contrastId=id;
     const walker=document.createTreeWalker(e,NodeFilter.SHOW_TEXT),rects=[];while(walker.nextNode()){if(!walker.currentNode.textContent.trim())continue;const range=document.createRange();range.selectNodeContents(walker.currentNode);for(const b of range.getClientRects())rects.push({x:b.x,y:b.y+scrollY,width:b.width,height:b.height});}
     return{id,selector,text:e.textContent.trim(),fontSize:s.fontSize,fontWeight:s.fontWeight,color:s.color,fill:s.webkitTextFillColor,gradient:s.backgroundClip==='text'?s.backgroundImage:null,rect:{x:r.x,y:r.y+scrollY,width:r.width,height:r.height},rects};
    }));
   });
   const cssSize=await page.evaluate(()=>({width:innerWidth,height:Math.max(document.documentElement.scrollHeight,document.body.scrollHeight,innerHeight)}));
   const png=await page.screenshot({fullPage:true});
   const ratios={x:png.readUInt32BE(16)/cssSize.width,y:png.readUInt32BE(20)/cssSize.height};
   for(const r of records){r.pixelToCssRatio=ratios;for(const rect of [r.rect,...r.rects]){rect.x*=ratios.x;rect.width*=ratios.x;rect.y*=ratios.y;rect.height*=ratios.y;}}
   const glyph=png.toString('base64');
   const style=await page.addStyleTag({content:'[data-contrast-id], [data-contrast-id] * {color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important} [data-contrast-id].gradient-text{background-image:none!important}'});
   const bg=(await page.screenshot({fullPage:true})).toString('base64');await style.evaluate(e=>e.remove());
   const gradStyle=await page.addStyleTag({content:'.hero-section .gradient-text{background-clip:border-box!important;-webkit-background-clip:border-box!important;color:transparent!important;-webkit-text-fill-color:transparent!important}'});
   const fg=(await page.screenshot({fullPage:true})).toString('base64');await gradStyle.evaluate(e=>e.remove());
   await writeFile(out+'/'+label+'-text.png',Buffer.from(glyph,'base64'));
   await writeFile(out+'/'+label+'-background.png',Buffer.from(bg,'base64'));
   const measured=await page.evaluate(async({bg,fg,glyph,records})=>{
    const decode=async data=>{const i=new Image();i.src='data:image/png;base64,'+data;await i.decode();const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const ctx=c.getContext('2d');ctx.drawImage(i,0,0);return{data:ctx.getImageData(0,0,c.width,c.height).data,width:c.width,height:c.height};};
    const b=await decode(bg),f=await decode(fg),g=await decode(glyph);const lum=rgb=>rgb.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
    return records.map(r=>{let min=Infinity,worst=null,count=0,coreMin=Infinity,coreWorst=null,coreCount=0,thinMin=Infinity,thinCount=0;const solid=r.color.match(/[\d.]+/g).map(Number);for(const rect of r.rects){for(let y=Math.max(0,Math.ceil(rect.y));y<Math.min(b.height,Math.floor(rect.y+rect.height));y++)for(let x=Math.max(0,Math.ceil(rect.x));x<Math.min(b.width,Math.floor(rect.x+rect.width));x++){
     if(r.gradient&&(x<r.rect.x||x>=r.rect.x+r.rect.width||y<r.rect.y||y>=r.rect.y+r.rect.height))continue;
     const i=(y*b.width+x)*4,B=Array.from(b.data.slice(i,i+3)),F=r.gradient?Array.from(f.data.slice(i,i+3)):solid.slice(0,3).map((v,j)=>v*(solid[3]??1)+B[j]*(1-(solid[3]??1)));const Lb=lum(B),Lf=lum(F),ratio=(Math.max(Lb,Lf)+.05)/(Math.min(Lb,Lf)+.05);const G=Array.from(g.data.slice(i,i+3));const denom=F.reduce((v,c,j)=>v+(c-B[j])**2,0);const coverage=denom?F.reduce((v,c,j)=>v+(G[j]-B[j])*(c-B[j]),0)/denom:0;if(coverage>=.5&&coverage<=1.05){thinCount++;thinMin=Math.min(thinMin,ratio);}if(coverage>=.95&&coverage<=1.05){coreCount++;if(ratio<coreMin){coreMin=ratio;coreWorst={x,y,foreground:F,background:B,coverage};}}count++;if(ratio<min){min=ratio;worst={x,y,foreground:F,background:B};}
    }}const size=parseFloat(r.fontSize),threshold=size>=24||(Number(r.fontWeight)>=700&&size>=18.6666667)?3:4.5;return{...r,minimumRatio:min,worst,sampledPixels:count,glyphCoreMinimum:Number.isFinite(coreMin)?coreMin:null,glyphCoreWorst:coreWorst,glyphCorePixels:coreCount,thinGlyphMinimum:Number.isFinite(thinMin)?thinMin:null,thinGlyphPixels:thinCount,threshold,meetsSampledThreshold:(coreCount?coreMin:thinCount?thinMin:min)>=threshold,assessmentMinimum:coreCount?coreMin:thinCount?thinMin:min,assessmentBasis:'solid glyph interiors in paired composited screenshots; >=50% coverage glyphs for thin text without opaque interiors, otherwise conservative rectangle fallback; line-rectangle minimum retained'};});
   },{bg,fg,glyph,records});

   await page.screenshot({path:out+'/'+label+'.png'});
   return measured;
}
