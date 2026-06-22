import React from 'react';
import { 
  Button, 
  PrimaryButton, 
  SecondaryButton, 
  AccentButton, 
  OutlineButton, 
  DangerButton, 
  GhostButton,
  Card,
  ElevatedCard,
  OutlinedCard,
  GradientCard,
  HoverCard,
  ClickableCard,
  TourismCard,
  Badge,
  StatusBadge,
  PriorityBadge,
  CategoryBadge,
  designTokens
} from '../components/ui';
import { motion } from 'framer-motion';

// 🎨 PÁGINA DE TESTE DOS COMPONENTES UI
export default function ComponentTestPage() {
  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="container-fluid">
        {/* 🎯 HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            🎨 Componentes UI - Reservei Viagens
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Sistema de design tokens e componentes base para Caldas Novas
          </p>
        </motion.div>

        {/* 🌊 SEÇÃO: DESIGN TOKENS */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8 text-center">
            🌊 Design Tokens - Caldas Novas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Cores Primárias */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-primary-600">Cores Primárias</h3>
              <div className="space-y-2">
                {Object.entries(designTokens.colors.primary).map(([shade, color]) => (
                  <div key={shade} className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded border border-neutral-200"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm font-mono">{shade}: {color}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Cores Secundárias */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-secondary-600">Cores Secundárias</h3>
              <div className="space-y-2">
                {Object.entries(designTokens.colors.secondary).map(([shade, color]) => (
                  <div key={shade} className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded border border-neutral-200"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm font-mono">{shade}: {color}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Cores de Destaque */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-accent-600">Cores de Destaque</h3>
              <div className="space-y-2">
                {Object.entries(designTokens.colors.accent).map(([shade, color]) => (
                  <div key={shade} className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded border border-neutral-200"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm font-mono">{shade}: {color}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Cores de Status */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Cores de Status</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded bg-success-500" />
                  <span className="text-sm font-mono">success: {designTokens.colors.success[500]}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded bg-warning-500" />
                  <span className="text-sm font-mono">warning: {designTokens.colors.warning[500]}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded bg-danger-500" />
                  <span className="text-sm font-mono">danger: {designTokens.colors.danger[500]}</span>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* 🎯 SEÇÃO: COMPONENTES BUTTON */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8 text-center">
            🎯 Componentes Button
          </h2>
          
          <div className="space-y-8">
            {/* Variantes */}
            <Card className="p-8">
              <h3 className="text-xl font-semibold mb-6">Variantes</h3>
              <div className="flex flex-wrap gap-4">
                <PrimaryButton>Primary</PrimaryButton>
                <SecondaryButton>Secondary</SecondaryButton>
                <AccentButton>Accent</AccentButton>
                <OutlineButton>Outline</OutlineButton>
                <GhostButton>Ghost</GhostButton>
                <DangerButton>Danger</DangerButton>
              </div>
            </Card>

            {/* Tamanhos */}
            <Card className="p-8">
              <h3 className="text-xl font-semibold mb-6">Tamanhos</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
              </div>
            </Card>

            {/* Estados */}
            <Card className="p-8">
              <h3 className="text-xl font-semibold mb-6">Estados</h3>
              <div className="flex flex-wrap gap-4">
                <Button loading>Loading</Button>
                <Button disabled>Disabled</Button>
                <Button icon="🚀" iconPosition="left">Com Ícone</Button>
                <Button icon="⭐" iconPosition="right">Com Ícone</Button>
              </div>
            </Card>
          </div>
        </section>

        {/* 🎭 SEÇÃO: COMPONENTES CARD */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8 text-center">
            🎭 Componentes Card
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <h3 className="text-lg font-semibold mb-2">Card Padrão</h3>
              <p className="text-neutral-600">Este é um card padrão com conteúdo básico.</p>
            </Card>

            <ElevatedCard>
              <h3 className="text-lg font-semibold mb-2">Card Elevado</h3>
              <p className="text-neutral-600">Card com sombra mais pronunciada.</p>
            </ElevatedCard>

            <OutlinedCard>
              <h3 className="text-lg font-semibold mb-2">Card Contornado</h3>
              <p className="text-neutral-600">Card com borda destacada.</p>
            </OutlinedCard>

            <GradientCard>
              <h3 className="text-lg font-semibold mb-2">Card Gradiente</h3>
              <p className="text-neutral-600">Card com fundo gradiente.</p>
            </GradientCard>

            <HoverCard>
              <h3 className="text-lg font-semibold mb-2">Card Hover</h3>
              <p className="text-neutral-600">Card com efeito hover.</p>
            </HoverCard>

            <ClickableCard onClick={() => alert('Card clicado!')}>
              <h3 className="text-lg font-semibold mb-2">Card Clicável</h3>
              <p className="text-neutral-600">Clique para interagir.</p>
            </ClickableCard>
          </div>

          {/* Tourism Card */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-6 text-center">Tourism Card</h3>
            <div className="max-w-md mx-auto">
              <TourismCard
                image="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop"
                title="Caldas Novas - Águas Termais"
                description="Experimente as águas termais mais famosas do Brasil. Relaxe em piscinas naturais com temperaturas que variam de 30°C a 60°C."
                price="R$ 299"
                rating={4.8}
              />
            </div>
          </div>
        </section>

        {/* 🏷️ SEÇÃO: COMPONENTES BADGE */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8 text-center">
            🏷️ Componentes Badge
          </h2>
          
          <div className="space-y-8">
            {/* Variantes Básicas */}
            <Card className="p-8">
              <h3 className="text-xl font-semibold mb-6">Variantes Básicas</h3>
              <div className="flex flex-wrap gap-4">
                <Badge variant="default">Primary</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Accent</Badge>
                <Badge className="border-transparent bg-green-100 text-green-800">Success</Badge>
                <Badge className="border-transparent bg-yellow-100 text-yellow-800">Warning</Badge>
                <Badge variant="destructive">Danger</Badge>
                <Badge variant="outline">Neutral</Badge>
              </div>
            </Card>

            {/* Badges Especializados */}
            <Card className="p-8">
              <h3 className="text-xl font-semibold mb-6">Badges Especializados</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Status das Reservas:</h4>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status="confirmed">Confirmado</StatusBadge>
                    <StatusBadge status="pending">Pendente</StatusBadge>
                    <StatusBadge status="cancelled">Cancelado</StatusBadge>
                    <StatusBadge status="completed">Concluído</StatusBadge>
                    <StatusBadge status="draft">Rascunho</StatusBadge>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Prioridades:</h4>
                  <div className="flex flex-wrap gap-2">
                    <PriorityBadge priority="low">Baixa</PriorityBadge>
                    <PriorityBadge priority="medium">Média</PriorityBadge>
                    <PriorityBadge priority="high">Alta</PriorityBadge>
                    <PriorityBadge priority="urgent">Urgente</PriorityBadge>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Categorias:</h4>
                  <div className="flex flex-wrap gap-2">
                    <CategoryBadge category="hotel">🏨 Hotel</CategoryBadge>
                    <CategoryBadge category="flight">✈️ Voo</CategoryBadge>
                    <CategoryBadge category="tour">🗺️ Tour</CategoryBadge>
                    <CategoryBadge category="package">📦 Pacote</CategoryBadge>
                    <CategoryBadge category="activity">🎯 Atividade</CategoryBadge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Estados e Variações */}
            <Card className="p-8">
              <h3 className="text-xl font-semibold mb-6">Estados e Variações</h3>
              <div className="flex flex-wrap gap-4">
                <Badge outlined>Outlined</Badge>
                <Badge rounded>Rounded</Badge>
                <Badge pulse>Pulse</Badge>
                <Badge dot>Dot</Badge>
                <Badge clickable onClick={() => alert('Badge clicado!')}>
                  Clicável
                </Badge>
              </div>
            </Card>
          </div>
        </section>

        {/* 🎨 SEÇÃO: GRADIENTES E ANIMAÇÕES */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8 text-center">
            🎨 Gradientes e Animações
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Gradientes */}
            <Card className="p-8">
              <h3 className="text-xl font-semibold mb-6">Gradientes Caldas Novas</h3>
              <div className="space-y-4">
                <div className="h-16 rounded-lg gradient-primary flex items-center justify-center text-white font-semibold">
                  Gradiente Primário
                </div>
                <div className="h-16 rounded-lg gradient-secondary flex items-center justify-center text-white font-semibold">
                  Gradiente Secundário
                </div>
                <div className="h-16 rounded-lg gradient-accent flex items-center justify-center text-white font-semibold">
                  Gradiente Accent
                </div>
                <div className="h-16 rounded-lg gradient-thermal flex items-center justify-center text-white font-semibold">
                  Gradiente Termal
                </div>
              </div>
            </Card>

            {/* Animações */}
            <Card className="p-8">
              <h3 className="text-xl font-semibold mb-6">Animações</h3>
              <div className="space-y-4">
                <div className="animate-fade-in p-4 bg-primary-100 rounded-lg">
                  Fade In
                </div>
                <div className="animate-slide-up p-4 bg-secondary-100 rounded-lg">
                  Slide Up
                </div>
                <div className="animate-bounce-gentle p-4 bg-accent-100 rounded-lg">
                  Bounce Gentle
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* 🚀 FOOTER */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-8 border-t border-neutral-200"
        >
          <p className="text-neutral-600">
            🎨 Sistema de Design - Reservei Viagens Caldas Novas
          </p>
          <p className="text-sm text-neutral-500 mt-2">
            Componentes UI implementados com sucesso! ✅
          </p>
        </motion.footer>
      </div>
    </div>
  );
}
