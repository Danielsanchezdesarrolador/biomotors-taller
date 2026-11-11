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

## Publicación verificada

- **Servicio Render:** `biomotors-taller-demo` (`srv-dbqe4quc6qcc73f275jg`).
- **URL:** https://biomotors-taller-demo.onrender.com
- **Despliegue inicial:** `dep-dbqe4r6c6qcc73f2768g`.
- **Estado confirmado:** `live` (11/11/2026).
- **Fuente:** GitHub repo privado propio, rama `main`; autodespliegue activado.
- **Sin claves ni backend:** el sitio es visual; nunca usar datos personales reales.
- **Siguientes ajustes:** generar iconos PNG Apple/Android antes del siguiente despliegue; comprobar resultado y dispositivos reales.

## Actualización verificada — iconos y compilación PWA

- Implementados iconos PNG de 180 px (iOS), 192 px y 512 px (Android), generados durante build con script sin dependencias adicionales.
- Manifest actualizado, opción standalone y `apple-touch-icon` vinculada.
- Verificación postbuild de artefactos reales añadida.
- GitHub Actions run `43106669748`: **success**.
- Render deploy actualizado `dep-dbqe6ihsrm7s738dnptg`: **live**.
- **Pruebas físicas iOS/Android:** pendientes; no afirmar instalación real sin evidencia.
