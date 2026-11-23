import {describe,it,expect,vi} from 'vitest'
import {rememberDraft,localDraft,rememberCommittedDraft} from './temporaryDraft'
const user='11111111-1111-4111-8111-111111111111',workshop='22222222-2222-4222-8222-222222222222'
describe('CP05 committed read recovery hints, never authority',()=>{
 it('preserves a confirmed version through reload and isolates the user/workshop',()=>{
  const map=new Map<string,string>()
  vi.stubGlobal('sessionStorage',{getItem:(k:string)=>map.get(k)??null,setItem:(k:string,v:string)=>map.set(k,v),removeItem:(k:string)=>map.delete(k)})
  try{
   rememberDraft({userId:user,workshopId:workshop,quoteId:user,version:1,requestId:workshop,fingerprint:'synthetic',at:Date.now(),draft:{price_basis:'net',valid_days:10,terms:'QA',comments:'',items:[]}})
   rememberCommittedDraft(user,workshop,user,2)
   expect(localDraft(user,workshop)?.committedVersion).toBe(2)
   expect(localDraft(workshop,workshop)).toBeNull()
   expect(map.size).toBe(0)
  }finally{vi.unstubAllGlobals()}
 })
})
