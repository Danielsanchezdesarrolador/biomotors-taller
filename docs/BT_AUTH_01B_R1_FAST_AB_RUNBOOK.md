# ByteTorque — R1 · Ronda acelerada A/B y administrador secundario

**Fecha:** 14/11/2026. **Estado:** guía histórica, pruebas A/B y 12/12 aprobadas por el Director; la membresía temporal de Administrador B **YA FUE RETIRADA Y VERIFICADA**. **NO REEJECUTAR el script 12/12 con el fixture actual.** Renovación automática en Chrome sigue sin certificar.

[Cierre controlado, evidencia y reversión](checkpoints/CHECKPOINT_BT_AUTH_01B_R1_CIERRE_CONTROLADO_20261114.md). Este documento se conserva para auditoría; no es una orden de reconstruir roles de prueba.

## Fixture y reversión segura

Durante la ronda acelerada se reutilizó la cuenta ficticia `bt-r1-recepcion-1411@example.com` con **Recepción en Taller A** y **Administrador temporal en Taller B**. El permiso temporal B se retiró tras las pruebas; Recepción A y los demás roles se verificaron intactos.

Membresía temporal ya eliminada y verificada (referencia histórica): `005d0348-fda0-4dc7-ba16-3b5708200e5b` (usuario `f1b1ee14-7f89-4352-b7cd-263979a2f6f0`, taller B `e7b4fc0c-6966-4039-b33c-84545119e36d`).

**Reversión histórica, YA EJECUTADA** tras confirmación de cierre de sesión (no repetir):
```sql
delete from public.workshop_memberships
where id = '005d0348-fda0-4dc7-ba16-3b5708200e5b'
  and workshop_id = 'e7b4fc0c-6966-4039-b33c-84545119e36d'
  and user_id = 'f1b1ee14-7f89-4352-b7cd-263979a2f6f0'
  and role = 'admin' and status = 'active'
returning id,role;
```
La comprobación posterior confirmó que **Recepción A**, **owner A**, **owner B** y **mecánico A** siguen intactos: 4 membresías, 2 talleres, 4 usuarios Auth. No se eliminaron las demás cuentas de prueba.

## Una sola ronda de Chrome — ARCHIVADA Y CONFIRMADA

1. Entrar en `http://localhost:5173/#/acceso` con la cuenta ficticia de recepción, sin sesión previa.
2. Deben aparecer **dos talleres** a elegir; elegir **Taller B**, con rol **Administrador**. No debe mostrarse información administrativa del Taller A.
3. Presionar **F5**; por seguridad puede solicitar seleccionar taller de nuevo. Elegir otra vez **B** y confirmar administración B.
4. Pulsar **Cambiar taller** y elegir **A**. Debe decir **«Acceso restringido»**, porque la membresía A sigue siendo **Recepción**.
5. Cerrar sesión y F5. Ningún panel privado debe recuperarse sin credenciales.

## Una sola ronda PowerShell: 12 comprobaciones API RLS — ARCHIVADA, NO REEJECUTAR

```powershell
git pull origin main
node --check .\scripts\security\bt-auth-r1-fast-ab.mjs
```

Para ejecutar con contraseña ficticia escrita sin eco:
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
$env:BT_R1_FAST_AB = 'YES'
try {
  node .\scripts\security\bt-auth-r1-fast-ab.mjs
}
finally {
  Remove-Item Env:\BT_R1_PASSWORD_RECEPTION -ErrorAction SilentlyContinue
  Remove-Item Env:\BT_R1_FAST_AB -ErrorAction SilentlyContinue
}
```

**Resultado histórico confirmado por el Director: 12/12 PASS**, antes de retirar el permiso temporal; el script ya no coincide con las membresías actuales. Login Auth, SELECT RLS, `refreshSession()` forzado y cierre local aislado, sin escrituras operativas. **No reejecutar este bloque ni restaurar permisos para hacerlo.** No imprimir contraseñas, JWT o claves.

**No demuestra** renovación *automática* en Chrome ni permisos de escritura de futuras OT/clientes/informes. Esas pruebas y Safari/PWA física continúan pendientes. Render con Auth real desactivado; ningún pago, email ni registro abierto.
