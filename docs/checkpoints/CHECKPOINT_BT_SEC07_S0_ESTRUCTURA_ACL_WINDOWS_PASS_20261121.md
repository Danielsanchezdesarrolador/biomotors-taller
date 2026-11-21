# CHECKPOINT BT-SEC07 — S0 estructura y permisos Windows PASS

**Fecha:** 21/11/2026. **Rama:** main. **HEAD de partida:** `4e2f102655b12a031d33454265d9fe2a72900d77`.

## Evidencia ejecutada por el propietario en Windows

Procedimiento original: único bloque PowerShell entregado íntegramente en chat; crea árbol totalmente nuevo en `%LOCALAPPDATA%\ByteTorque-Seguridad-Real-v1` y verifica ACL/owner/documentos. Ejecución comunicada por el titular:

```text
BT_SEC07_S0_INICIO: START
BT_SEC07_S0_PRECHECK: PASS
BT_SEC07_S0_CARPETAS: PASS_8_OF_8
BT_SEC07_S0_ACL: PASS_RESTRICTED
BT_SEC07_S0_OWNER: PASS
BT_SEC07_S0_INDEX_ATTRIBUTE: PASS
BT_SEC07_S0_DOCUMENTOS: PASS_3_OF_3
BT_SEC07_S0_LEGACY: NOT_TOUCHED
BT_SEC07_S0_SECRETS: NOT_CREATED
BT_SEC07_S0_PRODUCTION: NOT_CONNECTED
BT_SEC07_S0_RESULTADO: PASS
```

## Alcance realmente acreditado

- Preflight de destino local y control de rutas; se crearon 8 carpetas, con ACL restringida al usuario local, SYSTEM y Administradores, según el verificador ejecutado.
- Se generaron 3 documentos locales: política de carpetas, inventario inicial y evidencia; atributo NotContentIndexed aplicado y comprobado.
- No se tocaron archivos históricos; no se generaron secretos ni se conectó producción.
- No se inspeccionó de forma remota el sistema Windows: el resultado PASS se fundamenta en las etiquetas reportadas por el titular.
- La protección contra sincronizadores de terceros fuera de las rutas conocidas, el cifrado del dispositivo y las copias externas no están aún certificados.
- `07_segunda_copia_verificada` almacena registros, NO equivale a una copia externa por sí misma.

## Siguiente hito: S1

1. Crear identidad OpenPGP/GnuPG **nueva** en ubicación de custodia separada del árbol de respaldos, con permisos restringidos y protección por frase de paso; no recuperar ni reutilizar claves históricas.
2. Exportar secreto protegido y público; verificar estructura y protección sin publicar huellas, identidades ni secretos.
3. Cifrar canary ficticio y recuperar desde un `GNUPGHOME` inicialmente vacío; registrar prueba real de descifrado.
4. Copiar custodia a dos soportes independientes y revalidar importación/descifrado desde al menos una copia real (idealmente ambas); **S1 no se declarará cerrado globalmente** hasta ello.
5. Nunca almacenar clave privada ni códigos de recuperación en el árbol de respaldos. No acceder a datos de clientes en S1.

## Gobierno

Sólo documentación en GitHub con `[skip render]`; ninguna modificación de servicios o despliegue. Estado general: **seguridad y recuperabilidad NO CERTIFICADAS** hasta restauración y redundancia reales S4/S5. Observación de metadatos de repositorio al revisar CP79: visibilidad API `public`, sin cambios realizados; evaluar exposición separadamente.
