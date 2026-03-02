# Ativação do Módulo de Leilões - RSV360

## Por que aparece "Nenhum leilão ativo no momento"?

A mensagem aparece porque:
1. **Backend retorna lista vazia** – Não há registros na tabela `auctions` com `status = 'active'` e `end_date > NOW()`
2. **Backend fora do ar** – Se o servidor na porta 5000 não estiver rodando, a requisição falha e o frontend trata como "nenhum leilão"
3. **Banco sem dados** – As tabelas `enterprises`, `properties`, `accommodations` e `auctions` podem estar vazias

---

## Checklist para Ativar Leilões em Produção

### 1. Infraestrutura

| Item | Verificação |
|------|-------------|
| Backend rodando | `http://localhost:5000` deve responder |
| Banco PostgreSQL | Conexão configurada em `DATABASE_URL` |
| Migrations | Executadas (incluindo `007_create_auctions_tables`) |
| Redis | Usado para cache e locks (opcional, mas recomendado) |

### 2. Tabelas Necessárias

- `enterprises` – hotéis/empreendimentos
- `properties` – propriedades (prédios) de um enterprise
- `accommodations` – acomodações (quartos) de uma property
- `auctions` – leilões
- `bids` – lances
- `customers` – clientes (para dar lance)

### 3. Dados Mínimos

Para criar um leilão ativo é obrigatório ter ao menos um `enterprise`:

```sql
-- Exemplo: inserir um enterprise
INSERT INTO enterprises (name, address_city, address_state, latitude, longitude, created_at, updated_at)
VALUES ('Lagoa Eco Towers', 'Caldas Novas', 'GO', -17.7444, -48.6278, NOW(), NOW());
```

---

## Fluxo por Perfil

### Administrador (Admin CMS)

1. Acesse `/admin/login` e faça login
2. Vá em **CMS** → aba **Leilões**
3. Clique em **"Novo Leilão"**
4. Preencha:
   - **Título** (ex.: "Suíte Premium - Lagoa Eco Towers")
   - **Enterprise ID** (ID de um registro em `enterprises`)
   - **Preço inicial** (R$)
   - **Data/hora início** e **fim**
   - Status: `scheduled` (será ativado automaticamente na data de início)

5. Salve – o job de cron ativa o leilão quando `start_date` for atingida

### Proprietário

- Hoje o fluxo de proprietário passa pelo Admin ou pelo painel do proprietário, se existir rota para criar leilões
- É necessário garantir que o proprietário tenha `enterprise_id` associado ao seu usuário

### Usuário (Comprador)

1. Acesse `/leiloes`
2. Veja leilões ativos no mapa e na lista
3. Para dar lance: **precisa estar logado** (rota `/api/v1/auctions/:id/bids` exige autenticação)
4. Clique em "Participar do Leilão" e faça o lance

---

## Conexão entre Leilões e Hotéis

- **Leilões** usam `enterprise_id`, `property_id`, `accommodation_id`
- **Hotéis do CMS** vêm de `/api/website/content/hotels` (outra fonte de dados)
- O match é feito por `property_id`, `accommodation_id` ou por título
- Para exibir foto e preço corretos no mapa, o ideal é que `auction.property_id` ou `auction.accommodation_id` corresponda ao `id` do hotel no CMS, ou que o `enterprise_id` tenha relação com o conteúdo de hotéis

---

## Como Criar Leilões de Teste Rapidamente

### Opção A: Via Admin CMS

1. Garantir que exista ao menos 1 `enterprise` no banco
2. Acessar `/admin/cms` → Leilões → Novo Leilão
3. Usar `enterprise_id = 1` (ou o ID que existir)
4. Data início: agora ou no passado recente
5. Data fim: daqui a alguns dias
6. Status: `scheduled` ou `active`

### Opção B: Script de Seed (Recomendado)

Use o script pronto na pasta do backend:

```bash
cd backend
npm run seed:auctions
```

O script:
- Verifica se as tabelas `enterprises` e `auctions` existem
- Cria enterprises de exemplo (Lagoa Eco Towers, Piazza DiRoma, etc.) se não existirem
- Cria um leilão ativo com validade de 7 dias
- Encerra a conexão ao final

Se aparecer erro de tabela inexistente, execute antes: `npm run migrate`

---

## Configurações Importantes

### Backend

- `NEXT_PUBLIC_API_URL` no frontend deve apontar para o backend (ex.: `http://localhost:5000` em dev)
- Jobs de leilão devem estar rodando (início automático e finalização de leilões)

### Autenticação para Lances

- `POST /api/v1/auctions/:id/bids` exige token JWT
- O `customer_id` é obtido do usuário logado
- Para permitir lances sem login seria preciso alterar a rota e o controller (não recomendado em produção)

---

## Script de Seed (Referência)

O script está em `backend/scripts/seed-auctions.js`. Ele usa `../database/db` para o pool PostgreSQL e cria enterprises e um leilão ativo. Para executar: `npm run seed:auctions` (na pasta backend).

---

## Resumo – O Que Fazer AGORA

1. **Subir o backend**  
   - Ex.: `.\Iniciar Sistema Completo.ps1` ou `npm run dev:backend`

2. **Rodar migrations**  
   - `npm run migrate` (no backend)

3. **Inserir ao menos 1 enterprise**  
   - Via SQL ou painel admin, se existir cadastro de enterprises

4. **Criar um leilão ativo**  
   - Pelo Admin CMS (`/admin/cms` → Leilões) ou via seed

5. **Testar**  
   - Acessar `/leiloes` e verificar se o leilão aparece no mapa e na lista

6. **Para usuários darem lance**  
   - Garantir que possam se registrar e fazer login; o token será usado na rota de lances
