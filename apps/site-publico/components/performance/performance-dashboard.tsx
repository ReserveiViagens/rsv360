"use client";

import React from 'react';
import { usePerformanceMetrics } from '@/lib/performance-monitor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressBar } from '@/components/animations/micro-interactions';

/**
 * ✅ PERFORMANCE DASHBOARD
 * 
 * Dashboard para visualizar métricas de performance em tempo real
 */
export function PerformanceDashboard() {
  const metrics = usePerformanceMetrics();

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Carregando métricas...</p>
        </CardContent>
      </Card>
    );
  }

  const getScore = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return { score: 'good', color: 'bg-green-600' };
    if (value <= thresholds.poor) return { score: 'needs-improvement', color: 'bg-yellow-600' };
    return { score: 'poor', color: 'bg-red-600' };
  };

  const lcpScore = getScore(metrics.largestContentfulPaint, { good: 2500, poor: 4000 });
  const fidScore = getScore(metrics.firstInputDelay, { good: 100, poor: 300 });
  const clsScore = getScore(metrics.cumulativeLayoutShift, { good: 0.1, poor: 0.25 });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Web Vitals</CardTitle>
          <CardDescription>Métricas de performance da página</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* LCP */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Largest Contentful Paint (LCP)</span>
              <span className="text-sm text-muted-foreground">
                {metrics.largestContentfulPaint.toFixed(0)}ms
              </span>
            </div>
            <ProgressBar
              progress={Math.min((metrics.largestContentfulPaint / 4000) * 100, 100)}
              color={lcpScore.color}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {lcpScore.score === 'good' && '✅ Excelente'}
              {lcpScore.score === 'needs-improvement' && '⚠️ Precisa melhorar'}
              {lcpScore.score === 'poor' && '❌ Ruim'}
            </p>
          </div>

          {/* FID */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">First Input Delay (FID)</span>
              <span className="text-sm text-muted-foreground">
                {metrics.firstInputDelay.toFixed(0)}ms
              </span>
            </div>
            <ProgressBar
              progress={Math.min((metrics.firstInputDelay / 300) * 100, 100)}
              color={fidScore.color}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {fidScore.score === 'good' && '✅ Excelente'}
              {fidScore.score === 'needs-improvement' && '⚠️ Precisa melhorar'}
              {fidScore.score === 'poor' && '❌ Ruim'}
            </p>
          </div>

          {/* CLS */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Cumulative Layout Shift (CLS)</span>
              <span className="text-sm text-muted-foreground">
                {metrics.cumulativeLayoutShift.toFixed(3)}
              </span>
            </div>
            <ProgressBar
              progress={Math.min((metrics.cumulativeLayoutShift / 0.25) * 100, 100)}
              color={clsScore.color}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {clsScore.score === 'good' && '✅ Excelente'}
              {clsScore.score === 'needs-improvement' && '⚠️ Precisa melhorar'}
              {clsScore.score === 'poor' && '❌ Ruim'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Memory Usage */}
      {metrics.memoryUsage && (
        <Card>
          <CardHeader>
            <CardTitle>Uso de Memória</CardTitle>
            <CardDescription>Consumo de memória JavaScript</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Usado</span>
                <span>{(metrics.memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total</span>
                <span>{(metrics.memoryUsage.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Limite</span>
                <span>{(metrics.memoryUsage.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              <ProgressBar
                progress={
                  (metrics.memoryUsage.usedJSHeapSize / metrics.memoryUsage.jsHeapSizeLimit) * 100
                }
                color="bg-blue-600"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

