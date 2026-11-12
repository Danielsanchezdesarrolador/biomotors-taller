import { describe, expect, it } from 'vitest'
import { calculateTotals, completedInspections, exampleItems, initialInspection } from './detalleData'
describe('Detalle OT — cálculos y revisión DEMO',()=>{
  it('calcula mano de obra fraccionaria y redondea IVA al peso',()=>{
    expect(exampleItems[2].quantity*exampleItems[2].price).toBe(37350)
    expect(calculateTotals(exampleItems)).toEqual({subtotal:130150,tax:24729,total:154879})
  })
  it('recalcula al agregar ítems, admite precio cero y rechaza valores inválidos',()=>{
    expect(calculateTotals([...exampleItems,{id:'nuevo',description:'Prueba',type:'Repuesto',quantity:2,price:1000}]).total).toBe(157259)
    expect(calculateTotals([]).total).toBe(0)
    for(const quantity of [0,-1,Infinity,NaN]) expect(()=>calculateTotals([{...exampleItems[0],quantity}])).toThrow(RangeError)
    expect(()=>calculateTotals([{...exampleItems[0],price:-1}])).toThrow(RangeError)
  })
  it('cuenta atención como revisado y actualiza pendientes sin inventar 5 de 8',()=>{
    expect(completedInspections(initialInspection)).toBe(6)
    expect(completedInspections({...initialInspection,fluidos:'correcto'})).toBe(7)
    expect(completedInspections({...initialInspection,aceite:'no-revisado'})).toBe(5)
    expect(completedInspections({})).toBe(0)
  })
})
