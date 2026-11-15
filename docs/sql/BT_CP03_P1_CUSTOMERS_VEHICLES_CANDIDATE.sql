-- ByteTorque BT-CP03-P1 — CANDIDATA, NO APLICADA EN SUPABASE ALOJADO.
-- Exclusivamente para PostgreSQL 17 efimero hasta aprobacion expresa.
-- Requiere tablas y RLS autenticas de BT-CP02-C ya aplicadas.
-- Sin clientes de Ignacio ni informacion personal real.
BEGIN;

CREATE TABLE public.customers (
  workshop_id uuid NOT NULL REFERENCES public.workshops(id) ON DELETE RESTRICT,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  full_name text NOT NULL CHECK (char_length(btrim(full_name)) BETWEEN 2 AND 120),
  email text CHECK (
    email IS NULL OR
    (char_length(email) BETWEEN 5 AND 254 AND email = lower(btrim(email)) AND
      email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$')
  ),
  mobile_e164 text CHECK (mobile_e164 IS NULL OR mobile_e164 ~ '^\\+569[0-9]{8}$'),
  notes text CHECK (notes IS NULL OR char_length(notes) <= 1000),
  archived_at timestamptz,
  created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (workshop_id, id)
);

CREATE TABLE public.vehicles (
  workshop_id uuid NOT NULL REFERENCES public.workshops(id) ON DELETE RESTRICT,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL,
  plate text,
  plate_key text GENERATED ALWAYS AS (
    nullif(upper(regexp_replace(coalesce(plate, ''), '[^A-Za-z0-9]', '', 'g')), '')
  ) STORED,
  make text NOT NULL CHECK (char_length(btrim(make)) BETWEEN 2 AND 80),
  model text NOT NULL CHECK (char_length(btrim(model)) BETWEEN 1 AND 80),
  model_year integer CHECK (model_year IS NULL OR model_year BETWEEN 1900 AND 2100),
  odometer_km integer CHECK (odometer_km IS NULL OR odometer_km BETWEEN 0 AND 3000000),
  archived_at timestamptz,
  created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (workshop_id, id),
  FOREIGN KEY (workshop_id, customer_id)
    REFERENCES public.customers(workshop_id, id) ON DELETE RESTRICT,
  CONSTRAINT vehicles_plate_valid CHECK (
    plate IS NULL OR (char_length(plate) BETWEEN 5 AND 14 AND
      upper(regexp_replace(plate, '[^A-Za-z0-9]', '', 'g')) ~ '^[A-Z0-9]{5,8}$')
  )
);
CREATE UNIQUE INDEX vehicles_plate_unique_per_workshop
  ON public.vehicles(workshop_id, plate_key) WHERE plate_key IS NOT NULL;
CREATE INDEX customers_name_by_workshop ON public.customers(workshop_id, lower(full_name));
CREATE INDEX vehicles_customer_by_workshop ON public.vehicles(workshop_id, customer_id);

-- El timestamp de revision no depende del navegador.
CREATE FUNCTION public.bt_cp03_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER
SET search_path = pg_catalog
AS $$ BEGIN NEW.updated_at := statement_timestamp(); RETURN NEW; END $$;
REVOKE ALL ON FUNCTION public.bt_cp03_touch_updated_at()
  FROM PUBLIC, anon, authenticated;
CREATE TRIGGER customers_touch_updated_at
  BEFORE UPDATE ON public.customers FOR EACH ROW
  EXECUTE FUNCTION public.bt_cp03_touch_updated_at();
CREATE TRIGGER vehicles_touch_updated_at
  BEFORE UPDATE ON public.vehicles FOR EACH ROW
  EXECUTE FUNCTION public.bt_cp03_touch_updated_at();

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers FORCE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.customers, public.vehicles FROM PUBLIC, anon, authenticated;
-- Mecánicos: SOLO lectura. Recepción, owner y admin: escribir con RLS.
GRANT SELECT ON TABLE public.customers, public.vehicles TO authenticated;
GRANT INSERT (workshop_id, full_name, email, mobile_e164, notes)
  ON public.customers TO authenticated;
GRANT UPDATE (full_name, email, mobile_e164, notes, archived_at)
  ON public.customers TO authenticated;
GRANT INSERT (workshop_id, customer_id, plate, make, model, model_year, odometer_km)
  ON public.vehicles TO authenticated;
GRANT UPDATE (customer_id, plate, make, model, model_year, odometer_km, archived_at)
  ON public.vehicles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.customers, public.vehicles
  TO service_role;

CREATE POLICY customers_read_active_member ON public.customers
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.workshop_memberships m
      WHERE m.workshop_id = customers.workshop_id
        AND m.user_id = (SELECT auth.uid()) AND m.status = 'active')
  );
CREATE POLICY customers_insert_staff ON public.customers
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.workshop_memberships m
      JOIN public.workshops w ON w.id = m.workshop_id
      WHERE m.workshop_id = customers.workshop_id
        AND m.user_id = (SELECT auth.uid()) AND m.status = 'active'
        AND m.role IN ('owner', 'admin', 'reception') AND w.status = 'active')
  );
CREATE POLICY customers_update_staff ON public.customers
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.workshop_memberships m
      JOIN public.workshops w ON w.id = m.workshop_id
      WHERE m.workshop_id = customers.workshop_id
        AND m.user_id = (SELECT auth.uid()) AND m.status = 'active'
        AND m.role IN ('owner', 'admin', 'reception') AND w.status = 'active')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.workshop_memberships m
      JOIN public.workshops w ON w.id = m.workshop_id
      WHERE m.workshop_id = customers.workshop_id
        AND m.user_id = (SELECT auth.uid()) AND m.status = 'active'
        AND m.role IN ('owner', 'admin', 'reception') AND w.status = 'active')
  );

CREATE POLICY vehicles_read_active_member ON public.vehicles
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.workshop_memberships m
      WHERE m.workshop_id = vehicles.workshop_id
        AND m.user_id = (SELECT auth.uid()) AND m.status = 'active')
  );
CREATE POLICY vehicles_insert_staff ON public.vehicles
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.workshop_memberships m
      JOIN public.workshops w ON w.id = m.workshop_id
      WHERE m.workshop_id = vehicles.workshop_id
        AND m.user_id = (SELECT auth.uid()) AND m.status = 'active'
        AND m.role IN ('owner', 'admin', 'reception') AND w.status = 'active')
  );
CREATE POLICY vehicles_update_staff ON public.vehicles
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.workshop_memberships m
      JOIN public.workshops w ON w.id = m.workshop_id
      WHERE m.workshop_id = vehicles.workshop_id
        AND m.user_id = (SELECT auth.uid()) AND m.status = 'active'
        AND m.role IN ('owner', 'admin', 'reception') AND w.status = 'active')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.workshop_memberships m
      JOIN public.workshops w ON w.id = m.workshop_id
      WHERE m.workshop_id = vehicles.workshop_id
        AND m.user_id = (SELECT auth.uid()) AND m.status = 'active'
        AND m.role IN ('owner', 'admin', 'reception') AND w.status = 'active')
  );

COMMENT ON TABLE public.customers IS 'ByteTorque CP03 candidato: fichas de clientes por taller; no contiene datos reales.';
COMMENT ON TABLE public.vehicles IS 'ByteTorque CP03 candidato: ficha vehicular vinculada exclusivamente a cliente del mismo taller.';
COMMIT;
