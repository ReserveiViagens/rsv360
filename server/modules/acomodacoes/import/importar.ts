import { and, eq } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { acomodacoes } from '../../../../backend/src/db/schema/acomodacoes';
import type {
  AcomodacaoImportResolved,
  LinhaImportResultado,
  ProcessarImportOptions,
  RelatorioImportacao,
} from './acomodacao-import.types';

async function buscarExistente(dto: AcomodacaoImportResolved) {
  if (dto.codigoExterno) {
    const [byCodigo] = await db
      .select()
      .from(acomodacoes)
      .where(eq(acomodacoes.codigoExterno, dto.codigoExterno))
      .limit(1);
    if (byCodigo) return byCodigo;
  }

  const [byHotelTitulo] = await db
    .select()
    .from(acomodacoes)
    .where(and(eq(acomodacoes.hotelId, dto.hotelId), eq(acomodacoes.titulo, dto.titulo)))
    .limit(1);

  return byHotelTitulo ?? null;
}

function montarPayload(dto: AcomodacaoImportResolved, anfitriaoId?: string | null) {
  return {
    hotelId: dto.hotelId,
    anfitriaoId: anfitriaoId ?? null,
    tipoId: dto.tipoId,
    titulo: dto.titulo,
    quartos: dto.quartos,
    configSala: dto.configSala,
    configBanheiro: dto.configBanheiro,
    capacidadeMax: dto.capacidadeMax,
    capacidadeBase: dto.capacidadeBase ?? null,
    precoDiaria: dto.precoDiaria != null ? String(dto.precoDiaria) : null,
    utensilios: dto.utensilios?.length ? dto.utensilios : null,
    eletrodomesticos: dto.eletrodomesticos?.length ? dto.eletrodomesticos : null,
    amenidades: dto.amenidades?.length ? dto.amenidades : null,
    midia: dto.midia?.length ? dto.midia : null,
    codigoExterno: dto.codigoExterno ?? null,
    dadosCompletos: false,
    ativo: true,
    atualizadoEm: new Date(),
  };
}

export async function upsertAcomodacao(
  dto: AcomodacaoImportResolved,
  options: ProcessarImportOptions = {},
): Promise<LinhaImportResultado> {
  const existente = await buscarExistente(dto);
  const payload = montarPayload(dto, options.anfitriaoId);

  if (options.dryRun) {
    return {
      linha: 0,
      status: 'ok',
      acao: existente ? 'update' : 'insert',
      acomodacaoId: existente?.id,
      titulo: dto.titulo,
      codigoExterno: dto.codigoExterno ?? null,
    };
  }

  if (existente) {
    const [updated] = await db
      .update(acomodacoes)
      .set(payload)
      .where(eq(acomodacoes.id, existente.id))
      .returning();

    return {
      linha: 0,
      status: 'ok',
      acao: 'update',
      acomodacaoId: updated?.id ?? existente.id,
      titulo: dto.titulo,
      codigoExterno: dto.codigoExterno ?? null,
    };
  }

  const [inserted] = await db.insert(acomodacoes).values(payload).returning();
  return {
    linha: 0,
    status: 'ok',
    acao: 'insert',
    acomodacaoId: inserted?.id,
    titulo: dto.titulo,
    codigoExterno: dto.codigoExterno ?? null,
  };
}

export async function processarImport(
  dtos: AcomodacaoImportResolved[],
  options: ProcessarImportOptions = {},
): Promise<RelatorioImportacao> {
  const dryRun = options.dryRun !== false;
  const linhas: LinhaImportResultado[] = [];
  let sucesso = 0;
  let erros = 0;

  for (let i = 0; i < dtos.length; i++) {
    const dto = dtos[i];
    try {
      const result = await upsertAcomodacao(dto, { ...options, dryRun });
      linhas.push({ ...result, linha: i + 1, acao: dryRun ? 'preview' : result.acao });
      sucesso += 1;
    } catch (error) {
      erros += 1;
      linhas.push({
        linha: i + 1,
        status: 'erro',
        erros: [(error as Error).message],
        titulo: dto.titulo,
        codigoExterno: dto.codigoExterno ?? null,
      });
    }
  }

  return {
    dryRun,
    total: dtos.length,
    sucesso,
    erros,
    linhas,
  };
}

module.exports = {
  processarImport,
  upsertAcomodacao,
};
