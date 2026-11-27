# BT-COMMERCIAL-PLANS-01 — CI FINAL PASS

Fecha 27/11/2026. Código evaluado: c7e4ace9ed436437a1f4e19ec4816766c4f929d6. Dictamen CI_PASS; aceptación productiva PENDIENTE.

## Evidencia oficial

- [Commercial Plans](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/46055930721): completed/success.
- [Workshop Commercial](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/46055930795): completed/success.
- [Commercial Hardening](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/46055930778): completed/success.
- [Verificación general](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/46055930776): completed/success.
- [OFICIAL-01A](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/46055930825): completed/success.
- [FLOW-01](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/46055930765): completed/success.
- [COT-01](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/46055930886): completed/success.
- [REG-02](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/46055930695): completed/success.

8/8 workflows verificados por consulta directa al SHA exacto. Plans 3/3 y Workshop Commercial 6/6 previamente comprobados; WebKit y Chromium, SQL aislado y Deno check aprobados. No equivale a Edge nativo alojado ni Safari físico. No repetir suites históricas ni SEC07 por rutina.

## Errores y soluciones

- CP03 parcial: el guard de frontera detectó dependencia de workshops OFF. Separación de componentes puros/CSS en plans y permisos exactos de rutas condicionados a CP03 o Workshops ON. Rechazo OFF conservado. DTK-ERR-035.
- OFICIAL-01A: expectativa 0/8 obsoleta; comprobar mapping 0/2/4 mediante dt/dd semánticos. Workshop Commercial: timeout por encabezado retirado; comprobar tres regiones de planes, precios, navegación y ausencia de escrituras/cobros. UX documental: 403 PLAN_CAPABILITY_REQUIRED en Básico autorizado, denegación genérica para revocación; conservar UUID, hash, reautorización y ledger. DTK-ERR-062.
- Integración local: confirmación off en minúscula canceló antes del push; reutilizar árbol exacto verificado y comprobar HEAD/Auto-Deploy OFF. Author identity unknown: identidad local y noreply, sin tocar configuración global. Titular reportó 185/185 hashes, dos árboles exactos y push normal. DTK-ERR-056.
- Los 23 controles offline de CI-FIX-01 eran simulaciones/sintaxis y no builds reales; los resultados de CI del nuevo SHA cierran esa limitación de validación. [Diagnóstico detallado](CHECKPOINT_BT_COMMERCIAL_PLANS_01_CI_FIX_01_20261127.md).

## Siguiente puerta

Auto-Deploy OFF confirmado por consulta de Render. No se ha ejecutado SQL ni instalado Edge ni desplegado frontend en esta etapa. Contrato 0/2/4 aún pendiente de instalación productiva. Preflight autorizado de solo lectura: verificar cuerpo/ACL/owner de seats, dependencias y distribución agregada de cupos; validar paquetes y versiones actuales. Coordinar congelación/drenaje documental según procedimiento vigente antes de cualquier cambio Edge, previa autorización específica; no modificar GATE4 por un simple continuar. Mantener datos históricos, licencias, cuotas, roles, backups existentes y funciones apagadas. C pendiente.
