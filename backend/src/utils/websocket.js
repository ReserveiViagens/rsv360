const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { db } = require("../config/database");
const logger = require("./logger");

let io = null;
const connectedUsers = new Map(); // userId -> socketId

/**
 * Initialize WebSocket server
 */
const initializeWebSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin:
        process.env.NODE_ENV === "production"
          ? process.env.FRONTEND_URL
          : ["http://localhost:3000", "http://localhost:3001"],
      credentials: true,
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Authentication token required"));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const user = await db("users")
        .where({ id: decoded.userId, status: "active" })
        .select("id", "email", "name", "role")
        .first();

      if (!user) {
        return next(new Error("User not found or inactive"));
      }

      socket.userId = user.id;
      socket.userEmail = user.email;
      socket.userName = user.name;
      socket.userRole = user.role;

      next();
    } catch (error) {
      logger.logSecurity("WebSocket authentication failed", {
        error: error.message,
        socketId: socket.id,
        ip: socket.handshake.address,
      });
      next(new Error("Authentication failed"));
    }
  });

  // Connection handler
  io.on("connection", (socket) => {
    logger.info(`WebSocket connected: ${socket.userEmail} (${socket.id})`);

    // Store user connection
    connectedUsers.set(socket.userId, socket.id);

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Join role-based rooms
    socket.join(`role:${socket.userRole}`);

    // Join all users room
    socket.join("all");

    // Send welcome message
    socket.emit("connected", {
      message: "Connected to Onboarding RSV WebSocket",
      userId: socket.userId,
      timestamp: new Date().toISOString(),
    });

    // Handle custom events
    socket.on("join_room", (roomName) => {
      if (roomName && typeof roomName === "string" && roomName.length < 50) {
        socket.join(roomName);
        logger.info(`User ${socket.userEmail} joined room: ${roomName}`);
      }
    });

    socket.on("leave_room", (roomName) => {
      if (roomName && typeof roomName === "string") {
        socket.leave(roomName);
        logger.info(`User ${socket.userEmail} left room: ${roomName}`);
      }
    });

    // Handle user status updates
    socket.on("user_status", (status) => {
      if (["online", "away", "busy"].includes(status)) {
        socket.broadcast.emit("user_status_update", {
          userId: socket.userId,
          userName: socket.userName,
          status: status,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Handle typing indicators
    socket.on("typing_start", (data) => {
      socket.broadcast.to(data.room || "all").emit("user_typing", {
        userId: socket.userId,
        userName: socket.userName,
        typing: true,
      });
    });

    socket.on("typing_stop", (data) => {
      socket.broadcast.to(data.room || "all").emit("user_typing", {
        userId: socket.userId,
        userName: socket.userName,
        typing: false,
      });
    });

    // Handle disconnection
    socket.on("disconnect", (reason) => {
      logger.info(
        `WebSocket disconnected: ${socket.userEmail} (${socket.id}) - ${reason}`,
      );

      // Remove user from connected users
      connectedUsers.delete(socket.userId);

      // Broadcast user offline status
      socket.broadcast.emit("user_status_update", {
        userId: socket.userId,
        userName: socket.userName,
        status: "offline",
        timestamp: new Date().toISOString(),
      });
    });

    // Handle errors
    socket.on("error", (error) => {
      logger.error(`WebSocket error for user ${socket.userEmail}:`, error);
    });
  });

  logger.info("WebSocket server initialized successfully");
  return io;
};

/**
 * Send notification to specific user
 */
const sendNotificationToUser = (userId, notification) => {
  if (!io) return false;

  const socketId = connectedUsers.get(userId);
  if (socketId) {
    io.to(`user:${userId}`).emit("notification", {
      id: notification.id || Date.now(),
      type: notification.type || "info",
      title: notification.title,
      message: notification.message,
      data: notification.data || {},
      timestamp: new Date().toISOString(),
      read: false,
    });

    logger.info(`Notification sent to user ${userId}: ${notification.title}`);
    return true;
  }

  return false;
};

/**
 * Send notification to multiple users
 */
const sendNotificationToUsers = (userIds, notification) => {
  if (!io || !Array.isArray(userIds)) return 0;

  let sentCount = 0;
  userIds.forEach((userId) => {
    if (sendNotificationToUser(userId, notification)) {
      sentCount++;
    }
  });

  return sentCount;
};

/**
 * Send notification to all users
 */
const sendNotificationToAll = (notification) => {
  if (!io) return false;

  io.to("all").emit("notification", {
    id: notification.id || Date.now(),
    type: notification.type || "info",
    title: notification.title,
    message: notification.message,
    data: notification.data || {},
    timestamp: new Date().toISOString(),
    read: false,
  });

  logger.info(`Broadcast notification sent: ${notification.title}`);
  return true;
};

/**
 * Send notification to users by role
 */
const sendNotificationToRole = (role, notification) => {
  if (!io) return false;

  io.to(`role:${role}`).emit("notification", {
    id: notification.id || Date.now(),
    type: notification.type || "info",
    title: notification.title,
    message: notification.message,
    data: notification.data || {},
    timestamp: new Date().toISOString(),
    read: false,
  });

  logger.info(`Notification sent to role ${role}: ${notification.title}`);
  return true;
};

/**
 * Send real-time update to room
 */
const sendUpdateToRoom = (room, updateType, data) => {
  if (!io) return false;

  io.to(room).emit("real_time_update", {
    type: updateType,
    data: data,
    timestamp: new Date().toISOString(),
  });

  return true;
};

/**
 * Get connected users count
 */
const getConnectedUsersCount = () => {
  return connectedUsers.size;
};

/**
 * Get connected users list
 */
const getConnectedUsers = () => {
  return Array.from(connectedUsers.keys());
};

/**
 * Check if user is connected
 */
const isUserConnected = (userId) => {
  return connectedUsers.has(userId);
};

/**
 * Send booking update notification
 */
const notifyBookingUpdate = async (bookingId, updateType, userId = null) => {
  try {
    const booking = await db("bookings")
      .leftJoin("users", "bookings.user_id", "users.id")
      .select(
        "bookings.*",
        "users.name as user_name",
        "users.email as user_email",
      )
      .where("bookings.id", bookingId)
      .first();

    if (!booking) return false;

    const notification = {
      type: "booking",
      title: `Booking ${updateType}`,
      message: `Booking ${booking.booking_number} - ${booking.title} has been ${updateType}`,
      data: {
        bookingId: booking.id,
        bookingNumber: booking.booking_number,
        status: booking.status,
        updateType,
      },
    };

    // Notify the booking owner
    sendNotificationToUser(booking.user_id, notification);

    // Notify admins and managers
    sendNotificationToRole("admin", notification);
    sendNotificationToRole("manager", notification);

    return true;
  } catch (error) {
    logger.error("Error sending booking notification:", error);
    return false;
  }
};

/**
 * Send payment update notification
 */
const notifyPaymentUpdate = async (paymentId, updateType) => {
  try {
    const payment = await db("payments")
      .leftJoin("users", "payments.user_id", "users.id")
      .leftJoin("bookings", "payments.booking_id", "bookings.id")
      .select(
        "payments.*",
        "users.name as user_name",
        "users.email as user_email",
        "bookings.booking_number",
      )
      .where("payments.id", paymentId)
      .first();

    if (!payment) return false;

    const notification = {
      type: "payment",
      title: `Payment ${updateType}`,
      message: `Payment ${payment.transaction_id} has been ${updateType}`,
      data: {
        paymentId: payment.id,
        transactionId: payment.transaction_id,
        amount: payment.amount,
        status: payment.status,
        bookingNumber: payment.booking_number,
        updateType,
      },
    };

    // Notify the payment owner
    sendNotificationToUser(payment.user_id, notification);

    // Notify admins and managers
    sendNotificationToRole("admin", notification);
    sendNotificationToRole("manager", notification);

    return true;
  } catch (error) {
    logger.error("Error sending payment notification:", error);
    return false;
  }
};

/**
 * Send system notification
 */
const notifySystemUpdate = (type, title, message, targetRole = "all") => {
  const notification = {
    type: "system",
    title,
    message,
    data: { systemUpdate: type },
  };

  if (targetRole === "all") {
    sendNotificationToAll(notification);
  } else {
    sendNotificationToRole(targetRole, notification);
  }

  return true;
};

module.exports = {
  initializeWebSocket,
  sendNotificationToUser,
  sendNotificationToUsers,
  sendNotificationToAll,
  sendNotificationToRole,
  sendUpdateToRoom,
  getConnectedUsersCount,
  getConnectedUsers,
  isUserConnected,
  notifyBookingUpdate,
  notifyPaymentUpdate,
  notifySystemUpdate,
};
