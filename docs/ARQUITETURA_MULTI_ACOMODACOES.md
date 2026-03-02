# 🏨 Arquitetura Multi-Acomodações - RSV360

## 📋 Visão Geral

Sistema hierárquico completo para gerenciar múltiplos tipos de empreendimentos e acomodações, suportando:
- **Hotéis** com múltiplos quartos
- **Pousadas** com diferentes acomodações
- **Resorts** com apartamentos, casas e quartos
- **Flats** e **Chácaras**
- **Airbnb** e outras plataformas
- **Apartamentos de Hotéis/Resorts**
- **Casas de Hotéis/Resorts**

## 🏗️ Estrutura Hierárquica

```
EMPRENDIMENTO (Enterprise)
  ├── PROPRIEDADE 1 (Property)
  │   ├── Acomodação 1 (Accommodation)
  │   ├── Acomodação 2
  │   └── Acomodação 3
  ├── PROPRIEDADE 2
  │   ├── Acomodação 1
  │   └── Acomodação 2
  └── PROPRIEDADE 3
      └── Acomodação 1
```

## 📊 Modelo de Dados

### 1. EMPREENDIMENTOS (Enterprises)

**Tipos Suportados:**
- `hotel` - Hotel tradicional
- `pousada` - Pousada
- `resort` - Resort
- `flat` - Flat
- `chacara` - Chácara
- `hostel` - Hostel
- `apartment_hotel` - Apart Hotel
- `resort_apartment` - Apartamento de Resort
- `resort_house` - Casa de Resort
- `hotel_house` - Casa de Hotel
- `airbnb` - Airbnb
- `other` - Outros

**Campos Principais:**
- Informações básicas (nome, descrição, tipo)
- Endereço completo
- Contato (telefone, email, website)
- Configurações (check-in/out, política de cancelamento)
- Status e destaque
- Imagens e amenidades

### 2. PROPRIEDADES (Properties)

**Tipos Suportados:**
- `room` - Quarto
- `apartment` - Apartamento
- `house` - Casa
- `suite` - Suíte
- `villa` - Villa
- `bungalow` - Bangalô
- `chalet` - Chalé
- `cabin` - Cabana
- `studio` - Studio
- `penthouse` - Penthouse
- `other` - Outros

**Características:**
- Pertence a um Empreendimento
- Pode ter número de quarto, andar, prédio
- Características físicas (quartos, banheiros, camas, área)
- Preços próprios ou herda do empreendimento
- Status individual

### 3. ACOMODAÇÕES (Accommodations)

**Tipos Suportados:**
- `single_room` - Quarto individual
- `double_room` - Quarto duplo
- `twin_room` - Quarto com camas separadas
- `triple_room` - Quarto triplo
- `quad_room` - Quarto quádruplo
- `family_room` - Quarto familiar
- `suite` - Suíte
- `apartment` - Apartamento
- `house` - Casa
- `other` - Outros

**Características:**
- Pertence a uma Propriedade
- Pode ter número de quarto, andar
- Características específicas (tipo de cama, etc.)
- Preços próprios ou herda da propriedade/empreendimento
- Status individual (active, reserved, cleaning)

### 4. DISPONIBILIDADE (Accommodation Availability)

**Funcionalidades:**
- Controle de disponibilidade por data
- Preços dinâmicos por data
- Estadia mínima por data
- Notas específicas por data

### 5. REGRAS DE PREÇO (Pricing Rules)

**Tipos de Regras:**
- `seasonal` - Sazonalidade
- `weekend` - Finais de semana
- `holiday` - Feriados
- `event` - Eventos
- `last_minute` - Última hora
- `early_bird` - Antecipação
- `custom` - Personalizada

**Aplicação:**
- Por acomodação específica
- Por propriedade (todas as acomodações)
- Por empreendimento (todas as propriedades/acomodações)

## 🔄 Fluxo de Reserva

1. **Cliente busca** por destino, datas, número de hóspedes
2. **Sistema filtra** empreendimentos disponíveis
3. **Mostra opções** hierárquicas:
   - Empreendimento → Propriedade → Acomodação
4. **Cliente seleciona** acomodação específica
5. **Sistema calcula** preço final considerando:
   - Preço base da acomodação
   - Regras de preço aplicáveis
   - Disponibilidade
   - Taxas (limpeza, serviço)
6. **Cliente confirma** reserva
7. **Sistema bloqueia** acomodação nas datas

## 💰 Sistema de Preços

### Herança de Preços

1. **Acomodação** tem preço próprio (prioridade máxima)
2. Se não tiver, herda da **Propriedade**
3. Se não tiver, herda do **Empreendimento**
4. **Regras de preço** modificam o preço final

### Cálculo de Preço

```
Preço Base = Acomodação OU Propriedade OU Empreendimento
Regras Aplicáveis = Filtrar por data, tipo, etc.
Preço Modificado = Aplicar regras (fixo, percentual, multiplicador)
Preço Final = Preço Modificado + Taxa de Limpeza + Taxa de Serviço
```

## 📱 APIs e Endpoints

### Empreendimentos
- `GET /api/v1/enterprises` - Listar empreendimentos
- `GET /api/v1/enterprises/:id` - Detalhes do empreendimento
- `POST /api/v1/enterprises` - Criar empreendimento
- `PUT /api/v1/enterprises/:id` - Atualizar empreendimento
- `DELETE /api/v1/enterprises/:id` - Deletar empreendimento

### Propriedades
- `GET /api/v1/enterprises/:enterpriseId/properties` - Listar propriedades
- `GET /api/v1/properties/:id` - Detalhes da propriedade
- `POST /api/v1/enterprises/:enterpriseId/properties` - Criar propriedade
- `PUT /api/v1/properties/:id` - Atualizar propriedade
- `DELETE /api/v1/properties/:id` - Deletar propriedade

### Acomodações
- `GET /api/v1/properties/:propertyId/accommodations` - Listar acomodações
- `GET /api/v1/accommodations/:id` - Detalhes da acomodação
- `POST /api/v1/properties/:propertyId/accommodations` - Criar acomodação
- `PUT /api/v1/accommodations/:id` - Atualizar acomodação
- `DELETE /api/v1/accommodations/:id` - Deletar acomodação

### Disponibilidade
- `GET /api/v1/accommodations/:id/availability` - Verificar disponibilidade
- `POST /api/v1/accommodations/:id/availability` - Definir disponibilidade
- `PUT /api/v1/availability/:id` - Atualizar disponibilidade

### Busca e Reserva
- `GET /api/v1/search` - Buscar acomodações disponíveis
- `POST /api/v1/bookings` - Criar reserva

## 🎯 Casos de Uso

### Caso 1: Hotel com Múltiplos Quartos
```
Empreendimento: "Hotel Maravilha"
  ├── Propriedade: "Torre A"
  │   ├── Acomodação: "Quarto 101 - Standard"
  │   ├── Acomodação: "Quarto 102 - Standard"
  │   └── Acomodação: "Quarto 201 - Deluxe"
  └── Propriedade: "Torre B"
      ├── Acomodação: "Quarto 301 - Suite"
      └── Acomodação: "Quarto 302 - Suite"
```

### Caso 2: Resort com Apartamentos e Casas
```
Empreendimento: "Resort Paraíso"
  ├── Propriedade: "Apartamento 101"
  │   └── Acomodação: "Apartamento 101 - 2 Quartos"
  ├── Propriedade: "Casa 1"
  │   └── Acomodação: "Casa 1 - 3 Quartos"
  └── Propriedade: "Casa 2"
      └── Acomodação: "Casa 2 - 4 Quartos"
```

### Caso 3: Pousada com Diferentes Tipos
```
Empreendimento: "Pousada Encanto"
  ├── Propriedade: "Chalé 1"
  │   └── Acomodação: "Chalé 1 - Romântico"
  ├── Propriedade: "Quarto Principal"
  │   └── Acomodação: "Quarto Principal - Vista Mar"
  └── Propriedade: "Bangalô"
      └── Acomodação: "Bangalô - Família"
```

## 🚀 Próximos Passos

1. ✅ Estrutura de banco de dados criada
2. ⏳ APIs RESTful
3. ⏳ Interfaces TypeScript
4. ⏳ Componentes React
5. ⏳ Sistema de busca avançada
6. ⏳ Dashboard de gerenciamento
7. ⏳ Integração com calendário de reservas
