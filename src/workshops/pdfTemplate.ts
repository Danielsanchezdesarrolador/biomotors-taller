/**
 * Workshop-owned custom PDF stationery is a premium Plus/Full feature.
 * Client checks are usability only: storage RLS and the trusted RPC are
 * the authorization boundaries. Never grant access from user_metadata.
 */
import type { AuthController } from '../auth/controller'
import { workshopRpc } from './client'

export const PDF_TEMPLATE_MAX_BYTES = 4 * 1024 * 1024
export const TEMPLATE_BUCKET = 'bt-workshop-quote-templates'
export type PdfTemplateStatus = {
  workshopId: string
  eligible: boolean
  plan: 'basic' | 'plus' | 'full'
  templatePath: string | null
}
export function validPdfTemplateStatus(raw: unknown, workshopId: string): PdfTemplateStatus | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const o = raw as Record<string, unknown>
  if (o.workshopId !== workshopId || typeof o.eligible !== 'boolean' ||
      !['basic','plus','full'].includes(String(o.plan)) ||
      !(o.templatePath === null || typeof o.templatePath === 'string') ||
      (o.eligible && !['plus','full'].includes(String(o.plan))) ||
      (!o.eligible && o.templatePath !== null)) return null
  return {
    workshopId, eligible: o.eligible, plan: o.plan as PdfTemplateStatus['plan'],
    templatePath: o.templatePath as string | null
  }
}
export function validPdfTemplateHeader(bytes: Uint8Array, mime: string): boolean {
  return mime === 'application/pdf' &&
    bytes.length >= 8 && bytes.length <= PDF_TEMPLATE_MAX_BYTES &&
    [37,80,68,70,45].every((v,i) => bytes[i] === v) &&
    new TextDecoder('ascii').decode(bytes.slice(-1024)).includes('%%EOF')
}
export async function uploadWorkshopPdfTemplate(controller: AuthController, file: File) {
  const before = controller.getSnapshot()
  const context = before.context
  if (!context || !['owner','admin'].includes(context.role)) throw Error('MANAGER_REQUIRED')
  const wid = context.workshop.id
  const client = await controller.directoryClient()
  if (!client || before !== controller.getSnapshot()) throw Error('SESSION_CHANGED')
  const status = validPdfTemplateStatus(
    await workshopRpc(controller, 'bt_plan04_pdf_template_status', { p_workshop_id: wid }), wid
  )
  if (!status?.eligible) throw Error('PLUS_FULL_REQUIRED')
  if (file.size < 8 || file.size > PDF_TEMPLATE_MAX_BYTES) throw Error('TEMPLATE_TOO_LARGE')
  const original = new Uint8Array(await file.arrayBuffer())
  if (!validPdfTemplateHeader(original, file.type)) throw Error('INVALID_PDF_FILE')
  // Rebuild in a fresh document: don't carry over JS/OpenAction, scripts,
  // attachments, fillable forms or original catalog metadata.
  const { PDFDocument, PDFName } = await import('pdf-lib')
  const source = await PDFDocument.load(original, { ignoreEncryption: false })
  if (source.getPageCount() !== 1) throw Error('TEMPLATE_MUST_BE_ONE_PAGE')
  const originalPage = source.getPage(0)
  const {width,height} = originalPage.getSize()
  if (Math.abs(width - 595.28) > 2 || Math.abs(height - 841.89) > 2)
    throw Error('TEMPLATE_MUST_BE_A4_PORTRAIT')
  const safe = await PDFDocument.create()
  const [copied] = await safe.copyPages(source,[0])
  for (const attribute of ['Annots','AA','PresSteps','Metadata'])
    copied.node.delete(PDFName.of(attribute))
  safe.addPage(copied)
  const clean = await safe.save({ useObjectStreams: false })
  if (clean.length > PDF_TEMPLATE_MAX_BYTES ||
      before !== controller.getSnapshot()) throw Error('TEMPLATE_VALIDATION_FAILED')
  const path = wid + '/' + crypto.randomUUID() + '.pdf'
  const upload = await client.storage.from(TEMPLATE_BUCKET).upload(path,
    new Blob([clean.slice().buffer],{type:'application/pdf'}),
    { contentType:'application/pdf',upsert:false })
  if (upload.error || before !== controller.getSnapshot()) throw Error('TEMPLATE_STORAGE_FAILED')
  await workshopRpc(controller, 'bt_plan04_set_pdf_template', {
    p_workshop_id:wid,p_path:path
  })
  return path
}
export async function restoreOfficialPdfTemplate(controller: AuthController) {
  const context = controller.getSnapshot().context
  if (!context || !['owner','admin'].includes(context.role)) throw Error('MANAGER_REQUIRED')
  await workshopRpc(controller, 'bt_plan04_set_pdf_template', {
    p_workshop_id:context.workshop.id,p_path:null
  })
}
