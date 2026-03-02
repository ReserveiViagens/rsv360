/**
 * Classificador de despesas com IA (OpenAI)
 * Categoriza despesas a partir de descrição para dedução tributária
 */

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
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return classifyByRules(description);
  }

  try {
    const prompt = `Classifique a despesa abaixo em UMA das categorias: ${CATEGORIES.join(', ')}.
Despesa: "${description}"${amount != null ? ` (R$ ${amount.toFixed(2)})` : ''}

Responda APENAS com JSON: {"category": "categoria_em_ingles", "confidence": 0.0 a 1.0}
Use a categoria mais específica possível.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 80,
      }),
    });

    if (!response.ok) {
      return classifyByRules(description);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const match = content.match(/\{"category":\s*"([^"]+)",\s*"confidence":\s*([\d.]+)/);
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
  } catch (err) {
    console.warn('[expense-classifier] OpenAI error:', err);
  }

  return classifyByRules(description);
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
