import { readFileSync, readdirSync } from 'node:fs'
import assert from 'node:assert/strict'
const workshopsEnabled = process.env.VITE_BT_PLAN04_WORKSHOPS_ENABLED === 'true'
if (workshopsEnabled) assert.equal(process.env.VITE_BT_PLAN04_PRIVATE_ENABLED,'true','Workshop management requires confirmed account plans')
const modules = JSON.parse(readFileSync('dist/.vite/public-modules.json', 'utf8'))
assert.ok(modules.length > 0)
// The offline handoff cannot enter the publicly deployed PWA until a separate
// authenticated, server-backed invitation rollout is explicitly authorized.
if (!workshopsEnabled) assert.ok(
  modules.every((id) => !/inviteHandoffCandidate\.(?:ts|tsx|js)/.test(id)),
  'Forbidden dormant invite handoff was bundled into public PWA'
)
// The session-aware flow remains an offline candidate, not production UI.
assert.ok(
  modules.every((id) => !/inviteSessionCandidate\.(?:ts|tsx|js)/.test(id)),
  'Forbidden invite session candidate was bundled into public PWA'
)
// Lifecycle listener adapter is an unpublished, injected-browser candidate.
assert.ok(
  modules.every((id) => !/inviteBrowserLifecycleCandidate\.(?:ts|tsx|js)/.test(id)),
  'Forbidden invite lifecycle candidate was bundled into public PWA'
)
if (!workshopsEnabled) assert.ok(modules.every(id=>!id.includes('src/workshops/')),'Workshop candidates must stay excluded until rollout')
const cp06PrivateEnabled=process.env.VITE_BT_CP06_PRIVATE_ENABLED==='true'
if(cp06PrivateEnabled)assert.equal(process.env.VITE_BT_CP04_PRIVATE_ENABLED,'true','CP06 requires CP04')
if(!cp06PrivateEnabled)assert.ok(modules.every(id=>!id.includes('src/historial/')),'CP06 must remain excluded by default')
const creatorPrivateEnabled = process.env.VITE_BT_CREATOR_PRIVATE_ENABLED === 'true'
if (creatorPrivateEnabled)
  assert.equal(process.env.VITE_BT_AUTH_R1_ENABLED, 'true', 'Creator private entry requires Auth')
else
  assert.ok(modules.every(id => !id.includes('src/creator/')),
    'Creator privileged console must be absent from the public/off build')
const plan04PrivateEnabled = process.env.VITE_BT_PLAN04_PRIVATE_ENABLED === 'true'
if (plan04PrivateEnabled) {
  assert.equal(process.env.VITE_BT_CREATOR_PRIVATE_ENABLED,'true','Personal plan UI needs private creator gate')
  assert.equal(process.env.VITE_BT_AUTH_R1_ENABLED,'true','Personal plan UI needs Auth')
}
assert.ok(modules.every(id => !id.includes('src/plans/') || /src\/plans\/(?:planStatus\.ts|PlanBadge\.tsx|planBadge\.css)$/.test(id) ||
  (plan04PrivateEnabled && /src\/plans\/planChanges\.ts$/.test(id))),
  'Only pure plan presentation and explicitly gated invalidation may enter the app')
const finalArchiveEnabled=process.env.VITE_BT_FINAL_ARCHIVE_ENABLED==='true'
if(finalArchiveEnabled){for(const flag of ['VITE_BT_CP03_PRIVATE_ENABLED','VITE_BT_CP05_PRIVATE_ENABLED','VITE_BT_CP06_PRIVATE_ENABLED'])assert.equal(process.env[flag],'true','Final archive requires private history')}
else assert.ok(modules.every(id=>!id.includes('src/expedientes/')),'Final archive must stay excluded while OFF')
const recordsEnabled = process.env.VITE_BT_RECORDS_PRIVATE_ENABLED === 'true'
if(recordsEnabled) assert.equal(process.env.VITE_BT_CP03_PRIVATE_ENABLED,'true','Record management requires private directory')
else assert.ok(modules.every(id=>!id.includes('src/records/')),'Record management must stay excluded until approved rollout')
const cp03PrivateEnabled = process.env.VITE_BT_CP03_PRIVATE_ENABLED === 'true'
const cp05PrivateEnabled = process.env.VITE_BT_CP05_PRIVATE_ENABLED === 'true'
const flowLiveEnabled = process.env.VITE_BT_FLOW_LIVE_02_ENABLED === 'true'
const closingReviewEnabled = process.env.VITE_BT_COM_01D_PREVIEW_ENABLED === 'true'
if (closingReviewEnabled) {
  assert.equal(flowLiveEnabled, true,
    'Cierre documental needs verified historical declarations')
  assert.equal(cp06PrivateEnabled, true,
    'Cierre documental needs private CP06 history')
  assert.equal(process.env.VITE_BT_CP05_DOCUMENTS_ENABLED, 'true',
    'Cierre documental needs private CP05 archive gate')
} else {
  assert.ok(modules.every(id => !/src\/historial\/ClosingReviewPanel\.(?:ts|tsx|js)$/.test(id)),
    'Closing review candidate must not appear in OFF/public bundles')
  assert.ok(modules.every(id => !/src\/entrega\/closingZip\.(?:ts|tsx|js)$/.test(id)),
    'Closing ZIP must not appear in OFF/public bundles')
}
if (flowLiveEnabled) {
  assert.equal(process.env.VITE_BT_CP05_DOCUMENTS_ENABLED,'true',
    'Flow live requires private document archive')
  assert.equal(process.env.VITE_BT_CP05_PRIVATE_ENABLED,'true',
    'Flow live requires authenticated CP05')
} else {
  assert.ok(modules.every(id => !/src\/entrega\/(?:FlowLive02Panel|flowLiveCandidate|finalPackage|finalPdf)\./.test(id)),
    'Flow live candidate must remain absent from OFF/public builds')
}
if (cp05PrivateEnabled)
  assert.equal(process.env.VITE_BT_CP04_PRIVATE_ENABLED, 'true', 'CP05 requires CP04')
if (!cp05PrivateEnabled)
  assert.ok(
    modules.every((id) => !id.includes('src/cp05/')),
    'CP05 disabled by default'
  )
const cp04PrivateEnabled = process.env.VITE_BT_CP04_PRIVATE_ENABLED === 'true'
if (cp04PrivateEnabled) {
  assert.equal(process.env.VITE_BT_AUTH_R1_ENABLED, 'true', 'CP04 requires verified R1')
  assert.equal(process.env.VITE_BT_CP03_PRIVATE_ENABLED, 'true', 'CP04 requires CP03')
}
if (!cp04PrivateEnabled) {
  assert.ok(
    modules.every(
      (id) =>
        !/(?:Cp04(?:PrivatePanel|OrdersView|MultipuntoChecklist|MultipuntoPdfPreview)|cp04(?:Contracts|Repository|Draft|Multipunto|Autosave|InspectionPdf))\.(?:ts|tsx|js)/.test(
          id
        )
    ),
    'CP04 must not be shipped without hosted SQL and private rollout authorization'
  )
}
if (cp03PrivateEnabled)
  assert.equal(
    process.env.VITE_BT_AUTH_R1_ENABLED,
    'true',
    'Private CP03 requires R1 authenticated build'
  )
// CP03 is an unapproved data-access candidate: no customers may be loaded
// or written by the deployed official presentation until the Director gates it.
if (!cp03PrivateEnabled) {
  assert.ok(
    modules.every(
      (id) =>
        !/(?:Cp06HistoryLoader|Cp03PrivatePanel|cp03Pilot(?:Repository|Contracts|DirectoryView|AccessBinding))\.(?:ts|tsx|js)/.test(
          id
        )
    ),
    'Unapproved CP03 customer/vehicle repository in public PWA'
  )
}
assert.ok(
  modules.every(
    (id) =>
      id.endsWith('.css') ||
      (cp04PrivateEnabled && /src\/documents\/(?:operation\.ts|DocumentOperationNotice\.tsx)$/.test(id)) ||
      (creatorPrivateEnabled && /src\/creator\//.test(id)) ||
      (workshopsEnabled && /src\/workshops\//.test(id)) ||
      (process.env.VITE_BT_AGENDA_ENABLED==='true' && /src\/agenda\//.test(id)) ||
      (finalArchiveEnabled && flowLiveEnabled && /src\/guided\/(?:GuidedWorkspace|progress|continuity|OperationsCenter|operations)\.(?:tsx|ts)$/.test(id)) ||
      (finalArchiveEnabled && /src\/expedientes\//.test(id)) ||
      (recordsEnabled && /src\/records\//.test(id)) ||
      (cp06PrivateEnabled&&/src\/historial\//.test(id)) ||
      (cp05PrivateEnabled &&
        /src\/(?:cp05\/|entrega\/(?:WorkExecutionDraft|executionPreview|executionPdf)\.|informes\/trabajos\/(?:WorkItemsEditor|workItemCore)\.|ordenes\/orderMoney\.)/.test(
          id
        )) ||
      (flowLiveEnabled &&
        /src\/entrega\/(?:FlowLive02Panel|flowLiveCandidate|finalPackage|finalPdf)\.(?:ts|tsx|js)$/.test(id)) ||
      (closingReviewEnabled && flowLiveEnabled && cp06PrivateEnabled &&
        process.env.VITE_BT_CP05_DOCUMENTS_ENABLED === 'true' &&
        /src\/entrega\/closingZip\.(?:ts|tsx|js)$/.test(id)) ||
      ((cp03PrivateEnabled||cp04PrivateEnabled)&&/src\/clientes\/kilometres\.ts$/.test(id)) ||
      /src\/plans\/(?:planStatus\.ts|PlanBadge\.tsx|planBadge\.css)$/.test(id) ||
      (plan04PrivateEnabled && /src\/plans\/planChanges\.ts$/.test(id)) ||
      /src\/(?:main\.tsx|App\.tsx|layout\/|official\/|access\/|brand\/|auth\/)/.test(id) ||
      (cp03PrivateEnabled &&
        /src\/clientes\/(?:Cp06HistoryLoader|Cp03PrivatePanel|cp03Pilot(?:Repository|Contracts|DirectoryView|AccessBinding))\.(?:ts|tsx|js)/.test(
          id
        )) ||
      (cp04PrivateEnabled &&
        /src\/ordenes\/(?:Cp04(?:PrivatePanel|OrdersView|MultipuntoChecklist|MultipuntoPdfPreview)|cp04(?:Contracts|Repository|Draft|Multipunto|Autosave|InspectionPdf))\.(?:ts|tsx|js)/.test(
          id
        )) ||
      (cp04PrivateEnabled &&
        /src\/informes\/multipunto\/(?:MultipuntoTable|multipuntoTemplate)\.(?:ts|tsx|js)/.test(id))
  )
)
for (const name of readdirSync('dist/assets')) {
  if (!/\.(js|css)$/.test(name)) continue
  const text = readFileSync('dist/assets/' + name, 'utf8')
  if (name.endsWith('.js')) assert.doesNotMatch(text, /TallerFlow/)
  assert.doesNotMatch(text, /sb_secret_[A-Za-z0-9_-]{10,}/)
  assert.doesNotMatch(
    text,
    /OT-100[1-8]|workshop-demo|DEMO-KZV|@example\.com|Camila Muñoz|demoWorkOrders|tests\/fixtures|WorkflowApp|revision\.admin@bytetorque\.test|VistaBT-2026!|private_browser_stub|synthetic-refresh-token|browser-stub@invalid\.test/
  )
}
const manifest = JSON.parse(readFileSync('dist/manifest.webmanifest', 'utf8'))
assert.match(manifest.name, /ByteTorque/)
assert.equal(manifest.short_name, 'ByteTorque')
console.log('Public module graph, fixture exclusion and ByteTorque PWA identity: PASS')

if(process.env.VITE_BT_AGENDA_ENABLED!=='true')assert.ok(modules.every(id=>!id.includes('src/agenda/')),'Agenda must remain excluded while OFF')

if(process.env.VITE_BT_AGENDA_ENABLED==='true')for(const flag of ['VITE_BT_AUTH_R1_ENABLED','VITE_BT_CP03_PRIVATE_ENABLED','VITE_BT_CP04_PRIVATE_ENABLED','VITE_BT_CP05_PRIVATE_ENABLED','VITE_BT_CP06_PRIVATE_ENABLED','VITE_BT_CP05_DOCUMENTS_ENABLED','VITE_BT_FLOW_LIVE_02_ENABLED','VITE_BT_FINAL_ARCHIVE_ENABLED','VITE_BT_RECORDS_PRIVATE_ENABLED'])assert.equal(process.env[flag],'true','Agenda needs private prerequisites')

assert.ok(modules.every(id=>!/(?:src\/cp05\/pdf\.ts|src\/ordenes\/cp04InspectionPdf\.ts)$/.test(id)),'Official document renderers must stay server-side; browser cannot export clean unmetered PDFs')

if(!cp04PrivateEnabled)assert.ok(modules.every(id=>!id.includes('src/documents/')),'Private document operation metadata and renewal UI must stay out of the public bundle')
