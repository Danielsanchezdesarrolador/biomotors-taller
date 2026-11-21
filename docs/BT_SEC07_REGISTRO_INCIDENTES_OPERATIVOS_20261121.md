# ByteTorque SEC-07 — Registro de incidentes operativos de seguridad

**Fecha de apertura:** 2026-11-21 · **Rama:** main. Archivo público: no registrar material secreto ni rutas/identificadores internos innecesarios.

## Política obligatoria de errores y correcciones
- Cada STOP debe asociarse a etapa, marcador BT_SEC07, impacto y acciones ejecutadas (incluidas las que NO se ejecutaron).
- Registrar **causa comprobada** separada de hipótesis: NO declarar una hipótesis como solución. Proponer corrección mínima, confirmar resultado Windows y anotarlo luego como verificado.
- Documentar en este registro y actualizar `AGENTS.md`, `agent.md` y `roadmap.md` **cuando se constate la solución**. Evitar checkpoints por cada comando; sí al cerrar hitos.
- No repetir scripts enteros tras STOP que pueda haber creado archivos parciales. No sobrescribir respaldos, llaves o exports. PowerShell completo INLINE.
- Evitar compartir contraseñas, datos personales, SQL claro, huellas privadas o rutas sensibles por chat/GitHub.

## INC-S2-01 — Preflight PostgreSQL S2 devuelve FAIL [ABIERTO]
**Evidencia local reportada:**
```text
BT_SEC07_S2_STAGE: TLS_READ_ONLY_CONNECT
BT_SEC07_S2_STOP: IDENTIDAD_O_SOLO_LECTURA_INCORRECTA
BT_SEC07_S2_RESULTADO: STOP
BT_SEC07_S2_PARTIAL_FILES: PRESERVED_IF_CREATED
```

**Alcance acreditado:** el cliente `psql` finalizó con exit 0 según la rama del script y devolvió un valor diferente de `PASS` esperado. El script combinaba tres condiciones en un único `CASE`: `current_database()='postgres'`, `default_transaction_read_only='on'`, `server_version_num` dentro de PG17; no imprimió el resultado desglosado. No se inició `pg_dump`, no se creó respaldo S2 y no se modificó producción. La discrepancia de nombre del certificado CA de Descargas no explica este STOP (se habría detenido antes o fallado la validación TLS).

**Hipótesis, NO causa demostrada:** el ajuste `PGOPTIONS='-c default_transaction_read_only=on'` puede no reflejar el valor de `default_transaction_read_only` esperado en el pooler de sesión. Tampoco se ha excluido diferencia en base o versión.

**Corrección propuesta (PENDIENTE WINDOWS):** evitar depender del estado `default_transaction_read_only` heredado o de `PGOPTIONS`; ejecutar `BEGIN TRANSACTION READ ONLY` explícito y comprobar `transaction_read_only=on`, nombre de BD y versión de forma separada. Si eso pasa, generar un nuevo backup PG17 cifrado por stream binario, con `pg_dump` y GPG, sin escribir claro ni tocar producción. Mantener TLS `verify-full`, fallo cerrado y sin credenciales en argv.

**Prueba de verificación pendiente:** marcadores `BT_SEC07_S2_*` sobre PC que confirmen identidades/lectura, GPG, cifrado, integridad y TOC. Solución se documentará como confirmada solo después del resultado real.

## INC-S1-01 — Variable automática de PowerShell [CORREGIDO]
En PowerShell 5.1 `$home` equivale a la variable automática protegida `$HOME`, por insensibilidad a mayúsculas. Causa comprobada del `SessionStateUnauthorizedAccessException`. Corrección: utilizar `$gpgHome` y conservar árbol S1 existente sin recrearlo. Verificación: posterior `PASS_PRIMARY_KEY` y `PASS_LOCAL_ONLY` en S1A.

## Riesgo residual deliberado
El propietario eliminó copias USB/exteriores y aceptó respaldo solo en su PC. No afirmar recuperación frente a pérdida/ransomware total del PC ni 3-2-1 cumplida. S2/S4 deben avanzar sin exigir USB.
