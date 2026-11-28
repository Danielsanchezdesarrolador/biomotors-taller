"""Actual Poppler raster/text/bbox checks. No production documents are regenerated."""
import hashlib,json,os,re,subprocess,xml.etree.ElementTree as ET
from pathlib import Path
from PIL import Image,ImageChops,ImageDraw
out=Path(os.environ.get('BT_MPF_EVIDENCE','/tmp/bt-mp-pdf-fix-evidence'))
def run(*args):return subprocess.check_output(args,text=True)
def text(name,p=None):return run('pdftotext',*(['-f',str(p),'-l',str(p)] if p else []),str(out/name),'-')
def raster(name):
 path=out/(Path(name).stem+'-page1')
 subprocess.run(['pdftoppm','-f','1','-singlefile','-r','144','-png',str(out/name),str(path)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
 return Image.open(str(path)+'.png').convert('RGB')
def bbox(name):return ET.fromstring(run('pdftotext','-bbox',str(out/name),'-'))
ns={'p':'http://www.w3.org/1999/xhtml'}
root=bbox('final.pdf');pages=root.findall('.//p:page',ns);first=pages[0]
final,draft=text('final.pdf'),text('draft.pdf')
assert 'BORRADOR' not in final.upper() and 'INFORME DEFINITIVO' in final.upper()
assert 'BORRADOR' in draft.upper() and 'Borrador no enviado' in draft
assert 'INSPECCIÓN PARCIAL' in final and 'Sin X: sin revisar.' in final
assert all(abs(float(p.attrib['width'])-595.28)<.01 and abs(float(p.attrib['height'])-841.89)<.01 for p in pages)
states=json.loads((out/'four-states.json').read_text());assert len(states)==34 and set(x['state'] for x in states)=={'ok','attention','immediate','unreviewed'}
assert json.loads((out/'model-states.json').read_text())==states
# Check actual extracted X bounding boxes in the exact approved color-cell geometry.
xmarks=[w for w in first.findall('.//p:word',ns) if w.text=='X']
expected=[]
CW=595.28-58
for group,t,two,x,w in [('general',305,True,29,CW),('capo',419,True,29,CW),('bajo',518,True,29,CW),('frenos',617,False,29,(CW-10)/2),('neumaticos',617,False,29+(CW+10)/2,(CW-10)/2)]:
 rows=[r for r in states if r['id'].startswith(group+'/')];n=len(rows)//2 if two else len(rows);colw=(w-20-(10 if two else 0))/(2 if two else 1)
 for i,row in enumerate(rows):
  rx=x+10+(i//n)*(colw+10);at=t+27+(i%n)*14.5
  inside=[]
  for mark in xmarks:
   mx=(float(mark.attrib['xMin'])+float(mark.attrib['xMax']))/2;my=(float(mark.attrib['yMin'])+float(mark.attrib['yMax']))/2
   if rx<=mx<rx+78 and at<=my<at+14.5:inside.append((mark,mx))
  if row['state']=='unreviewed':assert not inside,row
  else:
   assert len(inside)==1,(row,len(inside));chosen=['ok','attention','immediate'].index(row['state']);assert rx+26*chosen<=inside[0][1]<rx+26*(chosen+1),row
  expected.append({'id':row['id'],'state':row['state'],'x':rx,'top':at})
assert len(xmarks)==sum(r['state']!='unreviewed' for r in states)
# Raster equality with the original, unmodified CP04 template on identical synthetic data.
base,new=raster('approved-baseline.pdf'),raster('draft.pdf')
assert base.size==new.size
assert ImageChops.difference(base,new).getbbox() is None,'Draft first page must be pixel-identical to approved original code'
clean=raster('final.pdf')
# A definitive matrix has the same geometry and correct three backgrounds.
for row in expected:
 for k,color in enumerate([(122,224,13),(255,204,0),(255,15,31)]):
  px=clean.getpixel((round((row['x']+k*26+3)*2),round((row['top']+4)*2)))
  assert max(abs(a-b) for a,b in zip(px,color))<=2,(row['id'],k,px,color)
# Compare the real attached reference only in static first-page regions, never copy personal fields.
reference=os.environ.get('BT_MP_APPROVED_REFERENCE')
reference_result={'status':'PENDING_REFERENCE_NOT_SUPPLIED_TO_RUNNER'}
if reference:
 ref=out/'reference-private-raster'
 subprocess.run(['pdftoppm','-f','1','-singlefile','-r','144','-png',reference,str(ref)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
 approved=Image.open(str(ref)+'.png').convert('RGB');assert approved.size==new.size
 regions=[(0,0,595,105),(29,266,566,295),(29,305,566,329),(29,419,566,443),(29,518,566,542),(29,617,566,641)]
 for region in regions:
  box=tuple(round(a*2) for a in region);assert ImageChops.difference(approved.crop(box),new.crop(box)).getbbox() is None,('Official reference static region differs',region)
 reference_result={'status':'PASS','staticRegionsPixelIdentical':len(regions),'sha256':hashlib.sha256(Path(reference).read_bytes()).hexdigest(),'personalFieldsExcluded':True}
 # Remove private raster immediately; only synthetic comparison images are delivered.
 approved.close();Path(str(ref)+'.png').unlink()
# Full original labels may have the approved visual aliases on page one.
items=json.loads(run('node','scripts/multipunto-items.mjs'));assert len(items)==34
aliases={'general/neblina':'Luces de neblinero','capo/aceite-motor':'Aceite de motor','bajo/fuga-aceite':'Fuga de aceite','bajo/fuga-refrigerante':'Fuga de refrigerante','bajo/cremallera':'Cremallera','frenos/discos':'Frenos de disco','frenos/tambores':'Frenos de tambor'}
summary=text('final.pdf',1)
for item in items:assert aliases.get(item['id'],item['name']) in summary,item
notes=text('long-notes.pdf');expected_notes=json.loads((out/'notes-expected.json').read_text())
for value in expected_notes.values():assert re.sub(r'\s','',value) in re.sub(r'\s','',notes),'Long observation truncated'
# Every short component detail remains on the same page as its observation/follow-up.
for n,item in enumerate(items):
 if n%4==3:continue
 full='Observación sintética '+str(n+1)+' áéñ'
 matching=[p for p in final.split('\f')[1:] if full in p]
 assert len(matching)==1 and item['name'] in matching[0],item
# All extracted annex text must remain within printable content, not the footer.
for name in ['final.pdf','long-notes.pdf']:
 for page in bbox(name).findall('.//p:page',ns)[1:]:
  for word in page.findall('.//p:word',ns):
   assert 28<=float(word.attrib['xMin']) and float(word.attrib['xMax'])<=568,(name,word.text,word.attrib)
# Supplemental real PDFs: completed inspection and no fabricated empty results.
complete=text('complete.pdf');empty=text('empty-draft.pdf')
assert 'INSPECCIÓN COMPLETA' in complete and '34/34' in complete and 'BORRADOR' not in complete.upper()
assert 'BORRADOR' in empty and '0/34' in empty
for name,count in [('complete.pdf',34),('empty-draft.pdf',0)]:
 first_page=bbox(name).findall('.//p:page',ns)[0]
 assert len([w for w in first_page.findall('.//p:word',ns) if w.text=='X'])==count,(name,count)
# The two permitted long notes each fit on a printable page, so neither block may split.
long_pages=notes.split('\f')[1:]
for part in long_pages:
 if 'INICIO_ÍNTEGRO' in part:assert 'FIN_ÍNTEGRO' in part
 if 'INICIO_TOKEN_' in part:assert '_FIN_TOKEN' in part
# Compare synthetic pages side by side for the owner's visual review.
canvas=Image.new('RGB',(new.width*2,new.height+45),'white');canvas.paste(new,(0,45));canvas.paste(clean,(new.width,45));draw=ImageDraw.Draw(canvas);draw.text((12,14),'BORRADOR - plantilla aprobada',fill='black');draw.text((new.width+12,14),'INFORME DEFINITIVO - mismo diseno',fill='black');canvas.save(out/'comparativa-sintetica.png')
result={'status':'PASS','tool':'Poppler pdftotext bbox + pdftoppm 144 DPI; Pillow exact pixels','firstPagePixelIdenticalToOriginalDraftCode':True,'attachedReference':reference_result,'A4':True,'all34Components':True,'exactFourStateXGeometry':True,'greenYellowRedColumns':True,'partial':True,'complete34of34':True,'emptyNoFabricatedX':True,'longBlocksStayTogether':True,'draftWatermark':True,'finalNoDraftText':True,'longNotesNotTruncated':True,'shortDetailsStayTogether':True,'annexNoHorizontalOverflow':True,'finalPages':len(pages),'finalBytesSHA256':hashlib.sha256((out/'final.pdf').read_bytes()).hexdigest()}
(out/'pdf-visual-results.json').write_text(json.dumps(result,indent=2)+'\n');(out/'x-geometry.json').write_text(json.dumps(expected,indent=2)+'\n')
print('MULTIPUNTO_PDF_FIX_TEXT_RASTER_GEOMETRY_PASS')
