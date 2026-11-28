/** Emits an offline registry SQL candidate, never connects or enables gates. */
import {readFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
const paths={font:'public/cp05/DejaVuSans.ttf',light:'apps/android/assets/brand/logo-horizontal.png',dark:'apps/android/assets/brand/logo-horizontal-dark.png',template:'src/informes/multipunto/multipuntoTemplate.ts',rendererSource:'server/multipunto/renderer.ts',layoutSource:'server/multipunto/pdfLayout.ts',legacyRendererSource:'server/multipunto/rendererV1.ts',approvedLayoutSource:'src/ordenes/cp04InspectionPdf.ts',projectionSource:'server/multipunto/snapshot.ts'}
const p={renderer:'BT-MP-FINAL-2',canonical:'MP-SNAPSHOT-2/PG17'}
for(const [k,path]of Object.entries(paths))p[k]=createHash('sha256').update(await readFile(path)).digest('hex')
const json=JSON.stringify(p).replaceAll("'","''")
console.log(`-- Offline registry candidate. No gates or buckets are enabled.\nINSERT INTO bt_multipunto_private.policy(id,definition,sha256) SELECT 'MP-V2-3',v,bt_multipunto_private.hash(v::text) FROM (SELECT '${json}'::jsonb v) p;`)
