# ByteTorque — BT-UI-06 — Configuración premium

Fecha: 11/11/2026 (Chile). Base inicial `8f869ae`; incorporada documentación comercial concurrente `163072f` BT-PLAN-01 sin activar pagos.

## Implementación

Quinta sección integrada al shell R2 existente: nueve tarjetas en cuadrícula 3×3, panel de estado/acciones, fotografía R2, KPI ficticios y fecha dinámica America/Santiago. En tablet/móvil se reorganiza sin scroll horizontal. Sidebar/topbar, los otros cuatro paneles, sus estilos y Android se conservan.

Archivos principales:

- `src/configuracion/ConfiguracionPanel.tsx`, `configuracion.css`: cuadrícula, formularios y diálogos, estados veraces, búsqueda y acciones rápidas.
- `settingsData.ts`, `settingsData.test.ts`, `settingsSession.ts`: modelos por taller, datos sintéticos, guardas DEMO, catálogo, preferencias y memoria temporal.
- `WorkshopForms.tsx`: perfil, nombre comercial coherente con marca, logo local limitado/decodificado, correo sin secretos y preferencias sin efectos globales.
- `UsuariosPermisosDemo.tsx`: roles, invitación local, desactivación y concesión limitada de administración; propietario protegido.
- `PlantillasDemo.tsx`: cuatro tipos de documento y vista previa reutilizando BT-UI-05. No se altera la apariencia ni se aplican cambios a documentos anteriores.
- `InformacionDemo.tsx`: seguridad/respaldos, prueba de correo informativa y suscripción no operativa.
- `RegistroLinksDemo.tsx`: reutiliza datos personales existentes y previsualiza vehículo/motivo/resumen como solicitud pendiente local; sin enlace público ni OT automática.
- `src/App.tsx`: integra Configuración, conserva búsqueda y elimina el placeholder anterior ya sustituido.
- Extensiones opcionales de `RegistroClienteDemo.tsx` (borrador inicial) y `DocumentoPreview.tsx` (presentación comercial) conservan su comportamiento y apariencia predeterminados.
- `scripts/verify-settings-ui.cjs`: interacciones, responsive y límites de alcance reproducibles con Playwright del runtime y servidor dev en 5173.

## Fidelidad y diferencias deliberadas

Se comparó el mockup con capturas de 1650/1440/768/390/375 px. Se ajustaron altura de tarjetas, títulos, resúmenes, iconografía, estados y proporciones. Nueve tarjetas y panel derecho conservan la composición de referencia. Datos ficticios y estados sin configurar sustituyen mensajes engañosos como correo operativo, respaldo activo, cuota real o plan activado. No se prometen usuarios ilimitados ni copias recuperables.

Capturas versionadas:

- [Escritorio 1650 px](../screenshots/BT_UI_06_1650.png).
- [Móvil 390 px](../screenshots/BT_UI_06_390.png).

Otras capturas: `/workspace/visual-ui06/`. Regresión visual a 1650 px: Inicio y OT-1002 coinciden píxel a píxel con las capturas anteriores. Clientes e Informes conservan dimensiones y contenido; se observaron 16 píxeles distintos exclusivamente en el borde redondeado superior del icono global (x24–69, y26–29), sin diferencias en sus áreas de contenido. Se registra esa diferencia de rasterizado en lugar de afirmar igualdad absoluta.

## Funciones DEMO

- Perfil/marca/preferencias editables en memoria; el nombre comercial se mantiene coherente entre perfil y branding. Logo PNG/JPG/WebP ≤1 MB, con validación de decodificación local, sin subida ni SVG.
- Usuarios y roles ficticios, invitación example.com sin correo ni acceso real, propietario/rol propio protegidos; nunca se afirma autorización de backend.
- Plantillas con encabezado, pie, logo y secciones; mismo componente HTML de Informes con parámetros opcionales, sin cambio global.
- Correo sin contraseñas/SMTP; no se puede marcar Configurado sin proveedor. Probar correo solo explica la indisponibilidad.
- Registro completo local: datos personales → vehículo → motivo → resumen → solicitud pendiente DEMO, sin crear una OT ni URL compartible.
- Preferencias CLP/Chile/km iniciales, cambios solo en Configuración; los documentos anteriores mantienen sus valores.
- Seguridad y respaldos explicativos, sin archivos ni restauraciones ficticias. Almacenamiento 5% es un indicador ilustrativo, no medición ni cuota real.
- Plan y suscripción de taller: catálogo BT-PLAN-01 (Básico gratis sin anuncios en lanzamiento; Plus USD 5; Full USD 15), trial futuro de 72 h no operativo, renovación desactivable solo explicativa. Sin tarjetas, cargos, fechas de cobro inventadas ni cancelaciones confirmadas.

## Pruebas ejecutadas

- TypeScript PASS; **40 tests unitarios en 8 archivos PASS**; build Vite y `PWA assets: PASS`.
- Pruebas de modelos/contexto, guardas por taller, roles protegidos, admin con concesión limitada, suscripción solo propietario, ausencia de activación de correo/pagos, logo acotado y vehículo/motivo: PASS. Son pruebas de frontend DEMO, no RLS ni API real.
- Navegador 1650/1440/768/390/375 px: nueve tarjetas, búsqueda/navegación, perfil/marca, rechazo de SVG y archivo corrupto, logo local, usuarios/invitación, plantillas, correo, registro completo, preferencias, planes/renovación explicativa y backups: PASS. Reinicio al recargar y aislamiento de cambios respecto a otros paneles verificados.
- En esos recorridos: cero solicitudes de escritura de red, cero localStorage/sessionStorage y sin errores JavaScript.
- Regresiones de Clientes, Informes y Órdenes en los cinco tamaños: PASS. No se modificaron `premium.css`, `styles.css`, dependencias, Supabase ni Android.

## Arquitectura y pendientes

[Contrato multitenant](../ARQUITECTURA_MULTITENANT_CONFIGURACION.md) y [matriz de roles](../MATRIZ_ROLES_Y_PERMISOS.md). Las garantías de autenticación, autorización de servidor/RLS, revocación, archivos privados, respaldos y cobros no están implementadas ni probadas contra backend. Se documentan los controles y pruebas futuros sin confundirlos con las guardas locales.

Pendientes: aprobación visual del Director, Safari/iPhone físico, backend multitenant y suscripción/pagos reales solo con nueva autorización. No se integra Supabase ni ningún proveedor. GitHub Actions no consultable desde este entorno (API Forbidden); estado administrativo Render LIVE sin acceso. El contenido publicado se verifica tras push de forma independiente.

## Publicación comprobada

Implementación `7a040e0` enviada a origin/main preservando la política comercial concurrente `163072f`. El Render existente sirve HTML raíz e index.html que referencian `/assets/index-DSGVpjQI.js` y `/assets/index-C0Q79Jfm.css`; los bundles descargados por HTTPS coinciden **byte a byte** con el build final validado. Disponible en Configuración. No se creó otro servicio ni se alteró la configuración cloud publicada. La evidencia confirma contenido servido; no se dispone de consulta al estado administrativo literal LIVE ni a Actions remoto.

## Auditoría independiente — ChatGPT (11/11/2026, Chile)

Esta sección aclara la evidencia obtenida posteriormente desde conectores con acceso remoto; las limitaciones del informe original de Codex se conservan por trazabilidad.

- **GitHub**: `main` en `04f7bf471465152eb60330546c9bbdb40925e1cb`; implementación anterior `7a040e0`. No se modificó el frontend en esta auditoría.
- **GitHub Actions**: run `43141082423` **SUCCESS**. Jobs `Web / iOS PWA` y `Android React Native / Expo (sin generar APK)` SUCCESS. Los logs del job Web confirman **40 de 40 tests PASS en 8 archivos**, TypeScript web PASS, build Vite PASS y `PWA assets: PASS`. Android TypeScript/Expo/bundle PASS; **sin construir ni instalar APK**.
- **Render**: servicio de demo existente, deploy `dep-dbqi6a2vcj2c73evr1dg` para `04f7bf4`, estado administrativo **LIVE**.
- **Capturas reales examinadas** desde GitHub: `docs/screenshots/BT_UI_06_1650.png` y `BT_UI_06_390.png`. Composición premium R2 coherente: navegación y hero, cuatro KPI, nueve tarjetas, columna derecha de estado/acciones; adaptación móvil apilada, sin desbordamiento horizontal aparente. Es una inspección visual cualitativa, **no** un nuevo cálculo de diferencia de píxeles.
- **Revisión de código**: el catálogo de Básico gratis sin anuncios durante lanzamiento, Plus USD 5/mes, Full USD 15/mes y trial futuro de 72 h aparece como información DEMO. `Desactivar renovación automática · DEMO` solo muestra explicación: **no cancela suscripción ni cobra**. Correo, respaldos, RLS y Auth no están habilitados.
- **Limitaciones**: comparaciones píxel a píxel de las cuatro pantallas anteriores son evidencia del agente Codex, no reejecutadas aquí. **Aprobación visual definitiva del Director pendiente**, así como prueba Safari en iPhone físico y futura auditoría de seguridad multitenant real.
- **Siguiente fase**: antes de usar datos de clientes, implementar de manera autorizada Auth/RLS, aislamiento por taller y protección de documentos; antes de pagos reales, pasarela segura, pruebas de cancelación y transparencia conforme a BT-PLAN-01. Ninguna de estas acciones fue ejecutada en esta auditoría.
