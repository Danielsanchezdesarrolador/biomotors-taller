# BT-COMMERCIAL-HARDENING-01 — INTEGRATION_CI_PENDING

27/11/2026. Titular autoriza integración oficial y CI exclusivamente. No autoriza despliegue, activación de servicios ni cambios alojados.

## Revisión independiente e integridad
- Base oficial d9977e046372bf98a1640f975ec1ce90c24c9309.
- Candidato inicial 1b5a3cdb91ef6b7dead7c3ff3a8de00082f6e860; transferencia 9c5751276f50c59cfbd2a7dba3c499331eef21df.
- DELTA-01 candidato 1a58bcfa29d92352f0fa93dec1a65468ed0f17d2; transferencia d94a702726be7ab76c260af2fd95cb463e3652a1.
- 67/67 SHA-256 del manifiesto DELTA-01 comprobados por lectura binaria; 68 archivos presentes incluyendo manifiesto. 30 snapshots heredados + 8 delta = 38/38 hashes de archivos finales. No se recalcularon evidencias históricas del primer paquete fuera del candidato final.
- Árboles Git reconstruidos independientemente: base 98bbbc853d0fe97cc6e45c00eacf9ed4894ecacd, inicial 4470a3bb2b3bcca0afc639c6859c1b82762834ed, consolidado dcc018296251745bf0b8e20b76dcbd22c4fed3ec. Transferencia al repo oficial: 38/38 blobs idénticos; árbol oficial exacto dcc018296251745bf0b8e20b76dcbd22c4fed3ec. Commit oficial de candidato exacto 914f020ffec70ebcb89542ffc0878bd87fc0d3f3.
- FIX-01/02 favorables por contraste SQL/código; 12 casos nuevos PASS reportados con evidencia Codex; 34 históricos no reejecutados localmente. No equivale a auditoría alojada, estrés de concurrencia ni runtime Edge.
- GitHub rechazó la primera construcción masiva con 422 por timeout; recuperación con blobs individuales base64, comprobación de SHA y árbol por referencias, sin avance parcial de rama.
- Segunda capa exclusivamente documental/CI: workflow bt-commercial-hardening-focused.yml y adaptación de selector de motor en script de prueba (Chromium por defecto, WebKit explícito). No modifica código productivo del candidato. CI focalizada SQL/HTTP 11+1 en PostgreSQL aislado, navegador Chromium/WebKit con harness sintético; CI general y comercial oficiales conservadas (incluyen pruebas históricas automáticamente). Sin credenciales, SQL alojado o despliegue en el nuevo workflow. No afirmar resultados antes de Actions.

## Puerta siguiente
Verificar HEAD/Auto-Deploy antes y después del avance único fast-forward de main. Consultar CI del SHA final exacto. Exigir resultado de nuevas pruebas, CI general/comercial, empaquetado y Deno check. Runtime Edge alojado y aceptación humana quedan pendientes. No autorizar por inferencia instalación ni GATE_OPEN. Render LIVE previo 7dc06a26c1a4821affb67366a0a05ba0b672a1b4; Edge v12/v9/v2 y onboarding v8 fuera de esta intervención. SEC07 cerrado. Mantener bloques B/C pendientes hasta cierre comercial. No Codex adicional.
