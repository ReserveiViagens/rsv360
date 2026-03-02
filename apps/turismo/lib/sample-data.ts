// Dados de exemplo conforme documentação (linha 1127-1134)
// Função generateSampleBudgets() criando 3 orçamentos exemplo

import { Budget, BudgetItem } from './types/budget';
import { budgetStorage } from './budget-storage';
import { generateId } from './utils';

/**
 * Gera 3 orçamentos de exemplo conforme documento:
 * 1. Pacote Família Feliz
 * 2. Escapada Romântica
 * 3. Aventura Radical
 */
export function generateSampleBudgets(): Budget[] {
  const now = new Date();
  const thirtyDaysLater = new Date(now);
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

  // 1. Pacote Família Feliz
  const familyPackage: Budget = {
    id: generateId(),
    title: 'Pacote Família Feliz',
    clientName: 'João Silva',
    clientEmail: 'joao.silva@email.com',
    clientPhone: '(11) 99999-9999',
    type: 'hotel',
    mainCategory: 'Hotéis',
    category: 'Resort',
    description: 'Pacote completo para família de 4 pessoas com atividades inclusas',
    subtotal: 4200,
    discount: 200,
    discountType: 'fixed',
    taxes: 0,
    tax: 0,
    taxType: 'percentage',
    total: 4000,
    currency: 'BRL',
    status: 'approved',
    createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    validUntil: thirtyDaysLater.toISOString(),
    items: [
      {
        id: generateId(),
        name: 'Hospedagem Família',
        description: '5 diárias em suíte família com vista para o mar',
        category: 'Hospedagem',
        quantity: 5,
        unitPrice: 800,
        totalPrice: 4000,
        details: {
          checkIn: '2024-02-15',
          checkOut: '2024-02-20',
          roomType: 'Suíte Família',
          guests: 4,
          accommodationType: 'Resort',
        },
      },
    ],
    photos: [],
    highlights: [],
    benefits: [],
    accommodationDetails: [],
    importantNotes: [],
    detailedItinerary: [],
    version: 1,
  };

  // 2. Escapada Romântica
  const romanticEscape: Budget = {
    id: generateId(),
    title: 'Escapada Romântica',
    clientName: 'Maria Santos',
    clientEmail: 'maria.santos@email.com',
    clientPhone: '(11) 88888-8888',
    type: 'hotel',
    mainCategory: 'Hotéis',
    category: 'Romântico',
    description: 'Pacote especial para casais com jantar romântico incluso',
    subtotal: 2800,
    discount: 0,
    discountType: 'percentage',
    taxes: 0,
    tax: 0,
    taxType: 'percentage',
    total: 2800,
    currency: 'BRL',
    status: 'sent',
    createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    validUntil: thirtyDaysLater.toISOString(),
    items: [
      {
        id: generateId(),
        name: 'Suíte Romântica',
        description: '3 diárias em suíte com decoração especial',
        category: 'Hospedagem',
        quantity: 3,
        unitPrice: 600,
        totalPrice: 1800,
        details: {
          roomType: 'Suíte Romântica',
          guests: 2,
          accommodationType: 'Luxo',
        },
      },
      {
        id: generateId(),
        name: 'Jantar Romântico',
        description: 'Jantar à luz de velas com champanhe',
        category: 'Alimentação',
        quantity: 1,
        unitPrice: 250,
        totalPrice: 250,
      },
      {
        id: generateId(),
        name: 'Spa & Relaxamento',
        description: 'Massagem relaxante para casal',
        category: 'Serviços',
        quantity: 1,
        unitPrice: 750,
        totalPrice: 750,
      },
    ],
    photos: [],
    highlights: [],
    benefits: [],
    accommodationDetails: [],
    importantNotes: [],
    detailedItinerary: [],
    version: 1,
  };

  // 3. Aventura Radical
  const adventurePackage: Budget = {
    id: generateId(),
    title: 'Aventura Radical',
    clientName: 'Pedro Costa',
    clientEmail: 'pedro.costa@email.com',
    clientPhone: '(11) 77777-7777',
    type: 'passeio',
    mainCategory: 'Passeios',
    category: 'Aventura',
    description: 'Pacote de aventura com rapel, tirolesa e trilhas ecológicas',
    subtotal: 1500,
    discount: 150,
    discountType: 'fixed',
    taxes: 0,
    tax: 0,
    taxType: 'percentage',
    total: 1350,
    currency: 'BRL',
    status: 'draft',
    createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    validUntil: thirtyDaysLater.toISOString(),
    items: [
      {
        id: generateId(),
        name: 'Rapel e Tirolesa',
        description: 'Aventura radical com equipamentos de segurança',
        category: 'Atividades',
        quantity: 1,
        unitPrice: 450,
        totalPrice: 450,
        details: {
          duration: '4 horas',
          difficulty: 'moderado',
          includes: ['Equipamentos', 'Instrutor', 'Seguro'],
        },
      },
      {
        id: generateId(),
        name: 'Trilha Ecológica',
        description: 'Caminhada pela natureza com guia especializado',
        category: 'Atividades',
        quantity: 1,
        unitPrice: 350,
        totalPrice: 350,
        details: {
          duration: '3 horas',
          difficulty: 'facil',
          includes: ['Guia', 'Equipamentos', 'Água'],
        },
      },
      {
        id: generateId(),
        name: 'Almoço na Natureza',
        description: 'Almoço tipo buffet em área de descanso',
        category: 'Alimentação',
        quantity: 1,
        unitPrice: 400,
        totalPrice: 400,
      },
      {
        id: generateId(),
        name: 'Transfer',
        description: 'Transporte ida e volta do hotel',
        category: 'Transporte',
        quantity: 1,
        unitPrice: 300,
        totalPrice: 300,
        details: {
          transportIncluded: true,
        },
      },
    ],
    photos: [],
    highlights: [],
    benefits: [],
    accommodationDetails: [],
    importantNotes: [],
    detailedItinerary: [],
    version: 1,
  };

  return [familyPackage, romanticEscape, adventurePackage];
}

/**
 * Carrega os dados de exemplo no localStorage
 */
export function loadSampleData(): void {
  const sampleBudgets = generateSampleBudgets();
  sampleBudgets.forEach(budget => {
    budgetStorage.save(budget);
  });
  console.log(`✅ ${sampleBudgets.length} orçamentos de exemplo carregados`);
}

