export type WeekdayCode = 'dom' | 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab';

export type TurnoRoteiro = 'manha' | 'tarde' | 'noite' | 'dia_inteiro';

export type PublicoRoteiro = 'casal' | 'familia' | 'todos';

export type TipoAtracaoRoteiro =
  | 'passeio'
  | 'feira'
  | 'monumento'
  | 'shopping'
  | 'restaurante'
  | 'parque'
  | 'relax_hotel'
  | 'cafe';

export interface RoteiroAtracao {
  slug: string;
  nome: string;
  tipo: TipoAtracaoRoteiro | string;
  turnos: TurnoRoteiro[];
  dias_funcionamento: WeekdayCode[];
  publico: PublicoRoteiro | string;
  faixa_preco?: string | null;
  descricao?: string | null;
  dica?: string | null;
  endereco?: string | null;
  lat?: number | null;
  lng?: number | null;
  imagem_url?: string | null;
  ordem?: number;
  ativo?: boolean;
  metadata?: Record<string, unknown>;
}

export interface SlotRoteiro {
  turno: TurnoRoteiro;
  atracaoSlug: string | null;
  titulo: string;
  descricao?: string;
  tipo?: string;
  /** Quando true, caller pode aplicar heuristica legada para o slot. */
  fallback?: boolean;
}

export interface ContextoRoteiroDia {
  dia: number;
  dataIso: string;
  perfil: 'casal' | 'familia';
  isUltimoDia: boolean;
  isPrimeiroDia: boolean;
  amenidadesHotel?: string[];
  slugsUsados: Set<string>;
}

export interface DiaRoteiroMontado {
  dia: number;
  dataIso: string;
  slots: SlotRoteiro[];
}

export interface MontarRoteiroCompletoInput {
  checkIn: string;
  checkOut: string;
  perfil?: 'casal' | 'familia';
  amenidadesHotel?: string[];
  catalogoAtracoes: RoteiroAtracao[];
}

export interface RoteiroCompleto {
  dias: DiaRoteiroMontado[];
  slugsUsados: string[];
}
