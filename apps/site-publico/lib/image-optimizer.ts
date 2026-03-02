/**
 * ✅ OTIMIZADOR DE IMAGENS
 * 
 * Sistema para otimizar imagens:
 * - Compressão
 * - Redimensionamento
 * - Conversão de formato
 * - Geração de thumbnails
 * 
 * NOTA: Requer sharp: npm install sharp
 */

import sharp from 'sharp';

export interface ImageOptimizationOptions {
  quality?: number; // 1-100, padrão: 85
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
  progressive?: boolean; // JPEG progressive
  strip?: boolean; // Remover metadados
}

const DEFAULT_OPTIONS: Required<ImageOptimizationOptions> = {
  quality: 85,
  maxWidth: 1920,
  maxHeight: 1080,
  format: 'jpeg',
  progressive: true,
  strip: true,
};

/**
 * Otimizar imagem
 */
export async function optimizeImage(
  buffer: Buffer,
  options: ImageOptimizationOptions = {}
): Promise<Buffer> {
  try {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    let pipeline = sharp(buffer);

    // Redimensionar se necessário
    if (opts.maxWidth || opts.maxHeight) {
      pipeline = pipeline.resize(opts.maxWidth, opts.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Remover metadados
    if (opts.strip) {
      pipeline = pipeline.strip();
    }

    // Converter formato e aplicar qualidade
    switch (opts.format) {
      case 'jpeg':
        pipeline = pipeline.jpeg({
          quality: opts.quality,
          progressive: opts.progressive,
          mozjpeg: true, // Melhor compressão
        });
        break;
      case 'png':
        pipeline = pipeline.png({
          quality: opts.quality,
          compressionLevel: 9,
        });
        break;
      case 'webp':
        pipeline = pipeline.webp({
          quality: opts.quality,
        });
        break;
      case 'avif':
        pipeline = pipeline.avif({
          quality: opts.quality,
        });
        break;
    }

    return await pipeline.toBuffer();
  } catch (error: any) {
    console.error('Erro ao otimizar imagem:', error);
    // Retornar buffer original em caso de erro
    return buffer;
  }
}

/**
 * Gerar thumbnail
 */
export async function generateThumbnail(
  buffer: Buffer,
  width: number = 300,
  height: number = 300,
  quality: number = 80
): Promise<Buffer> {
  try {
    return await sharp(buffer)
      .resize(width, height, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({
        quality,
        progressive: true,
        mozjpeg: true,
      })
      .toBuffer();
  } catch (error: any) {
    console.error('Erro ao gerar thumbnail:', error);
    throw error;
  }
}

/**
 * Obter metadados da imagem
 */
export async function getImageMetadata(buffer: Buffer): Promise<{
  width: number;
  height: number;
  format: string;
  size: number;
  hasAlpha: boolean;
}> {
  try {
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || 'unknown',
      size: buffer.length,
      hasAlpha: metadata.hasAlpha || false,
    };
  } catch (error: any) {
    console.error('Erro ao obter metadados:', error);
    throw error;
  }
}

/**
 * Converter imagem para formato específico
 */
export async function convertImageFormat(
  buffer: Buffer,
  format: 'jpeg' | 'png' | 'webp' | 'avif',
  quality: number = 85
): Promise<Buffer> {
  try {
    let pipeline = sharp(buffer);

    switch (format) {
      case 'jpeg':
        pipeline = pipeline.jpeg({ quality, progressive: true, mozjpeg: true });
        break;
      case 'png':
        pipeline = pipeline.png({ quality, compressionLevel: 9 });
        break;
      case 'webp':
        pipeline = pipeline.webp({ quality });
        break;
      case 'avif':
        pipeline = pipeline.avif({ quality });
        break;
    }

    return await pipeline.toBuffer();
  } catch (error: any) {
    console.error('Erro ao converter formato:', error);
    throw error;
  }
}

/**
 * Otimizar imagem para web (formato moderno com fallback)
 */
export async function optimizeForWeb(buffer: Buffer): Promise<{
  original: Buffer;
  webp?: Buffer;
  avif?: Buffer;
  thumbnail: Buffer;
  metadata: Awaited<ReturnType<typeof getImageMetadata>>;
}> {
  try {
    const metadata = await getImageMetadata(buffer);

    // Gerar versões otimizadas
    const [webp, avif, thumbnail] = await Promise.all([
      convertImageFormat(buffer, 'webp', 85).catch(() => undefined),
      convertImageFormat(buffer, 'avif', 85).catch(() => undefined),
      generateThumbnail(buffer, 300, 300, 80),
    ]);

    // Otimizar original
    const optimized = await optimizeImage(buffer, {
      quality: 85,
      maxWidth: 1920,
      maxHeight: 1080,
      format: 'jpeg',
    });

    return {
      original: optimized,
      webp,
      avif,
      thumbnail,
      metadata,
    };
  } catch (error: any) {
    console.error('Erro ao otimizar para web:', error);
    throw error;
  }
}

