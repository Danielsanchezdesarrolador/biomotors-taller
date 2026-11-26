import {describe,it,expect,vi} from 'vitest'
import {renderToStaticMarkup} from 'react-dom/server'
import type {AuthController,AuthState} from '../auth/controller'
import type {SupabaseClient} from '@supabase/supabase-js'
import OperationsCenter from './OperationsCenter'
import {operationsScope,watchOperations,type OperationsState,type Operation} from './operations'
import {OfficialPanel} from '../official/OfficialPanels'
const pilot='c943ad51-6d90-447b-8aa7-68866f69a4bc'
function authority(){
 let state:AuthState={phase:'authorized',message:'',authorityVersion:1,context:{userId:'owner',role:'owner',operationsEnabled:true,documentsEnabled:true,workshop:{id:pilot,status:'active',name:'Taller sintético'}}}
 const listeners=new Set<()=>void>()
 const client={} as SupabaseClient
 const controller={getSnapshot:()=>state,subscribe:(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn)}},directoryClient:vi.fn(async()=>client)} as unknown as AuthController
 return {controller,set(next:AuthState){state=next;listeners.forEach(fn=>fn())},get state(){return state},listeners,client}
}
function deferred<T>(){let resolve!:(v:T)=>void,reject!:(e:unknown)=>void;const promise=new Promise<T>((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject}}
const settle=async()=>{await Promise.resolve();await Promise.resolve();await Promise.resolve()}
const rows=[{id:'private-OT'}] as Operation[]
describe('NEXT-02 focused correction: access, invalidation and draft recovery',()=>{
 it.each(['mechanic','reception','other-workshop','anonymous'])('preserves original Inicio for %s without querying operations',role=>{
  const a=authority()
  a.set(role==='anonymous'?{phase:'anonymous',message:''}:{...a.state,context:{...a.state.context!,role:role==='other-workshop'?'owner':role as 'mechanic'|'reception',operationsEnabled:role!=='other-workshop',workshop:{...a.state.context!.workshop,id:role==='other-workshop'?'other':pilot}}})
  expect(operationsScope(a.controller)).toBe('')
  const html=renderToStaticMarkup(<OperationsCenter controller={a.controller} isActive onNew={()=>{}} onResume={()=>{}} fallback={<OfficialPanel screen="inicio" onNavigate={()=>{}}/>}/>)
  expect(html).toContain('¿Qué vamos a hacer hoy?');expect(html).not.toContain('Centro de operaciones');expect(a.controller.directoryClient).not.toHaveBeenCalled()
 })
 it.each(['logout','user','role','workshop','authority'])('clears data and disposes pending repository on %s; late success cannot restore it',async change=>{
  const a=authority(),first=deferred<Operation[]>(),second=deferred<Operation[]>(),states:OperationsState[]=[]
  const dispose=vi.fn(),create=vi.fn().mockReturnValueOnce({load:()=>first.promise,dispose}).mockReturnValue({load:()=>second.promise,dispose:vi.fn()})
  const stop=watchOperations(a.controller,s=>states.push(s),true,create)
  await settle();first.resolve(rows);await settle();expect(states.at(-1)?.rows).toEqual(rows)
  // Refresh binding starts another pending read; then change authority.
  stop();const pending=deferred<Operation[]>(),pendingDispose=vi.fn()
  const nextRead=deferred<Operation[]>(),nextBinding=vi.fn().mockReturnValueOnce({load:()=>pending.promise,dispose:pendingDispose}).mockReturnValue({load:()=>nextRead.promise,dispose:vi.fn()})
  const stop2=watchOperations(a.controller,s=>states.push(s),true,nextBinding)
  await settle();expect(states.at(-1)?.rows).toEqual([])
  const old=a.state
  a.set(change==='logout'?{phase:'anonymous',message:''}:{...old,authorityVersion:change==='authority'?2:1,context:{...old.context!,userId:change==='user'?'new-owner':old.context!.userId,role:change==='role'?'admin':'owner',workshop:{...old.context!.workshop,id:change==='workshop'?'another':pilot}}})
  expect(pendingDispose).toHaveBeenCalled();expect(states.at(-1)?.rows).toEqual([])
  const scopeAfter=states.at(-1)?.scope
  pending.resolve(rows);await settle();expect(states.at(-1)?.scope).toBe(scopeAfter)
  // A valid new scope can complete its own read; an invalid one cannot load.
  expect(states.at(-1)?.rows).toEqual([])
  stop2();expect(a.listeners.size).toBe(0)
 })
 it('ignores delayed client acquisition and late errors after context invalidation',async()=>{
  const a=authority(),client=deferred<SupabaseClient>(),states:OperationsState[]=[],create=vi.fn()
  vi.mocked(a.controller.directoryClient).mockReturnValue(client.promise)
  const stop=watchOperations(a.controller,s=>states.push(s),true,create)
  a.set({phase:'anonymous',message:''});client.resolve(a.client);await settle();expect(create).not.toHaveBeenCalled();expect(states.at(-1)?.scope).toBe('');stop()
  const b=authority(),read=deferred<Operation[]>(),events:OperationsState[]=[]
  const stopB=watchOperations(b.controller,s=>events.push(s),true,()=>({load:()=>read.promise,dispose:()=>{}}));await settle();b.set({phase:'anonymous',message:''});read.reject(Error('late private detail'));await settle();expect(events.at(-1)).toMatchObject({scope:'',rows:[],error:''});stopB()
 })
 it('observes invalidation while Inicio remains mounted but inactive, without issuing reads',()=>{
  const a=authority(),events:OperationsState[]=[],create=vi.fn()
  const stop=watchOperations(a.controller,s=>events.push(s),false,create)
  a.set({...a.state,context:{...a.state.context!,role:'mechanic'}})
  expect(events.at(-1)).toMatchObject({scope:'',rows:[],busy:false})
  expect(a.controller.directoryClient).not.toHaveBeenCalled();expect(create).not.toHaveBeenCalled();stop();expect(a.listeners.size).toBe(0)
 })
})
