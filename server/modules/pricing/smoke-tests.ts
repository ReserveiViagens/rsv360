import { pricingEngineService, competitorService, otaScraperService, alertsService } from './services';
import { seedPricingData, clearPricingData } from './seed';

export const runPricingSmokeTests = async () => {
  console.log('🧪 Running Pricing Module Smoke Tests...\n');

  try {
    // Test 1: Seed data
    console.log('1️⃣ Testing data seeding...');
    const seedResult = await seedPricingData();
    console.log('✅ Data seeding successful:', seedResult);

    // Test 2: Pricing Engine Service
    console.log('\n2️⃣ Testing Pricing Engine Service...');

    // Test price calculation
    const priceCalc = await pricingEngineService.calculatePrice({
      basePrice: 300,
      accommodationId: 'test-accommodation',
      checkIn: new Date('2025-01-15'),
      checkOut: new Date('2025-01-17'),
      guestCount: 2
    });
    console.log('✅ Price calculation result:', priceCalc);

    // Test rule listing
    const rules = await pricingEngineService.listRules();
    console.log(`✅ Found ${rules.length} pricing rules`);

    // Test season listing
    const seasons = await pricingEngineService.listSeasons();
    console.log(`✅ Found ${seasons.length} pricing seasons`);

    // Test 3: Competitor Service
    console.log('\n3️⃣ Testing Competitor Service...');

    // Test competitor listing
    const competitors = await competitorService.listCompetitors();
    console.log(`✅ Found ${competitors.length} competitors`);

    if (competitors.length > 0) {
      const competitorId = competitors[0].id;

      // Test competitor details
      const competitor = await competitorService.getCompetitorById(competitorId);
      console.log('✅ Competitor details:', competitor?.name);

      // Test competitor rates
      const rates = await competitorService.getCompetitorRates(competitorId);
      console.log(`✅ Found ${rates.length} rates for competitor`);
    }

    // Test 4: OTA Scraper Service
    console.log('\n4️⃣ Testing OTA Scraper Service...');

    if (competitors.length > 0) {
      const competitorId = competitors[0].id;

      // Test single platform scraping
      const bookingRate = await otaScraperService.scrapeBooking(
        competitorId,
        '2025-01-15',
        '2025-01-17'
      );
      console.log('✅ Booking scrape result:', bookingRate ? 'Success' : 'No rate returned');

      // Test all platforms scraping
      const allRates = await otaScraperService.scrapeAllPlatforms(
        competitorId,
        '2025-01-15',
        '2025-01-17'
      );
      console.log(`✅ All platforms scrape: ${allRates.successCount} success, ${allRates.failCount} failed`);
    }

    // Test 5: Alerts Service
    console.log('\n5️⃣ Testing Alerts Service...');

    // Test alert listing
    const alerts = await alertsService.listAlerts();
    console.log(`✅ Found ${alerts.length} alerts`);

    if (alerts.length > 0) {
      const alertId = alerts[0].id;

      // Test alert details
      const alert = await alertsService.getAlertById(alertId);
      console.log('✅ Alert details:', alert?.alertType);
    }

    // Test alert processing
    if (competitors.length > 0) {
      const competitorId = competitors[0].id;
      const alertResults = await alertsService.processAllAlertsForCompetitor(
        competitorId,
        {
          price: 250,
          availability: true,
          ourPrice: 280
        },
        {
          price: 260,
          availability: true
        }
      );
      console.log('✅ Alert processing results:', {
        priceDropTriggers: alertResults.priceDropTriggers.length,
        priceIncreaseTriggers: alertResults.priceIncreaseTriggers.length,
        availabilityTriggers: alertResults.availabilityTriggers.length,
        rateParityTriggers: alertResults.rateParityTriggers.length
      });
    }

    // Test 6: Bulk operations
    console.log('\n6️⃣ Testing bulk operations...');

    // Test bulk price calculation
    const bulkResults = await pricingEngineService.bulkCalculatePrices([
      {
        basePrice: 300,
        accommodationId: 'test-1',
        checkIn: new Date('2025-01-15'),
        checkOut: new Date('2025-01-17')
      },
      {
        basePrice: 400,
        accommodationId: 'test-2',
        checkIn: new Date('2025-02-15'),
        checkOut: new Date('2025-02-17')
      }
    ]);
    console.log(`✅ Bulk calculation: ${bulkResults.length} results`);

    // Test competitor comparison
    if (competitors.length >= 2) {
      const comparison = await competitorService.getCompetitorComparison(
        competitors.slice(0, 2).map(c => c.id),
        new Date('2025-01-15'),
        new Date('2025-01-17'),
        280
      );
      console.log(`✅ Competitor comparison: ${comparison.competitors.length} competitors compared`);
    }

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await clearPricingData();
    console.log('✅ Test data cleared');

    console.log('\n🎉 All Pricing Module smoke tests passed successfully!');

    return {
      success: true,
      testsRun: 6,
      results: {
        seedData: seedResult,
        priceCalculation: !!priceCalc,
        rulesCount: rules.length,
        seasonsCount: seasons.length,
        competitorsCount: competitors.length,
        alertsCount: alerts.length,
        bulkCalculations: bulkResults.length
      }
    };

  } catch (error) {
    console.error('❌ Smoke test failed:', error);

    // Attempt cleanup on failure
    try {
      await clearPricingData();
      console.log('🧹 Test data cleared after failure');
    } catch (cleanupError) {
      console.error('❌ Failed to cleanup test data:', cleanupError);
    }

    throw error;
  }
};

// Export for use in other test files or manual execution
export const runPricingIntegrationTests = runPricingSmokeTests;

// CLI execution support
if (require.main === module) {
  runPricingSmokeTests()
    .then((result) => {
      console.log('\n📊 Test Results:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test Failed:', error);
      process.exit(1);
    });
}