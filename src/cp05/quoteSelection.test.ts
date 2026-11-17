import { describe, expect, it } from 'vitest'
import { readQuoteSelection, rememberQuoteSelection, clearQuoteSelection } from './quoteSelection'

const id = '11111111-1111-4111-8111-111111111111'
const workshop = '22222222-2222-4222-8222-222222222222'
const quote = '33333333-3333-4333-8333-333333333333'
const now = 1794950100000

function memoryStore() {
  const values = new Map<string,string>()
  return {
    values,
    getItem: (k:string) => values.get(k) ?? null,
    setItem: (k:string,v:string) => { values.set(k,v) },
    removeItem: (k:string) => { values.delete(k) }
  }
}
describe('CP05 quote selection continuity', () => {
  it('restores a saved quote after navigating away while keeping only IDs', () => {
    const store = memoryStore()
    rememberQuoteSelection(id, workshop, quote, store, now)
    expect(readQuoteSelection(id, workshop, store, now+60_000)).toBe(quote)
    const persisted = JSON.stringify([...store.values.values()])
    expect(persisted).not.toContain('QA1234')
    expect(persisted).not.toContain('cliente')
    expect(persisted).not.toContain('password')
  })
  it('never restores a selection to another account or workshop', () => {
    const store = memoryStore()
    rememberQuoteSelection(id, workshop, quote, store, now)
    expect(readQuoteSelection('44444444-4444-4444-8444-444444444444', workshop, store, now)).toBeNull()
    expect(readQuoteSelection(id, '55555555-5555-4555-8555-555555555555', store, now)).toBeNull()
  })
  it('expires the hint after eight hours and ignores future/corrupt values', () => {
    const store = memoryStore()
    rememberQuoteSelection(id, workshop, quote, store, now)
    expect(readQuoteSelection(id,workshop,store,now+8*60*60*1000)).toBeNull()
    expect(readQuoteSelection(id,workshop,store,now-1)).toBeNull()
    store.setItem('bt:cp05:selected-quote:v1', '{"quoteId":"invalid"}')
    expect(readQuoteSelection(id,workshop,store,now)).toBeNull()
  })
  it('discards selection on logout or workshop change', () => {
    const store = memoryStore()
    rememberQuoteSelection(id,workshop,quote,store,now)
    clearQuoteSelection(store)
    expect(readQuoteSelection(id,workshop,store,now+1)).toBeNull()
  })
})
