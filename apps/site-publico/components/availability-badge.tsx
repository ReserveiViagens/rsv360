"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, AlertCircle, CheckCircle } from "lucide-react"
import { Hotel } from "@/lib/hotels-data"

interface AvailabilityBadgeProps {
  hotel: Hotel
  showDetails?: boolean
}

export function AvailabilityBadge({ hotel, showDetails = false }: AvailabilityBadgeProps) {
  const [timeAgo, setTimeAgo] = useState("")

  useEffect(() => {
    const updateTimeAgo = () => {
      if (!hotel.availability?.lastUpdated) return
      
      const now = new Date()
      const lastUpdated = new Date(hotel.availability.lastUpdated)
      const diffInMinutes = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60))
      
      if (diffInMinutes < 1) {
        setTimeAgo("Agora mesmo")
      } else if (diffInMinutes < 60) {
        setTimeAgo(`${diffInMinutes}min atrás`)
      } else if (diffInMinutes < 1440) {
        const hours = Math.floor(diffInMinutes / 60)
        setTimeAgo(`${hours}h atrás`)
      } else {
        const days = Math.floor(diffInMinutes / 1440)
        setTimeAgo(`${days}d atrás`)
      }
    }

    updateTimeAgo()
    const interval = setInterval(updateTimeAgo, 60000) // Atualiza a cada minuto

    return () => clearInterval(interval)
  }, [hotel.availability.lastUpdated])

  const getStatusConfig = () => {
    const status = hotel.availability?.status || 'available'
    switch (status) {
      case 'available':
        return {
          label: 'Disponível',
          className: 'bg-green-100 text-green-800 border-green-200',
          icon: <CheckCircle className="w-3 h-3" />,
          pulse: false
        }
      case 'limited':
        return {
          label: 'Poucas vagas',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <AlertCircle className="w-3 h-3" />,
          pulse: true
        }
      case 'sold_out':
        return {
          label: 'Esgotado',
          className: 'bg-red-100 text-red-800 border-red-200',
          icon: <AlertCircle className="w-3 h-3" />,
          pulse: false
        }
      case 'coming_soon':
        return {
          label: 'Em breve',
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <Clock className="w-3 h-3" />,
          pulse: false
        }
      default:
        return {
          label: 'Indisponível',
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <AlertCircle className="w-3 h-3" />,
          pulse: false
        }
    }
  }

  const statusConfig = getStatusConfig()

  return (
    <div className="flex flex-col gap-1">
      <Badge 
        className={`${statusConfig.className} ${statusConfig.pulse ? 'animate-pulse' : ''} flex items-center gap-1 text-xs font-medium`}
      >
        {statusConfig.icon}
        {statusConfig.label}
        {hotel.availability?.roomsAvailable && (
          <span className="ml-1">
            ({hotel.availability.roomsAvailable})
          </span>
        )}
      </Badge>
      
      {showDetails && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>Atualizado {timeAgo}</span>
        </div>
      )}
    </div>
  )
}

interface AvailabilityStatusProps {
  hotels: Hotel[]
}

export function AvailabilityStatus({ hotels }: AvailabilityStatusProps) {
  const [statusCounts, setStatusCounts] = useState({
    available: 0,
    limited: 0,
    sold_out: 0,
    coming_soon: 0
  })

  useEffect(() => {
    const counts = hotels.reduce((acc, hotel) => {
      acc[hotel.availability.status]++
      return acc
    }, { available: 0, limited: 0, sold_out: 0, coming_soon: 0 })

    setStatusCounts(counts)
  }, [hotels])

  return (
    <div className="flex gap-2 flex-wrap">
      {statusCounts.available > 0 && (
        <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          {statusCounts.available} Disponível{statusCounts.available > 1 ? 'is' : ''}
        </Badge>
      )}
      {statusCounts.limited > 0 && (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center gap-1 animate-pulse">
          <AlertCircle className="w-3 h-3" />
          {statusCounts.limited} Poucas vagas
        </Badge>
      )}
      {statusCounts.sold_out > 0 && (
        <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {statusCounts.sold_out} Esgotado{statusCounts.sold_out > 1 ? 's' : ''}
        </Badge>
      )}
      {statusCounts.coming_soon > 0 && (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {statusCounts.coming_soon} Em breve
        </Badge>
      )}
    </div>
  )
}
