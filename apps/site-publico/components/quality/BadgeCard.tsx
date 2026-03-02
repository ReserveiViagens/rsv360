/**
 * ✅ FASE 3 - ETAPA 3.1: Componente BadgeCard
 * Card individual de badge com animações
 * 
 * @module components/quality/BadgeCard
 */

'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';

export interface BadgeData {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  criteria?: string;
}

interface BadgeCardProps {
  badge: BadgeData;
  earned: boolean;
  progress?: number; // 0-100
  earnedAt?: Date | string;
  onClick?: () => void;
}

export default function BadgeCard({ badge, earned, progress = 0, earnedAt, onClick }: BadgeCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setIsDialogOpen(true);
    }
  };

  const gradientClass = earned
    ? 'bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500'
    : 'bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800';

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: earned ? 1 : 0.6, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          className={`
            relative overflow-hidden cursor-pointer transition-all
            ${earned ? 'border-2 border-yellow-400 shadow-lg' : 'border border-gray-200 dark:border-gray-700'}
            hover:shadow-xl
          `}
          onClick={handleClick}
          role="button"
          tabIndex={0}
          aria-label={`Badge ${badge.name} - ${earned ? 'Conquistado' : 'Não conquistado'}`}
        >
          {/* Background Gradient */}
          <div className={`absolute inset-0 ${gradientClass} opacity-10`} />

          <CardContent className="relative p-6">
            {/* Ícone */}
            <div className="flex justify-center mb-4">
              <motion.div
                className={`
                  text-6xl transition-all
                  ${earned ? 'filter drop-shadow-lg' : 'grayscale opacity-50'}
                `}
                animate={earned ? { rotate: [0, 10, -10, 0] } : {}}
                transition={{ duration: 0.5, repeat: earned ? Infinity : 0, repeatDelay: 2 }}
              >
                {badge.icon}
              </motion.div>
            </div>

            {/* Nome e Descrição */}
            <div className="text-center mb-4">
              <h3 className={`font-bold text-lg mb-1 ${earned ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                {badge.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {badge.description}
              </p>
            </div>

            {/* Status Badge */}
            <div className="flex justify-center mb-3">
              {earned ? (
                <Badge className="bg-green-600 text-white">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Conquistado
                </Badge>
              ) : (
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  Em progresso
                </Badge>
              )}
            </div>

            {/* Progress Bar (se não ganho) */}
            {!earned && progress > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progresso</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Data de Conquista (se ganho) */}
            {earned && earnedAt && (
              <div className="text-center mt-3">
                <p className="text-xs text-muted-foreground">
                  Conquistado em{' '}
                  {format(new Date(earnedAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Dialog com Detalhes */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <span className="text-4xl">{badge.icon}</span>
              {badge.name}
            </DialogTitle>
            <DialogDescription>{badge.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <h4 className="font-semibold mb-2">Categoria</h4>
              <Badge variant="outline">{badge.category}</Badge>
            </div>
            {badge.criteria && (
              <div>
                <h4 className="font-semibold mb-2">Critérios</h4>
                <p className="text-sm text-muted-foreground">{badge.criteria}</p>
              </div>
            )}
            {earned && earnedAt && (
              <div>
                <h4 className="font-semibold mb-2">Data de Conquista</h4>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(earnedAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            )}
            {!earned && progress > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Progresso</h4>
                <Progress value={progress} className="h-3" />
                <p className="text-sm text-muted-foreground mt-1">
                  {Math.round(progress)}% completo
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

