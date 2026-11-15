# ByteTorque — Checkpoint BT-AUTH-R2-A6-10 · WebKit y puerta de Safari

**Fecha:** 15/11/2026 (Chile). **Rama única:** `main`. **Base:** R2-A6-9, `a16e8a35678002c69886f137f86d4752a3419f6e`.

## Entrega incremental

- Commit funcional: [`521f83d8453be9f55e07a259a7454bd872932b1f`](https://github.com/Danielsanchezdesarrolador/biomotors-taller/commit/521f83d8453be9f55e07a259a7454bd872932b1f).
- Se cerró el hueco de visibilidad al adjuntar/restaurar el adaptador experimental del navegador y se incorporaron dos tests nuevos.
- Se agregó Playwright **WebKit Linux** al workflow de interfaz, preservando Chromium, cuatro tamaños y los filtros de red/almacenamiento. No se importó candidato alguno a la PWA pública.
- Contrato de aceptación, Auth, hash, RPC y servicio revisado; las puertas de despliegue/SQL/Resend siguen cerradas. Matriz y autorizaciones: [BT_AUTH_R2_A6_10_SAFARI_GATE.md](../BT_AUTH_R2_A6_10_SAFARI_GATE.md).

## Resultados efectivos

- [CI principal #43724776112](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43724776112): **SUCCESS**, **443/443 Vitest** en 44 archivos, TypeScript, build PWA, bundle oficial y Android Expo; **no se generó APK**.
- [CI navegador/UI #43724776108](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43724776108): **SUCCESS**; pasos Chromium y **WebKit Linux SUCCESS**, 375/390/768/1440 px, URL limpia, navegación, sin escrituras ni aceptación operativa.
- R2-A6-6 PostgreSQL 17 real aislado conserva su evidencia previa [#43714833785](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43714833785); sin reejecución ni cambios SQL en A6-10.
- **No se realizaron pruebas físicas Safari/iOS** ni cambios en Supabase alojado, secretos, Edge, Resend, pagos o Render deliberados en esta etapa. La publicación automática de Render, de ocurrir, no constituye activación de invitaciones.

## Estado y continuación

**R2-A6-10 cerrado como preparación de código y CI.** Quedan **bloqueadas** la aprobación Safari física y la activación real. El sitio web continúa mostrando un aviso y descartando invitaciones. Siguiente acción: ejecutar guía Safari con enlace ficticio y, en etapas independientes, solicitar decisiones expresas sobre SQL/RLS, secretos/Edge, Resend y piloto limitado.

**Checkpoint de documentación:** este archivo y roadmap se incorporan en el commit de cierre posterior al commit funcional; la ejecución CI de dicho commit debe comprobarse por separado antes de declarar cierre documental completo.
