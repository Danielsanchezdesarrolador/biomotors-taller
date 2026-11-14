"""BT-BRAND-02: localized text recolor from the immutable official PNG.
No inversion, tracing, typesetting or edits to the symbol/alpha channel.
"""
from pathlib import Path
from PIL import Image
import hashlib,json
root=Path(__file__).resolve().parent.parent
source=root/'assets/brand/originals/bytetorque_logo_horizontal_oficial_original.png'
original_hash='fb8c59ec252194ef03240c0be53200d628cb0d416a7dc8e390ca0bf05560a693'
assert hashlib.sha256(source.read_bytes()).hexdigest()==original_hash
original=Image.open(source).convert('RGBA');dark=original.copy()
a=original.load();b=dark.load();changed=0
regions=[{'label':'Byte','box':[475,350,945,580],'rgb':[245,249,255]},
         {'label':'Gestión de Talleres','box':[665,580,1450,652],'rgb':[245,249,255]}]
for region in regions:
 left,top,right,bottom=region['box']
 for y in range(top,bottom):
  for x in range(left,right):
   r,g,blue,alpha=a[x,y]
   # Only navy glyph pixels. Cyan/blue strokes and decorative bars are excluded.
   if alpha>0 and r<100 and g<120 and blue<140:
    b[x,y]=(*region['rgb'],alpha);changed+=1
assert original.getchannel('A').tobytes()==dark.getchannel('A').tobytes()
assert original.crop((0,0,475,original.height)).tobytes()==dark.crop((0,0,475,dark.height)).tobytes()
for y in range(original.height):
 for x in range(original.width):
  if a[x,y]!=b[x,y]:assert any(r['box'][0]<=x<r['box'][2] and r['box'][1]<=y<r['box'][3] for r in regions)
assert changed>10000
png=root/'assets/brand/derived/bytetorque_logo_horizontal_fondo_oscuro.png';png.parent.mkdir(parents=True,exist_ok=True);dark.save(png,optimize=True)
web=root/'public/brand/logo-horizontal-dark.webp'
crop=dark.crop((24,265,1648,673));crop.resize((1000,251),Image.Resampling.LANCZOS).save(web,lossless=True,method=6)
# The optimized symbol is pixel-identical to the light derivative as well.
light=Image.open(root/'public/brand/logo-horizontal.webp').convert('RGBA');optimized=Image.open(web).convert('RGBA')
assert light.getchannel('A').tobytes()==optimized.getchannel('A').tobytes()
for left_pixel,right_pixel in zip(light.crop((0,0,273,251)).getdata(),optimized.crop((0,0,273,251)).getdata()):
 assert left_pixel==right_pixel or left_pixel[3]==right_pixel[3]==0
native=root/'apps/android/assets/brand/logo-horizontal-dark.png'
crop.resize((800,201),Image.Resampling.LANCZOS).save(native,optimize=True)
outputs=[]
for p in [png,web,native]:
 im=Image.open(p);outputs.append({'path':str(p.relative_to(root)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'width':im.width,'height':im.height})
(root/'assets/brand/dark-variant.json').write_text(json.dumps({'edition':'BT-BRAND-02','source':str(source.relative_to(root)),'sourceSha256':original_hash,'textRegions':regions,'changedPixels':changed,'alphaIdentical':True,'symbolIdentical':True,'optimizedVisibleSymbolIdentical':True,'onlyTextRgbChanged':True,'outputs':outputs},indent=2)+'\n')
print('BT-BRAND-02: original/symbol/alpha unchanged; text-only RGB derivative PASS',changed)
