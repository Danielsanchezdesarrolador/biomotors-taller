# ByteTorque — Sistema visual oficial PREMIUM R2

**Estado:** APROBADO por el Director el **11/11/2026** después de revisar el Inicio BT-UI-02-R2.  
**Alcance:** todos los módulos web y PWA iPhone; se adaptará posteriormente a Android React Native + Expo manteniendo la misma identidad visual.  
**Fuente de verdad visual:** implementación R2 en `main`, especialmente `src/premium.css`, `src/App.tsx`, `public/hero-workshop.webp` y `src/styles.css`. La imagen premium de referencia aportada por el Director y la pantalla R2 aprobada se usan para comparación. No rediseñar desde cero.

## Marca gráfica definitiva BT-BRAND-01 — aprobación 14/11/2026

Los dos PNG aportados por el Director son la fuente definitiva: `assets/brand/originals/bytetorque_icono_oficial_original.png` y `bytetorque_logo_horizontal_oficial_original.png`. Reemplazan los logos provisionales, conservando R2. No modificar colores, proporciones, transparencia interior ni formas; los originales permanecen byte a byte. Horizontal sobre superficie clara mediante `BrandLogo`; icono para tamaños pequeños, PWA y recursos Expo. No duplicar el nombre/subtítulo que ya contiene el horizontal. Los iconos funcionales Wrench de herramientas/OT se conservan; no son la marca.

Derivados y proveniencia: [catálogo de assets](../assets/brand/README.md). Los documentos pertenecen comercialmente al taller, con su propio nombre/logo; ByteTorque se identifica mediante atribución pequeña del software. BIOMOTORS es un futuro piloto, no una identidad por defecto. [Checkpoint y evidencia](checkpoints/CHECKPOINT_BT_BRAND_01_20261114.md).

## Decisión irreversible sin nueva autorización

**R2 es la referencia estética oficial y obligatoria.** Cada panel deberá sentirse parte del MISMO PRODUCTO: no crear otra paleta, encabezado, sidebar, tipografía, iconos, ritmo espacial, sombras o radios. No alterar el diseño de Inicio ya aprobado al implementar nuevas secciones. Si un nuevo componente necesita un patrón, extender el sistema existente mediante un componente reusable; no introducir un segundo diseño paralelo.

## Tokens existentes observados en `src/premium.css`

| Variable | Valor | Uso |
|---|---|---|
| `--bt-navy` | `#061c39` | Navegación navy |
| `--bt-deep` | `#06172e` | Azul de profundidad |
| `--bt-blue` | `#0469f6` | Acción primaria |
| `--bt-sky` | `#099bff` | Acento secundario |
| `--bt-text` | `#091a3c` | Texto prioritario |
| `--bt-muted` | `#536e93` | Texto secundario |
| `--bt-border` | `#d7e3f7` | Bordes |
| `--bt-shadow` | `0 8px 26px rgba(22, 69, 137, .095)` | Elevación de tarjetas |

No tomar estos tokens como excusa para rediseñar componentes existentes. Reutilizar las reglas y variables reales; donde estén hardcodeados valores aprobados, preservar su apariencia.

## Componentes y distribución que deben permanecer constantes

1. **Sidebar escritorio:** ancho R2 aproximado de **272 px**, fondo navy con ondas/degradados, logotipo horizontal oficial ByteTorque con su subtítulo incluido, sobre soporte claro compacto, título «MENÚ PRINCIPAL», cinco opciones y selección azul brillante. Panel inferior del taller de demostración. Mantener sidebar en todas las secciones de escritorio y navegación móvil coherente.
2. **Topbar:** alto R2 aproximado **78 px**, buscador claro con atajo real Ctrl/Cmd+K, campana y perfil ficticio. Mantener mismos tamaños, alineación y comportamiento.
3. **Canvas:** fondo hielo azul/gris muy claro, tarjetas blancas con borde sutil y sombras calibradas, radios aprobados (tarjetas principales cerca de 17 px), separación y densidad coherentes con el Inicio.
4. **Jerarquía:** Inter/sistema compatible con títulos claros, métricas destacadas, subtítulos de apoyo y texto legible. Iconografía de línea coherente con la de Inicio; estados mediante etiquetas suaves y unívocas.
5. **Estados de OT:** diagnóstico azul, servicio amarillo/ámbar, espera de repuestos violeta y listo para entrega verde. No asignar colores contradictorios entre paneles.
6. **Contenido funcional:** botones y tarjetas deben comunicar acciones reales o claramente DEMO. Mantener avisos discretos de datos ficticios; nunca insinuar que una OT, documento o email quedó guardado/enviado si no existe backend.
7. **Responsive:** no replicar el layout de escritorio a escala; usar tarjetas y listados adaptables con navegación táctil iPhone PWA, objetivos táctiles cómodos, accesibilidad, sin scroll horizontal y sin truncar información crítica.

## Regla de homologación para los cinco paneles

| Panel | Estado | Directriz |
|---|---|---|
| Inicio | **R2 OFICIAL, APROBADO** | Referencia inalterable y patrón visual |
| Órdenes de trabajo | **BT-UI-03 PRÓXIMO** | Primera extensión del lenguaje R2 |
| Clientes y vehículos | Pendiente | Misma identidad, incluyendo registro con enlace |
| Informes y cotizaciones | Pendiente | Misma identidad; PDF y envío cuando haya backend seguro |
| Configuración | Pendiente | Misma identidad; simplificada para el mecánico |

El menú principal sigue teniendo **cinco** secciones. Citas, inventario, facturación y reportes avanzados quedan en el roadmap, no aparecen como secciones principales sin aprobación.

## Flujo de diseño obligatorio

1. Revisar R2, tokens, componentes y el mockup premium del Director antes de diseñar.
2. Elaborar el diseño del siguiente panel en versión **escritorio y móvil**, incluyendo estados vacíos, carga, error, confirmaciones y controles táctiles.
3. Implementar únicamente la sección autorizada en la web React/Vite del repositorio existente, sin modificar el Inicio aprobado ni duplicar el menú global.
4. Verificar captura 1650/1440/390/375 px y contraste visual con Inicio R2 lado a lado, además de TypeScript, pruebas, build y Render.
5. Presentar evidencia, diferencias y pedir aprobación del Director. **Solo aprobar el nuevo panel por separado**, no rediseñar los anteriores.
6. Conservar la app Android nativa en `apps/android/`; adaptar el sistema visual R2 al final después de consolidar web/iOS PWA, sin WebView.

## Seguridad y trazabilidad

- `main` única rama autorizada, mismo Render y mismo Supabase independiente para el futuro SaaS.
- Mantener identificadores técnicos heredados `biomotors-taller`, marca comercial visible **ByteTorque**.
- No implementar persistencia real de clientes, correos, pagos, PDFs operativos, firmas ni accesos sin Auth y RLS con pruebas multiempresa.
- Cada tarea incluye checkpoint, commit, pruebas y evidencias separando **diseño visual aprobado**, **CI PASS**, **Render LIVE** y **APK real**.

**La aprobación R2 no valida todavía instalación en iPhone físico; esa prueba sigue pendiente.**
