import { buildRecotacaoUrlFromProposta } from '../../../../apps/site-publico/lib/proposta-recotacao-url';

describe('buildRecotacaoUrlFromProposta (PR 20+)', () => {
  it('monta URL contextual com hotel e datas', () => {
    const url = buildRecotacaoUrlFromProposta(
      {
        tokenPublico: 'rt-abc',
        metadata: {
          hotelId: '42',
          checkIn: '2026-07-01',
          checkOut: '2026-07-05',
          adults: 2,
          children: 1,
        },
      },
      'https://www.reserveiviagens.com.br',
    );

    expect(url).toContain('https://www.reserveiviagens.com.br/cotacao?');
    expect(url).toContain('hotel=42');
    expect(url).toContain('checkin=2026-07-01');
    expect(url).toContain('checkout=2026-07-05');
    expect(url).toContain('adults=2');
    expect(url).toContain('children=1');
    expect(url).toContain('ref=rt-abc');
    expect(url).toContain('canal=proposta-expirada');
  });

  it('monta URL parcial sem hotelId', () => {
    const url = buildRecotacaoUrlFromProposta({
      tokenPublico: 'rt-xyz',
      metadata: { checkIn: '2026-08-10', checkOut: '2026-08-12' },
      conteudo: { inclusions: { guests: 3 } },
    });

    expect(url).toBe(
      '/cotacao?checkin=2026-08-10&checkout=2026-08-12&adults=3&ref=rt-xyz&canal=proposta-expirada',
    );
  });
});