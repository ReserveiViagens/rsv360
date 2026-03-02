const express = require("express");
const router = express.Router();
const { body, query, param, validationResult } = require("express-validator");
const { authorize } = require("../middleware/auth");
const { db } = require("../config/database");
const { asyncHandler, AppError } = require("../middleware/errorHandler");
const logger = require("../utils/logger");
const { auditLogger } = require("../utils/auditLogger");

/**
 * @swagger
 * /api/travel-packages:
 *   get:
 *     tags: [Travel Packages]
 *     summary: Get all travel packages
 */
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }).toInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
    query("search").optional().trim(),
    query("destination").optional().trim(),
    query("category")
      .optional()
      .isIn(["package", "hotel", "flight", "tour", "activity"]),
    query("status")
      .optional()
      .isIn(["active", "inactive", "draft", "sold_out"]),
    query("min_price").optional().isFloat({ min: 0 }),
    query("max_price").optional().isFloat({ min: 0 }),
    query("duration").optional().isInt({ min: 1 }),
    query("is_featured").optional().isBoolean(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(
        "Validation failed",
        400,
        "VALIDATION_ERROR",
        errors.array(),
      );
    }

    const {
      page = 1,
      limit = 10,
      search,
      destination,
      category,
      status = "active",
      min_price,
      max_price,
      duration,
      is_featured,
    } = req.query;

    const offset = (page - 1) * limit;

    // Build query
    let query = db("travel_packages").select(
      "id",
      "name",
      "slug",
      "short_description",
      "destination",
      "category",
      "duration_days",
      "duration_nights",
      "base_price",
      "adult_price",
      "child_price",
      "currency",
      "min_people",
      "max_people",
      "status",
      "is_featured",
      "hotel_name",
      "hotel_stars",
      "average_rating",
      "total_reviews",
      "total_bookings",
      "created_at",
    );

    // Apply filters
    if (search) {
      query = query.where(function () {
        this.where("name", "like", `%${search}%`)
          .orWhere("description", "like", `%${search}%`)
          .orWhere("destination", "like", `%${search}%`);
      });
    }

    if (destination) {
      query = query.where("destination", "like", `%${destination}%`);
    }

    if (category) {
      query = query.where("category", category);
    }

    if (status) {
      query = query.where("status", status);
    }

    if (min_price) {
      query = query.where("base_price", ">=", min_price);
    }

    if (max_price) {
      query = query.where("base_price", "<=", max_price);
    }

    if (duration) {
      query = query.where("duration_days", duration);
    }

    if (is_featured !== undefined) {
      query = query.where("is_featured", is_featured);
    }

    // Get total count
    const totalQuery = query.clone();
    const total = await totalQuery.count("* as count").first();

    // Get paginated results
    const packages = await query
      .limit(limit)
      .offset(offset)
      .orderBy([
        { column: "is_featured", order: "desc" },
        { column: "average_rating", order: "desc" },
        { column: "created_at", order: "desc" },
      ]);

    res.json({
      success: true,
      data: {
        packages,
        pagination: {
          total: total.count,
          count: packages.length,
          per_page: limit,
          current_page: page,
          total_pages: Math.ceil(total.count / limit),
        },
      },
    });
  }),
);

/**
 * @swagger
 * /api/travel-packages/{id}:
 *   get:
 *     tags: [Travel Packages]
 *     summary: Get travel package by ID
 */
router.get(
  "/:id",
  [param("id").isInt({ min: 1 }).toInt()],
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const travelPackage = await db("travel_packages").where({ id }).first();

    if (!travelPackage) {
      throw new AppError("Travel package not found", 404, "PACKAGE_NOT_FOUND");
    }

    // Parse JSON fields
    const packageData = {
      ...travelPackage,
      included_services: travelPackage.included_services
        ? JSON.parse(travelPackage.included_services)
        : [],
      excluded_services: travelPackage.excluded_services
        ? JSON.parse(travelPackage.excluded_services)
        : [],
      itinerary: travelPackage.itinerary ? JSON.parse(travelPackage.itinerary) : {},
      requirements: travelPackage.requirements
        ? JSON.parse(travelPackage.requirements)
        : [],
      recommendations: travelPackage.recommendations
        ? JSON.parse(travelPackage.recommendations)
        : [],
      hotel_amenities: travelPackage.hotel_amenities
        ? JSON.parse(travelPackage.hotel_amenities)
        : [],
      seasonal_pricing: travelPackage.seasonal_pricing
        ? JSON.parse(travelPackage.seasonal_pricing)
        : {},
      availability_calendar: travelPackage.availability_calendar
        ? JSON.parse(travelPackage.availability_calendar)
        : {},
      gallery_images: travelPackage.gallery_images
        ? JSON.parse(travelPackage.gallery_images)
        : [],
      gallery_videos: travelPackage.gallery_videos
        ? JSON.parse(travelPackage.gallery_videos)
        : [],
      tags: travelPackage.tags ? JSON.parse(travelPackage.tags) : [],
    };

    // Get related bookings count for this package
    const bookingStats = await db("bookings")
      .where("title", "like", `%${travelPackage.name}%`)
      .select(
        db.raw("COUNT(*) as total_bookings"),
        db.raw("COUNT(CASE WHEN status = ? THEN 1 END) as confirmed_bookings", [
          "confirmed",
        ]),
        db.raw("AVG(total_amount) as average_booking_value"),
      )
      .first();

    res.json({
      success: true,
      data: {
        package: packageData,
        stats: bookingStats,
      },
    });
  }),
);

/**
 * @swagger
 * /api/travel-packages:
 *   post:
 *     tags: [Travel Packages]
 *     summary: Create new travel package
 */
router.post(
  "/",
  [
    authorize(["admin", "manager"]),
    body("name").trim().isLength({ min: 3, max: 200 }),
    body("description").optional().trim(),
    body("short_description").optional().trim(),
    body("destination").trim().isLength({ min: 2, max: 100 }),
    body("category")
      .optional()
      .isIn(["package", "hotel", "flight", "tour", "activity"]),
    body("duration_days").isInt({ min: 1, max: 365 }),
    body("duration_nights").optional().isInt({ min: 0, max: 364 }),
    body("base_price").isFloat({ min: 0 }),
    body("adult_price").optional().isFloat({ min: 0 }),
    body("child_price").optional().isFloat({ min: 0 }),
    body("min_people").optional().isInt({ min: 1, max: 100 }),
    body("max_people").optional().isInt({ min: 1, max: 100 }),
    body("hotel_name").optional().trim(),
    body("hotel_stars").optional().isInt({ min: 1, max: 5 }),
    body("transportation_included").optional().isBoolean(),
    body("meals_included").optional().isBoolean(),
    body("tour_guide_included").optional().isBoolean(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(
        "Validation failed",
        400,
        "VALIDATION_ERROR",
        errors.array(),
      );
    }

    // Generate slug from name
    const slug = req.body.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim("-");

    // Check if slug already exists
    const existingPackage = await db("travel_packages").where({ slug }).first();
    if (existingPackage) {
      throw new AppError(
        "Package with similar name already exists",
        400,
        "SLUG_EXISTS",
      );
    }

    const packageData = {
      ...req.body,
      slug,
      created_by: req.user.id,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Convert arrays and objects to JSON strings
    [
      "included_services",
      "excluded_services",
      "itinerary",
      "requirements",
      "recommendations",
      "hotel_amenities",
      "seasonal_pricing",
      "availability_calendar",
      "gallery_images",
      "gallery_videos",
      "tags",
    ].forEach((field) => {
      if (packageData[field] && typeof packageData[field] === "object") {
        packageData[field] = JSON.stringify(packageData[field]);
      }
    });

    const [newPackage] = await db("travel_packages")
      .insert(packageData)
      .returning("*");

    await auditLogger.log(
      req.user.id,
      "package_created",
      `Travel package created: ${newPackage.name}`,
      { package_id: newPackage.id, destination: newPackage.destination },
    );

    logger.info(
      `Travel package created: ${newPackage.name} by ${req.user.email}`,
    );

    res.status(201).json({
      success: true,
      message: "Travel package created successfully",
      data: newPackage,
    });
  }),
);

/**
 * @swagger
 * /api/travel-packages/{id}:
 *   put:
 *     tags: [Travel Packages]
 *     summary: Update travel package
 */
router.put(
  "/:id",
  [
    authorize(["admin", "manager"]),
    param("id").isInt({ min: 1 }).toInt(),
    body("name").optional().trim().isLength({ min: 3, max: 200 }),
    body("description").optional().trim(),
    body("base_price").optional().isFloat({ min: 0 }),
    body("status").optional().isIn(["active", "inactive", "draft", "sold_out"]),
    body("is_featured").optional().isBoolean(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(
        "Validation failed",
        400,
        "VALIDATION_ERROR",
        errors.array(),
      );
    }

    const { id } = req.params;
    const updateData = { ...req.body, updated_at: new Date() };

    // Check if package exists
    const existingPackage = await db("travel_packages").where({ id }).first();
    if (!existingPackage) {
      throw new AppError("Travel package not found", 404, "PACKAGE_NOT_FOUND");
    }

    // Convert arrays and objects to JSON strings
    [
      "included_services",
      "excluded_services",
      "itinerary",
      "requirements",
      "recommendations",
      "hotel_amenities",
      "seasonal_pricing",
      "availability_calendar",
      "gallery_images",
      "gallery_videos",
      "tags",
    ].forEach((field) => {
      if (updateData[field] && typeof updateData[field] === "object") {
        updateData[field] = JSON.stringify(updateData[field]);
      }
    });

    const [updatedPackage] = await db("travel_packages")
      .where({ id })
      .update(updateData)
      .returning("*");

    await auditLogger.log(
      req.user.id,
      "package_updated",
      `Travel package updated: ${existingPackage.name}`,
      { package_id: id, changes: Object.keys(updateData) },
    );

    logger.info(
      `Travel package updated: ${existingPackage.name} by ${req.user.email}`,
    );

    res.json({
      success: true,
      message: "Travel package updated successfully",
      data: updatedPackage,
    });
  }),
);

/**
 * @swagger
 * /api/travel-packages/{id}:
 *   delete:
 *     tags: [Travel Packages]
 *     summary: Delete travel package
 */
router.delete(
  "/:id",
  [authorize(["admin"]), param("id").isInt({ min: 1 }).toInt()],
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const travelPackage = await db("travel_packages").where({ id }).first();
    if (!travelPackage) {
      throw new AppError("Travel package not found", 404, "PACKAGE_NOT_FOUND");
    }

    // Check if package has bookings
    const bookingCount = await db("bookings")
      .where("title", "like", `%${travelPackage.name}%`)
      .count("* as count")
      .first();

    if (bookingCount.count > 0) {
      // Soft delete - change status to inactive
      await db("travel_packages").where({ id }).update({
        status: "inactive",
        updated_at: new Date(),
      });

      await auditLogger.log(
        req.user.id,
        "package_deactivated",
        `Travel package deactivated: ${travelPackage.name}`,
        { package_id: id, reason: "has_bookings" },
      );

      res.json({
        success: true,
        message: "Travel package deactivated successfully (has bookings)",
      });
    } else {
      // Hard delete if no bookings
      await db("travel_packages").where({ id }).del();

      await auditLogger.log(
        req.user.id,
        "package_deleted",
        `Travel package deleted: ${travelPackage.name}`,
        { package_id: id },
      );

      res.json({
        success: true,
        message: "Travel package deleted successfully",
      });
    }
  }),
);

/**
 * @swagger
 * /api/travel-packages/stats:
 *   get:
 *     tags: [Travel Packages]
 *     summary: Get travel packages statistics
 */
router.get(
  "/stats",
  authorize(["admin", "manager"]),
  asyncHandler(async (req, res) => {
    const stats = await db("travel_packages")
      .select(
        db.raw("COUNT(*) as total_packages"),
        db.raw("COUNT(CASE WHEN status = ? THEN 1 END) as active_packages", [
          "active",
        ]),
        db.raw(
          "COUNT(CASE WHEN is_featured = true THEN 1 END) as featured_packages",
        ),
        db.raw("AVG(base_price) as average_price"),
        db.raw("MIN(base_price) as min_price"),
        db.raw("MAX(base_price) as max_price"),
        db.raw("AVG(average_rating) as average_rating"),
        db.raw("SUM(total_bookings) as total_bookings"),
      )
      .first();

    // Popular destinations
    const destinations = await db("travel_packages")
      .select("destination")
      .count("* as count")
      .sum("total_bookings as total_bookings")
      .where("status", "active")
      .groupBy("destination")
      .orderBy("total_bookings", "desc");

    // Package categories
    const categories = await db("travel_packages")
      .select("category")
      .count("* as count")
      .avg("base_price as avg_price")
      .where("status", "active")
      .groupBy("category")
      .orderBy("count", "desc");

    // Top rated packages
    const topRated = await db("travel_packages")
      .select(
        "id",
        "name",
        "destination",
        "base_price",
        "average_rating",
        "total_reviews",
      )
      .where("status", "active")
      .where("total_reviews", ">", 0)
      .orderBy("average_rating", "desc")
      .limit(10);

    res.json({
      success: true,
      data: {
        overview: stats,
        destinations,
        categories,
        topRated,
      },
    });
  }),
);

/**
 * @swagger
 * /api/travel-packages/featured:
 *   get:
 *     tags: [Travel Packages]
 *     summary: Get featured travel packages
 */
router.get(
  "/featured",
  asyncHandler(async (req, res) => {
    const featuredPackages = await db("travel_packages")
      .select(
        "id",
        "name",
        "slug",
        "short_description",
        "destination",
        "duration_days",
        "base_price",
        "currency",
        "hotel_name",
        "hotel_stars",
        "average_rating",
        "total_reviews",
      )
      .where("status", "active")
      .where("is_featured", true)
      .orderBy("average_rating", "desc")
      .limit(6);

    res.json({
      success: true,
      data: featuredPackages,
    });
  }),
);

module.exports = router;
