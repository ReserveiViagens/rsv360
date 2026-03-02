// ===================================================================
// SERVIÇO DE API CORRIGIDO - ONION RSV 360
// Conecta com TODAS as portas corretas dos 30 microserviços
// ===================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ===================================================================
// CLIENTE API GENÉRICO COM ERROR HANDLING COMPLETO
// ===================================================================
const createApiClient = (baseURL: string) => {
  return {
    async request<T>(
      endpoint: string,
      options: RequestInit = {}
    ): Promise<T> {
      const url = `${baseURL}${endpoint}`;
      const token = localStorage.getItem('access_token');

      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      };

      try {
        console.log(`🔗 API Request: ${options.method || 'GET'} ${url}`);
        const response = await fetch(url, config);

        if (!response.ok) {
          console.error(`❌ API Error: ${response.status} ${response.statusText}`);
          if (response.status === 401) {
            // Token expirado
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
            throw new Error('Sessão expirada. Faça login novamente.');
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`✅ API Success: ${url}`, data);
        return data;
      } catch (error) {
        console.error(`💥 API Error for ${url}:`, error);
        throw error;
      }
    },

    get<T>(endpoint: string): Promise<T> {
      return this.request<T>(endpoint, { method: 'GET' });
    },

    post<T>(endpoint: string, data?: any): Promise<T> {
      return this.request<T>(endpoint, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      });
    },

    put<T>(endpoint: string, data?: any): Promise<T> {
      return this.request<T>(endpoint, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      });
    },

    delete<T>(endpoint: string): Promise<T> {
      return this.request<T>(endpoint, { method: 'DELETE' });
    },

    patch<T>(endpoint: string, data?: any): Promise<T> {
      return this.request<T>(endpoint, {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      });
    },
  };
};

// ===================================================================
// CLIENTES PARA CADA MICROSERVIÇO - PORTAS CORRETAS
// ===================================================================
export const coreApi = createApiClient('http://localhost:5000');
export const travelApi = createApiClient('http://localhost:5003');
export const financeApi = createApiClient('http://localhost:5005');
export const ticketsApi = createApiClient('http://localhost:5006');
export const paymentsApi = createApiClient('http://localhost:5007');
export const ecommerceApi = createApiClient('http://localhost:5008');
export const attractionsApi = createApiClient('http://localhost:5009');
export const vouchersApi = createApiClient('http://localhost:5010');
export const voucherEditorApi = createApiClient('http://localhost:5011');
export const giftcardsApi = createApiClient('http://localhost:5012');
export const couponsApi = createApiClient('http://localhost:5013');
export const parksApi = createApiClient('http://localhost:5014');
export const mapsApi = createApiClient('http://localhost:5015');
export const visaApi = createApiClient('http://localhost:5016');
export const marketingApi = createApiClient('http://localhost:5017');
export const subscriptionsApi = createApiClient('http://localhost:5018');
export const seoApi = createApiClient('http://localhost:5019');
export const multilingualApi = createApiClient('http://localhost:5020');
export const videosApi = createApiClient('http://localhost:5021');
export const photosApi = createApiClient('http://localhost:5022');
export const adminApi = createApiClient('http://localhost:5023');
export const analyticsApi = createApiClient('http://localhost:5024');
export const reportsApi = createApiClient('http://localhost:5025');
export const dataApi = createApiClient('http://localhost:5026');
export const notificationsApi = createApiClient('http://localhost:5027');
export const inventoryApi = createApiClient('http://localhost:5028');
export const reviewsApi = createApiClient('http://localhost:5029');
export const loyaltyApi = createApiClient('http://localhost:5030');
export const refundsApi = createApiClient('http://localhost:5032');
export const sectoralFinanceApi = createApiClient('http://localhost:5033');

// ===================================================================
// SERVIÇOS ESPECÍFICOS COM FUNCIONALIDADES COMPLETAS
// ===================================================================

// AUTH SERVICE
export const authService = {
  login: (email: string, password: string) =>
    coreApi.post('/api/core/token', { email, password }),

  register: (userData: any) =>
    coreApi.post('/api/users/', userData),

  getCurrentUser: () => coreApi.get('/api/users/me'),

  updateUser: (userData: any) =>
    coreApi.put('/api/users/me', userData),
};

// TRAVEL SERVICE (INCLUINDO HOTÉIS)
export const travelService = {
  // HOTÉIS - FUNCIONALIDADE COMPLETA
  getHotels: (params?: any) =>
    travelApi.get(`/hotels/?${new URLSearchParams(params || {}).toString()}`),

  getHotel: (hotelId: number) =>
    travelApi.get(`/hotels/${hotelId}/`),

  createHotel: (hotelData: any) =>
    travelApi.post('/hotels/', hotelData),

  updateHotel: (hotelId: number, hotelData: any) =>
    travelApi.put(`/hotels/${hotelId}/`, hotelData),

  deleteHotel: (hotelId: number) =>
    travelApi.delete(`/hotels/${hotelId}/`),

  // RESERVAS
  getBookings: (params?: any) =>
    travelApi.get(`/bookings/?${new URLSearchParams(params || {}).toString()}`),

  getBooking: (bookingId: number) =>
    travelApi.get(`/bookings/${bookingId}/`),

  createBooking: (bookingData: any) =>
    travelApi.post('/bookings/', bookingData),

  updateBooking: (bookingId: number, bookingData: any) =>
    travelApi.put(`/bookings/${bookingId}/`, bookingData),

  cancelBooking: (bookingId: number) =>
    travelApi.delete(`/bookings/${bookingId}/`),

  // DESTINOS
  getDestinations: () =>
    travelApi.get('/destinations/'),

  getPackages: () =>
    travelApi.get('/packages/'),
};

// CUSTOMER SERVICE
export const customerService = {
  getCustomers: (params?: any) =>
    coreApi.get(`/customers/?${new URLSearchParams(params || {}).toString()}`),

  getCustomer: (customerId: number) =>
    coreApi.get(`/customers/${customerId}/`),

  createCustomer: (customerData: any) =>
    coreApi.post('/customers/', customerData),

  updateCustomer: (customerId: number, customerData: any) =>
    coreApi.put(`/customers/${customerId}/`, customerData),

  deleteCustomer: (customerId: number) =>
    coreApi.delete(`/customers/${customerId}/`),
};

// ATTRACTIONS SERVICE
export const attractionsService = {
  getAttractions: (params?: any) =>
    attractionsApi.get(`/attractions/?${new URLSearchParams(params || {}).toString()}`),

  getAttraction: (attractionId: number) =>
    attractionsApi.get(`/attractions/${attractionId}/`),

  createAttraction: (attractionData: any) =>
    attractionsApi.post('/attractions/', attractionData),

  updateAttraction: (attractionId: number, attractionData: any) =>
    attractionsApi.put(`/attractions/${attractionId}/`, attractionData),

  deleteAttraction: (attractionId: number) =>
    attractionsApi.delete(`/attractions/${attractionId}/`),
};

// ECOMMERCE SERVICE
export const ecommerceService = {
  getProducts: (params?: any) =>
    ecommerceApi.get(`/products/?${new URLSearchParams(params || {}).toString()}`),

  getProduct: (productId: number) =>
    ecommerceApi.get(`/products/${productId}/`),

  createProduct: (productData: any) =>
    ecommerceApi.post('/products/', productData),

  updateProduct: (productId: number, productData: any) =>
    ecommerceApi.put(`/products/${productId}/`, productData),

  deleteProduct: (productId: number) =>
    ecommerceApi.delete(`/products/${productId}/`),

  getOrders: (params?: any) =>
    ecommerceApi.get(`/orders/?${new URLSearchParams(params || {}).toString()}`),

  createOrder: (orderData: any) =>
    ecommerceApi.post('/orders/', orderData),
};

// FINANCE SERVICE
export const financeService = {
  getTransactions: (params?: any) =>
    financeApi.get(`/transactions/?${new URLSearchParams(params || {}).toString()}`),

  createTransaction: (transactionData: any) =>
    financeApi.post('/transactions/', transactionData),

  getReports: (params?: any) =>
    financeApi.get(`/reports/?${new URLSearchParams(params || {}).toString()}`),

  getStats: () =>
    financeApi.get('/stats/'),
};

// ANALYTICS SERVICE
export const analyticsService = {
  getDashboardData: () =>
    analyticsApi.get('/dashboard/'),

  getReports: (params?: any) =>
    analyticsApi.get(`/reports/?${new URLSearchParams(params || {}).toString()}`),

  getMetrics: (metricType: string, params?: any) =>
    analyticsApi.get(`/metrics/${metricType}/?${new URLSearchParams(params || {}).toString()}`),
};

// ===================================================================
// HOOK PRINCIPAL PARA USAR OS SERVIÇOS
// ===================================================================
export const useApiService = () => {
  return {
    auth: authService,
    travel: travelService,
    customers: customerService,
    attractions: attractionsService,
    ecommerce: ecommerceService,
    finance: financeService,
    analytics: analyticsService,
  };
};

// ===================================================================
// UTILITIES PARA ERROR HANDLING
// ===================================================================
export const handleApiError = (error: any) => {
  console.error('🔥 API Error Handler:', error);

  if (error.message.includes('401')) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
    return { success: false, error: 'Sessão expirada. Faça login novamente.' };
  }

  if (error.message.includes('403')) {
    return { success: false, error: 'Acesso negado. Verifique suas permissões.' };
  }

  if (error.message.includes('500')) {
    return { success: false, error: 'Erro interno do servidor. Tente novamente.' };
  }

  if (error.message.includes('fetch')) {
    return { success: false, error: 'Erro de conexão. Verifique sua internet.' };
  }

  return { success: false, error: error.message || 'Erro desconhecido.' };
};

// ===================================================================
// TESTES DE CONECTIVIDADE
// ===================================================================
export const testConnectivity = async () => {
  const results = {
    backend: false,
    apis: [] as any[],
    errors: [] as string[]
  };

  const testApis = [
    { name: 'Core', client: coreApi, endpoint: '/health' },
    { name: 'Travel', client: travelApi, endpoint: '/health' },
    { name: 'Finance', client: financeApi, endpoint: '/health' },
    { name: 'Ecommerce', client: ecommerceApi, endpoint: '/health' },
    { name: 'Analytics', client: analyticsApi, endpoint: '/health' }
  ];

  for (const api of testApis) {
    try {
      const response = await api.client.get(api.endpoint);
      results.apis.push({ name: api.name, status: 'OK', response });
    } catch (error) {
      results.apis.push({ name: api.name, status: 'ERROR', error: error.message });
      results.errors.push(`${api.name}: ${error.message}`);
    }
  }

  results.backend = results.apis.filter(api => api.status === 'OK').length > 0;

  console.log('🧪 Connectivity Test Results:', results);
  return results;
};
