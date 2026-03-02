/**
 * ✅ SERVIÇO DE EXPORTAÇÃO DE RELATÓRIOS
 * 
 * Exportação de relatórios em PDF e Excel:
 * - Relatórios de reservas
 * - Relatórios financeiros
 * - Relatórios de clientes
 * - Templates customizáveis
 */

import { queryDatabase } from './db';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export interface ReportOptions {
  format: 'pdf' | 'excel' | 'csv';
  startDate?: string;
  endDate?: string;
  propertyId?: number;
  includeCharts?: boolean;
  template?: string;
}

/**
 * Exportar relatório de reservas
 */
export async function exportBookingsReport(options: ReportOptions): Promise<Buffer | string> {
  const { startDate, endDate, propertyId } = options;

  // Buscar dados
  const bookings = await queryDatabase(
    `SELECT 
       b.*,
       p.name as property_name,
       u.name as guest_name,
       u.email as guest_email
     FROM bookings b
     LEFT JOIN properties p ON b.property_id = p.id
     LEFT JOIN users u ON b.user_id = u.id
     WHERE ($1::date IS NULL OR b.created_at >= $1::date)
     AND ($2::date IS NULL OR b.created_at <= $2::date)
     AND ($3::integer IS NULL OR b.property_id = $3)
     ORDER BY b.created_at DESC`,
    [startDate || null, endDate || null, propertyId || null]
  );

  switch (options.format) {
    case 'pdf':
      return generateBookingsPDF(bookings, options);
    case 'excel':
      return generateBookingsExcel(bookings, options);
    case 'csv':
      return generateBookingsCSV(bookings);
    default:
      throw new Error('Formato não suportado');
  }
}

/**
 * Gerar PDF de reservas
 */
function generateBookingsPDF(bookings: any[], options: ReportOptions): Buffer {
  const doc = new jsPDF();
  let yPos = 20;

  // Título
  doc.setFontSize(18);
  doc.text('Relatório de Reservas', 14, yPos);
  yPos += 10;

  // Período
  if (options.startDate || options.endDate) {
    doc.setFontSize(12);
    doc.text(
      `Período: ${options.startDate || 'Início'} a ${options.endDate || 'Fim'}`,
      14,
      yPos
    );
    yPos += 10;
  }

  // Cabeçalho da tabela
  doc.setFontSize(10);
  const headers = ['Código', 'Propriedade', 'Hóspede', 'Check-in', 'Check-out', 'Valor', 'Status'];
  const colWidths = [25, 40, 40, 30, 30, 30, 25];
  let xPos = 14;

  headers.forEach((header, i) => {
    doc.text(header, xPos, yPos);
    xPos += colWidths[i];
  });
  yPos += 8;

  // Linhas da tabela
  doc.setFontSize(9);
  bookings.forEach((booking) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }

    xPos = 14;
    const row = [
      booking.code || booking.id,
      (booking.property_name || '').substring(0, 20),
      (booking.guest_name || '').substring(0, 20),
      booking.check_in ? new Date(booking.check_in).toLocaleDateString('pt-BR') : '',
      booking.check_out ? new Date(booking.check_out).toLocaleDateString('pt-BR') : '',
      `R$ ${parseFloat(booking.total_amount || 0).toFixed(2)}`,
      booking.status || '',
    ];

    row.forEach((cell, i) => {
      doc.text(String(cell).substring(0, colWidths[i] / 2), xPos, yPos);
      xPos += colWidths[i];
    });
    yPos += 7;
  });

  // Total
  yPos += 5;
  doc.setFontSize(10);
  const total = bookings.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0);
  doc.text(`Total: R$ ${total.toFixed(2)}`, 14, yPos);

  return Buffer.from(doc.output('arraybuffer'));
}

/**
 * Gerar Excel de reservas
 */
function generateBookingsExcel(bookings: any[], options: ReportOptions): Buffer {
  const data = bookings.map((booking) => ({
    'Código': booking.code || booking.id,
    'Propriedade': booking.property_name || '',
    'Hóspede': booking.guest_name || '',
    'Email': booking.guest_email || '',
    'Check-in': booking.check_in ? new Date(booking.check_in).toLocaleDateString('pt-BR') : '',
    'Check-out': booking.check_out ? new Date(booking.check_out).toLocaleDateString('pt-BR') : '',
    'Valor': parseFloat(booking.total_amount || 0),
    'Status': booking.status || '',
    'Criado em': booking.created_at ? new Date(booking.created_at).toLocaleString('pt-BR') : '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reservas');

  // Adicionar sheet de resumo
  const summary = [
    { 'Métrica': 'Total de Reservas', 'Valor': bookings.length },
    { 'Métrica': 'Receita Total', 'Valor': bookings.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0) },
    { 'Métrica': 'Ticket Médio', 'Valor': bookings.length > 0 ? bookings.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0) / bookings.length : 0 },
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summary);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');

  return Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
}

/**
 * Gerar CSV de reservas
 */
function generateBookingsCSV(bookings: any[]): string {
  const headers = ['Código', 'Propriedade', 'Hóspede', 'Email', 'Check-in', 'Check-out', 'Valor', 'Status'];
  const rows = bookings.map((booking) => [
    booking.code || booking.id,
    booking.property_name || '',
    booking.guest_name || '',
    booking.guest_email || '',
    booking.check_in ? new Date(booking.check_in).toLocaleDateString('pt-BR') : '',
    booking.check_out ? new Date(booking.check_out).toLocaleDateString('pt-BR') : '',
    parseFloat(booking.total_amount || 0).toFixed(2),
    booking.status || '',
  ]);

  const csv = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  return csv;
}

/**
 * Exportar relatório financeiro
 */
export async function exportFinancialReport(options: ReportOptions): Promise<Buffer | string> {
  const { startDate, endDate, propertyId } = options;

  const data = await queryDatabase(
    `SELECT 
       DATE(created_at) as date,
       COUNT(*) as bookings,
       SUM(total_amount) as revenue,
       SUM(CASE WHEN status = 'cancelled' THEN total_amount ELSE 0 END) as refunds
     FROM bookings
     WHERE ($1::date IS NULL OR created_at >= $1::date)
     AND ($2::date IS NULL OR created_at <= $2::date)
     AND ($3::integer IS NULL OR property_id = $3)
     GROUP BY DATE(created_at)
     ORDER BY date`,
    [startDate || null, endDate || null, propertyId || null]
  );

  switch (options.format) {
    case 'pdf':
      return generateFinancialPDF(data, options);
    case 'excel':
      return generateFinancialExcel(data, options);
    default:
      throw new Error('Formato não suportado para relatório financeiro');
  }
}

function generateFinancialPDF(data: any[], options: ReportOptions): Buffer {
  const doc = new jsPDF();
  let yPos = 20;

  doc.setFontSize(18);
  doc.text('Relatório Financeiro', 14, yPos);
  yPos += 15;

  doc.setFontSize(10);
  const headers = ['Data', 'Reservas', 'Receita', 'Reembolsos', 'Líquido'];
  const colWidths = [40, 30, 40, 40, 40];
  let xPos = 14;

  headers.forEach((header, i) => {
    doc.text(header, xPos, yPos);
    xPos += colWidths[i];
  });
  yPos += 8;

  doc.setFontSize(9);
  let totalRevenue = 0;
  let totalRefunds = 0;

  data.forEach((row) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }

    const revenue = parseFloat(row.revenue || 0);
    const refunds = parseFloat(row.refunds || 0);
    const net = revenue - refunds;
    totalRevenue += revenue;
    totalRefunds += refunds;

    xPos = 14;
    const cells = [
      new Date(row.date).toLocaleDateString('pt-BR'),
      String(row.bookings || 0),
      `R$ ${revenue.toFixed(2)}`,
      `R$ ${refunds.toFixed(2)}`,
      `R$ ${net.toFixed(2)}`,
    ];

    cells.forEach((cell, i) => {
      doc.text(cell, xPos, yPos);
      xPos += colWidths[i];
    });
    yPos += 7;
  });

  // Totais
  yPos += 5;
  doc.setFontSize(10);
  doc.text(`Receita Total: R$ ${totalRevenue.toFixed(2)}`, 14, yPos);
  yPos += 7;
  doc.text(`Reembolsos Total: R$ ${totalRefunds.toFixed(2)}`, 14, yPos);
  yPos += 7;
  doc.text(`Líquido Total: R$ ${(totalRevenue - totalRefunds).toFixed(2)}`, 14, yPos);

  return Buffer.from(doc.output('arraybuffer'));
}

function generateFinancialExcel(data: any[], options: ReportOptions): Buffer {
  const excelData = data.map((row) => ({
    'Data': new Date(row.date).toLocaleDateString('pt-BR'),
    'Reservas': row.bookings || 0,
    'Receita': parseFloat(row.revenue || 0),
    'Reembolsos': parseFloat(row.refunds || 0),
    'Líquido': parseFloat(row.revenue || 0) - parseFloat(row.refunds || 0),
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Financeiro');

  return Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
}
