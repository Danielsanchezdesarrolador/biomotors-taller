// Injected only by Vitest and the loopback harness configuration. Never imported by the public entry.
import type { WorkOrder, InspectionState } from '../../src/ordenes/ordenesData'
import type {
  DemoClient,
  DemoVehicle,
  VehicleHistory,
  TechnicalObservation,
  ClientStatus
} from '../../src/clientes/clientesData'
import type { WorkshopSettings } from '../../src/configuracion/settingsData'
import type { SolicitudIngresoDemo } from '../../src/clientes/registroVisitaData'
import type { LineItem } from '../../src/ordenes/detalleData'

export const orderFixtures: WorkOrder[] = [
  {
    id: 'OT-1001',
    client: 'Camila Muñoz Rojas · DEMO',
    vehicle: 'Toyota Corolla · 2020',
    plate: 'DEMO-01',
    service: 'Mantención de 10.000 km',
    date: '11-11-2026',
    mileage: 60000,
    status: 'diagnostico',
    technician: 'Técnico DEMO A',
    symptoms: 'Vibración leve al frenar.',
    diagnosis: 'Pendiente de confirmar desgaste de frenos.',
    recommendation: 'Revisar sistema de frenos y fluidos.',
    pending: [
      'Revisar desgaste de pastillas traseras en la próxima visita.',
      'Revisar ruido en suspensión delantera.',
      'Evaluar posible fuga de aceite del motor.'
    ]
  },
  {
    id: 'OT-1002',
    client: 'María Torres · DEMO',
    vehicle: 'Hyundai Tucson · 2021',
    plate: 'DEMO-KZV-482',
    service: 'Revisión de frenos',
    date: '11 nov. 2026',
    mileage: 68430,
    status: 'servicio',
    technician: 'Carlos Méndez · DEMO',
    symptoms:
      'El cliente reporta vibraciones en el volante al frenar, además de un ruido metálico leve en la parte delantera derecha. Solicita revisión general del sistema de frenos.',
    diagnosis:
      'Se detecta desgaste avanzado en pastillas de freno delanteras (≈ 15%). Discos con leve alabeo.',
    recommendation: 'Se recomienda reemplazo de pastillas y rectificado de discos.',
    pending: [
      'Confirmar con el cliente el reemplazo de pastillas y rectificado de discos.',
      'Esperar disponibilidad de repuestos.',
      'Realizar prueba de ruta luego del servicio.'
    ]
  },
  {
    id: 'OT-1003',
    client: 'Paula Fernández Ortega · DEMO',
    vehicle: 'Chevrolet Tracker · 2022',
    plate: 'DEMO-03',
    service: 'Cambio de aceite y filtros',
    date: '10-11-2026',
    mileage: 32400,
    status: 'repuestos',
    technician: 'Técnico DEMO A',
    symptoms: 'Mantención programada.',
    diagnosis: 'Revisión sin anomalías urgentes.',
    recommendation: 'Esperar filtro compatible.',
    pending: ['Filtro de habitáculo pendiente por disponibilidad.']
  },
  {
    id: 'OT-1004',
    client: 'Javier Silva Torres · DEMO',
    vehicle: 'Mitsubishi L200 · 2019',
    plate: 'DEMO-04',
    service: 'Diagnóstico de motor',
    date: '10-11-2026',
    mileage: 86500,
    status: 'entrega',
    technician: 'Técnico DEMO C',
    symptoms: 'Testigo de motor encendido.',
    diagnosis: 'Falla intermitente de sensor.',
    recommendation: 'Entregar recomendaciones al cliente.',
    pending: ['Verificar sensor en control posterior.']
  },
  {
    id: 'OT-1005',
    client: 'Camila Muñoz Rojas · DEMO',
    vehicle: 'Suzuki Swift · 2018',
    plate: 'DEMO-05',
    service: 'Mantención preventiva',
    date: '09-11-2026',
    mileage: 75400,
    status: 'servicio',
    technician: 'Técnico DEMO B',
    symptoms: 'Revisión anual.',
    diagnosis: 'Inspección en curso.',
    recommendation: 'Revisar suspensión delantera.',
    pending: ['Vigilar ruido leve en suspensión.']
  },
  {
    id: 'OT-1006',
    client: 'Javier Silva Torres · DEMO',
    vehicle: 'Kia Rio 5 · 2020',
    plate: 'DEMO-06',
    service: 'Revisión de suspensión',
    date: '09-11-2026',
    mileage: 52200,
    status: 'diagnostico',
    technician: 'Técnico DEMO A',
    symptoms: 'Golpeteo al pasar por baches.',
    diagnosis: 'Diagnóstico de tren delantero en curso.',
    recommendation: 'Revisar bujes y amortiguadores.',
    pending: ['Revisar alineación al finalizar.']
  },
  {
    id: 'OT-1007',
    client: 'Valentina Araya León · DEMO',
    vehicle: 'Nissan Navara · 2021',
    plate: 'DEMO-07',
    service: 'Revisión eléctrica',
    date: '08-11-2026',
    mileage: 63800,
    status: 'repuestos',
    technician: 'Técnico DEMO C',
    symptoms: 'Arranque intermitente.',
    diagnosis: 'Pendiente de reemplazo de batería de prueba.',
    recommendation: 'Evaluar sistema de carga.',
    pending: ['Comprobar carga del alternador.']
  },
  {
    id: 'OT-1008',
    client: 'Valentina Araya León · DEMO',
    vehicle: 'Mazda CX-5 · 2022',
    plate: 'DEMO-08',
    service: 'Control de seguridad',
    date: '08-11-2026',
    mileage: 28600,
    status: 'entrega',
    technician: 'Técnico DEMO B',
    symptoms: 'Inspección preventiva.',
    diagnosis: 'Controles básicos realizados.',
    recommendation: 'Programar próxima mantención.',
    pending: []
  }
]

// Ownership mapping is explicit; identities/vehicle details come from the orders fixtures.
const groups = [
  ['OT-1001', 'OT-1005'],
  ['OT-1002'],
  ['OT-1003'],
  ['OT-1004', 'OT-1006'],
  ['OT-1007', 'OT-1008']
]
const status: ClientStatus[] = ['Activo', 'Frecuente', 'Activo', 'Pendiente', 'Frecuente']
export const clientFixtures: DemoClient[] = groups.map((ids, i) => ({
  id: `customer-${i + 1}`,
  emailVerified: false,
  name: orderFixtures.find((o) => o.id === ids[0])!.client.replace(/ · DEMO$/, ''),
  phone: `+56 9 0000 000${i + 1}`,
  email: `cliente${i + 1}@example.com`,
  address: `Calle de Muestra ${100 + i} · dirección ficticia`,
  commune: 'Comuna DEMO',
  status: status[i],
  lastVisit: orderFixtures.find((o) => o.id === ids[0])!.date
}))
export const vehicleFixtures: DemoVehicle[] = groups.flatMap((ids, i) =>
  ids.map((id) => {
    const o = orderFixtures.find((order) => order.id === id)!
    return {
      id: 'vehicle-' + id,
      clientId: `customer-${i + 1}`,
      plate: o.plate,
      description: o.vehicle,
      mileage: o.mileage,
      status: status[i]
    }
  })
)

export const historyFixtures: VehicleHistory[] = vehicleFixtures.flatMap((v) => {
  const order = orderFixtures.filter((o) => v.id === 'vehicle-' + o.id)[0]
  return [
    {
      id: `visit-${v.id}-1`,
      vehicleId: v.id,
      orderId: order.id,
      date: order.date,
      work: order.service,
      status:
        order.status === 'entrega'
          ? 'Completado'
          : order.status === 'servicio'
            ? 'En servicio'
            : order.status === 'diagnostico'
              ? 'En diagnóstico'
              : 'Pendiente',
      mileage: order.mileage,
      technician: order.technician,
      parts: [],
      reportId: 'report-demo-' + order.id,
      estimateId: 'estimate-demo-' + order.id,
      deliveryStatus: 'No enviado · DEMO' as const
    },
    ...[
      'Mantención de 60.000 km (aceite, filtros y revisión general)',
      'Cambio de pastillas de freno (delanteras)',
      'Alineación y balanceo'
    ].map((work, index) => ({
      id: `visit-${v.id}-${index + 2}`,
      vehicleId: v.id,
      date: ['12 ago 2026', '03 may 2026', '15 feb 2026'][index],
      work,
      status: 'Completado',
      mileage: Math.max(0, v.mileage - (index + 1) * 5000),
      technician: 'Técnico de muestra',
      parts: index === 1 ? ['Pastillas de freno DEMO'] : [],
      deliveryStatus: 'No enviado · DEMO' as const
    }))
  ]
})
export const observationFixtures: TechnicalObservation[] = vehicleFixtures.flatMap((v) =>
  orderFixtures
    .filter((o) => v.id === 'vehicle-' + o.id)
    .flatMap((o) =>
      o.pending.map((text, i) => ({
        id: `observation-${o.id}-${i}`,
        clientId: v.clientId,
        vehicleId: v.id,
        orderId: o.id,
        text,
        status: 'Pendiente' as const
      }))
    )
)

export function settingsFixture(workshopId = 'workshop-demo'): WorkshopSettings {
  return {
    workshopId,
    profile: {
      name: 'Taller de demostración',
      legalName: 'Empresa de muestra',
      businessId: '',
      phone: '+56 9 0000 0000',
      email: 'taller@example.com',
      address: 'Calle de Muestra 123',
      commune: 'Comuna DEMO',
      city: 'Santiago',
      region: 'Metropolitana',
      hours: 'Lunes a viernes · 09:00–18:00',
      description: 'Servicio automotriz de demostración, sin datos reales.'
    },
    branding: {
      name: 'Taller de demostración',
      description: 'Servicio automotriz · DEMO',
      footer: 'Documento de muestra. No constituye factura tributaria.',
      logoDataUrl: null
    },
    members: Array.from({ length: 8 }, (_, i) => ({
      id: i === 0 ? 'owner-demo' : `member-${i}`,
      workshopId,
      name: i === 0 ? 'Propietario DEMO' : `Colaborador de muestra ${i}`,
      email: `usuario${i + 1}@example.com`,
      role:
        i === 0
          ? 'Propietario'
          : i === 1
            ? 'Administrador'
            : i < 6
              ? 'Mecánico / Operario'
              : 'Recepción',
      state: 'Activo',
      canManageUsers: false
    })),
    templates: (
      ['Orden de trabajo', 'Cotización', 'Informe técnico', 'Comprobante no tributario'] as const
    ).map((kind, i) => ({
      id: `template-${i}`,
      workshopId,
      kind,
      heading: kind,
      footer: 'Taller de demostración · Documento DEMO',
      showLogo: true,
      showDiagnosis: true,
      showRecommendations: true,
      showPending: true,
      showInspection: false
    })),
    email: {
      senderName: 'Taller de demostración',
      senderEmail: 'taller@example.com',
      replyTo: 'respuesta@example.com',
      signature: 'Equipo del taller · DEMO',
      message: 'Adjuntamos una muestra de tu documento. Sin envío real.',
      notifications: false,
      state: 'Sin configurar'
    },
    preferences: {
      currency: 'CLP',
      timezone: 'America/Santiago',
      distance: 'Kilómetros',
      dateFormat: 'dd-MM-yyyy',
      paper: 'A4',
      notifications: false,
      defaultDocument: 'Informe técnico'
    },
    subscription: {
      workshopId,
      plan: {
        name: 'Plus · referencia de catálogo',
        proposedPriceUSD: 5,
        period: 'Mensual',
        finalPrice: false
      },
      state: 'Prueba',
      paymentState: 'No habilitado',
      currentPeriodStart: null,
      currentPeriodEnd: null,
      trialStartsAt: null,
      trialEndsAt: null,
      autoRenew: false,
      cancellationState: 'No aplica · DEMO',
      renewsAt: null,
      cancelledAt: null,
      charges: [],
      provider: null,
      demo: true
    }
  }
}

export const requestFixtures: SolicitudIngresoDemo[] = [
  {
    id: 'sol-demo-01',
    name: 'Cliente demo A',
    vehicle: 'Toyota Yaris · 2020',
    mileage: 68430,
    plate: 'No indicada',
    clientReportedReason: 'Necesito cambio de aceite y filtros.',
    date: '12 nov 2026',
    status: 'Pendiente de revisión'
  },
  {
    id: 'sol-demo-02',
    name: 'Cliente demo B',
    vehicle: 'Suzuki Swift · 2019',
    mileage: 52300,
    plate: 'No indicada',
    clientReportedReason: 'Escucho un ruido al pasar por baches.',
    date: '13 nov 2026',
    status: 'Pendiente de revisión'
  }
]

export const itemFixtures: LineItem[] = [
  {
    id: 'pastillas',
    description: 'Pastillas de freno delanteras',
    type: 'Repuesto',
    quantity: 1,
    price: 52900
  },
  {
    id: 'discos',
    description: 'Rectificado de discos (par)',
    type: 'Servicio',
    quantity: 1,
    price: 39900
  },
  {
    id: 'trabajo',
    description: 'Mano de obra (sistema de frenos)',
    type: 'Mano de obra',
    quantity: 1.5,
    price: 24900
  }
]
export const inspectionFixture: Record<string, InspectionState> = {
  aceite: 'correcto',
  frenos: 'atencion',
  neumaticos: 'correcto',
  bateria: 'correcto',
  suspension: 'atencion',
  luces: 'correcto',
  fluidos: 'no-revisado',
  correas: 'no-revisado'
}
export const documentFixtures = [
  ['INF-2048', 'Informe', 'OT-1001', 'Borrador', '2026-11-11T17:26:00Z'],
  ['COT-1083', 'Cotización', 'OT-1002', 'Pendiente', '2026-11-11T16:48:00Z'],
  ['INF-2047', 'Informe', 'OT-1003', 'Enviado', '2026-11-11T15:31:00Z'],
  ['COT-1082', 'Cotización', 'OT-1004', 'Enviado', '2026-11-11T14:05:00Z'],
  ['INF-2046', 'Informe', 'OT-1007', 'Error', '2026-11-11T13:22:00Z'],
  ['COT-1081', 'Cotización', 'OT-1002', 'Enviado', '2026-11-10T19:47:00Z']
] as const
