"""Offline inspection of selectable text/marks in the actual one-page PDF.
Usage: python3 scripts/verify-cp04-pdf-layout.py PDF STATES_JSON
Requires Poppler already used by the repository's PDF checks. No hosted access.
"""
import json
import re
import subprocess
import sys
import xml.etree.ElementTree as ET

pdf_path, states_path = sys.argv[1:3]
rows = json.load(open(states_path, encoding='utf-8'))
if isinstance(rows, dict):
    rows = rows['rows']
xml = subprocess.check_output(['pdftotext', '-bbox', pdf_path, '-'])
root = ET.fromstring(xml)
ns = {'h': 'http://www.w3.org/1999/xhtml'}
pages = root.findall('.//h:page', ns)
assert len(pages) == 1, 'Must be exactly one page'
page = pages[0]
assert abs(float(page.attrib['width']) - 595.28) < .02
assert abs(float(page.attrib['height']) - 841.89) < .02
words = [dict(text=''.join(w.itertext()), **{k: float(v) for k, v in w.attrib.items()})
         for w in page.findall('h:word', ns)]
assert all(0 <= w['xMin'] < w['xMax'] <= 595.28 and 0 <= w['yMin'] < w['yMax'] <= 841.89 for w in words)
marks = [w for w in words if w['text'] == 'X']
assert len(marks) == sum(r['state'] != 'unreviewed' for r in rows)
overrides = {'general/neblina': 'Luces de neblinero', 'capo/aceite-motor': 'Aceite de motor',
             'bajo/fuga-aceite': 'Fuga de aceite', 'bajo/fuga-refrigerante': 'Fuga de refrigerante',
             'bajo/cremallera': 'Cremallera', 'frenos/discos': 'Frenos de disco', 'frenos/tambores': 'Frenos de tambor'}
checked = 0
for group, top, count, columns in [('general',305,5,2),('capo',419,4,2),('bajo',518,4,2),('frenos',617,4,1),('neumaticos',617,4,1)]:
    group_rows = [r for r in rows if (r.get('group') or r.get('category')) == group]
    assert len(group_rows) == count * columns
    for i, row in enumerate(group_rows):
        col, index = divmod(i, count)
        x = 39 + (263.64 if col else 273.64 if group == 'neumaticos' else 0)
        y = top + 27 + index * 14.5
        band = [w for w in words if x-1 <= w['xMin'] < x+259 and y-1 <= w['yMin'] < y+12]
        actual_marks = [w for w in band if w['text'] == 'X']
        if row['state'] == 'unreviewed':
            assert not actual_marks
        else:
            assert len(actual_marks) == 1, (row['id'], actual_marks)
            expected_x = x + 9 + 26 * ['ok','attention','immediate'].index(row['state'])
            assert abs(actual_marks[0]['xMin']-expected_x) < .3, row['id']
        actual_label = ' '.join(w['text'] for w in sorted(band, key=lambda w: w['xMin']) if w['text'] != 'X')
        expected_label = overrides.get(row['id'], row.get('label') or row.get('name'))
        assert actual_label == expected_label, (row['id'], actual_label, expected_label)
        checked += 1
assert checked == 34
text = ' '.join(w['text'] for w in words)
for title in ['Inspección Multi Punto', 'General', 'Bajo Capó', 'Bajo Vehículo', 'Estado de Frenos', 'Estado de Neumáticos', 'Observaciones completas en el expediente.']:
    assert title in text, title
assert not re.search(r'Envío automático|Correo enviado', text)
print('CP04_PDF_LAYOUT_PASS: 1 A4 portrait; 34 labels; exact X positions; text within page; footer present')
