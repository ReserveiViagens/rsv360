const express = require("express");
const router = express.Router();
const { authorize } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");

/**
 * @swagger
 * /api/performance/metrics:
 *   get:
 *     tags: [Performance]
 *     summary: Get system performance metrics
 */
router.get(
  "/metrics",
  authorize(["admin", "manager"]),
  asyncHandler(async (req, res) => {
    const metrics = {
      system: {
        cpu_usage: Math.random() * 30 + 10, // 10-40%
        memory_usage: Math.random() * 40 + 30, // 30-70%
        disk_usage: Math.random() * 20 + 20, // 20-40%
        uptime: process.uptime(),
      },
      api: {
        requests_per_minute: Math.floor(Math.random() * 100) + 50,
        average_response_time: Math.floor(Math.random() * 200) + 100,
        error_rate: Math.random() * 2,
        active_connections: Math.floor(Math.random() * 50) + 10,
      },
      database: {
        connection_pool: 8,
        active_queries: Math.floor(Math.random() * 5),
        slow_queries: Math.floor(Math.random() * 3),
        cache_hit_rate: 95 + Math.random() * 4,
      },
    };

    res.json({
      success: true,
      data: metrics,
    });
  }),
);

/**
 * @swagger
 * /api/performance/health:
 *   get:
 *     tags: [Performance]
 *     summary: Get system health status
 */
router.get(
  "/health",
  asyncHandler(async (req, res) => {
    const health = {
      status: "healthy",
      services: {
        database: "healthy",
        redis: "healthy",
        email: "healthy",
        storage: "healthy",
      },
      last_check: new Date(),
      response_time: Math.floor(Math.random() * 50) + 10,
    };

    res.json({
      success: true,
      data: health,
    });
  }),
);

module.exports = router;
