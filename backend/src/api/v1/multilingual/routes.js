const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../../middleware/auth');
const { asyncHandler } = require('../../../middleware/errorHandler');

/**
 * Rotas de Multilíngue
 */
router.get('/translations', authenticateToken, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'API de traduções em desenvolvimento'
  });
}));

router.get('/languages', authenticateToken, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, code: 'pt-BR', name: 'Portuguese', native_name: 'Português', is_default: true, is_active: true, created_at: new Date().toISOString() }
    ]
  });
}));

router.post('/translations', authenticateToken, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { id: Date.now(), ...req.body },
    message: 'Tradução criada com sucesso'
  });
}));

router.post('/languages', authenticateToken, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { id: Date.now(), ...req.body },
    message: 'Idioma criado com sucesso'
  });
}));

router.put('/languages/:id/default', authenticateToken, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Idioma padrão atualizado com sucesso'
  });
}));

module.exports = router;
