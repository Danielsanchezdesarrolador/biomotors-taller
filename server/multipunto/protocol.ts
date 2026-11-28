/** V2 is a separate protocol. A UUID is an idempotency key, never a permission. */
export type Kind='draft'|'final'
export type MPJob={id:string;workshop_id:string;order_id:string;kind:Kind;state:string;generation:number;credit_id:string;document_id:string;revision:number;created_at:string;lease_until:string}
export type MPDocument={id:string;workshop_id:string;order_id:string;revision:number;pdf_hash:string;byte_length:number;bucket:string;path:string}
export type MPItem={id:string;name:string;category:string;state:'ok'|'attention'|'immediate'|'unreviewed';note:string;resolution:string|null}
export type MPSnapshot={schema:string;scope:{workshopId:string;orderId:string};order:Record<string,unknown>;vehicle:Record<string,unknown>;customer:Record<string,unknown>;workshop:Record<string,unknown>;profile:Record<string,unknown>|null;items:MPItem[];additional:Record<string,unknown>[];historyDigest:string;policy:Record<string,string>;policyHash:string}
export type MPInfo={version:2;workshopId:string;orderId:string;plan:string;canIssue:boolean;nextRevision:number;orderStatus:string;sourceHash:string;snapshotHash:string;items:MPItem[];sourceProblem:string|null;originals:MPDocument[]}
export type MPWorker={job:MPJob;snapshot:MPSnapshot;snapshotHash:string;canonical:string;artifact:null|{hash:string;size:number;path:string|null;bytes:string}}
export class MPError extends Error{constructor(public code:string,public status=409){super(code)}}
export const sha=async(b:Uint8Array)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',b.slice().buffer)),v=>v.toString(16).padStart(2,'0')).join('')
export function unhex(s:string){if(!/^(?:[a-f0-9]{2})+$/.test(s))throw new MPError('MP_INTEGRITY_ERROR');return Uint8Array.from(s.match(/../g)!,n=>parseInt(n,16))}
export const hex=(b:Uint8Array)=>Array.from(b,n=>n.toString(16).padStart(2,'0')).join('')
export function uuid(v:unknown):string{if(typeof v!=='string'||!/^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(v))throw new MPError('MP_INVALID_REQUEST',400);return v.toLowerCase()}
export function hash(v:unknown):string{if(typeof v!=='string'||!/^[a-f0-9]{64}$/.test(v))throw new MPError('MP_INVALID_REQUEST',400);return v}
