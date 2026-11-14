"""One-time, lossless-source asset preparation. Pillow is a tooling dependency only.
The Node build copies these versioned approved derivatives; it never redraws the logo.
"""
from pathlib import Path
from PIL import Image, __version__
import hashlib, json
ROOT = Path(__file__).resolve().parent.parent
NAVY = (6, 28, 57, 255)
originals = ROOT / 'assets/brand/originals'
icon_path = originals / 'bytetorque_icono_oficial_original.png'
logo_path = originals / 'bytetorque_logo_horizontal_oficial_original.png'
expected = {
    icon_path.name: '1322fdbc00c4dccad0d7c7e8fe69a5a6533414236168165165390843d8c8f04c',
    logo_path.name: 'fb8c59ec252194ef03240c0be53200d628cb0d416a7dc8e390ca0bf05560a693'
}
meta = {'edition': 'BT-BRAND-01', 'pillow': __version__, 'originals': [], 'derivatives': []}
for path in (icon_path, logo_path):
    data = path.read_bytes()
    assert hashlib.sha256(data).hexdigest() == expected[path.name], 'Unapproved original'
    im = Image.open(path)
    assert im.mode == 'RGBA' and im.getchannel('A').getextrema() == (0, 255)
    hist = im.getchannel('A').histogram()
    meta['originals'].append({'path': str(path.relative_to(ROOT)), 'sha256': expected[path.name],
        'width': im.width, 'height': im.height, 'mode': im.mode,
        'transparentPixels': hist[0], 'semitransparentPixels': sum(hist[1:255])})
# Only virtually transparent exterior margins are trimmed. Pixel values inside are untouched.
icon_crop = (48, 56, 1200, 1208)
logo_crop = (24, 265, 1648, 673)
icon = Image.open(icon_path).crop(icon_crop)
logo = Image.open(logo_path).crop(logo_crop)
meta['crops'] = {'icon': icon_crop, 'horizontal': logo_crop,
    'note': 'All original pixels with alpha >16 are retained. No recoloring or interior alpha edits.'}
for path, crop in [(icon_path, icon_crop),(logo_path,logo_crop)]:
    visible = Image.open(path).getchannel('A').point(lambda a: 255 if a>16 else 0).getbbox()
    assert crop[0] <= visible[0] and crop[1] <= visible[1] and crop[2] >= visible[2] and crop[3] >= visible[3]
def save(im, relative, source, safe_box=None):
    path = ROOT / relative; path.parent.mkdir(parents=True, exist_ok=True)
    if path.suffix == '.webp': im.save(path, lossless=True, method=6)
    else: im.save(path, optimize=True)
    item = {'path': relative, 'source': source, 'width': im.width, 'height': im.height,
        'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'bytes': path.stat().st_size}
    if safe_box: item['protectedBounds'] = safe_box
    meta['derivatives'].append(item)
def icon_canvas(size, fraction=1, opaque=False):
    inner = round(size*fraction)
    art = icon.resize((inner, inner), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', (size,size), NAVY if opaque else (0,0,0,0))
    offset=(size-inner)//2
    canvas.alpha_composite(art,(offset,offset))
    return canvas, [offset,offset,offset+inner,offset+inner]
for size, name, fraction, opaque in [(192,'icon-192.png',1,False),(512,'icon-512.png',1,False),
    (180,'apple-touch-icon.png',.94,True),(512,'icon-maskable-512.png',.56,True),
    (32,'favicon-32.png',1,False),(48,'favicon-48.png',1,False)]:
    im, bounds = icon_canvas(size,fraction,opaque)
    save(im,'assets/brand/generated/'+name,'icon',bounds if 'maskable' in name else None)
save(icon_canvas(384)[0], 'public/brand/icon.webp','icon')
save(logo.resize((1000,round(logo.height*1000/logo.width)),Image.Resampling.LANCZOS),
    'public/brand/logo-horizontal.webp','horizontal')
save(icon_canvas(1024,.94,True)[0], 'apps/android/assets/brand/icon.png','icon')
im,bounds=icon_canvas(1024,.56)
save(im,'apps/android/assets/brand/adaptive-foreground.png','icon',bounds)
save(logo.resize((800,round(logo.height*800/logo.width)),Image.Resampling.LANCZOS),
    'apps/android/assets/brand/logo-horizontal.png','horizontal')
(ROOT/'assets/brand/manifest.json').write_text(json.dumps(meta,indent=2)+'\n')
print('Official sources, transparency, crops and derivatives: PASS')
