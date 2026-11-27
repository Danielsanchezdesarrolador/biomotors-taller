# BT-COMMERCIAL-HARDENING-01-LIVE-01 — runbook candidato (NO ejecutar)

Preparación exclusivamente. HEAD de código aprobado 5375a3ea0cbb62ceaf3ceca4ad61d756b63b08ae; manifest privado 6fa83031f8e6ab10396927c00fb8510dcab4a7e8, transferencia d94a702726be7ab76c260af2fd95cb463e3652a1. No activar ni copiar a workflows activos, no ejecutar SQL sin autorización escalonada. El workflow anterior permanece fijado a 3c77ca83ee2d6db62e0ad2c66ccfa6aa61294c4c y no instala Hardening. Se propone un nuevo archivo .github/workflows/bt-commercial-hardening-edge-manual.yml al autorizarlo. Conserva concurrency group del anterior, JWT, los mismos tres slugs y el mismo freeze (4/4 hashes coincidentes). Verificación independiente de 10/10 SHA-256 de fuentes del manifest contra código oficial. CI 46034359857: doble empaquetado reproducible 43 archivos y Deno PASS; no se ha descargado ni comparado binariamente el manifest del artifact CI con el privado. La fase verify debe comprobar igualdad total del manifest y 43/43 bytes antes de cualquier corte. No afirma que ya se ejecutó este workflow propuesto.

## Secuencia obligatoria

1. Confirmar backup integrado vigente posterior a las cinco confirmaciones o cobertura demostrable equivalente (DB, ledger, objetos privados, código, configuración) y ventana sin editores/operaciones activas; no reabrir SEC07 ni repetir restauración por rutina. Guardar inventario agregado y referencias de recuperación. Publicar workflow nuevo tras autorización; ejecutar fase verify sin credenciales de despliegue; comprobar manifest, 43 archivos y 10 fuentes. Si no coincide, detener sin cerrar ACL.
2. Autorización de cierre: confirmar HEAD/CI, Auto-Deploy OFF, cuatro firmas y permisos, dos buckets privados/16 objetos, cinco confirmados y cero reservas activas o reconciliar variaciones legítimas. Ejecutar solo cierre GATE4 de abajo en una única transacción y verificar 12/12 denegaciones. No usar GATE_CLOSE histórico de tres firmas (requiere esquema comercial ausente) ni INSTALL_GATE4 (ya instalado). Cierre no congela toda escritura de negocio; no habilitar editores, observar ledger y transacciones.
3. Autorización freeze: ejecutar workflow nuevo fase freeze con HARDENING_FREEZE_GATE_VERIFIED tras ACL cerradas. Verificar versiones nuevas y JWT, tres HTTP POST autenticados 503/0 bytes/no-store/Retry-After 60/nosniff desde sesión local vigente según DTK-ERR-063 (sin tokens en chat); drenaje mínimo 400 s desde último freeze confirmado y ausencia de operaciones documentales anteriores activas. No afirmar convergencia global; URLs previas/caché y clientes viejos no se revocan universalmente. Conservar aceptación residual anterior como antecedente, nueva decisión explícita si subsiste incertidumbre material. No rotar claves Auth/Storage ni ejecutar sonda sobre ready con cuerpos que puedan escribir.
4. Autorización ready: instalar tres Edge desde workflow nuevo fase ready/HARDENING_READY_GATE_VERIFIED con GATE4 cerrado. Verificar las tres versiones/huellas, JWT, onboarding v8 intacto, ACL cerradas, RLS, ledger e inventario. No reapertura parcial ni cambio de SQL comercial. Si falla una función, mantener GATE4 y restaurar freeze a las tres bajo autorización.
5. Autorización Render: desplegar SHA de código aprobado 5375a3ea0cbb62ceaf3ceca4ad61d756b63b08ae con Auto-Deploy OFF (o descendiente exclusivamente documental comparado); verificar LIVE y configuración vigente. Mantener email/registro de clientes/logo/pagos OFF. No declarar funcionamiento de Safari físico a partir de WebKit CI. Verificar navegación autenticada y estados bloqueados mientras GATE4 cerrado. Ante error, mantener cerrado; recuperación coordinada con frontend LIVE anterior 7dc06a26c1a4821affb67366a0a05ba0b672a1b4 y paquetes ready previos del workflow histórico solo si revisión independiente confirma compatibilidad y titular autoriza; preservar ledger y documentos. La reversión a versión previa reintroduce limitaciones de Hardening y exige aceptación explícita, preferir reparación hacia adelante. No ejecutar ROLLBACK SQL comercial por rutina: revoca RPC adicionales y no es un rollback de este cambio. No usar handlers sin medición.
6. Autorización de reapertura separada: solo tras ready+frontend verificados, revisión residual, inventario y 12/12 denegaciones. Ejecutar GATE_OPEN existente exacto (blob e377cbe473804a4104eb54c23826fdec2d83743f), verificar 4 permisos y 8 denegaciones, huellas SQL sin cambios. Si falla, mantener cerrado, no improvisar grants.
7. Aceptación humana titular/QA: downgrade Full→Basic con vista abierta y sin recargar; servidor niega nueva descarga, sin fallback; relogin/operación anterior 409 cuando corresponde, renovación explícita con cuota correcta; identidad UUID/bytes dentro de ventana, una confirmación para mismo UUID; cotización, multipunto, expediente/ZIP según plan; orden lista para entregar multipunto solo lectura por estado; recuperar Full y reconciliar cuotas/ledger. No usar clientes reales de Ignacio ni PDF ya guardado como prueba de bypass. Separar CI de producción, no certificar aislamiento E2E entre tenants sin evidencia. Documentar y cerrar bloque A solo al aprobar.

## SQL de cierre candidato — no ejecutar en preparación

```sql
-- HARDENING: candidate only; maintenance window/backup and explicit authorization required.
BEGIN;
DO $gate$
DECLARE s text; h text;
BEGIN
  IF current_user <> 'postgres' OR to_regnamespace('bt_commercial_private') IS NULL THEN
    RAISE EXCEPTION 'HARDENING_COMMERCIAL_SCHEMA_OR_ROLE_MISMATCH';
  END IF;
  FOR s,h IN SELECT * FROM (VALUES
    ('public.bt_plan04_operations_status(uuid)','107b734b0384f003f19f2b9cc84fec26'),
    ('public.bt_final_archive_document(uuid,uuid)','6e1e08dd8b37e6a6cee33bcc5be9b502'),
    ('public.bt_final_archive_source(uuid,uuid,uuid,uuid)','c8e1d918c0e600b0e425826a54962ea1'),
    ('public.bt_commercial_status(uuid)','46efeb3a831bb286039093c72419eb66')
  ) v(signature,definition_md5) LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_proc p WHERE p.oid=to_regprocedure(s)
        AND pg_get_userbyid(p.proowner)='postgres'
        AND p.proacl::text='{postgres=X/postgres,authenticated=X/postgres}'
        AND md5(pg_get_functiondef(p.oid))=h)
       OR NOT has_function_privilege('authenticated',s,'EXECUTE')
       OR has_function_privilege('anon',s,'EXECUTE')
       OR has_function_privilege('service_role',s,'EXECUTE') THEN
      RAISE EXCEPTION 'HARDENING_GATE_BASE_MISMATCH: %',s;
    END IF;
  END LOOP;
  IF EXISTS(SELECT 1 FROM bt_commercial_private.consumption WHERE state='reserved' AND expires_at>now()) THEN
    RAISE EXCEPTION 'HARDENING_ACTIVE_RESERVATIONS';
  END IF;
END $gate$;
REVOKE EXECUTE ON FUNCTION public.bt_plan04_operations_status(uuid), public.bt_final_archive_document(uuid,uuid), public.bt_final_archive_source(uuid,uuid,uuid,uuid), public.bt_commercial_status(uuid) FROM authenticated;
DO $gate$
DECLARE s text;
BEGIN
  FOREACH s IN ARRAY ARRAY['public.bt_plan04_operations_status(uuid)','public.bt_final_archive_document(uuid,uuid)','public.bt_final_archive_source(uuid,uuid,uuid,uuid)','public.bt_commercial_status(uuid)'] LOOP
    IF NOT EXISTS(SELECT 1 FROM pg_proc p WHERE p.oid=to_regprocedure(s) AND p.proacl::text='{postgres=X/postgres}' AND pg_get_userbyid(p.proowner)='postgres')
       OR has_function_privilege('authenticated',s,'EXECUTE')
       OR has_function_privilege('anon',s,'EXECUTE')
       OR has_function_privilege('service_role',s,'EXECUTE') THEN
      RAISE EXCEPTION 'HARDENING_GATE_NOT_CLOSED: %',s;
    END IF;
  END LOOP;
END $gate$;
COMMIT;
```

## Workflow manual candidato — no activo

```yaml
name: ByteTorque HARDENING-01 - Edge manual
on:
  workflow_dispatch:
    inputs:
      fase:
        description: 'Verificar paquete sin desplegar, congelar o instalar tres servicios; Dirección Técnica verifica puertas SQL'
        required: true
        type: choice
        options:
          - verify
          - freeze
          - ready
      confirmacion:
        description: 'VERIFY_PACKAGE_ONLY, HARDENING_FREEZE_GATE_VERIFIED o HARDENING_READY_GATE_VERIFIED según fase'
        required: true
        type: string
permissions:
  contents: read
concurrency:
  group: bytetorque-commercial-edge-release
  cancel-in-progress: false
jobs:
  release:
    if: ${{ github.ref == 'refs/heads/main' && ((inputs.fase == 'verify' && inputs.confirmacion == 'VERIFY_PACKAGE_ONLY') || (inputs.fase == 'freeze' && inputs.confirmacion == 'HARDENING_FREEZE_GATE_VERIFIED') || (inputs.fase == 'ready' && inputs.confirmacion == 'HARDENING_READY_GATE_VERIFIED')) }}
    runs-on: ubuntu-latest
    timeout-minutes: 20
    env:
      PROJECT_REF: suxcqqnmcjoezfxltoms
      APPROVED_SHA: 5375a3ea0cbb62ceaf3ceca4ad61d756b63b08ae
      PACKAGE: /tmp/bt-commercial-release-${{ github.run_id }}-${{ github.run_attempt }}
    steps:
      - uses: actions/checkout@v4
        with:
          ref: 5375a3ea0cbb62ceaf3ceca4ad61d756b63b08ae
          persist-credentials: false
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: npm
      - name: Verify pinned sources and reproduce reviewed packages offline
        shell: bash
        run: |
          set -euo pipefail
          [[ "$(git rev-parse HEAD)" == "$APPROVED_SHA" ]]
          docker info >/dev/null
          npm ci --no-audit --no-fund
          git diff --exit-code
          node scripts/package-commercial-handlers.mjs "$PACKAGE"
          node --input-type=module <<'JS'
          import assert from 'node:assert/strict'
          import {readFile} from 'node:fs/promises'
          import {createHash} from 'node:crypto'
          import {join} from 'node:path'
          const expected = {"scope":"OFFLINE_REVIEW_ONLY","network":false,"deployed":false,"services":["bt-cp05-documents","bt-final-archive","bt-commercial-documents"],"sourceHashes":{"scripts/package-commercial-handlers.mjs":"dd997ba5899b00682941fa84adec41ad7629ab784c575f886b999057db2ed81b","scripts/package-cp05-edge.mjs":"7dd2b4e009516afe647bce247692974d4e8576d129d778be2a593010c2b5bbc1","scripts/package-final-archive.mjs":"f8f84f65ec59b8513924f0dc5d833d318cbf40dfba7866c6add64c59a312bf5f","scripts/package-commercial-edge.mjs":"7aeb8a9dbcc6d3075aa24e523eaa191b501eeb9ad29a60bfcdc6cb2f9da009f5","server/cp05/edgeEntryCandidate.ts":"525810316795e16b7674c24f8242cf8417f84a3254597184fae4c25b1cd77f51","server/com/finalArchiveEntry.ts":"30df97fa17e8274455fa118e654c1795b77c5f40c6e60975d76c813149edab28","server/commercial/edgeEntryCandidate.ts":"1c3d67a749857c2d26b5fee5edf33f10c41f133c78cd7afdfcfd293ef82f9344","server/com/finalArchiveHandler.ts":"3f73b2991184c4f64565c67f1c0cf830a98fc756712972552f9bc1dc1f52b7ff","server/commercial/meteredDocument.ts":"53358e68d4c9c275bfbc64c5e72fcd2ec8d2ff188ceb47f608b81f635bce858a","package-lock.json":"965d0a42874b3ebf6d9bc21f3a8413ed855b9c94f91cefc768b262c5f2692230"},"files":{"freeze/supabase/config.toml":"c2bfa857ef6aa9e9b09f1e681b9ef08557cd2ae71714c69d04019dc41ae660c1","freeze/supabase/functions/bt-commercial-documents/index.js":"0fbc0aae7f6e2ea1a5d37399ff5f650cdf263a9729831bd42ef6e90a8fec2f4a","freeze/supabase/functions/bt-cp05-documents/index.js":"0fbc0aae7f6e2ea1a5d37399ff5f650cdf263a9729831bd42ef6e90a8fec2f4a","freeze/supabase/functions/bt-final-archive/index.js":"0fbc0aae7f6e2ea1a5d37399ff5f650cdf263a9729831bd42ef6e90a8fec2f4a","parts/bt-commercial-documents/MANIFEST.json":"acff89d80204887441d776ac3c14ba7ff917eed446bd6f09250292a227f7d29b","parts/bt-commercial-documents/supabase/config.toml":"9f8816607b411c1d0747d78609187c93a5f134dc9e4a89ff3a97e85eea4ef5b3","parts/bt-commercial-documents/supabase/functions/bt-commercial-documents/assets/DejaVuSans.ttf":"57f73e11f51999432bf7ab22ce55b6f945d5eca1bf824404cfa9ec2e3718c84e","parts/bt-commercial-documents/supabase/functions/bt-commercial-documents/assets/FONT-LICENSE.txt":"e81d9dced49fea2a7d576cbea283873de58563c5d488f954deb282843c3ea79c","parts/bt-commercial-documents/supabase/functions/bt-commercial-documents/assets/icon-192.png":"1daa67c7edb94f093ca303461ef4274d00de386843116fc7d6262e85847b4e67","parts/bt-commercial-documents/supabase/functions/bt-commercial-documents/assets/logo-dark.png":"fe66f89b0799864fecfbc4939e896f9e41da85e414d1dc6bd2656fe5c3123e8d","parts/bt-commercial-documents/supabase/functions/bt-commercial-documents/assets/logo-light.png":"d47484d31979089e12019893fd1632eda980dbc7bddc100a9f40f1d6da3395f4","parts/bt-commercial-documents/supabase/functions/bt-commercial-documents/index.js":"d27c59eef93934f66c2f9b26ec02e19460f1cded25dbe00cf9dc38866c34d035","parts/bt-cp05-documents/offline-package-manifest.json":"1aca033c577e6f9e7830e79563a4148601f17bf0203648b98fa30b3a5f424353","parts/bt-cp05-documents/supabase/config.toml":"de2f646c1b0e30ca0e1ed61b3ebdeb8176d0d3639b3dfd8c04d968926dae3fa0","parts/bt-cp05-documents/supabase/functions/bt-cp05-documents/assets/DejaVuSans.ttf":"57f73e11f51999432bf7ab22ce55b6f945d5eca1bf824404cfa9ec2e3718c84e","parts/bt-cp05-documents/supabase/functions/bt-cp05-documents/assets/FONT-LICENSE.txt":"e81d9dced49fea2a7d576cbea283873de58563c5d488f954deb282843c3ea79c","parts/bt-cp05-documents/supabase/functions/bt-cp05-documents/assets/icon-192.png":"1daa67c7edb94f093ca303461ef4274d00de386843116fc7d6262e85847b4e67","parts/bt-cp05-documents/supabase/functions/bt-cp05-documents/index.js":"bd1fc06a5aa34d0157346e8bcf99a8ddfa0d3a5d213da790d14ad1483a8e2577","parts/bt-final-archive/offline-package-manifest.json":"99100ef9ae517a2099d5a3dde40f9449ac508b071f84753eeff2bc23f8d7726c","parts/bt-final-archive/supabase/config.toml":"b1a2c81ada3d941a118042e244c24df337855135bb040969d82613e85dfc3a28","parts/bt-final-archive/supabase/functions/bt-final-archive/assets/DejaVuSans-Bold.ttf":"a4c5bc453ca281d90ea079e596da7ae0dfeb5777497c29ec254e76d97ff6f890","parts/bt-final-archive/supabase/functions/bt-final-archive/assets/DejaVuSans.ttf":"57f73e11f51999432bf7ab22ce55b6f945d5eca1bf824404cfa9ec2e3718c84e","parts/bt-final-archive/supabase/functions/bt-final-archive/assets/FONT-LICENSE.txt":"e81d9dced49fea2a7d576cbea283873de58563c5d488f954deb282843c3ea79c","parts/bt-final-archive/supabase/functions/bt-final-archive/assets/icon-192.png":"1daa67c7edb94f093ca303461ef4274d00de386843116fc7d6262e85847b4e67","parts/bt-final-archive/supabase/functions/bt-final-archive/assets/wordmark.png":"aeb7f50302d6d641eeadca83373f103feaa177b557ee7680ec95030b2db37e34","parts/bt-final-archive/supabase/functions/bt-final-archive/index.js":"71e7d6ef3c742e95ed87f0b6720012332a337e854eccfadd5d994ad180ef2267","ready/supabase/config.toml":"6485bc3dc4bc0de18d389ec5624ea6f9213373a1875a87e6604544bd36d20ab5","ready/supabase/functions/bt-commercial-documents/assets/DejaVuSans.ttf":"57f73e11f51999432bf7ab22ce55b6f945d5eca1bf824404cfa9ec2e3718c84e","ready/supabase/functions/bt-commercial-documents/assets/FONT-LICENSE.txt":"e81d9dced49fea2a7d576cbea283873de58563c5d488f954deb282843c3ea79c","ready/supabase/functions/bt-commercial-documents/assets/icon-192.png":"1daa67c7edb94f093ca303461ef4274d00de386843116fc7d6262e85847b4e67","ready/supabase/functions/bt-commercial-documents/assets/logo-dark.png":"fe66f89b0799864fecfbc4939e896f9e41da85e414d1dc6bd2656fe5c3123e8d","ready/supabase/functions/bt-commercial-documents/assets/logo-light.png":"d47484d31979089e12019893fd1632eda980dbc7bddc100a9f40f1d6da3395f4","ready/supabase/functions/bt-commercial-documents/index.js":"d27c59eef93934f66c2f9b26ec02e19460f1cded25dbe00cf9dc38866c34d035","ready/supabase/functions/bt-cp05-documents/assets/DejaVuSans.ttf":"57f73e11f51999432bf7ab22ce55b6f945d5eca1bf824404cfa9ec2e3718c84e","ready/supabase/functions/bt-cp05-documents/assets/FONT-LICENSE.txt":"e81d9dced49fea2a7d576cbea283873de58563c5d488f954deb282843c3ea79c","ready/supabase/functions/bt-cp05-documents/assets/icon-192.png":"1daa67c7edb94f093ca303461ef4274d00de386843116fc7d6262e85847b4e67","ready/supabase/functions/bt-cp05-documents/index.js":"bd1fc06a5aa34d0157346e8bcf99a8ddfa0d3a5d213da790d14ad1483a8e2577","ready/supabase/functions/bt-final-archive/assets/DejaVuSans-Bold.ttf":"a4c5bc453ca281d90ea079e596da7ae0dfeb5777497c29ec254e76d97ff6f890","ready/supabase/functions/bt-final-archive/assets/DejaVuSans.ttf":"57f73e11f51999432bf7ab22ce55b6f945d5eca1bf824404cfa9ec2e3718c84e","ready/supabase/functions/bt-final-archive/assets/FONT-LICENSE.txt":"e81d9dced49fea2a7d576cbea283873de58563c5d488f954deb282843c3ea79c","ready/supabase/functions/bt-final-archive/assets/icon-192.png":"1daa67c7edb94f093ca303461ef4274d00de386843116fc7d6262e85847b4e67","ready/supabase/functions/bt-final-archive/assets/wordmark.png":"aeb7f50302d6d641eeadca83373f103feaa177b557ee7680ec95030b2db37e34","ready/supabase/functions/bt-final-archive/index.js":"71e7d6ef3c742e95ed87f0b6720012332a337e854eccfadd5d994ad180ef2267"},"runtime":"Deno/Supabase Edge, pinned npm imports, JWT verification true","activation":"Freeze and drain ALL old egress before SQL and ready packages. Provider cross-service atomicity is NOT assumed. See candidate checkpoint."}
          const actual = JSON.parse(await readFile(join(process.env.PACKAGE,'release-manifest.json'),'utf8'))
          assert.deepEqual(actual,expected,'REVIEW_MANIFEST_MISMATCH')
          const sha = bytes => createHash('sha256').update(bytes).digest('hex')
          for (const [p,h] of Object.entries(expected.sourceHashes)) assert.equal(sha(await readFile(p)),h,p)
          for (const [p,h] of Object.entries(expected.files)) assert.equal(sha(await readFile(join(process.env.PACKAGE,p))),h,p)
          console.log('BT_COMMERCIAL_RELEASE_PACKAGE: 43/43 exact reviewed hashes PASS')
          JS
      - name: Preserve verified manifest (all phases)
        uses: actions/upload-artifact@v4
        with:
          name: hardening-reviewed-release-manifest
          path: ${{ env.PACKAGE }}/release-manifest.json
      - uses: supabase/setup-cli@v3
        if: inputs.fase != 'verify'
        with:
          version: v2.stable
      - name: Deploy only the three selected Edge packages
        if: inputs.fase != 'verify'
        shell: bash
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          PHASE: ${{ inputs.fase }}
        run: |
          set -euo pipefail
          [[ -n "${SUPABASE_ACCESS_TOKEN:-}" ]]
          [[ "$PHASE" == freeze || "$PHASE" == ready ]]
          supabase --version
          supabase functions deploy --help >/dev/null
          cd "$PACKAGE/$PHASE"
          for service in bt-cp05-documents bt-final-archive bt-commercial-documents; do
            supabase functions deploy "$service" --project-ref "$PROJECT_REF"
            echo "BT_COMMERCIAL_EDGE_DEPLOYED: $PHASE $service"
          done
          supabase functions list --project-ref "$PROJECT_REF"
          echo "BT_COMMERCIAL_EDGE_PHASE_DEPLOYED: $PHASE; authorization gate remains closed until independent verification"

```

## Criterio de interrupción

Cualquier discrepancia de SHA, manifiesto, ACL, versiones, inventario, reservas, credenciales, convergencia o autorización: detener avance y reconciliar. Si ya se cerró GATE4, no reabrir automáticamente. La preparación no valida sintaxis/ejecución SQL en producción ni despliega; la fase verify es exclusivamente offline respecto de Supabase. No Codex adicional.
