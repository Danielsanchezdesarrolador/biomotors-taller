# ByteTorque — BT-CP02-D — Compatibilidad con claves nuevas Supabase

**Fecha:** 14/11/2026.

- Adaptado `scripts/security/bt-cp02-ab.mjs` para `SUPABASE_PUBLISHABLE_KEY` y `SUPABASE_SECRET_KEY` (`sb_secret_...`); clave secreta enviada solo en `apikey`, nunca en Authorization Bearer.
- Conservada compatibilidad temporal con `SUPABASE_SERVICE_ROLE_KEY` JWT heredada para entornos antiguos.
- `docs/BT_CP02_D_AB_RUNBOOK.md` actualizado con instrucciones y advertencias de seguridad.
- **No se han ejecutado pruebas A/B con usuarios, ni se ha cambiado Supabase, Render, Android o pantallas.** Los archivos de prueba y la documentación son el único alcance.
- La validación de sintaxis del script seguirá incluida en la CI.
