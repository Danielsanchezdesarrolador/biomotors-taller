/** Private and append-only CP05 archive: candidate only; never browser-accessible.
 * Requires an approved private bucket with backend-only Storage policies.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
export const CP05_BUCKET = 'cp05-quote-documents'
export const CP05_MAX_PDF_BYTES = 20_000_000

const uuid = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
const pathPattern = new RegExp(
  '^' + uuid + '/quotes/' + uuid + '/r[1-9][0-9]*/[a-f0-9]{64}\\.pdf$'
)
const hexHashPattern = /^[a-f0-9]{64}$/
const hash = async (bytes: Uint8Array) =>
  [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes.slice().buffer))]
    .map(x => x.toString(16).padStart(2, '0')).join('')

/** Minimal generated PDF envelope; never trusts MIME supplied by a caller. */
export function isArchivedPdf(bytes: Uint8Array): boolean {
  if (!(bytes instanceof Uint8Array) || bytes.byteLength < 12 ||
      bytes.byteLength > CP05_MAX_PDF_BYTES) return false
  const head = new TextDecoder('ascii').decode(bytes.subarray(0, 8))
  const tail = new TextDecoder('ascii').decode(bytes.subarray(Math.max(0, bytes.length - 2048)))
  return /^%PDF-[1-2]\\.[0-9]/.test(head) && tail.includes('%%EOF')
}
export function isArchivePath(path: string): boolean {
  return typeof path === 'string' && pathPattern.test(path)
}
export function privateArchiveCandidate(client: SupabaseClient, policy: { approved: boolean }) {
  const gate = (path: string) => {
    if (policy.approved !== true || !isArchivePath(path))
      throw Error('PRIVATE_ARCHIVE_DISABLED')
  }
  return {
    async putIfAbsent(path: string, pdf: Uint8Array) {
      gate(path)
      if (!isArchivedPdf(pdf)) throw Error('INVALID_PDF')
      const sha256 = await hash(pdf)
      const bucket = client.storage.from(CP05_BUCKET)
      // The immutable Storage object name is derived by the trusted issuance
      // service from an immutable SQL snapshot; never use upsert or overwrite.
      const uploaded = await bucket.upload(path, pdf, {
        contentType: 'application/pdf',
        upsert: false
      })
      // Confirm exact bytes even if a previous identical retry created the
      // object. Fail closed if upload failed and an unrelated object exists.
      const existing = await bucket.download(path)
      if (existing.error || !existing.data) throw Error('ARCHIVE_NOT_CONFIRMED')
      const restored = new Uint8Array(await existing.data.arrayBuffer())
      if (restored.length !== pdf.length || (await hash(restored)) !== sha256)
        throw Error(uploaded.error ? 'ARCHIVE_CONFLICT' : 'ARCHIVE_INTEGRITY_ERROR')
      return { path, sha256, size: pdf.length, contentType: 'application/pdf' as const }
    },
    async restore(path: string, expectedHash: string, expectedSize?: number) {
      gate(path)
      if (!hexHashPattern.test(expectedHash) ||
          (expectedSize !== undefined &&
            (!Number.isSafeInteger(expectedSize) || expectedSize < 12 ||
              expectedSize > CP05_MAX_PDF_BYTES)))
        throw Error('INVALID_ARCHIVE_METADATA')
      const result = await client.storage.from(CP05_BUCKET).download(path)
      if (result.error || !result.data) throw Error('ARCHIVE_UNAVAILABLE')
      const bytes = new Uint8Array(await result.data.arrayBuffer())
      if (!isArchivedPdf(bytes) ||
          (expectedSize !== undefined && bytes.length !== expectedSize) ||
          (await hash(bytes)) !== expectedHash)
        throw Error('ARCHIVE_INTEGRITY_ERROR')
      return bytes
    }
  }
}
