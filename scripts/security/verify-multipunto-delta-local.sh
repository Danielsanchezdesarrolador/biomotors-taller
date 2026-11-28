#!/usr/bin/env bash
# Only RI-01..05 and directly affected complements; never historical suites.
set -euo pipefail
cd "$(dirname "$0")/../.."
node --input-type=module - <<'JS'
import {build} from 'rolldown'
await build({input:'tests/multipunto/delta.ts',platform:'node',external:['node:child_process','node:fs/promises','node:crypto','node:assert/strict'],output:{file:'/tmp/bt-mpf-delta.mjs',format:'esm'}})
JS
node /tmp/bt-mpf-delta.mjs

if [[ -z "${BT_MPF_DELTA_ONLY:-}" ]]; then
node --input-type=module - <<'JS'
import {build} from 'rolldown'
await build({input:'tests/multipunto/deltaLegacy.ts',platform:'node',external:['node:child_process','node:fs/promises','node:crypto','node:assert/strict'],output:{file:'/tmp/bt-mpf-delta-legacy.mjs',format:'esm'}})
JS
node /tmp/bt-mpf-delta-legacy.mjs
node --input-type=module - <<'JS'
import {build} from 'rolldown'
await build({input:'tests/multipunto/deltaV1.ts',platform:'node',external:['node:child_process','node:fs/promises','node:crypto','node:assert/strict'],output:{file:'/tmp/bt-mpf-delta-v1.mjs',format:'esm'}})
JS
node /tmp/bt-mpf-delta-v1.mjs
node --input-type=module - <<'JS'
import {build} from 'rolldown'
await build({input:'tests/multipunto/deltaStatus.ts',platform:'node',external:['node:child_process','node:fs/promises','node:crypto','node:assert/strict'],output:{file:'/tmp/bt-mpf-delta-status.mjs',format:'esm'}})
JS
node /tmp/bt-mpf-delta-status.mjs
fi
