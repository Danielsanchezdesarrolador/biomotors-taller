// Generador de iconos PNG sin dependencias extra; basado en public/icon.svg.
import { mkdirSync, writeFileSync } from 'node:fs'
import { deflateSync } from 'node:zlib'

const colorBg = [18, 59, 50]
const colorLime = [183, 237, 120]
const points = [[53,73],[96,48],[139,73],[139,119],[96,144],[53,119]]
function dist(x,y,a,b) {
  const dx=b[0]-a[0], dy=b[1]-a[1]
  const t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)))
  return Math.hypot(x-(a[0]+t*dx),y-(a[1]+t*dy))
}
function rgbAt(x,y) {
  const radius=Math.hypot(x-96,y-96)
  if (radius<=8) return colorBg
  if (radius<=20) return colorLime
  for (let i=0;i<points.length;i++) {
    if (dist(x,y,points[i],points[(i+1)%points.length])<=6) return colorLime
  }
  return colorBg
}
function crc32(data) {
  let crc=0xffffffff
  for (const byte of data) {
    crc ^= byte
    for (let i=0;i<8;i++) crc=(crc>>>1)^((crc&1)?0xedb88320:0)
  }
  return (crc^0xffffffff)>>>0
}
function chunk(type,data) {
  const header=Buffer.from(type,'ascii')
  const n=Buffer.alloc(4)
  n.writeUInt32BE(data.length)
  const crc=Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([header,data])))
  return Buffer.concat([n,header,data,crc])
}
function render(size) {
  const rows=Buffer.alloc(size*(1+size*4))
  let offset=0
  for(let y=0;y<size;y++){
    rows[offset++]=0
    for(let x=0;x<size;x++){
      // 2x antialiasing para bordes suaves.
      const totals=[0,0,0]
      for(const oy of [0.25,0.75])for(const ox of [0.25,0.75]){
        const px=(x+ox)*192/size, py=(y+oy)*192/size
        const color=rgbAt(px,py)
        for(let i=0;i<3;i++) totals[i]+=color[i]
      }
      for(let i=0;i<3;i++) rows[offset++]=Math.round(totals[i]/4)
      rows[offset++]=255
    }
  }
  const ihdr=Buffer.alloc(13)
  ihdr.writeUInt32BE(size,0)
  ihdr.writeUInt32BE(size,4)
  ihdr[8]=8;ihdr[9]=6
  return Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),
    chunk('IHDR',ihdr),chunk('IDAT',deflateSync(rows,{level:9})),chunk('IEND',Buffer.alloc(0))
  ])
}
mkdirSync('public',{recursive:true})
for(const [size,name] of [[180,'apple-touch-icon.png'],[192,'icon-192.png'],[512,'icon-512.png']]){
  writeFileSync('public/'+name,render(size))
}
