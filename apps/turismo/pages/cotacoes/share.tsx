import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  Share2, 
  Mail, 
  MessageCircle,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Budget } from '@/lib/types/budget';
import { 
  exportToPDF, 
  exportToHTML, 
  exportToDOC, 
  copyShareLink, 
  shareByEmail 
} from '@/lib/export-utils';

export default function SharePage() {
  const router = useRouter();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState('');

  useEffect(() => {
    const { data } = router.query;
    
    if (data && typeof data === 'string') {
      try {
        const decodedBudget = JSON.parse(decodeURIComponent(data));
        setBudget(decodedBudget);
      } catch (err) {
        setError('Dados da cotação inválidos');
      }
    } else if (router.isReady) {
      setError('Nenhuma cotação encontrada');
    }
    
    setIsLoading(false);
  }, [router.query, router.isReady]);

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

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

  const handleCopyLink = async () => {
    if (!budget) return;
    
    const copied = await copyShareLink(budget);
    setCopyMessage(copied ? 'Link copiado!' : 'Erro ao copiar link');
    setTimeout(() => setCopyMessage(''), 3000);
  };

  const handleShareWhatsApp = () => {
    if (!budget) return;
    
    const message = encodeURIComponent(`
Reservei Viagens
Parques Hoteis & Atrações

Olá! Segue a cotação solicitada:

📋 *${budget.title}*
👤 Cliente: ${budget.clientName}
💰 Total: ${formatCurrency(budget.total)}

Para visualizar a cotação completa:
${window.location.href}

Atenciosamente,
RSV 360 Turismo
    `);
    
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando cotação...</p>
        </div>
      </div>
    );
  }

  if (error || !budget) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExternalLink className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Cotação não encontrada</h1>
          <p className="text-gray-600 mb-6">{error || 'A cotação solicitada não pôde ser carregada.'}</p>
          <Link
            href="/cotacoes"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Cotações</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Fixo */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Cotação Compartilhada</h1>
                <p className="text-sm text-gray-600">{budget.title}</p>
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => exportToPDF(budget)}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Baixar PDF"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">PDF</span>
              </button>
              
              <button
                onClick={() => exportToDOC(budget)}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Baixar DOC"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">DOC</span>
              </button>
              
              <button
                onClick={() => exportToPDF(budget)}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Imprimir"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Imprimir</span>
              </button>

              <div className="relative group">
                <button className="flex items-center space-x-2 px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Compartilhar</span>
                </button>
                <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button
                    onClick={handleCopyLink}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copiar Link</span>
                  </button>
                  <button
                    onClick={() => shareByEmail(budget)}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Enviar por Email</span>
                  </button>
                  <button
                    onClick={handleShareWhatsApp}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 last:rounded-b-lg"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mensagem de Status */}
          {copyMessage && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">{copyMessage}</p>
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo da Cotação */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Header da Cotação */}
          <div className="text-center mb-8 border-b-2 border-teal-600 pb-6">
            <div className="text-2xl font-bold text-teal-600 mb-1">
              Reservei Viagens
            </div>
            <p style={{ fontSize: '6px', color: '#6b7280', marginTop: '4px' }}>Parques Hoteis & Atrações</p>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {budget.title}
            </h1>
            <p className="text-gray-600">
              Cotação gerada em {formatDate(new Date().toISOString())}
            </p>
          </div>

          {/* Informações da Cotação */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-teal-600">
              <h3 className="font-bold text-gray-900 mb-3">📋 Informações da Cotação</h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-semibold">ID:</span> {budget.id}</div>
                <div><span className="font-semibold">Status:</span> {getStatusLabel(budget.status)}</div>
                <div><span className="font-semibold">Tipo:</span> {getTypeLabel(budget.type)}</div>
                <div><span className="font-semibold">Criado em:</span> {formatDate(budget.createdAt)}</div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-teal-600">
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
              <div className="flex justify-between text-xl font-bold text-gray-900 border-t-2 border-teal-600 pt-3">
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
  );
}
