# ByteTorque — Método de entregas funcionales para el piloto de Ignacio

**Orden del Director (15/11/2026).** Aplicable a los próximos avances CP03, CP04, CP05 y CP06. El objetivo no es maximizar commits, checkpoints ni números de tests: es completar recorridos operativos que Ignacio pueda usar, con datos persistentes y autorizados.

## Ciclo único por capacidad

1. **Entregable visible y criterio verificable.** Definir primero qué podrá hacer Ignacio (ejemplo CP03: alta de cliente y vehículo, edición, búsqueda por patente y recuperación tras cerrar/reabrir sesión). Reusar código existente y no crear nuevas DEMO cuando exista ya una.
2. **Implementación integrada.** Construir en un bloque coherente contrato, SQL/versionado, RLS, repositorio, vínculo Auth, interfaz y tratamientos de error. Hacer commits intermedios cuando ayuden a mantener código seguro, pero no declarar «función terminada» por pasar pruebas unitarias aisladas.
3. **Una batería final consolidada.** Ejecutar TypeScript + Vitest + build + CI, SQL/RLS en laboratorio y E2E de navegador de las rutas modificadas; comprobar casos críticos de acceso indebido, persistencia, recarga, duplicados y revocación. Corregir fallos y repetir únicamente suites afectadas y la ronda final necesaria. **Nunca omitir regresiones críticas para acelerar.**
4. **Puerta alojada separada.** Cuando requiera instalar SQL, cambiar secretos/Edge, habilitar accesos o usar datos personales, solicitar autorización **específica y previa**. Mientras esté bloqueado, marcar «listo en código / pendiente en hospedado», no inventar activaciones ni seguir agregando validaciones redundantes como sustituto del permiso.
5. **Entrega verificable.** Probar con ficha totalmente sintética y autorizada en entorno controlado: crear → recargar / cerrar sesión → reingresar → buscar → editar → recuperar; verificar RLS A/B y permisos. Después realizar QA físico en iPhone con autorización y dejar evidencia. Un botón visual o un mock de base de datos no certifica persistencia real.
6. **Cierre y avance.** Registrar un checkpoint y actualizar la matriz del piloto **solo al cerrar la capacidad completa**, con SHA, resultados CI, pruebas reales vs simuladas, pendientes y siguiente función. Evitar dividirla artificialmente en múltiples etapas P4/P5/P6 si no existe una necesidad técnica real.

## Puerta actual CP03

Ya existen candidatos SQL PostgreSQL, contratos/repositorio Supabase JS, directorio UI y conexión al ciclo de sesión. **No están habilitados públicamente**.

El próximo entregable es la **ficha persistente y recuperable de cliente + vehículo**, no otra ronda de limpieza sin resultado visible. Consolidar el código ya escrito; solo corregir bugs actuales. Para instalar SQL candidato en Supabase alojado, exponer UI a usuarios autorizados o ejecutar E2E hospedado se requiere aprobación expresa y un plan reversible, incluidas privacidad, consentimiento y permisos.

**Criterios mínimos de aceptación CP03:** cliente nuevo, vehículo asociado, búsqueda por nombre/teléfono/patente, prevención de patente duplicada por taller, edición protegida, reconocimiento de retorno, error por falta de red, bloqueo ante logout/cambio de taller, RLS que niegue accesos cruzados; persistencia real tras nueva sesión. Evidencia de CI y QA físico debe distinguirse.

No hacer pruebas con información real de clientes hasta tener autorización para tratar esos datos. Si falta una autorización o prueba física, detener solo ese subpaso; avanzar en otra función P0 o en documentación útil, sin declarar completada la operación.

## Prioridad de módulos y política de recursos

**CP03 → CP04 → CP05 → CP06 → conformidad real de Ignacio y Director → CP07–CP09.** Por ahora no desarrollar pantallas comerciales, cobros, suscripciones ni funciones exclusivas de terceros.

**Medida del progreso:** cantidad de recorridos completos funcionando en el taller y aprobados, no cantidad de verificaciones. Si un CI de un commit concurrente falla, corregirlo antes de marcar el avance como aprobado. No modificar el código de otro agente que trabaje simultáneamente sin revisar su HEAD.
