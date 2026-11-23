-- CANDIDATE ONLY. Requires CP05 base SQL, S4 recovery and explicit hosted approval.
-- Additive read-only recovery: never rewrites a snapshot, revision or Storage object.
BEGIN;
CREATE UNIQUE INDEX cp05_completed_version ON bt_cp05_private.issue_requests(workshop_id,quote_id,expected_version) WHERE state='completed';
CREATE FUNCTION bt_cp05_private.completed_issue(wid uuid,qid uuid,expected bigint,actor uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE answer jsonb;
BEGIN
 PERFORM bt_cp05_private.authorize(wid,actor,true);
 IF expected IS NULL OR expected<1 THEN RAISE EXCEPTION 'CP05_INVALID_VERSION' USING ERRCODE='22023'; END IF;
 SELECT jsonb_build_object('request_id',req.request_id,'revision',req.revision,
   'payload',r.payload,'payload_sha256',r.payload_sha256,'completed',to_jsonb(r)) INTO answer
 FROM bt_cp05_private.issue_requests req JOIN public.quote_revisions r
   ON r.workshop_id=req.workshop_id AND r.id=req.revision_id AND r.quote_id=req.quote_id
 WHERE req.workshop_id=wid AND req.quote_id=qid AND req.expected_version=expected
   AND req.actor_id=actor AND req.state='completed';
 RETURN answer;
END $$;
CREATE FUNCTION public.bt_cp05_completed_issue(p_workshop_id uuid,p_quote_id uuid,p_expected_version bigint,p_actor_id uuid)
RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path=pg_catalog AS $$
 SELECT bt_cp05_private.completed_issue(p_workshop_id,p_quote_id,p_expected_version,p_actor_id)
$$;
REVOKE ALL ON FUNCTION bt_cp05_private.completed_issue(uuid,uuid,bigint,uuid) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.bt_cp05_completed_issue(uuid,uuid,bigint,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION bt_cp05_private.completed_issue(uuid,uuid,bigint,uuid),
 public.bt_cp05_completed_issue(uuid,uuid,bigint,uuid) TO service_role;
COMMIT;
