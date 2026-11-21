# ByteTorque — CP S1B: PC como único destino de respaldo y avance S2

**Fecha:** 2026-11-21. **Rama:** main. **HEAD previo:** `0acc91a2075f6f6b0f0396fdf214b1eaeff2b951`.

## Decisión expresa del propietario

«no tengo 2 USB no dejaremos esas 2 copias, solo ocuparemos mi PC de respaldo, obligo a sacar ese punto, y prosigamos adelante, sigamos con lo siguiente, seguridad real de bytetorque».

- Se **elimina el requisito operativo** de 2 USB y las 2 copias independientes externas como condición de avance. No insistir en ello ni bloquear S2 o S4 por esta causa.
- S1A criptografía nueva Ed25519 + Cv25519, export secreto S2K y canary recuperado desde GNUPGHOME vacío: `PASS_LOCAL_ONLY`. S1 queda **CERRADO PARA EL ALCANCE LOCAL ACEPTADO**. Ninguna certificación de recuperación tras pérdida física total del computador o infección que comprometa simultáneamente archivos y claves locales.
- S2 empieza: primer `pg_dump` **nuevo** de la base `postgres` del proyecto `biomotors-taller`, PG17, capturado por stream binario hacia GPG cifrado. Sin dump claro deliberadamente en disco; transacción/rol de lectura y TLS `verify-full`; nunca publicar secretos ni imprimir registros de clientes.
- S3 alcance separado para roles/ACL/RLS/Auth/Storage/Edge/Render; S4 restauración real aislada; S5 automatización/retención/copia local en PC, con riesgo residual explícito; S6 hardening bajo aprobación específica.
- No declarar **recuperación ante desastre total** ni afirmar política 3-2-1 cumplida. Reportar alcance local y vulnerabilidad a incidente del equipo.

## Estado verificado de proyecto (consulta exclusivamente lectura)

Consulta conectada 21/11: `biomotors-taller` `ACTIVE_HEALTHY`, PostgreSQL `17.11`, base `postgres`, 46 esquemas y 62 tablas según catálogo (incluidos esquemas gestionados; no confundir con objetos incluidos automáticamente por pg_dump). No se modificó producción, Render ni GitHub Actions.

## Hitos

S0 PASS Windows; S1A PASS_LOCAL_ONLY; S1B USB EXTERNAL CANCELADO POR DECISIÓN DEL TITULAR; S2 PENDIENTE EJECUCIÓN EN PC, S3-6 PENDIENTE. Los incidentes $HOME reservada y primer fallo GnuPG constan en CP S1A.

Docs-only en `main` `[skip render]`, sin despliegue. Claves y respaldos permanecen exclusivamente fuera de GitHub y fuera de este chat.
