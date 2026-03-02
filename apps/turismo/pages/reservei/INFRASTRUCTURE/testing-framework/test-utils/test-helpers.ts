import { faker } from '@faker-js/faker';
import { testClient } from './database-setup';

// Helper functions for generating test data
export class TestDataGenerator {
  static generateUser(overrides: any = {}) {
    return {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: faker.helpers.arrayElement(['customer', 'admin', 'staff']),
      created_at: faker.date.recent().toISOString(),
      ...overrides
    };
  }

  static generateCustomer(overrides: any = {}) {
    return {
      company_name: faker.company.name(),
      contact_person: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      address: faker.location.streetAddress(),
      ...overrides
    };
  }

  static generateHotel(overrides: any = {}) {
    return {
      name: faker.company.name() + ' Hotel',
      location: faker.location.city(),
      description: faker.lorem.paragraph(),
      rating: faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 1 }),
      price_per_night: faker.number.float({ min: 100, max: 500, fractionDigits: 2 }),
      amenities: faker.helpers.arrayElements([
        'WiFi', 'Piscina', 'Academia', 'Restaurante', 'Spa', 'Estacionamento'
      ], { min: 2, max: 4 }),
      ...overrides
    };
  }

  static generateRoom(overrides: any = {}) {
    return {
      room_number: faker.string.alphanumeric(3).toUpperCase(),
      room_type: faker.helpers.arrayElement(['Standard', 'Deluxe', 'Suite', 'Presidential']),
      capacity: faker.number.int({ min: 1, max: 6 }),
      price_per_night: faker.number.float({ min: 100, max: 800, fractionDigits: 2 }),
      amenities: faker.helpers.arrayElements([
        'WiFi', 'TV', 'Ar Condicionado', 'Frigobar', 'Varanda', 'Jacuzzi'
      ], { min: 2, max: 4 }),
      ...overrides
    };
  }

  static generateReservation(overrides: any = {}) {
    const checkIn = faker.date.future();
    const checkOut = new Date(checkIn.getTime() + faker.number.int({ min: 1, max: 7 }) * 24 * 60 * 60 * 1000);
    
    return {
      guest_name: faker.person.fullName(),
      guest_email: faker.internet.email(),
      check_in: checkIn.toISOString().split('T')[0],
      check_out: checkOut.toISOString().split('T')[0],
      guests: faker.number.int({ min: 1, max: 4 }),
      total_amount: faker.number.float({ min: 200, max: 2000, fractionDigits: 2 }),
      status: faker.helpers.arrayElement(['pending', 'confirmed', 'cancelled', 'completed']),
      ...overrides
    };
  }

  static generateProduct(overrides: any = {}) {
    return {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price({ min: 10, max: 500 })),
      category: faker.commerce.department(),
      stock_quantity: faker.number.int({ min: 0, max: 100 }),
      features: faker.helpers.arrayElements([
        'Premium Quality', 'Fast Delivery', '24/7 Support', 'Warranty', 'Free Shipping'
      ], { min: 1, max: 3 }),
      ...overrides
    };
  }

  static generateInvoice(overrides: any = {}) {
    return {
      invoice_number: `INV-${faker.date.recent().getFullYear()}-${faker.string.numeric(3)}`,
      amount: faker.number.float({ min: 50, max: 2000, fractionDigits: 2 }),
      description: faker.commerce.productDescription(),
      due_date: faker.date.future().toISOString().split('T')[0],
      status: faker.helpers.arrayElement(['draft', 'sent', 'paid', 'overdue']),
      ...overrides
    };
  }

  static generatePayment(overrides: any = {}) {
    return {
      amount: faker.number.float({ min: 50, max: 2000, fractionDigits: 2 }),
      payment_method: faker.helpers.arrayElement(['credit_card', 'debit_card', 'pix', 'bank_transfer']),
      transaction_id: `TXN_${faker.string.alphanumeric(10).toUpperCase()}`,
      status: faker.helpers.arrayElement(['pending', 'completed', 'failed', 'refunded']),
      processed_at: faker.date.recent().toISOString(),
      ...overrides
    };
  }

  static generateLead(overrides: any = {}) {
    return {
      source: faker.helpers.arrayElement(['Website', 'Social Media', 'Referral', 'Advertisement', 'Cold Call']),
      status: faker.helpers.arrayElement(['new', 'contacted', 'qualified', 'proposal', 'closed-won', 'closed-lost']),
      contact_name: faker.person.fullName(),
      contact_email: faker.internet.email(),
      contact_phone: faker.phone.number(),
      interest: faker.commerce.productName(),
      created_at: faker.date.recent().toISOString(),
      ...overrides
    };
  }

  static generateCampaign(overrides: any = {}) {
    const startDate = faker.date.recent();
    const endDate = new Date(startDate.getTime() + faker.number.int({ min: 30, max: 365 }) * 24 * 60 * 60 * 1000);
    
    return {
      name: faker.commerce.productName() + ' Campaign',
      description: faker.lorem.paragraph(),
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      discount_percentage: faker.number.int({ min: 5, max: 50 }),
      status: faker.helpers.arrayElement(['draft', 'active', 'paused', 'completed']),
      ...overrides
    };
  }
}

// Database helper functions
export class DatabaseTestHelpers {
  static async createTestUser(userData: any = {}) {
    const user = TestDataGenerator.generateUser(userData);
    const result = await testClient.query(
      'INSERT INTO crm_test.test_users (name, email, role) VALUES ($1, $2, $3) RETURNING *',
      [user.name, user.email, user.role]
    );
    return result.rows[0];
  }

  static async createTestCustomer(customerData: any = {}) {
    const customer = TestDataGenerator.generateCustomer(customerData);
    const result = await testClient.query(
      `INSERT INTO crm_test.test_customers 
       (company_name, contact_person, email, phone, address) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [customer.company_name, customer.contact_person, customer.email, customer.phone, customer.address]
    );
    return result.rows[0];
  }

  static async createTestHotel(hotelData: any = {}) {
    const hotel = TestDataGenerator.generateHotel(hotelData);
    const result = await testClient.query(
      `INSERT INTO booking_test.test_hotels 
       (name, location, description, rating, price_per_night, amenities) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [hotel.name, hotel.location, hotel.description, hotel.rating, hotel.price_per_night, JSON.stringify(hotel.amenities)]
    );
    return result.rows[0];
  }

  static async createTestReservation(reservationData: any = {}) {
    const reservation = TestDataGenerator.generateReservation(reservationData);
    const result = await testClient.query(
      `INSERT INTO booking_test.test_reservations 
       (guest_name, guest_email, check_in, check_out, guests, total_amount, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [reservation.guest_name, reservation.guest_email, reservation.check_in, reservation.check_out, 
       reservation.guests, reservation.total_amount, reservation.status]
    );
    return result.rows[0];
  }

  static async createTestProduct(productData: any = {}) {
    const product = TestDataGenerator.generateProduct(productData);
    const result = await testClient.query(
      `INSERT INTO product_test.test_products 
       (name, description, price, category, stock_quantity, features) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [product.name, product.description, product.price, product.category, product.stock_quantity, JSON.stringify(product.features)]
    );
    return result.rows[0];
  }

  static async createTestInvoice(invoiceData: any = {}) {
    const invoice = TestDataGenerator.generateInvoice(invoiceData);
    const result = await testClient.query(
      `INSERT INTO financial_test.test_invoices 
       (invoice_number, amount, description, due_date, status) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [invoice.invoice_number, invoice.amount, invoice.description, invoice.due_date, invoice.status]
    );
    return result.rows[0];
  }

  static async createTestPayment(paymentData: any = {}) {
    const payment = TestDataGenerator.generatePayment(paymentData);
    const result = await testClient.query(
      `INSERT INTO financial_test.test_payments 
       (amount, payment_method, transaction_id, status, processed_at) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [payment.amount, payment.payment_method, payment.transaction_id, payment.status, payment.processed_at]
    );
    return result.rows[0];
  }

  static async createTestLead(leadData: any = {}) {
    const lead = TestDataGenerator.generateLead(leadData);
    const result = await testClient.query(
      `INSERT INTO crm_test.test_leads 
       (source, status, contact_name, contact_email, contact_phone, interest) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [lead.source, lead.status, lead.contact_name, lead.contact_email, lead.contact_phone, lead.interest]
    );
    return result.rows[0];
  }

  static async createTestCampaign(campaignData: any = {}) {
    const campaign = TestDataGenerator.generateCampaign(campaignData);
    const result = await testClient.query(
      `INSERT INTO marketing_test.test_campaigns 
       (name, description, start_date, end_date, discount_percentage, status) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [campaign.name, campaign.description, campaign.start_date, campaign.end_date, campaign.discount_percentage, campaign.status]
    );
    return result.rows[0];
  }
}

// API test helpers
export class APITestHelpers {
  static async makeAuthenticatedRequest(url: string, options: any = {}) {
    // This would integrate with your authentication system
    // For now, it's a placeholder
    const token = await this.getAuthToken();
    
    return {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    };
  }

  static async getAuthToken() {
    // Placeholder for getting authentication token
    // In real implementation, this would call your auth API
    return 'test-token-123';
  }

  static async waitForAPIResponse(url: string, expectedStatus: number = 200, timeout: number = 5000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const response = await fetch(url);
        if (response.status === expectedStatus) {
          return response;
        }
      } catch (error) {
        // Continue waiting
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error(`API did not return expected status ${expectedStatus} within ${timeout}ms`);
  }
}

// Performance test helpers
export class PerformanceTestHelpers {
  static async measurePageLoadTime(page: any, url: string) {
    const startTime = Date.now();
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    const endTime = Date.now();
    
    return endTime - startTime;
  }

  static async measureAPIResponseTime(url: string) {
    const startTime = Date.now();
    await fetch(url);
    const endTime = Date.now();
    
    return endTime - startTime;
  }

  static async checkMemoryUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage();
    }
    return null;
  }
}
