const express = require("express");
const router = express.Router();
const { body, query, param, validationResult } = require("express-validator");
const { authorize } = require("../middleware/auth");
const { db } = require("../config/database");
const { asyncHandler, AppError } = require("../middleware/errorHandler");
const logger = require("../utils/logger");
const crypto = require("crypto");
const { withTransaction } = require("../config/database");

/**
 * @swagger
 * /api/payments:
 *   get:
 *     tags: [Payments]
 *     summary: Get all payments
 */
router.get(
  "/",
  [
    authorize(["admin", "manager"]),
    query("page").optional().isInt({ min: 1 }).toInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  asyncHandler(async (req, res) => {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const offset = (page - 1) * limit;

    const query = db("payments")
      .leftJoin("users", "payments.user_id", "users.id")
      .leftJoin("bookings", "payments.booking_id", "bookings.id")
      .select(
        "payments.*",
        "users.name as user_name",
        "users.email as user_email",
        "bookings.booking_number",
      );

    const total = await query.clone().count("* as count").first();
    const payments = await query
      .orderBy("payments.created_at", "desc")
      .limit(limit)
      .offset(offset);

    res.json({
      success: true,
      data: payments,
      pagination: {
        page,
        limit,
        total: parseInt(total.count),
        pages: Math.ceil(total.count / limit),
      },
    });
  }),
);

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     tags: [Payments]
 *     summary: Get payment by ID
 */
router.get(
  "/:id",
  [param("id").isInt({ min: 1 }).toInt()],
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    let query = db("payments")
      .leftJoin("users", "payments.user_id", "users.id")
      .leftJoin("bookings", "payments.booking_id", "bookings.id")
      .select(
        "payments.*",
        "users.name as user_name",
        "users.email as user_email",
        "bookings.booking_number",
        "bookings.title as booking_title",
      )
      .where("payments.id", id);

    // Filter by user if not admin/manager
    if (req.user.role === "user") {
      query = query.where("payments.user_id", req.user.id);
    }

    const payment = await query.first();

    if (!payment) {
      throw new AppError("Payment not found", 404, "PAYMENT_NOT_FOUND");
    }

    res.json({
      success: true,
      data: payment,
    });
  }),
);

/**
 * @swagger
 * /api/payments:
 *   post:
 *     tags: [Payments]
 *     summary: Process payment
 */
router.post(
  "/",
  [
    body("booking_id").optional().isInt(),
    body("amount").isDecimal({ decimal_digits: "0,2" }),
    body("method").isIn([
      "credit_card",
      "debit_card",
      "bank_transfer",
      "pix",
      "cash",
      "voucher",
    ]),
    body("installments").optional().isInt({ min: 1, max: 12 }),
    body("card_data").optional().isObject(),
    body("description").optional().trim(),
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
      booking_id,
      amount,
      method,
      installments = 1,
      card_data,
      description,
    } = req.body;

    // Validate booking if provided
    let booking = null;
    if (booking_id) {
      booking = await db("bookings").where({ id: booking_id }).first();
      if (!booking) {
        throw new AppError("Booking not found", 404, "BOOKING_NOT_FOUND");
      }

      // Check if user can pay for this booking
      if (req.user.role === "user" && booking.user_id !== req.user.id) {
        throw new AppError(
          "Cannot pay for other users bookings",
          403,
          "INSUFFICIENT_PERMISSIONS",
        );
      }
    }

    // Generate unique transaction ID
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Calculate fees (2.5% for credit card)
    const feeRate = method === "credit_card" ? 0.025 : 0;
    const feeAmount = parseFloat(amount) * feeRate;
    const netAmount = parseFloat(amount) - feeAmount;

    const result = await withTransaction(async (trx) => {
      // Create payment record
      const paymentData = {
        booking_id: booking_id || null,
        user_id: req.user.id,
        transaction_id: transactionId,
        type: "payment",
        method,
        status: "processing",
        amount: parseFloat(amount),
        currency: "BRL",
        fee_amount: feeAmount,
        net_amount: netAmount,
        installments,
        description:
          description || `Payment for ${booking ? booking.title : "service"}`,
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Add card info if provided (store last 4 digits only)
      if (card_data) {
        paymentData.card_last_four = card_data.number
          ? card_data.number.slice(-4)
          : null;
        paymentData.card_brand = card_data.brand || null;
      }

      const [payment] = await trx("payments")
        .insert(paymentData)
        .returning("*");

      // Simulate payment gateway processing
      const success = await processPaymentGateway(payment, card_data);

      if (success) {
        // Update payment status
        await trx("payments")
          .where({ id: payment.id })
          .update({
            status: "completed",
            processed_at: new Date(),
            gateway_transaction_id: `GTW${Date.now()}`,
            updated_at: new Date(),
          });

        // Update booking if applicable
        if (booking) {
          const newPaidAmount =
            parseFloat(booking.paid_amount) + parseFloat(amount);
          const newPendingAmount =
            parseFloat(booking.total_amount) - newPaidAmount;

          let paymentStatus = "partial";
          if (newPendingAmount <= 0) {
            paymentStatus = "paid";
          }

          await trx("bookings")
            .where({ id: booking.id })
            .update({
              paid_amount: newPaidAmount,
              pending_amount: Math.max(0, newPendingAmount),
              payment_status: paymentStatus,
              updated_at: new Date(),
            });
        }

        payment.status = "completed";
        payment.processed_at = new Date();
      } else {
        // Payment failed
        await trx("payments").where({ id: payment.id }).update({
          status: "failed",
          failed_at: new Date(),
          failure_reason: "Payment declined by gateway",
          updated_at: new Date(),
        });

        payment.status = "failed";
        throw new AppError("Payment was declined", 400, "PAYMENT_DECLINED");
      }

      return payment;
    });

    logger.info(
      `Payment processed: ${transactionId} - ${result.status} - ${req.user.email}`,
    );

    res.status(201).json({
      success: true,
      message: "Payment processed successfully",
      data: {
        id: result.id,
        transaction_id: result.transaction_id,
        status: result.status,
        amount: result.amount,
        net_amount: result.net_amount,
        fee_amount: result.fee_amount,
      },
    });
  }),
);

/**
 * @swagger
 * /api/payments/{id}/refund:
 *   post:
 *     tags: [Payments]
 *     summary: Refund payment
 */
router.post(
  "/:id/refund",
  [
    authorize(["admin", "manager"]),
    param("id").isInt({ min: 1 }).toInt(),
    body("amount").optional().isDecimal({ decimal_digits: "0,2" }),
    body("reason").optional().trim().isLength({ max: 500 }),
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
    const { amount, reason } = req.body;

    // Get original payment
    const originalPayment = await db("payments").where({ id }).first();
    if (!originalPayment) {
      throw new AppError("Payment not found", 404, "PAYMENT_NOT_FOUND");
    }

    if (originalPayment.status !== "completed") {
      throw new AppError(
        "Can only refund completed payments",
        400,
        "INVALID_PAYMENT_STATUS",
      );
    }

    // Calculate refund amount
    const refundAmount = amount
      ? parseFloat(amount)
      : parseFloat(originalPayment.amount);

    if (refundAmount > parseFloat(originalPayment.amount)) {
      throw new AppError(
        "Refund amount cannot exceed original payment",
        400,
        "INVALID_REFUND_AMOUNT",
      );
    }

    const result = await withTransaction(async (trx) => {
      // Create refund record
      const refundData = {
        booking_id: originalPayment.booking_id,
        user_id: originalPayment.user_id,
        transaction_id: `REF${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        external_transaction_id: originalPayment.transaction_id,
        type: "refund",
        method: originalPayment.method,
        status: "processing",
        amount: refundAmount,
        currency: originalPayment.currency,
        fee_amount: 0,
        net_amount: refundAmount,
        description: reason || "Refund processed by admin",
        created_at: new Date(),
        updated_at: new Date(),
      };

      const [refund] = await trx("payments").insert(refundData).returning("*");

      // Process refund through gateway
      const success = await processRefundGateway(originalPayment, refundAmount);

      if (success) {
        await trx("payments")
          .where({ id: refund.id })
          .update({
            status: "completed",
            processed_at: new Date(),
            gateway_transaction_id: `REFW${Date.now()}`,
            updated_at: new Date(),
          });

        // Update booking if applicable
        if (originalPayment.booking_id) {
          const booking = await trx("bookings")
            .where({ id: originalPayment.booking_id })
            .first();
          const newPaidAmount = parseFloat(booking.paid_amount) - refundAmount;
          const newPendingAmount =
            parseFloat(booking.total_amount) - newPaidAmount;

          let paymentStatus = "pending";
          if (newPaidAmount > 0) {
            paymentStatus = "partial";
          }
          if (newPaidAmount >= parseFloat(booking.total_amount)) {
            paymentStatus = "paid";
          }

          await trx("bookings")
            .where({ id: booking.id })
            .update({
              paid_amount: Math.max(0, newPaidAmount),
              pending_amount: Math.max(0, newPendingAmount),
              payment_status: paymentStatus,
              updated_at: new Date(),
            });
        }

        refund.status = "completed";
      } else {
        await trx("payments").where({ id: refund.id }).update({
          status: "failed",
          failed_at: new Date(),
          failure_reason: "Refund declined by gateway",
          updated_at: new Date(),
        });

        throw new AppError("Refund processing failed", 500, "REFUND_FAILED");
      }

      return refund;
    });

    logger.info(
      `Refund processed: ${result.transaction_id} for payment ${originalPayment.transaction_id} by ${req.user.email}`,
    );

    res.json({
      success: true,
      message: "Refund processed successfully",
      data: result,
    });
  }),
);

/**
 * @swagger
 * /api/payments/stats:
 *   get:
 *     tags: [Payments]
 *     summary: Get payment statistics
 */
router.get(
  "/stats",
  authorize(["admin", "manager"]),
  asyncHandler(async (req, res) => {
    const stats = await db("payments")
      .select(
        db.raw("COUNT(*) as total_transactions"),
        db.raw(
          "COUNT(CASE WHEN type = ? AND status = ? THEN 1 END) as completed_payments",
          ["payment", "completed"],
        ),
        db.raw(
          "COUNT(CASE WHEN type = ? AND status = ? THEN 1 END) as failed_payments",
          ["payment", "failed"],
        ),
        db.raw("COUNT(CASE WHEN type = ? THEN 1 END) as total_refunds", [
          "refund",
        ]),
        db.raw(
          "SUM(CASE WHEN type = ? AND status = ? THEN amount ELSE 0 END) as total_revenue",
          ["payment", "completed"],
        ),
        db.raw(
          "SUM(CASE WHEN type = ? AND status = ? THEN amount ELSE 0 END) as total_refunded",
          ["refund", "completed"],
        ),
        db.raw(
          "SUM(CASE WHEN type = ? AND status = ? THEN fee_amount ELSE 0 END) as total_fees",
          ["payment", "completed"],
        ),
        db.raw(
          "AVG(CASE WHEN type = ? AND status = ? THEN amount END) as average_transaction",
          ["payment", "completed"],
        ),
      )
      .first();

    // Payment methods breakdown
    const methodStats = await db("payments")
      .select("method")
      .count("* as count")
      .sum("amount as total_amount")
      .where({ type: "payment", status: "completed" })
      .groupBy("method")
      .orderBy("total_amount", "desc");

    // Monthly revenue trend
    const monthlyRevenue = await db("payments")
      .select(
        db.raw("TO_CHAR(created_at, 'YYYY-MM') as month"),
        db.raw(
          "SUM(CASE WHEN type = ? AND status = ? THEN amount ELSE 0 END) as revenue",
          ["payment", "completed"],
        ),
        db.raw(
          "COUNT(CASE WHEN type = ? AND status = ? THEN 1 END) as transactions",
          ["payment", "completed"],
        ),
      )
      .where("created_at", ">=", db.raw("NOW() - INTERVAL '12 months'"))
      .groupBy(db.raw("TO_CHAR(created_at, 'YYYY-MM')"))
      .orderBy("month");

    res.json({
      success: true,
      data: {
        overview: stats,
        methodStats,
        monthlyRevenue,
      },
    });
  }),
);

// Helper functions for payment gateway simulation
async function processPaymentGateway(payment, cardData) {
  // Simulate gateway processing time
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate 95% success rate
  return Math.random() > 0.05;
}

async function processRefundGateway(originalPayment, amount) {
  // Simulate refund processing
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Simulate 98% success rate for refunds
  return Math.random() > 0.02;
}

module.exports = router;
