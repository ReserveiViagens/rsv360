import { eq } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { propostas } from '../../../../backend/src/db/schema/propostas';

const DEFAULT_OG_IMAGE =
  process.env.OG_DEFAULT_IMAGE_URL ||
  'https://www.reserveiviagens.com.br/og/rsv360-1200x630.png';

function parseConteudo(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return {};
}

export async function buildPropostaOgByToken(token: string) {
  const [row] = await db.select().from(propostas).where(eq(propostas.tokenPublico, token));
  if (!row || !row.isPublica) return null;

  const conteudo = parseConteudo(row.conteudo);
  const inclusions = (conteudo.inclusions as Record<string, unknown> | undefined) ?? {};
  const media = (conteudo.media as Record<string, unknown> | undefined) ?? {};
  const dailySchedule = Array.isArray(conteudo.dailySchedule) ? conteudo.dailySchedule : [];

  const destination =
    (typeof inclusions.destination === 'string' && inclusions.destination) ||
    'Caldas Novas, GO';
  const title =
    (typeof inclusions.previewTitle === 'string' && inclusions.previewTitle) ||
    (typeof conteudo.previewTitle === 'string' && conteudo.previewTitle) ||
    row.titulo;

  const heroFromSchedule = dailySchedule.find(
    (d) => d && typeof d === 'object' && typeof (d as { image?: string }).image === 'string',
  ) as { image?: string } | undefined;

  const imageUrl =
    (typeof media.heroImage === 'string' && media.heroImage) ||
    heroFromSchedule?.image ||
    DEFAULT_OG_IMAGE;

  return {
    title,
    description: `Roteiro premium personalizado para ${row.clienteNome} — ${destination}`,
    imageUrl,
    destination,
    clienteNome: row.clienteNome,
    siteName: 'Reservei Viagens',
  };
}

module.exports = { buildPropostaOgByToken };
