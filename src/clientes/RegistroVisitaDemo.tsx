import { useEffect, useRef, useState } from 'react'
import { ArrowRight, CarFront, CheckCircle2, ChevronLeft, ClipboardList, Info, ShieldCheck, UserRound } from 'lucide-react'
import {
  emptyVisitaDraft, validateVisitaDraft, validateVisitaStep, visitaExamples,
  type VisitaDraft, type VisitaErrors, type VisitaField, type VisitaStep,
} from './registroVisitaData'
import './registroVisita.css'

const steps=[{number:1,label:'Tus datos',icon:UserRound},{number:2,label:'Tu vehículo',icon:CarFront},{number:3,label:'Motivo de visita',icon:ClipboardList}] as const
type FieldKey=Exclude<VisitaField,'consent'|'clientReportedReason'>
type TextField={key:FieldKey;label:string;hint:string;type?:'email'|'tel'|'text';mode?:'numeric'}
const contactFields:TextField[]=[
  {key:'name',label:'Nombre completo *',hint:'Ej.: Cliente de prueba'},
  {key:'email',label:'Correo electrónico *',hint:'Ej.: cliente@example.com',type:'email'},
  {key:'phone',label:'Teléfono *',hint:'Ej.: +56 9 0000 0000',type:'tel'},
  {key:'address',label:'Dirección (opcional)',hint:'Ej.: Calle de muestra 123'},
  {key:'commune',label:'Comuna (opcional)',hint:'Ej.: Comuna DEMO'},
]
const vehicleFields:TextField[]=[
  {key:'brand',label:'Marca *',hint:'Ej.: Toyota'},
  {key:'model',label:'Modelo *',hint:'Ej.: Corolla'},
  {key:'year',label:'Año *',hint:'Ej.: 2021',mode:'numeric'},
  {key:'mileage',label:'Kilometraje actual *',hint:'Ej.: 68430',mode:'numeric'},
  {key:'plate',label:'Patente (opcional)',hint:'Puedes dejarla en blanco'},
]

export function RegistroVisitaDemo({onComplete}:{onComplete:(draft:VisitaDraft)=>void}) {
  const [opened,setOpened]=useState(false)
  const [draft,setDraft]=useState<VisitaDraft>({...emptyVisitaDraft})
  const [step,setStep]=useState<VisitaStep>(1)
  const [review,setReview]=useState(false)
  const [done,setDone]=useState(false)
  const [errors,setErrors]=useState<VisitaErrors>({})
  const stepContainerRef=useRef<HTMLDivElement>(null)
  useEffect(()=>{
    // En Safari móvil el diálogo conserva scroll entre pasos; comenzar cada vista desde arriba.
    const dialog=stepContainerRef.current?.closest('dialog')
    if(dialog)dialog.scrollTop=0
  },[step,review,opened])
  const change=(key:VisitaField,value:string|boolean)=>{
    setDraft(previous=>({...previous,[key]:value}))
    setErrors(previous=>({...previous,[key]:undefined}))
  }
  const edit=(target:VisitaStep)=>{setReview(false);setStep(target);setErrors({})}
  const back=()=>{if(review){setReview(false);setStep(3)}else if(step>1){setStep((step-1) as VisitaStep)}setErrors({})}
  const next=()=>{
    const result=review?validateVisitaDraft(draft):validateVisitaStep(draft,step)
    setErrors(result)
    if(Object.keys(result).length){
      if(review){
        const invalidStep:VisitaStep=['name','email','phone','address','commune','consent'].some(k=>k in result)?1:
          ['brand','model','year','mileage','plate'].some(k=>k in result)?2:3
        edit(invalidStep)
        setErrors(result)
      }
      return
    }
    if(review){onComplete(draft);setDone(true)}
    else if(step===3)setReview(true)
    else setStep((step+1) as VisitaStep)
  }
  const field=(item:TextField)=>{
    const id='btreg-'+item.key
    return <label className="btreg-field" key={item.key} htmlFor={id}><span>{item.label}</span>
      <input id={id} name={item.key} type={item.type??'text'} inputMode={item.mode}
        autoComplete="off" spellCheck={false} value={draft[item.key]} placeholder={item.hint}
        maxLength={item.key==='email'?160:item.key==='phone'?24:item.key==='year'?4:item.key==='mileage'?9:item.key==='plate'?10:120}
        aria-invalid={Boolean(errors[item.key])} aria-describedby={errors[item.key]?id+'-error':undefined}
        onChange={e=>change(item.key,e.target.value)}/>
      {errors[item.key]&&<small id={id+'-error'} className="btreg-error" role="alert">{errors[item.key]}</small>}
    </label>
  }
  if(done)return <div className="btreg-success" role="status">
    <CheckCircle2 size={49}/><h3>Simulación completada</h3>
    <p><strong>Simulación completada. No se enviaron ni almacenaron datos reales.</strong></p>
    <p>La solicitud ficticia aparece en «Solicitudes de ingreso» de esta pantalla mientras mantengas abierta esta pestaña; se descarta al recargar o cerrar. No se creó una orden ni un diagnóstico profesional.</p>
    <button type="button" className="cv-secondary" onClick={()=>{setDraft({...emptyVisitaDraft});setStep(1);setReview(false);setDone(false);setOpened(false);setErrors({})}}>Nueva simulación</button>
  </div>
  if(!opened)return <div className="btreg-intro">
    <p className="btreg-notice"><ShieldCheck size={19}/> DEMO local · No existe enlace público, token ni envío a servidor.</p>
    <h3>El cliente completa sus antecedentes antes de visitar el taller.</h3>
    <p>Tres pasos simples: datos de contacto, vehículo y motivo de visita. Al terminar, revisará todo antes de simular el ingreso.</p>
    <div className="btreg-plans"><strong>Disponibilidad futura por plan</strong><p>Básico: registro manual · Plus USD 5/mes y Full USD 15/mes: registro por enlace · Prueba Full: durante sus 3 días autorizados. No hay permisos comerciales activos en esta DEMO.</p></div>
    <button type="button" className="cv-primary btreg-main-action" onClick={()=>setOpened(true)}>Abrir formulario público DEMO <ArrowRight size={18}/></button>
  </div>
  return <div className="btreg" ref={stepContainerRef}>
    <div className="btreg-topline"><span className="btreg-demo-label">BYTE<span>TORQUE</span> · DEMO</span><span>Sin envío ni guardado real</span></div>
    <ol className="btreg-steps" aria-label="Progreso del registro">
      {steps.map(({number,label,icon:Icon})=><li key={number} className={number===step?'active':number<step?'complete':''} aria-current={number===step?'step':undefined}>
        <span className="btreg-step-mark">{number<step?<CheckCircle2 size={17}/>:<Icon size={16}/>}</span><span>{label}</span>
      </li>)}
    </ol>
    <form noValidate onSubmit={e=>{e.preventDefault();next()}}>
      {review?<div className="btreg-review">
        <span className="btreg-eyebrow">Antes de finalizar</span><h3>Revisa tus antecedentes</h3><p>Comprueba que los datos ficticios están correctos. Puedes volver y corregir cualquier sección.</p>
        <section><header><h4>1. Tus datos</h4><button type="button" onClick={()=>edit(1)}>Corregir datos</button></header><p><strong>{draft.name.trim()}</strong></p><p>{draft.email} · {draft.phone}</p><p>{[draft.address,draft.commune].filter(Boolean).join(', ')||'Dirección y comuna no indicadas'}</p></section>
        <section><header><h4>2. Tu vehículo</h4><button type="button" onClick={()=>edit(2)}>Corregir vehículo</button></header><p><strong>{draft.brand} {draft.model} · {draft.year}</strong></p><p>{Number(draft.mileage).toLocaleString('es-CL')} km · Patente: {draft.plate||'No indicada'}</p></section>
        <section><header><h4>3. Motivo declarado</h4><button type="button" onClick={()=>edit(3)}>Corregir motivo</button></header><p className="btreg-quoted">{draft.clientReportedReason}</p></section>
        <p className="btreg-notice"><Info size={18}/> Este texto es lo que informa el cliente, no un diagnóstico mecánico. La solicitud quedará como ejemplo pendiente de revisión.</p>
      </div>:<>
        {step===1&&<div className="btreg-content"><span className="btreg-eyebrow">Paso 1 de 3</span><h3>Cuéntanos quién eres</h3><p>Solo utiliza datos inventados. No necesitamos tu RUT.</p><div className="btreg-fields">{contactFields.map(field)}</div>
          <label className="btreg-consent"><input type="checkbox" checked={draft.consent} onChange={e=>change('consent',e.target.checked)}/><span>Entiendo que es una demostración y solo ingresaré datos ficticios.</span></label>
          {errors.consent&&<small role="alert" className="btreg-error">{errors.consent}</small>}
        </div>}
        {step===2&&<div className="btreg-content"><span className="btreg-eyebrow">Paso 2 de 3</span><h3>Tu vehículo</h3><p>Completa los datos del auto que llevarías al taller.</p><div className="btreg-fields">{vehicleFields.map(field)}</div><p className="btreg-help">La patente es opcional y nunca acredita por sí sola la propiedad o autorización del vehículo.</p></div>}
        {step===3&&<div className="btreg-content"><span className="btreg-eyebrow">Paso 3 de 3</span><h3>¿En qué podemos ayudarte?</h3><label className="btreg-field" htmlFor="btreg-reason"><span>¿Qué problema presenta tu vehículo o qué trabajo necesitas realizar? *</span>
          <textarea id="btreg-reason" name="clientReportedReason" rows={4} maxLength={500} value={draft.clientReportedReason}
            placeholder="Ej.: Mi automóvil vibra al frenar y necesito que lo revisen."
            aria-invalid={Boolean(errors.clientReportedReason)} aria-describedby={errors.clientReportedReason?'btreg-reason-error':'btreg-reason-count'}
            onChange={e=>change('clientReportedReason',e.target.value)}/>
          <small className="btreg-count" id="btreg-reason-count">{draft.clientReportedReason.length} / 500 caracteres</small>
          {errors.clientReportedReason&&<small id="btreg-reason-error" className="btreg-error" role="alert">{errors.clientReportedReason}</small>}</label>
          <p className="btreg-example-title">Ejemplos que puedes usar o modificar:</p>
          <div className="btreg-examples">{visitaExamples.map(example=><button type="button" key={example} onClick={()=>change('clientReportedReason',example)}>{example}</button>)}</div>
          <p className="btreg-help">No necesitas saber de mecánica. El diagnóstico lo realizará posteriormente un profesional.</p>
        </div>}
      </>}
      <footer className="btreg-actions">
        <button type="button" className="cv-secondary" onClick={back} disabled={!review&&step===1}><ChevronLeft size={17}/> Volver</button>
        <button type="submit" className="cv-primary">{review?'Finalizar simulación':step===3?'Revisar datos':'Continuar'} <ArrowRight size={17}/></button>
      </footer>
    </form>
    <p className="btreg-footnote"><ShieldCheck size={15}/> Solo memoria temporal del navegador; sin guardado permanente, correos, enlaces reales ni almacenamiento persistente.</p>
  </div>
}
