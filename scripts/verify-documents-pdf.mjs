import {readFile,writeFile} from 'node:fs/promises'
import assert from 'node:assert/strict'
import {PDFDocument,PDFArray,PDFName,PDFNumber,PDFDict,decodePDFRawStream} from 'pdf-lib'
const file=process.argv[2],pdf=await PDFDocument.load(await readFile(file)),checks=[]
for(const [i,page] of pdf.getPages().entries()){
 const contents=page.node.Contents(),streams=contents instanceof PDFArray?contents.asArray():[contents]
 const text=streams.map(ref=>new TextDecoder().decode(decodePDFRawStream(pdf.context.lookup(ref)).decode())).join('\n')
 const mark=Array.from(text.matchAll(/<424f525241444f52>\s*Tj/gi));assert.equal(mark.length,1)
 const states=page.node.Resources().lookup(PDFName.of('ExtGState'),PDFDict)
 const prefix=text.slice(0,mark[0].index),gs=Array.from(prefix.matchAll(/\/([^\s]+) gs/g)).at(-1);assert.ok(gs)
 const state=states.lookup(PDFName.of(gs[1]),PDFDict);assert.equal(state.lookup(PDFName.of('ca'),PDFNumber).asNumber(),.16)
 const matrices=Array.from(text.matchAll(/([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+) 72 290 Tm/g));assert.ok(matrices.some(m=>Math.abs(Number(m[1])-Math.cos(38*Math.PI/180))<1e-8&&Math.abs(Number(m[2])-Math.sin(38*Math.PI/180))<1e-8))
 assert.ok(Math.abs(page.getWidth()-595.28)<.02&&Math.abs(page.getHeight()-841.89)<.02)
 checks.push({page:i+1,text:'BORRADOR',opacity:.16,rotationDegrees:38,A4:true,status:'PASS'})
}
console.log('SERVER_PDF_WATERMARK_PASS',checks.length)
if(process.argv[3])await writeFile(process.argv[3],JSON.stringify({status:'PASS',pages:checks,source:'Actual server-generated synthetic draft, PDF operators/resources inspected without modification'},null,2)+'\n')
