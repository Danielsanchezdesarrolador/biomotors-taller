# ByteTorque — CP05: entrega funcional única de cotizaciones, PDF y trazabilidad

**Instrucción técnica del Director (16/11/2026).** Estado: especificación para implementación; **NO significa CP05 implementado ni SQL autorizado**. Prioridad: piloto usable por Ignacio, no comercialización. Rama única `main`. Punto de partida verificado: `42438637163ff8628fd42eecf9e4cbddea232126`; comprobar HEAD fresco antes de modificar. Este documento no es un checkpoint ni una división en fases artificiales.

## Objetivo operativo verificable

En la sesión privada del taller autorizado, Ignacio abre una orden CP04 real y prepara una cotización vinculada a la misma orden, cliente y vehículo; agrega/edita/quita repuestos, insumos, servicios y mano de obra; revisa montos y condiciones; guarda un borrador **en Supabase**, lo recupera después de recargar y volver a iniciar sesión; emite una revisión identificada e inmutable; genera/descarga un PDF A4 auténtico; conserva ese documento y las revisiones anteriores; y ve un historial legible. El correo externo con seguimiento se prepara como parte de CP05, pero se mantiene DESACTIVADO hasta autorización independiente del Director.

## Fuentes ya existentes: no reconstruirlas

- CP03: `public.customers`, `public.vehicles`, Auth y contexto de taller; cliente sintético `QA1234`.
- CP04: `public.work_orders`, `public.inspection_findings`, repositorio R1/RLS y 34 X con guardado automático. No modificar su modelo ni migración ya aplicada.
- Editor demostrativo anterior (solo fuente de UX/lógica, jamás fuente de clientes): `src/informes/trabajos/WorkDocumentPanel.tsx`, `trabajosData.ts`, `WorkItemsEditor.tsx`, `WorkDocumentPreview.tsx`, `WorkQuoteSummary.tsx`, `src/ordenes/detalleData.ts`. Estos consumen fixtures y sessionStorage DEMO: NO usarlos directamente para cotizaciones reales sin adaptar autenticación, relaciones y persistencia.
- Contenedor privado existente `src/App.tsx`, `src/ordenes/Cp04PrivatePanel.tsx`, `src/ordenes/cp04Repository.ts`. Menú: solo cinco secciones oficiales; mantener R2 y el rediseño aprobado CP04.
- Reglas: `AGENTS.md`, `roadmap.md`, `docs/BT_PILOTO_IGNACIO_METODO_ENTREGAS.md`, `docs/BT_PILOTO_IGNACIO_MATRIZ_ACEPTACION.md`.

## Diseño funcional sin simulaciones engañosas

1. Acceso desde una OT existente (y desde Informes y cotizaciones privadas, sin usar `InformesPanel` con datos DEMO en la ruta autorizada). La relación OT -> vehículo -> cliente proviene exclusivamente de Supabase y el taller del JWT/membresía vigente. No permitir cambiar `workshop_id`, `order_id` o `vehicle_id` desde la cotización.
2. Formulario móvil breve y elegante: descripción, categoría (Repuesto/Insumo/Mano de obra/Servicio), cantidad, precio unitario CLP, condiciones y vigencia, observaciones, lista de ítems y total siempre visible. Controles táctiles grandes. No añadir datos ficticios ni KPI de muestra.
3. Validaciones en frontend y servidor. Cantidades y precios positivos y finitos, límites explícitos; importes CLP sin valores inseguros. Definir explícitamente si precios ingresados son **netos** o **IVA incluido** y mostrar la base seleccionada: no duplicar IVA por asumir ambos. Mantener el 19 % como supuesto del editor existente sujeto a revisión de reglas tributarias aplicables; nunca afirmar que PDF = documento tributario. Total y líneas deben coincidir con los datos persistidos; evitar desajustes de redondeo. Los totales emitidos no se recalculan desde un borrador posteriormente editado.
4. Estados separados: `draft` editable, `issued` inmutable, `voided` con motivo y trazabilidad (si corresponde). Aceptación del cliente NO simulada como válida; cualquier aceptación real futura requiere fecha, responsable y evidencia definida, no clic ficticio.
5. Número de cotización asignado por base de datos por taller, sin colisión; revisión/versión estable. No utilizar `COT-DEMO-...` para documentos reales. Reintentos no deben crear cotizaciones/ítems/documentos duplicados.
6. Emitir PDF A4 descargable real con logo oficial ByteTorque y datos reales configurados del taller (no suponer logo o razón social de Ignacio), identificación cliente/vehículo, patente, OT, fecha, vigencia, ítems, neto, IVA si aplica, total, términos, estado/número/revisión. Conservar una representación inmutable verificable y archivo privado por taller/revisión; si falta autorización para crear bucket o escribir Storage, bloquear esa emisión y declarar la limitación. Print HTML no equivale a PDF almacenado.
7. Envío correo: preparar integración transaccional exclusivamente en backend confiable, destinatario autorizado y validado, idempotencia por documento/revisión, estados `queued/sent/failed` sustentados en resultado del proveedor, fecha/error auditable y botón de reintento controlado. **No activar SMTP/Resend/Edge, no enviar correos reales ni secretos sin permiso expreso.** No presentar “enviado” sin confirmación.
8. Conservación: cotizaciones emitidas históricas consultables desde OT y vehículo; tras ediciones posteriores de CP03/CP04, su snapshot emitido conserva el contenido original. Nunca borrar documentos emitidos como resultado de un cambio de estado de OT.

## Contrato técnico de persistencia candidato (NO ejecutar)

Proponer migración SQL aditiva separada para `quotes`, `quote_items`, `quote_revisions`/snapshots y `quote_delivery_events` (o equivalentes coherentes) con `workshop_id` en toda entidad, FKs compuestas al mismo taller (OT/vehículo/cliente), RLS ENABLE + FORCE, permisos por columnas y política de lectura por membresía activa. Escritura de cotizaciones solo para `owner`, `admin` y `reception`; `mechanic` solo consulta salvo decisión explícita posterior. Prohibir DELETE desde cliente, cambios a claves, falsificación de timestamps, modificación de revisiones emitidas y accesos entre talleres. Usar transacción/RPC segura para emisión y secuencia si la API en varios pasos no garantiza atomicidad. Las revisiones emitidas deben ser inmutables a nivel SQL, no solo UI. `SECURITY DEFINER` únicamente ante necesidad demostrada, en esquema privado y con privilegios explícitos.

**Puerta obligatoria:** crear y probar SQL candidato en PostgreSQL efímero con casos de seguridad, SIN aplicarlo en `suxcqqnmcjoezfxltoms` hasta la autorización separada del Director y respaldo recuperable verificado. También se requiere autorización específica para bucket/Storage, Edge Functions, secretos y correo externo. No tratar `continúa` como permiso para ello.

## Integración y aceptación

- Reutilizar mismo SDK Supabase de Auth R1. La pantalla privada se habilita solo después de que existan tablas, RLS y autorización alojadas, mediante flag privado sin contaminar la vista pública/DEMO. Evitar lazy loaders con fixtures.
- Al cambiar usuario/taller, hacer logout, perder membresía o caducar la sesión: detener operaciones de escritura; no filtrar el borrador a otro contexto. Errores de red deben señalar “no guardado”; no confirmar éxito antes de la respuesta del servidor.
- Pruebas consolidadas: creación de borrador, 3+ ítems, cálculo neto/IVA/total, recuperación tras recarga y nuevo login, edición concurrente/optimista, reintento sin duplicados, revisión emitida inmutable, descarga PDF bytes válidos, restauración del documento, perfil mecánico sin escritura, RLS A/B lectura y escritura cruzadas denegadas, cierre de OT con cotización histórica, correo desactivado sin solicitudes externas. TypeScript + Vitest + build/PWA + Android bundle para detectar regresiones + CI; en móvil iPhone Safari y Android físico solo las comprobaciones imprescindibles para aprobación de uso. No confundir HTTP simulado con pruebas alojadas.
- Al cerrar: reporte **único** con SHA, CI, Render, SQL/migraciones efectivamente autorizadas, pruebas físicas vs simuladas, estado de la matriz y próxima capacidad CP06. No crear múltiples checkpoints cosméticos.

## Límite claro de esta preparación

Este archivo únicamente consolida la orden de implementación CP05. No cambia UI, no aplica SQL, no habilita correos ni prueba persistencia/PDF. El formato definitivo de cotización de Ignacio queda sujeto a su plantilla real y a las decisiones sobre impuestos, numeración comercial y datos del taller. El trabajo técnico preparatorio puede continuar con componentes aislados y SQL candidato probado sin tocar el hospedado; la puesta en funcionamiento requiere autorizaciones explícitas.
