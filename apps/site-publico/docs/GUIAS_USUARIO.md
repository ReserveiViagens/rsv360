# 📖 GUIAS DE USO - RSV360

**Versão:** 1.0.0  
**Data:** 2025-12-16

---

## 📋 ÍNDICE

1. [Guia de Wishlists Compartilhadas](#guia-de-wishlists-compartilhadas)
2. [Guia de Planejamento de Viagem](#guia-de-planejamento-de-viagem)
3. [Guia de Smart Pricing](#guia-de-smart-pricing)
4. [Guia de Verificação de Propriedade](#guia-de-verificação-de-propriedade)
5. [Guia de Divisão de Pagamento](#guia-de-divisão-de-pagamento)

---

## 🎯 GUIA DE WISHLISTS COMPARTILHADAS

### O que são Wishlists Compartilhadas?

Wishlists compartilhadas permitem que grupos de pessoas colaborem na escolha de propriedades para uma viagem. Todos podem adicionar propriedades, votar e comentar.

### Como Criar uma Wishlist

1. Acesse a página **"Minhas Wishlists"** (`/wishlists`)
2. Clique em **"Criar Nova Wishlist"**
3. Preencha:
   - **Nome:** Ex: "Viagem para Caldas Novas"
   - **Descrição:** (opcional) Detalhes da viagem
   - **Pública:** Marque se deseja que qualquer pessoa possa ver
4. Clique em **"Criar Wishlist"**

### Como Adicionar Propriedades

1. Abra sua wishlist
2. Clique em **"Adicionar Item"**
3. Selecione a propriedade desejada
4. Adicione informações opcionais:
   - Datas de check-in/check-out
   - Número de hóspedes
   - Preço estimado
   - Notas
5. Clique em **"Adicionar"**

### Como Votar em Propriedades

1. Abra a wishlist compartilhada
2. Para cada propriedade, você verá três botões:
   - 👍 **Gostei** (voto positivo)
   - ❓ **Talvez** (neutro)
   - 👎 **Não Gostei** (voto negativo)
3. Clique no botão desejado
4. Você pode adicionar um comentário explicando seu voto
5. Os resultados aparecem em tempo real

### Como Compartilhar uma Wishlist

1. Abra sua wishlist
2. Clique em **"Compartilhar"**
3. Copie o link gerado
4. Envie o link para seus amigos por email, WhatsApp, etc.
5. Eles poderão acessar e participar mesmo sem conta

### Como Convidar Membros

1. Abra sua wishlist
2. Clique em **"Convidar"**
3. Preencha:
   - **Email do convidado**
   - **Nome** (opcional)
   - **Mensagem personalizada** (opcional)
4. Clique em **"Enviar Convite"**
5. O convidado receberá um email com o link

---

## 🗺️ GUIA DE PLANEJAMENTO DE VIAGEM

### O que é Planejamento de Viagem?

A ferramenta de planejamento permite organizar todos os aspectos de uma viagem em grupo: destino, datas, participantes, orçamento e cronograma.

### Como Criar um Plano de Viagem

1. Acesse **"Planejamento de Viagem"** (`/group-travel/trip-planning`)
2. Preencha os detalhes:
   - **Nome da Viagem**
   - **Destino**
   - **Data de Início**
   - **Data de Término**
3. Clique em **"Salvar Plano"**

### Como Adicionar Participantes

1. Na aba **"Participantes"**
2. Clique em **"Convidar Participantes"**
3. Preencha o email e nome
4. Envie o convite
5. Os participantes aparecerão na lista quando aceitarem

### Como Dividir o Orçamento

1. Na aba **"Orçamento"**
2. Defina o **Orçamento Total**
3. Escolha o tipo de divisão:
   - **Igual:** Divide igualmente entre todos
   - **Porcentagem:** Cada um define sua porcentagem
   - **Valor Personalizado:** Cada um define quanto vai pagar
4. A calculadora mostrará quanto cada pessoa deve pagar
5. Clique em **"Aplicar"** para confirmar

### Como Visualizar o Cronograma

1. Na aba **"Cronograma"**
2. Você verá:
   - Data de check-in
   - Data de check-out
   - Duração da viagem
3. Eventos e atividades podem ser adicionados aqui

---

## 💰 GUIA DE SMART PRICING

### O que é Smart Pricing?

Smart Pricing é um sistema inteligente que ajusta automaticamente os preços da sua propriedade baseado em:
- Demanda histórica
- Eventos locais
- Preços de concorrentes
- Sazonalidade
- Clima

### Como Acessar o Dashboard

1. Acesse **"Smart Pricing Dashboard"** (`/pricing/dashboard`)
2. Selecione uma propriedade
3. Você verá:
   - Preço atual
   - Preço recomendado
   - Taxa de ocupação
   - Receita mensal

### Como Ver Previsões de Preço

1. No dashboard, vá para a aba **"Previsão de Demanda"**
2. Ou acesse diretamente: `/api/pricing/forecast?property_id=1&start_date=2025-12-20&end_date=2025-12-30`
3. Você verá:
   - Preços previstos para cada dia
   - Nível de confiança
   - Fatores que influenciam o preço
   - Recomendações (aumentar/diminuir/manter)

### Como Configurar Smart Pricing

1. No dashboard, vá para a aba **"Configurações"**
2. Configure:
   - **Preço Base:** Preço padrão da propriedade
   - **Multiplicadores Mín/Máx:** Limites de variação
   - **Pesos dos Fatores:** Quanto cada fator influencia
   - **Frequência de Atualização:** Com que frequência recalcular
3. Clique em **"Salvar"**

### Como Ver Análise de Concorrência

1. No dashboard, vá para a aba **"Concorrência"**
2. Você verá:
   - Preços dos concorrentes
   - Taxa de ocupação comparativa
   - Recomendações de ajuste

---

## ✅ GUIA DE VERIFICAÇÃO DE PROPRIEDADE

### O que é Verificação de Propriedade?

Propriedades verificadas recebem um badge especial e aparecem com destaque nas buscas, aumentando a confiança dos hóspedes.

### Como Solicitar Verificação

1. Acesse **"Verificação de Propriedade"** (`/verification/property?property_id=1`)
2. Escolha o nível de verificação:
   - **Básica:** Fotos externas e internas principais
   - **Premium:** Fotos completas + documentos
   - **Verificado:** Verificação completa + inspeção presencial
3. Faça upload das fotos:
   - Arraste e solte ou clique para selecionar
   - Máximo 20 fotos
   - Formato: JPEG, PNG, WebP
   - Tamanho máximo: 10MB por foto
4. Adicione observações (opcional)
5. Clique em **"Enviar Solicitação"**

### Níveis de Verificação

#### Básica
- ✅ Fotos externas da propriedade
- ✅ Fotos internas principais
- ⏱️ Revisão em até 48 horas

#### Premium
- ✅ Todas as fotos da Básica
- ✅ Fotos de todas as áreas
- ✅ Documentos da propriedade
- ⏱️ Revisão em até 72 horas

#### Verificado
- ✅ Todas as fotos da Premium
- ✅ Documentos completos
- ✅ Inspeção presencial
- ⏱️ Revisão em até 7 dias

### Como Verificar o Status

1. Acesse a página de verificação
2. Você verá o status atual:
   - ⏳ **Pendente:** Aguardando revisão
   - 🔍 **Em Análise:** Sendo revisado
   - ✅ **Aprovado:** Verificação concluída
   - ❌ **Rejeitado:** Verifique o motivo

---

## 💳 GUIA DE DIVISÃO DE PAGAMENTO

### O que é Divisão de Pagamento?

Permite dividir o custo de uma reserva entre múltiplos participantes de forma justa e transparente.

### Como Usar a Calculadora

1. Acesse a página de **"Dividir Pagamento"** (`/viagens-grupo?tab=split-payment`)
2. Defina o **Valor Total** da reserva
3. Escolha o tipo de divisão:

#### Divisão Igual
- Divide igualmente entre todos
- Ideal para grupos pequenos

#### Divisão por Porcentagem
- Cada pessoa define sua porcentagem
- Total deve somar 100%
- Ideal quando há diferenças de uso

#### Divisão por Valor Personalizado
- Cada pessoa define quanto vai pagar
- Total deve somar o valor da reserva
- Ideal para situações específicas

4. Adicione participantes:
   - Nome
   - Email (opcional)
   - Valor ou porcentagem (dependendo do tipo)
5. A calculadora mostrará:
   - Quanto cada pessoa deve pagar
   - Porcentagem de cada um
   - Se há diferenças a ajustar

### Como Enviar Solicitações de Pagamento

1. Após calcular, clique em **"Enviar Solicitações"**
2. Cada participante receberá:
   - Email com o valor a pagar
   - Link para pagamento
   - Prazo para pagamento
3. Você pode acompanhar o status de cada pagamento

---

## 🆘 SUPORTE

### Problemas Comuns

**Não consigo adicionar propriedade à wishlist:**
- Verifique se você tem permissão (é membro da wishlist)
- Verifique se a propriedade existe

**Voto não está aparecendo:**
- Aguarde alguns segundos (atualização em tempo real)
- Recarregue a página
- Verifique sua conexão

**Previsão de preço não está disponível:**
- Verifique se a propriedade tem histórico suficiente
- Aguarde alguns minutos e tente novamente

**Erro ao fazer upload de fotos:**
- Verifique o formato (JPEG, PNG, WebP)
- Verifique o tamanho (máx. 10MB)
- Tente novamente

### Contato

Para mais ajuda, entre em contato:
- Email: suporte@rsv360.com
- Telefone: (00) 0000-0000
- Chat: Disponível no site

---

**Última atualização:** 2025-12-16

