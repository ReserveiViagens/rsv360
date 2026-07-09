import {
  AMENIDADE_CODES,
  ETAPA_A_CONTENT_IDS,
  inferAmenidadesFromFeatures,
  isAmenidadeCode,
  sanitizeAmenidades,
} from '../../../../server/modules/cms/amenidades';

describe('cms amenidades', () => {
  it('sanitizeAmenidades filtra códigos inválidos e deduplica', () => {
    expect(sanitizeAmenidades(['wifi', 'wifi', 'foo', 'premium'])).toEqual(['wifi', 'premium']);
  });

  it('isAmenidadeCode cobre whitelist', () => {
    expect(isAmenidadeCode('parque_aquatico')).toBe(true);
    expect(isAmenidadeCode('xyz')).toBe(false);
    expect(AMENIDADE_CODES.length).toBeGreaterThanOrEqual(10);
  });

  it('inferAmenidadesFromFeatures detecta termos comuns', () => {
    const codes = inferAmenidadesFromFeatures([
      'Águas termais',
      'Upgrade varanda disponível',
      'Parque aquático próximo',
    ]);
    expect(codes).toEqual(
      expect.arrayContaining(['piscina_termal', 'upgrade_varanda', 'parque_aquatico']),
    );
  });

  it('ETAPA_A_CONTENT_IDS inclui atrium e lacqua', () => {
    expect(ETAPA_A_CONTENT_IDS).toContain('atrium-thermas');
    expect(ETAPA_A_CONTENT_IDS).toContain('lacqua-diroma');
    expect(ETAPA_A_CONTENT_IDS).toHaveLength(11);
  });
});
