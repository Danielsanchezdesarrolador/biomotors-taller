// Presentation/callback/role probes only. Real SDK/HTTP coverage is in cp04BrowserFixture.
// Excluded from all product bundles; contains synthetic records, never hosted calls.
import { StrictMode, useMemo, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Cp04OrdersView, type Cp04Port } from '../../src/ordenes/Cp04OrdersView';
import type { Context } from '../../src/auth/controller';
import type { OrderWithVehicle } from '../../src/ordenes/cp04Contracts';
import '../../src/styles.css';
import '../../src/premium.css';
const id = (n: number) => '00000000-0000-4000-8000-' + String(n).padStart(12, '0');
const probes: {
    kind: string;
    workshop: string;
    order: string;
}[] = [];
function Fixture() {
    const [wid, setWid] = useState(id(11)), [role, setRole] = useState<Context['role']>('owner'), [enabled, setEnabled] = useState(true);
    const context = useMemo<Context>(() => ({ userId: id(1), role, workshop: { id: wid, name: 'Taller sintético ' + wid.slice(-2), status: 'active' }, inspectionEnabled: enabled }), [wid, role, enabled]);
    const repository = useMemo<Cp04Port>(() => {
        const row: OrderWithVehicle = { order: { id: id(wid === id(11) ? 201 : 202), workshop_id: wid, vehicle_id: id(101), complaint: 'Revisión sintética', status: 'inspecting', intake_odometer: 120000, opened_by: id(1), opened_at: '2026-11-26T12:00:00Z', closed_at: null, updated_at: '2026-11-26T12:00:00Z' }, vehicle: { id: id(101), workshop_id: wid, customer_id: id(51), plate: 'QX9001', make: 'Marca sintética', model: 'Modelo sintético', odometer_km: 120000, plate_key: 'QX9001' } };
        const forbidden = async () => { throw Error('This presentation probe must not write or generate documents'); };
        return { recentOrders: async () => [row], getOrder: async (order) => { if (order !== row.order.id)
                return null; return structuredClone(row); }, findVehicleByPlate: async () => row.vehicle, findingsForOrder: async () => [], pendingForVehicle: async () => [], pdfIdentity: forbidden, createOrder: forbidden, createFinding: forbidden, updateFindingNote: forbidden, markResolved: forbidden, setStatus: forbidden };
    }, [wid]);
    useEffect(() => { const w = window as Window & {
        ordersUxQa?: unknown;
    }; w.ordersUxQa = { setWid, setRole, setEnabled, probes }; return () => { delete w.ordersUxQa; }; }, []);
    return <main style={{ padding: 16, maxWidth: 1500, margin: 'auto' }}><p>Laboratorio sintético de presentación. No conectado a servicios alojados.</p><Cp04OrdersView key={wid + ':' + role + ':' + enabled} repository={repository} context={context} onGuided={order => probes.push({ kind: 'guided', workshop: wid, order })} onQuote={order => probes.push({ kind: 'quote', workshop: wid, order })}/></main>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><Fixture /></StrictMode>);
