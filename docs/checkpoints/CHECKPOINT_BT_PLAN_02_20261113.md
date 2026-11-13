# CHECKPOINT BT-PLAN-02 — Plantillas propias de informes por suscripción

**Fecha:** 13/11/2026  
**Estado:** decisión de producto aprobada; **solo documentación, no implementación**.

## Instrucción del Director

- **Básico gratis sin anuncios durante lanzamiento:** acceso a plantillas predeterminadas ByteTorque, **sin carga de formatos propios**.
- **Plus USD 5/mes:** además de las predeterminadas, puede subir y administrar los formatos propios de informe de su taller.
- **Full USD 15/mes:** igual privilegio de formatos propios, además de las demás prestaciones de Full.
- **Trial Full 3 días con método de pago:** acceso temporal a esta función; al vencer, se aplicarán permisos del plan vigente sin eliminar la documentación histórica.

## Diseño y seguridad pendientes

- Configuración → Plantillas de documentos → Mis formatos de informe, y selector de plantilla al crear informe.
- Subida y vista previa seguras, almacenamiento privado aislado por taller, validación de tipo/tamaño y protección contra contenido activo y macros.
- Convertir documentos importados a informes interactivos solo con adaptación/mapeo y validación: **ninguna conversión automática prometida**.
- Validar capacidades mediante backend/suscripción real, no ocultando botones en frontend.
- Al bajar a Básico, conservar historial y acceso/exportación de archivos propios, desactivar uso para nuevos informes.
- Definir más adelante tipos soportados, límites/cupos, versionado y política de almacenamiento.

## Continuidad

- Se actualizó exclusivamente `roadmap.md`, `AGENTS.md`, `docs/PLANES_COMERCIALES_BT_PLAN_01.md`, `docs/BT_UI_05_DOCUMENTOS_DEMO.md` y este checkpoint.
- No modificar Supabase, Render, Android, servicios de correo ni front-end mientras Codex continúa BT-INS-01.
- No ampliar el alcance de la tarea de Codex sin nueva instrucción.
