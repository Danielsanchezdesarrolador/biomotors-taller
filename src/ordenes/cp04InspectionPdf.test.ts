import {describe,it,expect} from 'vitest'
import {multipuntoPdfModel,multipuntoPdf} from './cp04InspectionPdf'
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs'
import {PDFDocument} from 'pdf-lib'
import {multipuntoTemplateItems} from './cp04Multipunto'
import type {Finding,OrderWithVehicle} from './cp04Contracts'
const a='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const b='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
const o='11111111-1111-4111-8111-111111111111'
const v='22222222-2222-4222-8222-222222222222'
const order:OrderWithVehicle={
 order:{workshop_id:a,id:o,vehicle_id:v,complaint:'Revisar frenos',
 intake_odometer:85200,status:'inspecting',opened_by:o,opened_at:'2026-11-20T10:00:00Z',
 closed_at:null,updated_at:'2026-11-20T10:00:00Z'},
 vehicle:{workshop_id:a,id:v,customer_id:o,plate:'QA1234',plate_key:'QA1234',
 make:'Kia',model:'Rio',odometer_km:85200}}
function finding(category:string,result:Finding['result'],note:string|null,
 resolution:Finding['resolution']='pending',workshop_id=a):Finding{
 return {workshop_id,id:o,order_id:o,vehicle_id:v,category,result,note,resolution,
 resolved_at:null,recorded_by:o,created_at:'2026-11-20T10:00:00Z',updated_at:'2026-11-20T10:00:00Z'}}
describe('CP04 multipoint local PDF model',()=>{
 it('preserves all 34 unreviewed items',()=>{
   const x=multipuntoPdfModel({workshopName:'Taller',order,findings:[]})
   expect(x.rows).toHaveLength(34)
   expect(x.counts).toEqual({total:34,ok:0,attention:0,immediate:0,unreviewed:34,provisional:0})
 })
 it('retains immediate priority and resolution, without inventing repair completion',()=>{
   const x=multipuntoPdfModel({workshopName:'Taller',order,findings:[
     finding('Multipunto · Pastillas de freno','attention','PRIORIDAD INMEDIATA: Desgaste'),
     finding('Multipunto · Extintor','ok',null,'not_applicable'),
     finding('Multipunto · Discos de freno','attention','Desgaste','resolved')]})
   expect(x.counts).toMatchObject({ok:1,attention:1,immediate:1,unreviewed:31})
   expect(x.rows.find(r=>r.label==='Pastillas de freno')).toMatchObject({state:'immediate',note:'Desgaste',resolution:'pending'})
   expect(x.rows.find(r=>r.label==='Discos de freno')?.resolution).toBe('resolved')
 })
 it('filters other tenant and order rows',()=>{
   const x=multipuntoPdfModel({workshopName:'Taller',order,findings:[
     finding('Multipunto · Extintor','ok',null,'not_applicable',b),
     {...finding('Multipunto · Extintor','ok',null),order_id:b}]})
   expect(x.counts.ok).toBe(0)
 })
 it('shows provisional note as provisional',()=>{
   const x=multipuntoPdfModel({workshopName:'Taller',order,findings:[
     finding('Multipunto · Pastillas de freno','attention','Detalle técnico pendiente de completar')]})
   expect(x.counts.provisional).toBe(1)
 })
 it('rejects mismatched workshop data',()=>{
   expect(()=>multipuntoPdfModel({workshopName:'Taller',
     order:{...order,vehicle:{...order.vehicle,workshop_id:b}},findings:[]})).toThrow('MULTIPUNTO_PDF_CONTEXT_MISMATCH')
 })
 it('rejects an identity belonging to another customer, order or workshop',()=>{
   const identity={workshop_id:a,order_id:o,vehicle_id:v,customer_id:o,ownerName:'Cliente sintético',modelYear:2023}
   for(const patch of [{customer_id:b},{order_id:b},{workshop_id:b},{vehicle_id:b}])
     expect(()=>multipuntoPdfModel({workshopName:'Taller',order,findings:[],identity:{...identity,...patch}}))
       .toThrow('MULTIPUNTO_PDF_CONTEXT_MISMATCH')
 })
 it('creates a complete, one-page dynamic summary with all 34 persisted states',async()=>{
   const findings=multipuntoTemplateItems().map((item,i)=>finding('Multipunto · '+item.name,
     i%3===0?'ok':'attention',i%3===0?null:(i%3===1?'':'PRIORIDAD INMEDIATA: ')+'Observación sintética '.repeat(70)))
   const input={workshopName:'Taller de ensayo · Datos ficticios',order,findings,
     identity:{workshop_id:a,order_id:o,vehicle_id:v,customer_id:o,ownerName:'Cliente de prueba · Sin datos reales',modelYear:2023}}
   const before=JSON.stringify(input),model=multipuntoPdfModel(input)
   expect(model.rows.map(r=>r.state)).toEqual(multipuntoTemplateItems().map((_,i)=>['ok','attention','immediate'][i%3]))
   const bytes=await multipuntoPdf(input,new Uint8Array(readFileSync('public/cp05/DejaVuSans.ttf')),
     {light:new Uint8Array(readFileSync('apps/android/assets/brand/logo-horizontal.png')),
      dark:new Uint8Array(readFileSync('apps/android/assets/brand/logo-horizontal-dark.png'))})
   expect((await PDFDocument.load(bytes)).getPageCount()).toBe(1)
   expect(JSON.stringify(input)).toBe(before)
   if(process.env.BT_MULTIPUNTO_PDF_OUTPUT){
     mkdirSync(process.env.BT_MULTIPUNTO_PDF_OUTPUT,{recursive:true})
     writeFileSync(process.env.BT_MULTIPUNTO_PDF_OUTPUT+'/multipunto-sintetico.pdf',bytes)
     writeFileSync(process.env.BT_MULTIPUNTO_PDF_OUTPUT+'/expected.json',JSON.stringify(model,null,2))
   }
 })
 it('leaves every box empty for an unevaluated inspection, and never truncates oversized identity',async()=>{
   const font=new Uint8Array(readFileSync('public/cp05/DejaVuSans.ttf'))
   const logos={light:new Uint8Array(readFileSync('apps/android/assets/brand/logo-horizontal.png')),dark:new Uint8Array(readFileSync('apps/android/assets/brand/logo-horizontal-dark.png'))}
   const input={workshopName:'Taller de ensayo',order,findings:[]}
   const bytes=await multipuntoPdf(input,font,logos)
   expect((await PDFDocument.load(bytes)).getPageCount()).toBe(1)
   expect(multipuntoPdfModel(input).rows.every(row=>row.state==='unreviewed')).toBe(true)
   if(process.env.BT_MULTIPUNTO_PDF_OUTPUT){
     mkdirSync(process.env.BT_MULTIPUNTO_PDF_OUTPUT,{recursive:true})
     writeFileSync(process.env.BT_MULTIPUNTO_PDF_OUTPUT+'/sin-evaluar.pdf',bytes)
     writeFileSync(process.env.BT_MULTIPUNTO_PDF_OUTPUT+'/sin-evaluar.json',JSON.stringify(multipuntoPdfModel(input)))
   }
   await expect(multipuntoPdf({...input,identity:{workshop_id:a,order_id:o,vehicle_id:v,customer_id:o,
     ownerName:'Nombre muy extenso '.repeat(20),modelYear:null}},font,logos))
     .rejects.toThrow('MULTIPUNTO_PDF_FIELD_TOO_LONG')
 })
 it('creates exactly one A4 page even for long technician notes',async()=>{
   const font=new Uint8Array(readFileSync('public/cp05/DejaVuSans.ttf'))
   const x=await multipuntoPdf({workshopName:'Taller de ensayo',order,findings:[
     finding('Multipunto · Pastillas de freno','attention','Desgaste '.repeat(210))
   ]},font,{light:new Uint8Array(readFileSync('apps/android/assets/brand/logo-horizontal.png')),dark:new Uint8Array(readFileSync('apps/android/assets/brand/logo-horizontal-dark.png'))})
   expect(Array.from(x.slice(0,5))).toEqual([37,80,68,70,45])
   const doc=await PDFDocument.load(x)
   expect(doc.getPageCount()).toBe(1)
   for(const p of doc.getPages()){
     expect(Math.abs(p.getWidth()-595.28)).toBeLessThan(1)
     expect(Math.abs(p.getHeight()-841.89)).toBeLessThan(1)
   }
 })
})
