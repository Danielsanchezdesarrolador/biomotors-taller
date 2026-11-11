// Ejecutado automáticamente tras build; comprueba artefactos reales.
import { readFileSync, existsSync } from 'node:fs'
const root='dist/'
const manifest=JSON.parse(readFileSync(root+'manifest.webmanifest','utf8'))
const html=readFileSync(root+'index.html','utf8')
if(!html.includes('apple-touch-icon.png')) throw Error('Falta enlace de icono Apple')
if(manifest.display!=='standalone') throw Error('Modo instalable no configurado')
for(const [size,path] of [['192x192','icon-192.png'],['512x512','icon-512.png']]){
  if(!manifest.icons.some(icon=>icon.sizes===size && icon.src==='/' + path)) throw Error('Manifest sin '+path)
  if(!existsSync(root+path)) throw Error('Falta '+path+' en la salida de build')
}
for(const file of ['apple-touch-icon.png','icon-192.png','icon-512.png']){
  const bytes=readFileSync(root+file)
  if(bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a') throw Error('PNG inválido '+file)
}
console.log('PWA assets: PASS')
