import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Carregando Onion RSV 360...</p>
        <p className="mt-2 text-sm text-gray-500">Sistema de Turismo Completo</p>
      </div>
    </div>
  );
}

// Configurações de SEO para a página inicial
export const metadata = {
  title: 'Onion RSV 360 - Sistema de Turismo Completo',
  description: 'Sistema completo de turismo com arquitetura de microserviços, autenticação segura e interface moderna.',
  keywords: 'turismo, reservas, viagens, sistema, onlinersv, microserviços',
  openGraph: {
    title: 'Onion RSV 360 - Sistema de Turismo',
    description: 'Sistema completo de turismo com arquitetura de microserviços',
    type: 'website',
    locale: 'pt_BR',
  },
}; 