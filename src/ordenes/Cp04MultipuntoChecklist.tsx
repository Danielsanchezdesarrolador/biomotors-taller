import {useMemo,useRef,type FormEvent} from 'react'
import {ArrowLeft,ClipboardCheck,Save} from 'lucide-react'
import {MultipuntoTable} from '../informes/multipunto/MultipuntoTable'
import type {Result} from '../informes/multipunto/multipuntoTemplate'
import type {Finding,NewFinding} from './cp04Contracts'
import {
 multipuntoItemsFromFindings,multipuntoTemplateItems,multipuntoFinding,
 latestForMultipuntoItem,multipuntoSavedState
} from './cp04Multipunto'
import '../informes/multipunto/multipunto.css'

export type MultipuntoChoice={itemId:string|null;state:Result;note:string}
export const emptyMultipuntoChoice:MultipuntoChoice={
  itemId:null,state:'unreviewed',note:''
}
export function Cp04MultipuntoChecklist({
 findings,choice,onChange,onSave,onBack,disabled,readOnly,plate,orderId,vehicleId
}:{
 findings:readonly Finding[]
 choice:MultipuntoChoice
 onChange:(value:MultipuntoChoice)=>void
 onSave:(data:NewFinding)=>Promise<boolean>
 onBack:()=>void
 disabled:boolean
 readOnly:boolean
 plate:string|null
 orderId:string
 vehicleId:string
}){
 const saving=useRef(false)
 const items=useMemo(()=>{
   const source=multipuntoItemsFromFindings(findings)
   return choice.itemId&&choice.state!=='unreviewed'
    ?source.map(i=>i.id===choice.itemId?{...i,state:choice.state,note:choice.note}:i)
    :source
 },[findings,choice])
 const current=items.find(i=>i.id===choice.itemId)
 const count=multipuntoItemsFromFindings(findings).filter(i=>i.state!=='unreviewed').length
 const total=multipuntoTemplateItems().length
 const pending=!!choice.itemId&&choice.state!=='unreviewed'
 const needsNote=choice.state==='attention'||choice.state==='immediate'
 const old=current?latestForMultipuntoItem(current,findings):null
 const oldState=multipuntoSavedState(old)
 function select(itemId:string,state:Result){
   if(readOnly||disabled)return
   if(state==='unreviewed'){onChange(emptyMultipuntoChoice);return}
   onChange({itemId,state,note:choice.itemId===itemId?choice.note:''})
 }
 async function save(e:FormEvent){
   e.preventDefault()
   if(!pending||!current||readOnly||disabled||saving.current)return
   let input:NewFinding
   try {input=multipuntoFinding(choice.itemId!,choice.state,choice.note,orderId,vehicleId)}
   catch {return}
   saving.current=true
   try {
     const saved=await onSave(input)
     if(saved)onChange(emptyMultipuntoChoice)
   }finally{saving.current=false}
 }
 return <div className="cp04-checklist" aria-label="Hoja de inspección multipunto con X">
   <div className="cp04-checklist-top">
     <div>
       <span className="official-eyebrow">Orden autenticada · {plate??'Vehículo sin patente'}</span>
       <h2><ClipboardCheck size={21}/> Hoja multipunto · Marcar con X</h2>
       <p>Revisión por componentes. Marca el resultado y guárdalo en la ficha real de este vehículo.</p>
     </div>
     <button type="button" className="cp04-secondary" onClick={onBack}>
       <ArrowLeft size={16}/> Volver a la orden
     </button>
   </div>
   <p className="cp04-count"><strong>{count}/{total}</strong> componentes guardados.
     {pending&&' La X que seleccionaste aún NO está guardada.'}</p>
   <div className="cp04-checklist-legend">
     <span><i className="cp04-legend-ok"/> OK</span>
     <span><i className="cp04-legend-attention"/> Requiere atención</span>
     <span><i className="cp04-legend-immediate"/> Cambio inmediato</span>
   </div>
   <div className="mp-sheet mp-edit-sheet cp04-checklist-sheet">
     <MultipuntoTable items={items} onChange={readOnly||disabled?undefined:select}/>
   </div>
   {readOnly&&<p className="cp04-private-hint">Puedes consultar las X históricas, pero esta orden no permite nuevas revisiones.</p>}
   {!readOnly&&<form className="cp04-form cp04-checklist-editor" onSubmit={save}>
     <h3>Guardar componente inspeccionado</h3>
     {!current||!pending?<p>Selecciona con una X el estado de un componente en la hoja.</p>:<>
       <strong>{current.name}: {choice.state==='ok'?'OK':choice.state==='immediate'?'Cambio inmediato':'Requiere atención'}</strong>
       {old&&<p className="cp04-info">Ya existe una revisión de este componente
         ({oldState==='ok'?'OK':oldState==='immediate'?'Cambio inmediato':oldState==='attention'?'Requiere atención':'Sin revisar'}).
         Guardar otra conserva el registro anterior como historial.</p>}
       <label>Observación técnica {needsNote?'(obligatoria)':'(opcional)'}
         <textarea rows={3} maxLength={1900} value={choice.note}
           minLength={needsNote?3:undefined} required={needsNote}
           placeholder="Describe el resultado para el historial del vehículo"
           onChange={e=>onChange({...choice,note:e.target.value})}/>
       </label>
       {choice.state==='immediate'&&<p className="cp04-info">
         La prioridad inmediata se registra expresamente en la observación técnica del hallazgo.
       </p>}
     </>}
     <button type="submit" className="cp04-primary"
       disabled={!pending||disabled||(needsNote&&choice.note.trim().length<3)}>
       <Save size={17}/> Guardar X en Supabase
     </button>
   </form>}
 </div>
}
