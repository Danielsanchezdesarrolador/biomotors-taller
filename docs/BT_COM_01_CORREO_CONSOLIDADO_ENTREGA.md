# BT-COM-01 — Un correo consolidado de cierre y aprobación previa

**Fecha de registro:** 13/11/2026 (BT-QA-01)  
**Estado:** REQUISITO DEL DIRECTOR, NO IMPLEMENTADO. No autoriza envíos, Supabase, proveedores de correo ni permisos de plan.  
**Contexto:** en la revisión real del recorrido A–E, el Director completó la visita DEMO y pidió que al final el cliente reciba **un único correo con cotización, informe y constancia de entrega**.

## 1. Objetivo de producto

Evitar mensajes fragmentados: **un correo documental de cierre por visita**, preparado desde el expediente después de confirmar la entrega. El propietario del taller podrá revisar destinatario, documentos y contenido antes de pulsar «Enviar documentación al cliente». No enviar directamente por completar un hito ni por abrir «Imprimir / Guardar PDF».

Hay una dependencia temporal esencial: la cotización debe llegar al cliente **antes** de realizar trabajos sujetos a su aprobación. Por ello distinguir:

1. **Antes de trabajar — solicitud de autorización:** cotización de revisión exacta, mediante canal seguro que se defina en fase real (por ejemplo, enlace protegido para consulta/aceptación). Si se ofrece correo para solicitar aprobación, eso sería una comunicación anterior y **no** debe describirse como parte del correo único de cierre. Validar preferencia de canal con el Director.
2. **Durante los trabajos:** no emitir correos por cada modificación; el operador registra ejecución y pendientes.
3. **Al completar la entrega — un solo correo consolidado:** compilar cotización vigente aprobada, informe técnico/trabajo efectuado e información de entrega. Requiere confirmación humana, destinatario verificable y backend seguro.

**No** reducir el informe al texto «vehículo reparado»: conservar motivo, diagnóstico, multipunto, trabajos realizados, no realizados, observaciones pendientes y monto realmente efectuado.

## 2. Contenido del correo final

**Asunto sugerido:** «[Nombre del taller] — Documentos de servicio y entrega · [OT]».

**Cuerpo:** saludo al cliente, vehículo y OT, fecha de atención/entrega, resumen de trabajos ejecutados, observaciones y pendientes, total de informe, datos del taller y pie que explique los documentos adjuntos. No prometer ausencia de problemas ni afirmar pago si no existe registro que lo acredite.

**Tres archivos PDF en un solo envío:**

- `01_Cotizacion_[OT].pdf`: cotización de la **versión efectivamente aceptada**, monto originalmente autorizado y condiciones correspondientes.
- `02_Informe_[OT].pdf`: inspección multipunto/diagnóstico y trabajos **marcados realizados**, pendientes no ejecutados, observaciones y valores finales reales registrados, no propuestos.
- `03_Entrega_[OT].pdf`: constancia de cierre, fecha, kilometraje de la visita, checklist, estado y pendientes explicados. Su recepción por correo no prueba por sí misma entrega física, conformidad, firma ni pago.

Evaluar si el multipunto debe ir **integrado** al informe técnico o como documento adicional dentro del mismo correo; no convertir automáticamente observaciones sin revisar a OK.

La cotización y el informe pueden tener montos distintos si hubo trabajos no realizados o cambios autorizados: documentar la diferencia, no alterar la cotización histórica para hacer coincidir totales.

## 3. UX al final del expediente (futuro)

Una vez que el servidor valide cierre de visita y existencia de los tres documentos:

- Mostrar bloque «Documentación de entrega», tres vistas previas con fecha/revisión y resumen, y el correo del cliente confirmado por el operador.
- Acciones: «Revisar documentos», «Enviar documentación al cliente» y, cuando se implemente, «Descargar todo». Botón de envío activo solo con todas las verificaciones y permiso de plan/rol comprobados **en servidor**.
- Pedir una única confirmación de envío con destinatario, OT y enumeración exacta de archivos.
- Mostrar estado verificable: `Pendiente`, `En preparación`, `Enviando`, `Enviado` / `Entregado por el proveedor`, `Fallido` o `Requiere nueva revisión` según evidencias reales. «Enviado» no significa «leído»; no inventar lectura.
- Registrar quién confirmó, a qué destinatario, cuándo, versiones/hashes de documentos y respuesta del proveedor. Impedir envíos dobles por doble pulsación. Habilitar reenvío explícito con trazabilidad, no silencioso.
- En caso de edición posterior del informe o cierre: nunca enviar silenciosamente nuevos documentos; marcar paquete anterior como desactualizado y requerir revisión.

## 4. Arquitectura necesaria — fase futura y autorizada por separado

- **Persistencia** de cliente/vehículo/visita/OT, inspección, `quoteId+revision`, respuesta y finalización de trabajos, entrega, auditoría.
- **Seguridad multitenant** comprobada con BT-CP02-D (pruebas usuarios A/B en chat reservado) y Auth/RLS; prohibido mezclar documentos de talleres.
- Generación de tres PDF reales, versionados y almacenados de forma protegida; descargas temporales autorizadas si se opta por enlaces en vez de adjuntos; ningún recurso público que exponga datos.
- Servicio transaccional de correo seguro del servidor: validación de destinatario, protección antispam/antiabuso, registro de intentos, cola/reintentos, clave idempotente por paquete/revisión/destinatario, confirmación del proveedor, y manejo de rebotes sin secretos en frontend.
- Base para consentimiento, identidad/aceptación remota, privacidad, políticas de retención, permisos de taller y trazabilidad, tras diseño y revisión normativa aplicable.
- Respetar planes Básico/Plus/Full y funciones comerciales definidas oficialmente; **NO asignar aquí arbitrariamente la disponibilidad del envío consolidado por plan**.
- Nunca enviar correo desde el componente React ni usar credenciales del proveedor en navegador; no activar `bt-owner-onboarding`, claves administrativas, pagos ni cambios de Auth/RLS en esta etapa documental.

## 5. Fase DEMO anterior a la conexión real

Después de BT-QA-02 (correcciones de UX), puede diseñarse una pantalla **«Vista previa de correo de entrega · DEMO»** con destinatario ficticio y documentos simulados, sin conexión externa, almacenamiento persistente ni botón que aparente enviar de verdad. Mostrar «Simulación: no se enviaron correos ni se entregaron archivos». Este es un cambio funcional independiente y **aún no autorizado**.

## 6. Pruebas de aceptación futuras

1. Paquete final solo disponible para visita correctamente cerrada, documentos presentes y destinatario autorizado.
2. Una cotización nunca se considera autorizada solo por haberse enviado; validación de versión exacta.
3. Trabajos no realizados nunca se cobran ni aparecen como realizados; los pendientes están destacados.
4. Diferencias de montos entre cotizado y ejecutado explicadas sin cambiar historia.
5. Un envío manual produce exactamente un paquete; doble clic no envía duplicados.
6. Fallo de proveedor: error visible y reintento manual idempotente, sin mensaje falso «enviado».
7. Dos talleres no pueden consultar/enviar paquetes cruzados ni reutilizar archivos por ID.
8. Cierre o documento modificado: nueva revisión y bloqueo de envío hasta revalidación.
9. Safari iPhone y Android: revisión de PDFs y accesibilidad del cuadro de confirmación.
10. Pruebas E2E y logs de proveedor con casos de rebote y destinatario inválido, sin exponer datos reales.

**Dependencias explícitas:** BT-QA-02 y aprobación del Director → BT-CP02-D aislado y aprobado → backend/persistencia → PDF versionado → servicio de correo → piloto con Ignacio. No hay envíos reales en el estado actual del proyecto.
