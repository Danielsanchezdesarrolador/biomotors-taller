-- ByteTorque BT-AUTH-R2-A. CANDIDATO PARA REVISIÓN, NO APLICADO.
-- No ejecutar en Supabase hasta revisión/permiso y pruebas de entorno aislado.
-- PostgreSQL 17 / Supabase. Sin emails, sin invitaciones públicas, sin cuentas reales.
-- Despliegue futuro: generar migración con CLI apropiada; no copiar esta
-- propuesta directamente a producción sin revisión de permisos y concurrencia.

-- Contenedor privado: NO añadir bt_private a los esquemas expuestos en Data API.
create schema if not exists bt_private;
revoke all on schema bt_private from public, anon, authenticated;
grant usage on schema bt_private to service_role;

-- El plan se resuelve exclusivamente en backend. En ausencia de una
-- asignación verificada, se aplica Básico (2 mecánicos): nunca leer
-- subscription/plan enviados por el navegador.
create table bt_private.workshop_mechanic_entitlements (
  workshop_id uuid primary key references public.workshops(id) on delete restrict,
  plan text not null check (plan in ('basic','plus','full')),
  updated_at timestamptz not null default now()
);
alter table bt_private.workshop_mechanic_entitlements enable row level security;
revoke all on table bt_private.workshop_mechanic_entitlements
  from public, anon, authenticated;
grant select, insert, update on table bt_private.workshop_mechanic_entitlements
  to service_role;

-- El token original NUNCA se almacena: solo SHA-256 de 32 bytes aleatorios
-- generados con CSPRNG por el servidor; tampoco incluirlo en logs.
create table bt_private.workshop_mechanic_invitations (
  id uuid primary key default gen_random_uuid(),
  workshop_id uuid not null references public.workshops(id) on delete restrict,
  invited_email text not null
    check (invited_email = lower(btrim(invited_email))
       and length(invited_email) between 5 and 254),
  role text not null default 'mechanic' check (role = 'mechanic'),
  token_sha256 bytea not null unique check (octet_length(token_sha256) = 32),
  created_by uuid not null references auth.users(id) on delete restrict,
  status text not null default 'pending'
    check (status in ('pending','accepted','revoked','expired')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  revoked_at timestamptz,
  check (expires_at > created_at)
);
create index bt_invites_workshop_live on bt_private.workshop_mechanic_invitations
  (workshop_id, expires_at) where status = 'pending';
create index bt_invites_email_lookup on bt_private.workshop_mechanic_invitations
  (workshop_id, invited_email) where status = 'pending';
alter table bt_private.workshop_mechanic_invitations enable row level security;
revoke all on table bt_private.workshop_mechanic_invitations
  from public, anon, authenticated;
grant select, insert, update on table bt_private.workshop_mechanic_invitations
  to service_role;

-- La auditoría no contiene email ni tokens.
create table bt_private.workshop_invitation_audit (
  id bigint generated always as identity primary key,
  workshop_id uuid not null references public.workshops(id) on delete restrict,
  invitation_id uuid not null references bt_private.workshop_mechanic_invitations(id),
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  event text not null check (event in ('invite_created','invite_revoked','invite_accepted')),
  recorded_at timestamptz not null default now()
);
alter table bt_private.workshop_invitation_audit enable row level security;
revoke all on table bt_private.workshop_invitation_audit
  from public, anon, authenticated;
grant select, insert on table bt_private.workshop_invitation_audit
  to service_role;
grant usage, select on sequence bt_private.workshop_invitation_audit_id_seq to service_role;

-- RPC de preparación: SECURITY INVOKER; solo service_role.
-- La función solo prepara una reserva. ACEPTACIÓN e email quedan para
-- etapas separadas; no activar mientras falte entrega validada.
create function public.bt_r2_reserve_mechanic_invite(
  p_actor_user_id uuid,
  p_workshop_id uuid,
  p_email text,
  p_token_sha256_hex text,
  p_expires_at timestamptz
) returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_email text;
  v_plan text;
  v_limit integer;
  v_mechanics bigint;
  v_pending bigint;
  v_invitation_id uuid;
begin
  if p_actor_user_id is null or p_workshop_id is null or
     p_email is null or p_token_sha256_hex is null or p_expires_at is null
  then
    raise exception 'Invalid invitation request' using errcode = '22023';
  end if;
  v_email := pg_catalog.lower(pg_catalog.btrim(p_email));
  if pg_catalog.length(v_email) not between 5 and 254 or
     v_email !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' or
     p_token_sha256_hex !~ '^[0-9a-f]{64}$' or
     p_expires_at < v_now + interval '5 minutes' or
     p_expires_at > v_now + interval '48 hours'
  then
    raise exception 'Invalid invitation arguments' using errcode = '22023';
  end if;

  -- Todas las mutaciones de invitaciones, aceptación y plan del mismo
  -- taller DEBEN adquirir este mismo bloqueo antes de contar/actualizar.
  perform 1 from public.workshops
   where id = p_workshop_id and status = 'active'
   for update;
  if not found then
    raise exception 'Workshop unavailable' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.workshop_memberships
     where workshop_id = p_workshop_id
       and user_id = p_actor_user_id
       and role in ('owner','admin')
       and status = 'active'
  ) then
    raise exception 'Insufficient role' using errcode = '42501';
  end if;

  select e.plan into v_plan
    from bt_private.workshop_mechanic_entitlements e
   where e.workshop_id = p_workshop_id;
  v_limit := case coalesce(v_plan,'basic')
    when 'basic' then 2 when 'plus' then 8 when 'full' then 8
    else 0 end;

  -- Evita reservar dos invitaciones vigentes al mismo email. No revela
  -- la existencia de cuentas Auth; la respuesta del Edge debe ser genérica.
  if exists (
    select 1 from bt_private.workshop_mechanic_invitations
     where workshop_id = p_workshop_id
       and invited_email = v_email
       and role = 'mechanic'
       and status = 'pending'
       and expires_at > v_now
  ) then
    raise exception 'Invitation already pending' using errcode = '23505';
  end if;

  select count(*) into v_mechanics from public.workshop_memberships
   where workshop_id = p_workshop_id and status = 'active' and role = 'mechanic';
  select count(*) into v_pending from bt_private.workshop_mechanic_invitations
   where workshop_id = p_workshop_id
     and role = 'mechanic' and status = 'pending' and expires_at > v_now;
  if v_mechanics + v_pending >= v_limit then
    raise exception 'Mechanic seat limit reached' using errcode = '23514';
  end if;

  insert into bt_private.workshop_mechanic_invitations
    (workshop_id, invited_email, role, token_sha256, created_by, expires_at)
  values (p_workshop_id, v_email, 'mechanic',
          pg_catalog.decode(p_token_sha256_hex, 'hex'),
          p_actor_user_id, p_expires_at)
  returning id into v_invitation_id;

  insert into bt_private.workshop_invitation_audit
    (workshop_id, invitation_id, actor_user_id, event)
  values (p_workshop_id, v_invitation_id, p_actor_user_id, 'invite_created');
  return v_invitation_id;
end;
$$;
revoke all on function public.bt_r2_reserve_mechanic_invite(
  uuid, uuid, text, text, timestamptz
) from public, anon, authenticated;
grant execute on function public.bt_r2_reserve_mechanic_invite(
  uuid, uuid, text, text, timestamptz
) to service_role;

comment on function public.bt_r2_reserve_mechanic_invite(
  uuid, uuid, text, text, timestamptz
) is 'BT-AUTH-R2 candidate; backend-only, atomic per workshop, no email/acceptance. Not approved for production.';

-- NO hay policy que permita leer estas tablas con anon/authenticated.
-- NO se crea enlace de aceptación ni interfaz pública.
-- Pendiente: estrategia de entrega transaccional, aceptación token de un
-- solo uso, caducidad/revocación, identidad email verificado, anti-abuso,
-- plan source-of-truth, tests RLS de escritura y cuotas concurrentes.
