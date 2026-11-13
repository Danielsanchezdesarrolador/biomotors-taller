# ByteTorque — Registro maestro y evolutivo de ideas por plan

**Código:** BT-PLAN-IDEAS-01  
**Creado:** 13/11/2026  
**Estado:** registro de producto vivo para revisión previa al lanzamiento. **No constituye autorización de implementación, cambios de precio, contratos ni pagos.**

## Objetivo y método

El Director irá aportando gradualmente nuevas funciones para **Básico**, **Plus** y **Full**. **Cada idea se conservará** en este registro con ID, fecha, descripción, plan o planes, estado de decisión y etapa técnica. No eliminar ni sobrescribir decisiones históricas: las modificaciones se registran con nueva fecha y referencia a la decisión que reemplazan. En cada nueva idea:
1. Incorporarla con identificador estable `BT-IDEA-NNN`, fecha, origen «Director», descripción precisa y alcance por plan.
2. Marcar **Aprobada para diseño** únicamente cuando el Director la confirme expresamente. Si es una posibilidad o sugerencia, marcar **Por evaluar**; nunca prometer que ya está disponible.
3. Identificar dependencias, seguridad multitenant, costes, implementación y efecto en downgrade/prueba Full.
4. Referenciar en `roadmap.md`; no implementar, migrar, cobrar ni modificar producción solo porque se agregó al registro.
5. En la **revisión final de planes**, analizar la matriz completa, confirmar restricciones/cupos, economía unitaria, disponibilidad real, pruebas, impuestos y redacción de la oferta antes del lanzamiento.
6. Al ejecutar una idea aprobada, conservar su registro y añadir checkpoint, commit, fecha y estado real de implementación.

**Estados de decisión:** `Aprobada para diseño` / `Por evaluar` / `Descartada (con motivo)` / `Reemplazada (con referencia)`.

**Estados técnicos:** `Documentada` / `En implementación` / `Implementada DEMO` / `Verificada en producción`. No confundir estados comerciales con pruebas técnicas.

## Ideas y decisiones acumuladas

| ID | Fecha | Funcionalidad / condición | Básico | Plus | Full | Decisión | Estado técnico / referencia |
|---|---|---|---|---|---|---|---|
| BT-IDEA-001 | 11/11/2026 | Precio mensual por taller | Gratis | USD 5 | USD 15 | Aprobada para diseño | Documentada · `BT-PLAN-01` |
| BT-IDEA-002 | 11/11/2026 | Publicidad durante el lanzamiento | **Sin anuncios** | Sin anuncios como propuesta | Sin anuncios como propuesta | Básico aprobado; publicidad posterior sin decidir | Documentada · `BT-PLAN-01` |
| BT-IDEA-003 | 11/11/2026 | Prueba Full 3 días/72 horas con método de pago | — | — | Sí | Aprobada para diseño | Documentada · `BT-PLAN-01` |
| BT-IDEA-004 | 11/11/2026 | Desactivar renovación al instante, sin cargo si se confirma antes del fin; conservar datos tras bajar de plan | Respeta historial | Respeta historial | Sí | Aprobada para diseño | Documentada · `BT-PLAN-01` |
| BT-IDEA-005 | 11/11/2026 | Registro de clientes mediante enlace con datos personales, vehículo y motivo de ingreso | No, alta manual | Sí | Sí | Aprobada para diseño | Documentada · `BT-REQ-REG-VEH-01` |
| BT-IDEA-006 | 11/11/2026 | Envío automático por correo de informes PDF | No; descarga/impresión cuando exista | Sí | Sí | Aprobada para diseño | Documentada; correo real pendiente · `BT-PLAN-01` |
| BT-IDEA-007 | 13/11/2026 | Subir, administrar y reutilizar formatos propios de informe (no conversión automática a interactivo) | No, usar predeterminados | Sí | Sí | Aprobada para diseño | Documentada · `BT-PLAN-02` |
| BT-IDEA-008 | 11/11/2026 | Plantilla multipunto predeterminada y trabajo manual de inspección | Sí | Sí | Sí | Aprobada como objetivo funcional; calidad/implementación aún en desarrollo | Codex BT-INS-01 en curso |
| BT-IDEA-009 | 11/11/2026 | Roles avanzados, reportes detallados y recordatorios de mantenciones | No definido | No definido | Candidato | Por evaluar: detalle funcional, alcance y coste | Solo propuesta · `BT-PLAN-01` |
| BT-IDEA-010 | 11/11/2026 | Límites de usuarios, órdenes/mes, almacenamiento, envíos y enlaces por plan | Pendiente | Pendiente | Pendiente | Por evaluar | No se fijaron cuotas |
| BT-IDEA-011 | 11/11/2026 | Posible publicidad en Básico después del lanzamiento | Pendiente de nueva decisión | — | — | Por evaluar | **No autorizada actualmente** |
| BT-IDEA-012 | 13/11/2026 | Tipos de archivo permitidos, cantidad y almacenamiento de plantillas importadas | Predeterminadas | Por definir | Por definir | Por evaluar | Seguridad, coste y formatos por especificar |

## Reglas transversales que NO dependen del plan

- Cada taller consulta exclusivamente sus datos (Auth, permisos de servidor, RLS, Storage privado); la seguridad no se vende como ventaja premium.
- No se pierde historial de órdenes, vehículos, clientes ni documentos al finalizar prueba o bajar de plan; mantener consulta/exportación autorizada, aunque se desactiven nuevas operaciones premium.
- El plan real y sus límites se validarán en backend, nunca exclusivamente en React/PWA/Android.
- No presentar prestaciones futuras como ya implementadas ni cobrar hasta superar seguridad, facturación, consentimiento y pruebas.
- No conceder conversión automática de PDFs/Word/Excel subidos a formulario multipunto interactivo sin adaptación explícita.

## Revisión final comercial antes del lanzamiento — checklist obligatorio

- [ ] Examinar **todas** las ideas de este registro, sin omitir las pendientes.
- [ ] Validar qué funcionalidades están realmente desarrolladas, probadas y disponibles en web/PWA/Android.
- [ ] Confirmar matriz definitiva Básico/Plus/Full y cuotas de cada plan.
- [ ] Calcular costos por taller: correo transaccional, Storage, base de datos, soporte y comisiones; comprobar rentabilidad de Plus USD 5 y Full USD 15.
- [ ] Definir publicidad posterior al lanzamiento (no inferir aprobación).
- [ ] Definir impuestos, moneda de cobro CLP/USD, cancelación, prueba, avisos y términos comerciales.
- [ ] Validar aislamientos de datos y cambios de plan; no eliminar historiales.
- [ ] Revisar el texto comercial para que no prometa funciones pendientes.
- [ ] **Aprobación expresa del Director** de la matriz final antes de activar la comercialización.

## Registro de cambios

- **13/11/2026 — Creación del registro:** se incorporan BT-PLAN-01, BT-PLAN-02 y propuestas explícitamente pendientes, sin modificar el código ni servicios. Nuevas ideas se anexarán con siguiente ID consecutivo.
