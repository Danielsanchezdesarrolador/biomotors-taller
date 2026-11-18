import { useEffect, useRef, useState, type ComponentType } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Context } from '../auth/controller'
import { workStatusLabel, type Finding } from '../ordenes/cp04Contracts'
import { QuoteFailure, type Revision } from '../cp05/contracts'
import { archivedRevisionPdf } from './archiveDownload'
import { cp04Repository } from '../ordenes/cp04Repository'
import { Cp04OrdersView } from '../ordenes/Cp04OrdersView'
import { historyRepository, type HistoryPort } from './repository'
import {
  HistoryFailure,
  historyMessage,
  resolutionLabel,
  type Cursor,
  type Vehicle,
  type Visit,
  type QuoteHistory
} from './contracts'
import './history.css'
const date = (value: string) =>
  new Date(value).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' })
const money = (value: number) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(value) + ' CLP'
function ExistingOrder({
  client,
  context,
  id,
  onBack
}: {
  client: SupabaseClient
  context: Context
  id: string
  onBack: () => void
}) {
  const [repo, setRepo] = useState<ReturnType<typeof cp04Repository> | null>(null)
  useEffect(() => {
    const r = cp04Repository(client, context)
    setRepo(r)
    return () => r.dispose()
  }, [client, context])
  return (
    <>
      <div className="cp03-pilot">
        <button className="cp03-secondary" onClick={onBack}>
          Volver al historial del vehículo
        </button>
      </div>
      {repo && <Cp04OrdersView repository={repo} context={context} initialOrderId={id} />}
    </>
  )
}
function ExistingQuote({
  client,
  context,
  id,
  onBack
}: {
  client: SupabaseClient
  context: Context
  id: string
  onBack: () => void
}) {
  type Props = {
    repository: import('../cp05/repository').Cp05Port
    context: Context
    initialOrderId: string
    onBack: () => void
  }
  const [loaded, setLoaded] = useState<{
      Panel: ComponentType<Props>
      repo: Props['repository']
    } | null>(null),
    [failed, setFailed] = useState(false)
  useEffect(() => {
    let cancelled = false
    let repo: Props['repository'] | undefined
    if (import.meta.env.VITE_BT_CP05_PRIVATE_ENABLED === 'true')
      void Promise.all([import('../cp05/QuotePanel'), import('../cp05/repository')])
        .then(([ui, data]) => {
          if (cancelled) return
          repo = data.cp05Repository(client, context)
          setLoaded({ Panel: ui.QuotePanel, repo })
        })
        .catch(() => {
          if (!cancelled) setFailed(true)
        })
    return () => {
      cancelled = true
      repo?.dispose()
    }
  }, [client, context])
  return (
    <>
      <div className="cp03-pilot">
        <button className="cp03-secondary" onClick={onBack}>
          Volver al historial del vehículo
        </button>
      </div>
      {failed ? (
        <p role="alert">Cotización no disponible.</p>
      ) : loaded ? (
        <loaded.Panel
          repository={loaded.repo}
          context={context}
          initialOrderId={id}
          onBack={onBack}
        />
      ) : (
        <p role="status">Abriendo cotización autorizada…</p>
      )}
    </>
  )
}
function FindingDetails({ finding: f }: { finding: Finding }) {
  return (
    <li>
      <strong>{f.category}</strong>
      <span>
        {f.result === 'attention'
          ? 'Requiere atención'
          : f.result === 'ok'
            ? 'Correcto'
            : 'No revisado'}
        {f.result === 'attention' ? ' · ' + resolutionLabel(f) : ''}
      </span>
      {f.note && <p>{f.note}</p>}
      <small>
        Registrado: {date(f.created_at)}
        {f.resolution === 'resolved' && f.resolved_at
          ? ' · Resolución: ' + date(f.resolved_at)
          : ''}
      </small>
    </li>
  )
}
export function HistoryView({
  repository,
  vehicleId,
  onBack,
  onOrder,
  onQuote,
  onDownload,
  onAccessLost
}: {
  repository: HistoryPort
  vehicleId: string
  onBack: () => void
  onOrder: (id: string) => void
  onAccessLost?: () => void
  onQuote?: (id: string) => void
  onDownload?: (revision: Revision) => Promise<void>
}) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null),
    [visits, setVisits] = useState<Visit[]>([]),
    [pending, setPending] = useState<Finding[]>([])
  const [quotes, setQuotes] = useState<QuoteHistory>({
    status: 'off',
    quotes: [],
    revisions: [],
    events: []
  })
  const [next, setNext] = useState<Cursor | null>(null),
    [nextPending, setNextPending] = useState<Cursor | null>(null),
    [busy, setBusy] = useState(true),
    [error, setError] = useState(''),
    [retryKind, setRetryKind] = useState<'refresh' | 'visits' | 'pending'>('refresh'),
    [downloading, setDownloading] = useState<string | null>(null),
    [downloadError, setDownloadError] = useState('')
  const active = useRef(true),
    sequence = useRef(0),
    lock = useRef(false)
  function failure(e: unknown) {
    if (e instanceof HistoryFailure && e.kind === 'denied') {
      setVehicle(null)
      setVisits([])
      setPending([])
      setQuotes({ status: 'off', quotes: [], revisions: [], events: [] })
      setNext(null)
      setNextPending(null)
      onAccessLost?.()
    }
    setError(historyMessage(e))
  }
  async function refresh() {
    const request = ++sequence.current
    lock.current = true
    setBusy(true)
    setRetryKind('refresh')
    setError('')
    setVehicle(null)
    setVisits([])
    setPending([])
    setQuotes({ status: 'off', quotes: [], revisions: [], events: [] })
    try {
      const [v, page, issues] = await Promise.all([
        repository.vehicle(vehicleId),
        repository.visits(vehicleId),
        repository.pending(vehicleId)
      ])
      if (!active.current || request !== sequence.current) return
      setVehicle(v)
      setVisits(page.rows)
      setNext(page.next)
      setPending(issues.rows)
      setNextPending(issues.next)
      setQuotes(page.quotes)
    } catch (e) {
      if (active.current && request === sequence.current) failure(e)
    } finally {
      if (active.current && request === sequence.current) {
        lock.current = false
        setBusy(false)
      }
    }
  }
  useEffect(() => {
    active.current = true
    void refresh()
    return () => {
      active.current = false
      sequence.current++
    }
  }, [repository, vehicleId])
  async function more(kind: 'visits' | 'pending') {
    if (lock.current) return
    const cursor = kind === 'visits' ? next : nextPending
    if (!cursor) return
    lock.current = true
    setBusy(true)
    setRetryKind(kind)
    setError('')
    const request = sequence.current
    try {
      if (kind === 'pending') {
        const page = await repository.pending(vehicleId, cursor)
        if (!active.current || request !== sequence.current) return
        setPending((old) => [...old, ...page.rows.filter((f) => !old.some((x) => x.id === f.id))])
        setNextPending(page.next)
      } else {
        const page = await repository.visits(vehicleId, cursor)
        if (!active.current || request !== sequence.current) return
        setVisits((old) => [
          ...old,
          ...page.rows.filter((v) => !old.some((x) => x.order.id === v.order.id))
        ])
        setNext(page.next)
        setQuotes((old) => ({
          status:
            old.status === 'unavailable' || page.quotes.status === 'unavailable'
              ? 'unavailable'
              : page.quotes.status,
          quotes: [...old.quotes, ...page.quotes.quotes],
          revisions: [...old.revisions, ...page.quotes.revisions],
          events: [...old.events, ...page.quotes.events]
        }))
      }
    } catch (e) {
      if (active.current && request === sequence.current) failure(e)
    } finally {
      if (active.current && request === sequence.current) {
        lock.current = false
        setBusy(false)
      }
    }
  }
  async function downloadArchived(revision: Revision) {
    if (!onDownload || downloading) return
    setDownloading(revision.id)
    setDownloadError('')
    try {
      await onDownload(revision)
    } catch (e) {
      if (e instanceof QuoteFailure && e.kind === 'denied') {
        failure(new HistoryFailure('denied'))
      } else {
        setDownloadError('No se pudo recuperar el PDF archivado. Verifica la conexión e inténtalo nuevamente.')
      }
    } finally {
      setDownloading(null)
    }
  }
  return (
    <section className="cp03-pilot cp06-history" aria-label="Historial del vehículo">
      <header>
        <button className="cp03-secondary" onClick={onBack}>
          Volver a la ficha del vehículo
        </button>
        <h1>Historial del vehículo</h1>
        <p>Visitas, inspecciones y observaciones del taller autorizado.</p>
      </header>
      {busy && <p role="status">Consultando historial…</p>}
      {downloadError && <p className="cp06-error" role="alert">{downloadError}</p>}
      {error && (
        <div className="cp06-error" role="alert">
          <p>{error}</p>
          <button
            className="cp03-secondary"
            disabled={busy}
            onClick={() => void (retryKind === 'refresh' ? refresh() : more(retryKind))}
          >
            Reintentar consulta
          </button>
        </div>
      )}
      {vehicle && (
        <>
          <div className="dashboard-card cp06-vehicle">
            <strong>
              {vehicle.plate || 'Sin patente'} · {vehicle.make} {vehicle.model}
            </strong>
            <small>Historial de solo lectura · datos consultados al servidor</small>
            <button className="cp03-secondary" disabled={busy} onClick={() => void refresh()}>
              Actualizar historial
            </button>
          </div>
          <section className="dashboard-card cp06-pending" aria-label="Problemas pendientes">
            <h2>Problemas pendientes</h2>
            <p>
              Observaciones aún pendientes, aunque su orden esté cerrada. No acreditan trabajos
              realizados.
            </p>
            {!pending.length ? (
              <p>No hay problemas pendientes registrados.</p>
            ) : (
              <ul>
                {pending.map((f) => (
                  <li key={f.id}>
                    <strong>{f.category}</strong>
                    <p>{f.note || 'Sin observación escrita'}</p>
                    <small>Observación registrada · {date(f.created_at)}</small>
                    <button className="cp03-secondary" onClick={() => onOrder(f.order_id)}>
                      Abrir OT de origen
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {nextPending && (
              <button
                className="cp03-secondary"
                disabled={busy}
                onClick={() => void more('pending')}
              >
                Mostrar más pendientes
              </button>
            )}
          </section>
          <section aria-label="Cronología de visitas">
            <h2>Visitas registradas</h2>
            <p>
              {visits.length} visitas consultadas{next ? ' · Hay visitas anteriores' : ''}.
              Ordenadas por recepción.
            </p>
            {!visits.length && !busy && (
              <div className="dashboard-card cp06-empty">
                Este vehículo todavía no tiene visitas registradas.
              </div>
            )}
            <ol className="cp06-visits">
              {visits.map(({ order: o, findings }) => (
                <li className="dashboard-card cp06-visit" key={o.id}>
                  <header>
                    <time dateTime={o.opened_at}>{date(o.opened_at)}</time>
                    <span className={'cp06-status cp06-status-' + o.status}>
                      {workStatusLabel[o.status]}
                    </span>
                  </header>
                  <h3>Motivo de ingreso</h3>
                  <p>{o.complaint}</p>
                  <p>
                    Kilometraje de ingreso:{' '}
                    {o.intake_odometer === null
                      ? 'No registrado'
                      : o.intake_odometer.toLocaleString('es-CL') + ' km'}
                  </p>
                  <small>OT {o.id}</small>
                  {o.closed_at && (
                    <p>
                      Cierre de OT: {date(o.closed_at)}. El cierre no acredita una reparación
                      ejecutada.
                    </p>
                  )}
                  <h3>Inspección y observaciones registradas</h3>
                  {findings.length ? (
                    <ul className="cp06-findings">
                      {findings.map((f) => (
                        <FindingDetails key={f.id} finding={f} />
                      ))}
                    </ul>
                  ) : (
                    <p>Sin hallazgos registrados para esta visita.</p>
                  )}
                  {quotes.quotes
                    .filter((q) => q.order_id === o.id)
                    .map((q) => (
                      <section className="cp06-quotes" key={q.id}>
                        <h3>Cotización COT-{String(q.number).padStart(6, '0')}</h3>
                        <p>
                          Estado actual:{' '}
                          {q.status === 'draft'
                            ? 'Borrador'
                            : q.status === 'voided'
                              ? 'Anulada'
                              : 'Emitida'}
                          . Las revisiones históricas conservan su contenido.
                        </p>
                        {quotes.revisions
                          .filter((r) => r.quote_id === q.id)
                          .map((r) => (
                            <article key={r.id}>
                              <strong>
                                Revisión emitida {r.revision} · {date(r.issued_at)}
                              </strong>
                              <p>
                                {r.payload.customer.full_name} ·{' '}
                                {r.payload.vehicle.plate || 'Sin patente'} · Total histórico:{' '}
                                {money(r.payload.totals.total)}
                              </p>
                              {onDownload && (
                                <button
                                  type="button"
                                  className="cp03-secondary"
                                  disabled={!!downloading || busy}
                                  onClick={() => void downloadArchived(r)}
                                >
                                  {downloading === r.id
                                    ? 'Verificando PDF archivado…'
                                    : 'Descargar PDF de esta revisión'}
                                </button>
                              )}
                            </article>
                          ))}
                        {!quotes.revisions.some((r) => r.quote_id === q.id) && (
                          <p>Sin revisiones emitidas disponibles.</p>
                        )}
                        {quotes.events
                          .filter((e) => e.quote_id === q.id)
                          .map((e) => (
                            <p key={e.id}>
                              {e.kind === 'voided' ? 'Anulación' : 'Nueva revisión'} ·{' '}
                              {date(e.created_at)} · {e.reason}
                            </p>
                          ))}
                        {onQuote && (
                          <button className="cp03-secondary" onClick={() => onQuote(o.id)}>
                            Abrir cotización y revisiones
                          </button>
                        )}
                      </section>
                    ))}
                  <button className="cp03-secondary" onClick={() => onOrder(o.id)}>
                    Abrir orden de trabajo
                  </button>
                </li>
              ))}
            </ol>
            {next && (
              <button className="cp03-primary" disabled={busy} onClick={() => void more('visits')}>
                Mostrar más visitas
              </button>
            )}
          </section>
          <p className="cp06-note">
            {quotes.status === 'off'
              ? 'Cotizaciones no habilitadas. Este historial consulta únicamente visitas e inspecciones.'
              : quotes.status === 'unavailable'
                ? 'Las cotizaciones no están disponibles. El historial de visitas e inspecciones sigue disponible.'
                : 'Cotizaciones consultadas: borradores y revisiones emitidas se muestran por separado.'}
          </p>
        </>
      )}
    </section>
  )
}
export function VehicleHistory({
  client,
  context,
  vehicleId,
  onBack,
  onAccessLost
}: {
  client: SupabaseClient
  context: Context
  vehicleId: string
  onAccessLost?: () => void
  onBack: () => void
}) {
  const [repository, setRepository] = useState<HistoryPort | null>(null),
    [document, setDocument] = useState<{ kind: 'order' | 'quote'; id: string } | null>(null),
    [archive, setArchive] = useState<{
      scope: string
      port: Pick<ReturnType<typeof import('../cp05/documentClient').documentClient>, 'download' | 'dispose'>
    } | null>(null)
  const scope = context.userId + ':' + context.workshop.id + ':' + context.role
  useEffect(() => {
    const repo = historyRepository(client, context, {
      cp05Enabled: import.meta.env.VITE_BT_CP05_PRIVATE_ENABLED === 'true'
    })
    setRepository(repo)
    return () => repo.dispose()
  }, [client, context])
  useEffect(() => {
    // Dynamic import is allowed only when both CP05 private history and
    // the archive's independent rollout gate are enabled.
    if (import.meta.env.VITE_BT_CP05_PRIVATE_ENABLED !== 'true' ||
        import.meta.env.VITE_BT_CP05_DOCUMENTS_ENABLED !== 'true') return
    let cancelled = false
    let port: ReturnType<typeof import('../cp05/documentClient').documentClient> | null = null
    void import('../cp05/documentClient')
      .then(({ documentClient }) => {
        if (cancelled) return
        port = documentClient(client, context, { archive: true, email: false })
        setArchive({ scope, port })
      })
      .catch(() => { if (!cancelled) setArchive(null) })
    return () => { cancelled = true; port?.dispose() }
  }, [client, context, scope])
  return (
    <>
      {/* Keep the verified history mounted while opening an OT or quotation:
          returning to the vehicle must not lose loaded pages or scroll context. */}
      <div hidden={document !== null}>
        {repository ? (
          <HistoryView
            onAccessLost={onAccessLost}
            repository={repository}
            vehicleId={vehicleId}
            onDownload={archive?.scope === scope ? async (revision) => {
              const { downloadPdf } = await import('../cp05/pdf')
              await archivedRevisionPdf(
                revision, vehicleId, context.workshop.id, archive.port, downloadPdf
              )
            } : undefined}
            onBack={onBack}
            onOrder={(id) => setDocument({ kind: 'order', id })}
            onQuote={
              import.meta.env.VITE_BT_CP05_PRIVATE_ENABLED === 'true'
                ? (id) => setDocument({ kind: 'quote', id })
                : undefined
            }
          />
        ) : (
          <p role="status">Preparando historial autorizado…</p>
        )}
      </div>
      {document?.kind === 'order' && (
        <ExistingOrder
          client={client}
          context={context}
          id={document.id}
          onBack={() => setDocument(null)}
        />
      )}
      {document?.kind === 'quote' &&
        import.meta.env.VITE_BT_CP05_PRIVATE_ENABLED === 'true' && (
        <ExistingQuote
          client={client}
          context={context}
          id={document.id}
          onBack={() => setDocument(null)}
        />
      )}
    </>
  )
}
