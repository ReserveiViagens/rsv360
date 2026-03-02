'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Loader2, Image as ImageIcon } from 'lucide-react';
import { getToken } from '@/lib/auth';

interface ReviewFormProps {
  hostId: number;
  bookingId?: number;
  propertyName?: string;
  onSubmit?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({ hostId, bookingId, propertyName, onSubmit, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (rating < 1) {
      setError('Por favor, selecione uma avaliação');
      setLoading(false);
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        setError('Você precisa estar logado para avaliar');
        setLoading(false);
        return;
      }

      // Upload de fotos (se houver)
      let photoUrls: string[] = [];
      if (photos.length > 0) {
        // TODO: Implementar upload de fotos
        // Por enquanto, apenas enviar sem fotos
      }

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          host_id: hostId,
          booking_id: bookingId,
          rating,
          comment: comment.trim() || null,
          photos: photoUrls,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (onSubmit) {
          onSubmit();
        }
        // Reset form
        setRating(0);
        setComment('');
        setPhotos([]);
      } else {
        setError(data.error || 'Erro ao enviar avaliação');
      }
    } catch (err: any) {
      setError('Erro ao enviar avaliação. Tente novamente.');
      console.error('Erro ao enviar avaliação:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 5); // Máximo 5 fotos
      setPhotos(files);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
          {error}
        </div>
      )}

      {propertyName && (
        <div className="text-sm text-muted-foreground">
          Avaliando: <strong>{propertyName}</strong>
        </div>
      )}

      <div>
        <Label>Avaliação</Label>
        <div className="flex items-center gap-2 mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none"
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= (hoverRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-muted-foreground">
              {rating === 1 && 'Péssimo'}
              {rating === 2 && 'Ruim'}
              {rating === 3 && 'Regular'}
              {rating === 4 && 'Bom'}
              {rating === 5 && 'Excelente'}
            </span>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="comment">Comentário (opcional)</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Compartilhe sua experiência..."
          rows={4}
          maxLength={1000}
          className="mt-2"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {comment.length}/1000 caracteres
        </p>
      </div>

      <div>
        <Label htmlFor="photos">Fotos (opcional, máximo 5)</Label>
        <div className="mt-2">
          <input
            type="file"
            id="photos"
            accept="image/*"
            multiple
            onChange={handlePhotoChange}
            className="hidden"
          />
          <label
            htmlFor="photos"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
          >
            <ImageIcon className="w-4 h-4" />
            {photos.length > 0 ? `${photos.length} foto(s) selecionada(s)` : 'Adicionar fotos'}
          </label>
          {photos.length > 0 && (
            <div className="mt-2 text-sm text-muted-foreground">
              {photos.map((photo, index) => (
                <div key={index}>{photo.name}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading || rating < 1}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            'Enviar Avaliação'
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}

