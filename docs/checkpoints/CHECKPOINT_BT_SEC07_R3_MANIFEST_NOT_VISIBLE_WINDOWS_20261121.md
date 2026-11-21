# CHECKPOINT 60 — BT-SEC07-R3-MANIFEST-NOT-VISIBLE-WINDOWS

**Fecha:** 21/11/2026 Chile · **Rama:** main · **HEAD previo:** `f6adfd6d96e38585bca97dabcc50ad85bab4ccd6`.

## Evidencia del titular
- Durante ejecución del verificador V3 en Windows se abrió selector "Seleccionar manifest.json del respaldo cifrado de ByteTorque", mostrando carpeta con prefijo `bytetorque-local-20261117T1441...` y **ningún archivo JSON visible**.
- El diálogo del selector ofrece solamente filtros "Manifiesto JSON" y "JSON", **no** "Todos los archivos": sugerencia previa de cambiar a todos no fue aplicable.
- Propietario canceló el selector y abrió la carpeta en el Explorador Windows; la captura del 21/11/2026 muestra **dos entradas visibles**, `database.dump` y `roles.sql` con fecha de modificación 17/11/2026 11:42, **sin `manifest.json` visible**.
- **Extensiones reales y tamaños NO verificados:** Windows podría estar ocultando la extensión final `.gpg`, pero todavía no se acredita que sean ciphertexts; ni el contenido ni tamaño ni hashes fueron leídos por el asistente. Tampoco se acredita ausencia absoluta de archivos ocultos/otras carpetas.
- Estado del backup de esa carpeta: `MANIFEST_NOT_VISIBLE_FROM_EXPLORER`, **no certificable por V3**. No atribuir fallo al ZIP V3, al cifrado ni a integridad de archivos por la ausencia visible. El script puede haber pasado tests para abrir selector, pero no se recibió log de marcadores `BT_SEC07_*` ni PASS real de la herramienta.

## Contexto preexistente
CP56 documenta que el exportador histórico podía fallar antes de escribir el manifest; `roles.sql.gpg` histórico tuvo productor fallido y SQL0. Esto es **hipótesis compatible**, no explicación probada para estos archivos visibles. R3 owners/ACL y restore integral aún pendientes. CP59 V3 53/53 pruebas sintéticas Linux, Windows real sin certificado hasta log.

## Próximo paso de solo inspección visual
Propietario abre Explorador → Ver → Mostrar → Extensiones de nombre de archivo, vista Detalles y mostrar columnas Tamaño y Tipo para confirmar las extensiones y tamaños visibles de estos dos ficheros. También revisar **solo visualmente** si existe una carpeta `bytetorque-local-...` más reciente con manifest. **No ejecutar dump/GPG/restore/SQL, no crear ni editar manifest, no alterar archivos ni repetir verificador hasta clasificar esta carpeta**. Compartir captura sin ruta completa ni datos privados; no solicitar archivos `.gpg` ni secretos.

## Límites de este checkpoint
Actualización documental exclusivamente. No se usó acceso al PC, se ejecutó software, se abrió backup ni se modificó producción. GitHub CP60 preserva la evidencia visual comunicada y el siguiente paso.