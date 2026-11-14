"""Read-only pixel and hash verification of BT-BRAND-02."""
from pathlib import Path
from PIL import Image
import hashlib,json
root=Path(__file__).resolve().parent.parent
metadata=json.loads((root/'assets/brand/dark-variant.json').read_text())
protected=json.loads((root/'assets/brand/manifest.json').read_text())
hashof=lambda p:hashlib.sha256((root/p).read_bytes()).hexdigest()
checks={}
for item in protected['originals']+protected['derivatives']:
 assert hashof(item['path'])==item['sha256'],item['path'];checks[item['path']]=item['sha256']
for item in metadata['outputs']:assert hashof(item['path'])==item['sha256']
a=Image.open(root/metadata['source']).convert('RGBA')
b=Image.open(root/metadata['outputs'][0]['path']).convert('RGBA')
assert a.size==b.size and a.getchannel('A').tobytes()==b.getchannel('A').tobytes()
count=0
for y in range(a.height):
 for x in range(a.width):
  old,new=a.getpixel((x,y)),b.getpixel((x,y))
  if old!=new:
   count+=1
   region=next((r for r in metadata['textRegions'] if r['box'][0]<=x<r['box'][2] and r['box'][1]<=y<r['box'][3]),None)
   assert region and old[3]==new[3] and old[3]>0
   assert old[0]<100 and old[1]<120 and old[2]<140
   assert new[:3]==tuple(region['rgb'])
assert count==metadata['changedPixels']
assert a.crop((0,0,475,a.height)).tobytes()==b.crop((0,0,475,b.height)).tobytes()
a=Image.open(root/'public/brand/logo-horizontal.webp').convert('RGBA');b=Image.open(root/'public/brand/logo-horizontal-dark.webp').convert('RGBA')
assert a.getchannel('A').tobytes()==b.getchannel('A').tobytes()
for old,new in zip(a.crop((0,0,273,251)).getdata(),b.crop((0,0,273,251)).getdata()):assert old==new or old[3]==new[3]==0
print(json.dumps({'originalsIntact':True,'protectedResourcesIntact':True,'alphaIdentical':True,'symbolIdentical':True,'optimizedVisibleSymbolIdentical':True,'onlyTextRgbChanged':True,'changedPixels':count,'protectedHashes':checks},indent=2))
