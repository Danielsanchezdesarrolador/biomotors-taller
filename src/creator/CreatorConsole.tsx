import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowLeft, Crown, LockKeyhole, RefreshCw, ShieldCheck } from 'lucide-react'
import type { AuthController } from '../auth/controller'
import './creator.css'
type Plan = 'basic' | 'plus' | 'full'
type Mode = 'grant_days' | 'extend_days' | 'lifetime' | 'revoke' | 'basic'
type Workshop = {
  id: string; name: string; ownerEmail: string | null; effectivePlan: Plan
  plan: Plan; state: 'active' | 'revoked'; isLifetime: boolean
  expiresAt: string | null; mechanics: number
}
type PlanEvent = { id: string; workshopId: string; mode: string; reason: string; recordedAt: string }
type Overview = {
  workshops: Workshop[]; recentEvents: PlanEvent[];
  billingEnabled: boolean; manualPlanEnforcementEnabled: boolean
}
const names: Record<Plan,string> = { basic: 'Básico', plus: 'Plus', full: 'Full' }
const modes: {value:Mode;label:string}[] = [
  {value:'grant_days',label:'Conceder por días'},
  {value:'extend_days',label:'Extender vencimiento'},
  {value:'lifetime',label:'Conceder permanente'},
  {value:'basic',label:'Restablecer Básico'},
  {value:'revoke',label:'Revocar beneficio'}
]
function dateLabel(value: string | null) {
  if (!value) return 'Sin vencimiento'
  return new Date(value).toLocaleDateString('es-CL',{year:'numeric',month:'short',day:'2-digit'})
}
export function CreatorConsole({controller,onBack}:{controller:AuthController;onBack:()=>void}) {
  const [overview,setOverview] = useState<Overview | null>(null)
  const [busy,setBusy] = useState(false)
  const [loading,setLoading] = useState(true)
  const [mfa,setMfa] = useState(false)
  const [factorId,setFactorId] = useState('')
  const [qrCode,setQrCode] = useState('')
  const [verificationCode,setVerificationCode] = useState('')
  const [factorBusy,setFactorBusy] = useState(false)
  const [error,setError] = useState('')
  const [notice,setNotice] = useState('')
  const [workshop,setWorkshop] = useState('')
  const [plan,setPlan] = useState<Plan>('full')
  const [mode,setMode] = useState<Mode>('grant_days')
  const [days,setDays] = useState(30)
  const [reason,setReason] = useState('')
  const requestIdRef = useRef<{signature:string; id:string}|null>(null)
  const refresh = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const client = await controller.directoryClient()
      if (!client) throw new Error('SESSION')
      const [auth, query] = await Promise.all([
        client.auth.mfa.getAuthenticatorAssuranceLevel(),
        client.rpc('bt_creator_overview')
      ])
      if (query.error || !query.data || !Array.isArray(query.data.workshops))
        throw new Error('PERMISSION')
      const next = query.data as Overview
      setOverview(next)
      setMfa(!auth.error && auth.data?.currentLevel === 'aal2')
      setWorkshop(prev => next.workshops.some(w => w.id===prev) ? prev : (next.workshops[0]?.id || ''))
    } catch {
      setOverview(null)
      setError('No se pudo validar tu acceso al panel de creador. Verifica tu sesión e inténtalo nuevamente.')
    } finally { setLoading(false) }
  },[controller])
  useEffect(()=>{void refresh()},[refresh])
  async function setupMfa() {
    if (factorBusy) return
    setFactorBusy(true);setError('')
    try {
      const client=await controller.directoryClient()
      if (!client) throw new Error('SESSION')
      const list=await client.auth.mfa.listFactors()
      if (list.error) throw list.error
      const active=list.data?.totp?.find(f=>f.status==='verified')
      if (active) {
        setFactorId(active.id)
        setQrCode('')
      } else {
        const enrollment=await client.auth.mfa.enroll({
          factorType:'totp',friendlyName:'ByteTorque Creador'
        })
        if (enrollment.error || !enrollment.data?.id) throw new Error('ENROLL')
        setFactorId(enrollment.data.id)
        const code = enrollment.data.totp?.qr_code || ''
        setQrCode(code.trim().startsWith('<svg')
          ? 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(code)
          : code)
      }
    } catch {
      setError('No fue posible iniciar la configuración de MFA. Revisa los permisos de autenticación.')
    } finally {setFactorBusy(false)}
  }
  async function confirmMfa(event:FormEvent) {
    event.preventDefault()
    if (factorBusy || !factorId || !/^\d{6}$/.test(verificationCode)) {
      setError('Ingresa los seis dígitos vigentes de tu aplicación autenticadora.')
      return
    }
    setFactorBusy(true);setError('')
    try {
      const client=await controller.directoryClient()
      if (!client) throw new Error('SESSION')
      const challenge=await client.auth.mfa.challenge({factorId})
      if (challenge.error || !challenge.data?.id) throw new Error('CHALLENGE')
      const result=await client.auth.mfa.verify({
        factorId,challengeId:challenge.data.id,code:verificationCode
      })
      if (result.error) throw result.error
      setVerificationCode('');setFactorId('');setQrCode('')
      await refresh()
    } catch {
      setError('No fue posible validar el código MFA. Comprueba el reloj del teléfono y reintenta.')
    } finally {setFactorBusy(false)}
  }
  async function submit(event:FormEvent) {
    event.preventDefault();setError('');setNotice('')
    if (busy || !overview || !mfa || !workshop) {
      setError('Necesitas iniciar sesión con doble factor (MFA/AAL2) para cambiar planes.')
      return
    }
    if (reason.trim().length<5 || reason.trim().length>240) {
      setError('Indica un motivo de 5 a 240 caracteres.');return
    }
    if (['grant_days','extend_days'].includes(mode) && (!Number.isInteger(days) || days<1 || days>3650)) {
      setError('El período debe estar entre 1 y 3650 días.');return
    }
    const selected = overview.workshops.find(w=>w.id===workshop)
    if (!selected) return
    const effective:Plan = mode==='basic'?'basic':mode==='revoke'?selected.plan:plan
    const description = modes.find(m=>m.value===mode)?.label || mode
    if (!window.confirm(description+' · '+names[effective]+' · '+selected.name+
      '\n¿Confirmas la operación manual para este taller?')) return
    const signature = [workshop,effective,mode,String(days),reason.trim()].join('|')
    if (requestIdRef.current?.signature !== signature)
      requestIdRef.current = {signature,id:crypto.randomUUID()}
    const requestId = requestIdRef.current.id
    setBusy(true)
    try {
      const client=await controller.directoryClient()
      if (!client) throw new Error('SESSION')
      const result=await client.rpc('bt_creator_manage_subscription',{
        p_workshop_id:workshop,p_plan:effective,p_mode:mode,
        p_days:['grant_days','extend_days'].includes(mode)?days:null,
        p_reason:reason.trim(),p_request_id:requestId
      })
      if (result.error) throw result.error
      setReason('')
      requestIdRef.current = null
      await refresh()
      setNotice('Cambio de plan registrado en la auditoría. No se efectuaron cobros ni correos.')
    } catch {
      setError('No se pudo guardar. Verifica el segundo factor, el estado del taller y vuelve a intentarlo.')
    } finally {setBusy(false)}
  }
  return (
    <main className="creator-console">
      <header className="creator-header">
        <div className="creator-brand"><Crown aria-hidden="true"/><span><strong>ByteTorque</strong><small>Panel exclusivo del creador</small></span></div>
        <button type="button" className="creator-back" onClick={onBack}><ArrowLeft size={18}/> Volver al taller</button>
      </header>
      <div className="creator-content">
        <section className="creator-intro">
          <div><span className="creator-eyebrow"><ShieldCheck size={17}/> Acceso global protegido</span>
            <h1>Suscripciones y talleres</h1>
            <p>Gestiona beneficios comerciales sin acceder a los historiales ni diagnósticos privados de los talleres.</p>
          </div>
          <button className="creator-refresh" type="button" disabled={loading||busy} onClick={()=>void refresh()}><RefreshCw size={17}/> Actualizar</button>
        </section>
        <div className="creator-security" role="note"><LockKeyhole size={22}/>
          <span><strong>{mfa?'Doble factor verificado':'Segundo factor requerido para modificar planes'}</strong>
          <small>Las acciones de suscripción exigen MFA (AAL2) y dejan un registro auditable.</small></span>
        </div>
        {!mfa && !loading && <section className="creator-section creator-mfa">
          <h2>Activar protección de dos factores</h2>
          <p className="creator-help">Necesitas una aplicación autenticadora para conceder, extender o revocar planes. El código se verifica directamente con Supabase Auth.</p>
          {!factorId && <button type="button" className="creator-refresh" disabled={factorBusy} onClick={()=>void setupMfa()}>
            {factorBusy?'Preparando…':'Configurar o verificar MFA'}
          </button>}
          {factorId && <>
            {qrCode && qrCode.startsWith('data:image/') && <img className="creator-qr" src={qrCode} alt="Código QR privado para configurar tu aplicación autenticadora"/>}
            <p className="creator-help">{qrCode?'Escanea el QR con tu autenticador y escribe el código generado.':'Introduce el código de tu aplicación autenticadora ya configurada.'}</p>
            <form className="creator-factor-form" onSubmit={e=>void confirmMfa(e)}>
              <label>Código de seis dígitos<input value={verificationCode} onChange={e=>setVerificationCode(e.target.value.replace(/\D/g,'').slice(0,6))}
                type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required /></label>
              <button type="submit" className="creator-submit" disabled={factorBusy||verificationCode.length!==6}>
                {factorBusy?'Verificando…':'Verificar segundo factor'}
              </button>
            </form>
          </>}
        </section>}
        {error&&<p className="creator-error" role="alert">{error}</p>}
        {notice&&<p className="creator-notice" role="status">{notice}</p>}
        {loading&&<p role="status">Cargando talleres autorizados…</p>}
        {overview&&!loading&&<>
          <section className="creator-stats">
            <div><span>Talleres</span><strong>{overview.workshops.length}</strong></div>
            <div><span>Plus</span><strong>{overview.workshops.filter(w=>w.effectivePlan==='plus').length}</strong></div>
            <div><span>Full</span><strong>{overview.workshops.filter(w=>w.effectivePlan==='full').length}</strong></div>
          </section>
          <section className="creator-section">
            <h2>Talleres y planes efectivos</h2>
            <div className="creator-table-wrap"><table className="creator-table">
              <thead><tr><th>Taller</th><th>Plan</th><th>Vigencia</th><th>Mecánicos</th></tr></thead>
              <tbody>{overview.workshops.map(w=><tr key={w.id}>
                <td><strong>{w.name}</strong><small>{w.ownerEmail||'Propietario aún no asignado'}</small></td>
                <td><span className={'creator-plan creator-plan-'+w.effectivePlan}>{names[w.effectivePlan]}</span>{w.state==='revoked'&&<small>Revocado</small>}</td>
                <td>{w.isLifetime&&w.state==='active'?'Permanente':dateLabel(w.expiresAt)}</td>
                <td>{w.mechanics}</td>
              </tr>)}</tbody>
            </table></div>
          </section>
          <section className="creator-section">
            <h2>Conceder, extender o revocar un plan</h2>
            <p className="creator-help">Esta primera etapa registra beneficios manuales. La facturación y los límites automáticos por plan todavía no están integrados.</p>
            <form onSubmit={e=>void submit(e)} className="creator-form">
              <label>Taller
                <select value={workshop} onChange={e=>setWorkshop(e.target.value)}>
                  {overview.workshops.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </label>
              <label>Operación
                <select value={mode} onChange={e=>setMode(e.target.value as Mode)}>
                  {modes.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </label>
              <label>Plan
                <select value={plan} onChange={e=>setPlan(e.target.value as Plan)} disabled={mode==='basic'||mode==='revoke'}>
                  <option value="plus">Plus</option><option value="full">Full</option>
                </select>
              </label>
              {['grant_days','extend_days'].includes(mode)&&
                <label>Días de vigencia<input type="number" min="1" max="3650" step="1" value={days} onChange={e=>setDays(Number(e.target.value))} required/></label>}
              <label className="creator-wide">Motivo de la operación
                <textarea value={reason} onChange={e=>setReason(e.target.value)} minLength={5} maxLength={240} rows={2} required
                  placeholder="Ej.: Beneficio autorizado para taller piloto"/>
              </label>
              <button className="creator-submit" type="submit" disabled={busy||!mfa||!workshop}>
                {busy?'Registrando…':'Confirmar cambio manual'}
              </button>
            </form>
          </section>
          <section className="creator-section">
            <h2>Historial de cambios</h2>
            {overview.recentEvents.length? <ol className="creator-history">
              {overview.recentEvents.map(e=><li key={e.id}><strong>{modes.find(m=>m.value===e.mode)?.label||e.mode}</strong>
                <span>{overview.workshops.find(w=>w.id===e.workshopId)?.name||'Taller'}</span>
                <small>{dateLabel(e.recordedAt)} · {e.reason}</small></li>)}
            </ol>:<p className="creator-help">Todavía no hay cambios manuales.</p>}
          </section>
        </>}
      </div>
    </main>
  )
}
