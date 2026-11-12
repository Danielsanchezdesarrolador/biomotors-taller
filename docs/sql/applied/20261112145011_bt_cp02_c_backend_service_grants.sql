-- Aplicado al proyecto Supabase biomotors-taller: versión 20261112145011.
-- Permisos de administración desde backend confiable; jamás exponer service_role.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.workshops,
  public.profiles,
  public.workshop_memberships
TO service_role;
