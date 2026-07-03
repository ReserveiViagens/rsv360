/** Papéis com acesso ao módulo /anfitriao */
export const ANFITRIAO_MODULE_ROLES = ['anfitriao', 'corretor', 'admin', 'manager'] as const;

export function getPostLoginPath(role?: string): string {
  if (role === 'anfitriao' || role === 'corretor') {
    return '/anfitriao';
  }
  return '/dashboard';
}

export function canAccessAnfitriaoModule(role?: string): boolean {
  if (!role) return false;
  return (ANFITRIAO_MODULE_ROLES as readonly string[]).includes(role);
}
