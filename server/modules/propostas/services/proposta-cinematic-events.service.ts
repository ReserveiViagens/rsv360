import { and, eq, sql } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { propostaEventos, propostas } from '../../../../backend/src/db/schema/propostas';
import { propostasService } from './propostas.service';

const SCROLL_MARCOS_VALIDOS = new Set([25, 50, 75, 100]);

export interface CinematicEventInput {
  session_id: string;
  tempo_pagina_segundos?: number;
  scroll?: {
    percentual_max?: number;
    marcos?: number[];
  };
}

export async function resolvePropostaPublicaByToken(token: string) {
  const [row] = await db.select().from(propostas).where(eq(propostas.tokenPublico, token)).limit(1);
  if (!row) return { kind: 'not_found' as const };
  if (!row.isPublica) return { kind: 'forbidden' as const };
  return { kind: 'ok' as const, propostaId: row.id };
}

async function findTempoPaginaEvent(propostaId: number, sessionId: string) {
  const rows = await db
    .select()
    .from(propostaEventos)
    .where(
      and(
        eq(propostaEventos.propostaId, propostaId),
        eq(propostaEventos.tipo, 'tempo_pagina'),
        sql`${propostaEventos.payload}->>'session_id' = ${sessionId}`,
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

async function hasScrollMarco(propostaId: number, sessionId: string, marco: number) {
  const rows = await db
    .select({ id: propostaEventos.id })
    .from(propostaEventos)
    .where(
      and(
        eq(propostaEventos.propostaId, propostaId),
        eq(propostaEventos.tipo, 'scroll_profundidade'),
        sql`${propostaEventos.payload}->>'session_id' = ${sessionId}`,
        sql`(${propostaEventos.payload}->>'marco')::int = ${marco}`,
      ),
    )
    .limit(1);
  return Boolean(rows[0]);
}

export async function registrarEventosCinematicos(propostaId: number, input: CinematicEventInput) {
  if (!input.session_id || typeof input.session_id !== 'string') {
    throw new Error('session_id obrigatório');
  }

  const eventos: string[] = [];
  const sessionId = input.session_id.trim();

  if (
    typeof input.tempo_pagina_segundos === 'number' &&
    Number.isFinite(input.tempo_pagina_segundos) &&
    input.tempo_pagina_segundos >= 0
  ) {
    const segundos = Math.round(input.tempo_pagina_segundos);
    const existing = await findTempoPaginaEvent(propostaId, sessionId);

    if (existing) {
      const prev = Number((existing.payload as Record<string, unknown> | null)?.segundos ?? 0);
      const next = Math.max(prev, segundos);
      if (next !== prev) {
        await db
          .update(propostaEventos)
          .set({
            payload: { session_id: sessionId, segundos: next },
            descricao: 'Tempo ativo na prévia da proposta',
          })
          .where(eq(propostaEventos.id, existing.id));
      }
    } else if (segundos > 0) {
      await propostasService.logEvent(
        propostaId,
        'tempo_pagina',
        'Tempo ativo na prévia da proposta',
        { session_id: sessionId, segundos },
      );
    }
    eventos.push('tempo_pagina');
  }

  const marcos = Array.isArray(input.scroll?.marcos) ? input.scroll.marcos : [];
  const percentualMax =
    typeof input.scroll?.percentual_max === 'number' && Number.isFinite(input.scroll.percentual_max)
      ? Math.min(100, Math.max(0, Math.round(input.scroll.percentual_max)))
      : null;

  for (const raw of marcos) {
    const marco = Math.round(Number(raw));
    if (!SCROLL_MARCOS_VALIDOS.has(marco)) continue;

    const exists = await hasScrollMarco(propostaId, sessionId, marco);
    if (exists) continue;

    await propostasService.logEvent(
      propostaId,
      'scroll_profundidade',
      `Scroll ${marco}% na prévia da proposta`,
      {
        session_id: sessionId,
        percentual: percentualMax ?? marco,
        marco,
      },
    );
    eventos.push(`scroll_profundidade:${marco}`);
  }

  return { propostaId, eventos };
}

module.exports = {
  resolvePropostaPublicaByToken,
  registrarEventosCinematicos,
};
