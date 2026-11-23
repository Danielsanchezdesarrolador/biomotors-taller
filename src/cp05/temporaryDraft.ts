/** Unsaved edits only, same tab, 8h, never an authorization or a server save. */
import { draftPayload, quoteId, type Draft } from './contracts'
const key = 'bt:cp05:unsaved:v1',
  ttl = 8 * 3600000
export type LocalDraft = {
  userId: string
  workshopId: string
  quoteId: string
  version: number
  draft: Draft
  requestId: string
  fingerprint: string
  at: number
  committedVersion?:number
}
export function rememberDraft(value: LocalDraft) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* memory-only UI remains usable */
  }
}
export function localDraft(userId: string, workshopId: string): LocalDraft | null {
  try {
    const data: LocalDraft = JSON.parse(sessionStorage.getItem(key) || 'null')
    if (
      data &&
      data.userId === userId &&
      data.workshopId === workshopId &&
      Number.isFinite(data.at) &&
      Date.now() >= data.at &&
      Date.now() - data.at < ttl
    ) {
      quoteId(data.quoteId)
      quoteId(data.requestId)
      if (
        !Number.isSafeInteger(data.version) ||
        data.version < 1 ||
        typeof data.fingerprint !== 'string' ||
        (data.committedVersion!==undefined&&(!Number.isSafeInteger(data.committedVersion)||data.committedVersion<data.version))
      )
        throw Error('Invalid draft')
      draftPayload(data.draft)
      return data
    }
  } catch {
    /* no untrusted content rendered */
  }
  clearLocalDraft()
  return null
}
export function clearLocalDraft() {
  try {
    sessionStorage.removeItem(key)
  } catch {
    /* best effort */
  }
}

/** The hint does not authorize data; a fresh repository load must confirm it. */
export function rememberCommittedDraft(userId:string,workshopId:string,quoteId:string,version:number){
 const current=localDraft(userId,workshopId)
 if(current?.quoteId===quoteId&&version>=current.version)
   rememberDraft({...current,committedVersion:version})
}
