import { hasMinRole, rankRole } from '../../../../server/modules/propostas/rbac';
import { transicaoPermitida } from '../../../../server/modules/propostas/aprovacao';

describe('rbac — hierarquia', () => {
  it('supervisor >= operador', () => {
    expect(hasMinRole('supervisor', 'operador')).toBe(true);
    expect(hasMinRole('operador', 'supervisor')).toBe(false);
  });

  it('admin é o topo', () => {
    expect(rankRole('admin')).toBeGreaterThan(rankRole('supervisor'));
  });
});

describe('aprovacao — transições', () => {
  it('permite solicitar de nao_requer', () => {
    expect(transicaoPermitida('nao_requer', 'solicitado')).toBe(true);
  });

  it('bloqueia aprovar direto de nao_requer', () => {
    expect(transicaoPermitida('nao_requer', 'aprovado')).toBe(false);
  });

  it('supervisor aprova após solicitado', () => {
    expect(transicaoPermitida('solicitado', 'aprovado')).toBe(true);
    expect(transicaoPermitida('solicitado', 'negado')).toBe(true);
  });
});
