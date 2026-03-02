'use client';

import { useParams } from 'next/navigation';
import { useAuction, useBids } from '@/hooks/useAuctions';
import { getToken } from '@/lib/auth';
import { AuctionTimer } from '@/components/auctions/AuctionTimer';
import { BidForm } from '@/components/auctions/BidForm';
import { BidHistory } from '@/components/auctions/BidHistory';
import { AuctionLiveUpdates } from '@/components/auctions/AuctionLiveUpdates';
import { MapPin, Users, Gavel, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ErrorBoundary } from '@/components/ui/error-boundary';

function AuctionDetailsContent() {
  const params = useParams();
  const auctionId = params?.id as string;
  const { auction, loading: auctionLoading, error: auctionError } = useAuction(auctionId);
  const { bids, loading: bidsLoading, error: bidsError } = useBids(auctionId);
  const [refreshKey, setRefreshKey] = useState(0);

  // Atualizar quando receber atualizações via WebSocket
  const handleBidUpdate = () => {
    setRefreshKey((prev) => prev + 1);
    // Recarregar dados
    window.location.reload();
  };

  if (auctionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Carregando leilão...</p>
        </div>
      </div>
    );
  }

  if (auctionError || !auction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Leilão não encontrado</h2>
          <p className="text-gray-600 mb-4">O leilão que você está procurando não existe ou foi removido.</p>
          <Link
            href="/leiloes"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar para Leilões
          </Link>
        </div>
      </div>
    );
  }

  const isActive = auction.status === 'active';
  const timeRemaining = new Date(auction.end_date).getTime() - new Date().getTime();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* WebSocket Updates */}
      {isActive && <AuctionLiveUpdates auctionId={auction.id} onBidUpdate={handleBidUpdate} />}

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/leiloes"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Leilões
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{auction.title}</h1>
          {auction.description && (
            <p className="text-gray-600 mt-2">{auction.description}</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Conteúdo Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timer */}
            {isActive && timeRemaining > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <AuctionTimer endDate={auction.end_date} />
              </div>
            )}

            {/* Informações do Leilão */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações do Leilão</h2>
              <div className="space-y-4">
                {auction.enterprise_name && (
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <div className="font-semibold text-gray-900">{auction.enterprise_name}</div>
                      {auction.property_name && (
                        <div className="text-sm text-gray-600">{auction.property_name}</div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Gavel className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <div className="font-semibold text-gray-900">{auction.total_bids || 0} lances</div>
                      <div className="text-sm text-gray-600">Total de lances</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">R$ {auction.min_increment.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">Incremento mínimo</div>
                  </div>
                </div>

                {auction.reserve_price && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="text-sm font-semibold text-yellow-800">Preço de Reserva</div>
                    <div className="text-lg font-bold text-yellow-900">R$ {auction.reserve_price.toFixed(2)}</div>
                    <div className="text-xs text-yellow-700 mt-1">
                      O leilão só será finalizado se atingir este valor
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Histórico de Lances */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              {bidsLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Carregando lances...</p>
                </div>
              ) : bidsError ? (
                <div className="text-center py-8 text-red-600">
                  Erro ao carregar lances: {bidsError}
                </div>
              ) : (
                <BidHistory bids={bids} />
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              {/* Preço Atual */}
              <div className="mb-6">
                <div className="text-sm text-gray-600 mb-2">Preço Atual</div>
                <div className="text-4xl font-bold text-blue-600">
                  R$ {auction.current_price.toFixed(2)}
                </div>
                {auction.start_price < auction.current_price && (
                  <div className="text-sm text-gray-500 line-through mt-1">
                    Preço inicial: R$ {auction.start_price.toFixed(2)}
                  </div>
                )}
              </div>

              {/* Formulário de Lance */}
              {isActive && timeRemaining > 0 ? (
                <BidForm auction={auction} onBidPlaced={handleBidUpdate} token={getToken()} />
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-600 mb-4">
                    {auction.status === 'finished' ? 'Leilão Finalizado' : 'Leilão não está ativo'}
                  </div>
                  {auction.winner_id && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="text-sm font-semibold text-green-800">Vencedor</div>
                      <div className="text-lg font-bold text-green-900 mt-1">
                        Lance vencedor: R$ {auction.current_price.toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuctionDetailsPage() {
  return (
    <ErrorBoundary>
      <AuctionDetailsContent />
    </ErrorBoundary>
  );
}
