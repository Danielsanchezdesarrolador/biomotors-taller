# ByteTorque — R1 · Prueba RLS real del rol Recepción

**Fecha:** 14/11/2026. **Estado:** script preparado; ejecución real del Director pendiente.

## Contexto verificado

La cuenta ficticia `bt-r1-recepcion-1411@example.com` tiene correo confirmado y una única membresía `reception/active` en Taller A. La interfaz de ByteTorque mantiene estado `restricted` incluso si se selecciona «Administrador» y tras recargar con F5. Esas verificaciones **no demuestran por sí solas** que RLS proteja las consultas API.

Este script hace **13 comprobaciones de lectura con la identidad Auth de recepción**, incluyendo el Taller B por UUID, membresías del propietario A, propietario B y mecánico A, además de sus perfiles, sin modificar información de negocio. Usa únicamente la publishable key de `.env.local` y contraseña ficticia en variable temporal. Crea y cierra una sesión independiente de Auth; no afecta las sesiones de Chrome.

**Importante:** no prueba prohibición de escrituras sobre futuros datos operativos, como clientes y órdenes, porque esas funciones siguen desactivadas. Mantener Render con Auth público apagado.

## Paso 1 — Preparar

Desde la segunda ventana PowerShell en `$HOME\Documents\biomotors-taller`:

```powershell
git pull origin main
node --check .\scripts\security\bt-auth-r1-reception-readonly.mjs
```

No se requieren contraseñas en este paso.

## Paso 2 — Ejecutar después de preparar

```powershell
$secure = Read-Host "Contrasena ficticia de recepcion" -AsSecureString
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
    $env:BT_R1_PASSWORD_RECEPTION = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
}
finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    $secure.Dispose()
}
$env:BT_R1_RECEPTION_READONLY = "YES"
try {
    node .\scripts\security\bt-auth-r1-reception-readonly.mjs
}
finally {
    Remove-Item Env:\BT_R1_PASSWORD_RECEPTION -ErrorAction SilentlyContinue
    Remove-Item Env:\BT_R1_RECEPTION_READONLY -ErrorAction SilentlyContinue
}
```

Resultado **esperado, no ejecutado**: `13/13 comprobaciones de lectura RLS PASS`. Si hay `FAIL` o `BLOQUEADO`, detenerse y revisar, sin repetir a ciegas. Nunca copiar contraseñas, tokens, claves secret ni el contenido de `.env.local` al chat.

La herramienta no administra suscripciones, pagos, usuarios ni permisos; solo SELECT y autenticación temporal.
