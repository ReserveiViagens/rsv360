/**
 * ✅ FASE 6.5: PointsDisplay Component
 * 
 * Display de pontos com animações
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Star, TrendingUp, Award, Zap } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion'; // TODO: Instalar framer-motion

interface Props {
  hostId: number;
  showAnimation?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PointsDisplay({ hostId, showAnimation = true, size = 'md' }: Props) {
  const [points, setPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [recentChange, setRecentChange] = useState<number | null>(null);

  useEffect(() => {
    loadPoints();
  }, [hostId]);

  const loadPoints = async () => {
    try {
      const response = await fetch(`/api/quality/incentives/${hostId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const newPoints = data.points || 0;
          
          if (showAnimation && newPoints !== points && points > 0) {
            const change = newPoints - points;
            setRecentChange(change);
            setTimeout(() => setRecentChange(null), 3000);
          }
          
          setPoints(newPoints);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar pontos:', error);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  };

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 bg-gray-200 animate-pulse rounded" />
        <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Star
          className={`${iconSizes[size]} text-yellow-500 fill-yellow-500`}
        />
        {showAnimation && recentChange && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap animate-pulse">
            <span
              className={`text-sm font-bold ${
                recentChange > 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {recentChange > 0 ? '+' : ''}
              {recentChange}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <div
          key={points}
          className={`font-bold ${sizeClasses[size]} text-gray-900 transition-all`}
        >
          {points.toLocaleString('pt-BR')}
        </div>
        <span className="text-xs text-gray-500">pontos</span>
      </div>

      {/* Badges rápidos */}
      <div className="flex items-center gap-1 ml-2">
        {points >= 1000 && (
          <div className="relative group">
            <Award className="h-5 w-5 text-purple-500" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
              <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                Bronze Badge
              </div>
            </div>
          </div>
        )}
        {points >= 5000 && (
          <div className="relative group">
            <Zap className="h-5 w-5 text-blue-500" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
              <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                Silver Badge
              </div>
            </div>
          </div>
        )}
        {points >= 10000 && (
          <div className="relative group">
            <TrendingUp className="h-5 w-5 text-yellow-500" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
              <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                Gold Badge
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

