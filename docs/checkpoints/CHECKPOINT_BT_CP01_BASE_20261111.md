# BIOMOTORS TALLER — CHECKPOINT BT-CP01 BASE

**Fecha:** 11 de noviembre de 2026
**Rama:** `main`
**Estado:** primer frontend subido y CI verificado; sin despliegue ni datos reales.

## Implementado en el repositorio

- React + TypeScript + Vite y estructura de proyecto.
- Interfaz de gestión demostrativa responsive: Inicio, Clientes, Vehículos, Revisiones y Presupuestos.
- Navegación web y móvil; botones funcionales para cambiar de módulo.
- Diseño accesible inicial, manifiesto PWA, icono SVG y service worker básico sin almacenamiento en caché de datos privados.
- Esqueleto de prueba unitarias y GitHub Actions para `typecheck`, `test` y `build`.
- Archivos `README.md`, `AGENTS.md` y `roadmap.md` actualizados con metodología de ahorro de cuota.
- Commit de código base: `0b2943db8cfa37d7aa877234c7618aae5b3811f1`.

## Pendiente (no atribuir completitud)

- CI y build remoto: **verificados PASS**. GitHub Actions #43105084982 y #43105329020; TypeScript, 3 tests y build completados correctamente.
- Probar instalación/visualización en iPhone real y Android.
- Conectar Supabase `biomotors-taller` y diseñar esquema seguro con RLS multiempresa.
- Implementar autenticación, persistencia, documentos PDF y correos.
- Recibir los formatos originales de hoja multipunto y cotización de Ignacio.
- Crear despliegue demo público en Render si se autoriza/configura.

## Reglas acordadas

**ChatGPT directamente primero**; modo Alto si se necesita análisis profundo; **Codex cuando sea realmente necesario**; humano solo para revisiones, decisiones y pasos de acceso externo. Mantener el trabajo sobre `main`, sin ramas extra ni mezcla con BIOMOTORS Academia.

**Esta versión es una maqueta funcional de navegación, no una aplicación operativa de taller.**
