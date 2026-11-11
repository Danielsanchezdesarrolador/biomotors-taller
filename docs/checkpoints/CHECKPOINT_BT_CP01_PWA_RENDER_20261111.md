# BIOMOTORS TALLER — CHECKPOINT BT-CP01 PWA Y RENDER

**Fecha:** 11 de noviembre de 2026
**Alcance:** distribución multiplataforma y autorización de demo.

## Decisiones confirmadas

- El producto se lanza como una misma **PWA** para iPhone/iOS (Safari + agregar a pantalla de inicio), Android (Chrome + instalar/agregar a pantalla principal), y web de escritorio (URL en navegador).
- No se desarrollan ni publican apps nativas en App Store o Google Play en esta etapa. Evaluar vías nativas solo por decisión futura.
- Se autoriza la creación de un sitio estático en **Render** para publicar la primera demostración de BIOMOTORS TALLER.
- Demo visual sin datos reales, autenticación, presupuestos operativos, correos ni cobros.
- No utilizar Render, Supabase ni código de BIOMOTORS Academia para este producto.
- Mantener versión `main`, CI y checkpoints. La prueba en iPhone y Android sigue pendiente.

## Evidencia previa

- Repo privado: `Danielsanchezdesarrolador/biomotors-taller`.
- Build TypeScript y 3 pruebas: PASS en GitHub Actions del checkpoint anterior.
- Documentación registrada en `roadmap.md` y `AGENTS.md`.

## Validaciones pendientes

1. Crear sitio estático independiente Render; confirmar despliegue final mediante estado y URL.
2. Comprobar acceso desde computadora y dispositivos móviles.
3. Verificar instalación PWA, iconos, actualización, apertura y accesibilidad.
4. Revisar experiencia con Ignacio antes de usar datos verdaderos.

**Estado de publicación en este checkpoint:** autorizado, pero la creación y verificación del servicio se documentan por separado cuando exista evidencia.
