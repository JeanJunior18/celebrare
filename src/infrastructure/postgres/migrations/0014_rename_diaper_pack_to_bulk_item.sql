-- Generaliza a categoria antes chamada DIAPER_PACK: mesma semântica
-- (overshoot permitido, fulfillment por soma de quantity_claimed), sem
-- referência a fraldas — serve pra roupas ou qualquer presente do mesmo
-- formato. Renomear o valor do enum preserva as linhas existentes sem
-- precisar de UPDATE.
ALTER TYPE "gift_category" RENAME VALUE 'DIAPER_PACK' TO 'BULK_ITEM';
--> statement-breakpoint

DROP TRIGGER trg_diaper_pack_fulfillment ON gift_claims;
--> statement-breakpoint

DROP FUNCTION check_diaper_pack_fulfillment();
--> statement-breakpoint

CREATE FUNCTION check_bulk_gift_fulfillment()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  v_total integer; v_needed integer; v_category gift_category;
BEGIN
  SELECT quantity_needed, category INTO v_needed, v_category
    FROM gift_items WHERE id = new.gift_item_id;
  IF v_category != 'BULK_ITEM' THEN
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

CREATE TRIGGER trg_bulk_gift_fulfillment
AFTER INSERT ON gift_claims
FOR EACH ROW
EXECUTE FUNCTION check_bulk_gift_fulfillment();
