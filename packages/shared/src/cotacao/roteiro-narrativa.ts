import type { RoteiroAtracao, SlotRoteiro, TurnoRoteiro } from './roteiro-atracao.types.js';

const TURNO_LABEL: Record<TurnoRoteiro, string> = {
  manha: 'manhã',
  tarde: 'tarde',
  noite: 'noite',
  dia_inteiro: 'dia inteiro',
};

export function behaviorTagNarrativo(
  slot: Pick<SlotRoteiro, 'tipo' | 'turno' | 'atracaoSlug' | 'titulo'>,
  atracao?: RoteiroAtracao,
  perfil: 'casal' | 'familia' = 'casal',
): string {
  const turno = TURNO_LABEL[slot.turno] ?? slot.turno;
  if (slot.tipo === 'feira' && slot.atracaoSlug === 'feira-do-luar') {
    return 'Feira do Luar — sábado à noite';
  }
  if (slot.tipo === 'parque' && slot.turno === 'dia_inteiro') {
    return perfil === 'familia' ? 'Dia inteiro no parque — família' : 'Dia inteiro no parque';
  }
  if (slot.tipo === 'relax_hotel') {
    return 'Relax no hotel — tarde leve';
  }
  if (slot.tipo === 'restaurante') {
    return slot.turno === 'noite' ? 'Jantar sugerido' : 'Almoço regional';
  }
  if (atracao?.dica) return atracao.dica.slice(0, 48);
  return `${slot.titulo} — ${turno}`;
}
