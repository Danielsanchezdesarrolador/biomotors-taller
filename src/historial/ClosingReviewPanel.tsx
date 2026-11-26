/**
 * BT-COM-01D: read-only R2 preview from authenticated CP06 history.
 * Not a mail composer or delivery authorization. Never stores confirmations.
 * Loaded only by the independent private preview + FLOW-LIVE-02 gates.
 */
import { useEffect, useMemo, useState } from 'react'
import type { Quote, Revision } from '../cp05/contracts'
import type { FlowEvidence } from './contracts'
import { prepareClosingPacket } from '../entrega/finalPackage'
import './closingReview.css'

type Kind = 'report' | 'handover'
export type ClosingReviewProps = {
  quote: Quote
  revision: Revision
  evidence: FlowEvidence
  onQuotePdf?: () => void
  onCopyPdf?: (kind: Kind) => void
  onPackageZip?: () => void
  downloading: boolean
}
const clp = (n: number) => new Intl.NumberFormat('es-CL', {
  style: 'currency', currency: 'CLP', maximumFractionDigits: 0
}).format(n)
const date = (iso: string) => new Date(iso).toLocaleString('es-CL', {
  dateStyle: 'medium', timeStyle: 'short'
})

export function ClosingReviewPanel({
  quote, revision, evidence, onQuotePdf, onCopyPdf, onPackageZip, downloading
}: ClosingReviewProps) {
  const [visible, setVisible] = useState(false)
  const [recipientChecked, setRecipientChecked] = useState(false)
  const [documentsChecked, setDocumentsChecked] = useState(false)
  const [declarationChecked, setDeclarationChecked] = useState(false)
  const packet = useMemo(() => {
    if (evidence.status !== 'ready') return null
    try {
      return prepareClosingPacket(quote, revision, evidence)
    } catch {
      // Invalid or incomplete evidence must never become a sendable packet.
      return null
    }
  }, [quote, revision, evidence])
  const historicEmail = revision.payload.customer.email
  const reviewedLocally = Boolean(historicEmail) &&
    recipientChecked && documentsChecked && declarationChecked
  const hasArchive = Boolean(onQuotePdf)
  const hasCopies = Boolean(onCopyPdf) && !!packet
  const identity = revision.id + ':' + (packet?.bundleId || 'unavailable')
  useEffect(() => {
    setRecipientChecked(false)
    setDocumentsChecked(false)
    setDeclarationChecked(false)
  }, [identity, historicEmail])
  // Never present historical snapshot contact as a verified current address.
  return (
    <section className="cp06-closing" aria-label="Revisión de cierre documental">
      <header className="cp06-closing-heading">
        <div>
          <small className="cp06-closing-eyebrow">CIERRE DOCUMENTAL · VISTA PREVIA</small>
          <h4>Documentación de esta revisión</h4>
          <p>Una cotización histórica, un informe y una constancia.
            Solo consulta y preparación local; no se envían correos.</p>
        </div>
        <span className="cp06-closing-pill">Sin envío</span>
      </header>
      <button type="button" className="cp03-secondary cp06-closing-toggle"
        aria-expanded={visible} onClick={() => setVisible(x => !x)}>
        {visible ? 'Ocultar revisión documental' : 'Revisar documentos y destinatario'}
      </button>
      {visible && (
        <div className="cp06-closing-body" key={identity}>
          {!packet && (
            <p className="cp06-closing-warning" role="status">
              No se pudo preparar el cierre: faltan constancias verificables o
              el acceso al historial aún no está habilitado. No se generan documentos.
            </p>
          )}
          {packet && (
            <>
              <div className="cp06-closing-recipient">
                <div>
                  <small>Destinatario de referencia · dato histórico</small>
                  <strong>{historicEmail || 'Sin correo registrado en esta revisión'}</strong>
                  <p>No se ha comprobado que esta dirección siga vigente.
                    Una futura confirmación exigirá consultar y validar el destinatario en el servidor.</p>
                </div>
                <span className="cp06-closing-pill cp06-closing-pill-muted">No verificado</span>
              </div>
              <div className="cp06-closing-mail">
                <small>Asunto informativo previsto (no generado por proveedor)</small>
                <strong>{packet.workshop.name} · Documentación de servicio · COT-{String(packet.quote.number).padStart(6,'0')}</strong>
                <p>Se prepararían los documentos de {packet.vehicle.description}{' '}
                  ({packet.vehicle.plate || 'sin patente'}), correspondientes a la revisión
                  {' '}{packet.quote.revision} del {date(revision.issued_at)}.</p>
              </div>
              <div className="cp06-closing-list" aria-label="Tres archivos del cierre">
                <article className="cp06-closing-file">
                  <span className="cp06-closing-index">01</span>
                  <div className="cp06-closing-file-text">
                    <strong>Cotización histórica emitida</strong>
                    <small>{packet.quote.fileName}</small>
                    <p>Total de cotización: {clp(packet.quote.total)}.
                      Se conserva el original; no se regenera desde el borrador.</p>
                  </div>
                  <button className="cp03-secondary" type="button"
                    disabled={downloading || !hasArchive} onClick={onQuotePdf}>
                    {hasArchive ? 'Descargar original' : 'Archivo no habilitado'}
                  </button>
                </article>
                <article className="cp06-closing-file">
                  <span className="cp06-closing-index">02</span>
                  <div className="cp06-closing-file-text">
                    <strong>Informe de trabajos declarados</strong>
                    <small>{packet.report.fileName}</small>
                    <p>Total marcado realizado: {clp(packet.report.declared.total)}.
                      Pendientes: {packet.report.lines.filter(x => x.decision === 'not_performed').length}.
                      No equivale a un cobro.</p>
                  </div>
                  <button className="cp03-secondary" type="button"
                    disabled={downloading || !hasCopies}
                    onClick={() => onCopyPdf?.('report')}>
                    {hasCopies ? 'Descargar copia' : 'Copia no disponible'}
                  </button>
                </article>
                <article className="cp06-closing-file">
                  <span className="cp06-closing-index">03</span>
                  <div className="cp06-closing-file-text">
                    <strong>Constancia declarada de entrega</strong>
                    <small>{packet.handover.fileName}</small>
                    <p>Registro del {date(packet.handover.recordedAt)}.
                      No acredita firma o recepción independiente del cliente.</p>
                  </div>
                  <button className="cp03-secondary" type="button"
                    disabled={downloading || !hasCopies}
                    onClick={() => onCopyPdf?.('handover')}>
                    {hasCopies ? 'Descargar copia' : 'Copia no disponible'}
                  </button>
                </article>
              </div>
              <div className="cp06-closing-actions">
                <button type="button" className="cp03-primary"
                  disabled={downloading || !packet || !hasArchive || !hasCopies || !onPackageZip}
                  onClick={onPackageZip}>
                  Descargar paquete ZIP (3 PDF)
                </button>
              </div>
              <p className="cp06-closing-state">
                Incluye el PDF archivado original y dos copias informativas generadas
                desde constancias históricas. Solo descarga local: no se envía correo.
              </p>
              <div className="cp06-closing-review">
                <strong>Lista de revisión local</strong>
                <p>Las marcas son temporales en esta pantalla. No se guardan en
                  el servidor ni sustituyen la confirmación del operador en el backend.</p>
                <label><input type="checkbox" checked={recipientChecked}
                  disabled={!historicEmail}
                  onChange={e => setRecipientChecked(e.target.checked)} />
                  Revisé el correo histórico; aún requiere validación actual.</label>
                <label><input type="checkbox" checked={documentsChecked}
                  onChange={e => setDocumentsChecked(e.target.checked)} />
                  Revisé los tres documentos y sus importes declarados.</label>
                <label><input type="checkbox" checked={declarationChecked}
                  onChange={e => setDeclarationChecked(e.target.checked)} />
                  Entiendo que no son firma, recepción ni comprobante de pago.</label>
                <p className="cp06-closing-state" role="status">
                  {reviewedLocally ? 'Lista local revisada · NO guardada' :
                    'Revisión local incompleta · NO guardada'}
                </p>
                <div className="cp06-closing-actions">
                  <button type="button" className="cp03-secondary" disabled>
                    Registrar revisión · pendiente de activación
                  </button>
                  <button type="button" className="cp03-primary" disabled>
                    Enviar correo · desactivado
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  )
}
