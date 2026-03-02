const auctionsService = require('../../api/v1/auctions/service');
const flashDealsService = require('../../api/v1/flash-deals/service');
const { pool } = require('../../../database/db');

/**
 * Testes unitários - Auctions Service
 */
describe('Auctions Service', () => {
  describe('createAuction', () => {
    it('should create an auction with valid data', async () => {
      const auctionData = {
        title: 'Test Auction',
        start_price: 100,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 86400000).toISOString(),
        enterprise_id: 1,
      };

      const auction = await auctionsService.create(auctionData);
      expect(auction).toBeDefined();
      expect(auction.title).toBe(auctionData.title);
      expect(auction.start_price).toBe(auctionData.start_price);
    });

    it('should validate minimum increment', async () => {
      const auctionData = {
        title: 'Test Auction',
        start_price: 100,
        min_increment: 5,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 86400000).toISOString(),
      };

      const auction = await auctionsService.create(auctionData);
      expect(auction.min_increment).toBeGreaterThanOrEqual(5);
    });
  });

  describe('placeBid', () => {
    it('should place a bid higher than current price', async () => {
      // Criar leilão primeiro
      const auction = await auctionsService.create({
        title: 'Test Auction',
        start_price: 100,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 86400000).toISOString(),
      });

      const bid = await auctionsService.placeBid(auction.id, 1, 110);
      expect(bid).toBeDefined();
      expect(bid.amount).toBe(110);
    });

    it('should reject bid lower than current price', async () => {
      const auction = await auctionsService.create({
        title: 'Test Auction',
        start_price: 100,
        start_date: new Date().toISOString(),
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
    const finishedAuction = await auctionsService.findById(auction.id);
    expect(finishedAuction.status).toBe('finished');
    expect(finishedAuction.winner_id).toBe(2);
  });
});

module.exports = {};
