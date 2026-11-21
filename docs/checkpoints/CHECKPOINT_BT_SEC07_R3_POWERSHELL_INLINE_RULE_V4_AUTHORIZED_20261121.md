# CHECKPOINT 66 — REGLA POWERSHELL INLINE Y EJECUCIÓN V4 AUTORIZADA

Fecha: 21/11/2026 Chile. Rama única: main. HEAD inicial: 79ac3ea1564bf486a0ec3ef1566d72e74dd3474f.

## Regla permanente del propietario
Solicitud explícita: «MANDAME SIEMPRE LOS EJECUTORES DE POWER SHELL EN EL CHAT, QUE QUEDE ESTABLECIDO.»
Obligatorio: entregar SIEMPRE cualquier ejecutor PowerShell como bloque completo y listo para copiar y pegar EN EL CHAT. El archivo .ps1 puede ser adicional opcional, nunca sustituye el bloque inline.

## Alcance autorizado
El propietario dijo: «Y AUTORIZO A LA EJECUCION V4». Autorización limitada a ejecución LOCAL y de SOLO LECTURA del verificador V4 de manifest y hashes de ciphertext del respaldo del 19/11/2026. No GPG, SQL, Supabase, descifrado, restauración, creación de backups, cambios SSL ni cambios sobre archivos reales. El asistente no puede ejecutar software en el PC del titular: entregó el bloque completo PowerShell en este chat para uso voluntario en Windows.

## Entrega y evidencia
ZIP V4 descargable de conversación: BT_SEC07_R3_MANIFEST_READONLY_WINDOWS_V4_20261121.zip; 8720 bytes; SHA-256 9fea99fb10eab18e6ba2ee78b51ad78e54b82f407f8fe7d45d284bc237fbdd0f. Se verificaron de nuevo los bytes exactos en el contenedor de la conversación.
Opcional .ps1: BT_SEC07_EJECUTAR_V4.ps1, SHA-256 a69899bb3adb9c514d8eef0b9325ca3ed80bc53a0dd49db83933fe1c8148985e; se leyó su contenido local, que coincide con el bloque de PowerShell entregado inline.
El ejecutor verifica SHA del ZIP, extrae a TEMP, corre 69 pruebas sintéticas, y solo tras PASS ofrece selector de manifest.json. Si el manifest declara full_project_backup=false, V4 puede comprobar tamaños y SHA de ciphertext pero debe reportar PARTIAL_BACKUP_DECLARED, nunca recuperabilidad integral.

## Estado
NO se ha recibido todavía un resultado Windows V4 del backup real: queda pendiente. Solicitar solo etiquetas BT_SEC07_*. Ante STOP no repetir a ciegas. Un PASS de ciphertext no certifica autenticidad independiente, descifrado, restore, owners, ACL, roles ni SSL end-to-end.
Solo documentación en main con [skip render], sin despliegue ni acceso a datos.