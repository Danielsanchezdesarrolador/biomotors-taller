import {build} from 'rolldown'
import {resolve} from 'node:path'
const output=resolve(process.argv[2]||'/tmp/bt-plan04bc-evidence/lab-entry.mjs')
if(output.startsWith(resolve('.')+'/'))throw Error('LAB_OUTPUT_MUST_BE_OUTSIDE_REPOSITORY')
await build({input:'tests/plan04bcPilotLab.ts',platform:'node',external:['@supabase/supabase-js'],output:{file:output,format:'es'}})
