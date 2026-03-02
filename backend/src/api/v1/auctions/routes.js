const express = require('express');
const router = express.Router();
const auctionsController = require('./controller');
const { authenticateToken } = require('../../../middleware/auth');

/**
 * Rotas públicas (não requerem autenticação)
 */

// Listar leilões ativos (público)
router.get('/active', auctionsController.getActive);

// Dados para mapa (id, title, lat, lng, status)
router.get('/map-data', auctionsController.getMapData);

// Listar próximos leilões (público)
router.get('/upcoming', auctionsController.getUpcoming);

// Listar leilões finalizados (público)
router.get('/finished', auctionsController.getFinished);

/**
 * Rotas autenticadas (DEVEM vir antes de /:id para não capturar path vazio)
 */

// Listar todos os leilões (com filtros) - CMS Admin
router.get('/', authenticateToken, auctionsController.list);

// Obter leilão por ID (público)
router.get('/:id', auctionsController.getById);

// Listar lances de um leilão (público)
router.get('/:id/bids', auctionsController.getBids);

// Criar novo leilão
router.post('/', authenticateToken, auctionsController.create);

// Atualizar leilão
router.put('/:id', authenticateToken, auctionsController.update);

// Deletar leilão
router.delete('/:id', authenticateToken, auctionsController.remove);

// Fazer lance em um leilão (pode ser público, mas recomendado autenticado)
router.post('/:id/bids', authenticateToken, auctionsController.placeBid);

// Finalizar leilão manualmente
router.post('/:id/finish', authenticateToken, auctionsController.finish);

// Criar reserva após leilão ganho
router.post('/:id/booking', authenticateToken, auctionsController.createBooking);

module.exports = router;
