# ByteTorque — CHECKPOINT BT-REG-02

**Fecha:** 13 de noviembre de 2026  
**Proyecto:** ByteTorque 1.0, repositorio Danielsanchezdesarrolador/biomotors-taller  
**Rama autorizada:** main, sin ramas adicionales  
**Despliegue existente:** https://biomotors-taller-demo.onrender.com  
**Alcance:** exclusivamente React/Vite web y PWA iPhone en DEMO. Android nativo preservado.  
**Base verificada antes de modificar:** e20bc62 (BT-INS-01 publicado y documentado).

## Resultado funcional

1. Se conservó el registro manual de clientes BT-UI-04. «Generar enlace de registro» ya no muestra solo datos personales: abre una introducción y una **simulación** de registro de tres pasos.
2. Paso 1: nombre, email, móvil, dirección y comuna opcionales. Sin RUT; validación de correo y móvil ficticios para impedir utilizar contactos reales en el piloto visual. Consentimiento explícito para usar datos inventados.
3. Paso 2: marca, modelo, año (1900 a año actual + 1), kilometraje (entero de 0 a 2.000.000) y patente opcional. Ninguna patente acredita identidad/tenencia.
4. Paso 3: motivo declarado por el cliente (entre 10 y 500 caracteres), cuatro ejemplos claros y contador. **No se completa diagnóstico mecánico ficticio**.
5. Volver/Continuar; errores por campo; resumen final editable con accesos de corrección; mensaje exacto «Simulación completada. No se enviaron ni almacenaron datos reales».
6. En Clientes y vehículos, nueva bandeja local «Solicitudes de ingreso» con dos muestras de fábrica y solicitudes nuevas creadas desde el formulario. Nombre, vehículo, km, motivo, fecha y estado «Pendiente de revisión».
7. **No hay conversión real ni simulada a OT**: la siguiente fase ofrecerá revisión/precarga autorizada con los modelos existentes. No se fabricaron informes, presupuestos ni diagnósticos.
8. La interfaz comercial es informativa: Básico registro manual, Plus USD 5/mes, Full USD 15/mes y futuro trial Full de tres días. No activa ni valida suscripciones en React.

## Seguridad y decisiones respetadas

- DEMO únicamente: sin enlaces públicos útiles, tokens, almacenamiento persistente, sesiones reales, correos, WhatsApp automatizado, pagos, validaciones de plan del lado servidor o solicitudes de red desde el formulario.
- Toda recepción añadida por el usuario queda en estado React local del panel; recargar o cambiar de módulo descarta el estado. Las dos fichas de solicitudes iniciales son sintéticas.
- Sin cambios en proyectos, credenciales, migraciones, funciones Edge, Auth/RLS, onboarding ni BT-CP02-D. **Pruebas de aislamiento A/B reservadas al otro chat con el Director.**
- Sin modificaciones al informe multipunto BT-INS-01 ni a las cinco secciones premium de navegación. Añadida solo una sección interna a Clientes y vehículos.
- Sin APK; Android React Native + Expo se preservó.

## Archivos principales

- src/clientes/registroVisitaData.ts — tipos, fixtures y validaciones.
- src/clientes/RegistroVisitaDemo.tsx — asistente de tres pasos, resumen y confirmación.
- src/clientes/registroVisita.css — estilos aislados R2 y responsive.
- src/clientes/ClientesPanel.tsx — entrada al asistente y bandeja de solicitudes.
- src/clientes/registroVisitaData.test.ts — 9 pruebas de reglas DEMO.
- scripts/verify-clients-ui.cjs — recorrido previo actualizado para el nuevo formulario (no ejecutado en GitHub CI).
- scripts/verify-registro-ui.cjs — recorrido Chromium, capturas y revisión de red/almacenamiento.
- .github/workflows/bt-reg-02.yml — verificación de navegador y artefacto temporal de capturas.

## Evidencia técnica verificada

**Commit funcional:** d75805df6bc5b72305575f66045b6be0e8ff5b3d  
**Commit de capturas:** 9d0446bb8bc550a02aaa2503951757e2e56c2114

**GitHub Actions principal** para 9d0446: https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43507410932 — SUCCESS. Web: TypeScript PASS, **57/57 pruebas Vitest en 10 archivos**, build Vite PASS, verificación PWA PASS. Android: typecheck, compatibilidad de paquetes Expo, bundle y configuración: PASS; no constituye APK.

**GitHub Actions navegador** para 9d0446: https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43507410918 — SUCCESS. Chromium sin errores de consola, 1650 y 390 px; se completaron los tres pasos, resumen editable (en recorrido del script de clientes), recepción de 3 solicitudes temporalmente, vuelta a 2 al recargar, 0 escrituras de red, 0 entradas en localStorage/sessionStorage, sin desbordamiento horizontal.

**Capturas reales del frontend en Chromium local** (artefacto del run anterior): formulario, resumen y solicitudes a 1650/390 px. Artefacto GitHub 14076667876, con 6 PNG y reporte JSON. No confundir con capturas de Safari ni con evidencia administrativa del Render.

**Ajuste posterior:** se añadió reinicio de scroll interno al cambiar de etapa o entrar al resumen para Safari móvil. Requiere nueva CI/capturas de la revisión final; no declarar la aprobación visual hasta que el Director revise la demo.

## Pendientes y siguiente checkpoint

1. Revisar visualmente en Render el formulario y la bandeja; comprobar que el servicio sirva el commit más reciente. No se realizó comprobación administrativa Render sin selección confirmada de workspace.
2. Revisar las capturas del build final y hacer prueba real de Safari en iPhone; los resultados Chromium no certifican Safari.
3. Revisar el comportamiento del modal móvil y accesibilidad física, correcciones editoriales según Ignacio/Director.
4. BT-CP02-D: ejecutar pruebas de aislamiento A/B solo desde el otro chat con el Director, con credenciales autorizadas. Mantener cerrado onboarding público.
5. Fase posterior segura: tokens aleatorios y hash con vencimiento, identificación inequívoca del taller, RLS verificado, rate limiting, privacidad legal/consentimiento, email verificado, deduplicación controlada, persistencia de solicitudes, bandeja para Ignacio con decisión humana, conversión a OT con precarga y trazabilidad.
6. En backend real, controles de planes/trial exclusivamente desde servidor y proveedor de pagos autorizado. No hay cobros en BT-REG-02.
7. Android nativo React Native + Expo solo después de consolidar y aprobar web/iPhone, sin WebView.

## Orden de continuidad

Antes de cualquier nuevo cambio: consultar HEAD de main y los checkpoints posteriores, confirmar si el Director aprobó BT-REG-02 y si otros agentes están trabajando en los mismos archivos. Preservar R2 y BT-INS-01; no intervenir BT-CP02-D ni servicios reales. Todo cambio de alcance requiere decisión separada. **No reconstruir el formulario ya implementado.**
