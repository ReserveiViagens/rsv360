'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface AuctionTimerProps {
  endDate: string | Date;
  onExpire?: () => void;
}

export function AuctionTimer({ endDate, onExpire }: AuctionTimerProps) {
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
        Leilão Finalizado
      </div>
    );
  }

  // Determinar cor baseado no tempo restante
  const totalHours = timeRemaining.days * 24 + timeRemaining.hours;
  const isCritical = totalHours < 1;
  const isWarning = totalHours < 6;
  
  const bgColor = isCritical ? 'bg-red-100 border-red-300' : isWarning ? 'bg-yellow-50 border-yellow-300' : 'bg-green-50 border-green-300';
  const textColor = isCritical ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-green-600';
  const pulseClass = isCritical ? 'animate-pulse' : '';

  return (
    <div className={`flex items-center space-x-3 ${bgColor} border-2 rounded-lg p-3 ${pulseClass}`}>
      <Clock className={`w-5 h-5 ${textColor}`} />
      <div className="flex items-center space-x-1">
        {timeRemaining.days > 0 && (
          <>
            <div className="text-center">
              <div className={`text-xl font-bold ${textColor}`}>{String(timeRemaining.days).padStart(2, '0')}</div>
              <div className="text-xs text-gray-600">d</div>
            </div>
            <span className={`${textColor} font-bold mx-1`}>:</span>
          </>
        )}
        <div className="text-center">
          <div className={`text-xl font-bold ${textColor}`}>{String(timeRemaining.hours).padStart(2, '0')}</div>
          <div className="text-xs text-gray-600">h</div>
        </div>
        <span className={`${textColor} font-bold mx-1`}>:</span>
        <div className="text-center">
          <div className={`text-xl font-bold ${textColor}`}>{String(timeRemaining.minutes).padStart(2, '0')}</div>
          <div className="text-xs text-gray-600">m</div>
        </div>
        <span className={`${textColor} font-bold mx-1`}>:</span>
        <div className="text-center">
          <div className={`text-xl font-bold ${textColor}`}>{String(timeRemaining.seconds).padStart(2, '0')}</div>
          <div className="text-xs text-gray-600">s</div>
        </div>
      </div>
    </div>
  );
}
