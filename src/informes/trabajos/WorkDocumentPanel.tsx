import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  CalendarDays,
  CarFront,
  Check,
  ClipboardCheck,
  FileText,
  Mail,
  Plus,
  Printer,
  Save,
  Send,
  UserRound,
  Wallet,
  Wrench
} from 'lucide-react'
import { documentContext } from '../documentosData'
import { WorkApprovalCard, WorkDocumentPreview } from './WorkDocumentPreview'
import { WorkQuoteSummary } from './WorkQuoteSummary'
import { WorkItemForm, WorkItemsTable } from './WorkItemsEditor'
import {
  approveWorkDemo,
  attachInspection,
  availableInspections,
  createWorkDocument,
  currency,
  editWorkDocument,
  includedItems,
  loadWorkTemplate,
  localWorkSummary,
  putWorkItem,
  reviewWorkDocument,
  validateWorkDocument,
  workModes,
  workTemplates,
  workTotals,
  type WorkItem,
  type WorkPatch,
  type WorkRequest
} from './trabajosData'
import { discardWorkDocument, readWorkDocument, rememberWorkDocument } from './trabajosSession'
import './trabajos.css'
type Modal =
  | { type: 'item'; item?: WorkItem }
  | { type: 'delete'; item: WorkItem }
  | { type: 'template' }
  | { type: 'preview' }
  | { type: 'share' }
  | { type: 'approve' }
  | { type: 'discard' }
export function WorkDocumentPanel({
  request,
  onBack
}: {
  request: WorkRequest
  onBack: () => void
}) {
  const [doc, setDoc] = useState(() =>
    request.draftId
      ? (readWorkDocument(request.draftId) ?? createWorkDocument(request.orderId, request.mode))
      : createWorkDocument(request.orderId, request.mode)
  )
  const [modal, setModal] = useState<Modal | null>(null),
    [message, setMessage] = useState(''),
    [error, setError] = useState(''),
    [consent, setConsent] = useState(false),
    [template, setTemplate] = useState(workTemplates[0].id)
  useEffect(() => rememberWorkDocument(doc), [doc])
  const { client, vehicle, order } = documentContext(doc),
    totals = workTotals(doc),
    errors = validateWorkDocument(doc),
    inspections = availableInspections(doc)
  const [editorExpanded, setEditorExpanded] = useState(false)
  const editor = useRef<HTMLDivElement>(null)
  const compact = request.compactQuote && doc.mode === 'quote'
  const editorId = 'wt-editor-' + doc.id
  const title = workModes[doc.mode]
  function update(patch: WorkPatch) {
    setDoc((d) => editWorkDocument(d, patch))
    setMessage(
      doc.approval
        ? 'El contenido cambió: la aprobación/finalización simulada anterior fue invalidada. Revisa de nuevo el documento.'
        : ''
    )
    setError('')
  }
  function open(next: Modal) {
    setModal(next)
    setError('')
    setConsent(false)
  }
  function review() {
    try {
      setDoc(reviewWorkDocument(doc))
      setMessage('Documento pendiente de revisión únicamente en memoria DEMO.')
    } catch (e) {
      setMessage((e as Error).message)
    }
  }
  function approve() {
    try {
      setDoc(approveWorkDemo(doc, consent))
      setModal(null)
      setMessage(
        doc.mode === 'quote'
          ? 'Aprobación simulada registrada solo en memoria; sin consentimiento legal ni envío.'
          : 'Informe finalizado solo en memoria DEMO; sin envío ni firma real.'
      )
    } catch (e) {
      setError((e as Error).message)
    }
  }
  async function copySummary() {
    try {
      await navigator.clipboard.writeText(localWorkSummary(doc))
      setMessage(
        'Resumen DEMO copiado al portapapeles local. No se envió información ni se creó un enlace público.'
      )
      setModal(null)
    } catch {
      setError(
        'No se pudo copiar. Puedes seleccionar manualmente el resumen local que aparece abajo.'
      )
    }
  }
  return (
    <div className={'wt-panel' + (compact ? ' wt-guided-quote' : '') + (editorExpanded ? ' wt-editor-expanded' : '')}>
      {compact && <WorkQuoteSummary document={doc} expanded={editorExpanded} editorId={editorId} onToggle={() => {
        setEditorExpanded(!editorExpanded)
        if (!editorExpanded) requestAnimationFrame(() => {
          editor.current?.focus()
          editor.current?.scrollIntoView({ block: 'start' })
        })
      }} />}
      <div className="wt-editor-content" id={editorId} ref={editor} tabIndex={-1}>
      <header className="wt-heading">
        <button
          className="rp-secondary wt-back"
          aria-label="Volver a informes y cotizaciones"
          onClick={onBack}
        >
          <ArrowLeft />
        </button>
        <FileText className="wt-heading-icon" />
        <div>
          <h1>Cotización / Informe de trabajo</h1>
          <p>
            Crea y administra cotizaciones e informes de trabajos mecánicos de manera profesional.
          </p>
        </div>
        <div className="wt-header-actions">
          <button className="rp-secondary" onClick={() => open({ type: 'item' })}>
            <Plus /> Agregar ítem
          </button>
          <button className="rp-secondary" onClick={() => open({ type: 'preview' })}>
            <Printer /> Imprimir / Guardar como PDF
          </button>
          <button className="rp-secondary" onClick={() => open({ type: 'share' })}>
            <Send /> Compartir
          </button>
          <button
            className="rp-primary"
            disabled={!!doc.approval}
            onClick={() => open({ type: 'approve' })}
          >
            <Check />
            {doc.mode === 'quote' ? 'Aprobar DEMO' : 'Finalizar DEMO'}
          </button>
        </div>
      </header>
      <p className="wt-demo">
        <strong>{title} · DEMO</strong> · Borrador y cambios solo en memoria hasta recargar o cerrar
        la pestaña. Sin envío, firma ni aceptación legal.{' '}
        <button
          disabled={!!doc.approval}
          onClick={() => {
            setDoc((d) => ({ ...d, saved: true }))
            setMessage(
              'Borrador conservado solo en memoria de esta página. Retómalo desde Nueva cotización o Nuevo informe → borradores. Se pierde al recargar o cerrar; no es un respaldo permanente.'
            )
          }}
        >
          <Save /> Guardar borrador
        </button>
      </p>
      {doc.sourceQuote && (
        <p className="wt-source-quote">
          Origen de precarga: {doc.sourceQuote.quoteId} · Revisión {doc.sourceQuote.revision}. La
          vigencia de la aceptación DEMO se consulta en el expediente. Esta referencia no autoriza
          trabajos reales ni acredita entrega.
        </p>
      )}
      {message && (
        <p className="wt-message" role="status">
          {message}
        </p>
      )}
      <section className="wt-metrics" aria-label="Información del documento">
        <Metric icon={<FileText />} label="Estado del documento">
          <strong>{doc.status}</strong>
          <button className="wt-review" onClick={review} disabled={!!doc.approval}>
            Marcar pendiente de revisión
          </button>
        </Metric>
        <Metric icon={<ClipboardCheck />} label="N.º Documento">
          <strong>{doc.id}</strong>
        </Metric>
        <Metric icon={<CalendarDays />} label="Fecha de ingreso">
          <strong>{order.date}</strong>
        </Metric>
        <Metric icon={<CarFront />} label="Trabajos / ítems">
          <strong>
            {includedItems(doc).length}
            {doc.mode === 'work' && <small> de {doc.items.length} realizados</small>}
          </strong>
        </Metric>
        <Metric icon={<Wallet />} label="Total (IVA incluido)">
          <strong className="wt-metric-total">{currency(totals.total)}</strong>
        </Metric>
      </section>
      <section className="dashboard-card wt-identity">
        <div className="wt-workshop">
          {doc.workshop.logo ? (
            <img src={doc.workshop.logo} alt="Logo del taller DEMO" />
          ) : (
            <Wrench />
          )}
          <strong>{doc.workshop.name}</strong>
          <small>Identidad comercial DEMO</small>
        </div>
        <div>
          <span className="wt-fact-title">
            <UserRound /> Cliente
          </span>
          <strong>{client.name}</strong>
          <small>{client.phone}</small>
          <small>
            <Mail />
            {client.email}
          </small>
        </div>
        <div>
          <span className="wt-fact-title">
            <CarFront /> Vehículo
          </span>
          <strong>{vehicle.description}</strong>
          <small>
            {order.mileage.toLocaleString('es-CL')} km · {doc.orderId}
          </small>
        </div>
        <div>
          <span className="wt-fact-title">Patente</span>
          <strong>{vehicle.plate}</strong>
        </div>
        <label>
          Fecha del documento
          <input type="date" value={doc.date} onChange={(e) => update({ date: e.target.value })} />
        </label>
      </section>
      <div className="wt-main-grid">
        <WorkItemsTable
          document={doc}
          onEdit={(item) => open({ type: 'item', item })}
          onDelete={(item) => open({ type: 'delete', item })}
          onPerformed={(id, performed) =>
            update({ items: doc.items.map((i) => (i.id === id ? { ...i, performed } : i)) })
          }
          onTemplate={() => open({ type: 'template' })}
        />
        <section className="dashboard-card wt-card wt-totals">
          <h2>
            <Wallet />
            Resumen de totales
          </h2>
          <dl>
            <div>
              <dt>Subtotal neto</dt>
              <dd>{currency(totals.subtotal)}</dd>
            </div>
            <div>
              <dt>IVA (19 %)</dt>
              <dd>{currency(totals.tax)}</dd>
            </div>
            <div className="wt-total">
              <dt>Total (IVA incluido)</dt>
              <dd>{currency(totals.total)}</dd>
            </div>
          </dl>
          <p className="wt-total-note">
            {doc.mode === 'quote'
              ? 'Propuesta de repuestos, insumos, servicios y mano de obra; no acredita ejecución.'
              : 'Solo se suman ítems marcados Realizado. No se infiere ejecución desde una cotización.'}{' '}
            IVA del 19 % aplicado; redondeo a pesos chilenos.
          </p>
        </section>
      </div>
      <div className="wt-bottom-grid">
        <section className="dashboard-card wt-card">
          <h2>
            <FileText />
            Términos y condiciones
          </h2>
          {doc.mode === 'quote' && (
            <label>
              Vigencia (días)
              <input
                type="number"
                min="1"
                max="365"
                inputMode="numeric"
                value={doc.validDays || ''}
                onChange={(e) => update({ validDays: Number(e.target.value) })}
              />
            </label>
          )}
          <label>
            Condiciones comerciales
            <textarea
              aria-label="Condiciones comerciales"
              rows={5}
              maxLength={2000}
              value={doc.terms}
              onChange={(e) => update({ terms: e.target.value })}
            />
          </label>
          <small className="wt-help">
            Textos de ejemplo personalizables en este borrador; no son garantías legales aprobadas.
          </small>
        </section>
        <section className="dashboard-card wt-card">
          <h2>
            <ClipboardCheck />
            Comentarios del técnico
          </h2>
          <label>
            Comentarios técnicos
            <textarea
              aria-label="Comentarios técnicos"
              rows={6}
              maxLength={500}
              value={doc.comments}
              onChange={(e) => update({ comments: e.target.value })}
            />
          </label>
          <small className="wt-character-count">{doc.comments.length} / 500</small>
          <p className="wt-help">Los comentarios no marcan trabajos como realizados.</p>
        </section>
        <WorkApprovalCard document={doc} />
      </div>
      <section className="dashboard-card wt-card wt-technical">
        <h2>
          <Wrench />
          Antecedentes técnicos separados
        </h2>
        <div className="wt-technical-grid">
          <div>
            <h3>Motivo informado por el cliente</h3>
            <p>{order.symptoms}</p>
            <p className="wt-help">
              Antecedente original de la OT; no es un diagnóstico ni una confirmación de ejecución.
            </p>
          </div>
          <label>
            Diagnóstico del mecánico
            <textarea
              rows={3}
              maxLength={2500}
              aria-label="Diagnóstico del mecánico"
              value={doc.diagnosis}
              onChange={(e) => update({ diagnosis: e.target.value })}
            />
          </label>
          <label>
            Recomendaciones / pendientes
            <textarea
              rows={3}
              maxLength={2500}
              aria-label="Recomendaciones / pendientes"
              value={doc.recommendations}
              onChange={(e) => update({ recommendations: e.target.value })}
            />
          </label>
        </div>
        <label>
          Antecedente de inspección multipunto de esta OT
          <select
            aria-label="Antecedente de inspección multipunto de esta OT"
            value={doc.inspection?.id ?? ''}
            onChange={(e) => {
              if (!e.target.value) {
                update({ inspection: null })
                return
              }
              try {
                setDoc(attachInspection(doc, e.target.value))
                setMessage(
                  'Referencia multipunto incorporada. No modifica la inspección ni confirma reparaciones.'
                )
              } catch (err) {
                setMessage((err as Error).message)
              }
            }}
          >
            <option value="">Sin antecedente seleccionado</option>
            {inspections.map((r) => (
              <option key={r.id} value={r.id}>
                {r.id} · {r.finalized ? 'Finalizado DEMO' : 'Inspección editable DEMO'}
              </option>
            ))}
          </select>
        </label>
        {doc.inspection ? (
          <p className="wt-help">
            Referencia {doc.inspection.id}:{' '}
            {doc.inspection.items.filter((i) => i.state === 'unreviewed').length} sin revisar. Copia
            de referencia tomada al seleccionarla; la inspección original permanece intacta.
          </p>
        ) : (
          <p className="wt-help">
            {inspections.length
              ? 'Selecciona una referencia existente.'
              : 'No hay una inspección multipunto temporal para esta OT. Puedes crearla por su flujo actual.'}{' '}
            No se copian controles pendientes como resultados favorables.
          </p>
        )}
      </section>
      <button className="rp-inline wt-discard" onClick={() => open({ type: 'discard' })}>
        Descartar borrador temporal
      </button>
      </div>
      <div className="wt-print-only">
        <WorkDocumentPreview document={doc} />
      </div>
      {modal && (
        <WorkDialog
          title={
            modal.type === 'item'
              ? modal.item
                ? 'Editar ítem'
                : 'Agregar ítem'
              : modal.type === 'delete'
                ? 'Eliminar ítem'
                : modal.type === 'template'
                  ? 'Cargar plantilla DEMO'
                  : modal.type === 'preview'
                    ? 'Vista previa imprimible A4'
                    : modal.type === 'share'
                      ? 'Compartir · Opciones locales DEMO'
                      : modal.type === 'discard'
                        ? 'Descartar borrador'
                        : doc.mode === 'quote'
                          ? 'Aprobación simulada'
                          : 'Finalización simulada'
          }
          wide={modal.type === 'preview'}
          onClose={() => setModal(null)}
        >
          {modal.type === 'item' ? (
            <WorkItemForm
              item={modal.item}
              onSave={(item) => {
                setDoc(putWorkItem(doc, item))
                setModal(null)
                setMessage(
                  doc.approval ? 'Se invalidó la aprobación simulada al editar el contenido.' : ''
                )
              }}
            />
          ) : modal.type === 'delete' ? (
            <>
              <p>
                ¿Quitar «{modal.item.description}» del documento? Se recalcularán los totales y se
                invalidará cualquier aprobación simulada.
              </p>
              <button
                className="rp-primary"
                onClick={() => {
                  update({ items: doc.items.filter((i) => i.id !== modal.item.id) })
                  setModal(null)
                }}
              >
                Confirmar eliminación
              </button>
            </>
          ) : modal.type === 'template' ? (
            <>
              <p>
                Solo ejemplos predeterminados DEMO. No se admiten archivos propios; requieren una
                fase segura posterior.
              </p>
              <label>
                Plantilla DEMO
                <select
                  aria-label="Plantilla DEMO"
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                >
                  {workTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>
              <p>
                Reemplazará los ítems actuales y cualquier marca Realizado quedará desactivada.
                Invalida la aprobación simulada.
              </p>
              <button
                className="rp-primary"
                onClick={() => {
                  setDoc(loadWorkTemplate(doc, template))
                  setModal(null)
                  setMessage(
                    'Plantilla DEMO aplicada; revisa cantidades y precios. Ningún trabajo se marcó automáticamente como realizado.'
                  )
                }}
              >
                Confirmar reemplazo de ítems
              </button>
            </>
          ) : modal.type === 'preview' ? (
            <>
              <p className="wt-help">
                Documento HTML imprimible. Descarga PDF directa pendiente; utiliza Guardar como PDF
                si tu navegador ofrece esa opción. No es una factura.
              </p>
              {errors.length > 0 && (
                <p className="wt-warning">Borrador incompleto: {errors.join(' ')}</p>
              )}
              <button className="rp-primary" onClick={() => window.print()}>
                <Printer /> Imprimir documento / Guardar como PDF
              </button>
              <div className="wt-preview-scroll">
                <WorkDocumentPreview document={doc} />
              </div>
            </>
          ) : modal.type === 'share' ? (
            <>
              <p>
                No se enviará información ni se creará un enlace público. El resumen solo contiene
                identificador DEMO, estado y total.
              </p>
              <pre className="wt-local-summary">{localWorkSummary(doc)}</pre>
              <button className="rp-secondary" onClick={() => void copySummary()}>
                Copiar resumen DEMO local
              </button>
              <button
                className="rp-secondary"
                onClick={() => {
                  setModal(null)
                  setMessage(
                    'Preparación de envío simulada. No se envió ningún correo, no se generó un enlace público ni se adjuntó un PDF.'
                  )
                }}
              >
                Simular preparación sin enviar
              </button>
              {error && (
                <p className="rp-error" role="alert">
                  {error}
                </p>
              )}
            </>
          ) : modal.type === 'discard' ? (
            <>
              <p>Se perderá este borrador temporal. No se modificarán la OT ni otros documentos.</p>
              <button
                className="rp-primary"
                onClick={() => {
                  discardWorkDocument(doc.id)
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
                  {title} {doc.id}
                </strong>
              </p>
              <p>
                {client.name} · {vehicle.description} · {vehicle.plate}
              </p>
              <p>
                {includedItems(doc).length} ítems incluidos · Total:{' '}
                <strong>{currency(totals.total)}</strong>
              </p>
              {doc.mode === 'work' && (
                <p>
                  {doc.items.length - includedItems(doc).length} ítems sin marcar como realizados
                  quedarán excluidos del documento y sus totales.
                </p>
              )}
              {errors.length > 0 && (
                <ul className="rp-error">
                  {errors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              )}
              <label className="wt-consent">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />{' '}
                Entiendo que es una simulación DEMO, sin consentimiento legal, aceptación
                contractual, firma electrónica ni autorización de trabajos reales.
              </label>
              {error && (
                <p className="rp-error" role="alert">
                  {error}
                </p>
              )}
              <button
                className="rp-primary"
                disabled={!!errors.length || !consent}
                onClick={approve}
              >
                {doc.mode === 'quote'
                  ? 'Confirmar aprobación simulada'
                  : 'Confirmar finalización DEMO'}
              </button>
            </>
          )}
        </WorkDialog>
      )}
    </div>
  )
}
function Metric({
  icon,
  label,
  children
}: {
  icon: ReactNode
  label: string
  children: ReactNode
}) {
  return (
    <article className="wt-metric">
      <span className="wt-metric-icon">{icon}</span>
      <div>
        <span>{label}</span>
        {children}
      </div>
    </article>
  )
}
function WorkDialog({
  title,
  children,
  onClose,
  wide
}: {
  title: string
  children: ReactNode
  onClose: () => void
  wide?: boolean
}) {
  return (
    <dialog
      className={'wt-dialog' + (wide ? ' wt-dialog-wide' : '')}
      aria-label={title}
      ref={(node) => {
        if (node && !node.open) node.showModal()
      }}
      onCancel={onClose}
      onClose={onClose}
    >
      <header>
        <h2>{title}</h2>
        <button className="rp-secondary" onClick={onClose}>
          Cerrar
        </button>
      </header>
      {children}
      <button className="rp-secondary wt-cancel" onClick={onClose}>
        Cancelar / volver
      </button>
    </dialog>
  )
}
