/** Shared original CP05 envelope validation; not a malware/content scanner. */
const CP05_MAX_PDF_BYTES=20_000_000
/** Minimal generated PDF envelope; never trusts MIME supplied by a caller. */
export function isArchivedPdf(bytes: Uint8Array): boolean {
  if (!(bytes instanceof Uint8Array) || bytes.byteLength < 12 ||
      bytes.byteLength > CP05_MAX_PDF_BYTES) return false
  const head = new TextDecoder('ascii').decode(bytes.subarray(0, 8))
  const tail = new TextDecoder('ascii').decode(bytes.subarray(Math.max(0, bytes.length - 2048)))
  return /^%PDF-[1-2]\.[0-9]/.test(head) && tail.includes('%%EOF')
}
