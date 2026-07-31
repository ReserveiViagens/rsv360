import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'fs';
import { join, resolve } from 'path';
import { tmpdir } from 'os';
import {
  UnsafeCsvPathError,
  isPathInside,
  resolveSafeCsvPath,
} from '../../../../server/modules/acomodacoes/sync/safe-csv-path';

describe('resolveSafeCsvPath (PR-07a LFI sandbox)', () => {
  let tempRoot: string;
  let allowedFile: string;

  beforeEach(() => {
    tempRoot = mkdtempSync(join(tmpdir(), 'pr07a-data-'));
    mkdirSync(join(tempRoot, 'cotacao'), { recursive: true });
    allowedFile = join(tempRoot, 'cotacao', 'valid.csv');
    writeFileSync(allowedFile, 'nome_oficial\nHotel Teste\n', 'utf8');
  });

  afterEach(() => {
    rmSync(tempRoot, { recursive: true, force: true });
  });

  it('permite caminho relativo válido sob o root allowlist', () => {
    const resolved = resolveSafeCsvPath('cotacao/valid.csv', [tempRoot]);
    expect(resolved).toBe(resolve(tempRoot, 'cotacao', 'valid.csv'));
    expect(isPathInside(tempRoot, resolved)).toBe(true);
  });

  it('permite caminho absoluto dentro do root', () => {
    const resolved = resolveSafeCsvPath(allowedFile, [tempRoot]);
    expect(resolved).toBe(resolve(allowedFile));
  });

  it('bloqueia traversal ../../etc/passwd', () => {
    expect(() => resolveSafeCsvPath('../../etc/passwd', [tempRoot])).toThrow(UnsafeCsvPathError);
  });

  it('bloqueia ../ em posição que escape o root', () => {
    expect(() => resolveSafeCsvPath('cotacao/../../../etc/passwd', [tempRoot])).toThrow(
      UnsafeCsvPathError,
    );
  });

  it('bloqueia caminho absoluto fora do root', () => {
    const outside = resolve(tmpdir(), 'outside-pr07a.csv');
    writeFileSync(outside, 'x\n', 'utf8');
    try {
      expect(() => resolveSafeCsvPath(outside, [tempRoot])).toThrow(UnsafeCsvPathError);
    } finally {
      rmSync(outside, { force: true });
    }
  });

  it('rejeita csvPath vazio ou null-byte', () => {
    expect(() => resolveSafeCsvPath('   ', [tempRoot])).toThrow(UnsafeCsvPathError);
    expect(() => resolveSafeCsvPath('cotacao/valid.csv\0.txt', [tempRoot])).toThrow(
      UnsafeCsvPathError,
    );
  });
});
