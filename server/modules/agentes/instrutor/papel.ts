import type { InstrutorPapel } from './tipos';

const ANFITRIAO_ROLES = new Set(['anfitriao', 'corretor', 'host']);

export function papelFromRole(role?: string | null): Exclude<InstrutorPapel, 'ambos'> {
  if (role && ANFITRIAO_ROLES.has(String(role).toLowerCase())) return 'anfitriao';
  return 'staff';
}

export function resolvePapel(
  role: string | null | undefined,
  bodyPapel?: InstrutorPapel,
): Exclude<InstrutorPapel, 'ambos'> {
  if (bodyPapel === 'staff' || bodyPapel === 'anfitriao') return bodyPapel;
  return papelFromRole(role);
}
