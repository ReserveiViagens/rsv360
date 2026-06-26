import { eq } from 'drizzle-orm';
import { db } from '../../lib/db';
import { pacotesTemplate, propostas } from '../../../backend/src/db/schema/propostas';
import { buscarContextoRag } from './rag';

export type SugestaoCopiloto = {
  titulo: string;
  resumo: string;
  fontes: string[];
};

export async function sugerirPacoteFromProposta(propostaId: number): Promise<SugestaoCopiloto> {
  const [row] = await db.select().from(propostas).where(eq(propostas.id, propostaId));
  if (!row) throw new Error('Proposta não encontrada');

  const contexto = await buscarContextoRag(row.titulo);
  const resumo = contexto.length
    ? `Sugestão baseada em ${contexto.length} trechos de conhecimento.`
    : 'Sugestão heurística (RAG vazio).';

  return {
    titulo: `Pacote — ${row.titulo}`,
    resumo,
    fontes: contexto.map((c) => c.fonte),
  };
}

export async function criarTemplateFromProposta(propostaId: number, enterpriseId?: number) {
  const sugestao = await sugerirPacoteFromProposta(propostaId);
  const [row] = await db.select().from(propostas).where(eq(propostas.id, propostaId));
  if (!row) throw new Error('Proposta não encontrada');

  const [created] = await db
    .insert(pacotesTemplate)
    .values({
      enterpriseId: enterpriseId ?? row.enterpriseId ?? null,
      nome: sugestao.titulo,
      categoria: 'copiloto',
      descricao: sugestao.resumo,
      conteudo: { fromPropostaId: propostaId, fontes: sugestao.fontes, conteudo: row.conteudo },
    })
    .returning();

  return created;
}
