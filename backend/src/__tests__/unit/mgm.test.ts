import { montarUrlIndicacao } from '../../../../server/modules/propostas/mgm';

describe('mgm — montarUrlIndicacao', () => {
  it('monta URL com ref e canal', () => {
    const url = montarUrlIndicacao('http://localhost:3000', 'tok-abc', 42, 'whatsapp');
    expect(url).toBe('http://localhost:3000/proposta/tok-abc?ref=42&canal=whatsapp');
  });

  it('omite canal quando ausente', () => {
    const url = montarUrlIndicacao('http://localhost:3000/', 'tok', 1);
    expect(url).toBe('http://localhost:3000/proposta/tok?ref=1');
  });
});
