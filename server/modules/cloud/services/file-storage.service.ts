import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command, HeadObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { eq, and, ilike, desc, sql } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';
import { db } from '../../../../backend/src/db/drizzle';
import { cloudFiles } from '../db/schema';

const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT, // MinIO: 'http://localhost:9000'
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || '',
    secretAccessKey: process.env.S3_SECRET_KEY || '',
  },
  forcePathStyle: !!process.env.S3_ENDPOINT, // true para MinIO
});

const DEFAULT_BUCKET = process.env.S3_BUCKET || 'rsv360-files';

export async function uploadFile(
  file: { path: string; originalname: string; mimetype: string; size: number },
  options?: { entityType?: string; entityId?: string; isPublic?: boolean; uploadedBy?: string }
) {
  const provider = process.env.STORAGE_PROVIDER || 'local';
  let storedPath = file.path;
  let publicUrl: string | null = null;

  if (provider === 's3' || provider === 'minio') {
    const key = `uploads/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${path.basename(file.path)}`;
    await uploadToS3(file.path, key, file.mimetype);
    storedPath = key;
    publicUrl = `${process.env.S3_ENDPOINT || `https://${DEFAULT_BUCKET}.s3.amazonaws.com`}/${key}`;
    // Remover arquivo local após upload
    await fs.unlink(file.path).catch(() => {});
  }

  const [record] = await db.insert(cloudFiles).values({
    originalName: file.originalname,
    storedName: path.basename(storedPath),
    mimeType: file.mimetype,
    size: file.size,
    provider,
    bucket: provider !== 'local' ? DEFAULT_BUCKET : null,
    path: storedPath,
    publicUrl,
    status: 'ready',
    entityType: options?.entityType,
    entityId: options?.entityId,
    isPublic: options?.isPublic ?? false,
    uploadedBy: options?.uploadedBy,
  }).returning();

  return record;
}

export async function uploadToS3(filePath: string, key: string, mimeType: string, bucket?: string) {
  const fileContent = await fs.readFile(filePath);
  const command = new PutObjectCommand({
    Bucket: bucket || DEFAULT_BUCKET,
    Key: key,
    Body: fileContent,
    ContentType: mimeType,
  });
  await s3Client.send(command);
}

export async function getFile(fileId: string) {
  const [file] = await db.select().from(cloudFiles).where(eq(cloudFiles.id, fileId)).limit(1);
  return file || null;
}

export async function getFileUrl(fileId: string, expiresIn?: number) {
  const file = await getFile(fileId);
  if (!file) throw new Error('File not found');

  if (file.isPublic && file.publicUrl) {
    return { url: file.publicUrl, expiresAt: null };
  }

  if (file.provider === 's3' || file.provider === 'minio') {
    const command = new GetObjectCommand({
      Bucket: file.bucket || DEFAULT_BUCKET,
      Key: file.path,
    });
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: expiresIn || 3600 });
    return { url: signedUrl, expiresAt: new Date(Date.now() + (expiresIn || 3600) * 1000) };
  }

  // Para arquivos locais, retornar caminho relativo
  return { url: `/uploads/${file.storedName}`, expiresAt: null };
}

export async function getPresignedUploadUrl(key: string, mimeType: string, expiresIn?: number) {
  const command = new PutObjectCommand({
    Bucket: DEFAULT_BUCKET,
    Key: key,
    ContentType: mimeType,
  });
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: expiresIn || 3600 });
  return { url: signedUrl, expiresAt: new Date(Date.now() + (expiresIn || 3600) * 1000) };
}

export async function deleteFile(fileId: string) {
  const file = await getFile(fileId);
  if (!file) throw new Error('File not found');

  if (file.provider === 's3' || file.provider === 'minio') {
    const command = new DeleteObjectCommand({
      Bucket: file.bucket || DEFAULT_BUCKET,
      Key: file.path,
    });
    await s3Client.send(command);
  } else {
    // Arquivo local
    await fs.unlink(file.path).catch(() => {});
  }

  await db.update(cloudFiles)
    .set({ status: 'deleted', updatedAt: new Date() })
    .where(eq(cloudFiles.id, fileId));

  return true;
}

export async function listFiles(params?: {
  entityType?: string;
  mimeType?: string;
  search?: string;
  page?: number;
  limit?: number;
  status?: string;
}) {
  const { entityType, mimeType, search, page = 1, limit = 20, status } = params || {};

  let query = db.select().from(cloudFiles);

  if (entityType) {
    query = query.where(eq(cloudFiles.entityType, entityType));
  }

  if (mimeType) {
    query = query.where(ilike(cloudFiles.mimeType, `${mimeType}%`));
  }

  if (status) {
    query = query.where(eq(cloudFiles.status, status as any));
  }

  if (search) {
    query = query.where(ilike(cloudFiles.originalName, `%${search}%`));
  }

  const offset = (page - 1) * limit;
  const files = await query
    .orderBy(desc(cloudFiles.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(cloudFiles);

  return {
    files,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
}

export async function moveFile(fileId: string, newPath: string) {
  const file = await getFile(fileId);
  if (!file) throw new Error('File not found');

  if (file.provider === 's3' || file.provider === 'minio') {
    const command = new CopyObjectCommand({
      Bucket: file.bucket || DEFAULT_BUCKET,
      CopySource: `${file.bucket || DEFAULT_BUCKET}/${file.path}`,
      Key: newPath,
    });
    await s3Client.send(command);

    // Delete old object
    const deleteCommand = new DeleteObjectCommand({
      Bucket: file.bucket || DEFAULT_BUCKET,
      Key: file.path,
    });
    await s3Client.send(deleteCommand);
  } else {
    // Arquivo local
    const newFullPath = path.join(path.dirname(file.path), path.basename(newPath));
    await fs.rename(file.path, newFullPath);
  }

  await db.update(cloudFiles)
    .set({ path: newPath, updatedAt: new Date() })
    .where(eq(cloudFiles.id, fileId));

  return true;
}

export async function copyFile(fileId: string) {
  const file = await getFile(fileId);
  if (!file) throw new Error('File not found');

  const newName = `${path.parse(file.storedName).name}_copy${path.parse(file.storedName).ext}`;
  const newPath = file.provider === 'local' ? path.join(path.dirname(file.path), newName) : `copies/${newName}`;

  if (file.provider === 's3' || file.provider === 'minio') {
    const command = new CopyObjectCommand({
      Bucket: file.bucket || DEFAULT_BUCKET,
      CopySource: `${file.bucket || DEFAULT_BUCKET}/${file.path}`,
      Key: newPath,
    });
    await s3Client.send(command);
  } else {
    // Arquivo local
    await fs.copyFile(file.path, path.join(path.dirname(file.path), newName));
  }

  const [newFile] = await db.insert(cloudFiles).values({
    originalName: `${file.originalName} (Copy)`,
    storedName: newName,
    mimeType: file.mimeType,
    size: file.size,
    provider: file.provider,
    bucket: file.bucket,
    path: newPath,
    publicUrl: file.publicUrl ? `${path.dirname(file.publicUrl)}/${newName}` : null,
    status: 'ready',
    entityType: file.entityType,
    entityId: file.entityId,
    isPublic: file.isPublic,
    uploadedBy: file.uploadedBy,
  }).returning();

  return newFile;
}

export async function getStorageStats() {
  const stats = await db
    .select({
      type: sql<string>`substring(mime_type from 1 for position('/' in mime_type))`,
      count: sql<number>`count(*)`,
      size: sql<number>`sum(size)`,
    })
    .from(cloudFiles)
    .where(eq(cloudFiles.status, 'ready'))
    .groupBy(sql`substring(mime_type from 1 for position('/' in mime_type))`);

  const byType: Record<string, { count: number; size: number }> = {};
  let totalFiles = 0;
  let totalSize = 0;

  stats.forEach(stat => {
    byType[stat.type] = { count: stat.count, size: stat.size };
    totalFiles += stat.count;
    totalSize += stat.size;
  });

  const byProvider = await db
    .select({
      provider: cloudFiles.provider,
      count: sql<number>`count(*)`,
      size: sql<number>`sum(size)`,
    })
    .from(cloudFiles)
    .where(eq(cloudFiles.status, 'ready'))
    .groupBy(cloudFiles.provider);

  return {
    totalFiles,
    totalSize,
    byType,
    byProvider: byProvider.reduce((acc, stat) => {
      acc[stat.provider] = { count: stat.count, size: stat.size };
      return acc;
    }, {} as Record<string, { count: number; size: number }>),
  };
}

export async function cleanupExpired() {
  const expiredFiles = await db
    .select()
    .from(cloudFiles)
    .where(and(
      sql`${cloudFiles.expiresAt} < NOW()`,
      eq(cloudFiles.status, 'ready')
    ));

  for (const file of expiredFiles) {
    await deleteFile(file.id);
  }

  return expiredFiles.length;
}

export async function setFilePublic(fileId: string, isPublic: boolean) {
  const file = await getFile(fileId);
  if (!file) throw new Error('File not found');

  await db.update(cloudFiles)
    .set({ isPublic, updatedAt: new Date() })
    .where(eq(cloudFiles.id, fileId));

  return true;
}