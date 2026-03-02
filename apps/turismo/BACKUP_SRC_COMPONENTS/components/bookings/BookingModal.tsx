// ===================================================================
// BOOKING MODAL - MODAL PARA CRIAR/EDITAR RESERVAS
// ===================================================================

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  X,
  Calendar,
  Users,
  MapPin,
  DollarSign,
  FileText,
  Save,
  User,
  Phone,
  Mail,
  CreditCard,
  Clock
} from 'lucide-react';

// ===================================================================
// SCHEMA DE VALIDAÇÃO
// ===================================================================

const bookingSchema = z.object({
  customerName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  customerEmail: z.string().email('Email inválido'),
  customerPhone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  destination: z.string().min(1, 'Destino é obrigatório'),
  checkIn: z.string().min(1, 'Data de check-in é obrigatória'),
  checkOut: z.string().min(1, 'Data de check-out é obrigatória'),
  guests: z.number().min(1, 'Número de hóspedes deve ser pelo menos 1'),
  value: z.number().min(0, 'Valor deve ser positivo'),
  status: z.enum(['confirmed', 'pending', 'cancelled']),
  paymentStatus: z.enum(['paid', 'pending', 'failed']),
  notes: z.string().optional()
});

type BookingFormData = z.infer<typeof bookingSchema>;

// ===================================================================
// TIPOS E INTERFACES
// ===================================================================

interface Booking {
  id?: string;
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

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (booking: Booking) => void;
  booking?: Booking | null;
  mode: 'create' | 'edit';
}

// ===================================================================
// DADOS MOCK
// ===================================================================

const mockDestinations = [
  'Caldas Novas - GO',
  'Porto de Galinhas - PE',
  'Fernando de Noronha - PE',
  'Gramado - RS',
  'Búzios - RJ',
  'Florianópolis - SC',
  'Salvador - BA',
  'Fortaleza - CE'
];

const mockCustomers = [
  { name: 'João Silva', email: 'joao@email.com', phone: '(11) 99999-9999' },
  { name: 'Maria Santos', email: 'maria@email.com', phone: '(11) 88888-8888' },
  { name: 'Pedro Costa', email: 'pedro@email.com', phone: '(11) 77777-7777' },
  { name: 'Ana Oliveira', email: 'ana@email.com', phone: '(11) 66666-6666' }
];

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  booking,
  mode
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      destination: '',
      checkIn: '',
      checkOut: '',
      guests: 1,
      value: 0,
      status: 'pending',
      paymentStatus: 'pending',
      notes: ''
    }
  });

  const watchedCheckIn = watch('checkIn');
  const watchedCheckOut = watch('checkOut');
  const watchedGuests = watch('guests');
  const watchedDestination = watch('destination');

  // ===================================================================
  // EFEITOS
  // ===================================================================

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && booking) {
        reset({
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          customerPhone: booking.customerPhone,
          destination: booking.destination,
          checkIn: booking.checkIn.toISOString().split('T')[0],
          checkOut: booking.checkOut.toISOString().split('T')[0],
          guests: booking.guests,
          value: booking.value,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          notes: booking.notes || ''
        });
      } else {
        reset({
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          destination: '',
          checkIn: '',
          checkOut: '',
          guests: 1,
          value: 0,
          status: 'pending',
          paymentStatus: 'pending',
          notes: ''
        });
      }
    }
  }, [isOpen, mode, booking, reset]);

  // Auto-calcular valor baseado nas datas e destino
  useEffect(() => {
    if (watchedCheckIn && watchedCheckOut && watchedDestination) {
      calculateValue();
    }
  }, [watchedCheckIn, watchedCheckOut, watchedGuests, watchedDestination]);

  // ===================================================================
  // FUNÇÕES
  // ===================================================================

  const calculateValue = async () => {
    if (!watchedCheckIn || !watchedCheckOut || !watchedDestination) return;

    setIsCalculating(true);
    
    // Simular cálculo de preço
    setTimeout(() => {
      const checkIn = new Date(watchedCheckIn);
      const checkOut = new Date(watchedCheckOut);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      
      // Preços base por destino (por noite)
      const basePrices: Record<string, number> = {
        'Caldas Novas - GO': 200,
        'Porto de Galinhas - PE': 300,
        'Fernando de Noronha - PE': 500,
        'Gramado - RS': 250,
        'Búzios - RJ': 350,
        'Florianópolis - SC': 280,
        'Salvador - BA': 220,
        'Fortaleza - CE': 200
      };

      const basePrice = basePrices[watchedDestination] || 200;
      const totalValue = basePrice * nights * watchedGuests;
      
      setValue('value', totalValue);
      setIsCalculating(false);
    }, 1000);
  };

  const handleCustomerSelect = (customerName: string) => {
    const customer = mockCustomers.find(c => c.name === customerName);
    if (customer) {
      setValue('customerName', customer.name);
      setValue('customerEmail', customer.email);
      setValue('customerPhone', customer.phone);
      setSelectedCustomer(customerName);
    }
  };

  const onSubmit = (data: BookingFormData) => {
    const bookingData: Booking = {
      id: mode === 'edit' ? booking?.id : undefined,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      destination: data.destination,
      checkIn: new Date(data.checkIn),
      checkOut: new Date(data.checkOut),
      value: data.value,
      status: data.status,
      paymentStatus: data.paymentStatus,
      guests: data.guests,
      notes: data.notes
    };

    onSave(bookingData);
    onClose();
  };

  const handleClose = () => {
    reset();
    setSelectedCustomer('');
    onClose();
  };

  // ===================================================================
  // RENDERIZAÇÃO
  // ===================================================================

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-25" />
      
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {mode === 'create' ? 'Nova Reserva' : 'Editar Reserva'}
              </h2>
              <p className="text-sm text-gray-600">
                {mode === 'create' ? 'Preencha os dados da nova reserva' : 'Atualize os dados da reserva'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
              title="Fechar modal"
              aria-label="Fechar modal de reserva"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Seleção de Cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cliente
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <select
                    value={selectedCustomer}
                    onChange={(e) => handleCustomerSelect(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Selecionar cliente existente"
                    aria-label="Selecionar cliente existente"
                  >
                    <option value="">Selecionar cliente existente</option>
                    {mockCustomers.map(customer => (
                      <option key={customer.name} value={customer.name}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-sm text-gray-500 flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  Ou preencha os dados manualmente
                </div>
              </div>
            </div>

            {/* Dados do Cliente */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  {...register('customerName')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nome do cliente"
                />
                {errors.customerName && (
                  <p className="text-red-500 text-xs mt-1">{errors.customerName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  {...register('customerEmail')}
                  type="email"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@exemplo.com"
                />
                {errors.customerEmail && (
                  <p className="text-red-500 text-xs mt-1">{errors.customerEmail.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone *
                </label>
                <input
                  {...register('customerPhone')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(11) 99999-9999"
                />
                {errors.customerPhone && (
                  <p className="text-red-500 text-xs mt-1">{errors.customerPhone.message}</p>
                )}
              </div>
            </div>

            {/* Dados da Reserva */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destino *
                </label>
                <select
                  {...register('destination')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecionar destino</option>
                  {mockDestinations.map(destination => (
                    <option key={destination} value={destination}>
                      {destination}
                    </option>
                  ))}
                </select>
                {errors.destination && (
                  <p className="text-red-500 text-xs mt-1">{errors.destination.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Hóspedes *
                </label>
                <input
                  {...register('guests', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.guests && (
                  <p className="text-red-500 text-xs mt-1">{errors.guests.message}</p>
                )}
              </div>
            </div>

            {/* Datas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in *
                </label>
                <input
                  {...register('checkIn')}
                  type="date"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.checkIn && (
                  <p className="text-red-500 text-xs mt-1">{errors.checkIn.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-out *
                </label>
                <input
                  {...register('checkOut')}
                  type="date"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.checkOut && (
                  <p className="text-red-500 text-xs mt-1">{errors.checkOut.message}</p>
                )}
              </div>
            </div>

            {/* Valor e Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor Total (R$)
                </label>
                <div className="relative">
                  <input
                    {...register('value', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0,00"
                  />
                  {isCalculating && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                </div>
                {errors.value && (
                  <p className="text-red-500 text-xs mt-1">{errors.value.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status da Reserva
                </label>
                <select
                  {...register('status')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pendente</option>
                  <option value="confirmed">Confirmada</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status do Pagamento
                </label>
                <select
                  {...register('paymentStatus')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pendente</option>
                  <option value="paid">Pago</option>
                  <option value="failed">Falhou</option>
                </select>
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                {...register('notes')}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Observações adicionais sobre a reserva..."
              />
            </div>

            {/* Botões */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Salvando...' : 'Salvar Reserva'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;