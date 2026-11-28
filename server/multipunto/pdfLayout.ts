/** Approved CP04 drawing instructions, extracted without changing summary geometry.
 * Shared by new server-authorized draft/final jobs. Legacy renderer stays frozen. */
import {PDFDocument,rgb,degrees,StandardFonts,pushGraphicsState,popGraphicsState,setTextRenderingMode,TextRenderingMode,setLineWidth,setStrokingColor,type RGB as Color,type PDFImage,type PDFPage} from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import type {multipuntoPdfModel,MultipuntoPdfAssets} from '../../src/ordenes/cp04InspectionPdf'
export type MultipuntoTrace={kind:'draft'|'final';createdAt:string;renderer:string;documentId:string;jobId:string;revision:number;snapshotHash:string;historyDigest:string;policyHash:string;policyId:string;additional:readonly {category:string;note:string|null;resolution:string|null}[]}
const W=595.28,H=841.89,M=29,CW=W-2*M
const navy=rgb(.025,.085,.19),blue=rgb(0,.36,.72),cyan=rgb(0,.57,1)
const muted=rgb(.20,.29,.43),pale=rgb(.94,.97,1),line=rgb(.65,.74,.88),white=rgb(1,1,1)
const colors=[rgb(.48,.88,.05),rgb(1,.80,0),rgb(1,.06,.12)]
const clean=(value:string)=>value.replace(/[\u0000-\u001f\u007f]/g,' ').trim()
const dateText=(value:string)=>{const d=new Date(value);return Number.isFinite(d.valueOf())
 ?d.toLocaleDateString('es-CL',{timeZone:'America/Santiago',year:'numeric',month:'2-digit',day:'2-digit'}):'—'}
/** Fixed one-page summary. Notes never drive pagination or get discarded from the record. */
export async function renderMultipuntoLayout(model:ReturnType<typeof multipuntoPdfModel>,fontBytes:Uint8Array,logos:MultipuntoPdfAssets,trace:MultipuntoTrace):Promise<Uint8Array>{
 const pdf=await PDFDocument.create()
 pdf.registerFontkit(fontkit)
 const [font,lightLogo,darkLogo]=await Promise.all([
   pdf.embedFont(fontBytes,{subset:true}),
   pdf.embedPng(logos.light),pdf.embedPng(logos.dark)])
 const draft=trace.kind==='draft',date=new Date(trace.createdAt)
 if(!Number.isFinite(date.valueOf()))throw Error('MULTIPUNTO_PDF_DATE_INVALID')
 pdf.setCreationDate(date);pdf.setModificationDate(date)
 pdf.setTitle(draft?'Inspección Multi Punto · Resumen · Borrador no enviado':'Informe definitivo de inspección multipunto')
 pdf.setProducer('ByteTorque');pdf.setCreator('ByteTorque · '+trace.renderer)
 pdf.setSubject('OT '+model.order.order.id+' · R'+trace.revision+' · '+trace.snapshotHash)
 pdf.setKeywords([trace.renderer,trace.snapshotHash,trace.policyHash,trace.documentId,trace.jobId])
 const page=pdf.addPage([W,H])
 const rect=(x:number,t:number,w:number,h:number,color:Color)=>page.drawRectangle({x,y:H-t-h,width:w,height:h,color})
 function rounded(x:number,t:number,w:number,h:number,color:Color,border?:Color,r=9){
   page.drawSvgPath(`M ${r} 0 H ${w-r} Q ${w} 0 ${w} ${r} V ${h-r} Q ${w} ${h} ${w-r} ${h} H ${r} Q 0 ${h} 0 ${h-r} V ${r} Q 0 0 ${r} 0 Z`,
     {x,y:H-t,color,borderColor:border,borderWidth:border? .55:0})
 }
 const rule=(x:number,t:number,w:number)=>page.drawLine({start:{x,y:H-t},end:{x:x+w,y:H-t},thickness:.5,color:line})
 const vertical=(x:number,t:number,h:number)=>page.drawLine({start:{x,y:H-t},end:{x,y:H-t-h},thickness:.6,color:line})
 function put(value:string,x:number,t:number,size=9,color:Color=navy,strong=false){
   // Embed every glyph: no platform-dependent Helvetica fallback or duplicate text.
   if(strong)page.pushOperators(pushGraphicsState(),setStrokingColor(color),setLineWidth(.22),setTextRenderingMode(TextRenderingMode.FillAndOutline))
   page.drawText(clean(value),{x,y:H-t-size,size,font,color})
   if(strong)page.pushOperators(popGraphicsState())
 }
 function fit(value:string|null|undefined,x:number,t:number,width:number,size=11,strong=false,min=7.5){
   const text=clean(value||'')||'—',face=font
   let actual=size
   while(actual>min&&face.widthOfTextAtSize(text,actual)>width)actual-=.25
   if(face.widthOfTextAtSize(text,actual)>width)throw Error('MULTIPUNTO_PDF_FIELD_TOO_LONG')
   put(text,x,t,actual,navy,strong)
 }
 function gradient(x:number,t:number,w:number,h:number,left:Color,right:Color,r=0){
   for(let i=0;i<100;i++){
     const f=i/99
     const edge=Math.min(w*i/100,w-w*(i+1)/100),inset=r&&edge<r?r-Math.sqrt(r*r-(r-edge)**2):0
     rect(x+w*i/100,t+inset,w/100+.1,h-inset,rgb(left.red+(right.red-left.red)*f,left.green+(right.green-left.green)*f,left.blue+(right.blue-left.blue)*f))
   }
 }
 function logo(image:PDFImage,x:number,t:number,w:number){
   const h=w*image.height/image.width
   page.drawImage(image,{x,y:H-t-h,width:w,height:h})
 }
 const icons={
  general:'M 3 7 L 0 7 L 0 13 L 3 13 L 5 17 L 9 17 L 11 13 L 15 13 L 15 7 L 12 7 L 10 3 L 6 3 Z M 7 8 L 9 8 L 9 11 L 7 11 Z',
  capo:'M 0 5 H 4 V 2 H 9 V 5 H 14 V 8 H 17 V 15 H 3 V 12 H 0 Z',
  bajo:'M 2 8 L 5 2 H 14 L 17 8 V 15 H 0 V 8 Z M 1 10 H 16 M 3 15 V 18 M 14 15 V 18',
  frenos:'M 9 0 A 9 9 0 1 0 9 18 A 9 9 0 1 0 9 0 M 9 5 A 4 4 0 1 0 9 13 A 4 4 0 1 0 9 5 M 9 0 V 3 M 9 15 V 18 M 0 9 H 3 M 15 9 H 18',
  neumaticos:'M 9 0 A 9 9 0 1 0 9 18 A 9 9 0 1 0 9 0 M 9 3 A 6 6 0 1 0 9 15 A 6 6 0 1 0 9 3 M 9 4 L 11 9 L 9 14 L 7 9 Z',
  person:'M 9 0 A 4 4 0 1 0 9 8 A 4 4 0 1 0 9 0 M 1 19 V 16 Q 1 10 9 10 Q 17 10 17 16 V 19 Z',
  clock:'M 10 0 A 10 10 0 1 0 10 20 A 10 10 0 1 0 10 0 M 10 4 V 11 L 15 14',
  tool:'M 12 0 L 9 4 L 12 7 L 16 4 Q 19 11 11 11 L 4 19 L 0 15 L 8 7 Q 5 0 12 0 Z',
  calendar:'M 1 3 H 18 V 20 H 1 Z M 1 8 H 18 M 5 0 V 6 M 14 0 V 6 M 5 11 H 7 M 11 11 H 13 M 5 15 H 7 M 11 15 H 13',
  clipboard:'M 4 3 H 1 V 24 H 20 V 3 H 16 M 7 0 H 14 V 6 H 7 Z M 4 11 L 6 13 L 9 9 M 12 11 H 17 M 4 18 L 6 20 L 9 16 M 12 18 H 17'
 }
 function icon(name:keyof typeof icons,x:number,t:number,scale=1,color:Color=navy){
   page.drawSvgPath(icons[name],{x,y:H-t,scale,borderColor:color,borderWidth:1.2})
 }
 // Institutional banner, official transparent logo and geometric navy/blue detail.
 gradient(0,0,W,49,navy,rgb(.015,.20,.36))
 page.drawSvgPath('M 0 49 L 33 0 H 58 L 25 49 Z',{x:376,y:H,color:cyan})
 page.drawSvgPath('M 0 49 L 33 0 H 53 L 20 49 Z',{x:413,y:H,color:blue})
 logo(darkLogo,31,7,153)
 vertical(207,11,26);put('GESTIÓN DE TALLER',227,11,9,white);put('AUTOMOTRIZ',227,25,9,white)
 rounded(M,62,41,37,rgb(.88,.94,1));icon('clipboard',M+12,68,1.05,cyan)
 put('Inspección Multi Punto',82,61,24,navy,true)
 rounded(84,94,51,4,cyan,undefined,2)
 // Two-tier identification card. Inspection-specific fields absent in CP04 remain unavailable.
 rounded(M,108,CW,68,pale,line)
 icon('person',M+15,116,.85);put('Propietario del vehículo',M+58,113,8.6)
 fit(model.identity?.ownerName,M+58,125,168,12,true)
 vertical(M+232,116,20);icon('tool',M+255,116,.95)
 put('Técnico asignado',M+294,113,8.6);put('—',M+294,125,12)
 rule(M+7,141,CW-14)
 icon('calendar',M+17,148,.8);put('Fecha de visita',M+58,146,8.4);put(dateText(model.order.order.opened_at),M+58,157,11,navy,true)
 vertical(M+184,148,20);icon('clock',M+218,150,.75)
 put('Hora de inicio',M+247,146,8.4);put('—',M+247,157,11)
 vertical(M+362,148,20);icon('clock',M+401,150,.75)
 put('Hora de término',M+430,146,8.4);put('—',M+430,157,11)
 // Vehicle card: use only persisted intake odometer, not a later vehicle reading.
 rounded(M,186,CW,70,pale,line)
 gradient(M+1,187,CW-2,22,rgb(.81,.90,1),rgb(.68,.83,.99),8)
 icon('bajo',M+15,190,.9);put('Vehículo',M+46,188,14,navy,true)
 const v=model.order.vehicle,o=model.order.order
 put('Marca:',M+38,217,8.5);fit(v.make,M+83,215,118,10.5,true)
 vertical(M+207,216,12);put('Modelo:',M+227,217,8.5);fit(v.model,M+275,215,122,10.5,true)
 vertical(M+410,216,12);put('Año:',M+428,217,8.5);fit(model.identity?.modelYear?.toString(),M+468,215,58,10.5,true)
 rule(M+7,232,CW-14)
 put('Combustible:',M+38,241,8.5);put('—',M+112,239,10.5)
 vertical(M+256,238,12);put('Kilometraje:',M+288,241,8.5)
 fit(o.intake_odometer===null?null:o.intake_odometer.toLocaleString('es-CL')+' km',M+402,239,120,10.5,true)
 rounded(M,266,CW,29,rgb(.87,.93,1))
 const legends=[['OK',72],['Requiere Atención',187],['Cambio Inmediato',370]] as const
 legends.forEach(([label,x],i)=>{rounded(x,271,29,18,colors[i],undefined,4);put(label,x+39,274,9.2,navy,true)})
 vertical(173,273,15);vertical(361,273,15)
 const labelOverrides:Record<string,string>={'general/neblina':'Luces de neblinero','capo/aceite-motor':'Aceite de motor',
   'bajo/fuga-aceite':'Fuga de aceite','bajo/fuga-refrigerante':'Fuga de refrigerante','bajo/cremallera':'Cremallera',
   'frenos/discos':'Frenos de disco','frenos/tambores':'Frenos de tambor'}
 function group(id:keyof Pick<typeof icons,'general'|'capo'|'bajo'|'frenos'|'neumaticos'>,title:string,x:number,t:number,w:number,twoColumns:boolean){
   const rows=model.rows.filter(r=>r.group===id),n=twoColumns?rows.length/2:rows.length
   const rowH=14.5,header=24,height=header+7+n*rowH+5
   rounded(x,t,w,height,pale,line)
   gradient(x+1,t+1,w-2,header+4,rgb(.10,.39,.61),rgb(0,.27,.53),8)
   page.drawSvgPath('M 0 24 L 18 0 H 31 L 13 24 Z',{x:x+w-51,y:H-t-1,color:cyan})
   rounded(x+1,t+header-1,w-2,height-header,pale,undefined,8)
   icon(id,x+14,t+4,.86,white);put(title,x+46,t+3,13,white,true)
   const columns=twoColumns?2:1,gap=10,colW=(w-20-(columns-1)*gap)/columns
   rows.forEach((row,i)=>{
     const col=Math.floor(i/n),index=i%n,at=t+header+3+index*rowH,rx=x+10+col*(colW+gap)
     for(let s=0;s<3;s++)rect(rx+s*26,at,26,rowH-.3,colors[s])
     const chosen=['ok','attention','immediate'].indexOf(row.state)
     if(chosen>=0)put('X',rx+chosen*26+9,at-.15,11.6,navy,true)
     rule(rx,at+rowH,colW)
     fit(labelOverrides[row.id]??row.label,rx+88,at+1,colW-90,9.1,false,8)
   })
 }
 group('general','General',M,305,CW,true)
 group('capo','Bajo Capó',M,419,CW,true)
 group('bajo','Bajo Vehículo',M,518,CW,true)
 group('frenos','Estado de Frenos',M,617,(CW-10)/2,false)
 group('neumaticos','Estado de Neumáticos',M+(CW+10)/2,617,(CW-10)/2,false)
 // Institutional footer: no promises of email delivery or certification.
 rounded(M-5,734,CW+10,45,rgb(.94,.96,.99))
 logo(lightLogo,M+6,741,122);vertical(M+143,742,27)
 put('Informe generado por ByteTorque',M+159,740,9,navy,true)
 put(draft?'Resumen visual · Borrador no enviado':'Informe definitivo emitido',M+159,754,8)
 put('Observaciones completas en el expediente.',M+159,766,7.5)
 fit('Taller: '+model.workshop,M,791,CW,8,false,6.5)
 fit('OT: '+o.id+'  ·  Patente: '+(v.plate||'—'),M,804,CW,7.5,false,6.5)
 put('Sin X: no evaluado. No certifica reparaciones ni seguridad de circulación.',M,816,7,muted)
 gradient(0,830,W,12,navy,blue)
 // The approved summary stays fixed; detailed content uses coherent A4 annexes.
 const face=font,appendixWidth=CW
 let sheet:PDFPage|undefined,top=0
 const normalized=(text:string)=>text.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g,' ')
 function lines(value:string,size=9):string[]{
  const result:string[]=[]
  for(const paragraph of normalized(value).split(/\r?\n/)){
   let current=''
   for(const token of paragraph.match(/\S+|[ \t]+/gu)??[]){
    if(current.trim()&&face.widthOfTextAtSize(current+token,size)>appendixWidth){result.push(current.trimEnd());current=''}
    if(!current&&/^\s+$/.test(token))continue
    // Preserve complete words; only a token wider than the printable line is split.
    for(const char of token){if(face.widthOfTextAtSize(current+char,size)>appendixWidth&&current){result.push(current);current=''}current+=char}
   }
   result.push(current)
  }
  return result
 }
 function addAnnex(){
  sheet=pdf.addPage([W,H]);top=H-103
  sheet.drawRectangle({x:0,y:H-49,width:W,height:49,color:navy})
  sheet.drawImage(darkLogo,{x:31,y:H-7-153*darkLogo.height/darkLogo.width,width:153,height:153*darkLogo.height/darkLogo.width})
  sheet.drawText(draft?'BORRADOR':'INFORME DEFINITIVO',{x:305,y:H-30,size:12,font,color:white})
  sheet.drawText('Observaciones y trazabilidad',{x:M,y:H-78,size:16,font,color:navy})
 }
 function block(title:string,body:string[],size=9){
  const content=body.flatMap(t=>lines(t,size)),titles=lines(title,10),height=titles.length*14+7+content.length*(size+4)+10
  if(!sheet||top-height<66&&height<=H-169)addAnnex()
  // Keep each component and all its observations together whenever it fits.
  const heading=()=>{for(const part of titles){sheet!.drawText(part,{x:M,y:top,size:10,font,color:blue});top-=14}top-=7}
  if(top<94){addAnnex()}heading()
  for(const text of content){if(top<66){addAnnex();heading()}sheet!.drawText(text,{x:M,y:top,size,font,color:navy});top-=size+4}
  top-=10
 }
 const reviewed=model.counts.total-model.counts.unreviewed
 block(reviewed<34?'INSPECCIÓN PARCIAL · '+reviewed+'/34 evaluados':'INSPECCIÓN COMPLETA · 34/34 evaluados',[
  'Visita '+dateText(model.order.order.opened_at)+' · Revisión '+trace.revision,
  'Fecha de emisión: '+date.toLocaleString('es-CL',{timeZone:'America/Santiago'}),
  'Sin X: sin revisar. No certifica reparaciones ni seguridad de circulación.'
 ])
 const labels={ok:'OK',attention:'Requiere Atención',immediate:'Cambio Inmediato',unreviewed:'Sin revisar'}
 for(const row of model.rows){
  if(!row.note&&!row.resolution)continue
  block(row.label+' · '+labels[row.state],[...(row.note?['Observaciones: '+row.note]:[]),...(row.resolution?['Seguimiento: '+({pending:'Pendiente',resolved:'Resuelto',not_applicable:'No corresponde'}[row.resolution])]:[])])
 }
 for(const row of trace.additional)block(row.category,[...(row.note?['Observaciones: '+row.note]:[]),...(row.resolution?['Seguimiento: '+({pending:'Pendiente',resolved:'Resuelto',not_applicable:'No corresponde'}[row.resolution]??'Sin registrar')]:[])])
 block('Trazabilidad',[
  'Documento '+trace.documentId,'Operación '+trace.jobId,
  'Snapshot '+trace.snapshotHash,'Historial fuente '+trace.historyDigest,
  'Política '+trace.policyId+' · '+trace.policyHash,'Plantilla '+trace.renderer
 ],7)
 for(const [i,p]of pdf.getPages().entries())if(i>0){
  p.drawLine({start:{x:M,y:47},end:{x:W-M,y:47},thickness:.5,color:line})
  p.drawText('ByteTorque · R'+trace.revision+' · '+(i+1)+'/'+pdf.getPageCount(),{x:M,y:31,size:8,font,color:muted})
  p.drawRectangle({x:0,y:0,width:W,height:12,color:navy})
 }
 const watermarkFont=await pdf.embedFont(StandardFonts.HelveticaBold)
 if(draft)for(const sheet of pdf.getPages())sheet.drawText('BORRADOR',{x:72,y:290,size:82,font:watermarkFont,rotate:degrees(38),opacity:.16,color:rgb(.18,.35,.52)})
 // Mode is supplied only by the trusted server job; never by an HTTP clean flag.
 return pdf.save({useObjectStreams:false})
}
