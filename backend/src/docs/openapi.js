/**
 * RSV360 PMS/CRM — Reservei Viagens
 * Copyright (c) 2024-2026 Reservei Viagens LTDA. Todos os direitos reservados.
 * Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
 * @author Douglas P. Figueiredo
 * @license UNLICENSED
 */
const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'RSV360 PMS/CRM API',
    version: 'fase-4',
    description: 'Documentação operacional da plataforma RSV360.',
    contact: {
      name: 'Douglas P. Figueiredo',
      email: 'douglas@reserveiviagens.com.br',
      url: 'https://www.reserveiviagens.com.br',
    },
    license: {
      name: 'UNLICENSED',
    },
  },
  servers: [
    { url: 'http://localhost:3002', description: 'Desenvolvimento local' },
    { url: 'https://api.reserveiviagens.com.br', description: 'Produção RSV360' },
  ],
  tags: [
    { name: 'Infra', description: 'Health, metrics, docs e identificação' },
    { name: 'Billing', description: 'Pagamentos e integração Stripe' },
    { name: 'Guest Portal', description: 'Portal do hóspede e comunicação' },
    { name: 'Tracking', description: 'Eventos e server-side tracking' },
    { name: 'Property', description: 'Multi-property e tenant isolation' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      propertyIdHeader: {
        type: 'apiKey',
        in: 'header',
        name: 'X-Property-Id',
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Infra'],
        summary: 'Health check principal',
        responses: {
          200: { description: 'Serviço saudável' },
        },
      },
    },
    '/metrics': {
      get: {
        tags: ['Infra'],
        summary: 'Métricas Prometheus',
        responses: {
          200: { description: 'Formato Prometheus' },
        },
      },
    },
    '/api/info': {
      get: {
        tags: ['Infra'],
        summary: 'Metadados institucionais da plataforma',
        responses: {
          200: { description: 'Informações da organização' },
        },
      },
    },
    '/api/openapi.json': {
      get: {
        tags: ['Infra'],
        summary: 'Esquema OpenAPI em JSON',
        responses: {
          200: { description: 'Documento OpenAPI' },
        },
      },
    },
    '/api/docs': {
      get: {
        tags: ['Infra'],
        summary: 'Swagger UI',
        responses: {
          200: { description: 'Interface Swagger' },
        },
      },
    },
    '/api/clone-alert': {
      post: {
        tags: ['Infra'],
        summary: 'Registrar possível clone do portal',
        responses: {
          201: { description: 'Clone registrado' },
        },
      },
    },
    '/api/tracking/event': {
      post: {
        tags: ['Tracking'],
        summary: 'Despachar evento de tracking server-side',
        responses: {
          201: { description: 'Evento processado' },
        },
      },
    },
    '/api/v1/payments/webhooks/stripe': {
      post: {
        tags: ['Billing'],
        summary: 'Webhook Stripe',
        responses: {
          200: { description: 'Webhook aceito' },
        },
      },
    },
    '/api/portal/booking': {
      get: {
        tags: ['Guest Portal'],
        summary: 'Reserva ativa do hóspede',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Dados da reserva' },
        },
      },
    },
    '/api/portal/checkin': {
      post: {
        tags: ['Guest Portal'],
        summary: 'Web check-in',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Check-in realizado' },
        },
      },
    },
    '/api/portal/checkout': {
      post: {
        tags: ['Guest Portal'],
        summary: 'Web check-out',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Check-out realizado' },
        },
      },
    },
    '/api/portal/requests': {
      get: {
        tags: ['Guest Portal'],
        summary: 'Solicitações do hóspede',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Lista de solicitações' },
        },
      },
      post: {
        tags: ['Guest Portal'],
        summary: 'Criar solicitação',
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: 'Solicitação criada' },
        },
      },
    },
    '/api/properties': {
      get: {
        tags: ['Property'],
        summary: 'Listar propriedades',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Lista de propriedades' },
        },
      },
    },
    '/api/crm/guests': {
      get: {
        tags: ['Property'],
        summary: 'Exemplo de endpoint CRM com tenant',
        security: [{ bearerAuth: [] }, { propertyIdHeader: [] }],
        responses: {
          200: { description: 'Lista de hóspedes' },
        },
      },
    },
  },
};

module.exports = { openApiSpec };
