'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import {
  Brain,
  Star,
  MapPin,
  TrendingUp,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Target,
  BarChart3,
  Filter,
  RefreshCw,
  Cpu,
  Zap,
  Award,
  Users,
  Eye,
  Clock,
  Calendar,
  DollarSign
} from 'lucide-react';

interface Recommendation {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  price_range: string;
  recommendationScore: number;
  recommendationReason: string;
  photos: Array<{ url: string; isPrimary: boolean }>;
  recentReviews: Array<{
    rating: number;
    comment: string;
    created_at: string;
    user_name: string;
  }>;
  bookingsLast30Days: number;
  isPopular: boolean;
  amenities: string[];
  average_price: number;
}

interface TrendingHotel {
  id: string;
  name: string;
  location: string;
  recent_bookings: number;
  recent_reviews: number;
  avg_rating: number;
  trending_score: number;
}

const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: '1',
    name: 'Resort Paradise Premium',
    category: 'luxury',
    location: 'Cancún, México',
    rating: 4.8,
    price_range: 'luxury',
    recommendationScore: 0.95,
    recommendationReason: 'Baseado em suas reservas anteriores em resorts de luxo e preferência por destinos paradisíacos',
    photos: [
      { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400', isPrimary: true }
    ],
    recentReviews: [
      { rating: 5, comment: 'Experiência incrível!', created_at: '2025-01-01', user_name: 'Maria S.' }
    ],
    bookingsLast30Days: 45,
    isPopular: true,
    amenities: ['piscina', 'spa', 'wifi', 'estacionamento'],
    average_price: 2500
  },
  {
    id: '2',
    name: 'Hotel Boutique Charme',
    category: 'superior',
    location: 'Porto de Galinhas, PE',
    rating: 4.6,
    price_range: 'upscale',
    recommendationScore: 0.89,
    recommendationReason: 'Localização próxima a destinos que você já visitou e alta avaliação dos hóspedes',
    photos: [
      { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', isPrimary: true }
    ],
    recentReviews: [
      { rating: 5, comment: 'Atendimento excepcional', created_at: '2025-01-02', user_name: 'João P.' }
    ],
    bookingsLast30Days: 32,
    isPopular: true,
    amenities: ['praia', 'piscina', 'wifi', 'restaurante'],
    average_price: 1200
  },
  {
    id: '3',
    name: 'Pousada Ecológica Natureza',
    category: 'standard',
    location: 'Chapada Diamantina, BA',
    rating: 4.4,
    price_range: 'mid-range',
    recommendationScore: 0.82,
    recommendationReason: 'Combina com seu interesse por ecoturismo e experiências autênticas',
    photos: [
      { url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400', isPrimary: true }
    ],
    recentReviews: [
      { rating: 4, comment: 'Lugar perfeito para relaxar', created_at: '2025-01-03', user_name: 'Ana L.' }
    ],
    bookingsLast30Days: 18,
    isPopular: false,
    amenities: ['trilhas', 'wifi', 'café da manhã'],
    average_price: 450
  }
];

const MOCK_TRENDING: TrendingHotel[] = [
  {
    id: '4',
    name: 'Hotel Marina Bay',
    location: 'Fortaleza, CE',
    recent_bookings: 67,
    recent_reviews: 23,
    avg_rating: 4.7,
    trending_score: 156.5
  },
  {
    id: '5',
    name: 'Resort Águas Cristalinas',
    location: 'Caldas Novas, GO',
    recent_bookings: 54,
    recent_reviews: 31,
    avg_rating: 4.5,
    trending_score: 147.0
  },
  {
    id: '6',
    name: 'Pousada Vista Mar',
    location: 'Jericoacoara, CE',
    recent_bookings: 43,
    recent_reviews: 18,
    avg_rating: 4.8,
    trending_score: 129.4
  }
];

export default function MLRecomendacoes() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>(MOCK_RECOMMENDATIONS);
  const [trendingHotels, setTrendingHotels] = useState<TrendingHotel[]>(MOCK_TRENDING);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    priceRange: '',
    category: ''
  });
  const [feedbackGiven, setFeedbackGiven] = useState<Set<string>>(new Set());

  const handleFeedback = (hotelId: string, feedbackType: 'liked' | 'disliked') => {
    // Simular feedback
    setFeedbackGiven(prev => new Set([...prev, hotelId]));

    // Em produção, enviaria para API
    console.log(`Feedback enviado: ${hotelId} - ${feedbackType}`);
  };

  const refreshRecommendations = async () => {
    setLoading(true);
    // Simular loading
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.8) return 'text-blue-600';
    if (score >= 0.7) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.9) return 'Perfeito para você';
    if (score >= 0.8) return 'Excelente match';
    if (score >= 0.7) return 'Boa opção';
    return 'Considerar';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <Brain className="h-8 w-8 mr-3 text-purple-600" />
              🤖 Recomendações Inteligentes
            </h1>
            <p className="text-gray-600">
              Recomendações personalizadas baseadas em Machine Learning e seu histórico de viagens
            </p>
          </div>

          <div className="flex gap-4 mt-4 lg:mt-0">
            <Button
              onClick={refreshRecommendations}
              disabled={loading}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Status do ML */}
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Cpu className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="font-medium text-purple-900">Sistema de IA Ativo</p>
                  <p className="text-sm text-purple-700">
                    Analisando padrões de {MOCK_RECOMMENDATIONS.length}M+ reservas para gerar recomendações
                  </p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">
                <Zap className="h-3 w-3 mr-1" />
                Online
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros de Recomendação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Localização</label>
                <Input
                  placeholder="Digite uma cidade..."
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Faixa de Preço</label>
                <Select value={filters.priceRange} onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as faixas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as faixas</SelectItem>
                    <SelectItem value="budget">Econômico</SelectItem>
                    <SelectItem value="mid-range">Intermediário</SelectItem>
                    <SelectItem value="upscale">Superior</SelectItem>
                    <SelectItem value="luxury">Luxo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Categoria</label>
                <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as categorias</SelectItem>
                    <SelectItem value="hotel">Hotel</SelectItem>
                    <SelectItem value="resort">Resort</SelectItem>
                    <SelectItem value="pousada">Pousada</SelectItem>
                    <SelectItem value="apartamento">Apartamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="recommendations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recommendations">
              <Target className="h-4 w-4 mr-2" />
              Para Você
            </TabsTrigger>
            <TabsTrigger value="trending">
              <TrendingUp className="h-4 w-4 mr-2" />
              Em Alta
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Recomendações Personalizadas */}
          <TabsContent value="recommendations">
            <div className="space-y-6">
              {recommendations.map(hotel => (
                <Card key={hotel.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Imagem */}
                    <div className="relative">
                      <img
                        src={hotel.photos[0]?.url}
                        alt={hotel.name}
                        className="w-full h-64 lg:h-full object-cover"
                      />

                      {/* Score Badge */}
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white text-gray-900 shadow-lg">
                          <Sparkles className="h-3 w-3 mr-1" />
                          {Math.round(hotel.recommendationScore * 100)}% Match
                        </Badge>
                      </div>

                      {/* Popularity Badge */}
                      {hotel.isPopular && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-orange-100 text-orange-800">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Popular
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Conteúdo */}
                    <div className="lg:col-span-2 p-6">
                      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{hotel.name}</h3>

                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {hotel.location}
                            </div>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 mr-1 text-yellow-500" />
                              {hotel.rating.toFixed(1)}
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {hotel.bookingsLast30Days} reservas (30 dias)
                            </div>
                          </div>

                          {/* Score de Recomendação */}
                          <div className="mb-3">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium">Score de Recomendação:</span>
                              <span className={`font-bold ${getScoreColor(hotel.recommendationScore)}`}>
                                {getScoreLabel(hotel.recommendationScore)}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                                style={{ width: `${hotel.recommendationScore * 100}%` }}
                              />
                            </div>
                          </div>

                          {/* Razão da Recomendação */}
                          <div className="bg-blue-50 p-3 rounded-lg mb-4">
                            <p className="text-sm text-blue-800">
                              <Brain className="h-4 w-4 inline mr-1" />
                              <strong>Por que recomendamos:</strong> {hotel.recommendationReason}
                            </p>
                          </div>

                          {/* Amenidades */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {hotel.amenities.slice(0, 4).map(amenity => (
                              <Badge key={amenity} variant="outline" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                            {hotel.amenities.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{hotel.amenities.length - 4} mais
                              </Badge>
                            )}
                          </div>

                          {/* Review Recente */}
                          {hotel.recentReviews.length > 0 && (
                            <div className="bg-gray-50 p-3 rounded-lg mb-4">
                              <div className="flex items-center space-x-2 mb-1">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${
                                        i < hotel.recentReviews[0].rating
                                          ? 'text-yellow-500 fill-current'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs font-medium">{hotel.recentReviews[0].user_name}</span>
                              </div>
                              <p className="text-sm text-gray-600">"{hotel.recentReviews[0].comment}"</p>
                            </div>
                          )}
                        </div>

                        {/* Preço e Ações */}
                        <div className="text-right">
                          <div className="mb-4">
                            <p className="text-2xl font-bold text-gray-900">
                              {formatPrice(hotel.average_price)}
                            </p>
                            <p className="text-sm text-gray-600">por noite</p>
                          </div>

                          <div className="space-y-2">
                            <Button className="w-full">
                              <Calendar className="h-4 w-4 mr-2" />
                              Ver Disponibilidade
                            </Button>

                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleFeedback(hotel.id, 'liked')}
                                disabled={feedbackGiven.has(hotel.id)}
                                className="flex-1"
                              >
                                <ThumbsUp className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleFeedback(hotel.id, 'disliked')}
                                disabled={feedbackGiven.has(hotel.id)}
                                className="flex-1"
                              >
                                <ThumbsDown className="h-4 w-4" />
                              </Button>
                            </div>

                            {feedbackGiven.has(hotel.id) && (
                              <p className="text-xs text-green-600 text-center">
                                Feedback enviado!
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Hotéis Trending */}
          <TabsContent value="trending">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingHotels.map((hotel, index) => (
                <Card key={hotel.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-red-100 text-red-800">
                        #{index + 1} Trending
                      </Badge>
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                        <span className="text-sm font-medium">{hotel.trending_score.toFixed(1)}</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <h3 className="font-bold text-lg mb-2">{hotel.name}</h3>

                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      {hotel.location}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Reservas (7 dias):</span>
                        <Badge variant="outline">{hotel.recent_bookings}</Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <span>Reviews (7 dias):</span>
                        <Badge variant="outline">{hotel.recent_reviews}</Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <span>Avaliação:</span>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span>{hotel.avg_rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full mt-4" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Recomendações Geradas</p>
                      <p className="text-2xl font-bold">12.5K</p>
                    </div>
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Taxa de Conversão</p>
                      <p className="text-2xl font-bold">23.4%</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Precisão do Modelo</p>
                      <p className="text-2xl font-bold">87.2%</p>
                    </div>
                    <Award className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Feedback Positivo</p>
                      <p className="text-2xl font-bold">94.1%</p>
                    </div>
                    <Heart className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de Performance */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Performance do Modelo ML</CardTitle>
                <CardDescription>
                  Evolução da precisão e taxa de conversão ao longo do tempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Gráfico de Performance</p>
                    <p className="text-sm text-gray-500">Em breve: visualização interativa</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
