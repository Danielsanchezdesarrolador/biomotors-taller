export class CommercialOperationNotCurrent extends Error {constructor(){super('DOCUMENT_OPERATION_NOT_CURRENT')}}
const operationNotCurrent=(error:unknown)=>/CONSUMPTION_REPLAY_EXPIRED|CONSUMPTION_CONFLICT|RESERVATION_EXPIRED|PLAN_CHANGED_RETRY/.test(String((error as {message?:unknown})?.message??''))
import type {SupabaseClient} from '@supabase/supabase-js'
/** No browser acknowledgment can authorize a quota. Commit follows verified render/read, before bytes leave server. */
export async function meteredDocument(user:SupabaseClient,trusted:SupabaseClient,input:{workshopId:string;capability:'quote'|'multipunto'|'email';resourceId:string;requestId:string;snapshotHash?:string},read:()=>Promise<Uint8Array>){
 const identity=await user.auth.getUser();if(identity.error||!identity.data.user?.email_confirmed_at)throw Error('COMMERCIAL_ACCESS_DENIED')
 const {data,error}=await user.rpc('bt_commercial_reserve',{p_workshop_id:input.workshopId,p_capability:input.capability,p_resource_id:input.resourceId,p_request_id:input.requestId,p_snapshot_hash:input.snapshotHash??''})
 if(operationNotCurrent(error))throw new CommercialOperationNotCurrent()
 if(error||data?.workshop_id!==input.workshopId||data?.resource_id!==input.resourceId||data?.actor_id!==identity.data.user.id||data?.request_id!==input.requestId)throw Error('COMMERCIAL_QUOTA_DENIED')
 // Recovery is only an invitation to request a NEW authorization explicitly, never bytes.
 // A current-session status read distinguishes a valid relogin from a revoked caller/membership.
 const recheckRecovery=async(error:unknown,expected:string)=>{
  if((error as {message?:unknown})?.message!==expected)return
  const current=await user.auth.getUser()
  if(current.error||current.data.user?.id!==identity.data.user.id||!current.data.user.email_confirmed_at)return
  const status=await user.rpc('bt_commercial_status',{p_workshop_id:input.workshopId})
  if(!status.error&&status.data?.workshopId===input.workshopId)throw new CommercialOperationNotCurrent()
 }
 const committedBytes=async()=>{
   const cached=await trusted.rpc('bt_commercial_cached',{p_request_id:input.requestId,p_actor_id:identity.data.user.id})
   await recheckRecovery(cached.error,'CACHED_AUTHORITY_REVOKED')
   if(cached.error||typeof cached.data!=='string'||!/^(?:[a-f0-9]{2}){5,}$/.test(cached.data))throw Error('CACHED_DOCUMENT_DENIED')
   const bytes=Uint8Array.from(cached.data.match(/../g)!,v=>parseInt(v,16))
   if(new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-')throw Error('CACHED_DOCUMENT_DENIED')
   return bytes
 }
 try{
  if(data.state==='confirmed')return await committedBytes()
  const bytes=await read();if(bytes.length<5||new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-')throw Error('COMMERCIAL_DOCUMENT_INVALID')
  const current=await user.auth.getUser();if(current.error||current.data.user?.id!==identity.data.user.id||!current.data.user.email_confirmed_at)throw Error('COMMERCIAL_ACCESS_DENIED')
  const confirmed=await trusted.rpc('bt_commercial_finish',{p_request_id:input.requestId,p_actor_id:identity.data.user.id,p_success:true,p_bytes:'\\x'+Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('')})
  await recheckRecovery(confirmed.error,'MEMBERSHIP_REVOKED')
  if(operationNotCurrent(confirmed.error))throw new CommercialOperationNotCurrent()
  if(confirmed.error||confirmed.data?.state!=='confirmed'||confirmed.data?.request_id!==input.requestId)throw Error('COMMERCIAL_CONFIRMATION_FAILED')
  // A simultaneous renderer may have committed first, including different PDF metadata.
  // Always return the canonical bytes protected by SQL's first-confirmation-wins lock.
  return await committedBytes()
 }catch(error){if(data.state!=='confirmed')await trusted.rpc('bt_commercial_finish',{p_request_id:input.requestId,p_actor_id:identity.data.user.id,p_success:false});throw error}
}
