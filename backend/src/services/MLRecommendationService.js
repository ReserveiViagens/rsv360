const tf = require("@tensorflow/tfjs-node");
const { db } = require("../config/database");
const logger = require("../config/logger");

/**
 * Serviço de Machine Learning para Recomendações Inteligentes
 * Utiliza TensorFlow.js para análise preditiva e recomendações personalizadas
 */
class MLRecommendationService {
  constructor() {
    this.model = null;
    this.userFeatures = new Map();
    this.hotelFeatures = new Map();
    this.isTraining = false;
    this.modelVersion = "1.0.0";
  }

  /**
   * Inicializar o serviço de ML
   */
  async initialize() {
    try {
      logger.info("🤖 Inicializando ML Recommendation Service...");

      // Tentar carregar modelo existente
      await this.loadModel();

      // Se não houver modelo, treinar um novo
      if (!this.model) {
        await this.trainInitialModel();
      }

      // Carregar features em cache
      await this.loadFeatures();

      logger.info("✅ ML Recommendation Service inicializado com sucesso");
    } catch (error) {
      logger.error("❌ Erro ao inicializar ML Service:", error);
    }
  }

  /**
   * Carregar modelo pré-treinado
   */
  async loadModel() {
    try {
      const modelPath = "./models/recommendation_model";
      this.model = await tf.loadLayersModel(`file://${modelPath}/model.json`);
      logger.info("📥 Modelo ML carregado com sucesso");
    } catch (error) {
      logger.warn("⚠️ Nenhum modelo pré-treinado encontrado");
    }
  }

  /**
   * Treinar modelo inicial com dados históricos
   */
  async trainInitialModel() {
    if (this.isTraining) return;

    this.isTraining = true;
    logger.info("🎯 Iniciando treinamento do modelo de recomendação...");

    try {
      // Buscar dados históricos
      const trainingData = await this.getTrainingData();

      if (trainingData.length < 100) {
        logger.warn(
          "⚠️ Dados insuficientes para treinamento. Usando modelo base.",
        );
        this.createBaseModel();
        return;
      }

      // Preparar dados
      const { inputs, outputs } = this.prepareTrainingData(trainingData);

      // Criar e treinar modelo
      this.model = this.createNeuralNetwork();
      await this.trainModel(inputs, outputs);

      // Salvar modelo
      await this.saveModel();

      logger.info("✅ Modelo treinado e salvo com sucesso");
    } catch (error) {
      logger.error("❌ Erro no treinamento:", error);
      this.createBaseModel();
    } finally {
      this.isTraining = false;
    }
  }

  /**
   * Obter dados de treinamento do banco
   */
  async getTrainingData() {
    const query = `
      SELECT
        u.id as user_id,
        u.age,
        u.location,
        u.preferences,
        h.id as hotel_id,
        h.category,
        h.price_range,
        h.location as hotel_location,
        h.amenities,
        h.rating,
        b.rating as user_rating,
        b.booking_date,
        b.check_in_date,
        b.check_out_date,
        b.guests,
        b.total_amount,
        EXTRACT(DOW FROM b.booking_date) as booking_day_of_week,
        EXTRACT(MONTH FROM b.booking_date) as booking_month,
        DATE_PART('day', b.check_in_date - b.booking_date) as advance_booking_days
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN hotels h ON b.hotel_id = h.id
      WHERE b.status = 'completed'
        AND b.created_at > NOW() - INTERVAL '2 years'
      ORDER BY b.created_at DESC
      LIMIT 10000
    `;

    return await db.raw(query);
  }

  /**
   * Preparar dados para treinamento
   */
  prepareTrainingData(rawData) {
    const inputs = [];
    const outputs = [];

    for (const row of rawData) {
      // Features do usuário
      const userFeatures = [
        this.normalizeAge(row.age),
        this.encodeLocation(row.location),
        this.encodePreferences(row.preferences),
        row.booking_day_of_week / 7,
        row.booking_month / 12,
        Math.min(row.advance_booking_days / 365, 1),
      ];

      // Features do hotel
      const hotelFeatures = [
        this.encodeCategory(row.category),
        this.normalizePriceRange(row.price_range),
        this.encodeLocation(row.hotel_location),
        this.encodeAmenities(row.amenities),
        row.rating / 5,
        this.normalizeAmount(row.total_amount),
        row.guests / 10,
      ];

      // Combinar features
      const inputVector = [...userFeatures, ...hotelFeatures];

      // Output: rating do usuário (normalizado)
      const output = [row.user_rating / 5];

      inputs.push(inputVector);
      outputs.push(output);
    }

    return {
      inputs: tf.tensor2d(inputs),
      outputs: tf.tensor2d(outputs),
    };
  }

  /**
   * Criar rede neural
   */
  createNeuralNetwork() {
    const model = tf.sequential({
      layers: [
        // Camada de entrada
        tf.layers.dense({
          inputShape: [13], // 6 user features + 7 hotel features
          units: 64,
          activation: "relu",
          kernelRegularizer: tf.regularizers.l2({ l2: 0.01 }),
        }),

        // Camada de dropout para evitar overfitting
        tf.layers.dropout({ rate: 0.3 }),

        // Camadas ocultas
        tf.layers.dense({
          units: 32,
          activation: "relu",
          kernelRegularizer: tf.regularizers.l2({ l2: 0.01 }),
        }),

        tf.layers.dropout({ rate: 0.2 }),

        tf.layers.dense({
          units: 16,
          activation: "relu",
        }),

        // Camada de saída
        tf.layers.dense({
          units: 1,
          activation: "sigmoid", // Rating entre 0 e 1
        }),
      ],
    });

    // Compilar modelo
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: "meanSquaredError",
      metrics: ["mae"],
    });

    return model;
  }

  /**
   * Treinar modelo
   */
  async trainModel(inputs, outputs) {
    const validationSplit = 0.2;
    const epochs = 100;
    const batchSize = 32;

    const history = await this.model.fit(inputs, outputs, {
      epochs,
      batchSize,
      validationSplit,
      shuffle: true,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 10 === 0) {
            logger.info(
              `Época ${epoch}: loss=${logs.loss.toFixed(4)}, val_loss=${logs.val_loss.toFixed(4)}`,
            );
          }
        },
      },
    });

    // Log final
    const finalLoss = history.history.loss[history.history.loss.length - 1];
    const finalValLoss =
      history.history.val_loss[history.history.val_loss.length - 1];

    logger.info(
      `🎯 Treinamento concluído - Loss: ${finalLoss.toFixed(4)}, Val Loss: ${finalValLoss.toFixed(4)}`,
    );
  }

  /**
   * Criar modelo base (quando dados são insuficientes)
   */
  createBaseModel() {
    logger.info("📋 Criando modelo base com regras heurísticas");
    this.model = "base"; // Marcador para usar regras heurísticas
  }

  /**
   * Salvar modelo treinado
   */
  async saveModel() {
    try {
      const modelPath = "./models/recommendation_model";
      await this.model.save(`file://${modelPath}`);

      // Salvar metadados
      const metadata = {
        version: this.modelVersion,
        createdAt: new Date().toISOString(),
        features: {
          userFeatures: 6,
          hotelFeatures: 7,
          totalFeatures: 13,
        },
      };

      require("fs").writeFileSync(
        `${modelPath}/metadata.json`,
        JSON.stringify(metadata, null, 2),
      );
      logger.info("💾 Modelo salvo com sucesso");
    } catch (error) {
      logger.error("❌ Erro ao salvar modelo:", error);
    }
  }

  /**
   * Obter recomendações para usuário
   */
  async getRecommendations(userId, options = {}) {
    try {
      const {
        limit = 10,
        excludeBooked = true,
        location = null,
        priceRange = null,
        category = null,
      } = options;

      // Buscar perfil do usuário
      const user = await this.getUserProfile(userId);
      if (!user) {
        throw new Error("Usuário não encontrado");
      }

      // Buscar hotéis candidatos
      const candidateHotels = await this.getCandidateHotels(userId, {
        excludeBooked,
        location,
        priceRange,
        category,
      });

      // Calcular pontuações
      const scoredHotels = await this.scoreHotels(user, candidateHotels);

      // Ordenar e retornar top recomendações
      const recommendations = scoredHotels
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((hotel) => ({
          ...hotel,
          recommendationScore: hotel.score,
          recommendationReason: hotel.reason,
        }));

      // Log da recomendação
      logger.info(
        `🎯 ${recommendations.length} recomendações geradas para usuário ${userId}`,
      );

      return recommendations;
    } catch (error) {
      logger.error("❌ Erro ao gerar recomendações:", error);
      return [];
    }
  }

  /**
   * Calcular pontuação para hotéis
   */
  async scoreHotels(user, hotels) {
    const scoredHotels = [];

    for (const hotel of hotels) {
      try {
        let score;
        let reason;

        if (this.model && this.model !== "base") {
          // Usar modelo ML
          const prediction = await this.predictWithML(user, hotel);
          score = prediction.score;
          reason = prediction.reason;
        } else {
          // Usar regras heurísticas
          const heuristic = this.calculateHeuristicScore(user, hotel);
          score = heuristic.score;
          reason = heuristic.reason;
        }

        scoredHotels.push({
          ...hotel,
          score,
          reason,
        });
      } catch (error) {
        logger.warn(`⚠️ Erro ao calcular score para hotel ${hotel.id}:`, error);
      }
    }

    return scoredHotels;
  }

  /**
   * Predição com modelo ML
   */
  async predictWithML(user, hotel) {
    const userFeatures = [
      this.normalizeAge(user.age),
      this.encodeLocation(user.location),
      this.encodePreferences(user.preferences),
      new Date().getDay() / 7,
      new Date().getMonth() / 12,
      0.1, // Assumindo reserva com 1 mês de antecedência
    ];

    const hotelFeatures = [
      this.encodeCategory(hotel.category),
      this.normalizePriceRange(hotel.price_range),
      this.encodeLocation(hotel.location),
      this.encodeAmenities(hotel.amenities),
      hotel.rating / 5,
      this.normalizeAmount(hotel.average_price),
      2 / 10, // Assumindo 2 hóspedes
    ];

    const inputVector = tf.tensor2d(
      [...userFeatures, ...hotelFeatures],
      [1, 13],
    );
    const prediction = this.model.predict(inputVector);
    const score = await prediction.data();

    return {
      score: score[0],
      reason:
        "Baseado em análise de machine learning dos seus padrões de reserva",
    };
  }

  /**
   * Cálculo heurístico quando ML não está disponível
   */
  calculateHeuristicScore(user, hotel) {
    let score = 0;
    const reasons = [];

    // Avaliação do hotel (40% do peso)
    score += (hotel.rating / 5) * 0.4;
    if (hotel.rating >= 4.5) {
      reasons.push("Excelente avaliação");
    }

    // Localização preferida (20% do peso)
    if (
      user.preferred_locations &&
      user.preferred_locations.includes(hotel.location)
    ) {
      score += 0.2;
      reasons.push("Localização preferida");
    }

    // Amenidades preferidas (20% do peso)
    const userAmenities = user.preferred_amenities || [];
    const hotelAmenities = hotel.amenities || [];
    const amenityMatch = userAmenities.filter((a) =>
      hotelAmenities.includes(a),
    ).length;
    const amenityScore = amenityMatch / Math.max(userAmenities.length, 1);
    score += amenityScore * 0.2;

    if (amenityScore > 0.5) {
      reasons.push("Amenidades que você gosta");
    }

    // Faixa de preço (10% do peso)
    if (
      user.budget_range &&
      this.isInBudgetRange(hotel.price_range, user.budget_range)
    ) {
      score += 0.1;
      reasons.push("Dentro do seu orçamento");
    }

    // Popularidade recente (10% do peso)
    if (hotel.recent_bookings > 10) {
      score += 0.1;
      reasons.push("Popular entre outros viajantes");
    }

    return {
      score: Math.min(score, 1),
      reason:
        reasons.length > 0
          ? reasons.join(", ")
          : "Recomendação baseada no seu perfil",
    };
  }

  /**
   * Buscar perfil completo do usuário
   */
  async getUserProfile(userId) {
    const user = await db("users").select("*").where("id", userId).first();

    if (!user) return null;

    // Buscar preferências de reservas passadas
    const bookingHistory = await db("bookings")
      .join("hotels", "bookings.hotel_id", "hotels.id")
      .select(
        "hotels.category",
        "hotels.amenities",
        "hotels.location",
        "bookings.total_amount",
      )
      .where("bookings.user_id", userId)
      .where("bookings.status", "completed")
      .limit(20);

    // Analisar padrões
    const preferences = this.analyzeUserPreferences(bookingHistory);

    return {
      ...user,
      ...preferences,
    };
  }

  /**
   * Analisar preferências do usuário baseado no histórico
   */
  analyzeUserPreferences(bookingHistory) {
    if (bookingHistory.length === 0) {
      return {
        preferred_categories: [],
        preferred_locations: [],
        preferred_amenities: [],
        budget_range: "medium",
      };
    }

    // Categorias mais reservadas
    const categories = bookingHistory.map((b) => b.category);
    const categoryCount = this.countFrequency(categories);

    // Localizações preferidas
    const locations = bookingHistory.map((b) => b.location);
    const locationCount = this.countFrequency(locations);

    // Amenidades frequentes
    const allAmenities = bookingHistory.flatMap((b) =>
      typeof b.amenities === "string"
        ? JSON.parse(b.amenities)
        : b.amenities || [],
    );
    const amenityCount = this.countFrequency(allAmenities);

    // Faixa de orçamento
    const amounts = bookingHistory.map((b) => b.total_amount);
    const avgAmount =
      amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;

    return {
      preferred_categories: Object.keys(categoryCount).slice(0, 3),
      preferred_locations: Object.keys(locationCount).slice(0, 3),
      preferred_amenities: Object.keys(amenityCount).slice(0, 5),
      budget_range: this.categorizeBudget(avgAmount),
    };
  }

  /**
   * Buscar hotéis candidatos para recomendação
   */
  async getCandidateHotels(userId, options) {
    let query = db("hotels")
      .select([
        "hotels.*",
        db.raw("AVG(reviews.rating) as rating"),
        db.raw("COUNT(reviews.id) as review_count"),
        db.raw("COUNT(recent_bookings.id) as recent_bookings"),
        db.raw("AVG(rooms.price_per_night) as average_price"),
      ])
      .leftJoin("reviews", "hotels.id", "reviews.hotel_id")
      .leftJoin("rooms", "hotels.id", "rooms.hotel_id")
      .leftJoin(
        db("bookings")
          .select("hotel_id")
          .where("created_at", ">", db.raw("NOW() - INTERVAL '30 days'"))
          .as("recent_bookings"),
        "hotels.id",
        "recent_bookings.hotel_id",
      )
      .where("hotels.status", "active")
      .groupBy("hotels.id");

    // Excluir hotéis já reservados
    if (options.excludeBooked) {
      const bookedHotels = await db("bookings")
        .select("hotel_id")
        .where("user_id", userId)
        .pluck("hotel_id");

      if (bookedHotels.length > 0) {
        query = query.whereNotIn("hotels.id", bookedHotels);
      }
    }

    // Filtros opcionais
    if (options.location) {
      query = query.where("hotels.location", "ilike", `%${options.location}%`);
    }

    if (options.category) {
      query = query.where("hotels.category", options.category);
    }

    if (options.priceRange) {
      query = query.where("hotels.price_range", options.priceRange);
    }

    return await query.limit(100);
  }

  // Funções auxiliares de normalização e encoding
  normalizeAge(age) {
    return Math.min(age / 100, 1);
  }

  encodeLocation(location) {
    const locationMap = {
      "rio de janeiro": 0.1,
      "são paulo": 0.2,
      salvador: 0.3,
      fortaleza: 0.4,
      recife: 0.5,
      "belo horizonte": 0.6,
      brasília: 0.7,
      curitiba: 0.8,
      "porto alegre": 0.9,
    };
    return locationMap[location?.toLowerCase()] || 0.5;
  }

  encodeCategory(category) {
    const categoryMap = {
      economic: 0.1,
      standard: 0.3,
      superior: 0.5,
      deluxe: 0.7,
      luxury: 0.9,
    };
    return categoryMap[category] || 0.5;
  }

  encodePreferences(preferences) {
    if (!preferences) return 0.5;
    return typeof preferences === "object"
      ? Object.keys(preferences).length / 10
      : 0.5;
  }

  encodeAmenities(amenities) {
    if (!amenities) return 0;
    const amenityList =
      typeof amenities === "string" ? JSON.parse(amenities) : amenities;
    return Math.min(amenityList.length / 20, 1);
  }

  normalizePriceRange(priceRange) {
    const priceMap = {
      budget: 0.1,
      economy: 0.3,
      "mid-range": 0.5,
      upscale: 0.7,
      luxury: 0.9,
    };
    return priceMap[priceRange] || 0.5;
  }

  normalizeAmount(amount) {
    return Math.min(amount / 10000, 1);
  }

  countFrequency(items) {
    return items.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {});
  }

  categorizeBudget(avgAmount) {
    if (avgAmount < 200) return "budget";
    if (avgAmount < 500) return "economy";
    if (avgAmount < 1000) return "mid-range";
    if (avgAmount < 2000) return "upscale";
    return "luxury";
  }

  isInBudgetRange(hotelPriceRange, userBudgetRange) {
    const hierarchy = ["budget", "economy", "mid-range", "upscale", "luxury"];
    const hotelIndex = hierarchy.indexOf(hotelPriceRange);
    const userIndex = hierarchy.indexOf(userBudgetRange);
    return Math.abs(hotelIndex - userIndex) <= 1;
  }

  /**
   * Retreinar modelo periodicamente
   */
  async scheduleRetraining() {
    // Retreinar modelo a cada 7 dias
    setInterval(
      async () => {
        logger.info("🔄 Iniciando retreinamento periódico do modelo...");
        await this.trainInitialModel();
      },
      7 * 24 * 60 * 60 * 1000,
    );
  }

  /**
   * Obter estatísticas do modelo
   */
  getModelStats() {
    return {
      modelVersion: this.modelVersion,
      isTraining: this.isTraining,
      hasModel: !!this.model,
      userFeaturesCount: this.userFeatures.size,
      hotelFeaturesCount: this.hotelFeatures.size,
    };
  }
}

module.exports = MLRecommendationService;
