import os,subprocess,json,time,pathlib,sys
out=pathlib.Path(__file__).parent
env=os.environ.copy()
env.update(PLAYWRIGHT_MODULE=os.environ['PLAYWRIGHT_MODULE'],CHROMIUM_EXECUTABLE=os.environ['CHROMIUM_EXECUTABLE'],WEBKIT_EXECUTABLE=os.environ['WEBKIT_EXECUTABLE'],HERO_URL='http://127.0.0.1:4337/')
cases={'cta':('cta.mjs','CTA_EVIDENCE_DIR','cta'),'supplemental':('supplemental.mjs','SUPPLEMENTAL_EVIDENCE_DIR','supplemental'),'density':('density.mjs','OUT','density'),'transitions':('transitions.mjs','TRANSITION_EVIDENCE_DIR','transitions'),'visibility':('visibility.mjs','VISIBILITY_EVIDENCE_DIR','visibility'),'anchor':('../../scripts/hero-anchor-browser.mjs','ANCHOR_EVIDENCE_DIR','matrix'),'policy':('../../scripts/hero-intake-policy-browser.mjs','POLICY_EVIDENCE_DIR','policy'),'tether':('../../scripts/hero-tether-browser.mjs','TETHER_EVIDENCE_DIR','tether'),'fan':('../../scripts/hero-fan-browser.mjs','FAN_EVIDENCE_DIR','fan')}
results=[]
for key in sys.argv[1:]:
 script,var,folder=cases[key];env[var]=str(out/folder);t=time.monotonic()
 with (out/'logs'/f'{key}.log').open('w') as f:r=subprocess.run(['node',str(out/script)],env=env,stdout=f,stderr=subprocess.STDOUT)
 results.append(dict(check=key,exit_code=r.returncode,seconds=round(time.monotonic()-t,2)));print(results[-1],flush=True)
 (out/('exits-'+'-'.join(sys.argv[1:])+'.json')).write_text(json.dumps(results,indent=2)+'\n')
 if r.returncode!=0:break
