import {describe,it,expect} from 'vitest'
import {orderWorkspace} from './orderWorkspace'
import type {Cp05Port} from './repository'
import type {Bundle,Quote} from './contracts'
function fixture(){
 const a={id:'qa',order_id:'a'} as Quote,b={id:'qb',order_id:'b'} as Quote
 const bundle=(quote:Quote)=>({quote,source:{order:{id:quote.order_id}}} as Bundle)
 const writes:string[]=[],checks:string[]=[]
 const port={list:async()=>[a,b],orders:async()=>[{order:{id:'a'}},{order:{id:'b'}}],forOrder:async(id:string)=>id==='a'?a:b,load:async(id:string)=>bundle(id==='qa'?a:b),save:async(q:Quote)=>{writes.push(q.order_id);return bundle(q)},open:async(id:string)=>{writes.push(id);return bundle(a)},documents:{issue:async()=>{writes.push('issue')}}} as unknown as Cp05Port
 return {a,b,port,writes,checks,bundle}
}
describe('R1 fixed OT quotation workspace',()=>{
 it('filters two visits of the same workshop and rejects crossed selection and writes before the port',async()=>{
  const f=fixture(),p=orderWorkspace(f.port,'a',async()=>{f.checks.push('check')})
  expect(await p.list()).toEqual([f.a]);expect(await p.orders()).toHaveLength(1)
  await expect(p.load('qb')).rejects.toThrow('denied')
  await expect(p.forOrder('b')).rejects.toThrow('denied')
  await expect(p.open('b','request')).rejects.toThrow('denied')
  await expect(p.save(f.b,{} as never,'request')).rejects.toThrow('denied')
  expect(f.writes).toEqual([]);expect(f.checks).toEqual([])
  await p.save(f.a,{} as never,'request');expect(f.checks).toEqual(['check']);expect(f.writes).toEqual(['a'])
 })
 it('rejects stale async responses after changing attention without disposing the shared port',async()=>{
  const f=fixture();let release!:(row:Bundle)=>void
  f.port.load=()=>new Promise(resolve=>{release=resolve})
  const p=orderWorkspace(f.port,'a',async()=>{}),pending=p.load('qa')
  p.dispose();release(f.bundle(f.a));await expect(pending).rejects.toThrow('denied')
 })
 it('does not write or issue if preconditions fail',async()=>{
  const f=fixture(),p=orderWorkspace(f.port,'a',async()=>{throw Error('scope not reviewed')})
  await expect(p.save(f.a,{} as never,'request')).rejects.toThrow('scope not reviewed')
  await expect(p.documents.issue(f.a,'request')).rejects.toThrow('scope not reviewed')
  expect(f.writes).toEqual([])
 })
})
