-- Stop NEW version admission only. Preserve V3 policy, overload and dual renderer
-- for recoverable work and all immutable originals. No data deleted.
BEGIN;
DO $$BEGIN IF current_setting('bt_multipunto_pdf.external_barrier',true) IS DISTINCT FROM 'verified' THEN RAISE EXCEPTION 'MP_PDF_REQUIRES_VERIFIED_EXTERNAL_BARRIER';END IF;
 PERFORM id FROM bt_multipunto_private.control FOR UPDATE;
 IF (SELECT md5(prosrc) FROM pg_proc WHERE oid='bt_multipunto_private.capture(uuid,uuid)'::regprocedure)<>'7cd7e3fc609d4885c0317f62c655698e' THEN RAISE EXCEPTION 'MP_PDF_ROLLBACK_BASE_MISMATCH';END IF;END$$;
CREATE OR REPLACE FUNCTION bt_multipunto_private.capture(w uuid,o uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE a jsonb;previous record;candidate jsonb;BEGIN
 a:=bt_multipunto_private.authorize(w);
 -- Version selection is not authority. Unchanged prepare/complete revalidate
 -- consent, scope, snapshot, session, lease and the single commercial ledger.
 -- Preserve a live paid credit (or recoverable reservation) across installation.
 FOR previous IN
  SELECT x.policy_id,x.snapshot_hash,x.source_hash
  FROM bt_commercial_private.consumption c
  JOIN bt_multipunto_private.credits b ON b.credit_id=c.request_id
  JOIN bt_multipunto_private.snapshots x ON x.id=b.snapshot_id AND x.workshop_id=w AND x.order_id=o
  WHERE c.workshop_id=w AND c.resource_id=o AND c.capability='multipunto'
   AND c.actor_id=(a->>'actor')::uuid AND c.session_id=a->>'session'
   AND c.state IN('reserved','confirmed') AND c.expires_at>clock_timestamp()
   AND b.authority=a AND a->>'plan'<>'basic'
  ORDER BY c.confirmed_at DESC NULLS LAST,c.reserved_at DESC,c.request_id
 LOOP
  candidate:=bt_multipunto_private.capture(w,o,previous.policy_id);
  IF candidate->>'snapshotHash'=previous.snapshot_hash AND candidate->>'sourceHash'=previous.source_hash THEN RETURN candidate;END IF;
 END LOOP;
 RETURN bt_multipunto_private.capture(w,o,'MP-V2-2');
END$$;
COMMIT;
