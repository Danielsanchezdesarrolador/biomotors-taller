-- ByteTorque CP04 — CANDIDATE ONLY: do not apply to hosted Supabase without
-- a distinct director authorization. Uses existing CP02/CP03 Auth, RLS,
-- customer and vehicle tables. No irreversible DROP, no real data.
BEGIN;
CREATE TABLE public.work_orders (
  workshop_id uuid NOT NULL REFERENCES public.workshops(id) ON DELETE RESTRICT,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL,
  complaint text NOT NULL CHECK (char_length(btrim(complaint)) BETWEEN 3 AND 2000),
  intake_odometer integer CHECK (intake_odometer IS NULL OR intake_odometer BETWEEN 0 AND 3000000),
  status text NOT NULL DEFAULT 'received'
    CHECK (status IN ('received','inspecting','in_service','ready','closed')),
  opened_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE RESTRICT,
  opened_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (workshop_id,id),
  UNIQUE (workshop_id,id,vehicle_id),
  FOREIGN KEY (workshop_id,vehicle_id)
    REFERENCES public.vehicles(workshop_id,id) ON DELETE RESTRICT,
  CONSTRAINT work_orders_closed_at CHECK (
    (status='closed' AND closed_at IS NOT NULL) OR
    (status<>'closed' AND closed_at IS NULL))
);
CREATE UNIQUE INDEX cp04_one_open_order_per_vehicle
  ON public.work_orders(workshop_id,vehicle_id) WHERE status<>'closed';
CREATE INDEX cp04_orders_recent ON public.work_orders(workshop_id,opened_at DESC);
CREATE INDEX cp04_orders_by_vehicle ON public.work_orders(workshop_id,vehicle_id,opened_at DESC);

CREATE TABLE public.inspection_findings (
  workshop_id uuid NOT NULL REFERENCES public.workshops(id) ON DELETE RESTRICT,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  vehicle_id uuid NOT NULL,
  category text NOT NULL CHECK (char_length(btrim(category)) BETWEEN 2 AND 80),
  result text NOT NULL CHECK (result IN ('ok','attention','not_checked')),
  note text CHECK (note IS NULL OR char_length(note) <= 2000),
  resolution text NOT NULL DEFAULT 'not_applicable'
    CHECK (resolution IN ('not_applicable','pending','resolved')),
  resolved_at timestamptz,
  recorded_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(workshop_id,id),
  FOREIGN KEY(workshop_id,order_id,vehicle_id)
    REFERENCES public.work_orders(workshop_id,id,vehicle_id) ON DELETE RESTRICT,
  CONSTRAINT cp04_finding_resolution CHECK (
    (result='attention' AND resolution IN ('pending','resolved') AND
      note IS NOT NULL AND char_length(btrim(note)) >= 3) OR
    (result IN ('ok','not_checked') AND resolution='not_applicable')),
  CONSTRAINT cp04_resolution_timestamp CHECK (
    (resolution='resolved' AND resolved_at IS NOT NULL) OR
    (resolution<>'resolved' AND resolved_at IS NULL))
);
CREATE INDEX cp04_findings_by_order
  ON public.inspection_findings(workshop_id,order_id,created_at);
CREATE INDEX cp04_pending_by_vehicle
  ON public.inspection_findings(workshop_id,vehicle_id,created_at DESC)
  WHERE resolution='pending';

-- These triggers rely on the existing CP03 server-side updated_at helper.
CREATE TRIGGER cp04_order_updated
  BEFORE UPDATE ON public.work_orders FOR EACH ROW
  EXECUTE FUNCTION public.bt_cp03_touch_updated_at();
CREATE TRIGGER cp04_finding_updated
  BEFORE UPDATE ON public.inspection_findings FOR EACH ROW
  EXECUTE FUNCTION public.bt_cp03_touch_updated_at();

-- Server timestamps cannot be supplied or forged by the browser. All status
-- changes are validated by existing RLS; closed orders cannot be reopened.
CREATE FUNCTION public.bt_cp04_order_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog AS $$
BEGIN
  IF TG_OP='UPDATE' THEN
    IF OLD.status='closed' THEN RAISE EXCEPTION 'ORDER_IS_CLOSED' USING ERRCODE='23514'; END IF;
    IF NEW.vehicle_id<>OLD.vehicle_id OR NEW.opened_by<>OLD.opened_by OR
       NEW.opened_at<>OLD.opened_at OR NEW.workshop_id<>OLD.workshop_id OR NEW.id<>OLD.id
    THEN RAISE EXCEPTION 'ORDER_KEYS_IMMUTABLE' USING ERRCODE='23514'; END IF;
    IF NEW.status='closed' AND OLD.status<>'closed' THEN
      NEW.closed_at:=statement_timestamp();
    ELSE NEW.closed_at:=NULL;
    END IF;
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.bt_cp04_order_guard() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER cp04_guard_order BEFORE UPDATE ON public.work_orders
  FOR EACH ROW EXECUTE FUNCTION public.bt_cp04_order_guard();

-- Findings are original diagnosis entries. They may be corrected before close.
-- After close, only the outstanding resolution flag may change, preserving
-- original category, result and note of the historical visit.
CREATE FUNCTION public.bt_cp04_finding_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog AS $$
DECLARE finished boolean;
BEGIN
  IF TG_OP='UPDATE' THEN
    IF NEW.workshop_id<>OLD.workshop_id OR NEW.id<>OLD.id OR
       NEW.order_id<>OLD.order_id OR NEW.vehicle_id<>OLD.vehicle_id OR
       NEW.recorded_by<>OLD.recorded_by OR NEW.created_at<>OLD.created_at
    THEN RAISE EXCEPTION 'FINDING_KEYS_IMMUTABLE' USING ERRCODE='23514'; END IF;
    SELECT o.status='closed' INTO finished FROM public.work_orders o
      WHERE o.workshop_id=OLD.workshop_id AND o.id=OLD.order_id;
    IF finished AND
      (NEW.category<>OLD.category OR NEW.result<>OLD.result OR
       NEW.note IS DISTINCT FROM OLD.note)
    THEN RAISE EXCEPTION 'CLOSED_DIAGNOSIS_IMMUTABLE' USING ERRCODE='23514'; END IF;
    IF NEW.resolution='resolved' AND OLD.resolution<>'resolved' THEN
      NEW.resolved_at:=statement_timestamp();
    ELSIF NEW.resolution<>'resolved' THEN
      NEW.resolved_at:=NULL;
    ELSE
      NEW.resolved_at:=OLD.resolved_at;
    END IF;
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.bt_cp04_finding_guard() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER cp04_guard_finding BEFORE UPDATE ON public.inspection_findings
  FOR EACH ROW EXECUTE FUNCTION public.bt_cp04_finding_guard();

ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders FORCE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_findings FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.work_orders, public.inspection_findings
  FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.work_orders, public.inspection_findings TO authenticated;
GRANT INSERT (workshop_id,vehicle_id,complaint,intake_odometer)
  ON public.work_orders TO authenticated;
GRANT UPDATE (complaint,intake_odometer,status)
  ON public.work_orders TO authenticated;
GRANT INSERT (workshop_id,order_id,vehicle_id,category,result,note,resolution)
  ON public.inspection_findings TO authenticated;
GRANT UPDATE (category,result,note,resolution)
  ON public.inspection_findings TO authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON TABLE public.work_orders, public.inspection_findings
  TO service_role;

CREATE POLICY cp04_orders_read ON public.work_orders FOR SELECT TO authenticated
USING(EXISTS(
  SELECT 1 FROM public.workshop_memberships m JOIN public.workshops w
    ON w.id=m.workshop_id
  WHERE m.workshop_id=work_orders.workshop_id AND m.user_id=(SELECT auth.uid())
    AND m.status='active' AND w.status='active'));
CREATE POLICY cp04_orders_insert ON public.work_orders FOR INSERT TO authenticated
WITH CHECK(EXISTS(
  SELECT 1 FROM public.workshop_memberships m JOIN public.workshops w ON w.id=m.workshop_id
  WHERE m.workshop_id=work_orders.workshop_id AND m.user_id=(SELECT auth.uid())
    AND m.status='active' AND w.status='active' AND
    m.role IN ('owner','admin','reception')));
CREATE POLICY cp04_orders_update ON public.work_orders FOR UPDATE TO authenticated
USING(EXISTS(
  SELECT 1 FROM public.workshop_memberships m JOIN public.workshops w ON w.id=m.workshop_id
  WHERE m.workshop_id=work_orders.workshop_id AND m.user_id=(SELECT auth.uid())
    AND m.status='active' AND w.status='active' AND
    m.role IN ('owner','admin','reception') AND work_orders.status<>'closed'))
WITH CHECK(EXISTS(
  SELECT 1 FROM public.workshop_memberships m JOIN public.workshops w ON w.id=m.workshop_id
  WHERE m.workshop_id=work_orders.workshop_id AND m.user_id=(SELECT auth.uid())
    AND m.status='active' AND w.status='active' AND m.role IN ('owner','admin','reception')));

CREATE POLICY cp04_findings_read ON public.inspection_findings FOR SELECT TO authenticated
USING(EXISTS(
  SELECT 1 FROM public.workshop_memberships m JOIN public.workshops w ON w.id=m.workshop_id
  WHERE m.workshop_id=inspection_findings.workshop_id AND m.user_id=(SELECT auth.uid())
    AND m.status='active' AND w.status='active'));
CREATE POLICY cp04_findings_insert ON public.inspection_findings FOR INSERT TO authenticated
WITH CHECK(EXISTS(
  SELECT 1 FROM public.workshop_memberships m JOIN public.workshops w ON w.id=m.workshop_id
  JOIN public.work_orders o ON o.workshop_id=inspection_findings.workshop_id
    AND o.id=inspection_findings.order_id AND o.vehicle_id=inspection_findings.vehicle_id
  WHERE m.workshop_id=inspection_findings.workshop_id AND m.user_id=(SELECT auth.uid())
    AND m.status='active' AND w.status='active'
    AND m.role IN ('owner','admin','reception','mechanic') AND o.status<>'closed'));
CREATE POLICY cp04_findings_update ON public.inspection_findings FOR UPDATE TO authenticated
USING(EXISTS(
  SELECT 1 FROM public.workshop_memberships m JOIN public.workshops w ON w.id=m.workshop_id
  WHERE m.workshop_id=inspection_findings.workshop_id AND m.user_id=(SELECT auth.uid())
    AND m.status='active' AND w.status='active'
    AND m.role IN ('owner','admin','reception','mechanic')))
WITH CHECK(EXISTS(
  SELECT 1 FROM public.workshop_memberships m JOIN public.workshops w ON w.id=m.workshop_id
  WHERE m.workshop_id=inspection_findings.workshop_id AND m.user_id=(SELECT auth.uid())
    AND m.status='active' AND w.status='active'
    AND m.role IN ('owner','admin','reception','mechanic')));
COMMENT ON TABLE public.work_orders IS 'CP04 workshop intake and work order per vehicle, candidate until approved';
COMMENT ON TABLE public.inspection_findings IS 'CP04 diagnosis and outstanding observations; append-only visit history after closure';
COMMIT;
