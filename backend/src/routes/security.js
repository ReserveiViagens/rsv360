const express = require("express");
const router = express.Router();
const { authorize } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");

/**
 * @swagger
 * /api/security/overview:
 *   get:
 *     tags: [Security]
 *     summary: Get security overview
 */
router.get(
  "/overview",
  authorize(["admin"]),
  asyncHandler(async (req, res) => {
    const securityData = {
      threat_level: "low",
      failed_logins_24h: Math.floor(Math.random() * 10),
      active_sessions: Math.floor(Math.random() * 20) + 5,
      last_security_scan: new Date(Date.now() - 86400000),
      vulnerabilities: {
        critical: 0,
        high: 0,
        medium: 1,
        low: 2,
      },
      compliance: {
        lgpd: true,
        ssl_certificate: true,
        password_policy: true,
        two_factor: true,
      },
    };

    res.json({
      success: true,
      data: securityData,
    });
  }),
);

/**
 * @swagger
 * /api/security/audit-logs:
 *   get:
 *     tags: [Security]
 *     summary: Get security audit logs
 */
router.get(
  "/audit-logs",
  authorize(["admin"]),
  asyncHandler(async (req, res) => {
    const logs = [
      {
        id: 1,
        event: "login_success",
        user: "admin@reserveiviagens.com.br",
        ip: "192.168.1.100",
        timestamp: new Date(),
        details: "Successful admin login",
      },
      {
        id: 2,
        event: "failed_login",
        user: "unknown@email.com",
        ip: "123.456.789.123",
        timestamp: new Date(Date.now() - 3600000),
        details: "Failed login attempt - invalid credentials",
      },
    ];

    res.json({
      success: true,
      data: logs,
    });
  }),
);

module.exports = router;
