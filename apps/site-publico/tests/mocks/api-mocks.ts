/**
 * ✅ MOCKS PARA TESTES DE INTEGRAÇÃO
 * 
 * Mocks para APIs externas:
 * - Google Calendar API
 * - Eventbrite API
 * - Airbnb API
 * - Cloudbeds API
 */

// Mock Google Calendar API
export const mockGoogleCalendarEvents = {
  items: [
    {
      id: 'event1',
      summary: 'Festival de Inverno',
      start: { dateTime: '2025-07-15T10:00:00-03:00' },
      end: { dateTime: '2025-07-20T18:00:00-03:00' },
      location: 'Caldas Novas, GO',
    },
    {
      id: 'event2',
      summary: 'Festa Junina',
      start: { dateTime: '2025-06-20T19:00:00-03:00' },
      end: { dateTime: '2025-06-21T02:00:00-03:00' },
      location: 'Caldas Novas, GO',
    },
  ],
};

// Mock Eventbrite API
export const mockEventbriteEvents = {
  events: [
    {
      id: 'eventbrite1',
      name: { text: 'Show de Música' },
      start: { local: '2025-08-10T20:00:00' },
      end: { local: '2025-08-10T23:00:00' },
      venue: {
        address: {
          city: 'Caldas Novas',
          region: 'GO',
        },
      },
    },
  ],
};

// Mock Airbnb OAuth2
export const mockAirbnbOAuth = {
  access_token: 'mock_airbnb_access_token',
  refresh_token: 'mock_airbnb_refresh_token',
  expires_in: 3600,
};

// Mock Airbnb Reservations
export const mockAirbnbReservations = {
  reservations: [
    {
      id: 'reservation1',
      listing_id: 'listing1',
      guest: { name: 'João Silva', email: 'joao@example.com' },
      check_in: '2025-02-01',
      check_out: '2025-02-05',
      status: 'accepted',
    },
  ],
};

// Mock Cloudbeds OAuth2
export const mockCloudbedsOAuth = {
  access_token: 'mock_cloudbeds_access_token',
  refresh_token: 'mock_cloudbeds_refresh_token',
  expires_in: 3600,
};

// Mock Cloudbeds Bookings
export const mockCloudbedsBookings = {
  bookings: [
    {
      booking_id: 'booking1',
      property_id: 'property1',
      guest_name: 'Maria Santos',
      check_in: '2025-02-10',
      check_out: '2025-02-15',
      status: 'confirmed',
    },
  ],
};

// Mock Local Events
export const mockLocalEvents = [
  {
    id: 1,
    name: 'Festival de Inverno',
    location: 'Caldas Novas, GO',
    start_date: '2025-07-15',
    end_date: '2025-07-20',
    source: 'google_calendar',
    impact_multiplier: 1.3,
  },
];

// Mock Competitor Prices
export const mockCompetitorPrices = [
  {
    id: 1,
    item_id: 1,
    competitor_name: 'Competitor A',
    price: 250,
    date: '2025-02-01',
    source: 'scraping',
  },
  {
    id: 2,
    item_id: 1,
    competitor_name: 'Competitor B',
    price: 280,
    date: '2025-02-01',
    source: 'api',
  },
];

// Helper para mockar fetch
export function mockFetch(response: any, ok: boolean = true) {
  return jest.fn(() =>
    Promise.resolve({
      ok,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
      status: ok ? 200 : 400,
    } as Response)
  );
}

// Mock global fetch
export function setupFetchMocks() {
  global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;
}

