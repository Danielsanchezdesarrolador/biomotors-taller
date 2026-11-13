# ByteTorque — BT-REQ-REG-VEH-01
## Registro completo por enlace: cliente, vehículo y motivo de visita

**Solicitante:** Director del proyecto, 11/11/2026.  
**Prioridad:** alta — requisito funcional aprobado para futura implementación, **no código integrado todavía**.  
**Flujo vigente:** web Render primero / PWA Safari, Android nativo al final. Identidad visual premium R2 obligatoria.  
**Estado:** documentado; Codex sigue trabajando en `BT-UI-05`. No interrumpir esa tarea.

### Objetivo operativo
Ignacio envía un enlace de registro individual a un cliente. Al abrirlo desde el teléfono, el cliente proporciona sus datos personales, registra su vehículo y explica qué le sucede o qué trabajo solicita. Ignacio recibe los antecedentes en una **solicitud de ingreso pendiente de revisión** y puede convertirla en orden de trabajo, sin copiar textos desde WhatsApp.

### Experiencia del cliente — tres pasos cortos

**1. Tus datos**
- Nombre completo y correo electrónico.
- Teléfono de contacto.
- Dirección y comuna (según necesidad operativa y aviso de privacidad; pueden ser opcionales en MVP).
- Aviso de privacidad claro; no exigir RUT, contraseña ni cuenta para enviar la solicitud.

**2. Tu vehículo**
- **Marca**, ejemplo: Toyota. Campo indispensable para asociar correctamente el modelo.
- **Modelo**, ejemplo: Corolla.
- **Año**, numérico: desde 1900 hasta el año calendario actual +1 (validar en servidor).
- **Kilometraje actual**, numérico entero no negativo (formato cómodo para Chile; distinguirlo de kilometraje escrito como texto).
- Patente, **opcional inicialmente**, si se requiere relacionar a un vehículo existente. No es autorización de acceso ni identidad del propietario.
- Si el cliente ya tiene un vehículo vinculado al taller y el enlace le autoriza verlo, permitir elegirlo para evitar duplicados, y confirmar el kilometraje.

**3. ¿Por qué traes tu auto?**
- Campo libre y breve, visible y obligatorio: **«Cuéntanos qué problema presenta tu vehículo o qué trabajo quieres realizar»**.
- Placeholder: «Ej.: al frenar vibra el volante; necesito revisar pastillas y discos» o «Quiero cambio de aceite y filtros».
- Límite recomendado: 500 caracteres, mínimo orientativo 10 caracteres para evitar solicitudes vacías.
- Distinguir entre *lo reportado por el cliente* (síntoma/solicitud) y *el diagnóstico del técnico*. No presentarlo como diagnóstico ya confirmado.
- Pantalla final con resumen editable antes de «Enviar solicitud» y confirmación de recepción únicamente cuando el backend real responda; en DEMO, mensaje «Simulación local: no se enviaron ni guardaron datos reales».

### Ejemplo de formulario (solo diseño)

- Nombre: Cliente de prueba
- Email: `cliente@example.com`
- Teléfono: formato chileno de ejemplo
- Comuna: ejemplo, dato ficticio
- Marca: Hyundai
- Modelo: Tucson
- Año: 2021
- Kilometraje: 68.430 km
- Motivo: «Quiero revisar una vibración al frenar y escuchar si hay ruidos en el tren delantero.»

**No utilizar datos de personas reales ni inventar validaciones de registro por correo.**

### Flujo del taller — recepción y creación de OT

1. Ignacio genera y comparte enlace individual temporal desde `Clientes y vehículos`.
2. El cliente completa los tres pasos.
3. El backend valida token, consentimiento, pertenencia al taller y datos, y registra solicitud pendiente vinculada a `workshop_id`.
4. Ignacio ve una tarjeta/bandeja **«Solicitudes de ingreso»** con cliente, vehículo y motivo, con estado «Pendiente de revisión».
5. Revisa y confirma identidad/contacto/vehículo. Si es nuevo, asocia o crea ficha según autorización; si ya existe, vincula el vehículo correcto.
6. Pulsa **«Crear orden desde solicitud»**, se precargan cliente, vehículo, kilometraje y motivo. Él agrega diagnóstico, revisión y presupuesto; estos no se atribuyen al cliente.
7. La solicitud cambia a «Convertida en OT» y queda asociada al historial. Prever también «Rechazada / Solicitar corrección» sin borrar el rastro válido.

### Reglas de modelo y seguridad para etapa con backend

- Tablas sugeridas: `registration_invites`, `service_intake_requests` y relaciones con `clients`, `vehicles`, `work_orders`; todos los datos privados y RLS por taller (según arquitectura final).
- Invitación criptográficamente aleatoria de un solo uso o uso limitado, expiración, hash en servidor; no dar permisos de lectura sobre clientes u OT por poseer una patente.
- Antiabuso, límites de envío y validaciones del lado servidor; validar texto y evitar inyección HTML en toda vista/reporte.
- Minimización de datos, información de uso y conservación, derechos del titular y normativa chilena aplicable antes de habilitar formulario público.
- Correo no se asume verificado hasta completar verificación segura. No enviar documentos privados a direcciones sin verificación/confirmación.
- No duplicar vehículos mediante suposición por patente sin comprobación dentro del taller; proteger contra acceso cruzado entre talleres.
- No crear una OT formal automáticamente a partir del texto del cliente; requiere aprobación de Ignacio.
- Distinguir `clientReportedReason` / `requestedWork` de `mechanicDiagnosis` / `inspectionFindings`.
- El cliente debe poder corregir antes de enviar, y luego solicitar modificación por canal autorizado.

### Criterios de aceptación cuando se autorice implementar

- Formulario 3 pasos, responsive y estilo R2, funcional con validaciones y mensajes de error accesibles.
- Validar marca/modelo/año/km/motivo. Año en rango y km entero no negativo; caracteres límite motivo.
- Los datos DEMO nunca se guardan ni envían, y se indica expresamente.
- Pruebas de validación, cambios de paso, cancelación, revisión y vínculo con órdenes de ejemplo.
- Revisión visual de escritorio y Safari móvil, sin alterar Inicio, Órdenes, Clientes, Informes.
- En backend posterior: RLS, expiración, un solo uso, no acceso cruzado, email verificado antes del envío de documentos, solicitud pendiente y conversión controlada en OT.

### Decisión de alcance

Esta entrega **solo agrega la especificación oficial en archivos**. No altera `src/clientes/RegistroClienteDemo.tsx`, React, Supabase, correo, Render ni Android y no interfiere con Codex BT-UI-05.


---

## Seguimiento de ejecución — BT-REG-02 (13/11/2026)

La declaración histórica de arriba corresponde a la fase de especificación BT-REQ-REG-VEH-01. **Desde BT-REG-02** existe una implementación exclusiva DEMO en main, como extensión acotada de Clientes y vehículos:

- El botón «Generar enlace de registro» abre una explicación y un formulario simulado de tres pasos; **no genera URL, invitación, token ni permisos**.
- Contacto, vehículo y motivo libre (máximo 500 caracteres), validaciones por etapa, resumen editable y confirmación local. Correo limitado a example.com y móvil al patrón de ejemplo para evitar capturar contactos reales en la simulación.
- Bandeja de solicitudes ficticias pendientes de revisión; no mezcla clientes nuevos con registros existentes, no deduce propiedad por patente y no crea OT automáticamente.
- El motivo declarado es un dato separado del diagnóstico técnico; ninguna acción de la DEMO certifica una avería.
- El estado de solicitudes agregadas permanece solo en memoria del componente y se pierde al cambiar de módulo o recargar. Sin Supabase, Auth, RLS, emails, pagos, suscripciones ni almacenamiento web.
- Básico: alta manual; Plus/Full: capacidad prevista. **Solo información comercial, no autorización**. Durante el futuro trial Full será accesible únicamente con validación de elegibilidad del servidor.

Pruebas de función pura en src/clientes/registroVisitaData.test.ts y recorrido de navegador en scripts/verify-registro-ui.cjs. El checkpoint BT-REG-02 conserva los resultados y evidencias verificadas, sin sustituir este contrato de seguridad futuro.
