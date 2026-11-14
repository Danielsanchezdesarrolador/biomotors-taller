# CHECKPOINT — BT-BRAND-02 — 14/11/2026

## Recuperación y resultado

**Logotipo integrado directamente sobre navy, sin soporte blanco.** Se continuó el trabajo interrumpido conservando sus archivos, variantes, pruebas y capturas previas. No se reconstruyeron componentes ni se descartó trabajo. Base local/remota comprobada: `1b3978e2b04f2f4e9f23d51a2713ec8e3c330837`, tras incorporar su auditoría documental por fast-forward. Sin cambios concurrentes observados; `main` únicamente, Render existente. No se utilizaron reset destructivo ni clean.

Las dos capturas del Director permanecieron disponibles: menú móvil con logo sobre navy y acceso móvil con marca sobre el encabezado de taller. Se leyeron las órdenes BT-BRAND-02 y reanudación, AGENTS/README/roadmap, R2 y último checkpoint. La recuperación confirmó derivado ya preparado, 146 pruebas y build previos; todavía no había commits/publicación de BRAND-02.

## Derivado y conservación

- [PNG RGBA derivado](../../assets/brand/derived/bytetorque_logo_horizontal_fondo_oscuro.png), mismo canvas 1672 × 941 del original. Se aclaran **73.494 píxeles RGB navy** exclusivamente en las dos regiones originales de texto «Byte» y «Gestión de Talleres». No se dibujan letras nuevas, no se cambia geometría y no se usa inversión/filtro CSS.
- **Alfa completo idéntico**, símbolo/B/engranaje/llave/gradientes intactos píxel a píxel. Azul/cian y las zonas externas a los textos no cambian. El WebP de 1000 × 251 conserva los píxeles visibles del símbolo; el codec puede variar RGB de píxeles con alfa cero, sin efecto visible. [Metadatos/zonas/hashes](../../assets/brand/dark-variant.json).
- Original icono SHA-256: `1322fdbc00c4dccad0d7c7e8fe69a5a6533414236168165165390843d8c8f04c`.
- Original horizontal SHA-256: `fb8c59ec252194ef03240c0be53200d628cb0d416a7dc8e390ca0bf05560a693`.
- Los originales y **todos los recursos anteriores de BT-BRAND-01** —PNG PWA, favicon, maskable/adaptativo, iconos Expo, variante clara y demás derivados— mantienen sus SHA. [Verificación independiente de píxeles y archivos](../qa/BT_BRAND_02/preservation.json). Ni el manifiesto PWA, `id/start_url/scope`, favicon, generador original ni app.json cambian.

`scripts/prepare-dark-brand.py` reproduce el recolor localizado; `scripts/verify-dark-brand.py` verifica sin escribir archivos. Node valida procedencia/hashes y protegidos al terminar cada build, sin añadir dependencias de producción. El original sigue disponible en `surface="light"`; `surface="dark"` selecciona únicamente el nuevo derivado.

## Interfaz y archivos

- `src/brand/BrandLogo.tsx` y `brand.css`: selección de contexto y contenedor completamente transparente; cero padding/borde/radio/sombra, imagen sin filtro y `object-fit: contain`.
- `src/access/AccessScreens.tsx` y `src/layout/AppShell.tsx`: variante oscura en acceso y sidebar. Fotografía, degradados, formularios blancos, navegación, panel inferior del taller y estados permanecen.
- Se corrigió un desborde de marca detectado a **768 px** (216 px de logo frente a sidebar de 226 con márgenes): ancho flexible limitado al espacio del botón, sin cambiar el layout general. La prueba espera que termine la transición del menú antes de medir geometría; no se retiraron las validaciones de límites/alineación del cierre.
- Encabezado gráfico de `apps/android/App.tsx`: selecciona PNG oscuro adicional y fondo transparente; mismas dimensiones/funciones. Launcher/adaptativo/splash/configuración y assets anteriores intactos. Sin adaptación funcional ni APK.
- `src/brand/darkBrand.test.tsx`, verificadores y workflow existente: selección dark/light, ambas entradas, barra compartida, responsive sin placa y conservación de recursos. El test anterior de superficie clara se mantiene con descripción acorde al nuevo contrato; no se elimina ninguna prueba.
- AGENTS, README, sistema visual R2, catálogo de marca y documentación Android actualizan las reglas de contexto. La corrección del Director sustituye el soporte blanco de BRAND-01; su checkpoint queda como antecedente histórico.

**Sin cambios** en documentos/A4, identidad comercial del taller, motores A–E, precios, aprobaciones por revisión, Supabase/Auth/RLS, BT-CP02-D, pagos, suscripciones ni backend. La aplicación continúa en revisión de solo lectura, sin autenticación real ni operaciones con datos reales.

## Verificaciones repetidas y completadas

- **TypeScript PASS; 146/146 Vitest PASS**, 21 archivos. Se preservan las 141 anteriores más los cinco casos de BRAND-02 encontrados en el trabajo recuperado; no hay reducción frente a la ejecución interrumpida. [Tipos](../qa/BT_BRAND_02/types.txt) · [Vitest](../qa/BT_BRAND_02/tests.txt).
- **Build/Vite/PWA PASS**, exclusión de fixtures/credencial QA del bundle público PASS, generador y verificador dark/protegidos PASS. [Build](../qa/BT_BRAND_02/build.txt).
- **1650/1440/768/390/375 PASS:** ocho rutas de acceso (dos roles y siete pantallas), sidebar, alfa visual, cero fondo/borde/sombra/padding/filtro, proporción natural, cierre alineado, ausencia de recorte y scroll horizontal. [Responsive](../qa/BT_BRAND_02/responsive-five-sizes.json).
- Acceso completo, historial/recarga, estados/credencial privada y cinco paneles R2 pasan en los mismos cinco tamaños: campos públicos bloqueados, cero escrituras de red, errores JS y almacenamiento persistente. [Acceso](../qa/BT_BRAND_02/access-five-sizes.json) · [Paneles](../qa/BT_BRAND_02/panels-five-sizes.json).
- **A4 PASS**, seis PDFs repetidos a 1650/390/375: cuatro trabajos = una página; contenido largo = dos páginas con texto; ninguna página vacía. Se conserva la exclusión de no realizados y no se modificó código de documentos. [Análisis pdfinfo/pdftotext](../qa/BT_BRAND_02/a4.json).
- Android TypeScript/configuración/recursos y export del bundle Expo PASS, con PNG oscuro del header; sin APK. [Tipos](../qa/BT_BRAND_02/android-types.txt) · [Config](../qa/BT_BRAND_02/android-config.txt) · [Export](../qa/BT_BRAND_02/expo.txt) · [Metadatos](../qa/BT_BRAND_02/expo-metadata.json).

## Antes y después

El **antes** se capturó en Render con BRAND-01 aún publicado; el después usa el build verificado de BRAND-02. Son capturas de navegador, sin recreación de los mockups.

| Vista | Antes | Después |
| --- | --- | --- |
| Acceso escritorio | [1650](../screenshots/BT_BRAND_02/before/LOGIN_1650.png) | [1650](../screenshots/BT_BRAND_02/after/BT_BRAND_02_ADMIN_1650.png) |
| Acceso Administrador móvil | [390](../screenshots/BT_BRAND_02/before/LOGIN_390.png) | [390](../screenshots/BT_BRAND_02/after/BT_BRAND_02_ADMIN_390.png) |
| Acceso Mecánico móvil | Mismo soporte de BRAND-01 | [390](../screenshots/BT_BRAND_02/after/BT_BRAND_02_MECANICO_390.png) |
| Sidebar escritorio | [1650](../screenshots/BT_BRAND_02/before/SIDEBAR_1650.png) | [1650](../screenshots/BT_BRAND_02/after/BT_BRAND_02_SIDEBAR_1650.png) |
| Menú móvil abierto | [390](../screenshots/BT_BRAND_02/before/SIDEBAR_390.png) | [390](../screenshots/BT_BRAND_02/after/BT_BRAND_02_SIDEBAR_390.png) |

[Variante transparente sobre navy y original sobre claro](../screenshots/BT_BRAND_02/after/BT_BRAND_02_SUPERFICIES.png).

## Commits y publicación

- `2a945d5`: variante de texto claro, procedencia y verificación de píxeles/protegidos.
- `89c6355`: integración transparente, ajuste de ancho en tablet y pruebas.
- Documentación/evidencias: commit que incorpora este checkpoint y el roadmap.

**Publicado en el Render existente**, frontend `89c6355`, sin otra rama ni servicio. HTML, JS/CSS, variante oscura, variante clara, símbolo y recursos protegidos PWA/favicon/SW se compararon byte a byte con `dist`, solicitando la representación PNG original para evitar la negociación WebP del CDN. [Recursos/hashes servidos](../qa/BT_BRAND_02/render-resources.json).

**Recorrido publicado 1650/390 PASS**, ambas entradas y siete pantallas, menú móvil/cierre y sidebar, sin soporte blanco ni recorte, con proporción correcta y cero escrituras/errores/almacenamiento. [JSON Render](../qa/BT_BRAND_02/render-responsive.json). Las capturas después enlazadas arriba provienen de Render. El navegador del entorno tolera el certificado de su proxy exclusivamente en la prueba; la comparación de archivos valida TLS normalmente.

La consulta de GitHub Actions devuelve Forbidden en este entorno. No se afirma SUCCESS remoto de BRAND-02; sus comprobaciones se incorporan al workflow existente. Los SUCCESS anteriores de BRAND-01 documentados en `1b3978e` permanecen preservados y no se confunden con esta entrega.

**Pendientes:** revisión visual del Director y comprobación física Safari/iPhone/Chrome Android. Las capturas Chromium no equivalen a uso físico ni APK. No se inicia BT-CP02-D, BT-AUTH-01B ni etapas posteriores.

 
## Auditoría independiente posterior (ChatGPT, 14/11/2026)

- HEAD de `main`: `ee9fe83e50b1b999dd7adebc912ccd142c1eeb88`, sin PR abiertas.
- [Verificación ByteTorque 43630722991](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43630722991): **SUCCESS en HEAD final**. Web/iOS PWA y Android Expo PASS. Log remoto de Web: **146/146 Vitest en 21 archivos** y verificaciones de original, alfa, PWA y variante oscura PASS.
- [Interfaz pública 43630723011](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43630723011): **SUCCESS en HEAD final**.
- Se inspeccionaron las capturas `BT_BRAND_02_ADMIN_390.png`, `BT_BRAND_02_SIDEBAR_390.png`, `BT_BRAND_02_ADMIN_1650.png`, `BT_BRAND_02_SUPERFICIES.png`. Los logos se integran sobre navy con tipografía clara, sin placa blanca ni recorte aparente y con contraste correcto. **Revisión visual preliminar satisfactoria; la aprobación final sigue siendo del Director y falta prueba física de Android/Safari.**
- **Hallazgo CI externo acotado, pendiente de repetir:** [BT-FLOW-01 43630084997](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43630084997) falló sobre commit anterior `89c6355` en `scripts/verify-qa02-ui.cjs:220`: tras abrir «Opciones de visita», pulsar Escape dejó `aria-expanded='true'` cuando se esperaba `false`. Los pasos previos del flujo 1650/1440/768/390/375 y FLOW-01D pasaron. Este fallo NO se encuentra en los dos workflows generales SUCCESS del commit final y tampoco se ha repetido aún sobre `ee9fe83`. No confundirlo con un defecto visual de BRAND-02 confirmado; abrir investigación separada antes de dar por completamente resueltas todas las regresiones interactivas.
- Esta verificación fue solo documental y de capturas/versionado: no cambia frontend ni Supabase.
