import { Router } from 'express';
import { competitorService } from '../services';
import { validateRequest } from '../../../../backend/src/middleware/validation';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createCompetitorSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    location: z.string().min(1),
    starRating: z.number().min(1).max(5).optional(),
    amenities: z.array(z.string()).optional(),
    contactInfo: z.object({
      phone: z.string().optional(),
      email: z.string().email().optional(),
      website: z.string().url().optional()
    }).optional(),
    metadata: z.record(z.any()).optional()
  })
});

const updateCompetitorSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    location: z.string().min(1).optional(),
    starRating: z.number().min(1).max(5).optional(),
    amenities: z.array(z.string()).optional(),
    contactInfo: z.object({
      phone: z.string().optional(),
      email: z.string().email().optional(),
      website: z.string().url().optional()
    }).optional(),
    metadata: z.record(z.any()).optional()
  })
});

const competitorComparisonSchema = z.object({
  body: z.object({
    competitorIds: z.array(z.string()),
    checkIn: z.string().datetime(),
    checkOut: z.string().datetime(),
    ourPrice: z.number().positive().optional()
  })
});

const rateParitySchema = z.object({
  body: z.object({
    checkIn: z.string().datetime(),
    checkOut: z.string().datetime(),
    ourPrice: z.number().positive()
  })
});

// Routes

// GET /api/pricing/competitors
router.get('/', async (req, res) => {
  try {
    const { location, starRating, limit, offset } = req.query;

    const competitors = await competitorService.listCompetitors({
      location: location as string,
      starRating: starRating ? parseFloat(starRating as string) : undefined,
      limit: limit ? parseInt(limit as string) : 50,
      offset: offset ? parseInt(offset as string) : 0
    });

    res.json({
      success: true,
      data: competitors
    });
  } catch (error) {
    console.error('Error listing competitors:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list competitors'
    });
  }
});

// POST /api/pricing/competitors
router.post('/', validateRequest(createCompetitorSchema), async (req, res) => {
  try {
    const competitorData = req.body;
    const competitor = await competitorService.createCompetitor(competitorData);

    res.status(201).json({
      success: true,
      data: competitor
    });
  } catch (error) {
    console.error('Error creating competitor:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create competitor'
    });
  }
});

// GET /api/pricing/competitors/:competitorId
router.get('/:competitorId', async (req, res) => {
  try {
    const { competitorId } = req.params;
    const competitor = await competitorService.getCompetitorById(competitorId);

    if (!competitor) {
      return res.status(404).json({
        success: false,
        error: 'Competitor not found'
      });
    }

    res.json({
      success: true,
      data: competitor
    });
  } catch (error) {
    console.error('Error getting competitor:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get competitor'
    });
  }
});

// PUT /api/pricing/competitors/:competitorId
router.put('/:competitorId', validateRequest(updateCompetitorSchema), async (req, res) => {
  try {
    const { competitorId } = req.params;
    const updates = req.body;

    const competitor = await competitorService.updateCompetitor(competitorId, updates);

    if (!competitor) {
      return res.status(404).json({
        success: false,
        error: 'Competitor not found'
      });
    }

    res.json({
      success: true,
      data: competitor
    });
  } catch (error) {
    console.error('Error updating competitor:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update competitor'
    });
  }
});

// DELETE /api/pricing/competitors/:competitorId
router.delete('/:competitorId', async (req, res) => {
  try {
    const { competitorId } = req.params;
    const deleted = await competitorService.deleteCompetitor(competitorId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Competitor not found'
      });
    }

    res.json({
      success: true,
      message: 'Competitor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting competitor:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete competitor'
    });
  }
});

// GET /api/pricing/competitors/:competitorId/rates
router.get('/:competitorId/rates', async (req, res) => {
  try {
    const { competitorId } = req.params;
    const { platform, limit, offset } = req.query;

    const rates = await competitorService.getCompetitorRates(competitorId, {
      platform: platform as string,
      limit: limit ? parseInt(limit as string) : 50,
      offset: offset ? parseInt(offset as string) : 0
    });

    res.json({
      success: true,
      data: rates
    });
  } catch (error) {
    console.error('Error getting competitor rates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get competitor rates'
    });
  }
});

// POST /api/pricing/competitors/compare
router.post('/compare', validateRequest(competitorComparisonSchema), async (req, res) => {
  try {
    const { competitorIds, checkIn, checkOut, ourPrice } = req.body;

    const comparison = await competitorService.getCompetitorComparison(
      competitorIds,
      new Date(checkIn),
      new Date(checkOut),
      ourPrice
    );

    res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('Error comparing competitors:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to compare competitors'
    });
  }
});

// POST /api/pricing/competitors/:competitorId/rate-parity
router.post('/:competitorId/rate-parity', validateRequest(rateParitySchema), async (req, res) => {
  try {
    const { competitorId } = req.params;
    const { checkIn, checkOut, ourPrice } = req.body;

    const report = await competitorService.getRateParityReport(
      competitorId,
      new Date(checkIn),
      new Date(checkOut),
      ourPrice
    );

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error generating rate parity report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate rate parity report'
    });
  }
});

export default router;