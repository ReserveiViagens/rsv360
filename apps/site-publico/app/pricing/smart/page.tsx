/**
 * ✅ PÁGINA: SMART PRICING DASHBOARD
 * Usa o novo componente SmartPricingDashboard
 */

'use client';

import { SmartPricingDashboard } from '@/components/smart-pricing/SmartPricingDashboard';

export default function SmartPricingPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <SmartPricingDashboard />
    </div>
  );
}

