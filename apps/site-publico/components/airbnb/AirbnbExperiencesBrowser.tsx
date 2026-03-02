/**
 * ✅ TAREFA LOW-1: Componente para navegar e buscar experiências do Airbnb
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Users, Clock, ExternalLink, Search, Filter } from '@/lib/lucide-icons';
import { type AirbnbExperience } from '@/lib/airbnb-experiences-service';
import { toast } from 'sonner';

interface AirbnbExperiencesBrowserProps {
  defaultLocation?: string;
  onSelectExperience?: (experience: AirbnbExperience) => void;
}

export function AirbnbExperiencesBrowser({
  defaultLocation = '',
  onSelectExperience,
}: AirbnbExperiencesBrowserProps) {
  const [experiences, setExperiences] = useState<AirbnbExperience[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    location: defaultLocation,
    category: '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    maxGuests: '',
    instantBook: false,
  });

  useEffect(() => {
    if (defaultLocation) {
      searchExperiences();
    }
  }, []);

  const searchExperiences = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (searchParams.location) params.append('location', searchParams.location);
      if (searchParams.category) params.append('category', searchParams.category);
      if (searchParams.minPrice) params.append('min_price', searchParams.minPrice);
      if (searchParams.maxPrice) params.append('max_price', searchParams.maxPrice);
      if (searchParams.minRating) params.append('min_rating', searchParams.minRating);
      if (searchParams.maxGuests) params.append('max_guests', searchParams.maxGuests);
      if (searchParams.instantBook) params.append('instant_book', 'true');

      const response = await fetch(`/api/airbnb/experiences?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setExperiences(data.data);
        toast.success(`${data.count} experiências encontradas`);
      } else {
        toast.error(data.error || 'Erro ao buscar experiências');
      }
    } catch (error: any) {
      toast.error('Erro ao buscar experiências');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: '', label: 'Todas' },
    { value: 'food', label: 'Gastronomia' },
    { value: 'sports', label: 'Esportes' },
    { value: 'wellness', label: 'Bem-estar' },
    { value: 'culture', label: 'Cultura' },
    { value: 'nature', label: 'Natureza' },
    { value: 'music', label: 'Música' },
    { value: 'art', label: 'Arte' },
  ];

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'BRL' ? 'BRL' : 'USD',
    }).format(amount);
  };

  const formatDuration = (hours: number, minutes?: number) => {
    if (minutes && minutes > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${hours}h`;
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Buscar Experiências do Airbnb
          </CardTitle>
          <CardDescription>
            Descubra atividades e serviços únicos na sua região
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Localização</label>
              <Input
                placeholder="Cidade, estado..."
                value={searchParams.location}
                onChange={(e) =>
                  setSearchParams({ ...searchParams, location: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Categoria</label>
              <Select
                value={searchParams.category}
                onValueChange={(value) =>
                  setSearchParams({ ...searchParams, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Preço mínimo</label>
              <Input
                type="number"
                placeholder="R$ 0"
                value={searchParams.minPrice}
                onChange={(e) =>
                  setSearchParams({ ...searchParams, minPrice: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Preço máximo</label>
              <Input
                type="number"
                placeholder="R$ 1000"
                value={searchParams.maxPrice}
                onChange={(e) =>
                  setSearchParams({ ...searchParams, maxPrice: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Avaliação mínima</label>
              <Input
                type="number"
                min="0"
                max="5"
                step="0.1"
                placeholder="4.0"
                value={searchParams.minRating}
                onChange={(e) =>
                  setSearchParams({ ...searchParams, minRating: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Máximo de pessoas</label>
              <Input
                type="number"
                min="1"
                placeholder="10"
                value={searchParams.maxGuests}
                onChange={(e) =>
                  setSearchParams({ ...searchParams, maxGuests: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <Button onClick={searchExperiences} disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSearchParams({
                  location: defaultLocation,
                  category: '',
                  minPrice: '',
                  maxPrice: '',
                  minRating: '',
                  maxGuests: '',
                  instantBook: false,
                });
              }}
            >
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de experiências */}
      {experiences.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {experiences.map((experience) => (
            <Card key={experience.id} className="overflow-hidden">
              {experience.images && experience.images.length > 0 && (
                <div className="aspect-video bg-gray-200 relative">
                  <img
                    src={experience.images[0]}
                    alt={experience.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{experience.title}</CardTitle>
                  <Badge variant="outline">{experience.category}</Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {experience.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{experience.rating}</span>
                    <span>({experience.reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDuration(experience.duration.hours, experience.duration.minutes)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Até {experience.maxGuests}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {experience.location.city}, {experience.location.state}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <span className="text-2xl font-bold">
                      {formatPrice(experience.price.amount, experience.price.currency)}
                    </span>
                    {experience.price.perPerson && (
                      <span className="text-sm text-muted-foreground ml-1">
                        /pessoa
                      </span>
                    )}
                  </div>
                  {experience.instantBook && (
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Reserva Imediata
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      if (onSelectExperience) {
                        onSelectExperience(experience);
                      }
                    }}
                  >
                    Selecionar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open(experience.url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && experiences.length === 0 && searchParams.location && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma experiência encontrada</p>
            <p className="text-sm mt-1">
              Tente ajustar os filtros de busca
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

