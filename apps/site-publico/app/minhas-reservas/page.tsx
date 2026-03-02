"use client"

import { useState, useEffect } from "react"
import { Calendar, MapPin, Users, CheckCircle, Clock, XCircle, Search, Filter, Download, Phone, Mail } from "lucide-react"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { SkeletonList } from "@/components/ui/skeleton-loader"
import FadeIn from "@/components/ui/fade-in"
import { useToast } from "@/components/providers/toast-wrapper"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import Image from "next/image"
import { ImageWithFallback } from "@/components/ui/ImageWithFallback"
import { ReviewForm } from "@/components/review-form"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { getToken } from "@/lib/auth"

interface Booking {
  id: string;
  code: string;
  hotelName: string;
  hotelImage: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  total: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  createdAt: string;
}

export default function MinhasReservasPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [reviewDialogOpen, setReviewDialogOpen] = useState<string | null>(null);
  const toast = useToast();

  // Carregar reservas da API
  useEffect(() => {
    const loadBookings = async () => {
      setIsLoading(true);
      const token = getToken();
      if (!token) {
        router.replace('/login?redirect=/minhas-reservas');
        setIsLoading(false);
        return;
      }

      try {
        // Tentar obter e-mail do localStorage ou token
        const savedBookings = localStorage.getItem('user_bookings');
        let email = '';

        // Se tiver reservas no localStorage, usar o e-mail da primeira
        if (savedBookings) {
          try {
            const parsed = JSON.parse(savedBookings);
            if (parsed.length > 0 && parsed[0].customerEmail) {
              email = parsed[0].customerEmail;
            }
          } catch (e) {
            // Ignorar erro
          }
        }

        // Se não tiver e-mail, tentar buscar do token
        if (!email) {
          // Em produção, você obteria do token JWT
          // Por enquanto, vamos usar localStorage como fallback
        }

        // Buscar da API se tiver e-mail
        if (email) {
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
          const response = await fetch(`${API_BASE_URL}/api/bookings?email=${encodeURIComponent(email)}`);
          const result = await response.json();

          if (result.success && result.data) {
            const apiBookings: Booking[] = Array.isArray(result.data) 
              ? result.data.map((b: any) => ({
                  id: b.id.toString(),
                  code: b.booking_code,
                  hotelName: b.item_name,
                  hotelImage: '',
                  checkIn: b.check_in,
                  checkOut: b.check_out,
                  guests: b.total_guests,
                  total: b.total,
                  status: b.status,
                  createdAt: b.created_at,
                }))
              : [{
                  id: result.data.id.toString(),
                  code: result.data.booking_code,
                  hotelName: result.data.item_name,
                  hotelImage: '',
                  checkIn: result.data.check_in,
                  checkOut: result.data.check_out,
                  guests: result.data.total_guests,
                  total: result.data.total,
                  status: result.data.status,
                  createdAt: result.data.created_at,
                }];
            
            setBookings(apiBookings);
            setFilteredBookings(apiBookings);
            return;
          }
        }

        // Fallback: usar localStorage
        if (savedBookings) {
          const parsed = JSON.parse(savedBookings);
          setBookings(parsed);
          setFilteredBookings(parsed);
        } else {
          setBookings([]);
          setFilteredBookings([]);
        }
      } catch (error) {
        console.error('Erro ao carregar reservas:', error);
        // Fallback para localStorage
        try {
          const savedBookings = localStorage.getItem('user_bookings');
          if (savedBookings) {
            const parsed = JSON.parse(savedBookings);
            setBookings(parsed);
            setFilteredBookings(parsed);
          }
        } catch (e) {
          setBookings([]);
          setFilteredBookings([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadBookings();
  }, [router]);

  // Filtrar reservas
  useEffect(() => {
    let filtered = [...bookings];

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    setFilteredBookings(filtered);
  }, [searchTerm, statusFilter, bookings]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { label: 'Confirmada', color: 'bg-green-500', icon: CheckCircle },
      pending: { label: 'Pendente', color: 'bg-yellow-500', icon: Clock },
      cancelled: { label: 'Cancelada', color: 'bg-red-500', icon: XCircle },
      completed: { label: 'Concluída', color: 'bg-blue-500', icon: CheckCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando suas reservas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-2">
              ←
            </Button>
          </Link>
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-reservei-viagens-VVm0zxcolWbkv9Lf5Yj0PUoxLJrARl.png"
            alt="Reservei Viagens"
            width={40}
            height={40}
            className="rounded-full bg-white/20 p-1"
          />
          <h1 className="text-2xl font-bold tracking-tight">Minhas Reservas</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-white/20 backdrop-blur-sm border-0">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold">{bookings.length}</div>
              <div className="text-xs text-blue-100">Total</div>
            </CardContent>
          </Card>
          <Card className="bg-white/20 backdrop-blur-sm border-0">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold">
                {bookings.filter(b => b.status === 'confirmed').length}
              </div>
              <div className="text-xs text-blue-100">Confirmadas</div>
            </CardContent>
          </Card>
          <Card className="bg-white/20 backdrop-blur-sm border-0">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold">
                {bookings.filter(b => b.status === 'pending').length}
              </div>
              <div className="text-xs text-blue-100">Pendentes</div>
            </CardContent>
          </Card>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar por hotel ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="confirmed">Confirmadas</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="cancelled">Canceladas</SelectItem>
                <SelectItem value="completed">Concluídas</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {bookings.length === 0 ? 'Nenhuma reserva encontrada' : 'Nenhuma reserva com esses filtros'}
              </h3>
              <p className="text-gray-600 mb-6">
                {bookings.length === 0 
                  ? 'Você ainda não fez nenhuma reserva. Que tal começar a planejar sua viagem?'
                  : 'Tente ajustar os filtros de busca'}
              </p>
              {bookings.length === 0 && (
                <Link href="/buscar">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Buscar Hotéis
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="flex">
                  {/* Hotel Image */}
                  <div className="w-32 h-32 bg-gray-200 flex-shrink-0 relative">
                    {booking.hotelImage ? (
                      <ImageWithFallback
                        src={booking.hotelImage}
                        alt={booking.hotelName}
                        width={128}
                        height={128}
                        objectFit="cover"
                        className="w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <div className="text-4xl">🏨</div>
                      </div>
                    )}
                  </div>

                  {/* Booking Info */}
                  <CardContent className="p-4 flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{booking.hotelName}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(booking.status)}
                          <span className="text-xs text-gray-500">#{booking.code}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                        </span>
                        <span className="text-gray-400">
                          ({calculateNights(booking.checkIn, booking.checkOut)} noites)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{booking.guests} {booking.guests === 1 ? 'hóspede' : 'hóspedes'}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="font-bold text-green-600 text-lg">
                          {formatPrice(booking.total)}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.print()}
                            title="Baixar comprovante"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          {booking.status === 'completed' && (
                            <Dialog open={reviewDialogOpen === booking.id} onOpenChange={(open) => setReviewDialogOpen(open ? booking.id : null)}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                                  title="Avaliar reserva"
                                >
                                  <Star className="w-4 h-4 mr-1" />
                                  Avaliar
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Avaliar {booking.hotelName}</DialogTitle>
                                  <DialogDescription>
                                    Compartilhe sua experiência e ajude outros viajantes
                                  </DialogDescription>
                                </DialogHeader>
                                <ReviewForm
                                  hostId={parseInt(booking.id)}
                                  bookingId={parseInt(booking.id)}
                                  propertyName={booking.hotelName}
                                  onSubmit={() => {
                                    setReviewDialogOpen(null);
                                    alert('Avaliação enviada com sucesso!');
                                  }}
                                  onCancel={() => setReviewDialogOpen(null)}
                                />
                              </DialogContent>
                            </Dialog>
                          )}
                          {booking.status === 'confirmed' || booking.status === 'pending' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={async () => {
                                if (confirm('Tem certeza que deseja cancelar esta reserva?')) {
                                  try {
                                    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
                                    const response = await fetch(`${API_BASE_URL}/api/bookings/${booking.code}/cancel`, {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ reason: 'Cancelado pelo cliente' }),
                                    });
                                    const result = await response.json();
                                    if (result.success) {
                                      alert('Reserva cancelada com sucesso');
                                      window.location.reload();
                                    } else {
                                      alert(result.error || 'Erro ao cancelar reserva');
                                    }
                                  } catch (error) {
                                    alert('Erro ao cancelar reserva');
                                  }
                                }
                              }}
                              title="Cancelar reserva"
                            >
                              Cancelar
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Help Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4">Precisa de Ajuda?</h3>
            <div className="space-y-3">
              <a
                href="https://wa.me/5564993197555"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Phone className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium">WhatsApp</p>
                  <p className="text-sm text-gray-600">(64) 99319-7555</p>
                </div>
              </a>
              <a
                href="mailto:reservas@reserveiviagens.com.br"
                className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Mail className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium">E-mail</p>
                  <p className="text-sm text-gray-600">reservas@reserveiviagens.com.br</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

