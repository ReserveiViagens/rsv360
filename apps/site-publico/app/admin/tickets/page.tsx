'use client';

/**
 * Página Admin: Gerenciamento de Tickets
 * Dashboard administrativo para gerenciar todos os tickets
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, BarChart3, Users, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TicketList } from '@/components/tickets/TicketList';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Stats {
  overview: {
    total: number;
    open: number;
    resolved: number;
    closed: number;
    unassigned: number;
    sla_breached: number;
  };
  by_priority: Array<{ priority: string; count: string }>;
  by_category: Array<{ category: string; count: string }>;
  by_status: Array<{ status: string; count: string }>;
  metrics: {
    avg_resolution_hours: number;
    sla: any;
  };
}

export default function AdminTicketsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    loadStats();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUserRole(userData.role);
        
        if (userData.role !== 'admin' && userData.role !== 'staff') {
          router.push('/tickets');
        }
      } else {
        router.push('/login');
      }
    } catch (err) {
      router.push('/login');
    }
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/tickets/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar estatísticas');
      }

      const result = await response.json();
      setStats(result.data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (userRole !== 'admin' && userRole !== 'staff') {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gerenciamento de Tickets</h1>
        <p className="text-gray-500 mt-1">Dashboard administrativo</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Tickets</CardTitle>
              <BarChart3 className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Abertos</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.overview.open}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sem Atribuição</CardTitle>
              <Users className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.overview.unassigned}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SLA Violado</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overview.sla_breached}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tickets List */}
      <div className="mt-8">
        <TicketList />
      </div>
    </div>
  );
}

