const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { body, query, validationResult } = require("express-validator");
const { db, cache } = require("../../../config/database");
const logger = require("../../../config/logger");

/**
 * RSV 360 Public API v1
 * API pública para desenvolvedores terceiros integrar com o sistema
 */

// Rate limiting para API pública
const publicApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // máximo 1000 requests por window
  message: {
    error: "Rate limit exceeded",
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting mais restritivo para endpoints de escrita
const writeApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por window
  message: {
    error: "Rate limit exceeded",
    message: "Too many write requests, please try again later.",
  },
});

// Middleware de autenticação para API pública
const authenticateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.header("X-API-Key");

    if (!apiKey) {
      return res.status(401).json({
        error: "Authentication required",
        message: "API key is required. Please include X-API-Key header.",
      });
    }

    // Verificar API key no cache primeiro
    const cacheKey = `api_key:${apiKey}`;
    let keyData = await cache.get(cacheKey);

    if (!keyData) {
      // Buscar no banco se não estiver em cache
      keyData = await db("api_keys")
        .join("partners", "api_keys.partner_id", "partners.id")
        .select([
          "api_keys.*",
          "partners.company_name",
          "partners.status as partner_status",
          "partners.tier",
          "partners.rate_limit_per_minute",
        ])
        .where("api_keys.key", apiKey)
        .where("api_keys.is_active", true)
        .first();

      if (keyData) {
        // Cache por 5 minutos
        await cache.set(cacheKey, keyData, 300);
      }
    }

    if (!keyData) {
      return res.status(401).json({
        error: "Invalid API key",
        message: "The provided API key is invalid or has been revoked.",
      });
    }

    if (keyData.partner_status !== "active") {
      return res.status(403).json({
        error: "Partner account inactive",
        message: "Your partner account is not active. Please contact support.",
      });
    }

    // Atualizar last_used
    await db("api_keys")
      .where("id", keyData.id)
      .update({ last_used: new Date() });

    // Adicionar dados do parceiro ao request
    req.partner = {
      id: keyData.partner_id,
      companyName: keyData.company_name,
      tier: keyData.tier,
      rateLimit: keyData.rate_limit_per_minute || 60,
    };
    req.apiKey = keyData;

    next();
  } catch (error) {
    logger.error("API authentication error:", error);
    res.status(500).json({
      error: "Authentication error",
      message: "Internal server error during authentication.",
    });
  }
};

// Rate limiting dinâmico baseado no tier do parceiro
const dynamicRateLimit = (req, res, next) => {
  const tierLimits = {
    bronze: 30,
    silver: 60,
    gold: 120,
    platinum: 300,
    diamond: 600,
  };

  const limit = tierLimits[req.partner.tier] || 30;

  const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: limit,
    keyGenerator: (req) => req.partner.id.toString(),
    message: {
      error: "Rate limit exceeded",
      message: `Rate limit for ${req.partner.tier} tier is ${limit} requests per minute.`,
    },
  });

  limiter(req, res, next);
};

// Aplicar rate limiting geral
router.use(publicApiLimiter);

// Middleware para logging de API
router.use((req, res, next) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    logger.info(
      `Public API: ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms - Partner: ${req.partner?.id || "unauthenticated"}`,
    );
  });

  next();
});

// ==================== ENDPOINTS DE DOCUMENTAÇÃO ====================

/**
 * @route GET /api/v1/public
 * @desc API documentation and health check
 * @access Public
 */
router.get("/", (req, res) => {
  res.json({
    name: "RSV 360 Public API",
    version: "1.0.0",
    description: "Public API for hotel booking and travel services integration",
    documentation: "https://docs.rsv360.com/api/v1",
    endpoints: {
      authentication: "Include X-API-Key header with your API key",
      hotels: {
        list: "GET /hotels",
        search: "GET /hotels/search",
        details: "GET /hotels/:id",
        availability: "GET /hotels/:id/availability",
      },
      bookings: {
        create: "POST /bookings",
        get: "GET /bookings/:id",
        cancel: "DELETE /bookings/:id",
      },
      destinations: {
        list: "GET /destinations",
        popular: "GET /destinations/popular",
      },
      webhooks: {
        configure: "POST /webhooks",
        list: "GET /webhooks",
      },
    },
    rate_limits: {
      bronze: "30 requests/minute",
      silver: "60 requests/minute",
      gold: "120 requests/minute",
      platinum: "300 requests/minute",
      diamond: "600 requests/minute",
    },
    support: {
      email: "api-support@rsv360.com",
      docs: "https://docs.rsv360.com",
      status: "https://status.rsv360.com",
    },
  });
});

/**
 * @route GET /api/v1/public/health
 * @desc Health check endpoint
 * @access Public
 */
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

// ==================== ENDPOINTS AUTENTICADOS ====================

// Aplicar autenticação para rotas protegidas
router.use(authenticateApiKey);
router.use(dynamicRateLimit);

// ==================== HOTÉIS ====================

/**
 * @route GET /api/v1/public/hotels
 * @desc Get list of hotels with pagination and filters
 * @access Private (API Key required)
 */
router.get(
  "/hotels",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("location")
      .optional()
      .isString()
      .withMessage("Location must be a string"),
    query("category")
      .optional()
      .isIn(["economic", "standard", "superior", "deluxe", "luxury"])
      .withMessage("Invalid category"),
    query("min_price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Min price must be a positive number"),
    query("max_price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Max price must be a positive number"),
    query("amenities")
      .optional()
      .isString()
      .withMessage("Amenities must be a comma-separated string"),
    query("sort")
      .optional()
      .isIn(["price_asc", "price_desc", "rating_desc", "name_asc"])
      .withMessage("Invalid sort option"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation error",
          details: errors.array(),
        });
      }

      const {
        page = 1,
        limit = 20,
        location,
        category,
        min_price,
        max_price,
        amenities,
        sort = "rating_desc",
      } = req.query;

      const offset = (page - 1) * limit;

      // Build query
      let query = db("hotels")
        .select([
          "hotels.id",
          "hotels.name",
          "hotels.description",
          "hotels.location",
          "hotels.address",
          "hotels.category",
          "hotels.amenities",
          "hotels.images",
          db.raw("AVG(reviews.rating) as rating"),
          db.raw("COUNT(reviews.id) as review_count"),
          db.raw("MIN(rooms.price_per_night) as min_price"),
          db.raw("MAX(rooms.price_per_night) as max_price"),
        ])
        .leftJoin("reviews", "hotels.id", "reviews.hotel_id")
        .leftJoin("rooms", "hotels.id", "rooms.hotel_id")
        .where("hotels.status", "active")
        .groupBy("hotels.id");

      // Apply filters
      if (location) {
        query = query.where("hotels.location", "ilike", `%${location}%`);
      }

      if (category) {
        query = query.where("hotels.category", category);
      }

      if (min_price || max_price) {
        query = query.havingRaw("MIN(rooms.price_per_night) >= ?", [
          min_price || 0,
        ]);
        if (max_price) {
          query = query.havingRaw("MAX(rooms.price_per_night) <= ?", [
            max_price,
          ]);
        }
      }

      if (amenities) {
        const amenityList = amenities.split(",").map((a) => a.trim());
        for (const amenity of amenityList) {
          query = query.whereRaw("hotels.amenities::text ILIKE ?", [
            `%${amenity}%`,
          ]);
        }
      }

      // Apply sorting
      switch (sort) {
        case "price_asc":
          query = query.orderBy("min_price", "asc");
          break;
        case "price_desc":
          query = query.orderBy("min_price", "desc");
          break;
        case "rating_desc":
          query = query.orderBy("rating", "desc");
          break;
        case "name_asc":
          query = query.orderBy("hotels.name", "asc");
          break;
      }

      // Get total count for pagination
      const countQuery = query
        .clone()
        .clearSelect()
        .clearOrder()
        .count("* as total")
        .first();
      const [hotels, totalResult] = await Promise.all([
        query.limit(limit).offset(offset),
        countQuery,
      ]);

      const total = parseInt(totalResult.total);
      const totalPages = Math.ceil(total / limit);

      res.json({
        data: hotels.map((hotel) => ({
          ...hotel,
          rating: parseFloat(hotel.rating) || 0,
          review_count: parseInt(hotel.review_count) || 0,
          min_price: parseFloat(hotel.min_price) || 0,
          max_price: parseFloat(hotel.max_price) || 0,
          amenities:
            typeof hotel.amenities === "string"
              ? JSON.parse(hotel.amenities)
              : hotel.amenities,
          images:
            typeof hotel.images === "string"
              ? JSON.parse(hotel.images)
              : hotel.images,
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          total_pages: totalPages,
          has_next: page < totalPages,
          has_prev: page > 1,
        },
      });
    } catch (error) {
      logger.error("Hotels API error:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to fetch hotels",
      });
    }
  },
);

/**
 * @route GET /api/v1/public/hotels/search
 * @desc Advanced hotel search with multiple criteria
 * @access Private (API Key required)
 */
router.get(
  "/hotels/search",
  [
    query("q").notEmpty().withMessage("Search query is required"),
    query("check_in")
      .optional()
      .isISO8601()
      .withMessage("Check-in must be a valid date"),
    query("check_out")
      .optional()
      .isISO8601()
      .withMessage("Check-out must be a valid date"),
    query("guests")
      .optional()
      .isInt({ min: 1, max: 20 })
      .withMessage("Guests must be between 1 and 20"),
    query("radius")
      .optional()
      .isFloat({ min: 1, max: 100 })
      .withMessage("Radius must be between 1 and 100 km"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation error",
          details: errors.array(),
        });
      }

      const { q, check_in, check_out, guests = 2, radius } = req.query;

      // Search hotels by name, location, or description
      let query = db("hotels")
        .select([
          "hotels.*",
          db.raw("AVG(reviews.rating) as rating"),
          db.raw("COUNT(reviews.id) as review_count"),
        ])
        .leftJoin("reviews", "hotels.id", "reviews.hotel_id")
        .where("hotels.status", "active")
        .where(function () {
          this.where("hotels.name", "ilike", `%${q}%`)
            .orWhere("hotels.location", "ilike", `%${q}%`)
            .orWhere("hotels.description", "ilike", `%${q}%`);
        })
        .groupBy("hotels.id")
        .orderBy("rating", "desc")
        .limit(50);

      const hotels = await query;

      // If dates provided, check availability
      if (check_in && check_out && hotels.length > 0) {
        const hotelIds = hotels.map((h) => h.id);

        const availableRooms = await db("rooms")
          .select("hotel_id")
          .whereIn("hotel_id", hotelIds)
          .where("capacity", ">=", guests)
          .whereNotExists(function () {
            this.select("*")
              .from("bookings")
              .whereRaw("bookings.room_id = rooms.id")
              .where("status", "confirmed")
              .where(function () {
                this.whereBetween("check_in_date", [check_in, check_out])
                  .orWhereBetween("check_out_date", [check_in, check_out])
                  .orWhere(function () {
                    this.where("check_in_date", "<=", check_in).where(
                      "check_out_date",
                      ">=",
                      check_out,
                    );
                  });
              });
          })
          .groupBy("hotel_id");

        const availableHotelIds = availableRooms.map((r) => r.hotel_id);

        // Filter hotels with availability
        const filteredHotels = hotels.filter((h) =>
          availableHotelIds.includes(h.id),
        );

        res.json({
          data: filteredHotels.map((hotel) => ({
            ...hotel,
            rating: parseFloat(hotel.rating) || 0,
            review_count: parseInt(hotel.review_count) || 0,
            available: true,
          })),
          search_params: {
            query: q,
            check_in,
            check_out,
            guests: parseInt(guests),
          },
        });
      } else {
        res.json({
          data: hotels.map((hotel) => ({
            ...hotel,
            rating: parseFloat(hotel.rating) || 0,
            review_count: parseInt(hotel.review_count) || 0,
          })),
          search_params: {
            query: q,
          },
        });
      }
    } catch (error) {
      logger.error("Hotel search error:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Search failed",
      });
    }
  },
);

/**
 * @route GET /api/v1/public/hotels/:id
 * @desc Get hotel details by ID
 * @access Private (API Key required)
 */
router.get(
  "/hotels/:id",
  [
    query("include")
      .optional()
      .isString()
      .withMessage("Include must be a comma-separated string"),
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      const { include } = req.query;

      const includeOptions = include
        ? include.split(",").map((i) => i.trim())
        : [];

      // Get hotel basic info
      const hotel = await db("hotels")
        .select([
          "hotels.*",
          db.raw("AVG(reviews.rating) as rating"),
          db.raw("COUNT(reviews.id) as review_count"),
        ])
        .leftJoin("reviews", "hotels.id", "reviews.hotel_id")
        .where("hotels.id", id)
        .where("hotels.status", "active")
        .groupBy("hotels.id")
        .first();

      if (!hotel) {
        return res.status(404).json({
          error: "Hotel not found",
          message: "The requested hotel does not exist or is not available",
        });
      }

      const result = {
        ...hotel,
        rating: parseFloat(hotel.rating) || 0,
        review_count: parseInt(hotel.review_count) || 0,
        amenities:
          typeof hotel.amenities === "string"
            ? JSON.parse(hotel.amenities)
            : hotel.amenities,
        images:
          typeof hotel.images === "string"
            ? JSON.parse(hotel.images)
            : hotel.images,
      };

      // Include rooms if requested
      if (includeOptions.includes("rooms")) {
        const rooms = await db("rooms")
          .where("hotel_id", id)
          .where("is_active", true)
          .orderBy("price_per_night", "asc");

        result.rooms = rooms;
      }

      // Include reviews if requested
      if (includeOptions.includes("reviews")) {
        const reviews = await db("reviews")
          .select(["id", "user_name", "rating", "comment", "created_at"])
          .where("hotel_id", id)
          .where("status", "approved")
          .orderBy("created_at", "desc")
          .limit(10);

        result.reviews = reviews;
      }

      // Include nearby hotels if requested
      if (includeOptions.includes("nearby")) {
        const nearbyHotels = await db("hotels")
          .select(["id", "name", "location", "rating"])
          .where("id", "!=", id)
          .where("location", hotel.location)
          .where("status", "active")
          .limit(5);

        result.nearby_hotels = nearbyHotels;
      }

      res.json({
        data: result,
      });
    } catch (error) {
      logger.error("Hotel details error:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to fetch hotel details",
      });
    }
  },
);

/**
 * @route GET /api/v1/public/hotels/:id/availability
 * @desc Check hotel availability for specific dates
 * @access Private (API Key required)
 */
router.get(
  "/hotels/:id/availability",
  [
    query("check_in")
      .notEmpty()
      .isISO8601()
      .withMessage("Check-in date is required and must be valid"),
    query("check_out")
      .notEmpty()
      .isISO8601()
      .withMessage("Check-out date is required and must be valid"),
    query("guests")
      .optional()
      .isInt({ min: 1, max: 20 })
      .withMessage("Guests must be between 1 and 20"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation error",
          details: errors.array(),
        });
      }

      const { id } = req.params;
      const { check_in, check_out, guests = 2 } = req.query;

      // Validate dates
      const checkInDate = new Date(check_in);
      const checkOutDate = new Date(check_out);
      const today = new Date();

      if (checkInDate < today) {
        return res.status(400).json({
          error: "Invalid date",
          message: "Check-in date cannot be in the past",
        });
      }

      if (checkOutDate <= checkInDate) {
        return res.status(400).json({
          error: "Invalid date",
          message: "Check-out date must be after check-in date",
        });
      }

      // Get available rooms
      const availableRooms = await db("rooms")
        .select(["*"])
        .where("hotel_id", id)
        .where("is_active", true)
        .where("capacity", ">=", guests)
        .whereNotExists(function () {
          this.select("*")
            .from("bookings")
            .whereRaw("bookings.room_id = rooms.id")
            .where("status", "confirmed")
            .where(function () {
              this.whereBetween("check_in_date", [check_in, check_out])
                .orWhereBetween("check_out_date", [check_in, check_out])
                .orWhere(function () {
                  this.where("check_in_date", "<=", check_in).where(
                    "check_out_date",
                    ">=",
                    check_out,
                  );
                });
            });
        })
        .orderBy("price_per_night", "asc");

      // Calculate nights and total prices
      const nights = Math.ceil(
        (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24),
      );

      const roomsWithPricing = availableRooms.map((room) => ({
        ...room,
        nights,
        total_price: room.price_per_night * nights,
        price_breakdown: {
          base_price: room.price_per_night * nights,
          taxes: room.price_per_night * nights * 0.05, // 5% tax
          service_fee: room.price_per_night * nights * 0.02, // 2% service fee
          total: room.price_per_night * nights * 1.07, // Including taxes and fees
        },
      }));

      res.json({
        data: {
          hotel_id: id,
          check_in,
          check_out,
          guests: parseInt(guests),
          nights,
          available_rooms: roomsWithPricing.length,
          rooms: roomsWithPricing,
        },
      });
    } catch (error) {
      logger.error("Availability check error:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to check availability",
      });
    }
  },
);

// ==================== RESERVAS ====================

/**
 * @route POST /api/v1/public/bookings
 * @desc Create a new booking
 * @access Private (API Key required)
 */
router.post(
  "/bookings",
  writeApiLimiter,
  [
    body("hotel_id")
      .notEmpty()
      .isUUID()
      .withMessage("Hotel ID is required and must be valid"),
    body("room_id")
      .notEmpty()
      .isUUID()
      .withMessage("Room ID is required and must be valid"),
    body("check_in")
      .notEmpty()
      .isISO8601()
      .withMessage("Check-in date is required and must be valid"),
    body("check_out")
      .notEmpty()
      .isISO8601()
      .withMessage("Check-out date is required and must be valid"),
    body("guests")
      .isInt({ min: 1, max: 20 })
      .withMessage("Guests must be between 1 and 20"),
    body("customer.name").notEmpty().withMessage("Customer name is required"),
    body("customer.email")
      .isEmail()
      .withMessage("Valid customer email is required"),
    body("customer.phone").notEmpty().withMessage("Customer phone is required"),
    body("special_requests").optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation error",
          details: errors.array(),
        });
      }

      const {
        hotel_id,
        room_id,
        check_in,
        check_out,
        guests,
        customer,
        special_requests,
      } = req.body;

      // Process booking using marketplace service
      const MarketplaceService = require("../../../services/MarketplaceService");
      const marketplaceService = new MarketplaceService();

      const booking = await marketplaceService.processPartnerBooking(
        req.partner.id,
        {
          hotelId: hotel_id,
          roomId: room_id,
          checkIn: check_in,
          checkOut: check_out,
          guests,
          specialRequests: special_requests,
          customerInfo: customer,
          userId: null, // For partner bookings, user_id can be null
        },
      );

      res.status(201).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      logger.error("Booking creation error:", error);

      if (
        error.message.includes("not found") ||
        error.message.includes("inativo")
      ) {
        return res.status(400).json({
          error: "Booking failed",
          message: error.message,
        });
      }

      res.status(500).json({
        error: "Internal server error",
        message: "Failed to create booking",
      });
    }
  },
);

/**
 * @route GET /api/v1/public/bookings/:id
 * @desc Get booking details
 * @access Private (API Key required)
 */
router.get("/bookings/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await db("bookings")
      .join("hotels", "bookings.hotel_id", "hotels.id")
      .join("rooms", "bookings.room_id", "rooms.id")
      .select([
        "bookings.*",
        "hotels.name as hotel_name",
        "hotels.location as hotel_location",
        "hotels.address as hotel_address",
        "rooms.name as room_name",
        "rooms.type as room_type",
      ])
      .where("bookings.id", id)
      .where("bookings.partner_id", req.partner.id)
      .first();

    if (!booking) {
      return res.status(404).json({
        error: "Booking not found",
        message:
          "The requested booking does not exist or you do not have access to it",
      });
    }

    res.json({
      data: {
        ...booking,
        customer_info:
          typeof booking.customer_info === "string"
            ? JSON.parse(booking.customer_info)
            : booking.customer_info,
      },
    });
  } catch (error) {
    logger.error("Booking details error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to fetch booking details",
    });
  }
});

/**
 * @route DELETE /api/v1/public/bookings/:id
 * @desc Cancel a booking
 * @access Private (API Key required)
 */
router.delete(
  "/bookings/:id",
  writeApiLimiter,
  [
    body("reason")
      .optional()
      .isString()
      .withMessage("Cancellation reason must be a string"),
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      // Check if booking exists and belongs to partner
      const booking = await db("bookings")
        .where("id", id)
        .where("partner_id", req.partner.id)
        .first();

      if (!booking) {
        return res.status(404).json({
          error: "Booking not found",
          message:
            "The requested booking does not exist or you do not have access to it",
        });
      }

      if (booking.status === "cancelled") {
        return res.status(400).json({
          error: "Booking already cancelled",
          message: "This booking has already been cancelled",
        });
      }

      // Check cancellation policy
      const checkInDate = new Date(booking.check_in_date);
      const now = new Date();
      const hoursUntilCheckIn = (checkInDate - now) / (1000 * 60 * 60);

      if (hoursUntilCheckIn < 24) {
        return res.status(400).json({
          error: "Cancellation not allowed",
          message:
            "Bookings cannot be cancelled less than 24 hours before check-in",
        });
      }

      // Update booking status
      await db("bookings")
        .where("id", id)
        .update({
          status: "cancelled",
          cancellation_reason: reason || "Cancelled by partner",
          cancelled_at: new Date(),
          updated_at: new Date(),
        });

      res.json({
        success: true,
        message: "Booking cancelled successfully",
        data: {
          booking_id: id,
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error("Booking cancellation error:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to cancel booking",
      });
    }
  },
);

// ==================== DESTINOS ====================

/**
 * @route GET /api/v1/public/destinations
 * @desc Get list of available destinations
 * @access Private (API Key required)
 */
router.get("/destinations", async (req, res) => {
  try {
    const destinations = await db("hotels")
      .select("location")
      .count("* as hotel_count")
      .where("status", "active")
      .groupBy("location")
      .having("hotel_count", ">", 0)
      .orderBy("hotel_count", "desc");

    res.json({
      data: destinations.map((dest) => ({
        name: dest.location,
        hotel_count: parseInt(dest.hotel_count),
      })),
    });
  } catch (error) {
    logger.error("Destinations error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to fetch destinations",
    });
  }
});

/**
 * @route GET /api/v1/public/destinations/popular
 * @desc Get popular destinations based on bookings
 * @access Private (API Key required)
 */
router.get("/destinations/popular", async (req, res) => {
  try {
    const popularDestinations = await db("bookings")
      .join("hotels", "bookings.hotel_id", "hotels.id")
      .select("hotels.location")
      .count("bookings.id as booking_count")
      .where("bookings.created_at", ">", db.raw("NOW() - INTERVAL '30 days'"))
      .groupBy("hotels.location")
      .orderBy("booking_count", "desc")
      .limit(10);

    res.json({
      data: popularDestinations.map((dest) => ({
        name: dest.location,
        recent_bookings: parseInt(dest.booking_count),
      })),
    });
  } catch (error) {
    logger.error("Popular destinations error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to fetch popular destinations",
    });
  }
});

// ==================== WEBHOOKS ====================

/**
 * @route POST /api/v1/public/webhooks
 * @desc Configure webhook for events
 * @access Private (API Key required)
 */
router.post(
  "/webhooks",
  writeApiLimiter,
  [
    body("url").isURL().withMessage("Valid webhook URL is required"),
    body("events")
      .isArray({ min: 1 })
      .withMessage("At least one event type is required"),
    body("events.*")
      .isIn([
        "booking_created",
        "booking_cancelled",
        "booking_updated",
        "payment_completed",
      ])
      .withMessage("Invalid event type"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation error",
          details: errors.array(),
        });
      }

      const { url, events, description } = req.body;

      // Create webhook configurations for each event
      const webhooks = [];
      for (const eventType of events) {
        const [webhookId] = await db("partner_webhooks")
          .insert({
            partner_id: req.partner.id,
            event_type: eventType,
            url,
            description: description || `Webhook for ${eventType}`,
            secret: require("crypto").randomBytes(32).toString("hex"),
            is_active: true,
            created_at: new Date(),
          })
          .returning("id");

        webhooks.push({
          id: webhookId,
          event_type: eventType,
          url,
          created_at: new Date(),
        });
      }

      res.status(201).json({
        success: true,
        message: "Webhooks configured successfully",
        data: webhooks,
      });
    } catch (error) {
      logger.error("Webhook configuration error:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to configure webhooks",
      });
    }
  },
);

/**
 * @route GET /api/v1/public/webhooks
 * @desc Get configured webhooks
 * @access Private (API Key required)
 */
router.get("/webhooks", async (req, res) => {
  try {
    const webhooks = await db("partner_webhooks")
      .select([
        "id",
        "event_type",
        "url",
        "description",
        "is_active",
        "created_at",
      ])
      .where("partner_id", req.partner.id)
      .orderBy("created_at", "desc");

    res.json({
      data: webhooks,
    });
  } catch (error) {
    logger.error("Webhooks list error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to fetch webhooks",
    });
  }
});

// Error handling middleware
router.use((error, req, res, next) => {
  logger.error("Public API error:", error);

  res.status(500).json({
    error: "Internal server error",
    message: "An unexpected error occurred",
  });
});

module.exports = router;
