import type { ReactNode } from 'react';
import { useState } from 'react';
import { Menu, Search } from 'lucide-react';
import { useRouter } from 'next/router';
import { AppSidebar } from './AppSidebar';
import { PropertySwitcher } from './PropertySwitcher';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { Card } from './ui/card';

const titles: Record<string, { title: string; description: string }> = {
  '/': { title: 'Dashboard Fase 4', description: 'Visão geral dos módulos operacionais, comerciais e de compliance.' },
  '/communication': { title: 'Communication', description: 'Templates, mensagens, automações e canais.' },
  '/cloud': { title: 'Cloud & Storage', description: 'Upload, mídia, galeria e uso de armazenamento.' },
  '/housekeeping': { title: 'Housekeeping', description: 'Rooms, tarefas, manutenção e checklists.' },
  '/revenue': { title: 'Revenue', description: 'Pricing rules, calendário, forecast e KPIs.' },
  '/crm': { title: 'CRM & Loyalty', description: 'Hóspedes, fidelidade, campanhas e segmentos.' },
  '/properties': { title: 'Multi-property', description: 'Propriedades, usuários e consolidado.' },
  '/fiscal': { title: 'Fiscal & LGPD', description: 'Recibos, FNRH, consentimentos e auditoria.' },
  '/orcamentos': { title: 'Orçamentos', description: 'Módulo Fase 1 — orçamentos comerciais.' },
  '/propostas': { title: 'Propostas', description: 'Propostas comerciais e links públicos.' },
  '/configuracoes/modulo-propostas': {
    title: 'Módulo Propostas',
    description: 'Validade, urgência e regras de expiração (configuracoes_sistema).',
  },
  '/configuracoes/comissoes': {
    title: 'Comissões marketplace',
    description: 'Percentuais Reservei / RSV360 — manual ou IA.',
  },
  '/crm/comissoes': {
    title: 'Comissões (CRM)',
    description: 'Split plataforma, corretor e anfitrião.',
  },
  '/passageiros': { title: 'Passageiros', description: 'Cadastro e documentos de passageiros.' },
  '/financeiro': { title: 'Financeiro', description: 'Transações, contas e fluxo de caixa.' },
  '/campanhas': { title: 'Campanhas', description: 'Campanhas de marketing e cupons.' },
  '/logistica': { title: 'Logística', description: 'Fornecedores, reservas e vouchers.' },
  '/relatorios': { title: 'Relatórios', description: 'Dashboards e exportações.' },
};

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const meta = titles[router.pathname] || { title: 'RSV360 Admin', description: 'Painel administrativo.' };

  return (
    <div className="min-h-screen bg-slate-50">
      <AppSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 lg:px-6">
            <Button variant="outline" size="icon" className="lg:hidden" onClick={() => setMobileOpen((value) => !value)}>
              <Menu className="h-4 w-4" />
            </Button>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{meta.title}</p>
              <p className="truncate text-xs text-slate-500">{meta.description}</p>
            </div>

            <div className="hidden w-full max-w-sm items-center gap-2 xl:flex">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input placeholder="Pesquisar rápido..." className="pl-9" />
              </div>
              <PropertySwitcher />
            </div>
          </div>
          <div className="px-4 pb-3 xl:hidden">
            <PropertySwitcher />
          </div>
          <Separator />
        </header>

        <main className="px-4 py-6 lg:px-6">{children}</main>
        <Card className="mx-4 mb-6 border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 lg:mx-6">
          Conexão API: `http://localhost:3002` • Header `X-Property-Id` aplicado automaticamente
        </Card>
      </div>
    </div>
  );
}
