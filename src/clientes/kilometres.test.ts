import {expect,it} from 'vitest'
import {parseKilometres} from './kilometres'
it('normalizes plain and Chilean grouped mileage without accepting ambiguous decimals',()=>{
 for(const raw of ['120000','120.000',' 120.000 '])expect(parseKilometres(raw)).toBe(120000)
 expect(parseKilometres('')).toBeNull();expect(parseKilometres('0')).toBe(0);expect(parseKilometres('3.000.000')).toBe(3000000)
 for(const raw of ['120.00','120,000','120.5','-1','1e5','1 000','0.120','3.000.001','120.000.0'])expect(()=>parseKilometres(raw)).toThrow()
})
