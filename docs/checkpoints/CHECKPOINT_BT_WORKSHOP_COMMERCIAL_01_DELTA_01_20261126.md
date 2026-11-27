# BT-WORKSHOP-COMMERCIAL-01-DELTA-01

26/11/2026, America/Santiago. Base exclusiva: candidato local `ba69a30eb62e2af6e7f01b62e11975b10e3978bb`, árbol `759e0f3e10ebe2a21674f92a03a1435cdde0b93b`, reconstrucción/64 archivos confirmados por Dirección Técnica. Base disponible y worktree limpio al comenzar. No se integra ni publica en el repositorio oficial. Entrega original privada conservada: commit `503cbc3481f7820b6bfc9515becb48e6957a0d45`, carpeta BT-WORKSHOP-COMMERCIAL-01.

## Alcance resuelto

### FIX-01: contrato HTTP de expediente final

La lista de campos de finalArchiveHandler rechazaba requestId aunque el cliente lo enviaba para cotizaciones. Se admite únicamente para download de kind quote, y es obligatorio. Se valida como string UUID mediante el contrato existente, sin coerción de arrays, objetos, números, null o vacíos. Campos desconocidos siguen rechazados; report/handover no admiten requestId. También se comprueban tipos de referencias de taller/revisión y tipo documental antes de crear clientes privilegiados. Archivo, autorización, integridad SHA/tamaño/path, cuotas y lectura histórica no se sustituyen ni relajan.

Prueba del handler HTTP completo con sus ports reales y dependencias SDK/Storage sintéticas: cotización válida devuelve el original, reintento no duplica consumo; referencias inválidas/extrañas retornan 400 antes de abrir SDK; taller/revisión ajenos, sesión revocada, cuota agotada y PDF alterado no entregan bytes. Informe y entrega históricos conservan lectura sin requestId ni consumo de cotización. Cinco guardas HTTP anteriores directamente afectadas se vuelven a comprobar, sin ejecutar sus restantes tests.

### FIX-02: concurrencia, metadatos e identidad de bytes

Defecto confirmado en TypeScript: dos peticiones reservadas con el mismo UUID podían renderizar independientemente; la primera confirmaba los bytes en SQL y la segunda recibía el mismo recibo, pero meteredDocument devolvía su generación local. El PDF puede diferir en CreationDate/ModDate aun con la misma fuente confirmada.

Después de cualquier confirmación, incluido el primer solicitante, se obtiene SIEMPRE el PDF de bt_commercial_cached mediante cliente privilegiado y se valida formato hexadecimal par y prefijo PDF. Nunca se devuelve la generación independiente. Si la caché autorizada falla, se retienen los bytes: no hay fallback al render local. Reintento confirmado usa la misma vía sin render ni nueva confirmación. Se conservan comprobación de identidad/actor/taller/recurso y liberación controlada de una reserva fallida.

**bt_commercial_finish fue revisada y no requiere cambios.** Su advisory lock por taller más row lock conserva el primer document_bytes y confirmed_at: al ver state=confirmed devuelve el recibo sin sobrescribirlos; la liberación tardía tampoco borra la confirmación. bt_commercial_cached revalida sesión, membresía, taller, plan y lease. Se prueban directamente esas funciones originales en PostgreSQL17 aislado. No se modifica el SQL aprobado ni se añade migración.

La regresión HTTP multipunto fuerza dos renderizaciones reales con metadatos PDF distintos mediante una barrera de concurrencia, sin sleeps: produce hashes diferentes para los renders y hashes idénticos para ambas respuestas y el reintento. Se comprueban fecha del PDF ganador, un consumo y ausencia de tercer render. Se incluyen los cuatro PDF sintéticos: dos renders distintos y dos respuestas idénticas. La metadata se controla solo en el test, no se altera el generador productivo ni se promete determinismo entre operaciones diferentes.

### FIX-03: paquetes de los tres servicios

Se reutilizan los tres empaquetadores existentes, sin cambiar sus contratos productivos. Nuevo orquestador `scripts/package-commercial-handlers.mjs` crea una salida exclusiva en /tmp, nunca dentro del repositorio. Conserva paquetes individuales bajo parts/ y ensambla:

- ready/supabase/functions/bt-cp05-documents.
- ready/supabase/functions/bt-final-archive.
- ready/supabase/functions/bt-commercial-documents.
- ready/supabase/config.toml con las tres entradas, JWT requerido y assets locales.
- freeze/supabase con los mismos tres nombres: entradas independientes de SDK, sin lectura de cuerpos/secretos/Storage, que siempre devuelven 503 y cero bytes.
- release-manifest.json con 43 hashes de archivos, hashes de fuentes relevantes y lockfile; sin valores de configuración sensible.

Imports npm fijados a supabase-js 2.119.0, pdf-lib 1.17.1 y fontkit 1.1.1; assets y licencia existentes íntegros. Sin dependencias nuevas, instalaciones ni contacto productivo. Dos construcciones independientes generan manifiestos y los 43 archivos byte a byte idénticos. El manifiesto exterior DTK-ERR-056 incluye también el propio release-manifest y toda la evidencia.

Verificación ejecutable `scripts/verify-commercial-handlers-package.mjs`: Node ESM con adaptador Deno mínimo y SDK sintético, bibliotecas PDF reales y assets empaquetados. Evalúa los bundles reales sin instrumentarlos, prueba un HTTP PDF y reintento idéntico por servicio, rechaza imports no fijados y bloquea fetch real. Comprueba también las tres entradas congeladas. **No es una certificación nativa de Deno/Supabase ni un despliegue:** Deno no está instalado; no se intentó instalarlo. Debe comprobarse el runtime Edge oficial antes de autorizar activación.

## Validación focalizada efectiva

- 22 casos nuevos de FIX-01/FIX-02 PASS: 20 en la primera ejecución y dos casos añadidos de lectura histórica. La prueba de concurrencia se repite sola después de precisar su expectativa de fecha y exportar renders sintéticos; no agrega un caso distinto.
- Tres casos existentes directamente afectados de commercial.test.ts PASS: confirmación fallida retiene bytes/libera reserva, exportación multipunto Plus y reintento por caché. Los otros cuatro se excluyen mediante filtro, sin eliminar tests ni reportarlos PASS.
- Cinco guardas HTTP existentes de archive.test.ts PASS: OFF, origen, path extra, body grande y escritura archivado OFF. Los demás casos del archivo no se ejecutan.
- Total: **30 casos unitarios/HTTP distintos PASS**, no repetición de las 48 unitarias completas.
- **8 casos PostgreSQL17 PASS**, Docker --network none y sin puertos: doble finish simultáneo con PDF diferentes conserva un documento/consumo; reintento no altera bytes/fecha; release tardío conserva bytes; anon/authenticated sin acceso a finish/cache; sesión revocada, miembro desactivado, downgrade y lease vencido deniegan acceso. Se conserva el original incluso al expirar.
- Laboratorio nuevo mínimo carga cuerpos exactos de finish/cache/plan/assert_capability del SQL original, con tablas/roles y reservas sintéticas. Los hashes de esos cuerpos están en sql-delta-results.json. No reproduce el esquema íntegro, RLS ni la suite comercial anterior de 44 comprobaciones. No usa el laboratorio anterior como ejecutor ni instala migraciones alojadas.
- **7 comprobaciones de paquetes PASS**: reproducibilidad completa, tres handlers HTTP reales empaquetados y tres versiones deny-all. Cero fetch real.
- TypeScript, sintaxis Node/Python y diff incremental: PASS. No build de interfaz ni pruebas visuales: no cambian UI, estilos o navegación. Las compilaciones de los tres handlers sí se ejecutan dos veces para comprobar reproducibilidad.
- WebKit permanece pendiente de CI oficial; no navegador, descarga ni cambio de red en este delta. No se hereda el PASS de las suites anteriores como prueba de esta corrección.

## Reproducción local (solo revisión)

Con las dependencias del lockfile ya disponibles, sin reinstalación automática:

1. `npx vitest run src/workshops/commercialDelta.test.ts` ejecuta los 22 casos específicos. La ejecución efectiva de este bloque se conserva en logs por filtros descritos arriba, sin repetir casos aprobados por rutina.
2. `python3 scripts/security/verify-commercial-delta-local.py` usa los renders de esa prueba y una imagen postgres:17 ya presente; no descarga imagen ni necesita red del contenedor. Siempre elimina su contenedor exclusivo. Solo ocho comprobaciones.
3. `node scripts/package-commercial-handlers.mjs /tmp/bt-commercial-delta-build-a` y una segunda salida exclusiva /tmp/bt-commercial-delta-build-b.
4. `node scripts/verify-commercial-handlers-package.mjs /tmp/bt-commercial-delta-build-a /tmp/bt-commercial-delta-build-b`.
5. `npm run typecheck`. Node 22 actualizado o 24; loader ESM local temporal para resolver imports Deno a bibliotecas instaladas. La advertencia experimental del loader no es un fallo ni una validación del runtime alojado.

## Congelación y actualización candidatas — NO EJECUTADAS

Responsable posterior: Dirección Técnica/operador autorizado, fuera de este delta. No hay invocación Supabase/Render/Edge desde estos scripts.

1. Verificar revisión, SHAs/manifiestos, CI y recuperación vigente. Inventariar versiones/aliases de los tres servicios y rutas Storage de cp05-quote-documents y bt-closing-documents. Confirmar flags y contratos SQL; no imprimir valores de secretos. Mantener correo, pagos, logos y autorregistro OFF, Auto-Deploy OFF.
2. Establecer una **barrera de mantenimiento de confianza en servidor/proveedor**, cubriendo TODAS las rutas anteriores de salida comercial y firma/lectura directa de esos buckets; impedir solicitudes nuevas y drenar/cancelar las que ya están en vuelo. Una pantalla frontend o apagar flags del navegador no sirve. No asumir sustitución atómica cross-service ni que un despliegue haya eliminado instantáneamente instancias viejas. Si el proveedor no permite una barrera y drenaje verificables, **no autorizar la apertura comercial ni afirmar ausencia de ventana**. Este requisito operativo no se ejecuta ni se simula aquí.
3. Dentro de esa barrera, instalar las tres entradas de freeze/supabase bajo sus nombres existentes, conservando verify_jwt=true. Verificar cada ruta autenticada: 503 sin PDF, cero firmas/salidas Storage y ningún proceso antiguo activo. Las entradas freeze no leen claves, no hacen llamadas SDK y no dependen de los flags antiguos. Los paquetes de congelación son artefactos candidatos, no una operación ya realizada.
4. Con los tres servicios cerrados, aplicar solamente tras autorización el SQL completo de BT-WORKSHOP-COMMERCIAL-01, pre/postflight y restricción Storage incluidos; este delta no añade SQL. Si ya está aplicado, comprobar huellas/ACL y no reinstalarlo a ciegas. Deben existir reserve/finish/cached y la protección frente a colisiones de UUID entre talleres.
5. Sustituir los tres servicios por ready/supabase (CP05, final archive y commercial). Reutilizar referencias existentes: SUPABASE_URL, BT_CP05_PUBLISHABLE_KEY, SUPABASE_SERVICE_ROLE_KEY y orígenes permitidos. CP05 conserva BT_CP05_ARCHIVE_ENABLED y serverWorkshopAccess; archivo final conserva sus flags READ/WRITE; servicio comercial valida capacidades mediante RPC. No --no-verify-jwt ni secretos de ejemplo como credenciales reales. No activar BT_CP05_EMAIL_ENABLED ni cargar claves nuevas de proveedor. Aplicar solo flags documentados/aprobados por el operador, no inferirlos del mock.
6. Mantener la barrera exterior mientras se verifica que no quedan instancias/rutas antiguas y los tres servicios ejecutan el candidato correcto. La actualización secuencial por sí sola no constituye una transacción distribuida. La barrera solo se retira después de verificar que TODAS las salidas comerciales usan cuotas, también expediente final, vista/descarga CP05, multipunto y acceso Storage directo. QA sintética autorizada de cuota, reintento/concurrencia y sesión/taller; CI/WebKit y runtime Edge oficiales pendientes.
7. Ante fallo, conservar o restaurar freeze para los tres servicios y no abrir la barrera. No volver a handlers antiguos sin medición, no borrar ledger/cache/históricos ni restaurar cuotas para obtener verde. La reversión funcional SQL de la entrega original sigue requiriendo congelación real; no se ejecuta aquí.

Los paquetes frozen no anulan copias locales ni URLs ya firmadas. Los accesos concedidos previamente siguen sus políticas/expiraciones; no se promete revocación retroactiva. Es necesario inventariar/esperar expiración o aplicar un mecanismo de invalidación autorizado antes de certificar que ninguna URL antigua concede acceso. Ningún paquete puede demostrar por sí solo la ausencia de instancias antiguas o tráfico en producción.

## Errores encontrados y soluciones

1. Allowlist HTTP incompleta: requestId enviado por cliente rechazado. Lista específica por acción/tipo, tipo string y UUID obligatorio para quote; negativos y endpoint entero.
2. Carrera de bytes: recibo idempotente confundido con identidad del render local. Lectura canónica después de toda confirmación, incluso para el ganador. SQL original ya era first-wins; ocho pruebas reales lo comprueban sin reescribirlo.
3. Entrega anterior solo incluía el paquete comercial nuevo. Orquestación reproducible de los tres empaquetadores existentes, configuración conjunta, hashes y variantes de cierre verificables.
4. Primer verificador de paquetes usaba Array.map(resolve), pasando argumentos adicionales al API path. Se corrigió a callback explícito. Fixture de multipunto incompleto carecía de intake_odometer y causaba denegación; diagnóstico local identificó toLocaleString sobre undefined y se completó con kilometraje sintético. No se relajaron tipos o generador productivos. Se adoptó ejecución Node ESM en el mismo entorno de las bibliotecas; el código distribuido se verifica sin instrumentación. El loader de diagnóstico temporal no forma parte del paquete.
5. Expectativa de fecha inicial demasiado específica al orden de ejecución: se comprueba la fecha del PDF realmente confirmado y que pertenece a los dos renders distintos, sin asumir qué render gana. Los hashes de respuesta y metadatos ganadores quedan registrados.

## Integridad y límites

Delta exclusivo respecto de ba69a30, no respecto del main oficial. Los archivos modificados y nuevos, SHA candidato/árbol completo, fingerprint incremental y SHA del diff se registran en CANDIDATO.json del paquete privado; transferencia es el commit que contiene BT-WORKSHOP-COMMERCIAL-01-DELTA-01. MANIFEST.sha256 cubre snapshots, diff completo, checkpoint, paquetes y evidencias. Se reconstruye exactamente el árbol final con un índice temporal y se compara cada archivo remoto. Entrega original y demás raíces privadas sin cambios.

No se modifica lógica de cuotas, ventanas, importe de planes, roles/RLS, generadores, marcas visuales, datos/históricos o SQL aprobado. Solo contrato HTTP, retorno canónico de bytes, empaquetado, regresiones y documentación. No servicios activos, migración alojada, push oficial, nueva rama, secretos, dependencias instaladas, auditorías/respaldos/SEC07 ni funcionalidades nuevas. La caché conserva lease de cinco minutos y revalidaciones del candidato original; no se extiende acceso ni se promete recuperación fuera del plazo. Native Deno/Edge, despliegue, mantenimiento real, CI oficial/WebKit y aceptación humana quedan pendientes.

## Integración autorizada — Dirección Técnica

Autorización expresa del titular recibida. Base oficial `c3cb91db1d33edb98fbe62776f9fbabbcbc09307`, Auto-Deploy OFF confirmado en Render. Se reconstruyeron 69 rutas finales sobre base, árbol Git exacto `8dacca0ac3be0f5a18a3a78378ffab14510a9776`; 64 originales + 11 delta con seis rutas superpuestas. Entregas privadas intactas, SQL original no modificado. Se cotejaron inventarios y tamaños/modos, coherencia de manifiestos de paquetes (43 entradas), coincidencia Git de ready/parts y tres variantes freeze idénticas. No se recalculó el total de hashes SHA-256 de los paquetes privados ni se publican binarios/capturas/evidencias. La única diferencia respecto del árbol candidato es el workflow focalizado (push main, pruebas delta y paquetes y resolución/check nativo Deno en CI sin tráfico alojado) y esta anotación documental. No declarar runtime Edge hospedado certificado por deno check. No modificar producción hasta CI, recuperación vigente y barrera verificable de mantenimiento y drenaje de TODAS las rutas documentales. El conector Edge recibe contenido textual y no acredita static_files binarios; no improvisar conversión ni despliegue parcial. Sin nuevos servicios, SQL, flags, secretos, pagos, logos o correos instalados. FIX-01 anterior sigue LIVE técnico con aceptación humana parcial; no afirmar cierre humano.
