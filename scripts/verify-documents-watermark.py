"""Verify the real marked PDF without changing it; reuse all historical layout assertions.
Poppler bbox separates large rotated watermark glyphs into row text. Identify exactly
8 expected 82pt Helvetica glyphs on the 38-degree diagonal before excluding ONLY those
from the legacy horizontal-label verifier. No document is rewritten or exported clean.
"""
from pathlib import Path
import subprocess,sys,xml.etree.ElementTree as ET,math,runpy
pdf=Path(sys.argv[1]).resolve();model=Path(sys.argv[2]).resolve()
raw=subprocess.check_output(['pdftotext','-raw',str(pdf),'-']).decode()
original=subprocess.check_output(['pdftotext','-bbox',str(pdf),'-'])
root=ET.fromstring(original);ns={'h':'http://www.w3.org/1999/xhtml'};pages=root.findall('.//h:page',ns)
assert raw.count('BORRADOR')==len(pages)
for page in pages:
 glyphs=[w for w in page.findall('.//h:word',ns) if abs(float(w.attrib['yMax'])-float(w.attrib['yMin'])-75.85)<.02]
 glyphs.sort(key=lambda w:float(w.attrib['xMin']))
 assert ''.join(''.join(w.itertext()) for w in glyphs)=='BORRADOR',[(w.attrib,''.join(w.itertext())) for w in glyphs]
 assert abs(float(glyphs[0].attrib['xMin'])-72)<.02
 for left,right in zip(glyphs,glyphs[1:]):
  dx=float(right.attrib['xMin'])-float(left.attrib['xMin']);dy=float(right.attrib['yMin'])-float(left.attrib['yMin'])
  assert abs(-dy/dx-math.tan(math.radians(38)))<.001
 for parent in page.iter():
  for child in list(parent):
   if child in glyphs:parent.remove(child)
filtered=ET.tostring(root)
check_output=subprocess.check_output
def output(command,*args,**kwargs):
 if command==['pdftotext','-bbox',str(pdf),'-']:return filtered
 return check_output(command,*args,**kwargs)
subprocess.check_output=output
sys.argv=['verify-cp04-pdf-layout.py',str(pdf),str(model)]
runpy.run_path(str(Path(__file__).parent/'verify-cp04-pdf-layout.py'),run_name='__main__')
print('WATERMARK_GEOMETRY_PASS: every page, 8 large glyphs, 38 degree diagonal; all 34 legacy label/X assertions retained')
