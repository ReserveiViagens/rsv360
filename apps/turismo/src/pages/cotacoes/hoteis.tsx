import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  ArrowLeft, 
  Hotel, 
  Calendar, 
  Users, 
  MapPin, 
  Plus,
  Save,
  Trash2,
  Upload,
  Eye,
  Edit,
  Copy
} from 'lucide-react';
import { HotelSelector } from '@/components/HotelSelector';
import { Budget, BudgetItem, Photo, Highlight, Benefit, AccommodationDetail, ImportantNote } from '@/lib/types/budget';
import { budgetStorage } from '@/lib/budget-storage';
import { generateId } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function HoteisPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [budget, setBudget] = useState<Partial<Budget>>({
    id: generateId(),
    type: 'hotel',
    title: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    description: '',
    currency: 'BRL',
    subtotal: 0,
    discount: 0,
    discountType: 'percentage',
    taxes: 0,
    taxType: 'percentage',
    total: 0,
    status: 'draft',
    items: [],
    photos: [],
    highlights: [],
    benefits: [],
    accommodationDetails: [],
    importantNotes: [],
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [hotelSelection, setHotelSelection] = useState<{
    state?: string;
    city?: string;
    hotelId?: string;
    hotelName?: string;
  }>({});

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSaveBudget = () => {
    if (!budget.title || !budget.clientName || !budget.clientEmail) {
      alert('Por favor, preencha os campos obrigatórios: Título, Nome do Cliente e Email.');
      return;
    }

    const budgetToSave: Budget = {
      ...budget,
      hotelState: hotelSelection.state,
      hotelCity: hotelSelection.city,
      hotelId: hotelSelection.hotelId,
      hotelName: hotelSelection.hotelName,
      updatedAt: new Date().toISOString(),
    } as Budget;

    budgetStorage.save(budgetToSave);
    alert('Cotação de hotel salva com sucesso!');
    router.push('/cotacoes');
  };

  const addItem = () => {
    const newItem: BudgetItem = {
      id: generateId(),
      name: '',
      description: '',
      category: 'hospedagem',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      details: {
        checkIn: '',
        checkOut: '',
        roomType: '',
        guests: 1,
        accommodationType: ''
      }
    };

    setBudget(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setBudget(prev => {
      const newItems = [...(prev.items || [])];
      if (field.startsWith('details.')) {
        const detailField = field.replace('details.', '');
        newItems[index] = {
          ...newItems[index],
          details: {
            ...newItems[index].details,
            [detailField]: value
          }
        };
      } else {
        newItems[index] = {
          ...newItems[index],
          [field]: value
        };
      }

      // Recalculate total price for the item
      if (field === 'quantity' || field === 'unitPrice') {
        newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice;
      }

      return {
        ...prev,
        items: newItems
      };
    });
  };

  const removeItem = (index: number) => {
    setBudget(prev => ({
      ...prev,
      items: (prev.items || []).filter((_, i) => i !== index)
    }));
  };

  const addHighlight = () => {
    const newHighlight: Highlight = {
      id: generateId(),
      title: '',
      description: '',
      checked: true
    };

    setBudget(prev => ({
      ...prev,
      highlights: [...(prev.highlights || []), newHighlight]
    }));
  };

  const updateHighlight = (index: number, field: string, value: any) => {
    setBudget(prev => {
      const newHighlights = [...(prev.highlights || [])];
      newHighlights[index] = {
        ...newHighlights[index],
        [field]: value
      };
      return {
        ...prev,
        highlights: newHighlights
      };
    });
  };

  const removeHighlight = (index: number) => {
    setBudget(prev => ({
      ...prev,
      highlights: (prev.highlights || []).filter((_, i) => i !== index)
    }));
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/cotacoes">
            <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para Cotações</span>
            </button>
          </Link>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleSaveBudget}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Cotação</span>
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Hotel className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏨 Nova Cotação de Hotel</h1>
          <p className="text-gray-600">
            Crie cotações detalhadas para hospedagem em hotéis, resorts e pousadas
          </p>
        </div>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
            <TabsTrigger value="hotel">Seleção do Hotel</TabsTrigger>
            <TabsTrigger value="items">Itens & Valores</TabsTrigger>
            <TabsTrigger value="details">Detalhes & Destaques</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Informações da Cotação</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título da Cotação *
                  </label>
                  <input
                    type="text"
                    value={budget.title || ''}
                    onChange={(e) => setBudget(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Hospedagem Caldas Novas - Família Silva"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <input
                    type="text"
                    value={budget.description || ''}
                    onChange={(e) => setBudget(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descrição breve da cotação"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Dados do Cliente</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={budget.clientName || ''}
                    onChange={(e) => setBudget(prev => ({ ...prev, clientName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome do cliente"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={budget.clientEmail || ''}
                    onChange={(e) => setBudget(prev => ({ ...prev, clientEmail: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={budget.clientPhone || ''}
                    onChange={(e) => setBudget(prev => ({ ...prev, clientPhone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="hotel" className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Seleção do Hotel</h3>
              <HotelSelector
                value={hotelSelection}
                onChange={setHotelSelection}
                label="Escolha o Hotel"
                required
              />
            </div>
          </TabsContent>

          <TabsContent value="items" className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Itens da Cotação</h3>
                <button
                  onClick={addItem}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Item</span>
                </button>
              </div>

              <div className="space-y-4">
                {budget.items?.map((item, index) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid md:grid-cols-4 gap-4 mb-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome do Item
                        </label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItem(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: Diária Quarto Standard"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantidade
                        </label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="1"
                          title="Quantidade de itens"
                          placeholder="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Valor Unitário
                        </label>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          step="0.01"
                          title="Valor unitário do item"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Check-in
                        </label>
                        <input
                          type="date"
                          value={item.details?.checkIn || ''}
                          onChange={(e) => updateItem(index, 'details.checkIn', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          title="Data de check-in"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Check-out
                        </label>
                        <input
                          type="date"
                          value={item.details?.checkOut || ''}
                          onChange={(e) => updateItem(index, 'details.checkOut', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          title="Data de check-out"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo de Quarto
                        </label>
                        <input
                          type="text"
                          value={item.details?.roomType || ''}
                          onChange={(e) => updateItem(index, 'details.roomType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: Standard, Luxo, Suíte"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hóspedes
                        </label>
                        <input
                          type="number"
                          value={item.details?.guests || 1}
                          onChange={(e) => updateItem(index, 'details.guests', parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="1"
                          title="Número de hóspedes"
                          placeholder="1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold">
                        Total: R$ {item.totalPrice.toFixed(2)}
                      </div>
                      <button
                        onClick={() => removeItem(index)}
                        className="flex items-center space-x-2 px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Remover</span>
                      </button>
                    </div>
                  </div>
                ))}

                {budget.items?.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum item adicionado. Clique em "Adicionar Item" para começar.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Destaques do Hotel</h3>
                <button
                  onClick={addHighlight}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Destaque</span>
                </button>
              </div>

              <div className="space-y-4">
                {budget.highlights?.map((highlight, index) => (
                  <div key={highlight.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Título
                        </label>
                        <input
                          type="text"
                          value={highlight.title}
                          onChange={(e) => updateHighlight(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: Piscina Aquecida"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descrição
                        </label>
                        <input
                          type="text"
                          value={highlight.description}
                          onChange={(e) => updateHighlight(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Descrição do destaque"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={highlight.checked}
                          onChange={(e) => updateHighlight(index, 'checked', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Incluir na cotação</span>
                      </label>
                      <button
                        onClick={() => removeHighlight(index)}
                        className="flex items-center space-x-2 px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Remover</span>
                      </button>
                    </div>
                  </div>
                ))}

                {budget.highlights?.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum destaque adicionado. Clique em "Adicionar Destaque" para começar.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}