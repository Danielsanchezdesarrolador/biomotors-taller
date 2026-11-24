# ByteTorque · SEC07 · Cierre B de infraestructura activa

**Fecha de evidencia:** 23/11/2026 (Chile). **Rama:** `main`. **Resultado:** `BLOCK_B_PASS_INFRASTRUCTURE` para el piloto inicial. Bloque A conserva [`BLOCK_A_PASS_V04`](CHECKPOINT_BT_SEC07_CIERRE_A_PASS_V04.md). El cierre de SEC07 para el piloto requiere el resultado del bloque C.

## Evidencia y límites de B

- El titular confirmó acceso administrativo a GitHub, Supabase, Render, Cloudflare y NIC Chile. Registró los ajustes de Auth y de Render y conservó la ficha en una custodia privada protegida. Se documenta la confirmación y se mantiene el contenido privado fuera de GitHub.
- Render sirve un sitio estático de `main` con auto deploy desactivado. Revisión LIVE verificada durante B: `871b4835c94b1cb738046d96f45b28db753d70cf`. Build observado: `npm install --no-audit --no-fund && npm run build`, Node 26.13.1 y publicación `dist`. El titular identificó 12 variables, confirmó nueve flags en `true` y la ausencia de reglas personalizadas de Redirects/Rewrites. Los flags públicos no amplían por sí solos la autorización de servidor.
- Se verificaron el dominio HTTPS y la redirección de `www` al dominio canónico. Este comportamiento es compatible con la configuración de dominios existente aunque el servicio carezca de reglas personalizadas de Redirects/Rewrites.
- Supabase conserva dos Edge Functions activas y con verificación JWT. `bt-owner-onboarding` v5 coincide con el archivo versionado en `251993ca81ab0946ce9c9dc87ec59723ba28f902`. Esa versión no incluye el dominio canónico en CORS, por lo que el recorrido usa una cuenta ya gestionada. `bt-cp05-documents` v4 corresponde a la ejecución [QA 45193953867](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45193953867), con fuente en `ebf08682e75c1f1fa5e03931ee2a2f72f6978b00`. El archivo privado y el envío externo quedan fuera del piloto inicial.
- El inventario agregado mostró un bucket privado y un PDF del taller QA, sin otros objetos. Se verificó ubicación y alcance, no se descargó el binario. Antes de incorporar documentos persistentes de un taller real se necesita respaldo cifrado de los bytes y verificación de apertura. El dump PostgreSQL por sí solo no guarda esos bytes.
- Las lecturas de B y la confirmación del titular no implicaron cambios en el backend, un nuevo despliegue, un cambio DNS ni una recuperación integral ensayada. No se publican valores de entorno, credenciales, identificadores de taller, capturas ni ubicaciones privadas.

## Procedimiento de recuperación

1. Recuperar acceso a las cuentas administrativas y seleccionar el último respaldo cifrado válido y su manifiesto desde la custodia del titular. Restaurar en un destino nuevo usando el contrato y la evidencia de recuperación del bloque A. Mantener el entorno vigente hasta completar la verificación del reemplazo.
2. Reponer Site URL, redirecciones, métodos de acceso y proveedores de Auth según la ficha privada. Reemitir las credenciales aplicables en caso de cambiar de proyecto. Verificar identidad, membresía y rol de una cuenta controlada. Las guardas SQL del bloque A no sustituyen la prueba de inicio de sesión.
3. Recuperar solo las funciones de las que dependa el alcance autorizado, desde la revisión o el paquete identificado. Reponer sus ajustes privados en el servidor. Recuperar archivos desde su respaldo cuando el flujo use Storage.
4. Reconstruir Render desde el commit LIVE de referencia, con la versión de Node, build, carpeta de publicación y variables de la ficha. Verificar acceso, persistencia y HTTPS en el reemplazo. El cambio de tráfico exige autorización separada. La copia local protege dentro del alcance acordado y sigue expuesta a pérdida total del PC.

## Continuidad directa · Bloque C

**Inicio verificado:** se cargó en un navegador la entrada de [ByteTorque](https://bytetorque.cl/#/acceso) y se mostró el formulario de inicio de sesión. No se inició sesión en una cuenta del piloto durante esta validación. El estado sigue **C EN CURSO**, sin prueba de escrituras ni resultado de persistencia.

| Orden | Paso del recorrido único | Evidencia de aceptación |
| --- | --- | --- |
| 1 | Entrar con la cuenta gestionada del taller piloto. | Taller y rol correctos, sin acceso a otro taller. |
| 2 | Abrir o registrar un expediente autorizado de cliente y vehículo. | Vehículo vinculado al cliente y al taller correctos. |
| 3 | Abrir o crear la orden vinculada y su cotización normal como borrador. | Orden y cotización vinculadas al mismo expediente. |
| 4 | Recargar y volver a abrir la ficha y el historial. | Cliente, vehículo, orden y borrador conservan los vínculos y los datos esperados. |

Si existe un expediente completo, recorrerlo en lectura puede validar la visibilidad y la persistencia de los datos existentes. Crear o editar en producción para comprobar el guardado requiere autorización aparte. Registrar solamente `PASS` o el primer paso bloqueado, sin datos de clientes. Conservar la pauta manual de respaldos cada dos días y antes de cambios de datos, con archivo cifrado, manifiesto y constancia de la última copia exitosa. La aceptación funcional de Ignacio sigue pendiente. No repetir A ni B.
