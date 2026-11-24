import { UUID } from '../clientes/cp03PilotContracts'
import { isArchivedPdf } from '../cp05/pdfEnvelope'
export type DocumentKind='quote'|'report'|'handover'
export type ArchivedDocument={kind:DocumentKind;fileName:string;bucket:string;path:string;sha256:string;byteLength:number;contentType:'application/pdf'}
export type ArchiveRow={workshopId:string;revisionId:string;quoteId:string;orderId:string;customerId:string;vehicleId:string;revision:number;number:number;issuedAt:string;customerName:string;plate:string|null;make:string;model:string;total:number;complete:boolean;quoteStatus:string;customerArchived:boolean;vehicleArchived:boolean;orderCancelled:boolean;deliveryId:string|null;canArchive:boolean}
export type ArchiveDocumentSet={workshopId:string;revisionId:string;quoteId:string;orderId:string;vehicleId:string;customerId:string;revision:number;issuedAt:string;complete:boolean;documents:ArchivedDocument[]}
export class ArchiveFailure extends Error {constructor(readonly kind:'denied'|'disabled'|'integrity'|'missing'|'unavailable'|'invalid'){super(kind)}}
export function archiveId(id:string){if(!UUID.test(id))throw new ArchiveFailure('invalid');return id.toLowerCase()}
export function archiveMessage(error:unknown){return error instanceof ArchiveFailure?{
 denied:'Tu sesión o tus permisos no permiten consultar este expediente.',disabled:'El archivo documental no está habilitado para este taller.',
 integrity:'El documento no coincide con su comprobante de integridad. No se entregaron sus bytes.',missing:'El original no está disponible. No se regenerará ni sustituirá por una copia actual.',
 unavailable:'No se pudo confirmar la consulta. Reintenta; una respuesta incierta al archivar se conciliará con el mismo expediente.',invalid:'La referencia documental no es válida.'
}[error.kind]:'No se pudo consultar el expediente. Inténtalo nuevamente.'}
export async function verifyArchivedBytes(bytes:Uint8Array,doc:ArchivedDocument){
 if(!isArchivedPdf(bytes)||bytes.length!==doc.byteLength||bytes.length>20000000)throw new ArchiveFailure('integrity')
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes.slice().buffer)),n=>n.toString(16).padStart(2,'0')).join('')
 if(hash!==doc.sha256)throw new ArchiveFailure('integrity')
 return bytes
}
export function validateDocumentSet(value:unknown,wid:string,rid:string):ArchiveDocumentSet{
 const data=value as ArchiveDocumentSet
 if(!data||data.workshopId!==wid||data.revisionId!==rid||![data.quoteId,data.orderId,data.vehicleId,data.customerId].every(x=>typeof x==='string'&&UUID.test(x))||
  !Number.isSafeInteger(data.revision)||data.revision<1||!Number.isFinite(Date.parse(data.issuedAt))||!Array.isArray(data.documents)||![1,3].includes(data.documents.length)||typeof data.complete!=='boolean')throw new ArchiveFailure('denied')
 if(data.complete!== (data.documents.length===3))throw new ArchiveFailure('integrity')
 for(const [i,d] of data.documents.entries()){
  if(!d||d.kind!==(['quote','report','handover'] as const)[i]||!/^[A-Za-z0-9_-]{1,115}\.pdf$/.test(d.fileName)||
    !/^[a-f0-9]{64}$/.test(d.sha256)||!Number.isSafeInteger(d.byteLength)||d.byteLength<12||d.byteLength>20000000||d.contentType!=='application/pdf')throw new ArchiveFailure('integrity')
  const prefix=d.kind==='quote'?wid+'/quotes/'+data.quoteId+'/r'+data.revision+'/':wid+'/closings/'+data.orderId+'/'+rid+'/'
  const suffix=d.kind==='quote'?'[a-f0-9]{64}':('[0-9a-f-]{36}/'+d.kind+'/'+d.sha256)
  if(!new RegExp('^'+prefix+suffix+'\\.pdf$').test(d.path))throw new ArchiveFailure('integrity')
  if(d.bucket!==(d.kind==='quote'?'cp05-quote-documents':'bt-closing-documents')||typeof d.path!=='string'||!d.path.startsWith(prefix)||d.path.includes('..')||!d.path.endsWith('.pdf'))throw new ArchiveFailure('integrity')
 }
 return data
}
