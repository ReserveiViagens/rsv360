import { CustomerDTO, CustomerResult } from '../interfaces';

export class CustomerService {
  async createCustomer(enterpriseId: string, data: CustomerDTO): Promise<CustomerResult> {
    // Mock implementation for testing
    return {
      id: 'cus_mock_' + Date.now(),
      externalId: 'cus_mp_' + Date.now(),
      email: data.email,
      name: data.name,
      metadata: data.metadata || {},
    };
  }

  async getCustomer(id: string): Promise<CustomerResult | null> {
    // Mock implementation for testing
    return {
      id,
      externalId: 'cus_mp_' + id,
      email: 'mock@example.com',
      name: 'Mock Customer',
      metadata: {},
    };
  }

  async listCustomers(enterpriseId: string, filters?: any): Promise<any> {
    // Mock implementation for testing
    return {
      data: [{
        id: 'cus_mock_1',
        externalId: 'cus_mp_1',
        email: 'mock1@example.com',
        name: 'Mock Customer 1',
        metadata: {},
      }],
      total: 1,
      limit: 10,
      offset: 0,
    };
  }

  async updateCustomer(id: string, data: Partial<CustomerDTO>): Promise<CustomerResult> {
    // Mock implementation for testing
    return {
      id,
      externalId: 'cus_mp_' + id,
      email: data.email || 'updated@example.com',
      name: data.name || 'Updated Customer',
      metadata: data.metadata || {},
    };
  }

  async deleteCustomer(id: string): Promise<void> {
    // Mock implementation for testing - just return void
  }
}