# CHECKPOINT 59 — BT-SEC07-R3-MANIFEST-WINDOWS-V3-PACKAGE

**Fecha:** 21/11/2026 (Chile) · **Rama:** main · **HEAD previo:** `104334067d6cf10c4c95cb123441ab12ad8fe40a`.

## Motivo

El propietario solicitó entregar lo necesario para seguir. El ZIP V2 documentado en CP57 no estaba recuperable como bytes verificables en el entorno actual; no se reutilizó su nombre ni su SHA. Se creó un **paquete nuevo e independiente V3**, manteniendo la finalidad limitada de verificación local de manifiesto y SHA del ciphertext, con controles para el falso STOP Windows de INC-57.

## Paquete generado

- Nombre: `BT_SEC07_R3_MANIFEST_READONLY_WINDOWS_V3_20261121.zip`.
- Tamaño: **7334 bytes**.
- SHA256: `07316406274f1b2662e5a5978fb039b6751ab35cd58acb6227b466667308b484`.
- El ZIP fue creado solo como archivo descargable de la conversación: **no se comprometió código del verificador en repositorio público**, solo estas notas.
- Contenido: `README.md`, `bt_sec07_manifest_readonly.py`, `test_bt_sec07_manifest_readonly.py`, `run_bt_sec07_manifest_offline_tests.py`.
- Comprobación `zipfile.testzip` PASS. **53/53 tests sintéticos PASS antes de comprimir y 53/53 tras extraer en ruta aislada Linux**. AST de imports del verificador sin librerías de red/subprocess/GPG/PostgreSQL; simulación Windows comprueba desajustes de inode/ctime entre path y fd, rechazo de fd directorio, reparse y tamaño inconsistente.
- El paquete usa ref del proyecto leído del **exportador local original** `bytetorque_respaldo_local.py` de Library (sin ejecutar dicho exportador). No accede por sí mismo a archivos originales del usuario en entorno asistente.
- **No es el ZIP V2 binario original** ni representa 53/53 en Windows real; esta versión necesita validación en Windows del titular.

## Límites de seguridad

La CLI V3 únicamente abre el `manifest.json` escogido manualmente y los archivos `.gpg` reconocidos enumerados en la misma carpeta. Compara proyecto, backup_id con carpeta, `full_project_backup=true` declarado, tamaños y SHA-256; no descifra, GPG, ejecuta PostgreSQL, usa red, copia ni modifica backup. Los tests sí crean archivos ficticios temporales para QA. Puede variar el metadato de acceso por lectura de Windows. El chequeo path/fd Windows es de tipo+tamaño para fd y snapshots de ruta antes/después; carreras complejas de sistema de archivos no quedan formalmente excluidas.

`PASS_LOCAL_CONSISTENCY_ONLY` **NO certifica autenticidad independiente del manifiesto, descifrado, restauración, owners, ACL, GRANTS, roles ni cifrado end-to-end**. Un manifiesto histórico del exportador podía tener `full_project_backup=false`, lo cual implica STOP y no debe alterarse para aprobar. Respaldo histórico `roles.sql.gpg` seguía SQL0 inválido. INC-57 V1 obsoleto; V2 anterior no ejecutado Windows y ahora se usa V3 con hash propio.

## Siguiente paso

Dueño descarga ZIP V3 a Downloads y ejecuta bloque PowerShell específico para **SHA V3**, extrae ZIP a TEMP, corre 53 pruebas; solo tras PASS selector de `manifest.json`. Ante STOP, no reintentar a ciegas. Enviar solo líneas `BT_SEC07_*`, sin rutas, manifest, claves, credenciales ni backup. No ejecutar GPG, SQL, Supabase, restore ni cambiar SSL. Este checkpoint no confirma aún que se haya ejecutado V3 en Windows. Registrar resultado en CP60 solo tras evidencia.

## Otros riesgos

CP46 cliente TLS verify-full PASS/backend NO, CP48 enforcement OFF visual, no end-to-end certificado. R3 owner/ACL/restauración aislada pendiente. Render no desplegado. Repo GitHub se observó público en CP58; no cambiar visibilidad sin autorización.
