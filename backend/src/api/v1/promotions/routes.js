const express = require('express');
const router = express.Router();
const { db } = require('../../../db/drizzle');
const { promotions } = require('../../../db/schema');
const { eq } = require('drizzle-orm');

// GET /api/v1/promotions
router.get('/', async (req, res) => {
  try {
    const items = await db.select().from(promotions).where(eq(promotions.isActive, true));
    res.json({ success: true, data: items, total: items.length });
  } catch (error) {
    console.error('[PROMOTIONS] Error:', error.message);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/v1/promotions/:id
router.get('/:id', async (req, res) => {
  try {
    const [item] = await db.select().from(promotions).where(eq(promotions.id, parseInt(req.params.id)));
    if (!item) return res.status(404).json({ success: false, error: 'Não encontrado' });
    res.json({ success: true, data: item });
  } catch (error) {
    console.error('[PROMOTIONS] Error:', error.message);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

module.exports = router;