import { Router } from 'express';
import { AgentesConfigService } from '../config.service';
import { requireAgentesAtivo } from '../middleware/require-agentes-ativo';

const router = Router();

router.use(requireAgentesAtivo);

router.get('/health', (_req, res) => {
  res.json({ module: 'agentes', status: 'ok' });
});

router.get('/config', async (_req, res) => {
  try {
    const data = await AgentesConfigService.obterConfig();
    res.json({
      success: true,
      data: {
        agentes_modulo_ativo: data.agentesModuloAtivo,
        limiar_semantico_hit: data.limiarSemanticoHit,
        limiar_semantico_verificar: data.limiarSemanticoVerificar,
        ttl_cache_institucional_dias: data.ttlCacheInstitucionalDias,
        ttl_cache_catalogo_horas: data.ttlCacheCatalogoHoras,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export default router;
