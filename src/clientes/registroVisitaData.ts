// BT-REG-02 — datos sintéticos; sin conexión de red ni almacenamiento persistente.
export type VisitaDraft = {
  name:string; email:string; phone:string; address:string; commune:string
  brand:string; model:string; year:string; mileage:string; plate:string
  clientReportedReason:string; consent:boolean
}
export type VisitaField = keyof VisitaDraft
export type VisitaErrors = Partial<Record<VisitaField,string>>
export type VisitaStep = 1|2|3
export type SolicitudIngresoDemo = {
  id:string; name:string; vehicle:string; mileage:number; plate:string
  clientReportedReason:string; date:string; status:'Pendiente de revisión';details?:VisitaDraft
}
export const emptyVisitaDraft:VisitaDraft = {
  name:'',email:'',phone:'',address:'',commune:'',
  brand:'',model:'',year:'',mileage:'',plate:'',clientReportedReason:'',consent:false,
}
export const visitaExamples = [
  'Mi automóvil vibra al frenar.',
  'Necesito cambio de aceite y filtros.',
  'Escucho un ruido al pasar por baches.',
  'Quiero revisar la suspensión delantera.',
] as const

export const solicitudesDemoIniciales:SolicitudIngresoDemo[] = [
  {id:'sol-demo-01',name:'Cliente demo A',vehicle:'Toyota Yaris · 2020',mileage:68430,plate:'No indicada',clientReportedReason:'Necesito cambio de aceite y filtros.',date:'12 nov 2026',status:'Pendiente de revisión'},
  {id:'sol-demo-02',name:'Cliente demo B',vehicle:'Suzuki Swift · 2019',mileage:52300,plate:'No indicada',clientReportedReason:'Escucho un ruido al pasar por baches.',date:'13 nov 2026',status:'Pendiente de revisión'},
]

const emailFormat=/^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneFormat=/^(?:\+?56)?9\d{8}$/
const textLength=(value:string)=>value.trim().length
export const registrationYearMax=(year=new Date().getFullYear())=>year+1
export function validateVisitaStep(draft:VisitaDraft,step:VisitaStep,year=new Date().getFullYear()):VisitaErrors {
  const errors:VisitaErrors={}
  if(step===1){
    if(textLength(draft.name)<3||textLength(draft.name)>120)errors.name='Ingresa un nombre de muestra de 3 a 120 caracteres.'
    if(!emailFormat.test(draft.email.trim()))errors.email='Ingresa un correo con formato válido.'
    else if(!draft.email.trim().toLowerCase().endsWith('@example.com'))errors.email='En esta DEMO utiliza un correo ficticio terminado en @example.com.'
    const digits=draft.phone.replace(/[\s()-]/g,'')
    if(!phoneFormat.test(digits))errors.phone='Usa un móvil chileno: +56 9 seguido de 8 dígitos.'
    else if(!/^(?:\+?56)?90000\d{4}$/.test(digits))errors.phone='Para la DEMO usa un número ficticio como +56 9 0000 0000.'
    if(textLength(draft.address)>120)errors.address='La dirección no debe superar 120 caracteres.'
    if(textLength(draft.commune)>80)errors.commune='La comuna no debe superar 80 caracteres.'
    if(!draft.consent)errors.consent='Confirma que utilizarás exclusivamente datos ficticios.'
  }
  if(step===2){
    if(textLength(draft.brand)<2||textLength(draft.brand)>60)errors.brand='Escribe una marca de 2 a 60 caracteres.'
    if(textLength(draft.model)<1||textLength(draft.model)>70)errors.model='Escribe el modelo (máximo 70 caracteres).'
    const y=Number(draft.year)
    if(!/^\d{4}$/.test(draft.year)||!Number.isInteger(y)||y<1900||y>registrationYearMax(year))errors.year='Ingresa un año entre 1900 y '+registrationYearMax(year)+'.'
    if(!/^\d+$/.test(draft.mileage)||!Number.isSafeInteger(Number(draft.mileage))||Number(draft.mileage)>2000000)errors.mileage='Ingresa kilómetros enteros entre 0 y 2.000.000, sin puntos.'
    if(textLength(draft.plate)>10)errors.plate='La patente no debe superar 10 caracteres.'
  }
  if(step===3){
    if(textLength(draft.clientReportedReason)<10)errors.clientReportedReason='Cuéntanos un poco más (mínimo 10 caracteres).'
    if(draft.clientReportedReason.length>500)errors.clientReportedReason='El motivo no debe superar 500 caracteres.'
  }
  return errors
}
export function validateVisitaDraft(draft:VisitaDraft,year=new Date().getFullYear()):VisitaErrors {
  return {...validateVisitaStep(draft,1,year),...validateVisitaStep(draft,2,year),...validateVisitaStep(draft,3,year)}
}
export function crearSolicitudDemo(draft:VisitaDraft,id:string,date=new Date()):SolicitudIngresoDemo {
  if(Object.keys(validateVisitaDraft(draft,date.getFullYear())).length)throw new Error('Datos DEMO incompletos')
  return {
    id,name:draft.name.trim(),details:structuredClone(draft),
    vehicle:[draft.brand.trim(),draft.model.trim()].join(' ')+' · '+draft.year,
    mileage:Number(draft.mileage),plate:draft.plate.trim().toUpperCase()||'No indicada',
    clientReportedReason:draft.clientReportedReason.trim(),
    date:new Intl.DateTimeFormat('es-CL',{day:'numeric',month:'short',year:'numeric',timeZone:'America/Santiago'}).format(date),
    status:'Pendiente de revisión',
  }
}
