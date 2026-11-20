import {describe,it,expect,vi} from 'vitest'
import {Cp04AutosaveQueue,CP04_PROVISIONAL_NOTE,hasCurrentProvisionalFindings} from './cp04Autosave'
import {multipuntoTemplateItems} from './cp04Multipunto'
import type {Finding} from './cp04Contracts'
const a='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const b='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
const scope={userId:a,workshopId:b,orderId:a,vehicleId:b}
const template=multipuntoTemplateItems()
function lab(){
 const rows:Finding[]=[]
 let seq=0
 const port={
  createFinding:vi.fn(async(input:{order_id:string;vehicle_id:string;category:string;result:string;note:string|null})=>{
   const now=new Date(1700000000000+(++seq)*1000).toISOString()
   const f={id:`12345678-1234-4234-8234-${String(seq).padStart(12,'0')}`,
    workshop_id:b,order_id:a,vehicle_id:b,result:input.result,note:input.note,
    category:input.category,resolution:input.result==='attention'?'pending':'not_applicable',
    recorded_by:a,created_at:now,updated_at:now,resolved_at:null} as Finding
   rows.push(f);return f
  }),
  updateFindingNote:vi.fn(async(id:string,stamp:string,note:string)=>{
   const index=rows.findIndex(x=>x.id===id)
   if(index<0||rows[index].updated_at!==stamp)throw Error('conflict')
   const f={...rows[index],note,updated_at:new Date(1800000000000+ ++seq*1000).toISOString()}
   rows[index]=f;return f
  }),
  findingsForOrder:vi.fn(async()=>rows)
 }
 const mem=new Map<string,string>()
 const store={getItem:(k:string)=>mem.get(k)??null,setItem:(k:string,v:string)=>{mem.set(k,v)},
  removeItem:(k:string)=>{mem.delete(k)}}
 const engine=new Cp04AutosaveQueue({scope,initialFindings:rows,port,store})
 return {engine,rows,port,store,mem}
}
const flush=async()=>{await vi.runAllTimersAsync();await Promise.resolve()}
describe('CP04 X multipoint autosave queue',()=>{
 it('saves ten independent X selections without any Save button',async()=>{
   vi.useFakeTimers()
   try{
    const {engine,rows,port}=lab();engine.start()
    template.slice(0,10).forEach(x=>engine.select(x.id,'ok'))
    expect(Object.keys(engine.snapshot())).toHaveLength(10)
    await flush()
    expect(rows).toHaveLength(10)
    expect(port.createFinding).toHaveBeenCalledTimes(10)
    expect(Object.keys(engine.snapshot())).toHaveLength(0)
    expect(engine.getSavedCount()).toBe(10)
    engine.stop()
   }finally{vi.useRealTimers()}
 })
 it('a rapid state replacement on one component coalesces, preserving the latest X',async()=>{
  vi.useFakeTimers()
  try{
   const {engine,rows}=lab();engine.start()
   engine.select(template[0].id,'ok')
   engine.select(template[0].id,'attention')
   engine.select(template[0].id,'immediate')
   await flush()
   expect(rows).toHaveLength(1)
   expect(rows[0].note).toContain('PRIORIDAD INMEDIATA:')
   expect(rows[0].note).toContain(CP04_PROVISIONAL_NOTE)
   expect(engine.hasIncompleteNotes()).toBe(true)
   engine.stop()
  }finally{vi.useRealTimers()}
 })
 it('auto-updates a technical note, not a duplicate pending observation',async()=>{
  vi.useFakeTimers()
  try {
   const {engine,rows,port}=lab();engine.start()
   engine.select(template[0].id,'attention');await flush()
   expect(rows).toHaveLength(1)
   engine.note(template[0].id,'Reparar amortiguador');await flush()
   expect(rows).toHaveLength(1)
   expect(port.updateFindingNote).toHaveBeenCalledTimes(1)
   expect(rows[0].note).toBe('Reparar amortiguador')
   expect(engine.hasIncompleteNotes()).toBe(false)
   engine.stop()
  }finally{vi.useRealTimers()}
 })
 it('recovers a failed network write from same-tab storage without a silent success',async()=>{
  vi.useFakeTimers()
  try{
   const {engine,port,store}=lab()
   port.createFinding.mockRejectedValueOnce(new Error('offline'))
   engine.start();engine.select(template[0].id,'ok');await flush()
   expect(engine.snapshot()[template[0].id].phase).toBe('error')
   engine.stop()
   const recovered=new Cp04AutosaveQueue({scope,initialFindings:[],port,store})
   recovered.start();await flush()
   expect(port.createFinding).toHaveBeenCalledTimes(2)
   expect(recovered.getSavedCount()).toBe(1)
   recovered.stop()
  }finally{vi.useRealTimers()}
 })
 it('reconciles a server commit whose response was lost, without creating a duplicate',async()=>{
  vi.useFakeTimers()
  try {
    const {engine,port,rows}=lab()
    const original=port.createFinding.getMockImplementation()!
    port.createFinding.mockImplementationOnce(async input=>{
      await original(input)
      throw Error('network response lost after INSERT')
    })
    engine.start();engine.select(template[0].id,'ok');await flush()
    expect(engine.snapshot()[template[0].id].phase).toBe('error')
    expect(rows).toHaveLength(1)
    engine.retry(template[0].id);await flush()
    expect(rows).toHaveLength(1)
    expect(port.createFinding).toHaveBeenCalledTimes(1)
    expect(port.findingsForOrder).toHaveBeenCalled()
    expect(Object.keys(engine.snapshot())).toHaveLength(0)
    engine.stop()
  }finally{vi.useRealTimers()}
 })
 it('does not load drafts from a different workshop or order',()=>{
   const {engine,store,port}=lab()
   engine.start();engine.select(template[0].id,'ok')
   const different=new Cp04AutosaveQueue({scope:{...scope,orderId:b},initialFindings:[],port,store})
   expect(Object.keys(different.snapshot())).toHaveLength(0)
   engine.stop()
 })
 it('does not promise local recovery when browser storage rejects pending writes',async()=>{
   vi.useFakeTimers()
   try {
     const {port,rows}=lab()
     const blocked={
       getItem:vi.fn(()=>null),
       setItem:vi.fn(()=>{throw Error('QuotaExceededError')}),
       removeItem:vi.fn(()=>{throw Error('SecurityError')})
     }
     const engine=new Cp04AutosaveQueue({scope,initialFindings:rows,port,store:blocked})
     engine.start()
     engine.select(template[0].id,'attention')
     expect(engine.hasTemporaryRecovery()).toBe(false)
     expect(engine.snapshot()[template[0].id].phase).toBe('queued')
     expect(engine.getSavedCount()).toBe(0)
     await flush()
     expect(port.createFinding).toHaveBeenCalledTimes(1)
     expect(engine.getSavedCount()).toBe(1)
     engine.stop()
   }finally{vi.useRealTimers()}
 })
 it('does not write after a session ends during server reconciliation',async()=>{
   vi.useFakeTimers()
   try {
     const {engine,port,store}=lab()
     engine.start()
     engine.select(template[0].id,'ok')
     engine.stop() // Persist an unsent edit for same-tab restoration.
     let release:((rows:Finding[])=>void)|undefined
     port.findingsForOrder.mockImplementationOnce(()=>new Promise<Finding[]>(resolve=>{release=resolve}))
     const recovered=new Cp04AutosaveQueue({scope,initialFindings:[],port,store})
     recovered.start()
     await vi.advanceTimersByTimeAsync(500)
     expect(port.findingsForOrder).toHaveBeenCalledTimes(1)
     recovered.stop() // Session invalidated while the SELECT is in flight.
     release?.([])
     await Promise.resolve()
     await Promise.resolve()
     expect(port.createFinding).not.toHaveBeenCalled()
     expect(recovered.snapshot()[template[0].id].phase).toBe('queued')
     expect(recovered.getSavedCount()).toBe(0)
   }finally{vi.useRealTimers()}
 })
 it('ignores a late write response after stop/start and reconciles without duplicate confirmation',async()=>{
   vi.useFakeTimers()
   try {
     const {engine,port,rows}=lab()
     const onSaved=vi.fn()
     engine.setOnSaved(onSaved)
     const original=port.createFinding.getMockImplementation()!
     let release:(()=>void)|undefined
     port.createFinding.mockImplementationOnce(async(input)=>{
       const row=await original(input)
       await new Promise<void>(resolve=>{release=resolve})
       return row
     })
     engine.start()
     engine.select(template[0].id,'ok')
     await vi.advanceTimersByTimeAsync(150)
     expect(rows).toHaveLength(1) // Committed, response delayed.
     engine.stop()
     expect(engine.snapshot()[template[0].id].phase).toBe('queued') // interrupted writes are not "saving"
     engine.start()
     release?.()
     await Promise.resolve()
     await Promise.resolve()
     // The obsolete generation cannot signal that the replacement session saved.
     expect(onSaved).not.toHaveBeenCalled()
     await flush()
     expect(port.findingsForOrder).toHaveBeenCalled()
     expect(port.createFinding).toHaveBeenCalledTimes(1)
     expect(engine.getSavedCount()).toBe(1)
     engine.stop()
   }finally{vi.useRealTimers()}
 })
  it('unblocks PDF after a later server-confirmed OK for the provisional X',async()=>{
    vi.useFakeTimers()
    try{
      const {engine,rows,port}=lab();engine.start()
      engine.select(template[0].id,'attention');await flush()
      expect(engine.hasIncompleteNotes()).toBe(true)
      engine.select(template[0].id,'ok');await flush()
      expect(rows).toHaveLength(2)
      expect(port.createFinding).toHaveBeenCalledTimes(2)
      expect(engine.hasIncompleteNotes()).toBe(false)
      expect(hasCurrentProvisionalFindings(rows)).toBe(false)
      engine.stop()
    }finally{vi.useRealTimers()}
  })

})
