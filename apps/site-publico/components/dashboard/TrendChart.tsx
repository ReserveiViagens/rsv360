import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react';

interface TrendData {
  date: string;
  hotels?: number;
  promotions?: number;
  attractions?: number;
  logins?: number;
  newUsers?: number;
}

interface TrendChartProps {
  title: string;
  data: TrendData[];
  type: 'content' | 'users';
  className?: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  title,
  data,
  type,
  className = ''
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const getIcon = () => {
    if (type === 'content') return <BarChart3 className="h-5 w-5" />;
    return <TrendingUp className="h-5 w-5" />;
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className="p-2 rounded-full bg-blue-50 text-blue-600">
          {getIcon()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Gráfico de barras simplificado */}
          <div className="flex items-end justify-between space-x-1 h-32">
            {data.map((item, index) => {
              if (type === 'content') {
                const total = (item.hotels || 0) + (item.promotions || 0) + (item.attractions || 0);
                return (
                  <div key={index} className="flex flex-col items-center space-y-1 flex-1">
                    <div className="flex flex-col items-center space-y-1 w-full">
                      {/* Barra de hotéis */}
                      {item.hotels && item.hotels > 0 && (
                        <div
                          className="w-full bg-blue-500 rounded-t-sm transition-all duration-300 hover:bg-blue-600 h-8"
                          title={`Hotéis: ${item.hotels}`}
                        />
                      )}
                      {/* Barra de promoções */}
                      {item.promotions && item.promotions > 0 && (
                        <div
                          className="w-full bg-green-500 transition-all duration-300 hover:bg-green-600 h-6"
                          title={`Promoções: ${item.promotions}`}
                        />
                      )}
                      {/* Barra de atrações */}
                      {item.attractions && item.attractions > 0 && (
                        <div
                          className="w-full bg-purple-500 rounded-b-sm transition-all duration-300 hover:bg-purple-600 h-4"
                          title={`Atrações: ${item.attractions}`}
                        />
                      )}
                    </div>
                    <div className="text-xs text-gray-500 text-center">
                      {formatDate(item.date)}
                    </div>
                    <div className="text-xs font-medium text-gray-700">
                      {total}
                    </div>
                  </div>
                );
              } else {
                const total = (item.logins || 0) + (item.newUsers || 0);
                return (
                  <div key={index} className="flex flex-col items-center space-y-1 flex-1">
                    <div className="flex flex-col items-center space-y-1 w-full">
                      {/* Barra de logins */}
                      {item.logins && item.logins > 0 && (
                        <div
                          className="w-full bg-orange-500 rounded-t-sm transition-all duration-300 hover:bg-orange-600 h-8"
                          title={`Logins: ${item.logins}`}
                        />
                      )}
                      {/* Barra de novos usuários */}
                      {item.newUsers && item.newUsers > 0 && (
                        <div
                          className="w-full bg-teal-500 rounded-b-sm transition-all duration-300 hover:bg-teal-600 h-4"
                          title={`Novos usuários: ${item.newUsers}`}
                        />
                      )}
                    </div>
                    <div className="text-xs text-gray-500 text-center">
                      {formatDate(item.date)}
                    </div>
                    <div className="text-xs font-medium text-gray-700">
                      {total}
                    </div>
                  </div>
                );
              }
            })}
          </div>

          {/* Legenda */}
          <div className="flex flex-wrap gap-2 text-xs">
            {type === 'content' ? (
              <>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                  <span>Hotéis</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                  <span>Promoções</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-purple-500 rounded-sm"></div>
                  <span>Atrações</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
                  <span>Logins</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-teal-500 rounded-sm"></div>
                  <span>Novos usuários</span>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente de gráfico de pizza para distribuição
export const PieChart: React.FC<{
  title: string;
  data: Record<string, number>;
  className?: string;
}> = ({ title, data, className = '' }) => {
  const total = Object.values(data).reduce((sum, value) => sum + value, 0);
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500', 'bg-cyan-500'];

  const getPercentage = (value: number) => {
    return total > 0 ? (value / total) * 100 : 0;
  };

  const getColor = (index: number) => {
    return colors[index % colors.length];
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className="p-2 rounded-full bg-purple-50 text-purple-600">
          <PieChartIcon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Gráfico de pizza simplificado */}
          <div className="flex items-center justify-center h-32">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {total} total
              </span>
            </div>
          </div>

          {/* Legenda */}
          <div className="space-y-2">
            {Object.entries(data).map(([key, value], index) => (
              <div key={key} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-sm ${getColor(index)}`}></div>
                  <span className="text-gray-600">{key}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-medium text-gray-900">{value}</span>
                  <span className="text-gray-500">({getPercentage(value).toFixed(1)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
