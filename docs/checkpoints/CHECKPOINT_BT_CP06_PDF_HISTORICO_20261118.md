# Checkpoint ByteTorque · CP06 y recuperación de PDF histórico

**Fecha:** 18 de noviembre de 2026 · **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **Rama:** `main`. El titular decidió dejar los respaldos integrales para mañana en su computador personal, con posibilidad de evaluar su computador laboral solo si las políticas corporativas lo permiten.

## Qué se hizo

Se detectó que CP06 mostraba revisiones históricas, pero no ofrecía una recuperación directa de su PDF conservado por CP05. Se preparó el botón **«Descargar PDF de esta revisión»** en `src/historial/VehicleHistory.tsx`.

- El botón **no aparece** salvo que estén habilitados `VITE_BT_CP05_PRIVATE_ENABLED=true` y `VITE_BT_CP05_DOCUMENTS_ENABLED=true`, y se haya cargado el cliente privado de documentos.
- `src/historial/archiveDownload.ts` comprueba que la revisión tenga el taller, vehículo y cotización del historial seleccionado antes de intentar descargar. `documentClient.download` confirma sesión y comprueba bytes, tamaño y SHA-256; el backend autorizado comprueba membresía, RLS y ruta del documento. No hay descarga por ruta indicada por el navegador.
- El nombre del archivo lleva número de cotización y revisión, p.ej. `COT-000007-R2.pdf`, para distinguir archivos históricos de borradores.
- La descarga maneja ocupado/error/denegación de acceso, sin mostrar éxito previo a la respuesta del servidor.
- `src/historial/archiveDownload.test.ts`: pruebas con datos sintéticos para flag inactivo, contexto válido, rechazo de taller/vehículo/snapshot cruzado, y ausencia de descarga si falla la integridad.
- **Commits:** `b28c15048f0d20c757fc60722e5593623bca477c` (función y pruebas), `932a81c4fe4a6dce58a134bafde6f293c8861e09` (ajuste de tipado en fixture deliberadamente corrupto).

## Estado y puertas

- No se instalaron migraciones ni buckets, no se escribieron datos reales, no se habilitaron pagos/correos ni archivos privados.
- `VITE_BT_CP05_DOCUMENTS_ENABLED` permanece OFF; el botón **no debe aparecer todavía a los usuarios**, y esta funcionalidad es **CANDIDATA, no operativa** hasta terminar los respaldos, instalar Storage/RLS bajo autorización y desplegar Edge CP05.
- No se hizo ningún respaldo desde el PC laboral y no se solicitaron ni manipularon contraseñas ni claves de cifrado.
- El proyecto web en Render permanece en el despliegue previo; los commits se publicaron en `main` con `[skip render]`.
- **CI para SHA 932a81c:** `44307885401` Verificación Web/iOS PWA + Android y `44307885443` interfaz visual estaban ejecutándose cuando se creó este checkpoint. Consultar la conclusión antes de declararlos verdes. La primera corrida de código detectó error TS de un fixture malformado, corregido en el segundo commit.

## Próximos pasos

1. Consultar ambas corridas de CI para el SHA `932a81c` y corregir si alguna falla.
2. Mañana desde el PC **personal**, completar el respaldo integral cifrado de la base, Auth, roles y Storage, con una **prueba de restauración aislada**. GitHub Actions de respaldo requiere repositorio privado (actualmente público) y sigue pendiente el acceso OAuth a la carpeta privada de Drive; ninguna copia parcial debe llamarse respaldo integral.
3. Con respaldo verificado y permiso específico del titular, crear el bucket privado de CP05, instalar Storage RLS restrictivo y probar aislamiento A/B; después desplegar Edge con correos desactivados.
4. Activar documentos y verificar que desde CP06 se descargue la revisión R1/R2 original, incluso tras nuevas ediciones de la cotización. Comprobar físicamente Android e iPhone y dejar evidencia.
5. Generar un checkpoint tras cada tarea y conservar solo `main`.

## Restricciones comerciales vigentes

Básico personal gratuito sin nuevo taller; Plus USD 5/mes con 4 mecánicos; Full USD 15/mes con 8; cada mecánico adicional USD 2 mensuales a cargo exclusivamente del propietario. Ignacio obtendrá Full permanente por concesión del Creador cuando el piloto esté preparado; sin otorgamiento real hoy.
