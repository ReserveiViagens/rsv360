const express = require('express');
const router = express.Router();
const { db } = require('../../../db/drizzle');
const { properties } = require('../../../db/schema');
const { eq } = require('drizzle-orm');

// GET /api/v1/properties
router.get('/', async (req, res) => {
  try {
    const items = await db.select().from(properties).where(eq(properties.status, 'active'));
    res.json({ success: true, data: items, total: items.length });
  } catch (error) {
    console.error('[PROPERTIES] Error:', error.message);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/v1/properties/:id
router.get('/:id', async (req, res) => {
  try {
    const [item] = await db.select().from(properties).where(eq(properties.id, parseInt(req.params.id)));
    if (!item) return res.status(404).json({ success: false, error: 'Não encontrado' });
    res.json({ success: true, data: item });
  } catch (error) {
    console.error('[PROPERTIES] Error:', error.message);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

module.exports = router;