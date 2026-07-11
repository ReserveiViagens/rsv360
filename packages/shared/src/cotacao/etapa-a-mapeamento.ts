import type { WizardProfile } from './intencao-acomodacao.js';

/** Espelho tipado de `data/etapa-a/mapeamento-tipo-17-unidades.csv` (anti-drift via teste). */
export interface EtapaAUnidadeMapeamento {
  rsv360Id: number;
  codigoExterno: string;
  titulo: string;
  hotelId: string;
  quartos: number;
  capacidadeMax: number;
  precoDiariaFlat: number;
  tipoTarifario: string;
  upgradeVaranda: boolean;
  upgradeVarandaRs: number | null;
  premiumAncora: boolean;
}

export const ETAPA_A_MAPEAMENTO: readonly EtapaAUnidadeMapeamento[] = [
  {
    rsv360Id: 8,
    codigoExterno: 'AGF-STD',
    titulo: 'Suite Standard',
    hotelId: 'a-guas-da-fonte',
    quartos: 1,
    capacidadeMax: 2,
    precoDiariaFlat: 350,
    tipoTarifario: '1 quarto / até 4',
    upgradeVaranda: false,
    upgradeVarandaRs: null,
    premiumAncora: false,
  },
  {
    rsv360Id: 9,
    codigoExterno: 'AGF-FAM',
    titulo: 'Suite Familia',
    hotelId: 'a-guas-da-fonte',
    quartos: 1,
    capacidadeMax: 4,
    precoDiariaFlat: 420,
    tipoTarifario: '1 quarto / até 4',
    upgradeVaranda: false,
    upgradeVarandaRs: null,
    premiumAncora: false,
  },
  {
    rsv360Id: 10,
    codigoExterno: 'ATR-DUP',
    titulo: 'Quarto Duplo Standard',
    hotelId: 'atrium-thermas',
    quartos: 1,
    capacidadeMax: 2,
    precoDiariaFlat: 349,
    tipoTarifario: '1 quarto / até 4',
    upgradeVaranda: false,
    upgradeVarandaRs: null,
    premiumAncora: false,
  },
  {
    rsv360Id: 11,
    codigoExterno: 'ATR-FAM',
    titulo: 'Quarto Familia',
    hotelId: 'atrium-thermas',
    quartos: 1,
    capacidadeMax: 4,
    precoDiariaFlat: 400,
    tipoTarifario: '1 quarto / até 4',
    upgradeVaranda: false,
    upgradeVarandaRs: null,
    premiumAncora: false,
  },
  {
    rsv360Id: 12,
    codigoExterno: 'ATR-SUV',
    titulo: 'Suite com Varanda',
    hotelId: 'atrium-thermas',
    quartos: 1,
    capacidadeMax: 3,
    precoDiariaFlat: 380,
    tipoTarifario: '1 quarto / até 4',
    upgradeVaranda: true,
    upgradeVarandaRs: 80,
    premiumAncora: false,
  },
  {
    rsv360Id: 13,
    codigoExterno: 'ALD-DUP',
    titulo: 'Chale Duplo',
    hotelId: 'aldeia-do-lago',
    quartos: 1,
    capacidadeMax: 2,
    precoDiariaFlat: 380,
    tipoTarifario: '1 quarto / até 4',
    upgradeVaranda: false,
    upgradeVarandaRs: null,
    premiumAncora: false,
  },
  {
    rsv360Id: 14,
    codigoExterno: 'ALD-FAM',
    titulo: 'Chale Familia',
    hotelId: 'aldeia-do-lago',
    quartos: 1,
    capacidadeMax: 8,
    precoDiariaFlat: 600,
    tipoTarifario: 'Premium âncora',
    upgradeVaranda: false,
    upgradeVarandaRs: null,
    premiumAncora: true,
  },
  {
    rsv360Id: 15,
    codigoExterno: 'ALV-LUX',
    titulo: 'Apartamento Luxo com Cozinha',
    hotelId: 'alta-vista-thermas',
    quartos: 1,
    capacidadeMax: 4,
    precoDiariaFlat: 480,
    tipoTarifario: 'Premium / varanda',
    upgradeVaranda: false,
    upgradeVarandaRs: null,
    premiumAncora: false,
  },
  {
    rsv360Id: 16,
    codigoExterno: 'ALV-PRE',
    titulo: 'Apartamento Premium com Varanda',
    hotelId: 'alta-vista-thermas',
    quartos: 2,
    capacidadeMax: 5,
    precoDiariaFlat: 550,
    tipoTarifario: 'Premium / varanda',
    upgradeVaranda: false,
    upgradeVarandaRs: null,
    premiumAncora: false,
  },
  {
    rsv360Id: 17,
    codigoExterno: 'AQR-CZ',
    titulo: 'Suite com Cozinha Compacta',
    hotelId: 'aquarius-residence',
    quartos: 1,
    capacidadeMax: 3,
    precoDiariaFlat: 320,
    tipoTarifario: '1 quarto / até 4',
    upgradeVaranda: false,
    upgradeVarandaRs: null,
    premiumAncora: false,
  },
  {
    rsv360Id: 18,
    codigoExterno: 'AQR-FAM',
    titulo: 'Suite Familia com Varanda',
    hotelId: 'aquarius-residence',
    quartos: 2,
    capacidadeMax: 5,
    precoDiariaFlat: 449,
    tipoTarifario: '2 quartos / até 6',
    upgradeVaranda: true,
    upgradeVarandaRs: 80,
    premiumAncora: false,
  },
  {
    rsv360Id: 19,
    codigoExterno: 'PRT1-2Q',
    titulo: 'Apto 2 Quartos (1 suite)',
    hotelId: 'priva-das-thermas-i',
    quartos: 2,
    capacidadeMax: 6,
    precoDiariaFlat: 400,
    tipoTarifario: '2 quartos / até 6',
    upgradeVaranda: false,
    upgradeVarandaRs: null,
    premiumAncora: false,
  },
  {
    rsv360Id: 20,
    codigoExterno: 'DRF-1Q',
    titulo: 'Apto 1 Quarto',
    hotelId: 'diroma-fiori',
    quartos: 1,
    capacidadeMax: 5,
    precoDiariaFlat: 394,
    tipoTarifario: '1 quarto / até 4',
    upgradeVaranda: false,
    upgradeVarandaRs: null,
    premiumAncora: false,
  },
  {
    rsv360Id: 21,
    codigoExterno: 'SDC-2Q',
    titulo: 'Apto 2 Quartos',
    hotelId: 'sol-das-caldas',
    quartos: 2,
    capacidadeMax: 7,
    precoDiariaFlat: 360,
    tipoTarifario: '2 quartos / até 6',
    upgradeVaranda: false,
    upgradeVarandaRs: null,
    premiumAncora: false,
  },
  {
    rsv360Id: 22,
    codigoExterno: 'DAP-2Q',
    titulo: 'Apto 2 Quartos com Churrasqueira',
    hotelId: 'diroma-acqua-park',
    quartos: 2,
    capacidadeMax: 6,
    precoDiariaFlat: 280,
    tipoTarifario: '2 quartos / até 6',
    upgradeVaranda: false,
    upgradeVarandaRs: null,
    premiumAncora: false,
  },
  {
    rsv360Id: 27,
    codigoExterno: 'KN39H',
    titulo: 'Lacqua diRoma IV Apto 196',
    hotelId: 'lacqua-diroma',
    quartos: 1,
    capacidadeMax: 5,
    precoDiariaFlat: 120,
    tipoTarifario: '1 quarto / até 4',
    upgradeVaranda: false,
    upgradeVarandaRs: null,
    premiumAncora: false,
  },
  {
    rsv360Id: 419,
    codigoExterno: 'VC-APTO-409-GOLDEN-DOLPHIN-SUPREME',
    titulo: 'Apto 409 Golden Dolphin Supreme',
    hotelId: 'golden-dolphin-supreme',
    quartos: 1,
    capacidadeMax: 4,
    precoDiariaFlat: 405,
    tipoTarifario: 'Premium / varanda',
    upgradeVaranda: false,
    upgradeVarandaRs: null,
    premiumAncora: false,
  },
] as const;

export const ETAPA_A_UNIDADES_BY_CODIGO: ReadonlyMap<string, EtapaAUnidadeMapeamento> = new Map(
  ETAPA_A_MAPEAMENTO.map((u) => [u.codigoExterno, u]),
);

export const ETAPA_A_HOTEL_IDS: ReadonlySet<string> = new Set(
  ETAPA_A_MAPEAMENTO.map((u) => u.hotelId),
);

/** Códigos âncora com pin determinístico por hotel + perfil. */
export const ETAPA_A_ANCORA_CODIGOS = ['KN39H', 'ATR-SUV', 'AQR-FAM', 'ALD-FAM'] as const;

export function isEtapaAHotel(hotelId: string | undefined | null): boolean {
  return Boolean(hotelId && ETAPA_A_HOTEL_IDS.has(hotelId));
}

export function getEtapaAUnidade(codigoExterno: string): EtapaAUnidadeMapeamento | undefined {
  return ETAPA_A_UNIDADES_BY_CODIGO.get(codigoExterno);
}

/** Badge de papel no Passo 2 (unidade real + rótulo de produto). */
export function papelLabelFromUnidade(unit: EtapaAUnidadeMapeamento): string {
  if (unit.codigoExterno === 'KN39H') return 'Entrada';
  if (unit.premiumAncora) return 'Premium';
  if (unit.upgradeVaranda && unit.quartos === 1) return '1 quarto';
  if (unit.upgradeVaranda && unit.quartos >= 2) return '2 quartos';
  return unit.tipoTarifario;
}

function isPerfilCasalPadrao(perfil: WizardProfile, adultos: number, criancas: number): boolean {
  const hospedes = adultos + criancas;
  return perfil === 'casal' && criancas === 0 && adultos === 2 && hospedes <= 2;
}

function isPerfilFamiliaPadrao(
  perfil: WizardProfile,
  adultos: number,
  criancas: number,
): boolean {
  const hospedes = adultos + criancas;
  return perfil === 'familia' || criancas >= 1 || hospedes >= 3;
}

/**
 * Pins exatos hotel × perfil. `undefined` = sem pin (cair em relevância + badges CSV).
 */
export function getPinnedCodigosExternos(
  hotelId: string,
  perfil: WizardProfile,
  adultos: number,
  criancas: number,
): string[] | undefined {
  if (hotelId === 'lacqua-diroma' && isPerfilCasalPadrao(perfil, adultos, criancas)) {
    return ['KN39H'];
  }
  if (hotelId === 'atrium-thermas' && isPerfilCasalPadrao(perfil, adultos, criancas)) {
    return ['ATR-SUV'];
  }
  if (hotelId === 'aquarius-residence' && isPerfilFamiliaPadrao(perfil, adultos, criancas)) {
    return ['AQR-FAM'];
  }
  if (hotelId === 'aldeia-do-lago') {
    return ['ALD-FAM'];
  }
  return undefined;
}
