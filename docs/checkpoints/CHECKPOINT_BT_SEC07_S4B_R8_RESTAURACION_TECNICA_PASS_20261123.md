# ByteTorque — SEC07 S4B-R8: restauración técnica real PASS (alcance acotado)

**Fecha de evidencia:** 23/11/2026 (sesión del propietario). **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller`. **Rama:** `main`. **Tipo:** documentación solamente `[skip render]`.

## Evidencia íntegra aportada desde PowerShell 5.1

```text
BT_SEC07_S4B_R8: START
BT_SEC07_S4B_R8_LAB: READY
BT_SEC07_S4B_R8_RESTORE_EXIT: 0
BT_SEC07_S4B_R8_GPG: PASS
BT_SEC07_S4B_R8_CATALOG: CHECK_PASS
BT_SEC07_S4B_R8_RESTORE: PASS
BT_SEC07_S4B_R8_RESULT: RESTORE_PASS
```

## Procedimiento aplicado

- Reutilizado respaldo cifrado nuevo v04 `*_nobom_v04.dump.gpg`, previamente validado con GPG/SHA-256/PGDMP/TOC en S2-R11; sin exportar otro archivo ni conectar producción.
- Ejecutado desde Windows PowerShell 5.1 con `GNUPGHOME` seleccionado y GnuPG; Docker aislado con `supabase/postgres:17.6.1.136`, `--network none --rm -i --pull=never --log-driver none`, sin puertos publicados ni bind mounts.
- Bootstrap de Supabase mediante entrypoint y migraciones oficiales; comprobación de existencia de roles `anon`, `authenticated` sin superusuario/BYPASSRLS y `service_role`; base `bt_s4` nueva desde `template0`.
- Docker con **capa temporal escribible** (R8 elimina `--read-only`) para permitir escritura de `pgsodium_root.key` de laboratorio; PGDATA, `/tmp` y socket en `tmpfs`. El archivo de clave del lab NO es secreto productivo. Posibles huellas del overlay en disco host no descartadas.
- Flujo binario GPG→Docker stdin/FD3→`pg_restore` sin crear deliberadamente dump descifrado en archivo de Windows; `pg_restore --exit-on-error --single-transaction --no-owner --no-acl`, salida 0; GPG `DECRYPTION_OKAY`/exit 0; Docker exit 0; consulta de catálogo confirmó presencia de al menos una tabla de usuario.

## Dictamen y límites

**PASS (comprobado por salida real reportada):** el backup v04 sí pudo descifrarse y restaurarse hasta completar `pg_restore` en un laboratorio PostgreSQL 17 compatible, y el catálogo mínimo no quedó vacío. El registro de R7 fue `BOOTSTRAP_FAILED`; quitar `--read-only` resolvió operativamente el arranque en R8, pero la causalidad forense exclusiva de R7 no está demostrada por logs.

**PENDIENTE:** validación de contenido real esperado (conteos, tablas y relaciones), índices/FK, owners/ACL/GRANT y RLS efectivas, funciones privilegiadas, pruebas negativas de aislamiento de talleres A/B y recuperación de Auth, Storage binario, Edge, Render, secretos/configuración externos. `--no-owner --no-acl` evita inferir recuperación de privilegios. El contenedor `--rm` es efímero: no afirmar que la base de laboratorio permanece disponible ni que exista cero huella en el host.

**Estados:** S0 PASS; S1 PASS solo PC; S2-R11 PASS estructural; S4B-R8 PASS restauración técnica; S4 global NO CERRADA y S3 coberturas externas PENDIENTES; S5/S6 no certificados. Política PC-only sin USB obligatorio y riesgo de pérdida total del PC aceptado.

## Continuidad

Conservar v04, GPG y sus manifiestos intactos. No repetir S2-R11, R5, R6, R7 ni R8 como auditoría rutinaria. Preparar una sola verificación consolidada de estructura/datos y aislamiento A/B con criterios PASS/STOP y resultados sanitizados, sin exponer datos de clientes ni credenciales. Ninguna acción alojada ni despliegue autorizados por este checkpoint. Documentar siguientes hechos en `AGENTS.md`, `agent.md`, `roadmap.md` y el registro de incidentes; mantener `main` y `[skip render]` para cambios documentales.

## Anexo posterior — Prevención de recurrencia y trazabilidad

Se consolidaron las fallas y las correcciones probadas/documentadas de GPG y R2–R8 en el [runbook permanente](../recovery/BT_SEC07_S4B_R8_SOLUCION_Y_PREVENCION_20261123.md). Es la referencia operativa para futuros agentes. Distingue el fallo real R7 de su causa probable (no demostrada sin stderr), y el remedio que sí pasó en R8. No altera el resultado original ni convierte controles faltantes de S4 en PASS.

Para avanzar a S4C, por ser laboratorio `--rm`, se necesita una **única** restauración posterior que integre validaciones antes de salir, no otra ejecución idéntica de R8. Estado S4C: PENDIENTE, sin datos/roles/RLS A/B certificados.
