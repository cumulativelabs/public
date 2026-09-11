import os,subprocess,pathlib,json,time
p=pathlib.Path(__file__).parent; results=[]
checks=[('matrix','scripts/hero-anchor-browser.mjs','ANCHOR_EVIDENCE_DIR','matrix'),('policy','scripts/hero-intake-policy-browser.mjs','POLICY_EVIDENCE_DIR','policy'),('tether','scripts/hero-tether-browser.mjs','TETHER_EVIDENCE_DIR','tether')]
for label,script,key,directory in checks:
 env=dict(os.environ);env[key]=str(p/directory);(p/directory).mkdir(exist_ok=True)
 with (p/'logs'/f'{label}.log').open('w') as f:r=subprocess.run(['node',script],env=env,stdout=f,stderr=subprocess.STDOUT)
 results.append({'check':label,'exit_code':r.returncode});(p/'browser-exits.json').write_text(json.dumps(results,indent=2)+'\n');print(results[-1],flush=True)
