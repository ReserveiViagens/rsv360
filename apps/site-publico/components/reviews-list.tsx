'use client';

import { useEffect, useState } from 'react';
import { Star, User, Calendar, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Review {
  id: number;
  user_id: number;
  host_id: number;
  booking_id?: number;
  rating: number;
  comment?: string;
  photos?: string[];
  user_name?: string;
  user_email?: string;
  created_at: string;
  host_response?: string;
  host_response_at?: string;
}

interface ReviewsListProps {
  hostId?: number;
  userId?: number;
  showForm?: boolean;
  propertyName?: string;
  bookingId?: number;
}

export function ReviewsList({ hostId, userId, showForm = false, propertyName, bookingId }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'recent' | 'positive' | 'negative'>('all');
  const [showReviewForm, setShowReviewForm] = useState(showForm);

  useEffect(() => {
    loadReviews();
  }, [hostId, userId, filter]);

  const loadReviews = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (hostId) params.append('host_id', hostId.toString());
      if (userId) params.append('user_id', userId.toString());

      const response = await fetch(`/api/reviews?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        let filteredReviews = data.data || [];

        // Aplicar filtros
        if (filter === 'recent') {
          filteredReviews = filteredReviews.sort((a: Review, b: Review) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        } else if (filter === 'positive') {
          filteredReviews = filteredReviews.filter((r: Review) => r.rating >= 4);
        } else if (filter === 'negative') {
          filteredReviews = filteredReviews.filter((r: Review) => r.rating <= 2);
        }

        setReviews(filteredReviews);
      } else {
        setError(data.error || 'Erro ao carregar avaliações');
      }
    } catch (err) {
      setError('Erro ao carregar avaliações');
      console.error('Erro ao carregar avaliações:', err);
    } finally {
      setLoading(false);
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Carregando avaliações...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho com estatísticas */}
      {hostId && reviews.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'}
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      {reviews.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('recent')}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === 'recent'
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Mais Recentes
          </button>
          <button
            onClick={() => setFilter('positive')}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === 'positive'
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Positivas (4+)
          </button>
          <button
            onClick={() => setFilter('negative')}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === 'negative'
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Negativas (≤2)
          </button>
        </div>
      )}

      {/* Lista de avaliações */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
          {error}
        </div>
      )}

      {reviews.length === 0 && !loading && (
        <div className="text-center p-8 text-muted-foreground">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nenhuma avaliação ainda.</p>
          {showForm && (
            <p className="text-sm mt-2">Seja o primeiro a avaliar!</p>
          )}
        </div>
      )}

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <div className="font-medium">
                    {review.user_name || 'Usuário Anônimo'}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(review.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </div>
                </div>
              </div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= review.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {review.comment && (
              <p className="text-gray-700">{review.comment}</p>
            )}

            {review.photos && review.photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {review.photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded overflow-hidden">
                    <Image
                      src={photo}
                      alt={`Foto ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {review.host_response && (
              <div className="mt-3 pt-3 border-t bg-gray-50 rounded p-3">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Resposta do anfitrião</span>
                </div>
                <p className="text-sm text-gray-700">{review.host_response}</p>
                {review.host_response_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(review.host_response_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

