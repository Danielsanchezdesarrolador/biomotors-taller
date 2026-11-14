import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  CarFront,
  ClipboardCheck,
  FileText,
  Printer,
  Save,
  CheckCircle2,
  Wrench
} from 'lucide-react'
import { InformeMultipuntoPreview } from './InformeMultipuntoPreview'
import { AdjuntosDemo } from './AdjuntosDemo'
import {
  categories,
  counts,
  createMultipunto,
  finalizeDemo,
  reportStatus,
  resultLabels,
  setResult,
  validateReport,
  type MultipuntoReport
} from './multipuntoData'
import { discardMultipunto, readMultipunto, rememberMultipunto } from './multipuntoSession'
import './multipunto.css'
export function InformeMultipuntoPanel({
  orderId,
  reportId,
  onBack
}: {
  orderId: string
  reportId?: string
  onBack: () => void
}) {
  const [report, setReport] = useState(() =>
    reportId ? (readMultipunto(reportId) ?? createMultipunto(orderId)) : createMultipunto(orderId)
  )
  const [modal, setModal] = useState<'preview' | 'finish' | 'discard' | null>(null),
    [message, setMessage] = useState(''),
    [error, setError] = useState(''),
    [acceptPending, setAcceptPending] = useState(false)
  const c = counts(report.items),
    validation = validateReport(report)
  useEffect(() => rememberMultipunto(report), [report])
  function update(patch: Partial<MultipuntoReport>) {
    setReport((r) => ({ ...r, ...patch, saved: false, finalized: false, closedWithPending: false }))
    setError('')
    setMessage('')
  }
  function save() {
    setReport((r) => ({ ...r, saved: true }))
    setMessage(
      'Borrador conservado solo en memoria de esta página. Puedes volver desde Nuevo informe → Borradores multipunto. Se pierde al recargar o cerrar la pestaña; no es un respaldo permanente.'
    )
  }
  function finish() {
    try {
      setReport(finalizeDemo(report, acceptPending))
      setModal(null)
      setMessage(
        'Finalizado DEMO en memoria. No se generó ni adjuntó un PDF y no se envió ningún correo. Puedes revisar o imprimir la hoja.'
      )
    } catch (e) {
      setError((e as Error).message)
    }
  }
  return (
    <div className="mp-panel">
      <div className="mp-breadcrumb">
        Informes y cotizaciones <span>›</span> Inspección multipunto
      </div>
      <header className="mp-heading">
        <button className="rp-secondary" aria-label="Volver a informes" onClick={onBack}>
          <ArrowLeft />
        </button>
        <div>
          <h1>
            <FileText /> Informe técnico
          </h1>
          <p>Inspección multipunto del vehículo</p>
        </div>
        <div className="mp-actions">
          <button className="rp-secondary" onClick={save} disabled={report.finalized}>
            <Save /> Guardar borrador
          </button>
          <button className="rp-secondary" onClick={() => setModal('preview')}>
            <FileText /> Vista previa PDF
          </button>
          <button
            className="rp-primary"
            disabled={report.finalized}
            onClick={() => {
              setAcceptPending(false)
              setError('')
              setModal('finish')
            }}
          >
            <CheckCircle2 /> Finalizar inspección DEMO
          </button>
        </div>
      </header>
      <p className="mp-demo">
        DEMO · Datos ficticios. Cambios y fotografías solo en memoria hasta recargar; sin Supabase
        ni correo real.
      </p>
      {message && (
        <p className="mp-message" role="status">
          {message}
        </p>
      )}
      <div className="mp-layout">
        <div className="mp-document-column">
          <nav className="mp-category-nav" aria-label="Categorías de inspección">
            {categories.map((cat) => (
              <a key={cat.id} href={'#mp-' + cat.id}>
                {cat.name}
              </a>
            ))}
          </nav>
          <InformeMultipuntoPreview
            report={report}
            onChange={
              report.finalized
                ? undefined
                : (id, state) => {
                    setReport((r) => setResult(r, id, state))
                    setMessage('')
                  }
            }
          />
          {!report.finalized && (
            <section className="dashboard-card mp-card mp-detail-fields">
              <h2>
                <ClipboardCheck /> Datos de la visita
              </h2>
              <p className="mp-help">
                Cliente y vehículo proceden de {report.orderId}. Completa los datos que no estaban
                disponibles.
              </p>
              <div className="mp-fields">
                {(
                  [
                    ['date', 'Fecha del informe', 'date'],
                    ['visitDate', 'Fecha de visita', 'date'],
                    ['start', 'Hora de inicio', 'time'],
                    ['end', 'Hora de término', 'time'],
                    ['fuel', 'Combustible', 'text'],
                    ['technician', 'Técnico responsable', 'text']
                  ] as const
                ).map(([key, label, type]) => (
                  <label key={key}>
                    {label}
                    <input
                      type={type}
                      maxLength={100}
                      value={report[key]}
                      onChange={(e) => update({ [key]: e.target.value })}
                    />
                  </label>
                ))}
              </div>
              <details>
                <summary>Observación individual por componente (opcional)</summary>
                <p className="mp-help">
                  Hasta 500 caracteres por componente; se incluirán en la hoja.
                </p>
                {categories.map((cat) => (
                  <fieldset key={cat.id}>
                    <legend>{cat.name}</legend>
                    {report.items
                      .filter((i) => i.category === cat.id)
                      .map((item) => (
                        <label key={item.id}>
                          {item.name}
                          <input
                            value={item.note}
                            maxLength={500}
                            onChange={(e) =>
                              update({
                                items: report.items.map((i) =>
                                  i.id === item.id ? { ...i, note: e.target.value } : i
                                )
                              })
                            }
                          />
                        </label>
                      ))}
                  </fieldset>
                ))}
              </details>
            </section>
          )}
        </div>
        <aside className="mp-side">
          <section className="dashboard-card mp-card">
            <h2>
              <FileText /> Resumen del informe
            </h2>
            <dl className="mp-summary">
              {[
                ['Cliente', report.client],
                ['Vehículo', report.vehicle],
                ['Patente', report.plate],
                ['Kilometraje', report.mileage.toLocaleString('es-CL') + ' km'],
                ['Técnico', report.technician || 'Sin completar'],
                ['Estado', reportStatus(report)]
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mp-count" aria-live="polite">
              Ítems revisados:{' '}
              <strong>
                {c.reviewed} de {c.total}
              </strong>
            </p>
            <div className="mp-counts">
              {(['ok', 'attention', 'immediate', 'unreviewed'] as const).map((state) => (
                <span key={state} className={'mp-count-' + state}>
                  {resultLabels[state]} <strong>{c[state]}</strong>
                </span>
              ))}
            </div>
            <p className="mp-help">
              Sin revisar no equivale a OK. El rojo indica una prioridad técnica; no certifica
              seguridad para circular.
            </p>
          </section>
          <section className="dashboard-card mp-card">
            <h2>
              <Wrench /> Observaciones del técnico
            </h2>
            <label className="mp-help" htmlFor="mp-observations">
              Problemas detectados y recomendaciones (hasta 3.000 caracteres).
            </label>
            <textarea
              id="mp-observations"
              rows={5}
              maxLength={3000}
              disabled={report.finalized}
              value={report.observations}
              onChange={(e) => update({ observations: e.target.value })}
            />
            <small>{report.observations.length}/3000</small>
          </section>
          <section className="dashboard-card mp-card mp-reason">
            <h2>
              <CarFront /> Motivo del cliente
            </h2>
            <p>{report.reason}</p>
            <small>
              Antecedente de la OT, separado de los resultados y observaciones del técnico.
            </small>
          </section>
          <AdjuntosDemo
            report={report}
            onChange={(photos) => update({ photos })}
            disabled={report.finalized}
          />
          <section className="dashboard-card mp-card">
            <p className="mp-help">
              PDF directo pendiente. La vista previa reproduce esta misma hoja; puedes imprimir o
              guardar como PDF desde el navegador.
            </p>
            {report.finalized && (
              <button className="rp-secondary" onClick={() => update({})}>
                Reabrir edición DEMO
              </button>
            )}
            <button className="rp-inline" onClick={() => setModal('discard')}>
              Descartar informe temporal
            </button>
          </section>
        </aside>
      </div>
      <div className="mp-print-only">
        <InformeMultipuntoPreview report={report} />
      </div>
      {modal && (
        <dialog
          className={'mp-dialog' + (modal === 'preview' ? ' mp-preview-dialog' : '')}
          aria-label={
            modal === 'preview'
              ? 'Vista previa multipunto'
              : modal === 'finish'
                ? 'Confirmar finalización DEMO'
                : 'Descartar informe'
          }
          ref={(node) => {
            if (node && !node.open) node.showModal()
          }}
          onCancel={() => setModal(null)}
          onClose={() => setModal(null)}
        >
          <div className="mp-modal-tools">
            <h2>
              {modal === 'preview'
                ? 'Vista previa multipunto'
                : modal === 'finish'
                  ? 'Confirmar finalización DEMO'
                  : 'Descartar informe temporal'}
            </h2>
            <button className="rp-secondary" onClick={() => setModal(null)}>
              Cerrar
            </button>
          </div>
          {modal === 'preview' ? (
            <>
              <p className="mp-help">
                Vista HTML actualizada. Descarga PDF directa pendiente; usa la impresión del
                navegador.
              </p>
              <button className="rp-primary" onClick={() => window.print()}>
                <Printer /> Imprimir / guardar como PDF
              </button>
              <div className="mp-preview-scroll">
                <InformeMultipuntoPreview report={report} />
              </div>
            </>
          ) : modal === 'discard' ? (
            <>
              <p>
                Se eliminarán este informe y sus fotografías temporales. La orden original permanece
                intacta.
              </p>
              <button
                className="rp-secondary"
                onClick={() => {
                  discardMultipunto(report.id)
                  onBack()
                }}
              >
                Confirmar descarte
              </button>
            </>
          ) : (
            <>
              <p>
                <strong>
                  {report.id} · {report.orderId}
                </strong>
              </p>
              <p>
                {report.client} · {report.vehicle} · {report.plate}
              </p>
              <p>
                {c.reviewed} revisados · {c.unreviewed} pendientes · {c.immediate} con cambio
                inmediato.
              </p>
              {c.unreviewed > 0 && (
                <>
                  <p>
                    Faltan {c.unreviewed} ítems por revisar. Puedes cerrar este diálogo y continuar
                    la inspección.
                  </p>
                  <label className="mp-pending-confirm">
                    <input
                      type="checkbox"
                      checked={acceptPending}
                      onChange={(e) => setAcceptPending(e.target.checked)}
                    />{' '}
                    Acepto finalizar con {c.unreviewed} pendientes identificados como Sin revisar,
                    sin convertirlos a OK.
                  </label>
                </>
              )}
              <p>Observaciones del técnico: {report.observations || 'Sin observaciones.'}</p>
              {validation.length > 0 && (
                <div className="rp-error">
                  <strong>Antes de finalizar:</strong>
                  <ul>
                    {validation.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                  <p>Vuelve a Datos de la visita para completarlos.</p>
                </div>
              )}
              <p className="mp-demo">
                No se enviará correo ni documento. Solo se registra la finalización DEMO en memoria;
                no se genera un PDF adjunto.
              </p>
              {error && (
                <p className="rp-error" role="alert">
                  {error}
                </p>
              )}
              <button
                className="rp-primary"
                disabled={validation.length > 0 || (c.unreviewed > 0 && !acceptPending)}
                onClick={finish}
              >
                Confirmar finalización DEMO
              </button>
            </>
          )}
        </dialog>
      )}
    </div>
  )
}
