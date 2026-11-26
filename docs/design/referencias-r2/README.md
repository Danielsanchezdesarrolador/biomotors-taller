# Biblioteca visual oficial ByteTorque Premium R2

Antes de diseñar o modificar una interfaz, consultar el sistema visual, el catálogo de marca y las referencias gráficas. La referencia vigente es el producto R2 aprobado y sus componentes existentes.

## Documentos y componentes

- [Sistema visual R2](../../SISTEMA_VISUAL_OFICIAL_R2.md), identidad aprobada, composición y homologación.
- [Catálogo de marca](../../../assets/brand/README.md), originales, derivados y contexto claro/oscuro.
- [Tokens y composición premium](../../../src/premium.css), fuente de las variables CSS.
- [Estilos base](../../../src/styles.css), controles, tarjetas y estructura.
- [AppShell](../../../src/layout/AppShell.tsx), sidebar, navegación móvil, topbar y logotipo.
- [Inicio y módulos oficiales](../../../src/official/OfficialPanels.tsx), welcome-area, métricas, jerarquía y tarjetas.
- [Agenda](../../../src/agenda/AgendaPanel.tsx) y [estilos](../../../src/agenda/agenda.css), hero, tarjetas y controles.
- [CP04](../../../src/ordenes/Cp04OrdersView.tsx) y [estilos](../../../src/ordenes/cp04.css), densidad operativa, estados y recepción.
- [CP05](../../../src/cp05/QuotePanel.tsx) y [estilos](../../../src/cp05/cp05.css), editor profesional y presupuesto.

## Tokens existentes

| Variable | Valor | Aplicación |
|---|---|---|
| --bt-navy | #061c39 | Navegación |
| --bt-deep | #06172e | Profundidad |
| --bt-blue | #0469f6 | Acción principal |
| --bt-sky | #099bff | Acentos |
| --bt-text | #091a3c | Texto principal |
| --bt-muted | #536e93 | Texto secundario |
| --bt-border | #d7e3f7 | Bordes |
| --bt-shadow | Definido en premium.css | Elevación de tarjetas |

Usar las variables de premium.css en los componentes nuevos. Los originales de marca conservan sus dimensiones, proporciones, colores y transparencia.

## Recursos aprobados y referencias gráficas

- [Imagen oficial del taller](../../../public/hero-workshop.webp), encabezados claros con el tratamiento existente.
- [Marca horizontal para claro](../../../public/brand/logo-horizontal.webp) y [marca para navy](../../../public/brand/logo-horizontal-dark.webp).
- [Icono web](../../../public/brand/icon.webp).
- [Original horizontal](../../../assets/brand/originals/bytetorque_logo_horizontal_oficial_original.png) e [icono original](../../../assets/brand/originals/bytetorque_icono_oficial_original.png).
- [Inicio aprobado de BT-BRAND-01](../../screenshots/BT_BRAND_01/BT_BRAND_01_INICIO_1650.png), composición histórica. Para la integración oscura, usar BT-BRAND-02 vigente.
- [Sidebar BT-BRAND-02 escritorio](../../screenshots/BT_BRAND_02/after/BT_BRAND_02_SIDEBAR_1650.png) y [móvil](../../screenshots/BT_BRAND_02/after/BT_BRAND_02_SIDEBAR_390.png).
- [Acceso móvil BT-BRAND-02](../../screenshots/BT_BRAND_02/after/BT_BRAND_02_ADMIN_390.png).
- [Cotización CP05 a 1440](../../screenshots/CP05_20261116/cotizacion-1440.png), referencia del editor existente.

## Referencias aportadas por el propietario el 25/11/2026

La conversación del refinamiento visual incluye siete capturas oficiales de Inicio, Agenda, Órdenes de trabajo, Clientes y vehículos, Cotizaciones, Configuración e Inicio de sesión. La procedencia sintética fue comunicada; la anonimización individual de las siete capturas no fue certificada. No incorporarlas a un repositorio público sin verificación de privacidad. Se consultaron visualmente como referencia del producto. Los adjuntos disponibles como archivos en este workspace contienen el encargo de texto. Las siete imágenes de la conversación se registran aquí por su procedencia y no se duplican como archivos originales de captura.

Las capturas finales del refinamiento usan exclusivamente fixtures sintéticos. Los recursos de marca y del taller se reutilizan desde sus rutas versionadas.

## Criterios de continuidad

Tarjetas blancas compactas, sombra suave, bordes R2, iconos lineales de lucide-react, acciones primarias azules y secundarias claras. Los inputs conservan etiquetas, foco visible y superficies claras. Las confirmaciones humanas tienen casilla de 20 px y etiqueta táctil de al menos 44 px. El pie de acciones de Continuidad ocupa espacio en el documento para permitir acceder al contenido completo en móvil.

La homologación visual de Continuidad no autoriza modificar las pantallas oficiales utilizadas como referencia.
