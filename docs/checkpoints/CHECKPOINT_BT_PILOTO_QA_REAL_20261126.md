# BT-PILOTO-QA-REAL — continuidad 26/11/2026

Estado: QA humana en curso, no cierre del piloto ni autorización para incorporar otros talleres. Solo documentación, sin datos personales, tokens o enlaces de invitación.

## Evidencias

- LIVE-FIX-01: commit `9381d103f8b32c56e535b3085c8938843c0c79f1`, [CI interfaz y ambos motores](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45892674942) SUCCESS y cuatro workflows adicionales SUCCESS. Render dep-dc49raeq1p3s73dbmleg LIVE 20:59:46 UTC; posteriormente titular añadió VITE_BT_PLAN04_WORKSHOPS_ENABLED=true y confirmó módulo visible. ID del despliegue posterior no verificado en esta anotación.
- MFA, licencia Full personal permanente, taller propio Full y rol owner, distintivo dorado, datos comerciales guardados tras recarga. Invitación reservada, cuenta secundaria registrada/confirmada en Android, aceptación real, vista técnica y contador 1/8 activos, 0 reservas. No equivale a prueba exhaustiva de permisos.
- Titular autorizó activar operaciones, agenda y archivo exclusivamente en el nuevo taller piloto; configure_pilot ejecutado y postflight confirmó las tres capacidades y lectura histórica a true el 26/11 a las 21:24 UTC. Los otros dos talleres conservan sus estados previos. Logos privados, correos automáticos de invitación y pagos siguen fuera del alcance.
- Cliente ficticio creado; ficha vehículo rechazada con kilometraje 120.000 y guardada según confirmación del titular al cambiar a 120000. Pendiente completar OT e inspección multiusuario PC/Android, cotización y expediente, revocación/recuperación según autorización.

## Incidencias de UX pendientes — un bloque consolidado

| ID | Observación | Criterio de aceptación |
|---|---|---|
| BT-UX-SESSION-01 | F5 con dos membresías muestra selector nuevamente. | Restaurar selección y pantalla por usuario/taller solo tras autorización fresca del servidor; cambio explícito y logout limpian según corresponda; si pierde acceso, selector seguro. |
| BT-UX-NAV-01 | Titular reporta dificultad de navegación desde/hacia Configuración. | Acceso y retorno claros en escritorio/móvil; reproducir antes de cambiar código. |
| BT-UX-INVITE-01 | Confirmación de registro lleva a cuenta personal, requiere abrir nuevamente invitación. | Recuperar continuidad segura tras confirmación, sin exponer ni persistir token crudo indebidamente, respetar expiración/identidad/uso único; prueba móvil. |
| BT-UX-KM-01 | Registro de vehículo no guarda con 120.000; sí con 120000 (confirmado por titular). | Aceptar 120000 y agrupación chilena válida 120.000 como entero 120000; aplicar en formularios de kilometraje pertinentes. Rechazar formatos ambiguos, decimales, negativos o fuera de rango con mensaje junto al campo; conservar el dato ingresado al fallar y verificar persistencia exacta. No asumir causa de implementación sin revisar código. |

| BT-UX-INSPECTION-01 | Captura de inspección multipunto, Correas de accesorios: estado Guardado y Detalle técnico pendiente aparecen concatenados, textarea estrecho con texto recortado y ayuda del servidor comprimida. | Separar nombre/estado/detalle/ayuda sin aumentar innecesariamente la altura: filas compactas de densidad consistente, alineación y ancho uniforme del detalle, textarea de altura inicial corta que crece según contenido hasta un límite razonable (desplazamiento interno después), adaptación móvil sin recortes; preservar estética premium R2 y evitar una tarjeta grande por componente; comprobar estados pendiente, guardado y completo sin cambiar reglas de autoguardado o diagnóstico. |

No ejecutar Codex ni desplegar por cada hallazgo. Agrupar correcciones, pruebas focalizadas y revisión antes de publicar. SEC07 cerrado. Siguiente acción: continuar atención ficticia en el taller piloto y comprobar lectura/inspección desde mecánico Android.
