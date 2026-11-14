// Bound network stalls without relying on AbortSignal.any (older iPhone Safari).
export async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit) {
  const controller = new AbortController()
  const abort = () => controller.abort()
  if (init?.signal?.aborted) abort()
  else init?.signal?.addEventListener('abort', abort, { once: true })
  const timer = setTimeout(abort, 12000)
  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
    init?.signal?.removeEventListener('abort', abort)
  }
}
