-- PR 21: vouchers verificáveis por proposta (QR HMAC + auditoria de leitura)
CREATE TABLE IF NOT EXISTS proposta_vouchers (
  id serial PRIMARY KEY,
  proposta_id integer NOT NULL REFERENCES propostas(id) ON DELETE CASCADE,
  voucher_slug varchar(50) NOT NULL,
  titulo varchar(255) NOT NULL,
  hospede varchar(255),
  unidade varchar(255),
  check_in date,
  check_out date,
  voucher_validado_em timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT proposta_vouchers_proposta_slug_unique UNIQUE (proposta_id, voucher_slug)
);

CREATE INDEX IF NOT EXISTS idx_proposta_vouchers_proposta_id ON proposta_vouchers (proposta_id);
