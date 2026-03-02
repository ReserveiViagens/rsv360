import React, { useState } from 'react';
import axios from 'axios';
import ProtectedRoute from '../components/ProtectedRoute';

interface Recommendation {
    property_id: number;
    recommended_price: number;
    based_on_bookings: number;
}

export default function RecommendationsPage() {
    const [propertyId, setPropertyId] = useState<string>('');
    const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
    const [error, setError] = useState('');

    const handleFetchRecommendation = async () => {
        if (!propertyId) {
            setError('Please enter a Property ID.');
            return;
        }
        setError('');
        setRecommendation(null);
        try {
            const response = await axios.get(`/api/data/recommendations/price?property_id=${propertyId}`);
            setRecommendation(response.data);
        } catch (err) {
            setError('Failed to fetch recommendation. Please check the Property ID.');
        }
    };

    return (
        <ProtectedRoute>
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-4">Price Recommendations</h1>
                <div className="flex items-center gap-2 mb-4">
                    <input
                        type="number"
                        value={propertyId}
                        onChange={(e) => setPropertyId(e.target.value)}
                        placeholder="Enter Property ID"
                        className="p-2 border rounded"
                    />
                    <button onClick={handleFetchRecommendation} className="bg-blue-500 text-white p-2 rounded">
                        Get Recommendation
                    </button>
                </div>

                {error && <p className="text-red-500">{error}</p>}

                {recommendation && (
                    <div className="bg-white p-4 rounded shadow">
                        <h2 className="text-xl font-semibold">Recommendation for Property #{recommendation.property_id}</h2>
                        <p className="mt-2 text-2xl font-bold text-green-600">
                            Recommended Price: ${recommendation.recommended_price}
                        </p>
                        <p className="text-sm text-gray-500">
                            Based on {recommendation.based_on_bookings} historical bookings.
                        </p>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
} 