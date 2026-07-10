import type { RoteiroCompleto, TurnoRoteiro } from './roteiro-atracao.types.js';

export interface SlotRoteiroCanonico {
  dia: number;
  dataIso: string;
  turno: TurnoRoteiro;
  atracaoSlug: string | null;
}

export function extrairSlotsCanonicos(roteiro: RoteiroCompleto): SlotRoteiroCanonico[] {
  const slots: SlotRoteiroCanonico[] = [];
  for (const dia of roteiro.dias) {
    for (const slot of dia.slots) {
      slots.push({
        dia: dia.dia,
        dataIso: dia.dataIso,
        turno: slot.turno,
        atracaoSlug: slot.atracaoSlug,
      });
    }
  }
  return slots;
}

/** Serialização determinística para teste preview × proposta. */
export function serializarSlotsRoteiro(roteiro: RoteiroCompleto): string {
  return JSON.stringify(extrairSlotsCanonicos(roteiro));
}

export function slotsRoteiroIguais(a: RoteiroCompleto, b: RoteiroCompleto): boolean {
  return serializarSlotsRoteiro(a) === serializarSlotsRoteiro(b);
}
