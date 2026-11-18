import { describe, it, expect, vi } from 'vitest'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { PDFDocument } from 'pdf-lib'
import { calculateTotals } from '../ordenes/orderMoney'
import { draftPayload, previewSnapshot, type Bundle, type Revision, type Draft } from './contracts'
import { quotePdf } from './pdf'
import { issueQuoteCandidate, type IssuePorts } from '../../server/cp05/issuanceCandidate'
import { privateArchiveCandidate } from '../../server/cp05/archiveCandidate'
import { deliverQuoteCandidate, type DeliveryPorts } from '../../server/cp05/deliveryCandidate'
import type { SupabaseClient } from '@supabase/supabase-js'
const id = '11111111-1111-4111-8111-111111111111'
const draft: Draft = {
  price_basis: 'net',
  valid_days: 10,
  terms: 'Validez de diez días',
  comments: 'Revisión de transmisión y frenos',
  items: [
    {
      id,
      description: 'Repuesto transmisión',
      type: 'Repuesto',
      quantity: 1.05,
      price: 10,
      performed: false
    }
  ]
}
const bundle: Bundle = {
  quote: {
    workshop_id: id,
    id,
    order_id: id,
    vehicle_id: id,
    customer_id: id,
    number: 1,
    version: 2,
    status: 'draft',
    price_basis: 'net',
    valid_days: 10,
    terms: '',
    comments: '',
    issued_revision: 0,
    issue_pending: false,
    void_reason: null,
    created_at: '2026-11-16T12:00:00Z',
    updated_at: '2026-11-16T12:00:00Z'
  },
  items: [],
  source: {
    workshop: { id, name: 'Taller sintético QA' },
    customer: {
      id,
      full_name: 'José Muñoz · QA',
      email: 'synthetic@invalid.test',
      mobile_e164: null
    },
    vehicle: { id, plate: 'QA1234', make: 'Prueba', model: 'Sintético' },
    order: {
      id,
      complaint: 'Motivo declarado por el cliente',
      opened_at: '2026-11-16T12:00:00Z',
      intake_odometer: 10
    }
  },
  revisions: [],
  events: [],
  deliveries: []
}
const snapshot = previewSnapshot(bundle, draft)
const assets = {
  font: new Uint8Array(readFileSync('public/cp05/DejaVuSans.ttf')),
  logo: new Uint8Array(readFileSync('assets/brand/generated/icon-192.png'))
}
const revision = {
  id,
  workshop_id: id,
  quote_id: id,
  revision: 1,
  payload: snapshot,
  payload_sha256: 'b'.repeat(64)
} as Revision
const sha = async (b: Uint8Array) =>
  Buffer.from(await crypto.subtle.digest('SHA-256', b.slice().buffer)).toString('hex')
describe('CP05 importe y documentos', () => {
  it('redondea cada línea y el IVA exactamente como PostgreSQL', () => {
    expect(calculateTotals(draft.items)).toEqual({ subtotal: 11, tax: 2, total: 13 })
    expect(
      calculateTotals([
        { quantity: 1, price: 52900 },
        { quantity: 1.5, price: 24900 },
        { quantity: 1.05, price: 10 }
      ])
    ).toEqual({ subtotal: 90261, tax: 17150, total: 107411 })
  })
  it.each([0, -1, NaN, Infinity, 1.001, 10001])('rechaza cantidad %s', (quantity) =>
    expect(() => draftPayload({ ...draft, items: [{ ...draft.items[0], quantity }] })).toThrow()
  )
  it.each([0, -1, NaN, Infinity, 1.5, 100000001])('rechaza precio %s', (price) =>
    expect(() => draftPayload({ ...draft, items: [{ ...draft.items[0], price }] })).toThrow()
  )
  it('rechaza duplicados y bases de IVA distintas', () => {
    expect(() =>
      draftPayload({
        ...draft,
        items: [draft.items[0], { ...draft.items[0], id: '22222222-2222-4222-8222-222222222222' }]
      })
    ).toThrow()
    expect(() => draftPayload({ ...draft, price_basis: 'gross' } as unknown as Draft)).toThrow()
  })
  it('genera PDF real, Unicode, A4 y bytes deterministas', async () => {
    const bytes = await quotePdf(snapshot, assets, true)
    expect(Buffer.from(bytes).subarray(0, 5).toString()).toBe('%PDF-')
    const pdf = await PDFDocument.load(bytes)
    expect(pdf.getPageCount()).toBe(1)
    expect(pdf.getPage(0).getSize().width).toBeCloseTo(595.28)
    expect(Buffer.from(bytes).equals(Buffer.from(await quotePdf(snapshot, assets, true)))).toBe(
      true
    )
    mkdirSync('artifacts/cp05', { recursive: true })
    writeFileSync('artifacts/cp05/borrador-qa.pdf', bytes)
  })
  it('incorpora marca y contacto capturados sin modificar la revisión histórica', async () => {
    const before = JSON.stringify(snapshot)
    const branded = {...snapshot,workshop:{...snapshot.workshop,contactEmail:'qa@invalid.test',phone:'123',address:'Dirección sintética'}}
    const bytes = await quotePdf(branded,{...assets,workshopLogo:assets.logo})
    expect((await PDFDocument.load(bytes)).getPageCount()).toBe(1)
    expect(JSON.stringify(snapshot)).toBe(before)
    expect(Buffer.from(bytes).equals(Buffer.from(await quotePdf(snapshot,assets)))).toBe(false)
  })
  it('compone papelería A4 privada sin modificar los datos del documento', async () => {
    const clean = await PDFDocument.create()
    clean.addPage([595.28,841.89])
    const paper = new Uint8Array(await clean.save())
    const original = JSON.stringify(snapshot)
    const withPaper = await quotePdf(snapshot,{...assets,templatePdf:paper},true)
    const pdf = await PDFDocument.load(withPaper)
    expect(pdf.getPageCount()).toBe(1)
    expect(pdf.getPage(0).getSize().width).toBeCloseTo(595.28)
    expect(JSON.stringify(snapshot)).toBe(original)
  })
  it('mantiene en una hoja A4 la cotización QA de tres partidas sin ocultar datos', async () => {
    const qaDraft: Draft = {
      ...draft,
      terms: 'PRUEBA QA: cotización ficticia sin validez comercial.',
      comments: 'Solo ensayo privado de ByteTorque. No emitir ni enviar.\\nBorrador sin emitir ni archivar. No es documento tributario ni aceptación del cliente.',
      items: [
        {...draft.items[0], description: 'Repuesto QA sin entrega', type: 'Repuesto',
          quantity: 1, price: 52900},
        {...draft.items[0], id: '22222222-2222-4222-8222-222222222222',
          description: 'Mano de obra QA simulada', type: 'Mano de obra',
          quantity: 1.5, price: 24900},
        {...draft.items[0], id: '33333333-3333-4333-8333-333333333333',
          description: 'Insumo QA no adquirido', type: 'Insumo',
          quantity: 1.05, price: 10}
      ]
    }
    const qa = previewSnapshot(bundle, qaDraft)
    const pdf = await PDFDocument.load(await quotePdf(qa, assets, true))
    expect(qa.totals).toEqual({subtotal: 90261, tax: 17150, total: 107411})
    expect(pdf.getPageCount()).toBe(1)
  })
  it('permite todos los contactos configurados, sin perderlos cerca del pie', async () => {
    const branded = {...snapshot, workshop: {...snapshot.workshop,
      phone: '+56 2 1234 5678', contactEmail: 'qa@invalid.test',
      address: 'Avenida de Pruebas 123, Santiago'}}
    const pdf = await PDFDocument.load(await quotePdf(branded, assets, true))
    expect(pdf.getPageCount()).toBeGreaterThanOrEqual(1)
  })
  it('pagina 200 partidas sin perder el total histórico', async () => {
    const long = {
      ...snapshot,
      items: Array.from({ length: 200 }, (_, n) => ({
        ...snapshot.items[0],
        description: `Partida ${n + 1} · diagnóstico mecánico`
      }))
    }
    const pdf = await PDFDocument.load(await quotePdf(long, assets))
    expect(pdf.getPageCount()).toBeGreaterThan(5)
  })
})
describe('CP05 backend candidato sin activación', () => {
  const ports = (): IssuePorts => ({
    verifyUser: vi.fn(async () => ({ id, confirmed: true })),
    reserve: vi.fn(async () => ({
      request_id: id,
      revision: 1,
      payload: snapshot,
      payload_sha256: 'b'.repeat(64)
    })),
    render: vi.fn(async () => quotePdf(snapshot, assets)),
    archive: vi.fn(async (path, pdf) => ({
      path,
      sha256: await sha(pdf),
      size: pdf.length,
      contentType: 'application/pdf' as const
    })),
    finish: vi.fn(async (_, __, receipt) => ({
      ...revision,
      pdf_sha256: receipt.sha256,
      pdf_object_path: receipt.path,
      pdf_size: receipt.size
    }))
  })
  it('bloquea emisión antes de cualquier acceso cuando falta aprobación', async () => {
    const p = ports()
    await expect(
      issueQuoteCandidate({ archiveApproved: false }, p, bundle.quote, id)
    ).rejects.toThrow('ARCHIVE_NOT_AUTHORIZED')
    expect(p.verifyUser).not.toHaveBeenCalled()
  })
  it('no finaliza si archivo falla o recibo no coincide', async () => {
    const p = ports()
    p.archive = vi.fn(async () => {
      throw Error('Offline')
    })
    await expect(
      issueQuoteCandidate({ archiveApproved: true }, p, bundle.quote, id)
    ).rejects.toThrow()
    expect(p.finish).not.toHaveBeenCalled()
  })
  it('emite solo después de confirmar bytes y hash del archivo', async () => {
    const p = ports()
    const result = await issueQuoteCandidate({ archiveApproved: true }, p, bundle.quote, id)
    expect(result.pdf_sha256).toMatch(/^[a-f0-9]{64}$/)
    expect(p.finish).toHaveBeenCalledOnce()
  })
  it('recupera exactamente bytes archivados y rechaza sobrescritura', async () => {
    const stored = new Map<string, Uint8Array>()
    const client = {
      storage: {
        from: () => ({
          upload: async (path: string, b: Uint8Array) => {
            if (stored.has(path)) return { error: Error('Exists') }
            stored.set(path, b)
            return { error: null }
          },
          download: async (path: string) => ({
            data: new Blob([stored.get(path)!.slice().buffer]),
            error: null
          })
        })
      }
    } as unknown as SupabaseClient
    const p = privateArchiveCandidate(client, { approved: true }),
      path = `${id}/quotes/${id}/r1/${'b'.repeat(64)}.pdf`,
      bytes = await quotePdf(snapshot, assets)
    const receipt = await p.putIfAbsent(path, bytes)
    await p.putIfAbsent(path, bytes)
    expect(await p.restore(path, receipt.sha256)).toEqual(bytes)
    await expect(p.putIfAbsent(path, new Uint8Array([1, 2, 3]))).rejects.toThrow('ARCHIVE_CONFLICT')
  })
  const delivery = (): DeliveryPorts => ({
    authorize: vi.fn(async () => revision),
    queue: vi.fn(async () => {}),
    send: vi.fn(async () => ({ confirmed: true, providerId: 'SYNTHETIC' })),
    record: vi.fn(async () => {})
  })
  it('correo OFF no hace peticiones ni marca enviados', async () => {
    const p = delivery()
    await expect(deliverQuoteCandidate({ emailApproved: false }, p, id, 1)).rejects.toThrow(
      'EMAIL_DISABLED'
    )
    expect(p.authorize).not.toHaveBeenCalled()
    expect(p.send).not.toHaveBeenCalled()
  })
  it('acuse ambiguo queda en cola y nunca figura enviado', async () => {
    const p = delivery()
    p.send = vi.fn(async () => ({ confirmed: false }))
    await expect(deliverQuoteCandidate({ emailApproved: true }, p, id, 1)).rejects.toThrow(
      'PROVIDER_ACK_UNKNOWN'
    )
    expect(p.record).not.toHaveBeenCalled()
  })
  it('usa destinatario histórico y registra un rechazo definitivo', async () => {
    const p = delivery()
    p.send = vi.fn(async () => ({
      confirmed: false,
      definitiveFailure: true,
      errorCode: 'REJECTED'
    }))
    await deliverQuoteCandidate({ emailApproved: true }, p, id, 1)
    expect(p.record).toHaveBeenCalledWith(id, 1, 'failed', null, 'REJECTED')
    expect(p.send).toHaveBeenCalledWith(
      expect.objectContaining({
        recipient: 'synthetic@invalid.test',
        idempotencyKey: `cp05:${id}:${id}`
      })
    )
  })
})
