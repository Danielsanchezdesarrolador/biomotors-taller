import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CarFront,
  Check,
  ClipboardList,
  Search,
  UserRound
} from 'lucide-react'
import {
  demoClients,
  demoVehicles,
  searchClients,
  vehiclesForClient
} from '../clientes/clientesData'
import { sessionRequests } from '../clientes/intakeSession'
import { validateReception, type ReceptionInput } from '../clientes/directorySession'
import { validateVisitaStep, type VisitaDraft } from '../clientes/registroVisitaData'
import { receiveVisit } from './flowSession'
import { clearReceptionDraft, initialReception, saveReceptionDraft } from './receptionDraft'
export function ReceptionWizard({
  requestId,
  onBack,
  onComplete
}: {
  requestId?: string
  onBack: () => void
  onComplete: (id: string) => void
}) {
  const [state, setState] = useState(() => initialReception(requestId)),
    [query, setQuery] = useState(''),
    [errors, setErrors] = useState<string[]>([]),
    [requestPicker, setRequestPicker] = useState(!!requestId),
    [busy, setBusy] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => saveReceptionDraft(state), [state])
  useEffect(() => {
    heading.current?.focus()
    heading.current?.scrollIntoView({ block: 'start' })
  }, [state.step])
  const client = demoClients.find((c) => c.id === state.clientId),
    vehicles = client ? vehiclesForClient(client.id) : [],
    vehicle = demoVehicles.find((v) => v.id === state.vehicleId)
  const input: ReceptionInput = {
    clientId: state.clientMode === 'existing' ? state.clientId : undefined,
    vehicleId: !state.newVehicle ? state.vehicleId : undefined,
    draft: state.draft,
    date: state.date,
    requestId: state.requestId
  }
  const change = (key: keyof VisitaDraft, value: string | boolean) => {
    setState((s) => ({ ...s, draft: { ...s.draft, [key]: value } }))
    setErrors([])
  }
  function pickClient(id: string) {
    const c = demoClients.find((c) => c.id === id),
      v = c ? vehiclesForClient(c.id)[0] : undefined
    setState((s) => ({
      ...s,
      clientId: id,
      vehicleId: v?.id ?? '',
      newVehicle: !v,
      draft: {
        ...s.draft,
        ...(c
          ? { name: c.name, email: c.email, phone: c.phone, address: c.address, commune: c.commune }
          : {}),
        mileage: v ? String(v.mileage) : s.draft.mileage
      }
    }))
    setErrors([])
  }
  function next() {
    let messages: string[] = []
    if (state.step === 1) {
      if (state.clientMode === 'existing' && !client)
        messages.push('Selecciona un cliente existente o registra uno nuevo DEMO.')
      if (state.clientMode === 'new')
        messages.push(...Object.values(validateVisitaStep({ ...state.draft, consent: true }, 1)))
      if (!state.newVehicle && !vehicle) messages.push('Selecciona un vehículo del cliente.')
      if (state.newVehicle)
        messages.push(...Object.values(validateVisitaStep({ ...state.draft, mileage: '0' }, 2)))
    } else messages = validateReception(input)
    setErrors(messages)
    if (!messages.length) setState((s) => ({ ...s, step: (s.step + 1) as 2 | 3 }))
  }
  function finish() {
    setErrors([])
    setBusy(true)
    try {
      const visit = receiveVisit(input, state.key)
      clearReceptionDraft(state.requestId)
      onComplete(visit.id)
    } catch (error) {
      setErrors([(error as Error).message])
      setBusy(false)
    }
  }
  return (
    <section className="fl-wizard">
      <header className="fl-heading">
        <button
          className="rp-secondary"
          aria-label="Volver sin perder la recepción"
          onClick={onBack}
        >
          <ArrowLeft />
        </button>
        <span className="fl-heading-icon">
          <CarFront />
        </span>
        <div>
          <h1>Nuevo ingreso de vehículo</h1>
          <p>Los antecedentes se reutilizan en la visita, la OT y sus documentos.</p>
        </div>
      </header>
      <p className="fl-memory">
        DEMO · Solo datos ficticios. El borrador se conserva al navegar; recargar o cerrar esta
        pestaña lo descarta. Aún no se crea una OT.
      </p>
      <div className="fl-wizard-layout">
        <ol className="fl-wizard-steps">
          {['Cliente y vehículo', 'Motivo e ingreso', 'Revisar recepción'].map((label, i) => (
            <li
              key={label}
              className={state.step === i + 1 ? 'active' : state.step > i + 1 ? 'done' : ''}
            >
              <span>{state.step > i + 1 ? <Check /> : i + 1}</span>
              <div>
                <strong>{label}</strong>
                <small>
                  {i === 0
                    ? 'Ficha nueva o existente'
                    : i === 1
                      ? 'Antecedente del cliente'
                      : 'Confirmación humana'}
                </small>
              </div>
            </li>
          ))}
        </ol>
        <div className="dashboard-card fl-wizard-card">
          <h2 tabIndex={-1} ref={heading}>
            Paso {state.step} de 3 ·{' '}
            {['Cliente y vehículo', 'Motivo e ingreso', 'Revisar recepción'][state.step - 1]}
          </h2>
          {state.step === 1 ? (
            <>
              <h3>
                <UserRound />
                ¿El cliente ya está registrado?
              </h3>
              <div className="fl-choice">
                <button
                  aria-pressed={state.clientMode === 'existing'}
                  onClick={() => {
                    setState((s) => ({ ...s, clientMode: 'existing' }))
                    setErrors([])
                  }}
                >
                  Buscar cliente existente
                </button>
                <button
                  aria-pressed={state.clientMode === 'new'}
                  onClick={() => {
                    setState((s) => ({
                      ...s,
                      clientMode: 'new',
                      clientId: '',
                      vehicleId: '',
                      newVehicle: true
                    }))
                    setErrors([])
                  }}
                >
                  Registrar cliente nuevo DEMO
                </button>
                <button
                  aria-pressed={requestPicker}
                  onClick={() => setRequestPicker(!requestPicker)}
                >
                  Revisar solicitud pendiente
                </button>
              </div>
              {requestPicker && (
                <label>
                  Solicitud BT-REG-02
                  <select
                    aria-label="Solicitud BT-REG-02"
                    value={state.requestId ?? ''}
                    onChange={(e) => {
                      setState(initialReception(e.target.value))
                      setErrors([])
                    }}
                  >
                    <option value="">Selecciona antecedentes</option>
                    {sessionRequests().map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} · {r.vehicle}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {state.requestId && (
                <p className="fl-notice">
                  Antecedentes de {state.requestId}. Revisa y confirma los datos; no se crea una OT
                  automáticamente.{' '}
                  {sessionRequests().find((r) => r.id === state.requestId)?.details
                    ? 'Los campos originales están precargados.'
                    : 'Esta muestra histórica no conserva contacto completo: complétalo con datos ficticios o selecciona una ficha existente.'}
                </p>
              )}
              {state.clientMode === 'existing' ? (
                <>
                  <label>
                    <Search />
                    Buscar cliente
                    <input
                      aria-label="Buscar cliente del ingreso"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Nombre, teléfono o correo DEMO"
                    />
                  </label>
                  <label>
                    Cliente registrado
                    <select
                      aria-label="Cliente registrado"
                      value={state.clientId}
                      onChange={(e) => pickClient(e.target.value)}
                    >
                      <option value="">Selecciona una ficha</option>
                      {searchClients(demoClients, query, 'Todos').map((c) => (
                        <option value={c.id} key={c.id}>
                          {c.name} · {c.email}
                        </option>
                      ))}
                    </select>
                  </label>
                  {client && (
                    <div className="fl-contact">
                      <strong>{client.name}</strong>
                      <span>
                        {client.phone} · {client.email}
                      </span>
                      <small>
                        Ficha DEMO seleccionada por ID; sin volver a escribir sus datos.
                      </small>
                    </div>
                  )}
                </>
              ) : (
                <div className="fl-fields">
                  {(
                    [
                      ['name', 'Nombre completo DEMO', 'text'],
                      ['phone', 'Teléfono DEMO', 'tel'],
                      ['email', 'Correo DEMO', 'email'],
                      ['commune', 'Comuna (opcional)', 'text'],
                      ['address', 'Dirección (opcional)', 'text']
                    ] as const
                  ).map(([key, label, type]) => (
                    <label key={key}>
                      {label}
                      <input
                        aria-label={label}
                        type={type}
                        maxLength={120}
                        autoComplete="off"
                        value={state.draft[key]}
                        onChange={(e) => change(key, e.target.value)}
                        placeholder={
                          key === 'email'
                            ? 'cliente@example.com'
                            : key === 'phone'
                              ? '+56 9 0000 0090'
                              : undefined
                        }
                      />
                    </label>
                  ))}
                </div>
              )}
              <h3>
                <CarFront />
                Datos del vehículo
              </h3>
              {state.clientMode === 'existing' && client && (
                <div className="fl-choice">
                  <button
                    aria-pressed={!state.newVehicle}
                    onClick={() =>
                      setState((s) => ({
                        ...s,
                        newVehicle: false,
                        vehicleId: vehicles[0]?.id ?? ''
                      }))
                    }
                  >
                    Seleccionar vehículo existente
                  </button>
                  <button
                    aria-pressed={state.newVehicle}
                    onClick={() => setState((s) => ({ ...s, newVehicle: true, vehicleId: '' }))}
                  >
                    Registrar otro vehículo DEMO
                  </button>
                </div>
              )}
              {!state.newVehicle ? (
                <label>
                  Vehículo del cliente
                  <select
                    aria-label="Vehículo del cliente"
                    value={state.vehicleId}
                    onChange={(e) => {
                      const v = vehicles.find((v) => v.id === e.target.value)
                      setState((s) => ({
                        ...s,
                        vehicleId: v?.id ?? '',
                        draft: { ...s.draft, mileage: v ? String(v.mileage) : '' }
                      }))
                    }}
                  >
                    <option value="">Selecciona el vehículo</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.description} · {v.plate}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <div className="fl-fields fl-vehicle-fields">
                  {(
                    [
                      ['brand', 'Marca DEMO', 'text'],
                      ['model', 'Modelo DEMO', 'text'],
                      ['year', 'Año', 'number'],
                      ['plate', 'Patente (opcional)', 'text']
                    ] as const
                  ).map(([key, label, type]) => (
                    <label key={key}>
                      {label}
                      <input
                        aria-label={label}
                        type={type}
                        maxLength={key === 'plate' ? 10 : 70}
                        inputMode={type === 'number' ? 'numeric' : undefined}
                        value={state.draft[key]}
                        onChange={(e) => change(key, e.target.value)}
                      />
                    </label>
                  ))}
                </div>
              )}
              <p className="fl-help">
                La patente no acredita propiedad ni autoriza acceso a un vehículo. Confirma la
                relación con el cliente seleccionado.
              </p>
            </>
          ) : state.step === 2 ? (
            <>
              <div className="fl-contact">
                <strong>{client?.name ?? state.draft.name}</strong>
                <span>
                  {vehicle?.description ??
                    `${state.draft.brand} ${state.draft.model} · ${state.draft.year}`}
                </span>
              </div>
              <div className="fl-fields">
                <label>
                  Fecha de ingreso
                  <input
                    aria-label="Fecha de ingreso de la visita"
                    type="date"
                    value={state.date}
                    onChange={(e) => setState((s) => ({ ...s, date: e.target.value }))}
                  />
                </label>
                <label>
                  Kilometraje actual
                  <input
                    aria-label="Kilometraje actual del ingreso"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="2000000"
                    value={state.draft.mileage}
                    onChange={(e) => change('mileage', e.target.value)}
                  />
                </label>
              </div>
              <label>
                Motivo declarado por el cliente
                <textarea
                  aria-label="Motivo declarado por el cliente"
                  rows={4}
                  maxLength={500}
                  value={state.draft.clientReportedReason}
                  onChange={(e) => change('clientReportedReason', e.target.value)}
                />
              </label>
              <small>
                {state.draft.clientReportedReason.length} / 500 · No es un diagnóstico mecánico.
              </small>
              <label className="fl-consent">
                <input
                  type="checkbox"
                  checked={state.draft.consent}
                  onChange={(e) => change('consent', e.target.checked)}
                />{' '}
                Confirmo que usaré solo datos ficticios y que revisé la relación cliente–vehículo y
                los antecedentes de ingreso.
              </label>
            </>
          ) : (
            <>
              <h3>
                <ClipboardList />
                Revisa antes de confirmar
              </h3>
              <dl className="fl-review">
                {[
                  ['Cliente', client?.name ?? state.draft.name],
                  [
                    'Contacto',
                    client
                      ? `${client.phone} · ${client.email}`
                      : `${state.draft.phone} · ${state.draft.email}`
                  ],
                  [
                    'Vehículo',
                    vehicle?.description ??
                      `${state.draft.brand} ${state.draft.model} · ${state.draft.year}`
                  ],
                  ['Patente', vehicle?.plate ?? (state.draft.plate || 'No indicada')],
                  ['Kilometraje', state.draft.mileage + ' km'],
                  ['Ingreso', state.date],
                  ['Motivo original', state.draft.clientReportedReason]
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="fl-notice">
                Confirmar abre un expediente temporal de recepción. Crear la orden de trabajo
                requiere otra confirmación explícita desde el expediente. No se infieren
                diagnóstico, precios ni trabajos.
              </p>
            </>
          )}
          {errors.length > 0 && (
            <div className="fl-error" role="alert">
              <strong>Revisa estos datos:</strong>
              <ul>
                {errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
          <footer className="fl-form-actions">
            <button className="rp-secondary" onClick={onBack}>
              Guardar borrador y salir
            </button>
            {state.step > 1 && (
              <button
                className="rp-secondary"
                onClick={() => {
                  setErrors([])
                  setState((s) => ({ ...s, step: (s.step - 1) as 1 | 2 }))
                }}
              >
                <ArrowLeft />
                Anterior
              </button>
            )}
            {state.step < 3 ? (
              <button className="rp-primary" onClick={next}>
                Continuar
                <ArrowRight />
              </button>
            ) : (
              <button className="rp-primary" disabled={busy} onClick={finish}>
                Confirmar recepción DEMO
                <Check />
              </button>
            )}
          </footer>
        </div>
      </div>
    </section>
  )
}
