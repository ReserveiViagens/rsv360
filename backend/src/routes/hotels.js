const express = require("express");
const router = express.Router();
const { db, cache } = require("../config/database");
const logger = require("../config/logger");
const {
  validateHotel,
  validateBooking,
} = require("../validators/hotelValidator");
const authMiddleware = require("../middleware/auth");
const { upload } = require("../middleware/upload");

// GET /api/hotels - Listar hotéis com filtros
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      city,
      state,
      country,
      min_price,
      max_price,
      rating,
      amenities,
      availability_from,
      availability_to,
      sort_by = "name",
      sort_order = "asc",
    } = req.query;

    const offset = (page - 1) * limit;

    // Construir cache key
    const cacheKey = `hotels:${JSON.stringify(req.query)}`;

    // Tentar buscar do cache primeiro
    const cachedResult = await cache.get(cacheKey);
    if (cachedResult) {
      logger.info("Hotels data served from cache");
      return res.json(cachedResult);
    }

    // Construir query base
    let query = db("hotels")
      .select([
        "hotels.*",
        db.raw("AVG(reviews.rating) as avg_rating"),
        db.raw("COUNT(reviews.id) as review_count"),
        db.raw("MIN(rooms.price_per_night) as min_price"),
        db.raw("MAX(rooms.price_per_night) as max_price"),
      ])
      .leftJoin("reviews", "hotels.id", "reviews.hotel_id")
      .leftJoin("rooms", "hotels.id", "rooms.hotel_id")
      .where("hotels.status", "active")
      .groupBy("hotels.id");

    // Aplicar filtros
    if (search) {
      query = query.where(function () {
        this.where("hotels.name", "ilike", `%${search}%`)
          .orWhere("hotels.description", "ilike", `%${search}%`)
          .orWhere("hotels.address", "ilike", `%${search}%`);
      });
    }

    if (city) query = query.where("hotels.city", "ilike", `%${city}%`);
    if (state) query = query.where("hotels.state", "ilike", `%${state}%`);
    if (country) query = query.where("hotels.country", "ilike", `%${country}%`);

    if (min_price) {
      query = query.having("MIN(rooms.price_per_night)", ">=", min_price);
    }

    if (max_price) {
      query = query.having("MAX(rooms.price_per_night)", "<=", max_price);
    }

    if (rating) {
      query = query.having("AVG(reviews.rating)", ">=", rating);
    }

    if (amenities) {
      const amenitiesList = amenities.split(",");
      query = query.where(function () {
        amenitiesList.forEach((amenity) => {
          this.where("hotels.amenities", "like", `%${amenity.trim()}%`);
        });
      });
    }

    // Verificar disponibilidade se datas foram fornecidas
    if (availability_from && availability_to) {
      query = query.whereExists(function () {
        this.select("*")
          .from("rooms")
          .whereRaw("rooms.hotel_id = hotels.id")
          .andWhereNotExists(function () {
            this.select("*")
              .from("bookings")
              .whereRaw("bookings.room_id = rooms.id")
              .andWhere("bookings.status", "confirmed")
              .andWhere(function () {
                this.whereBetween("bookings.check_in_date", [
                  availability_from,
                  availability_to,
                ])
                  .orWhereBetween("bookings.check_out_date", [
                    availability_from,
                    availability_to,
                  ])
                  .orWhere(function () {
                    this.where(
                      "bookings.check_in_date",
                      "<=",
                      availability_from,
                    ).andWhere(
                      "bookings.check_out_date",
                      ">=",
                      availability_to,
                    );
                  });
              });
          });
      });
    }

    // Aplicar ordenação
    const validSortFields = ["name", "avg_rating", "min_price", "created_at"];
    const sortField = validSortFields.includes(sort_by) ? sort_by : "name";
    const sortDirection = sort_order.toLowerCase() === "desc" ? "desc" : "asc";

    if (sortField === "avg_rating") {
      query = query.orderBy(db.raw("AVG(reviews.rating)"), sortDirection);
    } else if (sortField === "min_price") {
      query = query.orderBy(
        db.raw("MIN(rooms.price_per_night)"),
        sortDirection,
      );
    } else {
      query = query.orderBy(`hotels.${sortField}`, sortDirection);
    }

    // Contar total para paginação
    const countQuery = query
      .clone()
      .clearSelect()
      .clearOrder()
      .count("* as total");
    const [{ total }] = await countQuery;

    // Aplicar paginação
    const hotels = await query.limit(limit).offset(offset);

    // Buscar fotos para cada hotel
    for (let hotel of hotels) {
      hotel.photos = await db("hotel_photos")
        .where("hotel_id", hotel.id)
        .orderBy("is_primary", "desc")
        .orderBy("display_order", "asc");

      // Buscar tipos de quartos disponíveis
      hotel.room_types = await db("rooms")
        .select(
          "type",
          db.raw("MIN(price_per_night) as min_price"),
          db.raw("COUNT(*) as count"),
        )
        .where("hotel_id", hotel.id)
        .where("status", "available")
        .groupBy("type");
    }

    const result = {
      hotels,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total),
        pages: Math.ceil(total / limit),
      },
      filters_applied: {
        search,
        city,
        state,
        country,
        min_price,
        max_price,
        rating,
        amenities,
        availability_from,
        availability_to,
      },
    };

    // Salvar no cache por 5 minutos
    await cache.set(cacheKey, result, 300);

    logger.info(`Hotels listed: ${hotels.length} of ${total} total`);
    res.json(result);
  } catch (error) {
    logger.error("Error listing hotels:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      message: "Falha ao buscar hotéis",
    });
  }
});

// GET /api/hotels/:id - Buscar hotel específico
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar do cache primeiro
    const cacheKey = `hotel:${id}`;
    const cachedHotel = await cache.get(cacheKey);
    if (cachedHotel) {
      return res.json(cachedHotel);
    }

    const hotel = await db("hotels")
      .select([
        "hotels.*",
        db.raw("AVG(reviews.rating) as avg_rating"),
        db.raw("COUNT(reviews.id) as review_count"),
      ])
      .leftJoin("reviews", "hotels.id", "reviews.hotel_id")
      .where("hotels.id", id)
      .where("hotels.status", "active")
      .groupBy("hotels.id")
      .first();

    if (!hotel) {
      return res.status(404).json({
        error: "Hotel não encontrado",
      });
    }

    // Buscar informações adicionais
    hotel.photos = await db("hotel_photos")
      .where("hotel_id", id)
      .orderBy("is_primary", "desc")
      .orderBy("display_order", "asc");

    hotel.rooms = await db("rooms")
      .where("hotel_id", id)
      .where("status", "available")
      .orderBy("price_per_night", "asc");

    hotel.reviews = await db("reviews")
      .select(["reviews.*", "users.name as user_name", "users.avatar_url"])
      .leftJoin("users", "reviews.user_id", "users.id")
      .where("reviews.hotel_id", id)
      .where("reviews.status", "approved")
      .orderBy("reviews.created_at", "desc")
      .limit(10);

    hotel.amenities_list = hotel.amenities
      ? hotel.amenities.split(",").map((a) => a.trim())
      : [];

    // Política de cancelamento
    hotel.cancellation_policy = await db("hotel_policies")
      .where("hotel_id", id)
      .where("type", "cancellation")
      .first();

    // Salvar no cache por 10 minutos
    await cache.set(cacheKey, hotel, 600);

    logger.info(`Hotel ${id} details served`);
    res.json(hotel);
  } catch (error) {
    logger.error("Error fetching hotel details:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      message: "Falha ao buscar detalhes do hotel",
    });
  }
});

// POST /api/hotels - Criar novo hotel (apenas admin)
router.post("/", authMiddleware, async (req, res) => {
  try {
    // Validar dados
    const { error, value } = validateHotel(req.body);
    if (error) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: error.details.map((d) => d.message),
      });
    }

    // Verificar permissões
    if (req.user.role !== "admin") {
      return res.status(403).json({
        error: "Acesso negado",
        message: "Apenas administradores podem criar hotéis",
      });
    }

    const hotelData = {
      ...value,
      created_by: req.user.id,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const [hotel] = await db("hotels").insert(hotelData).returning("*");

    // Limpar cache relacionado
    await cache.del("hotels:*");

    logger.info(`Hotel created: ${hotel.name} (ID: ${hotel.id})`);

    res.status(201).json({
      message: "Hotel criado com sucesso",
      hotel,
    });
  } catch (error) {
    logger.error("Error creating hotel:", error);

    if (error.code === "23505") {
      // Unique violation
      return res.status(409).json({
        error: "Conflito",
        message: "Hotel com este nome já existe",
      });
    }

    res.status(500).json({
      error: "Erro interno do servidor",
      message: "Falha ao criar hotel",
    });
  }
});

// PUT /api/hotels/:id - Atualizar hotel
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Validar dados
    const { error, value } = validateHotel(req.body);
    if (error) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: error.details.map((d) => d.message),
      });
    }

    // Verificar se hotel existe
    const existingHotel = await db("hotels").where("id", id).first();
    if (!existingHotel) {
      return res.status(404).json({
        error: "Hotel não encontrado",
      });
    }

    // Verificar permissões
    if (req.user.role !== "admin" && existingHotel.created_by !== req.user.id) {
      return res.status(403).json({
        error: "Acesso negado",
        message: "Você só pode editar hotéis criados por você",
      });
    }

    const updateData = {
      ...value,
      updated_by: req.user.id,
      updated_at: new Date(),
    };

    const [hotel] = await db("hotels")
      .where("id", id)
      .update(updateData)
      .returning("*");

    // Limpar cache
    await cache.del(`hotel:${id}`);
    await cache.del("hotels:*");

    logger.info(`Hotel updated: ${hotel.name} (ID: ${hotel.id})`);

    res.json({
      message: "Hotel atualizado com sucesso",
      hotel,
    });
  } catch (error) {
    logger.error("Error updating hotel:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      message: "Falha ao atualizar hotel",
    });
  }
});

// POST /api/hotels/:id/photos - Upload de fotos do hotel
router.post(
  "/:id/photos",
  authMiddleware,
  upload.array("photos", 10),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Verificar se hotel existe
      const hotel = await db("hotels").where("id", id).first();
      if (!hotel) {
        return res.status(404).json({
          error: "Hotel não encontrado",
        });
      }

      // Verificar permissões
      if (req.user.role !== "admin" && hotel.created_by !== req.user.id) {
        return res.status(403).json({
          error: "Acesso negado",
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          error: "Nenhuma foto foi enviada",
        });
      }

      const photos = [];

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];

        const photoData = {
          hotel_id: id,
          filename: file.filename,
          original_name: file.originalname,
          url: `/uploads/hotels/${file.filename}`,
          size: file.size,
          mime_type: file.mimetype,
          is_primary: i === 0, // Primeira foto é a principal
          display_order: i + 1,
          uploaded_by: req.user.id,
          created_at: new Date(),
        };

        const [photo] = await db("hotel_photos")
          .insert(photoData)
          .returning("*");
        photos.push(photo);
      }

      // Limpar cache
      await cache.del(`hotel:${id}`);

      logger.info(`${photos.length} photos uploaded for hotel ${id}`);

      res.status(201).json({
        message: "Fotos enviadas com sucesso",
        photos,
      });
    } catch (error) {
      logger.error("Error uploading hotel photos:", error);
      res.status(500).json({
        error: "Erro interno do servidor",
        message: "Falha ao enviar fotos",
      });
    }
  },
);

// DELETE /api/hotels/:id - Deletar hotel (soft delete)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const hotel = await db("hotels").where("id", id).first();
    if (!hotel) {
      return res.status(404).json({
        error: "Hotel não encontrado",
      });
    }

    // Verificar permissões
    if (req.user.role !== "admin") {
      return res.status(403).json({
        error: "Acesso negado",
        message: "Apenas administradores podem deletar hotéis",
      });
    }

    // Verificar se há reservas ativas
    const activeBookings = await db("bookings")
      .join("rooms", "bookings.room_id", "rooms.id")
      .where("rooms.hotel_id", id)
      .where("bookings.status", "confirmed")
      .where("bookings.check_out_date", ">", new Date())
      .count("* as count")
      .first();

    if (parseInt(activeBookings.count) > 0) {
      return res.status(409).json({
        error: "Conflito",
        message: "Não é possível deletar hotel com reservas ativas",
      });
    }

    // Soft delete
    await db("hotels").where("id", id).update({
      status: "deleted",
      deleted_by: req.user.id,
      deleted_at: new Date(),
      updated_at: new Date(),
    });

    // Limpar cache
    await cache.del(`hotel:${id}`);
    await cache.del("hotels:*");

    logger.info(`Hotel deleted: ${hotel.name} (ID: ${id})`);

    res.json({
      message: "Hotel deletado com sucesso",
    });
  } catch (error) {
    logger.error("Error deleting hotel:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      message: "Falha ao deletar hotel",
    });
  }
});

// GET /api/hotels/:id/availability - Verificar disponibilidade
router.get("/:id/availability", async (req, res) => {
  try {
    const { id } = req.params;
    const { check_in, check_out, guests = 1 } = req.query;

    if (!check_in || !check_out) {
      return res.status(400).json({
        error: "Datas de check-in e check-out são obrigatórias",
      });
    }

    const availableRooms = await db("rooms")
      .select([
        "rooms.*",
        db.raw("rooms.capacity >= ? as fits_guests", [guests]),
      ])
      .where("rooms.hotel_id", id)
      .where("rooms.status", "available")
      .whereNotExists(function () {
        this.select("*")
          .from("bookings")
          .whereRaw("bookings.room_id = rooms.id")
          .where("bookings.status", "confirmed")
          .where(function () {
            this.whereBetween("bookings.check_in_date", [check_in, check_out])
              .orWhereBetween("bookings.check_out_date", [check_in, check_out])
              .orWhere(function () {
                this.where("bookings.check_in_date", "<=", check_in).andWhere(
                  "bookings.check_out_date",
                  ">=",
                  check_out,
                );
              });
          });
      })
      .orderBy("rooms.price_per_night", "asc");

    res.json({
      check_in,
      check_out,
      guests: parseInt(guests),
      available_rooms: availableRooms,
      total_available: availableRooms.length,
    });
  } catch (error) {
    logger.error("Error checking availability:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      message: "Falha ao verificar disponibilidade",
    });
  }
});

module.exports = router;
