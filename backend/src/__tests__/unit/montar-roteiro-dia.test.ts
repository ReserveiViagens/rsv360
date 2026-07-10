import {
  atracaoDisponivelNoDia,
  listarSlugsRoteiro,
  montarRoteiroCompleto,
  montarRoteiroDia,
  roteiroIncluiSlug,
  weekdayCodeFromDate,
} from '@rsv360/shared';
import { CATALOGO_TESTE } from '../fixtures/roteiro-atracoes.fixture';

describe('montar-roteiro-dia (motor inteligente)', () => {
  it('7 — weekdayCodeFromDate anti-shift UTC: 2026-08-01 e sabado', () => {
    expect(weekdayCodeFromDate('2026-08-01')).toBe('sab');
    expect(new Date('2026-08-01').getDay()).not.toBe(6);
  });

  it('1 — Feira do Luar: estadia sex→dom inclui feira no sabado', () => {
    const roteiro = montarRoteiroCompleto({
      checkIn: '2026-07-31',
      checkOut: '2026-08-03',
      perfil: 'casal',
      catalogoAtracoes: CATALOGO_TESTE,
    });
    expect(roteiroIncluiSlug(roteiro, 'feira-do-luar')).toBe(true);
    const sabado = roteiro.dias.find((d) => d.dataIso === '2026-08-01');
    expect(sabado?.slots.some((s) => s.atracaoSlug === 'feira-do-luar')).toBe(true);
  });

  it('2 — Feira do Luar: estadia seg→qua nunca sugere feira', () => {
    const roteiro = montarRoteiroCompleto({
      checkIn: '2026-08-03',
      checkOut: '2026-08-05',
      perfil: 'casal',
      catalogoAtracoes: CATALOGO_TESTE,
    });
    expect(roteiroIncluiSlug(roteiro, 'feira-do-luar')).toBe(false);
  });

  it('3 — parque dia_inteiro ocupa o dia e noite usa alternativa (feira ou pizzaria)', () => {
    const catalogoParquePrimeiro = [
      CATALOGO_TESTE.find((a) => a.slug === 'parque-aquatico-dia-inteiro')!,
      ...CATALOGO_TESTE.filter((a) => a.slug !== 'parque-aquatico-dia-inteiro'),
    ];
    const roteiro = montarRoteiroCompleto({
      checkIn: '2026-08-01',
      checkOut: '2026-08-03',
      perfil: 'familia',
      catalogoAtracoes: catalogoParquePrimeiro,
    });
    const sabado = roteiro.dias.find((d) => d.dataIso === '2026-08-01');
    expect(sabado?.slots.some((s) => s.turno === 'dia_inteiro')).toBe(true);
    expect(sabado?.slots.some((s) => s.turno === 'noite' && s.atracaoSlug != null)).toBe(true);
  });

  it('4 — perfil familia vs casal filtra publico', () => {
    const semParque = CATALOGO_TESTE.filter((a) => a.slug !== 'parque-aquatico-dia-inteiro');

    const slugsFamilia = new Set(['restaurante-panela-quente']);
    const familia = montarRoteiroDia(
      {
        dia: 1,
        dataIso: '2026-08-06',
        perfil: 'familia',
        isUltimoDia: false,
        isPrimeiroDia: true,
        slugsUsados: slugsFamilia,
      },
      semParque,
    );
    expect(familia.some((s) => s.atracaoSlug === 'restaurante-boi-na-brasa')).toBe(true);

    const slugsCasal = new Set([
      'restaurante-panela-quente',
      'restaurante-boi-na-brasa',
      'serra-de-caldas',
      'jardim-japones',
      'monumento-das-aguas',
      'pizzaria-forno-vero',
    ]);
    const casal = montarRoteiroDia(
      {
        dia: 1,
        dataIso: '2026-08-07',
        perfil: 'casal',
        isUltimoDia: false,
        isPrimeiroDia: true,
        slugsUsados: slugsCasal,
      },
      semParque,
    );
    expect(casal.some((s) => s.atracaoSlug === 'bar-choperia-centro')).toBe(true);
    expect(casal.some((s) => s.atracaoSlug === 'restaurante-boi-na-brasa')).toBe(false);
  });

  it('5 — ultimo dia checkout: apenas manha leve', () => {
    const roteiro = montarRoteiroCompleto({
      checkIn: '2026-08-01',
      checkOut: '2026-08-04',
      perfil: 'casal',
      catalogoAtracoes: CATALOGO_TESTE,
    });
    const ultimo = roteiro.dias[roteiro.dias.length - 1];
    expect(ultimo.slots.length).toBe(1);
    expect(ultimo.slots[0].turno).toBe('manha');
    expect(ultimo.slots.every((s) => s.turno !== 'noite' && s.turno !== 'dia_inteiro')).toBe(true);
  });

  it('6 — nao repete atracao no roteiro completo', () => {
    const roteiro = montarRoteiroCompleto({
      checkIn: '2026-08-01',
      checkOut: '2026-08-08',
      perfil: 'casal',
      catalogoAtracoes: CATALOGO_TESTE,
    });
    const slugs = listarSlugsRoteiro(roteiro);
    expect(slugs.length).toBe(new Set(slugs).size);
  });

  it('atracaoDisponivelNoDia cruza weekday com dias_funcionamento', () => {
    const feira = CATALOGO_TESTE.find((a) => a.slug === 'feira-do-luar')!;
    expect(atracaoDisponivelNoDia(feira, '2026-08-01')).toBe(true);
    expect(atracaoDisponivelNoDia(feira, '2026-08-03')).toBe(false);
  });

  it('relax_hotel exige amenidade do hotel', () => {
    const catalogoSemParque = CATALOGO_TESTE.filter(
      (a) => a.slug !== 'parque-aquatico-dia-inteiro',
    );
    const slugsUsados = new Set([
      'serra-de-caldas',
      'jardim-japones',
      'monumento-das-aguas',
      'restaurante-panela-quente',
    ]);
    const comPiscina = montarRoteiroDia(
      {
        dia: 2,
        dataIso: '2026-08-02',
        perfil: 'casal',
        isUltimoDia: false,
        isPrimeiroDia: false,
        amenidadesHotel: ['piscina_termal'],
        slugsUsados,
      },
      catalogoSemParque,
    );
    expect(comPiscina.some((s) => s.atracaoSlug === 'relax-piscina-termal')).toBe(true);

    const slugsUsados2 = new Set(slugsUsados);
    const semAmenidade = montarRoteiroDia(
      {
        dia: 2,
        dataIso: '2026-08-02',
        perfil: 'casal',
        isUltimoDia: false,
        isPrimeiroDia: false,
        amenidadesHotel: [],
        slugsUsados: slugsUsados2,
      },
      catalogoSemParque,
    );
    expect(semAmenidade.some((s) => s.atracaoSlug === 'relax-piscina-termal')).toBe(false);
  });
});
