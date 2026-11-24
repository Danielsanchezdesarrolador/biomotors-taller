# ByteTorque — SEC07 S3-R3: ACL y default ACL presentes en archive v04

**Fecha de evidencia:** sesión 23–24/11/2026, PC propietario Windows PowerShell 5.1. **Rama GitHub:** `main`. **Tipo:** documentación sanitizada `[skip render]`. **Producción:** no conectada en esta prueba.

## Salida íntegra del procedimiento

```text
BT_SEC07_S3_R3: START
BT_SEC07_S3_R3_LAB: READY
BT_SEC07_S3_R3_GPG: PASS
BT_SEC07_S3_R3_TOC: READ_PASS
BT_SEC07_S3_R3_TOC_OBJECTS: 889
BT_SEC07_S3_R3_TOC_ACL_ITEMS: 213
BT_SEC07_S3_R3_TOC_DEFAULT_ACL_ITEMS: 24
BT_SEC07_S3_R3_TOC_OWNER_POSTGRES: 360
BT_SEC07_S3_R3_RESULT: ACL_ITEMS_PRESENT
```

## Resultado nuevo acreditado

El fichero `*_nobom_v04.dump.gpg` S2-R11, con la clave S1A seleccionada, pudo descifrarse y leerse mediante `pg_restore --list` en el contenedor cliente local sin red. El índice contiene **889 elementos, 213 entradas clasificadas ACL, 24 DEFAULT ACL** y **360 elementos cuyo último token era `postgres`**. Estas cifras son del **archive íntegro**, no conteos de los objetos ByteTorque estrictamente ni cotejo directo con la instancia PostgreSQL 17.11 productiva. La cantidad de entradas en el TOC no equivale a cantidad de GRANTs por objeto ni a número de propietarios reproducibles.

**Aprendizaje operacional:** `--no-acl --no-owner` omitió aplicar privilegios y propietarios durante las restauraciones R8/R9. La evidencia R3 apunta a que el archive conserva información necesaria; **no se justifica reexportar roles/ACL de producción antes de intentar usar ese mismo contenido.** Los roles globales del clúster no se deducen del TOC y son capa aparte.

## Relación con datos de producción ya leídos

Inventario agregado S3-R1: 12 tablas públicas con ACL explícita, 6 default ACL en ámbito de aplicación, 1 owner para las 12 tablas. Investigaciones S3-R3 preflight conectado en transacción READ ONLY: 31 roles PostgreSQL totales (16 `pg_*`, 0 `bt_*`), 25 membresías, y en esquemas `public/bt_*` 20 tablas y 37 funciones con owner `postgres`; esquema `public` es de `pg_database_owner` y dos privados de `postgres`. No se encontraron roles personalizados identificados; eso NO equivale a que todo el clúster sea portable sin dependencias Supabase.

## Siguiente paso y límites

**S3-R4 propuesto — NO EJECUTADO:** laboratorio nuevo desechable con entrypoint Supabase completo, `bt_s4` desde `template0`, descifrado binario GPG, `pg_restore --schema-only --exit-on-error --single-transaction` **sin los flags omisores `--no-owner` o `--no-acl`**, comprobar que owners/GRANT/DEFAULT ACL relevantes se puedan aplicar; comparar métricas sanitizadas con snapshot fuente. Evitar cargar filas/datos (ya acreditados en R8 y R9). Si bootstrap o permisos fallan, clasificar primer error sanitizado y STOP; no emitir SQL, nombres privados ni introducir roles arbitrarios. Shell y compatibilidad Windows se deben verificar antes de una ejecución autorizada.

**No se puede declarar aún:** propietarios/ACL restaurados, paridad de grants con producción actual, recuperación Auth/Storage físico/Edge/Render, DR frente a pérdida total del PC. No repetir TOC/S2, ni R8/R9.

**Referencia oficial:** https://www.postgresql.org/docs/17/app-pgrestore.html.
