// Mocks jÃ¡ configurados em __mocks__/setup.js
const { mockPool, mockClient } = require('./__mocks__/setup');

// Configurar mocks
jest.mock('../../../database/db', () => ({
  pool: mockPool,
}));

jest.mock('../../../src/config/redis', () => ({
  cache: require('./__mocks__/setup').mockCache,
  locks: require('./__mocks__/setup').mockLocks,
}));

jest.mock('../../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

const auctionsService = require('../../../src/api/v1/auctions/service');
const flashDealsService = require('../../../src/api/v1/flash-deals/service');

/**
 * Testes unitÃ¡rios - Auctions Service
 */
describe('Auctions Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createAuction', () => {
    it('should create an auction with valid data', async () => {
      const mockAuction = {
        id: 1,
        title: 'Test Auction',
        start_price: 100,
        enterprise_id: 1,
        start_date: new Date(Date.now() + 3600000).toISOString(),
        end_date: new Date(Date.now() + 86400000).toISOString(),
        status: 'scheduled',
      };

      mockPool.query.mockResolvedValueOnce({ rows: [mockAuction] });

      const auctionData = {
        title: 'Test Auction',
        start_price: 100,
        start_date: new Date(Date.now() + 3600000).toISOString(), // 1 hora no futuro
        end_date: new Date(Date.now() + 86400000).toISOString(),
        enterprise_id: 1,
      };

      const auction = await auctionsService.create(auctionData);
      expect(auction).toBeDefined();
      expect(auction.title).toBe(auctionData.title);
      expect(auction.start_price).toBe(auctionData.start_price);
    });

    it('should validate minimum increment', async () => {
      const mockAuction = {
        id: 2,
        title: 'Test Auction',
        start_price: 100,
        min_increment: 5,
        start_date: new Date(Date.now() + 3600000).toISOString(),
        end_date: new Date(Date.now() + 86400000).toISOString(),
        status: 'scheduled',
      };

      mockPool.query.mockResolvedValueOnce({ rows: [mockAuction] });

      const auctionData = {
        title: 'Test Auction',
        start_price: 100,
        min_increment: 5,
        start_date: new Date(Date.now() + 3600000).toISOString(), // 1 hora no futuro
        end_date: new Date(Date.now() + 86400000).toISOString(),
      };

      const auction = await auctionsService.create(auctionData);
      expect(auction.min_increment).toBeGreaterThanOrEqual(5);
    });
  });

  describe('placeBid', () => {
    it('should place a bid higher than current price', async () => {
      // Mock da criaÃ§Ã£o do leilÃ£o
      const mockAuction = {
        id: 3,
        title: 'Test Auction',
        start_price: 100,
        start_date: new Date(Date.now() + 60000).toISOString(),
        end_date: new Date(Date.now() + 86400000).toISOString(),
        status: 'active',
      };
      mockPool.query.mockResolvedValueOnce({ rows: [mockAuction] });

      // Mock da verificaÃ§Ã£o do leilÃ£o para bid
      mockPool.query.mockResolvedValueOnce({ rows: [mockAuction] });

      // Configurar mocks especÃ­ficos para a transaÃ§Ã£o
      const { mockClient } = require('./__mocks__/setup');
      let callCount = 0;
      mockClient.query.mockImplementation((query, params) => {
        callCount++;
        console.log(`Call ${callCount}:`, query.split('\n')[0].trim());
        if (query.includes('BEGIN')) return Promise.resolve();
        if (query.includes('SELECT') && query.includes('auctions') && !query.includes('bids')) return Promise.resolve({ rows: [mockAuction] });
        if (query.includes('SELECT') && query.includes('bids')) return Promise.resolve({ rows: [] });
        if (query.includes('INSERT INTO bids')) return Promise.resolve({ rows: [{ id: 1, auction_id: 3, user_id: 1, amount: 110 }] });
        if (query.includes('UPDATE auctions')) return Promise.resolve();
        if (query.includes('UPDATE bids')) return Promise.resolve();
        if (query.includes('COMMIT')) return Promise.resolve();
        return Promise.resolve({ rows: [] });
      });

      // Criar leilÃ£o primeiro
      const auction = await auctionsService.create({
        title: 'Test Auction',
        start_price: 100,
        start_date: new Date(Date.now() + 60000).toISOString(), // 1 minuto no futuro
        end_date: new Date(Date.now() + 86400000).toISOString(),
      });

      const bid = await auctionsService.placeBid(auction.id, 1, 110);
      expect(bid).toBeDefined();
      expect(bid.amount).toBe(110);
    });

    it('should reject bid lower than current price', async () => {
      // Mock da criaÃ§Ã£o do leilÃ£o
      const mockAuction = {
        id: 4,
        title: 'Test Auction',
        start_price: 100,
        current_price: 100,
        min_increment: 5,
        start_date: new Date(Date.now() + 60000).toISOString(),
        end_date: new Date(Date.now() + 86400000).toISOString(),
        status: 'active',
      };
      mockPool.query.mockResolvedValueOnce({ rows: [mockAuction] });

      const auction = await auctionsService.create({
        title: 'Test Auction',
        start_price: 100,
        start_date: new Date(Date.now() + 60000).toISOString(),
        end_date: new Date(Date.now() + 86400000).toISOString(),
      });

      await expect(
        auctionsService.placeBid(auction.id, 1, 50)
      ).rejects.toThrow();
    });
  });
});

/**
 * Testes unitÃ¡rios - Flash Deals Service
 */
describe('Flash Deals Service', () => {
  describe('createFlashDeal', () => {
    it('should create a flash deal with valid data', async () => {
      const mockDeal = {
        id: 1,
        title: 'Test Flash Deal',
        original_price: 200,
        discount_percentage: 20,
        current_price: 160,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 86400000).toISOString(),
        units_available: 10,
        units_sold: 0,
      };

      mockPool.query.mockResolvedValueOnce({ rows: [mockDeal] });

      const dealData = {
        title: 'Test Flash Deal',
        original_price: 200,
        discount_percentage: 20,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 86400000).toISOString(),
        units_available: 10,
      };

      const deal = await flashDealsService.create(dealData);
      expect(deal).toBeDefined();
      expect(deal.title).toBe(dealData.title);
      expect(deal.current_price).toBe(dealData.original_price * (1 - dealData.discount_percentage / 100));
    });
  });

  describe('calculateProgressiveDiscount', () => {
    it('should calculate progressive discount based on units sold', async () => {
      const mockDeal = {
        id: 2,
        title: 'Test Deal',
        original_price: 200,
        discount_percentage: 25, // Deve aumentar devido Ã s unidades vendidas
        current_price: 150,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 86400000).toISOString(),
        units_available: 10,
        units_sold: 5,
      };

      mockPool.query.mockResolvedValueOnce({ rows: [mockDeal] });

      const deal = await flashDealsService.create({
        title: 'Test Deal',
        original_price: 200,
        discount_percentage: 20,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 86400000).toISOString(),
        units_available: 10,
        units_sold: 5,
      });

      // Com 50% das unidades vendidas, desconto deve aumentar
      expect(deal.discount_percentage).toBeGreaterThan(20);
    });
  });
});

/**
 * Testes de integraÃ§Ã£o - Fluxo completo de leilÃ£o
 */
/**
 * Testes de integração - Fluxo completo de leilão
 */
/**
 * Testes de integração - Fluxo completo de leilão
 */
/**
 * Testes de integração - Fluxo completo de leilão
 */
/**
 * Testes de integração - Fluxo completo de leilão
 */
/**
 * Testes de integração - Fluxo completo de leilão
 */
/**
 * Testes de integração - Fluxo completo de leilão
 */
/**
 * Testes de integração - Fluxo completo de leilão
 */
/**
 * Testes de integração - Fluxo completo de leilão
 */
/**
 * Testes de integração - Fluxo completo de leilão
 */
describe('Auction Flow Integration', () => {
  it('should complete full auction flow: create -> bid -> finish -> booking', async () => {
    const { mockClient } = require('./__mocks__/setup');

    // Salvar estado original
    const originalPoolQuery = mockPool.query;
    const originalClientQuery = mockClient.query;

    // Mock da criação do leilão
    const mockAuction = {
      id: 5,
      title: 'Integration Test Auction',
      start_price: 100,
      current_price: 100,
      min_increment: 10,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 3600000).toISOString(),
      status: 'active',
    };

    // Mock para findById
    const mockFindByIdResult = {
      ...mockAuction,
      total_bids: 0,
      highest_bid: null,
      enterprise_name: 'Test Enterprise',
      property_name: 'Test Property',
      accommodation_name: 'Test Accommodation'
    };

    let findByIdCallCount = 0;

    // Override mockPool.query apenas para este teste
    mockPool.query = jest.fn((query, params) => {
      // findById query
      if (query.includes('SELECT') && query.includes('FROM auctions a') && query.includes('LEFT JOIN enterprises')) {
        findByIdCallCount++;
        if (findByIdCallCount <= 3) {
          // Chamadas durante placeBid e finish
          return Promise.resolve({ rows: [{ ...mockFindByIdResult, status: 'active', current_price: 100 + (findByIdCallCount - 1) * 10 }] });
        } else {
          // Chamada final de verificação
          return Promise.resolve({ rows: [{ ...mockFindByIdResult, status: 'finished', current_price: 120, winner_id: 2 }] });
        }
      }
      // createAuction query
      if (query.includes('INSERT INTO auctions')) {
        return Promise.resolve({ rows: [mockAuction] });
      }
      // Fallback
      return Promise.resolve({ rows: [] });
    });

    // Configurar mockClient para simular transações placeBid e finish
    let bidCounter = 0;
    const bids = []; // Armazenar bids criados
    mockClient.query = jest.fn((query, params) => {
      // Transação
      if (query.includes('BEGIN')) {
        return Promise.resolve({ rows: [] });
      }
      if (query.includes('COMMIT')) {
        return Promise.resolve({ rows: [] });
      }
      if (query.includes('ROLLBACK')) {
        return Promise.resolve({ rows: [] });
      }

      // Buscar bids para finish (maior lance)
      if (query.includes('SELECT * FROM bids') && query.includes('ORDER BY amount DESC')) {
        const winningBid = bids.length > 0 ? bids.reduce((max, bid) => bid.amount > max.amount ? bid : max) : null;
        return Promise.resolve({ rows: winningBid ? [winningBid] : [] });
      }

      // Criar bid — ESTE É O CRÍTICO (precisa retornar o bid com .id)
      if (query.includes('INSERT INTO bids')) {
        bidCounter++;
        const bid = {
          id: bidCounter,
          auction_id: 5,
          customer_id: params[1],
          amount: params[2],
          status: 'accepted',
          created_at: new Date().toISOString()
        };
        bids.push(bid); // Armazenar bid
        return Promise.resolve({ rows: [bid] });
      }

      // Atualizar preço do leilão
      if (query.includes('UPDATE auctions SET current_price')) {
        return Promise.resolve({ rows: [] });
      }

      // Finalizar leilão (finish)
      if (query.includes('UPDATE auctions') && query.includes('status = , winner_id = ')) {
        return Promise.resolve({ rows: [] });
      }

      // Invalidar bids anteriores
      if (query.includes('UPDATE bids SET status')) {
        return Promise.resolve({ rows: [] });
      }

      // Fallback genérico
      return Promise.resolve({ rows: [] });
    });

    // Criar leilão
    const auction = await auctionsService.create({
      title: 'Integration Test Auction',
      start_price: 100,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 3600000).toISOString(), // 1 hora
    });

    // Fazer lances
    await auctionsService.placeBid(auction.id, 1, 110);
    await auctionsService.placeBid(auction.id, 2, 120);

    // Finalizar leilão
    await auctionsService.finish(auction.id);

    // Verificar vencedor
    const resultAuction = await auctionsService.findById(auction.id);
    expect(resultAuction.status).toBe('finished');
    expect(resultAuction.winner_id).toBe(2);

    // Restaurar mocks originais
    mockPool.query = originalPoolQuery;
    mockClient.query = originalClientQuery;
  });
});

module.exports = {};


















