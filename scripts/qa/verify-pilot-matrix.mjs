/** BT-PILOT-QA-01: validador de matriz OFFLINE. No confirma pruebas de producto. */
import assert from 'node:assert/strict'
import { readFileSync, existsSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..')
const manifestPath=resolve(root,'docs/qa/BT_PILOT_QA_01_CASES.json')
const matrixPath=resolve(root,'docs/qa/BT_PILOT_QA_01_MATRIZ_20261118.md')
const data=JSON.parse(readFileSync(manifestPath,'utf8'))
assert.equal(data.schema,'bytetorque.pilot.qa.v1')
assert.equal(data.stage,'BT-PILOT-QA-01')
assert.ok(data.cases.length>=30)
const codes=['C','S','F','D','B','N']
const platforms=['web','pwa','android']
const ids=new Set()
const gates=new Set()
const required=new Set(['G-BACKUP','G-AUTH','G-RLS','G-DATA','G-DOCS','G-PRIVACY','G-PLAN','G-DEVICE','G-RELEASE'])
function checkEvidence(paths) {
  assert.ok(Array.isArray(paths) && paths.length>0, 'Caso sin evidencia histórica/código')
  for(const p of paths){
    assert.equal(typeof p,'string')
    assert.ok(!p.includes('..')&&!p.startsWith('/')&&!p.includes('\\\\'),'Ruta no segura: '+p)
    assert.ok(existsSync(resolve(root,p)),'No existe la evidencia: '+p)
  }
}
for (const gate of data.gates){
  assert.ok(required.has(gate.id),'Puerta no autorizada: '+gate.id)
  assert.ok(!gates.has(gate.id),'Puerta duplicada: '+gate.id)
  gates.add(gate.id)
  assert.equal(gate.status,'bloqueado','NO se puede autoaprobar una puerta de producción')
  checkEvidence(gate.evidence)
}
assert.deepEqual(gates,required,'Falta una puerta de lanzamiento')
for (const c of data.cases) {
  assert.match(c.id,/^P\d{2}$/)
  assert.ok(!ids.has(c.id),'Caso duplicado: '+c.id)
  ids.add(c.id)
  assert.ok(['P0','P1','P2'].includes(c.priority))
  assert.ok(typeof c.acceptance==='string' && c.acceptance.length>=25)
  checkEvidence(c.evidence)
  assert.deepEqual(Object.keys(c.platforms).sort(),[...platforms].sort())
  assert.ok(platforms.some(k=>c.platforms[k]!=='N'))
  for (const p of platforms) {
    assert.ok(codes.includes(c.platforms[p]),'Estado no permitido: '+c.id+'/'+p)
    if(['C','S','F'].includes(c.platforms[p])) assert.ok(c.evidence.length>0)
  }
  for (const g of c.gate) assert.ok(gates.has(g),'Puerta desconocida: '+g)
  if(c.priority==='P0' && c.platforms.web==='B'&&c.platforms.pwa==='B'&&c.platforms.android==='B')
    assert.ok(c.gate.length>0,'P0 bloqueado sin puerta: '+c.id)
}
assert.ok(data.cases.some(c=>c.platforms.pwa==='F'),'Falta evidencia parcial Safari')
assert.ok(data.cases.some(c=>c.platforms.android==='C'),'Falta evidencia contratos Android')
assert.ok(data.cases.some(c=>c.gate.includes('G-BACKUP')))
const makeMd=(m)=>{
const counts={};for(const k of ['web','pwa','android'])counts[k]=Object.fromEntries(Object.keys(m.statuses).map(s=>[s,m.cases.filter(c=>c.platforms[k]===s).length]));
const cells=k=>Object.entries(counts[k]).map(([s,n])=>s+': '+n).join(' · ');
const ln=[
 "# ByteTorque — BT-PILOT-QA-01 · Matriz integral del piloto Ignacio",
 "",
 "**Fecha:** 18/11/2026 · **Rama:** `main` · **Estado:** auditoría preparada, **PILOTO NO APROBADO**.",
 "",
 "> **Lectura obligatoria:** C no significa que el flujo funcione con datos reales; S usa escenarios sintéticos; F es una prueba física parcial anterior y no valida la integración de hoy. Toda puerta G- permanece bloqueada hasta evidencia nueva y aprobación expresa. La matriz sirve para seguir el progreso, no para autorizar un despliegue.",
 "",
 "## Convenciones",
 "",
 "| Código | Significado |",
 "|---|---|",
 ...Object.entries(m.statuses).map(([k,v])=>"| **"+k+"** | "+v+" |"),
 "",
 "## Resumen por plataforma",
 "",
 "| Plataforma | Conteo por clasificación |",
 "|---|---|",
 "| Web/escritorio | "+cells('web')+" |",
 "| iPhone Safari/PWA | "+cells('pwa')+" |",
 "| Android nativo | "+cells('android')+" |",
 "",
 "## Matriz de aceptación",
 "",
 "| ID | Área | Prio. | Criterio comprobable | Web | iPhone PWA | Android | Puertas |",
 "|---|---|---|---|:---:|:---:|:---:|---|",
 ...m.cases.map(c=>`| ${c.id} | ${c.area} | ${c.priority} | ${c.acceptance} | ${c.platforms.web} | ${c.platforms.pwa} | ${c.platforms.android} | ${c.gate.join(', ')||'—'} |`),
 "",
 "## Evidencia trazable por caso",
 "",
 ...m.cases.flatMap(c=>[
  `### ${c.id} · ${c.area}`,
  "",
  `- Criterio: ${c.acceptance}`,
  `- Clasificación: **Web ${c.platforms.web} · PWA ${c.platforms.pwa} · Android ${c.platforms.android}**.`,
  ...c.evidence.map(p=>`- Evidencia histórica/código: [\`${p}\`](../../${p})`),
  ""
 ]),
 "## Puertas de habilitación — todas cerradas",
 "",
 "| Puerta | Requisito de aprobación | Estado |",
 "|---|---|---|",
 ...m.gates.map(g=>`| ${g.id} | ${g.description} | **BLOQUEADA** |`),
 "",
 "## Protocolo de ejecución del piloto",
 "",
 "1. Confirmar con Ignacio nomenclatura, flujos y criterios; usar datos totalmente ficticios durante QA previa. Ningún dato personal de clientes reales antes de privacidad, copias y restauración.",
 "2. **Antes de escribir en Supabase alojado:** repo privado para exportaciones sensibles, respaldo cifrado integral con hash/readback, ensayo de restauración en entorno aislado. Revisar SQL/Storage/Edge/flags y obtener autorización expresa por instalación.",
 "3. Verificar con cuentas autorizadas A/B los accesos, escritura y lectura de OT, historial, PDF, revocación de roles y rol mecánico; probar ausencia de fugas incluso por ID ajeno. Nunca restituir una membresía temporal antigua sin autorización.",
 "4. Con el backend protegido, realizar escenario completo de recepción → OT → 34 X/autoguardado → propuesta/revisión → respuesta → trabajos realizados → PDF R3/archivo privado → historial → entrega. Repetir en escritorio, Safari iPhone y Android APK interna **firmada con permiso**.",
 "5. Registrar por cada ejecución: fecha, versión/commit, plataforma/modelo/OS, perfil y taller ficticio, pasos, esperado, resultado observado, evidencia sin datos sensibles, incidencia, responsable y nuevo estado. **No sobrescribir C/S/F con PASS real** sin prueba correspondiente.",
 "6. En caso de falla de aislamiento, pérdida de datos, corrupción, descarga ajena, sesión inválida o restauración, detener inmediatamente el piloto; no probar con clientes verdaderos hasta subsanar y revalidar.",
 "",
 "## Comandos de auditoría sin red",
 "",
 "\`\`\`sh",
 "node scripts/qa/verify-pilot-matrix.mjs --check",
 "cd apps/android",
 "npm run test:contracts",
 "\`\`\`",
 "",
 "Las pruebas de contrato Android son sintéticas; la verificación de matriz solo valida **consistencia, trazabilidad y clasificación**, no ejecuta escenarios físicos o productivos.",
 "",
 "## Servicios deliberadamente intactos",
 "",
 "Ninguna migración SQL, cambio RLS alojado, cuenta de Ignacio, Storage, Edge, correo, cobro, OTA ni APK real fue activada por esta auditoría. El sitio Render/flag público no fue modificado. La preparación documental no sustituye un respaldo funcional."
 ];
 return ln.join("\n")+"\n";
};
const expected=makeMd(data)
if(process.argv.includes('--write')) {
  writeFileSync(matrixPath,expected,'utf8')
}else{
  const current=readFileSync(matrixPath,'utf8')
  assert.equal(current,expected,'La matriz Markdown difiere del JSON: ejecutar --write en la raíz')
}
const totals=Object.fromEntries(platforms.map(p=>[p,Object.fromEntries(codes.map(s=>[s,data.cases.filter(c=>c.platforms[p]===s).length]))]))
console.log('BT-PILOT-QA-01: matriz coherente, '+data.cases.length+' casos, '+gates.size+' puertas bloqueadas; evidencia local verificada (NO QA productiva).')
console.log(JSON.stringify(totals))
