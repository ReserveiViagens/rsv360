import {
  apagarRedis,
  chaveCache,
  gravarRedis,
  lerRedis,
  POSTGRES_CACHE_TTL_MS,
} from './cache';
import { buscarPrecosConcorrencia } from './hub';
import type { BuscaParams, OfertaNormalizada } from './types';
import { ofertasCacheService } from './services/ofertas-cache.service';

export type CacheOrigem = 'redis' | 'postgres' | 'hub';

export type ResolverResult = {
  ofertas: OfertaNormalizada[];
  origem: CacheOrigem;
  chave: string;
};

export async function resolverOfertas(
  tipo: string,
  destino: string,
  params: BuscaParams = {},
): Promise<ResolverResult> {
  const chave = chaveCache(tipo, destino);

  const redisHit = await lerRedis(chave);
  if (redisHit) {
    return { ofertas: redisHit, origem: 'redis', chave };
  }

  const pgRow = await ofertasCacheService.ler(chave);
  if (pgRow) {
    const ageMs = Date.now() - pgRow.capturadoEm.getTime();
    if (ageMs <= POSTGRES_CACHE_TTL_MS) {
      await gravarRedis(chave, pgRow.ofertas);
      return { ofertas: pgRow.ofertas, origem: 'postgres', chave };
    }
  }

  const ofertas = await buscarPrecosConcorrencia(destino, params);
  await ofertasCacheService.gravar(chave, ofertas, 'hub');
  await gravarRedis(chave, ofertas);
  return { ofertas, origem: 'hub', chave };
}

export async function invalidarCache(tipo: string, destino: string): Promise<string> {
  const chave = chaveCache(tipo, destino);
  await apagarRedis(chave);
  await ofertasCacheService.apagar(chave);
  return chave;
}
