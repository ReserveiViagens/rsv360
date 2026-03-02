/**
 * Componente de seleção de tipo de orçamento
 * 
 * Modal que exibe opções de tipos de orçamento (Hotéis, Parques, Atrações, Passeios, Personalizado)
 * para o usuário escolher antes de criar uma nova cotação.
 * 
 * @component
 * @example
 * ```tsx
 * <BudgetTypeSelector
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   onSelect={(type) => {
 *     router.push(`/cotacoes/${type}`);
 *   }}
 * />
 * ```
 * 
 * @param {boolean} open - Controla se o modal está aberto
 * @param {(open: boolean) => void} onOpenChange - Callback quando o estado do modal muda
 * @param {(type: BudgetType) => void} onSelect - Callback quando um tipo é selecionado
 * 
 * Conforme documentação (linha 612-619)
 */
'use client';

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BudgetType } from '@/lib/types/budget';
import { Hotel, TreePine, MapPin, Route, Settings } from 'lucide-react';

interface BudgetTypeSelectorProps {
  /** Controla se o modal está aberto */
  open: boolean;
  /** Callback quando o estado do modal muda */
  onOpenChange: (open: boolean) => void;
  /** Callback quando um tipo é selecionado */
  onSelect: (type: BudgetType) => void;
}

interface BudgetTypeOption {
  type: BudgetType;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const budgetTypeOptions: BudgetTypeOption[] = [
  {
    type: 'hotel',
    icon: <Hotel className="w-8 h-8" />,
    title: 'Hotéis',
    description: 'Cotações para hospedagem em hotéis, resorts e pousadas',
    color: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
  },
  {
    type: 'parque',
    icon: <TreePine className="w-8 h-8" />,
    title: 'Parques',
    description: 'Cotações para parques aquáticos, temáticos e de diversões',
    color: 'bg-green-100 text-green-600 hover:bg-green-200',
  },
  {
    type: 'atracao',
    icon: <MapPin className="w-8 h-8" />,
    title: 'Atrações',
    description: 'Cotações para atrações turísticas, monumentos e pontos de interesse',
    color: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
  },
  {
    type: 'passeio',
    icon: <Route className="w-8 h-8" />,
    title: 'Passeios',
    description: 'Cotações para passeios turísticos, tours e experiências',
    color: 'bg-orange-100 text-orange-600 hover:bg-orange-200',
  },
  {
    type: 'personalizado',
    icon: <Settings className="w-8 h-8" />,
    title: 'Personalizado',
    description: 'Crie uma cotação personalizada do zero',
    color: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
  },
];

export function BudgetTypeSelector({ open, onOpenChange, onSelect }: BudgetTypeSelectorProps) {
  const handleSelect = (type: BudgetType) => {
    onSelect(type);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Selecione o Tipo de Orçamento</DialogTitle>
          <DialogDescription>
            Escolha o tipo de cotação que deseja criar ou selecione um template
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {budgetTypeOptions.map((option) => (
            <Button
              key={option.type}
              variant="outline"
              className={`h-auto min-h-[140px] p-6 flex flex-col items-center justify-center gap-3 ${option.color} border-2 overflow-hidden w-full`}
              onClick={() => handleSelect(option.type)}
            >
              <div className="flex items-center justify-center flex-shrink-0">{option.icon}</div>
              <div className="text-center w-full px-2">
                <div className="font-semibold text-lg mb-1 break-words">{option.title}</div>
                <div className="text-sm opacity-80 mt-1 break-words text-wrap leading-tight">{option.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

