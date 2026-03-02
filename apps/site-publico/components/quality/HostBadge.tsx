/**
 * ✅ COMPONENTE: HOST BADGE
 * Badge individual de host com animações e informações detalhadas
 * 
 * @module components/quality/HostBadge
 */

'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge as UIBadge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import { Trophy, Award, Star, Sparkles, Info } from 'lucide-react';

export interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon?: string;
  category: 'quality' | 'performance' | 'service' | 'loyalty' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  criteria?: Record<string, any>;
}

interface HostBadgeProps {
  badge: BadgeData;
  earned: boolean;
  progress?: number;
  earnedAt?: string;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  onClick?: () => void;
}

const rarityColors = {
  common: 'bg-gray-100 border-gray-300 text-gray-700',
  rare: 'bg-blue-100 border-blue-300 text-blue-700',
  epic: 'bg-purple-100 border-purple-300 text-purple-700',
  legendary: 'bg-yellow-100 border-yellow-400 text-yellow-800',
};

const rarityIcons = {
  common: Award,
  rare: Star,
  epic: Trophy,
  legendary: Sparkles,
};

const categoryIcons = {
  quality: Award,
  performance: Trophy,
  service: Star,
  loyalty: Sparkles,
  special: Trophy,
};

export function HostBadge({
  badge,
  earned,
  progress = 0,
  earnedAt,
  size = 'md',
  showProgress = true,
  onClick,
}: HostBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const IconComponent = badge.icon 
    ? () => <span className="text-2xl">{badge.icon}</span>
    : (rarityIcons[badge.rarity] || categoryIcons[badge.category] || Trophy);
  
  // Garantir que IconComponent seja um componente válido
  const Icon = typeof IconComponent === 'function' ? IconComponent : Trophy;
  
  const sizeClasses = {
    sm: 'w-16 h-16 text-sm',
    md: 'w-24 h-24 text-base',
    lg: 'w-32 h-32 text-lg',
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            whileHover={{ scale: earned ? 1.05 : 1 }}
            whileTap={{ scale: 0.95 }}
            className="cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
          >
            <Card
              className={`
                ${sizeClasses[size]}
                ${earned ? rarityColors[badge.rarity] : 'bg-gray-50 border-gray-200 opacity-60'}
                border-2 transition-all duration-300
                ${earned && isHovered ? 'shadow-lg' : ''}
                flex flex-col items-center justify-center p-2
                relative overflow-hidden
              `}
            >
              {/* Badge Icon */}
              <div className={`
                ${iconSizes[size]}
                ${earned ? 'text-current' : 'text-gray-400'}
                mb-1
              `}>
                <Icon />
              </div>

              {/* Badge Name */}
              <div className={`
                text-center font-semibold
                ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}
                line-clamp-2
              `}>
                {badge.name}
              </div>

              {/* Progress Bar (se não ganhou) */}
              {!earned && showProgress && progress > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-primary"
                  />
                </div>
              )}

              {/* Earned Indicator */}
              {earned && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1"
                >
                  <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                </motion.div>
              )}

              {/* Shine Effect (se ganhou) */}
              {earned && isHovered && (
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
              )}
            </Card>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <div className="font-semibold">{badge.name}</div>
            <div className="text-sm text-muted-foreground">{badge.description}</div>
            {earned && earnedAt && (
              <div className="text-xs text-muted-foreground">
                Conquistado em: {new Date(earnedAt).toLocaleDateString('pt-BR')}
              </div>
            )}
            {!earned && showProgress && (
              <div className="text-xs text-muted-foreground">
                Progresso: {Math.round(progress)}%
              </div>
            )}
            <UIBadge variant="outline" className="text-xs">
              {badge.rarity}
            </UIBadge>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

