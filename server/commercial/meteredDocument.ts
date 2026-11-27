import type {SupabaseClient} from '@supabase/supabase-js'
/** No browser acknowledgment can authorize a quota. Commit follows verified render/read, before bytes leave server. */
export async function meteredDocument(user:SupabaseClient,trusted:SupabaseClient,input:{workshopId:string;capability:'quote'|'multipunto'|'email';resourceId:string;requestId:string;snapshotHash?:string},read:()=>Promise<Uint8Array>){
 const identity=await user.auth.getUser();if(identity.error||!identity.data.user?.email_confirmed_at)throw Error('COMMERCIAL_ACCESS_DENIED')
 const {data,error}=await user.rpc('bt_commercial_reserve',{p_workshop_id:input.workshopId,p_capability:input.capability,p_resource_id:input.resourceId,p_request_id:input.requestId,p_snapshot_hash:input.snapshotHash??''})
 if(error||data?.workshop_id!==input.workshopId||data?.resource_id!==input.resourceId||data?.actor_id!==identity.data.user.id||data?.request_id!==input.requestId)throw Error('COMMERCIAL_QUOTA_DENIED')
 const committedBytes=async()=>{
   const cached=await trusted.rpc('bt_commercial_cached',{p_request_id:input.requestId,p_actor_id:identity.data.user.id})
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
  if(confirmed.error||confirmed.data?.state!=='confirmed'||confirmed.data?.request_id!==input.requestId)throw Error('COMMERCIAL_CONFIRMATION_FAILED')
  // A simultaneous renderer may have committed first, including different PDF metadata.
  // Always return the canonical bytes protected by SQL's first-confirmation-wins lock.
  return await committedBytes()
 }catch(error){if(data.state!=='confirmed')await trusted.rpc('bt_commercial_finish',{p_request_id:input.requestId,p_actor_id:identity.data.user.id,p_success:false});throw error}
}
