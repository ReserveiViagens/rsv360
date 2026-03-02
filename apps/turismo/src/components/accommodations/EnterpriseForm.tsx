// ===================================================================
// COMPONENTE - FORMULÁRIO DE EMPREENDIMENTO
// ===================================================================

import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, MapPin, Building2, Phone, Mail, Globe } from 'lucide-react';
import type { Enterprise, EnterpriseType } from '../../types/accommodations';

interface EnterpriseFormProps {
  enterprise?: Enterprise;
  onSubmit: (data: Partial<Enterprise>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const EnterpriseForm: React.FC<EnterpriseFormProps> = ({
  enterprise,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState<Partial<Enterprise>>({
    name: '',
    legalName: '',
    description: '',
    enterpriseType: 'hotel',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Brasil'
    },
    contact: {
      phone: '',
      email: '',
      website: ''
    },
    checkInTime: '15:00',
    checkOutTime: '11:00',
    cancellationPolicy: 'moderate',
    status: 'active',
    isFeatured: false,
    images: [],
    amenities: []
  });

  const [uploadingImages, setUploadingImages] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (enterprise) {
      setFormData({
        ...enterprise,
        images: enterprise.images || [],
        amenities: enterprise.amenities || []
      });
    }
  }, [enterprise]);

  const enterpriseTypes: { value: EnterpriseType; label: string }[] = [
    { value: 'hotel', label: 'Hotel' },
    { value: 'pousada', label: 'Pousada' },
    { value: 'resort', label: 'Resort' },
    { value: 'flat', label: 'Flat' },
    { value: 'chacara', label: 'Chácara' },
    { value: 'hostel', label: 'Hostel' },
    { value: 'apartment_hotel', label: 'Apart Hotel' },
    { value: 'resort_apartment', label: 'Apartamento de Resort' },
    { value: 'resort_house', label: 'Casa de Resort' },
    { value: 'hotel_house', label: 'Casa de Hotel' },
    { value: 'airbnb', label: 'Airbnb' },
    { value: 'other', label: 'Outro' }
  ];

  const commonAmenities = [
    'Wi-Fi', 'Piscina', 'Academia', 'Estacionamento', 'Restaurante',
    'Bar', 'Spa', 'Serviço de Quarto', 'Ar Condicionado', 'TV',
    'Cofre', 'Frigobar', 'Varanda', 'Vista para o Mar', 'Praia Privada'
  ];

  const handleChange = (field: string, value: any) => {
    if (field.startsWith('address.')) {
      const addressField = field.replace('address.', '');
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address!,
          [addressField]: value
        }
      }));
    } else if (field.startsWith('contact.')) {
      const contactField = field.replace('contact.', '');
      setFormData(prev => ({
        ...prev,
        contact: {
          ...prev.contact || {},
          [contactField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const uploadedUrls: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'enterprises');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          uploadedUrls.push(data.url || data.path);
        }
      }

      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...uploadedUrls]
      }));
    } catch (error) {
      console.error('Erro ao fazer upload de imagens:', error);
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || []
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => {
      const amenities = prev.amenities || [];
      const newAmenities = amenities.includes(amenity)
        ? amenities.filter(a => a !== amenity)
        : [...amenities, amenity];
      return { ...prev, amenities: newAmenities };
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.enterpriseType) {
      newErrors.enterpriseType = 'Tipo é obrigatório';
    }

    if (!formData.address?.city?.trim()) {
      newErrors['address.city'] = 'Cidade é obrigatória';
    }

    if (!formData.address?.state?.trim()) {
      newErrors['address.state'] = 'Estado é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações Básicas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Informações Básicas
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Empreendimento *
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Razão Social
            </label>
            <input
              type="text"
              value={formData.legalName || ''}
              onChange={(e) => handleChange('legalName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Empreendimento *
            </label>
            <select
              value={formData.enterpriseType || 'hotel'}
              onChange={(e) => handleChange('enterpriseType', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                errors.enterpriseType ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              {enterpriseTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.enterpriseType && <p className="text-red-500 text-xs mt-1">{errors.enterpriseType}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status || 'active'}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="maintenance">Manutenção</option>
              <option value="pending_approval">Aguardando Aprovação</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Descreva o empreendimento..."
          />
        </div>

        <div className="mt-4 flex items-center">
          <input
            type="checkbox"
            id="isFeatured"
            checked={formData.isFeatured || false}
            onChange={(e) => handleChange('isFeatured', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isFeatured" className="ml-2 text-sm text-gray-700">
            Destacar este empreendimento
          </label>
        </div>
      </div>

      {/* Endereço */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Endereço
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rua
            </label>
            <input
              type="text"
              value={formData.address?.street || ''}
              onChange={(e) => handleChange('address.street', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número
            </label>
            <input
              type="text"
              value={formData.address?.number || ''}
              onChange={(e) => handleChange('address.number', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Complemento
            </label>
            <input
              type="text"
              value={formData.address?.complement || ''}
              onChange={(e) => handleChange('address.complement', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bairro
            </label>
            <input
              type="text"
              value={formData.address?.neighborhood || ''}
              onChange={(e) => handleChange('address.neighborhood', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cidade *
            </label>
            <input
              type="text"
              value={formData.address?.city || ''}
              onChange={(e) => handleChange('address.city', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                errors['address.city'] ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors['address.city'] && <p className="text-red-500 text-xs mt-1">{errors['address.city']}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado *
            </label>
            <input
              type="text"
              value={formData.address?.state || ''}
              onChange={(e) => handleChange('address.state', e.target.value.toUpperCase())}
              maxLength={2}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                errors['address.state'] ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors['address.state'] && <p className="text-red-500 text-xs mt-1">{errors['address.state']}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CEP
            </label>
            <input
              type="text"
              value={formData.address?.zipCode || ''}
              onChange={(e) => handleChange('address.zipCode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              País
            </label>
            <input
              type="text"
              value={formData.address?.country || 'Brasil'}
              onChange={(e) => handleChange('address.country', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Contato */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Contato
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <input
              type="tel"
              value={formData.contact?.phone || ''}
              onChange={(e) => handleChange('contact.phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <input
              type="email"
              value={formData.contact?.email || ''}
              onChange={(e) => handleChange('contact.email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="url"
              value={formData.contact?.website || ''}
              onChange={(e) => handleChange('contact.website', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Configurações */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-in
            </label>
            <input
              type="time"
              value={formData.checkInTime || '15:00'}
              onChange={(e) => handleChange('checkInTime', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-out
            </label>
            <input
              type="time"
              value={formData.checkOutTime || '11:00'}
              onChange={(e) => handleChange('checkOutTime', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Política de Cancelamento
            </label>
            <select
              value={formData.cancellationPolicy || 'moderate'}
              onChange={(e) => handleChange('cancellationPolicy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="flexible">Flexível</option>
              <option value="moderate">Moderada</option>
              <option value="strict">Rígida</option>
              <option value="super_strict">Muito Rígida</option>
            </select>
          </div>
        </div>
      </div>

      {/* Imagens */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Imagens
        </h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adicionar Imagens
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">
              <Upload className="w-4 h-4" />
              {uploadingImages ? 'Enviando...' : 'Selecionar Imagens'}
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploadingImages}
              />
            </label>
          </div>
        </div>

        {formData.images && formData.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {formData.images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Imagem ${index + 1}`}
                  className="w-full h-32 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Amenidades */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenidades</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {commonAmenities.map(amenity => (
            <label key={amenity} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.amenities?.includes(amenity) || false}
                onChange={() => toggleAmenity(amenity)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{amenity}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Botões */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Salvando...' : enterprise ? 'Atualizar' : 'Criar'}
        </button>
      </div>
    </form>
  );
};
