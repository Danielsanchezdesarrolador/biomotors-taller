// Inspect the actual official source template, not a parallel list.
import {mkdtemp} from 'node:fs/promises'
import {pathToFileURL} from 'node:url'
import {build} from 'rolldown'
const dir=await mkdtemp('/tmp/bt-mp-items-'),path=dir+'/items.mjs'
await build({input:'src/ordenes/cp04Multipunto.ts',platform:'node',output:{file:path,format:'esm'}})
const {multipuntoTemplateItems}=await import(pathToFileURL(path).href)
console.log(JSON.stringify(multipuntoTemplateItems()))
