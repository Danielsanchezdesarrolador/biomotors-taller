"""Independent stdlib ZIP parser: compare each extracted PDF against the real SQL/HTTP originals."""
from pathlib import Path
import sys,zipfile,json,hashlib,re
out=Path(sys.argv[1]);manifest=json.loads((out/'original-manifest.json').read_text());entries=[]
with zipfile.ZipFile(out/'originals.zip') as archive:
 assert archive.testzip() is None and len(archive.infolist())==3
 for i,entry in enumerate(archive.infolist()):
  assert entry.compress_type==zipfile.ZIP_STORED
  assert re.fullmatch(r'(COTIZACION|INFORME_EJECUCION|CONSTANCIA_ENTREGA)_R\d+_[a-f0-9-]{36}\.pdf',entry.filename)
  data=archive.read(entry.filename);assert data==(out/('original-'+str(i)+'.pdf')).read_bytes()
  sha=hashlib.sha256(data).hexdigest();assert sha==manifest['documents'][i]['sha256']
  entries.append({'name':entry.filename,'sha256':sha,'bytes':len(data),'status':'PASS'})
(out/'independent-zip-results.json').write_text(json.dumps({'status':'PASS','files':entries,'scope':'Python zipfile independent CRC/structure validation and exact SHA256 original bytes'},indent=2)+'\n')
print('INDEPENDENT_ORIGINAL_ZIP_PASS',len(entries))
