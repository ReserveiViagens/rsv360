import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'list' | 'weather' | 'events' | 'predictions';
  title: string;
  position: { x: number; y: number; w: number; h: number };
  config: any;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  layout: 'grid' | 'list' | 'compact';
  widgets: DashboardWidget[];
  refreshInterval: number;
}

const DashboardPersonalizado: React.FC = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'light',
    layout: 'grid',
    widgets: [],
    refreshInterval: 30000
  });
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({});
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    loadUserPreferences();
    loadDashboardData();
    
    // Auto-refresh
    const interval = setInterval(loadDashboardData, preferences.refreshInterval);
    return () => clearInterval(interval);
  }, [user?.id]);

  const loadUserPreferences = async () => {
    try {
      const response = await fetch(`/api/users/${user?.id}/preferences`);
      if (response.ok) {
        const userPrefs = await response.json();
        setPreferences(userPrefs);
      }
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const [weatherData, eventsData, predictionsData, metricsData] = await Promise.all([
        fetch('/api/weather/user').then(r => r.json()),
        fetch('/api/events/user').then(r => r.json()),
        fetch('/api/predictions/user').then(r => r.json()),
        fetch('/api/metrics/user').then(r => r.json())
      ]);

      setData({
        weather: weatherData,
        events: eventsData,
        predictions: predictionsData,
        metrics: metricsData
      });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    }
  };

  const savePreferences = async (newPreferences: UserPreferences) => {
    try {
      const response = await fetch(`/api/users/${user?.id}/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPreferences)
      });
      
      if (response.ok) {
        setPreferences(newPreferences);
        setEditing(false);
      }
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
    }
  };

  const addWidget = (type: DashboardWidget['type']) => {
    const newWidget: DashboardWidget = {
      id: `widget_${Date.now()}`,
      type,
      title: `Novo ${type}`,
      position: { x: 0, y: 0, w: 3, h: 2 },
      config: {}
    };

    const newPreferences = {
      ...preferences,
      widgets: [...preferences.widgets, newWidget]
    };

    savePreferences(newPreferences);
  };

  const removeWidget = (widgetId: string) => {
    const newPreferences = {
      ...preferences,
      widgets: preferences.widgets.filter(w => w.id !== widgetId)
    };

    savePreferences(newPreferences);
  };

  const renderWidget = (widget: DashboardWidget) => {
    switch (widget.type) {
      case 'weather':
        return <WeatherWidget data={data.weather} />;
      case 'events':
        return <EventsWidget data={data.events} />;
      case 'predictions':
        return <PredictionsWidget data={data.predictions} />;
      case 'metric':
        return <MetricWidget data={data.metrics} config={widget.config} />;
      case 'chart':
        return <ChartWidget data={data.metrics} config={widget.config} />;
      case 'list':
        return <ListWidget data={data} config={widget.config} />;
      default:
        return <div>Widget não suportado</div>;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Personalizado
            </h1>
            <p className="text-gray-600">
              Bem-vindo, {user?.full_name}! Aqui estão suas informações personalizadas.
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setEditing(!editing)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editing ? 'Salvar' : 'Personalizar'}
            </button>
            
            {editing && (
              <div className="flex space-x-2">
                <select
                  onChange={(e) => addWidget(e.target.value as DashboardWidget['type'])}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Adicionar Widget</option>
                  <option value="weather">Clima</option>
                  <option value="events">Eventos</option>
                  <option value="predictions">Previsões</option>
                  <option value="metric">Métrica</option>
                  <option value="chart">Gráfico</option>
                  <option value="list">Lista</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {preferences.widgets.map((widget) => (
            <div
              key={widget.id}
              className={`bg-white rounded-lg shadow-md p-4 ${
                editing ? 'border-2 border-dashed border-blue-300' : ''
              }`}
              style={{
                gridColumn: `span ${widget.position.w}`,
                gridRow: `span ${widget.position.h}`
              }}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-900">{widget.title}</h3>
                {editing && (
                  <button
                    onClick={() => removeWidget(widget.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                )}
              </div>
              {renderWidget(widget)}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {preferences.widgets.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Seu dashboard está vazio
            </h3>
            <p className="text-gray-600 mb-6">
              Adicione widgets para personalizar sua experiência
            </p>
            <button
              onClick={() => setEditing(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Começar a Personalizar
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

// Componentes de Widget
const WeatherWidget: React.FC<{ data: any }> = ({ data }) => (
  <div className="text-center">
    {data ? (
      <>
        <div className="text-4xl mb-2">🌤️</div>
        <div className="text-2xl font-bold text-blue-600">
          {data.temperature}°C
        </div>
        <div className="text-gray-600">{data.description}</div>
        <div className="text-sm text-gray-500 mt-2">
          {data.location}
        </div>
      </>
    ) : (
      <div className="text-gray-500">Carregando clima...</div>
    )}
  </div>
);

const EventsWidget: React.FC<{ data: any }> = ({ data }) => (
  <div>
    {data?.events ? (
      <div className="space-y-2">
        {data.events.slice(0, 3).map((event: any, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">{event.name}</span>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-gray-500">Nenhum evento próximo</div>
    )}
  </div>
);

const PredictionsWidget: React.FC<{ data: any }> = ({ data }) => (
  <div>
    {data ? (
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Demanda Prevista</span>
          <span className="text-sm font-semibold text-green-600">
            {data.demand}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Preço Otimizado</span>
          <span className="text-sm font-semibold text-blue-600">
            R$ {data.price}
          </span>
        </div>
      </div>
    ) : (
      <div className="text-gray-500">Carregando previsões...</div>
    )}
  </div>
);

const MetricWidget: React.FC<{ data: any; config: any }> = ({ data, config }) => (
  <div className="text-center">
    <div className="text-3xl font-bold text-gray-900">
      {data?.[config.metric] || '0'}
    </div>
    <div className="text-sm text-gray-600">{config.label || 'Métrica'}</div>
  </div>
);

const ChartWidget: React.FC<{ data: any; config: any }> = ({ data, config }) => (
  <div className="h-32 flex items-center justify-center">
    <div className="text-gray-500">Gráfico: {config.type || 'Barras'}</div>
  </div>
);

const ListWidget: React.FC<{ data: any; config: any }> = ({ data, config }) => (
  <div className="space-y-2">
    {config.items?.map((item: any, index: number) => (
      <div key={index} className="flex justify-between text-sm">
        <span className="text-gray-600">{item.label}</span>
        <span className="font-medium">{item.value}</span>
      </div>
    )) || (
      <div className="text-gray-500">Nenhum item configurado</div>
    )}
  </div>
);

export default DashboardPersonalizado; 