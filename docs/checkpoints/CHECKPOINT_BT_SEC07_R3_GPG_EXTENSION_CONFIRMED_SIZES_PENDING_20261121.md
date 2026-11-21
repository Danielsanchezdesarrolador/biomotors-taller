# CHECKPOINT 61 — BT-SEC07-R3-GPG-EXTENSIONS-CONFIRMED-SIZES-PENDING

**Fecha:** 21/11/2026 (Chile) · **Rama:** main · **HEAD previo:** `77dd1e53e48ef86567bea848fde5a45977043de0`.

## Nueva evidencia de Windows
El propietario activó la visualización de extensiones y adjuntó captura de la carpeta del respaldo fechado 17/11/2026 11:42. Las **dos entradas visibles** son `database.dump.gpg` y `roles.sql.gpg`. No se visualiza `manifest.json`. El propietario no ha indicado los tamaños de estos dos archivos y no hay acceso del asistente a los datos del backup.

## Interpretación y precauciones
- El sufijo `.gpg` confirma el **nombre/extensión** de ambos archivos, no su cifrado efectivo, hashes, integridad OpenPGP, descifrabilidad ni posibilidad de restauración.
- CP60 queda corregido: ya no es desconocida la extensión de los dos archivos; su **tamaño, contenido y validez siguen sin verificar**. La ausencia visual de manifest en esta carpeta impide ejecutar sobre ella el verificador V3 según diseño; no crear manualmente ni editar ese manifest.
- El histórico de roles SQL0 del checkpoint anterior eleva la prioridad de examinar el resultado, pero **no permite deducir que estos dos archivos concretos estén vacíos o corruptos**. El tamaño de ciphertext tampoco demostraría SQL restaurable.
- Sin lectura/descifrado/ejecución de respaldos, SQL, GPG, cambios SSL ni despliegue.

## Próximo paso seguro
Solicitar al titular que abra **Propiedades** de cada archivo mediante Windows Explorer y comparta solo su **Tamaño** en bytes, KB o MB; sin rutas personales, contenido, claves ni archivos. Posteriormente revisar visualmente si existe otra carpeta de respaldo más reciente que tenga `manifest.json`. Continuar en main con nuevos checkpoints de resultados, no usar el V3 para fabricar manifest ni reintentar sobre esta carpeta sin diagnóstico.

## Estado general
R3 SHA/manifiesto real no certificado, `roles.sql.gpg` viejo informado inválido, owners/ACL y restore integral pendientes. CP46 TLS PC→pooler PASS/backend NO, CP48 SSL enforcement OFF visual. Repositorio público observado CP58, sin cambios de visibilidad.