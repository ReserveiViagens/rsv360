import { reverterReserva } from '../../../../server/modules/fornecedores-hub/services/reverter-reserva';
import { reservasCotacaoService } from '../../../../server/modules/fornecedores-hub/services/reservas-cotacao.service';
import { liberarLock } from '../../../../server/modules/fornecedores-hub/lock';

jest.mock('../../../../server/modules/fornecedores-hub/services/reservas-cotacao.service');
jest.mock('../../../../server/modules/fornecedores-hub/lock');

const mockedService = reservasCotacaoService as jest.Mocked<typeof reservasCotacaoService>;
const mockedLiberar = liberarLock as jest.MockedFunction<typeof liberarLock>;

describe('reverterReserva', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('aborta se refund falhar e não libera lock', async () => {
    mockedService.findById.mockResolvedValue({
      id: 'r1',
      parceiroId: 'p1',
      chaveVaga: 'vaga:1',
      propostaId: null,
      status: 'pendente',
      confirmadaEm: null,
      canceladaEm: null,
      criadoEm: new Date(),
    });

    await expect(
      reverterReserva('r1', async () => ({ ok: false })),
    ).rejects.toThrow('Refund falhou');

    expect(mockedService.marcarCancelada).not.toHaveBeenCalled();
    expect(mockedLiberar).not.toHaveBeenCalled();
  });

  it('refund ok → cancela e libera lock', async () => {
    mockedService.findById.mockResolvedValue({
      id: 'r1',
      parceiroId: 'p1',
      chaveVaga: 'vaga:1',
      propostaId: null,
      status: 'pendente',
      confirmadaEm: null,
      canceladaEm: null,
      criadoEm: new Date(),
    });
    mockedService.marcarCancelada.mockResolvedValue({} as never);
    mockedLiberar.mockResolvedValue(true);

    const result = await reverterReserva('r1', async () => ({ ok: true }));
    expect(result.reverted).toBe(true);
    expect(mockedService.marcarCancelada).toHaveBeenCalledWith('r1');
    expect(mockedLiberar).toHaveBeenCalledWith('vaga:1', 'r1');
  });

  it('idempotente se já cancelada', async () => {
    mockedService.findById.mockResolvedValue({
      id: 'r1',
      parceiroId: 'p1',
      chaveVaga: 'vaga:1',
      propostaId: null,
      status: 'cancelada',
      confirmadaEm: null,
      canceladaEm: new Date(),
      criadoEm: new Date(),
    });

    const result = await reverterReserva('r1', async () => ({ ok: false }));
    expect(result.refundSkipped).toBe(true);
    expect(mockedLiberar).not.toHaveBeenCalled();
  });
});
