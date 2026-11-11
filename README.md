# BIOMOTORS TALLER

Aplicación independiente para gestionar talleres mecánicos, iniciando con el taller de Ignacio y con arquitectura preparada para convertirse en un **SaaS de suscripción mensual para otros talleres**.

**Estado (11-11-2026):** repositorio privado inicializado en `main`. Las funcionalidades de la aplicación aún no están implementadas.

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
