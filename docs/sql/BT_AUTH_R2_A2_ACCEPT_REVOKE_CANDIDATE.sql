-- ByteTorque BT-AUTH-R2-A2: CANDIDATO COMPLEMENTARIO, NO APLICADO.
-- Requiere que el candidato R2-A de invitaciones haya sido revisado,
-- migrado en ensayo y sus pruebas de cuotas/concurrencia estén aprobadas.
-- Aceptación/revocación se ejecutan SOLO desde backend service_role.
-- Backend verifica JWT en Supabase Auth /auth/v1/user antes de invocar
-- aceptación; pasa exclusivamente user.id y user.email confirmados por Auth.
-- Nunca aceptar p_verified_* enviados en el cuerpo del navegador.

-- REQUISITO DE SERIALIZACIÓN: todas las rutas de mutación de membresías,
-- invitaciones y entitlements deben bloquear primero workshops.id (FOR UPDATE).
-- Si otras futuras rutas eluden ese bloqueo, las cuotas NO son transaccionales.

create function public.bt_r2_revoke_mechanic_invite(
  p_actor_user_id uuid, p_workshop_id uuid, p_invitation_id uuid
) returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_invitation_id uuid;
begin
  if p_actor_user_id is null or p_workshop_id is null or p_invitation_id is null then
    raise exception 'Invalid invite revoke request' using errcode = '22023';
  end if;

  perform 1 from public.workshops w
   where w.id = p_workshop_id and w.status = 'active'
   for update;
  if not found then return false; end if;

  if not exists (
    select 1 from public.workshop_memberships m
     where m.workshop_id = p_workshop_id and m.user_id = p_actor_user_id
       and m.status = 'active' and m.role in ('owner','admin')
  ) then
    return false;
  end if;

  update bt_private.workshop_mechanic_invitations
     set status = 'revoked', revoked_at = pg_catalog.clock_timestamp()
   where id = p_invitation_id
     and workshop_id = p_workshop_id
     and role = 'mechanic'
     and status = 'pending'
   returning id into v_invitation_id;

  if v_invitation_id is null then return false; end if;

  insert into bt_private.workshop_invitation_audit
    (workshop_id, invitation_id, actor_user_id, event)
  values (p_workshop_id, v_invitation_id, p_actor_user_id, 'invite_revoked');
  return true;
end;
$$;

revoke all on function public.bt_r2_revoke_mechanic_invite(uuid,uuid,uuid)
  from public, anon, authenticated;
grant execute on function public.bt_r2_revoke_mechanic_invite(uuid,uuid,uuid)
  to service_role;

-- El backend llama a esta RPC SOLO tras validar getUser(access_token),
-- exigir email_confirmed_at y verificar que !is_anonymous.
-- p_verified_email NO debe proceder del cliente; no se realiza SELECT
-- directo sobre auth.users (sin GRANT de ese esquema a service_role).
create function public.bt_r2_accept_mechanic_invite(
  p_verified_user_id uuid,
  p_verified_email text,
  p_token_sha256_hex text
) returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_workshop_id uuid;
  v_invitation_id uuid;
  v_email text;
  v_now timestamptz;
  v_limit integer;
  v_plan text;
  v_mechanics bigint;
  v_pending bigint;
begin
  if p_verified_user_id is null or p_verified_email is null or
     p_token_sha256_hex is null or
     p_token_sha256_hex !~ '^[0-9a-f]{64}$'
  then
    return false;
  end if;
  v_email := pg_catalog.lower(pg_catalog.btrim(p_verified_email));
  if pg_catalog.length(v_email) not between 5 and 254 or
     v_email !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
  then
    return false;
  end if;

  -- El token original son 32 bytes aleatorios; la RPC recibe SOLO
  -- SHA-256 en hex. Token e identidad jamás se imprimen en logs.
  select i.workshop_id, i.id into v_workshop_id, v_invitation_id
    from bt_private.workshop_mechanic_invitations i
   where i.token_sha256 = pg_catalog.decode(p_token_sha256_hex, 'hex');
  if not found then return false; end if;

  perform 1 from public.workshops w
   where w.id = v_workshop_id and w.status = 'active'
   for update;
  if not found then return false; end if;

  -- Volver a comprobar el estado una vez obtenido el bloqueo del taller.
  -- Una segunda aceptación concurrente verá status='accepted' y fallará.
  v_now := pg_catalog.clock_timestamp();
  perform 1 from bt_private.workshop_mechanic_invitations i
   where i.id = v_invitation_id and i.workshop_id = v_workshop_id
     and i.status = 'pending' and i.role = 'mechanic'
     and i.expires_at > v_now and i.invited_email = v_email
   for update;
  if not found then return false; end if;

  -- Nunca cambiar roles preexistentes ni reactivar cuentas suspendidas.
  if exists (
    select 1 from public.workshop_memberships m
    where m.user_id = p_verified_user_id and m.workshop_id = v_workshop_id
  ) then
    return false;
  end if;

  -- Si el taller bajó de plan después de reservar la invitación,
  -- NO aceptar por encima del cupo actual.
  select e.plan into v_plan
    from bt_private.workshop_mechanic_entitlements e
   where e.workshop_id = v_workshop_id;
  v_limit := case coalesce(v_plan, 'basic')
    when 'basic' then 2 when 'plus' then 8 when 'full' then 8 else 0 end;

  select count(*) into v_mechanics from public.workshop_memberships m
   where m.workshop_id = v_workshop_id
     and m.role = 'mechanic' and m.status = 'active';
  select count(*) into v_pending
    from bt_private.workshop_mechanic_invitations i
   where i.workshop_id = v_workshop_id
     and i.role = 'mechanic' and i.status = 'pending'
     and i.expires_at > v_now;
  if v_mechanics + v_pending > v_limit then return false; end if;

  insert into public.workshop_memberships
    (workshop_id, user_id, role, status)
  values (v_workshop_id, p_verified_user_id, 'mechanic', 'active');

  update bt_private.workshop_mechanic_invitations
     set status = 'accepted', accepted_at = v_now
   where id = v_invitation_id
     and status = 'pending';

  insert into bt_private.workshop_invitation_audit
    (workshop_id, invitation_id, actor_user_id, event)
  values (v_workshop_id, v_invitation_id, p_verified_user_id, 'invite_accepted');
  return true;
end;
$$;

revoke all on function public.bt_r2_accept_mechanic_invite(uuid,text,text)
  from public, anon, authenticated;
grant execute on function public.bt_r2_accept_mechanic_invite(uuid,text,text)
  to service_role;

comment on function public.bt_r2_accept_mechanic_invite(uuid,text,text)
  is 'ByteTorque R2-A2 candidate only: verified Auth identity provided by trusted server; single-use invite, atomic tenant lock, role mechanic only. Not deployed.';
comment on function public.bt_r2_revoke_mechanic_invite(uuid,uuid,uuid)
  is 'ByteTorque R2-A2 candidate only: owner/admin same-tenant revocation under workshop lock. Not deployed.';

-- No trigger ni función ejecutable por anon/authenticated;
-- no añadir claves, plan o roles en JWT user_metadata.
-- Pruebas de integración en ambiente aislado obligatorias:
-- token inválido, repetido, vencido, revocado; email confirmado o no;
-- mismatch de email; rol inexistente/suspendido; cambio de plan;
-- 2->3 Básico, 8->9 Plus/Full; dos aceptaciones concurrentes;
-- concurrencia reserva+aceptación; acceso cruzado A/B y REST anon.
