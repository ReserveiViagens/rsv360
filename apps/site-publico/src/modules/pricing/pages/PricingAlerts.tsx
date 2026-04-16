import React, { useState } from 'react';
import { format } from 'date-fns';

// Import pricing hooks
import {
  useAlerts,
  useAcknowledgeAlert,
  useResolveAlert,
  useDismissAlert,
  useCheckAlerts
} from '../hooks/usePricing';

import type { PricingAlert } from '../types';

const PricingAlerts: React.FC = () => {
  const [filters, setFilters] = useState({
    severity: '',
    status: '',
    page: 1,
    limit: 10
  });

  // Fetch alerts with filters
  const { data: alertsResponse, isLoading, refetch } = useAlerts(filters);
  const alerts = alertsResponse?.alerts || [];
  const totalPages = alertsResponse?.totalPages || 1;

  // Mutations
  const acknowledgeMutation = useAcknowledgeAlert();
  const resolveMutation = useResolveAlert();
  const dismissMutation = useDismissAlert();
  const checkAlertsMutation = useCheckAlerts();

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      await acknowledgeMutation.mutateAsync(alertId);
      refetch();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const handleResolve = async (alertId: string) => {
    const resolution = prompt('Enter resolution notes (optional):');
    try {
      await resolveMutation.mutateAsync({ id: alertId, resolvedBy: resolution || undefined });
      refetch();
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const handleDismiss = async (alertId: string) => {
    if (confirm('Are you sure you want to dismiss this alert?')) {
      try {
        await dismissMutation.mutateAsync(alertId);
        refetch();
      } catch (error) {
        console.error('Error dismissing alert:', error);
      }
    }
  };

  const handleCheckAlerts = async () => {
    try {
      await checkAlertsMutation.mutateAsync('default-accommodation');
      refetch();
      alert('Alert check completed successfully!');
    } catch (error) {
      console.error('Error checking alerts:', error);
      alert('Error checking alerts. Please try again.');
    }
  };

  const getSeverityColor = (severity: PricingAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: PricingAlert['severity']) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getStatusColor = (status: PricingAlert['status']) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'acknowledged': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'dismissed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: PricingAlert['status']) => {
    switch (status) {
      case 'active': return 'Active';
      case 'acknowledged': return 'Acknowledged';
      case 'resolved': return 'Resolved';
      case 'dismissed': return 'Dismissed';
      default: return status;
    }
  };

  const activeAlerts = alerts.filter(alert => alert.status === 'active');
  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical' && alert.status === 'active');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pricing Alerts</h1>
          <p className="text-gray-600">
            Monitor and manage pricing alerts and notifications
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCheckAlerts}
            disabled={checkAlertsMutation.isPending}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🔄 Check Alerts
          </button>
        </div>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">Total Alerts</h3>
            <div className="text-gray-400">📊</div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold">{alertsResponse?.total || 0}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">Active Alerts</h3>
            <div className="text-red-400">🔴</div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-red-600">{activeAlerts.length}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">Critical Alerts</h3>
            <div className="text-red-500">🚨</div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-red-600">{criticalAlerts.length}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">Resolved Today</h3>
            <div className="text-green-400">✅</div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-green-600">
              {alerts.filter(alert =>
                alert.status === 'resolved' &&
                new Date(alert.resolvedAt || '').toDateString() === new Date().toDateString()
              ).length}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Severity
            </label>
            <select
              value={filters.severity}
              onChange={(e) => handleFilterChange('severity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Items per page
            </label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">
            Alerts ({alertsResponse?.total || 0})
          </h3>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No alerts found. All systems are running smoothly!
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {alerts.map((alert) => (
              <div key={alert.id} className={`p-6 border-l-4 ${getSeverityColor(alert.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg">{getSeverityIcon(alert.severity)}</span>
                      <h4 className="text-lg font-semibold text-gray-900">{alert.title}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(alert.status)}`}>
                        {getStatusLabel(alert.status)}
                      </span>
                    </div>

                    <p className="text-gray-700 mb-3">{alert.message}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Created: {format(new Date(alert.createdAt), 'PPP p')}</span>
                      {alert.resolvedAt && (
                        <span>Resolved: {format(new Date(alert.resolvedAt), 'PPP p')}</span>
                      )}
                      {alert.resolvedBy && (
                        <span>By: {alert.resolvedBy}</span>
                      )}
                    </div>

                    {alert.data && Object.keys(alert.data).length > 0 && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Additional Data:</h5>
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                          {JSON.stringify(alert.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 ml-4">
                    {alert.status === 'active' && (
                      <>
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          disabled={acknowledgeMutation.isPending}
                          className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 disabled:opacity-50"
                        >
                          Acknowledge
                        </button>
                        <button
                          onClick={() => handleResolve(alert.id)}
                          disabled={resolveMutation.isPending}
                          className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 disabled:opacity-50"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => handleDismiss(alert.id)}
                          disabled={dismissMutation.isPending}
                          className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200 disabled:opacity-50"
                        >
                          Dismiss
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {filters.page} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                disabled={filters.page === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))}
                disabled={filters.page === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingAlerts;