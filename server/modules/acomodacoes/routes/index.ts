import { Router } from 'express';
import { getPinnedCodigosExternos, isEtapaAHotel, montarCardsPasso2 } from '@rsv360/shared';
import { authenticateJwt, requireRole } from '../../../middleware/auth.middleware';
import { publicLimiter } from '../../../middleware/public-limiter';
import {
  acomodacoesService,
  mergeDisponiveisParaCards,
} from '../services/acomodacoes.service';
import { resolverHotelIdParaAcomodacoes } from '../services/resolve-hotel-id';

const router = Router();
const staffAuth = [authenticateJwt, requireRole('admin', 'manager', 'user')];
const adminAuth = [authenticateJwt, requireRole('admin')];

router.get('/health', (_req, res) => {
  res.json({ module: 'acomodacoes', status: 'ok' });
});

/** Público — listagem paginada para wizard Passo 2 (filtro no banco). */
router.get('/disponiveis', publicLimiter, async (req, res) => {
  try {
    const hotelIdRaw = String(req.query.hotelId ?? '');
    const titulo = req.query.titulo != null ? String(req.query.titulo) : undefined;
    const hospedesQuery = Number(req.query.hospedes ?? 2);
    const adults = Number(req.query.adults ?? hospedesQuery);
    const children = Number(req.query.children ?? 0);
    const perfil = String(req.query.perfil ?? 'casal') as 'familia' | 'casal' | 'aventura';
    const page = Number(req.query.page ?? 1);

    if (!hotelIdRaw) {
      return res.status(400).json({ success: false, error: 'hotelId é obrigatório' });
    }

    const hotelId = await resolverHotelIdParaAcomodacoes(hotelIdRaw, titulo);

    const hospedes = adults + children;
    const listed = await acomodacoesService.listarDisponiveis({
      hotelId,
      hospedes,
      page,
    });

    let cardInput = listed.items;
    if (isEtapaAHotel(hotelId)) {
      const pinCodigos = getPinnedCodigosExternos(hotelId, perfil, adults, children);
      if (pinCodigos?.length) {
        const pinItems = await acomodacoesService.listarPinsPublicadosPorCodigo({
          hotelId,
          codigosExternos: pinCodigos,
          hospedes,
        });
        cardInput = mergeDisponiveisParaCards(listed.items, pinItems);
      }
    }

    const cards =
      cardInput.length > 0
        ? montarCardsPasso2(perfil, adults, children, cardInput, hotelId)
        : [];

    res.json({
      success: true,
      data: {
        ...listed,
        hotelIdResolvido: hotelId,
        cards,
        fallbackHotelUnico: listed.items.length === 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.get('/addons', publicLimiter, async (_req, res) => {
  try {
    const rows = await acomodacoesService.listarAddons('hotel');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.get('/admin/tipos', ...adminAuth, async (_req, res) => {
  try {
    const data = await acomodacoesService.listarTipos();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/admin/tipos', ...adminAuth, async (req, res) => {
  try {
    const { slug, nome, icone, ordem } = req.body ?? {};
    if (!slug || !nome) return res.status(400).json({ success: false, error: 'slug e nome obrigatórios' });
    const data = await acomodacoesService.criarTipo({ slug, nome, icone, ordem });
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.patch('/admin/tipos/:id', ...adminAuth, async (req, res) => {
  try {
    const data = await acomodacoesService.atualizarTipo(Number(req.params.id), req.body ?? {});
    if (!data) return res.status(404).json({ success: false, error: 'Tipo não encontrado' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.get('/admin/addons', ...adminAuth, async (_req, res) => {
  try {
    const data = await acomodacoesService.listarAddons('hotel');
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/admin/addons', ...adminAuth, async (req, res) => {
  try {
    const { nome, descricao, precoTipo, valor, escopo, requerConfigBanheiro, ordem } = req.body ?? {};
    if (!nome || !precoTipo || valor == null) {
      return res.status(400).json({ success: false, error: 'nome, precoTipo e valor obrigatórios' });
    }
    const data = await acomodacoesService.criarAddon({
      nome,
      descricao,
      precoTipo,
      valor: String(valor),
      escopo,
      requerConfigBanheiro,
      ordem,
    });
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.patch('/admin/addons/:id', ...adminAuth, async (req, res) => {
  try {
    const patch = { ...req.body };
    if (patch.valor != null) patch.valor = String(patch.valor);
    const data = await acomodacoesService.atualizarAddon(Number(req.params.id), patch);
    if (!data) return res.status(404).json({ success: false, error: 'Addon não encontrado' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.delete('/admin/addons/:id', ...adminAuth, async (req, res) => {
  try {
    const data = await acomodacoesService.excluirAddon(Number(req.params.id));
    if (!data) return res.status(404).json({ success: false, error: 'Addon não encontrado' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

export default router;
module.exports = router;
