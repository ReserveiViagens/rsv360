# Plano de Implantação: Módulos Split de Pagamento e Tributação Otimizada

**Sistema:** RSV360  
**Contexto:** Aluguéis por temporada (Caldas Novas/Rio Quente, GO) + Venda de ingressos parques aquáticos + Escritório Cuiabá (MT)  
**Objetivo:** Evitar bitributação, tributar apenas a comissão/lucro, adequação fiscal e contábil com visão 2026/2027  
**Base:** Conversa Grok + fontes governamentais (Receita Federal, SEFAZ MT/GO, LC 214/2025)

---

## Resumo Executivo

| Módulo | Objetivo | Economia Estimada | Prazo |
|--------|----------|------------------|-------|
| **1. Split de Pagamento** | Divisão automática via gateway; NF-e só sobre comissão | 20-30% carga total | 4-6 meses |
| **2. Tributação Otimizada** | Deduções, Perse, Goyazes, incentivos GO/MT | 15-25% sobre lucro | 3-5 meses |

**Princípio central:** Tributar apenas 10-20% do valor total (sua margem), não 100%.

---

## Módulo 1: Split de Pagamento (Adequação Fiscal)

### 1.1 Conceito

O **split comercial** divide o pagamento do cliente automaticamente entre:
- **Proprietário/imobiliária/parque** → recebe direto (80-90%)
- **Você (plataforma)** → recebe comissão (10-20%)

**Tributação:** NF-e apenas sobre sua comissão ("serviço de intermediação" - CNAE 79.11-2/00). Evita ICMS/ISS sobre o valor total repassado.

### 1.2 Diferença do Split Atual no RSV360

O sistema já possui `enhanced-split-payment.ts` para **divisão entre hóspedes** (ex.: grupo divide custo da reserva). O novo módulo é para **split marketplace** (plataforma vs. parceiros).

### 1.3 Estrutura do Módulo

```
lib/
  marketplace-split-service.ts    # Lógica de split comercial
  gateway-split-integration.ts    # Integração PagSeguro/Mercado Pago
app/api/
  split-payment/
    config/route.ts              # CRUD configuração de recebedores
    process/route.ts             # Processar split em transação
app/dashboard/
  split-config/page.tsx          # Configurar % por parceiro
```

### 1.4 Funcionalidades Principais

| Funcionalidade | Descrição |
|----------------|-----------|
| Cadastro de recebedores | Proprietários, imobiliárias, parques: CPF/CNPJ, conta bancária, % split |
| Configuração por tipo | Aluguel: 80% proprietário / 20% você; Ingressos: 85% parque / 15% você |
| Link de pagamento | Cliente paga total; gateway divide automaticamente |
| NF-e automática | Emissão só sobre sua comissão |
| Relatórios DIFAL | ICMS interestadual GO→MT |

### 1.5 Gateways Recomendados

| Gateway | Split | Custo | Adequação |
|---------|-------|-------|-----------|
| Mercado Pago | Nativo marketplace | ~3-4% | Múltiplos recebedores |
| PagSeguro | Simples | ~3-4% | Turismo |
| PagBank | Carrinho único | ~3% | Pacotes |
| Stone/Cielo | Maquininha | ~3% | Presencial |

### 1.6 Exemplos Práticos

**Exemplo 1 – Aluguel R$ 2.000 (comissão 10%)**
- Cliente paga R$ 2.000
- Split: R$ 1.800 → proprietário | R$ 200 → você
- Tributação: NF só sobre R$ 200

**Exemplo 2 – Pacote R$ 1.500 (aluguel + ingressos)**
- R$ 1.000 aluguel + R$ 500 ingressos
- Split: R$ 800 proprietário, R$ 425 parque, R$ 275 você
- Tributação: NF só sobre R$ 275

### 1.7 Integração com Reforma 2027+

- **Split fiscal:** Bancos separam IBS/CBS no ato do pagamento
- **Preparação:** API Receita/Comitê Gestor IBS
- **Redução 40%** para aluguéis curtos (hospedagem ≤90 dias)

---

## Módulo 2: Tributação Otimizada (Adequação Contábil)

### 2.1 Conceito

Registro de deduções, monitoramento de regimes, enquadramento em incentivos (Perse, Goyazes) e preparação para IBS/CBS.

### 2.2 Estrutura do Módulo

```
lib/
  tax-optimization-service.ts    # Cálculos e simulações
  perse-enrollment-service.ts    # Verificação enquadramento Perse
  goyazes-project-service.ts     # Projetos culturais para crédito ICMS
app/api/
  tax/
    deductions/route.ts          # CRUD despesas dedutíveis
    simulation/route.ts          # Simular cenários
    perse/route.ts              # Status Perse
app/dashboard/
  tributacao/page.tsx           # Dashboard tributação
  deducoes/page.tsx             # Cadastro despesas
  incentivos/page.tsx           # Perse, Goyazes, etc.
```

### 2.3 Funcionalidades Principais

| Funcionalidade | Descrição |
|----------------|-----------|
| Registro de despesas | Marketing, taxas gateways, comissões pagas, manutenção |
| Relatórios ECD/ECF | Compliance contábil |
| Monitoramento thresholds | Alerta se >R$240k/ano ou >3 imóveis (IBS/CBS) |
| Dashboard Perse | Cálculo 0% federais até dez/2026 |
| Dashboard Goyazes | Projetos culturais para crédito ICMS |
| Simulador | Cenários com/sem otimização |

### 2.4 Regime Perse (até dez/2026)

**Benefício:** 0% em PIS/COFINS/CSLL/IRPJ para CNAEs de turismo (hospedagem, agências, parques).

| Cenário | Faturamento | Sem Perse | Com Perse | Economia |
|---------|-------------|-----------|-----------|----------|
| Base | R$ 600.000/ano | R$ 90.000 | R$ 0 | R$ 90.000 |
| Otimizado | R$ 360.000 (base) | R$ 54.000 | R$ 0 | R$ 54.000 |

**Requisitos:** Habilitação na Receita, Cadastur, CNAE 79.11-2/00 (agência turismo).

### 2.5 Programa Goyazes (GO)

**Benefício:** Abate até 100% do ICMS devido via patrocínio a projetos culturais aprovados.

- **Valor 2026:** R$ 40 milhões
- **IN SEC 1/2026:** Regulamenta inscrições via Baru 2.0
- **Modelo de projeto:** Festival cultural-termal em Caldas Novas/Rio Quente
- **Como aplicar:** Patrocinar evento cultural → abater ICMS

### 2.6 Incentivos Fiscais por Região

#### Caldas Novas / Rio Quente (GO)
- **Lei 23.697/2025:** Política Empreendedorismo Turístico (crédito ICMS/ISS para projetos)
- **LC 99/2017:** Cadastro "meio de hospedagem"; ISS até 5%; isenção IPTU para novos
- **Lei 22.218/2023 (alterada 24.080/2026):** Fomento turismo local

#### Cuiabá (MT – Sede)
- **Voe MT:** Redução ICMS combustível aviação
- **Pacote Tributário Comércio:** Prorrogado até abr/2026 (bares, hotéis, agências)

#### Chapada dos Guimarães (MT)
- **Programa Natureza com as Pessoas (ICMBio):** Ecoturismo, turismo de base comunitária
- **Concessão Parque Nacional:** R$ 18M em infraestrutura
- **Incentivos gerais MT:** Aplicáveis a operações na região

---

## Cronograma de Implantação

### Fase 1: Planejamento (2-3 meses)
- [ ] Definir regras de split (comissão fixa por tipo)
- [ ] Contratar contador especializado (R$ 500-1k/mês)
- [ ] Verificar enquadramento Perse na Receita
- [ ] Avaliar thresholds reforma (>R$240k/ano, >3 imóveis)

### Fase 2: Split de Pagamento (2-3 meses)
- [ ] Integrar API gateway (Mercado Pago ou PagSeguro)
- [ ] Desenvolver `marketplace-split-service.ts`
- [ ] Cadastro de recebedores (proprietários, parques)
- [ ] Emissão NF-e sobre comissão (integração Fortes/SAGTur)
- [ ] Piloto com 5-10 vendas

### Fase 3: Tributação Otimizada (2-3 meses)
- [ ] Módulo de deduções (despesas)
- [ ] Dashboard tributação + simulador
- [ ] Integração Perse (verificação enquadramento)
- [ ] Modelo projeto Goyazes (se aplicável)
- [ ] Relatórios ECD/ECF

### Fase 4: Lançamento e Monitoramento (contínuo)
- [ ] Ativar módulos em produção
- [ ] Auditar anualmente
- [ ] Preparar 2027 (split fiscal, IBS/CBS)

---

## Custos Estimados

| Item | Valor |
|------|-------|
| Integração gateway (dev) | R$ 2-5k |
| Software contábil (Fortes/SAGTur) | R$ 79-200/mês |
| Contador | R$ 500-1k/mês |
| Auditoria anual | R$ 2k |
| **Total inicial** | R$ 5-10k |

---

## Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Perse acaba dez/2026 | Otimizar agora; preparar IBS/CBS |
| Bitributação por erro | Split automático via gateway; NF só sobre comissão |
| Multas por omissão | ECD/ECF; relatórios automáticos |
| Reforma 2027 | Monitorar LC 214/2025; thresholds |

---

## Referências

- **Conversa Grok:** https://grok.com/share/bGVnYWN5_05c8c367-c4fe-4400-91d1-082f236a1b11
- **Reforma Tributária:** LC 214/2025 (IBS/CBS)
- **Perse:** Lei 14.148/2021, alterada 14.859/2024
- **Goyazes:** Lei 13.613/2000, IN SEC 1/2026
- **SAGTur:** https://www.sagtur.com.br/
- **Secult GO:** https://goias.gov.br/cultura/programa-goyazes/

---

## Próximos Passos Imediatos

1. Solicitar demo PagSeguro/Mercado Pago para split
2. Consultar Receita sobre habilitação Perse
3. Protocolar projeto Goyazes (se viável) via Baru 2.0
4. Contratar contador especializado em turismo GO/MT

---

## Anexo A: Detalhes IN SEC 1/2026 – Programa Goyazes

**Publicação:** 12/01/2026 no DOE-GO  
**Valor 2026:** R$ 40 milhões via renúncia fiscal ICMS  
**Plataforma:** Baru 2.0 (editaiscultura.sistemas.go.gov.br)  
**E-mail excepcionais:** goyazesexcepcionais.secult@goias.gov.br

### Capítulos Principais

| Capítulo | Conteúdo |
|----------|----------|
| I – Objetivos | Preservar patrimônio, incentivar produção cultural, democratizar acesso |
| Competências | Secult-GO (análise), SEEC (crédito ICMS), CEC (mérito cultural) |
| II – Projetos | Proponentes: PF >18 anos, PJ, MEI. Limites: PF até R$ 200k, PJ até R$ 1M |
| Inscrições | Não excepcionais: 20/01 a 20/02/2026. Excepcionais: e-mail até 31/05 |
| Avaliação | Análise documental → técnica → mérito (CEC). Critérios: valor cultural, impacto, inovação, descentralização |

### Distribuição de Recursos (Art. 10)
- 37,5% → Ações municipais + excepcionais
- 25% → Festivais
- 37,5% → Demais áreas (patrimônio, artes, teatro, música)

### Documentos Obrigatórios
- Formulário de inscrição
- Carta de intenção de patrocínio (modelo oficial)
- Orçamento detalhado
- Certidões negativas
- Currículo do proponente

---

## Anexo B: Incentivos Turismo Chapada dos Guimarães (MT)

**Localização:** ~70 km de Cuiabá  
**Contexto:** Ecoturismo, Parque Nacional

### Programas 2025-2026

| Programa | Descrição | Benefício |
|----------|-----------|-----------|
| Sinalização Geopark | R$ 350k para placas/totens | +62% fluxo turístico |
| Obras Infraestrutura | R$ 3,2M espaço cultural/gastronômico | Atração de visitantes |
| Concessão Parque Nacional | R$ 18M (ICMBio) | +900 empregos |
| Natureza com as Pessoas | ICMBio/MTur – ecoturismo, base comunitária | Financiamento visitação |

### Incentivos Estaduais MT (aplicáveis)
- **Voe MT:** Redução ICMS importação aeronaves (4%)
- **Pacote Tributário Comércio:** Prorrogado até 30/04/2026 (bares, hotéis, agências)
- **Fundo Voos Internacionais:** R$ 10M/ano subvenção

### Arrecadação Local 2025
- Chapada: R$ 5,1 milhões (ISS/IPTU meios hospedagem)

**Observação:** Não há redução automática de impostos específica para Chapada. Ganho via aumento de demanda e deduções operacionais.
