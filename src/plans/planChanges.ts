/** Invalidation carries no plan, identity or authority. Every observer re-queries its own server scope. */
const event='bt:plans-confirmed-change',channelName='bt-plan-invalidation-v1'
export function announcePlanChange(){
 if(typeof window==='undefined')return
 if(typeof BroadcastChannel!=='undefined'){const channel=new BroadcastChannel(channelName);channel.postMessage('invalidate');channel.close()}
 else window.dispatchEvent(new Event(event))
}
export function watchPlanChanges(refresh:()=>void){
 if(typeof window==='undefined')return()=>{}
 window.addEventListener(event,refresh)
 const channel=typeof BroadcastChannel!=='undefined'?new BroadcastChannel(channelName):null
 if(channel)channel.onmessage=e=>{if(e.data==='invalidate')refresh()}
 return()=>{window.removeEventListener(event,refresh);channel?.close()}
}
