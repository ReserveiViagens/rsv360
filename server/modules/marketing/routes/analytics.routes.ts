import { Router, Request, Response } from 'express';
import {
  getDashboardOverview,
  getCampaignPerformance,
  getChannelBreakdown,
  getTimeSeriesMetrics,
  getPixelEventsSummary,
  getAttributionReport,
  getFunnelAnalytics,
  getCreativePerformance,
} from '../services/analytics.service';

const router = Router();

// GET /dashboard - KPIs do dashboard
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const result = await getDashboardOverview({
      startDate: startDate as string,
      endDate: endDate as string,
    });
    res.json(result);
  } catch (error) {
    console.error('Error getting dashboard overview:', error);
    res.status(500).json({ error: 'Failed to get dashboard overview' });
  }
});

// GET /campaigns/:campaignId - Performance de uma campanha
router.get('/campaigns/:campaignId', async (req: Request, res: Response) => {
  try {
    const result = await getCampaignPerformance(req.params.campaignId as string);
    res.json(result);
  } catch (error) {
    console.error('Error getting campaign performance:', error);
    res.status(500).json({ error: 'Failed to get campaign performance' });
  }
});

// GET /channels - Breakdown por canal
router.get('/channels', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const result = await getChannelBreakdown({
      startDate: startDate as string,
      endDate: endDate as string,
    });
    res.json(result);
  } catch (error) {
    console.error('Error getting channel breakdown:', error);
    res.status(500).json({ error: 'Failed to get channel breakdown' });
  }
});

// GET /timeseries - Métricas em série temporal
router.get('/timeseries', async (req: Request, res: Response) => {
  try {
    const { metric, startDate, endDate, granularity } = req.query;
    if (!metric) {
      return res.status(400).json({ error: 'Metric parameter is required' });
    }
    const result = await getTimeSeriesMetrics(metric as string, {
      startDate: startDate as string,
      endDate: endDate as string,
      granularity: granularity as 'day' | 'week' | 'month',
    });
    res.json(result);
  } catch (error) {
    console.error('Error getting time series metrics:', error);
    res.status(500).json({ error: 'Failed to get time series metrics' });
  }
});

// GET /pixel-events - Resumo de pixel events
router.get('/pixel-events', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, eventType } = req.query;
    const result = await getPixelEventsSummary({
      startDate: startDate as string,
      endDate: endDate as string,
      eventType: eventType as string,
    });
    res.json(result);
  } catch (error) {
    console.error('Error getting pixel events summary:', error);
    res.status(500).json({ error: 'Failed to get pixel events summary' });
  }
});

// GET /attribution - Relatório de atribuição
router.get('/attribution', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, model } = req.query;
    const result = await getAttributionReport({
      startDate: startDate as string,
      endDate: endDate as string,
      model: model as string,
    });
    res.json(result);
  } catch (error) {
    console.error('Error getting attribution report:', error);
    res.status(500).json({ error: 'Failed to get attribution report' });
  }
});

// GET /funnels/:funnelId - Analytics de um funil
router.get('/funnels/:funnelId', async (req: Request, res: Response) => {
  try {
    const result = await getFunnelAnalytics(req.params.funnelId as string);
    res.json(result);
  } catch (error) {
    console.error('Error getting funnel analytics:', error);
    res.status(500).json({ error: 'Failed to get funnel analytics' });
  }
});

// GET /creatives - Performance de criativos
router.get('/creatives', async (req: Request, res: Response) => {
  try {
    const { campaignId, page, limit } = req.query;
    const result = await getCreativePerformance({
      campaignId: campaignId as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json(result);
  } catch (error) {
    console.error('Error getting creative performance:', error);
    res.status(500).json({ error: 'Failed to get creative performance' });
  }
});

export default router;