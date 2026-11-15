/**
 * R2-A6-P2: injectable HTTP-only mock transport; NO network implementation.
 * Never uses fetch, credentials from env, SMTP, or Supabase. The injected
 * adapter is synthetic unless a future authorized server supplies a transport.
 */
import { buildResendInviteRequest, classifyResendReply, type ResendRequest } from './resendInviteCandidate.ts'
import type { DeliveryProvider, DeliveryReceipt, ImmutableDeliveryRequest } from './inviteDeliveryAdapter.ts'

export type InjectedResendHttpResponse = Readonly<{
  status: number
  json: () => Promise<unknown>
}>
export type InjectedResendHttp = (
  request: ResendRequest, signal: AbortSignal
) => Promise<InjectedResendHttpResponse>
const retry: DeliveryReceipt = { accepted: false, retryable: true }
const terminal: DeliveryReceipt = { accepted: false, retryable: false }

/** The email sender is frozen and must match the current authorized sender. */
export function createResendHttpCandidate(
  config: Readonly<{ apiKey: string; fromEmail: string }>,
  http: InjectedResendHttp,
  timeoutMs = 8_000
): DeliveryProvider {
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30000)
    throw new TypeError('Invalid HTTP timeout')
  return async (input) => {
    let req: ResendRequest
    try {
      req = buildResendInviteRequest(input as ImmutableDeliveryRequest, config)
    } catch {
      return terminal
    }
    const controller = new AbortController()
    let timer: ReturnType<typeof setTimeout> | undefined
    const timeout = new Promise<DeliveryReceipt>(resolve => {
      timer = setTimeout(() => { controller.abort(); resolve(retry) }, timeoutMs)
    })
    const attempt: Promise<DeliveryReceipt> = Promise.resolve()
      .then(() => http(req, controller.signal))
      .then(async response => {
        if (!response || !Number.isInteger(response.status) ||
            response.status < 100 || response.status > 599) return retry
        const body: unknown = await response.json().catch(() => ({}))
        return classifyResendReply(response.status, body)
      }).catch(() => retry)
    try {
      // A late 2xx after timeout is ambiguous; the worker must NOT ack it.
      return await Promise.race([attempt, timeout])
    } finally {
      if (timer !== undefined) clearTimeout(timer)
    }
  }
}
