const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const { spawn } = require("child_process");

const router = express.Router();

// Configuração do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Filtros de arquivos
const imageMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];
const videoMimeTypes = ["video/mp4", "video/webm"];

const imageFileFilter = (req, file, cb) => {
  if (imageMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Tipo de arquivo não suportado. Use: JPEG, PNG, GIF, WebP"),
      false,
    );
  }
};

const videoFileFilter = (req, file, cb) => {
  if (videoMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de vídeo não suportado. Use: MP4, WebM"), false);
  }
};

// Configuração do Multer
const uploadImages = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10, // Máximo 10 arquivos por vez
  },
});

const uploadVideos = multer({
  storage: storage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB por vídeo
    files: 5,
  },
});

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, error: "Token de autenticação obrigatório" });
  }
  const token = authHeader.split(" ")[1];
  if (token !== "admin-token-123") {
    return res
      .status(403)
      .json({ success: false, error: "Token de autenticação inválido" });
  }
  next();
};

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Função para redimensionar imagem
const resizeImage = async (
  inputPath,
  outputPath,
  width = 800,
  height = 600,
) => {
  try {
    await sharp(inputPath)
      .resize(width, height, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toFile(outputPath);
    return true;
  } catch (error) {
    console.error("Erro ao redimensionar imagem:", error);
    return false;
  }
};

// Função para gerar thumbnail
const generateThumbnail = async (inputPath, outputPath, size = 200) => {
  try {
    await sharp(inputPath)
      .resize(size, size, {
        fit: "cover",
        position: "center",
      })
      .jpeg({ quality: 80 })
      .toFile(outputPath);
    return true;
  } catch (error) {
    console.error("Erro ao gerar thumbnail:", error);
    return false;
  }
};

// Geração de thumbnail para vídeos usando ffmpeg (se disponível)
const generateVideoThumbnail = (
  inputPath,
  outputPath,
  timeOffset = "00:00:01",
) => {
  return new Promise((resolve) => {
    try {
      // Exemplo: ffmpeg -ss 00:00:01 -i input.mp4 -frames:v 1 -vf scale=320:-1 output.jpg
      const args = [
        "-ss",
        timeOffset,
        "-i",
        inputPath,
        "-frames:v",
        "1",
        "-vf",
        "scale=320:-1",
        outputPath,
      ];
      const ff = spawn("ffmpeg", args, { stdio: "ignore" });
      ff.on("error", () => resolve(false));
      ff.on("close", (code) => resolve(code === 0));
    } catch (e) {
      resolve(false);
    }
  });
};

// POST /api/upload/images - Upload de múltiplas imagens
router.post("/images", uploadImages.array("images", 10), async (req, res) => {
  console.log("📤 POST /api/upload/images - Upload recebido");
  console.log("📋 Files:", req.files?.length || 0);
  try {
    if (!req.files || req.files.length === 0) {
      console.error("❌ Nenhuma imagem foi enviada");
      return res.status(400).json({
        success: false,
        error: "Nenhuma imagem foi enviada",
      });
    }

    const uploadedImages = [];
    const uploadDir = path.join(__dirname, "../../uploads");
    const thumbnailsDir = path.join(uploadDir, "thumbnails");

    // Criar diretório de thumbnails se não existir
    if (!fs.existsSync(thumbnailsDir)) {
      fs.mkdirSync(thumbnailsDir, { recursive: true });
    }

    for (const file of req.files) {
      try {
        const originalPath = file.path;
        const filename = file.filename;
        const thumbnailPath = path.join(thumbnailsDir, `thumb_${filename}`);

        // Gerar thumbnail
        await generateThumbnail(originalPath, thumbnailPath);

        // Redimensionar imagem original se necessário
        const resizedPath = path.join(uploadDir, `resized_${filename}`);
        await resizeImage(originalPath, resizedPath);

        // Remover arquivo original e renomear o redimensionado
        fs.unlinkSync(originalPath);
        fs.renameSync(resizedPath, originalPath);

        uploadedImages.push({
          id: uuidv4(),
          filename: filename,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          url: `/uploads/${filename}`,
          thumbnailUrl: `/uploads/thumbnails/thumb_${filename}`,
          uploadedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error(`Erro ao processar arquivo ${file.originalname}:`, error);
        // Remover arquivo se houver erro
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }

    res.json({
      success: true,
      message: `${uploadedImages.length} imagem(ns) carregada(s) com sucesso`,
      images: uploadedImages,
    });
  } catch (error) {
    console.error("Erro no upload:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor durante o upload",
    });
  }
});

// POST /api/upload/single - Upload de uma única imagem
router.post("/single", uploadImages.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Nenhuma imagem foi enviada",
      });
    }

    const uploadDir = path.join(__dirname, "../../uploads");
    const thumbnailsDir = path.join(uploadDir, "thumbnails");

    if (!fs.existsSync(thumbnailsDir)) {
      fs.mkdirSync(thumbnailsDir, { recursive: true });
    }

    const originalPath = req.file.path;
    const filename = req.file.filename;
    const thumbnailPath = path.join(thumbnailsDir, `thumb_${filename}`);

    // Gerar thumbnail
    await generateThumbnail(originalPath, thumbnailPath);

    // Redimensionar imagem original
    const resizedPath = path.join(uploadDir, `resized_${filename}`);
    await resizeImage(originalPath, resizedPath);

    // Remover arquivo original e renomear o redimensionado
    fs.unlinkSync(originalPath);
    fs.renameSync(resizedPath, originalPath);

    const uploadedImage = {
      id: uuidv4(),
      filename: filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: `/uploads/${filename}`,
      thumbnailUrl: `/uploads/thumbnails/thumb_${filename}`,
      uploadedAt: new Date().toISOString(),
    };

    res.json({
      success: true,
      message: "Imagem carregada com sucesso",
      image: uploadedImage,
    });
  } catch (error) {
    console.error("Erro no upload:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor durante o upload",
    });
  }
});

// POST /api/upload/videos - Upload de múltiplos vídeos (mp4, webm)
router.post("/videos", uploadVideos.array("videos", 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "Nenhum vídeo foi enviado" });
    }

    const uploadDir = path.join(__dirname, "../../uploads");
    const thumbnailsDir = path.join(uploadDir, "thumbnails");
    if (!fs.existsSync(thumbnailsDir)) {
      fs.mkdirSync(thumbnailsDir, { recursive: true });
    }

    const uploadedVideos = [];
    for (const file of req.files) {
      const originalPath = file.path;
      const filename = file.filename; // mantém o arquivo como está (sem sharp)

      // Thumbnail jpg para o vídeo
      const thumbName = `thumb_${path.parse(filename).name}.jpg`;
      const thumbnailPath = path.join(thumbnailsDir, thumbName);
      const ok = await generateVideoThumbnail(originalPath, thumbnailPath);

      uploadedVideos.push({
        id: uuidv4(),
        filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: `/uploads/${filename}`,
        thumbnailUrl: ok ? `/uploads/thumbnails/${thumbName}` : null,
        uploadedAt: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      message: `${uploadedVideos.length} vídeo(s) carregado(s) com sucesso`,
      videos: uploadedVideos,
    });
  } catch (error) {
    console.error("Erro no upload de vídeos:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor durante o upload de vídeos",
    });
  }
});

// GET /api/upload/videos - Listar vídeos
router.get("/videos", (req, res) => {
  try {
    const uploadDir = path.join(__dirname, "../../uploads");
    const thumbnailsDir = path.join(uploadDir, "thumbnails");

    if (!fs.existsSync(uploadDir)) {
      return res.json({ success: true, videos: [] });
    }

    const files = fs
      .readdirSync(uploadDir)
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return [".mp4", ".webm"].includes(ext);
      })
      .map((file) => {
        const filePath = path.join(uploadDir, file);
        const stats = fs.statSync(filePath);
        const thumbName = `thumb_${path.parse(file).name}.jpg`;
        const thumbnailPath = path.join(thumbnailsDir, thumbName);
        return {
          id: uuidv4(),
          filename: file,
          size: stats.size,
          url: `/uploads/${file}`,
          thumbnailUrl: fs.existsSync(thumbnailPath)
            ? `/uploads/thumbnails/${thumbName}`
            : null,
          uploadedAt: stats.birthtime.toISOString(),
        };
      })
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    res.json({ success: true, videos: files });
  } catch (error) {
    console.error("Erro ao listar vídeos:", error);
    res.status(500).json({ success: false, error: "Erro interno do servidor" });
  }
});

// DELETE /api/upload/videos/:filename - Deletar vídeo
router.delete("/videos/:filename", (req, res) => {
  try {
    const filename = req.params.filename;
    const uploadDir = path.join(__dirname, "../../uploads");
    const thumbnailsDir = path.join(uploadDir, "thumbnails");

    const videoPath = path.join(uploadDir, filename);
    const thumbName = `thumb_${path.parse(filename).name}.jpg`;
    const thumbnailPath = path.join(thumbnailsDir, thumbName);

    if (!fs.existsSync(videoPath)) {
      return res
        .status(404)
        .json({ success: false, error: "Vídeo não encontrado" });
    }

    fs.unlinkSync(videoPath);
    if (fs.existsSync(thumbnailPath)) {
      fs.unlinkSync(thumbnailPath);
    }

    res.json({ success: true, message: "Vídeo deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar vídeo:", error);
    res.status(500).json({ success: false, error: "Erro interno do servidor" });
  }
});

// GET /api/upload/images - Listar imagens carregadas
router.get("/images", (req, res) => {
  try {
    const uploadDir = path.join(__dirname, "../../uploads");
    const thumbnailsDir = path.join(uploadDir, "thumbnails");

    if (!fs.existsSync(uploadDir)) {
      return res.json({
        success: true,
        images: [],
      });
    }

    const files = fs
      .readdirSync(uploadDir)
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext);
      })
      .map((file) => {
        const filePath = path.join(uploadDir, file);
        const stats = fs.statSync(filePath);
        const thumbnailPath = path.join(thumbnailsDir, `thumb_${file}`);

        return {
          id: uuidv4(),
          filename: file,
          size: stats.size,
          url: `/uploads/${file}`,
          thumbnailUrl: fs.existsSync(thumbnailPath)
            ? `/uploads/thumbnails/thumb_${file}`
            : null,
          uploadedAt: stats.birthtime.toISOString(),
        };
      })
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    res.json({
      success: true,
      images: files,
    });
  } catch (error) {
    console.error("Erro ao listar imagens:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
});

// DELETE /api/upload/images/:filename - Deletar imagem
router.delete("/images/:filename", (req, res) => {
  try {
    const filename = req.params.filename;
    const uploadDir = path.join(__dirname, "../../uploads");
    const thumbnailsDir = path.join(uploadDir, "thumbnails");

    const imagePath = path.join(uploadDir, filename);
    const thumbnailPath = path.join(thumbnailsDir, `thumb_${filename}`);

    // Verificar se o arquivo existe
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({
        success: false,
        error: "Imagem não encontrada",
      });
    }

    // Deletar imagem principal
    fs.unlinkSync(imagePath);

    // Deletar thumbnail se existir
    if (fs.existsSync(thumbnailPath)) {
      fs.unlinkSync(thumbnailPath);
    }

    res.json({
      success: true,
      message: "Imagem deletada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao deletar imagem:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
});

// Middleware para servir arquivos estáticos
router.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

module.exports = router;
