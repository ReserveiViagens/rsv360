'use client';

'use client';

import { Bid } from '@/hooks/useAuctions';
import { Clock, User, TrendingUp } from 'lucide-react';

interface BidHistoryProps {
  bids: Bid[];
}

export function BidHistory({ bids }: BidHistoryProps) {
  if (bids.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhum lance ainda. Seja o primeiro!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Lances</h3>
      {bids.map((bid) => (
        <div
          key={bid.id}
          className={`flex items-center justify-between p-4 rounded-lg border ${
            bid.status === 'accepted'
              ? 'bg-green-50 border-green-200'
              : bid.status === 'outbid'
              ? 'bg-gray-50 border-gray-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${
              bid.status === 'accepted'
                ? 'bg-green-100 text-green-600'
                : bid.status === 'outbid'
                ? 'bg-gray-100 text-gray-600'
                : 'bg-yellow-100 text-yellow-600'
            }`}>
              {bid.status === 'accepted' ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                R$ {bid.amount.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">
                {bid.customer_name || 'Anônimo'}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>
              {new Date(bid.created_at).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
