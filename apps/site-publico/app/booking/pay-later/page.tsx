/**
 * ✅ PÁGINA: PAY LATER CHECKOUT
 * Checkout com opção de pagamento posterior
 * 
 * @module app/booking/pay-later/page
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Users, DollarSign, CreditCard, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { getUser, getToken } from '@/lib/auth';
import { toast } from 'sonner';

interface BookingData {
  property_id: number;
  property_name: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_amount: number;
  subtotal: number;
  taxes: number;
  service_fee: number;
}

function PayLaterCheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    cpf: '',
    payment_deadline: '7', // dias
    accept_terms: false,
  });
  const user = getUser();
  const token = getToken();

  useEffect(() => {
    const propertyId = searchParams?.get('property_id');
    const checkIn = searchParams?.get('check_in');
    const checkOut = searchParams?.get('check_out');
    const guests = searchParams?.get('guests');

    if (propertyId && checkIn && checkOut && guests) {
      loadBookingData(propertyId, checkIn, checkOut, parseInt(guests));
    } else {
      toast.error('Parâmetros de reserva inválidos');
      router.push('/hoteis');
    }
  }, []);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        full_name: user.name || prev.full_name,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  const loadBookingData = async (propertyId: string, checkIn: string, checkOut: string, guests: number) => {
    try {
      setLoading(true);
      // Carregar dados da propriedade e calcular valores
      const response = await fetch(`/api/properties/${propertyId}`);
      const result = await response.json();

      if (result.success) {
        const property = result.data;
        const nights = Math.ceil(
          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
        );
        const subtotal = (property.base_price_per_night || 0) * nights;
        const taxes = subtotal * 0.1; // 10% de taxas
        const service_fee = subtotal * 0.05; // 5% de taxa de serviço
        const total = subtotal + taxes + service_fee;

        setBookingData({
          property_id: parseInt(propertyId),
          property_name: property.name || 'Propriedade',
          check_in: checkIn,
          check_out: checkOut,
          guests,
          total_amount: total,
          subtotal,
          taxes,
          service_fee,
        });
      }
    } catch (error: any) {
      toast.error('Erro ao carregar dados da reserva');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.full_name.trim() || !formData.email.trim()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (!formData.accept_terms) {
      toast.error('Você deve aceitar os termos e condições');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          ...bookingData,
          customer_name: formData.full_name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          customer_document: formData.cpf,
          payment_method: 'pay_later',
          payment_deadline_days: parseInt(formData.payment_deadline),
          status: 'pending',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar reserva');
      }

      toast.success('Reserva criada com sucesso! Você receberá um email com os detalhes.');
      router.push(`/bookings/${result.data?.id || result.data?.booking_code}`);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar reserva');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Erro</CardTitle>
            <CardDescription>
              Não foi possível carregar os dados da reserva
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/hoteis">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Hotéis
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const paymentDeadline = new Date();
  paymentDeadline.setDate(paymentDeadline.getDate() + parseInt(formData.payment_deadline));

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/reservar/${bookingData.property_id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Pagamento Posterior</h1>
          <p className="text-muted-foreground mt-1">
            Reserve agora e pague depois
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Formulário */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Hóspede</CardTitle>
              <CardDescription>
                Preencha seus dados para completar a reserva
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome Completo *</Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="space-y-2">
                  <Label>CPF</Label>
                  <Input
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Prazo para Pagamento
                  </Label>
                  <RadioGroup
                    value={formData.payment_deadline}
                    onValueChange={(value) => setFormData({ ...formData, payment_deadline: value })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="3" id="deadline-3" />
                      <Label htmlFor="deadline-3" className="cursor-pointer">3 dias</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="7" id="deadline-7" />
                      <Label htmlFor="deadline-7" className="cursor-pointer">7 dias</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="14" id="deadline-14" />
                      <Label htmlFor="deadline-14" className="cursor-pointer">14 dias</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="30" id="deadline-30" />
                      <Label htmlFor="deadline-30" className="cursor-pointer">30 dias</Label>
                    </div>
                  </RadioGroup>
                  <p className="text-sm text-muted-foreground">
                    Pagamento deve ser realizado até {paymentDeadline.toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.accept_terms}
                    onCheckedChange={(checked) => setFormData({ ...formData, accept_terms: checked as boolean })}
                  />
                  <Label htmlFor="terms" className="text-sm cursor-pointer">
                    Aceito os termos e condições e política de cancelamento *
                  </Label>
                </div>

                <Button type="submit" className="w-full" disabled={submitting} size="lg">
                  {submitting ? 'Processando...' : 'Confirmar Reserva'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Aviso */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-yellow-900">Importante</p>
                  <p className="text-sm text-yellow-800">
                    Sua reserva será confirmada após o pagamento. Você receberá um email com as instruções de pagamento.
                    A reserva pode ser cancelada se o pagamento não for realizado até a data limite.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumo da Reserva</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-semibold">{bookingData.property_name}</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {new Date(bookingData.check_in).toLocaleDateString('pt-BR')} - {new Date(bookingData.check_out).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{bookingData.guests} {bookingData.guests === 1 ? 'hóspede' : 'hóspedes'}</span>
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>R$ {bookingData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Taxas</span>
                  <span>R$ {bookingData.taxes.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Taxa de Serviço</span>
                  <span>R$ {bookingData.service_fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-lg">R$ {bookingData.total_amount.toFixed(2)}</span>
                </div>
              </div>

              <Badge variant="outline" className="w-full justify-center py-2">
                <Clock className="w-4 h-4 mr-2" />
                Pagamento Posterior
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function PayLaterCheckoutPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    }>
      <PayLaterCheckoutContent />
    </Suspense>
  );
}

