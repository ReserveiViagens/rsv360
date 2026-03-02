import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Lock, 
  User, 
  Eye, 
  EyeOff,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  MessageSquare,
  ExternalLink,
  Star,
  Award,
  Heart
} from 'lucide-react';

interface CompanyInfo {
  name: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
    youtube: string;
    whatsapp: string;
  };
}

export default function Login() {
    const { login, isLoading } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Informações da empresa
    const companyInfo: CompanyInfo = {
        name: 'Reservei Viagens',
        logo: '/logos/reservei-viagens-logo.png',
        address: 'Rua das Viagens, 123 - Centro, São Paulo - SP',
        phone: '(11) 99999-9999',
        email: 'contato@reserveiviagens.com',
        website: 'www.reserveiviagens.com',
        description: 'Sua agência de viagens completa com os melhores destinos e preços.',
        socialMedia: {
            facebook: 'https://facebook.com/reserveiviagens',
            instagram: 'https://instagram.com/reserveiviagens',
            twitter: 'https://twitter.com/reserveiviagens',
            linkedin: 'https://linkedin.com/company/reserveiviagens',
            youtube: 'https://youtube.com/reserveiviagens',
            whatsapp: 'https://wa.me/5511999999999'
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        try {
            const success = await login(email, password);
            if (success) {
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('Erro no login:', error);
            setError('Credenciais inválidas. Tente novamente.');
        }
    };

    const handleDemoLogin = async () => {
        try {
            // Login de demonstração sem backend
            const success = await login('demo@onionrsv.com', 'demo123');
            if (success) {
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('Erro no login demo:', error);
            setError('Erro ao acessar demo. Tente novamente.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
            {/* Lado Esquerdo - Informações da Empresa */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-600 p-12">
                <div className="max-w-md mx-auto">
                    {/* Logo e Nome */}
                    <div className="text-center mb-12">
                        <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Building className="w-12 h-12 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-4">{companyInfo.name}</h1>
                        <p className="text-blue-100 text-lg">{companyInfo.description}</p>
                    </div>

                    {/* Estatísticas */}
                    <div className="grid grid-cols-2 gap-6 mb-12">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white mb-2">+1.500</div>
                            <div className="text-blue-100 text-sm">Clientes Satisfeitos</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white mb-2">+50</div>
                            <div className="text-blue-100 text-sm">Destinos</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white mb-2">4.8/5</div>
                            <div className="text-blue-100 text-sm">Avaliações</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white mb-2">24/7</div>
                            <div className="text-blue-100 text-sm">Suporte</div>
                        </div>
                    </div>

                    {/* Informações de Contato */}
                    <div className="space-y-4 mb-8">
                        <div className="flex items-center space-x-3 text-blue-100">
                            <MapPin className="w-5 h-5" />
                            <span className="text-sm">{companyInfo.address}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-blue-100">
                            <Phone className="w-5 h-5" />
                            <span className="text-sm">{companyInfo.phone}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-blue-100">
                            <Mail className="w-5 h-5" />
                            <span className="text-sm">{companyInfo.email}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-blue-100">
                            <Globe className="w-5 h-5" />
                            <span className="text-sm">{companyInfo.website}</span>
                        </div>
                    </div>

                    {/* Redes Sociais */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Conecte-se Conosco</h3>
                        <div className="flex space-x-4">
                            <a 
                                href={companyInfo.socialMedia.facebook} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
                            >
                                <Facebook className="w-5 h-5 text-white" />
                            </a>
                            <a 
                                href={companyInfo.socialMedia.instagram} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
                            >
                                <Instagram className="w-5 h-5 text-white" />
                            </a>
                            <a 
                                href={companyInfo.socialMedia.twitter} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
                            >
                                <Twitter className="w-5 h-5 text-white" />
                            </a>
                            <a 
                                href={companyInfo.socialMedia.linkedin} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
                            >
                                <Linkedin className="w-5 h-5 text-white" />
                            </a>
                            <a 
                                href={companyInfo.socialMedia.whatsapp} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
                            >
                                <MessageSquare className="w-5 h-5 text-white" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lado Direito - Formulário de Login */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="max-w-md w-full">
                    {/* Logo Mobile */}
                    <div className="text-center mb-8 lg:hidden">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Building className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">{companyInfo.name}</h1>
                        <p className="text-gray-600 text-sm">{companyInfo.description}</p>
                    </div>

                    {/* Formulário */}
                    <div className="bg-white rounded-lg shadow-xl p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Bem-vindo de volta!</h2>
                            <p className="text-gray-600">Faça login para acessar o sistema</p>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="seu@email.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Senha
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            )}

                            <div className="space-y-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Entrando...' : 'Entrar'}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleDemoLogin}
                                    className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Acessar Demo
                                </button>
                            </div>
                        </form>

                        {/* Informações de Contato Mobile */}
                        <div className="mt-8 pt-8 border-t border-gray-200 lg:hidden">
                            <div className="text-center space-y-2">
                                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                                    <Phone className="w-4 h-4" />
                                    <span>{companyInfo.phone}</span>
                                </div>
                                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                                    <Mail className="w-4 h-4" />
                                    <span>{companyInfo.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 
