const { db, cache } = require("../config/database");
const logger = require("../config/logger");
const axios = require("axios");

/**
 * Serviço de Marketplace para Parceiros RSV 360
 * Gerencia parceiros, comissões, integrações e dashboard
 */
class MarketplaceService {
  constructor() {
    this.commissionRates = {
      bronze: 0.05, // 5%
      silver: 0.07, // 7%
      gold: 0.1, // 10%
      platinum: 0.15, // 15%
      diamond: 0.2, // 20%
    };

    this.tierRequirements = {
      bronze: { minBookings: 0, minRevenue: 0 },
      silver: { minBookings: 50, minRevenue: 10000 },
      gold: { minBookings: 200, minRevenue: 50000 },
      platinum: { minBookings: 500, minRevenue: 150000 },
      diamond: { minBookings: 1000, minRevenue: 500000 },
    };
  }

  /**
   * Registrar novo parceiro
   */
  async registerPartner(partnerData) {
    try {
      const {
        companyName,
        contactName,
        email,
        phone,
        website,
        businessType,
        taxId,
        address,
        bankDetails,
        references,
      } = partnerData;

      // Validar se já existe
      const existingPartner = await db("partners")
        .where("email", email)
        .orWhere("tax_id", taxId)
        .first();

      if (existingPartner) {
        throw new Error("Parceiro já registrado com este email ou CNPJ");
      }

      // Criar parceiro
      const [partnerId] = await db("partners")
        .insert({
          company_name: companyName,
          contact_name: contactName,
          email,
          phone,
          website,
          business_type: businessType,
          tax_id: taxId,
          address: JSON.stringify(address),
          bank_details: JSON.stringify(bankDetails),
          references: JSON.stringify(references),
          status: "pending_review",
          tier: "bronze",
          commission_rate: this.commissionRates.bronze,
          created_at: new Date(),
          api_key: this.generateApiKey(),
          api_secret: this.generateApiSecret(),
        })
        .returning("id");

      // Criar perfil do marketplace
      await db("partner_profiles").insert({
        partner_id: partnerId,
        description: "",
        logo_url: null,
        banner_url: null,
        specialties: JSON.stringify([]),
        certifications: JSON.stringify([]),
        languages: JSON.stringify(["pt"]),
        social_media: JSON.stringify({}),
        business_hours: JSON.stringify({
          monday: { open: "09:00", close: "18:00" },
          tuesday: { open: "09:00", close: "18:00" },
          wednesday: { open: "09:00", close: "18:00" },
          thursday: { open: "09:00", close: "18:00" },
          friday: { open: "09:00", close: "18:00" },
          saturday: { open: "09:00", close: "14:00" },
          sunday: { closed: true },
        }),
        created_at: new Date(),
      });

      // Log da ação
      await this.logPartnerActivity(partnerId, "registration", {
        action: "Partner registered",
        details: { company_name: companyName, business_type: businessType },
      });

      logger.info(
        `✅ Novo parceiro registrado: ${companyName} (ID: ${partnerId})`,
      );

      return {
        partnerId,
        apiKey: (await db("partners").where("id", partnerId).first()).api_key,
        status: "pending_review",
        message:
          "Registro enviado para análise. Você receberá um email em até 48h.",
      };
    } catch (error) {
      logger.error("❌ Erro ao registrar parceiro:", error);
      throw error;
    }
  }

  /**
   * Aprovar parceiro
   */
  async approvePartner(partnerId, adminId, notes = "") {
    try {
      await db.transaction(async (trx) => {
        // Atualizar status
        await trx("partners").where("id", partnerId).update({
          status: "active",
          approved_by: adminId,
          approved_at: new Date(),
          approval_notes: notes,
        });

        // Criar webhook padrão
        await trx("partner_webhooks").insert({
          partner_id: partnerId,
          event_type: "booking_created",
          url: null,
          is_active: false,
          created_at: new Date(),
        });

        // Log da aprovação
        await this.logPartnerActivity(
          partnerId,
          "approval",
          {
            action: "Partner approved",
            admin_id: adminId,
            notes,
          },
          trx,
        );
      });

      // Enviar email de aprovação
      await this.sendPartnerEmail(partnerId, "approval");

      logger.info(`✅ Parceiro ${partnerId} aprovado por admin ${adminId}`);

      return { success: true, message: "Parceiro aprovado com sucesso" };
    } catch (error) {
      logger.error("❌ Erro ao aprovar parceiro:", error);
      throw error;
    }
  }

  /**
   * Processar reserva de parceiro
   */
  async processPartnerBooking(partnerId, bookingData) {
    try {
      const partner = await this.getPartnerById(partnerId);

      if (!partner || partner.status !== "active") {
        throw new Error("Parceiro não encontrado ou inativo");
      }

      const {
        hotelId,
        userId,
        roomId,
        checkIn,
        checkOut,
        guests,
        specialRequests,
        customerInfo,
      } = bookingData;

      // Calcular preços
      const pricing = await this.calculatePartnerPricing(
        hotelId,
        roomId,
        checkIn,
        checkOut,
        partnerId,
      );

      // Criar reserva
      const [bookingId] = await db("bookings")
        .insert({
          user_id: userId,
          hotel_id: hotelId,
          room_id: roomId,
          partner_id: partnerId,
          check_in_date: checkIn,
          check_out_date: checkOut,
          guests_count: guests,
          total_amount: pricing.total,
          partner_commission: pricing.commission,
          commission_rate: partner.commission_rate,
          special_requests: specialRequests,
          customer_info: JSON.stringify(customerInfo),
          status: "confirmed",
          booking_source: "partner",
          created_at: new Date(),
        })
        .returning("id");

      // Registrar comissão
      await this.recordCommission(partnerId, bookingId, pricing.commission);

      // Atualizar estatísticas do parceiro
      await this.updatePartnerStats(partnerId, pricing.total);

      // Verificar se precisa fazer upgrade de tier
      await this.checkTierUpgrade(partnerId);

      // Enviar webhook
      await this.sendWebhook(partnerId, "booking_created", {
        bookingId,
        hotelId,
        total: pricing.total,
        commission: pricing.commission,
      });

      logger.info(`📋 Reserva ${bookingId} criada pelo parceiro ${partnerId}`);

      return {
        bookingId,
        status: "confirmed",
        total: pricing.total,
        commission: pricing.commission,
        confirmationCode: `RSV${bookingId.toString().padStart(8, "0")}`,
      };
    } catch (error) {
      logger.error("❌ Erro ao processar reserva do parceiro:", error);
      throw error;
    }
  }

  /**
   * Calcular preços para parceiro
   */
  async calculatePartnerPricing(hotelId, roomId, checkIn, checkOut, partnerId) {
    try {
      const partner = await this.getPartnerById(partnerId);

      // Buscar preço base do hotel
      const room = await db("rooms")
        .join("hotels", "rooms.hotel_id", "hotels.id")
        .select("rooms.*", "hotels.name as hotel_name")
        .where("rooms.id", roomId)
        .where("hotels.id", hotelId)
        .first();

      if (!room) {
        throw new Error("Quarto não encontrado");
      }

      // Calcular número de noites
      const nights = Math.ceil(
        (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24),
      );

      // Preço base
      const basePrice = room.price_per_night * nights;

      // Aplicar desconto para parceiro (se houver)
      const partnerDiscount =
        partner.tier === "diamond"
          ? 0.05
          : partner.tier === "platinum"
            ? 0.03
            : partner.tier === "gold"
              ? 0.02
              : 0;

      const discountedPrice = basePrice * (1 - partnerDiscount);

      // Calcular comissão
      const commission = discountedPrice * partner.commission_rate;

      // Taxas
      const serviceFee = discountedPrice * 0.02; // 2% taxa de serviço
      const taxes = discountedPrice * 0.05; // 5% impostos

      const total = discountedPrice + serviceFee + taxes;

      return {
        basePrice,
        discountedPrice,
        commission,
        serviceFee,
        taxes,
        total,
        nights,
        commissionRate: partner.commission_rate,
        partnerDiscount,
      };
    } catch (error) {
      logger.error("❌ Erro ao calcular preços:", error);
      throw error;
    }
  }

  /**
   * Registrar comissão
   */
  async recordCommission(partnerId, bookingId, amount) {
    try {
      await db("partner_commissions").insert({
        partner_id: partnerId,
        booking_id: bookingId,
        amount,
        status: "pending",
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
        created_at: new Date(),
      });

      logger.info(
        `💰 Comissão de R$ ${amount.toFixed(2)} registrada para parceiro ${partnerId}`,
      );
    } catch (error) {
      logger.error("❌ Erro ao registrar comissão:", error);
      throw error;
    }
  }

  /**
   * Processar pagamento de comissões
   */
  async processCommissionPayments() {
    try {
      const pendingCommissions = await db("partner_commissions")
        .join("partners", "partner_commissions.partner_id", "partners.id")
        .select([
          "partner_commissions.*",
          "partners.company_name",
          "partners.bank_details",
        ])
        .where("partner_commissions.status", "pending")
        .where("partner_commissions.due_date", "<=", new Date());

      const paymentBatches = this.groupCommissionsByPartner(pendingCommissions);

      for (const partnerId in paymentBatches) {
        await this.processPartnerPayment(partnerId, paymentBatches[partnerId]);
      }

      logger.info(
        `💸 Processamento de comissões concluído: ${Object.keys(paymentBatches).length} parceiros`,
      );
    } catch (error) {
      logger.error("❌ Erro ao processar pagamentos:", error);
    }
  }

  /**
   * Processar pagamento individual do parceiro
   */
  async processPartnerPayment(partnerId, commissions) {
    try {
      const totalAmount = commissions.reduce((sum, c) => sum + c.amount, 0);
      const commissionIds = commissions.map((c) => c.id);

      // Simular pagamento via API bancária
      const paymentResult = await this.executePayment(
        partnerId,
        totalAmount,
        commissions[0].bank_details,
      );

      if (paymentResult.success) {
        // Atualizar status das comissões
        await db("partner_commissions").whereIn("id", commissionIds).update({
          status: "paid",
          paid_at: new Date(),
          payment_reference: paymentResult.reference,
          payment_method: paymentResult.method,
        });

        // Log do pagamento
        await this.logPartnerActivity(partnerId, "commission_payment", {
          action: "Commission payment processed",
          amount: totalAmount,
          commissions_count: commissions.length,
          reference: paymentResult.reference,
        });

        logger.info(
          `💰 Pagamento de R$ ${totalAmount.toFixed(2)} processado para parceiro ${partnerId}`,
        );
      } else {
        // Marcar como falha
        await db("partner_commissions").whereIn("id", commissionIds).update({
          status: "failed",
          failure_reason: paymentResult.error,
        });

        logger.error(
          `❌ Falha no pagamento para parceiro ${partnerId}: ${paymentResult.error}`,
        );
      }
    } catch (error) {
      logger.error(
        `❌ Erro ao processar pagamento do parceiro ${partnerId}:`,
        error,
      );
    }
  }

  /**
   * Simular execução de pagamento
   */
  async executePayment(partnerId, amount, bankDetails) {
    try {
      // Simular integração com API bancária
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock: 95% de sucesso
      if (Math.random() > 0.05) {
        return {
          success: true,
          reference: `PAY${Date.now()}${partnerId}`,
          method: "bank_transfer",
        };
      } else {
        return {
          success: false,
          error: "Dados bancários inválidos",
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Atualizar estatísticas do parceiro
   */
  async updatePartnerStats(partnerId, bookingAmount) {
    try {
      const stats = await db("partner_stats")
        .where("partner_id", partnerId)
        .first();

      if (stats) {
        await db("partner_stats")
          .where("partner_id", partnerId)
          .update({
            total_bookings: stats.total_bookings + 1,
            total_revenue: stats.total_revenue + bookingAmount,
            updated_at: new Date(),
          });
      } else {
        await db("partner_stats").insert({
          partner_id: partnerId,
          total_bookings: 1,
          total_revenue: bookingAmount,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    } catch (error) {
      logger.error("❌ Erro ao atualizar estatísticas do parceiro:", error);
    }
  }

  /**
   * Verificar upgrade de tier
   */
  async checkTierUpgrade(partnerId) {
    try {
      const stats = await db("partner_stats")
        .where("partner_id", partnerId)
        .first();
      const currentPartner = await db("partners")
        .where("id", partnerId)
        .first();

      if (!stats || !currentPartner) return;

      const { total_bookings, total_revenue } = stats;
      let newTier = currentPartner.tier;

      // Verificar qual tier o parceiro se qualifica
      for (const [tier, requirements] of Object.entries(
        this.tierRequirements,
      )) {
        if (
          total_bookings >= requirements.minBookings &&
          total_revenue >= requirements.minRevenue
        ) {
          newTier = tier;
        }
      }

      // Se houve upgrade
      if (newTier !== currentPartner.tier) {
        await db("partners").where("id", partnerId).update({
          tier: newTier,
          commission_rate: this.commissionRates[newTier],
          updated_at: new Date(),
        });

        // Log do upgrade
        await this.logPartnerActivity(partnerId, "tier_upgrade", {
          action: "Tier upgraded",
          from_tier: currentPartner.tier,
          to_tier: newTier,
          new_commission_rate: this.commissionRates[newTier],
        });

        // Enviar email de congratulações
        await this.sendPartnerEmail(partnerId, "tier_upgrade", {
          newTier,
          newCommissionRate: this.commissionRates[newTier],
        });

        logger.info(`🎉 Parceiro ${partnerId} promovido para tier ${newTier}`);
      }
    } catch (error) {
      logger.error("❌ Erro ao verificar upgrade de tier:", error);
    }
  }

  /**
   * Enviar webhook para parceiro
   */
  async sendWebhook(partnerId, eventType, data) {
    try {
      const webhooks = await db("partner_webhooks")
        .where("partner_id", partnerId)
        .where("event_type", eventType)
        .where("is_active", true);

      for (const webhook of webhooks) {
        if (!webhook.url) continue;

        try {
          const payload = {
            event: eventType,
            data,
            timestamp: new Date().toISOString(),
            partner_id: partnerId,
          };

          await axios.post(webhook.url, payload, {
            headers: {
              "Content-Type": "application/json",
              "X-RSV360-Signature": this.generateWebhookSignature(
                payload,
                webhook.secret,
              ),
            },
            timeout: 10000,
          });

          // Log sucesso
          await db("webhook_logs").insert({
            webhook_id: webhook.id,
            event_type: eventType,
            payload: JSON.stringify(payload),
            status: "success",
            sent_at: new Date(),
          });
        } catch (error) {
          // Log falha
          await db("webhook_logs").insert({
            webhook_id: webhook.id,
            event_type: eventType,
            payload: JSON.stringify(data),
            status: "failed",
            error_message: error.message,
            sent_at: new Date(),
          });

          logger.warn(
            `⚠️ Falha no webhook para parceiro ${partnerId}: ${error.message}`,
          );
        }
      }
    } catch (error) {
      logger.error("❌ Erro ao enviar webhook:", error);
    }
  }

  /**
   * Obter dashboard do parceiro
   */
  async getPartnerDashboard(partnerId, period = "30d") {
    try {
      const partner = await this.getPartnerById(partnerId);
      if (!partner) throw new Error("Parceiro não encontrado");

      // Período de análise
      let dateFilter;
      switch (period) {
        case "7d":
          dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "90d":
          dateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
          break;
        case "1y":
          dateFilter = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      }

      // Estatísticas do período
      const periodStats = await db("bookings")
        .where("partner_id", partnerId)
        .where("created_at", ">=", dateFilter)
        .select(
          db.raw("COUNT(*) as bookings_count"),
          db.raw("SUM(total_amount) as total_revenue"),
          db.raw("SUM(partner_commission) as total_commission"),
          db.raw("AVG(total_amount) as avg_booking_value"),
        )
        .first();

      // Estatísticas totais
      const totalStats = await db("partner_stats")
        .where("partner_id", partnerId)
        .first();

      // Top hotéis
      const topHotels = await db("bookings")
        .join("hotels", "bookings.hotel_id", "hotels.id")
        .where("bookings.partner_id", partnerId)
        .where("bookings.created_at", ">=", dateFilter)
        .select("hotels.name", "hotels.location")
        .count("bookings.id as bookings_count")
        .sum("bookings.total_amount as revenue")
        .groupBy("hotels.id", "hotels.name", "hotels.location")
        .orderBy("bookings_count", "desc")
        .limit(5);

      // Comissões pendentes
      const pendingCommissions = await db("partner_commissions")
        .where("partner_id", partnerId)
        .where("status", "pending")
        .sum("amount as total_pending")
        .first();

      // Evolução mensal
      const monthlyEvolution = await db("bookings")
        .where("partner_id", partnerId)
        .where(
          "created_at",
          ">=",
          new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000),
        )
        .select(
          db.raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
          db.raw("COUNT(*) as bookings"),
          db.raw("SUM(total_amount) as revenue"),
          db.raw("SUM(partner_commission) as commission"),
        )
        .groupBy("month")
        .orderBy("month");

      return {
        partner: {
          id: partner.id,
          companyName: partner.company_name,
          tier: partner.tier,
          commissionRate: partner.commission_rate,
          status: partner.status,
        },
        periodStats: {
          bookingsCount: parseInt(periodStats.bookings_count) || 0,
          totalRevenue: parseFloat(periodStats.total_revenue) || 0,
          totalCommission: parseFloat(periodStats.total_commission) || 0,
          avgBookingValue: parseFloat(periodStats.avg_booking_value) || 0,
        },
        totalStats: {
          totalBookings: totalStats?.total_bookings || 0,
          totalRevenue: totalStats?.total_revenue || 0,
          pendingCommissions: parseFloat(pendingCommissions.total_pending) || 0,
        },
        topHotels,
        monthlyEvolution,
        nextTierInfo: this.getNextTierInfo(partner.tier, totalStats),
      };
    } catch (error) {
      logger.error("❌ Erro ao obter dashboard do parceiro:", error);
      throw error;
    }
  }

  /**
   * Obter informações do próximo tier
   */
  getNextTierInfo(currentTier, stats) {
    const tiers = ["bronze", "silver", "gold", "platinum", "diamond"];
    const currentIndex = tiers.indexOf(currentTier);

    if (currentIndex === -1 || currentIndex === tiers.length - 1) {
      return null;
    }

    const nextTier = tiers[currentIndex + 1];
    const requirements = this.tierRequirements[nextTier];
    const currentBookings = stats?.total_bookings || 0;
    const currentRevenue = stats?.total_revenue || 0;

    return {
      tier: nextTier,
      commissionRate: this.commissionRates[nextTier],
      requirements,
      progress: {
        bookings: {
          current: currentBookings,
          required: requirements.minBookings,
          percentage: Math.min(
            (currentBookings / requirements.minBookings) * 100,
            100,
          ),
        },
        revenue: {
          current: currentRevenue,
          required: requirements.minRevenue,
          percentage: Math.min(
            (currentRevenue / requirements.minRevenue) * 100,
            100,
          ),
        },
      },
    };
  }

  // Métodos auxiliares
  generateApiKey() {
    return `rsv_${Math.random().toString(36).substr(2, 32)}`;
  }

  generateApiSecret() {
    return Math.random().toString(36).substr(2, 64);
  }

  generateWebhookSignature(payload, secret) {
    const crypto = require("crypto");
    return crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(payload))
      .digest("hex");
  }

  groupCommissionsByPartner(commissions) {
    return commissions.reduce((groups, commission) => {
      const partnerId = commission.partner_id;
      if (!groups[partnerId]) {
        groups[partnerId] = [];
      }
      groups[partnerId].push(commission);
      return groups;
    }, {});
  }

  async getPartnerById(partnerId) {
    return await db("partners").where("id", partnerId).first();
  }

  async logPartnerActivity(partnerId, activity, data, trx = db) {
    return await trx("partner_activity_logs").insert({
      partner_id: partnerId,
      activity,
      data: JSON.stringify(data),
      created_at: new Date(),
    });
  }

  async sendPartnerEmail(partnerId, template, data = {}) {
    // Implementar envio de email
    logger.info(`📧 Email '${template}' enviado para parceiro ${partnerId}`);
  }
}

module.exports = MarketplaceService;
