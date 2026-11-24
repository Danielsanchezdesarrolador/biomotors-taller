# ByteTorque · SEC07 · Cierre C y aprobación del piloto inicial

**Fecha de evidencia:** 23/11/2026 (Chile). **Resultado:** `BLOCK_C_PASS_PILOT_FLOW`. **SEC07:** `PASS_PILOTO_INICIAL` en el alcance acordado. El titular realizó el recorrido en lugar de Ignacio. La evidencia funcional proviene del titular y de sus observaciones durante la prueba.

## Evidencia de C

1. El titular accedió con una cuenta gestionada y creó un cliente y un vehículo ficticios vinculados en el taller de prueba autorizado.
2. Localizó el vehículo en Nueva recepción, confirmó el ingreso y vio la nueva orden en Órdenes del taller.
3. Abrió esa orden y usó **Preparar / consultar cotización**. Confirmó que funcionó el recorrido con la cotización en borrador.
4. El titular confirmó que, tras recargar, pudo volver al expediente y a la orden y que el borrador conservó la partida, el importe y el vínculo. Esta confirmación cierra la prueba de persistencia del recorrido.

## Hallazgo y salida validada

El selector general **Orden CP04** de Cotizaciones mostraba solo la orden anterior después de crear la orden nueva. La ruta desde **Órdenes de trabajo → Preparar / consultar cotización** permitió continuar en la orden correcta. Queda pendiente mejorar la actualización del selector como trabajo funcional. El cierre no implica que el selector se haya corregido. No se publican nombres, patentes, contactos ni capturas de la prueba.

## Alcance del cierre y operación

- A: [`BLOCK_A_PASS_V04`](CHECKPOINT_BT_SEC07_CIERRE_A_PASS_V04.md) en laboratorio.
- B: [`BLOCK_B_PASS_INFRASTRUCTURE`](CHECKPOINT_BT_SEC07_CIERRE_B_PASS_INFRAESTRUCTURA.md) y custodia privada confirmada.
- C: una prueba autorizada con datos ficticios, desde cuenta gestionada, hasta cotización normal en borrador. La prueba no incorpora emisión, archivo PDF privado, correo externo ni onboarding público. No se atribuye una prueba directa a Ignacio ni se certifican otros recorridos.
- Mantener respaldo manual cifrado cada dos días y antes de cambios de datos, con manifiesto y registro de la última copia exitosa. El alcance local conserva el riesgo de pérdida total del equipo. A y B no se reabren por este cierre.
- La publicación del cierre solo cambia documentación en `main`. No incluye despliegue, migración ni cambios de configuración. El expediente ficticio fue creado por el titular mediante la interfaz en el recorrido previamente autorizado.
