import { Router, type Request } from 'express';
import { z } from 'zod';
import { authenticateJwt } from '../../../middleware/auth.middleware';
import { AgentesConfigService } from '../config.service';
import { requireAgentesAtivo } from '../middleware/require-agentes-ativo';
import { requireInstrutorAtivo } from '../middleware/require-instrutor-ativo';
import { instrutorRateLimit } from '../middleware/instrutor-rate-limit';
import { InstrutorService } from '../instrutor/instrutor.service';
import { resolvePapel } from '../instrutor/papel';

type AuthedRequest = Request & {
  user?: { id?: number; role?: string };
};

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
        agente_instrutor_ativo: data.agenteInstrutorAtivo,
        limiar_semantico_hit: data.limiarSemanticoHit,
        limiar_semantico_verificar: data.limiarSemanticoVerificar,
        ttl_cache_institucional_dias: data.ttlCacheInstitucionalDias,
        ttl_cache_catalogo_horas: data.ttlCacheCatalogoHoras,
        modelo_t1: data.modeloT1,
        modelo_embedding: data.modeloEmbedding,
        rag_top_k: data.ragTopK,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

const perguntarSchema = z
  .object({
    pergunta: z.string().min(1).max(500),
    papel: z.enum(['staff', 'anfitriao', 'ambos']).optional(),
  })
  .strict();

router.post(
  '/instrutor/perguntar',
  authenticateJwt,
  instrutorRateLimit,
  requireInstrutorAtivo,
  async (req, res) => {
    try {
      const parsed = perguntarSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: 'Payload inválido',
          details: parsed.error.flatten(),
        });
      }

      const user = (req as AuthedRequest).user;
      const papel = resolvePapel(user?.role, parsed.data.papel);
      const result = await InstrutorService.perguntar({
        pergunta: parsed.data.pergunta,
        papel,
        canal: 'api',
        userId: user?.id,
      });

      if (result.status === 503) {
        return res.status(503).json({
          success: false,
          error: 'Instrutor temporariamente indisponível',
        });
      }

      return res.json({
        success: true,
        data: {
          resposta: result.resposta,
          tier: result.tier,
          cache_hit: result.cacheHit,
        },
      });
    } catch (error) {
      console.error('[instrutor] erro no endpoint:', (error as Error).message);
      return res.status(503).json({
        success: false,
        error: 'Instrutor temporariamente indisponível',
      });
    }
  },
);

export default router;
