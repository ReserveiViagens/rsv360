import React, { useState, useEffect } from 'react';
import { Clock, Download, Eye, Trash2, Filter, Search } from 'lucide-react';

interface HistoryReport {
  id: string;
  name: string;
  type: string;
  generatedAt: Date;
  status: 'completed' | 'failed' | 'processing';
  size: string;
  downloadUrl?: string;
  parameters: Record<string, any>;
}

interface ReportHistoryProps {
  className?: string;
}

const ReportHistory: React.FC<ReportHistoryProps> = ({ className = '' }) => {
  const [reports, setReports] = useState<HistoryReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Mock data - substitua por chamada real à API
  useEffect(() => {
    const mockReports: HistoryReport[] = [
      {
        id: '1',
        name: 'Relatório de Vendas - Janeiro 2025',
        type: 'vendas',
        generatedAt: new Date('2025-01-30T10:30:00'),
        status: 'completed',
        size: '2.4 MB',
        downloadUrl: '/downloads/vendas-jan-2025.pdf',
        parameters: { period: 'monthly', year: 2025, month: 1 }
      },
      {
        id: '2',
        name: 'Análise de Performance - Q4 2024',
        type: 'performance',
        generatedAt: new Date('2025-01-29T15:45:00'),
        status: 'completed',
        size: '1.8 MB',
        downloadUrl: '/downloads/performance-q4-2024.xlsx',
        parameters: { period: 'quarterly', year: 2024, quarter: 4 }
      },
      {
        id: '3',
        name: 'Relatório de Clientes - Em Processamento',
        type: 'clientes',
        generatedAt: new Date('2025-01-30T16:20:00'),
        status: 'processing',
        size: '-',
        parameters: { period: 'current', includeInactive: false }
      }
    ];

    setTimeout(() => {
      setReports(mockReports);
      setLoading(false);
    }, 1000);
  }, []);

  const handleDownload = (report: HistoryReport) => {
    if (report.downloadUrl) {
      // Simular download
      console.log('Downloading:', report.name);
      // window.open(report.downloadUrl, '_blank');
    }
  };

  const handleDelete = (reportId: string) => {
    setReports(prev => prev.filter(r => r.id !== reportId));
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: HistoryReport['status']) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', label: 'Concluído' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Falhou' },
      processing: { color: 'bg-yellow-100 text-yellow-800', label: 'Processando' }
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Relatórios</h3>
        
        {/* Filtros e Busca */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar relatórios..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 w-4 h-4" />
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos os Status</option>
              <option value="completed">Concluídos</option>
              <option value="processing">Processando</option>
              <option value="failed">Falharam</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Relatórios */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum relatório encontrado</p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div key={report.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-gray-900">{report.name}</h4>
                    {getStatusBadge(report.status)}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{report.generatedAt.toLocaleString('pt-BR')}</span>
                    </div>
                    <span>Tipo: {report.type}</span>
                    <span>Tamanho: {report.size}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => console.log('Visualizar:', report.name)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Visualizar"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  {report.status === 'completed' && report.downloadUrl && (
                    <button
                      onClick={() => handleDownload(report)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDelete(report.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReportHistory;
