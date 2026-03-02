import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProtectedRoute from '../components/ProtectedRoute';

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
        axios.get('/api/inventory')
            .then(res => setItems(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading inventory...</div>;

    return (
        <ProtectedRoute>
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-4">Inventory</h1>
                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th className="px-4 py-2">ID</th>
                            <th className="px-4 py-2">Product ID</th>
                            <th className="px-4 py-2">Quantity</th>
                            <th className="px-4 py-2">Location</th>
                            <th className="px-4 py-2">SKU</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id}>
                                <td className="border px-4 py-2">{item.id}</td>
                                <td className="border px-4 py-2">{item.product_id}</td>
                                <td className="border px-4 py-2">{item.quantity}</td>
                                <td className="border px-4 py-2">{item.location}</td>
                                <td className="border px-4 py-2">{item.sku}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </ProtectedRoute>
    );
} 