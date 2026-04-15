import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { eq } from 'drizzle-orm';
import { db } from '../../../../backend/src/db/drizzle';
import { cloudFiles } from '../db/schema';

const THUMBNAIL_SIZES = {
  small: { width: 150, height: 150, fit: 'cover' as const },
  medium: { width: 400, height: 400, fit: 'inside' as const },
  large: { width: 800, height: 800, fit: 'inside' as const },
};

export async function optimizeImage(fileId: string, options?: { quality?: number; format?: 'jpeg' | 'png' | 'webp' }) {
  const file = await db.select().from(cloudFiles).where(eq(cloudFiles.id, fileId)).then(r => r[0]);
  if (!file || !file.mimeType.startsWith('image/')) throw new Error('Not an image');

  const { quality = 80, format = 'jpeg' } = options || {};
  const outputPath = file.path.replace(/(\.\w+)$/, `_optimized.${format}`);

  let sharpInstance = sharp(file.path);

  if (format === 'jpeg') {
    sharpInstance = sharpInstance.jpeg({ quality });
  } else if (format === 'png') {
    sharpInstance = sharpInstance.png({ quality });
  } else if (format === 'webp') {
    sharpInstance = sharpInstance.webp({ quality });
  }

  await sharpInstance.toFile(outputPath);

  // Update file record
  const stats = await fs.stat(outputPath);
  await db.update(cloudFiles)
    .set({
      path: outputPath,
      size: stats.size,
      mimeType: `image/${format}`,
      updatedAt: new Date()
    })
    .where(eq(cloudFiles.id, fileId));

  // Remove old file
  await fs.unlink(file.path).catch(() => {});

  return { newPath: outputPath, newSize: stats.size };
}

export async function generateThumbnails(fileId: string) {
  const file = await db.select().from(cloudFiles).where(eq(cloudFiles.id, fileId)).then(r => r[0]);
  if (!file || !file.mimeType.startsWith('image/')) throw new Error('Not an image');

  const thumbnails: Record<string, string> = {};

  for (const [size, config] of Object.entries(THUMBNAIL_SIZES)) {
    const outputPath = file.path.replace(/(\.\w+)$/, `_${size}$1`);
    await sharp(file.path)
      .resize(config.width, config.height, { fit: config.fit })
      .jpeg({ quality: 80 })
      .toFile(outputPath);
    thumbnails[size] = outputPath;
  }

  await db.update(cloudFiles)
    .set({ thumbnails, updatedAt: new Date() })
    .where(eq(cloudFiles.id, fileId));

  return thumbnails;
}

export async function resizeImage(fileId: string, width: number, height: number, fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside') {
  const file = await db.select().from(cloudFiles).where(eq(cloudFiles.id, fileId)).then(r => r[0]);
  if (!file || !file.mimeType.startsWith('image/')) throw new Error('Not an image');

  const outputPath = file.path.replace(/(\.\w+)$/, `_resized_${width}x${height}$1`);

  await sharp(file.path)
    .resize(width, height, { fit: fit || 'inside' })
    .toFile(outputPath);

  const stats = await fs.stat(outputPath);
  await db.update(cloudFiles)
    .set({ path: outputPath, size: stats.size, updatedAt: new Date() })
    .where(eq(cloudFiles.id, fileId));

  await fs.unlink(file.path).catch(() => {});

  return { newPath: outputPath, newSize: stats.size };
}

export async function convertFormat(fileId: string, format: 'jpeg' | 'png' | 'webp' | 'avif') {
  const file = await db.select().from(cloudFiles).where(eq(cloudFiles.id, fileId)).then(r => r[0]);
  if (!file || !file.mimeType.startsWith('image/')) throw new Error('Not an image');

  const outputPath = file.path.replace(/(\.\w+)$/, `.${format}`);

  let sharpInstance = sharp(file.path);

  if (format === 'jpeg') {
    sharpInstance = sharpInstance.jpeg({ quality: 80 });
  } else if (format === 'png') {
    sharpInstance = sharpInstance.png({ quality: 80 });
  } else if (format === 'webp') {
    sharpInstance = sharpInstance.webp({ quality: 80 });
  } else if (format === 'avif') {
    sharpInstance = sharpInstance.avif({ quality: 80 });
  }

  await sharpInstance.toFile(outputPath);

  const stats = await fs.stat(outputPath);
  await db.update(cloudFiles)
    .set({
      path: outputPath,
      mimeType: `image/${format}`,
      size: stats.size,
      updatedAt: new Date()
    })
    .where(eq(cloudFiles.id, fileId));

  await fs.unlink(file.path).catch(() => {});

  return { newPath: outputPath, newSize: stats.size };
}

export async function cropImage(fileId: string, left: number, top: number, width: number, height: number) {
  const file = await db.select().from(cloudFiles).where(eq(cloudFiles.id, fileId)).then(r => r[0]);
  if (!file || !file.mimeType.startsWith('image/')) throw new Error('Not an image');

  const outputPath = file.path.replace(/(\.\w+)$/, `_cropped$1`);

  await sharp(file.path)
    .extract({ left, top, width, height })
    .toFile(outputPath);

  const stats = await fs.stat(outputPath);
  await db.update(cloudFiles)
    .set({ path: outputPath, size: stats.size, updatedAt: new Date() })
    .where(eq(cloudFiles.id, fileId));

  await fs.unlink(file.path).catch(() => {});

  return { newPath: outputPath, newSize: stats.size };
}

export async function addWatermark(fileId: string, watermarkPath: string, position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center') {
  const file = await db.select().from(cloudFiles).where(eq(cloudFiles.id, fileId)).then(r => r[0]);
  if (!file || !file.mimeType.startsWith('image/')) throw new Error('Not an image');

  const outputPath = file.path.replace(/(\.\w+)$/, `_watermarked$1`);

  let gravity: 'northwest' | 'northeast' | 'southwest' | 'southeast' | 'center' = 'southeast';
  switch (position) {
    case 'top-left': gravity = 'northwest'; break;
    case 'top-right': gravity = 'northeast'; break;
    case 'bottom-left': gravity = 'southwest'; break;
    case 'center': gravity = 'center'; break;
  }

  await sharp(file.path)
    .composite([{ input: watermarkPath, gravity }])
    .toFile(outputPath);

  const stats = await fs.stat(outputPath);
  await db.update(cloudFiles)
    .set({ path: outputPath, size: stats.size, updatedAt: new Date() })
    .where(eq(cloudFiles.id, fileId));

  await fs.unlink(file.path).catch(() => {});

  return { newPath: outputPath, newSize: stats.size };
}

export async function getImageMetadata(fileId: string) {
  const file = await db.select().from(cloudFiles).where(eq(cloudFiles.id, fileId)).then(r => r[0]);
  if (!file || !file.mimeType.startsWith('image/')) throw new Error('Not an image');

  const metadata = await sharp(file.path).metadata();

  return {
    width: metadata.width,
    height: metadata.height,
    format: metadata.format,
    size: file.size,
    hasAlpha: metadata.hasAlpha,
    exif: metadata.exif,
  };
}

export async function batchOptimize(fileIds: string[]) {
  const results = [];

  for (const fileId of fileIds) {
    try {
      const result = await optimizeImage(fileId);
      results.push({ fileId, success: true, result });
    } catch (error) {
      results.push({ fileId, success: false, error: String(error) });
    }
  }

  return results;
}

export async function autoOptimize(filePath: string, mimeType: string) {
  if (!mimeType.startsWith('image/')) return;

  // Auto-optimize large images
  const metadata = await sharp(filePath).metadata();

  if (metadata.width && metadata.width > 2000) {
    await sharp(filePath)
      .resize(2000, null, { withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(`${filePath}.optimized`);

    await fs.rename(`${filePath}.optimized`, filePath);
  }
}