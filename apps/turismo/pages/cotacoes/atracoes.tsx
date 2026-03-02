import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  Clock,
  Plus,
  Save,
  Trash2,
  Upload,
  Eye,
  Edit,
  Copy,
  Lightbulb,
  CheckSquare,
  BookOpen,
  Image,
  Globe,
  Star,
  UserCheck
} from 'lucide-react';
import { AttractionSelector } from '@/components/AttractionSelector';
import { Budget, BudgetItem, Photo, Highlight, Benefit, AccommodationDetail, ImportantNote } from '@/lib/types/budget';
import { budgetStorage } from '@/lib/budget-storage';
import { generateId } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAttractionById } from '@/lib/attractions-data';
import { QuotePreview } from '@/components/QuotePreview';
import { exportToPDF, exportToDOCX, generateQuoteHTML } from '@/lib/export-utils';

export default function AtracoesPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [budget, setBudget] = useState<Partial<Budget>>({
    id: generateId(),
    type: 'atracao',
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
    // Campos específicos para atrações
    attractionState: '',
    attractionCity: '',
    attractionId: '',
    attractionName: '',
    visitDate: '',
    visitTime: '',
    groupSize: 1,
    hasGroupDiscount: false,
    hasScheduledTour: false,
    tourGuideIncluded: false,
    duration: ''
  });
  const [activeTab, setActiveTab] = useState('basic-info');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedAttraction, setSelectedAttraction] = useState<any>(null);

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
    
    // Recalcular preço total do item
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    setBudget((prev) => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    const attraction = selectedAttraction?.attraction;
    const newItem: BudgetItem = {
      id: generateId(),
      name: attraction ? `Ingresso - ${attraction.name}` : 'Novo Item',
      description: attraction?.description || '',
      category: 'Ingresso',
      quantity: 1,
      unitPrice: attraction?.ticketTypes?.[0]?.basePrice || 0,
      totalPrice: attraction?.ticketTypes?.[0]?.basePrice || 0,
      details: {
        date: budget.visitDate || '',
        time: budget.visitTime || '',
        ageGroup: 'adulto',
        ticketType: attraction?.ticketTypes?.[0]?.name || 'Padrão',
        tourGuide: false,
        audioGuide: false,
        scheduledTime: '',
        meetingPoint: '',
        difficulty: attraction?.difficulty || 'facil',
        accessibility: attraction?.accessibility || false
      },
    };
    
    setBudget((prev) => ({
      ...prev,
      items: [...(prev.items || []), newItem],
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

  const applyGroupDiscount = () => {
    if (budget.groupSize && budget.groupSize >= 10) {
      setBudget(prev => ({
        ...prev,
        discount: 15,
        discountType: 'percentage',
        hasGroupDiscount: true
      }));
    }
  };

  const handleAttractionSelect = (selection: any) => {
    setSelectedAttraction(selection);
    if (selection.attraction) {
      setBudget(prev => ({
        ...prev,
        attractionState: selection.attraction.state,
        attractionCity: selection.attraction.city,
        attractionId: selection.attraction.id,
        attractionName: selection.attraction.name,
        attractionType: selection.attraction.type,
        hasGroupDiscount: selection.attraction.hasGroupDiscount,
        hasScheduledTour: selection.attraction.hasScheduledTours,
        duration: selection.attraction.duration,
        title: `Cotação - ${selection.attraction.name}`
      }));
    }
  };

  const saveBudget = () => {
    if (!budget.clientName || !budget.clientEmail || !selectedAttraction?.attraction) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const budgetToSave: Budget = {
      ...budget,
      updatedAt: new Date().toISOString(),
    } as Budget;

    budgetStorage.save(budgetToSave);
    alert('Cotação salva com sucesso!');
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

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/cotacoes" className="flex items-center space-x-2 text-teal-600 hover:text-teal-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Cotações</span>
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">🎡 Nova Cotação de Atrações</h1>
                <p className="text-gray-600">Sistema de Orçamentos para Atrações Turísticas</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button onClick={openPreview} className="flex items-center space-x-2 px-4 py-2 bg-white text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors" title="Preview">
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </button>
              <button onClick={openPrePrint} className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" title="Pré-impressão">
                <BookOpen className="w-4 h-4" />
                <span>Pré-impressão</span>
              </button>
              <button onClick={exportPdf} className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" title="PDF/Imprimir">
                <span>PDF/Imprimir</span>
              </button>
              <button onClick={exportDocx} className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" title="DOCX">
                <span>DOCX</span>
              </button>
              <button
                onClick={saveBudget}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                title="Salvar cotação"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Cotação</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic-info">Informações Básicas</TabsTrigger>
            <TabsTrigger value="attraction-selection">Seleção da Atração</TabsTrigger>
            <TabsTrigger value="tickets-values">Ingressos & Valores</TabsTrigger>
            <TabsTrigger value="details">Detalhes & Destaques</TabsTrigger>
          </TabsList>

          <TabsContent value="basic-info" className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Informações do Cliente</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Cliente *
                  </label>
                  <input
                    type="text"
                    value={budget.clientName}
                    onChange={(e) => updateBudget('clientName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Nome completo do cliente"
                    title="Nome do cliente"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    value={budget.clientEmail}
                    onChange={(e) => updateBudget('clientEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="email@exemplo.com"
                    title="E-mail do cliente"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={budget.clientPhone}
                    onChange={(e) => updateBudget('clientPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="(11) 99999-9999"
                    title="Telefone do cliente"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título da Cotação
                  </label>
                  <input
                    type="text"
                    value={budget.title}
                    onChange={(e) => updateBudget('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: Visita ao Cristo Redentor"
                    title="Título da cotação"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Informações da Visita</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data da Visita
                  </label>
                  <input
                    type="date"
                    value={budget.visitDate}
                    onChange={(e) => updateBudget('visitDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    title="Data da visita"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horário Preferencial
                  </label>
                  <input
                    type="time"
                    value={budget.visitTime}
                    onChange={(e) => updateBudget('visitTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    title="Horário da visita"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tamanho do Grupo
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      min="1"
                      value={budget.groupSize}
                      onChange={(e) => updateBudget('groupSize', parseInt(e.target.value) || 1)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="1"
                      title="Número de pessoas"
                    />
                    {budget.groupSize && budget.groupSize >= 10 && (
                      <button
                        onClick={applyGroupDiscount}
                        className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                        title="Aplicar desconto para grupos"
                      >
                        Desconto Grupo
                      </button>
                    )}
                  </div>
                  {budget.groupSize && budget.groupSize >= 10 && (
                    <p className="text-xs text-green-600 mt-1">
                      Grupo qualificado para desconto de 15%
                    </p>
                  )}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
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

          <TabsContent value="attraction-selection" className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Seleção da Atração Turística</h3>
              <AttractionSelector
                value={selectedAttraction}
                onChange={handleAttractionSelect}
                required={true}
              />
            </div>
          </TabsContent>

          <TabsContent value="tickets-values" className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Ingressos e Valores</h3>
                <button
                  onClick={addItem}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  title="Adicionar item"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Item</span>
                </button>
              </div>

              <div className="space-y-4">
                {budget.items?.map((item, index) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome do Item
                        </label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItem(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Ex: Ingresso Adulto"
                          title="Nome do item"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Categoria
                        </label>
                        <select
                          value={item.category}
                          onChange={(e) => updateItem(index, 'category', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          title="Categoria do item"
                        >
                          <option value="Ingresso">Ingresso</option>
                          <option value="Tour Guiado">Tour Guiado</option>
                          <option value="Audioguia">Audioguia</option>
                          <option value="Transporte">Transporte</option>
                          <option value="Alimentação">Alimentação</option>
                          <option value="Souvenir">Souvenir</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantidade
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          title="Quantidade"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Valor Unitário (R$)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          title="Valor unitário"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Faixa Etária
                        </label>
                        <select
                          value={item.details?.ageGroup || 'adulto'}
                          onChange={(e) => updateItem(index, 'details.ageGroup', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          title="Faixa etária"
                        >
                          <option value="adulto">Adulto</option>
                          <option value="crianca">Criança</option>
                          <option value="idoso">Idoso</option>
                          <option value="estudante">Estudante</option>
                          <option value="familia">Família</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Data
                        </label>
                        <input
                          type="date"
                          value={item.details?.date || ''}
                          onChange={(e) => updateItem(index, 'details.date', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          title="Data da visita"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Horário
                        </label>
                        <input
                          type="time"
                          value={item.details?.time || ''}
                          onChange={(e) => updateItem(index, 'details.time', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          title="Horário da visita"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={item.details?.tourGuide || false}
                            onChange={(e) => updateItem(index, 'details.tourGuide', e.target.checked)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            title="Incluir guia turístico"
                          />
                          <span className="text-sm text-gray-700">Guia Turístico</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={item.details?.audioGuide || false}
                            onChange={(e) => updateItem(index, 'details.audioGuide', e.target.checked)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            title="Incluir audioguia"
                          />
                          <span className="text-sm text-gray-700">Audioguia</span>
                        </label>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="font-semibold text-lg text-green-600">
                          R$ {(item.quantity * item.unitPrice).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="flex items-center space-x-2 px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remover item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {budget.items?.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum item adicionado. Clique em "Adicionar Item" para começar.
                  </div>
                )}
              </div>

              {/* Resumo de Valores */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Subtotal:</span>
                    <div className="font-semibold">R$ {budget.subtotal?.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Desconto:</span>
                    <div className="font-semibold text-red-600">
                      - R$ {((budget.discountType === 'percentage' ? budget.subtotal! * (budget.discount! / 100) : budget.discount!) || 0).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Taxas:</span>
                    <div className="font-semibold">R$ {budget.taxes?.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Total:</span>
                    <div className="font-bold text-lg text-green-600">R$ {budget.total?.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            {/* Fotos e Vídeos da Atração */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center space-x-2">
                <Image className="w-5 h-5 text-blue-600" />
                <span>Fotos e Vídeos da Atração</span>
              </h3>
              
              {/* Upload de Arquivos */}
              <div className="mb-4 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition-colors">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Faça upload de imagens ou vídeos</p>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      files.forEach(file => {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const url = event.target?.result as string;
                          const isVideo = file.type.startsWith('video/');
                          setBudget(prev => ({ 
                            ...prev, 
                            photos: [...(prev.photos || []), { 
                              id: generateId(), 
                              url: url, 
                              caption: file.name,
                              type: isVideo ? 'video' : 'image'
                            }]
                          }));
                        };
                        reader.readAsDataURL(file);
                      });
                      e.target.value = '';
                    }}
                    className="hidden"
                    id="file-upload-attraction"
                  />
                  <label
                    htmlFor="file-upload-attraction"
                    className="cursor-pointer inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Selecionar Arquivos
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    Suporta: JPG, PNG, GIF, MP4, MOV, AVI (máx. 10MB cada)
                  </p>
                </div>
              </div>

              {/* Galeria de Mídia */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                {budget.photos?.map((photo) => (
                  <div key={photo.id} className="relative group">
                    {photo.type === 'video' || photo.url.includes('.mp4') || photo.url.includes('.mov') || photo.url.includes('.avi') ? (
                      <div className="relative">
                        <video 
                          src={photo.url} 
                          className="w-full h-32 object-cover rounded-lg"
                          controls={false}
                          muted
                          onMouseEnter={(e) => e.currentTarget.play()}
                          onMouseLeave={(e) => e.currentTarget.pause()}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
                          <div className="w-8 h-8 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
                            <div className="w-0 h-0 border-l-[6px] border-l-green-600 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-1"></div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img src={photo.url} alt={photo.caption} className="w-full h-32 object-cover rounded-lg" />
                    )}
                    
                    {/* Overlay com controles */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            const newCaption = prompt('Digite uma legenda para esta mídia:', photo.caption);
                            if (newCaption !== null) {
                              setBudget(prev => ({
                                ...prev,
                                photos: prev.photos?.map(p => 
                                  p.id === photo.id ? { ...p, caption: newCaption } : p
                                ) || []
                              }));
                            }
                          }}
                          className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 transition-colors"
                          title="Editar legenda"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.open(photo.url, '_blank')}
                          className="bg-green-500 text-white rounded-full p-2 hover:bg-green-600 transition-colors"
                          title="Visualizar em tela cheia"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setBudget(prev => ({ ...prev, photos: prev.photos?.filter(p => p.id !== photo.id) }))}
                          className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                          title="Remover mídia"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Legenda */}
                    {photo.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-2 rounded-b-lg">
                        {photo.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Adicionar por URL */}
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Ou adicione por URL:</p>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="URL da imagem ou vídeo"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        const url = e.currentTarget.value;
                        const isVideo = url.includes('.mp4') || url.includes('.mov') || url.includes('.avi') || url.includes('youtube.com') || url.includes('vimeo.com');
                        setBudget(prev => ({ 
                          ...prev, 
                          photos: [...(prev.photos || []), { 
                            id: generateId(), 
                            url: url, 
                            caption: '',
                            type: isVideo ? 'video' : 'image'
                          }]
                        }));
                        e.currentTarget.value = '';
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    title="URL da nova mídia"
                  />
                  <button
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      if (input.value) {
                        const url = input.value;
                        const isVideo = url.includes('.mp4') || url.includes('.mov') || url.includes('.avi') || url.includes('youtube.com') || url.includes('vimeo.com');
                        setBudget(prev => ({ 
                          ...prev, 
                          photos: [...(prev.photos || []), { 
                            id: generateId(), 
                            url: url, 
                            caption: '',
                            type: isVideo ? 'video' : 'image'
                          }]
                        }));
                        input.value = '';
                      }
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    title="Adicionar por URL"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Estatísticas */}
              {budget.photos && budget.photos.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Total de mídias: {budget.photos.length}</span>
                    <div className="flex space-x-4">
                      <span>Imagens: {budget.photos.filter(p => p.type !== 'video' && !p.url.includes('.mp4')).length}</span>
                      <span>Vídeos: {budget.photos.filter(p => p.type === 'video' || p.url.includes('.mp4')).length}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Destaques da Atração */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <span>Destaques da Atração</span>
              </h3>
              {budget.highlights?.map((highlight, index) => (
                <div key={highlight.id} className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={highlight.checked}
                    onChange={(e) => {
                      const newHighlights = [...(budget.highlights || [])];
                      newHighlights[index] = { ...highlight, checked: e.target.checked };
                      setBudget(prev => ({ ...prev, highlights: newHighlights }));
                    }}
                    className="form-checkbox text-green-600"
                    title="Marcar destaque"
                  />
                  <input
                    type="text"
                    value={highlight.title}
                    onChange={(e) => {
                      const newHighlights = [...(budget.highlights || [])];
                      newHighlights[index] = { ...highlight, title: e.target.value };
                      setBudget(prev => ({ ...prev, highlights: newHighlights }));
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Vista panorâmica da cidade"
                    title="Título do destaque"
                  />
                  <button
                    onClick={() => setBudget(prev => ({ ...prev, highlights: prev.highlights?.filter(h => h.id !== highlight.id) }))}
                    className="text-red-500 hover:text-red-700"
                    title="Remover destaque"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setBudget(prev => ({ 
                  ...prev, 
                  highlights: [...(prev.highlights || []), { id: generateId(), title: '', description: '', checked: true }]
                }))}
                className="flex items-center space-x-2 px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm mt-2"
                title="Adicionar destaque"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Destaque</span>
              </button>
            </div>

            {/* Benefícios Inclusos */}
            <div className="bg-white rounded-lg shadow-md p-6">
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
                      setBudget(prev => ({ ...prev, benefits: newBenefits }));
                    }}
                    className="form-checkbox text-green-600"
                    title="Marcar benefício"
                  />
                  <input
                    type="text"
                    value={benefit.description}
                    onChange={(e) => {
                      const newBenefits = [...(budget.benefits || [])];
                      newBenefits[index] = { ...benefit, description: e.target.value };
                      setBudget(prev => ({ ...prev, benefits: newBenefits }));
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Guia turístico incluso"
                    title="Descrição do benefício"
                  />
                  <button
                    onClick={() => setBudget(prev => ({ ...prev, benefits: prev.benefits?.filter(b => b.id !== benefit.id) }))}
                    className="text-red-500 hover:text-red-700"
                    title="Remover benefício"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setBudget(prev => ({ 
                  ...prev, 
                  benefits: [...(prev.benefits || []), { id: generateId(), description: '', checked: true }]
                }))}
                className="flex items-center space-x-2 px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm mt-2"
                title="Adicionar benefício"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Benefício</span>
              </button>
            </div>

            {/* Observações Importantes */}
            <div className="bg-white rounded-lg shadow-md p-6">
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
                      setBudget(prev => ({ ...prev, importantNotes: newNotes }));
                    }}
                    className="form-checkbox text-green-600"
                    title="Marcar observação"
                  />
                  <input
                    type="text"
                    value={note.note}
                    onChange={(e) => {
                      const newNotes = [...(budget.importantNotes || [])];
                      newNotes[index] = { ...note, note: e.target.value };
                      setBudget(prev => ({ ...prev, importantNotes: newNotes }));
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Sujeito à disponibilidade e condições climáticas"
                    title="Observação importante"
                  />
                  <button
                    onClick={() => setBudget(prev => ({ ...prev, importantNotes: prev.importantNotes?.filter(n => n.id !== note.id) }))}
                    className="text-red-500 hover:text-red-700"
                    title="Remover observação"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setBudget(prev => ({ 
                  ...prev, 
                  importantNotes: [...(prev.importantNotes || []), { id: generateId(), note: '', checked: true }]
                }))}
                className="flex items-center space-x-2 px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm mt-2"
                title="Adicionar observação"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Observação</span>
              </button>
            </div>
          </TabsContent>
        </Tabs>
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