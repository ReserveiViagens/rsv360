import { Router } from 'express';
import { DisputeService } from '../services/dispute.service';
import { DisputeEvidenceSchema, DisputeUpdateSchema } from '../schemas/dispute-write.schema';
import { parsePaymentUuidParam } from '../schemas/params.schema';
import { badRequest as badRequestShared } from '../../../../../server/lib/bad-request';

const router = Router();
const disputeService = new DisputeService();

function badRequest(res: import('express').Response, error: unknown) {
  return badRequestShared(res, error, { nonZodStatus: 500 });
}

router.get('/', async (req, res) => {
  try {
    const result = await disputeService.listDisputes();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const result = await disputeService.getDisputeStats();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parsePaymentUuidParam(req.params.id);
    const result = await disputeService.getDispute(id);
    if (!result) return res.status(404).json({ error: 'Dispute not found' });
    res.json(result);
  } catch (error) {
    return badRequest(res, error);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = parsePaymentUuidParam(req.params.id);
    const data = DisputeUpdateSchema.parse(req.body);
    const { amount, ...rest } = data;
    const patch = {
      ...rest,
      ...(amount !== undefined ? { amount: String(amount) } : {}),
    };
    const result = await disputeService.updateDispute(id, patch);
    res.json(result);
  } catch (error) {
    return badRequest(res, error);
  }
});

router.post('/:id/evidence', async (req, res) => {
  try {
    const id = parsePaymentUuidParam(req.params.id);
    const { evidence } = DisputeEvidenceSchema.parse(req.body);
    await disputeService.submitEvidence(id, evidence);
    res.json({ message: 'Evidence submitted' });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.post('/:id/accept', async (req, res) => {
  try {
    const id = parsePaymentUuidParam(req.params.id);
    await disputeService.acceptDispute(id);
    res.json({ message: 'Dispute accepted' });
  } catch (error) {
    return badRequest(res, error);
  }
});

export default router;
