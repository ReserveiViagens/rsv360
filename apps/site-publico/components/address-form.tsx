'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { fetchAddressByCep, isValidCep } from '@/lib/viacep';
import { useToast } from '@/components/providers/toast-wrapper';
import { AddressHistory } from './address-history';

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

interface AddressFormProps {
  address: Address;
  onChange: (address: Address) => void;
  showHistory?: boolean;
}

export function AddressForm({ address, onChange, showHistory = true }: AddressFormProps) {
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [cepStatus, setCepStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [autocompleteInput, setAutocompleteInput] = useState('');
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<any[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isLoadingAutocomplete, setIsLoadingAutocomplete] = useState(false);
  const toast = useToast();

  const updateField = (field: keyof Address, value: string) => {
    onChange({ ...address, [field]: value });
  };

  // Buscar endereço por CEP quando CEP for preenchido completamente
  useEffect(() => {
    const cleanCep = address.zipCode.replace(/\D/g, '');
    
    // Só buscar se CEP estiver completo, não estiver carregando e ainda não foi buscado com sucesso
    if (cleanCep.length === 8 && isValidCep(address.zipCode) && !isLoadingCep && cepStatus !== 'success') {
      const timeoutId = setTimeout(() => {
        handleCepSearch(address.zipCode);
      }, 500); // Debounce de 500ms
      
      return () => clearTimeout(timeoutId);
    } else if (cleanCep.length < 8) {
      setCepStatus('idle');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address.zipCode]);

  const handleCepSearch = async (cep: string) => {
    if (!isValidCep(cep)) {
      return;
    }

    setIsLoadingCep(true);
    setCepStatus('loading');

    try {
      const addressData = await fetchAddressByCep(cep);

      if (addressData) {
        onChange({
          ...address,
          street: addressData.street,
          neighborhood: addressData.neighborhood,
          city: addressData.city,
          state: addressData.state,
          zipCode: addressData.zipCode,
          complement: addressData.complement || address.complement,
        });
        setCepStatus('success');
        toast.success('Endereço encontrado!');
      } else {
        setCepStatus('error');
        toast.warning('CEP não encontrado. Preencha o endereço manualmente.');
      }
    } catch (error) {
      setCepStatus('error');
      toast.error('Erro ao buscar CEP. Tente novamente.');
    } finally {
      setIsLoadingCep(false);
    }
  };

  // Autocomplete de endereço
  const handleAutocompleteSearch = async (value: string) => {
    setAutocompleteInput(value);
    
    if (value.length < 3) {
      setAutocompleteSuggestions([]);
      setShowAutocomplete(false);
      return;
    }

    setIsLoadingAutocomplete(true);
    try {
      const suggestions = await searchPlaces(value);
      setAutocompleteSuggestions(suggestions);
      setShowAutocomplete(suggestions.length > 0);
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
    } finally {
      setIsLoadingAutocomplete(false);
    }
  };

  const handleSelectPlace = async (placeId: string) => {
    try {
      const details = await getPlaceDetails(placeId);
      if (details) {
        const addressData = placeDetailsToAddress(details);
        onChange({
          ...address,
          ...addressData,
        });
        setAutocompleteInput('');
        setShowAutocomplete(false);
        toast.success('Endereço preenchido automaticamente!');
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error);
      toast.error('Erro ao preencher endereço');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Endereço do Responsável
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showHistory && (
          <AddressHistory
            onSelectAddress={onChange}
            currentAddress={address}
          />
        )}

        {/* Autocomplete de Endereço */}
        <div className="relative">
          <Label htmlFor="autocomplete">
            Buscar Endereço (Autocomplete)
          </Label>
          <div className="relative">
            <Input
              id="autocomplete"
              value={autocompleteInput}
              onChange={(e) => handleAutocompleteSearch(e.target.value)}
              placeholder="Digite o endereço para buscar automaticamente..."
              className="w-full"
            />
            {isLoadingAutocomplete && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              </div>
            )}
          </div>
          {showAutocomplete && autocompleteSuggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {autocompleteSuggestions.map((suggestion) => (
                <button
                  key={suggestion.place_id}
                  type="button"
                  onClick={() => handleSelectPlace(suggestion.place_id)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b last:border-b-0"
                >
                  <p className="font-medium text-sm">{suggestion.structured_formatting.main_text}</p>
                  <p className="text-xs text-gray-500">{suggestion.structured_formatting.secondary_text}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <Label htmlFor="street">
              Rua/Avenida <span className="text-red-500">*</span>
            </Label>
            <Input
              id="street"
              value={address.street}
              onChange={(e) => updateField('street', e.target.value)}
              placeholder="Nome da rua ou avenida"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="number">
              Número <span className="text-red-500">*</span>
            </Label>
            <Input
              id="number"
              value={address.number}
              onChange={(e) => updateField('number', e.target.value)}
              placeholder="123"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="complement">Complemento (Opcional)</Label>
          <Input
            id="complement"
            value={address.complement || ''}
            onChange={(e) => updateField('complement', e.target.value)}
            placeholder="Apto, Bloco, etc."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="neighborhood">
              Bairro <span className="text-red-500">*</span>
            </Label>
            <Input
              id="neighborhood"
              value={address.neighborhood}
              onChange={(e) => updateField('neighborhood', e.target.value)}
              placeholder="Nome do bairro"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="city">
              Cidade <span className="text-red-500">*</span>
            </Label>
            <Input
              id="city"
              value={address.city}
              onChange={(e) => updateField('city', e.target.value)}
              placeholder="Nome da cidade"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label htmlFor="state">
              Estado (UF) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="state"
              value={address.state}
              onChange={(e) => updateField('state', e.target.value.toUpperCase())}
              placeholder="GO"
              maxLength={2}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="zipCode">
              CEP <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="zipCode"
                value={address.zipCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  const formatted = value.replace(/(\d{5})(\d{3})/, '$1-$2');
                  updateField('zipCode', formatted);
                }}
                placeholder="00000-000"
                maxLength={9}
                required
                className={cepStatus === 'success' ? 'border-green-500' : cepStatus === 'error' ? 'border-red-500' : ''}
              />
              {isLoadingCep && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                </div>
              )}
              {cepStatus === 'success' && !isLoadingCep && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              )}
              {cepStatus === 'error' && !isLoadingCep && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                </div>
              )}
            </div>
            {address.zipCode && address.zipCode.length === 9 && !isLoadingCep && cepStatus === 'idle' && (
              <p className="text-xs text-gray-500 mt-1">
                Digite o CEP completo para buscar automaticamente
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="country">País</Label>
            <Input
              id="country"
              value={address.country || 'Brasil'}
              onChange={(e) => updateField('country', e.target.value)}
              placeholder="Brasil"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

