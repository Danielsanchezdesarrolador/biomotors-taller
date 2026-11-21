# CHECKPOINT — BT-SEC07-R3-COMBINED-BRIDGE-PREP-32 · Integración sintética de productor y GPG real, Windows pendiente

**Fecha:** 20/11/2026 (America/Santiago) · **Repo:** `Danielsanchezdesarrolador/biomotors-taller` · **rama autorizada:** `main` · **HEAD al preparar:** `49217a294c35476d8829c64c8ed005c504413591`. **Tipo:** paquete PRIVADO de QA offline creado en entorno del asistente + documentación de continuidad. El laboratorio anterior `GPG_REAL: PASS_EPHEMERAL_KEY` (14/14 pruebas en PC Windows, reportadas por propietario) ya quedó cerrado en [checkpoint 31](CHECKPOINT_BT_SEC07_R3_GPG_WINDOWS_PASS_ROLE_EXPORT_GATE_20261120.md).

## 1. Nuevo candidato privado

**Archivo entregable solo por la conversación, NO subir a GitHub:** `BT_SEC07_R3_COMBINED_BRIDGE_20261120.zip`.

**SHA-256:** `e4fda9667879998aa5214d8bb6357b618b67e14e9bcf7ee484a706578526f44c` · **Tamaño:** 9.880 bytes · **Contenido del ZIP:** `README.md`, `bt_sec07_combined_bridge.py`, `test_bt_sec07_combined_bridge.py`, y módulos sintéticos reutilizados `bt_sec07_roles_lab.py` y `bt_sec07_gpg_ephemeral.py`.

**Propósito exacto:** comprobar que un **productor falso** (subproceso Python binario, sin shell) puede encadenarse a cifrado **GPG verdadero**, con una clave efímera creada solo para el test y SQL completamente inventado. Antes del cifrado se exige salida binaria válida, completa y exit 0 del productor simulado. Después se cifra en memoria, se escribe exclusivamente ciphertext `.gpg` dentro del temporal, se verifica SHA-256 y se descifra/compara bytes; limpieza del keyring de test al terminar.

**NUEVAS pruebas, no repetición de los anteriores suites 18+14:** 15 casos de integración — salida normal, Unicode, vacío, comentarios, SQL no relativo a roles, salida parcial + error, oversize, destinatario inexistente, hash/corrupción, destino preexistente, cero SQL en stdout/disco, limpieza, fixture no permitida, selfcheck sanitizado y respeto de `GNUPGHOME` original/sentinela. El ejecutable CLI, Supabase y las claves históricas nunca se invocan.

## 2. Evidencia REAL del entorno del asistente y límites

- Primer directorio: `python -m unittest -v test_bt_sec07_combined_bridge` → `Ran 15 tests in 16.217s`, `OK`.
- `python bt_sec07_combined_bridge.py` → `BT_SEC07_COMBINED_MODE: SYNTHETIC_PRODUCER_REAL_GPG`, `COMBINED_RESULT: PASS`, `KEYRING: EPHEMERAL_REMOVED`, `SUPABASE_REMOTE: NOT_CONNECTED`, `REAL_ROLES_BACKUP: NOT_ATTEMPTED`.
- ZIP extraído en otro temporal: 15/15 pruebas PASS y selfcheck exit 0 (verificación independiente posterior a empaquetado).
- Hash ZIP recalculado antes de documentar: `e4fda9667879998aa5214d8bb6357b618b67e14e9bcf7ee484a706578526f44c`.
- **AÚN NO EJECUTADO EN WINDOWS.** Los resultados Linux/entorno asistente no implican compatibilidad Windows ya validada para este nuevo paquete.

**Límites:** GPG real pero con **clave sin passphrase exclusivamente de prueba**, SQL sintético, productor falso, no certificado para copiar roles reales. La verificación SQL de este lab es básica y deliberadamente no interpreta el formato real de Supabase CLI. No se ha probado si el productor remoto devuelve roles suficientes, owners, grants ni errores reales, ni GPG con keyring histórico. Ninguna eliminación de ficheros temporales constituye borrado seguro de SSD.

## 3. Siguiente acción local segura, solo si el propietario decide ejecutarla

1. Descargar el ZIP en `Descargas`; comprobar SHA-256 exacto `e4fda9667879998aa5214d8bb6357b618b67e14e9bcf7ee484a706578526f44c`; **si difiere no ejecutar**.
2. Extraer en carpeta aleatoria nueva bajo `$env:TEMP`, totalmente separada del proyecto y `BT-Backups`; confirmar `python`/ `py` y `gpg` ya instalados, sin reinstalar ni generar claves originales.
3. Ejecutar `py -3 -m unittest -v test_bt_sec07_combined_bridge` o `python -m unittest -v test_bt_sec07_combined_bridge` (solo **15 tests nuevos**, no `discover`).
4. Si return code 0, ejecutar `py -3 .\bt_sec07_combined_bridge.py` y compartir SOLO los marcadores sanitizados y el resumen `Ran 15 tests ... OK`. Si hay falla: detener, **registrar incidente con causa verificada vs hipótesis**, sin reintentos ciegos.
5. Una vez PASS Windows, **NO repetir este laboratorio**. Siguiente frontera verdadera: preparar wrapper del CLI v3.0.0 que reciba stdout real y cifre con keyring autorizado, preservando conexión destino/credenciales y rechazo de datos parciales. **Requiere autorización separada para usar GPG histórico y acceso a Supabase**; el laboratorio no implica consentimiento para eso.

## 4. Riesgos abiertos, infraestructura y trazabilidad

Auditoría documental v3.0.0 previa: `--role-only` utiliza `pg_dumpall`; sin `--file` usa stdout binario; `--file` crea SQL legible, modo 0644, por lo que no usarlo por defecto. Un reintento de pooler podría dejar fragmentos; no confiar en archivo >0 o GPG exit 0. Posibles side effects del login role en ciertas rutas remotas: NO evaluado para ByteTorque, exige elegir modo que no modifique credenciales ni permisos de origen. `ROLES_ORIGEN_FALLA_NO_CLASIFICADA` del productor histórico sigue de **CAUSA NO DETERMINADA**, roles.sql.gpg antiguo descifra cero bytes. **INC nuevo de este bloque: NINGUNO**. R2 paridad del snapshot estructural PASS; R3 roles/privilegios reales NO; `BT-PILOT-QA-04 A REPASAR`; copia externa pendiente, Google Drive excluido.

**No se ejecutó ni modificó:** conexión remota, descarga de roles, SQL real, Docker, PostgreSQL alojado, GPG histórico/archivos backup/manifest, Render, Edge/Auth/Storage, visibilidad de repositorio, despliegue o workflow GitHub Actions. Candidato ZIP guardado solo como adjunto de chat, NO repo. GitHub recibe únicamente esta documentación con `[skip render]`.

## 5. Prompt de traspaso inmediato a cualquier chat

«Continúa ByteTorque SEC-07 desde `main`. Lee `AGENTS.md`, `agent.md`, `roadmap.md`, `docs/checkpoints/CHECKPOINT_BT_SEC07_R3_COMBINED_BRIDGE_PREP_20261120.md`, el checkpoint GPG Windows PASS-31 y el informe de incidentes. Confirma HEAD actual. Ya se validó en Windows el MOCK 18/18 y GPG real efímero 14/14; NO repetir. Preparado ZIP privado `BT_SEC07_R3_COMBINED_BRIDGE_20261120.zip`, SHA256 `e4fda9667879998aa5214d8bb6357b618b67e14e9bcf7ee484a706578526f44c`, nuevo laboratorio integrado de productor FALSO + GPG REAL efímero: 15/15 PASS en asistente y tras extracción, **Windows pendiente**. Próxima acción única: pedir/validar resultado de 15 tests en Windows, sin Supabase ni keyring real. Después desarrollar puente definitivo de stdout binario CLI v3.0.0 → GPG con destino y custodia, solicitando autorización específica antes de acceso Supabase, uso de claves reales o restore. Roles/owners/ACL, Auth/Storage/Edge, segundo backup externo y piloto siguen pendientes. Drive fuera, no sobrescribir copias ni publicar secretos. Al cerrar actualizar roadmap, agent, informe de incidentes si aplica y checkpoint + commit».
