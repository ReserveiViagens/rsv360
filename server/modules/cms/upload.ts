import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { randomUUID } from 'crypto';
import type { ErrorRequestHandler } from 'express';
import {
  CMS_MEDIA_MIMES,
  assertCmsDiskFileMagic,
  safeStoredFilename,
} from '../../lib/secure-upload';

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
    try {
      // Extension from allowlisted MIME only — never from originalname (PR-08).
      cb(null, safeStoredFilename(randomUUID(), file.mimetype));
    } catch (err) {
      cb(err as Error, '');
    }
  },
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (CMS_MEDIA_MIMES.has(file.mimetype)) {
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
export const cmsUploadErrorHandler: ErrorRequestHandler = (err, _req, res, next) => {
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

/** Re-export for route post-multer magic check. */
export { assertCmsDiskFileMagic };
