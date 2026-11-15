# ByteTorque — R1 · Ronda acelerada A/B y administrador secundario

**Fecha:** 14/11/2026. **Estado:** fixture temporal preparado, pruebas de navegador/API pendientes.

## Fixture y reversión segura

Para evitar crear nuevos usuarios, la cuenta ficticia \`bt-r1-recepcion-1411@example.com\` mantiene **Recepción en Taller A** y, **temporalmente**, tiene **Administrador en Taller B**. Los propietarios de A/B y el mecánico de A no se modificaron.

Membresía temporal a eliminar al terminar todas las pruebas: \`005d0348-fda0-4dc7-ba16-3b5708200e5b\` (usuario \`f1b1ee14-7f89-4352-b7cd-263979a2f6f0\`, taller B \`e7b4fc0c-6966-4039-b33c-84545119e36d\`).

**Reversión propuesta, NO ejecutada** (usar solo al cierre, tras verificar sesión de prueba cerrada):
\`\`\`sql
delete from public.workshop_memberships
where id = '005d0348-fda0-4dc7-ba16-3b5708200e5b'
  and workshop_id = 'e7b4fc0c-6966-4039-b33c-84545119e36d'
  and user_id = 'f1b1ee14-7f89-4352-b7cd-263979a2f6f0'
  and role = 'admin' and status = 'active'
returning id,role;
\`\`\`
Tras revertir, confirmar que **Recepción A**, **owner A**, **owner B** y **mecánico A** siguen intactos. No eliminar el resto de cuentas de prueba hasta decisión de cierre R1.

## Una sola ronda de Chrome

1. Entrar en \`http://localhost:5173/#/acceso\` con la cuenta ficticia de recepción, sin sesión previa.
2. Deben aparecer **dos talleres** a elegir; elegir **Taller B**, con rol **Administrador**. No debe mostrarse información administrativa del Taller A.
3. Presionar **F5**; por seguridad puede solicitar seleccionar taller de nuevo. Elegir otra vez **B** y confirmar administración B.
4. Pulsar **Cambiar taller** y elegir **A**. Debe decir **«Acceso restringido»**, porque la membresía A sigue siendo **Recepción**.
5. Cerrar sesión y F5. Ningún panel privado debe recuperarse sin credenciales.

## Una sola ronda PowerShell: 12 comprobaciones API RLS

\`\`\`powershell
git pull origin main
node --check .\scripts\security\bt-auth-r1-fast-ab.mjs
\`\`\`

Para ejecutar con contraseña ficticia escrita sin eco:
\`\`\`powershell
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
\`\`\`

Esperado **12/12 PASS**, aún no ejecutado. Login Auth, SELECT RLS, \`refreshSession()\` forzado y cierre local aislado; no cambia los datos operativos. No repetir si falla sin revisión previa. No imprimir contraseñas, JWT o claves.

**No demuestra** renovación *automática* en Chrome ni permisos de escritura de futuras OT/clientes/informes. Esas pruebas y Safari/PWA física continúan pendientes. Render con Auth real desactivado; ningún pago, email ni registro abierto.
