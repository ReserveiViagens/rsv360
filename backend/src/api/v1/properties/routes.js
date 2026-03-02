// ===================================================================
// ROTAS - PROPRIEDADES
// ===================================================================

const express = require('express');
const router = express.Router();
const {
  listProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getPropertyAccommodations
} = require('./controller');
const { authenticateToken } = require('../../../middleware/auth');

// Listar propriedades (público)
router.get('/', listProperties);

// Obter propriedade por ID (público)
router.get('/:id', getPropertyById);

// Obter acomodações da propriedade (público)
router.get('/:id/accommodations', getPropertyAccommodations);

// Criar propriedade (autenticado)
router.post('/', authenticateToken, createProperty);

// Atualizar propriedade (autenticado)
router.put('/:id', authenticateToken, updateProperty);

// Deletar propriedade (autenticado)
router.delete('/:id', authenticateToken, deleteProperty);

module.exports = router;
