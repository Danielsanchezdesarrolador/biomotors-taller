# CHECKPOINT BT-SEC07-R3-ROLE-CATALOG-AGGREGATE-PROVISIONAL-53

Fecha: 20/11/2026, Chile. Repositorio: Danielsanchezdesarrolador/biomotors-taller. Rama unica: main. HEAD inicial: 7570cd14bdb39162b1a549d5e2e380aeb676b2dd.

## Autorizacion y acciones
El propietario autorizo expresamente UNA consulta SQL agregada de solo lectura a los catalogos de roles PostgreSQL del proyecto biomotors-taller, sin nombres, contrasenas ni datos de clientes; sin modificar roles, exportar archivos, usar GPG o cambiar SSL.
Se verificaron AGENTS.md, agent.md, roadmap.md, CP52, contrato R3, incidente historico y codigo fuente Supabase CLI v3.0.0 pg-dump.env.ts. Se corroboro el proyecto ACTIVE_HEALTHY PostgreSQL 17 por get_project. Se ejecuto una sola sentencia SELECT de tres recuentos sobre pg_catalog.pg_roles con execute_sql. No hubo SQL de escritura.

## Resultado real observado
- roles_visibles_total = 31
- roles_sistema_o_reservados = 31 segun el filtro enviado
- roles_candidatos_no_reservados = 0 segun el filtro enviado
- filas con nombres de roles retornadas = 0
- roles reales exportados = NO
- backup cifrado producido = NO
- recuperabilidad de roles, propietarios o ACL = NO PROBADA

## INC-53: error del filtro, clasificacion provisional
El SELECT real utilizo el predicado LIKE 'pg_%' para excluir roles con prefijo reservado pg_. En LIKE, _ es un comodin de un caracter, no un guion bajo literal. Por ello el predicado tambien puede excluir roles personalizados cuyos nombres empiezan por pg y otra letra sin guion bajo, como pgfoo. Es un error del criterio de la consulta del asistente, no un fallo comprobado de PostgreSQL.
El conteo total 31 permanece valido; las cifras 31 filtrados y cero candidatos son PROVISIONALES. NO certificar la ausencia de roles personalizados ni registrar cero como inventario definitivo.
Correccion futura no ejecutada: una nueva unica SELECT agregada con starts_with(rolname::text, 'pg_') o expresion regular rolname::text ~ '^pg_', las exclusiones exactas de roles gestionados segun CLI v3, y un contador de falsos positivos de la consulta anterior. Sin retornar nombres. Requiere AUTORIZACION NUEVA porque la unica consulta consentida ya ocurrio. No repetir automaticamente.

## Implicaciones de seguridad y recuperacion
Si el filtro corregido confirma cero roles propios, podria ser legitimo que el filtro de Supabase CLI role-only produzca solo RESET ALL. Eso no convierte el antiguo roles.sql.gpg en respaldo valido: descifraba cero bytes y el productor pg_dumpall termino con codigo distinto de cero, sin causa original clasificada.
Los owners, GRANT/REVOKE, ALTER DEFAULT PRIVILEGES, ACL, memberships y permisos de funciones son un plano separado; la restauracion R2 utilizo --no-owner --no-acl y solo acredito estructura. SQL de roles no basta para recuperar Auth, Storage, Edge ni secretos.
CP46 verifico TLS PC-pooler verify-full en una conexion; backend SSL REPORTED_NO. CP48 mostro SSL enforcement OFF; no certificado extremo a extremo. No modificar SSL sin evaluacion de impacto y consentimiento de reinicio.

## Estado de accion y continuidad
Solo lectura real de agregados y documentacion GitHub main [skip render]. Ningun dump, GPG, backup, SQL mutante, modificacion de Supabase, Docker, Render, CI, Drive ni despliegue. Piloto BT-PILOT-QA-04 A REPASAR. INC-53 queda ABIERTO hasta verificacion correctiva con permiso expreso.

Traspaso: Continuar desde main y leer este CP53, AGENTS, agent, roadmap y registro de incidentes. Una SELECT autorizada pg_roles dio 31 total / 31 filtrados / 0 candidatos PROVISIONAL. El filtro LIKE 'pg_%' fue demasiado amplio por wildcard _. No ejecutar otra consulta sin nueva autorizacion; preparar SELECT corregida con starts_with y contador false-positive sin nombres. No exportacion GPG/roles/ACL todavia, SSL enforcement OFF, piloto a repasar.