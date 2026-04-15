export type PricingRule = typeof import('../db/schema/core').pricingRules.$inferSelect;
export type NewPricingRule = typeof import('../db/schema/core').pricingRules.$inferInsert;
export type PricingSeason = typeof import('../db/schema/core').pricingSeasons.$inferSelect;
export type NewPricingSeason = typeof import('../db/schema/core').pricingSeasons.$inferInsert;
export type PricingAdjustment = typeof import('../db/schema/core').pricingAdjustments.$inferSelect;
export type NewPricingAdjustment = typeof import('../db/schema/core').pricingAdjustments.$inferInsert;
export type PricingHistory = typeof import('../db/schema/core').pricingHistory.$inferSelect;
export type NewPricingHistory = typeof import('../db/schema/core').pricingHistory.$inferInsert;

export type Competitor = typeof import('../db/schema/competitors').pricingCompetitors.$inferSelect;
export type NewCompetitor = typeof import('../db/schema/competitors').pricingCompetitors.$inferInsert;
export type OtaRate = typeof import('../db/schema/competitors').pricingOtaRates.$inferSelect;
export type NewOtaRate = typeof import('../db/schema/competitors').pricingOtaRates.$inferInsert;
export type PricingAlert = typeof import('../db/schema/competitors').pricingAlerts.$inferSelect;
export type NewPricingAlert = typeof import('../db/schema/competitors').pricingAlerts.$inferInsert;

export type PriceCalculation = {
  basePrice: number;
  finalPrice: number;
  adjustments: Array<{ reason: string; type: string; value: number }>;
  strategy: string;
};

export type CompetitorComparison = {
  ourPrice: number;
  competitors: Array<{
    name: string;
    platform: string;
    price: number;
    difference: number;
    percentDiff: number;
  }>;
  cheapest: { name: string; platform: string; price: number };
  mostExpensive: { name: string; platform: string; price: number };
  average: number;
};

export type RateParityReport = {
  violations: Array<{
    date: string;
    platform: string;
    ourPrice: number;
    otaPrice: number;
    diff: number;
  }>;
  totalViolations: number;
  complianceRate: number;
};