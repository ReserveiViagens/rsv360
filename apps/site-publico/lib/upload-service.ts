/**
 * ✅ SERVIÇO DE UPLOAD DE ARQUIVOS
 * Upload para S3, Cloudinary ou sistema local com validação e compressão
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';

// Importação opcional do Cloudinary
let cloudinary: any = null;
try {
  const cloudinaryModule = require('cloudinary');
  cloudinary = cloudinaryModule.v2;
  // Configuração Cloudinary
  if (process.env.CLOUDINARY_CLOUD_NAME && cloudinary) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
} catch (error) {
  // Cloudinary não instalado, continuar sem ele
  console.warn('Cloudinary não disponível. Uploads para Cloudinary serão ignorados.');
}

// Configuração S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export interface UploadOptions {
  folder?: string;
  maxSize?: number; // em bytes
  allowedTypes?: string[];
  compress?: boolean;
  generateThumbnail?: boolean;
}

export interface UploadConfig {
  maxFiles: number;
  maxSizeMB: number;
  folder: string;
  type: 'photo' | 'document' | 'avatar' | 'other';
  compressImages: boolean;
  generateThumbnails: boolean;
}

export interface UploadedFile {
  id: string;
  name: string;
  url: string;
  size?: number;
  type?: string;
}

/**
 * ✅ Validar arquivo
 */
function validateFile(file: File, options: UploadOptions = {}): void {
  const maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB padrão
  const allowedTypes = options.allowedTypes || [
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/webm',
  ];

  if (file.size > maxSize) {
    throw new Error(`Arquivo muito grande. Tamanho máximo: ${maxSize / 1024 / 1024}MB`);
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Tipo de arquivo não permitido: ${file.type}`);
  }
}

/**
 * ✅ Comprimir imagem
 */
async function compressImage(buffer: Buffer, quality: number = 80): Promise<Buffer> {
  try {
    return await sharp(buffer)
      .jpeg({ quality })
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .toBuffer();
  } catch (error) {
    console.warn('Erro ao comprimir imagem, retornando original:', error);
    return buffer;
  }
}

/**
 * ✅ Gerar thumbnail
 */
async function generateThumbnail(buffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(buffer)
      .resize(300, 300, { fit: 'cover' })
      .jpeg({ quality: 70 })
      .toBuffer();
  } catch (error) {
    console.warn('Erro ao gerar thumbnail:', error);
    return buffer;
  }
}

/**
 * ✅ Upload para S3
 */
async function uploadToS3(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const bucket = process.env.AWS_S3_BUCKET || 'rsv360-uploads';

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read',
  });

  await s3Client.send(command);

  const region = process.env.AWS_REGION || 'us-east-1';
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

/**
 * ✅ Upload para Cloudinary
 */
async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  resourceType: 'image' | 'video' = 'image'
): Promise<string> {
  if (!cloudinary) {
    throw new Error('Cloudinary não está configurado. Instale o pacote cloudinary ou configure as variáveis de ambiente.');
  }
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result?.secure_url || '');
        }
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * ✅ Upload para sistema local
 */
async function uploadToLocal(
  buffer: Buffer,
  filename: string,
  folder: string
): Promise<string> {
  const uploadDir = join(process.cwd(), 'public', 'uploads', folder);
  await mkdir(uploadDir, { recursive: true });

  const filepath = join(uploadDir, filename);
  await writeFile(filepath, buffer);

  return `/uploads/${folder}/${filename}`;
}

/**
 * ✅ Upload de arquivo
 */
export async function uploadFile(
  file: File,
  folder: string = 'general',
  options: UploadOptions = {}
): Promise<string> {
  // Validar arquivo
  validateFile(file, options);

  // Ler arquivo como buffer
  const arrayBuffer = await file.arrayBuffer();
  let buffer = Buffer.from(arrayBuffer);

  // Comprimir imagem se solicitado
  if (options.compress && file.type.startsWith('image/')) {
    buffer = await compressImage(buffer);
  }

  // Gerar nome único
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = file.name.split('.').pop() || 'bin';
  const filename = `${timestamp}-${random}.${extension}`;
  const key = `${folder}/${filename}`;

  // Escolher método de upload baseado na configuração
  const uploadMethod = process.env.UPLOAD_METHOD || 'local';

  let url: string;

  switch (uploadMethod) {
    case 's3':
      url = await uploadToS3(buffer, key, file.type);
      break;
    case 'cloudinary':
      const resourceType = file.type.startsWith('video/') ? 'video' : 'image';
      url = await uploadToCloudinary(buffer, folder, resourceType);
      break;
    case 'local':
    default:
      url = await uploadToLocal(buffer, filename, folder);
      break;
  }

  // Gerar thumbnail se solicitado
  if (options.generateThumbnail && file.type.startsWith('image/')) {
    try {
      const thumbnailBuffer = await generateThumbnail(buffer);
      const thumbnailKey = `${folder}/thumbnails/${filename}`;
      
      switch (uploadMethod) {
        case 's3':
          await uploadToS3(thumbnailBuffer, thumbnailKey, 'image/jpeg');
          break;
        case 'cloudinary':
          await uploadToCloudinary(thumbnailBuffer, `${folder}/thumbnails`, 'image');
          break;
        case 'local':
          await uploadToLocal(thumbnailBuffer, filename, `${folder}/thumbnails`);
          break;
      }
    } catch (error) {
      console.warn('Erro ao gerar thumbnail:', error);
    }
  }

  return url;
}

/**
 * ✅ Deletar arquivo
 */
export async function deleteFile(url: string): Promise<void> {
  const uploadMethod = process.env.UPLOAD_METHOD || 'local';

  if (uploadMethod === 's3') {
    // Extrair bucket e key da URL
    const urlMatch = url.match(/https:\/\/([^.]+)\.s3\.([^.]+)\.amazonaws\.com\/(.+)/);
    if (urlMatch) {
      const [, bucket, , key] = urlMatch;
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      });
      await s3Client.send(command);
    }
  } else if (uploadMethod === 'cloudinary') {
    if (!cloudinary) {
      throw new Error('Cloudinary não está configurado.');
    }
    // Extrair public_id da URL
    const publicIdMatch = url.match(/\/v\d+\/(.+)\.(jpg|png|webp|mp4|webm)/);
    if (publicIdMatch) {
      const publicId = publicIdMatch[1];
      await cloudinary.uploader.destroy(publicId);
    }
  } else {
    // Deletar arquivo local
    const filepath = join(process.cwd(), 'public', url);
    try {
      await unlink(filepath);
    } catch (error) {
      console.warn('Erro ao deletar arquivo local:', error);
    }
  }
}

/**
 * Validar requisição de upload e retornar usuário autenticado
 */
export async function validateUploadRequest(request: Request): Promise<{ id: number; email: string }> {
  const { advancedAuthMiddleware } = await import('./advanced-auth');
  const { user, error } = await advancedAuthMiddleware(request as any);
  if (error || !user) {
    throw new Error(error || 'Não autenticado');
  }
  return { id: user.id, email: user.email };
}

/**
 * Processar múltiplos uploads
 */
export async function processUpload(
  files: File[],
  userId: number,
  config: UploadConfig
): Promise<UploadedFile[]> {
  const maxFiles = config.maxFiles || 10;
  const maxSizeBytes = (config.maxSizeMB || 10) * 1024 * 1024;
  const folder = config.folder || 'uploads';

  if (files.length > maxFiles) {
    throw new Error(`Máximo de ${maxFiles} arquivos permitidos`);
  }

  const options: UploadOptions = {
    folder,
    maxSize: maxSizeBytes,
    compress: config.compressImages,
    generateThumbnail: config.generateThumbnails,
  };

  const results: UploadedFile[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const url = await uploadFile(file, folder, options);
    results.push({
      id: `upload-${userId}-${Date.now()}-${i}`,
      name: file.name,
      url,
      size: file.size,
      type: file.type,
    });
  }
  return results;
}
