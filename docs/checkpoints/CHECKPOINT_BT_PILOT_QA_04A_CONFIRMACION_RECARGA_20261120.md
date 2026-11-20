# CHECKPOINT BT-PILOT-QA-04A — Confirmación de escritura y recarga de interfaz

**Fecha:** 20/11/2026 · **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **única rama:** `main`.  
**Punto de partida revisado:** `3789d3f5dfd5455f9ede40c8792b925dd1fe8c9a`, cierre SEC-07 y documentación de continuidad.  
**Commit de código y tests validado:** `ee7651e8dda3b623431218af0a1e343fa0b3c128` (último commit que modificó fuente).  
**Estado:** CANDIDATO FUNCIONAL PROBADO EN CI; **NO** activado ni desplegado en Render.

## Objetivo y frontera con seguridad

El propietario pidió adelantar TODO trabajo funcional que pueda realizarse antes de que el chat de seguridad continúe en la tarde. Se leyeron `AGENTS.md`, `agent.md`, `roadmap.md`, [SEC-07 cierre](CHECKPOINT_BT_SEC07_CIERRE_JORNADA_20261119.md) y los checkpoints del piloto QA01-03, Android y COM-01D. **No interferir** con el nuevo snapshot cifrado del estado actual: restauración completa continúa `RECOVERY_NOT_CERTIFIED` por categoría `EXTENSION_UNAVAILABLE`; inventario offline de extensiones corresponde EXCLUSIVAMENTE al chat de seguridad.

## Hallazgo funcional confirmado en código anterior

En las vistas candidatas de CP03 y CP04, el flujo `escribir en servidor → recargar listados/detalle` usaba bloques `try/catch` compartidos. Si la escritura devolvía correctamente un objeto confirmado, pero una consulta posterior fallaba, la pantalla podía mostrar error genérico y conservar el formulario de creación; el operador podía entender que debía registrar otro cliente/vehículo/hallazgo/OT. En CP04 `reload()` y `openOrder()` absorbían internamente errores, sin devolver estado que distinguiera éxito de detalle y listado.

## Cambios de código

1. **`src/official/confirmedWrite.ts`**: helper puro `commitAndRefresh`, sin clientes ni red; deja fallar la mutación para no inventar confirmación, invoca `onCommitted(saved)` exactamente tras el acuse, ejecuta lectura adicional separada y devuelve `viewRefreshed=false` si hay fallos posteriores. Nunca reenvía la mutación. 
2. **`src/flow/confirmedWrite.test.ts`**: cuatro pruebas sintéticas: acuse e identidad preceden recarga, fallo de recarga no reintenta escritura, lectura devuelve false sin perder entidad y escritura fallida no se presenta confirmada.
3. **`src/clientes/cp03PilotDirectoryView.tsx`**: al guardar cliente o vehículo, limpiar el borrador y mantener la identidad/selección confirmadas ANTES de refrescar listados; advertir específicamente que el registro ya existe y no debe crearse otra vez si falla la consulta posterior. Mantiene mensajería anterior ante error de escritura.
4. **`src/ordenes/Cp04OrdersView.tsx`**: `reload/openOrder` ahora informan éxito booleano al caller; tras crear una OT se conserva `created.id` en borrador de sesión de ese usuario/taller y se conserva estado aunque falle la lectura del listado/detalle. Los hallazgos creados y resoluciones confirmadas actualizan el ítem por ID sin perder el acuse si falla recarga. No se añadió ninguna mutación automática al reintentar ni se cambiaron permisos/repositorios SQL.
5. **`docs/BT_PREACTIVACION_FUNCIONAL_20261120.md`**: mapa completo de módulos, puertas y prioridades después de seguridad, y casos sintéticos F01-F06 a validar en dispositivos y con contexto real autorizado.

## Incidente detectado y solucionado durante el desarrollo

- **QA04-INC-01:** una versión inicial ubicó el helper en `src/flow/confirmedWrite.ts`. En ejecución CI [44748046098](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44748046098), el build de PLAN04 candidato falló **correctamente** con `Public build imported non-public modules: src/flow/confirmedWrite.ts`. Los cuatro tests helper sí pasaron.
- **Causa comprobada:** `scripts/verify-official-bundle.mjs` prohíbe que el build incluya cualquier `src/flow` salvo las rutas expresamente aprobadas. El helper compartido se importaba desde módulos privados y entraba en el grafo candidato.
- **Solución:** trasladarlo a `src/official/confirmedWrite.ts` (módulo puro permitido por el grafo), actualizar ambos imports y el import de pruebas, eliminar origen `src/flow/confirmedWrite.ts`. **No se relajó el verificador ni se activó ningún gate**.
- **Validación final del código `ee7651e8`:** [CI general 44748658166](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44748658166) **SUCCESS**, Web/PWA y Android Expo; **721/721 tests PASS, 83/83 archivos**, TypeScript/build público y privado candidato + PostgreSQL 17 sintético + `Public module graph, fixture exclusion...: PASS`. [BT-FLOW-01 44748658091](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44748658091) **SUCCESS**. [QA visual 44748658145](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44748658145) **SUCCESS**, confirmado tras cierre; se validó el grafo/experiencia pública sin relajar la exclusión de candidatos.

## Límites, riesgos y próximo paso

- Pruebas con datos **sintéticos** y SDK simulado; no hay confirmación de escritura real de Ignacio ni de comportamiento móvil físico, ni garantía exactly-once cuando el acuse de la mutación misma es incierto. Si falla la llamada de escritura antes de retornar un acuse, no asumir persistencia: evitar reintentos automáticos hasta reconciliar con identificador/idempotencia del servidor.
- **Sin cambios** a Supabase alojado, Auth/RLS, extensiones Docker, backup, Edge, Storage, usuarios reales, Plan04, pagos, envío correo, GPG, Drive, claves o secretos. No se desplegó Render ni se creó APK/OTA. `[skip render]` en todos los commits de código; los de documentación usan además `[skip ci]`.
- Web oficial sigue en Render sobre `d8d6ed99`, verificado por consulta de deploys del 20/11. Los cambios QA04A solo existen en `main` y requieren rollout/QA posterior con autorización.
- Reutilizar los **18 recorridos / 55 pasos** de `BT-PILOT-QA-02`: no duplicar planillas ni adjudicar PASS a las pruebas físicas.
- **Próximo bloque independiente de seguridad:** ejecutar QA navegador synthetic F01–F06 e inspección R05–R08, y dejar preparada la demostración física R09/R10 cuando corresponda. Mantener CP03/CP04, Storage/COM, planes e invitaciones sin activación alojada hasta certificado SEC-07 + autorizaciones separadas.
- **Estado piloto Ignacio:** `BT-PILOT-QA-04: A REPASAR`. Esta implementación funcional NO cambia la certificación del respaldo, ni da luz verde para clientes reales.
