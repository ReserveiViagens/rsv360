'use client';

import React, { useState } from 'react';
import { MapPin, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getToken } from '@/lib/auth';
import type { AuctionExample } from '@/lib/auction-examples';

interface AuctionCardGridProps {
  example: AuctionExample;
}

export const AuctionCardGrid = React.memo(function AuctionCardGrid({ example }: AuctionCardGridProps) {
  const [imgIndex, setImgIndex] = useState(0);
  const [imgError, setImgError] = useState(false);
  const images = example.images.filter(Boolean);
  const mainImage = images[imgIndex] || images[0];
  const hasImage = mainImage && !imgError;

  const prevImg = () => {
    setImgError(false);
    setImgIndex((i) => (i > 0 ? i - 1 : images.length - 1));
  };
  const nextImg = () => {
    setImgError(false);
    setImgIndex((i) => (i < images.length - 1 ? i + 1 : 0));
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 flex flex-col">
      {/* Imagem */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        {hasImage ? (
          <Image
            src={mainImage}
            alt={example.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xl font-bold">
            {example.title}
          </div>
        )}
        {hasImage && images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                prevImg();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white"
              aria-label="Imagem anterior"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                nextImg();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white"
              aria-label="Próxima imagem"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{example.title}</h3>
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
          <span>{example.location}</span>
        </div>
        <div className="flex items-center gap-1 mb-4">
          <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-gray-900">{example.rating.toFixed(1)}</span>
          <span className="text-gray-500">/5</span>
          <span className="text-gray-500 text-sm ml-1">({example.reviewCount}+ avaliações)</span>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-500">Preço por noite</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              R$ {example.pricePerNight.toLocaleString('pt-BR')}
            </span>
            {example.originalPrice && example.originalPrice > example.pricePerNight && (
              <span className="text-sm text-gray-400 line-through">
                R$ {example.originalPrice.toLocaleString('pt-BR')}
              </span>
            )}
          </div>
        </div>

        <div className="mt-auto flex flex-col sm:flex-row gap-2">
          <Link
            href={
              getToken()
                ? `/leiloes?hotel=${example.hotelId}`
                : `/login?redirect=${encodeURIComponent(`/leiloes?hotel=${example.hotelId}`)}`
            }
            className="flex-1 inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Participar do Leilão
          </Link>
          <span className="inline-flex items-center justify-center bg-amber-100 text-amber-800 font-medium py-3 px-4 rounded-lg border border-amber-200">
            12x sem juros
          </span>
        </div>
      </div>
    </div>
  );
});
