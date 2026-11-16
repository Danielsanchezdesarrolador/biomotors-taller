# ByteTorque — BT-LEGAL-01 · Páginas legales públicas

Fecha: 16/11/2026 (Chile). Base: `bb04c582ea66cc46a55e22417497c77adc581cb4`.
Rama única: `main`. Publicación y despliegue del mismo sitio autorizados por el propietario.

## Implementación

- `/privacidad` y `/terminos` son documentos HTML estáticos (`public/privacidad.html`
  y `public/terminos.html`), copiados a `dist` por Vite y servidos mediante las URL
  limpias del sitio estático. No montan React, Supabase ni guardas de autenticación;
  también se leen sin JavaScript. No se cambian reglas de Render ni URLs OAuth.
- Diseño con marca oficial, navy/azul, fondo claro, índice por anclas, enlace al
  inicio, navegación entre documentos, salto al contenido, foco visible y vista
  móvil. Estilos propios en `public/legal.css`, sin recursos de terceros.
- Enlaces discretos en acceso y registro, en otra pestaña para conservar el
  formulario. El diálogo legal previo remite a los borradores. No cambian la
  validación, aceptación, envío, callbacks ni los flags de autenticación.
- Ambos documentos están marcados como **borrador sujeto a revisión legal y
  aprobación del propietario**, fechados y con campos pendientes visibles.
  `noindex,follow` evita promover como definitivo el borrador a buscadores; no
  impide la lectura pública ni equivale a aprobación de Google OAuth.

## Criterios de redacción

La política cubre cuentas, talleres, clientes, vehículos, trabajadores, órdenes,
finalidades, responsabilidades, proveedores, seguridad, derechos, conservación y
contacto. Distingue controles de acceso habilitados de funciones en preparación.
No declara respaldo ejecutado ni recuperable: el flujo cifrado sigue preparado.

Los términos describen cuentas y permisos, Básico/Plus/Full previstos, límites
aprobados de Básico sin precios ni prestaciones pagadas definitivas, uso permitido,
disponibilidad, suscripciones/cancelación previstas y ley chilena. Los umbrales de
inactividad de 30 días/un año son propuestas no operativas; se proponen avisos,
reactivación/exportación y recuperación antes de cualquier borrado irreversible.

Fuentes para la transición normativa: [Ley N.º 19.628](https://www.bcn.cl/leychile/navegar?idNorma=141599)
y [Ley N.º 21.719](https://www.bcn.cl/leychile/navegar?idNorma=1209272), BCN. Se verificó
su entrada en vigencia de 1 de diciembre de 2026; no se presume cumplimiento por
publicar este texto. La revisión jurídica debe considerar ese cambio.

## Validación

- Build web/PWA y TypeScript: PASS; comprobaciones existentes de assets oficiales,
  bundle público sin fixtures y marca oscura: PASS.
- Suite existente: **587/587 pruebas, 64 archivos: PASS**. El primer intento local
  detectó dependencias incompletas; se reinstalaron con `npm ci` desde el lockfile,
  sin modificar dependencias ni el lockfile, antes de la validación satisfactoria.
- Chromium sobre build de producción: ambas rutas directas y recarga a 1440,
  390 y 375 px, sin JavaScript/autenticación, sin desbordamiento horizontal;
  salto por teclado, anclas, landmark principal, título único y logo: PASS.
- Enlaces en acceso y registro: abren el documento y conservan la ruta/formulario
  de origen, sin errores de JavaScript: PASS.
- Script repetible: `scripts/verify-legal-ui.cjs`. `BASE_URL`, `OUTPUT_DIR` y
  `CHECK_ACCESS=false` permiten verificar el sitio publicado sin datos privados.
- Revisión visual de capturas de escritorio/móvil: identidad y legibilidad
  conservadas. No equivale a prueba física de Safari/iPhone o Android.

El propietario autorizó dejar pendiente la verificación directa de
`https://bytetorque.cl`: el proxy Cloud devuelve CONNECT 403 al dominio, que no
está permitido en esta instancia. Comprobar el despliegue por el host existente
`biomotors-taller-demo.onrender.com`; reportar el resultado final y SHA en la
entrega, diferenciando build local, CI, deploy LIVE y dominio oficial pendiente.

## Aprobaciones legales pendientes

1. Identidad del proveedor/responsable, razón social o nombre, RUT y domicilio.
2. Correo/canal efectivo de privacidad, soporte y reclamos; procedimientos y plazos.
3. Roles jurídicos del operador/taller, fundamento del tratamiento y avisos a
   clientes/trabajadores; acuerdos con proveedores, regiones y transferencias.
4. Retención por categoría, cierre/inactividad, avisos y recuperación, alcance de
   eliminación y conservación en respaldos. Ningún borrado se habilita aquí.
5. Condiciones finales de planes, precios, moneda/impuestos, disponibilidad,
   soporte, contratación, renovación, cancelación y reembolsos antes de cobrar.
6. Revisión legal y aprobación del propietario, adecuación a la reforma de datos y
   requisitos de Google antes de presentar estos borradores como política definitiva.

Sin cambios en base de datos, Auth/RLS, SQL, secretos, pagos, respaldos, OAuth,
CP05/CP06 ni Android. Se conserva el sitio/servicio existente y el repositorio privado.
