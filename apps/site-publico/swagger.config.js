/**
 * ✅ CONFIGURAÇÃO SWAGGER/OPENAPI
 * Configuração para documentação automática de APIs
 */

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'RSV Gen 2 API',
    version: '2.0.0',
    description: 'API completa para gestão de reservas de hospedagem',
    contact: {
      name: 'RSV Support',
      email: 'support@rsv.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      description: 'Servidor de desenvolvimento',
    },
    {
      url: 'https://api.rsv.com',
      description: 'Servidor de produção',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          error: {
            type: 'string',
            example: 'Mensagem de erro',
          },
          details: {
            type: 'array',
            items: {
              type: 'object',
            },
          },
        },
      },
      Success: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'object',
          },
          message: {
            type: 'string',
            example: 'Operação realizada com sucesso',
          },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Token de autenticação inválido ou ausente',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              error: 'Não autenticado',
            },
          },
        },
      },
      ForbiddenError: {
        description: 'Acesso negado',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              error: 'Acesso negado',
            },
          },
        },
      },
      ValidationError: {
        description: 'Dados de entrada inválidos',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              error: 'Dados inválidos',
              details: [
                {
                  path: ['field'],
                  message: 'Campo obrigatório',
                },
              ],
            },
          },
        },
      },
      NotFoundError: {
        description: 'Recurso não encontrado',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              error: 'Recurso não encontrado',
            },
          },
        },
      },
      InternalServerError: {
        description: 'Erro interno do servidor',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              error: 'Erro interno do servidor',
            },
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [
    {
      name: 'Autenticação',
      description: 'Endpoints de autenticação e autorização',
    },
    {
      name: 'Reservas',
      description: 'Gerenciamento de reservas',
    },
    {
      name: 'Viagens em Grupo',
      description: 'Wishlists, split payment, convites, chat',
    },
    {
      name: 'Smart Pricing',
      description: 'Precificação inteligente com IA',
    },
    {
      name: 'Programa Top Host',
      description: 'Ratings, badges, leaderboard',
    },
    {
      name: 'Seguros',
      description: 'Apólices e sinistros',
    },
    {
      name: 'Verificação',
      description: 'Verificação de propriedades',
    },
    {
      name: 'Integrações',
      description: 'Google Calendar, Smart Locks, Klarna',
    },
  ],
};

module.exports = swaggerDefinition;

