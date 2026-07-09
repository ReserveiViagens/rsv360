import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { randomUUID } from 'crypto';
import type { RequestHandler } from 'express';

const ALLOWED_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
]);

const MAX_BYTES = 10 * 1024 * 1024; // 10MB

export function resolveHotelsUploadDir(): string {
  const fromEnv = process.env.CMS_HOTEIS_UPLOAD_DIR;
  if (fromEnv) return path.resolve(fromEnv);
  return path.resolve(process.cwd(), 'public', 'uploads', 'hoteis');
}

export function ensureHotelsUploadDir(): string {
  const dir = resolveHotelsUploadDir();
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    try {
      cb(null, ensureHotelsUploadDir());
    } catch (err) {
      cb(err as Error, '');
    }
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || mimeToExt(file.mimetype);
    cb(null, `${randomUUID()}${ext}`);
  },
});

function mimeToExt(mime: string): string {
  switch (mime) {
    case 'image/jpeg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    case 'video/mp4':
      return '.mp4';
    default:
      return '';
  }
}

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (ALLOWED_MIMES.has(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}`));
};

export const cmsUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_BYTES },
}).single('file');

/** Converte erros multer em 400. */
export const cmsUploadErrorHandler: RequestHandler = (err, _req, res, next) => {
  if (!err) return next();
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, error: 'Arquivo excede 10MB' });
    }
    return res.status(400).json({ success: false, error: err.message });
  }
  if (err instanceof Error) {
    return res.status(400).json({ success: false, error: err.message });
  }
  return next(err);
};

export function publicUrlForUpload(filename: string): string {
  return `/uploads/hoteis/${filename}`;
}
