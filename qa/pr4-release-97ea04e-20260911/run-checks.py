import subprocess,json,pathlib,time
p=pathlib.Path(__file__).parent
results=json.loads((p/'build-results.json').read_text())
results.append({'check':'ci-network-retry','exit_code':int((p/'logs/ci-retry.exit').read_text())})
for label,cmd in [('lint',['npm','run','lint']),('typecheck',['npm','run','typecheck']),('test',['npm','test','--','--run']),('build',['npm','run','build']),('validate-build',['npm','run','validate:build']),('diff-check',['git','diff','--check'])]:
 start=time.time()
 with (p/'logs'/f'{label}.log').open('w') as f:r=subprocess.run(cmd,stdout=f,stderr=subprocess.STDOUT)
 results.append({'check':label,'exit_code':r.returncode,'seconds':round(time.time()-start,2)})
 (p/'build-results.json').write_text(json.dumps(results,indent=2)+'\n');print(results[-1],flush=True)
