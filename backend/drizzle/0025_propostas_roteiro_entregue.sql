-- PR 20: idempotência na entrega do link do roteiro pós-compra
ALTER TABLE propostas
  ADD COLUMN IF NOT EXISTS roteiro_entregue boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_propostas_roteiro_entregue_pendente
  ON propostas (roteiro_entregue)
  WHERE roteiro_entregue = false;
