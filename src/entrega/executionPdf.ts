/** Branded A4 INTERNAL DRAFT. Never label it an issued report or proof of service. */
import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import { clp } from '../ordenes/orderMoney'
import type { ExecutionPreview } from './executionPreview'

export async function executionDraftPdf(
  review: ExecutionPreview,
  assets: { font: Uint8Array; logo: Uint8Array }
): Promise<Uint8Array> {
  if (!review.readyForDraftPdf) throw Error('EXECUTION_REVIEW_INCOMPLETE')
  const doc = await PDFDocument.create()
  doc.registerFontkit(fontkit)
  const font = await doc.embedFont(assets.font, { subset: true })
  const logo = await doc.embedPng(assets.logo)
  const charset = new Set(font.getCharacterSet())
  const W = 595.28, H = 841.89, M = 36, right = W - M
  const navy = rgb(0.034, 0.099, 0.222)
  const blue = rgb(0.006, 0.39, 0.96)
  const muted = rgb(0.36, 0.42, 0.51)
  const stroke = rgb(0.82, 0.86, 0.91)
  const white = rgb(1, 1, 1)
  const pale = rgb(0.96, 0.97, 0.99)
  const p = review.revision.payload
  doc.setTitle('BORRADOR INTERNO - Informe técnico COT-' +
    String(p.quote.number).padStart(6, '0') + ' R' + review.revision.revision)
  doc.setAuthor(p.workshop.name)
  doc.setCreator('ByteTorque')
  doc.setProducer('ByteTorque - revisión técnica preliminar sin persistencia')
  const stamp = new Date(review.revision.issued_at)
  if (!Number.isFinite(stamp.valueOf())) throw Error('INVALID_REVISION_DATE')
  doc.setCreationDate(stamp)
  doc.setModificationDate(stamp)

  let page = doc.addPage([W, H])
  let y = H - 115
  const safe = (s: unknown) => String(s ?? '').replace(/\s+/g, ' ').split('')
    .map(c => charset.has(c.codePointAt(0)!) ? c : '?').join('')
  function line(s: unknown, size = 9, tint = navy, indent = M) {
    const text = safe(s)
    page.drawText(text, { x: indent, y, size, font, color: tint })
    y -= size + 7
  }
  function wrapped(s: unknown, size = 9, indent = M, max = W - 2 * M) {
    for (const para of String(s ?? '').split(/\n/)) {
      let words = safe(para).split(/\s+/), row = ''
      if (!words.length) { y -= 14; continue }
      for (let word of words) {
        if (!word) continue
        while (font.widthOfTextAtSize(word, size) > max) {
          let i = 1
          while (i < word.length && font.widthOfTextAtSize(word.slice(0, i + 1), size) <= max) i++
          if (row) { pageIfNeeded(size + 20); line(row, size, navy, indent); row = '' }
          pageIfNeeded(size + 20)
          line(word.slice(0, i), size, navy, indent)
          word = word.slice(i)
        }
        const next = row ? row + ' ' + word : word
        if (font.widthOfTextAtSize(next, size) > max && row) {
          pageIfNeeded(size + 20); line(row, size, navy, indent); row = word
        } else row = next
      }
      if (row) { pageIfNeeded(size + 20); line(row, size, navy, indent) }
    }
  }
  function header() {
    page.drawRectangle({ x: 0, y: H - 95, width: W, height: 95, color: navy })
    page.drawImage(logo, { x: M, y: H - 72, width: 41, height: 41 })
    page.drawText('BYTETORQUE', { x: 85, y: H - 44, size: 18, font, color: white })
    page.drawText('INFORME TÉCNICO PRELIMINAR', { x: 85, y: H - 65, size: 10, font, color: white })
    page.drawRectangle({ x: M, y: 35, width: W - 2*M, height: 31, color: pale })
    page.drawText('BORRADOR INTERNO · SIN GUARDADO, FIRMA NI ENTREGA', {
      x: M + 8, y: 47, size: 8, font, color: blue
    })
    page.drawLine({ start: { x: M, y: 76 }, end: { x: right, y: 76 }, thickness: 1, color: stroke })
  }
  function pageIfNeeded(required: number) {
    if (y - required >= 91) return
    page = doc.addPage([W, H]); y = H - 115; header()
  }
  function section(title: string) {
    pageIfNeeded(41)
    y -= 5
    page.drawRectangle({ x: M, y: y - 5, width: W - 2*M, height: 22, color: pale })
    page.drawText(safe(title), { x: M + 7, y: y + 1, size: 10, font, color: navy })
    y -= 33
  }
  header()
  line('Taller: ' + p.workshop.name, 10)
  line('Cliente: ' + p.customer.full_name)
  wrapped('Vehículo: ' + p.vehicle.make + ' ' + p.vehicle.model +
    ' · Patente: ' + (p.vehicle.plate || 'No registrada'))
  wrapped('Orden de trabajo: ' + p.order.id)
  line('Cotización emitida: COT-' + String(p.quote.number).padStart(6,'0') +
    ' · Revisión ' + review.revision.revision)
  line('Ingreso: ' + new Date(p.order.opened_at).toLocaleDateString('es-CL'))
  section('Partidas revisadas por el operador (solo selección local)')
  for (const { item, decision } of review.rows) {
    pageIfNeeded(55)
    wrapped((decision === 'performed' ? '[MARCAD0 REALIZADO]' : '[NO REALIZADO]') +
      ' ' + item.type + ': ' + item.description, 9, M + 5, W - 2*M - 10)
    line('Cantidad ' + (item.quantity100 / 100).toLocaleString('es-CL') +
      ' · Neto cotizado: ' + clp(item.line_net), 8, muted, M + 5)
    y -= 3
  }
  section('Importes comparativos · CLP')
  line('Cotización original · Neto: ' + clp(review.quoted.subtotal))
  line('Cotización original · IVA: ' + clp(review.quoted.tax))
  line('Cotización original · Total: ' + clp(review.quoted.total), 10)
  y -= 7
  line('Partidas marcadas realizadas · Neto: ' + clp(review.executed.subtotal))
  line('Partidas marcadas realizadas · IVA 19 %: ' + clp(review.executed.tax))
  line('Partidas marcadas realizadas · Total: ' + clp(review.executed.total), 10)
  line('Diferencia frente a lo cotizado: ' + clp(review.difference))
  section('Trabajos no realizados y observaciones pendientes')
  wrapped(review.pendingExplanation || 'No se marcaron partidas pendientes.')
  section('Advertencia y alcance')
  wrapped(review.notice)
  wrapped('Este archivo se construyó localmente desde una revisión histórica de cotización. ' +
    'No existe evidencia de aceptación del cliente, finalización de trabajos ni entrega registrada ' +
    'por este proceso. Los valores marcados no son un cobro ni una boleta.', 8)
  return doc.save({ useObjectStreams: false })
}

export async function browserExecutionDraftPdf(review: ExecutionPreview) {
  const [font, logo] = await Promise.all([
    fetch('/cp05/DejaVuSans.ttf'),
    fetch('/icon-192.png')
  ])
  if (!font.ok || !logo.ok) throw Error('PDF_ASSETS_UNAVAILABLE')
  return executionDraftPdf(review, {
    font: new Uint8Array(await font.arrayBuffer()),
    logo: new Uint8Array(await logo.arrayBuffer())
  })
}
