import { describe, expect, it } from 'vitest'
import { authorizedMember, canManageMembers, commercialPlans, fullTrialContract, changeMember, demoContext, initialSettings, inviteMember, proposedSubscription, updateSettings, validLocalLogo, validateIntakeVehicle } from './settingsData'
describe('BT-UI-06 contratos y guardas locales DEMO (no RLS)',()=>{
 it('asocia cada área al taller y mantiene datos sintéticos',()=>{
  const s=initialSettings()
  expect(s.members).toHaveLength(8);expect(s.templates).toHaveLength(4)
  expect(s.members.every(m=>m.workshopId===s.workshopId&&m.email.endsWith('@example.com'))).toBe(true)
  expect(s.templates.every(t=>t.workshopId===s.workshopId)).toBe(true)
  expect(s.subscription.workshopId).toBe(s.workshopId)
  expect(s.email.state).toBe('Sin configurar')
 })
 it('rechaza contexto ajeno, falta de membresía o miembro desactivado',()=>{
  const a=initialSettings(),b=initialSettings('workshop-b')
  expect(()=>authorizedMember(b,demoContext)).toThrow('Contexto')
  expect(()=>updateSettings(a,{workshopId:'workshop-b',actorId:'owner-demo'},{preferences:a.preferences})).toThrow('Contexto')
  expect(()=>authorizedMember(a,{...demoContext,actorId:'missing'})).toThrow('Contexto')
  const disabled={...a,members:a.members.map(m=>m.id==='member-2'?{...m,state:'Desactivado' as const}:m)}
  expect(()=>authorizedMember(disabled,{...demoContext,actorId:'member-2'})).toThrow('Contexto')
 })
 it('aplica cambios del taller sin mutar otro ni aceptar configuración global o plantillas ajenas',()=>{
  const a=initialSettings(),b=initialSettings('workshop-b')
  const next=updateSettings(a,demoContext,{profile:{...a.profile,name:'Taller de prueba'},preferences:{...a.preferences,currency:'USD'}})
  expect(next.profile.name).toBe('Taller de prueba');expect(next.branding.name).toBe('Taller de prueba');expect(updateSettings(a,demoContext,{branding:{...a.branding,name:'Marca de prueba'}}).profile.name).toBe('Marca de prueba');expect(a.profile.name).toBe('Taller de demostración');expect(b.preferences.currency).toBe('CLP')
  expect(()=>updateSettings(a,demoContext,{templates:b.templates})).toThrow('otro taller')
  expect(()=>updateSettings(a,demoContext,{workshopId:'workshop-b'} as never)).toThrow('alcance')
  expect(()=>updateSettings(a,demoContext,{subscription:{...a.subscription,state:'Activa'}} as never)).toThrow('alcance')
 })
 it('impide elevación propia, titularidad por invitación y que el taller pierda su propietario',()=>{
  const s=initialSettings()
  expect(()=>changeMember(s,demoContext,'owner-demo',{state:'Desactivado'})).toThrow('protegidos')
  expect(()=>changeMember(s,demoContext,'member-2',{role:'Propietario'})).toThrow('protegidos')
  expect(()=>changeMember(s,demoContext,'missing',{state:'Desactivado'})).toThrow('otro taller')
  expect(()=>inviteMember(s,demoContext,'persona@example.com','Propietario')).toThrow('privilegio')
  expect(()=>changeMember(s,{...demoContext,actorId:'member-2'},'member-3',{role:'Administrador'})).toThrow('Sin permiso')
 })
 it('el administrador necesita concesión y no puede modificar otros administradores ni suscripción',()=>{
  const s=initialSettings(),admin={...demoContext,actorId:'member-1'}
  expect(canManageMembers(s,admin)).toBe(false)
  const granted=changeMember(s,demoContext,'member-1',{canManageUsers:true})
  expect(canManageMembers(granted,admin)).toBe(true)
  expect(changeMember(granted,admin,'member-2',{state:'Desactivado'}).members.find(m=>m.id==='member-2')?.state).toBe('Desactivado')
  expect(()=>changeMember(granted,admin,'member-2',{role:'Administrador'})).toThrow('elevar')
  expect(()=>proposedSubscription(granted,admin)).toThrow('propietario')
  expect(()=>updateSettings(s,{...demoContext,actorId:'member-6'},{profile:s.profile})).toThrow('administrativo')
 })
 it('invitaciones son pendientes locales y el correo no se activa por guardar preferencias',()=>{
  const s=initialSettings(),next=inviteMember(s,demoContext,'nuevo@example.com','Recepción')
  expect(next.members.at(-1)?.state).toBe('Pendiente');expect(next.members.at(-1)?.workshopId).toBe(s.workshopId)
  expect(s.members).toHaveLength(8)
  expect(()=>inviteMember(s,demoContext,'persona@gmail.com','Recepción')).toThrow('sintético')
  expect(()=>inviteMember(next,demoContext,'NUEVO@example.com','Recepción')).toThrow('ya figura')
  expect(()=>updateSettings(s,demoContext,{email:{...s.email,state:'Configurado'}})).toThrow('proveedor')
 })
 it('la propuesta comercial no activa pago, renovación, cancelación ni facturación',()=>{
  const subscription=proposedSubscription(initialSettings(),demoContext)
  expect(commercialPlans.map(p=>p.monthlyUSD)).toEqual([0,5,15]);expect(fullTrialContract.durationHours).toBe(72);expect(fullTrialContract.operational).toBe(false);expect(subscription.plan.proposedPriceUSD).toBe(5);expect(subscription.plan.finalPrice).toBe(false)
  expect(subscription.paymentState).toBe('No habilitado');expect(subscription.provider).toBeNull();expect(subscription.charges).toEqual([])
  expect(subscription.trialStartsAt).toBeNull();expect(subscription.trialEndsAt).toBeNull();expect(subscription.autoRenew).toBe(false);expect(subscription.renewsAt).toBeNull();expect(subscription.cancelledAt).toBeNull();expect(subscription.demo).toBe(true)
 })
 it('limita la vista previa de logo a imágenes locales acotadas',()=>{
  expect(validLocalLogo('image/png',1024)).toBe(true)
  for(const [type,size] of [['image/svg+xml',20],['text/html',10],['image/png',1048577],['image/png',0]] as const)expect(validLocalLogo(type,size)).toBe(false)
 })
 it('valida vehículo y motivo sin convertirlos en diagnóstico ni exigir patente',()=>{
  const valid={brand:'Hyundai',model:'Tucson',year:'2021',mileage:'68430',plate:'',reason:'Quiero revisar vibración al frenar.'}
  expect(validateIntakeVehicle(valid,2026,true)).toEqual({})
  expect(validateIntakeVehicle({...valid,year:'2027',mileage:'0'},2026,true)).toEqual({})
  for(const year of ['1899','2028','2020.5',''])expect(validateIntakeVehicle({...valid,year},2026).year).toBeDefined()
  for(const mileage of ['-1','2.5',' ',''])expect(validateIntakeVehicle({...valid,mileage},2026).mileage).toBeDefined()
  expect(validateIntakeVehicle({...valid,reason:'ruido'},2026,true).reason).toBeDefined()
 })
})
