const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Onboarding RSV API",
      version: "1.0.0",
      description: "API completa para o Sistema de Onboarding RSV",
      contact: {
        name: "RSV Team",
        email: "support@onboardingrsv.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === "production"
            ? "https://api.onboardingrsv.com"
            : `http://localhost:${process.env.PORT || 3001}`,
        description:
          process.env.NODE_ENV === "production"
            ? "Production server"
            : "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token for authentication",
        },
      },
      responses: {
        UnauthorizedError: {
          description: "Access token is missing or invalid",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  error: {
                    type: "string",
                    example: "Unauthorized",
                  },
                  message: {
                    type: "string",
                    example: "Invalid or missing authentication token",
                  },
                  code: {
                    type: "string",
                    example: "AUTH_TOKEN_INVALID",
                  },
                },
              },
            },
          },
        },
        ValidationError: {
          description: "Validation error",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  error: {
                    type: "string",
                    example: "Validation Error",
                  },
                  message: {
                    type: "string",
                    example: "Invalid input data",
                  },
                  details: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        field: { type: "string" },
                        message: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        ServerError: {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  error: {
                    type: "string",
                    example: "Internal Server Error",
                  },
                  message: {
                    type: "string",
                    example: "An unexpected error occurred",
                  },
                  code: {
                    type: "string",
                    example: "INTERNAL_ERROR",
                  },
                },
              },
            },
          },
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            name: { type: "string", example: "John Doe" },
            role: {
              type: "string",
              enum: ["admin", "manager", "user"],
              example: "user",
            },
            status: {
              type: "string",
              enum: ["active", "inactive", "pending"],
              example: "active",
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Booking: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            userId: { type: "integer", example: 1 },
            title: { type: "string", example: "Hotel Reservation" },
            description: { type: "string", example: "Booking for 3 nights" },
            startDate: { type: "string", format: "date-time" },
            endDate: { type: "string", format: "date-time" },
            status: {
              type: "string",
              enum: ["pending", "confirmed", "cancelled", "completed"],
            },
            totalAmount: { type: "number", format: "decimal", example: 299.99 },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            password: { type: "string", minLength: 6, example: "password123" },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            token: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            refreshToken: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            user: { $ref: "#/components/schemas/User" },
            expiresIn: { type: "string", example: "7d" },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", minLength: 2, example: "John Doe" },
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            password: { type: "string", minLength: 6, example: "password123" },
            role: { type: "string", enum: ["user"], example: "user" },
          },
        },
        PaginatedResponse: {
          type: "object",
          properties: {
            data: { type: "array", items: {} },
            pagination: {
              type: "object",
              properties: {
                page: { type: "integer", example: 1 },
                limit: { type: "integer", example: 10 },
                total: { type: "integer", example: 100 },
                pages: { type: "integer", example: 10 },
                hasNext: { type: "boolean", example: true },
                hasPrev: { type: "boolean", example: false },
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
        name: "Authentication",
        description: "User authentication and authorization",
      },
      { name: "Users", description: "User management operations" },
      { name: "Bookings", description: "Booking management operations" },
      { name: "Payments", description: "Payment processing and management" },
      { name: "Analytics", description: "Analytics and reporting" },
      { name: "Workflows", description: "Workflow automation" },
      { name: "Projects", description: "Project management" },
      { name: "Financial", description: "Financial management" },
      { name: "Integrations", description: "External integrations" },
      { name: "Security", description: "Security and compliance" },
      { name: "Performance", description: "Performance monitoring" },
      { name: "Backup", description: "Backup and recovery" },
      { name: "Training", description: "Training and onboarding" },
      { name: "System", description: "System utilities and health checks" },
    ],
  },
  apis: [
    path.join(__dirname, "../routes/*.js"),
    path.join(__dirname, "../models/*.js"),
  ],
};

const specs = swaggerJSDoc(options);

const setupSwagger = (app) => {
  // Swagger UI options
  const swaggerOptions = {
    explorer: true,
    swaggerOptions: {
      docExpansion: "none",
      filter: true,
      showRequestDuration: true,
      tryItOutEnabled: true,
      requestInterceptor: (req) => {
        // Add timestamp to requests for debugging
        req.timestamp = new Date().toISOString();
        return req;
      },
    },
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info { margin: 20px 0; }
      .swagger-ui .info .title { color: #3b82f6; }
    `,
    customSiteTitle: "Onboarding RSV API Documentation",
    customfavIcon: "/favicon.ico",
  };

  // Serve Swagger documentation
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));

  // Serve raw swagger spec
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(specs);
  });

  console.log(`📚 Swagger documentation available at /api-docs`);
};

module.exports = { setupSwagger, specs };
