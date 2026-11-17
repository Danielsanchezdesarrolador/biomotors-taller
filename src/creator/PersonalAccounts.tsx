import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import type { AuthController } from '../auth/controller'

type Plan = 'basic' | 'plus' | 'full'
type Mode = 'grant_days' | 'extend_days' | 'lifetime' | 'basic' | 'revoke'
type Account = {
  userId: string; email: string; displayName: string
  personalPlan: Plan; expiresAt: string | null; isLifetime: boolean; workshopCount: number
}
const plans: Record<Plan,string> = { basic:'Básico', plus:'Plus', full:'Full' }
const modes: {value:Mode;label:string}[] = [
  {value:'grant_days',label:'Conceder por días'},
  {value:'extend_days',label:'Extender vigencia'},
  {value:'lifetime',label:'Conceder permanente'},
  {value:'basic',label:'Restablecer Básico'},
  {value:'revoke',label:'Revocar beneficio'}
]
function parseAccount(value: unknown): Account | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const row = value as Record<string, unknown>
  const plan = row.personalPlan
  if (typeof row.userId !== 'string' || typeof row.email !== 'string' ||
      typeof row.displayName !== 'string' ||
      (plan !== 'basic' && plan !== 'plus' && plan !== 'full') ||
      typeof row.isLifetime !== 'boolean' || typeof row.workshopCount !== 'number' ||
      (row.expiresAt !== null && typeof row.expiresAt !== 'string')) return null
  return {userId:row.userId,email:row.email,displayName:row.displayName,
    personalPlan:plan,isLifetime:row.isLifetime,expiresAt:row.expiresAt,
    workshopCount:row.workshopCount}
}
export function PersonalAccounts({controller,mfa}:{controller:AuthController;mfa:boolean}) {
  const [query,setQuery] = useState('')
  const [accounts,setAccounts] = useState<Account[]>([])
  const [selectedId,setSelectedId] = useState('')
  const [loading,setLoading] = useState(false)
  const [busy,setBusy] = useState(false)
  const [notice,setNotice] = useState('')
  const [error,setError] = useState('')
  const [plan,setPlan] = useState<'plus'|'full'>('full')
  const [mode,setMode] = useState<Mode>('grant_days')
  const [days,setDays] = useState(30)
  const [reason,setReason] = useState('')
  const loadEpoch = useRef(0)
  const requestIdRef = useRef<{signature:string;id:string}|null>(null)
  const load = useCallback(async (search: string) => {
    const epoch=++loadEpoch.current
    setLoading(true);setError('')
    try {
      const client=await controller.personalPlanClient()
      if (!client) throw new Error('SESSION')
      const {data,error:requestError}=await client.rpc('bt_creator04_accounts',{
        p_query:search.trim(),p_limit:25
      })
      if (requestError || !Array.isArray(data)) throw new Error('QUERY')
      if(epoch!==loadEpoch.current)return
      const rows=data.map(parseAccount)
      if (rows.some(row=>row===null)) throw new Error('INVALID')
      setAccounts(rows as Account[])
      setSelectedId(prev=>rows.some(row=>row?.userId===prev)?prev:'')
    } catch {
      if(epoch!==loadEpoch.current)return
      setError('No se pudo consultar las cuentas verificadas. Comprueba tu sesión y permisos.')
      setAccounts([]);setSelectedId('')
    } finally {if(epoch===loadEpoch.current)setLoading(false)}
  },[controller])
  useEffect(()=>{void load('');return()=>{loadEpoch.current++}},[load])
  const selected=accounts.find(a=>a.userId===selectedId)
  async function submit(event: FormEvent) {
    event.preventDefault();setError('');setNotice('')
    if (busy || !mfa || !selected) {
      setError('Debes verificar MFA y seleccionar una cuenta confirmada.');return
    }
    if (reason.trim().length<5 || reason.trim().length>240 ||
        (['grant_days','extend_days'].includes(mode) && (!Number.isInteger(days) || days<1 || days>3650))) {
      setError('Motivo de 5 a 240 caracteres y vigencia de 1 a 3650 días.');return
    }
    const effective = mode==='basic' ? 'basic' : mode==='revoke' ? selected.personalPlan : plan
    if (!window.confirm('Cuenta: '+selected.displayName+' ('+selected.email+')'+
        '\nOperación: '+mode+' · '+plans[effective]+
        '\n¿Confirmar beneficio personal SIN cobro ni asignar un taller?')) return
    const signature=[selected.userId,mode,effective,days,reason.trim()].join('|')
    if (requestIdRef.current?.signature!==signature)
      requestIdRef.current={signature,id:crypto.randomUUID()}
    const requestId=requestIdRef.current.id
    setBusy(true)
    try {
      const client=await controller.personalPlanClient()
      if (!client) throw new Error('SESSION')
      const result=await client.rpc('bt_creator04_manage_account',{
        p_user_id:selected.userId,p_plan:effective,p_mode:mode,
        p_days:['grant_days','extend_days'].includes(mode)?days:null,
        p_reason:reason.trim(),p_request_id:requestId
      })
      if (result.error) throw result.error
      requestIdRef.current=null
      setReason('')
      setNotice('Beneficio personal registrado y auditado. No se cobró ni creó taller alguno.')
      await load(query)
    } catch {
      setError('No se pudo registrar el beneficio. Verifica MFA, estado de cuenta y reintenta sin cambiar la operación.')
    } finally {setBusy(false)}
  }
  return <section className="creator-section" aria-label="Planes por persona">
    <h2>Personas y suscripciones</h2>
    <p className="creator-help">Busca una cuenta verificada. Puedes conceder Plus o Full aunque aún no tenga taller. Las concesiones personales no autorizan talleres ajenos.</p>
    <form className="creator-account-search" onSubmit={e=>{e.preventDefault();void load(query)}}>
      <input aria-label="Buscar cuenta por nombre o correo" value={query} maxLength={120}
        placeholder="Buscar por nombre o correo" onChange={e=>setQuery(e.target.value)}/>
      <button type="submit" className="creator-refresh" disabled={loading||busy}>
        {loading?'Buscando…':'Buscar cuentas'}
      </button>
    </form>
    {error&&<p className="creator-error" role="alert">{error}</p>}
    {notice&&<p className="creator-notice" role="status">{notice}</p>}
    <div className="creator-accounts-list" aria-label="Cuentas confirmadas">
      {accounts.map(account=><button type="button" key={account.userId}
        className="creator-account-choice" aria-pressed={selectedId===account.userId}
        onClick={()=>{setSelectedId(account.userId);setNotice('');setError('')}}>
        <span><strong>{account.displayName}</strong>
          <small>{account.email} · {account.workshopCount} taller(es) propio(s)</small></span>
        <span className="creator-account-plan">{plans[account.personalPlan]}{account.isLifetime?' · Permanente':''}</span>
      </button>)}
      {!loading&&accounts.length===0&&<p className="creator-help">No hay cuentas que coincidan con esta búsqueda.</p>}
    </div>
    {selected&&<>
      <div className="creator-selected-account" role="status">
        <strong>Cuenta seleccionada:</strong> {selected.displayName} · {plans[selected.personalPlan]}
        {selected.isLifetime?' permanente':''}. No se concede rol de Creador.
      </div>
      <form className="creator-form" onSubmit={e=>void submit(e)}>
        <label>Operación
          <select value={mode} onChange={e=>setMode(e.target.value as Mode)}>
            {modes.map(item=><option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        <label>Plan
          <select value={plan} onChange={e=>setPlan(e.target.value as 'plus'|'full')}
            disabled={mode==='basic'||mode==='revoke'}>
            <option value="plus">Plus</option><option value="full">Full</option>
          </select>
        </label>
        {['grant_days','extend_days'].includes(mode)&&
          <label>Días<input type="number" min="1" max="3650" step="1" value={days}
            onChange={e=>setDays(Number(e.target.value))} required/></label>}
        <label className="creator-wide">Motivo de la operación
          <textarea value={reason} onChange={e=>setReason(e.target.value)}
            minLength={5} maxLength={240} rows={2} required
            placeholder="Ej.: Beneficio piloto autorizado por el creador"/>
        </label>
        <button className="creator-submit" type="submit" disabled={busy||!mfa}>
          {busy?'Guardando…':'Confirmar beneficio personal'}
        </button>
      </form>
    </>}
    <p className="creator-help">MFA obligatorio. Sin pagos reales ni creación automática de talleres.</p>
  </section>
}
