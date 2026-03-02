const express = require("express");
const router = express.Router();
const { query, validationResult } = require("express-validator");
const { authorize } = require("../middleware/auth");
const { db } = require("../config/database");
const { asyncHandler, AppError } = require("../middleware/errorHandler");
const logger = require("../utils/logger");

/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     tags: [Analytics]
 *     summary: Get dashboard analytics
 */
router.get(
  "/dashboard",
  [
    authorize(["admin", "manager"]),
    query("period").optional().isIn(["7d", "30d", "90d", "1y"]),
  ],
  asyncHandler(async (req, res) => {
    const { period = "30d" } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default: // 30d
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Overview metrics
    const overview = await db.raw(
      `
    SELECT 
      (SELECT COUNT(*) FROM bookings WHERE created_at >= ?) as total_bookings,
      (SELECT COUNT(*) FROM bookings WHERE status = 'confirmed' AND created_at >= ?) as confirmed_bookings,
      (SELECT COUNT(*) FROM customers WHERE created_at >= ?) as new_customers,
      (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'completed' AND created_at >= ?) as total_revenue,
      (SELECT COUNT(*) FROM users WHERE created_at >= ?) as new_users
  `,
      [startDate, startDate, startDate, startDate, startDate],
    );

    // Revenue by month
    const revenueByMonth = await db("payments")
      .select(
        db.raw("TO_CHAR(created_at, 'YYYY-MM') as month"),
        db.raw("SUM(amount) as revenue"),
        db.raw("COUNT(*) as transactions"),
      )
      .where("status", "completed")
      .where("created_at", ">=", startDate)
      .groupBy(db.raw("TO_CHAR(created_at, 'YYYY-MM')"))
      .orderBy("month");

    // Bookings by status
    const bookingsByStatus = await db("bookings")
      .select("status")
      .count("* as count")
      .where("created_at", ">=", startDate)
      .groupBy("status");

    // Top destinations
    const topDestinations = await db("travel_packages")
      .select("destination")
      .count("* as packages")
      .sum("total_bookings as bookings")
      .where("status", "active")
      .groupBy("destination")
      .orderBy("bookings", "desc")
      .limit(5);

    // Customer growth
    const customerGrowth = await db("customers")
      .select(
        db.raw("TO_CHAR(created_at, 'YYYY-MM') as month"),
        db.raw("COUNT(*) as new_customers"),
      )
      .where("created_at", ">=", startDate)
      .groupBy(db.raw("TO_CHAR(created_at, 'YYYY-MM')"))
      .orderBy("month");

    res.json({
      success: true,
      data: {
        period,
        overview: overview.rows[0],
        revenueByMonth,
        bookingsByStatus,
        topDestinations,
        customerGrowth,
      },
    });
  }),
);

/**
 * @swagger
 * /api/analytics/revenue:
 *   get:
 *     tags: [Analytics]
 *     summary: Get revenue analytics
 */
router.get(
  "/revenue",
  [
    authorize(["admin", "manager"]),
    query("start_date").optional().isISO8601(),
    query("end_date").optional().isISO8601(),
    query("group_by").optional().isIn(["day", "week", "month", "year"]),
  ],
  asyncHandler(async (req, res) => {
    const {
      start_date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end_date = new Date(),
      group_by = "day",
    } = req.query;

    // Format mapping for grouping
    const formatMap = {
      day: "YYYY-MM-DD",
      week: "YYYY-WW",
      month: "YYYY-MM",
      year: "YYYY",
    };

    const revenue = await db("payments")
      .select(
        db.raw(`TO_CHAR(created_at, '${formatMap[group_by]}') as period`),
        db.raw("SUM(amount) as total_revenue"),
        db.raw("COUNT(*) as total_transactions"),
        db.raw("AVG(amount) as average_transaction"),
        db.raw("SUM(fee_amount) as total_fees"),
      )
      .where("status", "completed")
      .where("created_at", ">=", start_date)
      .where("created_at", "<=", end_date)
      .groupBy(db.raw(`TO_CHAR(created_at, '${formatMap[group_by]}')`))
      .orderBy("period");

    // Revenue by payment method
    const revenueByMethod = await db("payments")
      .select("method")
      .sum("amount as revenue")
      .count("* as transactions")
      .where("status", "completed")
      .where("created_at", ">=", start_date)
      .where("created_at", "<=", end_date)
      .groupBy("method")
      .orderBy("revenue", "desc");

    // Revenue summary
    const summary = await db("payments")
      .select(
        db.raw("SUM(amount) as total_revenue"),
        db.raw("COUNT(*) as total_transactions"),
        db.raw("AVG(amount) as average_transaction"),
        db.raw("SUM(fee_amount) as total_fees"),
        db.raw("SUM(net_amount) as net_revenue"),
      )
      .where("status", "completed")
      .where("created_at", ">=", start_date)
      .where("created_at", "<=", end_date)
      .first();

    res.json({
      success: true,
      data: {
        period: { start_date, end_date, group_by },
        summary,
        revenue,
        revenueByMethod,
      },
    });
  }),
);

/**
 * @swagger
 * /api/analytics/customers:
 *   get:
 *     tags: [Analytics]
 *     summary: Get customer analytics
 */
router.get(
  "/customers",
  authorize(["admin", "manager"]),
  asyncHandler(async (req, res) => {
    // Customer overview
    const overview = await db("customers")
      .select(
        db.raw("COUNT(*) as total_customers"),
        db.raw("COUNT(CASE WHEN status = ? THEN 1 END) as active_customers", [
          "active",
        ]),
        db.raw("COUNT(CASE WHEN vip_level != ? THEN 1 END) as vip_customers", [
          "none",
        ]),
        db.raw("AVG(total_spent) as average_customer_value"),
        db.raw("AVG(total_bookings) as average_bookings_per_customer"),
      )
      .first();

    // Customer acquisition
    const acquisition = await db("customers")
      .select(
        db.raw("TO_CHAR(created_at, 'YYYY-MM') as month"),
        db.raw("COUNT(*) as new_customers"),
      )
      .where("created_at", ">=", db.raw("NOW() - INTERVAL '12 months'"))
      .groupBy(db.raw("TO_CHAR(created_at, 'YYYY-MM')"))
      .orderBy("month");

    // Customer segments
    const segments = await db("customers")
      .select("vip_level")
      .count("* as count")
      .avg("total_spent as avg_spent")
      .groupBy("vip_level")
      .orderBy("count", "desc");

    // Top customers
    const topCustomers = await db("customers")
      .select(
        "id",
        "name",
        "email",
        "total_spent",
        "total_bookings",
        "vip_level",
      )
      .where("status", "active")
      .orderBy("total_spent", "desc")
      .limit(10);

    res.json({
      success: true,
      data: {
        overview,
        acquisition,
        segments,
        topCustomers,
      },
    });
  }),
);

/**
 * @swagger
 * /api/analytics/packages:
 *   get:
 *     tags: [Analytics]
 *     summary: Get travel packages analytics
 */
router.get(
  "/packages",
  authorize(["admin", "manager"]),
  asyncHandler(async (req, res) => {
    // Package overview
    const overview = await db("travel_packages")
      .select(
        db.raw("COUNT(*) as total_packages"),
        db.raw("COUNT(CASE WHEN status = ? THEN 1 END) as active_packages", [
          "active",
        ]),
        db.raw(
          "COUNT(CASE WHEN is_featured = true THEN 1 END) as featured_packages",
        ),
        db.raw("AVG(base_price) as average_price"),
        db.raw("SUM(total_bookings) as total_bookings"),
      )
      .first();

    // Most popular packages
    const popularPackages = await db("travel_packages")
      .select(
        "id",
        "name",
        "destination",
        "total_bookings",
        "average_rating",
        "base_price",
      )
      .where("status", "active")
      .orderBy("total_bookings", "desc")
      .limit(10);

    // Packages by destination
    const byDestination = await db("travel_packages")
      .select("destination")
      .count("* as count")
      .sum("total_bookings as bookings")
      .avg("base_price as avg_price")
      .where("status", "active")
      .groupBy("destination")
      .orderBy("bookings", "desc");

    // Price analysis
    const priceAnalysis = await db("travel_packages")
      .select(
        db.raw(`
        CASE 
          WHEN base_price < 500 THEN 'Budget (< R$ 500)'
          WHEN base_price < 1000 THEN 'Mid-range (R$ 500-1000)'
          WHEN base_price < 2000 THEN 'Premium (R$ 1000-2000)'
          ELSE 'Luxury (> R$ 2000)'
        END as price_range
      `),
        db.raw("COUNT(*) as count"),
        db.raw("AVG(total_bookings) as avg_bookings"),
      )
      .where("status", "active")
      .groupBy(
        db.raw(`
      CASE 
        WHEN base_price < 500 THEN 'Budget (< R$ 500)'
        WHEN base_price < 1000 THEN 'Mid-range (R$ 500-1000)'
        WHEN base_price < 2000 THEN 'Premium (R$ 1000-2000)'
        ELSE 'Luxury (> R$ 2000)'
      END
    `),
      )
      .orderBy("count", "desc");

    res.json({
      success: true,
      data: {
        overview,
        popularPackages,
        byDestination,
        priceAnalysis,
      },
    });
  }),
);

/**
 * @swagger
 * /api/analytics/export:
 *   get:
 *     tags: [Analytics]
 *     summary: Export analytics data
 */
router.get(
  "/export",
  [
    authorize(["admin", "manager"]),
    query("type").isIn(["revenue", "bookings", "customers", "packages"]),
    query("format").optional().isIn(["csv", "json"]),
    query("start_date").optional().isISO8601(),
    query("end_date").optional().isISO8601(),
  ],
  asyncHandler(async (req, res) => {
    const {
      type,
      format = "json",
      start_date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end_date = new Date(),
    } = req.query;

    let data;
    let filename;

    switch (type) {
      case "revenue":
        data = await db("payments")
          .select("transaction_id", "amount", "method", "status", "created_at")
          .where("created_at", ">=", start_date)
          .where("created_at", "<=", end_date)
          .orderBy("created_at", "desc");
        filename = `revenue_report_${start_date}_${end_date}`;
        break;

      case "bookings":
        data = await db("bookings")
          .select(
            "booking_number",
            "title",
            "status",
            "total_amount",
            "start_date",
            "end_date",
            "created_at",
          )
          .where("created_at", ">=", start_date)
          .where("created_at", "<=", end_date)
          .orderBy("created_at", "desc");
        filename = `bookings_report_${start_date}_${end_date}`;
        break;

      case "customers":
        data = await db("customers")
          .select(
            "name",
            "email",
            "status",
            "vip_level",
            "total_spent",
            "total_bookings",
            "created_at",
          )
          .where("created_at", ">=", start_date)
          .where("created_at", "<=", end_date)
          .orderBy("created_at", "desc");
        filename = `customers_report_${start_date}_${end_date}`;
        break;

      case "packages":
        data = await db("travel_packages")
          .select(
            "name",
            "destination",
            "base_price",
            "status",
            "total_bookings",
            "average_rating",
            "created_at",
          )
          .orderBy("total_bookings", "desc");
        filename = `packages_report`;
        break;

      default:
        throw new AppError("Invalid export type", 400, "INVALID_EXPORT_TYPE");
    }

    if (format === "csv") {
      // Convert to CSV format
      const csv = convertToCSV(data);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}.csv"`,
      );
      res.send(csv);
    } else {
      res.json({
        success: true,
        data: {
          type,
          period: { start_date, end_date },
          records: data.length,
          data,
        },
      });
    }

    logger.info(`Analytics export: ${type} (${format}) by ${req.user.email}`);
  }),
);

// Helper function to convert data to CSV
function convertToCSV(data) {
  if (!data.length) return "";

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          return typeof value === "string"
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        })
        .join(","),
    ),
  ].join("\n");

  return csvContent;
}

module.exports = router;
