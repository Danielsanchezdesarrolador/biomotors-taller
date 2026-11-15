/**
 * BT-CP03-P3 · Pilot directory view. Reuses official visual vocabulary.
 * Mounted only from the verified private R1 CP03 route; not public preview.
 * The caller MUST create the repository from verified Auth context and dispose
 * it on sign-out, tenant change or loss of authorization. Only temporary,
 * scoped, expiring tab drafts are retained (NOT a server-side save).
 */
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { CarFront, Search, Plus, Pencil, UsersRound, ArrowLeft, RefreshCw } from 'lucide-react'
import type { Role } from '../auth/controller'
import {
  DirectoryFailure, customerPayload, vehiclePayload,
  type CustomerInput, type CustomerRecord, type VehicleRecord
} from './cp03PilotContracts'
import type { cp03PilotRepository } from './cp03PilotRepository'
import { clearCp03Draft, DRAFT_TTL_HOURS, readCp03Draft, writeCp03Draft,
  type DraftScope, type Cp03Draft } from '../official/privateDraft'
import './cp03PilotDirectory.css'

export type PilotDirectoryPort = Pick<ReturnType<typeof cp03PilotRepository>,
  'recentCustomers' | 'search' | 'getCustomer' | 'getVehicle' |
  'vehiclesForCustomer' | 'createCustomer' | 'createVehicle' |
  'updateCustomer' | 'updateVehicle'>
type Editor = 'new-customer' | 'edit-customer' | 'new-vehicle' | 'edit-vehicle' | null
const emptyCustomer: CustomerInput = {
  full_name: '', email: '', mobile_e164: '', notes: ''
}
type VehicleDraft = {plate: string;make: string;model: string;model_year: string;odometer_km: string}
const emptyVehicle: VehicleDraft = {
  plate: '', make: '', model: '', model_year: '', odometer_km: ''
}
export function cp03Message(error: unknown) {
  const kind = error instanceof DirectoryFailure ? error.kind : 'unavailable'
  switch (kind) {
    case 'invalid': return 'Revisa los campos ingresados. No se guardaron los cambios.'
    case 'duplicate': return 'Esa patente ya está registrada en este taller. Busca el vehículo existente.'
    case 'conflict': return 'La ficha cambió desde otra sesión. Vuelve a cargarla antes de editar.'
    case 'denied': return 'Tu sesión o tus permisos no permiten esta operación. Vuelve a verificar el acceso.'
    default: return 'No pudimos completar la operación. Verifica tu conexión e inténtalo nuevamente.'
  }
}
function formNumber(value: string): number | null {
  if (!value.trim()) return null
  const num = Number(value)
  if (!/^\d+$/.test(value.trim()) || !Number.isSafeInteger(num)) return Number.NaN
  return num
}
export function Cp03PilotDirectoryView({
  repository, role, workshopName, draftScope
}: {
  repository: PilotDirectoryPort
  role: Role
  workshopName: string
  draftScope?: DraftScope
}) {
  const writable = role === 'owner' || role === 'admin' || role === 'reception'
  const [initialDraft] = useState(() => writable && draftScope ? readCp03Draft(draftScope) : null)
  const editorRef = useRef<HTMLElement>(null)
  const [draftAvailable, setDraftAvailable] = useState(!!initialDraft)
  const [draftRestored, setDraftRestored] = useState(!!initialDraft)
  const requestId = useRef(0)
  const savingLock = useRef(false)
  const active = useRef(true)
  const [recent, setRecent] = useState<CustomerRecord[]>([])
  const [matches, setMatches] = useState<{
    customers: CustomerRecord[]; vehicles: VehicleRecord[]
  } | null>(null)
  const [term, setTerm] = useState('')
  const [customer, setCustomer] = useState<CustomerRecord | null>(null)
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([])
  const [vehicle, setVehicle] = useState<VehicleRecord | null>(null)
  const [editor, setEditor] = useState<Editor>(initialDraft?.editor === 'new-customer' ? 'new-customer' : null)
  const [customerDraft, setCustomerDraft] = useState<CustomerInput>(() => initialDraft?.customerDraft ?? {...emptyCustomer})
  const [vehicleDraft, setVehicleDraft] = useState<VehicleDraft>(() => initialDraft?.vehicleDraft ?? {...emptyVehicle})
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [notice, setNotice] = useState('')

  // Save each form change to the same-tab temporary draft, not Supabase.
  // React flushes these updates on input changes, before focus can trigger R1
  // revalidation and temporarily unmount this component.
  useEffect(() => {
    if (!draftScope || !writable || !editor) return
    if (editor !== 'new-customer' && !customer) return
    const payload:Cp03Draft={
      editor,
      customerId:editor === 'new-customer' ? null : customer?.id ?? null,
      vehicleId:editor === 'edit-vehicle' ? vehicle?.id ?? null : null,
      expectedUpdatedAt:editor === 'edit-customer' ? customer?.updated_at ?? null :
        editor === 'edit-vehicle' ? vehicle?.updated_at ?? null : null,
      customerDraft:{
        full_name:customerDraft.full_name,
        email:customerDraft.email ?? '',
        mobile_e164:customerDraft.mobile_e164 ?? '',
        notes:customerDraft.notes ?? ''
      },
      vehicleDraft:{...vehicleDraft}
    }
    if (writeCp03Draft(draftScope,payload)) setDraftAvailable(true)
  },[draftScope?.userId,draftScope?.workshopId,writable,editor,
    customer?.id,customer?.updated_at,vehicle?.id,vehicle?.updated_at,
    customerDraft,vehicleDraft])

  useEffect(() => {
    active.current = true
    let cancelled = false
    const index = ++requestId.current
    setLoading(true)
    void repository.recentCustomers().then((rows) => {
      if (!cancelled && active.current && requestId.current === index) setRecent(rows)
    }).catch(error => {
      if (!cancelled && active.current && requestId.current === index)
        setMessage(cp03Message(error))
    }).finally(() => {
      if (!cancelled && active.current && requestId.current === index) {
        setLoading(false)
        if (initialDraft && initialDraft.editor !== 'new-customer')
          void reopenDraft(initialDraft)
      }
    })
    return () => {
      cancelled = true
      active.current = false
      requestId.current++
      // The Auth owner disposes the repository on session changes. Only the
      // scoped draft remains, never results or customer objects.
    }
  }, [repository])

  useEffect(() => {
    if (draftRestored && editor) editorRef.current?.scrollIntoView({block:'nearest'})
  }, [draftRestored,editor])

  async function reopenDraft(draft:Cp03Draft) {
    if (!draftScope || !writable) return
    if (draft.editor === 'new-customer') {
      setCustomerDraft(draft.customerDraft)
      setVehicleDraft(draft.vehicleDraft)
      setConfirmed(false)
      setEditor(draft.editor)
      setDraftRestored(true)
      return
    }
    if (!draft.customerId) return
    const index=++requestId.current
    setLoading(true)
    setMessage('')
    try {
      const owner=await repository.getCustomer(draft.customerId)
      if (!owner) throw new DirectoryFailure('unavailable')
      const list=await repository.vehiclesForCustomer(owner.id)
      const selected=draft.editor === 'edit-vehicle'
        ? await repository.getVehicle(draft.vehicleId ?? '') : null
      if (draft.editor === 'edit-vehicle' &&
          (!selected || selected.customer_id !== owner.id))
        throw new DirectoryFailure('unavailable')
      if ((draft.editor === 'edit-customer' && owner.updated_at !== draft.expectedUpdatedAt) ||
          (draft.editor === 'edit-vehicle' && selected?.updated_at !== draft.expectedUpdatedAt))
        throw new DirectoryFailure('conflict')
      if (!active.current || index!==requestId.current) return
      setCustomer(owner)
      setVehicles(list)
      setVehicle(selected)
      setMatches(null)
      setCustomerDraft(draft.customerDraft)
      setVehicleDraft(draft.vehicleDraft)
      setConfirmed(false)
      setEditor(draft.editor)
      setDraftRestored(true)
    } catch(error) {
      if (active.current && index===requestId.current) {
        setMessage(error instanceof DirectoryFailure && error.kind === 'conflict'
          ? 'La ficha cambió mientras estabas fuera. El borrador sigue disponible; revisa los cambios antes de continuar.'
          : 'No pudimos recuperar todavía la ficha asociada al borrador. El borrador no se ha borrado.')
      }
    } finally {
      if (active.current && index===requestId.current) setLoading(false)
    }
  }

  async function loadCustomer(id: string) {
    const index = ++requestId.current
    setLoading(true)
    setMessage('')
    setNotice('')
    setEditor(null)
    try {
      const row = await repository.getCustomer(id)
      if (!row) throw new DirectoryFailure('unavailable')
      const list = await repository.vehiclesForCustomer(id)
      if (!active.current || index !== requestId.current) return
      setCustomer(row)
      setVehicles(list)
      setVehicle(null)
      setMatches(null)
    } catch (error) {
      if (active.current && index === requestId.current) setMessage(cp03Message(error))
    } finally {
      if (active.current && index === requestId.current) setLoading(false)
    }
  }
  async function loadVehicle(id: string) {
    const index = ++requestId.current
    setLoading(true)
    setMessage('')
    setNotice('')
    setEditor(null)
    try {
      const row = await repository.getVehicle(id)
      if (!row) throw new DirectoryFailure('unavailable')
      const owner = await repository.getCustomer(row.customer_id)
      if (!owner) throw new DirectoryFailure('unavailable')
      const list = await repository.vehiclesForCustomer(owner.id)
      if (!active.current || index !== requestId.current) return
      setCustomer(owner)
      setVehicles(list)
      setVehicle(row)
      setMatches(null)
    } catch (error) {
      if (active.current && index === requestId.current) setMessage(cp03Message(error))
    } finally {
      if (active.current && index === requestId.current) setLoading(false)
    }
  }
  async function search(event: FormEvent) {
    event.preventDefault()
    const index = ++requestId.current
    setMessage('')
    setNotice('')
    setMatches(null)
    setLoading(true)
    try {
      const result = await repository.search(term)
      if (!active.current || index !== requestId.current) return
      setMatches(result)
      setCustomer(null)
      setVehicle(null)
      setVehicles([])
      setEditor(null)
    } catch (error) {
      if (active.current && index === requestId.current) setMessage(cp03Message(error))
    } finally {
      if (active.current && index === requestId.current) setLoading(false)
    }
  }
  function startCustomer(edit: boolean) {
    if (draftScope && draftAvailable && !window.confirm(
      'Hay un borrador pendiente. ¿Quieres descartarlo y abrir otro formulario?')) return
    if (draftScope && draftAvailable) clearCp03Draft()
    setDraftAvailable(false)
    setDraftRestored(false)
    setMessage(''); setNotice('')
    if (edit && !customer) return
    setEditor(edit ? 'edit-customer' : 'new-customer')
    setConfirmed(false)
    setCustomerDraft(edit && customer
      ? { full_name:customer.full_name,email:customer.email,
        mobile_e164:customer.mobile_e164,notes:customer.notes }
      : {...emptyCustomer})
  }
  function startVehicle(edit: boolean) {
    if (draftScope && draftAvailable && !window.confirm(
      'Hay un borrador pendiente. ¿Quieres descartarlo y abrir otro formulario?')) return
    if (draftScope && draftAvailable) clearCp03Draft()
    setDraftAvailable(false)
    setDraftRestored(false)
    setMessage(''); setNotice('')
    if (!customer || (edit && !vehicle)) return
    setEditor(edit ? 'edit-vehicle' : 'new-vehicle')
    setVehicleDraft(edit && vehicle
      ? {plate:vehicle.plate ?? '',make:vehicle.make,model:vehicle.model,
        model_year:vehicle.model_year === null ? '' : String(vehicle.model_year),
        odometer_km:vehicle.odometer_km === null ? '' : String(vehicle.odometer_km)}
      : {...emptyVehicle})
  }
  async function saveCustomer(event: FormEvent) {
    event.preventDefault()
    if (!writable || savingLock.current) return
    if (editor === 'new-customer' && !confirmed) {
      setMessage('Confirma que tienes autorización para registrar los datos del cliente.')
      return
    }
    savingLock.current = true
    setSaving(true)
    setMessage('')
    setNotice('')
    try {
      const input = customerPayload(customerDraft)
      // Do not silently merge same-name customers. If an exact email already
      // appears, require the operator to select the existing customer.
      if (editor === 'new-customer' && input.email) {
        const found = await repository.search(input.email)
        if (found.customers.some(row => row.email === input.email)) {
          throw new DirectoryFailure('conflict')
        }
      }
      const saved = editor === 'edit-customer' && customer
        ? await repository.updateCustomer(customer.id,customer.updated_at,input)
        : await repository.createCustomer(input)
      // A successful server response is the authoritative commit. A later
      // list-refresh failure must never offer to re-submit the same draft.
      clearCp03Draft(); setDraftAvailable(false); setDraftRestored(false)
      if (!active.current) return
      const list = await repository.vehiclesForCustomer(saved.id)
      if (!active.current) return
      setCustomer(saved)
      setVehicles(list)
      setVehicle(null)
      setMatches(null)
      setEditor(null)
      setNotice('Ficha confirmada por el servidor.')
      const rows = await repository.recentCustomers()
      if (active.current) setRecent(rows)
    } catch (error) {
      if (active.current) {
        if (error instanceof DirectoryFailure && error.kind === 'conflict' &&
            editor === 'new-customer')
          setMessage('Ya existe una ficha con ese correo. Búscala antes de crear otra.')
        else setMessage(cp03Message(error))
      }
    } finally {
      savingLock.current = false
      if (active.current) setSaving(false)
    }
  }
  async function saveVehicle(event: FormEvent) {
    event.preventDefault()
    if (!writable || savingLock.current || !customer) return
    savingLock.current = true
    setSaving(true)
    setMessage('')
    setNotice('')
    try {
      const input = vehiclePayload({...vehicleDraft,customer_id:customer.id,
        model_year:formNumber(vehicleDraft.model_year),
        odometer_km:formNumber(vehicleDraft.odometer_km)})
      const saved = editor === 'edit-vehicle' && vehicle
        ? await repository.updateVehicle(vehicle.id,vehicle.updated_at,input)
        : await repository.createVehicle(input)
      clearCp03Draft(); setDraftAvailable(false); setDraftRestored(false)
      if (!active.current) return
      const list = await repository.vehiclesForCustomer(customer.id)
      if (!active.current) return
      setVehicles(list)
      setVehicle(saved)
      setEditor(null)
      setNotice('Vehículo confirmado por el servidor.')
    } catch(error) {
      if (active.current) setMessage(cp03Message(error))
    } finally {
      savingLock.current = false
      if (active.current) setSaving(false)
    }
  }

  return (
    <div className="official-panel cp03-pilot">
      <section className="welcome-area">
        <div className="welcome-head">
          <div>
            <span className="official-eyebrow">Directorio del taller</span>
            <h1>Clientes y vehículos</h1>
            <p>Fichas vinculadas a {workshopName}. Busca primero para evitar duplicados.</p>
          </div>
        </div>
      </section>
      <section className="dashboard-card cp03-panel" aria-label="Buscar clientes y vehículos">
        <form className="cp03-search" onSubmit={search}>
          <label htmlFor="cp03-search-input">Buscar por nombre, teléfono, correo o patente</label>
          <div className="cp03-inline">
            <input id="cp03-search-input" value={term} onChange={e=>setTerm(e.target.value)}
              placeholder="Ej.: AB-1234 o nombre del cliente" maxLength={80} minLength={2}
              autoComplete="off" required/>
            <button className="cp03-primary" type="submit" disabled={loading || saving}>
              <Search size={18}/> Buscar
            </button>
          </div>
        </form>
        {writable && <button type="button" className="cp03-secondary" disabled={loading || saving}
          onClick={()=>startCustomer(false)}><Plus size={18}/> Nuevo cliente</button>}
        {writable && draftAvailable && !editor && draftScope && <>
          <button type="button" className="cp03-secondary" disabled={loading || saving}
            onClick={()=>{const draft=readCp03Draft(draftScope); if(draft) void reopenDraft(draft)
              else setDraftAvailable(false)}}>Retomar borrador pendiente</button>
          <button type="button" className="cp03-secondary" disabled={saving}
            onClick={()=>{clearCp03Draft(); setDraftAvailable(false);setDraftRestored(false);
              setNotice('Borrador descartado.')}}>Descartar borrador</button>
        </>}
      </section>
      <p className="cp03-status" role="status" aria-live="polite">
        {loading ? 'Consultando las fichas autorizadas…' : notice || (matches ? 'Búsqueda completada.' : 'Selecciona una ficha para continuar.')}
      </p>
      {message && <p className="cp03-error" role="alert">{message}</p>}
      <div className="cp03-layout">
        <section className="dashboard-card cp03-panel" aria-label="Listado de clientes">
          <h2><UsersRound size={20}/> {matches ? 'Resultados de la búsqueda' : 'Clientes recientes'}</h2>
          {matches?.customers.length === 0 && matches.vehicles.length === 0 &&
            <p>No encontramos coincidencias. Comprueba el dato antes de registrar una nueva ficha.</p>}
          {(matches?.customers ?? recent).map(row=>(
            <button type="button" key={row.id} className="cp03-result"
              disabled={loading || saving} onClick={()=>void loadCustomer(row.id)}>
              <strong>{row.full_name}</strong>
              <small>{row.mobile_e164 ?? 'Sin teléfono'} · {row.email ?? 'Sin correo'}</small>
            </button>
          ))}
          {matches?.vehicles.map(row=>(
            <button type="button" key={row.id} className="cp03-result"
              disabled={loading || saving} onClick={()=>void loadVehicle(row.id)}>
              <strong><CarFront size={17}/> {row.plate ?? 'Sin patente'}</strong>
              <small>{row.make} {row.model} · Ver ficha del propietario registrado</small>
            </button>
          ))}
          {!matches && !loading && recent.length === 0 &&
            <p>Todavía no hay clientes registrados en este taller.</p>}
        </section>
        <section className="dashboard-card cp03-panel" aria-label="Ficha seleccionada">
          {customer ? <>
            <h2>{customer.full_name}</h2>
            <p>{customer.mobile_e164 ?? 'Sin teléfono'} · {customer.email ?? 'Sin correo'}</p>
            <div className="cp03-inline">
              {writable && <button className="cp03-secondary" type="button" disabled={saving}
                onClick={()=>startCustomer(true)}><Pencil size={17}/> Editar cliente</button>}
              {writable && <button className="cp03-secondary" type="button" disabled={saving}
                onClick={()=>startVehicle(false)}><Plus size={17}/> Agregar vehículo</button>}
            </div>
            <h3>Vehículos vinculados</h3>
            {vehicles.length===0 && <p>No hay vehículos vinculados a esta ficha.</p>}
            {vehicles.map(row=>(
              <button type="button" className="cp03-result" key={row.id}
                onClick={()=>{setVehicle(row);setEditor(null);setNotice('')}} disabled={saving}>
                <strong>{row.plate ?? 'Sin patente'} · {row.make} {row.model}</strong>
                <small>{row.odometer_km === null ? 'Kilometraje no registrado' :
                  row.odometer_km.toLocaleString('es-CL')+' km'}</small>
              </button>
            ))}
            {vehicle && <div className="cp03-vehicle">
              <h3>Vehículo seleccionado</h3>
              <p>{vehicle.make} {vehicle.model} · {vehicle.plate ?? 'Sin patente'}</p>
              <p>{vehicle.model_year ?? 'Año no indicado'} · {vehicle.odometer_km === null ?
                'Kilometraje no indicado' : vehicle.odometer_km.toLocaleString('es-CL')+' km'}</p>
              {writable && <button className="cp03-secondary" type="button" disabled={saving}
                onClick={()=>startVehicle(true)}><Pencil size={17}/> Editar vehículo</button>}
            </div>}
          </> : <div className="cp03-unselected">
            <CarFront size={40}/>
            <h2>Selecciona un cliente o vehículo</h2>
            <p>Podrás consultar su ficha y los automóviles asociados sin confundir patentes con identidades.</p>
          </div>}
        </section>
      </div>
      {writable && editor && <section ref={editorRef} className="dashboard-card cp03-panel cp03-editor" aria-label="Editar ficha">
        <p className="cp03-wide cp03-draft-note" role="status">
          {draftRestored ? 'Borrador recuperado. ' : ''}
          Borrador temporal en esta pestaña (hasta ${DRAFT_TTL_HOURS} horas).
          Aún no está guardado en Supabase; al guardar la ficha se eliminará el borrador.
        </p>
        <div className="cp03-inline cp03-heading">
          <h2>{editor === 'new-customer' ? 'Registrar cliente' :
            editor === 'edit-customer' ? 'Editar cliente' :
            editor === 'new-vehicle' ? 'Registrar vehículo' : 'Editar vehículo'}</h2>
          <button type="button" className="cp03-secondary" disabled={saving}
            onClick={()=>{setEditor(null);setNotice('Borrador conservado; podrás retomarlo desde esta sección.')}}
            ><ArrowLeft size={17}/> Cerrar formulario</button>
        </div>
        {editor.endsWith('customer') ? (
          <form onSubmit={saveCustomer} className="cp03-form">
            <label>Nombre completo *<input required maxLength={120} value={customerDraft.full_name}
              autoComplete="off" onChange={e=>setCustomerDraft(d=>({...d,full_name:e.target.value}))}/></label>
            <label>Correo electrónico<input type="email" maxLength={254} value={customerDraft.email ?? ''}
              autoComplete="off" onChange={e=>setCustomerDraft(d=>({...d,email:e.target.value}))}/></label>
            <label>Teléfono móvil chileno<input type="tel" maxLength={24} value={customerDraft.mobile_e164 ?? ''}
              autoComplete="off" placeholder="+56 9 1234 5678"
              onChange={e=>setCustomerDraft(d=>({...d,mobile_e164:e.target.value}))}/></label>
            <label className="cp03-wide">Observaciones de contacto (opcional)<textarea rows={3}
              maxLength={1000} value={customerDraft.notes ?? ''}
              onChange={e=>setCustomerDraft(d=>({...d,notes:e.target.value}))}/></label>
            {editor === 'new-customer' && <label className="cp03-wide cp03-check">
              <input type="checkbox" required checked={confirmed}
                onChange={e=>setConfirmed(e.target.checked)}/>
              Confirmo que tengo autorización para registrar los datos del cliente.
            </label>}
            <p className="cp03-wide cp03-hint">Los datos se asociarán únicamente al taller autenticado.
              Esta confirmación todavía no constituye un registro formal de consentimiento.</p>
            <button className="cp03-primary" type="submit" disabled={saving}>
              {saving ? <RefreshCw size={17}/> : <Plus size={17}/>}
              {saving ? 'Guardando…' : 'Guardar ficha de cliente'}
            </button>
          </form>
        ) : (
          <form onSubmit={saveVehicle} className="cp03-form">
            <p className="cp03-wide">Cliente: <strong>{customer?.full_name}</strong></p>
            <label>Patente<input maxLength={14} value={vehicleDraft.plate ?? ''}
              autoComplete="off" placeholder="AB-1234"
              onChange={e=>setVehicleDraft(d=>({...d,plate:e.target.value}))}/></label>
            <label>Marca *<input required maxLength={80} value={vehicleDraft.make}
              onChange={e=>setVehicleDraft(d=>({...d,make:e.target.value}))}/></label>
            <label>Modelo *<input required maxLength={80} value={vehicleDraft.model}
              onChange={e=>setVehicleDraft(d=>({...d,model:e.target.value}))}/></label>
            <label>Año<input type="number" min={1900} max={2100} value={vehicleDraft.model_year ?? ''}
              onChange={e=>setVehicleDraft(d=>({...d,model_year:e.target.value}))}/></label>
            <label>Kilometraje<input type="number" min={0} max={3000000}
              value={vehicleDraft.odometer_km ?? ''}
              onChange={e=>setVehicleDraft(d=>({...d,odometer_km:e.target.value}))}/></label>
            <button className="cp03-primary" type="submit" disabled={saving}>
              {saving ? <RefreshCw size={17}/> : <Plus size={17}/>}
              {saving ? 'Guardando…' : 'Guardar ficha del vehículo'}
            </button>
          </form>
        )}
      </section>}
    </div>
  )
}
