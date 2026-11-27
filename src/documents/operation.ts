/** Stable retry metadata, never cached bytes or permission. Only the server expires an authorization; clocks never rotate UUID. */
const memory=new Map<string,{id:string;at:number}>()
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i
export class DocumentOperationExpired extends Error {
 constructor(readonly operationKey:string,reason:'expired'|'invalidated'='expired'){super(reason==='expired'?'La operación documental expiró. Inicia una nueva operación de forma explícita; puede consumir un cupo disponible.':'La autorización documental ya no está vigente. Solicita una nueva operación explícitamente; el servidor comprobará tu plan y el cupo disponible.')}
}
function load(key:string){if(memory.has(key))return memory.get(key);try{const row=JSON.parse(sessionStorage.getItem(key)||'null');if(row&&typeof row.id==='string'&&uuid.test(row.id)&&Number.isFinite(row.at)){memory.set(key,row);return row}}catch{/* The in-memory identity survives unavailable browser storage. */}return undefined}
function create(key:string){const value={id:crypto.randomUUID(),at:Date.now()};memory.set(key,value);try{sessionStorage.setItem(key,JSON.stringify(value))}catch{/* No bytes or authorization persisted. */}return value}
export function documentOperationKey(userId:string,workshopId:string,resource:string){return 'bt:commercial-document:'+userId+':'+workshopId+':'+resource}
export function documentOperation(key:string){const value=load(key)??create(key);return {...value}}
export function assertDocumentOperation(key:string,id:string){const row=load(key);if(!row||row.id!==id)throw new DocumentOperationExpired(key,'invalidated')}
/** Only call after an explicit user confirmation, never from a retry/catch/timer. */
export function restartDocumentOperation(error:DocumentOperationExpired){return create(error.operationKey)}

export async function isDocumentOperationNotCurrent(error:unknown){const response=(error as {context?:Response})?.context;if(!(response instanceof Response))return false;const body=await response.clone().json().catch(()=>null);return body?.error==='DOCUMENT_OPERATION_NOT_CURRENT'}
