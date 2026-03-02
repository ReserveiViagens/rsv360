'use client';

import React from 'react';
import { Auction } from '@/hooks/useAuctions';
import { HotelWithAuction } from '@/hooks/useHotels';
import { MapPin, Users, Star, Wifi, Car, Waves } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { AuctionTimer } from './AuctionTimer';

interface AuctionCardProps {
  auction: Auction;
  hotel?: HotelWithAuction;
}

export const AuctionCard = React.memo(function AuctionCard({ auction, hotel }: AuctionCardProps) {
  const timeRemaining = new Date(auction.end_date).getTime() - new Date().getTime();
  const isActive = auction.status === 'active' && timeRemaining > 0;
  
  // Dados do hotel ou do leilão
  const images = hotel?.images || [];
  const hotelImage = images.length > 0 ? images[0] : '/placeholder-hotel.jpg';
  const stars = hotel?.stars || 0;
  const rating = hotel?.rating || 0;
  const reviewCount = hotel?.reviewCount || 450;
  const amenities = hotel?.features || [];
  const location = hotel?.location || auction.enterprise_name || 'Caldas Novas';
  const participants = auction.total_bids || auction.auction_participants || 0;
  
  // Preços
  const basePrice = hotel?.price || auction.start_price;
  const currentPrice = auction.current_price;
  const savings = basePrice ? basePrice - currentPrice : 0;

  // Amenities icons mapping
  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase();
    if (lower.includes('pool') || lower.includes('piscina')) return <Waves className="w-4 h-4" />;
    if (lower.includes('wifi') || lower.includes('internet')) return <Wifi className="w-4 h-4" />;
    if (lower.includes('parking') || lower.includes('estacionamento')) return <Car className="w-4 h-4" />;
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 border-transparent hover:border-green-200 group">
      {/* Imagem */}
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500">
        {images.length > 0 ? (
          <Image
            src={hotelImage}
            alt={auction.title || hotel?.title || 'Hotel'}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
            {auction.accommodation_name || auction.title}
          </div>
        )}
        
        {/* Badge AO VIVO */}
        {isActive && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse">
            AO VIVO
          </div>
        )}

        {/* Badge de Economia */}
        {savings > 0 && (
          <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            Economia: R$ {savings.toFixed(0)}
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-5">
        {/* Título e Localização */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
            {auction.title || hotel?.title || 'Acomodação'}
          </h3>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{location}</span>
          </div>
        </div>

        {/* Rating e Reviews */}
        {(stars > 0 || rating > 0) && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(stars || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {rating.toFixed(1) || stars.toFixed(1)}
            </span>
            <span className="text-sm text-gray-600">
              ({reviewCount}+ reviews)
            </span>
          </div>
        )}

        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {amenities.slice(0, 3).map((amenity, index) => {
              const icon = getAmenityIcon(amenity);
              return (
                <div
                  key={index}
                  className="flex items-center gap-1 text-gray-600 text-sm"
                  title={amenity}
                >
                  {icon}
                  <span className="hidden sm:inline">{amenity}</span>
                </div>
              );
            })}
            {amenities.length > 3 && (
              <span className="text-sm text-gray-500">+{amenities.length - 3}</span>
            )}
          </div>
        )}

        {/* Timer e Participantes */}
        {isActive && (
          <div className="mb-4 space-y-2">
            <AuctionTimer endDate={auction.end_date} />
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-600">
                <Users className="w-4 h-4 mr-1" />
                <span className="font-semibold">{participants}</span>
                <span className="ml-1">participantes</span>
              </div>
              <div className="text-gray-600">
                {auction.total_bids || 0} lances
              </div>
            </div>
          </div>
        )}

        {/* Preços */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold text-green-600">
              R$ {currentPrice.toFixed(2)}
            </span>
            {basePrice && basePrice > currentPrice && (
              <span className="text-sm text-gray-500 line-through">
                R$ {basePrice.toFixed(2)}
              </span>
            )}
          </div>
          {basePrice && basePrice > currentPrice && (
            <div className="text-xs text-green-600 font-medium">
              Economia de R$ {savings.toFixed(2)} por noite
            </div>
          )}
          {auction.min_increment > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              Incremento mínimo: R$ {auction.min_increment.toFixed(2)}
            </div>
          )}
        </div>

        {/* Botão */}
        <Link
          href={`/leiloes/${auction.id}`}
          className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-3 px-4 rounded-lg transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
        >
          {isActive ? 'Place Bid' : 'Ver Detalhes'}
        </Link>
      </div>
    </div>
  );
});
