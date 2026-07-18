/**
 * Ambient types for optional OCR (IMPORT_OCR_ENABLED).
 * tesseract.js is intentionally NOT a runtime dependency - dynamic import
 * is behind flag + try/catch. This declaration types only the surface used
 * by server/modules/acomodacoes/import/parse.ts.
 */
declare module 'tesseract.js' {
  export interface RecognizeResult {
    data: {
      text?: string;
    };
  }

  export interface Worker {
    recognize(image: Buffer | Uint8Array | string): Promise<RecognizeResult>;
    terminate(): Promise<void>;
  }

  export function createWorker(lang?: string): Promise<Worker>;
}
