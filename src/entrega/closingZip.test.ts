import { describe, expect, it } from 'vitest'
import type { PreparedClosing } from './finalPackage'
import { closingPackageZip } from './closingZip'

const encoder = new TextEncoder()
const pdf = (suffix: string) => encoder.encode('%PDF-1.7\n' + suffix)
const packet = {
  state: 'prepared_locally_not_archived_or_emailed', bundleId: 'synthetic-bundle',
  quote: { number: 5, revision: 2, revisionId: 'q', fileName: '01_Cotizacion_OT-test_R2.pdf' },
  report: { id: 'r', fileName: '02_Informe_OT-test_R2.pdf' },
  handover: { id: 'h', fileName: '03_Entrega_OT-test_R2.pdf' }
} as PreparedClosing
const files = { quotation: pdf('cotizacion'), report: pdf('informe'), handover: pdf('entrega') }

describe('BT-COM-01 ZIP local de tres PDF', () => {
  it('contiene tres archivos íntegros y directorio ZIP sin enviar datos', () => {
    const { bytes, fileName } = closingPackageZip(packet, files)
    expect(fileName).toBe('CIERRE_COT-000005_R2.zip')
    const view = new DataView(bytes.buffer)
    let pos = 0
    for (const [name, content] of [
      [packet.quote.fileName, files.quotation],
      [packet.report.fileName, files.report],
      [packet.handover.fileName, files.handover]
    ] as [string, Uint8Array][]) {
      expect(view.getUint32(pos, true)).toBe(0x04034b50)
      const size = view.getUint32(pos + 22, true)
      const nameLength = view.getUint16(pos + 26, true)
      const actualName = new TextDecoder().decode(bytes.subarray(pos + 30, pos + 30 + nameLength))
      expect(actualName).toBe(name)
      expect(size).toBe(content.length)
      expect(bytes.subarray(pos + 30 + nameLength, pos + 30 + nameLength + size))
        .toEqual(content)
      pos += 30 + nameLength + size
    }
    expect(view.getUint32(pos, true)).toBe(0x02014b50)
    const end = bytes.length - 22
    expect(view.getUint32(end, true)).toBe(0x06054b50)
    expect(view.getUint16(end + 8, true)).toBe(3)
    expect(view.getUint16(end + 10, true)).toBe(3)
    expect(view.getUint32(end + 16, true)).toBe(pos)
  })
  it('rechaza cualquier PDF ausente, dato no PDF, nombre inseguro o duplicado', () => {
    expect(() => closingPackageZip(packet, { ...files, report: new Uint8Array() }))
      .toThrow('BT_COM_INVALID_DOCUMENT')
    expect(() => closingPackageZip(packet, { ...files, handover: encoder.encode('not-a-pdf') }))
      .toThrow('BT_COM_INVALID_DOCUMENT')
    expect(() => closingPackageZip({ ...packet,
      report: { ...packet.report, fileName: '../otro.pdf' } }, files))
      .toThrow('BT_COM_INVALID_DOCUMENT')
    expect(() => closingPackageZip({ ...packet,
      report: { ...packet.report, fileName: packet.quote.fileName } }, files))
      .toThrow('BT_COM_DUPLICATE_DOCUMENT')
    expect(() => closingPackageZip(packet, { ...files, report: new Uint8Array(25 * 1024 * 1024 + 1) }))
      .toThrow('BT_COM_INVALID_DOCUMENT')
  })
})
