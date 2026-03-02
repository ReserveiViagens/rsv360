// Utilitários para exportação de cotações em PDF, DOC e outros formatos

import { Budget } from './types/budget';

// Função para gerar HTML da cotação
export function generateQuoteHTML(budget: Budget): string {
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
  const validUntilDate = budget.validUntil || budget.expiresAt || addDays(created, 30).toISOString();

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cotação - ${budget.title}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background: #fff;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 20px;
        }
        
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        
        .quote-title {
          font-size: 24px;
          color: #1f2937;
          margin-bottom: 10px;
        }
        
        .quote-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .info-section {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #2563eb;
        }
        
        .info-title {
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 10px;
        }
        
        .info-item {
          margin-bottom: 8px;
        }
        
        .info-label {
          font-weight: 600;
          color: #4b5563;
        }
        
        .items-section {
          margin: 30px 0;
        }
        
        .section-title {
          font-size: 20px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        .items-table th,
        .items-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .items-table th {
          background: #f3f4f6;
          font-weight: 600;
          color: #374151;
        }
        
        .item-name {
          font-weight: 600;
          color: #1f2937;
        }
        
        .item-description {
          color: #6b7280;
          font-size: 14px;
        }
        
        .price-summary {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          margin: 20px 0;
        }
        
        .price-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        
        .price-total {
          font-size: 18px;
          font-weight: bold;
          color: #1f2937;
          border-top: 2px solid #2563eb;
          padding-top: 10px;
          margin-top: 10px;
        }
        
        .highlights-section {
          margin: 30px 0;
        }
        
        .highlights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }
        
        .highlight-item {
          display: flex;
          align-items: center;
          padding: 10px;
          background: #ecfdf5;
          border-radius: 6px;
          border-left: 4px solid #10b981;
        }
        
        .highlight-icon {
          color: #10b981;
          margin-right: 10px;
          font-weight: bold;
        }
        
        .benefits-section,
        .notes-section {
          margin: 30px 0;
        }
        
        .benefit-item,
        .note-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 10px;
          padding: 8px;
          background: #fef3c7;
          border-radius: 4px;
        }
        
        .note-item {
          background: #fee2e2;
        }
        
        .benefit-icon,
        .note-icon {
          margin-right: 10px;
          margin-top: 2px;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
        }
        
        .contact-info {
          margin-top: 20px;
          font-size: 14px;
        }
        
        @media print {
          .container {
            padding: 20px;
          }
          
          .header {
            break-inside: avoid;
          }
          
          .items-section {
            break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="logo">Reservei Viagens</div>
          <p style="font-size: 6px; color: #6b7280; margin-top: 4px;">Parques Hoteis & Atrações</p>
          <h1 class="quote-title">${budget.title}</h1>
          <p>Cotação gerada em ${formatDate(new Date().toISOString())} às ${formatDateTime(new Date().toISOString())}</p>
          <p style="margin-top:6px;color:#dc2626;font-weight:600">Válido até: ${formatDate(validUntilDate)} às ${formatDateTime(validUntilDate)}</p>
        </div>
        
        ${budget.showUrgencyMessage && budget.urgencyMessage ? `
        <!-- Mensagem de Urgência -->
        <div class="info-section" style="background: #fef2f2; border-left: 4px solid #dc2626; margin-bottom: 30px;">
          <div class="info-title" style="color: #dc2626; font-size: 16px;">⚠️ ATENÇÃO - URGÊNCIA</div>
          <p style="color: #991b1b; font-weight: 600; margin-top: 8px;">${budget.urgencyMessage}</p>
        </div>
        ` : ''}
        
        <!-- Informações da Cotação -->
        <div class="quote-info">
          <div class="info-section">
            <div class="info-title">📋 Informações da Cotação</div>
            <div class="info-item">
              <span class="info-label">ID:</span> ${budget.id}
            </div>
            <div class="info-item">
              <span class="info-label">Status:</span> ${getStatusLabel(budget.status)}
            </div>
            <div class="info-item">
              <span class="info-label">Tipo:</span> ${getTypeLabel(budget.type)}
            </div>
            <div class="info-item">
              <span class="info-label">Criado em:</span> ${formatDate(budget.createdAt)}
            </div>
          </div>
          
          <div class="info-section">
            <div class="info-title">👤 Dados do Cliente</div>
            <div class="info-item">
              <span class="info-label">Nome:</span> ${budget.clientName}
            </div>
            <div class="info-item">
              <span class="info-label">E-mail:</span> ${budget.clientEmail}
            </div>
            ${budget.clientPhone ? `
            <div class="info-item">
              <span class="info-label">Telefone:</span> ${budget.clientPhone}
            </div>
            ` : ''}
            ${budget.clientDocument ? `
            <div class="info-item">
              <span class="info-label">Documento:</span> ${budget.clientDocument}
            </div>
            ` : ''}
          </div>
        </div>
        
        ${budget.description ? `
        <div class="info-section" style="margin-bottom: 30px;">
          <div class="info-title">📝 Descrição</div>
          <p>${budget.description}</p>
        </div>
        ` : ''}
        
        <!-- Itens da Cotação -->
        <div class="items-section">
          <h2 class="section-title">📦 Itens da Cotação</h2>
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Categoria</th>
                <th>Qtd</th>
                <th>Valor Unit.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${budget.items?.map(item => `
                <tr>
                  <td>
                    <div class="item-name">${item.name}</div>
                    ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
                  </td>
                  <td>${item.category}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.unitPrice)}</td>
                  <td>${formatCurrency(item.totalPrice)}</td>
                </tr>
              `).join('') || '<tr><td colspan="5">Nenhum item adicionado</td></tr>'}
            </tbody>
          </table>
        </div>
        
        <!-- Resumo de Valores -->
        <div class="price-summary">
          <div class="price-row">
            <span>Subtotal:</span>
            <span>${formatCurrency(budget.subtotal)}</span>
          </div>
          ${budget.discount > 0 ? `
          <div class="price-row">
            <span>Desconto (${budget.discountType === 'percentage' ? `${budget.discount}%` : 'Fixo'}):</span>
            <span>- ${formatCurrency(budget.discountType === 'percentage' ? budget.subtotal * (budget.discount / 100) : budget.discount)}</span>
          </div>
          ` : ''}
          ${budget.taxes > 0 ? `
          <div class="price-row">
            <span>Taxas (${budget.taxType === 'percentage' ? `${budget.taxes}%` : 'Fixo'}):</span>
            <span>${formatCurrency(budget.taxType === 'percentage' ? (budget.subtotal - (budget.discountType === 'percentage' ? budget.subtotal * (budget.discount / 100) : budget.discount)) * (budget.taxes / 100) : budget.taxes)}</span>
          </div>
          ` : ''}
          <div class="price-row price-total">
            <span>TOTAL:</span>
            <span>${formatCurrency(budget.total)}</span>
          </div>
        </div>
        
        <!-- Destaques -->
        ${budget.highlights && budget.highlights.length > 0 ? `
        <div class="highlights-section">
          <h2 class="section-title">✨ Destaques</h2>
          <div class="highlights-grid">
            ${budget.highlights.filter(h => h.checked).map(highlight => `
              <div class="highlight-item">
                <span class="highlight-icon">✓</span>
                <span>${highlight.title}</span>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
        
        <!-- Benefícios -->
        ${budget.benefits && budget.benefits.length > 0 ? `
        <div class="benefits-section">
          <h2 class="section-title">🎁 Benefícios Inclusos</h2>
          ${budget.benefits.filter(b => b.checked).map(benefit => `
            <div class="benefit-item">
              <span class="benefit-icon">✓</span>
              <span>${benefit.description}</span>
            </div>
          `).join('')}
        </div>
        ` : ''}
        
        <!-- Observações Importantes -->
        ${budget.importantNotes && budget.importantNotes.length > 0 ? `
        <div class="notes-section">
          <h2 class="section-title">⚠️ Observações Importantes</h2>
          ${budget.importantNotes.filter(n => n.checked).map(note => `
            <div class="note-item">
              <span class="note-icon">!</span>
              <span>${note.note}</span>
            </div>
          `).join('')}
        </div>
        ` : ''}
        
        <!-- Footer -->
        <div class="footer">
          <p><strong>Reservei Viagens</strong></p>
          <p style="font-size: 6px; color: #6b7280; margin-top: 2px;">Parques Hoteis & Atrações</p>
          <div class="contact-info">
            <p>📧 contato@rsv360.com.br | 📱 (11) 99999-9999</p>
            <p>🌐 www.rsv360.com.br</p>
            <p><em>Validade desta proposta: até ${formatDate(validUntilDate)} às ${formatDateTime(validUntilDate)}</em></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getStatusLabel(status: string): string {
  const labels = {
    draft: 'Rascunho',
    sent: 'Enviada',
    approved: 'Aprovada',
    rejected: 'Rejeitada',
    expired: 'Expirada'
  };
  return labels[status as keyof typeof labels] || status;
}

function getTypeLabel(type: string): string {
  const labels = {
    hotel: 'Hotel',
    parque: 'Parque',
    atracao: 'Atração',
    passeio: 'Passeio',
    personalizado: 'Personalizado'
  };
  return labels[type as keyof typeof labels] || type;
}

// Função para exportar como PDF usando window.print()
export function exportToPDF(budget: Budget): void {
  const html = generateQuoteHTML(budget);
  const printWindow = window.open('', '_blank');
  
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Aguardar o carregamento e imprimir
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  }
}

// Função para exportar como HTML para download
export function exportToHTML(budget: Budget): void {
  const html = generateQuoteHTML(budget);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `cotacao-${budget.id}-${budget.title.replace(/[^a-zA-Z0-9]/g, '-')}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

// Função para exportar como DOC (HTML com extensão .doc)
export function exportToDOC(budget: Budget): void {
  const html = generateQuoteHTML(budget);
  const blob = new Blob([html], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `cotacao-${budget.id}-${budget.title.replace(/[^a-zA-Z0-9]/g, '-')}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

// Tentativa de exportar como DOCX usando o conteúdo HTML (compatível com Word)
// Observação: gera um pacote que o Word abre como DOCX, porém não é OOXML "puro".
export function exportToDOCX(budget: Budget): void {
  const html = generateQuoteHTML(budget);
  const blob = new Blob([html], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `cotacao-${budget.id}-${budget.title.replace(/[^a-zA-Z0-9]/g, '-')}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

// Função para gerar link de compartilhamento
export function generateShareLink(budget: Budget): string {
  const baseUrl = window.location.origin;
  const encodedBudget = encodeURIComponent(JSON.stringify(budget));
  return `${baseUrl}/cotacoes/share?data=${encodedBudget}`;
}

// Função para compartilhar via Web Share API (se disponível)
export async function shareQuote(budget: Budget): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({
        title: `Cotação - ${budget.title}`,
        text: `Confira esta cotação de ${budget.type}: ${budget.title}`,
        url: generateShareLink(budget)
      });
      return true;
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      return false;
    }
  }
  return false;
}

// Função para copiar link para clipboard
export async function copyShareLink(budget: Budget): Promise<boolean> {
  try {
    const link = generateShareLink(budget);
    await navigator.clipboard.writeText(link);
    return true;
  } catch (error) {
    console.error('Erro ao copiar link:', error);
    return false;
  }
}

// Função para enviar por email (abre cliente de email)
export function shareByEmail(budget: Budget): void {
  const subject = encodeURIComponent(`Cotação - ${budget.title}`);
  const body = encodeURIComponent(`
Olá!

Segue a cotação solicitada:

Título: ${budget.title}
Cliente: ${budget.clientName}
Total: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(budget.total)}

Para visualizar a cotação completa, acesse:
${generateShareLink(budget)}

Atenciosamente,
Reservei Viagens
Parques Hoteis & Atrações
  `);
  
  window.open(`mailto:${budget.clientEmail}?subject=${subject}&body=${body}`);
}

// Função para salvar localmente (localStorage)
export function saveLocally(budget: Budget): void {
  try {
    const key = `cotacao_${budget.id}`;
    localStorage.setItem(key, JSON.stringify(budget));
    
    // Manter lista de cotações salvas
    const savedQuotes = JSON.parse(localStorage.getItem('saved_quotes') || '[]');
    if (!savedQuotes.includes(budget.id)) {
      savedQuotes.push(budget.id);
      localStorage.setItem('saved_quotes', JSON.stringify(savedQuotes));
    }
  } catch (error) {
    console.error('Erro ao salvar localmente:', error);
  }
}

// Função para carregar cotação salva localmente
export function loadFromLocal(id: string): Budget | null {
  try {
    const key = `cotacao_${id}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Erro ao carregar cotação:', error);
    return null;
  }
}

// Função para listar cotações salvas localmente
export function listSavedQuotes(): { id: string; title: string; date: string }[] {
  try {
    const savedQuotes = JSON.parse(localStorage.getItem('saved_quotes') || '[]');
    return savedQuotes.map((id: string) => {
      const budget = loadFromLocal(id);
      return budget ? {
        id: budget.id,
        title: budget.title,
        date: budget.createdAt
      } : null;
    }).filter(Boolean);
  } catch (error) {
    console.error('Erro ao listar cotações salvas:', error);
    return [];
  }
}
