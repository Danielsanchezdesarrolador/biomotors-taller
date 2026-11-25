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
  assets: { font: Uint8Array; logo: Uint8Array; wordmark?:Uint8Array;boldFont?:Uint8Array }
): Promise<Uint8Array> {
  if (packet.state !== 'prepared_locally_not_archived_or_emailed' ||
      !['report','handover'].includes(kind) ||
      !packet.bundleId || !packet.quote.revisionId ||
      !packet.report.id || !packet.handover.id)
    throw Error('INVALID_CLOSING_PACKET')
  const doc = await PDFDocument.create()
  doc.registerFontkit(fontkit)
  const font = await doc.embedFont(assets.font, { subset: true })
  const bold=await doc.embedFont(assets.boldFont??assets.font,{subset:true})
  const logo = await doc.embedPng(assets.logo)
  const wordmark=assets.wordmark?await doc.embedPng(assets.wordmark):null
  const W=595.28,H=841.89,m=28,width=W-2*m
  const navy=rgb(.025,.10,.19),blue=rgb(.0,.38,.88),cyan=rgb(0,.65,1),gray=rgb(.30,.38,.48),light=rgb(.94,.97,1),white=rgb(1,1,1),green=rgb(.0,.44,.23)
  const heading=kind==='report'?'INFORME DE TRABAJOS REALIZADOS':'CONSTANCIA DE ENTREGA'
  const sourceDate=kind==='report'?packet.report.recordedAt:packet.handover.recordedAt
  const ref='OT · '+packet.order.id.slice(-8).toUpperCase()
  doc.setTitle(heading+' - '+ref);doc.setAuthor(packet.workshop.name);doc.setCreator('ByteTorque')
  doc.setProducer('ByteTorque — documento informativo')
  doc.setCreationDate(new Date(sourceDate));doc.setModificationDate(new Date(sourceDate))
  let page!:PDFPage,y=0
  const text=(value:string,x:number,top:number,size=9,color=navy)=>page.drawText(value,{x,y:top,font,size,color})
  function strong(value:string,x:number,top:number,size=10,color=navy){let face=bold;try{bold.encodeText(value)}catch{face=font}page.drawText(value,{x,y:top,font:face,size,color})}
  function rounded(x:number,top:number,w:number,h:number,r=7,fill=light,stroke=rgb(.75,.85,.97)){
    page.drawSvgPath(`M ${r} 0 H ${w-r} C ${w} 0 ${w} 0 ${w} ${r} V ${h-r} C ${w} ${h} ${w} ${h} ${w-r} ${h} H ${r} C 0 ${h} 0 ${h} 0 ${h-r} V ${r} C 0 0 0 0 ${r} 0 Z`,{x,y:top,color:fill,borderColor:stroke,borderWidth:.6})
  }
  const icons:Record<string,string>={
    home:'M2 10 L12 2 L22 10 M5 9 V22 H19 V9 M9 22 V14 H15 V22 M8 10 H16',
    user:'M16 6 C16 12 8 12 8 6 C8 0 16 0 16 6 M3 22 V19 C3 12 21 12 21 19 V22 Z',
    car:'M3 10 L6 4 H18 L21 10 M2 10 H22 V19 H2 Z M5 19 V22 M19 19 V22 M5 14 H8 M16 14 H19',
    plate:'M2 5 H22 V20 H2 Z M6 9 V16 M10 9 H14 V12 H10 V16 H14 M18 9 V16',
    calendar:'M3 5 H21 V22 H3 Z M7 2 V8 M17 2 V8 M3 10 H21 M7 14 H9 M14 14 H16 M7 18 H9',
    gauge:'M3 19 C-2 0 26 0 21 19 M12 14 L17 7 M6 10 L4 8 M12 6 V3 M18 10 L21 8',
    wrench:'M14 3 C21-1 26 6 20 11 L10 21 C5 26-1 20 4 16 L14 6 Z M14 3 L17 7 L21 3',
    clipboard:'M8 4 V2 H16 V4 M8 4 H4 V23 H20 V4 H16 M8 4 H16 V7 H8 Z M8 12 H16 M8 16 H16 M8 20 H13',
    file:'M5 2 H15 L21 8 V23 H5 Z M15 2 V8 H21 M9 13 H17 M9 17 H17',
    layers:'M2 7 L12 1 L22 7 L12 13 Z M2 12 L12 18 L22 12 M2 17 L12 23 L22 17',
    clock:'M22 12 C22 25 2 25 2 12 C2-1 22-1 22 12 M12 5 V12 L17 15',
    coins:'M2 6 C2 0 18 0 18 6 C18 12 2 12 2 6 Z M2 6 V16 C2 22 18 22 18 16 V6 M2 11 C2 17 18 17 18 11 M18 10 H23 V20 C23 24 15 25 12 23',
    note:'M5 3 H21 V19 H17 L13 23 H5 Z M9 8 H17 M9 12 H17 M9 16 H13',
    shield:'M12 2 L22 6 V13 C22 19 16 23 12 25 C8 23 2 19 2 13 V6 Z M7 13 L11 17 L18 9',
    box:'M2 6 L12 1 L22 6 V19 L12 24 L2 19 Z M2 6 L12 12 L22 6 M12 12 V24',
    check:'M4 12 L10 18 L21 5',minus:'M4 12 H20',
    info:'M22 12 C22 25 2 25 2 12 C2-1 22-1 22 12 M12 10 V19 M12 5 V7'
  }
  function icon(key:string,x:number,top:number,size=17,color=blue){page.drawSvgPath(icons[key]||icons.file,{x,y:top,scale:size/24,borderColor:color,borderWidth:1.65})}
  function start(){
    page=doc.addPage([W,H]);page.drawRectangle({x:0,y:H-76,width:W,height:76,color:navy})
    page.drawSvgPath('M 370 76 C 460 72 530 52 596 16 L596 76 Z',{x:0,y:H,color:blue})
    page.drawSvgPath('M 400 76 C 485 75 542 58 596 35 L596 52 C 540 72 495 78 400 76 Z',{x:0,y:H,color:cyan})
    if(wordmark){const scale=162/wordmark.width;page.drawImage(wordmark,{x:m,y:H-85,width:wordmark.width*scale,height:wordmark.height*scale})}
    else{page.drawImage(logo,{x:m,y:H-57,width:38,height:38});text('Byte',m+44,H-38,17,white);text('Torque',m+83,H-38,17,cyan)}
    page.drawLine({start:{x:202,y:H-18},end:{x:202,y:H-60},thickness:.7,color:rgb(.7,.8,.9)})
    let size=15;while(font.widthOfTextAtSize(heading,size)>W-222-m)size-=.25
    strong(heading,216,H-34,size,white);text(kind==='report'?'INFORME TÉCNICO':'REGISTRO DEL TALLER',216,H-53,9,rgb(.75,.86,1))
    rounded(m,76,width,43,8)
    icon('info',m+12,64,21,navy)
    strong('COPIA INFORMATIVA · NO TRIBUTARIA · SIN FIRMA DEL CLIENTE',m+43,60,7.5)
    text('No acredita pago, conformidad ni entrega física verificada.',m+43,45,7.5,gray)
    page.drawLine({start:{x:W-m-106,y:40},end:{x:W-m-106,y:68},thickness:.5,color:rgb(.6,.75,.9)});icon('file',W-m-95,65,17)
    page.drawRectangle({x:0,y:0,width:W,height:16,color:navy})
    page.drawSvgPath('M 240 16 C 340 16 475 11 550 0 H596 V16 Z',{x:0,y:16,color:blue})
    page.drawSvgPath('M 350 16 C 445 14 530 9 596 1 V7 C 520 14 455 17 350 16 Z',{x:0,y:16,color:cyan})
    y=H-94
  }
  function ensure(h:number){if(y-h<83)start()}
  function lines(value:string,max:number,size=9,face=font){
    const out:string[]=[]
    for(const para of String(value).replace(/\r/g,'').split('\n')){
      let row=''
      for(const word of para.split(/\s+/).filter(Boolean)){
        if(row&&face.widthOfTextAtSize(row+word,size)>max){out.push(row.trimEnd());row=''}
        for(const char of word+' '){if(face.widthOfTextAtSize(row+char,size)>max){out.push(row.trimEnd());row=''}row+=char}
      }
      out.push(row.trimEnd())
    }
    return out
  }
  function paragraph(value:string,size=9,color=navy,tail=0){const rows=lines(value,width-18,size);if(rows.length*(size+5)+10<y-83&&rows.length<8)rounded(m,y+8,width,rows.length*(size+5)+9,6);for(const [index,row] of rows.entries()){const remaining=rows.length-index;if(tail&&remaining<=Math.ceil((220-tail)/(size+5))&&remaining*(size+5)+tail>y-83)start();ensure(size+5);text(row,m+9,y,size,color);y-=size+5}y-=4}
  function section(label:string,symbol='file',reserve=52){
    ensure(reserve);y-=4
    rounded(m,y+4,width,25,6,rgb(.88,.94,1))
    rounded(m,y+4,4,25,2,cyan,cyan)
    icon(symbol,m+12,y,17);strong(label,m+38,y-13,12);y-=kind==='report'?39:33
  }
  start()
  const left=[['home','Taller',packet.workshop.name],['user','Cliente',packet.customer.name],['car','Vehículo',packet.vehicle.description],['plate','Patente',packet.vehicle.plate||'No registrada']]
  const reasonLines=lines(packet.order.complaint,width/2-110,9.5,bold),longReason=reasonLines.length>3?reasonLines.slice(2).join(' '):''
  const right=[['clipboard','OT (ref.)',ref],['file','Cotización','COT-'+String(packet.quote.number).padStart(6,'0')+' · Revisión '+packet.quote.revision],['calendar','Ingreso',date(packet.order.openedAt)],['gauge','Kilometraje',packet.order.odometer===null?'No registrado':fmt.format(packet.order.odometer)+' km'],['wrench','Motivo',longReason?reasonLines.slice(0,2).join(' '):packet.order.complaint]]
  // Reserve dynamic heights and keep long values selectable, without fixed clipping.
  const count=Math.max(left.length,right.length),rowHeights=Array.from({length:count},(_,i)=>Math.max(...[left[i],right[i]].map(v=>v?lines(v[2],width/2-110,9.5,bold).length:1))*12+(kind==='report'?12:8))
  const cardHeight=rowHeights.reduce((a,b)=>a+b,0)+18
  if(cardHeight<400){ensure(cardHeight);rounded(m,y+5,width,cardHeight,8);page.drawLine({start:{x:m+width/2-3,y:y-6},end:{x:m+width/2-3,y:y-cardHeight+16},thickness:.5,color:rgb(.65,.77,.91)})}
  for(let i=0;i<count;i++){
    const h=rowHeights[i];ensure(h)
    for(const [col,fields] of [left,right].entries()){const value=fields[i];if(!value)continue;const x=m+9+col*width/2;icon(value[0],x,y-1,15);text(value[1],x+23,y-12,8);lines(value[2],width/2-110,9.5,bold).forEach((line,j)=>strong(line,x+89,y-12-j*12,9.5))}
    y-=h
  }
  y-=24
  if(longReason)paragraph(longReason,9)
  section(kind==='report'?'Datos del informe':'Registro de entrega',kind==='report'?'layers':'box')
  ensure(39);rounded(m,y+5,width,35,7);icon('calendar',m+10,y,17);text('Fecha registrada',m+34,y-1,8,gray);strong(date(sourceDate),m+34,y-15,9);icon('user',m+width/2,y,17);text('Responsable del taller',m+width/2+26,y-1,8,gray);strong('Personal del taller registrado',m+width/2+26,y-15,9);y-=40
  if(kind==='report'){
    section('Detalle de trabajos','wrench')
    const cols=[m,m+24,m+260,m+332,m+376,m+455]
    function tableHead(){ensure(48);page.drawRectangle({x:m,y:y-20,width,height:22,color:navy});['#','Descripción','Tipo','Cantidad','Estado','Neto CLP'].forEach((v,i)=>text(v,cols[i]+4,y-13,8,white));y-=24}
    tableHead()
    for(const [index,item] of packet.report.lines.entries()){
      const content=[String(index+1),item.description,item.type,quantity.format(item.quantity100/100),item.decision==='performed'?'Realizado':'No realizado',amount(item.lineNet)]
      const widths=[24,236,72,44,79,84]
      const cells=content.map((v,i)=>lines(v,widths[i]-8,8))
      const count=Math.max(...cells.map(c=>c.length))
      // Split unusually long rows into safe fragments, repeating the header on continuation.
      for(let from=0;from<count;){if(y-24<83){start();tableHead()}
        const take=Math.min(count-from,Math.max(1,Math.floor((y-93)/12))),h=Math.max(35,take*12+10)
        if(y-h<83){start();tableHead();continue}
        page.drawRectangle({x:m,y:y-h+4,width,height:h,color:index%2?white:light})
        rounded(cols[4]+2,y-1,75,20,10,item.decision==='performed'?rgb(.85,.98,.88):rgb(1,.92,.84),white)
        if(from===0){page.drawCircle({x:cols[4]+11,y:y-11,size:4.5,color:item.decision==='performed'?green:rgb(.70,.30,.08)});icon(item.decision==='performed'?'check':'minus',cols[4]+7,y-7,8,white)}
        cells.forEach((cell,i)=>cell.slice(from,from+take).forEach((v,j)=>{const color=i===4?(item.decision==='performed'?green:rgb(.65,.27,.10)):navy;const x=i===5?m+width-5-font.widthOfTextAtSize(v,8):i===4?cols[i]+19:cols[i]+4;text(v,x,y-11-j*12,8,color)}))
        y-=h;from+=take
      }
    }
  }else{
    paragraph('Modalidad de entrega: '+({in_person:'Presencial',authorized_pickup:'Retiro por tercero autorizado',other:'Otra modalidad'}[packet.handover.method]||'Modalidad no disponible'),9)
    section('Comprobaciones del responsable','wrench')
    for(const check of packet.handover.checks){const rows=lines(check,width-48,9);const h=rows.length*14+6;ensure(h);rounded(m,y+5,width,h,5);page.drawCircle({x:m+15,y:y-5,size:6,color:green});icon('check',m+10,y,10,white);rows.forEach((line,i)=>text(line,m+31,y-8-i*14,9));y-=h+2}
    section('Observaciones del responsable','note');paragraph(packet.handover.note)
  }
  section(kind==='report'?'Importes informativos · CLP':'Montos relacionados con la ejecución','coins',115)
  ensure(78)
  const original=packet.report.original,executed=packet.report.declared
  text('Total cotizado: '+amount(original.total),m+8,y-8,9)
  text('Trabajos realizados: '+amount(executed.total),m+8,y-27,9)
  text('Diferencia: '+amount(original.total-executed.total),m+8,y-46,9)
  const x=m+width*.57,w=width*.43
  rounded(x,y+11,w,75,9)
  rounded(x,y+11,4,75,2,cyan,cyan)
  for(const [i,[label,value]] of [['Subtotal neto',executed.net],['IVA (19 %)',executed.tax],['Total',executed.total]].entries()){
    const top=y-i*23
    if(i===2)rounded(x+6,top+12,w-12,25,6,blue,blue)
    strong(String(label),x+13,top-5,i===2?14:10,i===2?white:navy)
    const valueText=amount(Number(value));const valueSize=i===2?14:10;strong(valueText,x+w-13-bold.widthOfTextAtSize(valueText,valueSize),top-5,valueSize,i===2?white:navy)
  }
  y-=80
  const scopeText=kind==='report'?'Los trabajos fueron registrados como realizados por personal del taller. Este informe no demuestra de forma independiente su ejecución ni acredita autorización firmada del cliente. No es factura, boleta ni comprobante de pago.':'Esta constancia registra la declaración del responsable del taller. No constituye firma ni conformidad verificada del cliente, comprobante de pago ni prueba independiente de entrega física.'
  const backupText='Respaldo documental: elaborado a partir de los registros digitales de esta visita en ByteTorque.'
  const tail=37+lines(scopeText,width-18,8).length*13+4+lines(backupText,width-18,7.5).length*12.5+4
  const pending=packet.report.pendingNote||'Sin trabajos pendientes registrados.'
  section('Trabajos pendientes y observaciones','clipboard',Math.min(220,37+lines(pending,width-18,9).length*14+4+tail));paragraph(pending,9,navy,tail)
  section(kind==='report'?'Alcance del informe':'Alcance de la constancia','shield',tail)
  paragraph(scopeText,8)
  // This renderer runs before archive commit: never claim an archive already exists.
  paragraph(backupText,7.5,gray)
  doc.getPages().forEach((p,i)=>p.drawText('Página '+(i+1)+' de '+doc.getPageCount(),{x:W-m-72,y:51,font,size:8,color:gray}))
  return doc.save({ useObjectStreams: false })
}

export async function browserClosingDocumentPdf(
  packet: PreparedClosing, kind: FinalPdfKind
): Promise<Uint8Array> {
  const [font, logo, wordmark, boldFont]=await Promise.all([
    fetch('/cp05/DejaVuSans.ttf'), fetch('/icon-192.png'), fetch('/cp05/wordmark.png'),fetch('/cp05/DejaVuSans-Bold.ttf')
  ])
  if(!font.ok || !logo.ok || !wordmark.ok || !boldFont.ok) throw Error('PDF_ASSETS_UNAVAILABLE')
  return closingDocumentPdf(packet,kind,{
    font:new Uint8Array(await font.arrayBuffer()),
    logo:new Uint8Array(await logo.arrayBuffer()),wordmark:new Uint8Array(await wordmark.arrayBuffer()),boldFont:new Uint8Array(await boldFont.arrayBuffer())
  })
}
