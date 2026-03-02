// ============================================
// COMPONENTES GLOBAIS COM PADRÃO UNIFICADO
// ============================================

/* ========== 1. BREADCRUMBS GLOBAL ========== */

// components/Breadcrumbs.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
}

export function Breadcrumbs({ items }: { items?: BreadcrumbItem[] }) {
  const pathname = usePathname();

  // Se não houver itens, gerar automaticamente baseado na rota
  const breadcrumbs = items || generateBreadcrumbsFromPath(pathname);

  return (
    <nav
      className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg text-sm"
      aria-label="Navegação de breadcrumb"
    >
      {/* Home */}
      <Link
        href="/"
        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition"
        aria-label="Ir para home"
      >
        <Home size={16} />
      </Link>

      {breadcrumbs.map((item, index) => (
        <div key={`${item.href}-${index}`} className="flex items-center gap-2">
          <ChevronRight size={16} className="text-gray-400" />
          {index === breadcrumbs.length - 1 ? (
            // Página atual (sem link)
            <span className="text-gray-900 font-semibold">{item.label}</span>
          ) : (
            // Link para página anterior
            <Link
              href={item.href}
              className="text-blue-600 hover:text-blue-800 hover:underline transition"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}

// Função auxiliar para gerar breadcrumbs automaticamente
function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  segments.forEach((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = formatSegmentToLabel(segment);
    breadcrumbs.push({ label, href });
  });

  return breadcrumbs;
}

function formatSegmentToLabel(segment: string): string {
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/* ========== 2. HEADER COM BUSCA ========== */

// components/Header.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, Heart, User, Menu, X } from 'lucide-react';

export function Header() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/busca?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600 shrink-0">
            <span className="text-2xl">🏨</span>
            RSV360
          </Link>

          {/* Search Bar - Desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md items-center gap-2 bg-gray-100 rounded-full px-4 py-2"
          >
            <Search size={18} className="text-gray-500" />
            <input
              type="text"
              placeholder="Busque por hotéis, destinos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none flex-1 text-gray-700 placeholder-gray-500"
            />
          </form>

          {/* Right Actions - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition" title="Favoritos">
              <Heart size={20} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition relative" title="Notificações">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <Link
              href="/login"
              className="p-2 hover:bg-gray-100 rounded-full transition"
              title="Minha conta"
            >
              <User size={20} className="text-gray-600" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <form onSubmit={handleSearch} className="mb-4 flex gap-2">
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 bg-gray-100 rounded-lg outline-none"
              />
              <button type="submit" className="p-2 bg-blue-600 text-white rounded-lg">
                <Search size={18} />
              </button>
            </form>
            <div className="space-y-2">
              <Link href="/hoteis" className="block px-4 py-2 hover:bg-gray-100 rounded">
                🏨 Hotéis
              </Link>
              <Link href="/atracoes" className="block px-4 py-2 hover:bg-gray-100 rounded">
                🎡 Atrações
              </Link>
              <Link href="/parks" className="block px-4 py-2 hover:bg-gray-100 rounded">
                🎢 Parques
              </Link>
              <Link href="/login" className="block px-4 py-2 hover:bg-gray-100 rounded">
                👤 Minha Conta
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

/* ========== 3. PÁGINAS FALTANTES ========== */

// app/group-travel/page.tsx
export default function GroupTravelPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: 'Group Travel', href: '/group-travel' }]} />
      
      <div className="mt-8">
        <h1 className="text-4xl font-bold mb-4">Viagens em Grupo</h1>
        <p className="text-gray-600 mb-8">
          Planeje viagens incríveis com seus amigos. Crie wishlists compartilhadas, convide participantes e sincronize agendas.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Wishlists */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="text-4xl mb-4">❤️</div>
            <h3 className="text-xl font-bold mb-2">Wishlists Compartilhadas</h3>
            <p className="text-gray-600 mb-4">Crie listas de desejos e compartilhe com amigos</p>
            <button className="w-full btn-primary">Criar Wishlist</button>
          </div>

          {/* Card 2: Convites */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="text-4xl mb-4">📧</div>
            <h3 className="text-xl font-bold mb-2">Convites de Viagem</h3>
            <p className="text-gray-600 mb-4">Convide amigos para viagens planejadas</p>
            <button className="w-full btn-primary">Enviar Convite</button>
          </div>

          {/* Card 3: Calendário Compartilhado */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-bold mb-2">Calendário Compartilhado</h3>
            <p className="text-gray-600 mb-4">Sincronize datas e veja disponibilidade</p>
            <button className="w-full btn-primary">Abrir Calendário</button>
          </div>
        </div>

        {/* Exemplo de Viagem em Grupo */}
        <div className="mt-12 bg-blue-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Como Funciona</h2>
          <ol className="space-y-4">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</span>
              <div>
                <h4 className="font-bold">Crie ou se junte a um grupo</h4>
                <p className="text-gray-600">Convide amigos ou aceite convites para viagens</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</span>
              <div>
                <h4 className="font-bold">Crie uma wishlist compartilhada</h4>
                <p className="text-gray-600">Adicione hotéis, atrações e atividades que todos querem fazer</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</span>
              <div>
                <h4 className="font-bold">Sincronize as datas</h4>
                <p className="text-gray-600">Use o calendário compartilhado para encontrar as melhores datas</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</span>
              <div>
                <h4 className="font-bold">Faça leilões juntos</h4>
                <p className="text-gray-600">Participe de leilões em grupo para conseguir melhores preços</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

// app/pricing/smart/page.tsx
export default function SmartPricingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[
        { label: 'Pricing', href: '/pricing' },
        { label: 'Smart Pricing', href: '/pricing/smart' }
      ]} />
      
      <div className="mt-8">
        <h1 className="text-4xl font-bold mb-4">Smart Pricing</h1>
        <p className="text-gray-600 mb-8">
          Análise inteligente de preços. Veja tendências, previsões e as melhores oportunidades.
        </p>

        {/* Cards de Análise */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tendência de Preços */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">📊 Tendência de Preços</h3>
            <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Gráfico de tendências</p>
            </div>
          </div>

          {/* Comparação com Concorrentes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">🎯 Análise da Concorrência</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b">
                <span>RSV360</span>
                <span className="font-bold text-green-600">R$ 240</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span>Airbnb</span>
                <span className="font-bold">R$ 280</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Booking</span>
                <span className="font-bold">R$ 300</span>
              </div>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-8 bg-green-50 rounded-lg p-6 border border-green-200">
          <h3 className="text-xl font-bold mb-4">💡 Insights Inteligentes</h3>
          <ul className="space-y-2">
            <li className="flex gap-2">
              <span>✓</span>
              <span>Melhor época para fazer leilão: Quinta-feira 20h</span>
            </li>
            <li className="flex gap-2">
              <span>✓</span>
              <span>Preço médio esperado: R$ 240/noite (+8% do mínimo)</span>
            </li>
            <li className="flex gap-2">
              <span>✓</span>
              <span>Você está 15% mais barato que a concorrência</span>
            </li>
            <li className="flex gap-2">
              <span>✓</span>
              <span>Demanda esperada: Alta (3-5 lances esperados)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// app/top-hosts/page.tsx
export default function TopHostsPage() {
  const topHosts = [
    { rank: 1, name: 'Silva Imóveis', properties: 45, rating: 4.9, reviews: 520 },
    { rank: 2, name: 'Casa Caldas', properties: 32, rating: 4.8, reviews: 410 },
    { rank: 3, name: 'Rio Quente Hospedagem', properties: 28, rating: 4.7, reviews: 380 },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: 'Top Hosts', href: '/top-hosts' }]} />
      
      <div className="mt-8">
        <h1 className="text-4xl font-bold mb-4">Top Hosts</h1>
        <p className="text-gray-600 mb-8">
          Descubra os melhores anfitriões da plataforma. Hosts com excelentes avaliações e muitas propriedades.
        </p>

        {/* Tabela de Top Hosts */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-4 text-left font-bold">Ranking</th>
                <th className="px-6 py-4 text-left font-bold">Host</th>
                <th className="px-6 py-4 text-left font-bold">Propriedades</th>
                <th className="px-6 py-4 text-left font-bold">Avaliação</th>
                <th className="px-6 py-4 text-left font-bold">Reviews</th>
                <th className="px-6 py-4 text-left font-bold">Ação</th>
              </tr>
            </thead>
            <tbody>
              {topHosts.map((host) => (
                <tr key={host.rank} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="inline-block w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      {host.rank}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold">{host.name}</td>
                  <td className="px-6 py-4">{host.properties}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <span>⭐</span>
                      <span className="font-bold">{host.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{host.reviews}</td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:underline font-semibold">
                      Ver Propriedades
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Benefícios de ser Top Host */}
        <div className="mt-12 bg-blue-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Como se tornar um Top Host</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-2">⭐</div>
              <h3 className="font-bold mb-2">Excelente Avaliação</h3>
              <p className="text-sm text-gray-600">Manter 4.8+ de avaliação</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🏠</div>
              <h3 className="font-bold mb-2">Múltiplas Propriedades</h3>
              <p className="text-sm text-gray-600">Mínimo 10 propriedades</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <h3 className="font-bold mb-2">Alta Taxa de Ocupação</h3>
              <p className="text-sm text-gray-600">Acima de 80% ocupado</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">👥</div>
              <h3 className="font-bold mb-2">Resposta Rápida</h3>
              <p className="text-sm text-gray-600">24h para responder</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========== 4. IMPORTS NECESSÁRIOS ========== */

/*
Adicione ao seu layout principal:

import { Header } from '@/components/Header';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Footer } from '@/components/Footer';

export default function RootLayout() {
  return (
    <html>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
*/
