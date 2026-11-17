# Auditoría de respaldo ByteTorque — 17/11/2026

Base auditada: `main`, `7842900e288e3cddf6795e1ae1dff5345cea2bbb`. Solo código de respaldos, workflows y documentación. Sin cambios en Supabase, contraseñas, usuarios, RLS ni datos. Sin exportación/restauración real ni lectura de secretos.

## Causa raíz comprobada

Los dos generadores usaban `ConfigParser.write()` con el valor predeterminado `space_around_delimiters=True`. Generaban `host = ...`, `port = ...`, etc. El parser de archivos de servicio de libpq rechaza esta sintaxis: `syntax error in service file`, línea 2. Ocurre antes de autenticar o negociar TLS. Python ConfigParser sí lee ese formato, por lo que la validación Python no detectaba la incompatibilidad.

Reproducción con libpq real instalada localmente, datos sintéticos y `sslmode=OFFLINE_SENTINEL`: la versión anterior falla al leer el servicio; la corregida supera el parser y llega al rechazo deliberado del sslmode inválido. La prueba termina antes de abrir sockets y nunca usa credenciales. El sslmode inválido existe exclusivamente en el test; producción conserva `verify-full`.

El clasificador buscaba cualquier `error:` y devolvía `POSTGRES_SERVER_REJECTED`, incluso para errores locales de psql. Así se investigaban contraseña y pooler aunque el cliente no había llegado al servidor. El código histórico de la exportación d81c179 y del diagnóstico 554b6f7 contiene el mismo defecto. Los registros sanitizados no conservan stderr, pero el código ejecutado produce de forma determinista el rechazo local.

## Evidencia de ejecuciones

| Ejecución | Evidencia observada | Interpretación |
|---|---|---|
| 44074691722 | export en d81c179: POSTGRES_SERVER_REJECTED | Generador de servicio incompatible presente; no prueba contraseña incorrecta |
| 44078101655 | ambas variantes POSTGRES_SERVER_REJECTED; job verde | Error del diagnóstico: no propagaba fracaso al exit code |
| 44079847898 | ambas variantes POSTGRES_SERVER_REJECTED; job verde | Mismo defecto; no prueba conexión exitosa |
| 44081845500 | checkout 554b6f7; SAFE_PREPARATION_FAILURE | Fallo previo a los probes; motivo exacto irrecuperable del log |

La última ejecución NO probó 7842900. Este commit añadió códigos de preparación, pero aún no arreglaba el archivo de servicio. No atribuir el fallo más reciente a `.pgpass` como hecho: formato/prefijo, CA y errores locales eran posibles. La actualización de `.pgpass` es un antecedente temporal, no una prueba de causa.

Enlaces: https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44081845500 y los otros IDs en la misma ruta.

## Corrección consolidada

- Generador compartido `postgres_config.service_content` con `space_around_delimiters=False`; exportación y diagnóstico reutilizan exactamente la misma implementación.
- Validador único `.pgpass`: destino exacto, contraseña no vacía, una línea, rechazo de BOM/controles, `:` y `\` correctamente escapados. Acepta terminador LF/CRLF y preserva espacios y Unicode de la contraseña. No intenta reparar escapes ambiguos ni transforma la contraseña.
- La exportación escribe la misma entrada normalizada que validó, evitando divergencia entre validación y uso.
- `POSTGRES_SERVICE_FILE_INVALID` distingue error local de rechazo del servidor, sin imprimir rutas ni valores.
- Diagnóstico devuelve exit 1 si cualquiera de los probes falla; verde exige ambos OK.
- Tests agregados a CI y antes de secretos en workflows manuales. El diagnóstico conserva dos SELECT 1 acotados para comparar PGOPTIONS sin exportar.

## Revisión de controles y límites

- TLS: `verify-full` y CA obligatoria conservados. Sin fallback a require/disable, sin omitir validación de hostname. `pg_stat_ssl` detrás de pooler no demuestra la conexión TLS del cliente.
- Secretos: cinco bindings solo en el paso de exportación; diagnóstico recibe dos. Archivos temporales privados; exportador elimina bindings heredados PG/RCLONE/BT antes de preparar el hijo. No se imprimen stderr ni valores. GitHub no permite leer el contenido de los secretos por API; no se intentó hacerlo.
- Workflow: despacho manual, main, confirmación booleana, environment correcto, permisos contents:read, checkout por SHA y sin persistir credenciales. Exportación exige repositorio privado: mientras sea público se omite deliberadamente. No se retiró esa protección. Diagnóstico permite al propietario operar en público y solo emite códigos fijos.
- Cifrado: pg_dump/roles fluyen por pipe a GPG, sin dump plano en workspace; huella completa cotejada con clave pública. Fallo de productor o cifrado impide éxito.
- Drive: destino fijado por ID, comprobación de permisos privados individuales, sin sobrescritura, descarga del mismo objeto y comparación SHA-256. Revisados código y 23 tests; acceso OAuth real NO validado en esta auditoría.
- Recuperación: contenedor nuevo, red none, volumen temporal, hashes previos, pg_restore con exit-on-error, comprobaciones de RLS/FK/grants. El ensayo sintético existente no demuestra recuperación del Supabase alojado. Extensiones/roles administrados y versión del servidor deben contrastarse antes de elegir imagen para recuperación real. No se ejecutó Docker: no está disponible en este entorno.
- Alcance: no incluye bytes de Storage, secretos/configuración de Edge ni ajustes del proveedor; roles exportados sin contraseñas. El recibo conserva `restoration_verified=false` y `full_project_backup=false`. No existe calendario automático ni retención operativa activada.
- La etiqueta mutable postgres:17-bookworm y paquetes apt no fijan una cadena binaria reproducible; mejora posterior posible, no causa de este incidente.

## Validación

52 pruebas locales PASS: configuración/libpq 4, diagnóstico 3, frontera GitHub 16, preflight 6, Drive 23. `git diff --check` PASS. No hay pruebas con credenciales, datos reales, exportaciones o restauraciones en esta cifra. CI remoto se consultará tras publicar este cambio; no confundir resultado local con CI.

## Próxima operación concreta

Ejecutar UNA vez el workflow `bt-readonly-pooler-diagnostic.yml` desde el nuevo commit de main con confirmación de solo lectura. No reejecutar 44081845500: reutilizaría la versión antigua. El objetivo es obtener ambos OK o un código de preparación preciso, sin exportar ni cambiar secretos. Si PGPASS_FORMAT_INVALID, corregir solo el formato del binding mediante el panel privado, sin pegar la contraseña al chat. Si CA_PARSE_INVALID, revisar únicamente el certificado. No recrear los cinco secretos indiscriminadamente.

Después: con autorización expresa y repositorio privado, una exportación cifrada con readback; posteriormente recuperación aislada autorizada de ese backup exacto, con clave privada fuera de GitHub. Solo tras comprobar recuperación y cobertura del piloto se podrá declarar el sistema listo para Ignacio. Esta auditoría corrige una causa determinista, no certifica todavía el respaldo.

## Fuentes primarias consultadas

- https://www.postgresql.org/docs/17/libpq-pgservice.html
- https://www.postgresql.org/docs/17/libpq-pgpass.html
- https://supabase.com/docs/guides/database/connecting-to-postgres
