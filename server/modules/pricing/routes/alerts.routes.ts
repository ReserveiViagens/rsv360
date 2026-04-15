import { Router } from 'express';
import { alertsService } from '../services';
import { validateRequest } from '../../../../backend/src/middleware/validation';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createAlertSchema = z.object({
  body: z.object({
    competitorId: z.string(),
    alertType: z.enum(['price_drop', 'price_increase', 'availability_change', 'rate_parity_threshold']),
    threshold: z.number(),
    condition: z.enum(['above', 'below', 'equals', 'percentage_change']),
    isActive: z.boolean().default(true),
    notificationChannels: z.array(z.string()),
    metadata: z.record(z.any()).optional()
  })
});

const updateAlertSchema = z.object({
  body: z.object({
    threshold: z.number().optional(),
    condition: z.enum(['above', 'below', 'equals', 'percentage_change']).optional(),
    isActive: z.boolean().optional(),
    notificationChannels: z.array(z.string()).optional(),
    metadata: z.record(z.any()).optional()
  })
});

const processAlertsSchema = z.object({
  body: z.object({
    competitorId: z.string(),
    currentData: z.object({
      price: z.number().positive(),
      availability: z.boolean(),
      ourPrice: z.number().positive().optional()
    }),
    previousData: z.object({
      price: z.number().positive(),
      availability: z.boolean()
    }).optional()
  })
});

const bulkUpdateSchema = z.object({
  body: z.object({
    alertIds: z.array(z.string()),
    isActive: z.boolean()
  })
});

// Routes

// GET /api/pricing/alerts
router.get('/', async (req, res) => {
  try {
    const { competitorId, activeOnly } = req.query;

    const alerts = await alertsService.listAlerts(
      competitorId as string,
      activeOnly === 'true'
    );

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Error listing alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list alerts'
    });
  }
});

// POST /api/pricing/alerts
router.post('/', validateRequest(createAlertSchema), async (req, res) => {
  try {
    const alertData = req.body;
    const alert = await alertsService.createAlert(alertData);

    res.status(201).json({
      success: true,
      data: alert
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create alert'
    });
  }
});

// GET /api/pricing/alerts/:alertId
router.get('/:alertId', async (req, res) => {
  try {
    const { alertId } = req.params;
    const alert = await alertsService.getAlertById(alertId);

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }

    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    console.error('Error getting alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get alert'
    });
  }
});

// PUT /api/pricing/alerts/:alertId
router.put('/:alertId', validateRequest(updateAlertSchema), async (req, res) => {
  try {
    const { alertId } = req.params;
    const updates = req.body;

    const alert = await alertsService.updateAlert(alertId, updates);

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }

    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    console.error('Error updating alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update alert'
    });
  }
});

// DELETE /api/pricing/alerts/:alertId
router.delete('/:alertId', async (req, res) => {
  try {
    const { alertId } = req.params;
    const deleted = await alertsService.deleteAlert(alertId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }

    res.json({
      success: true,
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete alert'
    });
  }
});

// POST /api/pricing/alerts/process
router.post('/process', validateRequest(processAlertsSchema), async (req, res) => {
  try {
    const { competitorId, currentData, previousData } = req.body;

    const results = await alertsService.processAllAlertsForCompetitor(
      competitorId,
      currentData,
      previousData
    );

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error processing alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process alerts'
    });
  }
});

// GET /api/pricing/alerts/:alertId/history
router.get('/:alertId/history', async (req, res) => {
  try {
    const { alertId } = req.params;
    const { limit } = req.query;

    const history = await alertsService.getAlertHistory(
      alertId,
      limit ? parseInt(limit as string) : 50
    );

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error getting alert history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get alert history'
    });
  }
});

// POST /api/pricing/alerts/bulk-update
router.post('/bulk-update', validateRequest(bulkUpdateSchema), async (req, res) => {
  try {
    const { alertIds, isActive } = req.body;

    const updatedCount = await alertsService.bulkUpdateAlertStatus(alertIds, isActive);

    res.json({
      success: true,
      data: {
        updatedCount,
        message: `Updated ${updatedCount} alerts successfully`
      }
    });
  } catch (error) {
    console.error('Error bulk updating alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to bulk update alerts'
    });
  }
});

// GET /api/pricing/alerts/types
router.get('/types', async (req, res) => {
  try {
    const alertTypes = [
      {
        id: 'price_drop',
        name: 'Price Drop',
        description: 'Alert when competitor price drops below threshold',
        conditions: ['below', 'percentage_change']
      },
      {
        id: 'price_increase',
        name: 'Price Increase',
        description: 'Alert when competitor price increases above threshold',
        conditions: ['above', 'percentage_change']
      },
      {
        id: 'availability_change',
        name: 'Availability Change',
        description: 'Alert when competitor availability status changes',
        conditions: ['equals']
      },
      {
        id: 'rate_parity_threshold',
        name: 'Rate Parity Threshold',
        description: 'Alert when competitor price crosses parity threshold with our rates',
        conditions: ['above', 'below', 'percentage_change']
      }
    ];

    res.json({
      success: true,
      data: alertTypes
    });
  } catch (error) {
    console.error('Error getting alert types:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get alert types'
    });
  }
});

export default router;