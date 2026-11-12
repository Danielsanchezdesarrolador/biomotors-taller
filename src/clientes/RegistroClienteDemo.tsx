import { useState } from 'react'
import { CheckCircle2, Info } from 'lucide-react'
import { validateRegistration, type RegistrationDraft } from './clientesData'
export function RegistroClienteDemo({onCreate}:{onCreate?:(draft:RegistrationDraft)=>void}) {
 const [draft,setDraft]=useState<RegistrationDraft>({name:'',email:'',phone:'',address:'',commune:'',consent:false})
 const [errors,setErrors]=useState<ReturnType<typeof validateRegistration>>({}),[done,setDone]=useState(false)
 if(done)return <div className="cv-register-success" role="status"><CheckCircle2 size={40}/><h3>Simulación local completada</h3><p>No se creó un registro real, no se verificó el correo y no se enviaron datos a un taller ni servidor. Al recargar se perderán.</p><button className="cv-secondary" onClick={()=>setDone(false)}>Volver al formulario</button></div>
 const fields=[['name','Nombre completo *','text'],['email','Correo electrónico *','email'],['phone','Teléfono chileno *','tel'],['address','Dirección (opcional)','text'],['commune','Comuna (opcional)','text']] as const
 return <form className="cv-register" noValidate onSubmit={e=>{e.preventDefault();const result=validateRegistration(draft);setErrors(result);if(!Object.keys(result).length){onCreate?.(draft);setDone(true)}}}>
  <p className="cv-privacy"><Info/> Vista pública DEMO · No ingreses información personal verdadera. Sin cuenta, envío, almacenamiento ni enlace público activo.</p>
  <p>Completa solo los datos ficticios necesarios para probar el servicio. Dirección y comuna son opcionales; no solicitamos RUT.</p>
  {fields.map(([key,label,type])=><label key={key}>{label}<input type={type} name={key} aria-label={label} autoComplete="off" value={draft[key]} aria-invalid={!!errors[key]} aria-describedby={errors[key]?`cv-error-${key}`:undefined} maxLength={key==='email'?160:120} onChange={e=>setDraft(previous=>({...previous,[key]:e.target.value}))}/>{errors[key]&&<span className="cv-error" id={`cv-error-${key}`} role="alert">{errors[key]}</span>}</label>)}
  <label className="cv-consent"><input type="checkbox" checked={draft.consent} onChange={e=>setDraft(previous=>({...previous,consent:e.target.checked}))}/> Entiendo que esta es una demostración y usaré únicamente datos ficticios.</label>{errors.consent&&<p className="cv-error" role="alert">{errors.consent}</p>}
  <p className="cv-privacy">Privacidad: el formulario de esta demo se procesa solo en memoria del navegador. En la versión real se informarán responsable, finalidad, conservación y derechos antes de solicitar consentimiento o enviar información al taller.</p>
  <button className="cv-primary">Simular registro local</button>
 </form>
}
export function RegistroPorEnlace() {
 const [preview,setPreview]=useState(false)
 return <div className="cv-link-flow"><p>Comparte en el futuro un enlace individual para que el cliente complete sus datos desde su teléfono. En esta etapa no se genera ni se copia una URL utilizable.</p><ol><li>El taller solicita un enlace individual.</li><li>Lo comparte por WhatsApp de forma manual.</li><li>El cliente completa sus datos ficticios en esta vista de prueba.</li><li>El servidor seguro validará token, vencimiento, uso limitado y pertenencia al taller.</li></ol><p className="cv-privacy">DEMO · Sin token, enlaces públicos ni envíos. La versión real requerirá protección contra abuso y verificación del correo antes de entregar documentos privados.</p>{preview?<RegistroClienteDemo/>:<button className="cv-primary" onClick={()=>setPreview(true)}>Abrir formulario público DEMO</button>}</div>
}
