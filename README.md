# BIOMOTORS TALLER

Aplicación independiente para gestionar talleres mecánicos, iniciando con el taller de Ignacio y con arquitectura preparada para convertirse en un **SaaS de suscripción mensual para otros talleres**.

**Estado (11-11-2026):** primera interfaz React + TypeScript + Vite incorporada en `main`, con navegación y módulos demostrativos. **No existe almacenamiento, autenticación ni despliegue público**; CI incorporado y verificado en GitHub Actions (3 pruebas PASS, TypeScript PASS, build PASS).

## Responsabilidades

- **Desarrollo e infraestructura:** responsable técnico del proyecto.
- **Comercialización y captación de talleres:** Ignacio, primer usuario piloto y responsable comercial.
- **Precio inicial en estudio:** US$5 por taller al mes, sujeto a validación de costos, impuestos y demanda.

## Producto

Ficha de inspección multipunto, presupuesto formal, PDF/correo, base de datos de clientes y vehículos, reparaciones y diagnósticos, observaciones de fallas no reparadas, historial recuperable y respaldos. Debe funcionar bien en iPhone, Android y computador.

## Arquitectura prevista

- Frontend: React + TypeScript + Vite, con PWA móvil.
- Backend/datos: proyecto Supabase separado `biomotors-taller`, con Auth, Postgres y RLS multiempresa.
- Despliegue web: preferencia inicial por Render, pendiente de configuración técnica.
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

El manifiesto web y el service worker básico están preparados sin caching de información de clientes. La instalación en iPhone, iconos PNG, comportamientos offline y actualizaciones requieren pruebas adicionales.

## Metodología de ejecución

ChatGPT realiza directamente lo que esté al alcance de sus herramientas; modo Alto para razonamiento profundo; Codex solamente para tareas que lo necesiten; el responsable técnico revisa y autoriza, Ignacio lidera contacto y ventas. Detalles en `AGENTS.md`.
