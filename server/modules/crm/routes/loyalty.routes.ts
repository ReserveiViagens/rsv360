import { Router, type Response } from 'express';
import { ZodError } from 'zod';
import { crmRepository } from '../db/crm.repository';
import { loyaltyService } from '../services';
import {
  LoyaltyBonusSchema,
  LoyaltyEarnSchema,
  LoyaltyEnrollSchema,
  LoyaltyProgramWriteSchema,
  LoyaltyRedeemSchema,
  parsePositiveIntId,
} from '../schemas/crm-write.schema';

const router = Router();

function badRequest(res: Response, error: unknown) {
  if (error instanceof ZodError) {
    return res.status(400).json({ success: false, error: 'Validation failed', details: error.flatten() });
  }
  return res.status(400).json({ success: false, error: (error as Error).message });
}

router.get('/program', async (req, res) => {
  res.json({ success: true, data: await loyaltyService.getProgram(Number(req.query.userId || 1)) });
});

router.post('/program', async (req, res) => {
  try {
    const body = LoyaltyProgramWriteSchema.parse(req.body);
    const userId = Number(body.userId || body.user_id || 1);
    res.json({ success: true, data: await loyaltyService.configureProgram(userId, body) });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.get('/members', async (req, res) => {
  res.json({
    success: true,
    data: await loyaltyService.listMembers(
      req.query,
      req.query.page ? Number(req.query.page) : 1,
      req.query.limit ? Number(req.query.limit) : 20,
    ),
  });
});

router.get('/members/:id', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const member = await crmRepository.getMember(id);
    if (!member) return res.status(404).json({ success: false, error: 'Membro não encontrado' });
    res.json({ success: true, data: member });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.post('/members', async (req, res) => {
  try {
    const body = LoyaltyEnrollSchema.parse(req.body);
    const member = await loyaltyService.enrollMember(body.guestProfileId, Number(body.userId || 1));
    res.status(201).json({ success: true, data: member });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.post('/members/:id/earn', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const body = LoyaltyEarnSchema.parse(req.body);
    res.json({
      success: true,
      data: await loyaltyService.earnPoints(id, body.amount, body.bookingId, body.description),
    });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.post('/members/:id/redeem', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const body = LoyaltyRedeemSchema.parse(req.body);
    res.json({
      success: true,
      data: await loyaltyService.redeemPoints(id, body.points, String(body.description || 'Resgate de pontos')),
    });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.post('/members/:id/bonus', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const body = LoyaltyBonusSchema.parse(req.body);
    res.json({
      success: true,
      data: await loyaltyService.grantBonus(id, body.points, String(body.description || 'Bônus de pontos')),
    });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.get('/members/:id/statement', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    res.json({
      success: true,
      data: await loyaltyService.getStatement(
        id,
        req.query.startDate as string | undefined,
        req.query.endDate as string | undefined,
      ),
    });
  } catch (error) {
    return badRequest(res, error);
  }
});

/** SKIP body: expire has no req.body mass-assignment surface. */
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
