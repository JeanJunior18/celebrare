-- upsert_rsvp passa a escopar por evento — a unicidade de whatsapp_number
-- agora é (event_id, whatsapp_number), não mais global (migration 0008).
-- Repositórios já passam event_id explicitamente (fase 7), então a function
-- default_event_id() criada na fase 4 como DEFAULT de coluna não tem mais
-- consumidor — removida junto.
CREATE OR REPLACE FUNCTION upsert_rsvp(
  p_event_id uuid,
  p_guest_name text,
  p_companion_count integer,
  p_whatsapp_number text,
  p_confirm_update boolean DEFAULT false
) RETURNS TABLE (
  status rsvp_upsert_status,
  guest_name text,
  companion_count integer
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_existing rsvps;
BEGIN
  SELECT * INTO v_existing FROM rsvps
    WHERE event_id = p_event_id AND whatsapp_number = p_whatsapp_number;

  IF v_existing.id IS NULL THEN
    INSERT INTO rsvps (event_id, guest_name, companion_count, whatsapp_number)
    VALUES (p_event_id, p_guest_name, p_companion_count, p_whatsapp_number);

    RETURN QUERY SELECT 'CREATED'::rsvp_upsert_status, p_guest_name, p_companion_count;
  ELSIF p_confirm_update THEN
    UPDATE rsvps SET companion_count = p_companion_count
      WHERE event_id = p_event_id AND whatsapp_number = p_whatsapp_number;

    RETURN QUERY SELECT 'UPDATED'::rsvp_upsert_status, v_existing.guest_name, p_companion_count;
  ELSE
    RETURN QUERY SELECT 'ALREADY_EXISTS'::rsvp_upsert_status, v_existing.guest_name, v_existing.companion_count;
  END IF;
END;
$$;
--> statement-breakpoint

DROP FUNCTION IF EXISTS default_event_id();
