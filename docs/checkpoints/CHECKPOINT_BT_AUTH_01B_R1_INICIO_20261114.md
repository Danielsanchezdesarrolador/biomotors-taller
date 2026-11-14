# CHECKPOINT DE INICIO — BT-AUTH-01B-R1
**Fecha:** 14/11/2026 · **Estado:** planificación técnica versionada, implementación pendiente de Codex.

- BT-CP02-D A/B de núcleo cerrado: 25/25 PASS, limpieza auditada y Security Advisor sin avisos.
- El Director configuró URL y redirect del sitio, email y confirmación, contraseña mínima 10 y desactivó altas públicas en Auth. SMTP propio continúa deshabilitado.
- Se revisó `src/App.tsx`, `src/access/AccessScreens.tsx`, `src/access/accessContract.ts`, `package.json` y la documentación BT-AUTH-01. **No hay Auth real conectado en frontend**.
- Se elaboró `docs/BT_AUTH_01B_R1_ORDEN_IMPLEMENTACION.md` con alcance limitado a login/sesiones/validación de membresía y rol, y conservación de la revisión pública. Flag de activación del login apagado por defecto.
- En esta etapa documental **no se modificaron archivos del frontend, Supabase, Render, Android ni claves**. El registro público sigue desactivado.
- El siguiente ejecutor es Codex; no marcar R1 como implementado hasta revisión de CI, capturas, control de acceso y checkpoint específico.
