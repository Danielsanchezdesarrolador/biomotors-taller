import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Context } from '../auth/controller'
import {onRecordChange} from '../official/recordChanges'
import { recordsRepository } from './repository'
import { recordsMessage, type Inspection } from './contracts'
const wid='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',uid='11111111-1111-4111-8111-111111111111',id='aaaaaaaa-aaaa-4aaa-8aaa-000000000001',request='eeeeeeee-eeee-4eee-8eee-000000000001'
const context={userId:uid,role:'owner',workshop:{id:wid,name:'Synthetic'}} as Context
const preview: Inspection={id,resource:'customers',token:'2026-11-24T00:00:00.000001Z',dependencies:0,draft_items:0,actions:['delete'],inherited_archive:false}
function setup(role: Context['role']='owner') {
 const rpc=vi.fn().mockResolvedValue({data:preview,error:null})
 const getUser=vi.fn().mockResolvedValue({data:{user:{id:uid,email_confirmed_at:'2026-11-24'}},error:null})
 return {rpc,getUser,repository:recordsRepository({auth:{getUser},rpc} as unknown as SupabaseClient,{...context,role})}
}
describe('record administration authenticated boundary',()=>{
 it.each(['mechanic','reception'] as const)('rejects %s before making a network request',async role=>{
  const {repository,rpc,getUser}=setup(role)
  await expect(repository.inspect('customers',id)).rejects.toMatchObject({kind:'denied'})
  expect(rpc).not.toHaveBeenCalled();expect(getUser).not.toHaveBeenCalled()
 })
 it('deletion audit can be retrieved after its source row is gone',async()=>{
  const {repository,rpc}=setup();rpc.mockResolvedValueOnce({data:[{sequence:1,resource_id:id,action:'delete',actor_id:uid,created_at:'2026-11-24T00:00:00Z',reason:'Synthetic reason'}],error:null})
  expect(await repository.audit('customers')).toHaveLength(1)
  expect(rpc).toHaveBeenCalledWith('bt_records_audit',{p_workshop_id:wid,p_resource:'customers',p_id:null})
 })
 it('a broken UI subscriber cannot turn an acknowledged write into a failed write',async()=>{
  const {repository,rpc}=setup();rpc.mockResolvedValueOnce({data:{id,resource:'customers',action:'delete',request_id:request},error:null})
  const unsubscribe=onRecordChange(()=>{throw new Error('Synthetic rendering failure')})
  try{await expect(repository.execute(preview,'delete',request,'Synthetic reason')).resolves.toMatchObject({id,action:'delete'})}finally{unsubscribe()}
 })
 it('requires confirmed exact session identity',async()=>{
  const {repository,rpc,getUser}=setup();getUser.mockResolvedValueOnce({data:{user:{id:'another',email_confirmed_at:'2026-11-24'}},error:null})
  await expect(repository.inspect('customers',id)).rejects.toMatchObject({kind:'denied'});expect(rpc).not.toHaveBeenCalled()
 })
 it('never accepts unscoped/mismatched inspection responses',async()=>{
  const {repository,rpc}=setup();rpc.mockResolvedValueOnce({data:{...preview,id:uid},error:null})
  await expect(repository.inspect('customers',id)).rejects.toMatchObject({kind:'unavailable'})
 })
 it('disposal invalidates an in-flight authenticated response',async()=>{
  const {repository,rpc}=setup();let resolve!: (v:unknown)=>void
  rpc.mockImplementationOnce(()=>new Promise(r=>{resolve=r}))
  const pending=repository.inspect('customers',id);await vi.waitFor(()=>expect(rpc).toHaveBeenCalled())
  repository.dispose();resolve({data:preview,error:null})
  await expect(pending).rejects.toMatchObject({kind:'denied'})
 })
 it('uses server-issued revision and stable caller request for confirmation/retry',async()=>{
  const {repository,rpc}=setup();const receipt={id,resource:'customers',action:'delete',request_id:request}
  rpc.mockResolvedValue({data:receipt,error:null})
  await repository.execute(preview,'delete',request,' Synthetic reason ')
  await repository.execute(preview,'delete',request,' Synthetic reason ')
  expect(rpc.mock.calls[0]).toEqual(rpc.mock.calls[1])
  expect(rpc).toHaveBeenCalledWith('bt_records_execute',{p_workshop_id:wid,p_resource:'customers',p_id:id,p_action:'delete',p_token:preview.token,p_request_id:request,p_reason:'Synthetic reason'})
 })
 it('does not report a mismatched command receipt as success',async()=>{
  const {repository,rpc}=setup();rpc.mockResolvedValueOnce({data:{id:uid,resource:'customers',action:'delete',request_id:request},error:null})
  await expect(repository.execute(preview,'delete',request,'Synthetic reason')).rejects.toMatchObject({kind:'unavailable'})
 })
 it.each([['42501','denied'],['55000','disabled'],['40001','conflict'],['23503','dependencies'],['22023','invalid'],['XX000','unavailable']])('maps %s safely without exposing backend detail',async(code,kind)=>{
  const {repository,rpc}=setup();rpc.mockResolvedValueOnce({data:null,error:{code,message:'secret-value synthetic-client-name',details:'secret-value'}})
  const error=await repository.inspect('customers',id).catch(e=>e)
  expect(error.kind).toBe(kind);expect(recordsMessage(error)).not.toContain('secret-value');expect(String(error)).not.toContain('synthetic-client-name')
 })
 it('cannot confirm an action absent from backend preview',async()=>{
  const {repository,rpc}=setup()
  await expect(repository.execute({...preview,actions:['archive']},'delete',request,'Synthetic reason')).rejects.toMatchObject({kind:'invalid'})
  expect(rpc).not.toHaveBeenCalled()
 })
 it('rejects an unsupported future action instead of exposing a destructive control',async()=>{
  const {repository,rpc}=setup();rpc.mockResolvedValueOnce({data:{...preview,actions:['cascade']},error:null})
  await expect(repository.inspect('customers',id)).rejects.toMatchObject({kind:'unavailable'})
 })
})
