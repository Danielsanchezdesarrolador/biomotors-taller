# ByteTorque

**Estado actual — 14/11/2026:** BT-OFICIAL-01A presenta ByteTorque R2 con los cinco paneles vacíos y sin registros ficticios. Es una interfaz de preparación: **no hay acceso autenticado, guardado permanente ni operaciones habilitadas para clientes reales**. Las funciones y datos de prueba se conservan exclusivamente en el harness local. [Checkpoint 01A](docs/checkpoints/CHECKPOINT_BT_OFICIAL_01A_20261114.md).


**BT-AUTH-01A-R1 — entrada inicial:** abrir la URL principal `/` muestra inmediatamente el acceso y reemplaza la URL por `/#/acceso`, sin añadir un paso al historial. La PWA conserva su identidad y `start_url: "/"`; las instalaciones existentes usan esta misma entrada. **Ver interfaz pública sin sesión** abre `/#/revision/publica`, una previsualización explícita de solo lectura. Recargar, volver y avanzar conserva la pantalla; registro, recuperación y verificación mantienen sus enlaces directos. No es autenticación real.

**BT-AUTH-01A — acceso visual de revisión:** las siete pantallas están en `/#/acceso`, `/#/acceso/registro`, `/#/auth/confirmacion`, `/#/auth/recuperacion`, `/#/auth/revisa-correo`, `/#/auth/nueva-contrasena` y `/#/auth/contrasena-actualizada`. Son presentaciones de solo lectura; no aceptan credenciales reales ni envían correos. Desde `/#/acceso`, elegir Administrador o Mecánico y pulsar **Abrir vista de revisión**. `/#/revision/administrador` conserva los cinco paneles vacíos; `/#/revision/mecanico` muestra únicamente áreas técnicas. Elegir una entrada no concede permisos. [Checkpoint y capturas](docs/checkpoints/CHECKPOINT_BT_AUTH_01A_20261114.md).

La única cuenta ficticia se mantiene **exclusivamente en el harness privado**, ligado a loopback: `npm run dev:harness -- --port 5177 --strictPort`, abrir `http://127.0.0.1:5177/acceso`. Credenciales de QA (públicas, sin valor de seguridad): `revision.admin@bytetorque.test` / `VistaBT-2026!`. Solo cambia la presentación hacia los paneles vacíos; nunca crea una sesión. No funciona como login de Render. El flujo histórico con fixtures sigue en `/` del harness. No publicar ni exponer el harness a la red.

Verificación adicional con preview de producción en 5173 y harness privado en 5177: `node scripts/verify-auth-ui.cjs`. Comprueba siete pantallas, dos entradas, errores de la cuenta ficticia, contratos sin privilegios, cupos de referencia 2/8/8, ausencia de red de escritura y de almacenamiento, en cinco tamaños.


**ByteTorque** es una aplicación independiente para gestionar talleres mecánicos, iniciando con el taller de Ignacio y con arquitectura preparada para convertirse en un **SaaS de suscripción mensual para otros talleres**.

**Estado (11-11-2026):** Inicio web/iOS PWA **BT-UI-02-R2 visualmente APROBADO como identidad oficial premium** para todo ByteTorque. Proyecto Android nativo BT-UI-01 en `apps/android/`, sin backend ni APK real. CI de ambas plataformas PASS: 7 tests web, build web, TypeScript Android y bundle Expo Android.

**BT-BRAND-02:** marca transparente sobre navy en acceso y navegación, sin placas blancas. Variante derivada de texto claro por contexto; originales, símbolos, iconos PWA/Android y documentos intactos. [Checkpoint y antes/después](docs/checkpoints/CHECKPOINT_BT_BRAND_02_20261114.md).

**BT-BRAND-01:** los dos PNG oficiales se conservan intactos en [assets/brand/originals](assets/brand/originals/), con transparencia y hashes verificados. Acceso, paneles, PWA/favicon y recursos Expo reutilizan sus derivados. [Fuentes y reproducción](assets/brand/README.md) · [Checkpoint y capturas](docs/checkpoints/CHECKPOINT_BT_BRAND_01_20261114.md). La identidad del taller en documentos sigue siendo independiente de «Software ByteTorque».

## Nombre e identidad comercial

**ByteTorque** es la marca comercial vigente para la aplicación SaaS (reemplaza al nombre anterior, según decisión del usuario del 11/11/2026). El nombre técnico del repositorio, Supabase y Render puede continuar siendo `biomotors-taller` para preservar las integraciones. **BIOMOTORS** es el taller piloto de Ignacio; no es el nombre de la plataforma destinada a todos los talleres. Logotipo e icono gráficos oficiales aprobados por el Director el 14/11/2026 (BT-BRAND-01); disponibilidad legal de marca/dominio todavía pendiente.

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

BT-FLOW-01D conecta propuesta, cotización y respuesta DEMO por revisión con el informe de trabajo. BT-FLOW-01E incorpora ahora excepciones, pausas y cierre de visita exclusivamente DEMO, sin entrega física. Abrir módulos no completa etapas ni constituye autorización legal. [Checkpoint B](docs/checkpoints/CHECKPOINT_BT_FLOW_01B_20261113.md) · [Checkpoint C](docs/checkpoints/CHECKPOINT_BT_FLOW_01C_20261113.md).


## BT-FLOW-01D — Propuesta, cotización y respuesta por versión (DEMO)

Tras finalizar la inspección de la misma OT, el mecánico define y confirma diagnóstico, partidas y precios en el expediente. «Preparar cotización» reabre el mismo documento BT-COT-01, con sus cálculos existentes. La revisión económica requiere confirmación expresa. La aprobación local del documento y la respuesta del cliente son registros distintos.

Las respuestas «Aceptada DEMO», «Rechazada DEMO» y «Solicita cambios DEMO» conservan fecha, nota, operador y `quoteId + revision`. Cambiar la cotización invalida su respuesta anterior; cambiar antecedentes técnicos exige reconfirmar propuesta, revisión y respuesta. Rechazo o cambios bloquean la ejecución guiada. Los registros anteriores siguen visibles en memoria.

Una aceptación DEMO vigente habilita una precarga confirmada e idempotente del informe: todos los ítems comienzan con `performed: false`. Únicamente el mecánico marca realizados; solo ellos se suman e imprimen. Otra revisión aceptada genera un informe nuevo sin sobrescribir los trabajos anteriores. Las rutas clásicas y el retorno desde los cinco paneles se conservan.

Todo vive en RAM, se descarta al recargar y carece de efectos legales o de red. Finalizar un informe no cierra la visita: BT-FLOW-01E exige un checklist, pendientes explicados y confirmación independiente de entrega DEMO.

Validación: 91 pruebas Vitest, TypeScript/build/PWA y recorridos Chromium en 1650/1440/768/390/375 px, más regresiones BT-FLOW-01B/C, BT-INS-01, BT-COT-01 y BT-REG-02. Ejecutar `node scripts/verify-flow-d-ui.cjs` con Vite en 5173 y Playwright/Chromium disponibles. Safari físico y aprobación visual del Director pendientes.

[Checkpoint BT-FLOW-01D](docs/checkpoints/CHECKPOINT_BT_FLOW_01D_20261113.md).


## BT-FLOW-01E — Pausas, cancelación y entrega DEMO

El expediente ahora ofrece «Registrar espera DEMO» (repuestos, cliente que no autoriza, trabajo adicional o revisión pendiente), solución con nota y confirmación, historial temporal y cancelación expresa sin borrar documentos existentes. Estas operaciones nunca envían correos ni cambian datos reales.

El hito «Entrega del vehículo» incluye un resumen de inspección, cotización vigente, informe, trabajos realizados y trabajos no realizados. Para poder cerrarlo, exige OT confirmada, inspección finalizada, propuesta y cotización revisadas, respuesta DEMO aceptada para la revisión exacta, informe final válido con al menos un trabajo realizado y ninguna pausa activa. Todos los componentes multipunto sin revisar se muestran como pendientes; no se consideran OK y deben explicarse en la nota final. El cierre requiere cuatro verificaciones, observaciones y una segunda confirmación expresa.

El registro de entrega está vinculado a los IDs y revisiones canónicas, no duplica partidas ni genera una factura. Si un documento cambia después, el cierre anterior se marca «desactualizado» y no puede presentarse como entrega vigente. El expediente queda en memoria únicamente; al recargar se elimina cualquier historial DEMO nuevo. Para una devolución/revisión posterior se crea otra visita del vehículo, en lugar de sobrescribir una cerrada.

**Sin backend, persistencia, correo, firma, pagos ni entrega física.** El Director revisará el recorrido completo A–E al terminar las etapas; Safari físico sigue pendiente. [Contrato E](docs/BT_FLOW_01E_CIERRE_Y_ENTREGA_DEMO.md) · [Checkpoint E](docs/checkpoints/CHECKPOINT_BT_FLOW_01E_20261113.md).


## BT-QA-02 — Correcciones UX del recorrido DEMO

Al abrir una cotización desde el expediente en celular se presenta primero una lista compacta de todas las partidas, tipos, cantidades y valores, junto al subtotal, IVA y total del motor existente. «Ver detalle / Editar ítems» conserva el editor completo; escritorio, plantillas avanzadas y modo informe mantienen sus herramientas.

La propuesta guiada ya no ofrece plantillas. Espera y cancelación están bajo «Opciones de visita»; el estado general y las pausas por resolver siguen visibles. El multipunto usa «Finalizar inspección DEMO» y «No se enviará correo ni documento». Los hitos muestran estados en lenguaje natural y el flujo A–E se anuncia disponible exclusivamente en DEMO.

Validación: **103/103 Vitest** (las 101 anteriores más dos pruebas de resumen), TypeScript, Vite/PWA, recorrido de ingreso nuevo a entrega y regresiones en 1650/1440/768/390/375 px. Cotizaciones de 4/8/12 partidas, edición, estado vacío, aceptación por revisión, realizados/pendientes, pausas y recarga comprobados. Impresión: cuatro trabajos generan una página A4 y el contenido largo dos páginas con texto; la hoja vacía no se reprodujo en Chromium/emulación Android, sin cambiar estilos de impresión. Safari y visor Android físicos siguen pendientes.

[Checkpoint BT-QA-02](docs/checkpoints/CHECKPOINT_BT_QA_02_20261113.md) · [Matriz de QA y resolución](docs/qa/BT_QA_01_MATRIZ_20261113.md). BT-COM-01 y backend continúan fuera de alcance; se espera revisión visual del Director.


## BT-OFICIAL-01A — Interfaz pública y pruebas separadas

`npm run dev`, `npm run build` y `npm run preview` usan siempre la interfaz pública vacía. No existe un modo activable por URL, rol React o almacenamiento para recuperar registros de muestra. El build comprueba el grafo de módulos y excluye fixtures, sesiones y pantallas operativas de prueba. El manifiesto PWA identifica ByteTorque con la paleta R2.

El visitante conserva Inicio, Órdenes, Clientes y vehículos, Informes y Configuración. Puede recorrer sus estados vacíos. Alta/edición, recepción, OT, inspección/documentos/entrega y configuración operativa quedan deshabilitadas con explicación mientras se preparan acceso seguro y guardado. Tampoco se habilitan correo, planes, pagos, enlaces ni respaldos reales.

Los 103 casos originales siguen ejecutándose mediante inyección de fixtures solo en Vitest; ocho pruebas nuevas verifican los vacíos y su independencia. Para recorridos históricos: `npm run dev:harness -- --port 5177 --strictPort` (solo loopback y datos ficticios), seguido de los scripts de regresión existentes. Para comprobar la versión pública compilada: `npm run preview -- --port 5173 --strictPort` y `node scripts/verify-official-ui.cjs`. Los workflows de GitHub mantienen estas dos comprobaciones separadas.

Se sustituyó la demostración operativa del Render existente; el harness privado conserva la posibilidad de probar el flujo A–E y los editores. No se creó otro servicio ni dominio. La URL con `-demo` permanece hasta autorización separada.

[Inventario y funciones deshabilitadas](docs/BT_OFICIAL_01A_INVENTARIO_20261114.md) · [Pruebas, capturas y publicación](docs/checkpoints/CHECKPOINT_BT_OFICIAL_01A_20261114.md). **BT-OFICIAL-01B y BT-CP02-D no iniciados.**
