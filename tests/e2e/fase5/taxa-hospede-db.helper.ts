/**
 * Helpers E2E — taxa hóspede (isolamento DB).
 * Requer DATABASE_URL apontando para o Postgres de teste/staging.
 */
import pg from 'pg';

const CHAVE = 'comissoes';

export async function readComissoesValores(): Promise<Record<string, unknown>> {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const res = await client.query(
      `SELECT valores FROM configuracoes_sistema WHERE chave = $1 LIMIT 1`,
      [CHAVE],
    );
    return (res.rows[0]?.valores as Record<string, unknown>) ?? {};
  } finally {
    await client.end();
  }
}

export async function setTaxaHospedeFlags(ativa: boolean, pct = 2): Promise<void> {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(
      `UPDATE configuracoes_sistema
       SET valores = valores || $1::jsonb, updated_at = now()
       WHERE chave = $2`,
      [
        JSON.stringify({
          taxa_hospede_ativa: ativa,
          taxa_hospede_pct: pct,
          taxa_hospede_nome: 'Taxa de Segurança e Tecnologia',
          taxa_hospede_descricao: 'Inclui proteção da reserva, antifraude e suporte digital',
        }),
        CHAVE,
      ],
    );
  } finally {
    await client.end();
  }
}

export async function restoreComissoesValores(snapshot: Record<string, unknown>): Promise<void> {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(
      `UPDATE configuracoes_sistema SET valores = $1::jsonb, updated_at = now() WHERE chave = $2`,
      [JSON.stringify(snapshot), CHAVE],
    );
  } finally {
    await client.end();
  }
}
