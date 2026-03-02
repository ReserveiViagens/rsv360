/**
 * Gerenciamento de histórico de endereços do usuário
 * Armazena no localStorage para persistência entre sessões
 */

import { Address } from '@/components/address-form';

const ADDRESS_HISTORY_KEY = 'rsv360_address_history';
const MAX_HISTORY_ITEMS = 5;

export interface AddressHistoryItem extends Address {
  id: string;
  createdAt: string;
  lastUsed: string;
  useCount: number;
}

/**
 * Salvar endereço no histórico
 */
export function saveAddressToHistory(address: Address): void {
  try {
    if (!address.street || !address.city) {
      return; // Não salvar endereços incompletos
    }

    const history = getAddressHistory();
    const existingIndex = history.findIndex(
      item => 
        item.street === address.street &&
        item.number === address.number &&
        item.zipCode === address.zipCode
    );

    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      // Atualizar endereço existente
      history[existingIndex] = {
        ...history[existingIndex],
        ...address,
        lastUsed: now,
        useCount: history[existingIndex].useCount + 1,
      };
    } else {
      // Adicionar novo endereço
      const newItem: AddressHistoryItem = {
        ...address,
        id: `addr-${Date.now()}-${Math.random()}`,
        createdAt: now,
        lastUsed: now,
        useCount: 1,
      };
      history.unshift(newItem);
    }

    // Manter apenas os últimos N endereços
    const sortedHistory = history
      .sort((a, b) => {
        // Ordenar por uso mais recente e frequência
        const dateDiff = new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
        if (dateDiff !== 0) return dateDiff;
        return b.useCount - a.useCount;
      })
      .slice(0, MAX_HISTORY_ITEMS);

    localStorage.setItem(ADDRESS_HISTORY_KEY, JSON.stringify(sortedHistory));
  } catch (error) {
    console.error('Erro ao salvar endereço no histórico:', error);
  }
}

/**
 * Obter histórico de endereços
 */
export function getAddressHistory(): AddressHistoryItem[] {
  try {
    const stored = localStorage.getItem(ADDRESS_HISTORY_KEY);
    if (!stored) return [];

    const history = JSON.parse(stored) as AddressHistoryItem[];
    return history.sort((a, b) => {
      const dateDiff = new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
      if (dateDiff !== 0) return dateDiff;
      return b.useCount - a.useCount;
    });
  } catch (error) {
    console.error('Erro ao obter histórico de endereços:', error);
    return [];
  }
}

/**
 * Remover endereço do histórico
 */
export function removeAddressFromHistory(id: string): void {
  try {
    const history = getAddressHistory();
    const filtered = history.filter(item => item.id !== id);
    localStorage.setItem(ADDRESS_HISTORY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Erro ao remover endereço do histórico:', error);
  }
}

/**
 * Limpar todo o histórico
 */
export function clearAddressHistory(): void {
  try {
    localStorage.removeItem(ADDRESS_HISTORY_KEY);
  } catch (error) {
    console.error('Erro ao limpar histórico de endereços:', error);
  }
}

