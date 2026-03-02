import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProtectedRoute from '../components/ProtectedRoute';

interface Subscription {
    id: number;
    user_id: number;
    plan_name: string;
    plan_type: string;
    price: number;
    status: string;
    start_date: string;
    end_date: string | null;
    auto_renew: boolean;
    payment_method: string | null;
    features: string | null;
    created_at: string;
    updated_at: string;
}

interface SubscriptionPlan {
    id: number;
    name: string;
    description: string | null;
    price: number;
    duration_months: number;
    features: string | null;
    is_active: boolean;
    max_users: number | null;
    max_storage_gb: number | null;
    created_at: string;
}

interface SubscriptionStats {
    total_subscriptions: number;
    active_subscriptions: number;
    cancelled_subscriptions: number;
    total_revenue: number;
}

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [stats, setStats] = useState<SubscriptionStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPlanForm, setShowPlanForm] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<Partial<SubscriptionPlan>>({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [subscriptionsRes, plansRes, statsRes] = await Promise.all([
                axios.get('/api/subscriptions/subscriptions/'),
                axios.get('/api/subscriptions/plans/'),
                axios.get('/api/subscriptions/stats/')
            ]);
            setSubscriptions(subscriptionsRes.data);
            setPlans(plansRes.data);
            setStats(statsRes.data);
        } catch (err) {
            console.error('Error fetching subscriptions data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPlan = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('/api/subscriptions/plans/', selectedPlan);
            setShowPlanForm(false);
            setSelectedPlan({});
            fetchData();
        } catch (err) {
            console.error('Error adding plan:', err);
        }
    };

    const handleCancelSubscription = async (subscriptionId: number) => {
        try {
            await axios.delete(`/api/subscriptions/subscriptions/${subscriptionId}`);
            fetchData();
        } catch (err) {
            console.error('Error cancelling subscription:', err);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64">Loading subscriptions...</div>;

    return (
        <ProtectedRoute>
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-6">Subscriptions Management</h1>

                {/* Statistics Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-700">Total Subscriptions</h3>
                            <p className="text-3xl font-bold text-blue-600">{stats.total_subscriptions}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-700">Active Subscriptions</h3>
                            <p className="text-3xl font-bold text-green-600">{stats.active_subscriptions}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-700">Cancelled</h3>
                            <p className="text-3xl font-bold text-red-600">{stats.cancelled_subscriptions}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-700">Total Revenue</h3>
                            <p className="text-3xl font-bold text-purple-600">${stats.total_revenue.toFixed(2)}</p>
                        </div>
                    </div>
                )}

                {/* Subscription Plans */}
                <div className="bg-white p-6 rounded-lg shadow mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Subscription Plans</h2>
                        <button
                            onClick={() => setShowPlanForm(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Add Plan
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {plans.map((plan) => (
                            <div key={plan.id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                                    <span className={`px-2 py-1 text-xs rounded ${
                                        plan.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {plan.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <p className="text-gray-600 mb-2">{plan.description}</p>
                                <div className="space-y-1">
                                    <p className="text-lg font-bold text-blue-600">${plan.price}/month</p>
                                    <p className="text-sm text-gray-500">Duration: {plan.duration_months} months</p>
                                    {plan.max_users && (
                                        <p className="text-sm text-gray-500">Max Users: {plan.max_users}</p>
                                    )}
                                    {plan.max_storage_gb && (
                                        <p className="text-sm text-gray-500">Storage: {plan.max_storage_gb}GB</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Active Subscriptions */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Active Subscriptions</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-4 py-2 text-left">User ID</th>
                                    <th className="px-4 py-2 text-left">Plan</th>
                                    <th className="px-4 py-2 text-left">Type</th>
                                    <th className="px-4 py-2 text-left">Price</th>
                                    <th className="px-4 py-2 text-left">Status</th>
                                    <th className="px-4 py-2 text-left">Start Date</th>
                                    <th className="px-4 py-2 text-left">Auto Renew</th>
                                    <th className="px-4 py-2 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subscriptions.map((subscription) => (
                                    <tr key={subscription.id} className="border-b">
                                        <td className="px-4 py-2">{subscription.user_id}</td>
                                        <td className="px-4 py-2">{subscription.plan_name}</td>
                                        <td className="px-4 py-2">{subscription.plan_type}</td>
                                        <td className="px-4 py-2">${subscription.price}</td>
                                        <td className="px-4 py-2">
                                            <span className={`px-2 py-1 text-xs rounded ${
                                                subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                                                subscription.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {subscription.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">
                                            {new Date(subscription.start_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-2">
                                            {subscription.auto_renew ? 'Yes' : 'No'}
                                        </td>
                                        <td className="px-4 py-2">
                                            {subscription.status === 'active' && (
                                                <button
                                                    onClick={() => handleCancelSubscription(subscription.id)}
                                                    className="text-red-600 hover:text-red-800 text-sm"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add Plan Form Modal */}
                {showPlanForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h2 className="text-xl font-semibold mb-4">Add Subscription Plan</h2>
                            
                            <form onSubmit={handleAddPlan} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Plan Name</label>
                                    <input
                                        type="text"
                                        value={selectedPlan.name || ''}
                                        onChange={(e) => setSelectedPlan(prev => ({...prev, name: e.target.value}))}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        value={selectedPlan.description || ''}
                                        onChange={(e) => setSelectedPlan(prev => ({...prev, description: e.target.value}))}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Price (per month)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={selectedPlan.price || ''}
                                        onChange={(e) => setSelectedPlan(prev => ({...prev, price: parseFloat(e.target.value)}))}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Duration (months)</label>
                                    <input
                                        type="number"
                                        value={selectedPlan.duration_months || ''}
                                        onChange={(e) => setSelectedPlan(prev => ({...prev, duration_months: parseInt(e.target.value)}))}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        required
                                    />
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowPlanForm(false);
                                            setSelectedPlan({});
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Add Plan
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
