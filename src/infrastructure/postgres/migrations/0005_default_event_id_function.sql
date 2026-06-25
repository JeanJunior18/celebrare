-- Função usada como DEFAULT de `event_id` nas 5 tabelas de domínio
-- (docs/saas-platform-plan.md, fase 4). Existe só pra manter os caminhos de
-- escrita atuais funcionando sem mudança de código enquanto o app ainda não
-- sabe escolher um evento (isso só chega na fase 7 — roteamento por slug).
-- Remover esse default quando os repositórios passarem a setar `event_id`
-- explicitamente.
CREATE OR REPLACE FUNCTION default_event_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT id FROM events WHERE slug = 'arca-do-davi' LIMIT 1;
$$;
