/**
 * ✅ FASE 3 - ETAPA 3.1: Componente HostBadges
 * Grid de badges do host com animações
 * 
 * @module components/quality/HostBadges
 */

'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { BadgeCard, type BadgeData } from './BadgeCard';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trophy } from 'lucide-react';

interface HostBadge {
  id: string;
  badge: BadgeData;
  earned: boolean;
  progress?: number;
  earnedAt?: string;
}

interface HostBadgesProps {
  hostId: string;
  propertyId?: string;
}

export default function HostBadges({ hostId, propertyId }: HostBadgesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newlyEarnedBadge, setNewlyEarnedBadge] = useState<string | null>(null);
  const previousBadgesRef = useRef<HostBadge[]>([]);

  // Query: Buscar badges do host
  const { data: badges, isLoading, error } = useQuery<HostBadge[]>({
    queryKey: ['host-badges', hostId, propertyId],
    queryFn: async () => {
      const url = propertyId
        ? `/api/quality/badges/${hostId}?property_id=${propertyId}`
        : `/api/quality/badges/${hostId}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Erro ao buscar badges');
      const result = await response.json();
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Detectar novos badges ganhos
  useEffect(() => {
    if (badges && badges.length > 0) {
      const previousBadges = previousBadgesRef.current;
      
      // Comparar badges atuais com anteriores
      const newlyEarned = badges.find(currentBadge => {
        const wasEarned = currentBadge.earned;
        const previousBadge = previousBadges.find(pb => pb.id === currentBadge.id);
        const wasEarnedBefore = previousBadge?.earned || false;
        
        return wasEarned && !wasEarnedBefore;
      });

      if (newlyEarned) {
        setNewlyEarnedBadge(newlyEarned.id);
        toast.success(`🎉 Novo badge conquistado: ${newlyEarned.badge.name}!`, {
          duration: 5000
        });
        // Remover após animação
        setTimeout(() => setNewlyEarnedBadge(null), 3000);
      }

      // Atualizar referência
      previousBadgesRef.current = badges;
    }
  }, [badges]);

  // Filtrar badges (memoizado com debounced search)
  const filteredBadges = useMemo(() => {
    if (!badges) return [];
    
    return badges.filter(badge => {
      const matchesSearch = badge.badge.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                           badge.badge.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || badge.badge.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [badges, debouncedSearchTerm, selectedCategory]);

  // Categorias únicas (memoizado)
  const categories = useMemo(() => {
    return Array.from(new Set(badges?.map(b => b.badge.category) || []));
  }, [badges]);

  // Badges ganhos vs não ganhos
  const earnedBadges = filteredBadges.filter(b => b.earned);
  const unearnedBadges = filteredBadges.filter(b => !b.earned);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Badges do Host</CardTitle>
          <CardDescription>Carregando badges...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-12">
          <Trophy className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erro ao carregar badges</h3>
          <p className="text-muted-foreground text-center">
            Não foi possível carregar os badges do host
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            Badges do Host
          </CardTitle>
          <CardDescription>
            {earnedBadges.length} de {filteredBadges.length} badges conquistados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar badges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === null
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Todas
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges Ganhos */}
      {earnedBadges.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Badges Conquistados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {earnedBadges.map((badge) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <BadgeCard
                    badge={badge.badge}
                    earned={badge.earned}
                    earnedAt={badge.earnedAt}
                    onClick={() => {
                      if (newlyEarnedBadge === badge.id) {
                        // Animação de confetti (simulada com toast)
                        toast.success('🎉 Parabéns pelo novo badge!', {
                          duration: 3000
                        });
                      }
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Badges Não Ganhos */}
      {unearnedBadges.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Badges Disponíveis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {unearnedBadges.map((badge) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 0.6, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <BadgeCard
                    badge={badge.badge}
                    earned={false}
                    progress={badge.progress}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredBadges.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <Trophy className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum badge encontrado</h3>
            <p className="text-muted-foreground text-center">
              Tente ajustar os filtros de busca
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

