"""Read synthetic PDFs with Poppler; verify text, page sizes are asserted in SQL/renderer lab."""
import json,os,subprocess,re
out=os.environ.get('BT_MPF_EVIDENCE','/tmp/bt-mpf-evidence')
def text(name):return subprocess.run(['pdftotext',out+'/'+name,'-'],capture_output=True,text=True,check=True).stdout
final,draft,notes=(text(n) for n in ['final.pdf','draft.pdf','long-notes.pdf'])
assert 'BORRADOR' not in final.upper() and 'INFORME DEFINITIVO' in final
assert 'BORRADOR' in draft.upper()
assert 'INSPECCIÓN PARCIAL' in final
items=json.loads(subprocess.run(['node','scripts/multipunto-items.mjs'],capture_output=True,text=True,check=True).stdout)
assert len(items)==34
# Official labels are extracted from source by SQL registry; no parallel product list.
for item in items:assert item['name'] in final,item['name']
note='Nota íntegra áéñ '+('anexo técnico detallado '*70)
assert re.sub(r'\s','',note) in re.sub(r'\s','',notes),'Complete permitted 1626-character note must survive PDF extraction'
with open(out+'/pdf-results.json','w') as f:json.dump({'status':'PASS','finalWithoutDraftWatermark':True,'draftExplicitlyMarked':True,'partialExplicit':True,'all34Labels':bool(items),'completeLongNote':True,'tool':'pdftotext actual PDF extraction'},f,indent=2)
print('MULTIPUNTO_PDF_TEXT_PASS')
