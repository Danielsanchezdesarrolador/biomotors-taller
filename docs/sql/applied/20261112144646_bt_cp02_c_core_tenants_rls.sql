REVOKE EXECUTE ON FUNCTION public.rls_auto_enable()
  FROM PUBLIC, anon, authenticated;

-- No se otorga INSERT/UPDATE/DELETE de talleres ni membresías a clientes.
-- Alta de taller, roles e invitaciones: proceso transaccional privilegiado
-- en backend controlado, a diseñar y aprobar en la siguiente fase.
CREATE TABLE public.workshops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL
    CONSTRAINT workshops_name_valid CHECK
      (length(btrim(name)) BETWEEN 2 AND 120),
  status text NOT NULL DEFAULT 'active'
    CONSTRAINT workshops_status_valid CHECK
      (status IN ('active', 'suspended')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL
    CONSTRAINT profiles_name_valid CHECK
      (length(btrim(display_name)) BETWEEN 2 AND 120),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.workshop_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id uuid NOT NULL REFERENCES public.workshops(id)
    ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES auth.users(id)
    ON DELETE CASCADE,
  role text NOT NULL
    CONSTRAINT memberships_role_valid CHECK
      (role IN ('owner', 'admin', 'mechanic', 'reception')),
  status text NOT NULL DEFAULT 'active'
    CONSTRAINT memberships_status_valid CHECK
      (status IN ('active', 'disabled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT memberships_unique_user_tenant UNIQUE(workshop_id, user_id)
);

-- Ayudar las consultas SELECT de políticas y de contextos de usuario.
CREATE INDEX memberships_by_user_active
  ON public.workshop_memberships(user_id, workshop_id)
  WHERE status = 'active';

-- Activar RLS explícitamente aun si el trigger automático ya lo hace.
ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_memberships ENABLE ROW LEVEL SECURITY;

-- Advertencia: Supabase puede tener GRANTs automáticos amplios sobre public.
-- Retirarlos primero y reponer solo las operaciones estrictamente necesarias.
REVOKE ALL PRIVILEGES ON TABLE
  public.workshops,
  public.profiles,
  public.workshop_memberships
  FROM PUBLIC, anon, authenticated;

GRANT SELECT ON TABLE
  public.workshops,
  public.profiles,
  public.workshop_memberships
  TO authenticated;

-- Solo se habilita actualizar display_name; user_id es inmutable desde client.
GRANT UPDATE (display_name) ON public.profiles TO authenticated;

-- Un usuario solo lee su propia membresía; no puede crear ni elevar roles.
CREATE POLICY memberships_read_self ON public.workshop_memberships
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- El perfil personal solo puede verlo y editar su titular.
CREATE POLICY profiles_read_self ON public.profiles
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY profiles_update_self ON public.profiles
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- El taller se muestra únicamente a sus miembros ACTIVOS.
-- No recursividad: la policy de memberships usa solo auth.uid().
CREATE POLICY workshops_read_member ON public.workshops
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
        FROM public.workshop_memberships m
       WHERE m.workshop_id = workshops.id
         AND m.user_id = (SELECT auth.uid())
         AND m.status = 'active'
    )
  );

COMMENT ON TABLE public.workshops IS
 'ByteTorque: tenant del taller. Escritura solo backend privilegiado y auditado.';
COMMENT ON TABLE public.profiles IS
 'ByteTorque: perfil privado por usuario Auth; no define permisos.';
COMMENT ON TABLE public.workshop_memberships IS
 'ByteTorque: fuente autoritativa de membresía, rol y estado por taller.';
