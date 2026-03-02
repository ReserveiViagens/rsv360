import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProtectedRoute from '../components/ProtectedRoute';

interface Reward {
    id: number;
    name: string;
    description: string | null;
    points_required: number;
    reward_type: string;
    reward_value: number;
    is_active: boolean;
    max_redemptions: number | null;
    current_redemptions: number;
    valid_from: string | null;
    valid_until: string | null;
    image_url: string | null;
    created_at: string;
    updated_at: string;
}

interface UserReward {
    id: number;
    user_id: number;
    reward_id: number;
    points_spent: number;
    status: string;
    redeemed_at: string;
    used_at: string | null;
    order_id: number | null;
}

interface UserPoints {
    id: number;
    user_id: number;
    points: number;
    total_earned: number;
    total_spent: number;
    last_updated: string;
}

interface PointsTransaction {
    id: number;
    user_id: number;
    transaction_type: string;
    points: number;
    description: string | null;
    order_id: number | null;
    created_at: string;
}

interface RewardsStats {
    total_rewards: number;
    active_rewards: number;
    total_redemptions: number;
    total_points_earned: number;
    total_points_spent: number;
}

export default function RewardsPage() {
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [userRewards, setUserRewards] = useState<UserReward[]>([]);
    const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
    const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
    const [stats, setStats] = useState<RewardsStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [showRewardForm, setShowRewardForm] = useState(false);
    const [selectedReward, setSelectedReward] = useState<Partial<Reward>>({});
    const [selectedUserId, setSelectedUserId] = useState<number>(1);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [rewardsRes, statsRes] = await Promise.all([
                axios.get('/api/rewards/rewards/'),
                axios.get('/api/rewards/stats/')
            ]);
            setRewards(rewardsRes.data);
            setStats(statsRes.data);
        } catch (err) {
            console.error('Error fetching rewards data:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserData = async (userId: number) => {
        try {
            const [pointsRes, userRewardsRes, transactionsRes] = await Promise.all([
                axios.get(`/api/rewards/points/user/${userId}`),
                axios.get(`/api/rewards/user-rewards/${userId}`),
                axios.get(`/api/rewards/transactions/user/${userId}`)
            ]);
            setUserPoints(pointsRes.data);
            setUserRewards(userRewardsRes.data);
            setTransactions(transactionsRes.data);
        } catch (err) {
            console.error('Error fetching user data:', err);
        }
    };

    const handleAddReward = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('/api/rewards/rewards/', selectedReward);
            setShowRewardForm(false);
            setSelectedReward({});
            fetchData();
        } catch (err) {
            console.error('Error adding reward:', err);
        }
    };

    const handleDeactivateReward = async (rewardId: number) => {
        try {
            await axios.delete(`/api/rewards/rewards/${rewardId}`);
            fetchData();
        } catch (err) {
            console.error('Error deactivating reward:', err);
        }
    };

    const handleEarnPoints = async (userId: number, points: number) => {
        try {
            await axios.post('/api/rewards/points/earn', {
                user_id: userId,
                points: points,
                description: 'Manual points addition'
            });
            fetchUserData(userId);
        } catch (err) {
            console.error('Error earning points:', err);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64">Loading rewards...</div>;

    return (
        <ProtectedRoute>
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-6">Rewards Management</h1>

                {/* Statistics Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-700">Total Rewards</h3>
                            <p className="text-3xl font-bold text-blue-600">{stats.total_rewards}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-700">Active Rewards</h3>
                            <p className="text-3xl font-bold text-green-600">{stats.active_rewards}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-700">Total Redemptions</h3>
                            <p className="text-3xl font-bold text-orange-600">{stats.total_redemptions}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-700">Points Earned</h3>
                            <p className="text-3xl font-bold text-purple-600">{stats.total_points_earned}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-700">Points Spent</h3>
                            <p className="text-3xl font-bold text-red-600">{stats.total_points_spent}</p>
                        </div>
                    </div>
                )}

                {/* User Points Management */}
                <div className="bg-white p-6 rounded-lg shadow mb-8">
                    <h2 className="text-xl font-semibold mb-4">User Points Management</h2>
                    <div className="flex space-x-4 mb-4">
                        <input
                            type="number"
                            placeholder="User ID"
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(parseInt(e.target.value))}
                            className="border border-gray-300 rounded-md px-3 py-2"
                        />
                        <button
                            onClick={() => fetchUserData(selectedUserId)}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Load User Data
                        </button>
                    </div>

                    {userPoints && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div className="bg-gray-50 p-4 rounded">
                                <h3 className="font-semibold">Current Points</h3>
                                <p className="text-2xl font-bold text-blue-600">{userPoints.points}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded">
                                <h3 className="font-semibold">Total Earned</h3>
                                <p className="text-2xl font-bold text-green-600">{userPoints.total_earned}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded">
                                <h3 className="font-semibold">Total Spent</h3>
                                <p className="text-2xl font-bold text-red-600">{userPoints.total_spent}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded">
                                <h3 className="font-semibold">Add Points</h3>
                                <div className="flex space-x-2">
                                    <input
                                        type="number"
                                        placeholder="Points"
                                        id="pointsToAdd"
                                        className="flex-1 border border-gray-300 rounded px-2 py-1"
                                    />
                                    <button
                                        onClick={() => {
                                            const points = parseInt((document.getElementById('pointsToAdd') as HTMLInputElement).value);
                                            if (points > 0) {
                                                handleEarnPoints(selectedUserId, points);
                                                (document.getElementById('pointsToAdd') as HTMLInputElement).value = '';
                                            }
                                        }}
                                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Rewards List */}
                <div className="bg-white p-6 rounded-lg shadow mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Available Rewards</h2>
                        <button
                            onClick={() => setShowRewardForm(true)}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            Create Reward
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rewards.map((reward) => (
                            <div key={reward.id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-semibold">{reward.name}</h3>
                                    <span className={`px-2 py-1 text-xs rounded ${
                                        reward.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {reward.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                
                                <div className="space-y-2">
                                    <p className="text-gray-600 text-sm">{reward.description}</p>
                                    
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Points Required:</span>
                                        <span className="font-bold text-blue-600">{reward.points_required}</span>
                                    </div>
                                    
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Type:</span>
                                        <span className="font-medium">{reward.reward_type}</span>
                                    </div>
                                    
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Value:</span>
                                        <span className="font-bold">
                                            {reward.reward_type === 'percentage' ? `${reward.reward_value}%` : `$${reward.reward_value}`}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Redemptions:</span>
                                        <span>{reward.current_redemptions}/{reward.max_redemptions || 'âˆž'}</span>
                                    </div>

                                    <div className="text-xs text-gray-500">
                                        Created: {new Date(reward.created_at).toLocaleDateString()}
                                    </div>

                                    {reward.is_active && (
                                        <button
                                            onClick={() => handleDeactivateReward(reward.id)}
                                            className="w-full mt-2 text-red-600 hover:text-red-800 text-sm border border-red-300 rounded px-2 py-1 hover:bg-red-50"
                                        >
                                            Deactivate
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* User Rewards */}
                {userRewards.length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow mb-8">
                        <h2 className="text-xl font-semibold mb-4">User Rewards</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full table-auto">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-4 py-2 text-left">Reward ID</th>
                                        <th className="px-4 py-2 text-left">Points Spent</th>
                                        <th className="px-4 py-2 text-left">Status</th>
                                        <th className="px-4 py-2 text-left">Redeemed At</th>
                                        <th className="px-4 py-2 text-left">Used At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userRewards.map((userReward) => (
                                        <tr key={userReward.id} className="border-b">
                                            <td className="px-4 py-2">{userReward.reward_id}</td>
                                            <td className="px-4 py-2">{userReward.points_spent}</td>
                                            <td className="px-4 py-2">
                                                <span className={`px-2 py-1 text-xs rounded ${
                                                    userReward.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    userReward.status === 'used' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {userReward.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">
                                                {new Date(userReward.redeemed_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-2">
                                                {userReward.used_at ? new Date(userReward.used_at).toLocaleDateString() : 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Recent Transactions */}
                {transactions.length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full table-auto">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-4 py-2 text-left">Type</th>
                                        <th className="px-4 py-2 text-left">Points</th>
                                        <th className="px-4 py-2 text-left">Description</th>
                                        <th className="px-4 py-2 text-left">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.slice(0, 10).map((transaction) => (
                                        <tr key={transaction.id} className="border-b">
                                            <td className="px-4 py-2">
                                                <span className={`px-2 py-1 text-xs rounded ${
                                                    transaction.transaction_type === 'earned' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {transaction.transaction_type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">{transaction.points}</td>
                                            <td className="px-4 py-2">{transaction.description || 'N/A'}</td>
                                            <td className="px-4 py-2">
                                                {new Date(transaction.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Create Reward Form Modal */}
                {showRewardForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h2 className="text-xl font-semibold mb-4">Create Reward</h2>
                            
                            <form onSubmit={handleAddReward} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <input
                                        type="text"
                                        value={selectedReward.name || ''}
                                        onChange={(e) => setSelectedReward(prev => ({...prev, name: e.target.value}))}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        value={selectedReward.description || ''}
                                        onChange={(e) => setSelectedReward(prev => ({...prev, description: e.target.value}))}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Points Required</label>
                                    <input
                                        type="number"
                                        value={selectedReward.points_required || ''}
                                        onChange={(e) => setSelectedReward(prev => ({...prev, points_required: parseInt(e.target.value)}))}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Reward Type</label>
                                    <select
                                        value={selectedReward.reward_type || 'discount'}
                                        onChange={(e) => setSelectedReward(prev => ({...prev, reward_type: e.target.value}))}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        required
                                    >
                                        <option value="discount">Discount</option>
                                        <option value="free_product">Free Product</option>
                                        <option value="cashback">Cashback</option>
                                        <option value="gift_card">Gift Card</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Reward Value</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={selectedReward.reward_value || ''}
                                        onChange={(e) => setSelectedReward(prev => ({...prev, reward_value: parseFloat(e.target.value)}))}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Max Redemptions (optional)</label>
                                    <input
                                        type="number"
                                        value={selectedReward.max_redemptions || ''}
                                        onChange={(e) => setSelectedReward(prev => ({...prev, max_redemptions: parseInt(e.target.value)}))}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                    />
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowRewardForm(false);
                                            setSelectedReward({});
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                    >
                                        Create Reward
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
