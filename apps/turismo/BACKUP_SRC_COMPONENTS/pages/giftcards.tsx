import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProtectedRoute from '../components/ProtectedRoute';

interface GiftCard {
    id: number;
    code: string;
    amount: number;
    balance: number;
    currency: string;
    status: string;
    recipient_email: string | null;
    sender_name: string | null;
    sender_email: string | null;
    message: string | null;
    expires_at: string | null;
    used_at: string | null;
    created_at: string;
    updated_at: string;
}

interface GiftCardTransaction {
    id: number;
    gift_card_id: number;
    transaction_type: string;
    amount: number;
    description: string | null;
    order_id: number | null;
    created_at: string;
}

interface GiftCardStats {
    total_gift_cards: number;
    active_gift_cards: number;
    used_gift_cards: number;
    total_value: number;
}

export default function GiftCardsPage() {
    const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
    const [transactions, setTransactions] = useState<GiftCardTransaction[]>([]);
    const [stats, setStats] = useState<GiftCardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [showGiftCardForm, setShowGiftCardForm] = useState(false);
    const [selectedGiftCard, setSelectedGiftCard] = useState<Partial<GiftCard>>({});
    const [searchCode, setSearchCode] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [giftCardsRes, transactionsRes, statsRes] = await Promise.all([
                axios.get('/api/giftcards/giftcards/'),
                axios.get('/api/giftcards/transactions/'),
                axios.get('/api/giftcards/stats/')
            ]);
            setGiftCards(giftCardsRes.data);
            setTransactions(transactionsRes.data);
            setStats(statsRes.data);
        } catch (err) {
            console.error('Error fetching gift cards data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddGiftCard = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('/api/giftcards/giftcards/', selectedGiftCard);
            setShowGiftCardForm(false);
            setSelectedGiftCard({});
            fetchData();
        } catch (err) {
            console.error('Error adding gift card:', err);
        }
    };

    const handleCancelGiftCard = async (giftCardId: number) => {
        try {
            await axios.delete(`/api/giftcards/giftcards/${giftCardId}`);
            fetchData();
        } catch (err) {
            console.error('Error cancelling gift card:', err);
        }
    };

    const handleSearchGiftCard = async () => {
        if (!searchCode.trim()) return;
        
        try {
            const response = await axios.get(`/api/giftcards/giftcards/code/${searchCode}`);
            setGiftCards([response.data]);
        } catch (err) {
            console.error('Error searching gift card:', err);
            alert('Gift card not found');
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64">Loading gift cards...</div>;

    return (
        <ProtectedRoute>
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-6">Gift Cards Management</h1>

                {/* Statistics Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-700">Total Gift Cards</h3>
                            <p className="text-3xl font-bold text-blue-600">{stats.total_gift_cards}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-700">Active Gift Cards</h3>
                            <p className="text-3xl font-bold text-green-600">{stats.active_gift_cards}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-700">Used Gift Cards</h3>
                            <p className="text-3xl font-bold text-orange-600">{stats.used_gift_cards}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-700">Total Value</h3>
                            <p className="text-3xl font-bold text-purple-600">${stats.total_value.toFixed(2)}</p>
                        </div>
                    </div>
                )}

                {/* Search Gift Card */}
                <div className="bg-white p-6 rounded-lg shadow mb-8">
                    <h2 className="text-xl font-semibold mb-4">Search Gift Card</h2>
                    <div className="flex space-x-4">
                        <input
                            type="text"
                            placeholder="Enter gift card code"
                            value={searchCode}
                            onChange={(e) => setSearchCode(e.target.value)}
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                        />
                        <button
                            onClick={handleSearchGiftCard}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Search
                        </button>
                        <button
                            onClick={() => {
                                setSearchCode('');
                                fetchData();
                            }}
                            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                        >
                            Clear
                        </button>
                    </div>
                </div>

                {/* Gift Cards List */}
                <div className="bg-white p-6 rounded-lg shadow mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Gift Cards</h2>
                        <button
                            onClick={() => setShowGiftCardForm(true)}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            Create Gift Card
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {giftCards.map((giftCard) => (
                            <div key={giftCard.id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-semibold font-mono">{giftCard.code}</h3>
                                    <span className={`px-2 py-1 text-xs rounded ${
                                        giftCard.status === 'active' ? 'bg-green-100 text-green-800' :
                                        giftCard.status === 'used' ? 'bg-orange-100 text-orange-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {giftCard.status}
                                    </span>
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Amount:</span>
                                        <span className="font-bold">${giftCard.amount}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Balance:</span>
                                        <span className="font-bold">${giftCard.balance}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Currency:</span>
                                        <span>{giftCard.currency}</span>
                                    </div>
                                    
                                    {giftCard.recipient_email && (
                                        <div>
                                            <span className="text-gray-600">Recipient:</span>
                                            <p className="text-sm">{giftCard.recipient_email}</p>
                                        </div>
                                    )}
                                    
                                    {giftCard.message && (
                                        <div>
                                            <span className="text-gray-600">Message:</span>
                                            <p className="text-sm italic">&quot;{giftCard.message}&quot;</p>
                                        </div>
                                    )}

                                    <div className="text-xs text-gray-500">
                                        Created: {new Date(giftCard.created_at).toLocaleDateString()}
                                    </div>

                                    {giftCard.status === 'active' && (
                                        <button
                                            onClick={() => handleCancelGiftCard(giftCard.id)}
                                            className="w-full mt-2 text-red-600 hover:text-red-800 text-sm border border-red-300 rounded px-2 py-1 hover:bg-red-50"
                                        >
                                            Cancel Gift Card
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-4 py-2 text-left">Gift Card ID</th>
                                    <th className="px-4 py-2 text-left">Type</th>
                                    <th className="px-4 py-2 text-left">Amount</th>
                                    <th className="px-4 py-2 text-left">Description</th>
                                    <th className="px-4 py-2 text-left">Order ID</th>
                                    <th className="px-4 py-2 text-left">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.slice(0, 10).map((transaction) => (
                                    <tr key={transaction.id} className="border-b">
                                        <td className="px-4 py-2">{transaction.gift_card_id}</td>
                                        <td className="px-4 py-2">
                                            <span className={`px-2 py-1 text-xs rounded ${
                                                transaction.transaction_type === 'purchase' ? 'bg-green-100 text-green-800' :
                                                transaction.transaction_type === 'usage' ? 'bg-blue-100 text-blue-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {transaction.transaction_type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">${transaction.amount}</td>
                                        <td className="px-4 py-2">{transaction.description || 'N/A'}</td>
                                        <td className="px-4 py-2">{transaction.order_id || 'N/A'}</td>
                                        <td className="px-4 py-2">
                                            {new Date(transaction.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create Gift Card Form Modal */}
                {showGiftCardForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h2 className="text-xl font-semibold mb-4">Create Gift Card</h2>
                            
                            <form onSubmit={handleAddGiftCard} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={selectedGiftCard.amount || ''}
                                        onChange={(e) => setSelectedGiftCard(prev => ({...prev, amount: parseFloat(e.target.value), balance: parseFloat(e.target.value)}))}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Currency</label>
                                    <select
                                        value={selectedGiftCard.currency || 'USD'}
                                        onChange={(e) => setSelectedGiftCard(prev => ({...prev, currency: e.target.value}))}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                    >
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="BRL">BRL</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Recipient Email (optional)</label>
                                    <input
                                        type="email"
                                        value={selectedGiftCard.recipient_email || ''}
                                        onChange={(e) => setSelectedGiftCard(prev => ({...prev, recipient_email: e.target.value}))}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Sender Name (optional)</label>
                                    <input
                                        type="text"
                                        value={selectedGiftCard.sender_name || ''}
                                        onChange={(e) => setSelectedGiftCard(prev => ({...prev, sender_name: e.target.value}))}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Message (optional)</label>
                                    <textarea
                                        value={selectedGiftCard.message || ''}
                                        onChange={(e) => setSelectedGiftCard(prev => ({...prev, message: e.target.value}))}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        rows={3}
                                    />
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowGiftCardForm(false);
                                            setSelectedGiftCard({});
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                    >
                                        Create Gift Card
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
} 
