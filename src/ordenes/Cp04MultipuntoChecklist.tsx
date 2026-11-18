import {useEffect,useMemo,useSyncExternalStore} from 'react'
import {ArrowLeft,ClipboardCheck,RefreshCcw,WifiOff} from 'lucide-react'
import {MultipuntoTable} from '../informes/multipunto/MultipuntoTable'
import type {Finding} from './cp04Contracts'
import type {AutosaveScope} from './cp04Autosave'
import {
  Cp04AutosaveQueue,CP04_PROVISIONAL_NOTE,provisionalFinding
} from './cp04Autosave'
import {latestForMultipuntoItem} from './cp04Multipunto'
import '../informes/multipunto/multipunto.css'

export function Cp04MultipuntoChecklist({
 findings,repository,scope,onSaved,onBack,onQueueChange,disabled,readOnly,plate
}:{
 findings:readonly Finding[]
 repository:ConstructorParameters<typeof Cp04AutosaveQueue>[0]['port']
 scope:AutosaveScope
 onSaved:(record:Finding)=>void
 onQueueChange?:(outstanding:number,incomplete:boolean)=>void
 onBack:()=>void
 disabled:boolean
 readOnly:boolean
 plate:string|null
}){
 const queue=useMemo(()=>new Cp04AutosaveQueue({
   scope,initialFindings:findings,port:repository
 }),[scope.userId,scope.workshopId,scope.orderId,scope.vehicleId,repository])
 const entries=useSyncExternalStore(queue.subscribe,queue.snapshot,queue.snapshot)
 useEffect(()=>{
   queue.setOnSaved(onSaved)
 },[queue,onSaved])
 useEffect(()=>{
   if(readOnly) return ()=>queue.stop()
   queue.start()
   const retry=()=>queue.retryAll()
   window.addEventListener('online',retry)
   const focus=()=>{if(navigator.onLine)queue.retryAll()}
   window.addEventListener('focus',focus)
   return()=>{
     window.removeEventListener('online',retry)
     window.removeEventListener('focus',focus)
     queue.stop()
   }
 },[queue,readOnly])
 useEffect(()=>{queue.setFindings(findings)},[queue,findings])
 const items=queue.getCurrentItems()
 const unconfirmed=Object.values(entries).filter(v=>v.phase!=='saved').length
 const errors=Object.values(entries).filter(v=>v.phase==='error').length
 const temporaryRecoveryAvailable=queue.hasTemporaryRecovery()
 const incomplete=queue.hasIncompleteNotes()
 const savedCount=queue.getSavedCount()
 useEffect(()=>{onQueueChange?.(unconfirmed,incomplete)},[unconfirmed,incomplete,onQueueChange])
 const readOnlyOrBusy=readOnly||disabled
 return <div className="cp04-checklist" aria-label="Hoja de inspección multipunto con X y autoguardado">
   <div className="cp04-checklist-top">
     <div>
       <span className="official-eyebrow">Orden real · {plate??'Vehículo sin patente'}</span>
       <h2><ClipboardCheck size={21}/> Inspección multipunto con X</h2>
       <p>Marca uno o varios componentes seguidos: cada X se guarda automáticamente sin desplazarte a otro formulario.</p>
     </div>
     <button type="button" className="cp04-secondary" onClick={onBack}>
       <ArrowLeft size={16}/> Volver a la orden
     </button>
   </div>
   <div className="cp04-count" role="status" aria-live="polite">
     <strong>{savedCount}/34</strong> componentes guardados en Supabase.
     {unconfirmed>0&&<span> · {unconfirmed} cambio(s) sin confirmar</span>}
     {errors>0&&<strong className="cp04-error-text"> · {errors} error(es) de guardado</strong>}
     {incomplete&&<span> · Hay observaciones técnicas pendientes de completar</span>}
   </div>
   <div className="cp04-checklist-legend">
     <span><i className="cp04-legend-ok"/> OK</span>
     <span><i className="cp04-legend-attention"/> Requiere atención</span>
     <span><i className="cp04-legend-immediate"/> Cambio inmediato</span>
   </div>
   {unconfirmed>0&&!temporaryRecoveryAvailable&&<p className="cp04-error" role="alert">
     <WifiOff size={17} aria-hidden="true"/> No hay copia temporal recuperable:
     el navegador impidió guardar el borrador en esta pestaña. No cierres ni recargues
     hasta confirmar las X en el servidor; si pierdes la sesión podrían perderse esos cambios.
   </p>}
   {errors>0&&<p className="cp04-error" role="alert">
     <WifiOff size={17} aria-hidden="true"/> Algunas X no están confirmadas en Supabase.
     {temporaryRecoveryAvailable
       ? ' Hay una copia temporal en esta pestaña; no es un respaldo permanente.'
       : ' El borrador local no pudo conservarse: mantén abierta esta vista.'}
     <button type="button" className="cp04-secondary"
       onClick={()=>queue.retryAll()}><RefreshCcw size={16}/> Reintentar guardados</button>
   </p>}
   <div className="mp-sheet mp-edit-sheet cp04-checklist-sheet">
     <MultipuntoTable items={items}
       onChange={readOnlyOrBusy?undefined:(itemId,state)=>queue.select(itemId,state)}
       renderAfterRow={item=>{
         const entry=entries[item.id]
         const saved=latestForMultipuntoItem(item,findings)
         const phase=entry?.phase
         const showNote=item.state==='attention'||item.state==='immediate'
         const isResolved=saved?.resolution==='resolved' && !entry
         const note=item.note.replace(/^PRIORIDAD INMEDIATA: /,'')
         const incompleteNote=showNote&&(!note.trim()||note===CP04_PROVISIONAL_NOTE)
         const status=entry?phase==='queued'?'Pendiente de enviar'
           :phase==='saving'?'Guardando…'
           :phase==='error'?'Error al guardar':'Guardado'
           :saved?'Guardado':'Sin revisar'
         return <div className="cp04-inline-control">
           <span className={
             'cp04-inline-status '+(phase==='error'?'is-error':
             phase==='saving'||phase==='queued'?'is-saving':'is-saved')
           } role="status" aria-live="polite">{status}</span>
           {phase==='error'&&<button type="button" className="cp04-secondary"
              onClick={()=>queue.retry(item.id)}>Reintentar esta X</button>}
           {showNote&&<label className="cp04-inline-note">
             <span>Detalle técnico {incompleteNote&&<strong>· Pendiente de completar</strong>}</span>
             <textarea rows={2} maxLength={1900}
               aria-label={`Observación técnica de ${item.name}`}
               value={note===CP04_PROVISIONAL_NOTE?'':note}
               placeholder="Describe el problema sin salir de la inspección"
               disabled={readOnlyOrBusy||isResolved}
               onChange={e=>queue.note(item.id,e.target.value)}/>
           </label>}
           {showNote&&saved&&provisionalFinding(saved)&&
             <small className="cp04-provisional-hint">El servidor conserva provisionalmente «{CP04_PROVISIONAL_NOTE}». No es un diagnóstico final.</small>}
           {isResolved&&<small className="cp04-provisional-hint">
             Esta observación fue resuelta; una nueva inspección debe generar otro hallazgo.
           </small>}
         </div>
       }}
     />
   </div>
   {readOnly&&<p className="cp04-private-hint">
     Orden cerrada o cuenta de consulta: se muestran las marcas ya guardadas, sin permitir modificaciones.
   </p>}
   <p className="cp04-private-hint">La conexión o sesión pueden interrumpirse. Si ves «Guardando» o «Error»,
     esa X aún no debe considerarse guardada. Al volver a la misma pestaña se intentará recuperar el borrador.</p>
 </div>
}
