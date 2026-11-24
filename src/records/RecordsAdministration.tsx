import { useEffect, useId, useRef, useState } from 'react'
import { Archive, ArrowLeft, MoreHorizontal, RefreshCw, Search, ShieldCheck } from 'lucide-react'
import { resources, resourceLabels, actionLabels, recordsMessage, type Resource, type Action, type RecordRow, type Inspection, type AuditEvent, type RecordsPort } from './contracts'
import '../clientes/cp03PilotDirectory.css'
import './records.css'
function readMessage(error: unknown) {return error && typeof error==='object' && 'kind' in error && error.kind==='unavailable'
  ? 'No se pudo consultar el registro. Usa Actualizar; las operaciones ya confirmadas no deben repetirse.' : recordsMessage(error)}
const stateLabels: Record<string, string> = {active:'Activo', archived:'Archivado',parent_archived:'Cliente archivado',received:'Recibida',inspecting:'En inspección',in_service:'En servicio',ready:'Lista',closed:'Cerrada',cancelled:'Cancelada',draft:'Borrador',issued:'Emitida',voided:'Anulada'}
export function RecordsAdministration({repository, onBack}: {repository: RecordsPort; onBack: () => void}) {
  const [resource, setResource] = useState<Resource>('customers'), [archived, setArchived] = useState(false)
  const [query, setQuery] = useState(''), [search, setSearch] = useState(''), [page, setPage] = useState<string>()
  const [rows, setRows] = useState<RecordRow[]>([]), [loading, setLoading] = useState(false)
  const [error, setError] = useState(''), [notice, setNotice] = useState(''), [refresh, setRefresh] = useState(0)
  const [selected, setSelected] = useState<{row: RecordRow; inspection: Inspection; events: AuditEvent[]} | null>(null)
  const [auditRows,setAuditRows]=useState<AuditEvent[]|null>(null)
  const [action, setAction] = useState<Action | null>(null), [reason, setReason] = useState(''), [confirmed, setConfirmed] = useState(false)
  const [busy, setBusy] = useState(false), [uncertain, setUncertain] = useState(false)
  const generation = useRef(0), alive = useRef(true), lock = useRef(false), request = useRef<string | null>(null)
  const dialog = useRef<HTMLDialogElement>(null), lastTrigger = useRef<HTMLButtonElement | null>(null), id = useId()
  useEffect(() => {alive.current = true; return () => {alive.current = false; generation.current++}}, [repository])
  useEffect(() => {
    const seq = ++generation.current
    setLoading(true); setRows([]); setSelected(null); setAuditRows(null); setError('')
    void repository.list(resource, archived, search, page).then(list => {if (alive.current && seq === generation.current) setRows(list)})
      .catch(e => {if (alive.current && seq === generation.current) setError(readMessage(e))})
      .finally(() => {if (alive.current && seq === generation.current) setLoading(false)})
    return () => {generation.current++}
  }, [repository, resource, archived, search, page, refresh])
  useEffect(() => {
    if (action && dialog.current && !dialog.current.open) dialog.current.showModal()
    if (!action && dialog.current?.open) dialog.current.close()
  }, [action])
  function resetAction() {setAction(null); setConfirmed(false); setReason(''); request.current = null; setUncertain(false); lastTrigger.current?.focus()}
  async function inspect(row: RecordRow, trigger: HTMLButtonElement) {
    if (lock.current) return
    lastTrigger.current = trigger
    lock.current = true; setBusy(true); setError(''); setSelected(null)
    const seq = ++generation.current
    try {
      const [inspection, events] = await Promise.all([repository.inspect(resource,row.id),repository.audit(resource,row.id)])
      if (alive.current && seq === generation.current) setSelected({row,inspection,events})
    } catch (e) {if (alive.current && seq === generation.current) setError(readMessage(e))}
    finally {lock.current = false; if (alive.current) setBusy(false)}
  }
  async function loadAudit() {
    if(lock.current)return
    lock.current=true;setBusy(true);setError('')
    const seq=++generation.current
    try {const events=await repository.audit(resource);if(alive.current&&seq===generation.current)setAuditRows(events)}
    catch(e){if(alive.current&&seq===generation.current)setError(readMessage(e))}
    finally{lock.current=false;if(alive.current)setBusy(false)}
  }
  async function execute() {
    if (lock.current || !selected || !action || !confirmed || reason.trim().length < 3) return
    lock.current = true; setBusy(true); setError('')
    const seq = generation.current
    request.current ??= crypto.randomUUID()
    try {
      await repository.execute(selected.inspection,action,request.current,reason)
      if (!alive.current || seq !== generation.current) return
      setNotice(actionLabels[action] + ': operación confirmada por el servidor.'); resetAction(); setSelected(null)
      // A committed write is never reported as failed merely because the following list read fails.
      setPage(undefined); setRefresh(n => n + 1)
    } catch (e) {
      if (alive.current && seq === generation.current) {
        setError(recordsMessage(e))
        const safeToReset = e && typeof e === 'object' && 'kind' in e && ['conflict','dependencies','invalid','denied','disabled'].includes(String(e.kind))
        if (safeToReset) {resetAction(); setSelected(null)} else setUncertain(true)
      }
    } finally {lock.current = false; if (alive.current) setBusy(false)}
  }
  const disabled = busy || loading || !!action
  return <section className="official-panel cp03-pilot bt-records" aria-label="Administración de registros">
    <header className="welcome-area"><div className="welcome-head"><div><span className="official-eyebrow">Control del taller</span>
      <h1>Administración de registros</h1><p>Gestiona los registros conservando sus vínculos e historiales.</p></div>
      <button className="cp03-secondary" disabled={disabled} onClick={onBack}><ArrowLeft size={18}/> Volver al directorio</button></div></header>
    <section className="dashboard-card bt-records-controls">
      <label>Tipo de registro<select value={resource} disabled={disabled} onChange={e => {setResource(e.target.value as Resource); setPage(undefined); setSearch(''); setQuery(''); setNotice('')}}>
        {resources.map(r => <option key={r} value={r}>{resourceLabels[r]}</option>)}</select></label>
      <div className="bt-records-filter" role="group" aria-label="Estado de los registros">
        <button className="cp03-secondary" aria-pressed={!archived} disabled={disabled} onClick={() => {setArchived(false); setPage(undefined)}}>Registros activos</button>
        <button className="cp03-secondary" aria-pressed={archived} disabled={disabled} onClick={() => {setArchived(true); setPage(undefined)}}><Archive size={17}/> Archivados y anulados</button>
      </div>
      <form onSubmit={e => {e.preventDefault(); setPage(undefined); setSearch(query.trim()); setRefresh(n => n + 1)}}>
        <label>Buscar<input value={query} maxLength={80} disabled={disabled} onChange={e => setQuery(e.target.value)} /></label>
        <button className="cp03-secondary" disabled={disabled}><Search size={17}/> Buscar</button>
      </form>
      <button className="cp03-secondary" disabled={disabled} onClick={() => setRefresh(n => n + 1)}><RefreshCw size={17}/> Actualizar</button>
      <button className="cp03-secondary" disabled={disabled} onClick={()=>void loadAudit()}>Ver registro de operaciones</button>
    </section>
    <p className="bt-records-notice"><ShieldCheck size={18}/> Solo propietarios y administradores. No se eliminan historiales ni documentos emitidos.</p>
    {notice && <p role="status">{notice}</p>}{error && <p role="alert">{error}</p>}{loading && <p role="status">Consultando registros autorizados…</p>}
    <section className="dashboard-card bt-records-list" aria-label={resourceLabels[resource]}>
      {!loading && !rows.length && !error && <p>No hay registros en esta consulta.</p>}
      {rows.slice(0,50).map(row => <article key={row.id} className="bt-records-row"><div><strong>{row.label}</strong><span>{stateLabels[row.state] ?? 'Estado no disponible'}</span></div>
        <button className="cp03-secondary" aria-label={'Acciones de '+row.label} disabled={disabled} onClick={e => void inspect(row,e.currentTarget)}><MoreHorizontal size={18}/> Acciones</button></article>)}
      <div className="bt-records-pages">{page && <button className="cp03-secondary" disabled={disabled} onClick={() => setPage(undefined)}>Volver al inicio</button>}
        {rows.length > 50 && <button className="cp03-secondary" disabled={disabled} onClick={() => setPage(rows[49].id)}>Página siguiente</button>}</div>
    </section>
    {auditRows && <section className="dashboard-card bt-records-detail" aria-label="Registro de operaciones"><h2>Registro de operaciones</h2>
      <p>Últimas 50 operaciones de {resourceLabels[resource].toLowerCase()}, incluidos registros eliminados. El historial completo se conserva en el backend.</p>
      {!auditRows.length && <p>Sin operaciones registradas.</p>}
      <ul>{auditRows.map(event=><li key={event.sequence}>{actionLabels[event.action as Action] ?? 'Actividad de la orden'} · {new Date(event.created_at).toLocaleString('es-CL')}<p>Registro: {event.resource_id}</p>{event.reason&&<p>{event.reason}</p>}</li>)}</ul>
    </section>}
    {selected && <section className="dashboard-card bt-records-detail" aria-label="Acciones y trazabilidad"><h2>{selected.row.label}</h2>
      <p>{selected.inspection.dependencies} referencias dependientes. Se volverán a comprobar al confirmar.</p>
      {selected.inspection.inherited_archive && <p>Restaura primero el cliente para volver a operar con este vehículo.</p>}
      {!selected.inspection.actions.length && <p>Este estado no permite acciones. Una emisión en curso debe terminar o cancelarse desde Cotizaciones.</p>}
      <div className="bt-records-actions">{selected.inspection.actions.map(a => <button key={a} className={a === 'delete' ? 'bt-records-danger' : 'cp03-secondary'} disabled={busy} onClick={e => {lastTrigger.current = e.currentTarget; request.current = null; setAction(a); setReason(''); setConfirmed(false)}}>{actionLabels[a]}</button>)}</div>
      <h3>Trazabilidad</h3>{!selected.events.length && <p>Sin operaciones de administración registradas.</p>}
      <ul>{selected.events.map(event => <li key={event.sequence}>{actionLabels[event.action as Action] ?? 'Actividad de la orden'} · {new Date(event.created_at).toLocaleString('es-CL')}{event.reason && <p>{event.reason}</p>}</li>)}</ul>
    </section>}
    <dialog ref={dialog} className="bt-records-dialog" aria-labelledby={id+'-title'} onKeyDown={e=>{
      if(e.key!=='Tab')return
      const nodes=dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled)')
      if(!nodes?.length)return
      const first=nodes[0],last=nodes[nodes.length-1]
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
    }} onCancel={e => {if (busy || uncertain) e.preventDefault(); else resetAction()}}>
      {action && selected && <form onSubmit={e => {e.preventDefault(); void execute()}}><h2 id={id+'-title'}>{actionLabels[action]}</h2>
        <p>{selected.row.label}</p>
        <p>{action === 'delete' ? 'Esta eliminación es irreversible. No elimina registros vinculados ni historiales.' : action === 'restore' ? 'El registro volverá a estar disponible. Sus registros archivados individualmente seguirán archivados.' : action === 'archive' ? 'Se ocultará de los selectores operativos. Sus vínculos e historial se conservarán y podrás restaurarlo.' : 'Se conservarán sus documentos e historial. Esta acción no declara una reparación ni elimina sus dependencias.'}</p>
        {action === 'delete' && selected.inspection.draft_items > 0 && <p>Se eliminarán también {selected.inspection.draft_items} partidas editables del borrador, que nunca fue emitido.</p>}
        <label>Motivo (sin datos sensibles)<textarea required minLength={3} maxLength={500} value={reason} disabled={busy || uncertain} onChange={e => {request.current = null; setReason(e.target.value)}} /></label>
        <label className="bt-records-confirm"><input type="checkbox" checked={confirmed} disabled={busy || uncertain} onChange={e => setConfirmed(e.target.checked)}/> Confirmo explícitamente esta acción sobre el registro indicado.</label>
        {error && <p role="alert">{error}</p>}
        <div className="bt-records-actions"><button type="button" className="cp03-secondary" disabled={busy || uncertain} onClick={resetAction}>Volver sin cambios</button>
          <button className={action === 'delete' ? 'bt-records-danger' : 'cp03-primary'} disabled={busy || !confirmed || reason.trim().length < 3}>{busy ? 'Confirmando…' : uncertain ? 'Comprobar misma solicitud' : actionLabels[action]}</button></div>
      </form>}
    </dialog>
  </section>
}
