import { Router } from 'express';
import multer from 'multer';
import { authenticateJwt, requireRole } from '../../../middleware/auth.middleware';
import { gerarModeloXlsxBuffer } from '../import/modelo';
import { pipelineImportacao } from '../import/pipeline';
import { enfileirarImportacao } from '../../../queues/importacoes.queue';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

const importAuth = [authenticateJwt, requireRole('admin', 'manager', 'user')];

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

    const relatorio = await pipelineImportacao(file.buffer, file.originalname, {
      dryRun: true,
      anfitriaoId: req.body?.anfitriaoId ?? null,
    });

    res.json({ success: true, data: relatorio });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.post('/commit', ...importAuth, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: 'Arquivo obrigatório (campo file)' });
    }

    const asyncMode = String(req.body?.async ?? 'false') === 'true';
    const anfitriaoId = req.body?.anfitriaoId ?? null;

    if (asyncMode) {
      const jobId = await enfileirarImportacao({
        nomeArquivo: file.originalname,
        bufferBase64: file.buffer.toString('base64'),
        anfitriaoId,
        userId: req.user?.id,
      });
      return res.status(202).json({ success: true, data: { jobId, status: 'enqueued' } });
    }

    const relatorio = await pipelineImportacao(file.buffer, file.originalname, {
      dryRun: false,
      anfitriaoId,
    });

    res.json({ success: true, data: relatorio });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

export default router;
module.exports = router;
