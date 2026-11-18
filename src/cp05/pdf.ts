import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import { quoteNumber, type Snapshot } from './contracts'
import { clp } from '../ordenes/orderMoney'

/**
 * CP05 — plantilla oficial R3, aprobada visualmente el 17-11-2026.
 *
 * Dibujo vectorial sobre A4: todos los campos siguen siendo datos dinámicos,
 * nunca una imagen fija con información sintética. Un PDF de prueba continúa
 * marcado como borrador y no constituye emisión, firma ni aceptación.
 * Esta función también se reutiliza en el backend candidato de archivo.
 */
export async function quotePdf(
  snapshot: Snapshot,
  assets: { font: Uint8Array; logo: Uint8Array; workshopLogo?: Uint8Array; templatePdf?: Uint8Array },
  draft = false
): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  doc.registerFontkit(fontkit)
  const font = await doc.embedFont(assets.font, { subset: true })
  const icon = await doc.embedPng(assets.logo)
  const ownLogo = assets.workshopLogo ? await doc.embedPng(assets.workshopLogo) : null
  // Optional private one-page A4 stationery. The uploaded PDF is sanitized
  // on upload. Dynamic quote data is drawn on top, never trusted from it.
  let background: Awaited<ReturnType<typeof doc.embedPdf>>[number] | null = null
  if (assets.templatePdf) {
    // A blank stationery page may have no /Contents stream. Re-serialize it
    // with an invisible paint instruction before embedding into this document.
    // This also validates A4 orientation in the renderer, not just the UI.
    const source = await PDFDocument.load(assets.templatePdf, { ignoreEncryption: false })
    if (source.getPageCount() !== 1) throw Error('INVALID_PDF_STATIONERY_PAGE_COUNT')
    const stationery = source.getPage(0)
    const size = stationery.getSize()
    if (Math.abs(size.width - 595.28) > 2 || Math.abs(size.height - 841.89) > 2)
      throw Error('INVALID_PDF_STATIONERY_A4')
    stationery.drawRectangle({ x:0,y:0,width:1,height:1,opacity:0 })
    background = (await doc.embedPdf(await source.save({useObjectStreams:false})))[0]
  }
  const charset = new Set(font.getCharacterSet())
  const date = new Date(snapshot.document_date)
  if (!Number.isFinite(date.valueOf())) throw Error('Invalid document date')
  const number = quoteNumber(snapshot.quote)
  const revision = snapshot.quote.revision
  doc.setTitle((draft ? 'BORRADOR ' : '') + number + ' R' + revision)
  doc.setAuthor(snapshot.workshop.name)
  doc.setCreator('ByteTorque')
  doc.setProducer('ByteTorque CP05 · Plantilla R3')
  doc.setCreationDate(date)
  doc.setModificationDate(date)

  const W = 595.28
  const H = 841.89
  const M = 27
  const CW = W - M * 2
  const navy = rgb(0.034, 0.099, 0.222)
  const navy2 = rgb(0.067, 0.18, 0.37)
  const blue = rgb(0.006, 0.39, 0.96)
  const blueSoft = rgb(0.84, 0.9, 0.98)
  const pale = rgb(0.954, 0.974, 0.998)
  const gray = rgb(0.34, 0.41, 0.53)
  const border = rgb(0.76, 0.82, 0.9)
  const white = rgb(1, 1, 1)
  let page = doc.addPage([W, H])
  if (background) page.drawPage(background,{x:0,y:0,width:W,height:H})
  let cursor = 0

  function box(x: number, y: number, w: number, h: number, color = white, stroke = border) {
    page.drawRectangle({
      x, y, width: w, height: h, color,
      borderColor: stroke, borderWidth: 0.7
    })
  }
  function band(x: number, y: number, w: number, h: number, color = navy) {
    page.drawRectangle({ x, y, width: w, height: h, color })
  }
  function rule(x: number, y: number, w: number, color = border, thickness = 0.7) {
    page.drawLine({ start: { x, y }, end: { x: x + w, y }, color, thickness })
  }
  function check(value: string) {
    for (const ch of value) {
      if (ch !== '\n' && ch !== '\r' && ch !== '\t' && !charset.has(ch.codePointAt(0)!))
        throw Error('Unsupported document character')
    }
  }
  function measure(value: string, size: number) {
    check(value)
    return font.widthOfTextAtSize(value, size)
  }
  function truncate(value: string, size: number, maxWidth: number) {
    let text = String(value)
    if (measure(text, size) <= maxWidth) return text
    while (text.length > 1 && measure(text + '…', size) > maxWidth) text = text.slice(0, -1)
    return text + '…'
  }
  function write(
    value: string, x: number, y: number, size = 9,
    color = navy, strong = false, align: 'left' | 'right' | 'center' = 'left'
  ) {
    const content = String(value)
    check(content)
    const width = measure(content, size)
    const at = align === 'right' ? x - width : align === 'center' ? x - width / 2 : x
    page.drawText(content, { x: at, y, size, font, color })
    // The supplied unicode DejaVu regular face renders the full Spanish
    // alphabet. A subtle second pass gives label-like weight without
    // substituting a non-Unicode standard font.
    if (strong) page.drawText(content, { x: at + 0.19, y, size, font, color })
  }
  function wrap(value: string, size: number, maxWidth: number): string[] {
    const result: string[] = []
    for (const para of String(value).replace(/\r/g, '').split('\n')) {
      const words = para.split(/\s+/).filter(Boolean)
      if (!words.length) {
        result.push('')
        continue
      }
      let line = ''
      for (const word of words) {
        check(word)
        if (measure(word, size) > maxWidth) {
          if (line) { result.push(line); line = '' }
          let part = ''
          for (const ch of word) {
            if (part && measure(part + ch, size) > maxWidth) {
              result.push(part)
              part = ch
            } else part += ch
          }
          line = part
        } else if (!line) line = word
        else if (measure(line + ' ' + word, size) <= maxWidth) line += ' ' + word
        else { result.push(line); line = word }
      }
      if (line) result.push(line)
    }
    return result
  }
  function textLines(lines: string[], x: number, baseline: number, size = 8.5,
                     leading = 11.5, color = navy, strong = false) {
    lines.forEach((line, i) => write(line, x, baseline - i * leading, size, color, strong))
  }
  function sectionTitle(title: string, x: number, at: number, width: number) {
    write(title, x + 5, at, 10, navy, true)
    rule(x + 5, at - 7, width - 10, blue, 1.1)
  }
  function renderHeader(first: boolean) {
    if (first) {
      page.drawImage(icon, { x: M, y: H - 83, width: 46, height: 46 })
      write('ByteTorque', M + 56, H - 51, 22, navy, true)
      write('TALLER MECÁNICO DIGITAL', M + 58, H - 66, 7, navy2)
      write('DIAGNÓSTICO  |  MANTENCIÓN  |  REPARACIÓN', W - M, H - 65, 7.5, navy, false, 'right')
      rule(M, H - 93, CW, blue, 2)
      write('Cotización de trabajos mecánicos', M, H - 135, 18, navy, true)
      band(M, H - 148, 54, 3, blue)
      const top = H - 160
      box(M, top - 56, CW, 56, white, border)
      const widths = [118, 69, 142, 115, CW - 444]
      const titles = ['N.º COTIZACIÓN', 'REVISIÓN', 'ESTADO', 'FECHA', 'VIGENCIA']
      const status = draft ? 'BORRADOR SIN EMITIR' :
        snapshot.quote.status === 'voided' ? 'ANULADA' : 'EMITIDA'
      const fmt = new Intl.DateTimeFormat('es-CL', {
        timeZone: 'America/Santiago', day: '2-digit', month: '2-digit', year: 'numeric'
      }).format(date)
      const values = [number, String(revision), status, fmt, snapshot.quote.valid_days + ' días']
      let x = M
      for (let i = 0; i < widths.length; i++) {
        if (i) page.drawLine({ start: { x, y: top - 46 }, end: { x, y: top - 10 },
          color: border, thickness: 0.7 })
        write(titles[i], x + 7, top - 17, 7, navy, true)
        const fontSize = i === 2 ? 8 : i === 0 ? 10.7 : 10
        if (i === 2) band(x + 5, top - 47, widths[i] - 10, 20, blueSoft)
        write(truncate(values[i], fontSize, widths[i] - 13), x + 7, top - 41,
              fontSize, navy, true)
        x += widths[i]
      }
      const cardsTop = top - 65
      const gap = 12
      const cardWidth = (CW - gap) / 2
      const cardHeight = 102
      function infoCard(
        x0: number, title: string, fields: [string, string][]
      ) {
        box(x0, cardsTop - cardHeight, cardWidth, cardHeight)
        band(x0 + .4, cardsTop - 25, cardWidth - .8, 24, blueSoft)
        write(title, x0 + 10, cardsTop - 18, 10, navy, true)
        fields.forEach(([label, value], index) => {
          const lineY = cardsTop - 42 - index * 16.1
          write(label, x0 + 9, lineY, 7.7, gray)
          const available = cardWidth - 108
          write(truncate(value || 'No configurado', 7.7, available),
                x0 + 101, lineY, 7.7, navy, true)
        })
      }
      infoCard(M, 'DATOS DEL CLIENTE', [
        ['Cliente:', snapshot.customer.full_name],
        ['Contacto:', snapshot.customer.email || 'No configurado'],
        ['Teléfono:', snapshot.customer.mobile_e164 || 'Sin teléfono'],
        ['Correo:', snapshot.customer.email || 'No configurado']
      ])
      infoCard(M + cardWidth + gap, 'DATOS DEL VEHÍCULO', [
        ['Vehículo:', snapshot.vehicle.make + ' ' + snapshot.vehicle.model +
          (snapshot.vehicle.model_year ? ' ' + snapshot.vehicle.model_year : '')],
        ['Patente:', snapshot.vehicle.plate || 'Sin patente'],
        ['OT:', snapshot.order.id],
        ['Motivo:', snapshot.order.complaint]
      ])
      cursor = cardsTop - cardHeight - 21
    } else {
      page.drawImage(icon, { x: M, y: H - 76, width: 34, height: 34 })
      write('ByteTorque · Continuación de cotización', M + 42, H - 57, 11, navy, true)
      write(number + ' · Rev. ' + revision, W - M, H - 57, 9, navy, false, 'right')
      rule(M, H - 84, CW, blue, 1.4)
      cursor = H - 113
    }
  }
  function nextPage() {
    page = doc.addPage([W, H])
    if (background) page.drawPage(background,{x:0,y:0,width:W,height:H})
    renderHeader(false)
  }
  function tableHeader() {
    write('PARTIDAS PROPUESTAS', M + 2, cursor + 3, 10.5, navy, true)
    write('PRECIOS UNITARIOS NETOS (CLP)', W - M, cursor + 3, 7.8, navy2,
      false, 'right')
    cursor -= 18
    band(M, cursor - 25, CW, 25, navy2)
    const fields: { label: string; x: number; align?: 'right' }[] = [
      { label: '#', x: M + 10 },
      { label: 'DESCRIPCIÓN', x: M + 33 },
      { label: 'TIPO', x: M + 228 },
      { label: 'CANT.', x: M + 358 },
      { label: 'NETO UNIT.', x: M + 450, align: 'right' },
      { label: 'NETO LÍNEA', x: M + CW - 9, align: 'right' }
    ]
    for (const f of fields) write(f.label, f.x, cursor - 16, 7, white, true,
      f.align || 'left')
    cursor -= 25
  }
  function tableItem(item: Snapshot['items'][number], index: number) {
    const description = wrap(item.description, 8.3, 176)
    const height = Math.max(26, 11 + description.length * 11.2)
    if (cursor - height < 127) {
      nextPage()
      tableHeader()
    }
    box(M, cursor - height, CW, height, index % 2 ? pale : white, border)
    const mid = cursor - 17
    write(String(index + 1), M + 12, mid, 8.6, navy)
    textLines(description, M + 33, cursor - 17, 8.3, 11.2, navy)
    write(truncate(item.type, 8, 103), M + 228, mid, 8, navy)
    const qty = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 2 })
      .format(item.quantity100 / 100)
    write(qty, M + 362, mid, 8, navy, false, 'right')
    write(clp(item.unit_price), M + 450, mid, 8, navy, false, 'right')
    write(clp(item.line_net), W - M - 9, mid, 8, navy, true, 'right')
    cursor -= height
  }
  function summaryAndConditions() {
    const conditions = wrap(snapshot.quote.terms || 'Sin condiciones definidas', 8.1, 256)
    const observations = wrap(snapshot.quote.comments || 'Sin observaciones adicionales',
      8.1, 256)
    const legal = wrap(snapshot.notice + ' No es documento tributario ni acredita ' +
      'firma o aceptación del cliente.', 7.5, CW - 16)
    const leftHeight = 21 + 11 + conditions.length * 11 +
      12 + 21 + 11 + observations.length * 11
    const required = Math.max(leftHeight + 15, 127) + legal.length * 9 + 36
    if (cursor - required < 128 && required < 540) nextPage()
    cursor -= 13
    if (required < 540) {
      const yTop = cursor
      const leftW = 281
      const rightX = M + leftW + 12
      const rightW = CW - leftW - 12
      box(M, yTop - 26 - conditions.length * 11 - 10, leftW,
        26 + conditions.length * 11 + 10)
      band(M + .5, yTop - 22, leftW - 1, 21, blueSoft)
      write('CONDICIONES', M + 11, yTop - 15, 9.7, navy, true)
      textLines(conditions, M + 10, yTop - 38, 8.1, 11, navy)
      const obsTop = yTop - (26 + conditions.length * 11 + 10) - 11
      box(M, obsTop - 26 - observations.length * 11 - 10, leftW,
        26 + observations.length * 11 + 10)
      band(M + .5, obsTop - 22, leftW - 1, 21, blueSoft)
      write('OBSERVACIONES', M + 11, obsTop - 15, 9.7, navy, true)
      textLines(observations, M + 10, obsTop - 38, 8.1, 11, navy)
      box(rightX, yTop - 123, rightW, 123, white, border)
      band(rightX + .5, yTop - 25, rightW - 1, 24, navy2)
      write('RESUMEN DE COSTOS', rightX + 10, yTop - 17, 10, white, true)
      write('Subtotal neto', rightX + 9, yTop - 44, 8.6, navy)
      write(clp(snapshot.totals.subtotal) + ' CLP', rightX + rightW - 9,
        yTop - 44, 8.6, navy, false, 'right')
      rule(rightX + 8, yTop - 53, rightW - 16)
      write('IVA (19 %)', rightX + 9, yTop - 67, 8.6, navy)
      write(clp(snapshot.totals.tax) + ' CLP', rightX + rightW - 9,
        yTop - 67, 8.6, navy, false, 'right')
      band(rightX + 7, yTop - 114, rightW - 14, 31, blue)
      write('TOTAL', rightX + 17, yTop - 103, 11, white, true)
      write(clp(snapshot.totals.total) + ' CLP', rightX + rightW - 16,
        yTop - 103, 11.5, white, true, 'right')
      cursor = yTop - Math.max(leftHeight + 7, 124)
    } else {
      // Fully render unusually long legal/terms/observations; never silently
      // truncate them merely to force the two-column design.
      const blocks: [string, string[]][] = [
        ['CONDICIONES', conditions], ['OBSERVACIONES', observations]
      ]
      for (const [title, text] of blocks) {
        if (cursor < 148) nextPage()
        sectionTitle(title, M, cursor, CW)
        cursor -= 21
        for (const line of text) {
          if (cursor < 122) nextPage()
          write(line, M + 8, cursor, 8.1, navy)
          cursor -= 11
        }
        cursor -= 14
      }
      if (cursor < 238) nextPage()
      box(M, cursor - 110, CW, 110, white, border)
      band(M + .5, cursor - 25, CW - 1, 24, navy2)
      write('RESUMEN DE COSTOS', M + 9, cursor - 17, 10, white, true)
      write('Subtotal neto: ' + clp(snapshot.totals.subtotal) + ' CLP', M + 10,
        cursor - 44, 9, navy)
      write('IVA (19 %): ' + clp(snapshot.totals.tax) + ' CLP', M + 10,
        cursor - 64, 9, navy)
      band(M + 9, cursor - 101, CW - 18, 28, blue)
      write('TOTAL: ' + clp(snapshot.totals.total) + ' CLP', M + 18,
        cursor - 92, 11, white, true)
      cursor -= 121
    }
    cursor -= 6
    for (const line of legal) {
      if (cursor < 120) nextPage()
      write(line, M + 5, cursor, 7.5, gray)
      cursor -= 9
    }
  }
  function finishingBlock() {
    const contact = [
      snapshot.workshop.phone || '',
      snapshot.workshop.contactEmail || '',
      snapshot.workshop.address || ''
    ].filter(Boolean)
    // Reserve enough height for every contact field AND the signature text.
    // Never silently drop a workshop address or email near the page footer.
    if (cursor < 135 + contact.length * 11) nextPage()
    cursor -= 12
    rule(M, cursor, CW, blue, 1.1)
    cursor -= 20
    const xRight = M + 315
    write('TALLER Y CONTACTO', M + 5, cursor, 9.3, navy, true)
    cursor -= 15
    write(truncate(snapshot.workshop.name, 8.7, 255), M + 5, cursor, 8.7, navy)
    cursor -= 14
    for (const field of contact) {
      write(truncate(field, 7.9, 260), M + 5, cursor, 7.9, gray)
      cursor -= 11
    }
    write('ESPACIO DE CONFORMIDAD', xRight, cursor + 29, 8.7, navy, true)
    rule(xRight, cursor + 5, 107, navy)
    rule(xRight + 127, cursor + 5, 90, navy)
    write('Cliente', xRight + 30, cursor - 6, 7.2, gray)
    write('Taller', xRight + 155, cursor - 6, 7.2, gray)
    write('Sin firmas registradas', xRight, cursor - 21, 7.2, gray)
  }

  renderHeader(true)
  tableHeader()
  snapshot.items.forEach((item, index) => tableItem(item, index))
  summaryAndConditions()
  finishingBlock()
  const pages = doc.getPages()
  pages.forEach((p, index) => {
    p.drawRectangle({ x: 0, y: 0, width: W, height: 28, color: navy })
    p.drawRectangle({ x: M, y: 27, width: 70, height: 2, color: blue })
    const previousPage = page
    page = p
    write('ByteTorque · Powered by ByteTorque', M, 11.5, 8, white, true)
    write('COTIZACIÓN  ·  ' + number + '  ·  REV. ' + revision + '  ·  ' +
      (index + 1) + '/' + pages.length, W - M, 11.5, 7.2, white, false, 'right')
    page = previousPage
  })
  // Own logo is permitted only as a server-authorized, tenant-private asset.
  // Display it unobtrusively without replacing the ByteTorque baseline layout.
  if (ownLogo) {
    const first = pages[0]
    const size = ownLogo.scaleToFit(62, 22)
    first.drawImage(ownLogo, {
      x: W - M - size.width, y: H - 89,
      width: size.width, height: size.height
    })
  }
  return doc.save({ useObjectStreams: false })
}

export async function browserQuotePdf(snapshot: Snapshot, draft = true, templatePdf?: Uint8Array) {
  const [font, logo] = await Promise.all([
    fetch('/cp05/DejaVuSans.ttf'),
    fetch('/icon-192.png')
  ])
  if (!font.ok || !logo.ok) throw Error('PDF assets unavailable')
  return quotePdf(
    snapshot,
    {
      font: new Uint8Array(await font.arrayBuffer()),
      logo: new Uint8Array(await logo.arrayBuffer()),
      templatePdf
    },
    draft
  )
}
export function downloadPdf(bytes: Uint8Array, name: string) {
  const url = URL.createObjectURL(
    new Blob([bytes.slice().buffer], { type: 'application/pdf' })
  )
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 30000)
}
