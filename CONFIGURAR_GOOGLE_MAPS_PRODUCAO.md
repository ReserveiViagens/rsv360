# Guia: Configurar Google Maps para Produção

**Objetivo:** Ativar o Google Maps na página de leilões e em todo o site, eliminando o erro `BillingNotEnabledMapError` e a mensagem "Esta página não carregou o Google Maps corretamente".

---

## Pré-requisitos

- Conta Google (Gmail)
- Cartão de crédito (para vincular ao faturamento – há crédito gratuito mensal)
- Acesso ao [Google Cloud Console](https://console.cloud.google.com/)

---

## Passo 1: Criar ou selecionar projeto

1. Acesse: https://console.cloud.google.com/
2. No seletor de projetos (topo da página), clique em **Selecionar projeto**
3. Clique em **Novo projeto** ou selecione um existente
4. Nome sugerido: `RSV360` ou `RSV360-Producao`
5. Clique em **Criar**

---

## Passo 2: Ativar faturamento

1. No menu lateral, vá em **Faturamento** → **Minha conta de faturamento**
2. Se não tiver conta, clique em **Criar conta de faturamento**
3. Preencha os dados (nome, endereço, cartão de crédito)
4. **Crédito gratuito:** O Google oferece cerca de US$ 200/mês em crédito para Maps
5. Vincule o projeto à conta de faturamento:
   - **Faturamento** → **Vincular conta** → Selecione o projeto RSV360

---

## Passo 3: Habilitar APIs necessárias

1. No menu lateral: **APIs e serviços** → **Biblioteca**
2. Ative as seguintes APIs:
   - **Maps JavaScript API** (obrigatória)
   - **Places API** (usada pelo site)
   - **Geocoding API** (opcional, para endereços)

---

## Passo 4: Criar ou configurar API Key

1. **APIs e serviços** → **Credenciais**
2. Clique em **+ Criar credenciais** → **Chave de API**
3. Copie a chave gerada (ex: `AIzaSy...`)
4. Clique em **Editar chave de API** (ícone de lápis) para configurar restrições

### Restrições de aplicativo (recomendado para produção)

- **Restrição de aplicativo:** Escolha **Referenciadores HTTP**
- Adicione os domínios permitidos:
  ```
  http://localhost:3000/*
  http://localhost:3000
  https://seudominio.com.br/*
  https://www.seudominio.com.br/*
  https://*.seudominio.com.br/*
  ```

### Restrições de API

- **Restringir chave:** Sim
- Selecione apenas: **Maps JavaScript API**, **Places API**, **Geocoding API**

---

## Passo 5: Configurar variável de ambiente

### Desenvolvimento (`.env.local`)

Arquivo: `apps/site-publico/.env.local`

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua_api_key_aqui
```

### Produção (Vercel, Netlify, etc.)

1. Acesse o painel do seu provedor de hospedagem
2. Vá em **Configurações** → **Variáveis de ambiente**
3. Adicione:
   - **Nome:** `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - **Valor:** sua API Key do Google Maps

---

## Passo 6: Verificar funcionamento

1. Reinicie o site público (ou faça novo deploy em produção)
2. Acesse: http://localhost:3000/leiloes (ou sua URL de produção)
3. O mapa deve carregar com o Google Maps
4. Se ainda aparecer OpenStreetMap, verifique:
   - API Key está correta no `.env.local` ou nas variáveis de produção
   - Faturamento está ativo
   - Domínio está nas restrições da API Key

---

## Custos e limites

| Recurso              | Gratuito/mês     | Após limite |
|----------------------|------------------|-------------|
| Maps JavaScript API  | ~28.000 carregamentos | US$ 7 / 1.000 |
| Places API           | ~5.000 solicitações   | Variável     |
| Crédito mensal Google | US$ 200             | -            |

Para a maioria dos sites de turismo, o crédito gratuito cobre o uso normal.

---

## Troubleshooting

### Erro: "BillingNotEnabledMapError"
- **Causa:** Faturamento não ativado
- **Solução:** Passo 2 – vincular conta de faturamento ao projeto

### Erro: "RefererNotAllowedMapError"
- **Causa:** Domínio não está nas restrições da API Key
- **Solução:** Passo 4 – adicionar o domínio em "Referenciadores HTTP"

### Mapa não carrega (tela cinza)
- **Causa:** API Key inválida ou APIs não habilitadas
- **Solução:** Passos 3 e 4 – habilitar APIs e verificar a chave

### Fallback OpenStreetMap aparece
- O sistema já tem fallback automático para OpenStreetMap
- Quando o Google Maps estiver configurado corretamente, ele será usado automaticamente

---

## Links úteis

- [Google Cloud Console](https://console.cloud.google.com/)
- [Maps JavaScript API – Documentação](https://developers.google.com/maps/documentation/javascript)
- [Preços do Google Maps Platform](https://mapsplatform.google.com/pricing/)
- [Erros comuns e soluções](https://developers.google.com/maps/documentation/javascript/error-messages)
