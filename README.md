# ByteTorque

**ByteTorque** es una aplicación independiente para gestionar talleres mecánicos, iniciando con el taller de Ignacio y con arquitectura preparada para convertirse en un **SaaS de suscripción mensual para otros talleres**.

**Estado (11-11-2026):** primera interfaz React + TypeScript + Vite incorporada en `main`, con navegación y módulos demostrativos. **No existe almacenamiento ni autenticación**; CI incorporado y verificado en GitHub Actions (3 pruebas PASS, TypeScript PASS, build PASS).

## Nombre e identidad comercial

**ByteTorque** es el nombre comercial vigente aprobado el 11/11/2026 para la aplicación SaaS, reemplazando al anterior nombre TallerFlow a petición del usuario. El nombre técnico del repositorio, Supabase y Render puede continuar siendo `biomotors-taller` para preservar las integraciones. **BIOMOTORS** es el taller piloto de Ignacio; no es el nombre de la plataforma destinada a todos los talleres. Logotipo definitivo y revisión de disponibilidad de marca/dominio pendientes.

## Responsabilidades

- **Desarrollo e infraestructura:** responsable técnico del proyecto.
- **Comercialización y captación de talleres:** Ignacio, primer usuario piloto y responsable comercial.
- **Precio inicial en estudio:** US$5 por taller al mes, sujeto a validación de costos, impuestos y demanda.

## Producto

Ficha de inspección multipunto, presupuesto formal, PDF/correo, base de datos de clientes y vehículos, reparaciones y diagnósticos, observaciones de fallas no reparadas, historial recuperable y respaldos. **Distribución oficial (corregida 11/11/2026): Android tendrá APK NATIVA React Native + Expo (como Punto Fénix); iOS/iPhone tendrá PWA instalada desde Safari; computadores usarán la web.** Android NO será PWA. Sin tiendas de apps por ahora.

## Arquitectura prevista

- Cliente web + iOS PWA: React + TypeScript + Vite, existente en la raíz y publicado en Render.
- Cliente Android nativo: React Native + Expo + TypeScript, pendiente de crear dentro de `apps/android/`, distribuir como APK instalable.
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
- **Limitación:** PWA iOS no verificada aún en iPhone; APK Android nativa todavía no construida. La demo Render corresponde al frontend web/iOS.

## Arquitectura oficial de plataformas

[Android APK nativa + iOS PWA + web — decisión corregida](docs/ARQUITECTURA_PLATAFORMAS.md). Ambos clientes usarán el backend Supabase multiempresa independiente, sin duplicar datos. [Checkpoint BT-CP01-PLATAFORMAS](docs/checkpoints/CHECKPOINT_BT_CP01_PLATAFORMAS_20261111.md).

**Checkpoint de la última decisión de marca:** [BT-CP01-RENOMBRE-BYTETORQUE](docs/checkpoints/CHECKPOINT_BT_CP01_RENOMBRE_BYTETORQUE_20261111.md). No se renombra infraestructura técnica; solo el nombre visible del producto.
