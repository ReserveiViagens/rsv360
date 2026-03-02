'use client'

import React, { useState, useMemo } from 'react'
import ProtectedRoute from '../src/components/ProtectedRoute'
import {
  Ticket,
  Search,
  Filter,
  ExternalLink,
  Star,
  Clock,
  Users,
  MapPin,
  Grid3X3,
  List,
  Eye,
  Edit3,
  DollarSign,
  Calendar,
  CheckCircle,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  getAttractionsByCity,
  getAllAttractions,
  searchAttractions,
  attractionTypes,
  caldasNovasAttractions,
  type Attraction,
  type TicketType,
} from '@/lib/attractions-data'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const SITE_PUBLIC_URL = typeof window !== 'undefined' ? 'http://localhost:3000' : ''

interface TicketDisplay {
  id: string
  attraction: Attraction
  ticketType: TicketType
  available: number
  total: number
  validUntil?: string
  status: 'ativo' | 'esgotado' | 'inativo'
}

function formatPrice(value: number) {
  if (value === 0) return 'Grátis'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value)
}

function TicketCard({
  ticket,
  viewMode,
}: {
  ticket: TicketDisplay
  viewMode: 'grid' | 'list'
}) {
  const { attraction, ticketType } = ticket
  const typeLabel = attractionTypes.find((t) => t.value === attraction.type)?.label || attraction.type

  const cardContent = (
    <>
      <div
        className={`relative overflow-hidden bg-gray-200 ${
          viewMode === 'grid' ? 'aspect-video' : 'w-48 shrink-0 aspect-video'
        }`}
      >
        <img
          src={attraction.imageUrl || '/placeholder.svg?height=300&width=400'}
          alt={attraction.name}
          className="h-full w-full object-cover transition-transform hover:scale-105"
        />
        <Badge className="absolute top-2 left-2 bg-white/90 text-gray-800 text-xs">
          {typeLabel.split(' ')[0]}
        </Badge>
        {ticket.status === 'esgotado' && (
          <Badge className="absolute top-2 right-2 bg-red-500 text-white font-bold">
            Esgotado
          </Badge>
        )}
        {ticket.ticketType.basePrice === 0 && (
          <Badge className="absolute top-2 right-2 bg-emerald-500 text-white font-bold">
            Grátis
          </Badge>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
          <span className="text-white text-xs flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {attraction.city}, {attraction.state}
          </span>
        </div>
      </div>

      <div className={viewMode === 'list' ? 'flex-1 min-w-0 p-4' : 'p-4'}>
        <h3 className="font-semibold text-gray-900 truncate">{attraction.name}</h3>
        <p className="text-sm text-gray-600 font-medium mt-1">{ticketType.name}</p>
        <p className="text-xs text-gray-500 mt-0.5">{ticketType.description}</p>

        {ticketType.includes && ticketType.includes.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {ticketType.includes.slice(0, 2).map((include, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {include}
              </Badge>
            ))}
            {ticketType.includes.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{ticketType.includes.length - 2}
              </Badge>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 mt-3">
          {attraction.duration && (
            <span className="flex items-center gap-1 text-gray-500 text-sm">
              <Clock className="w-4 h-4" />
              {attraction.duration}
            </span>
          )}
          <span className="flex items-center gap-1 text-gray-500 text-sm">
            <Users className="w-4 h-4" />
            {ticketType.ageGroup}
          </span>
        </div>

        <div className="flex items-center justify-between mt-4 gap-2 border-t pt-4">
          <div>
            <span className="text-lg font-bold text-emerald-600">
              {formatPrice(ticketType.basePrice)}
            </span>
            <span className="text-xs text-gray-500 block">por pessoa</span>
            {ticket.available !== ticket.total && (
              <span className="text-xs text-gray-500">
                {ticket.available} de {ticket.total} disponíveis
              </span>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              className="shrink-0"
              onClick={() => window.open(`${SITE_PUBLIC_URL}/atracoes`, '_blank')}
              title="Ver no site público"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" className="shrink-0" title="Editar (em breve)">
              <Edit3 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  )

  if (viewMode === 'list') {
    return (
      <div className="flex rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        {cardContent}
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-white shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
      {cardContent}
    </div>
  )
}

export default function TicketsPage() {
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState<string>('Caldas Novas')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [ageGroupFilter, setAgeGroupFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Gerar tickets a partir das atrações
  const allTickets = useMemo(() => {
    const tickets: TicketDisplay[] = []
    const attractions = cityFilter && cityFilter !== 'all' 
      ? getAttractionsByCity(cityFilter) 
      : getAllAttractions()

    attractions.forEach((attraction) => {
      attraction.ticketTypes.forEach((ticketType) => {
        tickets.push({
          id: `${attraction.id}-${ticketType.id}`,
          attraction,
          ticketType,
          available: Math.floor(Math.random() * 50) + 10, // Mock: disponibilidade
          total: Math.floor(Math.random() * 50) + 50, // Mock: total
          status: Math.random() > 0.8 ? 'esgotado' : 'ativo' as const,
        })
      })
    })

    return tickets
  }, [cityFilter])

  const filteredTickets = useMemo(() => {
    let list = allTickets

    if (search.trim()) {
      const searchLower = search.toLowerCase()
      list = list.filter(
        (t) =>
          t.attraction.name.toLowerCase().includes(searchLower) ||
          t.attraction.description?.toLowerCase().includes(searchLower) ||
          t.ticketType.name.toLowerCase().includes(searchLower)
      )
    }

    if (typeFilter && typeFilter !== 'all') {
      list = list.filter((t) => t.attraction.type === typeFilter)
    }

    if (ageGroupFilter && ageGroupFilter !== 'all') {
      list = list.filter((t) => t.ticketType.ageGroup === ageGroupFilter)
    }

    return list
  }, [allTickets, search, typeFilter, ageGroupFilter])

  const cities = useMemo(() => {
    const seen = new Set<string>()
    return getAllAttractions()
      .map((a) => a.city)
      .filter((c) => {
        if (seen.has(c)) return false
        seen.add(c)
        return true
      })
      .sort()
  }, [])

  const ageGroups = [
    { value: 'all', label: 'Todas as idades' },
    { value: 'adulto', label: 'Adulto' },
    { value: 'crianca', label: 'Criança' },
    { value: 'idoso', label: 'Idoso' },
    { value: 'estudante', label: 'Estudante' },
    { value: 'familia', label: 'Família' },
  ]

  // Estatísticas
  const stats = useMemo(() => {
    const totalTickets = filteredTickets.length
    const totalRevenue = filteredTickets.reduce(
      (sum, t) => sum + t.ticketType.basePrice * (t.total - t.available),
      0
    )
    const availableTickets = filteredTickets.reduce((sum, t) => sum + t.available, 0)
    const soldTickets = filteredTickets.reduce((sum, t) => sum + (t.total - t.available), 0)
    const activeTickets = filteredTickets.filter((t) => t.status === 'ativo').length

    return {
      totalTickets,
      totalRevenue,
      availableTickets,
      soldTickets,
      activeTickets,
    }
  }, [filteredTickets])

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Ticket className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Gestão de Ingressos
              </h1>
              <p className="text-gray-600 mt-0.5">
                {filteredTickets.length} tipos de ingressos encontrados
              </p>
            </div>
          </div>
          <a href={`${SITE_PUBLIC_URL}/atracoes`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              Ver no site público
            </Button>
          </a>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalTickets}</p>
              </div>
              <Ticket className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Receita</p>
                <p className="text-xl font-bold text-emerald-600">
                  {formatPrice(stats.totalRevenue)}
                </p>
              </div>
              <DollarSign className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Disponíveis</p>
                <p className="text-xl font-bold text-blue-600">{stats.availableTickets}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Vendidos</p>
                <p className="text-xl font-bold text-purple-600">{stats.soldTickets}</p>
              </div>
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Ativos</p>
                <p className="text-xl font-bold text-green-600">{stats.activeTickets}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="rounded-xl border bg-white p-4 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-gray-700">
            <Filter className="w-5 h-5" />
            <span className="font-medium">Filtros</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Atração ou ingresso..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="city">Cidade</Label>
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger id="city" className="mt-1">
                  <SelectValue placeholder="Todas as cidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as cidades</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Tipo de Atração</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger id="type" className="mt-1">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {attractionTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ageGroup">Faixa Etária</Label>
              <Select value={ageGroupFilter} onValueChange={setAgeGroupFilter}>
                <SelectTrigger id="ageGroup" className="mt-1">
                  <SelectValue placeholder="Todas as idades" />
                </SelectTrigger>
                <SelectContent>
                  {ageGroups.map((ag) => (
                    <SelectItem key={ag.value} value={ag.value}>
                      {ag.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <div className="flex rounded-lg border p-1">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {cityFilter === 'Caldas Novas' && (
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 flex items-center gap-3">
            <Ticket className="w-5 h-5 text-blue-600 shrink-0" />
            <p className="text-sm text-blue-800">
              <strong>Caldas Novas</strong> – {caldasNovasAttractions.length} atrações com{' '}
              {allTickets.filter((t) => t.attraction.city === 'Caldas Novas').length} tipos de
              ingressos disponíveis. Visualize no site público em{' '}
              <a
                href={`${SITE_PUBLIC_URL}/atracoes`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                localhost:3000/atracoes
              </a>
            </p>
          </div>
        )}

        {filteredTickets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
            <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Nenhum ingresso encontrado</p>
            <p className="text-sm text-gray-500 mt-1">
              Tente ajustar os filtros ou incluir Caldas Novas nas cidades
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {filteredTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} viewMode={viewMode} />
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
