'use client'

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '../../src/components/ProtectedRoute'
import { Globe, FileCode, RefreshCw, Upload, BarChart3, TrendingUp, Eye, MousePointerClick, DollarSign, Filter } from 'lucide-react'
import { Button } from '../../src/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../src/components/ui/card'
import { Input } from '../../src/components/ui/input'
import { Label } from '../../src/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../src/components/ui/select'
import { Badge } from '../../src/components/ui/badge'
import { toast } from 'react-hot-toast'
import { api } from '../../src/services/apiClient'

interface Feed {
  id: number;
  feed_name: string;
  property_id?: number;
  status: 'active' | 'inactive' | 'error';
  last_generated_at?: string;
  last_uploaded_at?: string;
  generation_frequency: number;
  auto_generate: boolean;
  total_properties: number;
  total_rooms: number;
  errors?: string;
  feed_url?: string;
  created_at: string;
  property_name?: string;
}

interface Campaign {
  id: number;
  feed_id: number;
  campaign_name: string;
  campaign_id?: string;
  budget_daily?: number;
  budget_monthly?: number;
  target_countries?: string[];
  target_cities?: string[];
  status: 'active' | 'paused' | 'ended';
  start_date?: string;
  end_date?: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  revenue: number;
  ctr?: number;
  conversion_rate?: number;
  cpc?: number;
  roas?: number;
  feed_name?: string;
}

export default function GoogleHotelAdsPage() {
  const [feeds, setFeeds] = useState<Feed[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [filters, setFilters] = useState({
    period: 'last_30_days',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const feedsResponse = await api.get<{ feeds: Feed[] }>('/api/v1/google-hotel-ads/feeds')
      setFeeds(feedsResponse.feeds || [])

      const campaignsResponse = await api.get<Campaign[]>('/api/v1/google-hotel-ads/campaigns')
      setCampaigns(Array.isArray(campaignsResponse) ? campaignsResponse : [])
    } catch (error) {
      console.error('Failed to load Google Hotel Ads data:', error)
      toast.error('Erro ao carregar dados de Google Hotel Ads.')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateFeed = async (feedId: number) => {
    try {
      await api.post(`/api/v1/google-hotel-ads/feeds/${feedId}/generate`)
      toast.success('Feed gerado com sucesso!')
      loadData()
    } catch (error) {
      console.error('Failed to generate feed:', error)
      toast.error('Erro ao gerar feed.')
    }
  }

  const handleUploadFeed = async (feedId: number) => {
    try {
      await api.post(`/api/v1/google-hotel-ads/feeds/${feedId}/upload`)
      toast.success('Feed enviado com sucesso!')
      loadData()
    } catch (error) {
      console.error('Failed to upload feed:', error)
      toast.error('Erro ao enviar feed.')
    }
  }

  const loadCampaignMetrics = async (campaignId: number) => {
    try {
      const metrics = await api.get<Campaign>(`/api/v1/google-hotel-ads/campaigns/${campaignId}/metrics`)
      setSelectedCampaign(metrics)
    } catch (error) {
      console.error('Failed to load campaign metrics:', error)
      toast.error('Erro ao carregar métricas da campanha.')
    }
  }

  // Calcular estatísticas agregadas
  const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0)
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0)
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0)
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0)
  const totalCost = campaigns.reduce((sum, c) => sum + c.cost, 0)
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
  const avgConversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0
  const avgROAS = totalCost > 0 ? totalRevenue / totalCost : 0

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary inline-block"></div>
          <p className="mt-4 text-gray-600">Carregando Google Hotel Ads...</p>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Globe className="w-8 h-8 text-blue-600" />
          Google Hotel Ads
        </h1>
        <p className="text-muted-foreground">
          Gerencie feeds XML e monitore campanhas do Google Hotel Ads.
        </p>

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Impressões</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalImpressions.toLocaleString('pt-BR')}</div>
              <p className="text-xs text-muted-foreground">Total de impressões</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cliques</CardTitle>
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClicks.toLocaleString('pt-BR')}</div>
              <p className="text-xs text-muted-foreground">CTR: {avgCTR.toFixed(2)}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversões</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalConversions.toLocaleString('pt-BR')}</div>
              <p className="text-xs text-muted-foreground">Taxa: {avgConversionRate.toFixed(2)}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">ROAS: {avgROAS.toFixed(2)}x</p>
            </CardContent>
          </Card>
        </div>

        {/* Feeds */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCode className="w-5 h-5" />
              Feeds XML ({feeds.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {feeds.length === 0 ? (
              <p className="text-muted-foreground">Nenhum feed configurado ainda.</p>
            ) : (
              <div className="space-y-4">
                {feeds.map((feed) => (
                  <div key={feed.id} className="border rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{feed.feed_name}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={feed.status === 'active' ? 'default' : 'secondary'}>
                          {feed.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {feed.total_properties} propriedades, {feed.total_rooms} quartos
                        </span>
                      </div>
                      {feed.last_generated_at && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Última geração: {new Date(feed.last_generated_at).toLocaleString('pt-BR')}
                        </p>
                      )}
                      {feed.errors && (
                        <p className="text-sm text-red-600 mt-1">Erro: {feed.errors}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleGenerateFeed(feed.id)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Gerar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleUploadFeed(feed.id)}>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                      {feed.feed_url && (
                        <Button variant="outline" size="sm" onClick={() => window.open(feed.feed_url, '_blank')}>
                          <FileCode className="w-4 h-4 mr-2" />
                          Ver XML
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Campanhas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Campanhas ({campaigns.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {campaigns.length === 0 ? (
              <p className="text-muted-foreground">Nenhuma campanha encontrada.</p>
            ) : (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => loadCampaignMetrics(campaign.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{campaign.campaign_name}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                            {campaign.status}
                          </Badge>
                          {campaign.feed_name && (
                            <span className="text-sm text-muted-foreground">Feed: {campaign.feed_name}</span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                          <div>
                            <span className="font-medium">Impressões:</span> {campaign.impressions.toLocaleString('pt-BR')}
                          </div>
                          <div>
                            <span className="font-medium">Cliques:</span> {campaign.clicks.toLocaleString('pt-BR')}
                          </div>
                          <div>
                            <span className="font-medium">Conversões:</span> {campaign.conversions.toLocaleString('pt-BR')}
                          </div>
                          <div>
                            <span className="font-medium">Receita:</span> R$ {campaign.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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

        {/* Métricas Detalhadas da Campanha Selecionada */}
        {selectedCampaign && (
          <Card>
            <CardHeader>
              <CardTitle>Métricas Detalhadas: {selectedCampaign.campaign_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">CTR</p>
                  <p className="text-2xl font-bold">{selectedCampaign.ctr?.toFixed(2) || '0.00'}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                  <p className="text-2xl font-bold">{selectedCampaign.conversion_rate?.toFixed(2) || '0.00'}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CPC</p>
                  <p className="text-2xl font-bold">R$ {selectedCampaign.cpc?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ROAS</p>
                  <p className="text-2xl font-bold">{selectedCampaign.roas?.toFixed(2) || '0.00'}x</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  )
}
