import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import { authenticateJwt, requireRole } from '../../../middleware/auth.middleware';
import { gerarModeloXlsxBuffer } from '../import/modelo';
import { ImportVazioError, pipelineImportacao } from '../import/pipeline';
import { enfileirarImportacao } from '../../../queues/importacoes.queue';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

const importAuth = [authenticateJwt, requireRole('admin', 'manager')];

const PARCEIRO_ROLES = new Set(['anfitriao', 'corretor']);
const LIMITE_IMPORT_PARCEIRO = 50;

function parseProprietarioId(raw: unknown): number | null {
  if (raw == null || raw === '') return null;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function buildImportOptions(req: Request, dryRun: boolean) {
  const role = req.user?.role ?? '';
  const bulkPublicado = String(req.body?.bulkPublicado ?? 'false') === 'true';
  const statusPublicacao = req.body?.statusPublicacao as
    | 'rascunho'
    | 'completo'
    | 'em_aprovacao'
    | 'publicado'
    | 'rejeitado'
    | undefined;

  return {
    dryRun,
    proprietarioId: parseProprietarioId(req.body?.proprietarioId) ?? (PARCEIRO_ROLES.has(role) ? req.user?.id : null),
    bulkPublicado: bulkPublicado || statusPublicacao === 'publicado',
    statusPublicacao,
    maxLinhasParceiro: PARCEIRO_ROLES.has(role) ? LIMITE_IMPORT_PARCEIRO : undefined,
  };
}

function sendImportError(res: Response, error: unknown) {
  if (error instanceof ImportVazioError) {
    return res.status(422).json({
      success: false,
      error: error.message,
      code: error.code,
    });
  }
  return res.status(400).json({ success: false, error: (error as Error).message });
}

router.get('/modelo.xlsx', ...importAuth, (_req, res) => {
  const buffer = gerarModeloXlsxBuffer();
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="modelo-importacao-acomodacoes.xlsx"',
  );
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
  res.send(buffer);
});

router.post('/preview', ...importAuth, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: 'Arquivo obrigatório (campo file)' });
    }

    const relatorio = await pipelineImportacao(file.buffer, file.originalname, buildImportOptions(req, true));

    res.json({ success: true, data: relatorio });
  } catch (error) {
    return sendImportError(res, error);
  }
});

router.post('/commit', ...importAuth, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: 'Arquivo obrigatório (campo file)' });
    }

    const asyncMode = String(req.body?.async ?? 'false') === 'true';
    const importOpts = buildImportOptions(req, false);

    if (asyncMode) {
      const jobId = await enfileirarImportacao({
        nomeArquivo: file.originalname,
        bufferBase64: file.buffer.toString('base64'),
        proprietarioId: importOpts.proprietarioId,
        bulkPublicado: importOpts.bulkPublicado,
        statusPublicacao: importOpts.statusPublicacao,
        userId: req.user?.id,
      });
      return res.status(202).json({ success: true, data: { jobId, status: 'enqueued' } });
    }

    const relatorio = await pipelineImportacao(file.buffer, file.originalname, importOpts);

    res.json({ success: true, data: relatorio });
  } catch (error) {
    return sendImportError(res, error);
  }
});

export default router;
module.exports = router;
