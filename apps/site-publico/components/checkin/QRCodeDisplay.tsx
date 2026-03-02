'use client';

/**
 * Componente: Exibição de QR Code
 * Exibe o QR code do check-in e permite download/compartilhamento
 */

import { useState } from 'react';
import { Download, Share2, RefreshCw, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface QRCodeDisplayProps {
  qrCode: string; // Base64 data URL
  checkInCode: string;
  onRegenerate?: () => Promise<void>;
  loading?: boolean;
}

export function QRCodeDisplay({ 
  qrCode, 
  checkInCode, 
  onRegenerate,
  loading = false 
}: QRCodeDisplayProps) {
  const [regenerating, setRegenerating] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `checkin-qrcode-${checkInCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        // Converter base64 para blob
        const response = await fetch(qrCode);
        const blob = await response.blob();
        const file = new File([blob], `checkin-${checkInCode}.png`, { type: 'image/png' });

        await navigator.share({
          title: 'QR Code do Check-in',
          text: `Código de check-in: ${checkInCode}`,
          files: [file]
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    } else {
      // Fallback: copiar código para clipboard
      navigator.clipboard.writeText(checkInCode);
      alert('Código copiado para a área de transferência!');
    }
  };

  const handleRegenerate = async () => {
    if (!onRegenerate) return;
    
    setRegenerating(true);
    try {
      await onRegenerate();
    } catch (error) {
      console.error('Erro ao regenerar QR code:', error);
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          QR Code do Check-in
        </CardTitle>
        <CardDescription>
          Escaneie este código para realizar o check-in
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="flex justify-center bg-white p-4 rounded-lg border-2 border-dashed">
              <img
                src={qrCode}
                alt="QR Code do Check-in"
                className="max-w-full h-auto"
                style={{ maxHeight: '300px' }}
              />
            </div>

            <Alert>
              <AlertDescription>
                <strong>Código de Check-in:</strong> {checkInCode}
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleDownload}
                variant="outline"
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Baixar QR Code
              </Button>

              <Button
                onClick={handleShare}
                variant="outline"
                className="flex-1"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Compartilhar
              </Button>

              {onRegenerate && (
                <Button
                  onClick={handleRegenerate}
                  variant="outline"
                  className="flex-1"
                  disabled={regenerating}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${regenerating ? 'animate-spin' : ''}`} />
                  Regenerar
                </Button>
              )}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Mostre este QR code na recepção ou na entrada da propriedade para realizar o check-in
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

