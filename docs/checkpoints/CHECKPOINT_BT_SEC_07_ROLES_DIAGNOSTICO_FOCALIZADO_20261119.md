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
