import { useSyncExternalStore } from 'react'
import { sessionRevision, subscribeSession } from './sessionSignal'
export function useDemoSession() {
  return useSyncExternalStore(subscribeSession, sessionRevision, sessionRevision)
}
