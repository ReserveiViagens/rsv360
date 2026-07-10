import { countWizardNights } from './wizard-estadia.js';
import type {
  ContextoRoteiroDia,
  DiaRoteiroMontado,
  MontarRoteiroCompletoInput,
  RoteiroAtracao,
  RoteiroCompleto,
  SlotRoteiro,
  TurnoRoteiro,
  WeekdayCode,
} from './roteiro-atracao.types.js';

const WEEKDAY_CODES: WeekdayCode[] = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];

const NOITE_TIPO_PRIORITY = ['feira', 'restaurante', 'shopping'] as const;

const RELAX_AMENIDADE: Record<string, string> = {
  'relax-piscina-termal': 'piscina_termal',
  'relax-area-kids': 'area_kids',
};

/** Parse data civil (YYYY-MM-DD) sem shift UTC. */
export function weekdayCodeFromDate(isoDate: string): WeekdayCode {
  const [y, m, d] = isoDate.split('-').map(Number);
  const weekday = new Date(y, m - 1, d).getDay();
  return WEEKDAY_CODES[weekday];
}

/** Soma dias em data civil local (sem shift UTC). */
export function isoDateAddDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

export function atracaoDisponivelNoDia(atracao: RoteiroAtracao, isoDate: string): boolean {
  const dias = atracao.dias_funcionamento ?? [];
  if (dias.length === 0) return false;
  return dias.includes(weekdayCodeFromDate(isoDate));
}

function matchesPublico(atracao: RoteiroAtracao, perfil: 'casal' | 'familia'): boolean {
  if (atracao.publico === 'todos') return true;
  return atracao.publico === perfil;
}

function matchesRelaxHotel(atracao: RoteiroAtracao, amenidadesHotel?: string[]): boolean {
  if (atracao.tipo !== 'relax_hotel') return true;
  const required = RELAX_AMENIDADE[atracao.slug];
  if (!required) return true;
  return (amenidadesHotel ?? []).includes(required);
}

function hasTurno(atracao: RoteiroAtracao, turno: TurnoRoteiro): boolean {
  return atracao.turnos.includes(turno);
}

function slotFrom(atracao: RoteiroAtracao, turno: TurnoRoteiro): SlotRoteiro {
  return {
    turno,
    atracaoSlug: atracao.slug,
    titulo: atracao.nome,
    descricao: atracao.descricao ?? undefined,
    tipo: atracao.tipo,
  };
}

function fallbackSlot(turno: TurnoRoteiro, titulo: string): SlotRoteiro {
  return {
    turno,
    atracaoSlug: null,
    titulo,
    fallback: true,
  };
}

function filterDisponiveis(
  catalogo: RoteiroAtracao[],
  contexto: ContextoRoteiroDia,
): RoteiroAtracao[] {
  return catalogo
    .filter((a) => a.ativo !== false)
    .filter((a) => matchesPublico(a, contexto.perfil))
    .filter((a) => matchesRelaxHotel(a, contexto.amenidadesHotel))
    .filter((a) => atracaoDisponivelNoDia(a, contexto.dataIso))
    .filter((a) => !contexto.slugsUsados.has(a.slug))
    .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
}

function pickFirst(
  disponiveis: RoteiroAtracao[],
  turno: TurnoRoteiro,
  tipos?: string[],
): RoteiroAtracao | null {
  for (const atracao of disponiveis) {
    if (!hasTurno(atracao, turno)) continue;
    if (tipos && !tipos.includes(atracao.tipo)) continue;
    return atracao;
  }
  return null;
}

function pickNoite(disponiveis: RoteiroAtracao[]): RoteiroAtracao | null {
  for (const tipo of NOITE_TIPO_PRIORITY) {
    const found = pickFirst(disponiveis, 'noite', [tipo]);
    if (found) return found;
  }
  return pickFirst(disponiveis, 'noite');
}

function consume(slug: string, contexto: ContextoRoteiroDia): void {
  contexto.slugsUsados.add(slug);
}

export function montarRoteiroDia(
  contexto: ContextoRoteiroDia,
  catalogoAtracoes: RoteiroAtracao[],
): SlotRoteiro[] {
  const slots: SlotRoteiro[] = [];
  const disponiveis = filterDisponiveis(catalogoAtracoes, contexto);

  if (contexto.isUltimoDia) {
    const manha = pickFirst(disponiveis, 'manha', ['passeio', 'monumento', 'cafe']);
    if (manha) {
      slots.push(slotFrom(manha, 'manha'));
      consume(manha.slug, contexto);
    } else {
      slots.push(fallbackSlot('manha', 'Checkout — manha leve'));
    }
    return slots;
  }

  const parque = disponiveis.find((a) => a.tipo === 'parque' && hasTurno(a, 'dia_inteiro'));
  if (parque) {
    slots.push(slotFrom(parque, 'dia_inteiro'));
    consume(parque.slug, contexto);

    const noiteAtracao = pickNoite(filterDisponiveis(catalogoAtracoes, contexto));
    if (noiteAtracao) {
      slots.push(slotFrom(noiteAtracao, 'noite'));
      consume(noiteAtracao.slug, contexto);
    } else {
      slots.push(fallbackSlot('noite', 'Noite livre'));
    }
    return slots;
  }

  const manha = pickFirst(disponiveis, 'manha', ['cafe', 'passeio', 'monumento']);
  if (manha) {
    slots.push(slotFrom(manha, 'manha'));
    consume(manha.slug, contexto);
  } else {
    slots.push(fallbackSlot('manha', 'Manha livre'));
  }

  const almoco = pickFirst(filterDisponiveis(catalogoAtracoes, contexto), 'tarde', ['restaurante']);
  if (almoco) {
    slots.push(slotFrom(almoco, 'tarde'));
    consume(almoco.slug, contexto);
  }

  const tarde =
    pickFirst(filterDisponiveis(catalogoAtracoes, contexto), 'tarde', ['passeio', 'monumento']) ??
    pickFirst(filterDisponiveis(catalogoAtracoes, contexto), 'tarde', ['relax_hotel']);
  if (tarde) {
    slots.push(slotFrom(tarde, 'tarde'));
    consume(tarde.slug, contexto);
  }

  const noiteAtracao = pickNoite(filterDisponiveis(catalogoAtracoes, contexto));
  if (noiteAtracao) {
    slots.push(slotFrom(noiteAtracao, 'noite'));
    consume(noiteAtracao.slug, contexto);
  } else {
    slots.push(fallbackSlot('noite', 'Noite livre'));
  }

  return slots;
}

export function montarRoteiroCompleto(input: MontarRoteiroCompletoInput): RoteiroCompleto {
  const nights = countWizardNights(input.checkIn, input.checkOut);
  const perfil = input.perfil ?? 'casal';
  const slugsUsados = new Set<string>();
  const dias: DiaRoteiroMontado[] = [];

  const totalDias = nights > 0 ? nights : 1;

  for (let dia = 1; dia <= totalDias; dia++) {
    const dataIso = isoDateAddDays(input.checkIn, dia - 1);
    const contexto: ContextoRoteiroDia = {
      dia,
      dataIso,
      perfil,
      isUltimoDia: dia === totalDias,
      isPrimeiroDia: dia === 1,
      amenidadesHotel: input.amenidadesHotel,
      slugsUsados,
    };
    const slots = montarRoteiroDia(contexto, input.catalogoAtracoes);
    dias.push({ dia, dataIso, slots });
  }

  return {
    dias,
    slugsUsados: Array.from(slugsUsados),
  };
}

/** Lista slugs de atracao sugeridos em um roteiro completo (util para asserts). */
export function listarSlugsRoteiro(roteiro: RoteiroCompleto): string[] {
  const slugs: string[] = [];
  for (const dia of roteiro.dias) {
    for (const slot of dia.slots) {
      if (slot.atracaoSlug) slugs.push(slot.atracaoSlug);
    }
  }
  return slugs;
}

/** Verifica se um slug aparece em algum slot do roteiro. */
export function roteiroIncluiSlug(roteiro: RoteiroCompleto, slug: string): boolean {
  return listarSlugsRoteiro(roteiro).includes(slug);
}
