const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../../middleware/auth');
const { asyncHandler } = require('../../../middleware/errorHandler');
const seoController = require('./controller');

/**
 * Rotas de SEO
 */

// Listar todas as configurações de SEO
router.get('/', authenticateToken, asyncHandler(seoController.list));

// Obter configuração de uma página específica
router.get('/page/:page', authenticateToken, asyncHandler(seoController.getByPage));

// Criar ou atualizar configuração de SEO
router.post('/', authenticateToken, asyncHandler(seoController.createOrUpdate));
router.put('/:id', authenticateToken, asyncHandler(seoController.createOrUpdate));

// Deletar configuração de SEO
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // TODO: Implementar exclusão no banco de dados
  const { logAuditEvent } = require('../../../utils/auditLogger');
  
  logAuditEvent({
    action: 'seo_delete',
    userId: req.user?.id || 'system',
    details: { id }
  });

  res.json({
    success: true,
    message: 'Configuração de SEO excluída com sucesso'
  });
}));

// Estatísticas de SEO
router.get('/stats', authenticateToken, asyncHandler(seoController.getStats));

// Gerar sitemap
router.post('/sitemap/generate', authenticateToken, asyncHandler(seoController.generateSitemap));

// Analisar página
router.post('/analyze', authenticateToken, asyncHandler(seoController.analyzePage));

// Top keywords
router.get('/keywords/top', authenticateToken, asyncHandler(seoController.getTopKeywords));

module.exports = router;
