/**
 * ✅ SERVIÇO DE STORAGE
 * Gerencia upload e download de arquivos (S3 ou Local)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { queryDatabase } from './db';

export interface StorageConfig {
  type: 'local' | 's3';
  localPath?: string;
  s3Bucket?: string;
  s3Region?: string;
  s3AccessKey?: string;
  s3SecretKey?: string;
}

// Configuração padrão
const getStorageConfig = (): StorageConfig => {
  return {
    type: (process.env.STORAGE_TYPE as 'local' | 's3') || 'local',
    localPath: process.env.STORAGE_LOCAL_PATH || './storage',
    s3Bucket: process.env.S3_BUCKET,
    s3Region: process.env.S3_REGION || 'us-east-1',
    s3AccessKey: process.env.S3_ACCESS_KEY,
    s3SecretKey: process.env.S3_SECRET_KEY,
  };
};

/**
 * Salvar arquivo no storage
 */
export async function saveFile(
  content: string | Buffer,
  filename: string,
  folder: string = 'exports'
): Promise<{ filePath: string; fileUrl: string; fileSize: number }> {
  const config = getStorageConfig();

  if (config.type === 's3') {
    // Upload para S3
    return await saveToS3(content, filename, folder, config);
  } else {
    // Salvar localmente
    return await saveToLocal(content, filename, folder, config);
  }
}

/**
 * Obter URL de download do arquivo
 */
export function getFileDownloadUrl(filePath: string): string {
  const config = getStorageConfig();
  
  if (config.type === 's3') {
    // URL do S3
    return `https://${config.s3Bucket}.s3.${config.s3Region}.amazonaws.com/${filePath}`;
  } else {
    // URL local
    return `/api/storage/download?path=${encodeURIComponent(filePath)}`;
  }
}

/**
 * Salvar arquivo localmente
 */
async function saveToLocal(
  content: string | Buffer,
  filename: string,
  folder: string,
  config: StorageConfig
): Promise<{ filePath: string; fileUrl: string; fileSize: number }> {
  const storagePath = config.localPath || './storage';
  const fullPath = path.join(storagePath, folder);
  const filePath = path.join(fullPath, filename);

  // Criar diretório se não existir
  try {
    await fs.mkdir(fullPath, { recursive: true });
  } catch (error) {
    // Diretório já existe
  }

  // Salvar arquivo
  const buffer = typeof content === 'string' ? Buffer.from(content, 'utf-8') : content;
  await fs.writeFile(filePath, buffer);

  const fileSize = buffer.length;
  const fileUrl = `/api/storage/download?path=${encodeURIComponent(path.join(folder, filename))}`;

  return { filePath, fileUrl, fileSize };
}

/**
 * Salvar arquivo no S3
 */
async function saveToS3(
  content: string | Buffer,
  filename: string,
  folder: string,
  config: StorageConfig
): Promise<{ filePath: string; fileUrl: string; fileSize: number }> {
  if (!config.s3Bucket || !config.s3AccessKey || !config.s3SecretKey) {
    console.warn('S3 não configurado, usando storage local');
    return await saveToLocal(content, filename, folder, { ...config, type: 'local' });
  }

  try {
    // Tentar importar AWS SDK (opcional)
    let S3Client: any;
    let PutObjectCommand: any;

    try {
      const awsSdk = require('@aws-sdk/client-s3');
      S3Client = awsSdk.S3Client;
      PutObjectCommand = awsSdk.PutObjectCommand;
    } catch (error) {
      console.warn('AWS SDK não instalado. Execute: npm install @aws-sdk/client-s3');
      console.warn('Usando storage local como fallback');
      return await saveToLocal(content, filename, folder, { ...config, type: 'local' });
    }

    const s3Client = new S3Client({
      region: config.s3Region || 'us-east-1',
      credentials: {
        accessKeyId: config.s3AccessKey!,
        secretAccessKey: config.s3SecretKey!,
      },
    });

    const key = `${folder}/${filename}`;
    const buffer = typeof content === 'string' ? Buffer.from(content, 'utf-8') : content;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: config.s3Bucket,
        Key: key,
        Body: buffer,
        ContentType: getContentType(filename),
        ACL: 'public-read', // ou 'private' dependendo da necessidade
      })
    );

    const fileUrl = `https://${config.s3Bucket}.s3.${config.s3Region || 'us-east-1'}.amazonaws.com/${key}`;
    console.log(`✅ Arquivo salvo no S3: ${fileUrl}`);

    return { filePath: key, fileUrl, fileSize: buffer.length };
  } catch (error: any) {
    console.error('Erro ao salvar no S3:', error);
    console.warn('Fallback para storage local');
    return await saveToLocal(content, filename, folder, { ...config, type: 'local' });
  }
}

/**
 * Obter content type baseado na extensão do arquivo
 */
function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const contentTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain',
    csv: 'text/csv',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    json: 'application/json',
  };
  return contentTypes[ext || ''] || 'application/octet-stream';
}

/**
 * Ler arquivo do storage
 */
export async function readFile(filePath: string): Promise<Buffer> {
  const config = getStorageConfig();

  if (config.type === 's3') {
    return await readFromS3(filePath, config);
  } else {
    const fullPath = path.join(config.localPath || './storage', filePath);
    return await fs.readFile(fullPath);
  }
}

/**
 * Ler arquivo do S3
 */
async function readFromS3(filePath: string, config: StorageConfig): Promise<Buffer> {
  if (!config.s3Bucket || !config.s3AccessKey || !config.s3SecretKey) {
    throw new Error('S3 não configurado');
  }

  try {
    const awsSdk = require('@aws-sdk/client-s3');
    const { S3Client, GetObjectCommand } = awsSdk;

    const s3Client = new S3Client({
      region: config.s3Region || 'us-east-1',
      credentials: {
        accessKeyId: config.s3AccessKey,
        secretAccessKey: config.s3SecretKey,
      },
    });

    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: config.s3Bucket,
        Key: filePath,
      })
    );

    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as any) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  } catch (error: any) {
    console.error('Erro ao ler do S3:', error);
    throw new Error(`Erro ao ler arquivo do S3: ${error.message}`);
  }
}

/**
 * Deletar arquivo do storage
 */
export async function deleteFile(filePath: string): Promise<void> {
  const config = getStorageConfig();

  if (config.type === 's3') {
    await deleteFromS3(filePath, config);
  } else {
    const fullPath = path.join(config.localPath || './storage', filePath);
    await fs.unlink(fullPath);
  }
}

/**
 * Deletar arquivo do S3
 */
async function deleteFromS3(filePath: string, config: StorageConfig): Promise<void> {
  if (!config.s3Bucket || !config.s3AccessKey || !config.s3SecretKey) {
    throw new Error('S3 não configurado');
  }

  try {
    const awsSdk = require('@aws-sdk/client-s3');
    const { S3Client, DeleteObjectCommand } = awsSdk;

    const s3Client = new S3Client({
      region: config.s3Region || 'us-east-1',
      credentials: {
        accessKeyId: config.s3AccessKey,
        secretAccessKey: config.s3SecretKey,
      },
    });

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: config.s3Bucket,
        Key: filePath,
      })
    );

    console.log(`✅ Arquivo deletado do S3: ${filePath}`);
  } catch (error: any) {
    console.error('Erro ao deletar do S3:', error);
    throw new Error(`Erro ao deletar arquivo do S3: ${error.message}`);
  }
}

/**
 * Verificar se arquivo existe
 */
export async function fileExists(filePath: string): Promise<boolean> {
  const config = getStorageConfig();

  if (config.type === 's3') {
    return await existsInS3(filePath, config);
  } else {
    const fullPath = path.join(config.localPath || './storage', filePath);
    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Verificar se arquivo existe no S3
 */
async function existsInS3(filePath: string, config: StorageConfig): Promise<boolean> {
  if (!config.s3Bucket || !config.s3AccessKey || !config.s3SecretKey) {
    return false;
  }

  try {
    const awsSdk = require('@aws-sdk/client-s3');
    const { S3Client, HeadObjectCommand } = awsSdk;

    const s3Client = new S3Client({
      region: config.s3Region || 'us-east-1',
      credentials: {
        accessKeyId: config.s3AccessKey,
        secretAccessKey: config.s3SecretKey,
      },
    });

    await s3Client.send(
      new HeadObjectCommand({
        Bucket: config.s3Bucket,
        Key: filePath,
      })
    );

    return true;
  } catch (error: any) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return false;
    }
    console.error('Erro ao verificar arquivo no S3:', error);
    return false;
  }
}

