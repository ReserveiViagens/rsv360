import { CALDAS_EMPREENDIMENTOS_CATALOGO } from '../../../../server/modules/acomodacoes/sync/caldas-empreendimentos-catalog';

describe('sync empreendimentos Caldas (PR 22B)', () => {
  it('catálogo tem ~60 empreendimentos com hotel_id espelho = slug', () => {
    expect(CALDAS_EMPREENDIMENTOS_CATALOGO.length).toBeGreaterThanOrEqual(55);
    for (const item of CALDAS_EMPREENDIMENTOS_CATALOGO) {
      expect(item.slug).toBe(item.hotelId);
      expect(item.nomeOficial.length).toBeGreaterThan(2);
    }
  });
});
