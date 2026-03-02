'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { History, MapPin, Trash2, X } from 'lucide-react';
import { Address } from './address-form';
import { getAddressHistory, removeAddressFromHistory, type AddressHistoryItem } from '@/lib/address-history';

interface AddressHistoryProps {
  onSelectAddress: (address: Address) => void;
  currentAddress?: Address;
}

export function AddressHistory({ onSelectAddress, currentAddress }: AddressHistoryProps) {
  const [history, setHistory] = useState<AddressHistoryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setHistory(getAddressHistory());
  }, []);

  const handleSelect = (address: AddressHistoryItem) => {
    const { id, createdAt, lastUsed, useCount, ...addressData } = address;
    onSelectAddress(addressData as Address);
    setIsOpen(false);
  };

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeAddressFromHistory(id);
    setHistory(getAddressHistory());
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full"
      >
        <History className="w-4 h-4 mr-2" />
        {isOpen ? 'Ocultar' : 'Ver'} Endereços Salvos ({history.length})
      </Button>

      {isOpen && (
        <Card className="mt-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Endereços Salvos
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {history.map((item) => {
              const isCurrent = 
                currentAddress?.street === item.street &&
                currentAddress?.number === item.number &&
                currentAddress?.zipCode === item.zipCode;

              return (
                <div
                  key={item.id}
                  className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                    isCurrent ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => handleSelect(item)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {item.street}, {item.number}
                        {item.complement && ` - ${item.complement}`}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {item.neighborhood}, {item.city} - {item.state}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        CEP: {item.zipCode}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Usado {item.useCount} vez{item.useCount !== 1 ? 'es' : ''}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleRemove(item.id, e)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

