"use client"

import React, { useState } from 'react';
import { Budget } from '@/lib/types/budget';
import { 
  Eye, 
  Download, 
  Share2, 
  Printer, 
  FileText, 
  Mail, 
  Link,
  Save,
  X,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { 
  exportToPDF, 
  exportToHTML, 
  exportToDOC, 
  shareQuote, 
  copyShareLink, 
  shareByEmail,
  saveLocally 
} from '@/lib/export-utils';

interface QuotePreviewProps {
  budget: Budget;
  isOpen: boolean;
  onClose: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export function QuotePreview({ 
  budget, 
  isOpen, 
  onClose, 
  isFullscreen = false, 
  onToggleFullscreen 
}: QuotePreviewProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [shareMessage, setShareMessage] = useState('');

  if (!isOpen) return null;

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const addDays = (date: Date, days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };

  const created = budget.createdAt ? new Date(budget.createdAt) : new Date();
  const validUntilDate = (budget as any).validUntil || (budget as any).expiresAt || addDays(created, 30).toISOString();

  const getStatusLabel = (status: string): string => {
    const labels = {
      draft: 'Rascunho',
      sent: 'Enviada',
      approved: 'Aprovada',
      rejected: 'Rejeitada',
      expired: 'Expirada'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getTypeLabel = (type: string): string => {
    const labels = {
      hotel: 'Hotel',
      parque: 'Parque',
      atracao: 'Atração',
      passeio: 'Passeio',
      personalizado: 'Personalizado'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      exportToPDF(budget);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportHTML = async () => {
    setIsExporting(true);
    try {
      exportToHTML(budget);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportDOC = async () => {
    setIsExporting(true);
    try {
      exportToDOC(budget);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    const shared = await shareQuote(budget);
    if (!shared) {
      // Fallback para copiar link
      const copied = await copyShareLink(budget);
      setShareMessage(copied ? 'Link copiado para a área de transferência!' : 'Erro ao compartilhar');
      setTimeout(() => setShareMessage(''), 3000);
    }
  };

  const handleCopyLink = async () => {
    const copied = await copyShareLink(budget);
    setShareMessage(copied ? 'Link copiado!' : 'Erro ao copiar link');
    setTimeout(() => setShareMessage(''), 3000);
  };

  const handleSaveLocally = () => {
    saveLocally(budget);
    setShareMessage('Cotação salva localmente!');
    setTimeout(() => setShareMessage(''), 3000);
  };

  return (
    <div className={`fixed inset-0 z-50 ${isFullscreen ? '' : 'p-4'}`}>
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`
        relative bg-white rounded-lg shadow-xl flex flex-col
        ${isFullscreen 
          ? 'w-full h-full rounded-none' 
          : 'w-full max-w-6xl h-[90vh] mx-auto mt-8'
        }
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Eye className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Preview da Cotação
              </h2>
              <p className="text-sm text-gray-500">{budget.title}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Botões de Ação */}
            <div className="flex items-center space-x-1 mr-4">
              {/* Exportar */}
              <div className="relative group">
                <button
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Exportar"
                >
                  <Download className="w-5 h-5" />
                </button>
                <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Exportar PDF</span>
                  </button>
                  <button
                    onClick={handleExportHTML}
                    disabled={isExporting}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Exportar HTML</span>
                  </button>
                  <button
                    onClick={handleExportDOC}
                    disabled={isExporting}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 last:rounded-b-lg"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Exportar DOC</span>
                  </button>
                </div>
              </div>

              {/* Compartilhar */}
              <div className="relative group">
                <button
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Compartilhar"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button
                    onClick={handleShare}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Compartilhar</span>
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Link className="w-4 h-4" />
                    <span>Copiar Link</span>
                  </button>
                  <button
                    onClick={() => shareByEmail(budget)}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 last:rounded-b-lg"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Enviar por Email</span>
                  </button>
                </div>
              </div>

              {/* Imprimir */}
              <button
                onClick={handleExportPDF}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Imprimir"
              >
                <Printer className="w-5 h-5" />
              </button>

              {/* Salvar Localmente */}
              <button
                onClick={handleSaveLocally}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Salvar Localmente"
              >
                <Save className="w-5 h-5" />
              </button>
            </div>

            {/* Fullscreen Toggle */}
            {onToggleFullscreen && (
              <button
                onClick={onToggleFullscreen}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
            )}

            {/* Fechar */}
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mensagem de Status */}
        {shareMessage && (
          <div className="px-4 py-2 bg-green-50 border-b border-green-200">
            <p className="text-sm text-green-700">{shareMessage}</p>
          </div>
        )}

        {/* Conteúdo do Preview */}
        <div className="flex-1 overflow-auto bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
            {/* Header da Cotação */}
            <div className="text-center mb-8 border-b-2 border-blue-600 pb-6">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                Reservei Viagens
              </div>
              <p style={{ fontSize: '6px', color: '#6b7280', marginTop: '4px' }}>Parques Hoteis & Atrações</p>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {budget.title}
              </h1>
              <div className="space-y-1">
                <p className="text-gray-600">
                  Cotação gerada em {formatDate(new Date().toISOString())} às {formatDateTime(new Date().toISOString())}
                </p>
                <p className="text-red-600 font-semibold">
                  Válido até: {formatDate(validUntilDate)} às {formatDateTime(validUntilDate)}
                </p>
              </div>
            </div>

            {/* Mensagem de Urgência */}
            {(budget as any).showUrgencyMessage && (budget as any).urgencyMessage && (
              <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-600 mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-red-600 font-bold text-lg">⚠️</span>
                  <h3 className="text-red-600 font-bold text-base">ATENÇÃO - URGÊNCIA</h3>
                </div>
                <p className="text-red-800 font-semibold text-sm leading-relaxed">
                  {(budget as any).urgencyMessage}
                </p>
              </div>
            )}

            {/* Informações da Cotação */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-600">
                <h3 className="font-bold text-gray-900 mb-3">📋 Informações da Cotação</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-semibold">ID:</span> {budget.id}</div>
                  <div><span className="font-semibold">Status:</span> {getStatusLabel(budget.status)}</div>
                  <div><span className="font-semibold">Tipo:</span> {getTypeLabel(budget.type)}</div>
                  <div><span className="font-semibold">Criado em:</span> {formatDate(budget.createdAt)}</div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-600">
                <h3 className="font-bold text-gray-900 mb-3">👤 Dados do Cliente</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-semibold">Nome:</span> {budget.clientName}</div>
                  <div><span className="font-semibold">E-mail:</span> {budget.clientEmail}</div>
                  {budget.clientPhone && (
                    <div><span className="font-semibold">Telefone:</span> {budget.clientPhone}</div>
                  )}
                  {budget.clientDocument && (
                    <div><span className="font-semibold">Documento:</span> {budget.clientDocument}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Descrição */}
            {budget.description && (
              <div className="bg-gray-50 p-4 rounded-lg mb-8">
                <h3 className="font-bold text-gray-900 mb-2">📝 Descrição</h3>
                <p className="text-gray-700">{budget.description}</p>
              </div>
            )}

            {/* Itens da Cotação */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-200 pb-2">
                📦 Itens da Cotação
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Item</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Categoria</th>
                      <th className="border border-gray-300 px-4 py-2 text-center font-semibold">Qtd</th>
                      <th className="border border-gray-300 px-4 py-2 text-right font-semibold">Valor Unit.</th>
                      <th className="border border-gray-300 px-4 py-2 text-right font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budget.items?.map((item, index) => (
                      <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-4 py-2">
                          <div className="font-semibold text-gray-900">{item.name}</div>
                          {item.description && (
                            <div className="text-sm text-gray-600">{item.description}</div>
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">{item.category}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center">{item.quantity}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-semibold">{formatCurrency(item.totalPrice)}</td>
                      </tr>
                    )) || (
                      <tr>
                        <td colSpan={5} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                          Nenhum item adicionado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Resumo de Valores */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{formatCurrency(budget.subtotal)}</span>
                </div>
                {budget.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Desconto ({budget.discountType === 'percentage' ? `${budget.discount}%` : 'Fixo'}):</span>
                    <span>- {formatCurrency(budget.discountType === 'percentage' ? budget.subtotal * (budget.discount / 100) : budget.discount)}</span>
                  </div>
                )}
                {budget.taxes > 0 && (
                  <div className="flex justify-between">
                    <span>Taxas ({budget.taxType === 'percentage' ? `${budget.taxes}%` : 'Fixo'}):</span>
                    <span>{formatCurrency(budget.taxType === 'percentage' ? (budget.subtotal - (budget.discountType === 'percentage' ? budget.subtotal * (budget.discount / 100) : budget.discount)) * (budget.taxes / 100) : budget.taxes)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-gray-900 border-t-2 border-blue-600 pt-3">
                  <span>TOTAL:</span>
                  <span>{formatCurrency(budget.total)}</span>
                </div>
              </div>
            </div>

            {/* Destaques */}
            {budget.highlights && budget.highlights.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-200 pb-2">
                  ✨ Destaques
                </h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {budget.highlights.filter(h => h.checked).map((highlight) => (
                    <div key={highlight.id} className="flex items-center p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <span className="text-green-600 font-bold mr-3">✓</span>
                      <span className="text-gray-900">{highlight.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Benefícios */}
            {budget.benefits && budget.benefits.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-200 pb-2">
                  🎁 Benefícios Inclusos
                </h2>
                <div className="space-y-2">
                  {budget.benefits.filter(b => b.checked).map((benefit) => (
                    <div key={benefit.id} className="flex items-start p-2 bg-yellow-50 rounded-lg">
                      <span className="text-yellow-600 font-bold mr-3 mt-1">✓</span>
                      <span className="text-gray-900">{benefit.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Observações Importantes */}
            {budget.importantNotes && budget.importantNotes.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-200 pb-2">
                  ⚠️ Observações Importantes
                </h2>
                <div className="space-y-2">
                  {budget.importantNotes.filter(n => n.checked).map((note) => (
                    <div key={note.id} className="flex items-start p-2 bg-red-50 rounded-lg">
                      <span className="text-red-600 font-bold mr-3 mt-1">!</span>
                      <span className="text-gray-900">{note.note}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center pt-8 border-t-2 border-gray-200 text-gray-600">
              <p className="font-bold text-gray-900 mb-1">Reservei Viagens</p>
              <p style={{ fontSize: '6px', color: '#6b7280', marginBottom: '8px' }}>Parques Hoteis & Atrações</p>
              <div className="text-sm space-y-1">
                <p>📧 contato@rsv360.com.br | 📱 (11) 99999-9999</p>
                <p>🌐 www.rsv360.com.br</p>
                <p className="italic">Orçamento valido sujeito a disponibilidade, não garantimos a disponibilidade de unidades sem a confirmação do pagamento da entrada, pois trabalhamos com valores promocionais.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
