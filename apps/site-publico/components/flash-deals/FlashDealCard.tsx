'use client';

import React from 'react';
import { FlashDeal } from '@/hooks/useFlashDeals';
import { HotelWithAuction } from '@/hooks/useHotels';
import { Clock, MapPin, ShoppingBag, Star, Wifi, Car, Waves, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { FlashDealTimer } from './FlashDealTimer';
import { DiscountProgressBar } from './DiscountProgressBar';

interface FlashDealCardProps {
  flashDeal: FlashDeal;
  hotel?: HotelWithAuction;
}

export const FlashDealCard = React.memo(function FlashDealCard({ flashDeal, hotel }: FlashDealCardProps) {
  const timeRemaining = new Date(flashDeal.end_date).getTime() - new Date().getTime();
  const isActive = flashDeal.status === 'active' && timeRemaining > 0;
  const unitsRemaining = flashDeal.units_available - flashDeal.units_sold;
  const discountPercent = Math.round(((flashDeal.original_price - flashDeal.current_price) / flashDeal.original_price) * 100);

  // Dados do hotel ou do flash deal
  const images = hotel?.images || [];
  const hotelImage = images.length > 0 ? images[0] : '/placeholder-hotel.jpg';
  const stars = hotel?.stars || 0;
  const rating = hotel?.rating || 0;
  const reviewCount = hotel?.reviewCount || 450;
  const amenities = hotel?.features || [];
  const location = hotel?.location || flashDeal.enterprise_name || 'Caldas Novas';

  // Amenities icons mapping
  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase();
    if (lower.includes('pool') || lower.includes('piscina')) return <Waves className="w-4 h-4" />;
    if (lower.includes('wifi') || lower.includes('internet')) return <Wifi className="w-4 h-4" />;
    if (lower.includes('parking') || lower.includes('estacionamento')) return <Car className="w-4 h-4" />;
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 border-red-200 hover:border-red-300 group">
      {/* Imagem */}
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-red-400 to-orange-500">
        {images.length > 0 ? (
          <Image
            src={hotelImage}
            alt={flashDeal.title || hotel?.title || 'Flash Deal'}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
            {flashDeal.accommodation_name || flashDeal.title}
          </div>
        )}
        
        {/* Badge de Desconto */}
        <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse flex items-center gap-1">
          <Zap className="w-4 h-4" />
          -{discountPercent}%
        </div>

        {/* Badge Flash Deal */}
        <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          FLASH DEAL
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-5">
        {/* Título e Localização */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
            {flashDeal.title || hotel?.title || 'Oferta Especial'}
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

        {/* Barra de Progresso de Desconto */}
        <div className="mb-4">
          <DiscountProgressBar
            currentDiscount={flashDeal.discount_percentage || discountPercent}
            maxDiscount={flashDeal.max_discount || 50}
          />
        </div>

        {/* Timer */}
        {isActive && (
          <div className="mb-4">
            <FlashDealTimer endDate={flashDeal.end_date} />
          </div>
        )}

        {/* Unidades Restantes */}
        <div className="flex items-center justify-between mb-4 text-sm">
          <div className="flex items-center text-gray-600">
            <ShoppingBag className="w-4 h-4 mr-1" />
            <span className="font-semibold">{unitsRemaining}</span>
            <span className="ml-1">unidades restantes</span>
          </div>
          <div className="text-red-600 font-semibold">
            {flashDeal.units_sold} vendidas
          </div>
        </div>

        {/* Preços */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold text-red-600">
              R$ {flashDeal.current_price.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500 line-through">
              R$ {flashDeal.original_price.toFixed(2)}
            </span>
          </div>
          <div className="text-xs text-red-600 font-medium">
            Economia de R$ {(flashDeal.original_price - flashDeal.current_price).toFixed(2)}
          </div>
        </div>

        {/* Botão */}
        <Link
          href={`/flash-deals/${flashDeal.id}`}
          className="block w-full bg-red-600 hover:bg-red-700 text-white text-center py-3 px-4 rounded-lg transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
        >
          {isActive && unitsRemaining > 0 ? 'Reservar Agora' : 'Ver Detalhes'}
        </Link>
      </div>
    </div>
  );
});
