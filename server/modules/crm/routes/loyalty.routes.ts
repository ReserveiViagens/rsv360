import { Router } from 'express';
import { crmRepository } from '../db/crm.repository';
import { loyaltyService } from '../services';

const router = Router();

router.get('/program', async (req, res) => {
  res.json({ success: true, data: await loyaltyService.getProgram(Number(req.query.userId || 1)) });
});

router.post('/program', async (req, res) => {
  res.json({ success: true, data: await loyaltyService.configureProgram(Number(req.body.userId || req.body.user_id || 1), req.body) });
});

router.get('/members', async (req, res) => {
  res.json({ success: true, data: await loyaltyService.listMembers(req.query, req.query.page ? Number(req.query.page) : 1, req.query.limit ? Number(req.query.limit) : 20) });
});

router.get('/members/:id', async (req, res) => {
  const member = await crmRepository.getMember(Number(req.params.id));
  if (!member) return res.status(404).json({ success: false, error: 'Membro não encontrado' });
  res.json({ success: true, data: member });
});

router.post('/members', async (req, res) => {
  const member = await loyaltyService.enrollMember(Number(req.body.guestProfileId), Number(req.body.userId || 1));
  res.status(201).json({ success: true, data: member });
});

router.post('/members/:id/earn', async (req, res) => {
  res.json({ success: true, data: await loyaltyService.earnPoints(Number(req.params.id), Number(req.body.amount), req.body.bookingId ? Number(req.body.bookingId) : undefined, req.body.description) });
});

router.post('/members/:id/redeem', async (req, res) => {
  res.json({ success: true, data: await loyaltyService.redeemPoints(Number(req.params.id), Number(req.body.points), String(req.body.description || 'Resgate de pontos')) });
});

router.post('/members/:id/bonus', async (req, res) => {
  res.json({ success: true, data: await loyaltyService.grantBonus(Number(req.params.id), Number(req.body.points), String(req.body.description || 'Bônus de pontos')) });
});

router.get('/members/:id/statement', async (req, res) => {
  res.json({ success: true, data: await loyaltyService.getStatement(Number(req.params.id), req.query.startDate as string | undefined, req.query.endDate as string | undefined) });
});

router.post('/expire', async (_req, res) => {
  res.json({ success: true, data: await loyaltyService.expirePoints() });
});

router.get('/tiers', async (_req, res) => {
  const program = await loyaltyService.getProgram(1);
  const members = await loyaltyService.listMembers({}, 1, 9999);
  const tiers = (program?.tiers || []).map((tier: any) => ({
    ...tier,
    memberCount: members.data.filter((member) => member.tier === tier.name).length,
  }));
  res.json({ success: true, data: tiers });
});

router.get('/stats', async (req, res) => {
  const kpis = await crmRepository.getDashboardKPIs(Number(req.query.userId || 1));
  res.json({
    success: true,
    data: {
      loyalty_members: kpis.loyalty_members,
      points_in_circulation: kpis.points_circulation,
      tier_distribution: {
        Bronze: kpis.tier_bronze,
        Prata: kpis.tier_prata,
        Ouro: kpis.tier_ouro,
        Diamante: kpis.tier_diamante,
      },
    },
  });
});

export default router;
