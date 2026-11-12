-- Supabase migration 20261112150019: bt_cp02_d_atomic_owner_onboarding
-- Function definition fetched from live Postgres after successful migration.
CREATE OR REPLACE FUNCTION public.bootstrap_workshop_owner(p_owner_user_id uuid, p_workshop_name text, p_display_name text)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE
  v_existing uuid;
  v_workshop_id uuid;
BEGIN
  IF p_owner_user_id IS NULL
     OR p_workshop_name IS NULL OR
        pg_catalog.char_length(pg_catalog.btrim(p_workshop_name)) NOT BETWEEN 2 AND 120
     OR p_display_name IS NULL OR
        pg_catalog.char_length(pg_catalog.btrim(p_display_name)) NOT BETWEEN 2 AND 120
  THEN
    RAISE EXCEPTION 'Invalid workshop onboarding arguments'
      USING ERRCODE = '22023';
  END IF;

  -- Serialize retries/concurrent onboarding requests for one owner.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    4271, pg_catalog.hashtext(p_owner_user_id::text)
  );

  SELECT m.workshop_id INTO v_existing
    FROM public.workshop_memberships AS m
   WHERE m.user_id = p_owner_user_id
     AND m.role = 'owner'
   ORDER BY m.created_at, m.id
   LIMIT 1;

  IF v_existing IS NOT NULL THEN
    RETURN v_existing;
  END IF;

  INSERT INTO public.workshops (name)
    VALUES (pg_catalog.btrim(p_workshop_name))
    RETURNING id INTO v_workshop_id;

  INSERT INTO public.profiles (user_id, display_name)
    VALUES (p_owner_user_id, pg_catalog.btrim(p_display_name))
    ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.workshop_memberships (
    workshop_id, user_id, role, status
  ) VALUES (v_workshop_id, p_owner_user_id, 'owner', 'active');

  RETURN v_workshop_id;
END;
$function$

REVOKE ALL ON FUNCTION public.bootstrap_workshop_owner(uuid, text, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_workshop_owner(uuid, text, text)
  TO service_role;
COMMENT ON FUNCTION public.bootstrap_workshop_owner(uuid, text, text)
  IS 'ByteTorque: atomic owner onboarding; backend-only service_role, SECURITY INVOKER; requires verified Auth user via server.';
