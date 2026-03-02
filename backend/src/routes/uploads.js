const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { body, param, validationResult } = require("express-validator");
const { authorize } = require("../middleware/auth");
const { db } = require("../config/database");
const { asyncHandler, AppError } = require("../middleware/errorHandler");
const logger = require("../utils/logger");

// Ensure upload directories exist
const uploadDir = path.join(process.cwd(), "uploads");
const avatarsDir = path.join(uploadDir, "avatars");
const documentsDir = path.join(uploadDir, "documents");
const imagesDir = path.join(uploadDir, "images");

[uploadDir, avatarsDir, documentsDir, imagesDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    document: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    avatar: ["image/jpeg", "image/png", "image/gif"],
  };

  const uploadType = req.params.type || req.body.type || "document";
  const allowed = allowedTypes[uploadType] || allowedTypes.document;

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Allowed types for ${uploadType}: ${allowed.join(", ")}`,
      ),
      false,
    );
  }
};

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadType = req.params.type || req.body.type || "document";
    let destDir = documentsDir;

    switch (uploadType) {
      case "avatar":
        destDir = avatarsDir;
        break;
      case "image":
        destDir = imagesDir;
        break;
      default:
        destDir = documentsDir;
    }

    cb(null, destDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 5, // Max 5 files per request
  },
});

/**
 * @swagger
 * /api/uploads/{type}:
 *   post:
 *     tags: [System]
 *     summary: Upload files
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [avatar, image, document]
 */
router.post(
  "/:type",
  [
    param("type").isIn(["avatar", "image", "document"]),
    upload.array("files", 5),
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

    const { type } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      throw new AppError("No files uploaded", 400, "NO_FILES_UPLOADED");
    }

    const uploadedFiles = [];

    // Save file records to database
    for (const file of files) {
      const fileRecord = {
        filename: file.filename,
        original_name: file.originalname,
        mime_type: file.mimetype,
        size: file.size,
        type: type,
        path: file.path,
        url: `/uploads/${type}/${file.filename}`,
        uploaded_by: req.user.id,
        created_at: new Date(),
      };

      // Create files table if it doesn't exist (for demo purposes)
      try {
        const [savedFile] = await db("files").insert(fileRecord).returning("*");
        uploadedFiles.push({
          id: savedFile.id,
          filename: savedFile.filename,
          original_name: savedFile.original_name,
          size: savedFile.size,
          type: savedFile.type,
          url: savedFile.url,
        });
      } catch (error) {
        // If files table doesn't exist, just return file info
        uploadedFiles.push({
          filename: file.filename,
          original_name: file.originalname,
          size: file.size,
          type: type,
          url: `/uploads/${type}/${file.filename}`,
        });
      }
    }

    logger.info(
      `Files uploaded: ${files.length} files of type ${type} by ${req.user.email}`,
    );

    res.status(201).json({
      success: true,
      message: `${files.length} file(s) uploaded successfully`,
      data: uploadedFiles,
    });
  }),
);

/**
 * @swagger
 * /api/uploads:
 *   get:
 *     tags: [System]
 *     summary: Get uploaded files
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    try {
      const files = await db("files")
        .leftJoin("users", "files.uploaded_by", "users.id")
        .select("files.*", "users.name as uploaded_by_name")
        .where("files.uploaded_by", req.user.id)
        .orderBy("files.created_at", "desc");

      res.json({
        success: true,
        data: files,
      });
    } catch (error) {
      // If files table doesn't exist, return empty array
      res.json({
        success: true,
        data: [],
        message: "Files table not initialized",
      });
    }
  }),
);

/**
 * @swagger
 * /api/uploads/{id}:
 *   delete:
 *     tags: [System]
 *     summary: Delete uploaded file
 */
router.delete(
  "/:id",
  [param("id").isInt({ min: 1 }).toInt()],
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
      // Get file record
      const file = await db("files").where({ id }).first();

      if (!file) {
        throw new AppError("File not found", 404, "FILE_NOT_FOUND");
      }

      // Check permissions
      if (
        file.uploaded_by !== req.user.id &&
        !["admin", "manager"].includes(req.user.role)
      ) {
        throw new AppError(
          "Cannot delete other users files",
          403,
          "INSUFFICIENT_PERMISSIONS",
        );
      }

      // Delete physical file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      // Delete database record
      await db("files").where({ id }).del();

      logger.info(`File deleted: ${file.filename} by ${req.user.email}`);

      res.json({
        success: true,
        message: "File deleted successfully",
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      // If files table doesn't exist, just return success
      res.json({
        success: true,
        message: "File deletion completed",
      });
    }
  }),
);

/**
 * @swagger
 * /api/uploads/avatar:
 *   post:
 *     tags: [System]
 *     summary: Upload user avatar
 */
router.post(
  "/avatar",
  [upload.single("avatar")],
  asyncHandler(async (req, res) => {
    const file = req.file;

    if (!file) {
      throw new AppError("No avatar file uploaded", 400, "NO_AVATAR_UPLOADED");
    }

    const avatarUrl = `/uploads/avatars/${file.filename}`;

    // Update user avatar
    await db("users").where({ id: req.user.id }).update({
      avatar_url: avatarUrl,
      updated_at: new Date(),
    });

    logger.info(`Avatar updated for user: ${req.user.email}`);

    res.json({
      success: true,
      message: "Avatar updated successfully",
      data: {
        avatar_url: avatarUrl,
        filename: file.filename,
        size: file.size,
      },
    });
  }),
);

/**
 * @swagger
 * /api/uploads/validate:
 *   post:
 *     tags: [System]
 *     summary: Validate file before upload
 */
router.post(
  "/validate",
  [
    body("filename").notEmpty(),
    body("size").isInt({ min: 1 }),
    body("type").isIn(["avatar", "image", "document"]),
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

    const { filename, size, type } = req.body;
    const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024;

    const validation = {
      valid: true,
      errors: [],
    };

    // Check file size
    if (size > maxSize) {
      validation.valid = false;
      validation.errors.push(
        `File size ${(size / 1024 / 1024).toFixed(2)}MB exceeds maximum ${(maxSize / 1024 / 1024).toFixed(2)}MB`,
      );
    }

    // Check file extension
    const ext = path.extname(filename).toLowerCase();
    const allowedExtensions = {
      avatar: [".jpg", ".jpeg", ".png", ".gif"],
      image: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
      document: [".pdf", ".doc", ".docx"],
    };

    const allowed = allowedExtensions[type] || allowedExtensions.document;
    if (!allowed.includes(ext)) {
      validation.valid = false;
      validation.errors.push(
        `File extension ${ext} not allowed for type ${type}. Allowed: ${allowed.join(", ")}`,
      );
    }

    res.json({
      success: true,
      data: validation,
    });
  }),
);

// Create files table migration
const createFilesTable = async () => {
  try {
    const hasTable = await db.schema.hasTable("files");
    if (!hasTable) {
      await db.schema.createTable("files", (table) => {
        table.increments("id").primary();
        table.string("filename").notNullable();
        table.string("original_name").notNullable();
        table.string("mime_type").notNullable();
        table.integer("size").notNullable();
        table.enum("type", ["avatar", "image", "document"]).notNullable();
        table.string("path").notNullable();
        table.string("url").notNullable();
        table
          .integer("uploaded_by")
          .unsigned()
          .references("id")
          .inTable("users");
        table.timestamp("created_at").defaultTo(db.fn.now());

        table.index("uploaded_by");
        table.index("type");
        table.index("created_at");
      });
      logger.info("Files table created successfully");
    }
  } catch (error) {
    logger.warn("Could not create files table:", error.message);
  }
};

// Initialize files table on module load
createFilesTable();

module.exports = router;
