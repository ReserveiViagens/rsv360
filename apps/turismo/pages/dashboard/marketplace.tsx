'use client'

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '../../src/components/ProtectedRoute'
import { ShoppingBag, DollarSign, TrendingUp, Users, CheckCircle, XCircle, Clock, Filter } from 'lucide-react'
import { Button } from '../../src/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../src/components/ui/card'
import { Input } from '../../src/components/ui/input'
import { Label } from '../../src/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../src/components/ui/select'
import { Badge } from '../../src/components/ui/badge'
import { toast } from 'react-hot-toast'
import { api } from '../../src/services/apiClient'

interface Listing {
  id: number;
  title: string;
  description?: string;
  property_id: number;
  accommodation_id?: number;
  base_price: number;
  commission_rate: number;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
  ranking_score: number;
  total_views: number;
  total_bookings: number;
  total_revenue: number;
  property_name?: string;
  accommodation_name?: string;
  enterprise_name?: string;
  created_at: string;
}

interface Order {
  id: number;
  listing_id: number;
  customer_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  total_amount: number;
  commission_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'paid' | 'refunded';
  listing_title?: string;
  created_at: string;
}

interface Commission {
  id: number;
  order_id: number;
  enterprise_id: number;
  amount: number;
  status: 'pending' | 'paid' | 'refunded';
  order_amount?: number;
  listing_title?: string;
  created_at: string;
}

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [listingsRes, ordersRes, commissionsRes] = await Promise.all([
        api.get<{ data: Listing[] }>('/api/v1/marketplace/listings', { status: filters.status === 'all' ? undefined : filters.status }),
        api.get<Order[]>('/api/v1/marketplace/orders'),
        api.get<Commission[]>('/api/v1/marketplace/commissions'),
      ])

      setListings(listingsRes.data || [])
      setOrders(Array.isArray(ordersRes) ? ordersRes : [])
      setCommissions(Array.isArray(commissionsRes) ? commissionsRes : [])
    } catch (error) {
      console.error('Failed to load marketplace data:', error)
      toast.error('Erro ao carregar dados do marketplace.')
    } finally {
      setLoading(false)
    }
  }

  // Calcular estatísticas
  const totalListings = listings.length
  const activeListings = listings.filter(l => l.status === 'active').length
  const totalOrders = orders.length
  const totalCommissions = commissions.reduce((sum, c) => sum + (c.status === 'paid' ? c.amount : 0), 0)
  const pendingCommissions = commissions.reduce((sum, c) => sum + (c.status === 'pending' ? c.amount : 0), 0)

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary inline-block"></div>
          <p className="mt-4 text-gray-600">Carregando marketplace...</p>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-blue-600" />
          Marketplace Multi-Hotéis
        </h1>
        <p className="text-muted-foreground">
          Gerencie suas listagens, pedidos e comissões no marketplace.
        </p>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Listagens</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalListings}</div>
              <p className="text-xs text-muted-foreground">{activeListings} ativas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground">Total recebidos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comissões Pagas</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {totalCommissions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">Total recebido</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comissões Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {pendingCommissions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">A receber</p>
            </CardContent>
          </Card>
        </div>

        {/* Listagens */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Minhas Listagens ({listings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {listings.length === 0 ? (
              <p className="text-muted-foreground">Nenhuma listagem encontrada.</p>
            ) : (
              <div className="space-y-4">
                {listings.map((listing) => (
                  <div key={listing.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{listing.title}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={listing.status === 'active' ? 'default' : 'secondary'}>
                            {listing.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Score: {listing.ranking_score.toFixed(2)}
                          </span>
                        </div>
                        {listing.property_name && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {listing.property_name}
                            {listing.accommodation_name && ` - ${listing.accommodation_name}`}
                          </p>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                          <div>
                            <span className="font-medium">Preço Base:</span> R$ {listing.base_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                          <div>
                            <span className="font-medium">Comissão:</span> {listing.commission_rate}%
                          </div>
                          <div>
                            <span className="font-medium">Visualizações:</span> {listing.total_views}
                          </div>
                          <div>
                            <span className="font-medium">Reservas:</span> {listing.total_bookings}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pedidos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Pedidos Recebidos ({orders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-muted-foreground">Nenhum pedido encontrado.</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold">{order.listing_title || `Pedido #${order.id}`}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={order.status === 'confirmed' ? 'default' : 'secondary'}>
                            {order.status}
                          </Badge>
                          <Badge variant={order.payment_status === 'paid' ? 'default' : 'outline'}>
                            {order.payment_status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                          <div>
                            <span className="font-medium">Check-in:</span> {new Date(order.check_in).toLocaleDateString('pt-BR')}
                          </div>
                          <div>
                            <span className="font-medium">Check-out:</span> {new Date(order.check_out).toLocaleDateString('pt-BR')}
                          </div>
                          <div>
                            <span className="font-medium">Total:</span> R$ {order.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                          <div>
                            <span className="font-medium">Comissão:</span> R$ {order.commission_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comissões */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Comissões ({commissions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {commissions.length === 0 ? (
              <p className="text-muted-foreground">Nenhuma comissão encontrada.</p>
            ) : (
              <div className="space-y-4">
                {commissions.map((commission) => (
                  <div key={commission.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold">{commission.listing_title || `Comissão #${commission.id}`}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={commission.status === 'paid' ? 'default' : 'secondary'}>
                            {commission.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 text-sm">
                          <div>
                            <span className="font-medium">Valor do Pedido:</span> R$ {commission.order_amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0.00'}
                          </div>
                          <div>
                            <span className="font-medium">Comissão (8%):</span> R$ {commission.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                          <div>
                            <span className="font-medium">Data:</span> {new Date(commission.created_at).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
