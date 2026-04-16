import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

// Import pricing hooks
import {
  useCompetitorComparison,
  useRateParity
} from '../hooks/usePricing';

interface ComparisonData {
  competitorName: string;
  platform: string;
  price: number;
  currency: string;
  difference: number;
  percentage: number;
  isCheaper: boolean;
}

const RateComparison: React.FC = () => {
  const [checkInDate, setCheckInDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [checkOutDate, setCheckOutDate] = useState(format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'));
  const [selectedAccommodation, setSelectedAccommodation] = useState('default-accommodation');
  const [viewMode, setViewMode] = useState<'table' | 'chart' | 'parity'>('table');

  // Fetch competitor comparison data
  const { data: comparisonData, isLoading: comparisonLoading } = useCompetitorComparison(
    selectedAccommodation,
    checkInDate,
    checkOutDate
  );

  // Fetch rate parity data
  const { data: parityData, isLoading: parityLoading } = useRateParity(
    selectedAccommodation,
    undefined // All platforms
  );

  // Process comparison data
  const processedComparison = useMemo(() => {
    if (!comparisonData?.competitors) return [];

    // Assume our accommodation price for comparison (mock data)
    const ourPrice = 250; // This would come from our pricing API

    return comparisonData.competitors.map(comp => ({
      competitorName: comp.competitorName,
      platform: comp.platform,
      price: comp.price,
      currency: comp.currency,
      difference: comp.price - ourPrice,
      percentage: ((comp.price - ourPrice) / ourPrice) * 100,
      isCheaper: comp.price < ourPrice
    })).sort((a, b) => a.price - b.price);
  }, [comparisonData]);

  // Process parity data for chart
  const parityChartData = useMemo(() => {
    if (!parityData?.reports) return [];

    return parityData.reports.map(report => ({
      date: format(new Date(report.date), 'MMM dd'),
      ourPrice: report.ourPrice,
      competitorPrice: report.competitorPrice,
      difference: report.competitorPrice - report.ourPrice,
      parity: report.parityPercentage
    }));
  }, [parityData]);

  const getPriceColor = (percentage: number) => {
    if (percentage < -10) return 'text-green-600'; // Much cheaper
    if (percentage < 0) return 'text-blue-600'; // Slightly cheaper
    if (percentage < 10) return 'text-yellow-600'; // Competitive
    if (percentage < 20) return 'text-orange-600'; // Slightly expensive
    return 'text-red-600'; // Much expensive
  };

  const getParityStatus = (percentage: number) => {
    if (percentage < -10) return 'Much Lower';
    if (percentage < 0) return 'Lower';
    if (percentage < 10) return 'Competitive';
    if (percentage < 20) return 'Higher';
    return 'Much Higher';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rate Comparison</h1>
          <p className="text-gray-600">
            Compare your rates with competitors and analyze market positioning
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-md ${
              viewMode === 'table' ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'
            }`}
          >
            📋 Table View
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className={`px-4 py-2 rounded-md ${
              viewMode === 'chart' ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'
            }`}
          >
            📊 Chart View
          </button>
          <button
            onClick={() => setViewMode('parity')}
            className={`px-4 py-2 rounded-md ${
              viewMode === 'parity' ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'
            }`}
          >
            📈 Parity Report
          </button>
        </div>
      </div>

      {/* Date Selection */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Comparison Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Accommodation
            </label>
            <select
              value={selectedAccommodation}
              onChange={(e) => setSelectedAccommodation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="default-accommodation">Default Accommodation</option>
              {/* Add more accommodation options here */}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-in Date
            </label>
            <input
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-out Date
            </label>
            <input
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              min={checkInDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Price Comparison Table</h3>
            <p className="text-sm text-gray-600">
              Comparison for {format(new Date(checkInDate), 'PPP')} to {format(new Date(checkOutDate), 'PPP')}
            </p>
          </div>

          {comparisonLoading ? (
            <div className="p-8 text-center">Loading comparison data...</div>
          ) : processedComparison.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Competitor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Platform
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Difference
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Our price row */}
                  <tr className="bg-blue-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-900">Your Property</div>
                      <div className="text-sm text-blue-600">(Base Price)</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        Direct
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900">
                      R$ 250.00
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                      -
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        Reference
                      </span>
                    </td>
                  </tr>

                  {/* Competitors */}
                  {processedComparison.map((comp, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{comp.competitorName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded capitalize">
                          {comp.platform}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        R$ {comp.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={comp.isCheaper ? 'text-green-600' : 'text-red-600'}>
                          {comp.isCheaper ? '-' : '+'}R$ {Math.abs(comp.difference).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getPriceColor(comp.percentage)} bg-opacity-10`}>
                          {getParityStatus(comp.percentage)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              No comparison data available. Make sure you have competitors configured and try different dates.
            </div>
          )}
        </div>
      )}

      {viewMode === 'chart' && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Price Comparison Chart</h3>

          {comparisonLoading ? (
            <div className="p-8 text-center">Loading chart data...</div>
          ) : processedComparison.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={processedComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="competitorName" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Price']}
                  labelFormatter={(label) => `Competitor: ${label}`}
                />
                <Bar dataKey="price" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="p-8 text-center text-gray-500">
              No chart data available.
            </div>
          )}
        </div>
      )}

      {viewMode === 'parity' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Rate Parity Report</h3>
            <p className="text-sm text-gray-600 mb-4">
              Historical price parity analysis showing how your rates compare to competitors over time
            </p>

            {parityLoading ? (
              <div className="p-8 text-center">Loading parity data...</div>
            ) : parityChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={parityChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="price" orientation="left" />
                  <YAxis yAxisId="parity" orientation="right" />
                  <Tooltip
                    formatter={(value: number, name: string) => {
                      if (name === 'parity') return [`${value.toFixed(1)}%`, 'Parity'];
                      return [`R$ ${value.toFixed(2)}`, name === 'ourPrice' ? 'Your Price' : 'Competitor Price'];
                    }}
                  />
                  <Line yAxisId="price" type="monotone" dataKey="ourPrice" stroke="#8884d8" strokeWidth={2} name="ourPrice" />
                  <Line yAxisId="price" type="monotone" dataKey="competitorPrice" stroke="#82ca9d" strokeWidth={2} name="competitorPrice" />
                  <Line yAxisId="parity" type="monotone" dataKey="parity" stroke="#ff7300" strokeWidth={2} name="parity" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="p-8 text-center text-gray-500">
                No parity data available. Configure competitors and collect price history first.
              </div>
            )}
          </div>

          {/* Parity Statistics */}
          {parityChartData.length > 0 && (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Average Parity</h4>
                <div className="text-2xl font-bold">
                  {parityChartData.reduce((sum, item) => sum + item.parity, 0) / parityChartData.length > 0 ? '+' : ''}
                  {(parityChartData.reduce((sum, item) => sum + item.parity, 0) / parityChartData.length).toFixed(1)}%
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Best Position</h4>
                <div className="text-2xl font-bold text-green-600">
                  {Math.min(...parityChartData.map(item => item.parity)).toFixed(1)}%
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Worst Position</h4>
                <div className="text-2xl font-bold text-red-600">
                  {Math.max(...parityChartData.map(item => item.parity)).toFixed(1)}%
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RateComparison;