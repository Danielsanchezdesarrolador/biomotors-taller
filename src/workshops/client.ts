import type { AuthController } from '../auth/controller'
export const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export type Team = { workshopId:string; active:number; pending:number; capacity:number; overCapacity:boolean;
  members:{id:string;name:string;status:'active'|'disabled'}[]; invites:{id:string;email:string;expiresAt:string}[] }
export function parseTeam(value:unknown, workshopId:string):Team {
  if (!value || typeof value!=='object') throw Error('INVALID_TEAM')
  const x=value as Team
  if(x.workshopId!==workshopId || ![x.active,x.pending,x.capacity].every(n=>Number.isSafeInteger(n)&&n>=0)
    || typeof x.overCapacity!=='boolean' || !Array.isArray(x.members)||!Array.isArray(x.invites)
    || !x.members.every(m=>uuid.test(m.id)&&typeof m.name==='string'&&['active','disabled'].includes(m.status))
    || !x.invites.every(i=>uuid.test(i.id)&&typeof i.email==='string'&&Number.isFinite(Date.parse(i.expiresAt)))) throw Error('INVALID_TEAM')
  return x
}
export async function workshopRpc(controller:AuthController,name:string,args:Record<string,unknown>={}) {
  const before=controller.getSnapshot()
  const client=await controller.personalPlanClient()
  if(!client || before!==controller.getSnapshot()) throw Error('SESSION_CHANGED')
  const result=await client.rpc(name,args)
  if(before!==controller.getSnapshot() || result.error) throw Error('REQUEST_FAILED')
  return result.data as unknown
}
export function requestIdentity() {
  let current:{signature:string;id:string}|undefined
  return { for(signature:string) { if(current?.signature!==signature)current={signature,id:crypto.randomUUID()};return current.id }, clear(){current=undefined} }
}
