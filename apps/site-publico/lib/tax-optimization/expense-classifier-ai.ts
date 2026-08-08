/**
 * Classificador de despesas com IA (OpenAI)
 * Categoriza despesas a partir de descrição para dedução tributária
 * PR-13e-followup-a: via shared llmChatCompletion gateway
 */

import {
  LLM_MAX_MESSAGE_CHARS,
  llmChatCompletion,
  sanitizeLlmText,
} from '@rsv360/shared';

const CATEGORIES = [
  'marketing',
  'publicidade',
  'taxas_plataforma',
  'manutencao',
  'software',
  'consultoria',
  'combustivel',
  'energia',
  'agua',
  'telefonia',
  'internet',
  'material_escritorio',
  'outros',
];

export interface ClassificationResult {
  category: string;
  confidence: number;
  suggested_category_pt?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  marketing: 'Marketing',
  publicidade: 'Publicidade',
  taxas_plataforma: 'Taxas de Plataforma',
  manutencao: 'Manutenção',
  software: 'Software',
  consultoria: 'Consultoria',
  combustivel: 'Combustível',
  energia: 'Energia',
  agua: 'Água',
  telefonia: 'Telefonia',
  internet: 'Internet',
  material_escritorio: 'Material de Escritório',
  outros: 'Outros',
};

/**
 * Classificar despesa via OpenAI
 */
export async function classifyExpense(
  description: string,
  amount?: number
): Promise<ClassificationResult> {
  const safeDescription = sanitizeLlmText(description, LLM_MAX_MESSAGE_CHARS);
  if (!safeDescription) {
    return classifyByRules(description || '');
  }

  const amountPart =
    typeof amount === 'number' && Number.isFinite(amount)
      ? ` (R$ ${amount.toFixed(2)})`
      : '';

  const prompt = `Classifique a despesa abaixo em UMA das categorias: ${CATEGORIES.join(', ')}.
Despesa: "${safeDescription}"${amountPart}

Responda APENAS com JSON: {"category": "categoria_em_ingles", "confidence": 0.0 a 1.0}
Use a categoria mais específica possível.`;

  const result = await llmChatCompletion({
    surface: 'expense-classifier',
    model: 'gpt-4o-mini',
    temperature: 0.2,
    maxTokens: 80,
    maxOutputChars: 200,
    messages: [{ role: 'user', content: prompt }],
  });

  if (!result.ok) {
    return classifyByRules(safeDescription);
  }

  const match = result.content.match(
    /\{"category":\s*"([^"]+)",\s*"confidence":\s*([\d.]+)/,
  );
  if (match) {
    let category = match[1].toLowerCase().replace(/\s+/g, '_');
    if (!CATEGORIES.includes(category)) {
      const found = CATEGORIES.find((c) => category.includes(c) || c.includes(category));
      category = found || 'outros';
    }
    const confidence = Math.min(1, Math.max(0, parseFloat(match[2])));
    return {
      category,
      confidence,
      suggested_category_pt: CATEGORY_LABELS[category] || category,
    };
  }

  return classifyByRules(safeDescription);
}

/**
 * Fallback: classificação por regras simples
 */
function classifyByRules(description: string): ClassificationResult {
  const d = description.toLowerCase();

  const rules: Array<{ pattern: RegExp | string; category: string }> = [
    { pattern: /facebook|instagram|google ads|anúncio|ads/, category: 'marketing' },
    { pattern: /taxa|plataforma|comissão|gateway/, category: 'taxas_plataforma' },
    { pattern: /manutenção|reparo|conserto/, category: 'manutencao' },
    { pattern: /software|assinatura|sistema/, category: 'software' },
    { pattern: /contador|consultoria|advogado/, category: 'consultoria' },
    { pattern: /combustível|gasolina|diesel/, category: 'combustivel' },
    { pattern: /luz|energia|eletricidade/, category: 'energia' },
    { pattern: /água|agua/, category: 'agua' },
    { pattern: /telefone|celular|tim|claro|vivo/, category: 'telefonia' },
    { pattern: /internet|wi-fi|wifi/, category: 'internet' },
    { pattern: /papel|caneta|material|escritório/, category: 'material_escritorio' },
  ];

  for (const { pattern, category } of rules) {
    if (typeof pattern === 'string' ? d.includes(pattern) : pattern.test(d)) {
      return {
        category,
        confidence: 0.8,
        suggested_category_pt: CATEGORY_LABELS[category],
      };
    }
  }

  return {
    category: 'outros',
    confidence: 0.5,
    suggested_category_pt: 'Outros',
  };
}
