import pathlib,json,urllib.request,hashlib
out=pathlib.Path(__file__).parent
origin='https://5b0eeaaa.cumulative-labs.pages.dev/'
creator=json.loads(pathlib.Path('docs/website/hero-desktop-intake-polish/fan-correction/dpr-mask-remediation/build-assets.json').read_text())
rows=[]
for p in sorted(pathlib.Path('dist').rglob('*')):
 if not p.is_file():continue
 rel=p.relative_to('dist').as_posix();data=p.read_bytes();sha=hashlib.sha256(data).hexdigest()
 with urllib.request.urlopen(origin+('' if rel=='index.html' else rel),timeout=20) as r:
  remote=r.read();rows.append({'path':rel,'bytes':len(data),'local_sha256':sha,'remote_sha256':hashlib.sha256(remote).hexdigest(),'equal':data==remote,'status':r.status,'noindex':r.headers.get('x-robots-tag'),'creator_crosscheck':any(x['path']==rel and x['sha256']==sha for x in creator)})
(out/'hosted-assets.json').write_text(json.dumps({'origin':origin,'assets':rows},indent=2)+'\n')
print('hosted',len(rows),'all equal',all(x['equal'] for x in rows),'noindex',rows[0]['noindex'])
