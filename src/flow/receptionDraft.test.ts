import { describe, it, expect } from 'vitest'
import { clearReceptionDraft, initialReception, saveReceptionDraft } from './receptionDraft'
import { addSessionRequest } from '../clientes/intakeSession'
import { emptyVisitaDraft } from '../clientes/registroVisitaData'
describe('BT-FLOW-01C — reception draft continuity', () => {
  it('preserves a manual reception while reviewing a different request; clearing one does not erase the other', () => {
    clearReceptionDraft()
    clearReceptionDraft('sol-demo-01')
    const manual = initialReception()
    manual.draft.name = 'Recepción manual en curso'
    manual.step = 2
    saveReceptionDraft(manual)
    const requested = initialReception('sol-demo-01')
    requested.draft.name = 'Revisión de solicitud en curso'
    saveReceptionDraft(requested)
    expect(initialReception().draft.name).toBe('Recepción manual en curso')
    expect(initialReception().step).toBe(2)
    expect(initialReception('sol-demo-01').draft.name).toBe('Revisión de solicitud en curso')
    requested.draft.name = 'No debe mutar el cache'
    expect(initialReception('sol-demo-01').draft.name).toBe('Revisión de solicitud en curso')
    clearReceptionDraft('sol-demo-01')
    expect(initialReception().key).toBe(manual.key)
    clearReceptionDraft()
  })
  it('reuses structured contact and vehicle without inventing missing contacts or carrying forward the human review confirmation', () => {
    const source = {
      ...emptyVisitaDraft,
      name: 'Solicitud de prueba',
      email: 'solicitud@example.com',
      phone: '+56 9 0000 0088',
      brand: 'Suzuki',
      model: 'Swift',
      year: '2020',
      mileage: '40000',
      clientReportedReason: 'Ruido de prueba en suspensión.',
      consent: true
    }
    const request = addSessionRequest(source),
      draft = initialReception(request.id)
    expect(draft.draft.email).toBe(source.email)
    expect(draft.draft.model).toBe('Swift')
    expect(draft.draft.consent).toBe(false)
    expect(source.consent).toBe(true)
    const historic = initialReception('sol-demo-02')
    expect(historic.draft.name).toBe('Cliente demo B')
    expect(historic.draft.email).toBe('')
    expect(historic.draft.phone).toBe('')
    clearReceptionDraft(request.id)
    clearReceptionDraft('sol-demo-02')
  })
})
