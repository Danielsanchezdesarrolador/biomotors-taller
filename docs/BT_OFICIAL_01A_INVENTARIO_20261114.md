# BT-OFICIAL-01A — Inventario de transición y frontera de pruebas

Base real revisada: `3f0af07`, main, 14/11/2026. Director autoriza interfaz pública de preparación; no habilita backend ni ingreso de información real.

| Pantalla / ruta | Fuente anterior | Presentación oficial | Riesgo y verificación |
|---|---|---|---|
| Inicio | KPI fijos de App, FlowHome, visitas reconstruidas desde OT de prueba | Conteos de colecciones vacías, ingreso deshabilitado, trabajos vacíos y siete etapas informativas | No se instancia flowSession en público; no hay actividades ni órdenes ficticias. Se conserva el hero decorativo R2, que no representa un vehículo registrado |
| Clientes y vehículos | clientesData: cinco clientes, ocho vehículos, contactos, visitas y observaciones | Directorio, vehículos, historial y observaciones vacíos; alta deshabilitada | No inputs personales, enlaces, fichas ni patentes de muestra |
| Órdenes | ocho demoWorkOrders y orderSession | Cero registros y estado «Aún no hay órdenes de trabajo»; creación deshabilitada | No se instancian sesiones ni se fabrican OT por navegar |
| Informes y cotizaciones | initialDocuments, eventos históricos, selectores de OT, editores y multipunto | Sin documentos/historial, vista previa vacía, creación deshabilitada | Motores, revisión, performed e impresión preservados en módulos originales; no documentos aparentes de un cliente |
| Configuración | initialSettings, miembros ficticios y KPI/servicios ilustrativos | Nueve áreas sin configurar, cero usuarios habilitados, servicios pendientes y almacenamiento sin medición | Sin perfiles, correo, plan o respaldo activo inventados; ningún formulario de configuración operativo |
| Shell R2 | marca compartida con cuenta/taller de muestra y notificación artificial | AppShell común, ByteTorque, acceso en preparación, sin sesión, taller sin configurar | El harness inyecta únicamente sus textos de prueba; la versión pública no importa su entry ni sus datos |
| Identidad PWA | manifiesto aún nombraba TallerFlow, paleta antigua de iconos | ByteTorque y colores navy/azul de R2 | Solo manifiesto/iconos web/generador; sin cambios en Android nativo |

## Separación estática, sin modo público de prueba

- `src/App.tsx` monta exclusivamente AppShell y adaptadores de lectura `src/official/`. Son estados vacíos de los cinco paneles; no reemplazan los motores existentes ni incluyen operaciones de memoria disfrazadas de guardado real.
- `officialWorkspace` es una colección de arrays vacíos inmutables. Los ceros son conteos de ese estado sin registros. Servicios/almacenamiento usan «Sin configurar» / «Sin datos», sin mediciones inventadas.
- `tests/fixtures/records.ts` conserva registros de OT, directorio, historial, observaciones, solicitudes, partidas, inspección de ejemplo, documentos y configuración. `tests/fixtures/dashboard.ts` conserva las métricas históricas para sus pruebas.
- El código de dominio mantiene sus funciones, tipos y validaciones, pero su fuente de seeds por defecto es `src/data/emptyTestRecords.ts`. La factoría de configuración no construye un taller de muestra sin la inyección privada.
- Vitest (`vitest.config.ts`) y el servidor local `vite.harness.config.ts` sustituyen `#test-records` por los fixtures en resolución de módulos. No existe query parameter, almacenamiento, variable de usuario, rol React ni menú que active esta inyección en la aplicación pública.
- `tests/harness/WorkflowApp.tsx` conserva el recorrido A–E y pantallas operativas exclusivamente para pruebas; reutiliza AppShell y todos los módulos de negocio actuales. Servidor ligado a **127.0.0.1:5177**, sin nueva rama, servicio Render ni studio.
- La configuración Vite pública deniega acceso a tests, docs y scripts en su servidor de desarrollo. La salida de producción no copia esas carpetas ni expone el harness.
- El build inspecciona el grafo de módulos y falla si entra lógica de prueba/dominio fuera de la presentación permitida. `scripts/verify-official-bundle.mjs` valida ese inventario, la ausencia de identificadores/clientes/fixtures y la identidad PWA.
- Se conserva el service worker existente: no tiene caché de respuestas, fixtures ni datos privados. No hubo que migrar ni borrar datos de usuarios.

## Operaciones que siguen deshabilitadas

Registro y edición de cliente/vehículo, recepción, creación/modificación de OT, inspecciones, propuestas, respuestas, ejecución, informes y entrega; emisión/impresión de documentos de clientes; perfiles/logos del taller, invitaciones/permisos, preferencias operativas, enlaces, correo, respaldos y administración de plan/suscripción.

La navegación, consulta de estados vacíos y mensajes de preparación están disponibles. Cada botón inactivo tiene explicación y referencia al aviso principal: «Estamos preparando el acceso seguro y el guardado permanente. Por ahora no ingreses datos de clientes ni vehículos reales». No hay manejadores de creación ocultos detrás de esos botones.

La ausencia de operaciones públicas no acredita Auth/RLS ni aislamiento real. BT-OFICIAL-01B, BT-CP02-D y BT-COM-01 permanecen sin iniciar.

## Ejecución para desarrollo y QA

- Interfaz oficial: `npm run dev` o `npm run build` y `npm run preview -- --port 5173 --strictPort`.
- Modelos y pruebas de regresión: `npm test` (los 103 casos anteriores se conservan; los tests históricos de App/dashboard apuntan ahora al harness/fixtures).
- Recorrido controlado: `npm run dev:harness -- --port 5177 --strictPort`; scripts de regresión existentes usan ese puerto por defecto. Solo datos ficticios y sin operaciones reales.
- Público: `node scripts/verify-official-ui.cjs`, cinco paneles a 1650/1440/768/390/375, campos/creaciones bloqueados, sin registros de prueba ni activación por URL.
- Actions conserva workflows del harness y agrega `bt-oficial-01.yml` para verificar el bundle y la interfaz pública compilada.

Al publicar, el Render actual deja de servir la demostración operativa; esta posibilidad de prueba se conserva solo en el harness privado. La sustitución fue advertida al Director durante la implementación. La URL existente con «-demo» permanece hasta autorización independiente de dominio.
