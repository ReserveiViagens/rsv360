'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface FlashDealTimerProps {
  endDate: string | Date;
  onExpire?: () => void;
}

export function FlashDealTimer({ endDate, onExpire }: FlashDealTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const end = new Date(endDate).getTime();
      const now = new Date().getTime();
      const difference = end - now;

      if (difference <= 0) {
        setTimeRemaining(null);
        if (onExpire) {
          onExpire();
        }
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [endDate, onExpire]);

  if (!timeRemaining) {
    return (
      <div className="flex items-center justify-center text-red-600 font-semibold">
        <Clock className="w-4 h-4 mr-2" />
        Oferta Expirada
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4 bg-red-50 border border-red-200 rounded-lg p-3">
      <Clock className="w-5 h-5 text-red-600" />
      <div className="flex items-center space-x-2">
        {timeRemaining.days > 0 && (
          <>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{String(timeRemaining.days).padStart(2, '0')}</div>
              <div className="text-xs text-gray-600">dias</div>
            </div>
            <span className="text-red-600 font-bold">:</span>
          </>
        )}
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{String(timeRemaining.hours).padStart(2, '0')}</div>
          <div className="text-xs text-gray-600">horas</div>
        </div>
        <span className="text-red-600 font-bold">:</span>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{String(timeRemaining.minutes).padStart(2, '0')}</div>
          <div className="text-xs text-gray-600">min</div>
        </div>
        <span className="text-red-600 font-bold">:</span>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{String(timeRemaining.seconds).padStart(2, '0')}</div>
          <div className="text-xs text-gray-600">seg</div>
        </div>
      </div>
    </div>
  );
}
