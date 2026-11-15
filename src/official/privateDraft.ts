/**
 * Short-lived client/vehicle form drafts. This is NOT a server-side save and
 * is never used for authentication or authorization.
 *
 * sessionStorage is scoped to the current browser tab and may survive refresh
 * or tab suspension. Raw form contents are NOT encrypted by this module:
 * the pilot may use only fictitious records until privacy review approves
 * handling real customer data. No tokens, session objects or passwords here.
 *
 * Reject cross-tenant/user records, invalid fields, outdated or corrupted
 * envelopes. Always clear on explicit sign-out / workshop change / save.
 */
export type DraftScope = Readonly<{userId:string; workshopId:string}>
export type DraftKind = 'new-customer' | 'edit-customer' | 'new-vehicle' | 'edit-vehicle'
export type CustomerFields = Readonly<{
  full_name:string; email:string; mobile_e164:string; notes:string
}>
export type VehicleFields = Readonly<{
  plate:string; make:string; model:string; model_year:string; odometer_km:string
}>
export type Cp03Draft = Readonly<{
  editor:DraftKind
  customerId:string | null
  vehicleId:string | null
  expectedUpdatedAt:string | null
  customerDraft:CustomerFields
  vehicleDraft:VehicleFields
}>
type Envelope = {
  version:1
  userId:string
  workshopId:string
  savedAt:number
  draft:Cp03Draft
}
type StoragePort = Pick<Storage,'getItem'|'setItem'|'removeItem'>
const KEY='bt:cp03:temporary-draft:v1'
export const DRAFT_TTL_HOURS=8
const ttl=DRAFT_TTL_HOURS*60*60*1000
let volatile:Envelope | null=null

function tabStorage():StoragePort|null {
  try {return typeof window==='undefined' ? null : window.sessionStorage}
  catch {return null}
}
const validId=(value:unknown):value is string=>
  typeof value==='string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
function fields(input:unknown,limits:Record<string,number>):boolean {
  if (!input || typeof input!=='object' || Array.isArray(input)) return false
  const value=input as Record<string,unknown>
  return Object.keys(value).length===Object.keys(limits).length &&
    Object.entries(limits).every(([key,max])=>
      typeof value[key]==='string' && (value[key] as string).length<=max)
}
function validDraft(value:unknown):value is Cp03Draft {
  if(!value || typeof value!=='object'||Array.isArray(value))return false
  const v=value as Record<string,unknown>
  if(!['new-customer','edit-customer','new-vehicle','edit-vehicle'].includes(String(v.editor)))return false
  if(!fields(v.customerDraft,{full_name:120,email:254,mobile_e164:24,notes:1000}))return false
  if(!fields(v.vehicleDraft,{plate:14,make:80,model:80,model_year:4,odometer_km:10}))return false
  const customer=v.customerId,vehicle=v.vehicleId,stamp=v.expectedUpdatedAt
  if(customer!==null&&!validId(customer))return false
  if(vehicle!==null&&!validId(vehicle))return false
  if(stamp!==null && (typeof stamp!=='string'||!Number.isFinite(Date.parse(stamp))))return false
  if(v.editor!=='new-customer'&&!validId(customer))return false
  if(v.editor==='edit-vehicle'&&(!validId(vehicle)||stamp===null))return false
  if(v.editor==='edit-customer'&&stamp===null)return false
  return true
}
function validEnvelope(value:unknown,scope:DraftScope,now:number):value is Envelope {
  if(!value||typeof value!=='object'||Array.isArray(value))return false
  const v=value as Record<string,unknown>
  return validId(scope.userId) && validId(scope.workshopId) &&
    v.version===1 && v.userId===scope.userId &&
    v.workshopId===scope.workshopId && typeof v.savedAt==='number' &&
    now>=v.savedAt && now-v.savedAt<=ttl && validDraft(v.draft)
}
/** Returns a validated, scoped draft; never a token or a trusted Auth state. */
export function readCp03Draft(scope:DraftScope,store:StoragePort|null=tabStorage(),now=Date.now()):Cp03Draft|null {
  try {
    const raw=store?.getItem(KEY)
    if(raw){
      const parsed:unknown=JSON.parse(raw)
      if(validEnvelope(parsed,scope,now)){
        volatile=parsed
        return parsed.draft
      }
      // A different account/workshop, corrupt value or TTL expiry must not
      // allow the next operator to read the previous operator's draft.
      store?.removeItem(KEY)
      volatile=null
      return null
    }
    if(volatile && validEnvelope(volatile,scope,now))return volatile.draft
    volatile=null
    return null
  } catch { // Malformed JSON must be discarded. A blocked store falls back to memory.
    try {
      const raw=store?.getItem(KEY)
      if(raw!==null && raw!==undefined){
        clearCp03Draft(store)
        return null
      }
    } catch { /* storage itself is unavailable; memory-only recovery */ }
    if(volatile && validEnvelope(volatile,scope,now))return volatile.draft
    return null
  }
}
export function writeCp03Draft(scope:DraftScope,draft:Cp03Draft,store:StoragePort|null=tabStorage(),now=Date.now()):boolean {
  if(!validId(scope.userId)||!validId(scope.workshopId)||!validDraft(draft))return false
  const envelope:Envelope={version:1,userId:scope.userId,workshopId:scope.workshopId,savedAt:now,draft}
  volatile=envelope
  try {store?.setItem(KEY,JSON.stringify(envelope))}catch{/* memory-only fallback */}
  return true
}
export function clearCp03Draft(store:StoragePort|null=tabStorage()):void {
  volatile=null
  try {store?.removeItem(KEY)}catch{/* access denied, no further access */}
}
