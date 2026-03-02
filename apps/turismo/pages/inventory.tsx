'use client'

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '../src/components/ProtectedRoute'
import { api } from '../src/services/apiClient'
import { Layers } from 'lucide-react'

interface InventoryItem {
    id: number;
    product_id: number;
    quantity: number;
    location: string;
    sku: string;
    created_at: string;
    updated_at: string;
}

export default function InventoryPage() {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const response = await api.get('/api/v1/inventory');
                // O api.get já retorna response.data
                setItems(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                console.error('Error fetching inventory:', err);
                setItems([]);
            } finally {
                setLoading(false);
            }
        };
        fetchInventory();
    }, []);

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="container mx-auto p-6">
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center gap-3">
                    <Layers className="w-8 h-8 text-indigo-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Estoque</h1>
                        <p className="text-gray-600 mt-1">Controle de estoque</p>
                    </div>
                </div>
                
                {items.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <Layers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">Nenhum item encontrado no estoque</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Produto</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localização</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {items.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.product_id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.location}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.sku}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
} 