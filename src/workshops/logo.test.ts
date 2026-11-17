import {describe,it,expect} from 'vitest'
import {validLogoHeader} from './logo'
describe('Private workshop logo input, no upload',()=>{
 const png=new Uint8Array([137,80,78,71,13,10,26,10])
 it('allows only bounded PNG/JPEG signatures, never SVG or content disguised by extension',()=>{
  expect(validLogoHeader('image/png',100,png)).toBe(true)
  expect(validLogoHeader('image/svg+xml',100,png)).toBe(false)
  expect(validLogoHeader('image/png',100,new TextEncoder().encode('<script>'))).toBe(false)
  expect(validLogoHeader('image/png',2097153,png)).toBe(false)
  expect(validLogoHeader('image/jpeg',100,new Uint8Array([255,216,255,0,0,0,0,0]))).toBe(true)
 })
})
