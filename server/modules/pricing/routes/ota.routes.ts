import { Router } from 'express';
import { otaScraperService } from '../services';
import { validateRequest } from '../../../../backend/src/middleware/validation';
import { z } from 'zod';

const router = Router();

// Validation schemas
const scrapePlatformSchema = z.object({
  body: z.object({
    competitorId: z.string(),
    checkIn: z.string().datetime(),
    checkOut: z.string().datetime()
  })
});

const scrapeAllSchema = z.object({
  body: z.object({
    competitorId: z.string(),
    checkIn: z.string().datetime(),
    checkOut: z.string().datetime()
  })
});

// Routes

// POST /api/pricing/ota/scrape/booking
router.post('/scrape/booking', validateRequest(scrapePlatformSchema), async (req, res) => {
  try {
    const { competitorId, checkIn, checkOut } = req.body;

    const rate = await otaScraperService.scrapeBooking(competitorId, checkIn, checkOut);

    res.json({
      success: true,
      data: rate
    });
  } catch (error) {
    console.error('Error scraping Booking:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to scrape Booking'
    });
  }
});

// POST /api/pricing/ota/scrape/expedia
router.post('/scrape/expedia', validateRequest(scrapePlatformSchema), async (req, res) => {
  try {
    const { competitorId, checkIn, checkOut } = req.body;

    const rate = await otaScraperService.scrapeExpedia(competitorId, checkIn, checkOut);

    res.json({
      success: true,
      data: rate
    });
  } catch (error) {
    console.error('Error scraping Expedia:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to scrape Expedia'
    });
  }
});

// POST /api/pricing/ota/scrape/airbnb
router.post('/scrape/airbnb', validateRequest(scrapePlatformSchema), async (req, res) => {
  try {
    const { competitorId, checkIn, checkOut } = req.body;

    const rate = await otaScraperService.scrapeAirbnb(competitorId, checkIn, checkOut);

    res.json({
      success: true,
      data: rate
    });
  } catch (error) {
    console.error('Error scraping Airbnb:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to scrape Airbnb'
    });
  }
});

// POST /api/pricing/ota/scrape/decolar
router.post('/scrape/decolar', validateRequest(scrapePlatformSchema), async (req, res) => {
  try {
    const { competitorId, checkIn, checkOut } = req.body;

    const rate = await otaScraperService.scrapeDecolar(competitorId, checkIn, checkOut);

    res.json({
      success: true,
      data: rate
    });
  } catch (error) {
    console.error('Error scraping Decolar:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to scrape Decolar'
    });
  }
});

// POST /api/pricing/ota/scrape/hotels-com
router.post('/scrape/hotels-com', validateRequest(scrapePlatformSchema), async (req, res) => {
  try {
    const { competitorId, checkIn, checkOut } = req.body;

    const rate = await otaScraperService.scrapeHotelsCom(competitorId, checkIn, checkOut);

    res.json({
      success: true,
      data: rate
    });
  } catch (error) {
    console.error('Error scraping Hotels.com:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to scrape Hotels.com'
    });
  }
});

// POST /api/pricing/ota/scrape/trivago
router.post('/scrape/trivago', validateRequest(scrapePlatformSchema), async (req, res) => {
  try {
    const { competitorId, checkIn, checkOut } = req.body;

    const rate = await otaScraperService.scrapeTrivago(competitorId, checkIn, checkOut);

    res.json({
      success: true,
      data: rate
    });
  } catch (error) {
    console.error('Error scraping Trivago:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to scrape Trivago'
    });
  }
});

// POST /api/pricing/ota/scrape/kayak
router.post('/scrape/kayak', validateRequest(scrapePlatformSchema), async (req, res) => {
  try {
    const { competitorId, checkIn, checkOut } = req.body;

    const rate = await otaScraperService.scrapeKayak(competitorId, checkIn, checkOut);

    res.json({
      success: true,
      data: rate
    });
  } catch (error) {
    console.error('Error scraping Kayak:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to scrape Kayak'
    });
  }
});

// POST /api/pricing/ota/scrape/google-hotels
router.post('/scrape/google-hotels', validateRequest(scrapePlatformSchema), async (req, res) => {
  try {
    const { competitorId, checkIn, checkOut } = req.body;

    const rate = await otaScraperService.scrapeGoogleHotels(competitorId, checkIn, checkOut);

    res.json({
      success: true,
      data: rate
    });
  } catch (error) {
    console.error('Error scraping Google Hotels:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to scrape Google Hotels'
    });
  }
});

// POST /api/pricing/ota/scrape-all
router.post('/scrape-all', validateRequest(scrapeAllSchema), async (req, res) => {
  try {
    const { competitorId, checkIn, checkOut } = req.body;

    const result = await otaScraperService.scrapeAllPlatforms(competitorId, checkIn, checkOut);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error scraping all platforms:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to scrape all platforms'
    });
  }
});

// GET /api/pricing/ota/platforms
router.get('/platforms', async (req, res) => {
  try {
    const platforms = [
      { id: 'booking', name: 'Booking.com', description: 'Major European OTA' },
      { id: 'expedia', name: 'Expedia', description: 'Global travel booking platform' },
      { id: 'airbnb', name: 'Airbnb', description: 'Vacation rental platform' },
      { id: 'decolar', name: 'Decolar', description: 'Latin American travel platform' },
      { id: 'hotels_com', name: 'Hotels.com', description: 'Hotels.com booking platform' },
      { id: 'trivago', name: 'Trivago', description: 'Hotel metasearch engine' },
      { id: 'kayak', name: 'Kayak', description: 'Travel search and booking platform' },
      { id: 'google_hotels', name: 'Google Hotels', description: 'Google\'s hotel booking service' }
    ];

    res.json({
      success: true,
      data: platforms
    });
  } catch (error) {
    console.error('Error getting platforms:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get platforms'
    });
  }
});

export default router;