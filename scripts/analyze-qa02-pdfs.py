"""Check A4 page count/content for the R005 Chromium evidence (requires poppler-utils)."""
import json
import pathlib
import re
import subprocess
import sys

folder = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'artifacts/bt-qa02-print')
files = sorted(folder.glob('BT_QA_02_A4_*.pdf'))
assert len(files) == 6, 'Expected short and long reports at 1650/390/375 px'
results = []
for file in files:
    info = subprocess.check_output(['pdfinfo', str(file)], text=True)
    pages = int(re.search(r'Pages:\s+(\d+)', info)[1])
    text = [subprocess.check_output(['pdftotext', '-f', str(i), '-l', str(i), str(file), '-'], text=True).strip()
            for i in range(1, pages + 1)]
    assert all(len(page) > 30 for page in text), f'{file}: blank page'
    assert 'A4' in info, f'{file}: unexpected paper size'
    if '_4_' in file.name:
        assert pages == 1, f'{file}: four-item sample requires investigation'
    else:
        assert pages > 1, f'{file}: long legitimate content may have been clipped'
    results.append(dict(file=file.name, pages=pages, charactersPerPage=list(map(len, text)),
                        blankPages=0, pageSize=re.search(r'Page size:\s+(.+)', info)[1]))
(folder / 'results.json').write_text(json.dumps(results, indent=2) + '\n')
print(json.dumps(results, indent=2))
