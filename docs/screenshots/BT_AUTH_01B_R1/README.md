# Evidencia BT-AUTH-01B-R1

Las imágenes `*-mock-*` son capturas reales del navegador con el SDK oficial y respuestas HTTP sintéticas interceptadas. **No son sesiones ni talleres reales, y no prueban RLS del servidor**. `public-off-*` corresponde al build público con el interruptor apagado. No contienen claves ni contraseñas reales.

- [Login escritorio, integración preparada](login-enabled-mock-1650.png)
- [Login móvil, integración preparada](login-enabled-mock-390.png)
- [Panel de taller sintético en escritorio](owner-mock-1650.png)
- [Panel de taller sintético en móvil](owner-mock-390.png)
- [Mecánico: espacio técnico vacío](negative-mechanic-390.png)
- [Recepción: acceso restringido](negative-reception-390.png)
- [Membresía revocada](revoked-mock-390.png)
- [Publicación apagada, escritorio](public-off-1650.png)
- [Publicación apagada, móvil](public-off-390.png)

También se incluyen capturas de login a 1440/768/375 px y los resultados JSON de los recorridos. Los resultados de autenticación real permanecen `NOT EXECUTED`.


Los PNG de login y paneles se capturaron también contra el **build de producción local con flag activado**, clave de prueba y HTTP interceptado. [Resultado del build activado](production-sdk-mock-results.json). Los paneles `owner-panel-1..5-mock-1650/390.png` documentan las cinco vistas sin operaciones habilitadas; no representan talleres reales.
