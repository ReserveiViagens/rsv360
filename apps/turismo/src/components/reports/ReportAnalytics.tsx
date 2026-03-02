import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, Download, DollarSign } from 'lucide-react';

interface AnalyticsData {
  totalReports: number;
  reportsByType: { type: string; count: number; percentage: number }[];
  monthlyTrend: { month: string; reports: number; downloads: number }[];
  topUsers: { name: string; reports: number; lastAccess: Date }[];
  averageGenerationTime: number;
  totalDownloads: number;
}

interface ReportAnalyticsProps {
  className?: string;
}

const ReportAnalytics: React.FC<ReportAnalyticsProps> = ({ className = '' }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  // Mock data - substitua por chamada real à API
  useEffect(() => {
    const mockAnalytics: AnalyticsData = {
      totalReports: 1247,
      reportsByType: [
        { type: 'Vendas', count: 456, percentage: 36.6 },
        { type: 'Financeiro', count: 312, percentage: 25.0 },
        { type: 'Clientes', count: 289, percentage: 23.2 },
        { type: 'Performance', count: 190, percentage: 15.2 }
      ],
      monthlyTrend: [
        { month: 'Nov', reports: 98, downloads: 156 },
        { month: 'Dez', reports: 142, downloads: 198 },
        { month: 'Jan', reports: 167, downloads: 234 }
      ],
      topUsers: [
        { name: 'Ana Silva', reports: 34, lastAccess: new Date('2025-01-30T14:30:00') },
        { name: 'Carlos Santos', reports: 28, lastAccess: new Date('2025-01-30T11:15:00') },
        { name: 'Maria Costa', reports: 22, lastAccess: new Date('2025-01-29T16:45:00') }
      ],
      averageGenerationTime: 2.4,
      totalDownloads: 3842
    };

    setTimeout(() => {
      setAnalytics(mockAnalytics);
      setLoading(false);
    }, 1000);
  }, [selectedPeriod]);

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className={`p-6 ${className}`}>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Analytics de Relatórios</h3>
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="1y">Último ano</option>
          </select>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Relatórios</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalReports.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Downloads</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalDownloads.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Download className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.averageGenerationTime}s</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.topUsers.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Relatórios por Tipo */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Relatórios por Tipo</h4>
          <div className="space-y-4">
            {analytics.reportsByType.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500" style={{ backgroundColor: `hsl(${index * 90}, 70%, 50%)` }}></div>
                  <span className="font-medium text-gray-900">{item.type}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{item.count}</div>
                  <div className="text-sm text-gray-500">{item.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tendência Mensal */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Tendência Mensal</h4>
          <div className="space-y-4">
            {analytics.monthlyTrend.map((month, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900">{month.month}</div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-blue-600">
                    <span className="font-semibold">{month.reports}</span> relatórios
                  </div>
                  <div className="text-green-600">
                    <span className="font-semibold">{month.downloads}</span> downloads
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Usuários */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 lg:col-span-2">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Usuários Mais Ativos</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-4 font-semibold text-gray-900">Usuário</th>
                  <th className="text-left py-2 px-4 font-semibold text-gray-900">Relatórios</th>
                  <th className="text-left py-2 px-4 font-semibold text-gray-900">Último Acesso</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topUsers.map((user, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-600">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900">{user.reports}</td>
                    <td className="py-3 px-4 text-gray-500">
                      {user.lastAccess.toLocaleString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportAnalytics;
