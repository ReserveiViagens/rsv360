/**
 * Test Website API
 * Purpose: Standalone test for website content APIs
 * Author: RSV 360 Integration
 * Date: 2025-01-30
 */

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Import website routes
const websiteRoutes = require("./src/routes/website");
const logger = require("./src/config/logger");

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "Website API Test",
    timestamp: new Date().toISOString(),
  });
});

// Website routes
app.use("/api/website", websiteRoutes);

// Error handler
app.use((err, req, res, next) => {
  logger.error("API Error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development" ? err.message : "Server error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    path: req.originalUrl,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Website API Test Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Website API: http://localhost:${PORT}/api/website`);

  // Test endpoints
  console.log("\n📋 Available endpoints:");
  console.log(`GET /api/website/health`);
  console.log(`GET /api/website/settings`);
  console.log(`GET /api/website/content/hotels`);
  console.log(`GET /api/website/content/promotions`);
  console.log(`GET /api/website/content/attractions`);
});
