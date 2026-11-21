# CHECKPOINT 79 — BT-SEC07-NUEVA-BASE-SEGURIDAD-REAL-ORDENADA

**Fecha:** 21/11/2026 · **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **Rama:** `main` · **HEAD previo:** `9bebdedbab38e224e5dd338e81bf8012e554ad63`.

## Decisión explícita del titular
El usuario comunicó: «se acabó de pruebas innecesarias, ahora vamos a comenzar con la etapa de seguridad real», autorizó su comienzo y luego precisó: «lo haremos ordenado ... en cuanto a claves, carpetas ... no ocuparemos nada antiguo, lo haremos todo denuevo, y quedará todo documentado ... dame prompt para comenzar en otro chat, con chekpoint, road map y agent.md».

**Interpretación adoptada:** nueva infraestructura y ejecución de seguridad/backup desde cero, no reconstrucción de la app. Ninguna clave, dump, manifest, carpetas operativas ni script antiguo se reutiliza como dependencia para certificar el nuevo sistema. Se conservan **intactos** los legados para trazabilidad sin borrarlos. Se permiten lecturas documentales históricas para evitar errores.

## Preparación realizada en este checkpoint
- Releídos desde HEAD `AGENTS.md`, `agent.md`, `roadmap.md` y CP78; auditados otros documentos relevantes de SEC-07: contrato R3 roles, informe errores 19/11, checkpoint previo de restore aislado CP22, workflow de exportación y scripts históricos **solo como contexto**.
- En Supabase conectado, proyecto real `biomotors-taller` estado `ACTIVE_HEALTHY`, PostgreSQL `17.11`, región `sa-east-1`; **solo lecturas**, sin cambios.
- Advisors de seguridad detectaron 6 funciones SECURITY DEFINER permitidas para autenticados, 8 tablas privadas RLS sin policy y protección Auth contra contraseñas filtradas desactivada. Lectura SQL reveló que RPC de gestión de suscripciones comprueban rol creador y MFA `aal2`, otras llamadas muestran verificación creador o membresía. **No se certificaron pruebas negativas por roles ni se modificaron GRANTs**; las tablas privadas sin policy pueden denegar acceso deliberadamente.
- Se creó el documento maestro `docs/BT_SEC07_NUEVA_BASE_SEGURIDAD_REAL_20261121.md` y se enlazó desde este checkpoint y los tres archivos de continuidad.
- **No se ejecutaron** exportaciones reales, GPG, pg_dump, restauraciones nuevas, operaciones Windows, cambios de claves, permisos, SQL DDL/DML, SSL, despliegues o borrados.

## Orden nuevo de trabajo
1. **S0:** Carpeta base nueva en Windows fuera repo/sync; separar docs, ciphertext, manifests/hashes, verificaciones, restore aislado, copia externa. Custodia privada FUERA del árbol de backups. Política de nombres y ACL.
2. **S1:** Par de claves cifrado nuevo y duplicado de recuperación independiente; prueba canary desde entorno GPG vacío. No usar OpenKeychain antiguo ni su contenedor `PGP MESSAGE`.
3. **S2:** Exportación **nueva** Postgres real y cifrada en stream, manifest SHA + readback, sin escribir producción, origen/TLS verificados.
4. **S3:** Inventariar/preservar roles/owners/ACL/RLS y servicios Supabase/Render/Edge/Storage/Auth externos por mecanismos separados; no llamar completo a pg_dump solo.
5. **S4:** Restore aislado sin red desde nuevo backup y nueva clave; comprobar datos/esquemas/grants/políticas/RLS/roles/negativas por taller. Nunca usar evidencia CP22 como prueba de esta generación.
6. **S5:** 3-2-1, segunda ubicación, retención, automatización y simulacro.
7. **S6:** Hardening producción (TLS/SSL enforcement, Auth contraseñas filtradas, RPC SECURITY DEFINER y RLS), mediante control de cambios y pruebas separados del backup.

## Disciplina de implementación
**PowerShell SIEMPRE completo e inline en chat** (CP66). No volver a repetir baterías históricas ni intentar arreglar clave OpenKeychain antigua por defecto. Para nuevas claves y datos reales, nunca imprimir contraseñas/secretos/dumps; controlar destinos y no mezclar claves privadas con respaldos cifrados. No subir archivos confidenciales al repo/chat. Documentar cada etapa con resultado observable. Cambios solo `main` y docs `[skip render]` sin despliegue. No se garantiza seguridad integral ni recuperabilidad hasta S4/S5 verificadas.

## Siguiente conversación
Entregar un prompt de continuidad autocontenido que exija leer `AGENTS.md`, `agent.md`, `roadmap.md`, este CP79 y el documento maestro; verificar HEAD antes de modificar; comenzar por S0 con PowerShell organizado, sin solicitar reejecutar los diagnósticos antiguos.

**Plan maestro:** [BT_SEC07_NUEVA_BASE_SEGURIDAD_REAL_20261121.md](../BT_SEC07_NUEVA_BASE_SEGURIDAD_REAL_20261121.md).
