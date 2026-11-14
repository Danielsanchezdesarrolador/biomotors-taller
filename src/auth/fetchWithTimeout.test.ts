import { describe, it, expect, vi, afterEach } from 'vitest'
import { fetchWithTimeout } from './fetchWithTimeout'
afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})
describe('Auth network timeout', () => {
  it('aborts a stalled request and clears its timer', async () => {
    vi.useFakeTimers()
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_input, init: RequestInit) =>
          new Promise((_, reject) => {
            init.signal?.addEventListener('abort', () =>
              reject(new DOMException('Stopped', 'AbortError'))
            )
          })
      )
    )
    const pending = expect(fetchWithTimeout('https://invalid.test')).rejects.toMatchObject({
      name: 'AbortError'
    })
    await vi.advanceTimersByTimeAsync(12000)
    await pending
    expect(vi.getTimerCount()).toBe(0)
  })
  it('preserves caller cancellation and clears timeout after success', async () => {
    vi.useFakeTimers()
    const external = new AbortController()
    external.abort()
    const request = vi.fn(async (_input, init: RequestInit) => {
      expect(init.signal?.aborted).toBe(true)
      return new Response('ok')
    })
    vi.stubGlobal('fetch', request)
    expect(
      (await fetchWithTimeout('https://invalid.test', { signal: external.signal })).status
    ).toBe(200)
    expect(vi.getTimerCount()).toBe(0)
  })
})
