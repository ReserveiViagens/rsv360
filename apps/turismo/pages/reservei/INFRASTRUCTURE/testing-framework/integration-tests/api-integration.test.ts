import request from 'supertest';
import { SERVER_URL } from '../test-utils/server-setup';

describe('API Integration Tests', () => {
  describe('Health Check', () => {
    test('should return health status', async () => {
      const response = await request(SERVER_URL)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('CRM API Endpoints', () => {
    test('should create a new user via API', async () => {
      const userData = {
        name: 'API Test User',
        email: 'apitest@example.com'
      };

      const response = await request(SERVER_URL)
        .post('/api/crm/users')
        .send(userData)
        .expect(201);

      expect(response.body).toMatchObject({
        name: userData.name,
        email: userData.email
      });
      expect(response.body.id).toBeDefined();
    });

    test('should retrieve users list', async () => {
      const response = await request(SERVER_URL)
        .get('/api/crm/users')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    test('should update user via API', async () => {
      const userId = 1;
      const updateData = {
        name: 'Updated API User'
      };

      const response = await request(SERVER_URL)
        .put(`/api/crm/users/${userId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
    });
  });

  describe('Booking Engine API Endpoints', () => {
    test('should create a new hotel', async () => {
      const hotelData = {
        name: 'Test Hotel API',
        location: 'Test Location',
        description: 'A test hotel for API testing'
      };

      const response = await request(SERVER_URL)
        .post('/api/booking/hotels')
        .send(hotelData)
        .expect(201);

      expect(response.body).toMatchObject({
        name: hotelData.name,
        location: hotelData.location,
        description: hotelData.description
      });
    });

    test('should create a reservation', async () => {
      const reservationData = {
        hotel_id: 1,
        guest_name: 'Test Guest',
        guest_email: 'guest@example.com',
        check_in: '2024-01-01',
        check_out: '2024-01-03',
        guests: 2
      };

      const response = await request(SERVER_URL)
        .post('/api/booking/reservations')
        .send(reservationData)
        .expect(201);

      expect(response.body).toMatchObject({
        guest_name: reservationData.guest_name,
        guest_email: reservationData.guest_email,
        guests: reservationData.guests
      });
    });
  });

  describe('Financial System API Endpoints', () => {
    test('should create an invoice', async () => {
      const invoiceData = {
        customer_id: 1,
        amount: 100.00,
        description: 'Test invoice',
        due_date: '2024-02-01'
      };

      const response = await request(SERVER_URL)
        .post('/api/financial/invoices')
        .send(invoiceData)
        .expect(201);

      expect(response.body).toMatchObject({
        amount: invoiceData.amount,
        description: invoiceData.description
      });
      expect(response.body.invoice_number).toBeDefined();
    });

    test('should process a payment', async () => {
      const paymentData = {
        invoice_id: 1,
        amount: 100.00,
        payment_method: 'credit_card',
        transaction_id: 'test_txn_123'
      };

      const response = await request(SERVER_URL)
        .post('/api/financial/payments')
        .send(paymentData)
        .expect(201);

      expect(response.body).toMatchObject({
        amount: paymentData.amount,
        payment_method: paymentData.payment_method,
        transaction_id: paymentData.transaction_id
      });
    });
  });

  describe('Product Catalog API Endpoints', () => {
    test('should create a new product', async () => {
      const productData = {
        name: 'Test Product',
        description: 'A test product for API testing',
        price: 29.99,
        category: 'Test Category',
        stock_quantity: 100
      };

      const response = await request(SERVER_URL)
        .post('/api/products')
        .send(productData)
        .expect(201);

      expect(response.body).toMatchObject({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        category: productData.category,
        stock_quantity: productData.stock_quantity
      });
    });

    test('should retrieve products by category', async () => {
      const response = await request(SERVER_URL)
        .get('/api/products?category=Test Category')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for non-existent endpoint', async () => {
      await request(SERVER_URL)
        .get('/api/non-existent')
        .expect(404);
    });

    test('should return 400 for invalid data', async () => {
      const invalidData = {
        // Missing required fields
      };

      await request(SERVER_URL)
        .post('/api/crm/users')
        .send(invalidData)
        .expect(400);
    });

    test('should return 422 for validation errors', async () => {
      const invalidEmailData = {
        name: 'Test User',
        email: 'invalid-email' // Invalid email format
      };

      await request(SERVER_URL)
        .post('/api/crm/users')
        .send(invalidEmailData)
        .expect(422);
    });
  });

  describe('Authentication', () => {
    test('should require authentication for protected endpoints', async () => {
      await request(SERVER_URL)
        .get('/api/admin/users')
        .expect(401);
    });

    test('should authenticate with valid token', async () => {
      // First, get a token
      const loginResponse = await request(SERVER_URL)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'admin123'
        })
        .expect(200);

      const token = loginResponse.body.token;

      // Use token for protected endpoint
      const response = await request(SERVER_URL)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
