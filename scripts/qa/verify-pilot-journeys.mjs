/** BT-PILOT-QA-02 · Valida cobertura y formato; NUNCA certifica un piloto ni guarda evidencias reales. */
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..')
const file=(p)=>resolve(root,p)
const journeys=JSON.parse(readFileSync(file('docs/qa/BT_PILOT_QA_02_RECORRIDOS.json'),'utf8'))
const matrix=JSON.parse(readFileSync(file('docs/qa/BT_PILOT_QA_01_CASES.json'),'utf8'))
assert.equal(journeys.schema,'bytetorque.pilot.journeys.v1')
assert.equal(journeys.stage,'BT-PILOT-QA-02')
assert.equal(journeys.matrix,'docs/qa/BT_PILOT_QA_01_CASES.json')
assert.equal(journeys.journeys.length,18)
const cases=new Map(matrix.cases.map(c=>[c.id,c]))
const gateIds=new Set(matrix.gates.map(g=>g.id))
const ids=new Set()
const covered=new Set()
let steps=0
const validPlatforms=new Set(['web','pwa','android','backend'])
const validPhases=new Set(['offline-demo','device-demo','gated-real'])
const validRoles=new Set(['administrador','mecanico','creador'])
for(const j of journeys.journeys){
 assert.match(j.id,/^R\d{2}$/)
 assert.ok(!ids.has(j.id),'Recorrido repetido '+j.id)
 ids.add(j.id)
 assert.ok(j.title.length>12&&j.title.length<150)
 assert.ok(validPlatforms.has(j.platform))
 assert.ok(validPhases.has(j.phase))
 assert.ok(validRoles.has(j.role))
 assert.ok(j.workshop.length>=5)
 assert.ok(j.caseIds.length>0 && new Set(j.caseIds).size===j.caseIds.length)
 assert.ok(j.steps.length>=2)
 assert.ok(j.phase!=='gated-real'||j.requiredGates.length>0,'No ejecutar real sin puertas: '+j.id)
 if(j.phase==='offline-demo')assert.equal(j.requiredGates.length,0,'Demo offline con puertas productivas')
 if(j.phase==='device-demo')assert.equal(j.platform==='android'||j.platform==='pwa',true)
 for(const gate of j.requiredGates)assert.ok(gateIds.has(gate),'Puerta desconocida '+gate)
 for(const id of j.caseIds){
   const c=cases.get(id)
   assert.ok(c,'Caso no registrado '+id)
   covered.add(id)
   if(j.platform!=='backend')assert.notEqual(c.platforms[j.platform],'N','Caso no aplicable '+id+'/'+j.platform)
   if(j.phase==='gated-real')for(const gate of c.gate)assert.ok(j.requiredGates.includes(gate),'Falta puerta '+gate+' en '+j.id)
 }
 for(const step of j.steps){
   assert.ok(step.action.length>=30,'Acción sin instrucción concreta '+j.id)
   assert.ok(step.expected.length>=25,'Resultado esperado no verificable '+j.id)
   assert.ok(!/contrase(?:ñ|n)a real|token de acceso real|correo verdadero|cliente verdadero/i.test(step.action),'No pedir datos privados '+j.id)
   steps++
 }
}
assert.deepEqual([...covered].sort(),[...cases.keys()].sort(),'Hay criterios P01–P38 sin recorrido')
assert.ok(journeys.journeys.some(j=>j.role==='mecanico'&&j.platform==='android'))
assert.ok(journeys.journeys.some(j=>j.platform==='pwa'))
assert.ok(journeys.journeys.some(j=>j.platform==='backend'))
assert.ok(journeys.journeys.some(j=>j.phase==='gated-real'&&j.requiredGates.includes('G-BACKUP')))
const renderRunbook=(d,m)=>{
 const platform={web:"Escritorio / navegador web",pwa:"iPhone Safari / PWA",android:"Android nativo Expo",backend:"Infraestructura aislada"};
 const phase={ "offline-demo":"DEMOSTRACIÓN SIN RED","device-demo":"DISPOSITIVO DEMO PENDIENTE","gated-real":"BLOQUEADO PARA OPERACIÓN REAL" };
 const rows=[
 "# ByteTorque — BT-PILOT-QA-02 · Recorridos guiados de aceptación",
 "",
 "**Fecha:** 18/11/2026 · **Estado: PLANIFICADO, SIN EJECUCIÓN FÍSICA NUEVA NI ACTIVACIÓN PRODUCTIVA** · Rama `main`.",
 "",
 "> Este documento ordena pruebas; **NO registra aprobación de Ignacio, un APK probada ni pasos ejecutados en un servidor real**. Todos los resultados del registro CSV están SIN_EJECUTAR. Nunca colocar datos reales, credenciales, tokens, fotos de clientes o correos privados en evidencias públicas.",
 "",
 "## Modo de trabajo",
 "",
 "1. Identificar el recorrido y comprobar la columna de fase. DEMOSTRACIÓN: solo fixtures sintéticos/locales; DISPOSITIVO DEMO: prueba física pendiente; BLOQUEADO: NO iniciar hasta que TODAS las puertas estén abiertas con evidencia y aprobación expresa.",
 "2. Usar el [registro en blanco](BT_PILOT_QA_02_REGISTRO_EN_BLANCO.csv) como plantilla local para documentar observado, fecha, responsable y ubicación privada de evidencia. **Nunca sobrescribir esta plantilla versionada con resultados que contengan información personal**.",
 "3. Comparar esperado/observado por paso y asociar la referencia de [P01–P38](BT_PILOT_QA_01_MATRIZ_20261118.md). Prohibido declarar PASS por el solo hecho de que CI compile.",
 "4. En sesiones reales autorizadas detenerse ante fuga entre talleres, confirmación falsa de guardado, perdida de OT/datos, PDF inválido, sesión revocada que aún acceda, o falla de restauración. Mantener correos/pagos/Storage OFF hasta permisos específicos.",
 "",
 "## Índice de recorridos",
 "",
 "| Recorrido | Plataforma | Rol | Fase | Casos | Pasos |",
 "|---|---|---|---|---|---:|",
 ...d.journeys.map(j=>`| ${j.id} · ${j.title} | ${platform[j.platform]} | ${j.role} | **${phase[j.phase]}** | ${j.caseIds.join(", ")} | ${j.steps.length} |`),
 "",
 "## Procedimientos por escenario",
 "",
 ...d.journeys.flatMap(j=>[
 `### ${j.id} — ${j.title}`,
 "",
 `**Plataforma:** ${platform[j.platform]} · **Rol:** ${j.role} · **Taller:** ${j.workshop} · **Fase:** ${phase[j.phase]}.`,
 "",
 `**Casos:** ${j.caseIds.join(", ")}. **Puertas exigidas antes de ejecutar en su fase:** ${j.requiredGates.length?j.requiredGates.join(", "):"ninguna para el laboratorio sintético; puertas de producción de la matriz siguen cerradas"}.`,
 "",
 "| Paso | Acción verificable | Resultado esperado |",
 "|---:|---|---|",
 ...j.steps.map((s,i)=>`| ${i+1} | ${s.action} | ${s.expected} |`),
 "",
 "Resultado: **SIN EJECUTAR EN ESTA ETAPA**. El verificador solo asegura trazabilidad y formato de este plan.",
 ""
 ]),
 "## Criterio de salida para piloto de Ignacio",
 "",
 "Se necesita respaldo integral recuperable, permisos backend reales, migraciones y RLS autorizadas, privacidad/consentimiento resueltos, casos P0 ejecutados por rol/taller, PDF archivado íntegro, prueba física Safari/Android y decisión expresa del titular e Ignacio sobre el uso del taller. Ninguna evidencia simulada satisface por sí sola esos requisitos.",
 "",
 "## Verificación sin red",
 "",
 "```sh",
 "node scripts/qa/verify-pilot-matrix.mjs --check",
 "node scripts/qa/verify-pilot-journeys.mjs --check",
 "cd apps/android && npm run test:contracts",
 "```",
 "",
 "El CI verifica solo consistencia de recorridos y regresiones Android sintéticas; NO ejecuta una prueba manual ni instala APK.",
 ];
 return rows.join("\n")+"\n";
}
const csvField=(s)=>'"'+String(s??"").replaceAll('"','""')+'"'
const renderCsv=(d)=>{
 const cols=["recorrido_id","plataforma","rol","taller_sintetico","fase","puertas","casos","paso","accion","resultado_esperado","estado","observado","evidencia_privada","fecha","ejecutor","incidencia"];
 const rows=[cols];
 for(const j of d.journeys)for(let i=0;i<j.steps.length;i++){
 const s=j.steps[i];
 rows.push([j.id,j.platform,j.role,j.workshop,j.phase,j.requiredGates.join(";"),j.caseIds.join(";"),i+1,s.action,s.expected,"SIN_EJECUTAR","","","","",""]);
 }
 return rows.map(r=>r.map(csvField).join(",")).join("\n")+"\n";
}
const artifacts=[
 ['docs/qa/BT_PILOT_QA_02_RECORRIDOS_20261118.md',renderRunbook(journeys,matrix)],
 ['docs/qa/BT_PILOT_QA_02_REGISTRO_EN_BLANCO.csv',renderCsv(journeys)],
]
for(const [path,expected] of artifacts){
 if(process.argv.includes('--write'))writeFileSync(file(path),expected,'utf8')
 else assert.equal(readFileSync(file(path),'utf8'),expected,'Plantilla no corresponde al JSON; --write genera versión sin resultados')
}
const worksheet=readFileSync(file('docs/qa/BT_PILOT_QA_02_REGISTRO_EN_BLANCO.csv'),'utf8')
assert.equal((worksheet.match(/"SIN_EJECUTAR"/g)||[]).length,steps)
assert.ok(!/,"PASS",|,"FAIL",/.test(worksheet),'Registro base no puede afirmar resultados')
console.log('BT-PILOT-QA-02: '+journeys.journeys.length+' recorridos, '+steps+' pasos, '+covered.size+' casos de matriz trazables; 0 resultados reales afirmados, GATES cerradas')
