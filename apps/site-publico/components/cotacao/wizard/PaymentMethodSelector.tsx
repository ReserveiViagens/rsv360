'use client';

import { useEffect } from 'react';
import { CreditCard, QrCode } from 'lucide-react';
import type { PaymentMethod } from './wizard-types';
import { cn } from '@/lib/utils';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  error?: string;
}

const activeClass =
  'border-accent-lime bg-accent-lime/20 ring-2 ring-accent-lime/50 text-gray-900';

export function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
  error,
}: PaymentMethodSelectorProps) {
  useEffect(() => {
    if (selectedMethod !== 'pix' && selectedMethod !== 'credit') {
      onMethodChange('pix');
    }
  }, [selectedMethod, onMethodChange]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Informe sua preferência — o pagamento será enviado após a confirmação da proposta, via WhatsApp ou na
        página do seu roteiro.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onMethodChange('pix')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all',
            selectedMethod === 'pix'
              ? activeClass
              : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700',
          )}
        >
          <QrCode className="w-5 h-5" />
          <span className="font-semibold">Prefiro Pix</span>
        </button>
        <button
          type="button"
          onClick={() => onMethodChange('credit')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all',
            selectedMethod === 'credit'
              ? activeClass
              : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700',
          )}
        >
          <CreditCard className="w-5 h-5" />
          <span className="font-semibold">Prefiro Cartão</span>
        </button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4 text-sm text-muted-foreground">
        {selectedMethod === 'pix' ? (
          <p>
            Após gerar sua proposta, enviaremos o <strong>Pix Copia e Cola</strong> no WhatsApp ou na página do
            roteiro — sem cobrança automática nesta etapa.
          </p>
        ) : (
          <p>
            Nossa equipe entrará em contato para parcelamento no cartão após você confirmar o roteiro.
          </p>
        )}
      </div>
    </div>
  );
}
