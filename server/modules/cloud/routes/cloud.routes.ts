import { Router } from 'express';
import multer from 'multer';
import { uploadFile, getFileUrl, deleteFile, listFiles, getStorageStats } from '../services/file-storage.service';
import { optimizeImage, generateThumbnails, resizeImage, convertFormat, cropImage, addWatermark, getImageMetadata, batchOptimize } from '../services/image-optimization.service';
import { createQueue, addJob, getJobStatus, cancelJob, retryJob, getQueueStats, cleanQueue, getFailedJobs, getActiveJobs } from '../services/job-queue.service';
import { setCache, getCache, deleteCache, clearCache, getCacheStats, setCacheConfig, getCacheConfig, incrementCache, decrementCache, existsCache, expireCache, ttlCache, keysCache, hashSetCache, hashGetCache, hashGetAllCache, listPushCache, listPopCache, listRangeCache, setAddCache, setMembersCache, setRemoveCache } from '../services/cache.service';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware';
import { validateFileUpload } from '../middleware/upload.middleware';

const router = Router();
const upload = multer({ dest: 'uploads/temp/' });

router.use((req, _res, next) => {
  const propertyId = (req as any).propertyId;
  if (propertyId !== undefined) {
    (req.query as any).property_id = (req.query as any).property_id || String(propertyId);
    if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
      (req.body as any).property_id = (req.body as any).property_id || propertyId;
    }
  }
  next();
});

// File Storage Routes
router.post('/files/upload', authenticate, upload.single('file'), validateFileUpload, async (req, res) => {
  try {
    const { entityType, entityId, folder } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await uploadFile(file, {
      entityType,
      entityId,
      uploadedBy: (req as AuthenticatedRequest).user.id,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/files/:fileId/url', authenticate, async (req, res) => {
  try {
    const { fileId } = req.params;
    const { expiresIn } = req.query;

    const url = await getFileUrl(Array.isArray(fileId) ? fileId[0] : fileId, parseInt(expiresIn as string) || 3600);
    res.json({ url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/files/:fileId', authenticate, async (req, res) => {
  try {
    const { fileId } = req.params;
    await deleteFile(Array.isArray(fileId) ? fileId[0] : fileId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/files', authenticate, async (req, res) => {
  try {
    const { entityType, entityId, folder, limit, offset } = req.query;

    const files = await listFiles({
      entityType: entityType as string,
      mimeType: folder as string, // Note: using folder as mimeType filter for now
      limit: parseInt(limit as string) || 50,
      page: parseInt(offset as string) / (parseInt(limit as string) || 50) + 1 || 1,
    });

    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/storage/stats', authenticate, async (req, res) => {
  try {
    const stats = await getStorageStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Image Optimization Routes
router.post('/images/:fileId/optimize', authenticate, async (req, res) => {
  try {
    const { fileId } = req.params;
    const { quality, format } = req.body;

    const result = await optimizeImage(fileId as string, { quality, format });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/images/:fileId/thumbnails', authenticate, async (req, res) => {
  try {
    const { fileId } = req.params;
    const thumbnails = await generateThumbnails(fileId as string);
    res.json(thumbnails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/images/:fileId/resize', authenticate, async (req, res) => {
  try {
    const { fileId } = req.params;
    const { width, height, fit } = req.body;

    const result = await resizeImage(Array.isArray(fileId) ? fileId[0] : fileId, width, height, fit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/images/:fileId/convert', authenticate, async (req, res) => {
  try {
    const { fileId } = req.params;
    const { format } = req.body;

    const result = await convertFormat(Array.isArray(fileId) ? fileId[0] : fileId, format);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/images/:fileId/crop', authenticate, async (req, res) => {
  try {
    const { fileId } = req.params;
    const { left, top, width, height } = req.body;

    const result = await cropImage(Array.isArray(fileId) ? fileId[0] : fileId, left, top, width, height);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/images/:fileId/watermark', authenticate, upload.single('watermark'), async (req, res) => {
  try {
    const { fileId } = req.params;
    const { position } = req.body;
    const watermarkFile = req.file;

    if (!watermarkFile) {
      return res.status(400).json({ error: 'No watermark file uploaded' });
    }

    const result = await addWatermark(fileId as string, watermarkFile.path as string, position);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/images/:fileId/metadata', authenticate, async (req, res) => {
  try {
    const { fileId } = req.params;
    const metadata = await getImageMetadata(Array.isArray(fileId) ? fileId[0] : fileId);
    res.json(metadata);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/images/batch-optimize', authenticate, async (req, res) => {
  try {
    const { fileIds } = req.body;
    const results = await batchOptimize(fileIds);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Job Queue Routes
router.post('/jobs/queues/:queueName', authenticate, async (req, res) => {
  try {
    const { queueName } = req.params;
    const { concurrency, removeOnComplete, removeOnFail } = req.body;

    await createQueue(Array.isArray(queueName) ? queueName[0] : queueName, { concurrency, removeOnComplete, removeOnFail });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/jobs/queues/:queueName/jobs', authenticate, async (req, res) => {
  try {
    const { queueName } = req.params;
    const { data, priority, delay, attempts, backoff } = req.body;

    const job = await addJob(Array.isArray(queueName) ? queueName[0] : queueName, data, { priority, delay, attempts, backoff });
    res.json({ jobId: job.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/jobs/:jobId', authenticate, async (req, res) => {
  try {
    const { jobId } = req.params;
    const status = await getJobStatus(Array.isArray(jobId) ? jobId[0] : jobId);
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/jobs/:jobId', authenticate, async (req, res) => {
  try {
    const { jobId } = req.params;
    await cancelJob(Array.isArray(jobId) ? jobId[0] : jobId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/jobs/:jobId/retry', authenticate, async (req, res) => {
  try {
    const { jobId } = req.params;
    await retryJob(Array.isArray(jobId) ? jobId[0] : jobId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/jobs/queues/:queueName/stats', authenticate, async (req, res) => {
  try {
    const { queueName } = req.params;
    const stats = await getQueueStats(Array.isArray(queueName) ? queueName[0] : queueName);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/jobs/queues/:queueName/clean', authenticate, async (req, res) => {
  try {
    const { queueName } = req.params;
    const { grace } = req.query;

    await cleanQueue(Array.isArray(queueName) ? queueName[0] : queueName, parseInt(grace as string));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/jobs/failed', authenticate, async (req, res) => {
  try {
    const { queueName } = req.query;
    const jobs = await getFailedJobs(queueName as string);
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/jobs/active', authenticate, async (req, res) => {
  try {
    const { queueName } = req.query;
    const jobs = await getActiveJobs(queueName as string);
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cache Routes
router.post('/cache', authenticate, async (req, res) => {
  try {
    const { key, value, ttl } = req.body;
    await setCache(key, value, ttl);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/cache/:key', authenticate, async (req, res) => {
  try {
    const { key } = req.params;
    const value = await getCache(Array.isArray(key) ? key[0] : key);
    res.json({ value });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/cache/:key', authenticate, async (req, res) => {
  try {
    const { key } = req.params;
    await deleteCache(Array.isArray(key) ? key[0] : key);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/cache', authenticate, async (req, res) => {
  try {
    const { pattern } = req.query;
    const count = await clearCache(pattern as string);
    res.json({ cleared: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/cache/stats', authenticate, async (req, res) => {
  try {
    const stats = await getCacheStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/cache/config', authenticate, async (req, res) => {
  try {
    const config = req.body;
    await setCacheConfig(config);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/cache/config', authenticate, async (req, res) => {
  try {
    const config = await getCacheConfig();
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cache utility routes
router.post('/cache/:key/increment', authenticate, async (req, res) => {
  try {
    const { key } = req.params;
    const { amount } = req.body;
    const value = await incrementCache(Array.isArray(key) ? key[0] : key, amount);
    res.json({ value });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/cache/:key/decrement', authenticate, async (req, res) => {
  try {
    const { key } = req.params;
    const { amount } = req.body;
    const value = await decrementCache(Array.isArray(key) ? key[0] : key, amount);
    res.json({ value });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/cache/:key/exists', authenticate, async (req, res) => {
  try {
    const { key } = req.params;
    const exists = await existsCache(Array.isArray(key) ? key[0] : key);
    res.json({ exists });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/cache/:key/expire', authenticate, async (req, res) => {
  try {
    const { key } = req.params;
    const { ttl } = req.body;
    const result = await expireCache(key, ttl);
    res.json({ success: result === 1 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/cache/:key/ttl', authenticate, async (req, res) => {
  try {
    const { key } = req.params;
    const ttl = await ttlCache(key);
    res.json({ ttl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/cache/keys', authenticate, async (req, res) => {
  try {
    const { pattern } = req.query;
    const keys = await keysCache(pattern as string || '*');
    res.json({ keys });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Hash operations
router.post('/cache/hash/:key', authenticate, async (req, res) => {
  try {
    const { key } = req.params;
    const { field, value } = req.body;
    const result = await hashSetCache(key, field, value);
    res.json({ success: result > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/cache/hash/:key/:field', authenticate, async (req, res) => {
  try {
    const { key, field } = req.params;
    const value = await hashGetCache(key, field);
    res.json({ value });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/cache/hash/:key', authenticate, async (req, res) => {
  try {
    const { key } = req.params;
    const hash = await hashGetAllCache(key);
    res.json(hash);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List operations
router.post('/cache/list/:key', authenticate, async (req, res) => {
  try {
    const { key } = req.params;
    const { values } = req.body;
    const length = await listPushCache(key, ...values);
    res.json({ length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/cache/list/:key/pop', authenticate, async (req, res) => {
  try {
    const { key } = req.params;
    const value = await listPopCache(key);
    res.json({ value });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/cache/list/:key', authenticate, async (req, res) => {
  try {
    const { key } = req.params;
    const { start, end } = req.query;
    const values = await listRangeCache(key, parseInt(start as string) || 0, parseInt(end as string) || -1);
    res.json({ values });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Set operations
router.post('/cache/set/:key', authenticate, async (req, res) => {
  try {
    const { key } = req.params;
    const { members } = req.body;
    const count = await setAddCache(key, ...members);
    res.json({ added: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/cache/set/:key', authenticate, async (req, res) => {
  try {
    const { key } = req.params;
    const members = await setMembersCache(key);
    res.json({ members });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/cache/set/:key', authenticate, async (req, res) => {
  try {
    const { key } = req.params;
    const { members } = req.body;
    const removed = await setRemoveCache(key, ...members);
    res.json({ removed });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
