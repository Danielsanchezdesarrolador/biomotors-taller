# ByteTorque — Checkpoint S1A: clave nueva y recuperación local PASS
**Fecha:** 2026-11-21 · **Rama única:** main · **HEAD anterior:** `fd9ec66898f048348fca0757f96cda828fa811b9`.

## Hechos observados en Windows (salida compartida por el titular)

```text
BT_SEC07_S1_CONTINUACION: START
BT_SEC07_S1_CLAVE_PRIMARIA: VERIFIED
BT_SEC07_S1_SUBCLAVE_CIFRADO: PASS
BT_SEC07_S1_EXPORTACIONES: CREATED
BT_SEC07_S1_EXPORTACION_PRIVADA: PROTECTED_S2K
BT_SEC07_S1_CANARY_CIFRADO: PASS
BT_SEC07_S1_RECOVERY_KEYRING: EMPTY_CONFIRMED
BT_SEC07_S1_IMPORTACION: PASS
BT_SEC07_S1_CANARY_RECUPERACION: PASS
BT_SEC07_S1_INVENTARIO: CREATED_LOCAL
BT_SEC07_S1_LEGACY: NOT_TOUCHED
BT_SEC07_S1_PRODUCTION: NOT_CONNECTED
BT_SEC07_S1_COPIAS_EXTERNAS: PENDING
BT_SEC07_S1_RESULTADO: PASS_LOCAL_ONLY
```

**Alcance:** identidad GPG nueva Ed25519 (certificación) + Curve25519 (cifrado); clave secreta exportada en ASCII armor, verificada con protección iterated+salt S2K; canary ficticio cifrado; exportación importada en GNUPGHOME previamente vacío; canary recuperado y comparado. Custodia local bajo `%LOCALAPPDATA%\ByteTorque-Custodia-Criptografica-v1` con ACL restringida establecida en Windows según salida previa. No incluir contraseñas, huellas, archivos de claves ni datos de clientes en GitHub. Evidencia corresponde a salida compartida, no a inspección remota del PC.

**Advertencia de alcance:** Pass local no es restauración independiente ante pérdida de PC, ni prueba que contraseña esté ausente del caché GPG. NO hay dos copias físicas externas, backup real, restauración PostgreSQL ni 3-2-1 aún. Mantener S1 global ABIERTO hasta S1B/S1C.

## Registro de incidentes sin repetición

1. Primera ejecución S1: `CUSTODIA_YA_EXISTE_NO_MODIFICADA` por destino ya presente, sin cambios en ese intento. No volver a crear ni borrar árbol de custodia existente.
2. Segunda ejecución S1: `GPG_KEY_GENERATION_FAILED`, stderr GnuPG `Vida máxima` durante generación. La causa técnica exacta de ese timeout/no-interacción no está certificada; no imputar con certeza a entropía.
3. Diagnóstico posterior mostró `SessionStateUnauthorizedAccessException` en etapa `PATHS`. Causa en script confirmada: usar `$home` en PowerShell 5.1 pisa variable automática protegida `$HOME` (variables son case-insensitive). Corrección: `$gpgHome` y nombres inequívocos, sin volver a crear carpetas.
4. Reintento controlado con nombre `$gpgHome`: nueva clave primaria `PASS_PRIMARY_KEY`, GnuPG creó el certificado de revocación. Continuación específica S1A posteriormente PASS en todos los marcadores arriba.
5. Prevención: no reiniciar procesos de generación ni reutilizar material preexistente; reanudar por fases, verificar antes de escribir, suprimir salida sensible y evitar variables automáticas de PowerShell.

## Siguiente procedimiento
- **S1B:** copiar exclusivamente exportaciones protegidas nueva pública/privada y canary cifrado ficticio a 2 dispositivos USB físicos diferentes (identidad de disco diferente), sin sobrescribir, verificar SHA-256 por lectura de ambos y luego leer claves exportadas desde esos dispositivos. No incluir SQL, clientes ni frase de paso.
- **S1C:** recuperación desde soportes externos usando almacenes GPG nuevos, preferentemente en otra máquina o sin caché del agente, y comprobar disponibilidad independiente de la frase de paso. Custodiar medios separados y fuera del PC; el certificado de revocación necesita custodia segura diferenciada.
- **S2:** exportación NUEVA PG17 prod con lectura solamente, TLS verify-full, cifrado streaming; NO autorizado/ejecutado por S1A.
- GitHub docs-only `[skip render]`, sin producción, cambios solamente en main. Repo observado como `public` en consulta previa, por tanto no cargar ningún material sensible.
