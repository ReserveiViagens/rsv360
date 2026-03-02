'use client';

/**
 * Página: Escanear QR Code
 * Permite que staff/admin escaneiem QR codes de check-in
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, Camera, Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export default function ScanCheckinPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);

  const handleScan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setScanResult(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Você precisa estar autenticado');
      }

      const response = await fetch('/api/checkin/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao escanear QR code');
      }

      const data = await response.json();
      setScanResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao escanear QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleCameraScan = () => {
    // Em produção, integrar com API de câmera do navegador
    alert('Funcionalidade de escaneamento por câmera será implementada');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <QrCode className="h-8 w-8" />
          Escanear QR Code
        </h1>
        <p className="text-muted-foreground">
          Escaneie ou digite o código do check-in
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Escanear Check-in</CardTitle>
            <CardDescription>
              Digite o código ou escaneie o QR code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleScan} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="code">Código do Check-in</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Digite o código ou escaneie..."
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading || !code}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Escaneando...
                    </>
                  ) : (
                    <>
                      <QrCode className="mr-2 h-4 w-4" />
                      Escanear
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCameraScan}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {scanResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Check-in Encontrado
              </CardTitle>
              <CardDescription>
                Informações do check-in escaneado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge>{scanResult.checkin.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Reserva:</span>
                  <span className="text-sm">#{scanResult.checkin.booking_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Propriedade:</span>
                  <span className="text-sm">#{scanResult.checkin.property_id}</span>
                </div>
                {scanResult.user && (
                  <div className="space-y-1 pt-2 border-t">
                    <p className="text-sm font-medium">Hóspede:</p>
                    <p className="text-sm">{scanResult.user.name}</p>
                    <p className="text-xs text-muted-foreground">{scanResult.user.email}</p>
                  </div>
                )}
                {scanResult.documents && scanResult.documents.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium mb-2">Documentos:</p>
                    <div className="space-y-1">
                      {scanResult.documents.map((doc: any) => (
                        <div key={doc.id} className="flex items-center justify-between text-xs">
                          <span>{doc.document_type}</span>
                          <Badge variant={doc.is_verified ? 'default' : 'secondary'}>
                            {doc.is_verified ? 'Verificado' : 'Pendente'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {scanResult.access_codes && scanResult.access_codes.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium mb-2">Códigos de Acesso:</p>
                    <div className="space-y-1">
                      {scanResult.access_codes.map((code: any) => (
                        <div key={code.id} className="text-xs">
                          <span className="font-mono">{code.code}</span>
                          <span className="text-muted-foreground ml-2">
                            (Válido até {new Date(code.valid_until).toLocaleDateString('pt-BR')})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={() => router.push(`/checkin/${scanResult.checkin.id}`)}
                className="w-full"
              >
                Ver Detalhes Completos
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

