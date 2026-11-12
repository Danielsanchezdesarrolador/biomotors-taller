# CHECKPOINT BT-CP02-A — Auditoría preliminar de Supabase y arquitectura

**Fecha:** 11/11/2026  
**Modo:** SOLO LECTURA de servicios externos + actualización de documentación; no modificar Render, React, Android, correo, pagos ni datos de otra aplicación.

## Verificaciones

- GitHub `Danielsanchezdesarrolador/biomotors-taller` accesible en `main`, con UI premium DEMO y documentación de roles.
- El frontend usa datos ficticios y guardas locales; no tiene instalado `@supabase/supabase-js` ni cuenta con Auth/RLS funcional.
- No aparecen migraciones `supabase/` en el árbol `main`.
- Se inspeccionaron documentos `docs/ARQUITECTURA_MULTITENANT_CONFIGURACION.md` y `docs/MATRIZ_ROLES_Y_PERMISOS.md`.
- Se consultó Supabase `list_projects` mediante la conexión de esta conversación. **El proyecto `biomotors-taller` no aparece**, por lo cual no se puede auditar su esquema/seguridad ni ejecutar migraciones en él.
- **No se modificó ningún proyecto Supabase.**
- Revisión de documentación vigente Supabase: RLS, Auth, almacenamiento y cambios de CLI.

## Entregable

[Diseño BT-CP02](../BT_CP02_ARQUITECTURA_AUTH_RLS.md): modelos de talleres/usuarios/membresías, control de permisos, modelo RLS conceptual, matriz de pruebas entre Taller A/B y secuencia por puertas.

## Pendiente inmediato

1. El Director conecta al plugin Supabase la cuenta/organización donde se creó `biomotors-taller` (sin compartir claves en el chat).
2. Volver a comprobar `list_projects` y verificar el ID real del proyecto.
3. Inventario de seguridad de ese proyecto: tablas, RLS/policies, Auth, migraciones y Storage en **solo lectura**.
4. Preparar migración y test suite y solicitar autorización expresa del Director antes de aplicar SQL.

## Invariantes

- Un solo repositorio `main`, mismo Render, marca ByteTorque.
- No alterar Inicio R2 ni los cinco paneles aprobados.
- Sin datos reales, emails, pagos, JWT secretos o APK firmada.
- Android nativa y PWA Safari se mantienen como plataformas oficiales.
