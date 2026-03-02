import React from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../components/layout';
import { Card, Button } from '../components/ui';
import { PageTransition } from '../components/ui';
import { Settings, Server, Globe, Users, MapPin } from 'lucide-react';

export default function Settings() {
  const router = useRouter();

  const configCards = [
    { title: 'Configurações do Sistema', desc: 'Performance, manutenção, monitoramento e segurança', href: '/configuracoes-sistema', icon: <Server className="h-8 w-8" /> },
    { title: 'Usuários e Permissões', desc: 'Gerenciar usuários e permissões do sistema', href: '/configuracoes-usuarios', icon: <Users className="h-8 w-8" /> },
  ];

  return (
    <Layout>
      <PageTransition type="fade" className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              ⚙️ Configurações
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Gerencie as configurações do sistema RSV 360
            </p>
          </div>
        </div>

        {/* Card APIs e Maps - Acesso rápido */}
        <Card
          className="p-6 cursor-pointer border-2 border-blue-300 bg-blue-50/50 hover:border-blue-500 hover:bg-blue-50 hover:shadow-lg transition-all"
          onClick={() => router.push('/integracoes-apis')}
        >
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-blue-100 flex items-center justify-center">
              <MapPin className="h-7 w-7 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">APIs e Maps</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Integrações de APIs e provedor de mapas (Google Maps / OpenStreetMap). Configure qual mapa usar no site público.
              </p>
              <Button variant="outline" size="sm" className="mt-3">
                Acessar →
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {configCards.map((card) => (
            <Card
              key={card.href}
              className="p-6 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
              onClick={() => router.push(card.href)}
            >
              <div className="flex items-start space-x-4">
                <div className="text-blue-600">{card.icon}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{card.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{card.desc}</p>
                  <Button variant="outline" size="sm" className="mt-3">
                    Acessar →
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </PageTransition>
    </Layout>
  );
}
