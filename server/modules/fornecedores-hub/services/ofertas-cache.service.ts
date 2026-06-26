import { eq } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { ofertasCache } from '../../../../backend/src/db/schema/ofertas-cache';
import type { OfertaNormalizada } from '../types';

export class OfertasCacheService {
  async ler(chave: string) {
    const [row] = await db.select().from(ofertasCache).where(eq(ofertasCache.chave, chave));
    return row ?? null;
  }

  async gravar(chave: string, ofertas: OfertaNormalizada[], origem: string): Promise<void> {
    const capturadoEm = new Date();
    await db
      .insert(ofertasCache)
      .values({
        chave,
        ofertas,
        origem,
        capturadoEm,
        atualizadoEm: capturadoEm,
      })
      .onConflictDoUpdate({
        target: ofertasCache.chave,
        set: {
          ofertas,
          origem,
          capturadoEm,
          atualizadoEm: capturadoEm,
        },
      });
  }

  async apagar(chave: string): Promise<void> {
    await db.delete(ofertasCache).where(eq(ofertasCache.chave, chave));
  }
}

export const ofertasCacheService = new OfertasCacheService();
