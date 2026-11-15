import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { Cp03PilotDirectoryView, cp03Message, type PilotDirectoryPort } from './cp03PilotDirectoryView'
import { DirectoryFailure } from './cp03PilotContracts'

const fn = () => vi.fn(async () => [])
function port(): PilotDirectoryPort {
  return {
    recentCustomers:fn(),
    search:vi.fn(async () => ({customers:[],vehicles:[]})),
    getCustomer:vi.fn(async () => null),
    getVehicle:vi.fn(async () => null),
    vehiclesForCustomer:fn(),
    createCustomer:vi.fn(async () => {throw new DirectoryFailure('unavailable')}),
    createVehicle:vi.fn(async () => {throw new DirectoryFailure('unavailable')}),
    updateCustomer:vi.fn(async () => {throw new DirectoryFailure('unavailable')}),
    updateVehicle:vi.fn(async () => {throw new DirectoryFailure('unavailable')})
  }
}
describe('BT-CP03-P3 · offline UI candidate (not in public PWA)', () => {
  it('renders an accessible search and clear empty-state; never calls network on SSR', () => {
    const repo=port()
    const html=renderToStaticMarkup(<Cp03PilotDirectoryView repository={repo}
      role="owner" workshopName="Taller de prueba"/>)
    expect(html).toContain('Clientes y vehículos')
    expect(html).toContain('Buscar por nombre, teléfono, correo o patente')
    expect(html).toContain('Clientes recientes')
    expect(html).toContain('Nuevo cliente')
    expect(html).toContain('role="status"')
    expect(html).not.toContain('Taller DEMO')
    expect(repo.recentCustomers).not.toHaveBeenCalled()
    expect(repo.search).not.toHaveBeenCalled()
    expect(repo.createCustomer).not.toHaveBeenCalled()
  })
  it('mechanic never sees write controls, regardless of attempted frontend bypass', () => {
    const html=renderToStaticMarkup(<Cp03PilotDirectoryView repository={port()}
      role="mechanic" workshopName="Taller autorizado"/>)
    expect(html).not.toMatch(/Nuevo cliente|Agregar vehículo|Editar cliente|Editar vehículo/)
    expect(html).not.toContain('Guardar ficha')
  })
  it('renders reception write button but without service keys, PII or unauthorized forms', () => {
    const html=renderToStaticMarkup(<Cp03PilotDirectoryView repository={port()}
      role="reception" workshopName="Taller autorizado"/>)
    expect(html).toContain('Nuevo cliente')
    expect(html).not.toContain('sb_secret_')
    expect(html).not.toContain('pilot@example')
    expect(html).not.toContain('Guardar ficha de cliente')
  })
  it('maps all errors to user-friendly text without leaking raw backend errors', () => {
    for(const kind of ['invalid','denied','duplicate','conflict','unavailable'] as const) {
      const error=new DirectoryFailure(kind)
      const message=cp03Message(error)
      expect(message.length).toBeGreaterThan(30)
      expect(message).not.toMatch(/DirectoryFailure|PostgREST|SQL|token|JWT|stack/)
    }
    expect(cp03Message(new Error('db secret: sensitive'))).not.toContain('sensitive')
  })
})
