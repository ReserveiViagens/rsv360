const express = require('express');
const router = express.Router();
const { db } = require('../../../db/drizzle');
const { parks } = require('../../../db/schema');
const { eq } = require('drizzle-orm');

// GET /api/v1/parks
router.get('/', async (req, res) => {
  try {
    const items = await db.select().from(parks).where(eq(parks.isActive, true));
    res.json({ success: true, data: items, total: items.length });
  } catch (error) {
    console.error('[PARKS] Error:', error.message);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/v1/parks/:id
router.get('/:id', async (req, res) => {
  try {
    const [item] = await db.select().from(parks).where(eq(parks.id, parseInt(req.params.id)));
    if (!item) return res.status(404).json({ success: false, error: 'Não encontrado' });
    res.json({ success: true, data: item });
  } catch (error) {
    console.error('[PARKS] Error:', error.message);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

module.exports = router;