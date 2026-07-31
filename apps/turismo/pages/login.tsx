import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../src/context/AuthContext';
import { getPostLoginPath } from '../src/lib/anfitriao-auth';
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
                const stored = typeof window !== 'undefined' ? localStorage.getItem('post_login_role') : null;
                router.push(getPostLoginPath(stored ?? undefined));
            } else {
                setError('Credenciais inválidas. Tente novamente.');
            }
        } catch (_error) {
            const message =
                _error instanceof Error && _error.message
                    ? _error.message
                    : 'Erro ao fazer login. Tente novamente.';
            setError(message);
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
                        <p className="text-xs text-gray-400">
                            Autenticação via API canônica (/api/v1/auth/login)
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
