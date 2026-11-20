/**
 * BT-PILOT-QA-04 — A confirmed server write and its subsequent UI refresh are
 * different outcomes. Never turn a successful write into a "retry save" error
 * just because an independent read failed.
 *
 * Candidate-only, no persistence, network client, secrets or server bypass.
 */
export type ConfirmedWrite<T> = Readonly<{
  saved: T
  viewRefreshed: boolean
}>

export async function commitAndRefresh<T>(
  commit: () => Promise<T>,
  onCommitted: (saved: T) => void,
  refresh: (saved: T) => Promise<boolean>
): Promise<ConfirmedWrite<T>> {
  // A rejected write has NOT been confirmed. Do not run readback in that case.
  const saved = await commit()
  // From this point onward the write is confirmed by its server response.
  onCommitted(saved)
  let viewRefreshed = false
  try {
    viewRefreshed = (await refresh(saved)) === true
  } catch {
    // A readback error must not be confused with failure of the committed write.
  }
  return { saved, viewRefreshed }
}
