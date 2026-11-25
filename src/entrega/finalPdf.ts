/** 
 * BT-COM-01 — client-side PDF copies from server-validated, immutable snapshots.
 * NOT a signature, archived original, independent service proof, invoice or email.
 * No network call except fetching public font/logo assets in browserFinalPdf.
 */
import { PDFDocument, rgb, type PDFPage } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import type { PreparedClosing } from './finalPackage'

export type FinalPdfKind = 'report' | 'handover'
const fmt = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 })
const quantity=new Intl.NumberFormat('es-CL',{maximumFractionDigits:2})
const amount = (n: number) => '$' + fmt.format(n) + ' CLP'
const date = (s: string) => {
  const at = new Date(s)
  if (!Number.isFinite(at.valueOf())) throw Error('INVALID_DOCUMENT_DATE')
  return new Intl.DateTimeFormat('es-CL', {
    timeZone: 'America/Santiago', dateStyle: 'medium', timeStyle: 'short'
  }).format(at)
}

export async function closingDocumentPdf(
  packet: PreparedClosing,
  kind: FinalPdfKind,
  assets: { font: Uint8Array; logo: Uint8Array; wordmark?:Uint8Array }
): Promise<Uint8Array> {
  if (packet.state !== 'prepared_locally_not_archived_or_emailed' ||
      !['report','handover'].includes(kind) ||
      !packet.bundleId || !packet.quote.revisionId ||
      !packet.report.id || !packet.handover.id)
    throw Error('INVALID_CLOSING_PACKET')
  const doc = await PDFDocument.create()
  doc.registerFontkit(fontkit)
  const font = await doc.embedFont(assets.font, { subset: true })
  const logo = await doc.embedPng(assets.logo)
  const wordmark=assets.wordmark?await doc.embedPng(assets.wordmark):null
  const W=595.28,H=841.89,m=28,width=W-2*m
  const navy=rgb(.025,.10,.19),blue=rgb(.0,.38,.88),cyan=rgb(0,.65,1),gray=rgb(.30,.38,.48),light=rgb(.94,.97,1),white=rgb(1,1,1),green=rgb(.0,.44,.23)
  const heading=kind==='report'?'INFORME DE TRABAJOS REALIZADOS':'CONSTANCIA DE ENTREGA'
  const sourceDate=kind==='report'?packet.report.recordedAt:packet.handover.recordedAt
  const ref='OT · '+(packet.order.id.slice(0,8)+'-'+packet.order.id.slice(-4)).toUpperCase()
  doc.setTitle(heading+' - '+ref);doc.setAuthor(packet.workshop.name);doc.setCreator('ByteTorque')
  doc.setProducer('ByteTorque — documento informativo')
  doc.setCreationDate(new Date(sourceDate));doc.setModificationDate(new Date(sourceDate))
  let page!:PDFPage,y=0
  const text=(value:string,x:number,top:number,size=9,color=navy)=>page.drawText(value,{x,y:top,font,size,color})
  function start(){
    page=doc.addPage([W,H]);page.drawRectangle({x:0,y:H-76,width:W,height:76,color:navy})
    for(let i=0;i<12;i++)page.drawRectangle({x:W-130+i*10,y:H-76,width:10,height:3+i*2,color:i%2?blue:cyan})
    if(wordmark){const scale=162/wordmark.width;page.drawImage(wordmark,{x:m,y:H-85,width:wordmark.width*scale,height:wordmark.height*scale})}
    else{page.drawImage(logo,{x:m,y:H-57,width:38,height:38});text('Byte',m+44,H-38,17,white);text('Torque',m+83,H-38,17,cyan)}
    page.drawLine({start:{x:202,y:H-18},end:{x:202,y:H-60},thickness:.7,color:rgb(.7,.8,.9)})
    let size=15;while(font.widthOfTextAtSize(heading,size)>W-222-m)size-=.25
    text(heading,216,H-34,size,white);text(kind==='report'?'INFORME TÉCNICO':'REGISTRO DEL TALLER',216,H-53,9,rgb(.75,.86,1))
    page.drawRectangle({x:m,y:30,width,height:37,color:light})
    text('COPIA INFORMATIVA · NO TRIBUTARIA · SIN FIRMA DEL CLIENTE',m+10,53,8)
    text('No acredita pago, conformidad ni entrega física verificada.',m+10,40,7.5,gray)
    page.drawRectangle({x:0,y:0,width:W,height:12,color:navy});y=H-94
  }
  function ensure(h:number){if(y-h<83)start()}
  function lines(value:string,max:number,size=9){
    const out:string[]=[]
    for(const para of String(value).replace(/\r/g,'').split('\n')){
      let row=''
      for(const word of para.split(/\s+/).filter(Boolean)){
        if(row&&font.widthOfTextAtSize(row+word,size)>max){out.push(row.trimEnd());row=''}
        for(const char of word+' '){if(font.widthOfTextAtSize(row+char,size)>max){out.push(row.trimEnd());row=''}row+=char}
      }
      out.push(row.trimEnd())
    }
    return out
  }
  function paragraph(value:string,size=9,color=navy,tail=0){const rows=lines(value,width-18,size);for(const [index,row] of rows.entries()){const remaining=rows.length-index;if(tail&&remaining<=Math.ceil((220-tail)/(size+5))&&remaining*(size+5)+tail>y-83)start();ensure(size+5);text(row,m+9,y,size,color);y-=size+5}y-=4}
  function section(label:string,symbol='◆',reserve=52){
    ensure(reserve);y-=5
    for(let i=0;i<18;i++)page.drawRectangle({x:m+i*width/18,y:y-20,width:width/18+.2,height:23,color:rgb(.89+i*.003,.95+i*.001,.99)})
    page.drawRectangle({x:m,y:y-20,width:4,height:23,color:cyan})
    page.drawCircle({x:m+17,y:y-9,size:7,borderWidth:.7,borderColor:blue});text(symbol,m+13,y-12,9,blue);text(label,m+31,y-13,11);y-=32
  }
  function pair(label:string,value:string,x:number,w:number){
    const rows=lines(value,w-10,9);const h=rows.length*12+17
    text(label,x,y,7.5,gray);rows.forEach((r,i)=>text(r,x,y-13-i*12,9));return h
  }
  start()
  const fields=[['Taller',packet.workshop.name],['Cliente',packet.customer.name],['Vehículo',packet.vehicle.description],['Patente',packet.vehicle.plate||'No registrada'],['Referencia de orden',ref],['Cotización','COT-'+String(packet.quote.number).padStart(6,'0')+' · Revisión '+packet.quote.revision],['Ingreso registrado',date(packet.order.openedAt)],['Kilometraje',packet.order.odometer===null?'No registrado':fmt.format(packet.order.odometer)+' km']]
  for(let i=0;i<fields.length;i+=2){const l=fields[i],r=fields[i+1];const h=Math.max(lines(l[1],width/2-20).length,lines(r[1],width/2-25).length)*12+18;ensure(h);page.drawRectangle({x:m,y:y-h+7,width,height:h,color:light});pair(l[0],l[1],m+10,width/2-10);pair(r[0],r[1],m+width/2+8,width/2-15);y-=h}
  paragraph('Motivo de ingreso: '+packet.order.complaint,8)
  section(kind==='report'?'Datos del informe':'Registro de entrega','◷')
  paragraph('Fecha: '+date(sourceDate)+' · Responsable del taller: personal del taller registrado.',8)
  if(kind==='report'){
    section('Trabajos realizados / Trabajos registrados','⚒')
    const cols=[m,m+24,m+260,m+332,m+376,m+455]
    function tableHead(){ensure(48);page.drawRectangle({x:m,y:y-20,width,height:22,color:navy});['#','Descripción','Tipo','Cantidad','Estado','Neto CLP'].forEach((v,i)=>text(v,cols[i]+4,y-13,8,white));y-=24}
    tableHead()
    for(const [index,item] of packet.report.lines.entries()){
      const content=[String(index+1),item.description,item.type,quantity.format(item.quantity100/100),item.decision==='performed'?'✓ Realizado':'No realizado',amount(item.lineNet)]
      const widths=[24,236,72,44,79,84]
      const cells=content.map((v,i)=>lines(v,widths[i]-8,8))
      const count=Math.max(...cells.map(c=>c.length))
      // Split unusually long rows into safe fragments, repeating the header on continuation.
      for(let from=0;from<count;){if(y-24<83){start();tableHead()}
        const take=Math.min(count-from,Math.max(1,Math.floor((y-93)/12))),h=Math.max(25,take*12+10)
        if(y-h<83){start();tableHead();continue}
        page.drawRectangle({x:m,y:y-h+4,width,height:h,color:index%2?white:light})
        page.drawRectangle({x:cols[4]+2,y:y-h+7,width:75,height:h-6,color:item.decision==='performed'?rgb(.87,.98,.90):rgb(1,.94,.87)})
        cells.forEach((cell,i)=>cell.slice(from,from+take).forEach((v,j)=>{const color=i===4?(item.decision==='performed'?green:rgb(.65,.27,.10)):navy;const x=i===5?m+width-5-font.widthOfTextAtSize(v,8):cols[i]+4;text(v,x,y-11-j*12,8,color)}))
        y-=h;from+=take
      }
    }
  }else{
    paragraph('Modalidad de entrega: '+({in_person:'Presencial',authorized_pickup:'Retiro por tercero autorizado',other:'Otra modalidad'}[packet.handover.method]||'Modalidad no disponible'),9)
    section('Comprobaciones registradas por el responsable','✓')
    for(const check of packet.handover.checks)paragraph('✓ '+check,9,green)
    section('Observaciones del responsable','✎');paragraph(packet.handover.note)
  }
  section(kind==='report'?'Importes informativos · CLP':'Montos relacionados con la ejecución','$',115)
  ensure(78)
  const original=packet.report.original,executed=packet.report.declared
  text('Total cotizado: '+amount(original.total),m+8,y-8,9)
  text('Trabajos realizados: '+amount(executed.total),m+8,y-27,9)
  text('Diferencia: '+amount(original.total-executed.total),m+8,y-46,9)
  const x=m+width*.57,w=width*.43
  page.drawRectangle({x,y:y-64,width:w,height:75,color:light})
  for(const [i,[label,value]] of [['Subtotal neto',executed.net],['IVA (19 %)',executed.tax],['Total',executed.total]].entries()){
    const top=y-i*23
    if(i===2)page.drawRectangle({x,y:top-13,width:w,height:25,color:blue})
    text(String(label),x+9,top-5,9,i===2?white:navy)
    const valueText=amount(Number(value));text(valueText,x+w-8-font.widthOfTextAtSize(valueText,9),top-5,9,i===2?white:navy)
  }
  y-=80
  const scopeText=kind==='report'?'Los trabajos fueron registrados como realizados por personal del taller. Este informe no demuestra de forma independiente su ejecución ni acredita autorización firmada del cliente. No es factura, boleta ni comprobante de pago.':'Esta constancia registra la declaración del responsable del taller. No constituye firma ni conformidad verificada del cliente, comprobante de pago ni prueba independiente de entrega física.'
  const backupText='Respaldo documental: elaborado a partir de los registros digitales de esta visita en ByteTorque.'
  const tail=37+lines(scopeText,width-18,8).length*13+4+lines(backupText,width-18,7.5).length*12.5+4
  const pending=packet.report.pendingNote||'Sin trabajos pendientes registrados.'
  section('Trabajos pendientes y observaciones','✎',Math.min(220,37+lines(pending,width-18,9).length*14+4+tail));paragraph(pending,9,navy,tail)
  section(kind==='report'?'Alcance del informe':'Alcance de la constancia','i',tail)
  paragraph(scopeText,8)
  // This renderer runs before archive commit: never claim an archive already exists.
  paragraph(backupText,7.5,gray)
  doc.getPages().forEach((p,i)=>p.drawText('Página '+(i+1)+' de '+doc.getPageCount(),{x:W-m-77,y:18,font,size:8,color:gray}))
  return doc.save({ useObjectStreams: false })
}

export async function browserClosingDocumentPdf(
  packet: PreparedClosing, kind: FinalPdfKind
): Promise<Uint8Array> {
  const [font, logo, wordmark]=await Promise.all([
    fetch('/cp05/DejaVuSans.ttf'), fetch('/icon-192.png'), fetch('/cp05/wordmark.png')
  ])
  if(!font.ok || !logo.ok || !wordmark.ok) throw Error('PDF_ASSETS_UNAVAILABLE')
  return closingDocumentPdf(packet,kind,{
    font:new Uint8Array(await font.arrayBuffer()),
    logo:new Uint8Array(await logo.arrayBuffer()),wordmark:new Uint8Array(await wordmark.arrayBuffer())
  })
}
