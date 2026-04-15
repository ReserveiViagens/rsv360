import { revenueRepository } from './db/revenue.repository';
import { pricingRulesService } from './services';
import { pricingEngineService } from './services';
import { rateCalendarService } from './services';
import { forecastService } from './services';
import { competitorService } from './services';
import { revenueKpisService } from './services';

async function run() {
  await revenueRepository.resetMemory();

  const invalidRule = pricingRulesService.validateRule({
    name: 'Inválida',
    rule_type: 'OCCUPANCY',
    adjustment_type: 'percentage',
    adjustment_value: 10,
    conditions: {},
  });

  const validRule = await pricingRulesService.createRule({
    name: 'Ocupação ok',
    rule_type: 'OCCUPANCY',
    adjustment_type: 'percentage',
    adjustment_value: 10,
    conditions: { occupancy_min: 80 },
    priority: 1,
  });

  await pricingRulesService.seedDefaults();

  const dynamicPrice = await pricingEngineService.calculateDynamicPrice(1, '2026-02-14', {
    basePrice: 250,
    occupancyRate: 85,
  });

  const stayPrice = await pricingEngineService.calculateStayPrice(1, '2026-03-16', '2026-03-21', {
    basePrice: 250,
  });

  const seasonality = await forecastService.getSeasonalityFactors();

  const kpis = await revenueKpisService.getRevenueKPIs('2026-01-01', '2026-01-31');

  await competitorService.bulkImport([
    { competitor_name: 'Hotel A', date: '2026-02-14', price: 220, currency: 'BRL', source: 'manual' },
    { competitor_name: 'Hotel B', date: '2026-02-14', price: 240, currency: 'BRL', source: 'manual' },
    { competitor_name: 'Hotel C', date: '2026-02-14', price: 260, currency: 'BRL', source: 'manual' },
  ]);
  const comparison = await competitorService.getComparisonReport('2026-02-14', '2026-02-14', 1);

  const calendarSummary = await rateCalendarService.generateRateCalendar('2026-02-14', '2026-02-20', 1);
  const calendarEntries = await rateCalendarService.getRateCalendar('2026-02-14', '2026-02-20', 1);

  await pricingRulesService.createRule({
    name: 'Clamp',
    rule_type: 'OCCUPANCY',
    adjustment_type: 'percentage',
    adjustment_value: 500,
    conditions: { occupancy_min: 0 },
    priority: 99,
  });
  const clampPrice = await pricingEngineService.calculateDynamicPrice(1, '2026-02-14', {
    basePrice: 100,
    occupancyRate: 85,
    maxPrice: 300,
  });

  console.log(JSON.stringify({
    ruleValidationWorks: !invalidRule.valid && !!validRule,
    pricingEngineCalculates: dynamicPrice.appliedRules.some((rule) => rule.rule_name === 'Final de Semana') && dynamicPrice.appliedRules.some((rule) => rule.rule_name === 'Ocupação Alta') && dynamicPrice.calculatedPrice > dynamicPrice.basePrice,
    stayPriceCalculates: stayPrice.appliedRules.some((rule) => rule.rule_name === 'Estadia Longa') && Math.abs(stayPrice.totalPrice - stayPrice.nightlyPrices.reduce((sum, entry) => sum + entry.price, 0)) < 0.01,
    forecastDefaults: seasonality.length === 12 && seasonality[11] === Math.max(...seasonality),
    kpisCalculate: typeof kpis.adr === 'number' && typeof kpis.revpar === 'number' && typeof kpis.occupancy_rate === 'number',
    competitorComparison: typeof comparison.parityIndex === 'number',
    rateCalendarGenerates: calendarSummary.daysGenerated === 7 && calendarEntries.length === 7 && calendarEntries.every((entry: any) => entry.calculated_price > 0),
    priceClampWorks: clampPrice.calculatedPrice === 300,
  }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
