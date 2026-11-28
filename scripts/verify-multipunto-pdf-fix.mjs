import {build} from 'rolldown'
import {execFileSync} from 'node:child_process'
await build({input:'tests/multipunto/pdfFix.ts',platform:'node',external:['node:child_process','node:fs/promises','node:crypto','node:assert/strict'],output:{file:'/tmp/bt-mpf-pdf-fix.mjs',format:'esm'}})
execFileSync(process.execPath,['/tmp/bt-mpf-pdf-fix.mjs'],{stdio:'inherit',env:process.env})

await build({input:'tests/multipunto/pdfFixExtra.ts',platform:'node',external:['node:child_process','node:fs/promises','node:crypto','node:assert/strict'],output:{file:'/tmp/bt-mpf-pdf-fix-extra.mjs',format:'esm'}})
execFileSync(process.execPath,['/tmp/bt-mpf-pdf-fix-extra.mjs'],{stdio:'inherit',env:process.env})
