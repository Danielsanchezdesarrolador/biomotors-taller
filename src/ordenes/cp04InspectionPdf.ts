/** BT-INS-PDF-01: read-only PDF from confirmed CP04 visit findings. No network writes. */
import {PDFDocument,rgb,type PDFPage} from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import {categories} from '../informes/multipunto/multipuntoTemplate'
import {multipuntoTemplateItems,latestForMultipuntoItem,CP04_IMMEDIATE_PREFIX} from './cp04Multipunto'
import {provisionalFinding,CP04_PROVISIONAL_NOTE} from './cp04Autosave'
import type {Finding,OrderWithVehicle} from './cp04Contracts'

export type MultipuntoPdfInput={workshopName:string;order:OrderWithVehicle;findings:readonly Finding[]}
export type MultipuntoPdfRow={id:string;group:string;label:string;
 state:'ok'|'attention'|'immediate'|'unreviewed';note:string;
 resolution:'pending'|'resolved'|'not_applicable'|null;provisional:boolean}
export function multipuntoPdfModel(source:MultipuntoPdfInput){
 const {order}=source
 if(!source.workshopName.trim()||order.order.workshop_id!==order.vehicle.workshop_id||
   order.order.vehicle_id!==order.vehicle.id)throw Error('MULTIPUNTO_PDF_CONTEXT_MISMATCH')
 const allowed=source.findings.filter(f=>f.workshop_id===order.order.workshop_id&&
   f.order_id===order.order.id&&f.vehicle_id===order.vehicle.id)
 const rows:MultipuntoPdfRow[]=multipuntoTemplateItems().map(item=>{
   const found=latestForMultipuntoItem(item,allowed)
   const immediate=found?.result==='attention'&&found.note?.startsWith(CP04_IMMEDIATE_PREFIX)
   const state=found?.result==='ok'?'ok':found?.result==='attention'
     ?(immediate?'immediate':'attention'):'unreviewed'
   const provisional=!!found&&provisionalFinding(found)
   const text=(found?.note||'').replace(/^PRIORIDAD INMEDIATA: /,'').trim()
   return {id:item.id,group:item.category,label:item.name,state,
     note:provisional?CP04_PROVISIONAL_NOTE:text,
     resolution:found?.resolution??null,provisional}
 })
 const count=(state:MultipuntoPdfRow['state'])=>rows.filter(x=>x.state===state).length
 return {rows,order,workshop:source.workshopName.trim(),
   counts:{total:rows.length,ok:count('ok'),attention:count('attention'),
    immediate:count('immediate'),unreviewed:count('unreviewed'),
    provisional:rows.filter(x=>x.provisional).length}}
}

const W=595.28,H=841.89,M=39,CW=W-2*M
const navy=rgb(.06,.14,.29),blue=rgb(.07,.37,.84),muted=rgb(.34,.44,.56)
const pale=rgb(.95,.97,.99),line=rgb(.83,.87,.92),white=rgb(1,1,1)
const green=rgb(.14,.49,.34),amber=rgb(.65,.42,.09),red=rgb(.71,.2,.22)
const clean=(value:string)=>value.replace(/[\u0000-\u001f\u007f]/g,' ').trim()
const dateText=(value:string)=>{const d=new Date(value);return Number.isFinite(d.valueOf())
 ?d.toLocaleDateString('es-CL',{timeZone:'UTC',year:'numeric',month:'2-digit',day:'2-digit'})
 :'Sin fecha registrada'}

export async function multipuntoPdf(source:MultipuntoPdfInput,fontBytes:Uint8Array):Promise<Uint8Array>{
 const model=multipuntoPdfModel(source),pdf=await PDFDocument.create()
 pdf.registerFontkit(fontkit)
 const font=await pdf.embedFont(fontBytes,{subset:true})
 pdf.setTitle('Inspección multipunto - borrador no enviado')
 pdf.setProducer('ByteTorque')
 let page:PDFPage,y=0
 const measure=(text:string,size:number)=>font.widthOfTextAtSize(clean(text),size)
 const put=(text:string,x:number,at:number,size=9,color=navy)=>
   page.drawText(clean(text),{x,y:at,size,font,color})
 function lines(value:string,size:number,width:number):string[]{
   const result:string[]=[]
   for(const paragraph of value.replace(/\r/g,'').split('\n')){
     let current=''
     for(const token of clean(paragraph).split(/\s+/).filter(Boolean)){
       let remaining=token
       const parts:string[]=[]
       while(measure(remaining,size)>width&&remaining.length>1){
         let take=1
         while(take<remaining.length&&measure(remaining.slice(0,take+1),size)<=width)take++
         parts.push(remaining.slice(0,take));remaining=remaining.slice(take)
       }
       parts.push(remaining)
       for(const part of parts){
         if(!current)current=part
         else if(measure(current+' '+part,size)<=width)current+=' '+part
         else{result.push(current);current=part}
       }
     }
     if(current)result.push(current)
   }
   return result.length?result:['Sin información']
 }
 function newPage(continued=false){
   page=pdf.addPage([W,H])
   page.drawRectangle({x:0,y:H-101,width:W,height:101,color:navy})
   page.drawRectangle({x:M,y:H-102,width:85,height:3,color:blue})
   put('BYTETORQUE  /  INFORME TÉCNICO',M,H-27,9.5,white)
   put('INSPECCIÓN MULTIPUNTO',M,H-56,18,white)
   put(continued?'CONTINUACIÓN · BORRADOR NO ENVIADO':'VISTA PREVIA · BORRADOR NO ENVIADO',M,H-78,8.2,white)
   const workshop=lines(model.workshop,8.5,180)[0]
   put(workshop,W-M-measure(workshop,8.5),H-27,8.5,white)
   y=H-123
 }
 function reserve(height:number){if(y-height<63)newPage(true)}
 function section(name:string){
   reserve(40);y-=8
   page.drawRectangle({x:M,y:y-23,width:CW,height:25,color:pale})
   put(name.toUpperCase(),M+9,y-16,9.1)
   y-=35
 }
 const heads=[['COMPONENTE',M+7],['OK',M+311],['AT.',M+354],['URG.',M+408],['S/R',M+469]] as const
 function columnHeads(){heads.forEach(([name,x])=>put(name,x,y,7.1,muted));y-=12}
 newPage()
 const o=model.order.order,v=model.order.vehicle,c=model.counts
 put('TALLER',M,y,7.8,muted);put(lines(model.workshop,10,215)[0],M,y-16,10)
 put('ORDEN DE TRABAJO',M+247,y,7.8,muted);put(o.id,M+247,y-16,7.7)
 y-=41
 page.drawLine({start:{x:M,y},end:{x:W-M,y},color:line,thickness:.8});y-=20
 put('VEHÍCULO',M,y,7.8,muted);put(lines(v.make+' '+v.model,10.2,216)[0],M,y-15,10.2)
 put('PATENTE',M+247,y,7.8,muted);put(v.plate||'Sin patente',M+247,y-15,10.2)
 y-=38
 put('FECHA DE INGRESO',M,y,7.8,muted);put(dateText(o.opened_at),M,y-15,9.2)
 put('KILOMETRAJE',M+247,y,7.8,muted)
 put(o.intake_odometer===null?'Sin registrar':o.intake_odometer.toLocaleString('es-CL')+' km',M+247,y-15,9.2)
 y-=40
 put('MOTIVO DE INGRESO',M,y,7.8,muted);y-=14
 for(const l of lines(o.complaint,8.5,CW-12)){reserve(12);put(l,M+7,y,8.5);y-=12}
 y-=14
 reserve(56)
 page.drawRectangle({x:M,y:y-33,width:CW,height:40,color:pale})
 const badges=[
   ['OK',String(c.ok),green],['ATENCIÓN',String(c.attention),amber],
   ['INMEDIATO',String(c.immediate),red],['SIN REVISAR',String(c.unreviewed),muted]
 ] as const
 badges.forEach(([label,value,color],i)=>{const x=M+13+127*i
   put(label,x,y-7,7.4,muted);put(value,x,y-24,12,color)})
 y-=53
 for(const cat of categories){
   section(cat.name)
   columnHeads()
   for(const item of model.rows.filter(r=>r.group===cat.id)){
     const note=item.note?lines(item.note,7.4,CW-24):[]
     const res=item.resolution==='resolved'?'Resolución registrada':
       item.resolution==='pending'?'Reparación pendiente':''
     const height=19+(note.length+(res?1:0))*10
     if(y-height<63){newPage(true);section(cat.name+' (continuación)');columnHeads()}
     page.drawLine({start:{x:M,y:y+8},end:{x:W-M,y:y+8},color:line,thickness:.55})
     put(item.label,M+7,y-3,8.1)
     for(const [state,x] of [['ok',M+312],['attention',M+356],
       ['immediate',M+410],['unreviewed',M+471]] as const){
       page.drawRectangle({x,y:y-8,width:12,height:12,borderWidth:.8,borderColor:line,
         color:item.state===state
           ?state==='ok'?green:state==='attention'?amber:state==='immediate'?red:muted:white})
       if(item.state===state)put('X',x+2,y-5,8,white)
     }
     y-=17
     for(const l of note){put(l,M+14,y,7.4,muted);y-=10}
     if(res){put(res,M+14,y,7.4,muted);y-=10}
     y-=2
   }
 }
 section('Observaciones del informe')
 const notices=[
   c.unreviewed>0?c.unreviewed+' puntos permanecen sin revisar; no equivalen a OK.':'Se revisaron los 34 componentes del catálogo.',
   c.provisional>0?c.provisional+' observaciones provisionales requieren completar su detalle técnico.':'',
   'Vista previa local: no enviado ni firmado por cliente o taller.',
   'Este documento no certifica la seguridad de circulación ni reparaciones efectuadas.'
 ].filter(Boolean)
 for(const statement of notices){
   for(const l of lines(statement,8.1,CW-20)){reserve(14);put(l,M+7,y,8.1,muted);y-=12}
   y-=5
 }
 const pages=pdf.getPages()
 pages.forEach((p,i)=>{
   p.drawRectangle({x:0,y:0,width:W,height:31,color:navy})
   p.drawText('ByteTorque · Informe multipunto · BORRADOR NO ENVIADO',{x:M,y:12,size:7.5,font,color:white})
   const label=(i+1)+' / '+pages.length
   p.drawText(label,{x:W-M-font.widthOfTextAtSize(label,7.5),y:12,size:7.5,font,color:white})
 })
 return pdf.save({useObjectStreams:false})
}
export async function browserMultipuntoPdf(input:MultipuntoPdfInput):Promise<Uint8Array>{
 const response=await fetch('/cp05/DejaVuSans.ttf')
 if(!response.ok)throw Error('MULTIPUNTO_PDF_FONT_UNAVAILABLE')
 return multipuntoPdf(input,new Uint8Array(await response.arrayBuffer()))
}
export function downloadMultipuntoPdf(bytes:Uint8Array,fileName:string){
 const url=URL.createObjectURL(new Blob([bytes.slice().buffer],{type:'application/pdf'}))
 const a=document.createElement('a');a.href=url;a.download=fileName;a.click()
 setTimeout(()=>URL.revokeObjectURL(url),30000)
}
