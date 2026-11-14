# ByteTorque · Prueba API RLS con dos talleres reales (R1)

**Fecha:** 14/11/2026 · **Estado:** script preparado, ejecución del Director pendiente.
**Archivo:** `scripts/security/bt-auth-r1-rls-readonly.mjs`.

## Alcance
Usa las dos cuentas ficticias ya existentes `bt-r1-owner-1411@example.com` y `bt-r1-sin-taller-1411@example.com`, cada una propietaria de un taller diferente. Comprueba el alcance RLS de `workshops`, `workshop_memberships` y `profiles`, mediante el SDK oficial y dos identidades Auth independientes. Solo SELECT (además de signIn/getUser/signOut). **No** prueba permisos de tablas operativas futuras, edición, cifrado ni Safari físico.

La clave publicable/URL se leen de `.env.local`, ignorado por Git. Las dos contraseñas se leen de variables de entorno temporales de la sesión. **Nunca** pegar contraseñas en comando literal, consola de desarrollador, chat, commits o capturas. No usar clave secret ni service_role.

## Preparación Windows
Mantener el servidor Vite en la ventana original si se desea; abrir una **segunda** PowerShell en `$HOME\Documents\biomotors-taller`. Ejecutar `git pull origin main` y `node --check .\scripts\security\bt-auth-r1-rls-readonly.mjs`. No cierres las sesiones de navegador; el script usa clientes aislados en memoria.

Pegar el siguiente bloque en la PowerShell secundaria:
```powershell
function Set-PasswordForTest([string]$Name, [string]$PromptText) {
  $secure = Read-Host $PromptText -AsSecureString
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try {
    [Environment]::SetEnvironmentVariable($Name, [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr), "Process")
  }
  finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    $secure.Dispose()
  }
}
Set-PasswordForTest 'BT_R1_PASSWORD_A' 'Contraseña ficticia del propietario A'
Set-PasswordForTest 'BT_R1_PASSWORD_B' 'Contraseña ficticia del propietario B'
$env:BT_R1_RLS_READONLY = 'YES'
try {
  node .\scripts\security\bt-auth-r1-rls-readonly.mjs
}
finally {
  Remove-Item Env:\BT_R1_PASSWORD_A -ErrorAction SilentlyContinue
  Remove-Item Env:\BT_R1_PASSWORD_B -ErrorAction SilentlyContinue
  Remove-Item Env:\BT_R1_RLS_READONLY -ErrorAction SilentlyContinue
}
```

Esperado: `PASS` sucesivos y `RESULTADO: 15/15 pruebas reales de API RLS PASS`. Si aparece `FAIL` o `BLOQUEADO`, **no repetir** hasta revisar el fallo; nunca pegar salida con tokens o credenciales (el script no los imprime).

Si falta alguna cuenta, se cambia el esquema o uno de los talleres se desactiva, el script fallará expresamente y no intentará restaurar permisos automáticamente. Al acabar, verificar en Supabase que los dos talleres permanecen separados y que no se creó información operativa.

La ejecución de las pruebas anteriores BT-CP02-D (25 PASS) es independiente de este test R1; este sí reutiliza las cuentas del login real del Director.

## Corrección de la prueba anónima — 14/11/2026

En la ejecución inicial del Director: **14/15 PASS**, con `FAIL — Consulta fallida: workshops (HTTP ?)` en la última prueba. Una auditoría directa de los grants SQL confirmó que `anon` no tiene `SELECT` en `public.workshops`; solo `authenticated` lo tiene. La política RLS `workshops_read_member` requiere membresía activa.

El script ahora admite dos resultados válidos para la consulta anónima: respuesta vacía HTTP 2xx (RLS) **o rechazo explícito HTTP 401/403 (GRANT/API)**. Ninguna otra clase de error, caída de red o respuesta con datos cuenta como PASS. Se incorporó el modo de prueba aislada `--anon-only`, que usa la URL/clave pública de `.env.local` **sin contraseñas y sin sesiones autenticadas**.

Para verificar solo la prueba pendiente, en PowerShell desde el repositorio actualizado:
```powershell
git pull origin main
$env:BT_R1_RLS_READONLY = 'YES'
try {
  node .\scripts\security\bt-auth-r1-rls-readonly.mjs --anon-only
}
finally {
  Remove-Item Env:\BT_R1_RLS_READONLY -ErrorAction SilentlyContinue
}
```

Resultado esperado: `PASS 1 — Anonimo rechazado por API (HTTP 401 o 403)` y `RESULTADO: prueba anonima independiente PASS`. **No repetir las 14 pruebas de contraseñas para esta incidencia.** El resultado agregado puede declararse **14 comprobaciones iniciales más la anónima independiente**, pero no etiquetar la ejecución inicial como 15/15 PASS en una sola corrida. La ejecución combinada completa queda opcional para verificación posterior.
