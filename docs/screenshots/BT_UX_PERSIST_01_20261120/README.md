# BT-UX-PERSIST-01 — evidencia sintética

20/11/2026. Interfaz real con React.StrictMode, SDK Supabase y HTTP interceptado.
Usuarios, taller, cliente, vehículo y hallazgos son fixtures sintéticos; no se
conectó producción ni se usaron credenciales reales. Las capturas se tomaron
mientras la revalidación estaba detenida por el fixture y después de retornar
al historial, conservando los nodos originales.

`results.json`: recorridos PASS a 1366, 390 y 768 px. Comprueba identidad DOM,
texto/cursor, scroll, ausencia de login fugaz, consultas y escrituras contadas,
PDF/CP06, desconexión, revocación, rol y usuario distintos. No prueba Safari
físico, Edge ni descarte de una pestaña por el sistema operativo.

Se reutiliza el AppShell y la identidad R2 existentes. Aprobación visual física
del propietario y despliegue siguen pendientes.
