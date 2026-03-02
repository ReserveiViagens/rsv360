'use client';

import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Award, Percent } from 'lucide-react';

interface DashboardStats {
  occupancyRate?: number;
  revenueToday?: number;
  activeAuctions?: number;
  wonAuctions?: number;
  totalRevenue?: number;
  averageBidValue?: number;
  conversionRate?: number;
}

interface AuctionStatsProps {
  stats?: DashboardStats;
  loading?: boolean;
}

export function AuctionStats({ stats, loading }: AuctionStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const defaultStats: DashboardStats = {
    occupancyRate: 89,
    revenueToday: 5200,
    activeAuctions: 22,
    wonAuctions: 15,
    totalRevenue: 1200000,
    averageBidValue: 850,
    conversionRate: 68.2,
  };

  const displayStats = { ...defaultStats, ...stats };

  const statCards = [
    {
      title: 'Taxa de Ocupação',
      value: `${displayStats.occupancyRate}%`,
      icon: Percent,
      color: 'bg-blue-500',
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: '+5%',
      trendUp: true,
    },
    {
      title: 'Receita Hoje',
      value: `R$ ${displayStats.revenueToday?.toLocaleString('pt-BR')}`,
      icon: DollarSign,
      color: 'bg-green-500',
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Leilões Ativos',
      value: displayStats.activeAuctions?.toString() || '0',
      icon: Calendar,
      color: 'bg-purple-500',
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-100',
      trend: '+3',
      trendUp: true,
    },
    {
      title: 'Leilões Ganhos',
      value: displayStats.wonAuctions?.toString() || '0',
      icon: Award,
      color: 'bg-orange-500',
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-100',
      trend: '+2',
      trendUp: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              {stat.trendUp ? (
                <div className="flex items-center text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {stat.trend}
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <TrendingDown className="w-4 h-4 mr-1" />
                  {stat.trend}
                </div>
              )}
              <span className="text-gray-500 ml-2">vs período anterior</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
