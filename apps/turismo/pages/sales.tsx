'use client'

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '../src/components/ProtectedRoute'
import { api } from '../src/services/apiClient'
import { TrendingUp } from 'lucide-react'

interface Sale {
    id: number;
    product_id: number;
    sale_date: string;
    amount: number;
    customer_id: number;
    created_at: string;
    updated_at: string;
}

export default function SalesPage() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSales = async () => {
            try {
                const response = await api.get('/api/v1/sales');
                // O api.get já retorna response.data
                setSales(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                console.error('Error fetching sales:', err);
                setSales([]);
            } finally {
                setLoading(false);
            }
        };
        fetchSales();
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
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Vendas</h1>
                        <p className="text-gray-600 mt-1">Gestão de vendas</p>
                    </div>
                </div>
                
                {sales.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">Nenhuma venda encontrada</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sales.map(s => (
                            <div key={s.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold text-gray-900">Venda #{s.id}</h2>
                                    <span className="text-lg font-bold text-green-600">R$ {s.amount.toFixed(2)}</span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">ID Produto</p>
                                        <p className="font-medium">{s.product_id}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">ID Cliente</p>
                                        <p className="font-medium">{s.customer_id}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Data</p>
                                        <p className="font-medium">{new Date(s.sale_date).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Hora</p>
                                        <p className="font-medium">{new Date(s.sale_date).toLocaleTimeString('pt-BR')}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
} 