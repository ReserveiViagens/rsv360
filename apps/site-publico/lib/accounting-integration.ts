/**
 * ✅ INTEGRAÇÃO COM SISTEMAS DE CONTABILIDADE
 * 
 * Exportação de dados financeiros para sistemas contábeis:
 * - Exportação de dados financeiros
 * - Sincronização de contas
 * - Formatos: CSV, XML, JSON
 */

import { queryDatabase } from './db';
import * as XLSX from 'xlsx';

export interface AccountingExport {
  format: 'csv' | 'xml' | 'json' | 'xlsx';
  startDate: string;
  endDate: string;
  includePayments: boolean;
  includeBookings: boolean;
  includeRefunds: boolean;
  includeSplitCommissions?: boolean;
  includeDeductions?: boolean;
}

/**
 * Exportar dados financeiros para contabilidade
 */
export async function exportAccountingData(options: AccountingExport): Promise<Buffer | string> {
  try {
    const data: any[] = [];

    // Buscar pagamentos
    if (options.includePayments) {
      const payments = await queryDatabase(
        `SELECT 
           p.id,
           p.booking_id,
           p.amount,
           p.currency,
           p.payment_method,
           p.status,
           p.created_at,
           b.code as booking_code
         FROM payments p
         LEFT JOIN bookings b ON p.booking_id = b.id
         WHERE p.created_at BETWEEN $1 AND $2
         ORDER BY p.created_at`,
        [options.startDate, options.endDate]
      );

      payments.forEach((payment: any) => {
        data.push({
          tipo: 'PAGAMENTO',
          id: payment.id,
          codigo_reserva: payment.booking_code,
          valor: parseFloat(payment.amount || 0),
          moeda: payment.currency || 'BRL',
          metodo: payment.payment_method,
          status: payment.status,
          data: new Date(payment.created_at).toLocaleDateString('pt-BR'),
        });
      });
    }

    // Buscar reservas
    if (options.includeBookings) {
      const bookings = await queryDatabase(
        `SELECT 
           id,
           code,
           total_amount,
           status,
           check_in,
           check_out,
           created_at
         FROM bookings
         WHERE created_at BETWEEN $1 AND $2
         ORDER BY created_at`,
        [options.startDate, options.endDate]
      );

      bookings.forEach((booking: any) => {
        data.push({
          tipo: 'RESERVA',
          id: booking.id,
          codigo: booking.code,
          valor: parseFloat(booking.total_amount || 0),
          status: booking.status,
          check_in: booking.check_in ? new Date(booking.check_in).toLocaleDateString('pt-BR') : '',
          check_out: booking.check_out ? new Date(booking.check_out).toLocaleDateString('pt-BR') : '',
          data: new Date(booking.created_at).toLocaleDateString('pt-BR'),
        });
      });
    }

    // Buscar reembolsos
    if (options.includeRefunds) {
      const refunds = await queryDatabase(
        `SELECT 
           id,
           payment_id,
           amount,
           reason,
           created_at
         FROM refunds
         WHERE created_at BETWEEN $1 AND $2
         ORDER BY created_at`,
        [options.startDate, options.endDate]
      );

      refunds.forEach((refund: any) => {
        data.push({
          tipo: 'REEMBOLSO',
          id: refund.id,
          payment_id: refund.payment_id,
          valor: parseFloat(refund.amount || 0),
          motivo: refund.reason,
          data: new Date(refund.created_at).toLocaleDateString('pt-BR'),
        });
      });
    }

    // Buscar comissões do split marketplace (NF-e sobre comissão)
    if (options.includeSplitCommissions) {
      try {
        const splits = await queryDatabase(
          `SELECT id, booking_id, payment_id, total_amount, platform_amount, service_type, status, created_at
           FROM marketplace_split_transactions
           WHERE created_at::date BETWEEN $1 AND $2 AND status = 'completed'
           ORDER BY created_at`,
          [options.startDate, options.endDate]
        );

        splits.forEach((s: any) => {
          data.push({
            tipo: 'COMISSAO_SPLIT',
            id: s.id,
            booking_id: s.booking_id,
            payment_id: s.payment_id,
            valor_total: parseFloat(s.total_amount || 0),
            comissao_plataforma: parseFloat(s.platform_amount || 0),
            base_tributavel: parseFloat(s.platform_amount || 0),
            service_type: s.service_type,
            data: new Date(s.created_at).toLocaleDateString('pt-BR'),
          });
        });
      } catch {
        // Tabela pode não existir se migration não foi executada
      }
    }

    // Buscar deduções tributárias
    if (options.includeDeductions) {
      try {
        const deductions = await queryDatabase(
          `SELECT id, description, amount, category, approved_by_user, period_start, period_end, created_at
           FROM tax_deductions
           WHERE approved_by_user = true
             AND ((period_start IS NULL AND period_end IS NULL)
                  OR (period_start <= $2 AND (period_end IS NULL OR period_end >= $1)))
           ORDER BY created_at`,
          [options.startDate, options.endDate]
        );

        deductions.forEach((d: any) => {
          data.push({
            tipo: 'DEDUCAO',
            id: d.id,
            descricao: d.description,
            valor: parseFloat(d.amount || 0),
            categoria: d.category,
            data: new Date(d.created_at).toLocaleDateString('pt-BR'),
          });
        });
      } catch {
        // Tabela pode não existir
      }
    }

    // Gerar arquivo no formato solicitado
    switch (options.format) {
      case 'xlsx':
        return generateAccountingExcel(data);
      case 'csv':
        return generateAccountingCSV(data);
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'xml':
        return generateAccountingXML(data);
      default:
        throw new Error('Formato não suportado');
    }
  } catch (error: any) {
    console.error('Erro ao exportar dados contábeis:', error);
    throw error;
  }
}

function generateAccountingExcel(data: any[]): Buffer {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Contabilidade');
  return Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
}

function generateAccountingCSV(data: any[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const rows = data.map((row) => headers.map((header) => {
    const value = row[header];
    return `"${String(value).replace(/"/g, '""')}"`;
  }).join(','));

  return [headers.join(','), ...rows].join('\n');
}

function generateAccountingXML(data: any[]): string {
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<accounting_data>',
    ...data.map((item) => {
      const entries = Object.entries(item)
        .map(([key, value]) => `    <${key}>${String(value)}</${key}>`)
        .join('\n');
      return `  <entry>\n${entries}\n  </entry>`;
    }),
    '</accounting_data>',
  ].join('\n');

  return xml;
}

