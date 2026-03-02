'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { InteractiveCard, GlassCard, NeumorphicCard } from '@/components/ui/InteractiveCard';
import { ThemeToggle, SimpleThemeToggle } from '@/components/ui/ThemeToggle';
import { useToast } from '@/components/providers/toast-wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sun,
  Moon,
  Monitor,
  Sparkles,
  Palette,
  Zap,
  Heart,
  Star,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  Bell,
  Smartphone
} from 'lucide-react';

export default function UIDemoPage() {
  const toast = useToast();

  const handleShowToast = (type: 'success' | 'error' | 'warning' | 'info') => {
    switch (type) {
      case 'success':
        toast.success('Sucesso! Operação realizada com sucesso.');
        break;
      case 'error':
        toast.error('Erro! Algo deu errado. Tente novamente.');
        break;
      case 'warning':
        toast.warning('Atenção! Esta ação pode ter consequências.');
        break;
      case 'info':
        toast.info('Informação: Aqui está uma informação útil.');
        break;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background p-6"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-4xl font-bold text-foreground mb-4"
          >
            🎨 Demonstração UI/UX
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-xl text-muted-foreground mb-6"
          >
            Explore todas as melhorias implementadas no sistema RSV 360
          </motion.p>

          <div className="flex items-center justify-center space-x-4">
            <ThemeToggle />
            <SimpleThemeToggle />
          </div>
        </motion.div>

        {/* Sistema de Temas */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold text-foreground flex items-center space-x-2">
            <Palette className="h-6 w-6 text-primary" />
            <span>Sistema de Temas</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sun className="h-5 w-5 text-yellow-500" />
                  <span>Modo Claro</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Interface limpa e clara para uso durante o dia
                </p>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Moon className="h-5 w-5 text-blue-500" />
                  <span>Modo Escuro</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Tema escuro para uso noturno e redução de fadiga visual
                </p>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Monitor className="h-5 w-5 text-green-500" />
                  <span>Automático</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Segue automaticamente as preferências do sistema
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* Cards Interativos */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold text-foreground flex items-center space-x-2">
            <Zap className="h-6 w-6 text-primary" />
            <span>Cards Interativos</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InteractiveCard
              title="Card Padrão"
              icon={<Heart className="h-5 w-5" />}
              delay={0.1}
            >
              <p className="text-center text-muted-foreground">
                Hover e clique para ver os efeitos 3D
              </p>
            </InteractiveCard>

            <GlassCard
              title="Glassmorphism"
              icon={<Sparkles className="h-5 w-5" />}
              delay={0.2}
            >
              <p className="text-center text-muted-foreground">
                Efeito de vidro translúcido
              </p>
            </GlassCard>

            <NeumorphicCard
              title="Neumorphism"
              icon={<Star className="h-5 w-5" />}
              delay={0.3}
            >
              <p className="text-center text-muted-foreground">
                Design com sombras internas
              </p>
            </NeumorphicCard>
          </div>
        </motion.section>

        {/* Sistema de Notificações */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold text-foreground flex items-center space-x-2">
            <Bell className="h-6 w-6 text-primary" />
            <span>Sistema de Notificações</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => handleShowToast('success')}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Sucesso
            </Button>

            <Button
              onClick={() => handleShowToast('error')}
              variant="destructive"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Erro
            </Button>

            <Button
              onClick={() => handleShowToast('warning')}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Aviso
            </Button>

            <Button
              onClick={() => handleShowToast('info')}
              variant="outline"
            >
              <Info className="h-4 w-4 mr-2" />
              Info
            </Button>
          </div>
        </motion.section>

        {/* Animações e Transições */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold text-foreground flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span>Animações e Transições</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle>Entrada Suave</CardTitle>
              </CardHeader>
              <CardContent>
                <motion.div
                  className="h-32 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-white font-bold">Hover e Tap</span>
                </motion.div>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardHeader>
                <CardTitle>Transições</CardTitle>
              </CardHeader>
              <CardContent>
                <motion.div
                  className="h-32 bg-gradient-to-r from-accent to-primary rounded-lg flex items-center justify-center cursor-pointer"
                  whileHover={{
                    rotate: 5,
                    scale: 1.02,
                    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)"
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <span className="text-white font-bold">Spring Animation</span>
                </motion.div>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* Responsividade */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold text-foreground flex items-center space-x-2">
            <Smartphone className="h-6 w-6 text-primary" />
            <span>Responsividade</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * i, duration: 0.3 }}
                className="h-20 bg-muted rounded-lg flex items-center justify-center hover-lift"
              >
                <span className="text-sm font-medium">Item {i + 1}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center py-8 border-t"
        >
          <p className="text-muted-foreground">
            ✨ Sistema RSV 360 com UI/UX moderno e responsivo
          </p>
          <motion.div
            className="mt-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="h-6 w-6 text-primary mx-auto" />
          </motion.div>
        </motion.footer>
      </div>
    </motion.div>
  );
}
