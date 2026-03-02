import React, { useState, useEffect } from 'react';
import { CreditCard, Lock, Shield, CheckCircle, AlertCircle, Clock, DollarSign, Calendar, User, MapPin, CreditCard as CardIcon, Smartphone, QrCode } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select, SelectOption } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { cn } from '../../utils/cn';

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'pix' | 'boleto' | 'transfer';
  name: string;
  icon: React.ReactNode;
  description: string;
  processingTime: string;
  fees: number;
  available: boolean;
}

export interface PaymentData {
  amount: number;
  currency: string;
  description: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  installments: number;
  saveCard: boolean;
}

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
  initialData?: Partial<PaymentData>;
  className?: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'credit_card',
    type: 'credit_card',
    name: 'Cartão de Crédito',
    icon: <CardIcon className="w-5 h-5" />,
    description: 'Visa, Mastercard, Elo e outros',
    processingTime: 'Imediato',
    fees: 0,
    available: true
  },
  {
    id: 'pix',
    type: 'pix',
    name: 'PIX',
    icon: <QrCode className="w-5 h-5" />,
    description: 'Pagamento instantâneo',
    processingTime: 'Imediato',
    fees: 0,
    available: true
  },
  {
    id: 'boleto',
    type: 'boleto',
    name: 'Boleto Bancário',
    icon: <CreditCard className="w-5 h-5" />,
    description: 'Vencimento em até 3 dias úteis',
    processingTime: '3 dias úteis',
    fees: 2.49,
    available: true
  },
  {
    id: 'transfer',
    type: 'transfer',
    name: 'Transferência Bancária',
    icon: <CreditCard className="w-5 h-5" />,
    description: 'TED ou DOC',
    processingTime: '1 dia útil',
    fees: 0,
    available: true
  }
];

const cardBrands: SelectOption[] = [
  { value: 'visa', label: 'Visa', icon: '💳' },
  { value: 'mastercard', label: 'Mastercard', icon: '💳' },
  { value: 'elo', label: 'Elo', icon: '💳' },
  { value: 'amex', label: 'American Express', icon: '💳' },
  { value: 'hipercard', label: 'Hipercard', icon: '💳' }
];

const installmentsOptions: SelectOption[] = [
  { value: '1', label: '1x sem juros' },
  { value: '2', label: '2x sem juros' },
  { value: '3', label: '3x sem juros' },
  { value: '4', label: '4x sem juros' },
  { value: '5', label: '5x sem juros' },
  { value: '6', label: '6x sem juros' },
  { value: '7', label: '7x com juros' },
  { value: '8', label: '8x com juros' },
  { value: '9', label: '9x com juros' },
  { value: '10', label: '10x com juros' },
  { value: '11', label: '11x com juros' },
  { value: '12', label: '12x com juros' }
];

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
  initialData,
  className
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(paymentMethods[0]);
  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount: initialData?.amount || 0,
    currency: initialData?.currency || 'BRL',
    description: initialData?.description || '',
    customerId: initialData?.customerId || '',
    customerName: initialData?.customerName || '',
    customerEmail: initialData?.customerEmail || '',
    customerPhone: initialData?.customerPhone || '',
    billingAddress: initialData?.billingAddress || {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Brasil'
    },
    installments: 1,
    saveCard: false
  });

  const [cardData, setCardData] = useState({
    number: '',
    holderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    brand: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'method' | 'details' | 'processing' | 'success' | 'error'>('method');

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setCurrentStep('details');
  };

  const handleInputChange = (field: keyof PaymentData, value: any) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const handleCardInputChange = (field: keyof typeof cardData, value: string) => {
    setCardData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotal = () => {
    const method = selectedMethod;
    const baseAmount = paymentData.amount;
    const fees = method.fees;
    const total = baseAmount + (baseAmount * (fees / 100));
    
    if (paymentData.installments > 1 && paymentData.installments > 6) {
      // Apply interest for installments > 6
      const interestRate = 0.0199; // 1.99% per month
      const interest = total * interestRate * (paymentData.installments - 6);
      return total + interest;
    }
    
    return total;
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    setCurrentStep('processing');

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate success (90% success rate)
      if (Math.random() > 0.1) {
        const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setCurrentStep('success');
        setTimeout(() => {
          onSuccess(paymentId);
          onClose();
        }, 2000);
      } else {
        throw new Error('Falha na transação');
      }
    } catch (error) {
      setCurrentStep('error');
      onError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderMethodSelection = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Escolha o método de pagamento</h3>
        <p className="text-gray-600">Selecione a forma de pagamento mais conveniente</p>
      </div>

      <div className="grid gap-3">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={cn(
              'p-4 border rounded-lg cursor-pointer transition-all',
              selectedMethod.id === method.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            )}
            onClick={() => handleMethodSelect(method)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                {method.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{method.name}</h4>
                <p className="text-sm text-gray-600">{method.description}</p>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                  <span>Processamento: {method.processingTime}</span>
                  {method.fees > 0 && <span>Taxa: {method.fees}%</span>}
                </div>
              </div>
              <div className="text-right">
                <Badge className={method.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {method.available ? 'Disponível' : 'Indisponível'}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPaymentDetails = () => (
    <div className="space-y-6">
      {/* Payment Summary */}
      <Card className="p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">Resumo do Pagamento</h4>
          <Badge className="bg-blue-100 text-blue-800">
            {selectedMethod.name}
          </Badge>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Valor:</span>
            <span className="font-medium">R$ {paymentData.amount.toFixed(2)}</span>
          </div>
          {selectedMethod.fees > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Taxa ({selectedMethod.fees}%):</span>
              <span className="font-medium">R$ {(paymentData.amount * selectedMethod.fees / 100).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t">
            <span className="font-medium text-gray-900">Total:</span>
            <span className="font-bold text-lg text-gray-900">R$ {calculateTotal().toFixed(2)}</span>
          </div>
        </div>
      </Card>

      {/* Customer Information */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Informações do Cliente</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo
            </label>
            <Input
              value={paymentData.customerName}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              placeholder="Digite o nome completo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <Input
              type="email"
              value={paymentData.customerEmail}
              onChange={(e) => handleInputChange('customerEmail', e.target.value)}
              placeholder="email@exemplo.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefone
            </label>
            <Input
              value={paymentData.customerPhone}
              onChange={(e) => handleInputChange('customerPhone', e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parcelas
            </label>
            <Select
              value={installmentsOptions.find(opt => opt.value === paymentData.installments.toString())}
              options={installmentsOptions}
              onChange={(option) => handleInputChange('installments', parseInt(option.value))}
              placeholder="Selecione as parcelas"
            />
          </div>
        </div>
      </div>

      {/* Payment Method Specific Fields */}
      {selectedMethod.type === 'credit_card' && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Dados do Cartão</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número do Cartão
              </label>
              <Input
                value={cardData.number}
                onChange={(e) => handleCardInputChange('number', formatCardNumber(e.target.value))}
                placeholder="0000 0000 0000 0000"
                maxLength={19}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome no Cartão
              </label>
              <Input
                value={cardData.holderName}
                onChange={(e) => handleCardInputChange('holderName', e.target.value)}
                placeholder="Como está impresso no cartão"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mês de Expiração
              </label>
              <Select
                value={{ value: cardData.expiryMonth, label: cardData.expiryMonth || 'Mês' }}
                options={Array.from({ length: 12 }, (_, i) => ({
                  value: String(i + 1).padStart(2, '0'),
                  label: String(i + 1).padStart(2, '0')
                }))}
                onChange={(option) => handleCardInputChange('expiryMonth', option.value)}
                placeholder="Mês"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ano de Expiração
              </label>
              <Select
                value={{ value: cardData.expiryYear, label: cardData.expiryYear || 'Ano' }}
                options={Array.from({ length: 10 }, (_, i) => {
                  const year = new Date().getFullYear() + i;
                  return { value: String(year), label: String(year) };
                })}
                onChange={(option) => handleCardInputChange('expiryYear', option.value)}
                placeholder="Ano"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVV
              </label>
              <Input
                value={cardData.cvv}
                onChange={(e) => handleCardInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                placeholder="123"
                maxLength={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bandeira
              </label>
              <Select
                value={cardBrands.find(brand => brand.value === cardData.brand)}
                options={cardBrands}
                onChange={(option) => handleCardInputChange('brand', option.value)}
                placeholder="Selecione a bandeira"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="save-card"
              checked={paymentData.saveCard}
              onChange={(e) => handleInputChange('saveCard', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
              aria-label="Salvar cartão para futuras compras"
            />
            <label htmlFor="save-card" className="text-sm text-gray-700">
              Salvar cartão para futuras compras
            </label>
          </div>
        </div>
      )}

      {selectedMethod.type === 'pix' && (
        <div className="text-center py-8">
          <div className="w-24 h-24 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <QrCode className="w-12 h-12 text-green-600" />
          </div>
          <h4 className="font-medium text-gray-900 mb-2">Pagamento via PIX</h4>
          <p className="text-gray-600 mb-4">
            O QR Code será gerado após confirmar o pagamento
          </p>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Valor:</strong> R$ {calculateTotal().toFixed(2)}<br />
              <strong>Vencimento:</strong> Imediato
            </p>
          </div>
        </div>
      )}

      {selectedMethod.type === 'boleto' && (
        <div className="text-center py-8">
          <div className="w-24 h-24 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-12 h-12 text-blue-600" />
          </div>
          <h4 className="font-medium text-gray-900 mb-2">Boleto Bancário</h4>
          <p className="text-gray-600 mb-4">
            O boleto será gerado após confirmar o pagamento
          </p>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Valor:</strong> R$ {calculateTotal().toFixed(2)}<br />
              <strong>Vencimento:</strong> 3 dias úteis<br />
              <strong>Taxa:</strong> R$ {selectedMethod.fees.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Pagamento Seguro</p>
            <p>Seus dados estão protegidos com criptografia SSL de 256 bits. Não armazenamos informações sensíveis do cartão.</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => setCurrentStep('method')}
        >
          Voltar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!paymentData.customerName || !paymentData.customerEmail}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Lock className="w-4 h-4 mr-2" />
          Finalizar Pagamento
        </Button>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Processando Pagamento</h3>
      <p className="text-gray-600">Aguarde enquanto processamos sua transação...</p>
      <div className="mt-6 space-y-2 text-sm text-gray-500">
        <p>✓ Validando dados</p>
        <p>✓ Conectando com gateway</p>
        <p>⏳ Processando transação</p>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Pagamento Aprovado!</h3>
      <p className="text-gray-600 mb-6">Sua transação foi processada com sucesso.</p>
      <div className="bg-green-50 p-4 rounded-lg mb-6">
        <p className="text-sm text-green-800">
          <strong>Valor:</strong> R$ {calculateTotal().toFixed(2)}<br />
          <strong>Método:</strong> {selectedMethod.name}<br />
          <strong>Status:</strong> Aprovado
        </p>
      </div>
      <p className="text-sm text-gray-500">
        Um email de confirmação foi enviado para {paymentData.customerEmail}
      </p>
    </div>
  );

  const renderError = () => (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <AlertCircle className="w-12 h-12 text-red-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Erro no Pagamento</h3>
      <p className="text-gray-600 mb-6">Não foi possível processar sua transação.</p>
      <div className="bg-red-50 p-4 rounded-lg mb-6">
        <p className="text-sm text-red-800">
          Verifique os dados informados e tente novamente. Se o problema persistir, entre em contato com nosso suporte.
        </p>
      </div>
      <div className="flex justify-center gap-3">
        <Button
          variant="outline"
          onClick={() => setCurrentStep('details')}
        >
          Tentar Novamente
        </Button>
        <Button
          onClick={onClose}
        >
          Fechar
        </Button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentStep) {
      case 'method':
        return renderMethodSelection();
      case 'details':
        return renderPaymentDetails();
      case 'processing':
        return renderProcessing();
      case 'success':
        return renderSuccess();
      case 'error':
        return renderError();
      default:
        return renderMethodSelection();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pagamento Seguro"
      size="2xl"
      className={className}
    >
      <div className="min-h-[600px]">
        {renderContent()}
      </div>
    </Modal>
  );
};

export { PaymentModal };
export type { PaymentMethod, PaymentData, PaymentModalProps };
