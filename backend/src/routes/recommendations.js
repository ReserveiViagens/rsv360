const express = require("express");
const router = express.Router();
const MLRecommendationService = require("../services/MLRecommendationService");
const authMiddleware = require("../middleware/auth");
const { cache } = require("../config/database");
const logger = require("../config/logger");

// Inicializar serviço ML
const mlService = new MLRecommendationService();
mlService.initialize();

// GET /api/recommendations - Obter recomendações personalizadas
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      limit = 10,
      location,
      priceRange,
      category,
      excludeBooked = true,
    } = req.query;

    // Verificar cache primeiro
    const cacheKey = `recommendations:${userId}:${JSON.stringify(req.query)}`;
    const cachedRecommendations = await cache.get(cacheKey);

    if (cachedRecommendations) {
      logger.info(`📋 Recomendações servidas do cache para usuário ${userId}`);
      return res.json({
        recommendations: cachedRecommendations,
        source: "cache",
        generatedAt: new Date().toISOString(),
      });
    }

    // Gerar novas recomendações
    const recommendations = await mlService.getRecommendations(userId, {
      limit: parseInt(limit),
      location,
      priceRange,
      category,
      excludeBooked: excludeBooked === "true",
    });

    // Enriquecer com dados adicionais
    const enrichedRecommendations =
      await enrichRecommendations(recommendations);

    // Salvar no cache por 1 hora
    await cache.set(cacheKey, enrichedRecommendations, 3600);

    res.json({
      recommendations: enrichedRecommendations,
      source: "ml_generated",
      generatedAt: new Date().toISOString(),
      totalFound: recommendations.length,
    });
  } catch (error) {
    logger.error("❌ Erro ao obter recomendações:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      message: "Falha ao gerar recomendações",
    });
  }
});

// GET /api/recommendations/similar/:hotelId - Hotéis similares
router.get("/similar/:hotelId", async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { limit = 5 } = req.query;

    const cacheKey = `similar_hotels:${hotelId}:${limit}`;
    const cachedSimilar = await cache.get(cacheKey);

    if (cachedSimilar) {
      return res.json({
        similarHotels: cachedSimilar,
        source: "cache",
      });
    }

    // Buscar hotéis similares baseado em características
    const similarHotels = await findSimilarHotels(hotelId, parseInt(limit));

    // Cache por 4 horas
    await cache.set(cacheKey, similarHotels, 14400);

    res.json({
      similarHotels,
      source: "generated",
      baseHotelId: hotelId,
    });
  } catch (error) {
    logger.error("❌ Erro ao buscar hotéis similares:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      message: "Falha ao buscar hotéis similares",
    });
  }
});

// GET /api/recommendations/trending - Hotéis em alta
router.get("/trending", async (req, res) => {
  try {
    const { limit = 10, period = "7d" } = req.query;

    const cacheKey = `trending_hotels:${period}:${limit}`;
    const cachedTrending = await cache.get(cacheKey);

    if (cachedTrending) {
      return res.json({
        trendingHotels: cachedTrending,
        source: "cache",
      });
    }

    const trendingHotels = await getTrendingHotels(period, parseInt(limit));

    // Cache por 2 horas
    await cache.set(cacheKey, trendingHotels, 7200);

    res.json({
      trendingHotels,
      source: "generated",
      period,
    });
  } catch (error) {
    logger.error("❌ Erro ao buscar hotéis trending:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      message: "Falha ao buscar hotéis em alta",
    });
  }
});

// POST /api/recommendations/feedback - Feedback de recomendação
router.post("/feedback", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { hotelId, recommendationId, feedback, rating } = req.body;

    // Validar dados
    if (!hotelId || !feedback || rating === undefined) {
      return res.status(400).json({
        error: "Dados inválidos",
        message: "hotelId, feedback e rating são obrigatórios",
      });
    }

    // Salvar feedback
    const feedbackData = {
      user_id: userId,
      hotel_id: hotelId,
      recommendation_id: recommendationId,
      feedback_type: feedback, // 'liked', 'disliked', 'booked', 'ignored'
      rating: rating, // 1-5
      created_at: new Date(),
      ip_address: req.ip,
      user_agent: req.get("User-Agent"),
    };

    await db("recommendation_feedback").insert(feedbackData);

    // Invalidar cache de recomendações do usuário
    const pattern = `recommendations:${userId}:*`;
    await cache.del(pattern);

    logger.info(
      `📝 Feedback de recomendação salvo: usuário ${userId}, hotel ${hotelId}, tipo ${feedback}`,
    );

    res.json({
      message: "Feedback registrado com sucesso",
      feedback: feedbackData,
    });
  } catch (error) {
    logger.error("❌ Erro ao salvar feedback:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      message: "Falha ao registrar feedback",
    });
  }
});

// GET /api/recommendations/stats - Estatísticas do modelo ML
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    // Verificar se usuário é admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        error: "Acesso negado",
        message: "Apenas administradores podem acessar estatísticas",
      });
    }

    const modelStats = mlService.getModelStats();

    // Estatísticas adicionais do banco
    const dbStats = await getRecommendationStats();

    res.json({
      modelStats,
      dbStats,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("❌ Erro ao obter estatísticas:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      message: "Falha ao obter estatísticas",
    });
  }
});

// POST /api/recommendations/retrain - Retreinar modelo (admin only)
router.post("/retrain", authMiddleware, async (req, res) => {
  try {
    // Verificar se usuário é admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        error: "Acesso negado",
        message: "Apenas administradores podem retreinar o modelo",
      });
    }

    // Iniciar retreinamento em background
    mlService
      .trainInitialModel()
      .then(() => {
        logger.info("✅ Retreinamento do modelo concluído");
      })
      .catch((error) => {
        logger.error("❌ Erro no retreinamento:", error);
      });

    res.json({
      message: "Retreinamento iniciado em background",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("❌ Erro ao iniciar retreinamento:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      message: "Falha ao iniciar retreinamento",
    });
  }
});

// Função auxiliar: Enriquecer recomendações
async function enrichRecommendations(recommendations) {
  const enriched = [];

  for (const hotel of recommendations) {
    try {
      // Buscar fotos
      const photos = await db("hotel_photos")
        .where("hotel_id", hotel.id)
        .orderBy("is_primary", "desc")
        .limit(3);

      // Buscar reviews recentes
      const recentReviews = await db("reviews")
        .select(["rating", "comment", "created_at", "user_name"])
        .where("hotel_id", hotel.id)
        .where("status", "approved")
        .orderBy("created_at", "desc")
        .limit(3);

      // Calcular estatísticas
      const stats = await db("bookings")
        .join("rooms", "bookings.room_id", "rooms.id")
        .where("rooms.hotel_id", hotel.id)
        .where("bookings.status", "completed")
        .where("bookings.created_at", ">", db.raw("NOW() - INTERVAL '30 days'"))
        .count("* as bookings_last_30_days")
        .first();

      enriched.push({
        ...hotel,
        photos: photos.map((p) => ({
          url: p.url,
          isPrimary: p.is_primary,
        })),
        recentReviews,
        bookingsLast30Days: parseInt(stats.bookings_last_30_days),
        isPopular: parseInt(stats.bookings_last_30_days) > 10,
      });
    } catch (error) {
      logger.warn(`⚠️ Erro ao enriquecer hotel ${hotel.id}:`, error);
      enriched.push(hotel);
    }
  }

  return enriched;
}

// Função auxiliar: Buscar hotéis similares
async function findSimilarHotels(hotelId, limit) {
  // Buscar características do hotel base
  const baseHotel = await db("hotels").select("*").where("id", hotelId).first();

  if (!baseHotel) {
    throw new Error("Hotel não encontrado");
  }

  // Buscar hotéis similares
  const similarHotels = await db("hotels")
    .select([
      "hotels.*",
      db.raw("AVG(reviews.rating) as avg_rating"),
      db.raw("COUNT(reviews.id) as review_count"),
    ])
    .leftJoin("reviews", "hotels.id", "reviews.hotel_id")
    .where("hotels.id", "!=", hotelId)
    .where("hotels.status", "active")
    .where(function () {
      // Mesma categoria ou similar
      this.where("hotels.category", baseHotel.category).orWhere(
        "hotels.price_range",
        baseHotel.price_range,
      );
    })
    .where(function () {
      // Mesma cidade ou região
      this.where("hotels.city", baseHotel.city).orWhere(
        "hotels.state",
        baseHotel.state,
      );
    })
    .groupBy("hotels.id")
    .having("AVG(reviews.rating)", ">=", 3.5)
    .orderBy("avg_rating", "desc")
    .limit(limit);

  return similarHotels;
}

// Função auxiliar: Buscar hotéis trending
async function getTrendingHotels(period, limit) {
  let dateFilter;

  switch (period) {
    case "24h":
      dateFilter = "NOW() - INTERVAL '24 hours'";
      break;
    case "7d":
      dateFilter = "NOW() - INTERVAL '7 days'";
      break;
    case "30d":
      dateFilter = "NOW() - INTERVAL '30 days'";
      break;
    default:
      dateFilter = "NOW() - INTERVAL '7 days'";
  }

  const trendingHotels = await db("hotels")
    .select([
      "hotels.*",
      db.raw("COUNT(DISTINCT bookings.id) as recent_bookings"),
      db.raw("COUNT(DISTINCT reviews.id) as recent_reviews"),
      db.raw("AVG(reviews.rating) as avg_rating"),
      db.raw(`
        (COUNT(DISTINCT bookings.id) * 2 + COUNT(DISTINCT reviews.id) * 1.5 + AVG(COALESCE(reviews.rating, 0)) * 1)
        as trending_score
      `),
    ])
    .leftJoin("rooms", "hotels.id", "rooms.hotel_id")
    .leftJoin("bookings", function () {
      this.on("rooms.id", "bookings.room_id").andOn(
        "bookings.created_at",
        ">",
        db.raw(dateFilter),
      );
    })
    .leftJoin("reviews", function () {
      this.on("hotels.id", "reviews.hotel_id").andOn(
        "reviews.created_at",
        ">",
        db.raw(dateFilter),
      );
    })
    .where("hotels.status", "active")
    .groupBy("hotels.id")
    .having("recent_bookings", ">", 0)
    .orderBy("trending_score", "desc")
    .limit(limit);

  return trendingHotels;
}

// Função auxiliar: Estatísticas do banco
async function getRecommendationStats() {
  const totalRecommendations = await db("recommendation_feedback")
    .count("* as count")
    .first();

  const feedbackStats = await db("recommendation_feedback")
    .select("feedback_type")
    .count("* as count")
    .groupBy("feedback_type");

  const avgRating = await db("recommendation_feedback")
    .avg("rating as avg_rating")
    .first();

  const recentActivity = await db("recommendation_feedback")
    .where("created_at", ">", db.raw("NOW() - INTERVAL '24 hours'"))
    .count("* as count")
    .first();

  return {
    totalRecommendations: parseInt(totalRecommendations.count),
    feedbackDistribution: feedbackStats.reduce((acc, stat) => {
      acc[stat.feedback_type] = parseInt(stat.count);
      return acc;
    }, {}),
    averageRating: parseFloat(avgRating.avg_rating) || 0,
    recentActivity24h: parseInt(recentActivity.count),
  };
}

module.exports = router;
