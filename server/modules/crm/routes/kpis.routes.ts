import { Router } from 'express';
import { crmRepository } from '../db/crm.repository';
import { crmKpisService } from '../services';

const router = Router();

router.get('/dashboard', async (req, res) => {
  res.json({ success: true, data: await crmKpisService.getDashboard(Number(req.query.userId || 1)) });
});

router.get('/lifecycle', async (req, res) => {
  const kpis = await crmRepository.getDashboardKPIs(Number(req.query.userId || 1));
  res.json({
    success: true,
    data: {
      prospect: kpis.lc_prospect,
      first_stay: kpis.lc_first_stay,
      repeat: kpis.lc_repeat,
      loyal: kpis.lc_loyal,
      advocate: kpis.lc_advocate,
      at_risk: kpis.lc_at_risk,
      lost: kpis.lc_lost,
    },
  });
});

router.get('/tiers', async (req, res) => {
  const kpis = await crmRepository.getDashboardKPIs(Number(req.query.userId || 1));
  res.json({
    success: true,
    data: {
      Bronze: kpis.tier_bronze,
      Prata: kpis.tier_prata,
      Ouro: kpis.tier_ouro,
      Diamante: kpis.tier_diamante,
    },
  });
});

router.get('/top-guests', async (req, res) => {
  const kpis = await crmRepository.getDashboardKPIs(Number(req.query.userId || 1));
  res.json({ success: true, data: kpis.top_guests || [] });
});

export default router;
