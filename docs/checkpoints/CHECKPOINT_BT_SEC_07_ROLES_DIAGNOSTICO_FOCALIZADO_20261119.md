# CHECKPOINT — BT-SEC-07-LOCAL-DIAG-02 · Diagnóstico focalizado de roles y evidencia limitada

**Fecha:** 19/11/2026. **Rama:** `main`. **Punto de partida:** `55899f7de9c579ce2c9dfdfea69ae50c53950c77`. **Estado:** diagnóstico local preparado y ejecutado dos veces con permiso; **causa del fallo NO DETERMINADA**. **Tipo de cambio alojado:** solamente documentación [skip render].

## 1. Inventario verificado por el propietario

- Clientes PostgreSQL encontrados en `Program Files/PostgreSQL/17/bin`, versión **17.12**: `pg_dumpall.exe`, `psql.exe`, `pg_dump.exe`, `pg_restore.exe`; no se reinstaló ni cambió el PATH global. `SEC-15`: disponibilidad comprobada, causa de fallo anterior de PATH en sesión nueva aclarada.
- Archivo `bytetorque_respaldo_local.py` (13.955 bytes) y `ByteTorque_Diagnostico_Roles.py` encontrados en la carpeta local de respaldo. No se subieron al repositorio ni se mostraron contraseñas/SQL.
- Código local inspeccionado con AST ocultando constantes. Flujo de cifrado `Popen(...stdout=PIPE)` hacia GPG y verificación de exit codes + tamaño de ciphertext; no verifica tamaño de stdout *antes* del cifrado; un fallo puede dejar el archivo de salida. Esto es debilidad de validación demostrable por código, no explica por sí solo la falla específica de pg_dumpall.
- Se creó copia `ByteTorque_Diagnostico_Roles_SEC07_CANDIDATO.py`; original no se sobreescribió; SHA-256 original=copia antes de modificar, sintaxis PASS; 8/8 pruebas sintéticas de clasificador. Se amplió el candidato para imprimir solo código de salida, longitud de stderr y categorías por presencia de patrones, sin mostrar stderr. Los cambios del candidato **no** se integraron al repo.

## 2. Resultado exacto de ejecuciones autorizadas

1. Diagnóstico inicial: `DIAG_ROLES: POSTGRES_TLS_OK` y `DIAG_ROLES: ROLES_FALLO_NO_CLASIFICADO`.
2. Diagnóstico ampliado, última ejecución: `DIAG_ROLES: POSTGRES_TLS_OK`, `SEC07_EXIT_CODE: 1`, `SEC07_STDERR_BYTES: 75`, `SEC07_INDICIOS: SIN_INDICIOS_CONOCIDOS`, `DIAG_ROLES: ROLES_FALLO_NO_CLASIFICADO`.
3. **Interpretación:** `check_db` pasó, el subproceso `pg_dumpall` falló con exit 1 y produjo 75 bytes de stderr. Su contenido fue intencionalmente descartado; **no se identificó SQLSTATE, categoría ni causa raíz**. La salida no autoriza afirmar que se deba a TLS, rol, permisos, pooler, flags, configuración o autenticación.
4. El diagnóstico descartó stdout SQL en `DEVNULL`; no generó copia nueva de roles ni de base. No repetir el productor sin una hipótesis nueva y autorización.

## 3. Incidencia PowerShell local (continuidad)

En la creación inicial de copia, `elseif` y `else` se interpretaron en comandos separados y devolvieron `CommandNotFoundException`. Se hizo inventario: `ORIGINAL=True`, `CANDIDATO=False`; posteriormente se usó una instrucción autocontenida en una sola línea y se obtuvo `COPIA_INDEPENDIENTE_VERIFICADA`. No se sobreescribió ningún original. Para próximos comandos Windows, preferir instrucciones autocontenidas y registrar estado antes de reintentar.

## 4. Límites y prioridades

- `database.dump.gpg` antiguo permanece con respaldo SQL histórico ya restaurado y paridad 7 tablas; no acredita estado posterior a migraciones CP05/Creador/PLAN-04A.
- `roles.sql.gpg` (151 B cifrados, 0 B descifrados) continúa **inválido**, se debe conservar como evidencia.
- No se cambió Supabase SQL, Auth, RLS, Storage, Edge, Render, Github Actions, OAuth, Drive, cuentas, contraseñas, tokens, ni visibilidad del repo.
- No se revisó stderr de esos 75 bytes; los datos ya descartados no pueden recuperarse del proceso finalizado. Una tercera prueba de pg_dumpall sin mejor hipótesis no aportaría evidencia suficiente.
- **Próximo paso:** determinar alternativa de diagnóstico que capture solo códigos sanitizados con evidencia más específica y verifique si el endpoint local usado es conexión directa o pooler **sin revelar URI ni credenciales**; revisar documentación oficial y pedir autorización específica antes de otro contacto remoto. No activar nuevos backups ni workflows hasta resolver fallo y proteger datos actuales.
- **BT-PILOT-QA-04: A REPASAR.** No se certifica recuperación integral, exportación de roles, ni respaldo cloud operativo.

## BT-SEC-07-POOLER-CODIGO-03 — Localización estática sin conexión (19/11/2026)

- El propietario ejecutó un inspeccionador AST sobre el programa **local** `bytetorque_respaldo_local.py` y observó `ENDPOINT_EN_CODIGO: POOLER`; `INSPECCION_LOCAL_OK`.
- **Límite importante:** la comprobación buscaba literales dentro del archivo, no evaluó si el literal efectivamente se usa para la conexión ni determinó el puerto; no revela cadena de conexión. **No se atribuye la falla de `pg_dumpall` al pooler sin más pruebas.**
- La documentación actual de Supabase contempla el pooler de **sesión (5432)** en ciertos flujos de respaldo y diferencia el de **transacción (6543)**. Se requiere comprobar de forma local y sanitizada cuál está configurado antes de sugerir cambio.
- **Paso pendiente:** revisar exclusivamente la asignación estática `DB` para clasificar categoría de host y puerto (sin emitir el DSN, contraseña, nombre de usuario ni tokens). Devolver `NO_DETERMINADO` si la construcción es dinámica. **No ejecutar nueva conexión ni respaldo** sin hipótesis específica/autorización.
- Se preservan tanto los archivos GPG como el programa original; el fallo SEC-07 sigue abierto. No hubo modificaciones alojadas; este commit solo documenta los hallazgos.

## BT-SEC-07-BLOQUES-GRANDES-04 — Informe de la investigación agrupada y cambio metodológico

**Fecha:** 19/11/2026. **Evidencia nueva del propietario:** `POOLER_REFERENCIA_LINEA: 23`, `PUERTO_REFERENCIA: 5432 LINEA: 24`, `INSPECCION_COMPLETADA`, posterior al resultado `DB_HOST: NO_DETERMINADO`, `DB_PUERTO: NO_DETERMINADO`. No hay contradicción: el segundo script solo examinaba la asignación estática `DB`; el tercero recorre todos los literales, sin verificar su uso. No inferir host/puerto efectivos ni convertir evidencia estática en comprobación de red.

**Referencias oficiales investigadas:** [Supabase: Connecting to Postgres](https://supabase.com/docs/guides/database/connecting-to-postgres) — pooler sesión 5432 apto cuando no hay conexión directa IPv6; [PostgreSQL 17: pg_dumpall](https://www.postgresql.org/docs/17/app-pg-dumpall.html) — admite `--roles-only` y `--no-role-passwords`; [Supabase: Restore a Platform Project to Self-Hosted](https://supabase.com/docs/guides/self-hosting/restore-from-platform) — `supabase db dump --role-only` filtra roles reservados, y trata el alcance de Auth/Storage/Edge por separado. CLI v3 puede diferir de v2: consultar `--help` y no ejecutar contra proyecto alojado sin permiso.

**Hallazgos no causales confirmados por inspección previa:** el productor local hace pipe de stdout a GPG, revisa exit codes y archivo cifrado no vacío, **pero no recuenta plaintext**; además no elimina el ciphertext inválido al fallar. El bug observado `roles.sql.gpg` descifra a 0 bytes, y todavía NO se sabe qué produjo exit 1 y 75 bytes de stderr (descartados por el programa). La comprobación TLS previa exitosa no prueba el éxito del productor. Prohibido repetir `pg_dumpall` solo cambiando puerto, contraseña o clasificación sin evidencia nueva.

**Regla solicitada:** trabajar ahora en bloques grandes: 1) investigación documental y estructura completa; 2) parche candidato aislado con pruebas sintéticas de fallo/éxito sin red; 3) entrega de evidencias + checkpoint; 4) autorización particular antes de cualquier prueba alojada/exportación/restauración. No pedir un comando por cada observación si se pueden agrupar verificaciones sin riesgo. Ver `AGENTS.md`.

**Próximo insumo:** revisar los dos archivos originales del PC `bytetorque_respaldo_local.py` y `ByteTorque_Diagnostico_Roles.py` en una sola entrega, exclusivamente código sin secretos; **no adjuntar** .env, .pgpass, claves GPG, dumps, manifest con datos privados, ni logs crudos. Si contienen credenciales, usar evaluación local en vez de cargarlos a un chat/repositorio público. Después crear parche mínimo seguro sobre copia, no sobre origen. **Este bloque no ejecutó conexiones ni modificó Supabase, Render, Drive o backups**. `BT-PILOT-QA-04: A REPASAR`.
