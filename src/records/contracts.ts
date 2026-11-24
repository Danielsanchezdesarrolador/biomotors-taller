import { UUID } from '../clientes/cp03PilotContracts'
export const resources = ['customers', 'vehicles', 'work_orders', 'quotes'] as const
export type Resource = typeof resources[number]
export type Action = 'delete' | 'archive' | 'restore' | 'cancel' | 'void'
export const resourceLabels: Record<Resource, string> = {
  customers: 'Clientes', vehicles: 'Vehículos', work_orders: 'Órdenes de trabajo', quotes: 'Cotizaciones'
}
export const actionLabels: Record<Action, string> = {
  delete: 'Eliminar definitivamente', archive: 'Archivar', restore: 'Restaurar', cancel: 'Cancelar orden', void: 'Anular cotización'
}
export type RecordRow = {id: string; label: string; state: string; token: string}
export type Inspection = {id: string; resource: Resource; token: string; dependencies: number; draft_items: number; actions: Action[]; inherited_archive: boolean}
export type AuditEvent = {sequence: number; resource_id: string; action: string; actor_id: string; created_at: string; reason: string | null}
export type Receipt = {id: string; resource: Resource; action: Action; request_id: string}
export interface RecordsPort {
  list(resource: Resource, archived: boolean, query: string, after?: string): Promise<RecordRow[]>
  inspect(resource: Resource, id: string): Promise<Inspection>
  execute(inspection: Inspection, action: Action, request: string, reason: string): Promise<Receipt>
  audit(resource: Resource, id?: string): Promise<AuditEvent[]>
  dispose(): void
}
export class RecordsFailure extends Error {
  constructor(readonly kind: 'denied' | 'disabled' | 'conflict' | 'dependencies' | 'invalid' | 'unavailable') { super(kind) }
}
export function recordId(id: string) {if (!UUID.test(id)) throw new RecordsFailure('invalid'); return id.toLowerCase()}
export function recordsMessage(error: unknown) {
  const kind = error instanceof RecordsFailure ? error.kind : 'unavailable'
  return {
    denied: 'No tienes autorización vigente para administrar estos registros.',
    disabled: 'La administración de registros está desactivada en este taller. Requiere autorización de activación.',
    conflict: 'El registro cambió. Consulta nuevamente sus dependencias antes de confirmar.',
    dependencies: 'Las dependencias cambiaron o impiden esta acción. Vuelve a consultar el registro.',
    invalid: 'Revisa la acción y el motivo ingresado.',
    unavailable: 'No se pudo confirmar la operación. Reintenta con la misma solicitud para comprobar su resultado.'
  }[kind]
}
export const recordsEnabled = () => import.meta.env.VITE_BT_RECORDS_PRIVATE_ENABLED === 'true'
