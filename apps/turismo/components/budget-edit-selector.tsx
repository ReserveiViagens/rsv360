/**
 * Componente de seleção de orçamento para editar
 * 
 * Modal que exibe lista de orçamentos existentes com funcionalidades de:
 * - Busca por nome do cliente, título ou email
 * - Filtro por status (draft, sent, approved, rejected)
 * - Filtro por tipo (hotel, parque, atracao, passeio)
 * - Ordenação por data de atualização (mais recentes primeiro)
 * - Navegação direta para edição
 * 
 * @component
 * @example
 * ```tsx
 * <BudgetEditSelector
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 * />
 * ```
 * 
 * @param {boolean} open - Controla se o modal está aberto
 * @param {(open: boolean) => void} onOpenChange - Callback quando o estado do modal muda
 * 
 * Conforme documentação (linha 620-627)
 */
'use client';

import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Budget } from '@/lib/types/budget';
import { budgetStorage } from '@/lib/budget-storage';
import { formatCurrency } from '@/lib/utils';
import { Search, Edit, Calendar } from 'lucide-react';
import { useRouter } from 'next/router';

interface BudgetEditSelectorProps {
  /** Controla se o modal está aberto */
  open: boolean;
  /** Callback quando o estado do modal muda */
  onOpenChange: (open: boolean) => void;
}

export function BudgetEditSelector({ open, onOpenChange }: BudgetEditSelectorProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const budgets = useMemo(() => {
    let filtered = budgetStorage.getAll();

    // Filtro de busca
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (budget) =>
          budget.title?.toLowerCase().includes(query) ||
          budget.clientName?.toLowerCase().includes(query) ||
          budget.clientEmail?.toLowerCase().includes(query)
      );
    }

    // Filtro de status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((budget) => budget.status === statusFilter);
    }

    // Filtro de tipo
    if (typeFilter !== 'all') {
      filtered = filtered.filter((budget) => budget.type === typeFilter);
    }

    // Ordenar por data de atualização (mais recentes primeiro)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [searchQuery, statusFilter, typeFilter]);

  const handleEdit = (budget: Budget) => {
    // Navegar para página de edição baseada no tipo
    const route = `/cotacoes/${budget.type}?edit=${budget.id}`;
    router.push(route);
    onOpenChange(false);
  };

  const getStatusColor = (status: Budget['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'draft':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: Budget['type']) => {
    switch (type) {
      case 'hotel':
        return 'Hotel';
      case 'parque':
        return 'Parque';
      case 'atracao':
        return 'Atração';
      case 'passeio':
        return 'Passeio';
      case 'personalizado':
        return 'Personalizado';
      default:
        return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Selecione um Orçamento para Editar</DialogTitle>
          <DialogDescription>
            Busque e filtre orçamentos existentes para editar
          </DialogDescription>
        </DialogHeader>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por título, cliente ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="sent">Enviado</SelectItem>
              <SelectItem value="approved">Aprovado</SelectItem>
              <SelectItem value="rejected">Rejeitado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="hotel">Hotel</SelectItem>
              <SelectItem value="parque">Parque</SelectItem>
              <SelectItem value="atracao">Atração</SelectItem>
              <SelectItem value="passeio">Passeio</SelectItem>
              <SelectItem value="personalizado">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista de Orçamentos */}
        <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto">
          {budgets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum orçamento encontrado
            </div>
          ) : (
            budgets.map((budget) => (
              <div
                key={budget.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{budget.title}</h3>
                    <Badge className={getStatusColor(budget.status)}>{budget.status}</Badge>
                    <Badge variant="outline">{getTypeLabel(budget.type)}</Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Cliente: {budget.clientName}</div>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(budget.updatedAt || budget.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(budget.total)}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(budget)}
                  className="ml-4"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

