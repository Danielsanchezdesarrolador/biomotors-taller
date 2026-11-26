# BT-PLAN-04BC — instalación técnica LIVE

Fecha: 26/11/2026, 16:38 Chile (19:38 UTC). Autorización del titular hasta Render, ventana sin editores y S5B actualizado confirmados en conversación.

## Evidencias verificadas

- CI oficial 5/5 SUCCESS para `dc056b1620398e050c0d00f7d96abd88efec0684`, incluido WebKit. [CI general](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45881094554), [interfaz](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45881094473).
- Cinco migraciones aplicadas y verificadas en historial; [checkpoint SQL](CHECKPOINT_BT_PLAN_04BC_SQL_INSTALADO_20261126.md). 13 objetos y dos talleres conservados en postflight, cero licencias/invitaciones/altas nuevas, sin bucket branding.
- [Workflow Edge 45884708021](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45884708021) completado SUCCESS. Job 140132416204, marcador BT_PLAN04BC_CP05_DEPLOY_SUCCEEDED. Empaquetador verificó JWT true y reproducibilidad. SHA256 del index.js empaquetado: 70a38e0ba625803b5c9ea25455d50a1f38e18b526f9c28e7cbc967d55b1b8b9f. Supabase informó CP05 v10 ACTIVE con verify_jwt=true; Final Archive v7 y Owner Onboarding v8 conservados.
- Render servicio biomotors-taller-demo, deploy `dep-dc48l50u01pc73f6r5tg`, commit `05bb77fddf236f5eea966d393dd3cef505a8f149`, estado LIVE confirmado directamente; finalización 2026-11-26T19:38:22.122119Z. Commit contiene únicamente documentación adicional respecto del SHA aprobado por CI. Auto-Deploy no y rama main confirmados. No se modificaron variables de entorno.

## Alcance y continuidad

Instalación técnica completa, no certifica recorrido autenticado en producción, Safari físico ni aceptación del taller piloto. No se crearon cuentas, licencias, invitaciones ni se invocó configure_pilot en esta etapa. No se activaron logos, pagos ni correo. Security Advisor conserva los avisos del checkpoint SQL. SEC07 permanece cerrado.

Siguiente: validación funcional humana focalizada en cuenta existente; MFA del creador y posterior alta/licencia/activación individual de BIOMOTORS con autorización correspondiente. No repetir CI, respaldo ni auditorías históricas por rutina. Mantener Auto-Deploy OFF y entrega por main. Este checkpoint es documental y no requiere redeploy.
