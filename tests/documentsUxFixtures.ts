/** Synthetic offline assets for focused browser tests, not product routes. */
import {PDFDocument,StandardFonts} from 'pdf-lib'
import {readFile,writeFile,mkdir} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {originalArchiveZip} from '../src/expedientes/originalZip'
import {multipuntoPdf} from '../src/ordenes/cp04InspectionPdf'
import type {ArchiveDocumentSet} from '../src/expedientes/contracts'
const out=process.argv[2];if(!out?.startsWith('/tmp/'))throw Error('ONLY_TEMP_SYNTHETIC_OUTPUT')
await mkdir(out,{recursive:true})
const id=(n:number)=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0'),wid=id(1),rid=id(6),qid=id(5),oid=id(4),vid=id(3),cid=id(2)
const files:Uint8Array[]=[]
for(const title of ['Cotizacion original sintetica','Informe de ejecucion original sintetico','Constancia de entrega original sintetica']){const pdf=await PDFDocument.create();const font=await pdf.embedFont(StandardFonts.Helvetica);const page=pdf.addPage([595.28,841.89]);page.drawText('ByteTorque',{x:48,y:780,size:26,font});page.drawText(title,{x:48,y:720,size:18,font});page.drawText('Datos ficticios - Archivo de pruebas',{x:48,y:680,size:12,font});files.push(await pdf.save())}
const hash=(b:Uint8Array)=>createHash('sha256').update(b).digest('hex')
const set:ArchiveDocumentSet={workshopId:wid,revisionId:rid,quoteId:qid,orderId:oid,vehicleId:vid,customerId:cid,revision:1,issuedAt:'2026-11-27T12:00:00Z',complete:true,documents:(['quote','report','handover'] as const).map((kind,i)=>({kind,fileName:kind+'.pdf',bucket:i===0?'cp05-quote-documents':'bt-closing-documents',path:i===0?wid+'/quotes/'+qid+'/r1/'+'a'.repeat(64)+'.pdf':wid+'/closings/'+oid+'/'+rid+'/'+id(8)+'/'+kind+'/'+hash(files[i])+'.pdf',sha256:hash(files[i]),byteLength:files[i].length,contentType:'application/pdf'}))}
const result=await originalArchiveZip(set,files)
for(let i=0;i<3;i++)await writeFile(out+'/original-'+i+'.pdf',files[i])
await writeFile(out+'/originals.zip',result.bytes);await writeFile(out+'/manifest.json',JSON.stringify(set,null,2)+'\n')
const order={order:{id:oid,workshop_id:wid,vehicle_id:vid,status:'ready' as const,complaint:'Inspección sintética',intake_odometer:120000,opened_by:id(7),opened_at:'2026-11-27T12:00:00Z',closed_at:null,updated_at:'2026-11-27T12:00:00Z'},vehicle:{id:vid,workshop_id:wid,customer_id:cid,plate:'QA1234',plate_key:'QA1234',make:'Sintético',model:'Prueba',odometer_km:120000}}
await writeFile(out+'/multipunto.pdf',await multipuntoPdf({workshopName:'Taller sintético',order,findings:[],identity:{workshop_id:wid,order_id:oid,vehicle_id:vid,customer_id:cid,ownerName:'Cliente ficticio',modelYear:2020}},new Uint8Array(await readFile('public/cp05/DejaVuSans.ttf')),{light:new Uint8Array(await readFile('apps/android/assets/brand/logo-horizontal.png')),dark:new Uint8Array(await readFile('apps/android/assets/brand/logo-horizontal-dark.png'))}))
console.log('SYNTHETIC_DOCUMENT_FIXTURES_READY')
