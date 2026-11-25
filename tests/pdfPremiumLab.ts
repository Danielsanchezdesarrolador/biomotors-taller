import{readFile,mkdir,writeFile}from'node:fs/promises'
import{closingDocumentPdf}from'../src/entrega/finalPdf'
import{prepareClosingPacket}from'../src/entrega/finalPackage'
import{finalArchiveFixture}from'./fixtures/finalArchive'
import{PDFDocument}from'pdf-lib'
import assert from'node:assert/strict'
const out='/workspace/work/pdf-premium';await mkdir(out,{recursive:true})
const f=await finalArchiveFixture(),s=f.snapshot,p=prepareClosingPacket(s.quote,s.revision,s.evidence)
const assets={font:new Uint8Array(await readFile('public/cp05/DejaVuSans.ttf')),logo:new Uint8Array(await readFile('assets/brand/generated/icon-192.png')),wordmark:new Uint8Array(await readFile('public/cp05/wordmark.png'))}
assert.equal(p.report.declared.total,119);assert.equal(p.report.original.total,179)
for(const kind of['report','handover']as const){for(const long of[false,true]){const data=structuredClone(p)
 if(long){data.order.complaint='Motivo ficticio extenso. '.repeat(120);data.report.lines=Array.from({length:70},(_,i)=>({...p.report.lines[i%2],id:'00000000-0000-4000-8000-'+String(i+100).padStart(12,'0'),description:'Partida ficticia '+i+' '+('Revisión técnica de componentes. '.repeat(7))}));const net=data.report.lines.reduce((n,x)=>n+x.lineNet,0),done=data.report.lines.filter(x=>x.decision==='performed').reduce((n,x)=>n+x.lineNet,0);data.report.original={net,tax:Math.floor((net*19+50)/100),total:net+Math.floor((net*19+50)/100)};data.report.declared={net:done,tax:Math.floor((done*19+50)/100),total:done+Math.floor((done*19+50)/100)};data.quote.total=data.report.original.total;data.report.pendingNote='Pendiente ficticio sin pérdida de información. '.repeat(250);data.handover.note='Observación de entrega ficticia. '.repeat(140)}
 const bytes=await closingDocumentPdf(data,kind,assets),doc=await PDFDocument.load(bytes)
 assert(doc.getPages().every(x=>Math.abs(x.getWidth()-595.28)<.01&&Math.abs(x.getHeight()-841.89)<.01))
 if(!long)assert.equal(doc.getPageCount(),1)
 await writeFile(out+'/'+kind+(long?'-extenso':'')+'.pdf',bytes)
 console.log(kind,long?'extended':'normal',doc.getPageCount(),'pages')
}}
