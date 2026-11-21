# CHECKPOINT 70 — BT-SEC07-R3-GPG-TOC-PREP-V1-WINDOWS-SYNTHETIC-PASS

**Fecha:** 21/11/2026 (Chile) · **rama única:** `main` · **HEAD anterior:** `af0a510ea4206466faa84d13424014bbf02a910e`.

## Evidencia enviada por el propietario desde PowerShell (Windows)

```text
BT_SEC07_TOC_PACKAGE: VERIFIED
BT_SEC07_REAL_TOC_TESTS: PASS_37_OF_37_SYNTHETIC
BT_SEC07_REAL_TOC_GPG: NOT_CALLED_IN_TESTS
BT_SEC07_REAL_TOC_PG_RESTORE: NOT_CALLED_IN_TESTS
BT_SEC07_REAL_TOC_WINDOWS: NOT_CERTIFIED
BT_SEC07_TOC_WINDOWS: PASS_SYNTHETIC_ONLY
BT_SEC07_TOC_REAL_BACKUP: NOT_ACCESSED
BT_SEC07_TOC_GPG_KEYRING: NOT_ACCESSED
```

## Interpretación sin extrapolaciones
- El ZIP `BT_SEC07_R3_GPG_TOC_READER_PREP_V1_20261121.zip` superó la comprobación SHA-256 del lanzador. **37/37 pruebas SINTÉTICAS PASS en Windows**. Este resultado valida la suite con procesos y datos ficticios en Windows; no equivale a probar los binarios GPG/pg_restore del propietario con material real.
- `REAL_TOC_WINDOWS: NOT_CERTIFIED` es una limitación explícita esperada: **GPG real NO llamado, pg_restore real NO llamado, ciphertext de ByteTorque NO abierto, keyring GPG NO consultado**.
- CP67 conserva el PASS de consistencia local manifiesto↔SHA/tamaño de la copia cifrada **parcial** del 19/11; no se ha probado autenticidad independiente, descifrado, contenido del dump o recuperación. `roles.catalog.json.gpg` = metadatos, no roles SQL restaurables.
- No repetir CP55, CP68, V4 ni la suite 37 sintéticos por inercia. No se cambió el respaldo real, DB, claves, SSL, roles ni producción.

## Próxima puerta: autorización expresa y delimitada para GPG/TOC REAL
Pedir al titular consentimiento **distinto** para usar una sola vez en SU PC el inspector del ZIP original SHA `dd6e5b7851039eefbc5d01c3245899fa9f13e689f402b645829984bebbc24a58` con `manifest.json` de la copia 19/11, revalidando V4 y accediendo únicamente al `database.dump.gpg` y al keyring/agent GPG ya instalado, canalizando binario descifrado a `pg_restore --list -` para **inspección TOC read-only**, sin generar deliberadamente SQL/dump descifrado en disco, sin conexión PostgreSQL ni ejecución de restauración. El inspector puede invocar Pinentry/caché de GPG y sistema operativo puede dejar rastros transitorios (RAM/paginación); no prometer aislamiento absoluto. No mostrar salidas de stderr, SQL, rutas ni nombres privados. Ante STOP, no repetir sin diagnóstico.

No se autoriza GPG real, uso de claves, PostgreSQL real, TOC auténtico, restauración ni conexión por el hecho de que las pruebas sintéticas pasaran. El siguiente ejecutor deberá entregarse **COMPLETO EN EL CHAT** según CP66, nunca exigir descarga de .ps1.

## Hitos posteriores todavía abiertos
1. GPG real + TOC aislado (pendiente).
2. Restore en DB aislada y cobertura owners/ACL/grants/RLS/roles y componentes excluidos del backup parcial (pendiente y sujeto a consentimiento independiente).
3. Nuevos backups reales verificables y automatización/retención, sujetos a permisos y pruebas.
SSL enforcement OFF visual CP48, end-to-end SSL no certificado CP46; cambio SSL separado y no autorizado.

**Este checkpoint modifica solo documentación en `main` con `[skip render]`**, sin despliegue.
