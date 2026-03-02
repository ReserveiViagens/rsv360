const express = require("express");
const router = express.Router();
const { body, query, param, validationResult } = require("express-validator");
const { authorize } = require("../middleware/auth");
const { asyncHandler, AppError } = require("../middleware/errorHandler");
const logger = require("../utils/logger");

// Mock integrations data
let integrations = [
  {
    id: 1,
    name: "WhatsApp Business API",
    type: "messaging",
    status: "active",
    description: "Envio de notificações e confirmações via WhatsApp",
    endpoint: "https://api.whatsapp.com/send",
    auth_type: "token",
    last_sync: new Date(),
    success_rate: 98.5,
    total_requests: 1250,
  },
  {
    id: 2,
    name: "Pagar.me Gateway",
    type: "payment",
    status: "active",
    description: "Processamento de pagamentos online",
    endpoint: "https://api.pagar.me/1",
    auth_type: "api_key",
    last_sync: new Date(),
    success_rate: 99.2,
    total_requests: 850,
  },
  {
    id: 3,
    name: "Mailchimp Marketing",
    type: "email",
    status: "active",
    description: "Email marketing e campanhas automatizadas",
    endpoint: "https://us1.api.mailchimp.com/3.0",
    auth_type: "oauth",
    last_sync: new Date(Date.now() - 3600000),
    success_rate: 96.8,
    total_requests: 320,
  },
  {
    id: 4,
    name: "Google Analytics",
    type: "analytics",
    status: "inactive",
    description: "Análise de tráfego e conversões do site",
    endpoint: "https://analytics.googleapis.com/v1",
    auth_type: "oauth",
    last_sync: new Date(Date.now() - 86400000),
    success_rate: 100.0,
    total_requests: 150,
  },
];

/**
 * @swagger
 * /api/integrations:
 *   get:
 *     tags: [Integrations]
 *     summary: Get all integrations
 */
router.get(
  "/",
  [
    authorize(["admin", "manager"]),
    query("type")
      .optional()
      .isIn(["messaging", "payment", "email", "analytics", "crm"]),
    query("status").optional().isIn(["active", "inactive", "error"]),
  ],
  asyncHandler(async (req, res) => {
    const { type, status } = req.query;

    let filteredIntegrations = [...integrations];

    if (type) {
      filteredIntegrations = filteredIntegrations.filter(
        (i) => i.type === type,
      );
    }

    if (status) {
      filteredIntegrations = filteredIntegrations.filter(
        (i) => i.status === status,
      );
    }

    res.json({
      success: true,
      data: {
        integrations: filteredIntegrations,
        summary: {
          total: integrations.length,
          active: integrations.filter((i) => i.status === "active").length,
          by_type: {
            messaging: integrations.filter((i) => i.type === "messaging")
              .length,
            payment: integrations.filter((i) => i.type === "payment").length,
            email: integrations.filter((i) => i.type === "email").length,
            analytics: integrations.filter((i) => i.type === "analytics")
              .length,
          },
        },
      },
    });
  }),
);

/**
 * @swagger
 * /api/integrations/{id}/test:
 *   post:
 *     tags: [Integrations]
 *     summary: Test integration connection
 */
router.post(
  "/:id/test",
  [authorize(["admin", "manager"]), param("id").isInt({ min: 1 }).toInt()],
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const integration = integrations.find((i) => i.id === parseInt(id));

    if (!integration) {
      throw new AppError("Integration not found", 404, "INTEGRATION_NOT_FOUND");
    }

    // Simulate connection test
    const testResult = {
      integration_id: integration.id,
      test_time: new Date(),
      status: Math.random() > 0.1 ? "success" : "failed",
      response_time: Math.floor(Math.random() * 1000) + 100,
      details:
        Math.random() > 0.1 ? "Connection successful" : "Authentication failed",
    };

    logger.info(`Integration test: ${integration.name} - ${testResult.status}`);

    res.json({
      success: true,
      data: testResult,
    });
  }),
);

/**
 * @swagger
 * /api/integrations/webhooks:
 *   get:
 *     tags: [Integrations]
 *     summary: Get webhook configurations
 */
router.get(
  "/webhooks",
  authorize(["admin", "manager"]),
  asyncHandler(async (req, res) => {
    const webhooks = [
      {
        id: 1,
        name: "Pagar.me Payment Status",
        url: "/webhooks/pagarme/payment",
        events: ["payment.paid", "payment.failed", "payment.refunded"],
        status: "active",
        secret: "wh_***********",
        last_received: new Date(),
        total_received: 125,
      },
      {
        id: 2,
        name: "Booking Confirmation",
        url: "/webhooks/booking/confirmed",
        events: ["booking.confirmed", "booking.cancelled"],
        status: "active",
        secret: "wh_***********",
        last_received: new Date(Date.now() - 3600000),
        total_received: 45,
      },
    ];

    res.json({
      success: true,
      data: webhooks,
    });
  }),
);

/**
 * @swagger
 * /api/integrations/sync:
 *   post:
 *     tags: [Integrations]
 *     summary: Sync all active integrations
 */
router.post(
  "/sync",
  authorize(["admin", "manager"]),
  asyncHandler(async (req, res) => {
    const activeIntegrations = integrations.filter(
      (i) => i.status === "active",
    );

    const syncResults = activeIntegrations.map((integration) => ({
      integration_id: integration.id,
      name: integration.name,
      status: Math.random() > 0.05 ? "success" : "failed",
      sync_time: new Date(),
      records_synced: Math.floor(Math.random() * 100) + 1,
    }));

    // Update last_sync for successful syncs
    syncResults.forEach((result) => {
      if (result.status === "success") {
        const integration = integrations.find(
          (i) => i.id === result.integration_id,
        );
        if (integration) {
          integration.last_sync = result.sync_time;
        }
      }
    });

    logger.info(
      `Integration sync completed: ${syncResults.length} integrations processed`,
    );

    res.json({
      success: true,
      message: "Sync completed",
      data: {
        total_processed: syncResults.length,
        successful: syncResults.filter((r) => r.status === "success").length,
        failed: syncResults.filter((r) => r.status === "failed").length,
        results: syncResults,
      },
    });
  }),
);

/**
 * @swagger
 * /api/integrations/logs:
 *   get:
 *     tags: [Integrations]
 *     summary: Get integration activity logs
 */
router.get(
  "/logs",
  [
    authorize(["admin", "manager"]),
    query("integration_id").optional().isInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  asyncHandler(async (req, res) => {
    const { integration_id, limit = 50 } = req.query;

    // Mock log data
    const logs = [
      {
        id: 1,
        integration_id: 1,
        integration_name: "WhatsApp Business API",
        event_type: "message_sent",
        timestamp: new Date(),
        status: "success",
        details: "Confirmation message sent to +55 64 99999-1111",
        response_time: 450,
      },
      {
        id: 2,
        integration_id: 2,
        integration_name: "Pagar.me Gateway",
        event_type: "payment_processed",
        timestamp: new Date(Date.now() - 1800000),
        status: "success",
        details: "Payment of R$ 1200.00 processed successfully",
        response_time: 1200,
      },
      {
        id: 3,
        integration_id: 1,
        integration_name: "WhatsApp Business API",
        event_type: "message_failed",
        timestamp: new Date(Date.now() - 3600000),
        status: "failed",
        details: "Failed to send message: Invalid phone number",
        response_time: 300,
      },
    ];

    let filteredLogs = logs;

    if (integration_id) {
      filteredLogs = logs.filter(
        (log) => log.integration_id === parseInt(integration_id),
      );
    }

    const paginatedLogs = filteredLogs.slice(0, limit);

    res.json({
      success: true,
      data: {
        logs: paginatedLogs,
        total: filteredLogs.length,
        limit,
      },
    });
  }),
);

/**
 * @swagger
 * /api/integrations/stats:
 *   get:
 *     tags: [Integrations]
 *     summary: Get integration statistics
 */
router.get(
  "/stats",
  authorize(["admin", "manager"]),
  asyncHandler(async (req, res) => {
    const stats = {
      overview: {
        total_integrations: integrations.length,
        active_integrations: integrations.filter((i) => i.status === "active")
          .length,
        total_requests_today: integrations.reduce(
          (sum, i) => sum + Math.floor(i.total_requests * 0.1),
          0,
        ),
        average_success_rate:
          integrations.reduce((sum, i) => sum + i.success_rate, 0) /
          integrations.length,
      },
      by_type: integrations.reduce((acc, integration) => {
        acc[integration.type] = (acc[integration.type] || 0) + 1;
        return acc;
      }, {}),
      performance: integrations
        .map((i) => ({
          name: i.name,
          success_rate: i.success_rate,
          total_requests: i.total_requests,
          status: i.status,
        }))
        .sort((a, b) => b.success_rate - a.success_rate),
    };

    res.json({
      success: true,
      data: stats,
    });
  }),
);

module.exports = router;
