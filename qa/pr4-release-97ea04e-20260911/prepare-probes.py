from pathlib import Path
p=Path(__file__).parent
s=Path('scripts/hero-visibility-browser.mjs').read_text()
s=s.replace("['center120',120,cy],",'').replace("['center400',400,cy],",'').replace(",['upper',150,cy-210],['lower',120,Math.min(height-110,cy+280)]",'')
s=s.replace("rows.push({engine:name,width,height,label,pointer:{x,y},...state,file});", "rows.push({engine:name,width,height,label,pointer:{x,y},...state,file});await writeFile(out+'/states.json',JSON.stringify(rows,null,2));")
(p/'visibility.mjs').write_text(s)
s=Path('scripts/hero-contrast-browser.mjs').read_text(); a=s.index('   const records='); b=s.index('   results.push',a)
fn=s[a:b]
(p/'contrast-sample.mjs').write_text('// Reused reviewed paired-compositor pixel sampler. No scene renderer injection.\nexport async function sampleContrast(page,out,label){\n'+fn+"\n   await page.screenshot({path:out+'/'+label+'.png'});\n   return measured;\n}\n")
