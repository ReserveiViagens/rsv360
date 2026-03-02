'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CheckinFormProps {
  bookingId: number;
  propertyId: number;
  userId: number;
}

export default function CheckinForm({ bookingId, propertyId, userId }: CheckinFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Dados, 2: Documentos, 3: Contrato
  const [formData, setFormData] = useState({
    scheduled_checkin_date: '',
    scheduled_checkin_time: '14:00',
  });
  const [documents, setDocuments] = useState<{
    rg?: File;
    cpf?: File;
    selfie?: File;
  }>({});
  const [contractSigned, setContractSigned] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Passo 1: Criar check-in
      const checkinResponse = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          property_id: propertyId,
          user_id: userId,
          ...formData,
        }),
      });

      if (!checkinResponse.ok) throw new Error('Erro ao criar check-in');

      const { checkin_id } = await checkinResponse.json();

      // Passo 2: Upload de documentos
      if (documents.rg || documents.cpf || documents.selfie) {
        for (const [type, file] of Object.entries(documents)) {
          if (file) {
            const formData = new FormData();
            formData.append('checkin_id', checkin_id.toString());
            formData.append('booking_id', bookingId.toString());
            formData.append('document_type', type);
            formData.append('file', file);

            await fetch('/api/checkin/documents', {
              method: 'POST',
              body: formData,
            });
          }
        }
      }

      // Passo 3: Completar check-in
      const completeResponse = await fetch(`/api/checkin/${checkin_id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documents_verified: true,
          contract_signed: contractSigned,
        }),
      });

      if (!completeResponse.ok) throw new Error('Erro ao completar check-in');

      const data = await completeResponse.json();
      
      alert('Check-in concluído! Instruções enviadas por email e WhatsApp.');
      router.push(`/minhas-reservas`);
    } catch (error) {
      console.error('Erro no check-in:', error);
      alert('Erro ao processar check-in. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(type: 'rg' | 'cpf' | 'selfie', file: File | null) {
    setDocuments((prev) => ({ ...prev, [type]: file || undefined }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Passo 1: Data e hora */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Data e Hora de Check-in</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Data</label>
            <input
              type="date"
              required
              value={formData.scheduled_checkin_date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, scheduled_checkin_date: e.target.value }))
              }
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Hora</label>
            <input
              type="time"
              required
              value={formData.scheduled_checkin_time}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, scheduled_checkin_time: e.target.value }))
              }
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Próximo: Documentos
          </button>
        </div>
      )}

      {/* Passo 2: Documentos */}
      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Upload de Documentos</h3>
          <div>
            <label className="block text-sm font-medium mb-1">RG (Frente)</label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => handleFileChange('rg', e.target.files?.[0] || null)}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">CPF</label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => handleFileChange('cpf', e.target.files?.[0] || null)}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Selfie</label>
            <input
              type="file"
              accept="image/*"
              capture="user"
              onChange={(e) => handleFileChange('selfie', e.target.files?.[0] || null)}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Próximo: Contrato
            </button>
          </div>
        </div>
      )}

      {/* Passo 3: Contrato */}
      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Contrato Digital</h3>
          <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
            <p className="text-sm text-gray-600">
              {/* Conteúdo do contrato será carregado aqui */}
              Contrato de Locação Temporária...
            </p>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={contractSigned}
              onChange={(e) => setContractSigned(e.target.checked)}
              required
            />
            <span className="text-sm">Li e aceito os termos do contrato</span>
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={loading || !contractSigned}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Processando...' : 'Concluir Check-in'}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}

