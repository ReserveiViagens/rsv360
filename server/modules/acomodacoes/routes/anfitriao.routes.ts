import { Router, type Request } from 'express';
import { authenticateJwt, requireRole } from '../../../middleware/auth.middleware';
import { normalizarListaDatas } from '../services/anfitriao-bulk.util';
import { anfitriaoService } from '../services/anfitriao.service';

const router = Router();

const parceiroAuth = [authenticateJwt, requireRole('anfitriao', 'corretor', 'admin', 'manager')];
const staffAprovacao = [authenticateJwt, requireRole('admin', 'manager')];

function authFromReq(req: Request) {
  return { userId: req.user!.id, role: req.user!.role ?? 'user' };
}

router.get('/dashboard', ...parceiroAuth, async (req, res) => {
  try {
    const data = await anfitriaoService.dashboardKpis(authFromReq(req));
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.get('/minhas', ...parceiroAuth, async (req, res) => {
  try {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 20);
    const data = await anfitriaoService.listarMinhas(authFromReq(req), page, pageSize);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.get('/unidades/:id', ...parceiroAuth, async (req, res) => {
  try {
    const result = await anfitriaoService.obterUnidade(authFromReq(req), Number(req.params.id));
    if ('error' in result) {
      if (result.error === 'forbidden') {
        return res.status(403).json({ success: false, error: 'Acesso negado' });
      }
      return res.status(404).json({ success: false, error: 'Unidade não encontrada' });
    }
    res.json({ success: true, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.patch('/unidades/:id', ...parceiroAuth, async (req, res) => {
  try {
    const result = await anfitriaoService.atualizarUnidade(
      authFromReq(req),
      Number(req.params.id),
      req.body ?? {},
    );
    if (result.error === 'forbidden') {
      return res.status(403).json({ success: false, error: 'Acesso negado' });
    }
    if (result.error === 'not_found') {
      return res.status(404).json({ success: false, error: 'Unidade não encontrada' });
    }
    res.json({ success: true, data: result.data });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.post('/unidades/:id/enviar-aprovacao', ...parceiroAuth, async (req, res) => {
  try {
    const result = await anfitriaoService.enviarAprovacao(authFromReq(req), Number(req.params.id));
    if (result.error === 'forbidden') {
      return res.status(403).json({ success: false, error: 'Acesso negado' });
    }
    if (result.error === 'not_found') {
      return res.status(404).json({ success: false, error: 'Unidade não encontrada' });
    }
    if (result.error === 'invalid_status') {
      return res.status(409).json({ success: false, error: 'Status inválido para envio' });
    }
    res.json({ success: true, data: result.data });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.post('/admin/unidades/:id/aprovar', ...staffAprovacao, async (req, res) => {
  try {
    const result = await anfitriaoService.aprovarUnidade(req.user!.role ?? '', Number(req.params.id));
    if ('error' in result) {
      if (result.error === 'forbidden') return res.status(403).json({ success: false, error: 'Acesso negado' });
      return res.status(404).json({ success: false, error: 'Unidade não encontrada ou status inválido' });
    }
    res.json({ success: true, data: result.data });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.post('/admin/unidades/:id/rejeitar', ...staffAprovacao, async (req, res) => {
  try {
    const result = await anfitriaoService.rejeitarUnidade(
      req.user!.role ?? '',
      Number(req.params.id),
      req.body?.motivo,
    );
    if ('error' in result) {
      if (result.error === 'forbidden') return res.status(403).json({ success: false, error: 'Acesso negado' });
      return res.status(404).json({ success: false, error: 'Unidade não encontrada' });
    }
    res.json({ success: true, data: result.data });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.get('/calendario', ...parceiroAuth, async (req, res) => {
  try {
    const de = String(req.query.de ?? '');
    const ate = String(req.query.ate ?? '');
    if (!de || !ate) {
      return res.status(400).json({ success: false, error: 'de e ate são obrigatórios' });
    }
    const data = await anfitriaoService.obterCalendarioAgregado(authFromReq(req), de, ate);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.get('/reservas', ...parceiroAuth, async (req, res) => {
  try {
    const de = String(req.query.de ?? '');
    const ate = String(req.query.ate ?? '');
    if (!de || !ate) {
      return res.status(400).json({ success: false, error: 'de e ate são obrigatórios' });
    }
    const acomodacaoId = req.query.acomodacaoId != null ? Number(req.query.acomodacaoId) : undefined;
    const result = await anfitriaoService.listarReservas(authFromReq(req), {
      de,
      ate,
      acomodacaoId: Number.isFinite(acomodacaoId) ? acomodacaoId : undefined,
    });
    if ('error' in result) {
      if (result.error === 'forbidden') {
        return res.status(403).json({ success: false, error: 'Acesso negado' });
      }
      return res.status(404).json({ success: false, error: 'Unidade não encontrada' });
    }
    res.json({ success: true, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.get('/unidades/:id/calendario', ...parceiroAuth, async (req, res) => {
  try {
    const de = String(req.query.de ?? '');
    const ate = String(req.query.ate ?? '');
    if (!de || !ate) {
      return res.status(400).json({ success: false, error: 'de e ate são obrigatórios' });
    }
    const result = await anfitriaoService.obterCalendarioUnidade(
      authFromReq(req),
      Number(req.params.id),
      de,
      ate,
    );
    if ('error' in result) {
      if (result.error === 'forbidden') {
        return res.status(403).json({ success: false, error: 'Acesso negado' });
      }
      return res.status(404).json({ success: false, error: 'Unidade não encontrada' });
    }
    res.json({ success: true, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.get('/unidades/:id/disponibilidade', ...parceiroAuth, async (req, res) => {
  try {
    const de = String(req.query.de ?? '');
    const ate = String(req.query.ate ?? '');
    if (!de || !ate) {
      return res.status(400).json({ success: false, error: 'de e ate são obrigatórios' });
    }
    const result = await anfitriaoService.listarDisponibilidade(
      authFromReq(req),
      Number(req.params.id),
      de,
      ate,
    );
    if ('error' in result) {
      if (result.error === 'forbidden') {
        return res.status(403).json({ success: false, error: 'Acesso negado' });
      }
      return res.status(404).json({ success: false, error: 'Unidade não encontrada' });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.put('/unidades/:id/disponibilidade', ...parceiroAuth, async (req, res) => {
  try {
    const dias = Array.isArray(req.body?.dias) ? req.body.dias : [];
    const result = await anfitriaoService.salvarDisponibilidade(
      authFromReq(req),
      Number(req.params.id),
      dias,
    );
    if (result.error === 'forbidden') {
      return res.status(403).json({ success: false, error: 'Acesso negado' });
    }
    if (result.error === 'not_found') {
      return res.status(404).json({ success: false, error: 'Unidade não encontrada' });
    }
    if (result.error === 'limit_exceeded') {
      return res.status(400).json({ success: false, error: 'Máximo 50 dias por requisição' });
    }
    if (result.error === 'day_reserved') {
      return res.status(403).json({
        success: false,
        error: 'Dia reservado não pode ser alterado pelo anfitrião',
      });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.post('/unidades/:id/disponibilidade/bloquear', ...parceiroAuth, async (req, res) => {
  try {
    const parsed = normalizarListaDatas(req.body?.datas);
    if ('error' in parsed) {
      return res.status(400).json({ success: false, error: parsed.error });
    }
    const result = await anfitriaoService.bulkBloquearDatas(
      authFromReq(req),
      Number(req.params.id),
      parsed.datas,
      req.body?.observacao != null ? String(req.body.observacao) : undefined,
    );
    if (result.error === 'forbidden') {
      return res.status(403).json({ success: false, error: 'Acesso negado' });
    }
    if (result.error === 'not_found') {
      return res.status(404).json({ success: false, error: 'Unidade não encontrada' });
    }
    if (result.error === 'limit_exceeded') {
      return res.status(400).json({ success: false, error: 'Máximo 50 datas por requisição' });
    }
    if (result.error === 'day_reserved_conflict') {
      return res.status(409).json({
        success: false,
        error: 'Não é possível bloquear dia já reservado',
      });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.post('/unidades/:id/disponibilidade/desbloquear', ...parceiroAuth, async (req, res) => {
  try {
    const parsed = normalizarListaDatas(req.body?.datas);
    if ('error' in parsed) {
      return res.status(400).json({ success: false, error: parsed.error });
    }
    const result = await anfitriaoService.bulkDesbloquearDatas(
      authFromReq(req),
      Number(req.params.id),
      parsed.datas,
    );
    if (result.error === 'forbidden') {
      return res.status(403).json({ success: false, error: 'Acesso negado' });
    }
    if (result.error === 'not_found') {
      return res.status(404).json({ success: false, error: 'Unidade não encontrada' });
    }
    if (result.error === 'limit_exceeded') {
      return res.status(400).json({ success: false, error: 'Máximo 50 datas por requisição' });
    }
    if (result.error === 'day_reserved') {
      return res.status(403).json({
        success: false,
        error: 'Dia reservado não pode ser desbloqueado pelo anfitrião',
      });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.post('/unidades/:id/disponibilidade/preco', ...parceiroAuth, async (req, res) => {
  try {
    const parsed = normalizarListaDatas(req.body?.datas);
    if ('error' in parsed) {
      return res.status(400).json({ success: false, error: parsed.error });
    }
    const precoRaw = req.body?.preco;
    const preco =
      precoRaw === null || precoRaw === undefined || precoRaw === ''
        ? null
        : Number(precoRaw);
    if (preco != null && !Number.isFinite(preco)) {
      return res.status(400).json({ success: false, error: 'preco inválido' });
    }
    const result = await anfitriaoService.ajustarPrecoDatas(
      authFromReq(req),
      Number(req.params.id),
      parsed.datas,
      preco,
    );
    if (result.error === 'forbidden') {
      return res.status(403).json({ success: false, error: 'Acesso negado' });
    }
    if (result.error === 'not_found') {
      return res.status(404).json({ success: false, error: 'Unidade não encontrada' });
    }
    if (result.error === 'limit_exceeded') {
      return res.status(400).json({ success: false, error: 'Máximo 50 datas por requisição' });
    }
    if (result.error === 'invalid_price') {
      return res.status(400).json({ success: false, error: 'preco inválido' });
    }
    if (result.error === 'day_reserved') {
      return res.status(403).json({
        success: false,
        error: 'Dia reservado não pode receber preço especial',
      });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.post('/admin/carteira', ...staffAprovacao, async (req, res) => {
  try {
    const { corretorId, proprietarioId } = req.body ?? {};
    if (!corretorId || !proprietarioId) {
      return res.status(400).json({ success: false, error: 'corretorId e proprietarioId obrigatórios' });
    }
    const result = await anfitriaoService.atribuirCarteira(
      req.user!.role ?? '',
      Number(corretorId),
      Number(proprietarioId),
    );
    if (result.error === 'forbidden') return res.status(403).json({ success: false, error: 'Acesso negado' });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

export default router;
module.exports = router;
