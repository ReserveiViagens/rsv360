/**
 * Tipos para o Menu Radial RSV 360° Plataforma Completa
 */

export type Role = 'proprietario' | 'operador' | 'admin';

export interface SubmenuItem {
  label: string;
  href: string;
  icon?: string;
  external?: boolean;
}

export interface RadialModule {
  id: string;
  label: string;
  icon: string;
  color: string;
  submenus: SubmenuItem[];
  roles: Role[];
  badge?: string;
}

export interface CoreConfig {
  id: string;
  label: string;
  dataSource: 'reservas' | 'clientes' | 'propriedades';
  metrics?: { label: string; value: string | number }[];
}

/** Configuração de um grupo do menu (Grupo 1 ou Grupo 2) para customização */
export interface RadialMenuGroupConfig {
  label: string;
  moduleIds?: string[];
}

/** Configuração dos dois grupos (esquerda/direita) com labels e opcionalmente IDs customizados */
export interface RadialMenuGroupsConfig {
  groupA: RadialMenuGroupConfig;
  groupB: RadialMenuGroupConfig;
}

export interface RadialMenuConfig {
  core: CoreConfig;
  modules: RadialModule[];
  rotation: {
    enabled: boolean;
    anglePerModule: number;
    initialAngle: number;
  };
  /** Opcional: labels e listas de módulos por grupo para UI e fallback */
  groups?: RadialMenuGroupsConfig;
}
