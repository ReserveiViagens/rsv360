// API Configuration
export const API_CONFIG = {
  // Base URLs
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000',
  
  // Timeouts
  API_TIMEOUT: 30000, // 30 seconds
  WS_TIMEOUT: 20000, // 20 seconds
  
  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  
  // File upload
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  
  // WebSocket events
  WS_EVENTS: {
    CONNECTION: 'connect',
    DISCONNECTION: 'disconnect',
    NOTIFICATION: 'notification',
    USER_STATUS: 'user_status_update',
    REAL_TIME_UPDATE: 'real_time_update',
    TYPING: 'user_typing',
  },
  
  // API endpoints
  ENDPOINTS: {
    // Auth
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout',
      REFRESH: '/api/auth/refresh',
      VERIFY: '/api/auth/verify-token',
      ME: '/api/auth/me',
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      RESET_PASSWORD: '/api/auth/reset-password',
      SETUP_2FA: '/api/auth/2fa/setup',
      VERIFY_2FA_SETUP: '/api/auth/2fa/verify-setup',
      VERIFY_2FA: '/api/auth/2fa/verify',
      DISABLE_2FA: '/api/auth/2fa/disable',
      BACKUP_CODES: '/api/auth/2fa/backup-codes',
    },
    
    // Bookings
    BOOKINGS: {
      LIST: '/api/bookings',
      CREATE: '/api/bookings',
      GET: '/api/bookings/:id',
      UPDATE: '/api/bookings/:id',
      DELETE: '/api/bookings/:id',
      CANCEL: '/api/bookings/:id/cancel',
      STATS: '/api/bookings/stats',
      EXPORT: '/api/bookings/export',
    },
    
    // Payments
    PAYMENTS: {
      LIST: '/api/payments',
      CREATE: '/api/payments',
      GET: '/api/payments/:id',
      REFUND: '/api/payments/:id/refund',
      STATS: '/api/payments/stats',
      EXPORT: '/api/payments/export',
      RECEIPT: '/api/payments/:id/receipt',
    },
    
    // Users
    USERS: {
      LIST: '/api/users',
      CREATE: '/api/users',
      GET: '/api/users/:id',
      UPDATE: '/api/users/:id',
      DELETE: '/api/users/:id',
      PROFILE: '/api/users/profile',
      CHANGE_PASSWORD: '/api/users/change-password',
    },
    
    // Uploads
    UPLOADS: {
      UPLOAD: '/api/uploads/:type',
      LIST: '/api/uploads',
      DELETE: '/api/uploads/:id',
      AVATAR: '/api/uploads/avatar',
      VALIDATE: '/api/uploads/validate',
    },
    
    // System
    SYSTEM: {
      HEALTH: '/health',
      VERSION: '/api/version',
      STATS: '/api/stats',
    },
  },
  
  // HTTP status codes
  STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
  },
  
  // Error messages
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
    TIMEOUT_ERROR: 'Tempo limite excedido. Tente novamente.',
    UNAUTHORIZED: 'Sessão expirada. Faça login novamente.',
    FORBIDDEN: 'Acesso negado. Você não tem permissão para esta ação.',
    NOT_FOUND: 'Recurso não encontrado.',
    VALIDATION_ERROR: 'Dados inválidos. Verifique os campos preenchidos.',
    SERVER_ERROR: 'Erro interno do servidor. Tente novamente mais tarde.',
    UNKNOWN_ERROR: 'Erro inesperado. Tente novamente.',
  },
  
  // Success messages
  SUCCESS_MESSAGES: {
    LOGIN: 'Login realizado com sucesso!',
    LOGOUT: 'Logout realizado com sucesso!',
    CREATED: 'Criado com sucesso!',
    UPDATED: 'Atualizado com sucesso!',
    DELETED: 'Deletado com sucesso!',
    UPLOADED: 'Upload realizado com sucesso!',
    PAYMENT_PROCESSED: 'Pagamento processado com sucesso!',
    EMAIL_SENT: 'Email enviado com sucesso!',
  },
  
  // Cache settings
  CACHE: {
    DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
    USER_TTL: 30 * 60 * 1000, // 30 minutes
    STATS_TTL: 2 * 60 * 1000, // 2 minutes
  },
  
  // Notification types
  NOTIFICATION_TYPES: {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',
    BOOKING: 'booking',
    PAYMENT: 'payment',
    SYSTEM: 'system',
  },
  
  // User roles
  USER_ROLES: {
    ADMIN: 'admin',
    MANAGER: 'manager',
    USER: 'user',
  },
  
  // Booking statuses
  BOOKING_STATUSES: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
  },
  
  // Payment statuses
  PAYMENT_STATUSES: {
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
  },
  
  // Payment methods
  PAYMENT_METHODS: {
    CREDIT_CARD: 'credit_card',
    DEBIT_CARD: 'debit_card',
    BANK_TRANSFER: 'bank_transfer',
    PIX: 'pix',
    CASH: 'cash',
    VOUCHER: 'voucher',
  },
  
  // File types
  FILE_TYPES: {
    AVATAR: 'avatar',
    IMAGE: 'image',
    DOCUMENT: 'document',
  },
};

// Helper functions
export const apiHelpers = {
  // Build URL with parameters
  buildUrl: (endpoint: string, params: Record<string, any> = {}): string => {
    let url = endpoint;
    
    // Replace path parameters
    Object.keys(params).forEach(key => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, params[key]);
        delete params[key];
      }
    });
    
    // Add query parameters
    const queryString = new URLSearchParams(params).toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    
    return url;
  },
  
  // Format error message
  formatError: (error: any): string => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error.message) {
      return error.message;
    }
    
    return API_CONFIG.ERROR_MESSAGES.UNKNOWN_ERROR;
  },
  
  // Check if error is network related
  isNetworkError: (error: any): boolean => {
    return !error.response || error.code === 'NETWORK_ERROR';
  },
  
  // Check if error is timeout related
  isTimeoutError: (error: any): boolean => {
    return error.code === 'ECONNABORTED' || error.message?.includes('timeout');
  },
  
  // Format file size
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
  
  // Validate file type
  validateFileType: (file: File, type: string): boolean => {
    const allowedTypes = {
      [API_CONFIG.FILE_TYPES.AVATAR]: API_CONFIG.ALLOWED_IMAGE_TYPES,
      [API_CONFIG.FILE_TYPES.IMAGE]: API_CONFIG.ALLOWED_IMAGE_TYPES,
      [API_CONFIG.FILE_TYPES.DOCUMENT]: API_CONFIG.ALLOWED_DOCUMENT_TYPES,
    };
    
    return allowedTypes[type]?.includes(file.type) || false;
  },
  
  // Format currency
  formatCurrency: (amount: number, currency: string = 'BRL'): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  },
  
  // Format date
  formatDate: (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };
    
    return new Intl.DateTimeFormat('pt-BR', { ...defaultOptions, ...options })
      .format(new Date(date));
  },
  
  // Format date and time
  formatDateTime: (date: string | Date): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  },
};

export default API_CONFIG;
