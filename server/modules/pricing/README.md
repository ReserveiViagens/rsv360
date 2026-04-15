# RSV360 Pricing Backend Module

A comprehensive pricing and competitor analysis system for RSV360's hospitality platform.

## Overview

The Pricing Backend Module provides dynamic pricing capabilities, competitor monitoring, and intelligent pricing alerts for the RSV360 hospitality management system.

## Features

### 🧮 Dynamic Pricing Engine
- **Rule-based pricing**: Seasonal, demand-based, promotional, and loyalty pricing rules
- **Bulk calculations**: Process multiple price calculations simultaneously
- **Price history tracking**: Maintain audit trail of all price changes
- **Seasonal adjustments**: Automatic pricing based on predefined seasons

### 🏨 Competitor Analysis
- **Competitor management**: Store and manage competitor information
- **Rate comparison**: Compare your rates against competitors
- **Rate parity reports**: Generate detailed parity analysis
- **Competitor intelligence**: Track competitor pricing patterns

### 🌐 OTA Scraping
- **Multi-platform support**: Scrape rates from 8 major OTAs (Booking.com, Expedia, Airbnb, etc.)
- **Simulated scraping**: Production-ready scraping with realistic delays and data
- **Error handling**: Robust error handling and retry mechanisms
- **Rate storage**: Store scraped rates with metadata

### 🚨 Intelligent Alerts
- **Price change alerts**: Monitor competitor price drops and increases
- **Availability alerts**: Track competitor availability changes
- **Rate parity alerts**: Alert when competitors cross parity thresholds
- **Flexible conditions**: Support for various alert conditions (above, below, percentage change)

## Architecture

```
server/modules/pricing/
├── db/schema/           # Database schemas
│   ├── core.ts         # Core pricing tables
│   └── competitors.ts  # Competitor and OTA tables
├── services/           # Business logic services
│   ├── pricing-engine.service.ts
│   ├── competitor.service.ts
│   ├── ota-scraper.service.ts
│   └── alerts.service.ts
├── routes/             # Express route handlers
│   ├── pricing.routes.ts
│   ├── competitor.routes.ts
│   ├── ota.routes.ts
│   └── alerts.routes.ts
├── types/              # TypeScript type definitions
├── seed.ts             # Database seeding
├── smoke-tests.ts      # Integration tests
└── index.ts            # Module exports and registration
```

## Database Schema

### Core Tables
- `pricing_rules`: Dynamic pricing rules with conditions and adjustments
- `pricing_seasons`: Seasonal pricing multipliers
- `pricing_adjustments`: Manual price adjustments
- `pricing_history`: Audit trail of price calculations

### Competitor Tables
- `pricing_competitors`: Competitor hotel information
- `pricing_ota_rates`: Scraped rates from various platforms
- `pricing_alerts`: Configurable pricing alerts

## API Endpoints

### Pricing Engine
```
POST   /api/pricing/calculate          # Calculate single price
POST   /api/pricing/bulk-calculate     # Calculate multiple prices
GET    /api/pricing/rules              # List pricing rules
POST   /api/pricing/rules              # Create pricing rule
GET    /api/pricing/rules/:id          # Get pricing rule
PUT    /api/pricing/rules/:id          # Update pricing rule
DELETE /api/pricing/rules/:id          # Delete pricing rule
GET    /api/pricing/seasons            # List pricing seasons
GET    /api/pricing/history            # Get price history
```

### Competitors
```
GET    /api/pricing/competitors              # List competitors
POST   /api/pricing/competitors              # Create competitor
GET    /api/pricing/competitors/:id          # Get competitor
PUT    /api/pricing/competitors/:id          # Update competitor
DELETE /api/pricing/competitors/:id          # Delete competitor
GET    /api/pricing/competitors/:id/rates    # Get competitor rates
POST   /api/pricing/competitors/compare      # Compare competitors
POST   /api/pricing/competitors/:id/rate-parity  # Rate parity report
```

### OTA Scraping
```
POST   /api/pricing/ota/scrape/booking        # Scrape Booking.com
POST   /api/pricing/ota/scrape/expedia        # Scrape Expedia
POST   /api/pricing/ota/scrape/airbnb         # Scrape Airbnb
POST   /api/pricing/ota/scrape/decolar        # Scrape Decolar
POST   /api/pricing/ota/scrape/hotels-com     # Scrape Hotels.com
POST   /api/pricing/ota/scrape/trivago        # Scrape Trivago
POST   /api/pricing/ota/scrape/kayak          # Scrape Kayak
POST   /api/pricing/ota/scrape/google-hotels  # Scrape Google Hotels
POST   /api/pricing/ota/scrape-all            # Scrape all platforms
GET    /api/pricing/ota/platforms             # List supported platforms
```

### Alerts
```
GET    /api/pricing/alerts                    # List alerts
POST   /api/pricing/alerts                    # Create alert
GET    /api/pricing/alerts/:id                # Get alert
PUT    /api/pricing/alerts/:id                # Update alert
DELETE /api/pricing/alerts/:id                # Delete alert
POST   /api/pricing/alerts/process            # Process alerts
GET    /api/pricing/alerts/:id/history        # Get alert history
POST   /api/pricing/alerts/bulk-update        # Bulk update alerts
GET    /api/pricing/alerts/types              # List alert types
```

## Usage

### Initialization
```typescript
import { initializePricingModule } from './server/modules/pricing';

// In your Express app setup
await initializePricingModule(app);
```

### Seeding Data
```typescript
import { seedPricingData } from './server/modules/pricing/seed';

// Seed initial data
await seedPricingData();
```

### Running Tests
```typescript
import { runPricingSmokeTests } from './server/modules/pricing/smoke-tests';

// Run integration tests
await runPricingSmokeTests();
```

### CLI Testing
```bash
# Run smoke tests
npx ts-node server/modules/pricing/smoke-tests.ts
```

## Services

### PricingEngineService
Handles all pricing calculations and rule management.

```typescript
const result = await pricingEngineService.calculatePrice({
  basePrice: 300,
  accommodationId: 'hotel-123',
  checkIn: new Date('2025-01-15'),
  checkOut: new Date('2025-01-17'),
  guestCount: 2
});
```

### CompetitorService
Manages competitor data and analysis.

```typescript
const comparison = await competitorService.getCompetitorComparison(
  ['comp-1', 'comp-2'],
  checkIn,
  checkOut,
  ourPrice
);
```

### OtaScraperService
Handles scraping from various OTA platforms.

```typescript
const rates = await otaScraperService.scrapeAllPlatforms(
  competitorId,
  '2025-01-15',
  '2025-01-17'
);
```

### AlertsService
Manages pricing alerts and notifications.

```typescript
const triggers = await alertsService.processAllAlertsForCompetitor(
  competitorId,
  currentData,
  previousData
);
```

## Configuration

The module uses the following environment variables:
- Database connection via Drizzle ORM configuration
- No additional environment variables required for basic functionality

## Testing

Run the comprehensive smoke tests to verify all functionality:

```bash
npm run test:pricing
# or
npx ts-node server/modules/pricing/smoke-tests.ts
```

## Development

### Adding New OTA Platforms
1. Add platform enum to schema
2. Implement scraper method in `OtaScraperService`
3. Add route in `ota.routes.ts`
4. Update platform list endpoint

### Adding New Alert Types
1. Add alert type to schema enum
2. Implement checking logic in `AlertsService`
3. Add route handlers if needed
4. Update alert types endpoint

### Custom Pricing Rules
1. Define rule conditions in schema
2. Implement rule logic in `PricingEngineService`
3. Add validation in routes
4. Update rule creation endpoints

## Dependencies

- **Drizzle ORM**: Database operations
- **Express**: Web framework
- **Zod**: Request validation
- **PostgreSQL**: Database

## License

Internal RSV360 project - All rights reserved.