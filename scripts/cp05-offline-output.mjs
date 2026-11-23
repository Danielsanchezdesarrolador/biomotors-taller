// Destination guards only; no directories, processes, network or credentials.
import { existsSync, lstatSync } from 'node:fs'
import { resolve, relative, isAbsolute, dirname } from 'node:path'
import { tmpdir } from 'node:os'

function within(parent, child) {
  const rel = relative(parent, child)
  return rel !== '' && rel !== '..' && !rel.startsWith('..\\') &&
    !rel.startsWith('../') && !isAbsolute(rel)
}

export function offlineOutput(candidate, workspace, tempRoot = tmpdir()) {
  const out = resolve(candidate), base = resolve(tempRoot), repo = resolve(workspace)
  if (!within(base, out) || out === repo || within(repo, out) || within(out, repo))
    throw Error('OUTPUT_MUST_BE_NEW_NATIVE_TEMP_CHILD_OUTSIDE_REPOSITORY')
  if (existsSync(out)) throw Error('EXISTING_OUTPUT_MUST_NOT_BE_OVERWRITTEN')
  for (let part = out; ; part = dirname(part)) {
    if (existsSync(part) && (lstatSync(part).isSymbolicLink() || !lstatSync(part).isDirectory()))
      throw Error('OUTPUT_ANCESTOR_LINK_OR_NON_DIRECTORY')
    if (dirname(part) === part) break
  }
  return out
}
