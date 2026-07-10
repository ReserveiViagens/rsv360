-- Corrige propostas aceitas erroneamente marcadas como expired pelo worker
-- (valido_ate comercial vencido após aceite — gap corrigido em proposta-validade).
UPDATE propostas p
SET status = 'accepted', updated_at = NOW()
WHERE p.status = 'expired'
  AND EXISTS (
    SELECT 1
    FROM proposta_eventos e
    WHERE e.proposta_id = p.id
      AND e.tipo = 'public_accept'
  );
