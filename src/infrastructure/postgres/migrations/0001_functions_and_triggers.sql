-- Equivalente local às RPCs/triggers do Supabase (supabase/migrations/0001, 0002, 0004).
-- Sem RLS/policies aqui: a conexão direta via DATABASE_URL é server-only por design
-- (nunca chega ao browser — ver .claude/rules/security.md), então o papel de "anon"
-- do Postgres não existe nesse caminho; a lógica de negócio continua igual.

CREATE OR REPLACE FUNCTION claim_gift_item(
  p_gift_item_id uuid,
  p_guest_name text,
  p_guest_whatsapp text DEFAULT NULL
) RETURNS gift_claims
LANGUAGE plpgsql
AS $$
DECLARE
  v_updated_rows integer;
  v_claim gift_claims;
BEGIN
  UPDATE gift_items
    SET status = 'CLAIMED'
    WHERE id = p_gift_item_id AND status = 'AVAILABLE';

  GET DIAGNOSTICS v_updated_rows = ROW_COUNT;

  IF v_updated_rows = 0 THEN
    RAISE EXCEPTION 'ALREADY_CLAIMED';
  END IF;

  INSERT INTO gift_claims (gift_item_id, guest_name, guest_whatsapp, quantity_claimed)
  VALUES (p_gift_item_id, p_guest_name, p_guest_whatsapp, 1)
  RETURNING * INTO v_claim;

  RETURN v_claim;
END;
$$;
--> statement-breakpoint

CREATE OR REPLACE FUNCTION check_diaper_pack_fulfillment()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_total integer;
  v_needed integer;
  v_category gift_category;
BEGIN
  SELECT quantity_needed, category INTO v_needed, v_category
    FROM gift_items WHERE id = new.gift_item_id;

  IF v_category != 'DIAPER_PACK' THEN
    RETURN new;
  END IF;

  SELECT coalesce(sum(quantity_claimed), 0) INTO v_total
    FROM gift_claims WHERE gift_item_id = new.gift_item_id;

  IF v_total >= v_needed THEN
    UPDATE gift_items SET status = 'FULFILLED' WHERE id = new.gift_item_id;
  END IF;

  RETURN new;
END;
$$;
--> statement-breakpoint

CREATE TRIGGER trg_diaper_pack_fulfillment
AFTER INSERT ON gift_claims
FOR EACH ROW
EXECUTE FUNCTION check_diaper_pack_fulfillment();
--> statement-breakpoint

CREATE TYPE rsvp_upsert_status AS ENUM ('CREATED', 'UPDATED', 'ALREADY_EXISTS');
--> statement-breakpoint

CREATE OR REPLACE FUNCTION upsert_rsvp(
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
  SELECT * INTO v_existing FROM rsvps WHERE whatsapp_number = p_whatsapp_number;

  IF v_existing.id IS NULL THEN
    INSERT INTO rsvps (guest_name, companion_count, whatsapp_number)
    VALUES (p_guest_name, p_companion_count, p_whatsapp_number);

    RETURN QUERY SELECT 'CREATED'::rsvp_upsert_status, p_guest_name, p_companion_count;
  ELSIF p_confirm_update THEN
    UPDATE rsvps SET companion_count = p_companion_count WHERE whatsapp_number = p_whatsapp_number;

    RETURN QUERY SELECT 'UPDATED'::rsvp_upsert_status, v_existing.guest_name, p_companion_count;
  ELSE
    RETURN QUERY SELECT 'ALREADY_EXISTS'::rsvp_upsert_status, v_existing.guest_name, v_existing.companion_count;
  END IF;
END;
$$;
