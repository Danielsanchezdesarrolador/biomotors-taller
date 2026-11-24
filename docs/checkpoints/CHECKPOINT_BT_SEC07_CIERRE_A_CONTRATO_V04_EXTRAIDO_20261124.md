## SEC07 cierre A — BLOCK_A_PASS_V04 (evidencia del propietario)

**Bloque A aprobado sobre v04**: ATTACHED_R8, BOOTSTRAP READY, GPG PASS, CONTRACT MATCH, QA PASS, CLEANUP PASS, STATUS BLOCK_A_PASS_V04, PRODUCTION NOT_TOUCHED. Según informe recibido: propietarios/ACL de 281 entradas de aplicación y dependencias Auth recuperados; 20 tablas, 35 funciones de propietario postgres, 21 políticas RLS y 6 DEFAULT ACL; positivos admin A/B, aislamiento lectura/escritura A→B y comprobación de B intacto, mecánico restringido, dos mutaciones de planes rechazadas para no creador incluso AAL2 y creador AAL1; creador AAL2 autorizado con eventos, denegados sin eventos. Fixtures sintéticos revertidos, sin roles ficticios/grants añadidos ni datos reales recargados.

**Errores/soluciones:** S3-R4 MISSING_ROLE (rol exacto desconocido) → selección propia y Auth, S3-R5 descartado; primer CLOSE_A salida silenciosa tras bootstrap (causa exacta desconocida) → eliminar ALTER ROLE redundante, template0 separado, marcadores; BOOTSTRAP_WAIT desacoplado → runner adjunto R8 con espera interna y SELECT 1 por socket. Imagen supabase/postgres:17.6.1.136, aislamiento sin red/puertos, tmpfs, GPG binario, pg_restore --schema-only --use-list. El script final completo no fue aportado, solo informe y marcadores. Ver [checkpoint único de cierre A](CHECKPOINT_BT_SEC07_CIERRE_A_PASS_V04.md).

**No repetir A ni R8/R9 ni inventarios aprobados.** Quedan únicamente B (infraestructura activa y ficha privada) y C (recorrido funcional autorizado Ignacio, persistencia y respaldo periódico manual). MFA SQL sintético no certifica desafío Auth real; 35 funciones v04 no equivalen necesariamente a las 37 posteriores. SEC07 sigue pendiente de aprobación para piloto hasta B/C. Riesgo PC-only conservado. No modificar producción, desplegar ni ampliar alcance.

---

# SEC07 cierre A — contrato archivado v04 extraído (23–24/11/2026)

Evidencia local comunicada por el propietario: GPG PASS, esquema y ACL extraídos, REVIEW_INPUT_READY; no restauración de filas, roles nuevos ni conexión a producción. Lab temporal sin red; SQL completo no se compartió. La salida enumera 318 entradas candidatas, de las cuales 281 corresponden a esquemas public, bt_cp05_private y bt_platform_private (incluidos rls_auto_enable, ACL de esquemas y DEFAULT ACL públicos), y 37 a triggers/ROW SECURITY administrados auth/storage.

- 20 tablas (12 públicas + 8 privadas), 35 funciones en el manifiesto, 21 políticas públicas, 76 entradas ACL de aplicación y 6 DEFAULT ACL. Las funciones y tablas enumeradas tienen owner postgres; las ACL de funciones restringen PUBLIC y distinguen authenticated/service_role; las tablas públicas tienen SELECT y permisos granulares por columna para authenticated. 
- Defaults de public para postgres y supabase_admin incluyen grants amplios; no implica que las tablas actuales los tengan. Importante comprobar TRUNCATE/DELETE, acceso directo a esquemas privados y RPC. 
- 35 funciones archivadas vs 37 del catálogo de producción posterior: no afirmar igualdad del snapshot con producción actual. No se revisaron cuerpos remotos por esta extracción. 
- El resumen ACL es una extracción conservadora, no un parser SQL completo. No reconstruir permisos a partir de resúmenes ni conteos; aplicar entradas originales con pg_restore --use-list en orden de archivo. Separar objetos administrados, incluir dependencias de auth.users/auth.uid/auth.jwt que la aplicación usa y sus permisos necesarios. No inventar roles ni concesiones de aplicación.
- Siguiente: ensayo de esquema y ACL más fixtures locales; R8/R9 y R1/R2/R3 conservados, S3-R5 descartado. No generar otro respaldo ni repetir auditoría de TOC. 
- Estado: contrato candidato extraído y revisado para ensayo; **NO es PASS de recuperación de permisos ni de SEC07**. Ver decisión de cierre acotado en ../recovery/BT_SEC07_CIERRE_PILOTO_DICTAMEN_ASTRA_20261123.md.
