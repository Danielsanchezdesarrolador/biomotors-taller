# ByteTorque 1.0 — BT-OFICIAL-01 — Transición de DEMO a interfaz oficial limpia

**Fecha:** 14/11/2026 · **Estado:** requerimiento del Director aprobado para planificación y posterior implementación controlada.  
**Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **rama única:** `main`.  
**Último HEAD inspeccionado:** `da850b8c16e3a8e2ae883bbfa31ef4cb22d07c64` (verificar nuevamente al comenzar).  
**Render existente:** https://biomotors-taller-demo.onrender.com (la URL sigue indicando demo y NO equivale a un dominio oficial propio).  
**Contexto:** BT-QA-02 aprobado visualmente por el Director; BT-FLOW-01A–E y 103 pruebas ya pasan en versión de demostración.

## 1. Decisión del Director

«Sacar el nombre demo y los clientes ficticios etc. de la página, ya que comenzaremos a hacerla la página oficial».

**Interpretación autorizada:** la cara pública de ByteTorque debe dejar de mostrar clientes, vehículos, órdenes, historiales, usuarios, estadísticas y operaciones de ejemplo como si pertenecieran a un taller. Sustituir por **estados vacíos reales**, diseño oficial R2 y preparación honesta para primera configuración. **NO** significa que el Director haya aprobado habilitar cuentas reales, aceptar datos personales, registrar servicios reales, enviar correos o conectar Supabase antes de verificar aislamiento y persistencia.

ByteTorque es marca del **software SaaS**; BIOMOTORS, el taller piloto de Ignacio, será un taller con ficha propia una vez se complete onboarding seguro. No colocar datos reales de Ignacio por defecto en las cuentas de otros talleres. Preservar arquitectura única `main` y un solo Render hasta autorización independiente de dominio y operación final.

## 2. Auditoría de la fuente (main)

- `src/ordenes/ordenesData.ts` contiene ocho `demoWorkOrders` con patentes/técnicos y estados ficticios.
- `src/clientes/clientesData.ts` deriva `demoClients`, `demoVehicles`, `demoHistory` y observaciones desde esas órdenes; no son fichas reales ni información de un taller autenticado.
- `src/demo/dashboard.ts` fija cifras como 14 vehículos, 6 informes y 5 presupuestos, además de actividades inventadas: se deben sustituir por conteos del dominio conectado cuando exista o **0 / estado sin datos** mientras no haya registros.
- `src/configuracion/settingsData.ts` crea un taller ficticio, ocho miembros, email de muestra, plantilla de ejemplo, suscripción ilustrativa y `demoContext`; `ConfiguracionPanel.tsx` muestra KPI de 12 respaldos, 2 canales de correo, 5 % de capacidad sin medición. No afirmar que son reales.
- `src/flow/flowSession.ts` reconstruye visitas desde órdenes ficticias, fija `workshop-demo` y utiliza estado local; `src/session/useDemoSession.ts` y módulos de clientes/OT/informes mantienen memoria temporal en navegador. Recargar descarta datos. **No hay una fuente compartida persistente real** para el flujo.
- `src/flow/FlowHome.tsx` y muchos componentes muestran advertencias, estados e identificadores «DEMO». Retirar etiquetas visibles de la **cara oficial** solo cuando sus operaciones ya no parezcan reales sin guardar.
- El repositorio tiene esquema inicial Supabase y `bt-owner-onboarding`, pero BT-CP02-D (pruebas con dos talleres/usuarios reales A/B y aprobación de seguridad) se reservó expresamente para otro chat. No implica autorización de producción.

## 3. Principio de producto: interfaz oficial ≠ sistema operativo real

Está **prohibido** simplemente hacer una búsqueda/reemplazo global de `DEMO`, cambiar `OT-DEMO-` por `OT-` y publicar. Eso ocultaría una limitación crítica: no existe guardado persistente ni autorización multitenant comprobada para operaciones reales.

Hasta abrir las puertas de backend, la interfaz oficial podrá ser pública como **vista de presentación / preparación**:

- No mostrar clientes, vehículos, historias, cotizaciones ni indicadores de ejemplo en la vista oficial.
- Mostrar «Todavía no hay clientes», «Aún no hay órdenes de trabajo», «Sin informes disponibles», «Tu taller aún no está configurado» según contexto. En estadísticas, usar `0` únicamente para conteos verificablemente vacíos y «Sin datos» donde no exista medición real; no falsificar métricas.
- Mostrar aviso profesional **sin la palabra DEMO**: «Estamos preparando el acceso seguro y el guardado permanente. Por ahora no ingreses datos de clientes ni vehículos reales». No afirmar «Guardado», «Enviado», «Respaldo activo», «Usuario autenticado» o «Suscripción activa» sin evidencia de servidor.
- Deshabilitar o separar claramente funciones que crean/editarían datos personales o producirían documentos con apariencia oficial **hasta que exista persistencia, auth y permisos reales**. Un botón inactivo debe explicar por qué, y nunca dar la impresión de que guardará.
- Mantener visibles los cinco paneles aprobados, su navegación, tipografía, R2, responsive, iPhone Safari PWA y arquitectura Android nativa aparte. No convertir el SaaS en una landing genérica ni reconstruir funcionalidades.
- No autocompletar por defecto el nombre/datos personales de Ignacio. El taller piloto configurará su identidad cuando se active el proceso autorizado.
- No sustituir datos ficticios por personas reales dentro del código fuente.

## 4. Fases acordadas

### BT-OFICIAL-01A — Limpieza de experiencia y separación de datos de prueba

Implementación realizable ahora, **sin backend**, y susceptible de revisión visual:

1. Inventariar cada pantalla que muestra `DEMO`, datos de muestra, texto de envío/guardado simulado, estadísticas inventadas y registros precargados. Matriz ruta → fuente → cambio → riesgo de regresión.
2. Extraer los fixtures de UI a módulos de desarrollo/pruebas **no incluidos en el bundle público**. No borrarlos si los usan las 103 pruebas y E2E; migrar pruebas hacia inyección explícita exclusivamente en la infraestructura de test, sin activar modo demo con query params, `localStorage`, banderas manipulables ni roles React.
3. Estado oficial predeterminado de **cero registros**, sin clientes/vehículos/OT ni historiales automáticos. La vista oficial nunca llama a seeds o `demoWorkOrders`.
4. Sustituir cifras/actividades de muestra, miembros falsos, respaldos/almacenamiento/plan ilustrativo, perfiles ficticios y envíos/aceptaciones fingidos por estados vacíos o «Aún no configurado» con acciones futuras claramente diferenciadas.
5. Actualizar encabezados y microcopy en las cinco secciones. Dejar de mostrar «DEMO» como branding, **pero conservar avisos veraces** sobre ausencia de guardado, correo, identidad y planes reales. No eliminar por completo las advertencias de seguridad.
6. Mantener funcionalidad de pruebas en entorno automatizado sin contaminar el sitio oficial. No habilitar ninguna creación de registros personales reales por haber ocultado seeds.
7. Mantener la URL del Render existente mientras se desarrolla; la terminación «-demo» en `biomotors-taller-demo.onrender.com` solo se elimina al adoptar un dominio/nombre de servicio con autorización expresa, certificados y enlaces actualizados.

### BT-OFICIAL-01B — Puerta de seguridad y datos reales (NO autorizada en este encargo)

En chat reservado de BT-CP02-D, validar aislamiento real entre talleres y cuentas con Auth/RLS, permisos, almacenamiento y respaldo. La matriz debe incluir anónimo, dueño, empleados, acceso cruzado A/B, links de clientes y documentos, privilegios y borrados. No divulgar claves ni ejecutar operaciones contra datos reales antes de pasar pruebas.

Una vez aprobada esa etapa por el Director, conectar **clientes, vehículos, visitas, OT, multipunto, cotizaciones, informes y entregas** de forma incremental, con operaciones transaccionales, recuperación y auditoría. Comprobar recarga y reingreso de sesión antes de habilitar creación desde la UI.

### BT-OFICIAL-01C — Comunicación y operación del piloto (futuro)

Implementar el requisito BT-COM-01 de un correo único de cierre con cotización, informe técnico y constancia de entrega, además del mecanismo de aprobación previa de presupuesto y registro de clientes por enlace seguro. PDF versionado, permisos del servidor y proveedor de correo seguro. El piloto BIOMOTORS empieza **solo** después de pruebas de seguridad, respaldo, permisos, recuperación y autorización expresa.

## 5. Aceptación de BT-OFICIAL-01A

- Un visitante que abre la web ve ByteTorque R2, pero **ningún** cliente ficticio, patente DEMO, historial inventado, OT-1001…OT-1008, técnico ficticio, estadísticas rellenadas ni aprobaciones/envíos falsos.
- Cifras de negocio deben provenir de datos reales autorizados o estados vacíos; se prohíbe 14 vehículos, 12 respaldos o 5 % ilustrativo.
- El primer acceso muestra de modo útil las áreas Inicio, Órdenes, Clientes y vehículos, Informes, Configuración aun sin datos.
- Ninguna persona puede introducir datos reales creyendo que se guardan: operaciones no persistentes deshabilitadas/identificadas como no disponibles, con aviso de preparación claro, sin simulaciones disfrazadas de producción.
- `main` y Render actuales, sin nuevas ramas o servicios; sin cambios Supabase/Auth/RLS/onboarding, sin datos reales, correos, firma, pagos, suscripciones ni APK.
- Preservar 103 pruebas y ampliar pruebas de vacíos/aislamiento de fixtures; E2E 1650/1440/768/390/375, TypeScript, Vitest, build/PWA, regresiones de navegación. Si alguna prueba de flujo original depende de fixtures, ejecutarla en **harness de pruebas controlado** y comparar con el bundle público limpio.
- E2E debe confirmar ausencia de registros ficticios y que la UI pública no promete guardado ni permite persistir datos falsamente. Verificar que fixtures no son accesibles por URL/flag pública.
- Capturas antes/después escritorio/móvil, checkpoint, roadmap y publicación a Render existente solo tras revisión del Director o procedimiento de QA aprobado. Si despliegue reemplaza la DEMO que aún se utiliza, advertir la pérdida de posibilidad de seguir probándola.
- El usuario revisará el resultado visual antes de habilitar fase 01B.

## 6. Lista de documentos y dependencias

Leer `AGENTS.md`, `README.md`, `roadmap.md`, `docs/checkpoints/CHECKPOINT_BT_QA_02_20261113.md`, `docs/BT_CP02_ARQUITECTURA_AUTH_RLS.md`, `docs/ARQUITECTURA_MULTITENANT_CONFIGURACION.md`, `docs/BT_COM_01_CORREO_CONSOLIDADO_ENTREGA.md`, `docs/SISTEMA_VISUAL_OFICIAL_R2.md`.

**Control estricto:** BT-CP02-D y pruebas A/B siguen en su chat; no se autoriza tocar Supabase ni `bt-owner-onboarding`. ByteTorque Academia y Punto Fénix son proyectos separados.

## 7. Estado al crear este documento

La **especificación** BT-OFICIAL-01 se ha preparado tras inspección directa de main. **No equivale a implementación del frontend.** No se han eliminado datos ni conectado un backend. Un agente/Codex deberá implementar 01A después, con commits pequeños, evidencia y revisión del Director.
