// ===================================================================
// ROTAS - ACOMODAÇÕES
// ===================================================================

const express = require('express');
const router = express.Router();
const {
  listAccommodations,
  getAccommodationById,
  createAccommodation,
  updateAccommodation,
  deleteAccommodation,
  checkAvailability
} = require('./controller');
const { authenticateToken } = require('../../../middleware/auth');

// Listar acomodações (público)
router.get('/', listAccommodations);

// Obter acomodação por ID (público)
router.get('/:id', getAccommodationById);

// Verificar disponibilidade (público)
router.get('/:id/availability', checkAvailability);

// Criar acomodação (autenticado)
router.post('/', authenticateToken, createAccommodation);

// Atualizar acomodação (autenticado)
router.put('/:id', authenticateToken, updateAccommodation);

// Deletar acomodação (autenticado)
router.delete('/:id', authenticateToken, deleteAccommodation);

module.exports = router;
