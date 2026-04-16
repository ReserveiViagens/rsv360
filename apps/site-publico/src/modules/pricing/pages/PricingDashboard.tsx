import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Import pricing hooks
import {
  useRules,
  useSeasons,
  useCompetitors,
  useAlerts,
  usePriceHistory,
  useRateParity
} from '../hooks/usePricing';

const PricingDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'alerts' | 'rules' | 'competitors'>('alerts');
  // Fetch data using hooks
  const { data: rules, isLoading: rulesLoading } = useRules();
  const { data: seasons, isLoading: seasonsLoading } = useSeasons();
  const { data: competitors, isLoading: competitorsLoading } = useCompetitors();
  const { data: alerts, isLoading: alertsLoading } = useAlerts();
  // Note: usePriceHistory requires accommodationId - using a default for demo
  const { data: priceHistory, isLoading: priceHistoryLoading } = usePriceHistory('default-accommodation');
  const { data: rateParity, isLoading: rateParityLoading } = useRateParity('default-accommodation');

  // Calculate metrics
  const activeRules = rules?.rules?.filter(rule => rule.isActive) || [];
  const activeSeasons = seasons?.seasons?.filter(season => season.isActive) || [];
  const criticalAlerts = alerts?.alerts?.filter(alert => alert.severity === 'critical') || [];
  const avgOccupancy = 75; // Mock data - would come from backend
  const revenueChange = 12.5; // Mock data - would come from backend

  // Mock chart data
  const occupancyData = [
    { month: 'Jan', occupancy: 65 },
    { month: 'Feb', occupancy: 70 },
    { month: 'Mar', occupancy: 75 },
    { month: 'Apr', occupancy: 80 },
    { month: 'May', occupancy: 85 },
    { month: 'Jun', occupancy: 82 },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 48000 },
    { month: 'Apr', revenue: 61000 },
    { month: 'May', revenue: 55000 },
    { month: 'Jun', revenue: 67000 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pricing Dashboard</h1>
          <p className="text-gray-600">
            Monitor and manage your pricing strategy across all accommodations
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            📊 Export Report
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            🎯 Optimize Prices
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">Active Rules</h3>
            <div className="text-gray-400">🎯</div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold">{activeRules.length}</div>
            <p className="text-xs text-gray-500">
              {rulesLoading ? 'Loading...' : `${rules?.rules?.length || 0} total rules`}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">Active Seasons</h3>
            <div className="text-gray-400">📅</div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold">{activeSeasons.length}</div>
            <p className="text-xs text-gray-500">
              {seasonsLoading ? 'Loading...' : `${seasons?.seasons?.length || 0} total seasons`}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">Competitors</h3>
            <div className="text-gray-400">👥</div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold">{competitors?.competitors?.length || 0}</div>
            <p className="text-xs text-gray-500">
              {competitorsLoading ? 'Loading...' : 'Monitored properties'}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">Critical Alerts</h3>
            <div className="text-gray-400">⚠️</div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-red-600">{criticalAlerts.length}</div>
            <p className="text-xs text-gray-500">
              {alertsLoading ? 'Loading...' : `${alerts?.alerts?.length || 0} total alerts`}
            </p>
          </div>
        </div>
      </div>

      {/* Revenue and Occupancy Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Revenue Trend</h3>
            <p className="text-sm text-gray-600">
              Monthly revenue performance
              <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                revenueChange > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {revenueChange > 0 ? '↗' : '↘'} {Math.abs(revenueChange)}%
              </span>
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value?.toLocaleString() || 0}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Occupancy Rate</h3>
            <p className="text-sm text-gray-600">
              Current occupancy: {avgOccupancy}%
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={occupancyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}%`, 'Occupancy']} />
              <Bar dataKey="occupancy" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity and Alerts */}
      <div className="space-y-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('alerts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'alerts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Recent Alerts
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rules'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Active Rules
            </button>
            <button
              onClick={() => setActiveTab('competitors')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'competitors'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Competitor Activity
            </button>
          </nav>
        </div>

        <div className="mt-4">
          {activeTab === 'alerts' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Recent Pricing Alerts</h3>
              <p className="text-sm text-gray-600 mb-4">
                Critical notifications requiring attention
              </p>
              {alertsLoading ? (
                <div className="text-center py-4">Loading alerts...</div>
              ) : alerts?.alerts?.length ? (
                <div className="space-y-4">
                  {alerts.alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className={`text-lg ${
                          alert.severity === 'critical' ? 'text-red-500' :
                          alert.severity === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                        }`}>⚠️</span>
                        <div>
                          <p className="font-medium">{alert.title}</p>
                          <p className="text-sm text-gray-600">{alert.message}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        alert.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No alerts at this time
                </div>
              )}
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Active Pricing Rules</h3>
              <p className="text-sm text-gray-600 mb-4">
                Currently applied pricing strategies
              </p>
              {rulesLoading ? (
                <div className="text-center py-4">Loading rules...</div>
              ) : activeRules.length ? (
                <div className="space-y-4">
                  {activeRules.slice(0, 5).map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{rule.name}</p>
                        <p className="text-sm text-gray-600">Strategy: {rule.strategy}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">{rule.strategy}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No active rules
                </div>
              )}
            </div>
          )}

          {activeTab === 'competitors' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Competitor Price Changes</h3>
              <p className="text-sm text-gray-600 mb-4">
                Recent price adjustments by competitors
              </p>
              {competitorsLoading ? (
                <div className="text-center py-4">Loading competitors...</div>
              ) : competitors?.competitors?.length ? (
                <div className="space-y-4">
                  {competitors.competitors.slice(0, 5).map((competitor) => (
                    <div key={competitor.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{competitor.competitorName}</p>
                        <p className="text-sm text-gray-600">{competitor.location || 'N/A'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">💰</span>
                        <span className="text-sm font-medium">
                          {competitor.platform}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No competitors configured
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PricingDashboard;