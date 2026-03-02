import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  ArrowLeft,
  FerrisWheel,
  Plus,
  Trash2,
  Save,
  Image,
  Lightbulb,
  CheckSquare,
  Ticket,
  BookOpen,
  Upload,
  Eye,
  Edit,
  Copy,
  Clock,
  Users,
  Calendar,
  Zap
} from 'lucide-react';
import { ParkSelector } from '@/components/ParkSelector';
import { Budget, BudgetItem, Photo, Highlight, Benefit, AccommodationDetail, ImportantNote } from '@/lib/types/budget';
import { budgetStorage } from '@/lib/budget-storage';
import { generateId } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAllParks, getParkById, parkTypes } from '@/lib/parks-data';
import { QuotePreview } from '@/components/QuotePreview';
import { exportToPDF, exportToDOCX, generateQuoteHTML } from '@/lib/export-utils';

export default function CotacoesParquesPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [budget, setBudget] = useState<Partial<Budget>>({
    id: generateId(),
    type: 'parque',
    title: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    items: [],
    photos: [],
    highlights: [],
    benefits: [],
    accommodationDetails: [],
    importantNotes: [],
    subtotal: 0,
    discount: 0,
    taxes: 0,
    total: 0,
    currency: 'BRL',
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
    visitDate: '',
    groupSize: 1,
    hasGroupDiscount: false,
    fastPassIncluded: false,
  });
  const [activeTab, setActiveTab] = useState('basic-info');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    calculateTotals();
    
    // Carregar orçamento existente se estiver em modo view/edit
    const { view, edit } = router.query;
    const budgetId = view || edit;
    if (budgetId && typeof budgetId === 'string') {
      const existing = budgetStorage.getById(budgetId);
      if (existing) {
        setBudget(existing);
      }
    }
  }, [router.query, budget.items, budget.discount, budget.taxes, budget.discountType, budget.taxType]);
  
  // Calcular data padrão de validade (30 dias após criação)
  const getDefaultValidityDate = (): string => {
    if (budget.validUntil) {
      return budget.validUntil.slice(0, 16); // Formato datetime-local (YYYY-MM-DDTHH:MM)
    }
    const createdAt = budget.createdAt ? new Date(budget.createdAt) : new Date();
    const validUntil = new Date(createdAt);
    validUntil.setDate(validUntil.getDate() + 30);
    return validUntil.toISOString().slice(0, 16);
  };

  const updateBudget = (field: string, value: any) => {
    setBudget((prev) => ({ ...prev, [field]: value }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...budget.items!];
    if (field.includes('.')) {
      const [parentField, childField] = field.split('.');
      newItems[index] = {
        ...newItems[index],
        [parentField]: {
          ...(newItems[index][parentField] || {}),
          [childField]: value,
        },
      };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setBudget((prev) => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    const selectedPark = budget.parkId ? getParkById(budget.parkId) : null;
    const defaultTicket = selectedPark?.ticketTypes[0];
    
    setBudget((prev) => ({
      ...prev,
      items: [
        ...(prev.items || []),
        {
          id: generateId(),
          name: defaultTicket?.name || 'Ingresso',
          description: defaultTicket?.description || '',
          category: 'Ingresso',
          quantity: 1,
          unitPrice: defaultTicket?.basePrice || 0,
          totalPrice: defaultTicket?.basePrice || 0,
          details: {
            date: prev.visitDate || '',
            ageGroup: defaultTicket?.ageGroup || 'adulto',
            ticketType: defaultTicket?.name || '',
            validityDays: defaultTicket?.validityDays || 1,
            fastPass: false,
            groupDiscount: 0,
          },
        },
      ],
    }));
  };

  const removeItem = (id: string) => {
    setBudget((prev) => ({
      ...prev,
      items: prev.items?.filter((item) => item.id !== id) || [],
    }));
  };

  const calculateTotals = () => {
    const newSubtotal = budget.items?.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) || 0;
    let newDiscount = 0;
    if (budget.discountType === 'percentage') {
      newDiscount = newSubtotal * (budget.discount! / 100);
    } else {
      newDiscount = budget.discount || 0;
    }

    let newTaxes = 0;
    if (budget.taxType === 'percentage') {
      newTaxes = (newSubtotal - newDiscount) * (budget.taxes! / 100);
    } else {
      newTaxes = budget.taxes || 0;
    }

    const newTotal = newSubtotal - newDiscount + newTaxes;
    setBudget((prev) => ({
      ...prev,
      subtotal: newSubtotal,
      total: newTotal,
    }));
  };

  const handleSave = () => {
    if (!budget.title || !budget.clientName || !budget.clientEmail || !budget.parkName) {
      alert('Por favor, preencha todos os campos obrigatórios (Título, Cliente, Email, Parque).');
      return;
    }
    budgetStorage.save(budget as Budget);
    router.push('/cotacoes');
  };

  const openPreview = () => setIsPreviewOpen(true);
  const openPrePrint = () => {
    const html = generateQuoteHTML({
      ...(budget as Budget),
      id: budget.id || generateId(),
      createdAt: budget.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: (budget.status as any) || 'draft',
      subtotal: budget.subtotal || 0,
      discount: budget.discount || 0,
      taxes: budget.taxes || 0,
      total: budget.total || 0,
      items: (budget.items as any) || [],
    } as Budget);
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); }
  };
  const exportPdf = () => exportToPDF((budget as Budget));
  const exportDocx = () => exportToDOCX((budget as Budget));

  const addFastPassToItem = (index: number) => {
    const newItems = [...budget.items!];
    const item = newItems[index];
    const fastPassPrice = item.unitPrice * 0.3; // 30% do valor do ingresso
    
    newItems[index] = {
      ...item,
      name: item.name + ' + Fast Pass',
      unitPrice: item.unitPrice + fastPassPrice,
      totalPrice: (item.unitPrice + fastPassPrice) * item.quantity,
      details: {
        ...item.details,
        fastPass: true,
      },
    };
    
    setBudget((prev) => ({ ...prev, items: newItems }));
  };

  const applyGroupDiscount = (index: number, discountPercent: number) => {
    const newItems = [...budget.items!];
    const item = newItems[index];
    const discountAmount = item.unitPrice * (discountPercent / 100);
    
    newItems[index] = {
      ...item,
      unitPrice: item.unitPrice - discountAmount,
      totalPrice: (item.unitPrice - discountAmount) * item.quantity,
      details: {
        ...item.details,
        groupDiscount: discountPercent,
      },
    };
    
    setBudget((prev) => ({ ...prev, items: newItems }));
  };

  if (!isClient) {
    return null;
  }

  const selectedPark = budget.parkId ? getParkById(budget.parkId) : null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/cotacoes" className="flex items-center space-x-2 text-teal-600 hover:text-teal-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Cotações</span>
          </Link>
          <div className="flex items-center space-x-3 justify-between">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <FerrisWheel className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🎢 Nova Cotação de Parques</h1>
              <p className="text-gray-600">Crie e gerencie propostas para parques temáticos</p>
            </div>
            <div className="flex space-x-3">
              <button onClick={openPreview} className="px-4 py-2 border border-purple-600 text-purple-700 rounded-lg hover:bg-purple-50" title="Preview">Preview</button>
              <button onClick={openPrePrint} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50" title="Pré-impressão">Pré-impressão</button>
              <button onClick={exportPdf} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50" title="PDF/Imprimir">PDF/Imprimir</button>
              <button onClick={exportDocx} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50" title="DOCX">DOCX</button>
              <button onClick={handleSave} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700" title="Salvar">Salvar</button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic-info">Informações Básicas</TabsTrigger>
            <TabsTrigger value="park-selection">Seleção do Parque</TabsTrigger>
            <TabsTrigger value="tickets-values">Ingressos & Valores</TabsTrigger>
            <TabsTrigger value="details-highlights">Detalhes & Destaques</TabsTrigger>
          </TabsList>

          <TabsContent value="basic-info">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Dados da Cotação e Cliente</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título da Cotação</label>
                  <input
                    type="text"
                    value={budget.title || ''}
                    onChange={(e) => updateBudget('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Cotação para Beto Carrero World"
                    title="Título da Cotação"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cliente</label>
                  <input
                    type="text"
                    value={budget.clientName || ''}
                    onChange={(e) => updateBudget('clientName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="João da Silva"
                    title="Nome do Cliente"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email do Cliente</label>
                  <input
                    type="email"
                    value={budget.clientEmail || ''}
                    onChange={(e) => updateBudget('clientEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="joao.silva@example.com"
                    title="Email do Cliente"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone do Cliente</label>
                  <input
                    type="text"
                    value={budget.clientPhone || ''}
                    onChange={(e) => updateBudget('clientPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="(XX) XXXXX-XXXX"
                    title="Telefone do Cliente"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data da Visita</label>
                  <input
                    type="date"
                    value={budget.visitDate || ''}
                    onChange={(e) => updateBudget('visitDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    title="Data da Visita"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tamanho do Grupo</label>
                  <input
                    type="number"
                    value={budget.groupSize || 1}
                    onChange={(e) => updateBudget('groupSize', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="1"
                    title="Tamanho do Grupo"
                    placeholder="1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição da Cotação</label>
                <textarea
                  value={budget.description || ''}
                  onChange={(e) => updateBudget('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Detalhes adicionais sobre a cotação..."
                  title="Descrição da Cotação"
                ></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data e Hora de Validade *
                  </label>
                  <input
                    type="datetime-local"
                    value={getDefaultValidityDate()}
                    onChange={(e) => {
                      const dateValue = e.target.value;
                      if (dateValue) {
                        const validUntil = new Date(dateValue).toISOString();
                        updateBudget('validUntil', validUntil);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    title="Data e hora de validade do orçamento"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    O orçamento será válido até esta data e hora. Padrão: 30 dias após a criação.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Mensagem de Urgência</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="showUrgencyMessage"
                    checked={budget.showUrgencyMessage || false}
                    onChange={(e) => updateBudget('showUrgencyMessage', e.target.checked)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="showUrgencyMessage" className="text-sm font-medium text-gray-700">
                    Exibir mensagem de urgência no documento
                  </label>
                </div>
                {budget.showUrgencyMessage && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mensagem de Urgência *
                    </label>
                    <textarea
                      value={budget.urgencyMessage || 'Este orçamento será válido apenas para reservas feitas no mesmo ato, pois não garantimos a disponibilidade de valores e trabalhamos com valores abaixo da tabela da concorrência.'}
                      onChange={(e) => updateBudget('urgencyMessage', e.target.value)}
                      className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-red-50"
                      rows={3}
                      placeholder="Digite a mensagem de urgência..."
                      title="Mensagem de urgência para o orçamento"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Esta mensagem será exibida em destaque no documento para alertar sobre a validade e condições do orçamento.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="park-selection">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Escolha o Parque</h2>
              <ParkSelector
                value={{
                  state: budget.parkState,
                  city: budget.parkCity,
                  parkId: budget.parkId,
                  parkName: budget.parkName,
                }}
                onChange={(selected) => {
                  updateBudget('parkState', selected.state);
                  updateBudget('parkCity', selected.city);
                  updateBudget('parkId', selected.parkId);
                  updateBudget('parkName', selected.parkName);
                  if (selected.parkId) {
                    const park = getParkById(selected.parkId);
                    if (park) {
                      updateBudget('parkType', park.type);
                    }
                  }
                }}
                required
              />
              {budget.parkName && selectedPark && (
                <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Informações do Parque</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Tipo:</span> {parkTypes.find(t => t.value === selectedPark.type)?.label}
                    </div>
                    <div>
                      <span className="font-medium">Fast Pass:</span> {selectedPark.fastPassAvailable ? '✅ Disponível' : '❌ Não disponível'}
                    </div>
                    <div>
                      <span className="font-medium">Desconto Grupo:</span> {selectedPark.groupDiscounts ? '✅ Disponível' : '❌ Não disponível'}
                    </div>
                    <div>
                      <span className="font-medium">Tipos de Ingresso:</span> {selectedPark.ticketTypes.length} opções
                    </div>
                  </div>
                  {selectedPark.website && (
                    <div className="mt-2">
                      <a href={selectedPark.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 text-sm">
                        🌐 Site oficial do parque
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tickets-values">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Ingressos da Cotação</h2>
              
              {selectedPark && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Ingressos Disponíveis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedPark.ticketTypes.map((ticket) => (
                      <div key={ticket.id} className="p-3 bg-white border rounded-lg">
                        <div className="font-medium text-gray-900">{ticket.name}</div>
                        <div className="text-sm text-gray-600">{ticket.description}</div>
                        <div className="text-lg font-bold text-purple-600">R$ {ticket.basePrice.toFixed(2)}</div>
                        {ticket.validityDays && ticket.validityDays > 1 && (
                          <div className="text-xs text-gray-500">Válido por {ticket.validityDays} dias</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {budget.items?.map((item, index) => (
                <div key={item.id} className="border p-4 rounded-lg mb-4 bg-gray-50">
                  <div className="flex justify-end mb-2">
                    <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700" title="Remover item">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Ingresso</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Ingresso Adulto"
                        title="Nome do ingresso"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <input
                        type="text"
                        value={item.description || ''}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Acima de 12 anos"
                        title="Descrição do ingresso"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        min="1"
                        title="Quantidade de ingressos"
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Valor Unitário</label>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        step="0.01"
                        title="Valor unitário do ingresso"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Faixa Etária</label>
                      <select
                        value={item.details?.ageGroup || 'adulto'}
                        onChange={(e) => updateItem(index, 'details.ageGroup', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        title="Faixa etária"
                      >
                        <option value="adulto">Adulto</option>
                        <option value="crianca">Criança</option>
                        <option value="idoso">Idoso</option>
                        <option value="estudante">Estudante</option>
                        <option value="familia">Família</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data da Visita</label>
                      <input
                        type="date"
                        value={item.details?.date || budget.visitDate || ''}
                        onChange={(e) => updateItem(index, 'details.date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        title="Data da visita"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Validade (dias)</label>
                      <input
                        type="number"
                        value={item.details?.validityDays || 1}
                        onChange={(e) => updateItem(index, 'details.validityDays', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        min="1"
                        title="Validade em dias"
                        placeholder="1"
                      />
                    </div>
                  </div>

                  {/* Opções Especiais */}
                  <div className="flex flex-wrap gap-4 mb-4">
                    {selectedPark?.fastPassAvailable && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`fastpass-${index}`}
                          checked={item.details?.fastPass || false}
                          onChange={(e) => {
                            if (e.target.checked) {
                              addFastPassToItem(index);
                            } else {
                              updateItem(index, 'details.fastPass', false);
                              // Remover Fast Pass do nome e preço
                              const newName = item.name.replace(' + Fast Pass', '');
                              const originalPrice = item.unitPrice / 1.3; // Remover 30%
                              updateItem(index, 'name', newName);
                              updateItem(index, 'unitPrice', originalPrice);
                            }
                          }}
                          className="form-checkbox text-purple-600"
                        />
                        <label htmlFor={`fastpass-${index}`} className="text-sm font-medium text-gray-700">
                          <Zap className="w-4 h-4 inline mr-1" />
                          Fast Pass (+30%)
                        </label>
                      </div>
                    )}

                    {selectedPark?.groupDiscounts && budget.groupSize && budget.groupSize >= 10 && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => applyGroupDiscount(index, 15)}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm hover:bg-green-200 transition-colors"
                          title="Aplicar desconto de grupo"
                        >
                          <Users className="w-4 h-4 inline mr-1" />
                          Desconto Grupo (15%)
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-sm text-gray-600">
                      {item.details?.fastPass && <span className="text-purple-600">⚡ Fast Pass incluído</span>}
                      {item.details?.groupDiscount && item.details.groupDiscount > 0 && (
                        <span className="text-green-600 ml-2">👥 Desconto grupo: {item.details.groupDiscount}%</span>
                      )}
                    </div>
                    <div className="text-lg font-semibold">
                      Total: R$ {(item.quantity * item.unitPrice).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}

              <button onClick={addItem} className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Plus className="w-4 h-4" />
                <span>Adicionar Ingresso</span>
              </button>

              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo dos Valores</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span>R$ {budget.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Desconto ({budget.discountType === 'percentage' ? `${budget.discount}%` : `R$ ${budget.discount?.toFixed(2)}`}):</span>
                    <span>- R$ {((budget.discountType === 'percentage' ? budget.subtotal! * (budget.discount! / 100) : budget.discount) || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Impostos ({budget.taxType === 'percentage' ? `${budget.taxes}%` : `R$ ${budget.taxes?.toFixed(2)}`}):</span>
                    <span>+ R$ {((budget.taxType === 'percentage' ? (budget.subtotal! - ((budget.discountType === 'percentage' ? budget.subtotal! * (budget.discount! / 100) : budget.discount) || 0)) * (budget.taxes! / 100) : budget.taxes) || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-2 mt-2">
                    <span>Total:</span>
                    <span>R$ {budget.total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details-highlights">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Detalhes e Destaques</h2>
              
              {/* Photos */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center space-x-2">
                  <Image className="w-5 h-5 text-purple-600" />
                  <span>Fotos do Parque</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                  {budget.photos?.map((photo) => (
                    <div key={photo.id} className="relative">
                      <img src={photo.url} alt={photo.caption} className="w-full h-32 object-cover rounded-lg" />
                      <button
                        onClick={() => updateBudget('photos', budget.photos?.filter(p => p.id !== photo.id))}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                        title="Remover foto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="URL da nova foto"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value) {
                      updateBudget('photos', [...(budget.photos || []), { id: generateId(), url: e.currentTarget.value, caption: '' }]);
                      e.currentTarget.value = '';
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  title="URL da nova foto"
                />
              </div>

              {/* Highlights */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  <span>Destaques do Parque</span>
                </h3>
                {budget.highlights?.map((highlight, index) => (
                  <div key={highlight.id} className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      checked={highlight.checked}
                      onChange={(e) => {
                        const newHighlights = [...(budget.highlights || [])];
                        newHighlights[index] = { ...highlight, checked: e.target.checked };
                        updateBudget('highlights', newHighlights);
                      }}
                      className="form-checkbox text-purple-600"
                      title="Marcar destaque"
                    />
                    <input
                      type="text"
                      value={highlight.title}
                      onChange={(e) => {
                        const newHighlights = [...(budget.highlights || [])];
                        newHighlights[index] = { ...highlight, title: e.target.value };
                        updateBudget('highlights', newHighlights);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Montanha-russa mais alta do Brasil"
                      title="Título do destaque"
                    />
                    <button
                      onClick={() => updateBudget('highlights', budget.highlights?.filter(h => h.id !== highlight.id))}
                      className="text-red-500 hover:text-red-700"
                      title="Remover destaque"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => updateBudget('highlights', [...(budget.highlights || []), { id: generateId(), title: '', description: '', checked: true }])}
                  className="flex items-center space-x-2 px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm mt-2"
                  title="Adicionar destaque"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Destaque</span>
                </button>
              </div>

              {/* Benefits */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center space-x-2">
                  <CheckSquare className="w-5 h-5 text-green-600" />
                  <span>Benefícios Inclusos</span>
                </h3>
                {budget.benefits?.map((benefit, index) => (
                  <div key={benefit.id} className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      checked={benefit.checked}
                      onChange={(e) => {
                        const newBenefits = [...(budget.benefits || [])];
                        newBenefits[index] = { ...benefit, checked: e.target.checked };
                        updateBudget('benefits', newBenefits);
                      }}
                      className="form-checkbox text-purple-600"
                      title="Marcar benefício"
                    />
                    <input
                      type="text"
                      value={benefit.description}
                      onChange={(e) => {
                        const newBenefits = [...(budget.benefits || [])];
                        newBenefits[index] = { ...benefit, description: e.target.value };
                        updateBudget('benefits', newBenefits);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Estacionamento gratuito"
                      title="Descrição do benefício"
                    />
                    <button
                      onClick={() => updateBudget('benefits', budget.benefits?.filter(b => b.id !== benefit.id))}
                      className="text-red-500 hover:text-red-700"
                      title="Remover benefício"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => updateBudget('benefits', [...(budget.benefits || []), { id: generateId(), description: '', checked: true }])}
                  className="flex items-center space-x-2 px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm mt-2"
                  title="Adicionar benefício"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Benefício</span>
                </button>
              </div>

              {/* Important Notes */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-red-600" />
                  <span>Observações Importantes</span>
                </h3>
                {budget.importantNotes?.map((note, index) => (
                  <div key={note.id} className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      checked={note.checked}
                      onChange={(e) => {
                        const newNotes = [...(budget.importantNotes || [])];
                        newNotes[index] = { ...note, checked: e.target.checked };
                        updateBudget('importantNotes', newNotes);
                      }}
                      className="form-checkbox text-purple-600"
                      title="Marcar observação"
                    />
                    <input
                      type="text"
                      value={note.note}
                      onChange={(e) => {
                        const newNotes = [...(budget.importantNotes || [])];
                        newNotes[index] = { ...note, note: e.target.value };
                        updateBudget('importantNotes', newNotes);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Valores sujeitos a alteração conforme disponibilidade"
                      title="Observação importante"
                    />
                    <button
                      onClick={() => updateBudget('importantNotes', budget.importantNotes?.filter(n => n.id !== note.id))}
                      className="text-red-500 hover:text-red-700"
                      title="Remover observação"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => updateBudget('importantNotes', [...(budget.importantNotes || []), { id: generateId(), note: '', checked: true }])}
                  className="flex items-center space-x-2 px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm mt-2"
                  title="Adicionar observação"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Observação</span>
                </button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-4">
          <button onClick={() => router.push('/cotacoes')} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Save className="w-5 h-5" />
            <span>Salvar Cotação</span>
          </button>
        </div>
      </div>
      {isPreviewOpen && (
        <QuotePreview
          budget={{
            ...(budget as Budget),
            id: budget.id as string,
            items: (budget.items as any) || [],
            createdAt: budget.createdAt as string,
            updatedAt: budget.updatedAt as string,
            status: (budget.status as any) || 'draft',
            subtotal: budget.subtotal || 0,
            discount: budget.discount || 0,
            taxes: budget.taxes || 0,
            total: budget.total || 0,
          } as Budget}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen(prev => !prev)}
        />
      )}
    </div>
  );
}
