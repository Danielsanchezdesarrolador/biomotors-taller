# BIOMOTORS TALLER — CHECKPOINT BT-CP00-SaaS

**Fecha:** 11 de noviembre de 2026  
**Origen:** requerimientos de audio de Ignacio + decisión comercial del usuario en esta conversación.  
**Tipo:** checkpoint documental; sin implementación técnica.

## Decisiones confirmadas

1. BIOMOTORS TALLER es independiente de BIOMOTORS Academia.
2. Se construirán fichas de inspección multipunto, presupuestos formales, correos al cliente, registro de clientes/vehículos, diagnósticos, reparaciones, observaciones pendientes e historial con respaldo.
3. El usuario desarrollará la aplicación y liderará infraestructura/tecnología; Ignacio contactará talleres para venderla y liderará comercialización.
4. El producto apunta a ser una plataforma SaaS para talleres, con precio orientativo de US$5 por taller/mes.
5. El taller de Ignacio será el primer piloto; la separación de datos por taller se considerará desde la arquitectura inicial.
6. El acceso prioritario será mediante PWA adaptable para iPhone, Android y escritorio.
7. Existe un proyecto Supabase llamado `biomotors-taller` según el usuario, sin conexión o esquema verificados aquí.

## Estado verificado

- **GitHub:** `Danielsanchezdesarrolador/biomotors-taller` devolvió 404 y no apareció en búsqueda de repositorios accesibles al verificarlo durante este checkpoint. Por tanto NO se declara creado ni actualizado.
- **Supabase:** sin operaciones sobre la instancia; las tablas, RLS, claves y estado de despliegue no fueron revisados.
- **Aplicación:** no se ha desarrollado ni desplegado desde este kit.
- **Documentación:** actualizada en paquete descargable con `AGENTS.md`, `agent.md`, `roadmap.md`, `README.md` y archivos base.

## Pendientes que requieren decisión, no asumir

- Propiedad intelectual del software y condiciones de colaboración entre usuario e Ignacio.
- Entidad que factura/cobra, reparto económico, soporte y gastos operativos.
- Pasarela de pago, moneda de cobro, pruebas gratis, límites del plan y precio final.
- Plantillas originales de hojas multipunto y presupuesto para replicarlas fielmente.
- Política de privacidad, borrado/exportación, retención de datos y aspectos legales locales.

## Orden de continuidad

1. Crear/verificar el repositorio privado `Danielsanchezdesarrolador/biomotors-taller` (rama `main`) y copiar este kit, preservando historial.
2. Vincular de forma segura el Supabase independiente y validar su acceso sin revelar secretos.
3. Construir la base PWA y avanzar según BT-CP01 y siguientes del roadmap.
4. Al cerrar cada fase, entregar commit, pruebas, riesgos y nuevo checkpoint.

**No ejecutar pagos productivos ni correos masivos en el primer checkpoint.**