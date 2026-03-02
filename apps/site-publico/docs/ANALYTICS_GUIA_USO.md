# Guia de Uso - Analytics

## Visão Geral

O módulo de Analytics fornece análises completas de receita, demanda, ocupação e performance, com previsões e comparações com concorrentes.

## Funcionalidades Principais

### 1. Dashboard Principal

- **KPIs em Tempo Real:**
  - Receita Total
  - Total de Reservas
  - Ocupação Média
  - Ticket Médio
- **Gráficos:**
  - Receita ao longo do tempo
  - Taxa de ocupação
  - Reservas por status
- **Top Propriedades:** Lista das propriedades com melhor performance
- **Comparação Periódica:** Comparação com período anterior

### 2. Previsão de Receita

- **Gráfico de Forecast:** Visualização de receita histórica e previsões futuras
- **Cenários:** Otimista, Realista e Conservador
- **Fatores de Influência:** Sazonalidade, crescimento, confiança
- **Configuração:** Seleção de período de previsão (6, 12, 18, 24 meses)

### 3. Heatmap de Demanda

- **Visualização Visual:** Calendário com intensidade de demanda por data
- **Filtros:** Período de análise, propriedade específica
- **Detalhes:** Clique em uma data para ver reservas, receita e ticket médio
- **Estatísticas:** Pico de demanda, dias de alta demanda

### 4. Benchmark de Concorrentes

- **Comparação de Preços:** Sua propriedade vs concorrentes
- **Posicionamento:** Acima, abaixo ou competitivo em relação ao mercado
- **Gráficos Comparativos:** Visualização de preços médios
- **Recomendações:** Sugestões baseadas no posicionamento
- **Métricas:** Preço médio, mínimo, máximo de cada concorrente

### 5. Insights e Recomendações

- **Insights Automáticos:**
  - Receita em declínio/crescimento
  - Ocupação baixa
  - Preços acima/abaixo da média
  - Períodos de alta demanda
- **Severidade:** Crítico, Atenção, Informativo
- **Filtros:** Por severidade e tipo de insight
- **Recomendações:** Ações sugeridas para cada insight

## Como Usar

### Acessar Analytics

1. Navegue para `/analytics` no menu principal
2. Você verá o dashboard com KPIs e gráficos principais

### Visualizar Previsão de Receita

1. Clique na aba "Previsão"
2. Selecione o período de previsão (6, 12, 18 ou 24 meses)
3. Veja o gráfico com histórico e previsões
4. Analise os cenários (Otimista, Realista, Conservador)
5. Revise os fatores de influência por mês

### Analisar Heatmap de Demanda

1. Clique na aba "Heatmap"
2. Defina o período de análise (datas inicial e final)
3. Visualize o calendário com cores indicando intensidade:
   - Verde: Baixa demanda
   - Amarelo: Média demanda
   - Vermelho: Alta demanda
4. Clique em uma data para ver detalhes
5. Use as estatísticas para identificar padrões

### Comparar com Concorrentes

1. Clique na aba "Benchmark"
2. Selecione uma propriedade (ID)
3. Veja a comparação de preços
4. Analise o posicionamento no mercado
5. Revise as recomendações
6. Explore a tabela de concorrentes

### Revisar Insights

1. Clique na aba "Insights"
2. Veja o resumo de insights por severidade
3. Use os filtros para focar em tipos específicos
4. Leia as recomendações para cada insight
5. Analise as métricas associadas

### Filtros Globais

- **Data Inicial/Final:** Defina o período de análise
- **Propriedade:** Filtre por propriedade específica (opcional)
- **Exportar Dados:** Baixe os dados em JSON

## Interpretando os Dados

### KPIs

- **Receita Total:** Soma de todas as receitas no período
- **Total de Reservas:** Número de reservas confirmadas/completas
- **Ocupação Média:** Percentual médio de ocupação
- **Ticket Médio:** Valor médio por reserva

### Previsão de Receita

- **Confiança:** Diminui com o tempo (mais confiável para períodos próximos)
- **Fator Sazonal:** Considera alta temporada (nov-fev) e baixa temporada
- **Taxa de Crescimento:** Baseada em tendência histórica

### Heatmap de Demanda

- **Intensidade Alta:** Mais de 80% do pico de demanda
- **Intensidade Média:** Entre 50-80% do pico
- **Intensidade Baixa:** Menos de 50% do pico

### Benchmark

- **Acima da Média:** Preço > 10% acima da média do mercado
- **Competitivo:** Preço entre -10% e +10% da média
- **Abaixo da Média:** Preço < 10% abaixo da média

## Dúvidas Frequentes

### Como melhorar a precisão das previsões?

- Use períodos mais longos de dados históricos
- Considere fatores externos (eventos, feriados)
- Revise e ajuste manualmente quando necessário

### Os insights são atualizados automaticamente?

Sim, os insights são gerados automaticamente com base nos dados mais recentes. Atualize a página para ver os insights mais recentes.

### Posso comparar múltiplas propriedades?

Atualmente, o benchmark compara uma propriedade por vez. Use os filtros para alternar entre propriedades.

### Como exportar os dados?

Clique no botão "Exportar Dados" no topo do dashboard. Os dados serão baixados em formato JSON.

## Suporte

Para dúvidas ou problemas, entre em contato com o suporte através do sistema de tickets.

