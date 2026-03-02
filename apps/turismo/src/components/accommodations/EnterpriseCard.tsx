// ===================================================================
// COMPONENTE - CARD DE EMPREENDIMENTO
// ===================================================================

import React from 'react';
import Link from 'next/link';
import { Building2, MapPin, Phone, Mail, Globe, Star, Edit, Trash2 } from 'lucide-react';
import type { Enterprise } from '../../types/accommodations';

interface EnterpriseCardProps {
  enterprise: Enterprise;
  onEdit?: (enterprise: Enterprise) => void;
  onDelete?: (id: number) => void;
  showActions?: boolean;
}

export const EnterpriseCard: React.FC<EnterpriseCardProps> = ({
  enterprise,
  onEdit,
  onDelete,
  showActions = true
}) => {
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      hotel: 'Hotel',
      pousada: 'Pousada',
      resort: 'Resort',
      flat: 'Flat',
      chacara: 'Chácara',
      hostel: 'Hostel',
      apartment_hotel: 'Apart Hotel',
      resort_apartment: 'Apartamento de Resort',
      resort_house: 'Casa de Resort',
      hotel_house: 'Casa de Hotel',
      airbnb: 'Airbnb',
      other: 'Outro'
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      pending_approval: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* Imagem */}
      {enterprise.images && enterprise.images.length > 0 && (
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={enterprise.images[0]}
            alt={enterprise.name}
            className="w-full h-full object-cover"
          />
          {enterprise.isFeatured && (
            <div className="absolute top-2 right-2">
              <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <Star className="w-3 h-3" />
                Destaque
              </span>
            </div>
          )}
        </div>
      )}

      {/* Conteúdo */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {enterprise.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building2 className="w-4 h-4" />
              <span>{getTypeLabel(enterprise.enterpriseType)}</span>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(enterprise.status)}`}>
            {enterprise.status}
          </span>
        </div>

        {/* Localização */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <MapPin className="w-4 h-4" />
          <span>
            {enterprise.address.city}, {enterprise.address.state}
          </span>
        </div>

        {/* Descrição */}
        {enterprise.description && (
          <p className="text-sm text-gray-700 mb-3 line-clamp-2">
            {enterprise.description}
          </p>
        )}

        {/* Contato */}
        <div className="space-y-1 mb-3">
          {enterprise.contact?.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{enterprise.contact.phone}</span>
            </div>
          )}
          {enterprise.contact?.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4" />
              <span>{enterprise.contact.email}</span>
            </div>
          )}
          {enterprise.contact?.website && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Globe className="w-4 h-4" />
              <a
                href={enterprise.contact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Website
              </a>
            </div>
          )}
        </div>

        {/* Estatísticas */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          {enterprise.propertiesCount !== undefined && (
            <span>
              <strong className="text-gray-900">{enterprise.propertiesCount}</strong> Propriedades
            </span>
          )}
          {enterprise.accommodationsCount !== undefined && (
            <span>
              <strong className="text-gray-900">{enterprise.accommodationsCount}</strong> Acomodações
            </span>
          )}
        </div>

        {/* Ações */}
        {showActions && (
          <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
            <Link
              href={`/accommodations/enterprises/${enterprise.id}`}
              className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Ver Detalhes
            </Link>
            {onEdit && (
              <button
                onClick={() => onEdit(enterprise)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="Editar"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(enterprise.id)}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Deletar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
