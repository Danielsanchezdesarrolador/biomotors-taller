import {PDFDocument,rgb,type PDFFont,type PDFPage} from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import type {Finding} from '../../src/ordenes/cp04Contracts'
import {projectSnapshot} from './snapshot'
import {multipuntoPdf} from '../../src/ordenes/cp04InspectionPdf'
import {sha,MPError,type MPWorker} from './protocol'
export type MPAssets={font:Uint8Array;light:Uint8Array;dark:Uint8Array}
export const MP_RENDERER='BT-MP-FINAL-1'
/** Layout is pinned by policy/assets and rendered only in the trusted service. */
export async function renderMultipunto(work:MPWorker,assets:MPAssets):Promise<Uint8Array>{
 const s=projectSnapshot(work.snapshot),p=s.policy
 if(!['MP-SNAPSHOT-1/PG17','MP-SNAPSHOT-2/PG17'].includes(s.schema)||p.renderer!==MP_RENDERER||s.items.length!==34||new Set(s.items.map(i=>i.id)).size!==34||await sha(new TextEncoder().encode(work.canonical))!==work.snapshotHash)throw new MPError('MP_POLICY_MISMATCH',503)
 for(const key of ['font','light','dark'] as const)if(p[key]!==await sha(assets[key]))throw new MPError('MP_ASSET_MISMATCH',503)
 if(work.job.kind==='draft'){
  // Preserve the approved watermarked summary; the request cannot remove the mark.
  const findings:Finding[]=s.items.filter(i=>i.state!=='unreviewed').map((i,n)=>({id:'00000000-0000-4000-8000-'+String(n+1).padStart(12,'0'),workshop_id:s.scope.workshopId,order_id:s.scope.orderId,vehicle_id:s.vehicle.id,category:'Multipunto · '+i.name,result:i.state==='ok'?'ok':'attention',note:i.note,resolution:i.resolution as Finding['resolution'],created_at:work.job.created_at,updated_at:work.job.created_at,recorded_by:s.scope.workshopId,resolved_at:null}))
  return multipuntoPdf({workshopName:String(s.profile?.commercial_name||s.workshop.name),order:{order:{...s.order,complaint:'',opened_by:s.scope.workshopId,closed_at:null,updated_at:work.job.created_at},vehicle:{...s.vehicle,plate_key:null,odometer_km:null}},findings,identity:{workshop_id:s.scope.workshopId,order_id:s.scope.orderId,vehicle_id:s.vehicle.id,customer_id:s.customer.id,ownerName:s.customer.full_name,modelYear:s.vehicle.model_year}},assets.font,{light:assets.light,dark:assets.dark})
 }
 const pdf=await PDFDocument.create();pdf.registerFontkit(fontkit)
 const font=await pdf.embedFont(assets.font,{subset:true}),logo=await pdf.embedPng(assets.light)
 const date=new Date(work.job.created_at);pdf.setCreationDate(date);pdf.setModificationDate(date)
 pdf.setTitle('Informe definitivo de inspección multipunto');pdf.setCreator('ByteTorque');pdf.setProducer(MP_RENDERER)
 const navy=rgb(.025,.085,.19),blue=rgb(0,.36,.8),muted=rgb(.25,.32,.42),W=595.28,H=841.89,M=32,width=W-2*M
 let page:PDFPage,y=0
 function add(){page=pdf.addPage([W,H]);y=H-36;page.drawImage(logo,{x:M,y:y-26,width:115,height:115*logo.height/logo.width});page.drawText('INFORME DEFINITIVO',{x:300,y:y-8,size:13,font,color:navy});y-=54}
 function line(text:string,size=9,color=navy){if(y<58)add();page.drawText(text,{x:M,y,size,font,color});y-=size+6}
 function wrap(value:unknown,size=9,face:PDFFont=font){
  // Character wrapping preserves complete notes, including a single very long token.
  const text=String(value??'').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g,' ')
  for(const paragraph of text.split(/\r?\n/)){let current='';for(const c of paragraph){if(face.widthOfTextAtSize(current+c,size)>width&&current){line(current,size);current=''}current+=c}line(current,size)}
 }
 add();wrap(s.profile?.commercial_name||s.workshop.name,15)
 wrap([s.profile?.address,s.profile?.phone,s.profile?.contact_email].filter(Boolean).join(' · '))
 wrap('Revisión '+work.job.revision+' · '+date.toLocaleString('es-CL',{timeZone:'America/Santiago'}))
 wrap('Orden '+s.scope.orderId+' · Patente '+String(s.vehicle.plate??''))
 wrap([s.vehicle.make,s.vehicle.model,s.vehicle.model_year,'Km '+String(s.order.intake_odometer??'Sin registrar')].filter(Boolean).join(' · '))
 wrap('Cliente: '+String(s.customer.full_name??''))
 const count=s.items.filter(i=>i.state!=='unreviewed').length
 line(count<34?'INSPECCIÓN PARCIAL · '+count+'/34 evaluados':'INSPECCIÓN COMPLETA · 34/34 evaluados',11,blue)
 const labels={ok:'OK',attention:'ATENCIÓN',immediate:'PRIORIDAD INMEDIATA',unreviewed:'SIN REVISAR'}
 for(const [n,item] of s.items.entries()){
  wrap((n+1)+'. '+item.name+' — '+labels[item.state],10)
  if(item.note)wrap('Observaciones: '+item.note)
  if(item.resolution)wrap('Seguimiento: '+({pending:'Pendiente',resolved:'Resuelto',not_applicable:'No corresponde'}[item.resolution]??'Sin registrar'))
 }
 if(s.additional.length){line('ANEXO · Observaciones adicionales',12,blue);for(const row of s.additional){wrap(String(row.category??''),10);wrap(row.note);if(row.resolution)wrap('Seguimiento: '+({pending:'Pendiente',resolved:'Resuelto',not_applicable:'No corresponde'}[String(row.resolution)]??'Sin registrar'))}}
 line('Trazabilidad',12,blue);wrap('Documento '+work.job.document_id);wrap('Snapshot '+work.snapshotHash,7);wrap('Historial fuente '+s.historyDigest,7);wrap('Plantilla '+MP_RENDERER+' · '+s.policyHash,7)
 const pages=pdf.getPages();for(const [n,p] of pages.entries()){p.drawLine({start:{x:M,y:37},end:{x:W-M,y:37},thickness:.5,color:muted});p.drawText('ByteTorque · R'+work.job.revision+' · '+(n+1)+'/'+pages.length,{x:M,y:24,size:8,font,color:muted})}
 // Final route never accepts a watermark/clean flag from the client.
 return pdf.save({useObjectStreams:false})
}
