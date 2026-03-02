# 🗺️ Configuração do Mapa de Hotéis

## Funcionalidades Implementadas

### ✅ Sistema de Filtros Avançados
- **Filtro por preço**: Slider para definir faixa de preço
- **Filtro por estrelas**: Seleção múltipla de classificações
- **Filtro por categoria**: Luxo, Premium, Standard, Econômico
- **Filtro por amenidades**: Wi-Fi, Piscina, Estacionamento, etc.
- **Filtro por disponibilidade**: Disponível, Poucas vagas, Esgotado
- **Filtro por distância**: Distância do centro de Caldas Novas
- **Busca por texto**: Nome, localização ou descrição

### ✅ Mapa Interativo
- **Localização real**: Coordenadas GPS dos hotéis
- **Marcadores coloridos**: Por categoria e disponibilidade
- **InfoWindows**: Informações detalhadas dos hotéis
- **Navegação**: Centro da cidade e localização do usuário
- **Legenda**: Explicação das cores dos marcadores

### ✅ Etiquetas de Disponibilidade em Tempo Real
- **Status em tempo real**: Disponível, Poucas vagas, Esgotado, Em breve
- **Atualização automática**: Timestamp da última atualização
- **Contador de quartos**: Quantidade de quartos disponíveis
- **Animações**: Pulsação para status críticos
- **Resumo geral**: Contadores por status

## Configuração Necessária

### 1. Google Maps API
Para ativar a funcionalidade de mapa, você precisa:

1. **Obter uma chave da Google Maps API**:
   - Acesse: https://console.cloud.google.com/
   - Crie um novo projeto ou selecione um existente
   - Ative a "Maps JavaScript API"
   - Crie uma chave de API

2. **Configurar a chave no projeto**:
   ```bash
   # Adicione ao arquivo .env.local
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua-chave-aqui
   ```

3. **Restringir a chave (recomendado)**:
   - Configure restrições de domínio
   - Limite a chave apenas para seu domínio

### 2. Coordenadas dos Hotéis
Os hotéis já estão configurados com coordenadas reais de Caldas Novas:
- **Centro**: -17.7444, -48.6278
- **Hotéis**: Coordenadas específicas de cada estabelecimento

### 3. Fallback do Mapa
Se a API do Google Maps não estiver configurada, o sistema automaticamente usa um mapa visual simples com:
- **Visualização em grade**: Lista e grade de hotéis
- **Localização visual**: Pontos coloridos no mapa
- **Integração com Google Maps**: Links diretos para o Google Maps
- **Filtros funcionais**: Todos os filtros continuam funcionando

### 3. Funcionalidades Disponíveis

#### Filtros
- ✅ Busca por texto
- ✅ Faixa de preço (R$ 50 - R$ 1000)
- ✅ Classificação por estrelas (1-5)
- ✅ Categorias (Luxo, Premium, Standard, Econômico)
- ✅ Amenidades (Wi-Fi, Piscina, Estacionamento, etc.)
- ✅ Status de disponibilidade
- ✅ Distância do centro (0-50km)

#### Mapa
- ✅ Visualização em mapa
- ✅ Marcadores por categoria
- ✅ Cores por disponibilidade
- ✅ InfoWindows com detalhes
- ✅ Navegação para centro
- ✅ Localização do usuário
- ✅ Legenda explicativa

#### Disponibilidade
- ✅ Status em tempo real
- ✅ Contador de quartos
- ✅ Timestamp de atualização
- ✅ Animações visuais
- ✅ Resumo por status

## Como Usar

### 1. Filtros
1. Use a barra de busca para encontrar hotéis específicos
2. Ajuste a faixa de preço com o slider
3. Selecione estrelas, categorias e amenidades
4. Clique em "Aplicar Filtros"

### 2. Mapa
1. Clique em "Ver Mapa" para ativar
2. Navegue pelos marcadores coloridos
3. Clique nos marcadores para ver detalhes
4. Use "Centro" para voltar ao centro da cidade
5. Use "Minha Localização" para ver sua posição

### 3. Disponibilidade
- **Verde**: Disponível
- **Amarelo**: Poucas vagas (pulsante)
- **Vermelho**: Esgotado
- **Azul**: Em breve

## Personalização

### Adicionar Novos Hotéis
1. Edite `lib/hotels-data.ts`
2. Adicione coordenadas reais
3. Configure status de disponibilidade
4. Defina categoria e amenidades

### Modificar Filtros
1. Edite `components/hotel-filters.tsx`
2. Adicione novos filtros
3. Configure opções personalizadas

### Personalizar Mapa
1. Edite `components/hotel-map.tsx`
2. Modifique estilos do mapa
3. Ajuste marcadores e cores

## Suporte

Para dúvidas sobre a implementação:
- 📧 Email: tech@reserveiviagens.com.br
- 📱 WhatsApp: (64) 99319-7555
