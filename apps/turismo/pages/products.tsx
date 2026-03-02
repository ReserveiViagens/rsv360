'use client'

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '../src/components/ProtectedRoute'
import { api } from '../src/services/apiClient'
import { Package } from 'lucide-react'

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get('/api/v1/products');
                // O api.get já retorna response.data
                setProducts(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error('Failed to fetch products', error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
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
                    <Package className="w-8 h-8 text-green-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
                        <p className="text-gray-600 mt-1">Catálogo de produtos</p>
                    </div>
                </div>
                
                {products.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">Nenhum produto encontrado</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <div key={product.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h2>
                                <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                                <p className="text-2xl font-bold text-green-600 mb-4">R$ {product.price.toFixed(2)}</p>
                                <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                                    Adicionar ao Carrinho
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
} 
