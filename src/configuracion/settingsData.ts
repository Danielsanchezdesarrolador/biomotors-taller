export type WorkshopRole='Propietario'|'Administrador'|'Mecánico / Operario'|'Recepción'
export type MemberState='Activo'|'Pendiente'|'Desactivado'
export type TemplateKind='Orden de trabajo'|'Cotización'|'Informe técnico'|'Comprobante no tributario'
export type SubscriptionState='Prueba'|'Activa'|'Pago pendiente'|'Suspendida'|'Cancelada'
export type WorkshopProfile={name:string;legalName:string;businessId:string;phone:string;email:string;address:string;commune:string;city:string;region:string;hours:string;description:string}
export type WorkshopBranding={name:string;description:string;footer:string;logoDataUrl:string|null}
export type WorkshopMember={id:string;workshopId:string;name:string;email:string;role:WorkshopRole;state:MemberState;canManageUsers:boolean}
export type WorkshopTemplate={id:string;workshopId:string;kind:TemplateKind;heading:string;footer:string;showLogo:boolean;showDiagnosis:boolean;showRecommendations:boolean;showPending:boolean;showInspection:boolean}
export type WorkshopEmailSettings={senderName:string;senderEmail:string;replyTo:string;signature:string;message:string;notifications:boolean;state:'Sin configurar'|'Pendiente de verificación'|'Configurado'|'Error de configuración'}
export type WorkshopPreferences={currency:'CLP'|'USD';timezone:'America/Santiago'|'UTC';distance:'Kilómetros'|'Millas';dateFormat:'dd-MM-yyyy'|'yyyy-MM-dd';paper:'A4'|'Carta';notifications:boolean;defaultDocument:'Informe técnico'|'Cotización'}
export type WorkshopSubscription={workshopId:string;plan:{name:string;proposedPriceUSD:5;period:'Mensual';finalPrice:false};state:SubscriptionState;paymentState:'No habilitado';currentPeriodStart:null;currentPeriodEnd:null;trialStartsAt:null;trialEndsAt:null;autoRenew:false;cancellationState:'No aplica · DEMO';renewsAt:null;cancelledAt:null;charges:never[];provider:null;demo:true}
export type WorkshopSettings={workshopId:string;profile:WorkshopProfile;branding:WorkshopBranding;members:WorkshopMember[];templates:WorkshopTemplate[];email:WorkshopEmailSettings;preferences:WorkshopPreferences;subscription:WorkshopSubscription}
export type WorkshopContext={workshopId:string;actorId:string}
export const demoContext:WorkshopContext={workshopId:'workshop-demo',actorId:'owner-demo'}
export const roles:WorkshopRole[]=['Propietario','Administrador','Mecánico / Operario','Recepción']
export const roleDescriptions:Record<WorkshopRole,string>={Propietario:'Administra taller, usuarios, configuración comercial y su propia suscripción.',Administrador:'Opera el taller. Solo administra usuarios si el propietario lo permite; no cambia titularidad ni suscripción.','Mecánico / Operario':'Consulta órdenes e incorpora diagnóstico, inspección y trabajos autorizados. Sin seguridad administrativa ni suscripción.',Recepción:'Registra clientes y gestiona solicitudes/órdenes autorizadas. Sin configuraciones sensibles.'}
export function initialSettings(workshopId='workshop-demo'):WorkshopSettings {
 return {workshopId,profile:{name:'Taller de demostración',legalName:'Empresa de muestra',businessId:'',phone:'+56 9 0000 0000',email:'taller@example.com',address:'Calle de Muestra 123',commune:'Comuna DEMO',city:'Santiago',region:'Metropolitana',hours:'Lunes a viernes · 09:00–18:00',description:'Servicio automotriz de demostración, sin datos reales.'},branding:{name:'Taller de demostración',description:'Servicio automotriz · DEMO',footer:'Documento de muestra. No constituye factura tributaria.',logoDataUrl:null},members:Array.from({length:8},(_,i)=>({id:i===0?'owner-demo':`member-${i}`,workshopId,name:i===0?'Propietario DEMO':`Colaborador de muestra ${i}`,email:`usuario${i+1}@example.com`,role:i===0?'Propietario':i===1?'Administrador':i<6?'Mecánico / Operario':'Recepción',state:'Activo',canManageUsers:false})),templates:(['Orden de trabajo','Cotización','Informe técnico','Comprobante no tributario'] as const).map((kind,i)=>({id:`template-${i}`,workshopId,kind,heading:kind,footer:'Taller de demostración · Documento DEMO',showLogo:true,showDiagnosis:true,showRecommendations:true,showPending:true,showInspection:false})),email:{senderName:'Taller de demostración',senderEmail:'taller@example.com',replyTo:'respuesta@example.com',signature:'Equipo del taller · DEMO',message:'Adjuntamos una muestra de tu documento. Sin envío real.',notifications:false,state:'Sin configurar'},preferences:{currency:'CLP',timezone:'America/Santiago',distance:'Kilómetros',dateFormat:'dd-MM-yyyy',paper:'A4',notifications:false,defaultDocument:'Informe técnico'},subscription:{workshopId,plan:{name:'Plus · referencia de catálogo',proposedPriceUSD:5,period:'Mensual',finalPrice:false},state:'Prueba',paymentState:'No habilitado',currentPeriodStart:null,currentPeriodEnd:null,trialStartsAt:null,trialEndsAt:null,autoRenew:false,cancellationState:'No aplica · DEMO',renewsAt:null,cancelledAt:null,charges:[],provider:null,demo:true}}
}
export function authorizedMember(settings:WorkshopSettings,context:WorkshopContext){const actor=settings.members.find(m=>m.id===context.actorId&&m.workshopId===context.workshopId&&m.state==='Activo');if(settings.workshopId!==context.workshopId||!actor)throw new Error('Contexto DEMO no autorizado para este taller.');return actor}
export function canManageMembers(settings:WorkshopSettings,context:WorkshopContext){const actor=authorizedMember(settings,context);return actor.role==='Propietario'||(actor.role==='Administrador'&&actor.canManageUsers)}
export function updateSettings(settings:WorkshopSettings,context:WorkshopContext,patch:Partial<Pick<WorkshopSettings,'profile'|'branding'|'email'|'preferences'|'templates'>>):WorkshopSettings {
 const actor=authorizedMember(settings,context)
 if(Object.keys(patch).some(key=>!['profile','branding','email','preferences','templates'].includes(key)))throw new Error('Cambio fuera del alcance de configuración DEMO.')
 if(!['Propietario','Administrador'].includes(actor.role))throw new Error('Sin permiso administrativo DEMO.')
 if(patch.templates?.some(t=>t.workshopId!==settings.workshopId))throw new Error('Plantilla de otro taller.')
 if(patch.email?.state==='Configurado')throw new Error('No existe un proveedor habilitado: no se puede marcar Configurado.')
 const next={...settings,...structuredClone(patch)}
 if(patch.profile&&patch.branding&&patch.profile.name!==patch.branding.name)throw new Error('Usa un único nombre comercial del taller.')
 if(patch.profile)next.branding={...next.branding,name:patch.profile.name}
 if(patch.branding)next.profile={...next.profile,name:patch.branding.name}
 return next
}
export function changeMember(settings:WorkshopSettings,context:WorkshopContext,id:string,patch:Partial<Pick<WorkshopMember,'role'|'state'|'canManageUsers'>>):WorkshopSettings {
 if(!canManageMembers(settings,context))throw new Error('Sin permiso para administrar usuarios DEMO.')
 if(patch.role&&!roles.includes(patch.role))throw new Error('Rol inválido.')
 const member=settings.members.find(m=>m.id===id&&m.workshopId===context.workshopId)
 if(!member)throw new Error('Usuario de otro taller o inexistente.')
 if(member.id===context.actorId||member.role==='Propietario'||patch.role==='Propietario')throw new Error('Titularidad y rol propio protegidos; requieren un proceso autorizado.')
 const actor=authorizedMember(settings,context)
 if(actor.role!=='Propietario'&&(member.role==='Administrador'||patch.role==='Administrador'||patch.canManageUsers!==undefined))throw new Error('Un administrador no puede elevar privilegios ni delegar su facultad.')
 return {...settings,members:settings.members.map(m=>m.id===id?{...m,...patch}:m)}
}
export function inviteMember(settings:WorkshopSettings,context:WorkshopContext,email:string,role:WorkshopRole):WorkshopSettings {
 if(!canManageMembers(settings,context))throw new Error('Sin permiso para invitar.')
 if(!/^[a-z0-9]+(?:[._+-][a-z0-9]+)*@example\.com$/i.test(email))throw new Error('Usa un correo sintético @example.com.')
 if(role==='Propietario'||(authorizedMember(settings,context).role!=='Propietario'&&role==='Administrador'))throw new Error('No se puede asignar ese privilegio mediante una invitación DEMO.')
 if(settings.members.some(m=>m.email.toLowerCase()===email.toLowerCase()))throw new Error('Este correo ya figura en el taller DEMO.')
 return {...settings,members:[...settings.members,{id:'invite-local-'+settings.members.length,workshopId:context.workshopId,name:'Invitación de muestra',email,role,state:'Pendiente',canManageUsers:false}]}
}
export function proposedSubscription(settings:WorkshopSettings,context:WorkshopContext){if(authorizedMember(settings,context).role!=='Propietario')throw new Error('La suscripción solo corresponde al propietario de este taller.');return structuredClone(settings.subscription)}
export function validLocalLogo(type:string,bytes:number){return ['image/png','image/jpeg','image/webp'].includes(type)&&bytes>0&&bytes<=1024*1024}

export type IntakeVehicle={brand:string;model:string;year:string;mileage:string;plate:string;reason:string}
export function validateIntakeVehicle(vehicle:IntakeVehicle,currentYear:number,includeReason=false){
 const errors:Partial<Record<keyof IntakeVehicle,string>>={}
 if(!vehicle.brand.trim())errors.brand='Completa la marca de muestra.'
 if(!vehicle.model.trim())errors.model='Completa el modelo de muestra.'
 const year=Number(vehicle.year),mileage=Number(vehicle.mileage)
 if(!vehicle.year.trim()||!Number.isInteger(year)||year<1900||year>currentYear+1)errors.year='Año fuera del rango permitido.'
 if(!vehicle.mileage.trim()||!Number.isInteger(mileage)||mileage<0||mileage>9999999)errors.mileage='Kilometraje entero no negativo requerido.'
 if(includeReason&&(vehicle.reason.trim().length<10||vehicle.reason.length>500))errors.reason='Escribe un motivo de 10 a 500 caracteres; no es un diagnóstico técnico.'
 return errors
}

export const commercialPlans=[{id:'basic',name:'Básico',monthlyUSD:0,description:'Gratis y sin publicidad durante el lanzamiento. Alta manual; sin enlaces ni correo PDF automático.'},{id:'plus',name:'Plus',monthlyUSD:5,description:'Enlaces de registro y correo PDF previstos, sujetos a backend seguro y cuotas por definir.'},{id:'full',name:'Full',monthlyUSD:15,description:'Funciones avanzadas futuras, sin prometer capacidades todavía no implementadas.'}] as const
export const fullTrialContract={durationHours:72,initialChargeUSD:0,subsequentMonthlyUSD:15,requiresPaymentProvider:true,requiresExplicitConsent:true,operational:false} as const
