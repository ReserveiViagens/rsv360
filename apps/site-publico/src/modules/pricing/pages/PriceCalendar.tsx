import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

// Import pricing hooks
import {
  usePriceHistory,
  useBulkPrices,
  useCalculatePrice
} from '../hooks/usePricing';

interface CalendarDay {
  date: Date;
  price: number | null;
  isCurrentMonth: boolean;
  isToday: boolean;
}

const PriceCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAccommodation, setSelectedAccommodation] = useState('default-accommodation');
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [manualPrice, setManualPrice] = useState('');

  // Fetch price history for the current month
  const startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');

  const { data: priceHistory, isLoading } = usePriceHistory(selectedAccommodation, {
    startDate,
    endDate
  });

  // Calculate bulk prices for the month
  const { data: bulkPrices, isLoading: bulkLoading } = useBulkPrices(
    selectedAccommodation,
    startDate,
    endDate
  );

  // Price calculation mutation
  const calculatePriceMutation = useCalculatePrice();

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = new Date(monthStart);
    calendarStart.setDate(calendarStart.getDate() - monthStart.getDay()); // Start from Sunday

    const calendarEnd = new Date(monthEnd);
    calendarEnd.setDate(calendarEnd.getDate() + (6 - monthEnd.getDay())); // End on Saturday

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return days.map(date => {
      // Find price for this date
      const priceEntry = priceHistory?.find(entry =>
        isSameDay(new Date(entry.date), date)
      );

      const bulkPriceEntry = bulkPrices?.find(entry =>
        isSameDay(new Date(entry.date), date)
      );

      const price = priceEntry?.price || bulkPriceEntry?.price || null;

      return {
        date,
        price,
        isCurrentMonth: isSameMonth(date, currentDate),
        isToday: isSameDay(date, new Date())
      };
    });
  }, [currentDate, priceHistory, bulkPrices]);

  const handlePrevMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const handleDayClick = (day: CalendarDay) => {
    if (!day.isCurrentMonth) return;

    setSelectedDate(day.date);
    setManualPrice(day.price?.toString() || '');
    setShowPriceModal(true);
  };

  const handlePriceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !manualPrice) return;

    try {
      await calculatePriceMutation.mutateAsync({
        accommodationId: selectedAccommodation,
        checkInDate: format(selectedDate, 'yyyy-MM-dd'),
        checkOutDate: format(selectedDate, 'yyyy-MM-dd'),
        guestCount: 2,
        overridePrice: parseFloat(manualPrice)
      });

      setShowPriceModal(false);
      setSelectedDate(null);
      setManualPrice('');
    } catch (error) {
      console.error('Error setting price:', error);
    }
  };

  const getPriceColor = (price: number | null) => {
    if (!price) return 'bg-gray-100 text-gray-400';

    if (price < 100) return 'bg-green-100 text-green-800';
    if (price < 200) return 'bg-yellow-100 text-yellow-800';
    if (price < 300) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Price Calendar</h1>
          <p className="text-gray-600">
            Visual calendar view of pricing across dates and accommodations
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedAccommodation}
            onChange={(e) => setSelectedAccommodation(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="default-accommodation">Default Accommodation</option>
            {/* Add more accommodation options here */}
          </select>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            ←
          </button>
          <h2 className="text-xl font-semibold">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            →
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Week day headers */}
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((day, index) => (
            <div
              key={index}
              onClick={() => handleDayClick(day)}
              className={`
                min-h-[80px] p-2 border border-gray-200 cursor-pointer hover:bg-gray-50
                ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'}
                ${day.isToday ? 'ring-2 ring-blue-500' : ''}
              `}
            >
              <div className="text-sm font-medium mb-1">
                {format(day.date, 'd')}
              </div>
              {day.price && (
                <div className={`text-xs px-1 py-0.5 rounded text-center ${getPriceColor(day.price)}`}>
                  R$ {day.price}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-3">Price Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 rounded"></div>
            <span className="text-sm">Low (&lt; R$ 100)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 rounded"></div>
            <span className="text-sm">Medium (R$ 100-199)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-100 rounded"></div>
            <span className="text-sm">High (R$ 200-299)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 rounded"></div>
            <span className="text-sm">Premium (&gt; R$ 300)</span>
          </div>
        </div>
      </div>

      {/* Price Setting Modal */}
      {showPriceModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Set Price for {format(selectedDate, 'PPP')}
              </h2>
              <button
                onClick={() => setShowPriceModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePriceSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (BRL)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={manualPrice}
                  onChange={(e) => setManualPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter price"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPriceModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={calculatePriceMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {calculatePriceMutation.isPending ? 'Setting...' : 'Set Price'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loading State */}
      {(isLoading || bulkLoading) && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-40">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p>Loading price data...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceCalendar;