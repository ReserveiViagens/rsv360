'use client';

import React from 'react';
import { Auction } from '@/hooks/useAuctions';
import { HotelWithAuction } from '@/hooks/useHotels';
import { MapPin, Star, Wifi, Car, Waves } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { AuctionTimer } from './AuctionTimer';

interface AuctionCardHorizontalProps {
  auction: Auction;
  hotel?: HotelWithAuction;
}

export const AuctionCardHorizontal = React.memo(function AuctionCardHorizontal({ auction, hotel }: AuctionCardHorizontalProps) {
  const timeRemaining = new Date(auction.end_date).getTime() - new Date().getTime();
  const isActive = auction.status === 'active' && timeRemaining > 0;
  
  const images = hotel?.images || [];
  const hotelImage = images.length > 0 ? images[0] : '/placeholder-hotel.jpg';
  const stars = hotel?.stars || 0;
  const rating = hotel?.rating || 0;
  const reviewCount = hotel?.reviewCount || 450;
  const amenities = hotel?.features || [];
  const location = hotel?.location || auction.enterprise_name || 'Caldas Novas';
  const participants = auction.total_bids || auction.auction_participants || 0;
  
  const basePriceRaw = hotel?.price ?? auction.start_price;
  const currentPriceRaw = auction.current_price ?? auction.start_price ?? basePriceRaw;
  const formatPrice = (val: unknown): string => {
    if (val == null) return '0,00';
    const n = typeof val === 'number' ? val : Number(val);
    return !isNaN(n) ? n.toFixed(2) : '0,00';
  };
  const basePriceNum = typeof basePriceRaw === 'number' && !isNaN(basePriceRaw) ? basePriceRaw : (Number(basePriceRaw) || 0);
  const currentPriceNum = typeof currentPriceRaw === 'number' && !isNaN(currentPriceRaw) ? currentPriceRaw : (Number(currentPriceRaw) || basePriceNum || 0);

  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase();
    if (lower.includes('pool') || lower.includes('piscina')) return <Waves className="w-5 h-5" />;
    if (lower.includes('wifi') || lower.includes('internet')) return <Wifi className="w-5 h-5" />;
    if (lower.includes('parking') || lower.includes('estacionamento')) return <Car className="w-5 h-5" />;
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200">
      <div className="flex flex-col md:flex-row">
        {/* Imagem Grande à Esquerda */}
        <div className="relative w-full md:w-80 h-64 md:h-auto flex-shrink-0">
          {images.length > 0 ? (
            <Image
              src={hotelImage}
              alt={auction.title || hotel?.title || 'Hotel'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 320px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xl font-bold">
              {auction.accommodation_name || auction.title}
            </div>
          )}
          
          {isActive && (
            <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
              AO VIVO
            </div>
          )}
        </div>

        {/* Conteúdo à Direita */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            {/* Título e Localização */}
            <div className="mb-3">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {auction.title || hotel?.title || 'Acomodação'}
              </h3>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{location}</span>
              </div>
            </div>

            {/* Rating e Reviews */}
            {(Number(stars) > 0 || Number(rating) > 0) && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-gray-900">Avaliação: {(Number(rating) || Number(stars) || 0).toFixed(1)}</span>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(Number(stars) || Number(rating) || 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">{reviewCount}+ avaliações</span>
              </div>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="flex items-center gap-4 mb-4">
                {amenities.slice(0, 3).map((amenity, index) => {
                  const icon = getAmenityIcon(amenity);
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-gray-600"
                      title={amenity}
                    >
                      {icon}
                      <span className="text-sm">{amenity}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Timer e Participantes */}
            {isActive && (
              <div className="mb-4">
                <AuctionTimer endDate={auction.end_date} />
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                  <div className="flex items-center">
                    <span className="font-semibold">{participants}</span>
                    <span className="ml-1">participantes</span>
                  </div>
                  <div>
                    {auction.total_bids || 0} lances
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Preços e Botão */}
          <div className="flex items-end justify-between pt-4 border-t border-gray-200">
            <div>
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-3xl font-bold text-green-600">
                  R$ {formatPrice(currentPriceRaw || basePriceRaw)}
                </span>
                <span className="text-sm text-gray-500">/noite (Lance)</span>
              </div>
              {basePriceNum > 0 && basePriceNum > currentPriceNum && (
                <div className="text-sm text-gray-500">
                  <span className="line-through">R$ {formatPrice(basePriceRaw)}</span>
                  <span className="ml-2">(Original)</span>
                </div>
              )}
            </div>
            <Link
              href={`/leiloes/${auction.id}`}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
            >
              Dar Lance
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
});
