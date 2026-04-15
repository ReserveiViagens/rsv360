import { Router } from 'express';
import { pricingEngineService } from '../services';
import { validateRequest } from '../../../../backend/src/middleware/validation';
import { z } from 'zod';

const router = Router();

// Validation schemas
const calculatePriceSchema = z.object({
  body: z.object({
    basePrice: z.number().positive(),
    accommodationId: z.string(),
    checkIn: z.string().datetime(),
    checkOut: z.string().datetime(),
    guestCount: z.number().int().positive().optional(),
    specialRequests: z.array(z.string()).optional()
  })
});

const bulkCalculateSchema = z.object({
  body: z.object({
    calculations: z.array(z.object({
      basePrice: z.number().positive(),
      accommodationId: z.string(),
      checkIn: z.string().datetime(),
      checkOut: z.string().datetime(),
      guestCount: z.number().int().positive().optional(),
      specialRequests: z.array(z.string()).optional()
    }))
  })
});

const createRuleSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    type: z.enum(['seasonal', 'demand', 'promotional', 'loyalty']),
    priority: z.number().int().min(1).max(100),
    conditions: z.object({
      dateRange: z.object({
        start: z.string().datetime(),
        end: z.string().datetime()
      }).optional(),
      appliesToAccommodations: z.array(z.string()).optional(),
      minStay: z.number().int().positive().optional(),
      maxStay: z.number().int().positive().optional(),
      guestCount: z.number().int().positive().optional()
    }),
    adjustments: z.object({
      percentage: z.number().optional(),
      fixedAmount: z.number().optional(),
      minPrice: z.number().positive().optional(),
      maxPrice: z.number().positive().optional()
    }),
    isActive: z.boolean().default(true),
    metadata: z.record(z.any()).optional()
  })
});

const updateRuleSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    priority: z.number().int().min(1).max(100).optional(),
    conditions: z.object({
      dateRange: z.object({
        start: z.string().datetime(),
        end: z.string().datetime()
      }).optional(),
      appliesToAccommodations: z.array(z.string()).optional(),
      minStay: z.number().int().positive().optional(),
      maxStay: z.number().int().positive().optional(),
      guestCount: z.number().int().positive().optional()
    }).optional(),
    adjustments: z.object({
      percentage: z.number().optional(),
      fixedAmount: z.number().optional(),
      minPrice: z.number().positive().optional(),
      maxPrice: z.number().positive().optional()
    }).optional(),
    isActive: z.boolean().optional(),
    metadata: z.record(z.any()).optional()
  })
});

// Routes

// POST /api/pricing/calculate
router.post('/calculate', validateRequest(calculatePriceSchema), async (req, res) => {
  try {
    const { basePrice, accommodationId, checkIn, checkOut, guestCount, specialRequests } = req.body;

    const result = await pricingEngineService.calculatePrice({
      basePrice,
      accommodationId,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      guestCount,
      specialRequests
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error calculating price:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate price'
    });
  }
});

// POST /api/pricing/bulk-calculate
router.post('/bulk-calculate', validateRequest(bulkCalculateSchema), async (req, res) => {
  try {
    const { calculations } = req.body;

    const results = await pricingEngineService.bulkCalculatePrices(
      calculations.map(calc => ({
        ...calc,
        checkIn: new Date(calc.checkIn),
        checkOut: new Date(calc.checkOut)
      }))
    );

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error bulk calculating prices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to bulk calculate prices'
    });
  }
});

// GET /api/pricing/rules
router.get('/rules', async (req, res) => {
  try {
    const { accommodationId, activeOnly } = req.query;

    const rules = await pricingEngineService.listRules({
      accommodationId: accommodationId as string,
      activeOnly: activeOnly === 'true'
    });

    res.json({
      success: true,
      data: rules
    });
  } catch (error) {
    console.error('Error listing rules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list rules'
    });
  }
});

// POST /api/pricing/rules
router.post('/rules', validateRequest(createRuleSchema), async (req, res) => {
  try {
    const ruleData = req.body;
    const rule = await pricingEngineService.createRule(ruleData);

    res.status(201).json({
      success: true,
      data: rule
    });
  } catch (error) {
    console.error('Error creating rule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create rule'
    });
  }
});

// GET /api/pricing/rules/:ruleId
router.get('/rules/:ruleId', async (req, res) => {
  try {
    const { ruleId } = req.params;
    const rule = await pricingEngineService.getRuleById(ruleId);

    if (!rule) {
      return res.status(404).json({
        success: false,
        error: 'Rule not found'
      });
    }

    res.json({
      success: true,
      data: rule
    });
  } catch (error) {
    console.error('Error getting rule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get rule'
    });
  }
});

// PUT /api/pricing/rules/:ruleId
router.put('/rules/:ruleId', validateRequest(updateRuleSchema), async (req, res) => {
  try {
    const { ruleId } = req.params;
    const updates = req.body;

    const rule = await pricingEngineService.updateRule(ruleId, updates);

    if (!rule) {
      return res.status(404).json({
        success: false,
        error: 'Rule not found'
      });
    }

    res.json({
      success: true,
      data: rule
    });
  } catch (error) {
    console.error('Error updating rule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update rule'
    });
  }
});

// DELETE /api/pricing/rules/:ruleId
router.delete('/rules/:ruleId', async (req, res) => {
  try {
    const { ruleId } = req.params;
    const deleted = await pricingEngineService.deleteRule(ruleId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Rule not found'
      });
    }

    res.json({
      success: true,
      message: 'Rule deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting rule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete rule'
    });
  }
});

// GET /api/pricing/seasons
router.get('/seasons', async (req, res) => {
  try {
    const { activeOnly } = req.query;
    const seasons = await pricingEngineService.listSeasons(activeOnly === 'true');

    res.json({
      success: true,
      data: seasons
    });
  } catch (error) {
    console.error('Error listing seasons:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list seasons'
    });
  }
});

// GET /api/pricing/history
router.get('/history', async (req, res) => {
  try {
    const { accommodationId, limit, offset } = req.query;

    const history = await pricingEngineService.getPriceHistory({
      accommodationId: accommodationId as string,
      limit: limit ? parseInt(limit as string) : 50,
      offset: offset ? parseInt(offset as string) : 0
    });

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error getting price history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get price history'
    });
  }
});

export default router;