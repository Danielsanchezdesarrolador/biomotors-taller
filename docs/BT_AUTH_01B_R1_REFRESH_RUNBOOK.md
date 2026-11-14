# BT-AUTH-01B-R1 — Prueba de renovación de sesión Auth (14/11/2026)

**Estado:** script preparado y verificación real pendiente del Director.

## Objetivo
Comprobar con la cuenta ficticia de propietario A que el SDK de Supabase:
1. inicia sesión con Auth,
2. devuelve par de tokens,
3. renueva explícitamente mediante `auth.refreshSession()`,
4. emite tokens distintos sin cambiar de identidad,
5. conserva la sesión en memoria y valida al usuario con `getUser`,
6. sigue aplicando RLS a membresía y taller tras la renovación.

Se ejecuta por separado de Chrome y **no prueba la renovación automática dentro del navegador**. Usa una sesión aislada que intenta cerrar al terminar; puede afectar los registros Auth de sesiones, pero no hace cambios de datos operativos ni de RLS.

## Requisitos de seguridad
- `.env.local` existente con URL y publishable key (no Secret Key); Node >=22.
- Credencial de **propietario ficticio A** en variable de proceso `BT_R1_PASSWORD_A`, introducida mediante `Read-Host -AsSecureString`. No imprimirla, pegarla en chat ni guardarla en archivos.
- Guardarraíl `BT_R1_REFRESH_TEST=YES`.
- El script no imprime JWT ni refresh token; solo verifica presencia/cambio. Si falla, no repetir sin revisar.
- No ejecutarlo en CI, ni en Render, ni con credenciales reales de talleres.

## Windows — preparación y ejecución
En una segunda ventana PowerShell, con el servidor Vite original ejecutándose si se desea:

```powershell
cd $HOME\Documents\biomotors-taller
git pull origin main
node --check .\scripts\security\bt-auth-r1-refresh-check.mjs
```

Después, para ejecutar la prueba:

```powershell
$secure = Read-Host "Contraseña ficticia propietario A" -AsSecureString
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
    $env:BT_R1_PASSWORD_A = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
}
finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    $secure.Dispose()
}
$env:BT_R1_REFRESH_TEST = "YES"
try {
    node .\scripts\security\bt-auth-r1-refresh-check.mjs
}
finally {
    Remove-Item Env:\BT_R1_PASSWORD_A -ErrorAction SilentlyContinue
    Remove-Item Env:\BT_R1_REFRESH_TEST -ErrorAction SilentlyContinue
}
```

Resultado esperado: 9 líneas `PASS` y `RESULTADO: 9/9 comprobaciones PASS`. **Este resultado no se ha ejecutado ni verificado todavía.**

## Límites
La prueba forzada de `refreshSession()` no sustituye la comprobación posterior de renovación automática en Chrome y la PWA física. No habilitar Auth en Render ni registro público por este procedimiento.
