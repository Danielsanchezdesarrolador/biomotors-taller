# ByteTorque

**ByteTorque** es una aplicación independiente para gestionar talleres mecánicos, iniciando con el taller de Ignacio y con arquitectura preparada para convertirse en un **SaaS de suscripción mensual para otros talleres**.

**Estado (11-11-2026):** Inicio web/iOS PWA **BT-UI-02-R2 visualmente APROBADO como identidad oficial premium** para todo ByteTorque. Proyecto Android nativo BT-UI-01 en `apps/android/`, sin backend ni APK real. CI de ambas plataformas PASS: 7 tests web, build web, TypeScript Android y bundle Expo Android.

## Nombre e identidad comercial

**ByteTorque** es la marca comercial vigente para la aplicación SaaS (reemplaza al nombre anterior, según decisión del usuario del 11/11/2026). El nombre técnico del repositorio, Supabase y Render puede continuar siendo `biomotors-taller` para preservar las integraciones. **BIOMOTORS** es el taller piloto de Ignacio; no es el nombre de la plataforma destinada a todos los talleres. Logotipo definitivo y revisión de disponibilidad de marca/dominio pendientes.

## Responsabilidades

- **Desarrollo e infraestructura:** responsable técnico del proyecto.
- **Comercialización y captación de talleres:** Ignacio, primer usuario piloto y responsable comercial.
- **Planes aprobados para diseño (11/11/2026):** Básico gratis sin publicidad durante el lanzamiento; Plus USD 5/mes; Full USD 15/mes por taller. Trial Full 3 días con método de pago y cancelación de renovación inmediata en Configuración. Sin cobros reales activados; impuestos, límites y pasarela por definir.

## Producto

Ficha de inspección multipunto, presupuesto formal, PDF/correo, base de datos de clientes y vehículos, reparaciones y diagnósticos, observaciones de fallas no reparadas, historial recuperable y respaldos. **Distribución oficial (corregida 11/11/2026): Android tendrá APK NATIVA React Native + Expo (como Punto Fénix); iOS/iPhone tendrá PWA instalada desde Safari; computadores usarán la web.** Android NO será PWA. Sin tiendas de apps por ahora.

## Arquitectura prevista

- Cliente web + iOS PWA: React + TypeScript + Vite, existente en la raíz y publicado en Render.
- Cliente Android nativo: **React Native + Expo SDK 57 + TypeScript**, Inicio y navegación implementados en `apps/android/`, con perfil APK de prueba documentado; APK real todavía pendiente de generación y firma.
- Backend/datos: proyecto Supabase separado `biomotors-taller`, con Auth, Postgres y RLS multiempresa.
- Despliegue web: [demo pública Render](https://biomotors-taller-demo.onrender.com) verificada como `live` el 11/11/2026. Servicio independiente de BIOMOTORS Academia, con despliegue automático desde `main`.
- Emails y suscripciones: proveedor a seleccionar tras pruebas, validación de costos y permisos.

## Documentos

- [AGENTS.md](AGENTS.md) — reglas para agentes y desarrollo.
- [agent.md](agent.md) — alias de referencia.
- [roadmap.md](roadmap.md) — prioridades y fases.
- [Checkpoint BT-CP00](docs/checkpoints/CHECKPOINT_BT_CP00_SAAS_20261111.md) — decisiones y estado previo a la creación del repositorio.
- [Checkpoint BT-CP01](docs/checkpoints/CHECKPOINT_BT_CP01_REPOSITORIO_20261111.md) — inicialización documental verificada.

**Seguridad:** nunca subir credenciales reales ni proyectos compartidos con BIOMOTORS Academia.

## Ejecutar en un computador

Necesitas Node.js 22.12+ y npm. Desde el directorio del proyecto:

```bash
npm install
npm run dev
```

Abre la dirección local que indique Vite (habitualmente http://localhost:5173). Para verificar:

```bash
npm run typecheck
npm test
npm run build
```

**Aviso:** las pantallas son una maqueta interactiva. Los contadores muestran cero intencionalmente y ninguna función permite almacenar datos personales. No ingreses datos reales durante esta etapa.

El manifiesto, iconos PNG generados durante el build y service worker básico están preparados sin caching de datos privados. La instalación real de la PWA en iPhone requiere pruebas físicas. Los iconos web no son una APK Android; aún debemos construirla, firmarla y probarla.

## Metodología de ejecución

ChatGPT realiza directamente lo que esté al alcance de sus herramientas; modo Alto para razonamiento profundo; Codex solamente para tareas que lo necesiten; el responsable técnico revisa y autoriza, Ignacio lidera contacto y ventas. Detalles en `AGENTS.md`.

## Demo publicada

- URL: https://biomotors-taller-demo.onrender.com
- CI GitHub Actions: `43106669748` PASS, con generación y validación de iconos PWA.
- Render: primer deploy `dep-dbqe4r6c6qcc73f2768g` LIVE; actualización con iconos `dep-dbqe6ihsrm7s738dnptg` LIVE.
- **Limitación:** PWA iOS no verificada aún en iPhone; código Android nativo incorporado; compilación APK, firma y pruebas físicas pendientes. La demo Render corresponde al frontend web/iOS.

## Arquitectura oficial de plataformas

[Android APK nativa + iOS PWA + web — decisión corregida](docs/ARQUITECTURA_PLATAFORMAS.md). Ambos clientes usarán el backend Supabase multiempresa independiente, sin duplicar datos. [Checkpoint BT-CP01-PLATAFORMAS](docs/checkpoints/CHECKPOINT_BT_CP01_PLATAFORMAS_20261111.md).

## BT-UI-01 — Inicio visual aprobado

El Inicio se rediseñó en ambas plataformas con paleta azul marino/blanco/azul, cuatro métricas, estado de órdenes, órdenes recientes, actividad, accesos rápidos y navegación a cinco paneles. **Los indicadores, vehículos y órdenes mostrados son ficticios de demostración** y NO proceden de Supabase ni de clientes de Ignacio.

- **Web/iOS PWA:** ver [demo Render](https://biomotors-taller-demo.onrender.com), publicada desde la raíz de `main`.
- **Android nativa:** código fuente en [apps/android](apps/android/README.md), verificable con `cd apps/android && npm install && npm run typecheck`. No se ha emitido un APK instalable.
- **Continuidad:** [BT-UI-01](docs/checkpoints/CHECKPOINT_BT_UI_01_INICIO_DUAL_20261111.md).

## Validación BT-UI-01

- GitHub Actions: https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43113368311 — SUCCESS.
- Android generó un bundle Metro verificado, pero **no un APK instalable**: están pendientes la firma, la compilación nativa y las pruebas físicas.

## Flujo aprobado de desarrollo: WEB PRIMERO, APK ANDROID AL FINAL

La **web publicada en Render** es el espacio principal de revisión de diseños y flujos. Cada cambio aprobado se integra en `main` y se despliega automáticamente al mismo sitio de demostración; no crear un nuevo studio ni otra rama para esto.

- **Durante la construcción:** diseñar y validar los cinco paneles en web (React/Vite) y la PWA Safari iOS, con datos DEMO hasta aprobar el backend seguro.
- **Android:** conservar el proyecto existente React Native + Expo de `apps/android/`; no lo reemplazaremos por WebView ni lo empaquetaremos como PWA.
- **Después de validar las funcionalidades web:** trasladar el sistema de diseño y las pantallas aprobadas al cliente nativo Android, reutilizando tipos, lógica de negocio y APIs cuando sea posible, hasta tener paridad funcional.
- **Al final:** generar un APK firmado, instalarlo en Android físico y probar flujos, navegación, permisos y seguridad; no bastará con compilar un sitio web a APK.
- **iPhone:** seguirá funcionando como PWA Safari instalable desde la pantalla de inicio. El backend Supabase será único y con aislamiento de datos por taller.

**Diseño BT-UI-02-R2 APROBADO:** el 11/11/2026 el Director aprobó el acabado premium como sistema visual oficial para todos los paneles de ByteTorque. Implementación en `src/premium.css` y CSS original preservado; **no modificar Inicio R2** al diseñar otras pantallas. Ver `docs/SISTEMA_VISUAL_OFICIAL_R2.md`.

[Documento de metodología y arquitectura](docs/FLUJO_WEB_PRIMERO_APK_NATIVA.md) · [Checkpoint BT-UI-02](docs/checkpoints/CHECKPOINT_BT_UI_02_PREMIUM_WEB_FIRST_20261111.md)

**Validación BT-UI-02 (previa a aprobación visual):** GitHub Actions `43115723650` SUCCESS; Render deploy `dep-dbqf4l2jnfac73bf3sb0` LIVE. Android conserva BT-UI-01; no se ha generado APK.

## Estándar oficial de diseño (11/11/2026)

El Director aprobó **BT-UI-02-R2**, por lo que ya no es una propuesta pendiente: su diseño es obligatorio para **Inicio, Órdenes de trabajo, Clientes y vehículos, Informes y cotizaciones, Configuración**. [Sistema visual oficial R2](docs/SISTEMA_VISUAL_OFICIAL_R2.md) · [Brief próximo panel, Órdenes](docs/briefs/BT_UI_03_ORDENES_TRABAJO_DIRECCION_ARTE.md).

## Planes comerciales oficiales — BT-PLAN-01

- **Básico:** gratis sin publicidad durante lanzamiento. Clientes/vehículos/órdenes manuales, sin enlace automático de registro ni envío de PDF por correo.
- **Plus:** USD 5/mes por taller, contempla enlaces de registro y envíos automáticos de informes al implementar backend seguro.
- **Full:** USD 15/mes por taller, con automatización y administración avanzadas sujetas a desarrollo.
- **Prueba Full:** 3 días (72 h), requiere agregar método de pago mediante proveedor seguro. El propietario podrá **desactivar la renovación automática desde el principio**, sin perder acceso Full antes de expirar. Si se desactiva a tiempo, no se intenta el cargo posterior; después retorna a Básico sin perder información.
- Límites, pasarela, impuestos y publicidad después del lanzamiento pendientes. **No se han implementado cobros ni trials reales.**

Ver [especificación BT-PLAN-01](docs/PLANES_COMERCIALES_BT_PLAN_01.md) y [checkpoint](docs/checkpoints/CHECKPOINT_BT_PLAN_01_20261111.md).


## BT-REG-02 — registro previo a la visita (DEMO)

En Clientes y vehículos, «Generar enlace de registro» abre **una simulación local sin enlace válido**. Incluye los tres pasos de contacto, vehículo y motivo de visita, revisión editable y bandeja de solicitudes ficticias pendientes de revisión. El registro manual continúa disponible; no se convierten automáticamente solicitudes a órdenes.

Se permite usar únicamente datos de muestra. Sin persistencia, correos, pagos, permisos comerciales, Auth ni llamadas a Supabase. La función se reservará para Plus/Full (y trial Full válido) tras autorización y controles reales en servidor; Básico continuará con registro manual.

Pruebas automáticas: npm run typecheck, npm test, npm run build; el flujo visual Chromium y capturas de escritorio/móvil se ejecutan por separado en GitHub Actions «BT-REG-02 — Capturas y recorrido DEMO». Las capturas de navegador no sustituyen la revisión física en Safari iPhone ni la aprobación visual del Director.

[Requerimiento original](docs/BT_REGISTRO_CLIENTE_VEHICULO_VISITA.md) · [Checkpoint de implementación](docs/checkpoints/CHECKPOINT_BT_REG_02_20261113.md).

## BT-FLOW-01B/C — Ingreso y expediente guiado DEMO

Desde Inicio, «Nuevo ingreso de vehículo» permite elegir una ficha existente, registrar cliente/vehículo ficticios o revisar una solicitud BT-REG-02. La recepción abre un expediente por visita; la OT requiere confirmación humana y no se duplica por repetir la acción. «Continuar trabajos» y «Volver al expediente» conservan el contexto al navegar entre los cinco paneles.

Las fichas, solicitudes, visitas y OT nuevas se comparten en memoria de la pestaña y pueden abrir su mismo multipunto, cotización e informe. Recargar/cerrar descarta los datos nuevos. No hay almacenamiento permanente, enlaces públicos, correos, firmas, pagos ni backend real conectado al flujo.

BT-FLOW-01D/E siguen pendientes: coordinación profunda de propuesta, respuesta/versiones de cotización, ejecución autorizada, excepciones y cierre/entrega. Abrir módulos no completa etapas ni constituye autorización legal. [Checkpoint B](docs/checkpoints/CHECKPOINT_BT_FLOW_01B_20261113.md) · [Checkpoint C](docs/checkpoints/CHECKPOINT_BT_FLOW_01C_20261113.md).
