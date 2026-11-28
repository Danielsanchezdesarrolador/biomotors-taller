#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
export BT_MPF_LAB="${BT_MPF_LAB:-bt-mpf-development}"
node --input-type=module - <<'JS'
import {build} from 'rolldown'
await build({output:{file:'/tmp/bt-mpf-run.mjs',format:'esm'},input:'tests/multipunto/run.ts',platform:'node',external:['node:child_process','node:fs/promises','node:crypto','node:assert/strict'],resolve:{conditionNames:['node','import','default']}})

JS
node /tmp/bt-mpf-run.mjs
if [[ -z "${BT_MPF_RESUME_FROM:-}" ]]; then
node --input-type=module - <<'JS'
import {build} from 'rolldown';await build({input:'tests/multipunto/extra.ts',platform:'node',external:['node:child_process','node:fs/promises','node:crypto','node:assert/strict'],output:{file:'/tmp/bt-mpf-extra.mjs',format:'esm'}})
JS
node /tmp/bt-mpf-extra.mjs
node --input-type=module - <<'JS'
import {build} from 'rolldown';await build({input:'tests/multipunto/compat.ts',platform:'node',external:['node:child_process','node:fs/promises','node:crypto','node:assert/strict'],output:{file:'/tmp/bt-mpf-compat.mjs',format:'esm'}})
JS
node /tmp/bt-mpf-compat.mjs
fi
