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
  Copy,
  Lightbulb,
  CheckSquare,
  BookOpen,
  Image
} from 'lucide-react';
import { HotelSelector } from '@/components/HotelSelector';
import { Budget, BudgetItem, Photo, Highlight, Benefit, AccommodationDetail, ImportantNote } from '@/lib/types/budget';
import { budgetStorage } from '@/lib/budget-storage';
import { generateId } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuotePreview } from '@/components/QuotePreview';
import { exportToPDF, exportToDOCX, generateQuoteHTML } from '@/lib/export-utils';

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
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Carregar orçamento existente se estiver em modo view/edit
    const { view, edit } = router.query;
    const budgetId = view || edit;
    if (budgetId && typeof budgetId === 'string') {
      const existing = budgetStorage.getById(budgetId);
      if (existing) {
        setBudget(existing);
        setHotelSelection({
          state: existing.hotelState,
          city: existing.hotelCity,
          hotelId: existing.hotelId,
          hotelName: existing.hotelName,
        });
      }
    }
  }, [router.query]);
  
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
            onClick={openPreview}
            className="flex items-center space-x-2 px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            title="Visualização em tempo real"
          >
            <Eye className="w-4 h-4" />
            <span>Preview</span>
          </button>
          <button
            onClick={openPrePrint}
            className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Pré-impressão"
          >
            <BookOpen className="w-4 h-4" />
            <span>Pré-impressão</span>
          </button>
          <button
            onClick={exportPdf}
            className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Exportar PDF / Imprimir"
          >
            <span>PDF/Imprimir</span>
          </button>
          <button
            onClick={exportDocx}
            className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Exportar DOCX"
          >
            <span>DOCX</span>
          </button>
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

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Validade do Documento</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data e Hora de Validade *
                  </label>
                  <input
                    type="datetime-local"
                    value={getDefaultValidityDate()}
                    onChange={(e) => {
                      const dateValue = e.target.value;
                      if (dateValue) {
                        const validUntil = new Date(dateValue).toISOString();
                        setBudget(prev => ({ ...prev, validUntil }));
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    onChange={(e) => setBudget(prev => ({ ...prev, showUrgencyMessage: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
                      onChange={(e) => setBudget(prev => ({ ...prev, urgencyMessage: e.target.value }))}
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
            {/* Fotos do Hotel */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center space-x-2">
                <Image className="w-5 h-5 text-blue-600" />
                <span>Fotos e Vídeos do Hotel</span>
              </h3>
              
              {/* Upload de Arquivos */}
              <div className="mb-4 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
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
                      e.target.value = ''; // Limpar input
                    }}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                            <div className="w-0 h-0 border-l-[6px] border-l-blue-600 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-1"></div>
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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

            {/* Destaques do Hotel */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <span>Destaques do Hotel</span>
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
                    className="form-checkbox text-blue-600"
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Piscina aquecida com vista para o mar"
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
                    className="form-checkbox text-blue-600"
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Café da manhã incluso"
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
                    className="form-checkbox text-blue-600"
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Valores sujeitos a alteração conforme disponibilidade"
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
    </div>
  );
}