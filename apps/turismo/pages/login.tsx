import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../src/context/AuthContext';
import Head from 'next/head';

export default function Login() {
    const { login, isLoading } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoggingIn(true);

        try {
            const success = await login(email, password);
            if (success) {
                router.push('/dashboard');
            } else {
                setError('Credenciais inválidas. Tente novamente.');
            }
        } catch (error) {
            setError('Erro ao fazer login. Tente novamente.');
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <>
            <Head>
                <title>Login - RSV 360°</title>
                <meta name="description" content="Faça login no sistema RSV 360°" />
            </Head>
            
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="max-w-md w-full space-y-8 p-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            RSV 360°
                        </h2>
                        <p className="text-gray-600 mb-8">
                            Sistema de Turismo Completo
                        </p>
                        
                        {/* Modo Demo Banner */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800">
                                        Modo Demo Ativo
                                    </h3>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        Sistema funcionando sem backend. Use as credenciais de demo.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="seu@email.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Senha
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoggingIn || isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoggingIn ? 'Entrando...' : 'Entrar'}
                            </button>
                        </div>
                    </form>

                    <div className="text-center">
                        <p className="text-xs text-gray-500 mb-2">
                            <strong>Credenciais de demonstração:</strong>
                        </p>
                        <div className="bg-gray-50 rounded-md p-3 text-xs text-gray-600">
                            <p><strong>Admin:</strong> admin@onion360.com / admin123</p>
                            <p><strong>Demo:</strong> demo@onionrsv.com / demo123</p>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-xs text-gray-400">
                            Sistema Onion RSV 360 v2.7.0 - Modo Demo
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
} 
