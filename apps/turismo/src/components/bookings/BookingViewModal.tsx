// ===================================================================
// BOOKING VIEW MODAL - MODAL PARA VISUALIZAR DETALHES DA RESERVA
// ===================================================================

import React from 'react';
import {
  X,
  Calendar,
  Users,
  MapPin,
  DollarSign,
  FileText,
  User,
  Phone,
  Mail,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Printer
} from 'lucide-react';

// ===================================================================
// TIPOS E INTERFACES
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

interface BookingViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onEdit?: () => void;
}

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

const BookingViewModal: React.FC<BookingViewModalProps> = ({
  isOpen,
  onClose,
  booking,
  onEdit
}) => {
  if (!isOpen || !booking) return null;

  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    const icons = {
      confirmed: <CheckCircle className="w-5 h-5" />,
      pending: <AlertCircle className="w-5 h-5" />,
      cancelled: <XCircle className="w-5 h-5" />
    };
    const labels = {
      confirmed: 'Confirmada',
      pending: 'Pendente',
      cancelled: 'Cancelada'
    };
    
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border ${styles[status as keyof typeof styles]}`}>
        {icons[status as keyof typeof icons]}
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getPaymentBadge = (status: string) => {
    const styles = {
      paid: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      failed: 'bg-red-100 text-red-800 border-red-200'
    };
    const icons = {
      paid: <CheckCircle className="w-5 h-5" />,
      pending: <Clock className="w-5 h-5" />,
      failed: <XCircle className="w-5 h-5" />
    };
    const labels = {
      paid: 'Pago',
      pending: 'Pendente',
      failed: 'Falhou'
    };
    
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border ${styles[status as keyof typeof styles]}`}>
        {icons[status as keyof typeof icons]}
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const calculateNights = () => {
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Detalhes da Reserva</h2>
            <p className="text-sm text-gray-500 mt-1">ID: {booking.id}</p>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Editar
              </button>
            )}
            <button
              onClick={handlePrint}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              title="Imprimir"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status e Pagamento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status da Reserva</label>
              {getStatusBadge(booking.status)}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status do Pagamento</label>
              {getPaymentBadge(booking.paymentStatus)}
            </div>
          </div>

          {/* Informações do Cliente */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Informações do Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{booking.customerName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{booking.customerEmail}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  Telefone
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{booking.customerPhone}</p>
              </div>
            </div>
          </div>

          {/* Informações da Viagem */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Informações da Viagem
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Destino
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{booking.destination}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Número de Hóspedes
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{booking.guests} pessoa{booking.guests !== 1 ? 's' : ''}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Check-in
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {new Date(booking.checkIn).toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Check-out
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {new Date(booking.checkOut).toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Período
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {calculateNights()} noite{calculateNights() !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Informações Financeiras */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Informações Financeiras
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Valor Total da Reserva</p>
                  <p className="text-3xl font-bold text-blue-600">
                    R$ {booking.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Valor por Pessoa</p>
                  <p className="text-xl font-semibold text-gray-900">
                    R$ {(booking.value / booking.guests).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Observações */}
          {booking.notes && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Observações
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{booking.notes}</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-gray-200 pt-6 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              <p>Reserva criada em {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Editar Reserva
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingViewModal;
