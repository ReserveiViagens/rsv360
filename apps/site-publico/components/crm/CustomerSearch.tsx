'use client';

/**
 * Componente: Busca de Clientes (CRM)
 * Busca avançada com autocomplete por nome, email, telefone, etc.
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, User, Mail, Phone, Building2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CustomerSearchResult {
  id: number;
  user_id?: number;
  customer_id?: number;
  name: string;
  email?: string;
  phone?: string;
  loyalty_tier: string;
  total_spent: number;
  total_bookings: number;
}

interface CustomerSearchProps {
  onSelect?: (customer: CustomerSearchResult) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
  showAdvanced?: boolean;
}

export function CustomerSearch({
  onSelect,
  onSearch,
  placeholder = 'Buscar por nome, email, telefone...',
  className,
  showAdvanced = false,
}: CustomerSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CustomerSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce da busca
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 300); // 300ms de debounce

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Fechar resultados ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setShowResults(true);

    try {
      // Buscar na API
      const params = new URLSearchParams();
      params.append('limit', '10');
      params.append('page', '1');

      // Se a busca parece ser um email, buscar por email
      if (searchQuery.includes('@')) {
        // Buscar por email específico (seria necessário endpoint de busca)
        // Por enquanto, usar busca geral
      }

      const response = await fetch(`/api/crm/customers?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar clientes');
      }

      const result = await response.json();
      const customers = result.data || [];

      // Filtrar localmente por nome, email, telefone
      const filtered = customers.filter((customer: any) => {
        const searchLower = searchQuery.toLowerCase();
        const name = (customer.user_name || customer.customer_name || '').toLowerCase();
        const email = (customer.user_email || customer.customer_email || '').toLowerCase();
        const phone = (customer.user_phone || '').toLowerCase();

        return (
          name.includes(searchLower) ||
          email.includes(searchLower) ||
          phone.includes(searchLower)
        );
      });

      setResults(filtered.slice(0, 10)); // Limitar a 10 resultados
      
      if (onSearch) {
        onSearch(searchQuery);
      }
    } catch (error: any) {
      console.error('Erro na busca:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (customer: CustomerSearchResult) => {
    setQuery(customer.name);
    setShowResults(false);
    if (onSelect) {
      onSelect(customer);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showResults || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        break;
    }
  };

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      bronze: 'bg-amber-100 text-amber-800',
      silver: 'bg-gray-100 text-gray-800',
      gold: 'bg-yellow-100 text-yellow-800',
      platinum: 'bg-blue-100 text-blue-800',
      diamond: 'bg-purple-100 text-purple-800',
    };
    return colors[tier] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div ref={searchRef} className={cn('relative w-full', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) {
              setShowResults(true);
            }
          }}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Resultados da Busca */}
      {showResults && (
        <Card className="absolute z-50 w-full mt-1 shadow-lg max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : results.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {query.trim() ? 'Nenhum cliente encontrado' : 'Digite para buscar'}
              </div>
            ) : (
              <div className="py-2">
                {results.map((customer, index) => (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => handleSelect(customer)}
                    className={cn(
                      'w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors',
                      'flex items-center gap-3',
                      index === selectedIndex && 'bg-gray-50'
                    )}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">
                          {customer.name}
                        </span>
                        <Badge className={cn('text-xs', getTierColor(customer.loyalty_tier))}>
                          {customer.loyalty_tier}
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-1 text-xs text-gray-500">
                        {customer.email && (
                          <div className="flex items-center gap-1 truncate">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{customer.email}</span>
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{customer.phone}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                        <span>{customer.total_bookings} reservas</span>
                        <span>•</span>
                        <span className="font-medium">
                          {formatCurrency(customer.total_spent)}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Busca Avançada (opcional) */}
      {showAdvanced && (
        <div className="mt-2 text-sm">
          <Button variant="link" size="sm" className="h-auto p-0">
            Busca avançada
          </Button>
        </div>
      )}
    </div>
  );
}

