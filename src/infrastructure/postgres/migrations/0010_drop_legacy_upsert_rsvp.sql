-- `CREATE OR REPLACE FUNCTION` não substitui uma function quando a lista de
-- parâmetros muda — cria um overload novo. A migration 0009 criou
-- upsert_rsvp(uuid, text, integer, text, boolean) sem remover a assinatura
-- antiga upsert_rsvp(text, integer, text, boolean), que ficou órfã (nenhum
-- repositório a chama mais).
DROP FUNCTION IF EXISTS upsert_rsvp(text, integer, text, boolean);
