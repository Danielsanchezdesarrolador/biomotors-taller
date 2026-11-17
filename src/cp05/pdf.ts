import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import { quoteNumber, type Snapshot } from './contracts'
import { clp } from '../ordenes/orderMoney'
export async function quotePdf(
  snapshot: Snapshot,
  assets: { font: Uint8Array; logo: Uint8Array; workshopLogo?: Uint8Array },
  draft = false
): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  doc.registerFontkit(fontkit)
  const font = await doc.embedFont(assets.font, { subset: true }),
    logo = await doc.embedPng(assets.logo)
  const supported = new Set(font.getCharacterSet())
  const date = new Date(snapshot.document_date)
  if (!Number.isFinite(date.valueOf())) throw Error('Invalid document date')
  doc.setTitle(
    `${draft ? 'BORRADOR ' : ''}${quoteNumber(snapshot.quote)} R${snapshot.quote.revision}`
  )
  doc.setAuthor(snapshot.workshop.name)
  doc.setCreator('ByteTorque')
  doc.setProducer('ByteTorque CP05')
  doc.setCreationDate(date)
  doc.setModificationDate(date)
  const navy = rgb(0.04, 0.13, 0.28),
    blue = rgb(0.02, 0.35, 0.87)
  const width = 595.28,
    height = 841.89,
    margin = 40,
    available = width - margin * 2
  let page = doc.addPage([width, height]),
    y = height - margin
  function text(value: string, x: number, at: number, size = 10, color = navy) {
    page.drawText(value, { x, y: at, size, font, color })
  }
  function newPage() {
    page = doc.addPage([width, height])
    y = height - margin
    text(
      `${quoteNumber(snapshot.quote)} · Revisión ${snapshot.quote.revision}`,
      margin,
      y,
      10,
      blue
    )
    y -= 26
  }
  function ensure(space: number) {
    if (y - space < 48) newPage()
  }
  const glyphWidths = new Map<string, number>()
  function glyphWidth(char: string, size: number) {
    if (!glyphWidths.has(char)) glyphWidths.set(char, font.widthOfTextAtSize(char, 1))
    return glyphWidths.get(char)! * size
  }
  function lines(value: string, size: number, max: number): string[] {
    const output: string[] = []
    for (const paragraph of String(value).replace(/\r/g, '').split('\n')) {
      let line = '',
        lineWidth = 0
      for (const char of paragraph) {
        // Explicitly fail on missing glyphs instead of silently corrupting a name.
        if (char !== '\t' && !supported.has(char.codePointAt(0)!))
          throw Error('Unsupported document character')
        const next = line + (char === '\t' ? ' ' : char)
        const charWidth = glyphWidth(char === '\t' ? ' ' : char, size)
        if (lineWidth + charWidth > max && line) {
          output.push(line)
          line = char
          lineWidth = charWidth
        } else {
          line = next
          lineWidth += charWidth
        }
      }
      output.push(line)
    }
    return output
  }
  function paragraph(value: string, size = 10, max = available, x = margin) {
    for (const line of lines(value, size, max)) {
      ensure(size + 6)
      text(line, x, y, size)
      y -= size + 5
    }
  }
  page.drawImage(logo, { x: width - 175, y: height - 74, width: 30, height: 30 })
  text('Powered by ByteTorque', width - 140, height - 62, 8, blue)
  if (assets.workshopLogo) {
    const own = await doc.embedPng(assets.workshopLogo), fit = own.scaleToFit(80, 40)
    page.drawImage(own,{x:margin,y:height-margin-40,width:fit.width,height:fit.height}); y -= 48
  }
  paragraph(snapshot.workshop.name, 17, available - 155)
  paragraph('Cotización de trabajos mecánicos', 12, available - 150)
  y = Math.min(y, height - 100)
  paragraph(
    `${quoteNumber(snapshot.quote)} · Revisión ${snapshot.quote.revision}${draft ? ' · BORRADOR SIN EMITIR' : ''}`,
    13
  )
  paragraph(
    `Fecha: ${date.toLocaleDateString('es-CL', { timeZone: 'America/Santiago' })} · Vigencia: ${snapshot.quote.valid_days} días`
  )
  const contact = [snapshot.workshop.contactEmail,snapshot.workshop.phone,snapshot.workshop.address].filter(Boolean).join(' · ')
  if (contact) paragraph(contact,9)
  paragraph(`Cliente: ${snapshot.customer.full_name}`)
  paragraph(
    `Contacto: ${snapshot.customer.email || 'No configurado'} · ${snapshot.customer.mobile_e164 || 'Sin teléfono'}`
  )
  paragraph(
    `Vehículo: ${snapshot.vehicle.make} ${snapshot.vehicle.model}${snapshot.vehicle.model_year ? ' · ' + snapshot.vehicle.model_year : ''} · Patente: ${snapshot.vehicle.plate || 'Sin patente'}`
  )
  paragraph(`OT: ${snapshot.order.id}`)
  paragraph(`Motivo de ingreso: ${snapshot.order.complaint}`)
  y -= 8
  paragraph('Partidas propuestas · precios unitarios NETOS (CLP)', 11)
  for (const [index, item] of snapshot.items.entries()) {
    const description = lines(`${index + 1}. ${item.description} · ${item.type}`, 10, available)
    ensure(Math.min(description.length * 15 + 24, 140))
    paragraph(description.join('\n'))
    paragraph(
      `Cantidad: ${item.quantity100 / 100}   Neto unitario: ${clp(item.unit_price)}   Neto línea: ${clp(item.line_net)}`,
      9
    )
    y -= 8
  }
  ensure(95)
  y -= 5
  paragraph(`Subtotal neto: ${clp(snapshot.totals.subtotal)} CLP`, 11)
  paragraph(`IVA (19 %): ${clp(snapshot.totals.tax)} CLP`, 11)
  paragraph(`TOTAL: ${clp(snapshot.totals.total)} CLP`, 14)
  y -= 8
  paragraph('Condiciones', 11)
  paragraph(snapshot.quote.terms || 'Sin condiciones definidas')
  if (snapshot.quote.comments) {
    y -= 8
    paragraph('Observaciones', 11)
    paragraph(snapshot.quote.comments)
  }
  y -= 8
  paragraph(snapshot.notice, 9)
  paragraph(
    'No es documento tributario, firma ni aceptación contractual del cliente.' + (contact ? '' : ' Datos comerciales adicionales del taller: no configurados.'),
    8
  )
  for (const [i, p] of doc.getPages().entries()) {
    p.drawText(`Powered by ByteTorque · ${i + 1}/${doc.getPageCount()}`, {
      x: margin,
      y: 24,
      size: 8,
      font,
      color: blue
    })
  }
  return doc.save({ useObjectStreams: false })
}
export async function browserQuotePdf(snapshot: Snapshot, draft = true) {
  const [font, logo] = await Promise.all([fetch('/cp05/DejaVuSans.ttf'), fetch('/icon-192.png')])
  if (!font.ok || !logo.ok) throw Error('PDF assets unavailable')
  return quotePdf(
    snapshot,
    {
      font: new Uint8Array(await font.arrayBuffer()),
      logo: new Uint8Array(await logo.arrayBuffer())
    },
    draft
  )
}
export function downloadPdf(bytes: Uint8Array, name: string) {
  const url = URL.createObjectURL(new Blob([bytes.slice().buffer], { type: 'application/pdf' }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 30000)
}
