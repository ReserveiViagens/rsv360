import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProtectedRoute from '../components/ProtectedRoute';

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
                const response = await axios.get('/api/ecommerce/products');
                setProducts(response.data);
            } catch (error) {
                console.error('Failed to fetch products', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return <div>Loading products...</div>;
    }

    return (
        <ProtectedRoute>
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-4">Our Products</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {products.map((product) => (
                        <div key={product.id} className="bg-white p-4 rounded shadow">
                            <h2 className="text-xl font-semibold">{product.name}</h2>
                            <p className="text-gray-600 mt-2">{product.description}</p>
                            <p className="text-lg font-bold mt-2">${product.price.toFixed(2)}</p>
                            <button className="mt-4 w-full bg-green-500 text-white p-2 rounded">
                                Add to Cart
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </ProtectedRoute>
    );
} 
