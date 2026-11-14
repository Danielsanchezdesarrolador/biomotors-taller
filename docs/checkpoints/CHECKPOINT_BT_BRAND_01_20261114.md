# CHECKPOINT — BT-BRAND-01 — 14/11/2026

## Resultado y autorización

**Identidad gráfica oficial del Director integrada en ByteTorque.** Se recibieron los dos PNG definitivos en `ByteTorque_logos_oficiales_para_Codex.zip`; se conservaron sus bytes originales y se prepararon derivados para web, documentos, PWA y Expo. No se rediseñó el logotipo ni se cambió la identidad R2.

Base real consultada: `5373c0ded26fe027e25c4c8ccb0a7a2a731d7e67`, `main`; remoto revalidado antes de integrar/publicar, sin cambios concurrentes observados. Se leyeron AGENTS, README, roadmap, sistema visual R2 y checkpoint BT-AUTH-01A-R1. Se examinaron ambos PNG originales y la instrucción del ZIP. Solo `main`, mismo Render, sin servicios ni ramas adicionales.

**Sin cambios de Supabase/Auth/RLS, BT-CP02-D, onboarding, permisos reales, pagos, planes, correos ni datos reales.** El acceso sigue siendo revisión explícita sin autenticación; `/` abre `/#/acceso` y la interfaz pública vacía sigue en `/#/revision/publica`. La adaptación funcional Android no se inició y no se generó APK.

## Originales y transparencia

| Original definitivo | Tamaño / modo | Alfa cero | Alfa parcial |
| --- | --- | --- | --- |
| [Icono](../../assets/brand/originals/bytetorque_icono_oficial_original.png) | 1254 × 1254, RGBA | 401.591 píxeles | 1.168.648 píxeles |
| [Horizontal](../../assets/brand/originals/bytetorque_logo_horizontal_oficial_original.png) | 1672 × 941, RGBA | 1.301.785 píxeles | 268.109 píxeles |

Ambos tienen alfa mínimo 0 y máximo 255, sin perfiles ICC que requieran conversión. Hashes SHA-256 **idénticos al contenido original del ZIP**:

- Icono: `1322fdbc00c4dccad0d7c7e8fe69a5a6533414236168165165390843d8c8f04c`.
- Horizontal: `fb8c59ec252194ef03240c0be53200d628cb0d416a7dc8e390ca0bf05560a693`.

[Catálogo y metadatos](../../assets/brand/manifest.json) · [Reproducción y reglas](../../assets/brand/README.md). Los derivados solo recortan márgenes exteriores prácticamente transparentes y remuestrean con Lanczos; todos los píxeles del original con alfa >16 quedan dentro del recorte. Sin recolorear ni retocar el arte interior. WebP lossless para la web; PNG para iconos/documentos/recursos nativos. Los originales no se vuelven a guardar ni sobrescribir.

## Integración

- **Siete pantallas de acceso:** `src/brand/BrandLogo.tsx` sustituye la marca provisional, con horizontal sobre soporte blanco, proporción conservada, `object-fit: contain` y alt apropiado. Sin duplicar texto que ya está en el archivo. Administrador, Mecánico, registro, verificación y recuperación mantienen navegación y diseño R2.
- **Cinco paneles y navegación:** AppShell comparte horizontal oficial en sidebar y símbolo oficial en topbar móvil; menú móvil conserva su marca completa. El área técnica usa el símbolo oficial. Se retiró la llave que hacía de logo, conservando las llaves y demás iconos funcionales de OT, herramientas y estados.
- **Documentos:** cotización, informe de trabajo y multipunto conservan la cabecera y el logo del taller. Atribución pequeña «Software ByteTorque» con el icono oficial de 48 px, para no incrustar imágenes grandes en A4. La vista previa heredada ya no presenta ByteTorque como prestador por defecto: reutiliza la identidad de taller existente. Los logos propios configurados no se sustituyen; las pruebas comprueban un logo/nombre personalizado en ambos modos. BIOMOTORS sigue siendo un futuro piloto, sin asignación automática a otros talleres.
- **PNG/PWA:** iconos any 192/512 con transparencia, Apple Touch 180 con fondo opaco, favicon 32/48 y maskable 512 separado. La imagen completa del maskable/adaptativo queda dentro del círculo seguro de radio 40 % del canvas; padding conservador al 56 %, sin cortar engranaje, llave ni borde.
- **Generador:** Node valida SHA de los originales y todos los derivados versionados; copia las salidas PNG oficiales desde `assets/brand/generated/` en cada dev/build. No hay generador de dibujos provisional ni fallback. Las copias de `public/` son generadas e ignoradas por Git para no duplicar los binarios de origen. Los PNG canónicos sí están versionados. [Idempotencia](../qa/BT_BRAND_01/generator-idempotence.json).
- **Compatibilidad histórica:** Render conservaba el antiguo `/icon.svg` por su URL histórica aun después de retirarlo del HTML. El generador ahora escribe ese alias con el **PNG oficial 512 íntegro incrustado**, sin trazado vectorial, filtros ni figuras alternativas. El tamaño intrínseco se fija en 512 × 512; la comparación de renderizado en Chromium da **cero canales RGBA diferentes** respecto del PNG oficial. [Comparación de píxeles](../qa/BT_BRAND_01/legacy-svg-render.json). Las referencias actuales de HTML/manifiesto usan PNG con `?v=bt-brand-01`; no cargan ese alias.
- **Expo:** `apps/android/assets/brand/` contiene icono 1024, foreground adaptativo y horizontal PNG. `app.json` configura icono, adaptiveIcon y splash reutilizando el mismo icono. El encabezado nativo usa el horizontal sobre blanco y `resizeMode="contain"`. El resto del prototipo nativo permanece intacto. [Config exportada](../qa/BT_BRAND_01/expo-config.json).

## Actualización de la PWA

Se conservan `id: "/"`, `start_url: "/"`, scope, navegación R1 y display standalone. Las URLs de favicon/Apple/manifest-icons incorporan edición de marca; el service worker cambia de revisión y mantiene su ciclo existente `skipWaiting/clients.claim`. No se añade caché de APIs ni almacenamiento de información. Los navegadores recibirán la nueva identidad al actualizar los recursos; el icono de un acceso ya instalado depende también del caché del sistema operativo.

El CDN de recursos estáticos anuncia `s-maxage=300`: algunas variantes históricas pueden tardar hasta unos cinco minutos en renovar su copia; se comprobó su revalidación. Primero actualizar, cerrar y volver a abrir. Si el icono instalado no cambia, quitar y volver a añadir el acceso directo/PWA. No se afirma instalación física comprobada ni APK disponible. Safari/iPhone y Chrome Android físicos siguen pendientes para el Director; la limitación `kWebAppDisabled` del entorno ya consta en BT-AUTH-01A-R1.

## Pruebas y evidencias

- **TypeScript web PASS**, **141/141 Vitest PASS**, 20 archivos: las 135 anteriores preservadas y seis nuevas de marca, accesibilidad e identidad del taller. [Tipos](../qa/BT_BRAND_01/types.txt) · [Vitest](../qa/BT_BRAND_01/tests.txt).
- **Vite/build/PWA PASS**, exclusión de fixtures/credencial QA del grafo público PASS. El validador comprueba originales RGBA/hashes, PNG reales, tamaños, manifiesto, favicon/alias oficial y zona segura maskable/adaptativa. [Build](../qa/BT_BRAND_01/build.txt).
- **1650/1440/768/390/375 PASS:** siete pantallas de acceso, cinco paneles, revisión de marca sobre fondo claro, imagen cargada sin distorsión, sidebar y menú móvil sin recorte, cero scroll horizontal y controles públicos bloqueados. [Acceso](../qa/BT_BRAND_01/access-five-sizes.json) · [Paneles](../qa/BT_BRAND_01/panels-five-sizes.json) · [Marca/documentos](../qa/BT_BRAND_01/brand-five-sizes.json).
- **Regresiones BT-FLOW-01B/C/D/E, BT-COT-01, BT-INS-01 e Informes PASS** en cinco tamaños. IDs, revisión/aceptación, idempotencia y reglas de realizados conservados. [Logs](../qa/BT_BRAND_01/).
- **A4 PASS:** seis PDFs de regresión en 1650/390/375: breve de cuatro trabajos = una página; largo = dos páginas con contenido; ninguna página en blanco. Cuatro PDFs adicionales de cotización/informe a 1650/390 = una página cada uno. Solo el trabajo marcado expresamente como realizado aparece/suma en el informe, con los otros dos excluidos. Nombre del taller y atribución del software presentes. Los PNG de documentos abajo son rasterizados del PDF A4 real, para mostrar toda la página sin clipping del diálogo. [Análisis pdfinfo/pdftotext](../qa/BT_BRAND_01/a4-analysis.json).
- **Android TypeScript/configuración/recursos PASS**; export de bundle Expo Android PASS con el horizontal integrado, sin APK. [Tipos](../qa/BT_BRAND_01/android-types.txt) · [Config/recursos](../qa/BT_BRAND_01/android-config.txt) · [Export](../qa/BT_BRAND_01/expo-export.txt) · [Metadatos del bundle](../qa/BT_BRAND_01/expo-export-metadata.json). Se usaron cachés temporales y telemetría/red deshabilitadas para respetar el entorno restringido.
- **Sin escrituras reales de red, sesiones ni almacenamiento persistente de clientes** en los recorridos. Los documentos de captura usan únicamente fixtures del harness loopback, nunca registros públicos ni datos reales. Snapshots antiguos de multipunto sobrescritos por su script fueron restaurados, sin cambios ajenos a marca.

### Capturas

| Vista | Escritorio | Móvil |
| --- | --- | --- |
| Inicio de sesión | [1650](../screenshots/BT_BRAND_01/BT_BRAND_01_LOGIN_1650.png) | [390](../screenshots/BT_BRAND_01/BT_BRAND_01_LOGIN_390.png) |
| Panel principal | [1650](../screenshots/BT_BRAND_01/BT_BRAND_01_INICIO_1650.png) | [390](../screenshots/BT_BRAND_01/BT_BRAND_01_INICIO_390.png) |
| Navegación | Sidebar visible en el panel | [Menú abierto](../screenshots/BT_BRAND_01/BT_BRAND_01_NAVEGACION_390.png) |

[Iconos en fondos claro/oscuro y máscara circular](../screenshots/BT_BRAND_01/BT_BRAND_01_ICONOS.png) · [Cotización A4](../screenshots/BT_BRAND_01/BT_BRAND_01_DOCUMENTO_COTIZACION_1650.png) ([PDF](../screenshots/BT_BRAND_01/BT_BRAND_01_DOCUMENTO_COTIZACION_1650.pdf)) · [Informe A4](../screenshots/BT_BRAND_01/BT_BRAND_01_DOCUMENTO_INFORME_1650.png) ([PDF](../screenshots/BT_BRAND_01/BT_BRAND_01_DOCUMENTO_INFORME_1650.pdf)).

## Commits y publicación

1. `052b9c1`: originales, catálogo/derivados, PWA/favicon y recursos Expo.
2. `37fa4b8`: identidad de acceso/paneles/documentos, pruebas y CI de marca.
3. `095f02d`: compatibilidad del favicon histórico con el PNG oficial.
4. `9b87866`: tamaño intrínseco del alias y regresión de equivalencia RGBA con el PNG.
5. Documentación y evidencia: commit que incorpora este checkpoint, AGENTS, sistema visual R2, README y roadmap actualizados.

**Publicado en el Render existente desde `main`**, frontend `9b87866`. HTML, JavaScript, CSS, manifiesto, SW, logotipo horizontal, símbolo, todos los PNG/favicon y el SVG histórico se compararon byte a byte con `dist`, mediante HTTPS con validación TLS. [Hashes y bytes servidos](../qa/BT_BRAND_01/render-assets.json).

**Recorrido publicado 1650/390 PASS:** siete pantallas, cinco paneles, menú móvil, iconos/galería y comparación del SVG histórico con el PNG canónico. Cero escrituras, errores de JS ni almacenamiento persistente. [JSON Render](../qa/BT_BRAND_01/render-brand.json). Las capturas de acceso/panel/navegación/iconos enlazadas arriba provienen de Render; los documentos A4 del harness privado.

El CDN negocia WebP para algunas peticiones de imagen de Chrome. Las comparaciones de bytes usan la representación original; la comprobación de equivalencia de renderizado solicita explícitamente `Accept: image/png` para contrastar el PNG canónico con su alias. Así la prueba mide la fidelidad del recurso y no la recodificación de transporte del CDN. El navegador del entorno toleró el certificado de su proxy exclusivamente en la prueba; la comprobación HTTPS de archivos validó TLS normalmente.

GitHub Actions remoto de esta entrega no pudo consultarse: `gh run list` devuelve Forbidden en este entorno. No se afirma SUCCESS remoto; los resultados locales, bundle Expo y publicación sí están verificados. El workflow existente incorpora las nuevas comprobaciones y capturas de marca.

**Punto de parada:** revisión visual del Director. No iniciar Auth real, BT-CP02-D ni adaptación funcional Android.
