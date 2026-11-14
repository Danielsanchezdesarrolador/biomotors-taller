# ByteTorque — BT-BRAND-01 (14/11/2026)

Los dos PNG de `originals/` son los recursos definitivos aprobados por el Director. Se copiaron directamente del ZIP, sin volver a guardar ni modificar sus bytes. Ambos son RGBA con transparencia completa y parcial. Los hashes, dimensiones y conteos de alfa están registrados en `manifest.json`.

- Icono original: SHA-256 `1322fdbc00c4dccad0d7c7e8fe69a5a6533414236168165165390843d8c8f04c`.
- Horizontal original: SHA-256 `fb8c59ec252194ef03240c0be53200d628cb0d416a7dc8e390ca0bf05560a693`.

## Derivados y reproducción

`scripts/prepare-brand-assets.py` prepara una vez los derivados con Pillow (herramienta de desarrollo; no dependencia de Vite/Expo ni requisito del build). Solo recorta márgenes exteriores prácticamente transparentes y redimensiona con Lanczos; todos los píxeles originales con alfa >16 están dentro del recorte. No altera colores ni alfa del arte interior antes del remuestreo. El WebP horizontal es lossless. Los originales permanecen intactos.

`generated/` contiene las salidas PNG aprobadas para PWA/favicon. Cada `npm run dev`/`npm run build` ejecuta **Node sin dependencias adicionales**: verifica los hashes de originales y de todos los derivados, y copia los PNG versionados a `public/`. Esas copias no se duplican en Git; se generan también en Render. No existe dibujo procedural, fallback provisional ni recuperación silenciosa del icono anterior. El generador prepara también un `/icon.svg` de compatibilidad: contiene el PNG oficial 512 íntegro incrustado, sin reinterpretarlo en vectores. Así los marcadores históricos no conservan una referencia a un logo provisional. El HTML/manifiesto nuevos usan PNG versionados y no descargan este alias. Si falta un recurso o cambia su hash, el build falla.

Los derivados web están en `public/brand/`. Los nativos están en `apps/android/assets/brand/`; el icono se reutiliza para splash, sin duplicar el PNG. El horizontal nativo usa soporte claro. El documento comercial mantiene el nombre/logo del taller; el icono de 48 px se reutiliza solo para la atribución pequeña del software, evitando incrustar imágenes grandes en A4.

El icono `any` conserva transparencia; Apple Touch usa fondo navy opaco, sin recortar el símbolo. Maskable/adaptativo usan padding conservador del 56 %: todo el cuadrado que contiene el arte queda dentro del círculo seguro central de radio 40 %. Así ninguna máscara estándar corta engranaje, llave o borde. No se recolorea el arte.

Los iconos nuevos usan `?v=bt-brand-01` en HTML/manifiesto. La revisión del service worker cambia para activar su ciclo existente de actualización; no se añaden caches ni almacenamiento de datos. `id`, `start_url`, `scope` y navegación se conservan. Los navegadores pueden mantener el icono del acceso instalado en su caché del sistema: actualizar/cerrar/reabrir primero; si no cambia, quitar y volver a añadir el acceso. No equivale a una APK Android.


## BT-BRAND-02 — variante para navy

`derived/bytetorque_logo_horizontal_fondo_oscuro.png` conserva el tamaño y alfa del original. `scripts/prepare-dark-brand.py` modifica exclusivamente los RGB navy de las dos regiones de texto registradas en `dark-variant.json` (73.494 píxeles); el símbolo completo y las zonas azul/cian se conservan. La imagen optimizada es `public/brand/logo-horizontal-dark.webp`, y el encabezado nativo usa un PNG oscuro adicional sin modificar los iconos nativos previos. `surface="dark"` selecciona este recurso, sin fondos, bordes, padding ni sombras. El recurso original sigue disponible en superficies claras.

`python scripts/verify-dark-brand.py` verifica sin escribir archivos: originales/protegidos por SHA, alfa completo, todos los píxeles del símbolo y RGB alterados solo dentro de los textos permitidos. En el WebP se comparan los píxeles visibles del símbolo; el RGB de píxeles totalmente transparentes puede optimizarse por el codec sin cambiar lo visible. `npm run build` añade validación Node de hashes/procedencia y recursos protegidos. Ni el manifiesto BT-BRAND-01 ni sus PNG se reemplazan por la variante oscura. [Checkpoint](../../docs/checkpoints/CHECKPOINT_BT_BRAND_02_20261114.md).
