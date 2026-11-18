/** 
 * BT-COM-01 — client-side PDF copies from server-validated, immutable snapshots.
 * NOT a signature, archived original, independent service proof, invoice or email.
 * No network call except fetching public font/logo assets in browserFinalPdf.
 */
import { PDFDocument, rgb, type PDFPage, type PDFFont } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import type { PreparedClosing } from './finalPackage'

export type FinalPdfKind = 'report' | 'handover'
const fmt = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 })
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
  assets: { font: Uint8Array; logo: Uint8Array }
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
  const W=595.28, H=841.89, margin=35, lineWidth=W-2*margin
  const navy=rgb(0.034,0.099,0.222)
  const blue=rgb(0.006,0.39,0.96)
  const gray=rgb(0.30,0.38,0.50)
  const light=rgb(0.95,0.97,1)
  const white=rgb(1,1,1)
  const heading=kind==='report'
    ? 'INFORME DE TRABAJOS DECLARADOS'
    : 'CONSTANCIA DE ENTREGA DECLARADA'
  const sourceDate=kind==='report'
    ? packet.report.recordedAt : packet.handover.recordedAt
  doc.setTitle(heading+' - '+packet.order.id)
  doc.setAuthor(packet.workshop.name)
  doc.setCreator('ByteTorque')
  doc.setProducer('ByteTorque BT-COM-01 - copia generada localmente')
  doc.setCreationDate(new Date(sourceDate))
  let page: PDFPage
  let y=0
  function header() {
    page.drawRectangle({x:0,y:H-100,width:W,height:100,color:navy})
    page.drawImage(logo,{x:margin,y:H-77,width:44,height:44})
    page.drawText('BYTETORQUE',{x:margin+55,y:H-49,font,size:17,color:white})
    page.drawText(heading,{x:margin+55,y:H-70,font,size:10,color:white})
    page.drawRectangle({x:margin,y:38,width:lineWidth,height:35,color:light})
    page.drawText('COPIA INFORMATIVA - NO TRIBUTARIA - SIN FIRMA DEL CLIENTE',{
      x:margin+8,y:58,font,size:8,color:navy
    })
    page.drawText('No acredita pago, conformidad ni entrega física verificada.',{
      x:margin+8,y:46,font,size:7.7,color:gray
    })
    y=H-121
  }
  function start() {page=doc.addPage([W,H]);header()}
  function ensure(h:number) { if(y-h<91) start() }
  function draw(text:string, size=9, color=navy, inset=0) {
    ensure(size+9)
    page.drawText(text,{x:margin+inset,y,font,size,color})
    y-=size+8
  }
  function wrap(input:string, size=9, inset=0, color=navy) {
    const maxWidth=lineWidth-inset
    const chunks=String(input).replace(/\r/g,'').split('\n')
    for(const part of chunks){
      if(!part.trim()) {ensure(13);y-=13;continue}
      let row=''
      const words=part.split(/\s+/).filter(Boolean)
      for(const initial of words){
        let word=initial
        while(font.widthOfTextAtSize(word,size)>maxWidth){
          let i=1
          while(i<word.length && font.widthOfTextAtSize(word.slice(0,i+1),size)<=maxWidth)i++
          if(row){draw(row,size,color,inset);row=''}
          draw(word.slice(0,i),size,color,inset)
          word=word.slice(i)
        }
        const next=row ? row+' '+word : word
        if(row && font.widthOfTextAtSize(next,size)>maxWidth){
          draw(row,size,color,inset)
          row=word
        }else row=next
      }
      if(row)draw(row,size,color,inset)
    }
  }
  function section(label:string) {
    ensure(47)
    y-=9
    page.drawRectangle({x:margin,y:y-5,width:lineWidth,height:24,color:light})
    page.drawRectangle({x:margin,y:y-5,width:3,height:24,color:blue})
    page.drawText(label,{x:margin+11,y:y+2,font,size:10,color:navy})
    y-=32
  }
  start()
  wrap('Taller: '+packet.workshop.name,10)
  wrap('Cliente: '+packet.customer.name)
  wrap('Vehículo: '+packet.vehicle.description+' · Patente: '+(packet.vehicle.plate || 'No registrada'))
  wrap('Orden de trabajo: '+packet.order.id)
  wrap('Cotización: COT-'+String(packet.quote.number).padStart(6,'0')+
    ' · Revisión histórica '+packet.quote.revision)
  wrap('Ingreso registrado: '+date(packet.order.openedAt)+
    ' · Kilometraje: '+(packet.order.odometer===null
      ? 'No registrado' : fmt.format(packet.order.odometer)+' km'))
  wrap('Motivo de ingreso: '+packet.order.complaint)
  if(kind==='report') {
    section('Trazabilidad del informe')
    wrap('Declaración registrada: '+date(packet.report.recordedAt))
    wrap('Operador que declaró: '+packet.report.operatorId)
    wrap('ID del informe: '+packet.report.id,8)
    section('Partidas de la cotización histórica')
    for(const item of packet.report.lines){
      ensure(40)
      wrap((item.decision==='performed'?'DECLARADO REALIZADO':'NO REALIZADO')+
        ' · '+item.type+' · '+item.description,9,6)
      wrap('Cantidad: '+fmt.format(item.quantity100/100)+
        ' · Neto de la partida cotizada: '+amount(item.lineNet),8,12,gray)
      y-=3
    }
    section('Importes informativos · CLP')
    wrap('Cotización original: Neto '+amount(packet.report.original.net)+
      ' · IVA '+amount(packet.report.original.tax)+
      ' · Total '+amount(packet.report.original.total))
    wrap('Trabajos marcados realizados: Neto '+amount(packet.report.declared.net)+
      ' · IVA '+amount(packet.report.declared.tax)+
      ' · Total '+amount(packet.report.declared.total))
    wrap('Diferencia respecto del total cotizado: '+
      amount(packet.report.original.total-packet.report.declared.total))
    section('Pendientes, trabajos no efectuados y observaciones')
    wrap(packet.report.pendingNote || 'Sin partidas pendientes declaradas.')
    section('Alcance de la declaración')
    wrap('Las partidas realizadas fueron marcadas por personal del taller. '+
      'Este documento no demuestra independientemente la ejecución, '+
      'no acredita autorización firmada del cliente y no es factura, boleta ni comprobante de pago.',8)
  } else {
    section('Registro de entrega')
    wrap('Declaración registrada: '+date(packet.handover.recordedAt))
    wrap('Responsable del taller: '+packet.handover.operatorId)
    wrap('Medio declarado: '+packet.handover.method)
    wrap('ID de constancia: '+packet.handover.id,8)
    section('Comprobaciones declaradas por el responsable')
    for(const item of packet.handover.checks) wrap('DECLARADO: '+item,9,8)
    section('Observaciones del responsable')
    wrap(packet.handover.note)
    section('Informe y montos relacionados')
    wrap('Informe de ejecución: '+packet.report.id,8)
    wrap('Trabajos marcados realizados: '+amount(packet.report.declared.total))
    wrap('Pendientes declarados: '+(packet.report.pendingNote || 'No registrados'))
    section('Alcance de la constancia')
    wrap('Esta constancia documenta exclusivamente lo que declaró el responsable '+
      'del taller. No contiene firma o conformidad verificada del receptor, '+
      'registro de pago ni prueba independiente de entrega física.',8)
  }
  section('Origen documental')
  wrap('Revisión inmutable CP05: '+packet.quote.revisionId,8)
  wrap('Huella SHA-256 del PDF histórico de cotización: '+packet.quote.pdfSha256,8)
  wrap('Paquete documental: '+packet.bundleId,8)
  doc.getPages().forEach((p,i)=>{
    p.drawText('Página '+(i+1)+' de '+doc.getPageCount(),{
      x:W-margin-89,y:20,font,size:8,color:gray
    })
  })
  return doc.save({ useObjectStreams: false })
}

export async function browserClosingDocumentPdf(
  packet: PreparedClosing, kind: FinalPdfKind
): Promise<Uint8Array> {
  const [font, logo]=await Promise.all([
    fetch('/cp05/DejaVuSans.ttf'), fetch('/icon-192.png')
  ])
  if(!font.ok || !logo.ok) throw Error('PDF_ASSETS_UNAVAILABLE')
  return closingDocumentPdf(packet,kind,{
    font:new Uint8Array(await font.arrayBuffer()),
    logo:new Uint8Array(await logo.arrayBuffer())
  })
}
