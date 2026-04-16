import React, { useState } from 'react';
import { format } from 'date-fns';

// Import pricing hooks
import {
  useCompetitors,
  useCreateCompetitor,
  useUpdateCompetitor,
  useDeleteCompetitor,
  useScrapeOta,
  useCompetitorRates,
  useCompetitorComparison
} from '../hooks/usePricing';

import type { Competitor } from '../types';

interface CompetitorFormData {
  competitorName: string;
  platform: Competitor['platform'];
  externalUrl: string;
  externalId: string;
  location: string;
  starRating: number;
  isActive: boolean;
}

const CompetitorsView: React.FC = () => {
  const [filters, setFilters] = useState({
    platform: '',
    isActive: '',
    page: 1,
    limit: 10
  });

  const [showForm, setShowForm] = useState(false);
  const [editingCompetitor, setEditingCompetitor] = useState<Competitor | null>(null);
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);
  const [showRatesModal, setShowRatesModal] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [checkInDate, setCheckInDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [checkOutDate, setCheckOutDate] = useState(format(new Date(Date.now() + 86400000), 'yyyy-MM-dd')); // Tomorrow

  const [formData, setFormData] = useState<CompetitorFormData>({
    competitorName: '',
    platform: 'booking',
    externalUrl: '',
    externalId: '',
    location: '',
    starRating: 0,
    isActive: true
  });

  // Fetch competitors with filters
  const { data: competitorsResponse, isLoading, refetch } = useCompetitors(filters);
  const competitors = competitorsResponse?.competitors || [];
  const totalPages = competitorsResponse?.totalPages || 1;

  // Fetch competitor rates when modal is open
  const { data: competitorRates, isLoading: ratesLoading } = useCompetitorRates(
    selectedCompetitor?.id || '',
    { limit: 20 }
  );

  // Fetch competitor comparison
  const { data: comparisonData, isLoading: comparisonLoading } = useCompetitorComparison(
    'default-accommodation',
    checkInDate,
    checkOutDate
  );

  // Mutations
  const createCompetitorMutation = useCreateCompetitor();
  const updateCompetitorMutation = useUpdateCompetitor();
  const deleteCompetitorMutation = useDeleteCompetitor();
  const scrapeOtaMutation = useScrapeOta();

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCompetitor) {
        await updateCompetitorMutation.mutateAsync({
          id: editingCompetitor.id,
          data: formData
        });
      } else {
        await createCompetitorMutation.mutateAsync(formData);
      }

      setShowForm(false);
      setEditingCompetitor(null);
      resetForm();
      refetch();
    } catch (error) {
      console.error('Error saving competitor:', error);
    }
  };

  const handleEdit = (competitor: Competitor) => {
    setEditingCompetitor(competitor);
    setFormData({
      competitorName: competitor.competitorName,
      platform: competitor.platform,
      externalUrl: competitor.externalUrl || '',
      externalId: competitor.externalId || '',
      location: competitor.location || '',
      starRating: competitor.starRating || 0,
      isActive: competitor.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this competitor?')) {
      try {
        await deleteCompetitorMutation.mutateAsync(id);
        refetch();
      } catch (error) {
        console.error('Error deleting competitor:', error);
      }
    }
  };

  const handleScrapePrices = async (competitorId: string) => {
    try {
      await scrapeOtaMutation.mutateAsync({
        competitorId,
        checkIn: checkInDate,
        checkOut: checkOutDate
      });
      alert('Price scraping completed successfully!');
    } catch (error) {
      console.error('Error scraping prices:', error);
      alert('Error scraping prices. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      competitorName: '',
      platform: 'booking',
      externalUrl: '',
      externalId: '',
      location: '',
      starRating: 0,
      isActive: true
    });
  };

  const openCreateForm = () => {
    setEditingCompetitor(null);
    resetForm();
    setShowForm(true);
  };

  const openRatesModal = (competitor: Competitor) => {
    setSelectedCompetitor(competitor);
    setShowRatesModal(true);
  };

  const openComparisonModal = () => {
    setShowComparisonModal(true);
  };

  const getPlatformColor = (platform: Competitor['platform']) => {
    switch (platform) {
      case 'booking': return 'bg-blue-100 text-blue-800';
      case 'expedia': return 'bg-green-100 text-green-800';
      case 'airbnb': return 'bg-red-100 text-red-800';
      case 'decolar': return 'bg-purple-100 text-purple-800';
      case 'hotels_com': return 'bg-yellow-100 text-yellow-800';
      case 'trivago': return 'bg-indigo-100 text-indigo-800';
      case 'kayak': return 'bg-pink-100 text-pink-800';
      case 'google_hotels': return 'bg-orange-100 text-orange-800';
      case 'direct': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Competitors</h1>
          <p className="text-gray-600">
            Monitor competitor pricing and scrape OTA rates
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openComparisonModal}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            📊 Compare Prices
          </button>
          <button
            onClick={openCreateForm}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + Add Competitor
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Platform
            </label>
            <select
              value={filters.platform}
              onChange={(e) => handleFilterChange('platform', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Platforms</option>
              <option value="booking">Booking.com</option>
              <option value="expedia">Expedia</option>
              <option value="airbnb">Airbnb</option>
              <option value="decolar">Decolar</option>
              <option value="hotels_com">Hotels.com</option>
              <option value="trivago">Trivago</option>
              <option value="kayak">Kayak</option>
              <option value="google_hotels">Google Hotels</option>
              <option value="direct">Direct</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.isActive}
              onChange={(e) => handleFilterChange('isActive', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
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

      {/* Competitors List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">
            Competitors ({competitorsResponse?.total || 0})
          </h3>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">Loading competitors...</div>
        ) : competitors.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No competitors found. Add your first competitor to start monitoring prices.
          </div>
        ) : (
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
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Scraped
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {competitors.map((competitor) => (
                  <tr key={competitor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{competitor.competitorName}</div>
                      {competitor.externalId && (
                        <div className="text-sm text-gray-500">ID: {competitor.externalId}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getPlatformColor(competitor.platform)}`}>
                        {competitor.platform.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {competitor.location || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {competitor.starRating ? (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">{renderStars(competitor.starRating)}</span>
                          <span className="text-xs text-gray-500">({competitor.starRating})</span>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {competitor.lastScrapedAt
                        ? format(new Date(competitor.lastScrapedAt), 'MMM dd, HH:mm')
                        : 'Never'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        competitor.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {competitor.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openRatesModal(competitor)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Rates
                      </button>
                      <button
                        onClick={() => handleScrapePrices(competitor.id)}
                        disabled={scrapeOtaMutation.isPending}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                      >
                        {scrapeOtaMutation.isPending ? 'Scraping...' : 'Scrape'}
                      </button>
                      <button
                        onClick={() => handleEdit(competitor)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(competitor.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

      {/* Rates Modal */}
      {showRatesModal && selectedCompetitor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                Price History - {selectedCompetitor.competitorName}
              </h2>
              <button
                onClick={() => setShowRatesModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {ratesLoading ? (
              <div className="text-center py-8">Loading price history...</div>
            ) : competitorRates?.rates?.length ? (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Currency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {competitorRates.rates.map((rate, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm">{format(new Date(rate.scrapedAt), 'PPP')}</td>
                          <td className="px-4 py-2 text-sm font-medium">R$ {rate.price}</td>
                          <td className="px-4 py-2 text-sm">{rate.currency}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No price history available. Try scraping prices first.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      {showComparisonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Price Comparison</h2>
              <button
                onClick={() => setShowComparisonModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 flex gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  min={checkInDate}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            {comparisonLoading ? (
              <div className="text-center py-8">Loading comparison data...</div>
            ) : comparisonData?.competitors?.length ? (
              <div className="space-y-4">
                <div className="grid gap-4">
                  {comparisonData.competitors.map((comp, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{comp.competitorName}</h3>
                          <p className="text-sm text-gray-600">{comp.platform}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            R$ {comp.price}
                          </div>
                          <div className="text-sm text-gray-500">
                            {comp.currency}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No comparison data available for the selected dates.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {editingCompetitor ? 'Edit Competitor' : 'Add New Competitor'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Competitor Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.competitorName}
                    onChange={(e) => setFormData(prev => ({ ...prev, competitorName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Hotel name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Platform *
                  </label>
                  <select
                    required
                    value={formData.platform}
                    onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value as Competitor['platform'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="booking">Booking.com</option>
                    <option value="expedia">Expedia</option>
                    <option value="airbnb">Airbnb</option>
                    <option value="decolar">Decolar</option>
                    <option value="hotels_com">Hotels.com</option>
                    <option value="trivago">Trivago</option>
                    <option value="kayak">Kayak</option>
                    <option value="google_hotels">Google Hotels</option>
                    <option value="direct">Direct</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    External URL
                  </label>
                  <input
                    type="url"
                    value={formData.externalUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, externalUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    External ID
                  </label>
                  <input
                    type="text"
                    value={formData.externalId}
                    onChange={(e) => setFormData(prev => ({ ...prev, externalId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Platform-specific ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="City, State"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Star Rating
                  </label>
                  <select
                    value={formData.starRating}
                    onChange={(e) => setFormData(prev => ({ ...prev, starRating: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>Not rated</option>
                    <option value={1}>1 star</option>
                    <option value={2}>2 stars</option>
                    <option value={3}>3 stars</option>
                    <option value={4}>4 stars</option>
                    <option value={5}>5 stars</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active Competitor
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createCompetitorMutation.isPending || updateCompetitorMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createCompetitorMutation.isPending || updateCompetitorMutation.isPending
                    ? 'Saving...'
                    : editingCompetitor ? 'Update Competitor' : 'Add Competitor'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetitorsView;