"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, Star, Users, Calendar, DollarSign, Download, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getToken } from "@/lib/auth"
// exportDashboardStats moved to API route to avoid client-side pg import
import LoadingSpinner from "@/components/ui/loading-spinner"
import { SkeletonList } from "@/components/ui/skeleton-loader"
import FadeIn from "@/components/ui/fade-in"
import { useToast } from "@/components/providers/toast-wrapper"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export default function DashboardEstatisticasPage() {
  const [stats, setStats] = useState<any>(null)
  const [period, setPeriod] = useState('30')
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    loadStats()
  }, [period])

  const loadStats = async () => {
    setLoading(true)
    try {
      const token = getToken()
      const response = await fetch(`/api/analytics/stats?period=${period}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const result = await response.json()
      if (result.success) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
      // Dados mock para demonstração
      setStats({
        summary: {
          total_bookings: 1250,
          total_revenue: 125000,
          average_rating: 4.8,
          total_reviews: 342,
          bookings_change: 12.5,
          revenue_change: 8.3,
          rating_change: 0.2
        },
        bookings_over_time: [
          { date: 'Jan', bookings: 45, revenue: 4500 },
          { date: 'Fev', bookings: 52, revenue: 5200 },
          { date: 'Mar', bookings: 48, revenue: 4800 },
          { date: 'Abr', bookings: 61, revenue: 6100 },
          { date: 'Mai', bookings: 55, revenue: 5500 },
          { date: 'Jun', bookings: 67, revenue: 6700 }
        ],
        bookings_by_category: [
          { name: 'Hotéis', value: 35 },
          { name: 'Pousadas', value: 28 },
          { name: 'Resorts', value: 22 },
          { name: 'Apartamentos', value: 15 }
        ],
        revenue_by_month: [
          { month: 'Jan', revenue: 45000, previous: 42000 },
          { month: 'Fev', revenue: 52000, previous: 48000 },
          { month: 'Mar', revenue: 48000, previous: 45000 },
          { month: 'Abr', revenue: 61000, previous: 55000 },
          { month: 'Mai', revenue: 55000, previous: 52000 },
          { month: 'Jun', revenue: 67000, previous: 60000 }
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async (format: 'csv' | 'excel' | 'pdf' = 'csv') => {
    if (!stats) {
      toast.warning('Nenhuma estatística para exportar');
      return;
    }
    try {
      // Call API route instead of direct import (pg is Node.js only)
      const response = await fetch('/api/reports/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: stats, format }),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-stats.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success(`Relatório exportado em ${format.toUpperCase()} com sucesso!`);
      } else {
        throw new Error('Erro ao exportar');
      }
    } catch (error) {
      toast.error('Erro ao exportar relatório');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <FadeIn>
          <LoadingSpinner size="lg" text="Carregando estatísticas..." />
        </FadeIn>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard de Estatísticas</h1>
            <p className="text-gray-600 mt-1">Análise completa do seu perfil e negócio</p>
          </div>
          <div className="flex gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
                <SelectItem value="365">Último ano</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button onClick={() => exportReport('csv')} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button onClick={() => exportReport('pdf')} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Reservas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.summary.total_bookings.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                {stats.summary.bookings_change > 0 ? (
                  <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1 text-red-600" />
                )}
                <span className={stats.summary.bookings_change > 0 ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(stats.summary.bookings_change)}% vs período anterior
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {stats.summary.total_revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                {stats.summary.revenue_change > 0 ? (
                  <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1 text-red-600" />
                )}
                <span className={stats.summary.revenue_change > 0 ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(stats.summary.revenue_change)}% vs período anterior
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.summary.average_rating.toFixed(1)}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                {stats.summary.rating_change > 0 ? (
                  <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1 text-red-600" />
                )}
                <span className={stats.summary.rating_change > 0 ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(stats.summary.rating_change)} pontos vs período anterior
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Avaliações</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.summary.total_reviews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.summary.total_bookings > 0 
                  ? `${((stats.summary.total_reviews / stats.summary.total_bookings) * 100).toFixed(1)}% de taxa de avaliação`
                  : 'Nenhuma reserva ainda'
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Gráfico de Reservas ao Longo do Tempo */}
          <Card>
            <CardHeader>
              <CardTitle>Reservas ao Longo do Tempo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats.bookings_over_time}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="bookings" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Receita */}
          <Card>
            <CardHeader>
              <CardTitle>Receita Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.revenue_by_month}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="previous" fill="#8884d8" name="Período Anterior" />
                  <Bar dataKey="revenue" fill="#82ca9d" name="Atual" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Pizza - Reservas por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Reservas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.bookings_by_category}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.bookings_by_category.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

