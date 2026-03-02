"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/src/components/ui/Header';
import { AnimatedCard, AnimatedList, AnimatedButton } from '@/src/components/ui/AnimatedCard';
import { ThemeToggle, SimpleThemeToggle } from '@/src/components/ui/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Star,
  Heart,
  MapPin,
  Calendar,
  Users,
  TrendingUp,
  Sparkles,
  Zap,
  Shield,
  Globe,
  Moon
} from 'lucide-react';

export default function UIDemoPage() {
  const [loading, setLoading] = React.useState(false);

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  const demoCards = [
    {
      title: "Hotel Spazzio diRoma",
      description: "Resort de luxo com águas termais",
      price: "R$ 299",
      originalPrice: "R$ 399",
      rating: 4.8,
      location: "Caldas Novas, GO",
      image: "/images/hotel-1.jpg",
      features: ["WiFi", "Piscina", "Spa", "Restaurante"],
      glow: true,
    },
    {
      title: "Piazza diRoma",
      description: "Apartamento com vista para o lago",
      price: "R$ 199",
      originalPrice: "R$ 249",
      rating: 4.6,
      location: "Caldas Novas, GO",
      image: "/images/hotel-2.jpg",
      features: ["WiFi", "Ar Condicionado", "Cozinha"],
      glass: true,
    },
    {
      title: "Lacqua diRoma",
      description: "Suíte premium com hidromassagem",
      price: "R$ 399",
      originalPrice: "R$ 499",
      rating: 4.9,
      location: "Caldas Novas, GO",
      image: "/images/hotel-3.jpg",
      features: ["WiFi", "Hidromassagem", "Varanda", "Room Service"],
      scale: true,
    },
  ];

  const features = [
    {
      icon: Sparkles,
      title: "Animações Suaves",
      description: "Transições fluidas e interações responsivas",
    },
    {
      icon: Zap,
      title: "Performance Otimizada",
      description: "Carregamento rápido e experiência fluida",
    },
    {
      icon: Shield,
      title: "Segurança Avançada",
      description: "Proteção de dados e autenticação robusta",
    },
    {
      icon: Globe,
      title: "Responsivo",
      description: "Funciona perfeitamente em todos os dispositivos",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header title="RSV 360 - UI/UX Demo" />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              UI/UX Melhorias
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Demonstração das melhorias implementadas: temas dark/light, animações Magic UI e componentes avançados
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge variant="secondary" className="text-sm">
                <Sparkles className="w-4 h-4 mr-1" />
                Animações Magic UI
              </Badge>
              <Badge variant="secondary" className="text-sm">
                <Moon className="w-4 h-4 mr-1" />
                Temas Dark/Light
              </Badge>
              <Badge variant="secondary" className="text-sm">
                <Zap className="w-4 h-4 mr-1" />
                Performance
              </Badge>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <ThemeToggle />
              <SimpleThemeToggle />
              <AnimatedButton
                onClick={handleLoadingDemo}
                loading={loading}
                variant="primary"
                size="lg"
              >
                {loading ? "Carregando..." : "Demo de Loading"}
              </AnimatedButton>
            </div>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="py-12">
          <h2 className="text-3xl font-bold text-center mb-8">Recursos Implementados</h2>
          <AnimatedList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" direction="up">
            {features.map((feature, index) => (
              <AnimatedCard
                key={index}
                className="p-6 text-center hover-lift"
                delay={index * 0.1}
                glow={index % 2 === 0}
              >
                <feature.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </AnimatedCard>
            ))}
          </AnimatedList>
        </section>

        {/* Demo Cards */}
        <section className="py-12">
          <h2 className="text-3xl font-bold text-center mb-8">Cards Animados</h2>
          <AnimatedList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" direction="up">
            {demoCards.map((hotel, index) => (
              <AnimatedCard
                key={index}
                className="overflow-hidden"
                delay={index * 0.2}
                glow={hotel.glow}
                glass={hotel.glass}
                scale={hotel.scale}
              >
                <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20">
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute top-4 right-4">
                    <Button size="sm" variant="secondary" className="rounded-full p-2">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <Badge variant="secondary" className="mb-2">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      {hotel.rating}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold">{hotel.title}</h3>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">{hotel.price}</div>
                      <div className="text-sm text-muted-foreground line-through">{hotel.originalPrice}</div>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm mb-3">{hotel.description}</p>

                  <div className="flex items-center text-sm text-muted-foreground mb-4">
                    <MapPin className="w-4 h-4 mr-1" />
                    {hotel.location}
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {hotel.features.map((feature, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>

                  <AnimatedButton className="w-full" variant="primary">
                    Reservar Agora
                  </AnimatedButton>
                </CardContent>
              </AnimatedCard>
            ))}
          </AnimatedList>
        </section>

        {/* Interactive Demo */}
        <section className="py-12">
          <h2 className="text-3xl font-bold text-center mb-8">Demo Interativo</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AnimatedCard className="p-8" direction="left" glow>
              <h3 className="text-2xl font-bold mb-4">Controles de Tema</h3>
              <p className="text-muted-foreground mb-6">
                Teste os diferentes temas disponíveis. O sistema salva sua preferência automaticamente.
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Toggle Simples</span>
                  <SimpleThemeToggle />
                </div>
                <div className="flex items-center justify-between">
                  <span>Menu Completo</span>
                  <ThemeToggle />
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard className="p-8" direction="right" glass>
              <h3 className="text-2xl font-bold mb-4">Animações</h3>
              <p className="text-muted-foreground mb-6">
                Experimente as diferentes animações e efeitos visuais implementados.
              </p>
              <div className="space-y-4">
                <AnimatedButton variant="primary" className="w-full">
                  Botão com Animação
                </AnimatedButton>
                <AnimatedButton variant="secondary" className="w-full">
                  Hover Effect
                </AnimatedButton>
                <AnimatedButton variant="ghost" className="w-full">
                  Ghost Button
                </AnimatedButton>
              </div>
            </AnimatedCard>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12">
          <h2 className="text-3xl font-bold text-center mb-8">Métricas de Performance</h2>
          <AnimatedList className="grid grid-cols-1 md:grid-cols-4 gap-6" direction="up">
            {[
              { icon: TrendingUp, label: "Performance", value: "95%", description: "Lighthouse Score" },
              { icon: Users, label: "Usuários", value: "1.2K", description: "Usuários Ativos" },
              { icon: Calendar, label: "Reservas", value: "847", description: "Este Mês" },
              { icon: Star, label: "Avaliação", value: "4.9", description: "Satisfação" },
            ].map((stat, index) => (
              <AnimatedCard
                key={index}
                className="p-6 text-center"
                delay={index * 0.1}
                hover
              >
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-primary" />
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm font-medium mb-1">{stat.label}</div>
                <div className="text-xs text-muted-foreground">{stat.description}</div>
              </AnimatedCard>
            ))}
          </AnimatedList>
        </section>
      </main>
    </div>
  );
}
