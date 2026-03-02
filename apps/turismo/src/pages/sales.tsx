import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProtectedRoute from '../components/ProtectedRoute';

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
        axios.get('/api/sales')
            .then(res => setSales(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading sales...</div>;

    return (
        <ProtectedRoute>
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-4">Sales</h1>
                <ul className="space-y-4">
                    {sales.map(s => (
                        <li key={s.id}>
                            <div className="bg-white p-4 rounded shadow">
                                <h2 className="text-xl font-semibold">Sale ID: {s.id}</h2>
                                <p>Product ID: {s.product_id}</p>
                                <p>Date: {new Date(s.sale_date).toLocaleString()}</p>
                                <p>Amount: ${s.amount.toFixed(2)}</p>
                                <p>Customer ID: {s.customer_id}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </ProtectedRoute>
    );
} 