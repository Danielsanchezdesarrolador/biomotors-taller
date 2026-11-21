# CHECKPOINT 55 — BT-SEC07-R3-TOC-OFFLINE-AUDITOR-READY

**Fecha:** 20/11/2026 (America/Santiago) · **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **rama única:** `main` · **HEAD antes del commit:** `4614c7dcfa47c8e418e757e3afe268e666ae1ae1`.

## 1. Consentimiento exacto y límite aplicado

El propietario respondió **«autorizo»** a **PREPARAR una auditoría OFFLINE del índice TOC del respaldo existente**, **SIN descifrar archivos reales, usar clave GPG histórica, conectar a Supabase o abrir cualquier respaldo real**, sin ejecutar restauración. El permiso **NO** autoriza inspeccionar el TOC auténtico del snapshot cifrado, usar `pg_restore` contra el dump, importar/exportar roles, recuperar ACL reales, iniciar Docker/CI, modificar SSL enforcement ni datos de producción.

Primero se leyeron `AGENTS.md`, `agent.md`, `roadmap.md`, CP54, contrato R3 y checkpoints de paridad estructural; se verificó HEAD de `main`. Se contrastó el comportamiento de `pg_restore --list`, `--no-owner`, `--no-acl` con [PostgreSQL 17 oficial](https://www.postgresql.org/docs/17/app-pgrestore.html): el TOC es **inventario de elementos del archivo**, NO prueba de recuperación exitosa de propietarios o permisos.

## 2. Entregable PRIVADO, no subir código a GitHub

ZIP `BT_SEC07_R3_TOC_OFFLINE_AUDIT_20261120.zip`, **7074 bytes**, SHA-256 `fa0c7606fb80523d9de455719693947284c123de482e71d05ac89465ad859566`, creado y verificado en el entorno de trabajo del asistente (adjunto a la conversación, **NO** añadido al repo). Contiene:
- `bt_sec07_r3_toc_offline.py`: función pura `audit_synthetic_toc(bytes)` sin apertura de rutas ni acceso de red; **solo se debe alimentar con fixtures inventados**; el modo CLI acepta **cero argumentos** y analiza un TOC sintético incluido. Importaciones verificadas: `__future__`, `collections`, `dataclasses`, `re`, `sys`; no `subprocess`, `socket`, GPG, pg_restore, funciones de apertura/escritura de archivos.
- `test_bt_sec07_r3_toc_offline.py`: **40 pruebas offline NUEVAS** con encabezados sintéticos, entradas `ACL`, `DEFAULT ACL`, `POLICY`, `ROW SECURITY`, `TABLE`, `TABLE DATA`, `FK CONSTRAINT`, comentarios deshabilitados, UTF-8, BOM y CRLF; casos de rechazo para formato inesperado, SQL malicioso, IDs duplicados, mismatch de entradas declaradas, tamaño/longitud, NUL, UTF8 inválido y secretos en mensajes.
- `README.md`: uso seguro sin rutas ni datos propios, interpretación de señales y futuros controles.

**Resultado comprobado en entorno del asistente:**
- 40/40 tests offline PASS **antes de empaquetar**.
- 40/40 tests offline PASS **después de extraer ZIP a carpeta temporal diferente**.
- Autoprueba sintética devuelve solo los indicadores siguientes y exit=0:
```text
BT_SEC07_TOC_MODE: SYNTHETIC_ONLY
BT_SEC07_TOC_PARSE: PASS_SHAPE_ONLY
BT_SEC07_TOC_ACL_SIGNAL: CANDIDATE_ONLY
BT_SEC07_TOC_OWNER_COVERAGE: NOT_VERIFIED
BT_SEC07_TOC_SOURCE_ARCHIVE: NOT_OPENED
BT_SEC07_TOC_SOURCE_DB: NOT_CONNECTED
BT_SEC07_TOC_GPG_HISTORICAL: NOT_ACCESSED
BT_SEC07_TOC_ROLES_OR_ACL_RESTORE: NOT_ATTEMPTED
BT_SEC07_TOC_GATE: PASS_OFFLINE_ONLY
```
- Invocar con argumento/ruta externa: rechazo `STOP_NO_ARGUMENTS`, exit=2.
- Inspección AST de importaciones y llamadas peligrosas: PASS. ZIP verificado, SHA256 arriba.

**Límite importante de resultados:** Las entradas del TOC se clasifican por tipo `ACL` y `DEFAULT ACL` para descubrir señales de cobertura **NO contenido GRANT**, sin extraer ni mostrar identificadores o propietarios. `POLICY` no acredita RLS negativa; `TABLE DATA` no acredita paridad de filas; la columna textual de owner no demuestra que el restore haya aplicado `ALTER OWNER`. Si no aparecen entradas ACL, **NO significa que no haya privilegios relevantes**. Un descriptor de TOC no contemplado causa STOP seguro y podría ser legítimo en PostgreSQL real; no hacer auto-reintento, ni relajar sin revisión.

## 3. Errores de laboratorio encontrados y solución, sin impacto externo

**INC-55A — encabezado Dump Version rígido:** la primera corrida de los 40 tests rechazó todos los encabezados ficticios `Dump Version: 1.16-0` porque la expresión solo aceptaba `1.16`. Corrección comprobada: admitir sufijo `-0` en la versión del formato, manteniendo validación estricta.

**INC-55B — caso de prueba comentario deshabilitado:** tras la primera corrección un único test falló por declarar 2 entradas incluyendo una línea comentada `; ...` que el analizador correctamente no cuenta. Se corrigió **el fixture** a una entrada activa declarada, sin modificar el parser. Reejecución integral: **40/40 PASS** y ZIP extraído **40/40 PASS**. Ambos errores quedan **RESUELTOS EN LABORATORIO**, no son incidentes de producción ni del backup ByteTorque.

**No se ejecutó ningún laboratorio histórico de roles 18/14/15, restauración R2, verificador TLS V2 ni GPG real**. Estos continúan con resultados documentados.

## 4. Riesgos aún pendientes y próximas puertas de autorización

**No se ha inspeccionado el respaldo cifrado de ByteTorque ni su TOC auténtico**: por tanto `BT_SEC07_R3_REAL_TOC_COVERAGE: UNKNOWN`, `BT_SEC07_R3_ORIGINAL_OWNERS_AND_ACL: NOT_VERIFIED` y `BT_SEC07_R3_ROLE_RECOVERABILITY: NOT_PROVEN`. Una prueba offline con fixtures no transfiere cobertura ni certificación al snapshot real.

**CP54:** una SELECT agregada read-only confirmó 31 roles visibles, 31 reservados y **0 candidatos personalizados adicionales** según Supabase CLI 3.0.0, con 0 falsos positivos; **INC-53 cerrado**. Esto NO sustituye propietarios/GRANT/ACL de objetos ni pertenencia de roles administrados. El antiguo `roles.sql.gpg` descifraba SQL vacío con productor fallido: no es backup válido.

**CP46 y CP48:** TLS cliente PC→pooler `verify-full` PASS, un backend `pg_stat_ssl` reportó SSL NO; SSL enforcement de Supabase OFF observado en captura; extremo a extremo NO certificado. La futura activación reinicia DB y requiere permiso independiente.

**Puerta futura 1 (NO autorizada ahora):** el usuario elige snapshot específico y autoriza verificar su huella/manifiesto; **acceso GPG histórico por permiso separado** y procedimiento seguro para obtener en RAM el TOC mediante `pg_restore --list`, capturando sólo contadores sanitizados, **sin guardar SQL o TOC privado en disco o consola**, preservando archivos/keys. La operación requiere aprobación nueva explícita, aun si se realiza en PC desconectado de Internet.

**Puerta futura 2:** si el TOC real muestra señales ACL/owner, extraer permisos y probar su aplicación en restauración **aislada autorizada** y comparar con catálogo de origen bajo autorización adicional, sin escribir jamás en PostgreSQL productivo. Si TOC no muestra ACL, investigar alcance real del dump antes de concluir ausencia.

**Estado:** `BT-PILOT-QA-04 A REPASAR`; repositorio privado `main`, sin desplegar, Google Drive excluido.

## 5. Prompt de continuidad

> Retomar ByteTorque SEC-07 solo `main`, leer AGENTS.md, agent.md, roadmap.md, este CP55 y registro de incidentes. El usuario AUTORIZÓ únicamente PREPARAR auditor TOC offline sin abrir ni descifrar backups. ZIP privado `BT_SEC07_R3_TOC_OFFLINE_AUDIT_20261120.zip` SHA256 `fa0c7606fb80523d9de455719693947284c123de482e71d05ac89465ad859566`, 7074 B, parser puro sin file/network/subprocess/GPG, 40/40 nuevos tests PASS tanto antes como después de extraer, smoke `PASS_OFFLINE_ONLY`, no argumentos/rutas. Incidentes laboratorio 55A (Dump Version -0) y 55B (fixture comentario count) identificados/corregidos y PASS. NINGÚN TOC REAL, respaldo, keyring, Supabase o docker fue leído/usado. Las señales `ACL`/`DEFAULT ACL` son candidatos, NO restauración probada; owners/ACL/RLS, Auth/Storage/Edge, end-to-end TLS pendientes. CP54 31 roles total/31 reservados/0 personalizados (INC-53 cerrado), viejo roles.sql.gpg 0 SQL inválido, R2 solo estructura. Próximo paso requiere **permiso NUEVO** para siquiera acceder al snapshot real/hash/GPG histórico, y distinto para restore. No repetir labs previos ni activar SSL. Documentar siempre en main [skip render].
