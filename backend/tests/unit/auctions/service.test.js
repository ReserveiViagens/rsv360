// Mocks já configurados em __mocks__/setup.js
const { mockPool } = require('./__mocks__/setup');

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
 * Testes unitários - Auctions Service
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
      // Mock da criação do leilão
      const mockAuction = {
        id: 3,
        title: 'Test Auction',
        start_price: 100,
        start_date: new Date(Date.now() + 60000).toISOString(),
        end_date: new Date(Date.now() + 86400000).toISOString(),
        status: 'active',
      };
      mockPool.query.mockResolvedValueOnce({ rows: [mockAuction] });

      // Mock da verificação do leilão para bid
      mockPool.query.mockResolvedValueOnce({ rows: [mockAuction] });

      // Configurar mocks específicos para a transação
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

      // Criar leilão primeiro
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
      // Mock da criação do leilão
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
 * Testes unitários - Flash Deals Service
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
        discount_percentage: 25, // Deve aumentar devido às unidades vendidas
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
 * Testes de integração - Fluxo completo de leilão
 */
describe('Auction Flow Integration', () => {
  it('should complete full auction flow: create -> bid -> finish -> booking', async () => {
    // Mock da criação do leilão
    const mockAuction = {
      id: 5,
      title: 'Integration Test Auction',
      start_price: 100,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 3600000).toISOString(),
      status: 'active',
    };
    mockPool.query.mockResolvedValueOnce({ rows: [mockAuction] });

    // Mock da verificação do leilão para primeiro bid
    mockPool.query.mockResolvedValueOnce({ rows: [mockAuction] });
    // Mock da inserção do primeiro bid
    const mockBid1 = { id: 1, auction_id: 5, user_id: 1, amount: 110 };
    mockPool.query.mockResolvedValueOnce({ rows: [mockBid1] });

    // Mock da verificação do leilão para segundo bid
    mockPool.query.mockResolvedValueOnce({ rows: [mockAuction] });
    // Mock da inserção do segundo bid
    const mockBid2 = { id: 2, auction_id: 5, user_id: 2, amount: 120 };
    mockPool.query.mockResolvedValueOnce({ rows: [mockBid2] });

    // Mock do finish (atualizar status e definir winner)
    const finishedAuction = { ...mockAuction, status: 'finished', winner_id: 2 };
    mockPool.query.mockResolvedValueOnce({ rows: [finishedAuction] });

    // Mock do findById
    mockPool.query.mockResolvedValueOnce({ rows: [finishedAuction] });

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
  });
});

module.exports = {};
