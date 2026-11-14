# ByteTorque — R1 · Prueba real RLS con mecánico

Fecha: 14/11/2026. **Preparada, ejecución real pendiente**.

Este procedimiento comprueba 11 condiciones usando exclusivamente la cuenta ficticia `bt-r1-mecanico-1411@example.com`, su taller A y una sesión Auth aislada. Verifica pertenencia, rol, lectura RLS de perfiles/membresías y denegación cruzada del Taller B. No escribe datos de negocio, crea una sesión de prueba en Auth y la cierra al final; no toca Chrome.

**No equivale** a comprobar restricciones de escritura de módulos operativos que todavía no existen. No utilizar con clientes reales ni claves de servicio.

### Paso de preparación

En PowerShell, desde `$HOME\Documents\biomotors-taller`:

```powershell
git pull origin main
node --check .\scripts\security\bt-auth-r1-mechanic-readonly.mjs
```

### Paso de ejecución posterior (contraseña privada)

```powershell
$secure = Read-Host "Contrasena ficticia del mecanico" -AsSecureString
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
    $env:BT_R1_PASSWORD_MECHANIC = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
}
finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    $secure.Dispose()
}
$env:BT_R1_MECHANIC_READONLY = "YES"
try {
    node .\scripts\security\bt-auth-r1-mechanic-readonly.mjs
}
finally {
    Remove-Item Env:\BT_R1_PASSWORD_MECHANIC -ErrorAction SilentlyContinue
    Remove-Item Env:\BT_R1_MECHANIC_READONLY -ErrorAction SilentlyContinue
}
```

Esperado: **11/11 PASS**, aún no ejecutado. No compartir contraseñas, tokens o valores del archivo `.env.local`. No repetir si aparece FAIL o BLOQUEADO hasta revisar el diagnóstico. Render continúa con Auth desactivado.
