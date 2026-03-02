import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProtectedRoute from '../components/ProtectedRoute';

interface SEOPage {
    id: number;
    page_url: string;
    title: string;
    meta_description: string | null;
    meta_keywords: string | null;
    h1_tag: string | null;
    canonical_url: string | null;
    robots_txt: string;
    og_title: string | null;
    og_description: string | null;
    og_image: string | null;
    twitter_card: string;
    page_speed_score: number | null;
    mobile_friendly: boolean;
    last_updated: string;
    created_at: string;
}

export default function SEOPage() {
    const [pages, setPages] = useState<SEOPage[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPage, setSelectedPage] = useState<SEOPage | null>(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            const response = await axios.get('/api/seo/pages/');
            setPages(response.data);
        } catch (err) {
            console.error('Error fetching SEO pages:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (page: SEOPage) => {
        setSelectedPage(page);
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPage) return;

        try {
            await axios.put(`/api/seo/pages/${selectedPage.page_url}`, selectedPage);
            setShowForm(false);
            setSelectedPage(null);
            fetchPages();
        } catch (err) {
            console.error('Error updating SEO page:', err);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64">Loading SEO pages...</div>;

    return (
        <ProtectedRoute>
            <div className="container mx-auto p-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">SEO Management</h1>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Add New Page
                    </button>
                </div>

                {/* SEO Pages List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pages.map((page) => (
                        <div key={page.id} className="bg-white p-6 rounded-lg shadow">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 truncate" title={page.page_url}>
                                    {page.page_url}
                                </h3>
                                <button
                                    onClick={() => handleEdit(page)}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    Edit
                                </button>
                            </div>
                            
                            <div className="space-y-2">
                                <div>
                                    <span className="font-medium text-gray-600">Title:</span>
                                    <p className="text-sm text-gray-800 truncate" title={page.title}>
                                        {page.title}
                                    </p>
                                </div>
                                
                                {page.meta_description && (
                                    <div>
                                        <span className="font-medium text-gray-600">Description:</span>
                                        <p className="text-sm text-gray-800 truncate" title={page.meta_description}>
                                            {page.meta_description}
                                        </p>
                                    </div>
                                )}

                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-600">Speed Score:</span>
                                    <span className={`font-bold ${
                                        page.page_speed_score && page.page_speed_score >= 90 ? 'text-green-600' :
                                        page.page_speed_score && page.page_speed_score >= 70 ? 'text-yellow-600' :
                                        'text-red-600'
                                    }`}>
                                        {page.page_speed_score || 'N/A'}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-600">Mobile Friendly:</span>
                                    <span className={`font-bold ${page.mobile_friendly ? 'text-green-600' : 'text-red-600'}`}>
                                        {page.mobile_friendly ? 'Yes' : 'No'}
                                    </span>
                                </div>

                                <div className="text-xs text-gray-500">
                                    Last updated: {new Date(page.last_updated).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Edit Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-semibold mb-4">
                                {selectedPage ? 'Edit SEO Page' : 'Add New SEO Page'}
                            </h2>
                            
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Page URL</label>
                                    <input
                                        type="text"
                                        value={selectedPage?.page_url || ''}
                                        onChange={(e) => setSelectedPage(prev => prev ? {...prev, page_url: e.target.value} : null)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Title</label>
                                    <input
                                        type="text"
                                        value={selectedPage?.title || ''}
                                        onChange={(e) => setSelectedPage(prev => prev ? {...prev, title: e.target.value} : null)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Meta Description</label>
                                    <textarea
                                        value={selectedPage?.meta_description || ''}
                                        onChange={(e) => setSelectedPage(prev => prev ? {...prev, meta_description: e.target.value} : null)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">H1 Tag</label>
                                    <input
                                        type="text"
                                        value={selectedPage?.h1_tag || ''}
                                        onChange={(e) => setSelectedPage(prev => prev ? {...prev, h1_tag: e.target.value} : null)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                    />
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowForm(false);
                                            setSelectedPage(null);
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Save
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
