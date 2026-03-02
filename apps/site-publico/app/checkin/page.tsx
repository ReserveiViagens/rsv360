'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CheckinForm from '@/components/checkin/checkin-form';
import LoadingSpinner from '@/components/ui/loading-spinner';
import FadeIn from '@/components/ui/fade-in';
import { useToast } from '@/components/providers/toast-wrapper';

export default function CheckinPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('booking_id') ? parseInt(searchParams.get('booking_id')!) : null;
  const toast = useToast();

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookingId) {
      loadBooking();
    } else {
      setError('ID de reserva não fornecido');
      setLoading(false);
    }
  }, [bookingId]);

  async function loadBooking() {
    try {
      const response = await fetch(`/api/bookings?booking_id=${bookingId}`);
      if (response.ok) {
        const data = await response.json();
        // A API retorna { success: true, data: [...] } ou { success: true, data: {...} }
        if (data.success && data.data) {
          const bookingData = Array.isArray(data.data) ? data.data[0] : data.data;
          if (bookingData) {
            setBooking(bookingData);
          } else {
            const errorMsg = 'Reserva não encontrada';
            setError(errorMsg);
            toast.error(errorMsg);
          }
        } else {
          const errorMsg = 'Reserva não encontrada';
          setError(errorMsg);
          toast.error(errorMsg);
        }
      } else {
        const errorMsg = 'Erro ao carregar reserva';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Erro ao carregar reserva:', error);
      const errorMsg = 'Erro ao carregar reserva';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <FadeIn>
          <LoadingSpinner size="lg" text="Carregando informações do check-in..." />
        </FadeIn>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro</h1>
            <p className="text-gray-600 mb-6">{error || 'Reserva não encontrada'}</p>
            <button
              onClick={() => router.push('/minhas-reservas')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Voltar para Minhas Reservas
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Buscar user_id do localStorage ou da sessão
  const userId = typeof window !== 'undefined' ? 
    parseInt(localStorage.getItem('userId') || '1') : 1;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Voltar
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Check-in Online
          </h1>
          <p className="text-gray-600 mt-2">
            Complete seu check-in e receba as instruções de acesso
          </p>
        </div>

        {/* Informações da Reserva */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Informações da Reserva</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600">Código:</span>
              <span className="ml-2 font-semibold">{booking.booking_code}</span>
            </div>
            <div>
              <span className="text-gray-600">Propriedade:</span>
              <span className="ml-2 font-semibold">{booking.item_name}</span>
            </div>
            <div>
              <span className="text-gray-600">Check-in:</span>
              <span className="ml-2 font-semibold">
                {new Date(booking.check_in).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Check-out:</span>
              <span className="ml-2 font-semibold">
                {new Date(booking.check_out).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Hóspedes:</span>
              <span className="ml-2 font-semibold">{booking.total_guests}</span>
            </div>
            <div>
              <span className="text-gray-600">Total:</span>
              <span className="ml-2 font-semibold text-green-600">
                R$ {parseFloat(booking.total || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Formulário de Check-in */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <CheckinForm
            bookingId={booking.id}
            propertyId={booking.item_id}
            userId={userId}
          />
        </div>
      </div>
    </div>
  );
}

