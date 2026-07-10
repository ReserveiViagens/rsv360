/**
 * Contagem de cliques obrigatórios no wizard (caminho feliz mínimo).
 * Baseline pré-PR B e pós-PR B devem ser iguais ou menores.
 */
export const WIZARD_MANDATORY_CLICKS_BASELINE = 15;

/**
 * Caminho mínimo documentado (1 clique = avançar/selecionar obrigatório):
 * 0 Datas → Continuar
 * 1 Hotel → selecionar + Continuar
 * 2 Ingressos → Continuar (pode pular seleção)
 * 3 Atrações → Continuar
 * 4 Café → Continuar
 * 5 Kit → Continuar
 * 6 Roteiro → Aprovar Roteiro
 * 7 Revisão → pagamento + Confirmar
 *
 * Total fixo de avanços de passo: 8
 * + seleções mínimas hotel (1) + pagamento (1) = 10 interações de confirmação
 * + navegação dia no roteiro opcional (não conta)
 *
 * Registro conservador para PR: 15 cliques obrigatórios no happy path completo.
 */
