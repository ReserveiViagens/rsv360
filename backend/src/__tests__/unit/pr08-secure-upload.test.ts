import {
  CMS_MEDIA_MIMES,
  assertImportMemoryFile,
  canonicalExtForCmsMime,
  cmsMimeMatchesMagic,
  importExtAllowed,
  importMagicMatches,
  safeStoredFilename,
  sanitizeUploadBasename,
  sniffFileKind,
} from '../../../../server/lib/secure-upload';

function jpegFixture(): Buffer {
  return Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
}

function pngFixture(): Buffer {
  return Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
}

function htmlPolyglotAsJpegClaim(): Buffer {
  // HTML body — must NOT sniff as jpeg
  return Buffer.from('<!DOCTYPE html><html><body>xss</body></html>', 'utf8');
}

function zipFixture(): Buffer {
  return Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00]);
}

describe('PR-08 secure upload helper', () => {
  it('maps CMS MIME to canonical extension (ignores originalname)', () => {
    expect(canonicalExtForCmsMime('image/jpeg')).toBe('.jpg');
    expect(safeStoredFilename('abc-uuid', 'image/png')).toBe('abc-uuid.png');
    expect(safeStoredFilename('abc-uuid', 'video/mp4')).toBe('abc-uuid.mp4');
    expect(() => safeStoredFilename('x', 'text/html')).toThrow();
  });

  it('rejects HTML spoofed as jpeg via magic bytes', () => {
    expect(sniffFileKind(htmlPolyglotAsJpegClaim())).toBe('text');
    expect(cmsMimeMatchesMagic('image/jpeg', sniffFileKind(htmlPolyglotAsJpegClaim()))).toBe(
      false,
    );
    expect(cmsMimeMatchesMagic('image/jpeg', sniffFileKind(jpegFixture()))).toBe(true);
    expect(cmsMimeMatchesMagic('image/png', sniffFileKind(pngFixture()))).toBe(true);
  });

  it('sanitizes basename and blocks path traversal names', () => {
    expect(sanitizeUploadBasename('../../etc/passwd.xlsx')).toBe('passwd.xlsx');
    expect(sanitizeUploadBasename('C:\\Windows\\evil.csv')).toBe('evil.csv');
  });

  it('allows import xlsx zip magic and rejects exe-shaped payload', () => {
    expect(importExtAllowed('plan.xlsx')).toBe(true);
    expect(importExtAllowed('plan.exe')).toBe(false);
    expect(importMagicMatches('plan.xlsx', zipFixture())).toBe(true);
    expect(importMagicMatches('plan.xlsx', htmlPolyglotAsJpegClaim())).toBe(false);
  });

  it('assertImportMemoryFile rejects MIME/ext/magic mismatches', () => {
    expect(() =>
      assertImportMemoryFile({
        fieldname: 'file',
        originalname: 'x.xlsx',
        encoding: '7bit',
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: zipFixture().length,
        buffer: zipFixture(),
        destination: '',
        filename: '',
        path: '',
        stream: undefined as never,
      }),
    ).not.toThrow();

    expect(() =>
      assertImportMemoryFile({
        fieldname: 'file',
        originalname: 'x.html',
        encoding: '7bit',
        mimetype: 'text/html',
        size: 10,
        buffer: htmlPolyglotAsJpegClaim(),
        destination: '',
        filename: '',
        path: '',
        stream: undefined as never,
      }),
    ).toThrow(/Extensão|Tipo|Conteúdo/);
  });

  it('keeps CMS MIME allowlist without svg/html/js', () => {
    expect(CMS_MEDIA_MIMES.has('image/svg+xml')).toBe(false);
    expect(CMS_MEDIA_MIMES.has('text/html')).toBe(false);
    expect(CMS_MEDIA_MIMES.has('application/javascript')).toBe(false);
    expect(CMS_MEDIA_MIMES.has('image/jpeg')).toBe(true);
  });
});
