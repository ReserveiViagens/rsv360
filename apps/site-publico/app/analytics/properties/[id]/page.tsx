'use client';

/**
 * Página de detalhe da propriedade (Analytics drill-down)
 */

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BookingBreakdownTable,
  type BookingBreakdownItem,
} from '@/components/analytics/BookingBreakdownTable';

interface PropertyDetailPageProps {
  params: Promise<{ id: string }>;
}

interface PropertyDetailData {
  property_id: number;
  property_name: string;
  summary: {
    bookings: number;
    revenue: number;
    avg_booking_value: number;
  };
  bookings: BookingBreakdownItem[];
}

export default function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const propertyId = parseInt(id, 10);

  const [data, setData] = useState<PropertyDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Number.isNaN(propertyId) || propertyId <= 0) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/analytics/properties/${propertyId}`);
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Erro ao carregar propriedade');
        }
        setData(result.data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [propertyId]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  if (Number.isNaN(propertyId) || propertyId <= 0) {
    return (
      <div className="container mx-auto py-6">
        <p className="text-red-600">ID de propriedade inválido.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/analytics')}>
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/analytics')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">
              {data?.property_name || `Propriedade #${propertyId}`}
            </h1>
            <p className="text-gray-500 text-sm">ID {propertyId}</p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {data && !loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Reservas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.summary.bookings}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Receita Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(data.summary.revenue)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Ticket Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(data.summary.avg_booking_value)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Reservas desta propriedade</CardTitle>
            </CardHeader>
            <CardContent>
              <BookingBreakdownTable
                bookings={data.bookings}
                showProperty={false}
                showCustomer
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
