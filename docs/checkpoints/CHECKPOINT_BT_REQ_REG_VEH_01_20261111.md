# Checkpoint BT-REQ-REG-VEH-01 — registro de vehículo y visita desde enlace

**Fecha:** 11/11/2026  
**Estado:** nuevo requerimiento confirmado por el Director y documentado; **sin implementación todavía**.

## Solicitud

Añadir a la ficha pública de registro mediante enlace que Ignacio enviará:
- Marca, modelo, año y kilometraje del vehículo.
- Motivo breve por el cual lleva el automóvil o trabajo/cambio que quiere realizar.
- Conservar los datos personales previamente definidos (nombre, correo, teléfono, dirección y comuna).

## Comportamiento previsto

El formulario será móvil, corto, seguro, con tres pasos. El cliente redacta el motivo y el taller recibe una solicitud de ingreso pendiente para revisar y convertir en OT; no sustituye al diagnóstico profesional. Usar datos ficticios en DEMO y no activar enlace, persistencia ni correo hasta un backend con Auth/RLS.

## Reglas de continuidad

- El sistema visual premium R2 es oficial.
- Codex sigue desarrollando BT-UI-05 Informes y cotizaciones. No modificar código en paralelo ni adelantar el siguiente módulo.
- Android nativo queda para el cierre de la web.
- Especificación: `docs/BT_REGISTRO_CLIENTE_VEHICULO_VISITA.md`.

**La decisión queda documentada en roadmap, AGENTS y contrato BT-UI-04.**
