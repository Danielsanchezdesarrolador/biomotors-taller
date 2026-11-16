/**
 * CP04 autosave for the 34-point multipoint sheet.
 * - independent, nonblocking per-component queue (up to 3 writes at once)
 * - latest edit wins within a component, no mutation of historical findings
 * - incomplete attention uses an explicit provisional note (not a diagnosis)
 * - same-tab scoped recovery and explicit retry on errors
 * - never treats local state as a server confirmation
 *
 * Existing R1 Supabase repository / RLS remains the only write authority.
 */
import type {Finding,NewFinding} from './cp04Contracts'
import type {Result} from '../informes/multipunto/multipuntoTemplate'
import {
  multipuntoFinding,multipuntoSavedState,latestForMultipuntoItem,
  multipuntoTemplateItems,CP04_IMMEDIATE_PREFIX
} from './cp04Multipunto'
export const CP04_PROVISIONAL_NOTE='Detalle técnico pendiente de completar'
const KEY='bt:cp04:multipunto-autosave:v1:'
const TTL=8*60*60*1000
export type AutosaveScope=Readonly<{
  userId:string;workshopId:string;orderId:string;vehicleId:string
}>
export type AutosaveEntry=Readonly<{
  state:Result;note:string;revision:number
  phase:'queued'|'saving'|'saved'|'error';error?:string
}>
export type AutosaveSnapshot=Readonly<Record<string,AutosaveEntry>>
type DraftPayload={scope:AutosaveScope;savedAt:number;entries:Record<string,{
  state:Result;note:string;revision:number;phase:string
}>}
type StorageApi=Pick<Storage,'getItem'|'setItem'|'removeItem'>
type Port={
 createFinding(input:NewFinding):Promise<Finding>
 updateFindingNote(id:string,stamp:string,note:string):Promise<Finding>
 findingsForOrder(id:string):Promise<Finding[]>
}
export type QueueConfig={
 scope:AutosaveScope;initialFindings:readonly Finding[];port:Port
 onSaved?:(finding:Finding)=>void
 store?:StorageApi|null
}
const validId=(value:string)=>/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value)
const validScope=(s:AutosaveScope)=>[s.userId,s.workshopId,s.orderId,s.vehicleId].every(validId)
const itemSet=new Set(multipuntoTemplateItems().map(i=>i.id))
const template=multipuntoTemplateItems()
function storage():StorageApi|null{
  try{return typeof window==='undefined'?null:window.sessionStorage}catch{return null}
}
function keyFor(scope:AutosaveScope){return KEY+scope.orderId}
function legalEntry(v:unknown):v is AutosaveEntry {
 if(!v||typeof v!=='object'||Array.isArray(v))return false
 const x=v as Record<string,unknown>
 return ['unreviewed','ok','attention','immediate'].includes(String(x.state))&&
   typeof x.note==='string'&&x.note.length<=1900&&
   typeof x.revision==='number'&&Number.isSafeInteger(x.revision)&&x.revision>=1
}
function read(scope:AutosaveScope,store:StorageApi|null,now=Date.now()):AutosaveSnapshot {
 if(!validScope(scope))return {}
 try {
   const raw=store?.getItem(keyFor(scope))
   if(!raw)return {}
   const obj:unknown=JSON.parse(raw)
   if(!obj||typeof obj!=='object')throw Error('invalid')
   const data=obj as DraftPayload
   if(!data.scope||Object.keys(scope).some(field=>
     data.scope[field as keyof AutosaveScope]!==scope[field as keyof AutosaveScope])||
     !Number.isFinite(data.savedAt)||now<data.savedAt||now-data.savedAt>TTL||
     !data.entries||typeof data.entries!=='object')throw Error('scope or ttl')
   const out:Record<string,AutosaveEntry>={}
   for(const [id,item] of Object.entries(data.entries)) {
     if(!itemSet.has(id)||!legalEntry(item))throw Error('invalid draft entry')
     out[id]={state:item.state,note:item.note,revision:item.revision,phase:'queued'}
   }
   return out
 }catch {
   try{store?.removeItem(keyFor(scope))}catch{/* unavailable */}
   return {}
 }
}
export function clearMultipuntoDrafts(store:Storage|null=(()=>{try{return typeof window==='undefined'?null:window.sessionStorage}catch{return null}})()){
 try{
  if(!store)return
  for(let i=store.length-1;i>=0;i--){
    const key=store.key(i)
    if(key?.startsWith(KEY))store.removeItem(key)
  }
 }catch{/* best effort; Auth/RLS still enforce access */}
}
function trimNote(note:string){return note.startsWith(CP04_IMMEDIATE_PREFIX)
   ?note.slice(CP04_IMMEDIATE_PREFIX.length):note}
function encodedNote(state:Result,note:string):string|null{
 if(state==='unreviewed')return null
 if(state==='ok')return note.trim()||null
 const text=note.trim()||CP04_PROVISIONAL_NOTE
 return state==='immediate'?CP04_IMMEDIATE_PREFIX+text:text
}
export function provisionalFinding(f:Finding):boolean {
 return f.category.startsWith('Multipunto · ')&&f.result==='attention'&&
  (f.note===CP04_PROVISIONAL_NOTE||
   f.note===CP04_IMMEDIATE_PREFIX+CP04_PROVISIONAL_NOTE)
}
export class Cp04AutosaveQueue {
 private readonly config:QueueConfig
 private readonly store:StorageApi|null
 private readonly subscribers=new Set<()=>void>()
 private readonly timers=new Map<string,ReturnType<typeof setTimeout>>()
 private readonly running=new Set<string>()
 private finds:Finding[]
 private entries:Record<string,AutosaveEntry>
 private current:AutosaveSnapshot={}
 private active=false
 private inFlight=0
 private onSaved?:(finding:Finding)=>void
 constructor(config:QueueConfig){
  if(!validScope(config.scope))throw Error('Invalid authenticated CP04 autosave scope')
  this.config=config
  this.store=config.store===undefined?storage():config.store
  this.finds=[...config.initialFindings]
  this.entries={...read(config.scope,this.store)}
  this.current={...this.entries}
  this.onSaved=config.onSaved
 }
 subscribe=(fn:()=>void)=>{this.subscribers.add(fn);return()=>{this.subscribers.delete(fn)}}
 snapshot=()=>this.current
 setOnSaved(fn:(row:Finding)=>void){this.onSaved=fn}
 getOutstandingCount=()=>Object.values(this.entries).filter(x=>x.phase!=='saved').length
 hasIncompleteNotes=()=>this.finds.some(provisionalFinding) ||
   Object.values(this.entries).some(x=>(x.state==='attention'||x.state==='immediate')&&!x.note.trim())
 getSavedCount=()=>template.filter(item=>{
   const entry=this.entries[item.id]
   return entry?.phase==='saved'||(!entry&&multipuntoSavedState(
     latestForMultipuntoItem(item,this.finds))!=='unreviewed')
 }).length
 getCurrentItems=()=>template.map(item=>{
   const row=latestForMultipuntoItem(item,this.finds)
   const entry=this.entries[item.id]
   return {...item,state:entry?.state??multipuntoSavedState(row),
     note:entry?.note??(row?.note ? trimNote(row.note):'')}
 })
 start(){
   if(this.active)return
   this.active=true
   for(const id of Object.keys(this.entries))if(this.entries[id].phase==='queued')
     this.schedule(id,450)
 }
 stop(){
   this.active=false
   for(const timer of this.timers.values())clearTimeout(timer)
   this.timers.clear()
   // In-flight writes might still commit; keep drafts for next server reconciliation.
   for(const [id,x] of Object.entries(this.entries))if(x.phase==='saving')
     this.entries[id]={...x,phase:'queued'}
   this.persist()
 }
 setFindings(rows:readonly Finding[]){
   // Do not discard a newer result returned by an in-flight mutation.
   const all=new Map(this.finds.map(x=>[x.id,x]))
   for(const row of rows)if(!all.has(row.id)||new Date(row.updated_at).getTime()>=
     new Date(all.get(row.id)!.updated_at).getTime())all.set(row.id,row)
   this.finds=[...all.values()].sort((a,b)=>
     new Date(a.created_at).getTime()-new Date(b.created_at).getTime())
   for(const [id,entry] of Object.entries(this.entries)){
      if(entry.phase==='saving')continue
      const item=template.find(x=>x.id===id)
      if(!item)continue
      const row=latestForMultipuntoItem(item,this.finds)
      if(multipuntoSavedState(row)===entry.state&&
         (row?.note??null)===encodedNote(entry.state,entry.note)){
        delete this.entries[id]
      }
   }
   this.emit()
 }
 private emit(){
   this.current={...this.entries}
   this.persist()
   for(const subscriber of this.subscribers)subscriber()
 }
 private persist(){
   try{
     const key=keyFor(this.config.scope)
     if(Object.keys(this.entries).length===0){this.store?.removeItem(key);return}
     const entries:DraftPayload['entries']={}
     for(const [id,v] of Object.entries(this.entries)){
       if(v.phase!=='saved')entries[id]={state:v.state,note:v.note,revision:v.revision,phase:v.phase}
     }
     if(Object.keys(entries).length===0){this.store?.removeItem(key);return}
     this.store?.setItem(key,JSON.stringify({scope:this.config.scope,
       savedAt:Date.now(),entries} satisfies DraftPayload))
   }catch{/* browser storage blocked, warn through UI on network failures */}
 }
 select(id:string,state:Result){
   if(!this.active||!itemSet.has(id))return
   const existing=this.entries[id]
   const item=template.find(x=>x.id===id)!
   const row=latestForMultipuntoItem(item,this.finds)
   const oldState=existing?.state??multipuntoSavedState(row)
   if(state===oldState&&existing?.phase!=='error')return
   const note=state==='ok'||state==='unreviewed'?'':(
     existing?.note??(row?.note?trimNote(row.note):'')
   )
   this.entries[id]={state,note,revision:(existing?.revision??0)+1,phase:'queued'}
   this.emit()
   this.schedule(id,130)
 }
 note(id:string,note:string){
   if(!this.active||!itemSet.has(id)||note.length>1900)return
   const item=template.find(x=>x.id===id)!
   const row=latestForMultipuntoItem(item,this.finds)
   const existing=this.entries[id]
   const state=existing?.state??multipuntoSavedState(row)
   if(state==='unreviewed')return
   this.entries[id]={state,note,revision:(existing?.revision??0)+1,phase:'queued'}
   this.emit()
   this.schedule(id,650)
 }
 retry(id:string){
   if(!this.active)return
   const entry=this.entries[id]
   if(!entry||entry.phase==='saving')return
   this.entries[id]={...entry,phase:'queued',error:undefined}
   this.emit()
   this.schedule(id,80)
 }
 retryAll(){
   for(const [id,entry] of Object.entries(this.entries)){
     if(entry.phase==='error')this.retry(id)
     else if(entry.phase==='queued')this.schedule(id,80)
   }
 }
 private schedule(id:string,ms:number){
   const old=this.timers.get(id)
   if(old)clearTimeout(old)
   if(!this.active)return
   this.timers.set(id,setTimeout(()=>{
     this.timers.delete(id)
     void this.pump()
   },ms))
 }
 private async pump(){
   if(!this.active)return
   for(const [id,item] of Object.entries(this.entries)){
     if(this.inFlight>=3)break
     if(item.phase!=='queued'||this.running.has(id)||this.timers.has(id))continue
     void this.send(id)
   }
 }
 private async send(id:string){
   const entry=this.entries[id]
   if(!entry||!this.active||this.running.has(id)||entry.phase!=='queued')return
   this.inFlight++;this.running.add(id)
   this.entries[id]={...entry,phase:'saving'}
   this.emit()
   try{
     const item=template.find(x=>x.id===id)!
     // Reconcile server first when draft was restored after an interrupted
     // request; the original INSERT might already have reached PostgreSQL.
     let row=latestForMultipuntoItem(item,this.finds)
     const desired=encodedNote(entry.state,entry.note)
     if(row&&multipuntoSavedState(row)===entry.state&&row.note===desired){
        // Already committed (possibly during Auth focus revalidation).
     }else if(row&&multipuntoSavedState(row)===entry.state&&
       row.resolution!=='resolved'&&entry.state!=='unreviewed'){
       row=await this.config.port.updateFindingNote(row.id,row.updated_at,desired??'')
     }else{
       const input=entry.state==='unreviewed'
         ?{order_id:this.config.scope.orderId,vehicle_id:this.config.scope.vehicleId,
           category:'Multipunto · '+item.name,result:'not_checked' as const,note:null}
         :multipuntoFinding(id,entry.state,entry.note.trim()||CP04_PROVISIONAL_NOTE,
           this.config.scope.orderId,this.config.scope.vehicleId)
       row=await this.config.port.createFinding(input)
     }
     if(!row||row.workshop_id!==this.config.scope.workshopId||
       row.order_id!==this.config.scope.orderId||
       row.vehicle_id!==this.config.scope.vehicleId)
       throw Error('CP04 tenant result mismatch')
     const index=this.finds.findIndex(x=>x.id===row.id)
     if(index>=0)this.finds[index]=row
     else this.finds.push(row)
     this.finds.sort((a,b)=>new Date(a.created_at).getTime()-new Date(b.created_at).getTime())
     if(this.active)this.onSaved?.(row)
     const current=this.entries[id]
     if(current&&current.revision===entry.revision){
       delete this.entries[id]
       this.emit()
     }else if(current){
       this.entries[id]={...current,phase:'queued'}
       this.emit()
       this.schedule(id,50)
     }
   }catch(error){
     const current=this.entries[id]
     if(current){
       this.entries[id]={...current,phase:'error',
         error:'No se pudo confirmar el guardado. Revisa conexión y reintenta.'}
       this.emit()
     }
   }finally{
     this.running.delete(id);this.inFlight--
     void this.pump()
   }
 }
}
