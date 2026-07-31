import { isAbsolute, relative, resolve, sep } from 'path';

export class UnsafeCsvPathError extends Error {
  constructor(message = 'csvPath fora do diretório permitido') {
    super(message);
    this.name = 'UnsafeCsvPathError';
  }
}

/** Allowlisted roots for CSV sync (repo `data/` from cwd or parent when cwd is `backend/`). */
export function getDefaultCsvAllowRoots(): string[] {
  return [resolve(process.cwd(), 'data'), resolve(process.cwd(), '..', 'data')];
}

export function isPathInside(root: string, candidate: string): boolean {
  const rootResolved = resolve(root);
  const candidateResolved = resolve(candidate);
  const rel = relative(rootResolved, candidateResolved);
  return rel === '' || (!rel.startsWith(`..${sep}`) && rel !== '..' && !isAbsolute(rel));
}

/**
 * Resolve a user-supplied csvPath under allowlisted `data/` roots.
 * Absolute paths must land inside a root; relative paths are joined to each root.
 * Path traversal that escapes the root is rejected (e.g. `../../etc/passwd`).
 */
export function resolveSafeCsvPath(
  userPath: string,
  allowedRoots: string[] = getDefaultCsvAllowRoots(),
): string {
  if (typeof userPath !== 'string' || !userPath.trim()) {
    throw new UnsafeCsvPathError('csvPath inválido');
  }
  const trimmed = userPath.trim();
  if (trimmed.includes('\0')) {
    throw new UnsafeCsvPathError('csvPath inválido');
  }

  const roots = allowedRoots.map((r) => resolve(r));
  const candidates = isAbsolute(trimmed)
    ? [resolve(trimmed)]
    : roots.map((root) => resolve(root, trimmed));

  for (const candidate of candidates) {
    for (const root of roots) {
      if (isPathInside(root, candidate)) {
        return candidate;
      }
    }
  }

  throw new UnsafeCsvPathError('csvPath fora do diretório permitido');
}
