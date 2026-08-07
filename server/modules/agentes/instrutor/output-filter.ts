/**
 * PR-13d — Instrutor output filter (anti-preço / anti-vazamento financeiro).
 * Defense in depth after LLM (and on cache hits that may predate the filter).
 */

const FINANCIAL_LEAK =
  /\b(?:r\$\s*\d|\d+[.,]\d{2}\s*(?:reais|brl)|(?:preço|preco|valor)\s*(?:da\s+)?(?:di[aá]ria|noite|comiss)|comiss[aã]o\s*(?:de\s*)?\d|\d{1,2}\s*%\s*(?:de\s+)?(?:comiss|plataforma|corretor|taxa)|taxa\s*(?:de\s+)?\d+\s*%)/i;

const ROLE_SPOOF = /\b(?:system|assistant)\s*:/i;

export const INSTRUTOR_SAFE_NO_VALUE =
  'Não informo valores, preços nem percentuais de comissão. Confirme no sistema ou com a equipe financeira responsável.';

export function containsFinancialLeak(text: string): boolean {
  return FINANCIAL_LEAK.test(text || '');
}

export function containsRoleSpoof(text: string): boolean {
  return ROLE_SPOOF.test(text || '');
}

export function ensureOndeClicarLine(texto: string, fallbackRota: string): string {
  const t = (texto || '').trim();
  if (/onde clicar:/i.test(t)) return t;
  const rota = (fallbackRota || '/modulos').trim() || '/modulos';
  return `${t}\n\nOnde clicar: ${rota}`;
}

export type InstrutorOutputFilterResult = {
  text: string;
  filtered: boolean;
  reasons: string[];
};

/**
 * Scrub LLM/cache output before return or persist.
 * Replaces financial leaks with the canonical safe refusal.
 */
export function filterInstrutorOutput(
  text: string,
  fallbackRota: string,
): InstrutorOutputFilterResult {
  const reasons: string[] = [];
  let out = (text || '').trim();

  if (!out) {
    out = 'Não encontrei informação suficiente nos guias. Fale com a equipe de suporte.';
    reasons.push('empty');
  }

  if (containsFinancialLeak(out)) {
    out = INSTRUTOR_SAFE_NO_VALUE;
    reasons.push('financial_leak');
  }

  if (containsRoleSpoof(out)) {
    out = out.replace(/\b(system|assistant)\s*:/gi, '[redacted]:');
    reasons.push('role_spoof');
  }

  // Strip fences that sometimes wrap invented JSON prices
  if (out.includes('```')) {
    out = out.replace(/```/g, "'''");
    reasons.push('fence');
  }

  out = ensureOndeClicarLine(out, fallbackRota);

  return {
    text: out,
    filtered: reasons.length > 0,
    reasons,
  };
}

/** Structured log — never include pergunta, e-mail, or full resposta. */
export function logInstrutorEvent(
  event: string,
  meta: Record<string, string | number | boolean | null | undefined>,
): void {
  const safe: Record<string, string | number | boolean | null> = {};
  for (const [k, v] of Object.entries(meta)) {
    if (v === undefined) continue;
    const key = k.toLowerCase();
    if (
      key.includes('pergunta') ||
      key.includes('email') ||
      key.includes('token') ||
      key.includes('resposta') ||
      key.includes('prompt')
    ) {
      continue;
    }
    safe[k] = v;
  }
  console.info(`[instrutor] ${event} ${JSON.stringify(safe)}`);
}
