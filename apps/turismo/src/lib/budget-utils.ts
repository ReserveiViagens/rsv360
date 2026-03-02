// Utilitários para o sistema de cotações RSV 360
import { Budget, BudgetItem } from './types/budget';

// Formatação de moeda
export const formatCurrency = (value: number, currency: string = 'BRL'): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
  }).format(value);
};

// Formatação de data
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('pt-BR');
};

// Status helpers
export const getStatusColor = (status: Budget['status']): string => {
  switch (status) {
    case 'approved': return 'bg-green-100 text-green-800 border-green-200';
    case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
    case 'expired': return 'bg-orange-100 text-orange-800 border-orange-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getStatusLabel = (status: Budget['status']): string => {
  switch (status) {
    case 'approved': return 'Aprovado';
    case 'sent': return 'Enviado';
    case 'draft': return 'Rascunho';
    case 'rejected': return 'Rejeitado';
    case 'expired': return 'Expirado';
    default: return status;
  }
};

// Tipo helpers
export const getTypeColor = (type: Budget['type']): string => {
  switch (type) {
    case 'hotel': return 'bg-blue-100 text-blue-800';
    case 'parque': return 'bg-purple-100 text-purple-800';
    case 'atracao': return 'bg-green-100 text-green-800';
    case 'passeio': return 'bg-orange-100 text-orange-800';
    case 'personalizado': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getTypeLabel = (type: Budget['type']): string => {
  switch (type) {
    case 'hotel': return 'Hotel';
    case 'parque': return 'Parque';
    case 'atracao': return 'Atração';
    case 'passeio': return 'Passeio';
    case 'personalizado': return 'Personalizado';
    default: return type;
  }
};

export const getTypeIcon = (type: Budget['type']): string => {
  switch (type) {
    case 'hotel': return '🏨';
    case 'parque': return '🎢';
    case 'atracao': return '🎡';
    case 'passeio': return '🚌';
    case 'personalizado': return '📋';
    default: return '📄';
  }
};

// Cálculos
export const calculateItemTotal = (item: BudgetItem): number => {
  return item.quantity * item.unitPrice;
};

export const calculateBudgetSubtotal = (items: BudgetItem[]): number => {
  return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
};

export const calculateBudgetTotal = (subtotal: number, discount: number, taxes: number): number => {
  return subtotal - discount + taxes;
};

export const calculateDiscountPercentage = (subtotal: number, discount: number): number => {
  if (subtotal === 0) return 0;
  return (discount / subtotal) * 100;
};

// Validações
export const validateBudget = (budget: Partial<Budget>): string[] => {
  const errors: string[] = [];
  
  if (!budget.title?.trim()) {
    errors.push('Título é obrigatório');
  }
  
  if (!budget.clientName?.trim()) {
    errors.push('Nome do cliente é obrigatório');
  }
  
  if (!budget.clientEmail?.trim()) {
    errors.push('Email do cliente é obrigatório');
  } else if (!isValidEmail(budget.clientEmail)) {
    errors.push('Email do cliente é inválido');
  }
  
  if (!budget.type) {
    errors.push('Tipo da cotação é obrigatório');
  }
  
  if (!budget.items || budget.items.length === 0) {
    errors.push('Pelo menos um item é obrigatório');
  }
  
  return errors;
};

export const validateBudgetItem = (item: Partial<BudgetItem>): string[] => {
  const errors: string[] = [];
  
  if (!item.name?.trim()) {
    errors.push('Nome do item é obrigatório');
  }
  
  if (!item.category?.trim()) {
    errors.push('Categoria do item é obrigatória');
  }
  
  if (!item.quantity || item.quantity <= 0) {
    errors.push('Quantidade deve ser maior que zero');
  }
  
  if (!item.unitPrice || item.unitPrice <= 0) {
    errors.push('Preço unitário deve ser maior que zero');
  }
  
  return errors;
};

// Utilitários de email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Utilitários de data
export const isExpired = (budget: Budget): boolean => {
  if (!budget.expiresAt) return false;
  return new Date(budget.expiresAt) < new Date();
};

export const getDaysUntilExpiration = (budget: Budget): number | null => {
  if (!budget.expiresAt) return null;
  
  const now = new Date();
  const expiration = new Date(budget.expiresAt);
  const diffTime = expiration.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Geração de números de cotação
export const generateBudgetNumber = (prefix: string = 'COT', date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-4);
  
  return `${prefix}-${year}${month}${day}-${timestamp}`;
};

// Filtros e ordenação
export const sortBudgets = (budgets: Budget[], sortBy: 'date' | 'value' | 'client' | 'status', order: 'asc' | 'desc' = 'desc'): Budget[] => {
  return [...budgets].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'value':
        comparison = a.total - b.total;
        break;
      case 'client':
        comparison = a.clientName.localeCompare(b.clientName);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
    }
    
    return order === 'asc' ? comparison : -comparison;
  });
};

// Exportação de dados
export const exportToCsv = (budgets: Budget[]): string => {
  const headers = [
    'ID',
    'Título',
    'Cliente',
    'Email',
    'Tipo',
    'Status',
    'Valor Total',
    'Data Criação',
    'Data Atualização'
  ];
  
  const rows = budgets.map(budget => [
    budget.id,
    budget.title,
    budget.clientName,
    budget.clientEmail,
    getTypeLabel(budget.type),
    getStatusLabel(budget.status),
    budget.total.toString(),
    formatDate(budget.createdAt),
    formatDate(budget.updatedAt)
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');
  
  return csvContent;
};

// Download de arquivo
export const downloadFile = (content: string, filename: string, contentType: string = 'text/plain'): void => {
  const blob = new Blob([content], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Cópia para clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Erro ao copiar para clipboard:', error);
    return false;
  }
};

// Geração de ID único
export const generateId = (): string => {
  // Fallback para ambientes que não suportam crypto.randomUUID()
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Geração manual de UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Debounce para busca
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
