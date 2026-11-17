import { describe, expect, it } from 'vitest'
import {
  PDF_TEMPLATE_MAX_BYTES, validPdfTemplateHeader, validPdfTemplateStatus
} from './pdfTemplate'
const wid='11111111-1111-4111-8111-111111111111'
const val={workshopId:wid,eligible:true,plan:'plus',templatePath:null}
describe('private Plus/Full PDF stationery',()=>{
  it('does not trust Basic or unrelated workshop',()=>{
    expect(validPdfTemplateStatus({...val,plan:'basic'},wid)).toBeNull()
    expect(validPdfTemplateStatus({...val,workshopId:'another'},wid)).toBeNull()
    expect(validPdfTemplateStatus({...val,eligible:false,templatePath:'private.pdf'},wid)).toBeNull()
    expect(validPdfTemplateStatus({...val,plan:'full'},wid)?.eligible).toBe(true)
  })
  it('requires a PDF envelope, MIME and a bounded private upload',()=>{
    const bytes = new TextEncoder().encode('%PDF-1.7\n%%EOF\n')
    expect(validPdfTemplateHeader(bytes,'application/pdf')).toBe(true)
    expect(validPdfTemplateHeader(bytes,'text/html')).toBe(false)
    expect(validPdfTemplateHeader(new TextEncoder().encode('<script>x</script>'),'application/pdf')).toBe(false)
    expect(validPdfTemplateHeader(new Uint8Array(PDF_TEMPLATE_MAX_BYTES+1),'application/pdf')).toBe(false)
  })
})
