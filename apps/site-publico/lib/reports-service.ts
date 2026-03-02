/**
 * ✅ ITENS 60-62: SERVIÇO DE RELATÓRIOS
 * Exportação PDF, Excel/CSV, Agendamento
 */

import { queryDatabase } from './db';
import { getRevenueByPeriod, getOccupancyRate, getBookingsByChannel, getCustomerAnalysis, getForecasts } from './analytics-service';

export interface ScheduledReport {
  id: number;
  name: string;
  description?: string;
  report_type: string;
  format: string;
  report_config: any;
  schedule_type: string;
  schedule_config?: any;
  next_run_at: string;
  last_run_at?: string;
  recipients: string[];
  subject?: string;
  message?: string;
  status: string;
  is_enabled: boolean;
  total_runs: number;
  successful_runs: number;
  failed_runs: number;
  last_error?: string;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface ReportExecution {
  id: number;
  scheduled_report_id: number;
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
  status: string;
  file_path?: string;
  file_size_bytes?: number;
  record_count?: number;
  error_message?: string;
  error_stack?: string;
  metadata?: any;
}

/**
 * ✅ ITEM 60: RELATÓRIOS EXPORTÁVEIS - PDF
 */
export async function generatePDFReport(
  reportType: string,
  config: any,
  outputPath?: string
): Promise<{ filePath: string; fileSize: number; recordCount: number }> {
  // Esta função seria integrada com uma biblioteca de PDF como jsPDF ou PDFKit
  // Por enquanto, retorna estrutura básica

  let data: any;
  let recordCount = 0;

  switch (reportType) {
    case 'revenue':
      data = await getRevenueByPeriod(config.filters || {});
      recordCount = data.length;
      break;
    case 'occupancy':
      data = await getOccupancyRate(config.filters || {});
      recordCount = data.length;
      break;
    case 'bookings':
      data = await getBookingsByChannel(config.filters || {});
      recordCount = data.length;
      break;
    case 'customers':
      data = await getCustomerAnalysis(config.filters || {});
      recordCount = 1; // Análise é um objeto único
      break;
    default:
      throw new Error(`Tipo de relatório não suportado: ${reportType}`);
  }

  // Implementar geração real de PDF usando jsPDF
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPos = margin;

  // Título
  doc.setFontSize(18);
  doc.text(`Relatório: ${reportType.toUpperCase()}`, margin, yPos);
  yPos += 10;

  // Data de geração
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, margin, yPos);
  yPos += 10;

  // Dados
  doc.setFontSize(12);
  if (Array.isArray(data) && data.length > 0) {
    const headers = Object.keys(data[0]);
    const colWidth = (pageWidth - 2 * margin) / headers.length;

    // Cabeçalho
    doc.setFont(undefined, 'bold');
    headers.forEach((header, i) => {
      doc.text(header, margin + i * colWidth, yPos);
    });
    yPos += 8;
    doc.setFont(undefined, 'normal');

    // Linhas
    data.forEach((row: any) => {
      if (yPos > 280) {
        doc.addPage();
        yPos = margin;
      }
      headers.forEach((header, i) => {
        const value = String(row[header] || '');
        doc.text(value.substring(0, 20), margin + i * colWidth, yPos);
      });
      yPos += 7;
    });
  } else {
    doc.text(JSON.stringify(data, null, 2), margin, yPos);
  }

  // Salvar PDF
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  const filename = `report_${reportType}_${Date.now()}.pdf`;
  const { saveFile } = await import('./storage-service');
  const saved = await saveFile(pdfBuffer, filename, 'reports');

  return {
    filePath: saved.filePath,
    fileSize: saved.fileSize,
    recordCount,
  };
}

/**
 * ✅ ITEM 61: RELATÓRIOS EXPORTÁVEIS - EXCEL/CSV
 */
export async function generateExcelReport(
  reportType: string,
  config: any,
  format: 'excel' | 'csv' = 'csv',
  outputPath?: string
): Promise<{ filePath: string; fileSize: number; recordCount: number }> {
  let data: any;
  let recordCount = 0;

  switch (reportType) {
    case 'revenue':
      data = await getRevenueByPeriod(config.filters || {});
      recordCount = data.length;
      break;
    case 'occupancy':
      data = await getOccupancyRate(config.filters || {});
      recordCount = data.length;
      break;
    case 'bookings':
      data = await getBookingsByChannel(config.filters || {});
      recordCount = data.length;
      break;
    case 'customers':
      data = await getCustomerAnalysis(config.filters || {});
      recordCount = 1;
      break;
    default:
      throw new Error(`Tipo de relatório não suportado: ${reportType}`);
  }

  if (format === 'csv') {
    // Gerar CSV
    const headers = Object.keys(data[0] || {});
    const csvRows = [
      headers.join(','),
      ...data.map((row: any) =>
        headers.map((header) => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',')
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        }).join(',')
      ),
    ];
    const csvContent = csvRows.join('\n');
    const csvBuffer = Buffer.from(csvContent, 'utf-8');
    const filename = `report_${reportType}_${Date.now()}.csv`;
    const { saveFile } = await import('./storage-service');
    const saved = await saveFile(csvBuffer, filename, 'reports');

    return {
      filePath: saved.filePath,
      fileSize: saved.fileSize,
      recordCount,
    };
  } else {
    // Excel (xlsx) usando biblioteca xlsx
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();

    if (Array.isArray(data) && data.length > 0) {
      const worksheet = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório');
    } else {
      // Se não for array, criar uma planilha com os dados
      const worksheet = XLSX.utils.json_to_sheet([data]);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório');
    }

    // Gerar buffer Excel
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const filename = `report_${reportType}_${Date.now()}.xlsx`;
    const { saveFile } = await import('./storage-service');
    const saved = await saveFile(excelBuffer, filename, 'reports');

    return {
      filePath: saved.filePath,
      fileSize: saved.fileSize,
      recordCount,
    };
  }
}

/**
 * ✅ ITEM 62: AGENDAMENTO DE RELATÓRIOS
 */

/**
 * Criar relatório agendado
 */
export async function createScheduledReport(
  reportData: Partial<ScheduledReport>
): Promise<ScheduledReport> {
  const {
    name,
    description,
    report_type,
    format,
    report_config,
    schedule_type,
    schedule_config,
    next_run_at,
    recipients,
    subject,
    message,
    status = 'active',
    is_enabled = true,
    created_by,
  } = reportData;

  if (!name || !report_type || !format || !schedule_type || !next_run_at || !recipients) {
    throw new Error('Campos obrigatórios: name, report_type, format, schedule_type, next_run_at, recipients');
  }

  const result = await queryDatabase(
    `INSERT INTO scheduled_reports 
     (name, description, report_type, format, report_config, schedule_type, schedule_config,
      next_run_at, recipients, subject, message, status, is_enabled, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     RETURNING *`,
    [
      name,
      description || null,
      report_type,
      format,
      JSON.stringify(report_config),
      schedule_type,
      schedule_config ? JSON.stringify(schedule_config) : null,
      next_run_at,
      JSON.stringify(recipients),
      subject || null,
      message || null,
      status,
      is_enabled,
      created_by || null,
    ]
  );

  return result[0] as ScheduledReport;
}

/**
 * Listar relatórios agendados
 */
export async function listScheduledReports(
  filters: {
    status?: string;
    is_enabled?: boolean;
    report_type?: string;
  } = {}
): Promise<ScheduledReport[]> {
  let query = `SELECT * FROM scheduled_reports WHERE 1=1`;
  const params: any[] = [];
  let paramIndex = 1;

  if (filters.status) {
    query += ` AND status = $${paramIndex}`;
    params.push(filters.status);
    paramIndex++;
  }

  if (filters.is_enabled !== undefined) {
    query += ` AND is_enabled = $${paramIndex}`;
    params.push(filters.is_enabled);
    paramIndex++;
  }

  if (filters.report_type) {
    query += ` AND report_type = $${paramIndex}`;
    params.push(filters.report_type);
    paramIndex++;
  }

  query += ` ORDER BY next_run_at ASC`;

  return await queryDatabase(query, params) as ScheduledReport[];
}

/**
 * Obter relatórios prontos para execução
 */
export async function getReportsReadyToRun(): Promise<ScheduledReport[]> {
  const reports = await queryDatabase(
    `SELECT * FROM scheduled_reports 
     WHERE is_enabled = true 
       AND status = 'active'
       AND next_run_at <= CURRENT_TIMESTAMP
     ORDER BY next_run_at ASC`
  );

  return reports as ScheduledReport[];
}

/**
 * Executar relatório agendado
 */
export async function executeScheduledReport(
  reportId: number
): Promise<ReportExecution> {
  const reports = await queryDatabase(
    `SELECT * FROM scheduled_reports WHERE id = $1`,
    [reportId]
  );

  if (reports.length === 0) {
    throw new Error('Relatório agendado não encontrado');
  }

  const report = reports[0] as ScheduledReport;

  // Criar registro de execução
  const execution = await queryDatabase(
    `INSERT INTO report_executions 
     (scheduled_report_id, started_at, status)
     VALUES ($1, CURRENT_TIMESTAMP, 'running')
     RETURNING *`,
    [reportId]
  );

  const executionId = execution[0].id;
  const startTime = Date.now();

  try {
    // Gerar relatório baseado no tipo e formato
    let result: { filePath: string; fileSize: number; recordCount: number };

    if (report.format === 'pdf') {
      result = await generatePDFReport(report.report_type, report.report_config);
    } else if (report.format === 'excel' || report.format === 'csv') {
      result = await generateExcelReport(
        report.report_type,
        report.report_config,
        report.format === 'excel' ? 'excel' : 'csv'
      );
    } else {
      throw new Error(`Formato não suportado: ${report.format}`);
    }

    const duration = Math.floor((Date.now() - startTime) / 1000);

    // Atualizar execução como concluída
    await queryDatabase(
      `UPDATE report_executions 
       SET status = 'completed',
           completed_at = CURRENT_TIMESTAMP,
           duration_seconds = $1,
           file_path = $2,
           file_size_bytes = $3,
           record_count = $4
       WHERE id = $5`,
      [duration, result.filePath, result.fileSize, result.recordCount, executionId]
    );

    // Atualizar relatório agendado
    const nextRun = await queryDatabase(
      `SELECT calculate_next_run($1, $2, CURRENT_TIMESTAMP) as next_run`,
      [report.schedule_type, JSON.stringify(report.schedule_config || {})]
    );

    await queryDatabase(
      `UPDATE scheduled_reports 
       SET last_run_at = CURRENT_TIMESTAMP,
           next_run_at = $1,
           total_runs = total_runs + 1,
           successful_runs = successful_runs + 1,
           last_error = NULL
       WHERE id = $2`,
      [nextRun[0]?.next_run || null, reportId]
    );

    // Enviar email com relatório anexado
    try {
      const { sendEmailNotification } = await import('./notification-service');
      const { readFile } = await import('./storage-service');
      const reportFile = await readFile(result.filePath);
      await sendEmailNotification(
        scheduledReport.user_id,
        scheduledReport.recipient_email || '',
        `Relatório Agendado: ${scheduledReport.report_name}`,
        `Segue em anexo o relatório "${scheduledReport.report_name}" gerado automaticamente.`,
        undefined,
        {
          attachments: [{
            filename: result.filePath.split('/').pop() || 'report.pdf',
            content: reportFile,
          }],
        }
      );
    } catch (emailError: any) {
      console.error('Erro ao enviar email com relatório:', emailError);
      // Não falhar a execução se o email falhar
    }
    // await sendReportEmail(report, result.filePath);

    return execution[0] as ReportExecution;
  } catch (error: any) {
    const duration = Math.floor((Date.now() - startTime) / 1000);

    // Atualizar execução como falha
    await queryDatabase(
      `UPDATE report_executions 
       SET status = 'failed',
           completed_at = CURRENT_TIMESTAMP,
           duration_seconds = $1,
           error_message = $2,
           error_stack = $3
       WHERE id = $4`,
      [duration, error.message, error.stack, executionId]
    );

    // Atualizar relatório agendado
    await queryDatabase(
      `UPDATE scheduled_reports 
       SET total_runs = total_runs + 1,
           failed_runs = failed_runs + 1,
           last_error = $1
       WHERE id = $2`,
      [error.message, reportId]
    );

    throw error;
  }
}

/**
 * Obter histórico de execuções
 */
export async function getReportExecutions(
  reportId: number,
  limit: number = 10
): Promise<ReportExecution[]> {
  return await queryDatabase(
    `SELECT * FROM report_executions 
     WHERE scheduled_report_id = $1
     ORDER BY started_at DESC
     LIMIT $2`,
    [reportId, limit]
  ) as ReportExecution[];
}

