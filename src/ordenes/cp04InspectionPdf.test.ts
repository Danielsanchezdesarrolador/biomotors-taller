import {describe,it,expect} from 'vitest'
import {multipuntoPdfModel,multipuntoPdf} from './cp04InspectionPdf'
import {readFileSync} from 'node:fs'
import {PDFDocument} from 'pdf-lib'
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
 it('creates a real A4 PDF with many pages for long technician notes',async()=>{
   const font=new Uint8Array(readFileSync('public/cp05/DejaVuSans.ttf'))
   const x=await multipuntoPdf({workshopName:'Taller de ensayo',order,findings:[
     finding('Multipunto · Pastillas de freno','attention','Desgaste '.repeat(210))
   ]},font)
   expect(Array.from(x.slice(0,5))).toEqual([37,80,68,70,45])
   const doc=await PDFDocument.load(x)
   expect(doc.getPageCount()).toBeGreaterThan(1)
   for(const p of doc.getPages()){
     expect(Math.abs(p.getWidth()-595.28)).toBeLessThan(1)
     expect(Math.abs(p.getHeight()-841.89)).toBeLessThan(1)
   }
 })
})
