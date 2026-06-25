-- gift_claims.event_id é NOT NULL sem default (fase 7) — a function precisa
-- preenchê-lo. Aproveitamos pra também validar que o gift_item pertence ao
-- evento informado (escopo do `WHERE` do UPDATE), evitando que um
-- giftItemId de outro evento seja reivindicado pela rota pública de um
-- evento diferente.
CREATE OR REPLACE FUNCTION claim_gift_item(
  p_event_id uuid,
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
    WHERE id = p_gift_item_id AND event_id = p_event_id AND status = 'AVAILABLE';

  GET DIAGNOSTICS v_updated_rows = ROW_COUNT;

  IF v_updated_rows = 0 THEN
    RAISE EXCEPTION 'ALREADY_CLAIMED';
  END IF;

  INSERT INTO gift_claims (event_id, gift_item_id, guest_name, guest_whatsapp, quantity_claimed)
  VALUES (p_event_id, p_gift_item_id, p_guest_name, p_guest_whatsapp, 1)
  RETURNING * INTO v_claim;

  RETURN v_claim;
END;
$$;
--> statement-breakpoint

DROP FUNCTION IF EXISTS claim_gift_item(uuid, text, text);
