// Default domain seed source: no workshop, actor, client, vehicle or document records.
// Test infrastructure substitutes this module at resolve time, never through a public flag.
import type { WorkOrder, InspectionState } from '../ordenes/ordenesData'
import type {
  DemoClient,
  DemoVehicle,
  VehicleHistory,
  TechnicalObservation
} from '../clientes/clientesData'
import type { SolicitudIngresoDemo } from '../clientes/registroVisitaData'
import type { LineItem } from '../ordenes/detalleData'
import type { WorkshopSettings } from '../configuracion/settingsData'
import type { DocumentKind, DocumentStatus } from '../informes/documentosData'
export const orderFixtures: WorkOrder[] = []
export const clientFixtures: DemoClient[] = []
export const vehicleFixtures: DemoVehicle[] = []
export const historyFixtures: VehicleHistory[] = []
export const observationFixtures: TechnicalObservation[] = []
export const requestFixtures: SolicitudIngresoDemo[] = []
export const itemFixtures: LineItem[] = []
export const inspectionFixture: Record<string, InspectionState> = {}
export const documentFixtures: readonly (readonly [
  string,
  DocumentKind,
  string,
  DocumentStatus,
  string
])[] = []
export function settingsFixture(_workshopId: string): WorkshopSettings {
  throw new Error(
    'El taller aún no está configurado. El acceso seguro y el guardado permanente están en preparación.'
  )
}
