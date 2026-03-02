// ===================================================================
// COMPONENTE - VISUALIZAÇÃO HIERÁRQUICA
// ===================================================================

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Building2, Home, Bed, Plus, Edit, Trash2, Eye } from 'lucide-react';
import type { Enterprise, Property, Accommodation } from '../../types/accommodations';
import { enterprisesApi, propertiesApi, accommodationsApi } from '../../services/api/accommodationsApi';

interface HierarchyViewProps {
  enterpriseId?: number;
  onSelectEnterprise?: (enterprise: Enterprise) => void;
  onSelectProperty?: (property: Property) => void;
  onSelectAccommodation?: (accommodation: Accommodation) => void;
  onEditEnterprise?: (enterprise: Enterprise) => void;
  onEditProperty?: (property: Property) => void;
  onEditAccommodation?: (accommodation: Accommodation) => void;
  onDeleteEnterprise?: (id: number) => void;
  onDeleteProperty?: (id: number) => void;
  onDeleteAccommodation?: (id: number) => void;
  showActions?: boolean;
}

export const HierarchyView: React.FC<HierarchyViewProps> = ({
  enterpriseId,
  onSelectEnterprise,
  onSelectProperty,
  onSelectAccommodation,
  onEditEnterprise,
  onEditProperty,
  onEditAccommodation,
  onDeleteEnterprise,
  onDeleteProperty,
  onDeleteAccommodation,
  showActions = true
}) => {
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [expandedEnterprises, setExpandedEnterprises] = useState<Set<number>>(new Set());
  const [expandedProperties, setExpandedProperties] = useState<Set<number>>(new Set());
  const [properties, setProperties] = useState<Record<number, Property[]>>({});
  const [accommodations, setAccommodations] = useState<Record<number, Accommodation[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEnterprises();
  }, [enterpriseId]);

  const loadEnterprises = async () => {
    try {
      setLoading(true);
      const response = await enterprisesApi.list(enterpriseId ? { id: enterpriseId } : {});
      if (response.success && response.data) {
        const data = Array.isArray(response.data) ? response.data : [response.data];
        setEnterprises(data);
        if (enterpriseId) {
          setExpandedEnterprises(new Set([enterpriseId]));
          loadProperties(enterpriseId);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar empreendimentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProperties = async (enterpriseId: number) => {
    try {
      const response = await enterprisesApi.getProperties(enterpriseId);
      if (response.success && response.data) {
        setProperties(prev => ({
          ...prev,
          [enterpriseId]: Array.isArray(response.data) ? response.data : [response.data]
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar propriedades:', error);
    }
  };

  const loadAccommodations = async (propertyId: number) => {
    try {
      const response = await propertiesApi.getAccommodations(propertyId);
      if (response.success && response.data) {
        setAccommodations(prev => ({
          ...prev,
          [propertyId]: Array.isArray(response.data) ? response.data : [response.data]
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar acomodações:', error);
    }
  };

  const toggleEnterprise = (id: number) => {
    const newExpanded = new Set(expandedEnterprises);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
      loadProperties(id);
    }
    setExpandedEnterprises(newExpanded);
  };

  const toggleProperty = (id: number) => {
    const newExpanded = new Set(expandedProperties);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
      loadAccommodations(id);
    }
    setExpandedProperties(newExpanded);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Estrutura Hierárquica</h3>
      </div>
      <div className="p-4">
        {enterprises.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Building2 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>Nenhum empreendimento encontrado</p>
          </div>
        ) : (
          <div className="space-y-1">
            {enterprises.map(enterprise => (
              <div key={enterprise.id} className="border border-gray-200 rounded-md">
                {/* Empreendimento */}
                <div className="flex items-center justify-between p-3 hover:bg-gray-50">
                  <div className="flex items-center gap-2 flex-1">
                    <button
                      onClick={() => toggleEnterprise(enterprise.id)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      {expandedEnterprises.has(enterprise.id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <button
                      onClick={() => onSelectEnterprise?.(enterprise)}
                      className="text-left flex-1 font-medium text-gray-900 hover:text-blue-600"
                    >
                      {enterprise.name}
                    </button>
                    <span className="text-xs text-gray-500">
                      {enterprise.propertiesCount || 0} propriedades
                    </span>
                  </div>
                  {showActions && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditEnterprise?.(enterprise)}
                        className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteEnterprise?.(enterprise.id)}
                        className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Deletar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Propriedades */}
                {expandedEnterprises.has(enterprise.id) && properties[enterprise.id] && (
                  <div className="ml-6 border-l-2 border-gray-200">
                    {properties[enterprise.id].map(property => (
                      <div key={property.id} className="border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center justify-between p-3 hover:bg-gray-50">
                          <div className="flex items-center gap-2 flex-1">
                            <button
                              onClick={() => toggleProperty(property.id)}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              {expandedProperties.has(property.id) ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                            <Home className="w-4 h-4 text-green-600" />
                            <button
                              onClick={() => onSelectProperty?.(property)}
                              className="text-left flex-1 text-sm text-gray-700 hover:text-green-600"
                            >
                              {property.name}
                            </button>
                            <span className="text-xs text-gray-500">
                              {property.accommodationsCount || 0} acomodações
                            </span>
                          </div>
                          {showActions && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => onEditProperty?.(property)}
                                className="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
                                title="Editar"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => onDeleteProperty?.(property.id)}
                                className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                                title="Deletar"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Acomodações */}
                        {expandedProperties.has(property.id) && accommodations[property.id] && (
                          <div className="ml-6 border-l-2 border-gray-200">
                            {accommodations[property.id].map(accommodation => (
                              <div
                                key={accommodation.id}
                                className="flex items-center justify-between p-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                              >
                                <div className="flex items-center gap-2 flex-1">
                                  <Bed className="w-3 h-3 text-purple-600" />
                                  <button
                                    onClick={() => onSelectAccommodation?.(accommodation)}
                                    className="text-left flex-1 text-xs text-gray-600 hover:text-purple-600"
                                  >
                                    {accommodation.name}
                                  </button>
                                  <span className="text-xs text-gray-400">
                                    {accommodation.maxGuests} hóspedes
                                  </span>
                                </div>
                                {showActions && (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => onEditAccommodation?.(accommodation)}
                                      className="p-1 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded"
                                      title="Editar"
                                    >
                                      <Edit className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => onDeleteAccommodation?.(accommodation.id)}
                                      className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                                      title="Deletar"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
