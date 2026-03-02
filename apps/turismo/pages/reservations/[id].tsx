// ===================================================================
// RESERVATION DETAIL PAGE - PÁGINA DE DETALHES DA RESERVA
// ===================================================================

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../src/context/AuthContext';
import ProtectedRoute from '../../src/components/ProtectedRoute';
import { NotificationProvider } from '../../src/context/NotificationContext';
import { NotificationToastContainer } from '../../src/components/notifications';
import { BookingViewModal, BookingModal } from '../../src/components/bookings';
import {
  ArrowLeft,
  Edit,
  Printer
} from 'lucide-react';
import Link from 'next/link';

// ===================================================================
// TIPOS
// ===================================================================

interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  destination: string;
  checkIn: Date;
  checkOut: Date;
  value: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'failed';
  guests: number;
  notes?: string;
}

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

export default function ReservationDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // ===================================================================
  // CARREGAR DADOS
  // ===================================================================

  useEffect(() => {
    if (!id) return;

    // Simular carregamento de reserva
    // Em produção, isso viria de uma API
    const mockBookings: Booking[] = [
      {
        id: '1',
        customerName: 'João Silva',
        customerEmail: 'joao.silva@email.com',
        customerPhone: '(11) 99999-9999',
        destination: 'Caldas Novas - GO',
        checkIn: new Date('2024-02-15'),
        checkOut: new Date('2024-02-18'),
        value: 1500,
        status: 'confirmed',
        paymentStatus: 'paid',
        guests: 4,
        notes: 'Cliente preferiu quarto com vista para a piscina'
      },
      {
        id: '2',
        customerName: 'Pedro Costa',
        customerEmail: 'pedro.costa@email.com',
        customerPhone: '(11) 77777-7777',
        destination: 'Fernando de Noronha - PE',
        checkIn: new Date('2024-03-01'),
        checkOut: new Date('2024-03-06'),
        value: 4500,
        status: 'confirmed',
        paymentStatus: 'paid',
        guests: 2,
        notes: 'Pacote completo com mergulho incluído'
      },
      {
        id: '3',
        customerName: 'Maria Santos',
        customerEmail: 'maria.santos@email.com',
        customerPhone: '(11) 88888-8888',
        destination: 'Porto de Galinhas - PE',
        checkIn: new Date('2024-03-10'),
        checkOut: new Date('2024-03-15'),
        value: 2200,
        status: 'pending',
        paymentStatus: 'pending',
        guests: 2,
        notes: 'Aguardando confirmação de pagamento'
      },
      {
        id: '4',
        customerName: 'Ana Oliveira',
        customerEmail: 'ana.oliveira@email.com',
        customerPhone: '(11) 66666-6666',
        destination: 'Gramado - RS',
        checkIn: new Date('2024-06-15'),
        checkOut: new Date('2024-06-19'),
        value: 2400,
        status: 'cancelled',
        paymentStatus: 'failed',
        guests: 3,
        notes: 'Reserva cancelada pelo cliente'
      }
    ];

    const foundBooking = mockBookings.find(b => b.id === id);
    
    setTimeout(() => {
      setBooking(foundBooking || null);
      setLoading(false);
    }, 500);
  }, [id]);

  // ===================================================================
  // HANDLERS
  // ===================================================================

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleSaveBooking = (updatedBooking: Booking) => {
    setBooking(updatedBooking);
    setIsEditModalOpen(false);
    // Em produção, salvaria na API
    // Recarregar a página para atualizar os dados
    router.replace(`/reservations/${updatedBooking.id}`);
  };

  // ===================================================================
  // RENDERIZAÇÃO
  // ===================================================================

  if (loading) {
    return (
      <ProtectedRoute>
        <NotificationProvider>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando reserva...</p>
            </div>
          </div>
        </NotificationProvider>
      </ProtectedRoute>
    );
  }

  if (!booking) {
    return (
      <ProtectedRoute>
        <NotificationProvider>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Reserva não encontrada</h1>
              <p className="text-gray-600 mb-4">A reserva solicitada não foi encontrada.</p>
              <Link
                href="/reservations-rsv"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para Reservas
              </Link>
            </div>
          </div>
        </NotificationProvider>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <NotificationProvider>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Link
                    href="/reservations-rsv"
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    title="Voltar"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Detalhes da Reserva</h1>
                    <p className="text-sm text-gray-500">ID: {booking.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    Imprimir
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <BookingViewModal
              isOpen={true}
              onClose={() => router.push('/reservations-rsv')}
              booking={booking}
              onEdit={handleEdit}
            />
          </div>

          {/* Modal de Edição */}
          {isEditModalOpen && booking && (
            <BookingModal
              isOpen={isEditModalOpen}
              onClose={handleCloseEditModal}
              onSave={handleSaveBooking}
              booking={booking}
              mode="edit"
            />
          )}

          <NotificationToastContainer />
        </div>
      </NotificationProvider>
    </ProtectedRoute>
  );
}
