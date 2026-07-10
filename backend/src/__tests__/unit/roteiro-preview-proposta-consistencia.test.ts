import {
  mapRoteiroParaAtividades,
  mapRoteiroParaDailySchedule,
  montarRoteiroInteligente,
  roteiroIncluiSlug,
  serializarSlotsRoteiro,
} from '@rsv360/shared';
import { CATALOGO_TESTE } from '../fixtures/roteiro-atracoes.fixture';

function slotKeysJson(
  items: Array<{ day: number; turno: string; atracaoSlug: string | null }>,
): string {
  return JSON.stringify(
    items.map((i) => ({ day: i.day, turno: i.turno, slug: i.atracaoSlug })),
  );
}

describe('roteiro preview × proposta (consistência PR B)', () => {
  const base = {
    catalogoAtracoes: CATALOGO_TESTE,
    amenidadesHotel: [] as string[],
  };

  it('mesmo estado → slots idênticos entre preview e dailySchedule', () => {
    const input = {
      ...base,
      checkIn: '2026-07-31',
      checkOut: '2026-08-03',
      perfil: 'casal' as const,
    };
    const roteiro = montarRoteiroInteligente(input);
    const preview = mapRoteiroParaAtividades(roteiro, CATALOGO_TESTE, 'casal');
    const proposta = mapRoteiroParaDailySchedule(roteiro, CATALOGO_TESTE, 'casal');
    expect(slotKeysJson(preview)).toBe(slotKeysJson(proposta));
    expect(serializarSlotsRoteiro(roteiro)).toBe(
      JSON.stringify(
        preview.map((p) => ({
          dia: p.day,
          dataIso: p.dataIso,
          turno: p.turno,
          atracaoSlug: p.atracaoSlug,
        })),
      ),
    );
  });

  it('smoke 1 — família 2 noites + parque: dia_inteiro + checkout manhã leve', () => {
    const roteiro = montarRoteiroInteligente({
      checkIn: '2026-08-01',
      checkOut: '2026-08-03',
      perfil: 'familia',
      catalogoAtracoes: CATALOGO_TESTE,
      incluirParqueAquatico: true,
      amenidadesHotel: [],
    });
    const dia1 = roteiro.dias.find((d) => d.dia === 1);
    expect(dia1?.slots.some((s) => s.turno === 'dia_inteiro')).toBe(true);
    const ultimo = roteiro.dias[roteiro.dias.length - 1];
    expect(ultimo.slots.length).toBe(1);
    expect(ultimo.slots[0].turno).toBe('manha');
  });

  it('smoke 2 — casal sex→dom: Feira do Luar só no sábado', () => {
    const roteiro = montarRoteiroInteligente({
      checkIn: '2026-07-31',
      checkOut: '2026-08-03',
      perfil: 'casal',
      catalogoAtracoes: CATALOGO_TESTE,
      amenidadesHotel: [],
    });
    expect(roteiroIncluiSlug(roteiro, 'feira-do-luar')).toBe(true);
    const sabado = roteiro.dias.find((d) => d.dataIso === '2026-08-01');
    expect(sabado?.slots.some((s) => s.atracaoSlug === 'feira-do-luar')).toBe(true);
    const sexta = roteiro.dias.find((d) => d.dataIso === '2026-07-31');
    expect(sexta?.slots.some((s) => s.atracaoSlug === 'feira-do-luar')).toBe(false);
  });

  it('smoke 3 — casal seg→qua: sem Feira do Luar', () => {
    const roteiro = montarRoteiroInteligente({
      checkIn: '2026-08-03',
      checkOut: '2026-08-05',
      perfil: 'casal',
      catalogoAtracoes: CATALOGO_TESTE,
      amenidadesHotel: [],
    });
    expect(roteiroIncluiSlug(roteiro, 'feira-do-luar')).toBe(false);
  });
});
