'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, User, AlertCircle, CheckCircle } from 'lucide-react';
import { validateCPFCNPJ } from '@/lib/cpf-validator';
import { formatCPFCNPJ } from '@/lib/validations';

export interface Guest {
  id: string;
  name: string;
  age: number | '';
  document?: string;
}

interface GuestsFormProps {
  guests: Guest[];
  onChange: (guests: Guest[]) => void;
  totalGuests: number;
  responsibleName: string;
}

export function GuestsForm({ guests, onChange, totalGuests, responsibleName }: GuestsFormProps) {
  const [documentErrors, setDocumentErrors] = useState<Record<string, boolean>>({});

  const addGuest = () => {
    const newGuest: Guest = {
      id: `guest-${Date.now()}-${Math.random()}`,
      name: '',
      age: '',
    };
    onChange([...guests, newGuest]);
  };

  const removeGuest = (id: string) => {
    onChange(guests.filter(g => g.id !== id));
    // Remover erro do documento quando remover hóspede
    const newErrors = { ...documentErrors };
    delete newErrors[id];
    setDocumentErrors(newErrors);
  };

  const updateGuest = (id: string, field: keyof Guest, value: string | number) => {
    const updatedGuests = guests.map(g => 
      g.id === id ? { ...g, [field]: value } : g
    );
    onChange(updatedGuests);

    // Validar CPF/CNPJ quando campo document for atualizado
    if (field === 'document' && typeof value === 'string') {
      const cleanDoc = value.replace(/\D/g, '');
      if (cleanDoc.length >= 11) {
        const isValid = validateCPFCNPJ(value);
        setDocumentErrors(prev => ({
          ...prev,
          [id]: !isValid && cleanDoc.length > 0,
        }));
      } else {
        // Remover erro se documento ainda está sendo digitado
        setDocumentErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[id];
          return newErrors;
        });
      }
    }
  };

  // Calcular quantos hóspedes ainda podem ser adicionados
  const remainingGuests = totalGuests - guests.length - (responsibleName ? 1 : 0);
  const canAddMore = remainingGuests > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Informações dos Hóspedes
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Responsável: <strong>{responsibleName || 'Não informado'}</strong>
        </p>
        <p className="text-sm text-gray-600">
          Total de hóspedes: {totalGuests} | Adicionados: {guests.length + (responsibleName ? 1 : 0)}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {guests.map((guest, index) => (
          <div key={guest.id} className="p-4 border rounded-lg space-y-3 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Hóspede {index + 1}</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeGuest(guest.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor={`guest-name-${guest.id}`}>
                  Nome Completo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`guest-name-${guest.id}`}
                  value={guest.name}
                  onChange={(e) => updateGuest(guest.id, 'name', e.target.value)}
                  placeholder="Nome completo do hóspede"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor={`guest-age-${guest.id}`}>
                  Idade <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`guest-age-${guest.id}`}
                  type="number"
                  min="0"
                  max="120"
                  value={guest.age}
                  onChange={(e) => updateGuest(guest.id, 'age', e.target.value ? parseInt(e.target.value) : '')}
                  placeholder="Idade"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor={`guest-document-${guest.id}`}>
                  CPF/Passaporte (Opcional)
                </Label>
                <div className="relative">
                  <Input
                    id={`guest-document-${guest.id}`}
                    value={guest.document || ''}
                    onChange={(e) => {
                      const formatted = formatCPFCNPJ(e.target.value);
                      updateGuest(guest.id, 'document', formatted);
                    }}
                    placeholder="000.000.000-00 ou passaporte"
                    className={documentErrors[guest.id] ? 'border-red-500 pr-10' : ''}
                  />
                  {guest.document && guest.document.replace(/\D/g, '').length >= 11 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {documentErrors[guest.id] ? (
                        <AlertCircle className="w-4 h-4 text-red-600" title="CPF/CNPJ inválido" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-600" title="CPF/CNPJ válido" />
                      )}
                    </div>
                  )}
                </div>
                {documentErrors[guest.id] && (
                  <p className="text-xs text-red-600 mt-1">
                    CPF/CNPJ inválido. Verifique os dígitos.
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}

        {canAddMore && (
          <Button
            type="button"
            variant="outline"
            onClick={addGuest}
            className="w-full border-dashed"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Hóspede ({remainingGuests} restante{remainingGuests !== 1 ? 's' : ''})
          </Button>
        )}

        {!canAddMore && guests.length > 0 && (
          <p className="text-sm text-center text-gray-500">
            Todos os hóspedes foram adicionados
          </p>
        )}

        {guests.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">
              O responsável pela reserva será contado como hóspede.
            </p>
            {canAddMore && (
              <p className="text-sm mt-2">
                Clique em "Adicionar Hóspede" para incluir outros hóspedes.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

