import { describe, expect, it, vi } from 'vitest'
import { commitAndRefresh } from './confirmedWrite'

describe('BT-PILOT-QA-04 — confirmed mutation versus readback', () => {
  it('returns the saved identity and refreshes only after a confirmed write', async () => {
    const sequence: string[] = []
    const saved = { id: 'ot-fixture-01' }
    const result = await commitAndRefresh(
      async () => { sequence.push('write'); return saved },
      (committed) => { expect(committed).toBe(saved); sequence.push('committed') },
      async (committed) => {
        expect(committed.id).toBe(saved.id)
        sequence.push('refresh')
        return true
      }
    )
    expect(sequence).toEqual(['write', 'committed', 'refresh'])
    expect(result).toEqual({ saved, viewRefreshed: true })
  })

  it('never asks for a second write when the post-commit read throws', async () => {
    const createOrder = vi.fn(async () => ({ id: 'ot-fixture-02' }))
    const readOrder = vi.fn(async () => { throw Error('private backend detail') })
    const confirmed = vi.fn()
    const result = await commitAndRefresh(createOrder, confirmed, readOrder)
    expect(result).toEqual({
      saved: { id: 'ot-fixture-02' },
      viewRefreshed: false
    })
    expect(createOrder).toHaveBeenCalledTimes(1)
    expect(confirmed).toHaveBeenCalledTimes(1)
    expect(readOrder).toHaveBeenCalledTimes(1)
  })

  it('preserves a saved record even when the refresh returns false', async () => {
    const stored = { id: 'customer-fixture-01' }
    const result = await commitAndRefresh(
      async () => stored,
      () => {},
      async () => false
    )
    expect(result.saved).toBe(stored)
    expect(result.viewRefreshed).toBe(false)
  })

  it('does not issue a refresh or report confirmation when the write fails', async () => {
    const confirmed = vi.fn()
    const refresh = vi.fn(async () => true)
    await expect(commitAndRefresh(
      async () => { throw Error('write not confirmed') },
      confirmed,
      refresh
    )).rejects.toThrow('write not confirmed')
    expect(confirmed).not.toHaveBeenCalled()
    expect(refresh).not.toHaveBeenCalled()
  })
})
