import { Router } from 'express';
import { authenticateJwt, requireRole } from '../../../middleware/auth.middleware';
import {
  comissoesAprovarSugestaoSchema,
  comissoesConfigSchema,
  comissoesRejeitarSugestaoSchema,
  comissoesSolicitarAprovacaoSchema,
  comissoesSugestaoIaSchema,
} from '../schema';
import { comissoesService } from '../services/comissoes.service';
import { sugerirPercentuaisComissoes } from '../services/comissoes-ia-suggest';

const router = Router();

const parceiroAuth = [authenticateJwt, requireRole('anfitriao', 'corretor', 'admin', 'manager')];
const adminAuth = [authenticateJwt, requireRole('admin')];

router.get('/health', (_req, res) => {
  res.json({ module: 'comissoes', status: 'ok' });
});

router.get('/minhas-comissoes', ...parceiroAuth, async (req, res) => {
  try {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 20);
    const data = await comissoesService.listarMinhas(req.user!.id, page, pageSize);
    const config = await comissoesService.getConfig();
    res.json({
      success: true,
      data: {
        ...data,
        moduloAtivo: config.comissoesModuloAtivo,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.get('/config', ...adminAuth, async (_req, res) => {
  try {
    const data = await comissoesService.getConfig();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.put('/config', ...adminAuth, async (req, res) => {
  try {
    const atual = await comissoesService.getConfig();
    const body = req.body ?? {};
    const parsed = comissoesConfigSchema.safeParse({
      comissoesModuloAtivo: body.comissoesModuloAtivo ?? atual.comissoesModuloAtivo,
      taxaPlataformaPct: body.taxaPlataformaPct ?? atual.taxaPlataformaPct,
      taxaCorretorPct: body.taxaCorretorPct ?? atual.taxaCorretorPct,
    });
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.flatten() });
    }
    if (body.fonte === 'ia') {
      return res.status(400).json({
        success: false,
        error:
          'Alterações via IA devem passar por solicitar-aprovacao e aprovar-sugestao (governança em duas etapas).',
      });
    }
    const data = await comissoesService.salvarConfig(parsed.data, { fonte: 'manual' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.post('/sugerir-percentuais', ...adminAuth, async (req, res) => {
  try {
    const parsed = comissoesSugestaoIaSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.flatten() });
    }
    const sugestao = await sugerirPercentuaisComissoes(parsed.data);
    res.json({ success: true, data: sugestao });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/solicitar-aprovacao', ...adminAuth, async (req, res) => {
  try {
    const parsed = comissoesSolicitarAprovacaoSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.flatten() });
    }
    const data = await comissoesService.solicitarAprovacao(parsed.data, req.user!.id);
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.post('/aprovar-sugestao', ...adminAuth, async (req, res) => {
  try {
    const parsed = comissoesAprovarSugestaoSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.flatten() });
    }
    const data = await comissoesService.aprovarSugestao(req.user!.id, parsed.data);
    res.json({ success: true, data });
  } catch (error) {
    const msg = (error as Error).message;
    const status = msg.includes('outro administrador') ? 403 : 400;
    res.status(status).json({ success: false, error: msg });
  }
});

router.post('/rejeitar-sugestao', ...adminAuth, async (req, res) => {
  try {
    const parsed = comissoesRejeitarSugestaoSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.flatten() });
    }
    const data = await comissoesService.rejeitarSugestao(req.user!.id, parsed.data.motivo);
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

export default router;
module.exports = router;
