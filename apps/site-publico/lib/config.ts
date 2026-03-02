// Configurações da aplicação
// Exportar API_BASE_URL diretamente para compatibilidade
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';

export const config = {
  // URLs das APIs
  API_BASE_URL,

  // Configurações do site
  SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME || 'Reservei Viagens',
  SITE_TAGLINE: process.env.NEXT_PUBLIC_SITE_TAGLINE || 'Parques, Hotéis & Atrações',

  // Configurações de upload
  UPLOAD_URL: process.env.NEXT_PUBLIC_UPLOAD_URL || 'http://localhost:5002/api/upload',

  // Configurações de cache
  CACHE_TTL: parseInt(process.env.NEXT_PUBLIC_CACHE_TTL || '300000'),

  // Configurações de desenvolvimento
  DEBUG: process.env.NEXT_PUBLIC_DEBUG === 'true',

  // Endpoints da API
  endpoints: {
    website: {
      settings: '/api/website/settings',
      content: (type: string) => `/api/website/content/${type}`,
    },
    admin: {
      content: '/api/admin/website/content',
      contentById: (id: number) => `/api/admin/website/content/${id}`,
      upload: '/api/admin/upload',
    }
  }
};

// Função para construir URLs completas
export const buildApiUrl = (endpoint: string) => {
  return `${config.API_BASE_URL}${endpoint}`;
};

// Função para fazer requisições com configurações padrão
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const fullUrl = url.startsWith('http') ? url : buildApiUrl(url);

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(fullUrl, defaultOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};
