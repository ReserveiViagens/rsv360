# Configuração da Integração N8N - Reservei Viagens

## 🚀 Visão Geral

Este sistema integra o chat do site da Reservei Viagens com N8N para automação completa do atendimento ao cliente.

## 📋 Pré-requisitos

- Instância do N8N rodando (self-hosted ou cloud)
- Webhook configurado no N8N
- API Key do N8N (opcional, para autenticação)

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

\`\`\`env
# Server-side only (secure)
N8N_WEBHOOK_URL=https://sua-instancia-n8n.com/webhook/reservei-chat
N8N_API_KEY=sua-api-key-aqui

# Client-side (public)
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://sua-instancia-n8n.com/webhook/reservei-chat
\`\`\`

### 2. Workflow N8N Sugerido

\`\`\`json
{
  "name": "Reservei Viagens - Chat Automation",
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "reservei-chat",
        "httpMethod": "POST"
      }
    },
    {
      "name": "Process Message",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": "// Processar mensagem do chat\nconst message = items[0].json.message;\nconst sessionId = items[0].json.sessionId;\n\n// Lógica de processamento aqui\nreturn items;"
      }
    },
    {
      "name": "OpenAI",
      "type": "n8n-nodes-base.openAi",
      "parameters": {
        "operation": "chat",
        "model": "gpt-3.5-turbo",
        "messages": "={{ $json.processedMessage }}"
      }
    },
    {
      "name": "WhatsApp Business",
      "type": "n8n-nodes-base.whatsApp",
      "parameters": {
        "operation": "sendMessage"
      }
    },
    {
      "name": "Google Sheets",
      "type": "n8n-nodes-base.googleSheets",
      "parameters": {
        "operation": "append"
      }
    }
  ]
}
\`\`\`

## 🔄 Fluxo de Automação

1. **Recepção**: Webhook recebe mensagem do chat
2. **Processamento**: IA analisa intenção do cliente
3. **Classificação**: Determina tipo de solicitação
4. **Resposta**: Gera resposta automática ou transfere para humano
5. **Integração**: Conecta com WhatsApp Business
6. **Registro**: Salva dados em planilha/CRM
7. **Follow-up**: Agenda acompanhamento automático

## 📊 Endpoints Disponíveis

### POST /api/n8n
Recebe mensagens do chat via API route segura

**Payload:**
\`\`\`json
{
  "sessionId": "session_123456",
  "message": "Quero fazer uma reserva",
  "messageType": "text",
  "userInfo": {
    "name": "João Silva",
    "email": "joao@email.com",
    "phone": "(64) 99999-9999"
  },
  "timestamp": "2025-01-20T15:30:00Z",
  "source": "website_chat"
}
\`\`\`

**Resposta:**
\`\`\`json
{
  "reply": "Olá João! Vou ajudá-lo com sua reserva...",
  "isHuman": false,
  "type": "text",
  "metadata": {
    "intent": "booking",
    "confidence": 0.95,
    "nextAction": "collect_dates"
  }
}
\`\`\`

### GET /api/n8n
Verifica status dos agentes

**Resposta:**
\`\`\`json
{
  "status": "online",
  "availableAgents": 3,
  "queueLength": 2
}
\`\`\`

## 🛠️ Configurações Avançadas

### Integrações Recomendadas

1. **OpenAI/ChatGPT**: Respostas inteligentes
2. **WhatsApp Business API**: Transferência de conversas
3. **Google Sheets**: Registro de leads
4. **Gmail/SMTP**: Notificações por email
5. **Slack**: Alertas para equipe
6. **CRM**: Integração com sistema de vendas

### Triggers Automáticos

- Nova mensagem no chat
- Cliente inativo por X minutos
- Palavra-chave específica detectada
- Horário comercial (fora do expediente)
- Volume alto de mensagens

## 🔧 Troubleshooting

### Erro: "Failed to fetch"
- Verifique se o N8N está rodando
- Confirme a URL do webhook
- Teste conectividade de rede
- Verifique CORS se necessário

### Webhook não responde
- Confirme se o workflow está ativo
- Verifique logs do N8N
- Teste endpoint manualmente
- Confirme autenticação

### Respostas lentas
- Otimize workflow N8N
- Configure timeout adequado
- Use cache quando possível
- Monitore performance

## 📈 Métricas e Monitoramento

O sistema coleta automaticamente:
- Número de conversas
- Tempo de resposta
- Taxa de resolução
- Satisfação do cliente
- Conversões geradas

## 🔒 Segurança

- API Keys mantidas no servidor
- HTTPS obrigatório
- Rate limiting implementado
- Logs de acesso monitorados
- Dados sensíveis criptografados

## 📞 Suporte

Para dúvidas sobre a integração:
- Email: tech@reserveiviagens.com.br
- WhatsApp: (64) 99319-7555
