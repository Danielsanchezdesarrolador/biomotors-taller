# ByteTorque — Plan de preactivación funcional del piloto Ignacio
**Fecha:** 20/11/2026 · **Estado:** preparado para continuar desarrollo y QA **sin operaciones de seguridad, datos reales ni despliegue**.  
**Rama única:** `main`. **Alcance:** web/PWA, Android candidato, experiencia operativa, pruebas sintéticas, documentos y administración; **no** GPG, backups, Docker, roles, RLS, Auth, SQL alojado, Edge, Drive ni secretos.

## 1. Frontera con el chat exclusivo de seguridad

Fuente de continuidad: [cierre SEC-07](checkpoints/CHECKPOINT_BT_SEC07_CIERRE_JORNADA_20261119.md) y [reglas de agentes](../AGENTS.md).

El chat de seguridad ya generó **un nuevo snapshot cifrado del estado actual** y verificó hashes/descifrado. **La restauración integral de ese snapshot no está certificada**, porque `pg_restore` falló con categoría `EXTENSION_UNAVAILABLE` en el laboratorio PostgreSQL 17. El siguiente bloque del chat de seguridad es **inventario offline de extensiones**; los equipos funcionales NO deben tocar ese diagnóstico, repetir exportaciones, modificar manifests, cambiar GPG ni activar servicios.

Los commits funcionales se publicarán **solo en `main`**, `[skip render]`, sin flags nuevos en Render ni migraciones. Antes de cada escritura documental se verificará HEAD para no borrar cambios del chat de seguridad. La **aprobación del backup/restauración no activa automáticamente ninguna función**; cada operación real tendrá autorización y pruebas propias.

## 2. Inventario funcional: código disponible versus operación real

| Módulo / recorrido | Estado técnico leído en checkpoints | Estado de uso real | Próxima puerta |
|---|---|---|---|
| Inicio, navegación y diseño premium R2 web/PWA | Código y QA visual del pulido `BT-UI-POLISH-01` aprobado; Render `d8d6ed99` LIVE | Publicación anterior existente; mejoras posteriores no desplegadas | QA físico iPhone/Android/tablet de la revisión final |
| Recepción de clientes/vehículos CP03 | UI/repositorio candidato con formularios y borradores de sesión, aislados por taller/rol | Sin activar escrituras nuevas de producción | Validación real posterior a seguridad y autorización de flag/flujo |
| Órdenes CP04 y multipunto 34 elementos | Código candidato y autosave `BT-PILOT-QA-03` probado offline | No certificar guardado real de piloto por CI sintético | QA transaccional, idempotencia y continuidad física |
| **BT-PILOT-QA-04A** | Helper `src/official/confirmedWrite.ts` y ajustes candidatos CP03/CP04, con tests de confirmación versus readback | No desplegado ni validado con backend alojado | QA UI con fallos sintéticos + pruebas reales autorizadas después |
| Cotización CP05 / PDF R3 | Cotización privada persistente y PDF de borrador; candidato de emisión/documentos privados preparado | Emisión, archivo Storage/Edge y correo final aún OFF | Autorizar/instalar/validar Storage, SQL y Edge de forma separada |
| Historial CP06 y FLOW-LIVE-02 | Integración/historial y contratos de entrega preparados, con pruebas sintéticas | Estados finales y documentos privados pendientes de puertas de despliegue | Ensayo transaccional real A/B, sin correos inicialmente |
| COM-01A/B/C/D: tres documentos y revisión de destinatario | Código y UI R2 aprobados offline; revisión efímera, botones de correo y registro disabled | No se envían correos ni se declara documento entregado | Archivo privado → revisión y consentimiento humano → integración proveedor autorizada |
| Suscripciones: Creador/PLAN-04A | Migraciones privadas creador/entitlements ya instaladas; pruebas sintéticas de permisos/MFA | QA real AAL2 y concesión de Full permanente a Ignacio pendientes | Validar MFA + usuario real seleccionado, autorización explícita de concesión |
| PLAN-04B/04C/04D y pagos | Contratos candidatos para alta taller, cupos de mecánicos, billing | Sin cobro ni habilitación completa | Activar por etapa, nunca activar pagos reales sin autorización |
| Android React Native/Expo | Cinco paneles y contratos de navegación DEMO offline; pruebas CI de bundle sin APK | Sin Auth real, API activa, APK firmada ni prueba final Android físico | QA demo local, luego conexión segura autorizada y APK de prueba |

**No usar esta tabla para señalar un gate como PASS si la fuente vigente indica OFF.** Cualquier funcionalidad de producción posterior al commit Render `d8d6ed99` requiere despliegue consciente y validación independiente.

## 3. Trabajo que puede cerrarse HOY sin depender de seguridad

**BT-PILOT-QA-04A — Prevenir reintentos duplicados después de guardado confirmado** (código candidato):

- Se añadió contrato puro `commitAndRefresh` que preserva el resultado de una mutación confirmada por el servidor, incluso cuando una consulta posterior falla; una mutación rechazada NO se presenta como guardada.
- CP03: al guardar cliente/vehículo, el registro confirmado y su identidad permanecen en la UI, el borrador de edición deja de ofrecer reenviar la misma alta, y un fallo de actualización posterior solicita volver a buscar, **no registrar otra ficha**.
- CP04: tras creación de OT, se preserva `created.id` en borrador de sesión antes del readback. Si fallan lista/detalle, avisa que la OT está guardada; no ofrece re-crear la misma orden. Hallazgos de inspección y resolución de observaciones también conservan el acuse de servidor.
- Pruebas unitarias con datos ficticios comprueban que `commitAndRefresh` se invoca en orden correcto, no reintenta mutaciones, diferencia write rechazado de readback fallido y conserva la identidad del registro.
- **Incidente de CI durante preparación:** el helper se ubicó inicialmente en `src/flow/`, y el verificador del bundle público rechazó importar ese módulo en compilación privada PLAN04 (`Public build imported non-public modules`). **Corrección:** mover el helper puro a `src/official/confirmedWrite.ts`, permitido por el grafo, y redirigir imports; eliminar archivo anterior. La ejecución antigua de CI se marcó FAIL correctamente; no se alteró el verificador de seguridad ni se abrió un gate.
- Verificar el **último CI** sobre commit de código `ee7651e8` antes de declarar aprobación; registrar resultado exacto y eventuales fixes en checkpoint.

**Verificación por personas pendiente:** ejecutar recorridos existentes **R05–R08** con datos sintéticos en web, **R09** PWA iPhone DEMO y **R10** Android DEMO cuando haya dispositivo disponible. Las plantillas y 18 recorridos ya existen en [guía de aceptación](qa/BT_PILOT_QA_02_RECORRIDOS_20261118.md) y [CSV vacío](qa/BT_PILOT_QA_02_REGISTRO_EN_BLANCO.csv). **No duplicar matrices** ni rellenar resultados como aprobados sin ejecución.

## 4. Orden de activación propuesto PARA DESPUÉS del cierre de seguridad

**Todas las etapas requieren el sí explícito del propietario y pruebas con datos sintéticos/controlados; completarlas documentalmente no las activa.**

1. **Puerta SEC-07:** recuperar el mismo snapshot del estado actual en entorno compatible, cotejar esquema/roles/privilegios y documentar limitaciones Auth/Storage/Edge/proveedor, más criterio explícito del propietario para piloto. Mantener `BT-PILOT-QA-04: A REPASAR` mientras no se cumpla.
2. **Puerta funcional CP03–CP04:** prueba de creación cliente → vehículo → OT; cambio de pestaña, retorno, recarga, autosave de 34 elementos, corte/reconexión, no duplicados y separación A/B. No habilitar producción por CI sintético.
3. **Puerta documental CP05:** emitir/archivar una revisión privada y descargar el **mismo PDF inmutable**; cotejar totales CLP e impuestos, versión, hashes, tolerancia a reintentos y rechazo de referencias cruzadas. Mantener correos reales OFF.
4. **Puerta de historial/entrega CP06 + FLOW-LIVE-02:** revisar cotización vigente, consentimiento/decisión del cliente, historial de hechos realmente declarados, trabajos realizados y cierre. No convertir DEMO en firma legal ni envío real.
5. **Puerta Creador, planes e invitaciones:** revisar MFA AAL2 real del Creador, taller y propietario, cuota actual del plan, concesión Full vitalicia a Ignacio **solo con autorización**, alta y aceptación de mecánicos sin fugas A/B. PLAN-04B/C aún no se declaran instalados.
6. **QA físico y comunicación:** Safari/PWA real en iPhone, Android físico con build autorizado, tablet/escritorio, accesibilidad, PDF A4, offline/reconexión, estados de error y límites de planes. COM triple correo solo después de aprobación de proveedor/privacidad/entregabilidad. Pagos/webhooks quedan como fase comercial separada.

## 5. Casos de fallo funcional de aceptación (para QA sintético y posterior real)

- **F01:** cliente creado en servidor → falla `vehiclesForCustomer`. La ficha sigue confirmada; no reaparece un formulario de alta con botón que lleve a duplicar cliente.
- **F02:** vehículo guardado → falla refrescar listado. Identidad de vehículo se conserva; operador recibe mensaje específico y no se invita a crear otro.
- **F03:** OT creada → falla refrescar órdenes / detalle. Se preserva ID confirmado en borrador de sesión y se indica actualizar, NO crear una segunda OT.
- **F04:** observación/inspección creada → falla leer hallazgos/pedidos. Acuse y hallazgo confirmado siguen visibles, con aviso de lista pendiente; no se ejecuta otra escritura automática.
- **F05:** resolución confirmada → falla recarga. Observación queda localmente resuelta; no se ofrece repetir la mutación.
- **F06:** escritura **no confirmada** → error genuino, sin mostrar mensaje de éxito, sin asumir que servidor guardó. Reintentos con resultado ambiguo siguen requiriendo reconciliación/idempotencia del servidor; no confundir con exactamente-una-vez.

## 6. No hecho en esta preparación

No se activó Render/flag, Supabase alojado, SQL/RLS, Auth, Storage, Edge, Drive, emails, pagos, APK/OTA ni cuentas reales. Tests sintéticos y compilación **no son** pruebas de una cuenta de Ignacio ni de operación de taller. Registro de 55 pasos permanece SIN_EJECUTAR.

**Último respaldo funcional de seguridad:** [SEC07 cierre de jornada](checkpoints/CHECKPOINT_BT_SEC07_CIERRE_JORNADA_20261119.md).  
**Próximo paso de desarrollo, si CI funcional está PASS:** QA de interfaz con datos sintéticos para F01–F06 y recorrido web sin escrituras alojadas; después esperar la puerta SEC-07 para pruebas reales.
