# CHECKPOINT BT-FLOW-01A — Arquitectura y mockups del flujo guiado

**Fecha:** 13/11/2026 · **Tipo:** documentación y propuesta visual únicamente.  
**Proyecto:** ByteTorque 1.0 · **Repositorio:** Danielsanchezdesarrolador/biomotors-taller · **Rama:** main.  
**Estado de aprobación:** pendiente del Director. No se ha implementado BT-FLOW-01A ni modificado la interfaz.

## Base verificada antes de comenzar

- HEAD de main: `c4ccd5fab71439dff8bc9c2a9da9e1fd568d15c1`, checkpoint y plan BT-FLOW-01.
- GitHub Actions del commit anterior: SUCCESS. No hay pull requests abiertos visibles.
- Aun así, no asumir que trabajos de Codex en curso puedan detectarse solo desde GitHub; revalidar antes de escribir código.
- BT-INS-01, BT-REG-02 y BT-COT-01 conservados sin cambios.

## Entrega BT-FLOW-01A

**Documento principal:** `docs/BT_FLOW_01A_DISENO_ARQUITECTURA.md`.

Incluye:
1. Diseño conceptual de Inicio con CTA «Nuevo ingreso de vehículo», «Continuar trabajos» y próxima acción.
2. Propuesta de expediente único por visita con barra de contexto, navegación por pasos y cinco paneles R2 intactos.
3. Dos mockups creados en la conversación: Inicio escritorio/iPhone y composición de recepción/expediente. Son **imágenes conceptuales**, no capturas ni archivos versionados en GitHub, ni evidencia de funcionalidad Render.
4. Mapa de nueve etapas internas agrupables en siete hitos visibles, con reglas explícitas de aprobación, trabajo efectuado y cierre.
5. Contrato de datos conceptual por `visitId` y referencias a cliente, vehículo, solicitud, OT, inspección, cotización y documento final.
6. Auditoría de riesgos de identidad, discontinuidad entre estados React locales y módulos de borradores, deduplicación y autorización.
7. Criterios de accesibilidad, UX escritorio/iPhone y pruebas de futura implementación.

## Riesgos técnicos concretos

- `ClientesPanel` almacena `requests`/`clients` en React local; al salir del panel se pierde el alta temporal.
- `crearSolicitudDemo` no conserva la totalidad del contacto y detalles estructurados en el objeto de solicitud.
- `OrdenesPanel` crea una OT únicamente en su propio estado; `sessionOrders()` y los selectores de documentos no necesariamente la reconocen.
- `clientesData`/ `documentContext` consultan fixtures estáticas y limitan el uso de nuevos clientes/vehículos.
- Multipunto, revisiones de OT, informes clásicos y BT-COT-01 mantienen memorias parciales; deberán vincularse por IDs estables sin duplicar modelos.
- Aprobar una cotización no equivale a ejecutar un trabajo. Alterar su revisión invalida la aprobación DEMO; el informe de trabajo incluye solo ítems `performed`.

## Decisiones y límites

- Cinco menús principales sin alteraciones; el flujo contextual es interno, no un sexto menú.
- No afirmar guardado permanente: en DEMO, la continuidad debe funcionar **solo durante la pestaña abierta** y perderse tras recarga.
- Copiar y preparar automáticamente datos confirmados es válido; diagnóstico, precio, aprobación, ejecución y envío son decisiones humanas.
- Sin llamadas a Supabase, Auth/RLS, migraciones, `bt-owner-onboarding`, BT-CP02-D, pagos, firmas, envíos ni Android.
- No introducir datos personales reales de las capturas de referencia en fixtures ni incorporar marcas/logos ajenos.

## Estado de verificaciones

- Revisión de repositorio y código: realizada.
- Documento técnico y actualización del roadmap: preparados.
- Dos representaciones visuales: creadas en conversación, **pendientes de aprobación**.
- TypeScript/Vitest/build/CI **no ejecutados para este cambio documental**, porque no se modificó código; el CI anterior estaba SUCCESS.
- Render **no cambia por esta etapa**; sin publicación nueva de interfaz.

## Próximo paso tras aprobación

Pedir una única revisión al Director: ¿aprueba el esquema de Inicio y el expediente contextual de BT-FLOW-01A como dirección R2? Puede pedir cambios visuales antes de implementar.

Después, con instrucción expresa, empezar **BT-FLOW-01B**: crear fuente compartida de entidades/expedientes **en memoria**, con adaptación de ingreso/cliente/vehículo/OT, y pruebas de identidad antes de conectar el asistente. Verificar nuevamente HEAD, estado de Codex y PR antes de modificar.

**No arrancar 01B automáticamente.** Conservar este checkpoint y todos los anteriores.
