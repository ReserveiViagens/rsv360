/**
 * Website Content API Routes
 * Purpose: Public API endpoints for website content management
 * Author: RSV 360 Integration
 * Date: 2025-01-30
 */

const express = require("express");
const router = express.Router();
const { db, cache } = require("../config/database");
const logger = require("../config/logger");

/**
 * GET /api/website/content/:pageType
 * Fetch content by page type (hotels, promotions, attractions, tickets)
 */
router.get("/content/:pageType", async (req, res) => {
  try {
    const { pageType } = req.params;
    const {
      status = "active",
      limit = 50,
      offset = 0,
      include_meta = "false",
    } = req.query;

    // Validate page type
    const validPageTypes = [
      "hotels",
      "promotions",
      "attractions",
      "tickets",
      "contact",
    ];
    if (!validPageTypes.includes(pageType)) {
      return res.status(400).json({
        success: false,
        error: "Invalid page type",
        valid_types: validPageTypes,
      });
    }

    // Create cache key
    const cacheKey = `website:content:${pageType}:${status}:${limit}:${offset}`;

    // Check cache first
    let content = await cache.get(cacheKey);

    if (!content) {
      logger.info(`Cache miss for ${cacheKey}, fetching from database`);

      // Build query
      let query = db("website_content")
        .where("page_type", pageType)
        .where("status", status)
        .orderBy("order_index", "asc")
        .orderBy("created_at", "desc")
        .limit(parseInt(limit))
        .offset(parseInt(offset));

      // Execute query
      content = await query.select([
        "id",
        "content_id",
        "title",
        "description",
        "images",
        "metadata",
        "seo_data",
        "status",
        "order_index",
        "created_at",
        "updated_at",
      ]);

      // Transform data for frontend consumption
      content = content.map((item) => ({
        ...item,
        images:
          typeof item.images === "string"
            ? JSON.parse(item.images)
            : item.images,
        metadata:
          typeof item.metadata === "string"
            ? JSON.parse(item.metadata)
            : item.metadata,
        seo_data:
          typeof item.seo_data === "string"
            ? JSON.parse(item.seo_data)
            : item.seo_data,
      }));

      // Cache for 5 minutes
      await cache.set(cacheKey, content, 300);
    } else {
      logger.info(`Cache hit for ${cacheKey}`);
    }

    // Response structure
    const response = {
      success: true,
      data: content,
      count: content.length,
      page_type: pageType,
      cached: !!content.length,
    };

    // Include metadata if requested
    if (include_meta === "true") {
      response.meta = {
        total_available: await db("website_content")
          .where("page_type", pageType)
          .where("status", status)
          .count("id as count")
          .first()
          .then((result) => parseInt(result.count)),
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: content.length === parseInt(limit),
      };
    }

    res.json(response);
  } catch (error) {
    logger.error("Error fetching website content:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Unable to fetch content",
    });
  }
});

/**
 * GET /api/website/content/:pageType/:contentId
 * Fetch specific content item by page type and content ID
 */
router.get("/content/:pageType/:contentId", async (req, res) => {
  try {
    const { pageType, contentId } = req.params;

    const cacheKey = `website:content:${pageType}:${contentId}`;

    let content = await cache.get(cacheKey);

    if (!content) {
      content = await db("website_content")
        .where("page_type", pageType)
        .where("content_id", contentId)
        .where("status", "active")
        .first();

      if (!content) {
        return res.status(404).json({
          success: false,
          error: "Content not found",
        });
      }

      // Transform JSON fields
      content = {
        ...content,
        images:
          typeof content.images === "string"
            ? JSON.parse(content.images)
            : content.images,
        metadata:
          typeof content.metadata === "string"
            ? JSON.parse(content.metadata)
            : content.metadata,
        seo_data:
          typeof content.seo_data === "string"
            ? JSON.parse(content.seo_data)
            : content.seo_data,
      };

      // Cache for 10 minutes
      await cache.set(cacheKey, content, 600);
    }

    res.json({
      success: true,
      data: content,
    });
  } catch (error) {
    logger.error("Error fetching specific content:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * GET /api/website/settings
 * Fetch website global settings
 */
router.get("/settings", async (req, res) => {
  try {
    const cacheKey = "website:settings:all";

    let settings = await cache.get(cacheKey);

    if (!settings) {
      logger.info("Cache miss for website settings, fetching from database");

      const rawSettings = await db("website_settings").select([
        "setting_key",
        "setting_value",
        "description",
        "updated_at",
      ]);

      // Transform to key-value object
      settings = rawSettings.reduce((acc, setting) => {
        acc[setting.setting_key] = {
          value:
            typeof setting.setting_value === "string"
              ? JSON.parse(setting.setting_value)
              : setting.setting_value,
          description: setting.description,
          updated_at: setting.updated_at,
        };
        return acc;
      }, {});

      // Cache for 10 minutes
      await cache.set(cacheKey, settings, 600);
    }

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    logger.error("Error fetching website settings:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * GET /api/website/settings/:key
 * Fetch specific website setting by key
 */
router.get("/settings/:key", async (req, res) => {
  try {
    const { key } = req.params;

    const cacheKey = `website:setting:${key}`;

    let setting = await cache.get(cacheKey);

    if (!setting) {
      setting = await db("website_settings")
        .where("setting_key", key)
        .select(["setting_key", "setting_value", "description", "updated_at"])
        .first();

      if (!setting) {
        return res.status(404).json({
          success: false,
          error: `Setting '${key}' not found`,
        });
      }

      // Transform setting value
      setting = {
        key: setting.setting_key,
        value:
          typeof setting.setting_value === "string"
            ? JSON.parse(setting.setting_value)
            : setting.setting_value,
        description: setting.description,
        updated_at: setting.updated_at,
      };

      // Cache for 15 minutes
      await cache.set(cacheKey, setting, 900);
    }

    res.json({
      success: true,
      data: setting,
    });
  } catch (error) {
    logger.error(`Error fetching setting ${req.params.key}:`, error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * GET /api/website/health
 * Health check endpoint for website content API
 */
router.get("/health", async (req, res) => {
  try {
    // Test database connection
    const dbTest = await db.raw("SELECT 1 as test");

    // Test cache connection
    const cacheTest = await cache.set(
      "health_check",
      { timestamp: Date.now() },
      30,
    );

    res.json({
      success: true,
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: dbTest ? "connected" : "disconnected",
        cache: cacheTest ? "connected" : "disconnected",
      },
    });
  } catch (error) {
    logger.error("Health check failed:", error);
    res.status(503).json({
      success: false,
      status: "unhealthy",
      error: error.message,
    });
  }
});

module.exports = router;
