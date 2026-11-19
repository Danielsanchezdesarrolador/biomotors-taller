# CHECKPOINT — BT-SEC-07-BLOQUE-CANDIDATO-05 · Auditoría integral de dos scripts Windows y corrección candidata offline

**Fecha:** 19/11/2026. **Rama:** `main`. **Punto de partida:** `de6e513b4118327fd7101a9630c1b90c0fc65173`. **Alcance:** exclusivamente auditoría de código local recibido, diseño y verificación en el contenedor de pruebas del asistente, documentación; **sin contacto con Supabase, Render ni Drive; sin cambios en producción**.

## 1. Entradas y continuidad

- Script original `bytetorque_respaldo_local.py`: 13.955 bytes, SHA256 `6218b147ccf01bc271d12cbd6a950ed8cafeb1f0381338c3b822eba4c`.
- Script original `ByteTorque_Diagnostico_Roles.py`: 4.465 bytes, SHA256 `9f81e3430de2fcf8f0b8ab38563ade89ee9b2ee61495dbd733fc03a3db62f11c`.
- Archivos completos inspeccionados sintácticamente. No se cargaron secretos, claves privadas, ciphertext ni URL con contraseña. Copias locales originales inalteradas (hashes confirmados después).
- Histórico: backup de base 17/11 14:41 UTC y 7 tablas restauradas aisladamente; copia GPG roles 151 B descifra **0 bytes** y es inválida; dump antiguo previo a migraciones del 17/11. Dos diagnósticos en vivo anteriores de roles, último `pg_dumpall` exit 1, stderr 75 B sin clasificación, SQL desechado. No se ha establecido causa raíz.

## 2. Hallazgos reproducibles de código (no extrapolar a la causa raíz)

1. El origen fija literales `HOST = 'aws-0-sa-east-1.pooler.supabase.com'`, `PORT = '5432'`, `DB = 'postgres'`. `pg_env` entrega estos datos a `psql` y `pg_dumpall`, además de `PGSSLMODE=verify-full` y `PGOPTIONS=-c default_transaction_read_only=on`. La búsqueda previa de una URI dentro de `DB` era un falso negativo metodológico: `DB` solo tiene nombre de base; el puerto de sesión **no constituye fallo por sí mismo**.
2. En el original `stream_encrypted`, `pg_dumpall` manda stdout por pipe a GPG; solo se comprueban exit codes y tamaño del ciphertext, sin detectar stdout de **cero bytes**. Un GPG no vacío puede cifrar cero bytes de entrada. Hallazgo de validación, no explicación demostrada del stderr anterior.
3. La carpeta de respaldo nuevo se crea **antes** de ambas exportaciones; ante falla en roles, puede quedar `database.dump.gpg` y `roles.sql.gpg` parcial, sin manifiesto válido. El original no borra ese estado.
4. El diagnóstico original descarta SQL con DEVNULL y clasifica solo patrones limitados de stderr; no registra conteo de stdout ni diagnostica otros patrones. Los 75 bytes de stderr anteriores se perdieron por diseño, no pueden recrearse sin nueva ejecución.

## 3. Candidatos y cambios preparados (fuera de repo)

Paquete descargable en esta conversación, **NO agregado al GitHub público**: `BT_SEC07_BLOQUE_20261119.zip`, 14.466 B, SHA256 `60b001e1a44be1cb9dbbecb0d64dd1ae46f0a8b569c58f092436ff7d6d152f35`.

| Archivo candidato | Modificación |
|---|---|
| `bytetorque_respaldo_local_SEC07_CANDIDATO.py` | Cuenta plaintext en tránsito sin escribirlo; rechaza origen vacío, `PGDMP` incorrecto, exit codes/timeout y salidas GPG fallidas; cancela procesos, limpia solo ciphertext nuevo fallido; staging privado nuevo y renombre tras hashes/manifiesto, también en segunda copia |
| `ByteTorque_Diagnostico_Roles_SEC07_CANDIDATO.py` | Importa candidato anterior y descarta SQL por bloques contando bytes; no imprime stderr crudo, SQL ni contraseña; etiquetas fijas adicionales y métricas controladas; mantiene lectura solamente |
| `test_BT_SEC07_offline.py` | 20 pruebas unitarias sintéticas con subprocesos Python que simulan productor y cifrado, sin GPG/PG reales ni conexiones |
| `README_SEC07.md` | Manual de uso exclusivo para pruebas offline, hashes, límites y puertas de autorización |

**Importante:** Test simula GPG, no prueba cifrado auténtico, lectura de GPG privado ni restauración. Detectar `PGDMP` + ciphertext SHA256 no demuestra que un backup sea restaurable o íntegro semánticamente. El archivo `roles.sql.gpg` no es válido ni reparado. El código local original en PC no se alteró ni fue ejecutado aquí.

## 4. Evidencia de QA en contenedor sin red

- `python -B -m unittest -q test_BT_SEC07_offline.py`: **Ran 20 tests, OK**, repetido dos veces.
- `ast.parse` de ambos candidatos y módulo de pruebas: **OK**.
- Casos: roles/base éxito sintético, cero bytes rechazados, productor y GPG nonzero, `PGDMP` inválido, expiración de tiempos, colisión preservando destino, ausencia de stderr sensible en logs, staging de primera y segunda copia, limpieza en falla de roles, error de clasificación, éxito de diagnóstico con conteo, diagnóstico vacío detectado, secreto oculto, TLS `verify-full`, `PGOPTIONS` read-only, escape de contraseña .pgpass.
- `zipfile.testzip()`: **OK**; entrega de cuatro archivos. Copias originales recálculo SHA256 sin cambios.
- **No probado:** Windows real, GPG y libpq reales, recuperación Docker de nuevo snapshot, Supabase CLI, PostgreSQL contra servidor, API/Drive, CI remoto, cifrado de un respaldo real, privacidad de carpeta Windows heredada. El timeout de hilos y rename/ACL deben validarse en Windows con pruebas sintéticas antes de activación. No declarar SEC-07 cerrado.

## 5. Reglas/estado y condiciones para avanzar

- El propietario pidió **bloques grandes**: investigar a fondo primero, agrupar pruebas y no pedir un comando por cada hallazgo. Regla añadida a `AGENTS.md` en commit anterior.
- **Próximo bloque:** el propietario descomprime paquete en carpeta distinta al script original y ejecuta **un solo conjunto de 20 pruebas offline**. No copiar encima de originales ni ejecutar la opción `backup` o el diagnóstico remoto todavía.
- Si pasa Windows offline, decidir si vale ejecutar un único diagnóstico con mayor observabilidad; se requiere **autorización adicional** antes de cualquier conexión PostgreSQL. Evaluar también `supabase db dump --role-only` como alternativa oficial antes de diseñar un nuevo backup.
- Con autorización separada y evidencia, un **nuevo** respaldo cifrado de estado actual en ruta/ID nuevos y restauración aislada de ese mismo backup; no manipular snapshots viejos. Drive/OAuth es otro bloqueo independiente y requiere su propio plan.
- **`BT-PILOT-QA-04: A REPASAR`.** Hasta que exista restauración del estado actual, no certificar protección para datos reales de Ignacio.

## 6. Archivos del commit documental y efectos

Solo `roadmap.md`, `agent.md` y este checkpoint, sin versionar los scripts privados. Sin nuevo workflow, backup, desplegar Render, tocar Supabase/Auth/RLS ni cambiar visibilidad del repo. Commit marcado `[skip render]`.
