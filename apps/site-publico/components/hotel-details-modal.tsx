"use client"

import { useState } from "react"
import { X, Star, MapPin, Phone, Mail, Globe, Wifi, Car, Coffee, Waves, Dumbbell, Utensils, Bed, Users, Clock, CheckCircle, Gift, Shield, Heart, Sparkles, Video, MessageSquare, GitCompare } from "lucide-react"

// Função auxiliar para obter componente de ícone
const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, any> = {
    wifi: Wifi,
    car: Car,
    coffee: Coffee,
    waves: Waves,
    dumbbell: Dumbbell,
    utensils: Utensils,
    bed: Bed,
    clock: Clock,
    shield: Shield,
    heart: Heart,
    sparkles: Sparkles
  }
  const IconComponent = iconMap[iconName] || Sparkles
  return <IconComponent className="w-5 h-5" />
}
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { HotelVideo } from "./hotel-video"
import { HotelModalMap } from "./hotel-modal-map"
import { HotelReviews } from "./hotel-reviews"

interface HotelDetailsModalProps {
  hotel: any
  isOpen: boolean
  onClose: () => void
  allHotels?: any[] // Para comparação
  onCompare?: (hotels: any[]) => void // Callback para abrir comparação
}

// Informações específicas por hotel (baseado em pesquisa e dados reais)
const getHotelSpecificInfo = (hotelName: string) => {
  const name = hotelName.toLowerCase()
  
  // Informações específicas para hotéis conhecidos
  const specificInfo: any = {}
  
  if (name.includes('lagoa eco') || name.includes('eco towers')) {
    specificInfo.highlights = [
      "Torres ecológicas com certificação sustentável",
      "Vista panorâmica de 360° da região",
      "Spa completo com tratamentos premium",
      "Gastronomia com chef renomado",
      "Sistema de energia solar e reciclagem"
    ]
    specificInfo.specialBenefits = [
      "Tour ecológico guiado",
      "Acesso VIP a áreas exclusivas",
      "Tratamentos de spa personalizados"
    ]
  } else if (name.includes('piazza diroma')) {
    specificInfo.highlights = [
      "Arquitetura italiana autêntica",
      "Acesso direto aos parques diRoma",
      "Spa premium com águas termais",
      "Restaurante gourmet com culinária italiana",
      "Concierge 24h para serviços exclusivos"
    ]
    specificInfo.specialBenefits = [
      "Ingresso gratuito para parques diRoma",
      "Degustação de vinhos italianos",
      "Massagem relaxante inclusa"
    ]
  } else if (name.includes('spazzio diroma')) {
    specificInfo.highlights = [
      "Acesso exclusivo ao Acqua Park",
      "Piscinas termais naturais",
      "Tobogãs e brinquedos aquáticos",
      "Estrutura completa para famílias",
      "Kids Club com monitores"
    ]
    specificInfo.specialBenefits = [
      "Passe livre para Acqua Park",
      "Atividades recreativas para crianças",
      "Piscinas com diferentes temperaturas"
    ]
  } else if (name.includes('lacqua diroma')) {
    specificInfo.highlights = [
      "Jardins Acqua Park exclusivo",
      "Piscinas de ondas artificiais",
      "Toboáguas emocionantes",
      "Ofurôs privativos",
      "Kids Club com atividades diárias"
    ]
    specificInfo.specialBenefits = [
      "Acesso ilimitado ao Acqua Park",
      "Aulas de natação para crianças",
      "Festas temáticas noturnas"
    ]
  } else if (name.includes('golden dolphin')) {
    specificInfo.highlights = [
      "Gran Hotel com estrutura completa",
      "Múltiplas piscinas termais",
      "Centro de convenções",
      "Restaurantes variados",
      "Entretenimento noturno"
    ]
    specificInfo.specialBenefits = [
      "Shows e entretenimento inclusos",
      "Acesso a todas as piscinas",
      "Programação de atividades diárias"
    ]
  } else if (name.includes('praias do lago')) {
    specificInfo.highlights = [
      "Praias artificiais exclusivas",
      "Lagoas termais naturais",
      "Estrutura ecológica certificada",
      "Atividades aquáticas variadas",
      "Ambiente familiar e seguro"
    ]
    specificInfo.specialBenefits = [
      "Passeio de barco no lago",
      "Praias privativas",
      "Atividades ecológicas educativas"
    ]
  } else if (name.includes('resort do lago')) {
    specificInfo.highlights = [
      "Localização privilegiada às margens do lago",
      "Atividades aquáticas inclusas",
      "Spa com vista para o lago",
      "Restaurante com gastronomia regional",
      "Pesca esportiva disponível"
    ]
    specificInfo.specialBenefits = [
      "Equipamentos de pesca disponíveis",
      "Passeios de barco",
      "Trilhas ecológicas guiadas"
    ]
  } else if (name.includes('diroma fiori') || name.includes('fiori')) {
    specificInfo.highlights = [
      "Ambiente familiar e aconchegante",
      "Piscinas termais em ambiente tranquilo",
      "Sauna relaxante",
      "Jardins bem cuidados",
      "Playground para crianças"
    ]
    specificInfo.specialBenefits = [
      "Atividades para toda família",
      "Ambiente tranquilo e seguro",
      "Área verde para relaxamento"
    ]
  } else if (name.includes('parque das primaveras')) {
    specificInfo.highlights = [
      "Ampla área verde preservada",
      "Piscinas termais em ambiente natural",
      "Contato com natureza",
      "Ideal para famílias",
      "Tranquilidade garantida"
    ]
    specificInfo.specialBenefits = [
      "Trilhas na área verde",
      "Observação de pássaros",
      "Ambiente 100% familiar"
    ]
  } else if (name.includes('ctc')) {
    specificInfo.highlights = [
      "Excelente localização no centro",
      "Fácil acesso a atrações",
      "Custo-benefício imbatível",
      "Piscinas termais",
      "Atendimento personalizado"
    ]
    specificInfo.specialBenefits = [
      "Proximidade de restaurantes",
      "Fácil acesso ao transporte",
      "Preço acessível"
    ]
  } else if (name.includes('marina flat')) {
    specificInfo.highlights = [
      "Apartamentos amplos e confortáveis",
      "Cozinha completa nos apartamentos",
      "Ideal para estadias longas",
      "Piscinas termais",
      "Estrutura completa"
    ]
    specificInfo.specialBenefits = [
      "Flexibilidade de estadia",
      "Economia com cozinha",
      "Conforto de apartamento"
    ]
  }
  
  return specificInfo
}

// Benefícios padrão para hotéis em Caldas Novas (baseado em pesquisa)
const getDefaultBenefits = (hotel: any) => {
  // Se o hotel tem benefícios customizados no metadata, usar eles
  if (hotel.metadata?.benefits && Array.isArray(hotel.metadata.benefits) && hotel.metadata.benefits.length > 0) {
    return hotel.metadata.benefits.map((b: any) => ({
      icon: getIconComponent(b.icon || 'sparkles'),
      title: b.title,
      description: b.description,
      free: b.free !== false
    }))
  }

  // Caso contrário, usar benefícios padrão
  const baseBenefits = [
    {
      icon: <Wifi className="w-5 h-5" />,
      title: "Wi-Fi Gratuito",
      description: "Internet de alta velocidade em todas as áreas",
      free: true
    },
    {
      icon: <Car className="w-5 h-5" />,
      title: "Estacionamento Grátis",
      description: "Vagas cobertas e descobertas disponíveis",
      free: true
    },
    {
      icon: <Coffee className="w-5 h-5" />,
      title: "Café da Manhã Incluso",
      description: "Buffet completo com opções locais e saudáveis",
      free: true
    },
    {
      icon: <Waves className="w-5 h-5" />,
      title: "Piscinas Termais",
      description: "Águas naturais entre 43°C e 70°C - acesso ilimitado",
      free: true
    },
    {
      icon: <Dumbbell className="w-5 h-5" />,
      title: "Academia e Spa",
      description: "Equipamentos modernos e área de relaxamento",
      free: true
    },
    {
      icon: <Utensils className="w-5 h-5" />,
      title: "Restaurante no Local",
      description: "Gastronomia local e internacional",
      free: false
    },
    {
      icon: <Bed className="w-5 h-5" />,
      title: "Ar-Condicionado",
      description: "Climatização em todos os ambientes",
      free: true
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Check-in/Check-out Flexível",
      description: "Horários adaptáveis às suas necessidades",
      free: true
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Segurança 24h",
      description: "Monitoramento e segurança em tempo integral",
      free: true
    },
    {
      icon: <Heart className="w-5 h-5" />,
      title: "Serviço de Quarto",
      description: "Limpeza diária e serviços personalizados",
      free: true
    }
  ]

  // Adicionar benefícios específicos baseados no hotel
  const specificBenefits: any[] = []
  
  if (hotel.features && hotel.features.length > 0) {
    hotel.features.forEach((feature: string) => {
      if (!baseBenefits.some(b => b.title.toLowerCase().includes(feature.toLowerCase()))) {
        specificBenefits.push({
          icon: <Sparkles className="w-5 h-5" />,
          title: feature,
          description: "Benefício exclusivo deste hotel",
          free: true
        })
      }
    })
  }

  return [...baseBenefits, ...specificBenefits]
}

export function HotelDetailsModal({ hotel, isOpen, onClose, allHotels, onCompare }: HotelDetailsModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState("overview")
  
  // Usar benefícios do metadata se disponíveis, senão usar padrão
  const benefits = hotel.metadata?.benefits && Array.isArray(hotel.metadata.benefits) && hotel.metadata.benefits.length > 0
    ? hotel.metadata.benefits.map((b: any) => ({
        icon: getIconComponent(b.icon || 'sparkles'),
        title: b.title,
        description: b.description,
        free: b.free !== false
      }))
    : getDefaultBenefits(hotel)
  
  // Usar informações específicas do metadata se disponíveis, senão usar padrão baseado no nome
  const metadataSpecificInfo = hotel.metadata?.highlights || hotel.metadata?.specialBenefits
    ? {
        highlights: hotel.metadata.highlights || [],
        specialBenefits: hotel.metadata.specialBenefits || []
      }
    : getHotelSpecificInfo(hotel.name)
  
  const specificInfo = metadataSpecificInfo

  if (!isOpen || !hotel) return null

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < count ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4 relative z-10">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{hotel.name}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    {renderStars(hotel.stars || 4)}
                    <span className="ml-1">{hotel.stars || 4} estrelas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{hotel.location}</span>
                  </div>
                  {hotel.distanceFromCenter && (
                    <span>{hotel.distanceFromCenter}km do centro</span>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                title="Fechar"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Botão Comparar */}
            {allHotels && allHotels.length > 1 && onCompare && (
              <div className="mb-4 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Selecionar este hotel + outros 2 aleatórios para comparação
                    const otherHotels = allHotels
                      .filter(h => h.id !== hotel.id)
                      .slice(0, 2)
                    onCompare([hotel, ...otherHotels])
                  }}
                  className="border-purple-500 text-purple-600 hover:bg-purple-50"
                >
                  <GitCompare className="w-4 h-4 mr-2" />
                  Comparar com Outros
                </Button>
              </div>
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="reviews">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Avaliações
                </TabsTrigger>
                <TabsTrigger value="location">
                  <MapPin className="w-4 h-4 mr-2" />
                  Localização
                </TabsTrigger>
                <TabsTrigger value="media">
                  <Video className="w-4 h-4 mr-2" />
                  Vídeo
                </TabsTrigger>
              </TabsList>

              {/* Tab: Visão Geral */}
              <TabsContent value="overview" className="space-y-6 mt-6">
                {/* Galeria de Imagens */}
                {hotel.images && hotel.images.length > 0 && (
                  <div className="space-y-4">
                    <div className="relative aspect-video rounded-lg overflow-hidden">
                      <img
                        src={hotel.images[selectedImageIndex] || hotel.images[0]}
                        alt={hotel.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {hotel.images.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {hotel.images.slice(0, 4).map((image: string, index: number) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`relative aspect-video rounded-md overflow-hidden border-2 transition-all ${
                              selectedImageIndex === index ? 'border-blue-500' : 'border-transparent'
                            }`}
                          >
                            <img
                              src={image}
                              alt={`${hotel.name} - Foto ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

            {/* Descrição */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sobre o Hotel</h3>
              <p className="text-gray-700 leading-relaxed">{hotel.description}</p>
            </div>

            {/* Benefícios Gratuitos */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Gift className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Benefícios Inclusos</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {benefits.filter(b => b.free).map((benefit, index) => (
                  <Card key={index} className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-green-600 mt-1">
                          {typeof benefit.icon === 'string' ? getIconComponent(benefit.icon) : benefit.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{benefit.title}</h4>
                            <Badge className="bg-green-600 text-white text-xs">GRÁTIS</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{benefit.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Comodidades */}
            {hotel.features && hotel.features.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Comodidades</h3>
                <div className="flex flex-wrap gap-2">
                  {hotel.features.map((feature: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Informações de Preço */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações de Preço</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Preço Original</p>
                    {hotel.originalPrice ? (
                      <p className="text-lg text-gray-400 line-through">{formatPrice(hotel.originalPrice)}</p>
                    ) : (
                      <p className="text-lg text-gray-400">---</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Preço com Desconto</p>
                    <p className="text-2xl font-bold text-green-600">{formatPrice(hotel.price)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Economia</p>
                    {hotel.originalPrice && hotel.originalPrice > hotel.price ? (
                      <p className="text-xl font-bold text-red-600">
                        {formatPrice(hotel.originalPrice - hotel.price)}
                      </p>
                    ) : (
                      <p className="text-lg text-gray-400">---</p>
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <Users className="w-4 h-4 inline mr-1" />
                    Capacidade: até {hotel.maxGuests || 4} pessoas
                  </p>
                  {hotel.discount && (
                    <p className="text-sm text-green-600 font-semibold mt-2">
                      🎉 Desconto de {hotel.discount}% aplicado!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Informações Adicionais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Localização</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{hotel.location}</span>
                    </div>
                    {hotel.distanceFromCenter && (
                      <div className="flex items-center gap-2">
                        <span>📍 {hotel.distanceFromCenter}km do centro da cidade</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Avaliações</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(hotel.rating || hotel.stars || 4)}</div>
                      <span className="font-semibold text-gray-900">{hotel.rating || hotel.stars || 4}.0</span>
                    </div>
                    {hotel.reviewCount && (
                      <p className="text-gray-600">
                        Baseado em {hotel.reviewCount} avaliações de hóspedes
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Destaques Específicos do Hotel */}
            {specificInfo.highlights && specificInfo.highlights.length > 0 && (
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Destaques Exclusivos
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    {specificInfo.highlights.map((highlight: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Benefícios Especiais Adicionais */}
            {specificInfo.specialBenefits && specificInfo.specialBenefits.length > 0 && (
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-yellow-600" />
                    Benefícios Especiais Inclusos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {specificInfo.specialBenefits.map((benefit: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Por que escolher este hotel */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  Por que escolher este hotel?
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Localização privilegiada em Caldas Novas, a maior estância hidrotermal do mundo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Acesso direto a piscinas termais com águas naturais entre 43°C e 70°C</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Infraestrutura completa para toda a família com segurança 24h</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Proximidade dos principais parques termais e atrações turísticas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Melhor custo-benefício com todos os benefícios inclusos no preço</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

              </TabsContent>

              {/* Tab: Avaliações */}
              <TabsContent value="reviews" className="mt-6">
                <HotelReviews
                  hotelId={hotel.id}
                  hotelName={hotel.name}
                  averageRating={hotel.rating || hotel.stars || 4.5}
                  reviewCount={hotel.reviewCount || 120}
                />
              </TabsContent>

              {/* Tab: Localização */}
              <TabsContent value="location" className="mt-6">
                {hotel.coordinates && (
                  <HotelModalMap
                    hotelName={hotel.name}
                    coordinates={hotel.coordinates}
                    address={hotel.location}
                  />
                )}
              </TabsContent>

              {/* Tab: Vídeo */}
              <TabsContent value="media" className="mt-6">
                <HotelVideo
                  hotelName={hotel.name}
                  youtubeId={hotel.videoUrl}
                />
              </TabsContent>
            </Tabs>

            {/* Botões de Ação */}
            <div className="flex gap-4 pt-6 border-t mt-6">
              <Button
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 text-lg"
                onClick={() =>
                  window.open(
                    `https://wa.me/5564993197555?text=Olá! Quero reservar o ${hotel.name} com desconto especial!`,
                    "_blank",
                  )
                }
              >
                💚 RESERVAR AGORA {hotel.discount ? `- ${hotel.discount}% OFF` : ''}
              </Button>
              <Button
                variant="outline"
                className="px-6 border-blue-500 text-blue-600 hover:bg-blue-50"
                onClick={() => {
                  const message = `Olá! Gostaria de mais informações sobre o ${hotel.name}.`
                  window.open(`https://wa.me/5564993197555?text=${encodeURIComponent(message)}`, "_blank")
                }}
              >
                <Phone className="w-4 h-4 mr-2" />
                Falar com Especialista
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
