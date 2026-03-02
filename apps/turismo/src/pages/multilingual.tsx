import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProtectedRoute from '../components/ProtectedRoute';

interface Translation {
    id: number;
    key: string;
    language_code: string;
    text: string;
    context: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface Language {
    id: number;
    code: string;
    name: string;
    native_name: string;
    is_default: boolean;
    is_active: boolean;
    created_at: string;
}

export default function MultilingualPage() {
    const [translations, setTranslations] = useState<Translation[]>([]);
    const [languages, setLanguages] = useState<Language[]>([]);
    const [selectedLanguage, setSelectedLanguage] = useState<string>('pt-BR');
    const [loading, setLoading] = useState(true);
    const [showTranslationForm, setShowTranslationForm] = useState(false);
    const [showLanguageForm, setShowLanguageForm] = useState(false);
    const [selectedTranslation, setSelectedTranslation] = useState<Translation | null>(null);
    const [newLanguage, setNewLanguage] = useState<Partial<Language>>({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [translationsRes, languagesRes] = await Promise.all([
                axios.get('/api/multilingual/translations/'),
                axios.get('/api/multilingual/languages/')
            ]);
            setTranslations(translationsRes.data);
            setLanguages(languagesRes.data);
        } catch (err) {
            console.error('Error fetching multilingual data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTranslation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTranslation) return;

        try {
            await axios.post('/api/multilingual/translations/', selectedTranslation);
            setShowTranslationForm(false);
            setSelectedTranslation(null);
            fetchData();
        } catch (err) {
            console.error('Error adding translation:', err);
        }
    };

    const handleAddLanguage = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('/api/multilingual/languages/', newLanguage);
            setShowLanguageForm(false);
            setNewLanguage({});
            fetchData();
        } catch (err) {
            console.error('Error adding language:', err);
        }
    };

    const handleSetDefaultLanguage = async (languageId: number) => {
        try {
            await axios.put(`/api/multilingual/languages/${languageId}/default`);
            fetchData();
        } catch (err) {
            console.error('Error setting default language:', err);
        }
    };

    const filteredTranslations = translations.filter(t => t.language_code === selectedLanguage);

    if (loading) return <div className="flex justify-center items-center h-64">Loading multilingual data...</div>;

    return (
        <ProtectedRoute>
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-6">Multilingual Management</h1>

                {/* Language Management */}
                <div className="bg-white p-6 rounded-lg shadow mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Languages</h2>
                        <button
                            onClick={() => setShowLanguageForm(true)}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            Add Language
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {languages.map((language) => (
                            <div key={language.id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold">{language.name}</h3>
                                        <p className="text-sm text-gray-600">{language.native_name}</p>
                                        <p className="text-xs text-gray-500">Code: {language.code}</p>
                                    </div>
                                    <div className="flex flex-col items-end space-y-2">
                                        {language.is_default && (
                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                                Default
                                            </span>
                                        )}
                                        {!language.is_default && (
                                            <button
                                                onClick={() => handleSetDefaultLanguage(language.id)}
                                                className="text-blue-600 hover:text-blue-800 text-sm"
                                            >
                                                Set Default
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Translation Management */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Translations</h2>
                        <div className="flex items-center space-x-4">
                            <select
                                value={selectedLanguage}
                                onChange={(e) => setSelectedLanguage(e.target.value)}
                                className="border border-gray-300 rounded px-3 py-2"
                            >
                                {languages.map((lang) => (
                                    <option key={lang.code} value={lang.code}>
                                        {lang.name} ({lang.code})
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={() => {
                                    setSelectedTranslation({
                                        id: 0,
                                        key: '',
                                        language_code: selectedLanguage,
                                        text: '',
                                        context: null,
                                        is_active: true,
                                        created_at: '',
                                        updated_at: ''
                                    });
                                    setShowTranslationForm(true);
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                Add Translation
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {filteredTranslations.map((translation) => (
                            <div key={translation.id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-800">{translation.key}</h3>
                                        <p className="text-gray-600 mt-1">{translation.text}</p>
                                        {translation.context && (
                                            <p className="text-sm text-gray-500 mt-1">Context: {translation.context}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-2 py-1 text-xs rounded ${
                                            translation.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {translation.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                        <button
                                            onClick={() => {
                                                setSelectedTranslation(translation);
                                                setShowTranslationForm(true);
                                            }}
                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Translation Form Modal */}
                {showTranslationForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h2 className="text-xl font-semibold mb-4">
                                {selectedTranslation?.id ? 'Edit Translation' : 'Add Translation'}
                            </h2>
                            
                            <form onSubmit={handleAddTranslation} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Key</label>
                                    <input
                                        type="text"
                                        value={selectedTranslation?.key || ''}
                                        onChange={(e) => setSelectedTranslation(prev => prev ? {...prev, key: e.target.value} : null)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Text</label>
                                    <textarea
                                        value={selectedTranslation?.text || ''}
                                        onChange={(e) => setSelectedTranslation(prev => prev ? {...prev, text: e.target.value} : null)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        rows={3}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Context (optional)</label>
                                    <input
                                        type="text"
                                        value={selectedTranslation?.context || ''}
                                        onChange={(e) => setSelectedTranslation(prev => prev ? {...prev, context: e.target.value} : null)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                    />
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowTranslationForm(false);
                                            setSelectedTranslation(null);
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

                {/* Language Form Modal */}
                {showLanguageForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h2 className="text-xl font-semibold mb-4">Add Language</h2>
                            
                            <form onSubmit={handleAddLanguage} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Code</label>
                                    <input
                                        type="text"
                                        value={newLanguage.code || ''}
                                        onChange={(e) => setNewLanguage(prev => ({...prev, code: e.target.value}))}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        placeholder="pt-BR"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <input
                                        type="text"
                                        value={newLanguage.name || ''}
                                        onChange={(e) => setNewLanguage(prev => ({...prev, name: e.target.value}))}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        placeholder="Portuguese"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Native Name</label>
                                    <input
                                        type="text"
                                        value={newLanguage.native_name || ''}
                                        onChange={(e) => setNewLanguage(prev => ({...prev, native_name: e.target.value}))}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        placeholder="PortuguÃªs"
                                        required
                                    />
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowLanguageForm(false);
                                            setNewLanguage({});
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                    >
                                        Add Language
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
