const { db } = require("../config/database");
const logger = require("./logger");

/**
 * Log audit events to database and winston logger
 */
const logAuditEvent = async (eventData) => {
  try {
    const {
      userId = null,
      action,
      entityType = null,
      entityId = null,
      ipAddress = null,
      userAgent = null,
      metadata = {},
      severity = "low",
      success = true,
      failureReason = null,
      req = null,
    } = eventData;

    // Extract additional data from request if provided
    let auditData = {
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      ip_address: ipAddress,
      user_agent: userAgent,
      metadata: JSON.stringify(metadata),
      severity,
      success,
      failure_reason: failureReason,
      created_at: new Date(),
    };

    // Extract data from request object if provided
    if (req) {
      auditData.ip_address =
        auditData.ip_address || req.ip || req.connection?.remoteAddress;
      auditData.user_agent = auditData.user_agent || req.get("User-Agent");
      auditData.user_id = auditData.user_id || req.user?.id;
    }

    // Insert into database
    await db("audit_logs").insert(auditData);

    // Also log to winston for immediate monitoring
    const logLevel =
      severity === "critical" ? "error" : severity === "high" ? "warn" : "info";
    logger[logLevel](`Audit: ${action}`, {
      userId: auditData.user_id,
      action,
      success,
      severity,
      ip: auditData.ip_address,
      metadata,
    });
  } catch (error) {
    logger.error("Failed to log audit event:", error);
    // Don't throw error - audit logging should not break application flow
  }
};

/**
 * Authentication audit events
 */
const auditAuth = {
  login: (userId, req, success = true, failureReason = null) => {
    return logAuditEvent({
      userId,
      action: "auth.login",
      severity: success ? "low" : "medium",
      success,
      failureReason,
      req,
    });
  },

  logout: (userId, req) => {
    return logAuditEvent({
      userId,
      action: "auth.logout",
      severity: "low",
      req,
    });
  },

  register: (userId, req) => {
    return logAuditEvent({
      userId,
      action: "auth.register",
      severity: "low",
      req,
    });
  },

  passwordChange: (userId, req) => {
    return logAuditEvent({
      userId,
      action: "auth.password_change",
      severity: "medium",
      req,
    });
  },

  passwordReset: (userId, req) => {
    return logAuditEvent({
      userId,
      action: "auth.password_reset",
      severity: "medium",
      req,
    });
  },

  twoFactorEnable: (userId, req) => {
    return logAuditEvent({
      userId,
      action: "auth.2fa_enable",
      severity: "medium",
      req,
    });
  },

  twoFactorDisable: (userId, req) => {
    return logAuditEvent({
      userId,
      action: "auth.2fa_disable",
      severity: "medium",
      req,
    });
  },

  twoFactorVerify: (userId, req, success = true) => {
    return logAuditEvent({
      userId,
      action: "auth.2fa_verify",
      severity: success ? "low" : "high",
      success,
      req,
    });
  },

  accountLocked: (userId, req, metadata = {}) => {
    return logAuditEvent({
      userId,
      action: "auth.account_locked",
      severity: "high",
      metadata,
      req,
    });
  },

  suspiciousActivity: (userId, req, metadata = {}) => {
    return logAuditEvent({
      userId,
      action: "auth.suspicious_activity",
      severity: "critical",
      metadata,
      req,
    });
  },
};

/**
 * User management audit events
 */
const auditUser = {
  create: (userId, targetUserId, req) => {
    return logAuditEvent({
      userId,
      action: "user.create",
      entityType: "user",
      entityId: targetUserId,
      severity: "medium",
      req,
    });
  },

  update: (userId, targetUserId, req, changes = {}) => {
    return logAuditEvent({
      userId,
      action: "user.update",
      entityType: "user",
      entityId: targetUserId,
      severity: "low",
      metadata: { changes },
      req,
    });
  },

  delete: (userId, targetUserId, req) => {
    return logAuditEvent({
      userId,
      action: "user.delete",
      entityType: "user",
      entityId: targetUserId,
      severity: "high",
      req,
    });
  },

  roleChange: (userId, targetUserId, req, oldRole, newRole) => {
    return logAuditEvent({
      userId,
      action: "user.role_change",
      entityType: "user",
      entityId: targetUserId,
      severity: "high",
      metadata: { oldRole, newRole },
      req,
    });
  },

  permissionChange: (userId, targetUserId, req, changes = {}) => {
    return logAuditEvent({
      userId,
      action: "user.permission_change",
      entityType: "user",
      entityId: targetUserId,
      severity: "medium",
      metadata: { changes },
      req,
    });
  },
};

/**
 * Data access audit events
 */
const auditData = {
  access: (userId, entityType, entityId, req) => {
    return logAuditEvent({
      userId,
      action: "data.access",
      entityType,
      entityId,
      severity: "low",
      req,
    });
  },

  export: (userId, entityType, req, metadata = {}) => {
    return logAuditEvent({
      userId,
      action: "data.export",
      entityType,
      severity: "medium",
      metadata,
      req,
    });
  },

  bulkOperation: (userId, entityType, req, operation, count) => {
    return logAuditEvent({
      userId,
      action: `data.bulk_${operation}`,
      entityType,
      severity: "medium",
      metadata: { operation, count },
      req,
    });
  },
};

/**
 * System audit events
 */
const auditSystem = {
  configChange: (userId, req, setting, oldValue, newValue) => {
    return logAuditEvent({
      userId,
      action: "system.config_change",
      severity: "high",
      metadata: { setting, oldValue, newValue },
      req,
    });
  },

  backup: (userId, req, type, success = true) => {
    return logAuditEvent({
      userId,
      action: "system.backup",
      severity: "medium",
      success,
      metadata: { type },
      req,
    });
  },

  restore: (userId, req, type, success = true) => {
    return logAuditEvent({
      userId,
      action: "system.restore",
      severity: "critical",
      success,
      metadata: { type },
      req,
    });
  },
};

/**
 * Get audit logs with filtering
 */
const getAuditLogs = async (filters = {}) => {
  try {
    const {
      userId,
      action,
      entityType,
      severity,
      success,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = filters;

    let query = db("audit_logs")
      .leftJoin("users", "audit_logs.user_id", "users.id")
      .select(
        "audit_logs.*",
        "users.name as user_name",
        "users.email as user_email",
      );

    // Apply filters
    if (userId) {
      query = query.where("audit_logs.user_id", userId);
    }

    if (action) {
      query = query.where("audit_logs.action", "like", `%${action}%`);
    }

    if (entityType) {
      query = query.where("audit_logs.entity_type", entityType);
    }

    if (severity) {
      query = query.where("audit_logs.severity", severity);
    }

    if (success !== undefined) {
      query = query.where("audit_logs.success", success);
    }

    if (startDate) {
      query = query.where("audit_logs.created_at", ">=", startDate);
    }

    if (endDate) {
      query = query.where("audit_logs.created_at", "<=", endDate);
    }

    // Get total count
    const totalQuery = query.clone();
    const [{ count }] = await totalQuery.count("* as count");
    const total = parseInt(count);

    // Get paginated results
    const offset = (page - 1) * limit;
    const logs = await query
      .orderBy("audit_logs.created_at", "desc")
      .limit(limit)
      .offset(offset);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error("Failed to get audit logs:", error);
    throw error;
  }
};

/**
 * Get audit statistics
 */
const getAuditStats = async (timeframe = "24h") => {
  try {
    const timeMap = {
      "1h": 1,
      "24h": 24,
      "7d": 24 * 7,
      "30d": 24 * 30,
    };

    const hours = timeMap[timeframe] || 24;
    const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);

    const stats = await db("audit_logs")
      .where("created_at", ">=", startDate)
      .groupBy("action", "severity", "success")
      .select("action", "severity", "success")
      .count("* as count");

    return {
      timeframe,
      startDate,
      stats,
    };
  } catch (error) {
    logger.error("Failed to get audit stats:", error);
    throw error;
  }
};

module.exports = {
  logAuditEvent,
  auditAuth,
  auditUser,
  auditData,
  auditSystem,
  getAuditLogs,
  getAuditStats,
};
