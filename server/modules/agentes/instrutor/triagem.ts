import { loadGuiasInstrutor } from './guias-loader';
import { normalizePergunta, type GuiaCarregado, type InstrutorPapel } from './tipos';

// Após normalizePergunta (sem acentos) — \b ASCII-only em JS.
const SAUDACOES = /^(oi|ola|hey|eai|e ai|bom dia|boa tarde|boa noite|hello|hi)(\s|$)/i;
const AGRADECIMENTOS =
  /^(obrigad[oa]|valeu|thanks|thank you|agradec[oa]|muito obrigad[oa])(\s|$)/i;

const RESPOSTA_SAUDACAO =
  'Olá! Sou o Instrutor RSV360. Pergunte como fazer algo no Turismo (orçamento, proposta, unidade, tarifas…) e eu indico o caminho na tela.\n\nOnde clicar: use o menu do app em /modulos ou /anfitriao conforme o seu papel.';

const RESPOSTA_AGRADECIMENTO =
  'Por nada! Se precisar de outro passo a passo, é só perguntar.\n\nOnde clicar: /modulos (staff) ou /anfitriao (parceiro).';

function tokens(s: string): string[] {
  return normalizePergunta(s)
    .split(' ')
    .filter((t) => t.length >= 3);
}

function guiaVisivel(g: GuiaCarregado, papel: InstrutorPapel): boolean {
  if (papel === 'staff' || papel === 'ambos') return true;
  return g.papel === 'anfitriao' || g.papel === 'ambos';
}

function scoreGuia(pergunta: string, g: GuiaCarregado): number {
  const qTokens = new Set(tokens(pergunta));
  if (qTokens.size === 0) return 0;
  const corpus = normalizePergunta([g.titulo, g.id, ...g.rotas, g.slug].join(' '));
  const cTokens = tokens(corpus);
  let hit = 0;
  for (const t of cTokens) {
    if (qTokens.has(t)) hit += 1;
  }
  // bônus por rota literal
  for (const r of g.rotas) {
    const rn = normalizePergunta(r);
    if (rn && normalizePergunta(pergunta).includes(rn)) hit += 3;
  }
  return hit / Math.max(cTokens.length, 1);
}

function resumoGuia(g: GuiaCarregado): string {
  const linhas = g.corpo
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#') && !l.startsWith('---'));
  const passos = linhas.filter((l) => /^\d+\./.test(l) || /\*\*Onde clicar:\*\*/i.test(l));
  const trecho = (passos.length ? passos : linhas).slice(0, 8).join('\n');
  const aviso = g.emConstrucao
    ? '\n\n⚠️ Parte deste fluxo está em construção na UI — confirme com a equipe se a tela não existir.'
    : '';
  const rotaPrincipal = g.rotas[0] || '/modulos';
  return `${g.titulo}\n\n${trecho}${aviso}\n\nOnde clicar: ${rotaPrincipal}`;
}

export type TriagemResultado =
  | { destino: 't0'; resposta: string; motivo: string }
  | { destino: 't1'; motivo: string };

/**
 * T0 — sem LLM: saudação / agradecimento / match forte de palavras-chave com guias.
 */
export function triagemT0(pergunta: string, papel: InstrutorPapel): TriagemResultado {
  const p = pergunta.trim();
  if (!p) return { destino: 't1', motivo: 'vazio' };

  const pNorm = normalizePergunta(p);
  if (SAUDACOES.test(pNorm) && pNorm.split(/\s+/).length <= 6) {
    return { destino: 't0', resposta: RESPOSTA_SAUDACAO, motivo: 'saudacao' };
  }
  if (AGRADECIMENTOS.test(pNorm) && pNorm.split(/\s+/).length <= 8) {
    return { destino: 't0', resposta: RESPOSTA_AGRADECIMENTO, motivo: 'agradecimento' };
  }

  const guias = loadGuiasInstrutor().filter((g) => guiaVisivel(g, papel));
  let best: { g: GuiaCarregado; score: number } | null = null;
  for (const g of guias) {
    const score = scoreGuia(p, g);
    if (!best || score > best.score) best = { g, score };
  }

  // match forte: score alto + pelo menos 2 tokens em comum
  if (best && best.score >= 0.35) {
    const shared = tokens(p).filter((t) =>
      normalizePergunta([best!.g.titulo, ...best!.g.rotas].join(' ')).includes(t),
    );
    if (shared.length >= 2 || best.score >= 0.5) {
      return {
        destino: 't0',
        resposta: resumoGuia(best.g),
        motivo: `guia:${best.g.id}`,
      };
    }
  }

  return { destino: 't1', motivo: 'sem_match_forte' };
}
