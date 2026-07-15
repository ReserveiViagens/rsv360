import type { FornecedorAdapter, OfertaNormalizada } from '../types';
import { ofertaSchema } from '../schema';

export function makeGenericHotelAdapter(cfg: {
  nome: string;
  endpoint: string;
  apiKey: string;
}): FornecedorAdapter {
  return {
    nome: cfg.nome,
    async buscar(destino, _params): Promise<OfertaNormalizada[]> {
      const resp = await fetch(`${cfg.endpoint}/search?dest=${encodeURIComponent(destino)}`, {
        headers: { Authorization: `Bearer ${cfg.apiKey}` },
      });

      if (!resp.ok) {
        throw new Error(`fornecedor ${cfg.nome} HTTP ${resp.status}`);
      }

      const raw = (await resp.json()) as Array<Record<string, unknown>>;

      return raw.flatMap((r): OfertaNormalizada[] => {
        const candidata: OfertaNormalizada = {
          fornecedor: cfg.nome,
          tipo: 'hospedagem',
          titulo: String(r.name ?? r.hotel_name ?? ''),
          preco: Number(r.price ?? r.total),
          moeda: 'BRL',
          imagens: Array.isArray(r.images) ? r.images.map(String) : [],
          descricao: String(r.description ?? ''),
          fonte: String(r.url ?? cfg.endpoint),
          capturadoEm: new Date().toISOString(),
        };

        const parsed = ofertaSchema.safeParse(candidata);
        if (!parsed.success) {
          console.warn('[fornecedores-hub] oferta inválida descartada', {
            fornecedor: cfg.nome,
            err: parsed.error.flatten(),
          });
          return [];
        }
        return [candidata];
      });
    },
  };
}
