// Serviço de API centralizado para Onion RSV 360
// Conecta com todos os microsserviços do backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Configuração base do cliente fetch
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
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      };

      try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
          if (response.status === 401) {
            // Token expirado, tentar renovar
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              try {
                const refreshResponse = await fetch(`${API_BASE_URL}/api/core/refresh`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ refresh_token: refreshToken }),
                });
                
                if (refreshResponse.ok) {
                  const { access_token, refresh_token } = await refreshResponse.json();
                  localStorage.setItem('access_token', access_token);
                  localStorage.setItem('refresh_token', refresh_token);
                  
                  // Retry original request
                  config.headers = {
                    ...config.headers,
                    Authorization: `Bearer ${access_token}`,
                  };
                  const retryResponse = await fetch(url, config);
                  if (!retryResponse.ok) {
                    throw new Error(`HTTP ${retryResponse.status}: ${retryResponse.statusText}`);
                  }
                  return await retryResponse.json();
                }
              } catch (refreshError) {
                // Refresh failed, redirect to login
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
                throw new Error('Sessão expirada. Faça login novamente.');
              }
            }
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('API Error:', error);
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

// Clientes para cada microsserviço
export const coreApi = createApiClient(`${API_BASE_URL}`);
export const travelApi = createApiClient(`${API_BASE_URL.replace('5000', '5001')}`);
export const attractionsApi = createApiClient(`${API_BASE_URL.replace('5000', '5002')}`);
export const parksApi = createApiClient(`${API_BASE_URL.replace('5000', '5003')}`);
export const ticketsApi = createApiClient(`${API_BASE_URL.replace('5000', '5004')}`);
export const loyaltyApi = createApiClient(`${API_BASE_URL.replace('5000', '5005')}`);
export const rewardsApi = createApiClient(`${API_BASE_URL.replace('5000', '5006')}`);
export const couponsApi = createApiClient(`${API_BASE_URL.replace('5000', '5007')}`);
export const giftcardsApi = createApiClient(`${API_BASE_URL.replace('5000', '5008')}`);
export const financeApi = createApiClient(`${API_BASE_URL.replace('5000', '5009')}`);
export const salesApi = createApiClient(`${API_BASE_URL.replace('5000', '5010')}`);
export const ecommerceApi = createApiClient(`${API_BASE_URL.replace('5000', '5011')}`);
export const marketingApi = createApiClient(`${API_BASE_URL.replace('5000', '5012')}`);
export const analyticsApi = createApiClient(`${API_BASE_URL.replace('5000', '5013')}`);
export const seoApi = createApiClient(`${API_BASE_URL.replace('5000', '5014')}`);
export const multilingualApi = createApiClient(`${API_BASE_URL.replace('5000', '5015')}`);
export const subscriptionsApi = createApiClient(`${API_BASE_URL.replace('5000', '5016')}`);
export const inventoryApi = createApiClient(`${API_BASE_URL.replace('5000', '5017')}`);
export const documentsApi = createApiClient(`${API_BASE_URL.replace('5000', '5018')}`);
export const visaApi = createApiClient(`${API_BASE_URL.replace('5000', '5019')}`);
export const insuranceApi = createApiClient(`${API_BASE_URL.replace('5000', '5020')}`);
export const photosApi = createApiClient(`${API_BASE_URL.replace('5000', '5021')}`);
export const videosApi = createApiClient(`${API_BASE_URL.replace('5000', '5022')}`);
export const reviewsApi = createApiClient(`${API_BASE_URL.replace('5000', '5023')}`);
export const chatbotsApi = createApiClient(`${API_BASE_URL.replace('5000', '5024')}`);
export const notificationsApi = createApiClient(`${API_BASE_URL.replace('5000', '5025')}`);

// Serviços específicos por domínio
export const authService = {
  login: (email: string, password: string) =>
    coreApi.post('/api/core/token', { email, password }),
  
  refresh: (refreshToken: string) =>
    coreApi.post('/api/core/refresh', { refresh_token: refreshToken }),
  
  verify: () => coreApi.post('/api/core/verify'),
  
  register: (userData: any) =>
    coreApi.post('/api/users/', userData),
  
  getCurrentUser: () => coreApi.get('/api/users/me'),
  
  updateUser: (userData: any) =>
    coreApi.put('/api/users/me', userData),
  
  changePassword: (currentPassword: string, newPassword: string) =>
    coreApi.post('/api/users/me/change-password', { current_password: currentPassword, new_password: newPassword }),
};

export const loyaltyService = {
  getTiers: () => loyaltyApi.get('/loyalty/tiers/'),
  getUserLoyalty: (userId: number) => loyaltyApi.get(`/loyalty/users/${userId}/`),
  getCampaigns: () => loyaltyApi.get('/loyalty/campaigns/'),
  getStats: () => loyaltyApi.get('/loyalty/stats/'),
  createCampaign: (campaignData: any) => loyaltyApi.post('/loyalty/campaigns/', campaignData),
  updateTier: (tierId: number, tierData: any) => loyaltyApi.put(`/loyalty/tiers/${tierId}`, tierData),
};

export const groupsService = {
  getGroups: () => coreApi.get('/groups/'),
  getGroup: (groupId: number) => coreApi.get(`/groups/${groupId}/`),
  createGroup: (groupData: any) => coreApi.post('/groups/', groupData),
  updateGroup: (groupId: number, groupData: any) => coreApi.put(`/groups/${groupId}`, groupData),
  deleteGroup: (groupId: number) => coreApi.delete(`/groups/${groupId}`),
  getGroupMembers: (groupId: number) => coreApi.get(`/groups/${groupId}/members/`),
  addMember: (groupId: number, memberData: any) => coreApi.post(`/groups/${groupId}/members/`, memberData),
  getGroupActivities: (groupId: number) => coreApi.get(`/groups/${groupId}/activities/`),
};

export const documentsService = {
  getDocuments: (params?: any) => documentsApi.get(`/documents/?${new URLSearchParams(params).toString()}`),
  getDocument: (docId: number) => documentsApi.get(`/documents/${docId}/`),
  uploadDocument: (file: File, metadata: any) => {
    const formData = new FormData();
    formData.append('file', file);
    Object.keys(metadata).forEach(key => {
      formData.append(key, metadata[key]);
    });
    return documentsApi.post('/documents/upload/', formData);
  },
  updateDocument: (docId: number, docData: any) => documentsApi.put(`/documents/${docId}`, docData),
  deleteDocument: (docId: number) => documentsApi.delete(`/documents/${docId}`),
  getCategories: () => documentsApi.get('/documents/categories/'),
  searchDocuments: (query: string) => documentsApi.get(`/documents/search/?q=${query}`),
};

export const visaService = {
  getApplications: (params?: any) => visaApi.get(`/visa/applications/?${new URLSearchParams(params).toString()}`),
  getApplication: (appId: number) => visaApi.get(`/visa/applications/${appId}/`),
  createApplication: (appData: any) => visaApi.post('/visa/applications/', appData),
  updateApplication: (appId: number, appData: any) => visaApi.put(`/visa/applications/${appId}`, appData),
  getVisaTypes: () => visaApi.get('/visa/types/'),
  getStats: () => visaApi.get('/visa/stats/'),
  uploadDocument: (appId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return visaApi.post(`/visa/applications/${appId}/documents/`, formData);
  },
};

export const insuranceService = {
  getPolicies: (params?: any) => insuranceApi.get(`/insurance/policies/?${new URLSearchParams(params).toString()}`),
  getPolicy: (policyId: number) => insuranceApi.get(`/insurance/policies/${policyId}/`),
  createPolicy: (policyData: any) => insuranceApi.post('/insurance/policies/', policyData),
  updatePolicy: (policyId: number, policyData: any) => insuranceApi.put(`/insurance/policies/${policyId}`, policyData),
  getClaims: (params?: any) => insuranceApi.get(`/insurance/claims/?${new URLSearchParams(params).toString()}`),
  getClaim: (claimId: number) => insuranceApi.get(`/insurance/claims/${claimId}/`),
  createClaim: (claimData: any) => insuranceApi.post('/insurance/claims/', claimData),
  updateClaim: (claimId: number, claimData: any) => insuranceApi.put(`/insurance/claims/${claimId}`, claimData),
  getInsuranceTypes: () => insuranceApi.get('/insurance/types/'),
  getStats: () => insuranceApi.get('/insurance/stats/'),
};

export const travelService = {
  getBookings: (params?: any) => travelApi.get(`/travel/bookings/?${new URLSearchParams(params).toString()}`),
  getBooking: (bookingId: number) => travelApi.get(`/travel/bookings/${bookingId}/`),
  createBooking: (bookingData: any) => travelApi.post('/travel/bookings/', bookingData),
  updateBooking: (bookingId: number, bookingData: any) => travelApi.put(`/travel/bookings/${bookingId}`, bookingData),
  cancelBooking: (bookingId: number) => travelApi.delete(`/travel/bookings/${bookingId}`),
  getDestinations: () => travelApi.get('/travel/destinations/'),
  getHotels: (params?: any) => travelApi.get(`/travel/hotels/?${new URLSearchParams(params).toString()}`),
  getFlights: (params?: any) => travelApi.get(`/travel/flights/?${new URLSearchParams(params).toString()}`),
};

export const attractionsService = {
  getAttractions: (params?: any) => attractionsApi.get(`/attractions/?${new URLSearchParams(params).toString()}`),
  getAttraction: (attractionId: number) => attractionsApi.get(`/attractions/${attractionId}/`),
  createAttraction: (attractionData: any) => attractionsApi.post('/attractions/', attractionData),
  updateAttraction: (attractionId: number, attractionData: any) => attractionsApi.put(`/attractions/${attractionId}`, attractionData),
  deleteAttraction: (attractionId: number) => attractionsApi.delete(`/attractions/${attractionId}`),
  getCategories: () => attractionsApi.get('/attractions/categories/'),
  searchAttractions: (query: string) => attractionsApi.get(`/attractions/search/?q=${query}`),
};

export const ticketsService = {
  getTickets: (params?: any) => ticketsApi.get(`/tickets/?${new URLSearchParams(params).toString()}`),
  getTicket: (ticketId: number) => ticketsApi.get(`/tickets/${ticketId}/`),
  createTicket: (ticketData: any) => ticketsApi.post('/tickets/', ticketData),
  updateTicket: (ticketId: number, ticketData: any) => ticketsApi.put(`/tickets/${ticketId}`, ticketData),
  deleteTicket: (ticketId: number) => ticketsApi.delete(`/tickets/${ticketId}`),
  getTicketTypes: () => ticketsApi.get('/tickets/types/'),
  validateTicket: (ticketCode: string) => ticketsApi.post('/tickets/validate/', { code: ticketCode }),
};

export const financeService = {
  getTransactions: (params?: any) => financeApi.get(`/finance/transactions/?${new URLSearchParams(params).toString()}`),
  getTransaction: (transactionId: number) => financeApi.get(`/finance/transactions/${transactionId}/`),
  createTransaction: (transactionData: any) => financeApi.post('/finance/transactions/', transactionData),
  getReports: (params?: any) => financeApi.get(`/finance/reports/?${new URLSearchParams(params).toString()}`),
  getStats: () => financeApi.get('/finance/stats/'),
  exportData: (format: string, params?: any) => financeApi.get(`/finance/export/${format}/?${new URLSearchParams(params).toString()}`),
};

export const marketingService = {
  getCampaigns: (params?: any) => marketingApi.get(`/marketing/campaigns/?${new URLSearchParams(params).toString()}`),
  getCampaign: (campaignId: number) => marketingApi.get(`/marketing/campaigns/${campaignId}/`),
  createCampaign: (campaignData: any) => marketingApi.post('/marketing/campaigns/', campaignData),
  updateCampaign: (campaignId: number, campaignData: any) => marketingApi.put(`/marketing/campaigns/${campaignId}`, campaignData),
  deleteCampaign: (campaignId: number) => marketingApi.delete(`/marketing/campaigns/${campaignId}`),
  getStats: () => marketingApi.get('/marketing/stats/'),
  sendEmail: (emailData: any) => marketingApi.post('/marketing/email/', emailData),
};

export const analyticsService = {
  getDashboardData: () => analyticsApi.get('/analytics/dashboard/'),
  getReports: (params?: any) => analyticsApi.get(`/analytics/reports/?${new URLSearchParams(params).toString()}`),
  getMetrics: (metricType: string, params?: any) => analyticsApi.get(`/analytics/metrics/${metricType}/?${new URLSearchParams(params).toString()}`),
  exportReport: (reportId: number, format: string) => analyticsApi.get(`/analytics/reports/${reportId}/export/${format}/`),
  createCustomReport: (reportData: any) => analyticsApi.post('/analytics/reports/custom/', reportData),
};

// Hook personalizado para usar os serviços
export const useApiService = () => {
  return {
    auth: authService,
    loyalty: loyaltyService,
    groups: groupsService,
    documents: documentsService,
    visa: visaService,
    insurance: insuranceService,
    travel: travelService,
    attractions: attractionsService,
    tickets: ticketsService,
    finance: financeService,
    marketing: marketingService,
    analytics: analyticsService,
  };
};

// Utilitários para tratamento de erros
export const handleApiError = (error: any) => {
  if (error.message.includes('401')) {
    // Redirecionar para login
    window.location.href = '/login';
  } else if (error.message.includes('403')) {
    // Acesso negado
    console.error('Acesso negado:', error);
  } else if (error.message.includes('500')) {
    // Erro interno do servidor
    console.error('Erro interno do servidor:', error);
  } else {
    // Outros erros
    console.error('Erro da API:', error);
  }
  
  return {
    success: false,
    error: error.message,
  };
};

// Interceptor global para tratamento de erros
export const setupApiInterceptors = () => {
  // Interceptar erros de rede
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message) {
      handleApiError(event.reason);
    }
  });
};

// Inicializar interceptors
if (typeof window !== 'undefined') {
  setupApiInterceptors();
} 