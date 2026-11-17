# BT-PLAN-04D — preparación de facturación, identidad y piloto

17/11/2026 · Continúa `8ec3237` (04B), `8d7586a` (04C) y `b5b30bb`
(correcciones de navegación/edición). Todos sobre main desde `73e6160`.

Implementado: adaptador servidor desacoplado + validación de firma/bytes y
ledger SQL aditivo idempotente; derechos comerciales y extras se actualizan
solo con mapeos/backend confiables. Control de billing apagado por defecto y
handler sin endpoint desplegado. Sin checkout ni cobros. Se conserva Full
manual gratuito; extras no lo sustituyen. Preparados renovación, fallo,
cancelación, vencimiento, reembolso y conciliación de eventos normalizados.

Perfil/logo privado por taller y su captura en nuevas revisiones CP05; se
reutilizan CP04, cotizaciones y CP06 existentes. No se regeneran documentos
históricos ni se habilitan archivos/correos externos. Carga PNG/JPEG 2MiB,
reencodificación y validaciones de ruta/tamaño/dimensiones; bucket candidato y
RLS restrictiva. Es Storage SQL simulado hasta prueba autorizada del servicio.

Verificaciones ejecutadas:
- **621 pruebas / 71 archivos Vitest PASS**; TypeScript/build público y combinado
  PASS, con grafo oficial y validadores de marca/PWA PASS.
- PostgreSQL17 local sin red PASS: sesiones/MFA, aislamiento, sincronización,
  taller único concurrente, 2/8 sin pago personal, cupos/reservas concurrentes,
  token rotado/expirado/repetido, downgrade sin pérdida, eventos de facturación
  duplicados/desordenados/monto incorrecto, retiro de extras, cancelación/fallo,
  reembolso/vencimiento/conciliación y branding privado.
- Browser SDK **HTTP mock** PASS en 1440/390: Básico bloqueado, Full crea taller,
  perfil guardado, invitación sin persistencia, logout y aceptación hacia CP04
  como mecánico sin acceso de administración. Capturas en docs/screenshots.
- Sintaxis shell/JavaScript y diff check PASS. Sin ESLint configurado.

Candidatos por instalar y secuencia de autorización/QA real en
[matriz de implementación](../BT_PLAN_04_IMPLEMENTACION_20261117.md).
No hubo SQL alojado, creación de Ignacio, concesiones, pagos, emails, backup o
restauración. El propietario autorizó expresamente visibilidad pública temporal;
no se añadieron credenciales ni datos personales. Push autorizado a main,
commits con `[skip render]`; despliegue 04A existente se preserva. CI remoto aún
no comprobado en este checkpoint previo al push, no confundir con validación local.
