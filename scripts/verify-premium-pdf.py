"""Offline visual-geometry/text checks on synthetic PDF review artifacts only."""
from pathlib import Path
import re,subprocess,sys,xml.etree.ElementTree as E
root=Path(sys.argv[1] if len(sys.argv)>1 else '/workspace/work/pdf-premium')
for name in ['report','handover','report-extenso','handover-extenso']:
 p=root/(name+'.pdf');result=subprocess.check_output(['pdftotext','-bbox',str(p),'-'])
 tree=E.fromstring(result);pages=tree.findall('.//{*}page')
 for page in pages:
  words=page.findall('.//{*}word')
  assert all(0<=float(w.get('xMin'))<=float(w.get('xMax'))<=596 and 0<=float(w.get('yMin'))<=float(w.get('yMax'))<=842 for w in words),name
  body=[w for w in words if 83<float(w.get('yMin'))<755]
  if len(pages)>1:assert max(float(w.get('yMax')) for w in body)-min(float(w.get('yMin')) for w in body)>150,(name,'nearly empty page')
 text=' '.join(w.text or '' for w in tree.findall('.//{*}word'))
 assert not re.search(r'[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}|[a-f0-9]{64}|CP05|in_person|authorized_pickup|prepared_not_sent',text),name
 if name=='report':assert '$119' in text and '$179' in text and 'No realizado' in text
 if name=='handover':assert 'Presencial' in text and 'firma' in text
 if name=='report-extenso':assert all('Partida ficticia '+str(i) in text for i in range(70))
 print(name,len(pages),'pages: selectable text, bounds, page occupancy, no technical identifiers PASS')
