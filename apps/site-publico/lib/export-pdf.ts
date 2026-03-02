/**
 * Exportação de lista de hóspedes em PDF
 * Usa jsPDF para gerar PDF no cliente
 */

import { Guest } from '@/components/guests-form';
import { Address } from '@/components/address-form';

// Dynamic import para jsPDF (biblioteca pesada)
let jsPDF: any = null;

async function loadJsPDF() {
  if (!jsPDF) {
    const module = await import('jspdf');
    jsPDF = module.jsPDF;
  }
  return jsPDF;
}

export interface BookingDataForPDF {
  bookingCode: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  responsibleName: string;
  responsibleEmail: string;
  responsiblePhone: string;
  responsibleDocument: string;
  guests: Guest[];
  address: Address;
  total: number;
  paymentMethod: string;
}

/**
 * Exportar lista de hóspedes em PDF
 */
export async function exportGuestsToPDF(data: BookingDataForPDF): Promise<void> {
  try {
    const PDF = await loadJsPDF();
    const doc = new PDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Configurações
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yPos = margin;

    // Função para adicionar nova página se necessário
    const checkNewPage = (requiredSpace: number) => {
      if (yPos + requiredSpace > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        yPos = margin;
      }
    };

    // Título
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Lista de Hóspedes - Reserva', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Informações da Reserva
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Informações da Reserva', margin, yPos);
    yPos += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Código da Reserva: ${data.bookingCode}`, margin, yPos);
    yPos += 5;
    doc.text(`Hotel: ${data.hotelName}`, margin, yPos);
    yPos += 5;
    doc.text(`Check-in: ${formatDate(data.checkIn)}`, margin, yPos);
    yPos += 5;
    doc.text(`Check-out: ${formatDate(data.checkOut)}`, margin, yPos);
    yPos += 8;

    // Responsável pela Reserva
    checkNewPage(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Responsável pela Reserva', margin, yPos);
    yPos += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Nome: ${data.responsibleName}`, margin, yPos);
    yPos += 5;
    doc.text(`E-mail: ${data.responsibleEmail}`, margin, yPos);
    yPos += 5;
    doc.text(`Telefone: ${data.responsiblePhone}`, margin, yPos);
    yPos += 5;
    doc.text(`CPF/CNPJ: ${data.responsibleDocument}`, margin, yPos);
    yPos += 8;

    // Endereço
    checkNewPage(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Endereço do Responsável', margin, yPos);
    yPos += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`${data.address.street}, ${data.address.number}`, margin, yPos);
    yPos += 5;
    if (data.address.complement) {
      doc.text(`Complemento: ${data.address.complement}`, margin, yPos);
      yPos += 5;
    }
    doc.text(`${data.address.neighborhood}`, margin, yPos);
    yPos += 5;
    doc.text(`${data.address.city} - ${data.address.state}`, margin, yPos);
    yPos += 5;
    doc.text(`CEP: ${data.address.zipCode}`, margin, yPos);
    yPos += 8;

    // Lista de Hóspedes
    checkNewPage(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Lista de Hóspedes', margin, yPos);
    yPos += 7;

    // Tabela de hóspedes
    const tableStartY = yPos;
    let currentY = tableStartY;

    // Cabeçalho da tabela
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Nome', margin, currentY);
    doc.text('Idade', margin + 80, currentY);
    doc.text('Documento', margin + 100, currentY);
    currentY += 5;

    // Linha separadora
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 3;

    // Responsável
    doc.setFont('helvetica', 'normal');
    doc.text(data.responsibleName, margin, currentY);
    doc.text('-', margin + 80, currentY);
    doc.text(data.responsibleDocument || '-', margin + 100, currentY);
    currentY += 5;

    // Outros hóspedes
    data.guests.forEach((guest) => {
      checkNewPage(10);
      doc.text(guest.name, margin, currentY);
      doc.text(guest.age?.toString() || '-', margin + 80, currentY);
      doc.text(guest.document || '-', margin + 100, currentY);
      currentY += 5;
    });

    yPos = currentY + 5;

    // Informações de Pagamento
    checkNewPage(15);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Informações de Pagamento', margin, yPos);
    yPos += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Método: ${formatPaymentMethod(data.paymentMethod)}`, margin, yPos);
    yPos += 5;
    doc.text(`Total: R$ ${data.total.toFixed(2).replace('.', ',')}`, margin, yPos);
    yPos += 8;

    // Rodapé
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Gerado em ${new Date().toLocaleString('pt-BR')} - Página ${i} de ${totalPages}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Salvar PDF
    doc.save(`hospedes-reserva-${data.bookingCode}.pdf`);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw new Error('Erro ao gerar PDF. Tente novamente.');
  }
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  } catch {
    return dateString;
  }
}

function formatPaymentMethod(method: string): string {
  const methods: Record<string, string> = {
    pix: 'PIX',
    card: 'Cartão de Crédito',
    boleto: 'Boleto Bancário',
  };
  return methods[method] || method;
}

