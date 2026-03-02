'use client';

import React, { useEffect } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { MetricCard, HealthMetricCard } from '@/components/dashboard/MetricCard';
import { TrendChart, PieChart } from '@/components/dashboard/TrendChart';
import { InteractiveCard, GlassCard } from '@/components/ui/InteractiveCard';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Download, BarChart3, Users, FileText, Activity, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const {
    data,
    health,
    report,
    loading,
    error,
    refreshData,
    loadFullReport
  } = useAnalytics();

  const handleRefresh = () => {
    refreshData();
  };

  const handleDownloadReport = async () => {
    try {
      await loadFullReport();
      if (report) {
        const reportData = JSON.stringify(report, null, 2);
        const blob = new Blob([reportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-analytics-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Erro ao baixar relatório:', err);
    }
  };

  if (loading && !data) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-screen"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <RefreshCw className="h-8 w-8 mx-auto mb-4 text-primary" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground"
          >
            Carregando dashboard...
          </motion.p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center min-h-screen"
      >
        <div className="text-center">
          <div className="text-destructive mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Activity className="h-8 w-8 mx-auto mb-2" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-lg font-medium"
            >
              Erro ao carregar dados
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-muted-foreground"
            >
              {error}
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background p-6"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header com tema */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-3xl font-bold text-foreground"
            >
              Painel de Análises
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-muted-foreground mt-1"
            >
              Visão geral do sistema RSV 360
            </motion.p>
          </div>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <Button
                onClick={handleRefresh}
                variant="outline"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <Button
                onClick={handleDownloadReport}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Relatório
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Status de Saúde */}
        {health && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <HealthMetricCard
              score={health.healthScore}
              status={health.status}
              message={health.message}
              uptime={health.uptime}
            />
          </motion.div>
        )}

        {/* Métricas Principais */}
        {data?.overview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <InteractiveCard
              title="Total de Conteúdo"
              icon={<FileText className="h-5 w-5" />}
              delay={0.1}
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">
                  {data.overview.totalContent}
                </div>
                <p className="text-sm text-muted-foreground">Itens cadastrados</p>
              </div>
            </InteractiveCard>

            <InteractiveCard
              title="Total de Usuários"
              icon={<Users className="h-5 w-5" />}
              delay={0.2}
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">
                  {data.overview.totalUsers}
                </div>
                <p className="text-sm text-muted-foreground">Usuários registrados</p>
              </div>
            </InteractiveCard>

            <InteractiveCard
              title="Usuários Ativos"
              icon={<Users className="h-5 w-5" />}
              delay={0.3}
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">
                  {data.overview.activeUsers}
                </div>
                <p className="text-sm text-muted-foreground">Usuários online</p>
              </div>
            </InteractiveCard>

            <InteractiveCard
              title="Uptime"
              icon={<Activity className="h-5 w-5" />}
              delay={0.4}
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">
                  {data.overview.uptime}h
                </div>
                <p className="text-sm text-muted-foreground">Tempo online</p>
              </div>
            </InteractiveCard>
          </motion.div>
        )}

        {/* Gráficos de Tendências */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {data?.content?.trends && (
            <GlassCard
              title="Tendências de Conteúdo (7 dias)"
              icon={<BarChart3 className="h-5 w-5" />}
              delay={0.1}
            >
              <TrendChart
                title=""
                data={data.content.trends}
                type="content"
              />
            </GlassCard>
          )}
          {data?.users?.trends && (
            <GlassCard
              title="Tendências de Usuários (7 dias)"
              icon={<BarChart3 className="h-5 w-5" />}
              delay={0.2}
            >
              <TrendChart
                title=""
                data={data.users.trends}
                type="users"
              />
            </GlassCard>
          )}
        </motion.div>

        {/* Distribuições */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {data?.content?.byType && (
            <GlassCard
              title="Distribuição por Tipo de Conteúdo"
              icon={<PieChart className="h-5 w-5" />}
              delay={0.1}
            >
              <PieChart
                title=""
                data={data.content.byType}
              />
            </GlassCard>
          )}
          {data?.users?.byRole && (
            <GlassCard
              title="Distribuição por Perfil de Usuário"
              icon={<Users className="h-5 w-5" />}
              delay={0.2}
            >
              <PieChart
                title=""
                data={data.users.byRole}
              />
            </GlassCard>
          )}
        </motion.div>

        {/* Métricas de Performance */}
        {data?.performance && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <InteractiveCard
              title="Métricas de Performance"
              icon={<Activity className="h-5 w-5" />}
              delay={0.1}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {data.performance.apiCalls}
                  </div>
                  <p className="text-sm text-muted-foreground">Chamadas de API</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {data.performance.responseTime}ms
                  </div>
                  <p className="text-sm text-muted-foreground">Tempo de resposta</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {(data.performance.errorRate * 100).toFixed(2)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Taxa de erro</p>
                </div>
              </div>
            </InteractiveCard>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.5 }}
          className="text-center text-sm text-muted-foreground py-4"
        >
          <p>Última atualização: {new Date().toLocaleString('pt-BR')}</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
