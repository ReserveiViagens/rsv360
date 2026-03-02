const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");

// Dados mock para testes
let mockContent = [
  {
    id: 1,
    page_type: "hotels",
    title: "Hotel Golden Dolphin Caldas Novas",
    description:
      "Hotel com piscinas termais e estrutura completa para toda a família.",
    price: 250.0,
    original_price: 300.0,
    discount: 16.67,
    stars: 4,
    location: "Caldas Novas, GO",
    status: "active",
    images: ["https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=Hotel+1"],
    features: [
      "Piscina Termal",
      "Wi-Fi Gratuito",
      "Restaurante",
      "Estacionamento",
    ],
    valid_until: null,
    metadata: { capacity: 120, rooms: 60 },
    seo_data: {
      meta_title: "Hotel Golden Dolphin - Caldas Novas",
      meta_description: "Hotel com piscinas termais em Caldas Novas",
      meta_keywords: ["hotel", "caldas novas", "piscina termal"],
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    page_type: "hotels",
    title: "Resort do Lago Reservei Viagens",
    description: "Resort com vista para o lago e atividades aquáticas.",
    price: 180.0,
    original_price: 220.0,
    discount: 18.18,
    stars: 3,
    location: "Caldas Novas, GO",
    status: "active",
    images: ["https://via.placeholder.com/800x600/10B981/FFFFFF?text=Resort+2"],
    features: [
      "Vista para o Lago",
      "Atividades Aquáticas",
      "Wi-Fi",
      "Café da Manhã",
    ],
    valid_until: null,
    metadata: { capacity: 80, rooms: 40 },
    seo_data: {
      meta_title: "Resort do Lago - Caldas Novas",
      meta_description: "Resort com vista para o lago em Caldas Novas",
      meta_keywords: ["resort", "lago", "caldas novas"],
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    page_type: "promotions",
    title: "Promoção Especial de Verão",
    description:
      "Desconto especial para temporada de verão em todos os hotéis.",
    price: null,
    original_price: null,
    discount: 25,
    stars: null,
    location: null,
    status: "active",
    images: [
      "https://via.placeholder.com/800x600/F59E0B/FFFFFF?text=Promoção+Verão",
    ],
    features: [],
    valid_until: "2024-12-31T23:59:59.000Z",
    metadata: { season: "summer", applicable_hotels: "all" },
    seo_data: {
      meta_title: "Promoção Verão - Reservei Viagens",
      meta_description: "Desconto especial de verão em hotéis",
      meta_keywords: ["promoção", "verão", "desconto"],
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    page_type: "attractions",
    title: "Parque das Águas Quentes",
    description: "Parque aquático com piscinas termais e tobogãs.",
    price: 45.0,
    original_price: 50.0,
    discount: 10,
    stars: null,
    location: "Caldas Novas, GO",
    status: "active",
    images: [
      "https://via.placeholder.com/800x600/EF4444/FFFFFF?text=Parque+Águas",
    ],
    features: ["Piscinas Termais", "Tobogãs", "Área Kids", "Restaurante"],
    valid_until: null,
    metadata: { capacity: 500, age_restriction: "all" },
    seo_data: {
      meta_title: "Parque das Águas Quentes - Caldas Novas",
      meta_description: "Parque aquático com piscinas termais",
      meta_keywords: ["parque", "águas quentes", "piscinas termais"],
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let mockSettings = {
  site_info: {
    title: "Reservei Viagens",
    tagline: "Parques, Hotéis & Atrações",
  },
  contact_info: {
    phones: ["(64) 3453-1234", "(64) 99999-9999"],
    email: "contato@reserveiviagens.com.br",
    address: "Caldas Novas, GO - Brasil",
  },
  social_media: {
    facebook: "https://facebook.com/reserveiviagens",
    instagram: "https://instagram.com/reserveiviagens",
    website: "https://reserveiviagens.com.br",
  },
};

// GET /api/admin/website/content - Listar todo o conteúdo
router.get(
  "/website/content",
  authenticate,
  authorize(["admin", "moderator"]),
  async (req, res) => {
    try {
      const { page_type, status } = req.query;

      let content = [...mockContent];

      if (page_type) {
        content = content.filter((item) => item.page_type === page_type);
      }

      if (status) {
        content = content.filter((item) => item.status === status);
      }

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
  },
);

// GET /api/admin/website/content/:id - Obter conteúdo específico
router.get(
  "/website/content/:id",
  authenticate,
  authorize(["admin", "moderator"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const content = mockContent.find((item) => item.id === parseInt(id));

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
  },
);

// POST /api/admin/website/content - Criar novo conteúdo
router.post(
  "/website/content",
  authenticate,
  authorize(["admin", "moderator"]),
  async (req, res) => {
    try {
      const newId = Math.max(...mockContent.map((item) => item.id)) + 1;

      const newContent = {
        id: newId,
        ...req.body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockContent.push(newContent);

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
  },
);

// PUT /api/admin/website/content/:id - Atualizar conteúdo
router.put(
  "/website/content/:id",
  authenticate,
  authorize(["admin", "moderator"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const contentIndex = mockContent.findIndex(
        (item) => item.id === parseInt(id),
      );

      if (contentIndex === -1) {
        return res.status(404).json({
          success: false,
          error: "Conteúdo não encontrado",
        });
      }

      const updatedContent = {
        ...mockContent[contentIndex],
        ...req.body,
        id: parseInt(id), // Manter o ID original
        updated_at: new Date().toISOString(),
      };

      mockContent[contentIndex] = updatedContent;

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
  },
);

// DELETE /api/admin/website/content/:id - Deletar conteúdo
router.delete(
  "/website/content/:id",
  authenticate,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const contentIndex = mockContent.findIndex(
        (item) => item.id === parseInt(id),
      );

      if (contentIndex === -1) {
        return res.status(404).json({
          success: false,
          error: "Conteúdo não encontrado",
        });
      }

      mockContent.splice(contentIndex, 1);

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
  },
);

// PUT /api/admin/website/settings - Atualizar configurações do site
router.put(
  "/website/settings",
  authenticate,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const { site_info, contact_info, social_media } = req.body;

      mockSettings = {
        site_info: site_info || mockSettings.site_info,
        contact_info: contact_info || mockSettings.contact_info,
        social_media: social_media || mockSettings.social_media,
      };

      res.json({
        success: true,
        settings: mockSettings,
        message: "Configurações atualizadas com sucesso",
      });
    } catch (error) {
      console.error("Erro ao atualizar configurações:", error);
      res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  },
);

// POST /api/admin/upload - Upload de imagens
router.post(
  "/upload",
  authenticate,
  authorize(["admin", "moderator"]),
  async (req, res) => {
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
  },
);

module.exports = router;
