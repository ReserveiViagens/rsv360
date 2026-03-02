import React from 'react';
import { Layout } from '../components/layout';
import { Card, Button } from '../components/ui';
import { AnimatedCard, PageTransition } from '../components/ui';
import { useAnimations } from '../hooks/useAnimations';
import { Calendar, DollarSign, MapPin, Star, Plus, RefreshCw } from 'lucide-react';

export default function DashboardNew() {
  const { staggerContainer, staggerItem } = useAnimations();

  return (
    <Layout>
      <PageTransition type="fade" className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              📊 Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Visão geral do sistema Reservei Viagens
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4" />
              <span>Atualizar</span>
            </Button>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Nova Reserva</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <motion.div variants={staggerItem}>
            <AnimatedCard animation="fadeInUp" delay={0} hover="lift">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total de Reservas
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      1,247
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </motion.div>

          <motion.div variants={staggerItem}>
            <AnimatedCard animation="fadeInUp" delay={100} hover="lift">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Receita Total
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      R$ 125.000
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </motion.div>

          <motion.div variants={staggerItem}>
            <AnimatedCard animation="fadeInUp" delay={200} hover="lift">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Viagens Ativas
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      23
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <MapPin className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </motion.div>

          <motion.div variants={staggerItem}>
            <AnimatedCard animation="fadeInUp" delay={300} hover="lift">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Satisfação
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      4.8/5
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    <Star className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </motion.div>
        </motion.div>

        {/* Welcome Message */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🎉 Sistema Reservei Viagens - Funcionalidades Avançadas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-medium text-blue-600 dark:text-blue-400 mb-2">
                ⌨️ Keyboard Shortcuts
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Pressione "?" para ver todos os atalhos disponíveis
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-medium text-green-600 dark:text-green-400 mb-2">
                📱 PWA Features
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Instale o app e use offline
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h3 className="font-medium text-purple-600 dark:text-purple-400 mb-2">
                ♿ Acessibilidade
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Totalmente acessível e inclusivo
              </p>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <h3 className="font-medium text-orange-600 dark:text-orange-400 mb-2">
                🎭 Animações
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Transições fluidas e micro-interações
              </p>
            </div>
          </div>
        </Card>
      </PageTransition>
    </Layout>
  );
}
