import {documentURL,revokeDocumentURL,documentFence} from '../auth/documentAccess'
import type {SupabaseClient} from '@supabase/supabase-js'
export function downloadPdf(bytes:Uint8Array,name:string){const url=documentURL(bytes);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>revokeDocumentURL(url),30000)}
export async function requestCommercialPdf(client:SupabaseClient,args:Record<string,unknown>){
 const fence=documentFence();const r=await client.functions.invoke('bt-commercial-documents',{body:args})
 if(r.error||!(r.data instanceof Blob))throw Error('COMMERCIAL_DOCUMENT_DENIED')
 const bytes=new Uint8Array(await r.data.arrayBuffer());fence.assert();if(new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-')throw Error('INVALID_PDF');return bytes
}
