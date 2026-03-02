const express = require("express");
const router = express.Router();
const knex = require("../database/connection");
const { validateWebsiteContent } = require("../validators/websiteValidator");

// Middleware para autenticação (simplificado para desenvolvimento)
const authenticateAdmin = (req, res, next) => {
  // Em produção, implementar JWT ou sessão
  const adminToken = req.headers.authorization;
  if (!adminToken) {
    return res.status(401).json({ error: "Token de administrador necessário" });
  }
  next();
};

// GET /api/admin/website/content - Listar todo o conteúdo
router.get("/website/content", authenticateAdmin, async (req, res) => {
  try {
    const { page_type, status } = req.query;

    let query = knex("website_content");

    if (page_type) {
      query = query.where("page_type", page_type);
    }

    if (status) {
      query = query.where("status", status);
    }

    const content = await query.orderBy("created_at", "desc");

    res.json({
      success: true,
      content,
      total: content.length,
    });
  } catch (error) {
    console.error("Erro ao listar conteúdo:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
});

// GET /api/admin/website/content/:id - Obter conteúdo específico
router.get("/website/content/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const content = await knex("website_content").where("id", id).first();

    if (!content) {
      return res.status(404).json({
        success: false,
        error: "Conteúdo não encontrado",
      });
    }

    res.json({
      success: true,
      content,
    });
  } catch (error) {
    console.error("Erro ao obter conteúdo:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
});

// POST /api/admin/website/content - Criar novo conteúdo
router.post("/website/content", authenticateAdmin, async (req, res) => {
  try {
    const { error, value } = validateWebsiteContent(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        error: "Dados inválidos",
        details: error.details,
      });
    }

    const [newContent] = await knex("website_content")
      .insert({
        ...value,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning("*");

    res.status(201).json({
      success: true,
      content: newContent,
      message: "Conteúdo criado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao criar conteúdo:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
});

// PUT /api/admin/website/content/:id - Atualizar conteúdo
router.put("/website/content/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = validateWebsiteContent(req.body, true);

    if (error) {
      return res.status(400).json({
        success: false,
        error: "Dados inválidos",
        details: error.details,
      });
    }

    const [updatedContent] = await knex("website_content")
      .where("id", id)
      .update({
        ...value,
        updated_at: new Date(),
      })
      .returning("*");

    if (!updatedContent) {
      return res.status(404).json({
        success: false,
        error: "Conteúdo não encontrado",
      });
    }

    res.json({
      success: true,
      content: updatedContent,
      message: "Conteúdo atualizado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar conteúdo:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
});

// DELETE /api/admin/website/content/:id - Deletar conteúdo
router.delete("/website/content/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCount = await knex("website_content").where("id", id).del();

    if (deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Conteúdo não encontrado",
      });
    }

    res.json({
      success: true,
      message: "Conteúdo deletado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao deletar conteúdo:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
});

// PUT /api/admin/website/settings - Atualizar configurações do site
router.put("/website/settings", authenticateAdmin, async (req, res) => {
  try {
    const { site_info, contact_info, social_media } = req.body;

    const [updatedSettings] = await knex("website_settings")
      .where("id", 1)
      .update({
        site_info: JSON.stringify(site_info),
        contact_info: JSON.stringify(contact_info),
        social_media: JSON.stringify(social_media),
        updated_at: new Date(),
      })
      .returning("*");

    if (!updatedSettings) {
      return res.status(404).json({
        success: false,
        error: "Configurações não encontradas",
      });
    }

    res.json({
      success: true,
      settings: {
        site_info: JSON.parse(updatedSettings.site_info),
        contact_info: JSON.parse(updatedSettings.contact_info),
        social_media: JSON.parse(updatedSettings.social_media),
      },
      message: "Configurações atualizadas com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar configurações:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
});

// POST /api/admin/upload - Upload de imagens
router.post("/upload", authenticateAdmin, async (req, res) => {
  try {
    // Implementar upload de imagens
    // Por enquanto, retornar URL mock
    const mockImageUrl = `https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=Imagem+${Date.now()}`;

    res.json({
      success: true,
      imageUrl: mockImageUrl,
      message: "Imagem enviada com sucesso",
    });
  } catch (error) {
    console.error("Erro no upload:", error);
    res.status(500).json({
      success: false,
      error: "Erro no upload da imagem",
    });
  }
});

module.exports = router;
