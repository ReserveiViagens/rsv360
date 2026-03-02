'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useBidMutation } from '@/hooks/useAuctions';
import { Auction } from '@/hooks/useAuctions';
import { Gavel, AlertCircle } from 'lucide-react';

interface BidFormProps {
  auction: Auction;
  onBidPlaced?: () => void;
  token?: string | null;
}

export function BidForm({ auction, onBidPlaced, token }: BidFormProps) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { placeBid, loading } = useBidMutation();
  const isLoggedIn = !!token;

  const minBid = auction.current_price + auction.min_increment;
  const loginUrl = `/login?redirect=${encodeURIComponent(`/leiloes/${auction.id}`)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) return;
    setError(null);

    const bidAmount = parseFloat(amount);
    
    if (isNaN(bidAmount) || bidAmount < minBid) {
      setError(`O lance mínimo é R$ ${minBid.toFixed(2)}`);
      return;
    }

    try {
      await placeBid(auction.id, bidAmount, token ?? undefined);
      setAmount('');
      if (onBidPlaced) {
        onBidPlaced();
      }
    } catch (err) {
      // Error já é tratado pelo hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isLoggedIn ? (
        <>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Valor do Lance
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={minBid}
                step="0.01"
                placeholder={minBid.toFixed(2)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Lance mínimo: R$ {minBid.toFixed(2)} (Preço atual: R$ {auction.current_price.toFixed(2)} + Incremento: R$ {auction.min_increment.toFixed(2)})
            </p>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Gavel className="w-5 h-5" />
            <span>{loading ? 'Processando...' : 'Fazer Lance'}</span>
          </button>
        </>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center space-y-3">
          <p className="text-amber-800 font-medium">Faça login para participar deste leilão</p>
          <Link
            href={loginUrl}
            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Fazer login
          </Link>
        </div>
      )}
    </form>
  );
}
