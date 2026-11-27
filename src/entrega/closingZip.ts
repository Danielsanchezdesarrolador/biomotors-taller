import {documentURL,revokeDocumentURL} from '../auth/documentAccess'
/**
 * BT-COM-01: one local, uncompressed ZIP with exactly three PDFs.
 * The caller MUST obtain the original CP05 PDF through the authorized,
 * SHA-256-verifying documentClient and both copies through finalPdf.
 * This module never reads Storage, calls APIs, sends emails or archives files.
 */
import type { PreparedClosing } from './finalPackage'

export type ClosingPdfFiles = {
  quotation: Uint8Array
  report: Uint8Array
  handover: Uint8Array
}

const encoder = new TextEncoder()
const MAX_PDF_BYTES = 25 * 1024 * 1024
const MAX_PACKAGE_BYTES = 60 * 1024 * 1024

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff
  for (const b of bytes) {
    crc ^= b
    for (let i = 0; i < 8; i++)
      crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0)
  }
  return (crc ^ 0xffffffff) >>> 0
}

export function closingPackageZip(
  packet: PreparedClosing, files: ClosingPdfFiles
): { bytes: Uint8Array; fileName: string } {
  if (!packet || packet.state !== 'prepared_locally_not_archived_or_emailed' ||
      !Number.isSafeInteger(packet.quote.number) || packet.quote.number < 1 ||
      !Number.isSafeInteger(packet.quote.revision) || packet.quote.revision < 1 ||
      !packet.bundleId || !packet.quote.revisionId || !packet.report.id ||
      !packet.handover.id) throw Error('BT_COM_INVALID_PACKET')

  const entries = [
    { name: packet.quote.fileName, data: files.quotation },
    { name: packet.report.fileName, data: files.report },
    { name: packet.handover.fileName, data: files.handover }
  ].map(({ name, data }) => {
    if (typeof name !== 'string' || !/^[A-Za-z0-9_-]+\.pdf$/.test(name) ||
        !(data instanceof Uint8Array) || data.length < 8 ||
        data.length > MAX_PDF_BYTES ||
        String.fromCharCode(...data.subarray(0, 5)) !== '%PDF-')
      throw Error('BT_COM_INVALID_DOCUMENT')
    return { name: encoder.encode(name), data, crc: crc32(data) }
  })
  if (new Set(entries.map(e => new TextDecoder().decode(e.name))).size !== 3)
    throw Error('BT_COM_DUPLICATE_DOCUMENT')

  const localBytes = entries.reduce((n, e) => n + 30 + e.name.length + e.data.length, 0)
  const centralBytes = entries.reduce((n, e) => n + 46 + e.name.length, 0)
  const totalBytes = localBytes + centralBytes + 22
  if (totalBytes > MAX_PACKAGE_BYTES) throw Error('BT_COM_PACKAGE_TOO_LARGE')

  const bytes = new Uint8Array(totalBytes)
  const view = new DataView(bytes.buffer)
  const u16 = (at: number, n: number) => view.setUint16(at, n, true)
  const u32 = (at: number, n: number) => view.setUint32(at, n, true)
  const offsets: number[] = []
  let pos = 0
  for (const e of entries) {
    offsets.push(pos)
    u32(pos, 0x04034b50)
    u16(pos + 4, 20) // ZIP 2.0, STORE
    u16(pos + 6, 0x0800) // UTF-8 filenames
    u16(pos + 8, 0)
    u16(pos + 10, 0)
    u16(pos + 12, 0x21) // stable DOS timestamp: 1980-01-01
    u32(pos + 14, e.crc)
    u32(pos + 18, e.data.length)
    u32(pos + 22, e.data.length)
    u16(pos + 26, e.name.length)
    u16(pos + 28, 0)
    pos += 30
    bytes.set(e.name, pos)
    pos += e.name.length
    bytes.set(e.data, pos)
    pos += e.data.length
  }
  const centralStart = pos
  entries.forEach((e, i) => {
    u32(pos, 0x02014b50)
    u16(pos + 4, 20)
    u16(pos + 6, 20)
    u16(pos + 8, 0x0800)
    u16(pos + 10, 0)
    u16(pos + 12, 0)
    u16(pos + 14, 0x21)
    u32(pos + 16, e.crc)
    u32(pos + 20, e.data.length)
    u32(pos + 24, e.data.length)
    u16(pos + 28, e.name.length)
    u16(pos + 30, 0)
    u16(pos + 32, 0)
    u16(pos + 34, 0)
    u16(pos + 36, 0)
    u32(pos + 38, 0)
    u32(pos + 42, offsets[i])
    pos += 46
    bytes.set(e.name, pos)
    pos += e.name.length
  })
  const centralSize = pos - centralStart
  u32(pos, 0x06054b50)
  u16(pos + 4, 0)
  u16(pos + 6, 0)
  u16(pos + 8, 3)
  u16(pos + 10, 3)
  u32(pos + 12, centralSize)
  u32(pos + 16, centralStart)
  u16(pos + 20, 0)
  if (pos + 22 !== totalBytes) throw Error('BT_COM_ZIP_LENGTH_MISMATCH')
  return {
    bytes,
    fileName: 'CIERRE_COT-' + String(packet.quote.number).padStart(6, '0') +
      '_R' + packet.quote.revision + '.zip'
  }
}

export function downloadClosingZip(bytes: Uint8Array, fileName: string) {
  if (!bytes.length || !/^CIERRE_COT-\d+_R\d+\.zip$/.test(fileName))
    throw Error('BT_COM_INVALID_DOWNLOAD')
  const url = documentURL(bytes,30000,'application/zip')
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  setTimeout(() => revokeDocumentURL(url), 30_000)
}
