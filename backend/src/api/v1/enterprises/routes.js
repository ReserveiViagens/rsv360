// ===================================================================
// ROTAS - EMPREENDIMENTOS
// ===================================================================

const express = require('express');
const router = express.Router();
const {
  listEnterprises,
  getEnterpriseById,
  createEnterprise,
  updateEnterprise,
  deleteEnterprise,
  getEnterpriseProperties
} = require('./controller');
const { authenticateToken } = require('../../../middleware/auth');

// Listar empreendimentos (público)
router.get('/', listEnterprises);

// Obter empreendimento por ID (público)
router.get('/:id', getEnterpriseById);

// Obter propriedades do empreendimento (público)
router.get('/:id/properties', getEnterpriseProperties);

// Criar empreendimento (autenticado)
router.post('/', authenticateToken, createEnterprise);

// Atualizar empreendimento (autenticado)
router.put('/:id', authenticateToken, updateEnterprise);

// Deletar empreendimento (autenticado)
router.delete('/:id', authenticateToken, deleteEnterprise);

module.exports = router;
