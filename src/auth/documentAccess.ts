/** Client invalidation only. It never grants document access: each action still calls the server. */
let epoch=0,scope=''
const listeners=new Set<()=>void>(),urls=new Set<string>()
export class DocumentAccessChanged extends Error {constructor(){super('Cambió la autorización documental. Vuelve a solicitar el documento.')}}
export const documentEpoch=()=>epoch
export const subscribeDocuments=(listener:()=>void)=>{listeners.add(listener);return()=>{listeners.delete(listener)}}
export function invalidateDocuments(){epoch++;for(const url of urls)URL.revokeObjectURL(url);urls.clear();for(const listener of listeners)listener()}
export function setDocumentAuthority(next:string){if(next!==scope){scope=next;invalidateDocuments()}}
export function documentFence(){const started=epoch;return {current:()=>started===epoch,assert(){if(started!==epoch)throw new DocumentAccessChanged()}}}
export function revokeDocumentURL(url:string){if(urls.delete(url))URL.revokeObjectURL(url)}
export function documentURL(bytes:Uint8Array,ttl=300000,type='application/pdf'){const url=URL.createObjectURL(new Blob([bytes.slice().buffer],{type}));urls.add(url);setTimeout(()=>revokeDocumentURL(url),Math.max(0,ttl));return url}
