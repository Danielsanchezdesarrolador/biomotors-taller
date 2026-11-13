import { describe,expect,it } from 'vitest'
import {
  crearSolicitudDemo,emptyVisitaDraft,registrationYearMax,solicitudesDemoIniciales,
  validateVisitaDraft,validateVisitaStep,visitaExamples,type VisitaDraft,
} from './registroVisitaData'

const sample:VisitaDraft={
  ...emptyVisitaDraft,name:'Cliente de prueba',email:'cliente@example.com',
  phone:'+56 9 0000 0000',brand:'Toyota',model:'Corolla',year:'2020',
  mileage:'68430',clientReportedReason:'Mi automóvil vibra al frenar.',
  consent:true,
}
describe('BT-REG-02 — ingreso de datos ficticios en tres pasos',()=>{
  it('acepta campos obligatorios y omisión de dirección, comuna y patente',()=>{
    expect(validateVisitaStep(sample,1,2026)).toEqual({})
    expect(validateVisitaStep(sample,2,2026)).toEqual({})
    expect(validateVisitaStep(sample,3,2026)).toEqual({})
    expect(validateVisitaDraft(sample,2026)).toEqual({})
  })
  it('rechaza correos reales o inválidos, teléfono no ficticio y falta de consentimiento',()=>{
    expect(validateVisitaStep({...sample,email:'persona@gmail.com'},1).email).toMatch(/@example.com/)
    expect(validateVisitaStep({...sample,email:'incorrecto'},1).email).toMatch(/formato/)
    expect(validateVisitaStep({...sample,phone:'+56 9 8765 4321'},1).phone).toMatch(/ficticio/)
    expect(validateVisitaStep({...sample,phone:'123'},1).phone).toMatch(/móvil/)
    expect(validateVisitaStep({...sample,consent:false},1).consent).toBeTruthy()
    expect(validateVisitaStep({...sample,name:'A'},1).name).toBeTruthy()
  })
  it('valida marca, modelo y año mínimo/máximo',()=>{
    expect(validateVisitaStep({...sample,brand:' ',model:''},2).brand).toBeTruthy()
    expect(validateVisitaStep({...sample,brand:' ',model:''},2).model).toBeTruthy()
    for(const year of ['1899','2028','20a0',''])expect(validateVisitaStep({...sample,year},2,2026).year).toBeTruthy()
    expect(validateVisitaStep({...sample,year:'2027'},2,2026).year).toBeUndefined()
    expect(registrationYearMax(2026)).toBe(2027)
  })
  it('requiere kilometraje entero no negativo y con límite conservador',()=>{
    for(const mileage of ['','-10','2.000','10.5','2000001','999999999999999999'])
      expect(validateVisitaStep({...sample,mileage},2).mileage).toBeTruthy()
    for(const mileage of ['0','10','68430','2000000'])
      expect(validateVisitaStep({...sample,mileage},2).mileage).toBeUndefined()
  })
  it('admite patente opcional, sin interpretarla como permiso de identidad',()=>{
    expect(validateVisitaStep({...sample,plate:''},2).plate).toBeUndefined()
    expect(validateVisitaStep({...sample,plate:'DEMO-123456789'},2).plate).toBeTruthy()
  })
  it('valida motivo de 10 a 500 caracteres y facilita cuatro ejemplos',()=>{
    expect(visitaExamples).toHaveLength(4)
    expect(validateVisitaStep({...sample,clientReportedReason:'ruido'},3).clientReportedReason).toBeTruthy()
    expect(validateVisitaStep({...sample,clientReportedReason:'x'.repeat(501)},3).clientReportedReason).toBeTruthy()
    expect(validateVisitaStep({...sample,clientReportedReason:'x'.repeat(500)},3)).toEqual({})
  })
  it('mantiene el motivo separado de cualquier diagnóstico profesional',()=>{
    const request=crearSolicitudDemo(sample,'request-demo',new Date('2026-11-13T12:00:00Z'))
    expect(request.id).toBe('request-demo')
    expect(request.name).toBe(sample.name)
    expect(request.vehicle).toBe('Toyota Corolla · 2020')
    expect(request.mileage).toBe(68430)
    expect(request.plate).toBe('No indicada')
    expect(request.clientReportedReason).toBe(sample.clientReportedReason)
    expect(request.status).toBe('Pendiente de revisión')
    expect('mechanicDiagnosis' in request).toBe(false)
    expect('orderId' in request).toBe(false)
  })
  it('no crea solicitudes de un formulario inválido',()=>{
    expect(()=>crearSolicitudDemo({...sample,model:' '},'bad')).toThrow(/incompletos/)
  })
  it('mantiene las solicitudes de muestra sin contactos privados ni persistencia',()=>{
    expect(solicitudesDemoIniciales).toHaveLength(2)
    expect(solicitudesDemoIniciales.every(s=>s.status==='Pendiente de revisión')).toBe(true)
    expect(solicitudesDemoIniciales.every(s=>s.id.startsWith('sol-demo-'))).toBe(true)
    expect(solicitudesDemoIniciales.every(s=>!('email' in s)&&!('phone' in s))).toBe(true)
  })
})
