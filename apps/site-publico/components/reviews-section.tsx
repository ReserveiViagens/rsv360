"use client"

import type React from "react"

import { useState } from "react"
import { Star, ThumbsUp, MessageSquare, Award, Send, Facebook, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Review {
  id: string
  name: string
  avatar: string
  rating: number
  date: string
  comment: string
  source: "site" | "google" | "facebook"
  verified?: boolean
  response?: string
}

export default function ReviewsSection() {
  const [activeTab, setActiveTab] = useState("todos")
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rating: 5,
    comment: "",
  })
  const [voucherCode, setVoucherCode] = useState("")
  const [showVoucher, setShowVoucher] = useState(false)

  const reviews: Review[] = [
    {
      id: "1",
      name: "Maria Rosa Silva",
      avatar: "MR",
      rating: 5,
      date: "15/05/2025",
      comment:
        "Experiência incrível! A Reservei Viagens organizou tudo perfeitamente. Hotel maravilhoso e o parque aquático foi diversão garantida para toda família. Super recomendo!",
      source: "site",
      verified: true,
    },
    {
      id: "2",
      name: "Carlos Eduardo",
      avatar: "CE",
      rating: 5,
      date: "02/04/2025",
      comment:
        "Atendimento excepcional! Conseguiram encontrar as melhores opções dentro do meu orçamento. O hotel tinha uma vista incrível e as piscinas termais eram maravilhosas.",
      source: "google",
      verified: true,
    },
    {
      id: "3",
      name: "Ana Beatriz Mendes",
      avatar: "AB",
      rating: 4,
      date: "28/03/2025",
      comment:
        "Ótima agência! Pacote completo com boa relação custo-benefício. O único ponto foi o transfer que atrasou um pouco, mas o resto foi perfeito.",
      source: "facebook",
      verified: true,
      response: "Obrigado pelo feedback, Ana! Já estamos melhorando nosso serviço de transfer para evitar atrasos.",
    },
    {
      id: "4",
      name: "Roberto Almeida",
      avatar: "RA",
      rating: 5,
      date: "10/03/2025",
      comment:
        "Viagem perfeita para Caldas Novas! A equipe da Reservei cuidou de todos os detalhes, desde a reserva até o check-out. Já estou planejando a próxima viagem com eles!",
      source: "google",
      verified: true,
    },
    {
      id: "5",
      name: "Juliana Costa",
      avatar: "JC",
      rating: 5,
      date: "05/02/2025",
      comment:
        "Levei minha família para o Hot Park através da Reservei Viagens e foi uma experiência incrível! Preço justo e atendimento nota 10. Recomendo muito!",
      source: "site",
      verified: true,
    },
  ]

  const filteredReviews = activeTab === "todos" ? reviews : reviews.filter((review) => review.source === activeTab)

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < count ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRatingChange = (rating: number) => {
    setFormData((prev) => ({ ...prev, rating }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would normally send the review to your backend
    console.log("Review submitted:", formData)

    // Generate a random voucher code
    const randomCode = Math.random().toString(36).substring(2, 10).toUpperCase()
    setVoucherCode(`RESERVEI-${randomCode}`)
    setShowVoucher(true)
    setShowForm(false)
  }

  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6" />
            <h2 className="text-xl font-bold">Avaliações Verificadas</h2>
          </div>
          <Badge className="bg-yellow-400 text-black">
            {averageRating.toFixed(1)} ★ ({reviews.length})
          </Badge>
        </div>
        <p className="text-sm mb-4">
          Veja o que nossos clientes estão dizendo sobre a Reservei Viagens. Todas as avaliações são de clientes reais
          que utilizaram nossos serviços.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button className="bg-white text-blue-600 hover:bg-blue-50" size="sm" onClick={() => setShowForm(true)}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Deixe sua Avaliação
          </Button>
          <a href="https://g.page/r/CXX_XXXXXXXX/review" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="bg-white/20 text-white border-white hover:bg-white/30" size="sm">
              Avaliar no Google
            </Button>
          </a>
          <a href="https://www.facebook.com/comercialreservei/reviews" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="bg-white/20 text-white border-white hover:bg-white/30" size="sm">
              Avaliar no Facebook
            </Button>
          </a>
        </div>
      </div>

      {/* Review Form */}
      {showForm && (
        <Card className="border-2 border-blue-200 animate-in fade-in duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-800">Sua Avaliação</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Seu nome"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Seu email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sua avaliação</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= formData.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        } hover:fill-yellow-400 hover:text-yellow-400 transition-colors`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment">Seu comentário</Label>
                <Textarea
                  id="comment"
                  name="comment"
                  value={formData.comment}
                  onChange={handleInputChange}
                  placeholder="Conte sua experiência com a Reservei Viagens..."
                  rows={4}
                  required
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700">
                <p className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  <span>Ao enviar sua avaliação, você receberá um voucher de desconto para sua próxima viagem!</span>
                </p>
              </div>

              <Button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white">
                <Send className="w-4 h-4 mr-2" />
                Enviar Avaliação
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Voucher Display */}
      {showVoucher && (
        <Card className="border-2 border-green-300 bg-green-50 animate-in fade-in duration-300">
          <CardContent className="p-6 text-center">
            <Award className="w-12 h-12 text-green-600 mx-auto mb-2" />
            <h3 className="font-bold text-xl text-green-800 mb-2">Obrigado pela sua avaliação!</h3>
            <p className="text-green-700 mb-4">Aqui está seu voucher de desconto:</p>

            <div className="bg-white border-2 border-dashed border-green-400 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-500 mb-1">Código do voucher:</p>
              <p className="text-2xl font-bold text-green-600 font-mono tracking-wider">{voucherCode}</p>
              <p className="text-xs text-gray-500 mt-2">Válido por 30 dias</p>
            </div>

            <p className="text-sm text-green-700 mb-4">
              Use este código ao fazer sua próxima reserva e ganhe <strong>10% de desconto</strong>!
            </p>

            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                className="border-green-500 text-green-600 hover:bg-green-50"
                onClick={() => setShowVoucher(false)}
              >
                Fechar
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => {
                  navigator.clipboard.writeText(voucherCode)
                  alert("Código copiado para a área de transferência!")
                }}
              >
                Copiar Código
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews Tabs */}
      <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="todos" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
            Todos
          </TabsTrigger>
          <TabsTrigger value="google" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
            Google
          </TabsTrigger>
          <TabsTrigger value="facebook" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
            Facebook
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <Card key={review.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                        review.source === "google"
                          ? "bg-red-500"
                          : review.source === "facebook"
                            ? "bg-blue-600"
                            : "bg-purple-500"
                      }`}
                    >
                      {review.avatar}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{review.name}</h4>
                            {review.verified && (
                              <Badge variant="outline" className="text-green-600 border-green-200 text-xs">
                                ✓ Verificado
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex gap-0.5">{renderStars(review.rating)}</div>
                            <span className="text-xs text-gray-500">{review.date}</span>
                          </div>
                        </div>

                        <div>
                          {review.source === "google" && (
                            <Badge className="bg-red-100 text-red-700 border border-red-200">
                              <svg viewBox="0 0 24 24" className="w-3 h-3 mr-1" fill="currentColor">
                                <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" />
                              </svg>
                              Google
                            </Badge>
                          )}
                          {review.source === "facebook" && (
                            <Badge className="bg-blue-100 text-blue-700 border border-blue-200">
                              <Facebook className="w-3 h-3 mr-1" />
                              Facebook
                            </Badge>
                          )}
                          {review.source === "site" && (
                            <Badge className="bg-purple-100 text-purple-700 border border-purple-200">
                              <Award className="w-3 h-3 mr-1" />
                              Site
                            </Badge>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-700 text-sm mt-2 leading-relaxed">{review.comment}</p>

                      {review.response && (
                        <div className="mt-3 bg-gray-50 p-3 rounded-lg border-l-4 border-blue-400">
                          <p className="text-xs font-semibold text-blue-700 mb-1">Resposta da Reservei Viagens:</p>
                          <p className="text-xs text-gray-600">{review.response}</p>
                        </div>
                      )}

                      <div className="mt-3 flex items-center gap-3">
                        <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600">
                          <ThumbsUp className="w-3 h-3" />
                          Útil
                        </button>
                        <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600">
                          <MessageSquare className="w-3 h-3" />
                          Comentar
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Google Reviews Integration */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-red-500" fill="currentColor">
                <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" />
              </svg>
              <h3 className="font-bold text-lg">Google Reviews</h3>
            </div>
            <Badge className="bg-red-100 text-red-700">4.8 ★</Badge>
          </div>

          <div className="bg-gray-100 rounded-lg p-4 mb-4 text-center">
            <p className="text-sm text-gray-600">Veja todas as nossas avaliações no Google e deixe a sua opinião!</p>
          </div>

          <div className="aspect-[4/3] w-full bg-gray-100 rounded-lg overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15329.046375527848!2d-48.6283896!3d-17.7421391!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94a6ebc1b2a9b3e9%3A0x4b9b6b70a8d97a3f!2sReservei%20Viagens!5e0!3m2!1spt-BR!2sbr!4v1654321234567!5m2!1spt-BR!2sbr"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Maps - Reservei Viagens"
            />
          </div>

          <div className="mt-4 flex justify-center">
            <a
              href="https://g.page/r/CXX_XXXXXXXX/review"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              <Star className="w-4 h-4" />
              Avaliar no Google
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Facebook Reviews Integration */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Facebook className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-lg">Facebook Reviews</h3>
            </div>
            <Badge className="bg-blue-100 text-blue-700">4.7 ★</Badge>
          </div>

          <div className="bg-gray-100 rounded-lg p-4 mb-4 text-center">
            <p className="text-sm text-gray-600">Siga nossa página no Facebook e compartilhe sua experiência!</p>
          </div>

          <div className="aspect-video w-full bg-gray-100 rounded-lg overflow-hidden">
            <iframe
              src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fcomercialreservei&tabs=timeline&width=340&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId"
              width="100%"
              height="100%"
              style={{ border: "none", overflow: "hidden" }}
              scrolling="no"
              frameBorder="0"
              allowFullScreen={true}
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              title="Facebook Page - Reservei Viagens"
            />
          </div>

          <div className="mt-4 flex justify-center">
            <a
              href="https://www.facebook.com/comercialreservei/reviews"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              <Star className="w-4 h-4" />
              Avaliar no Facebook
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Newsletter Signup with Review Incentive */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-100">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-lg">Receba Ofertas Exclusivas</h3>
          </div>

          <p className="text-sm text-gray-700 mb-4">
            Cadastre-se para receber ofertas exclusivas e ganhe um voucher de desconto ao deixar sua avaliação!
          </p>

          <div className="flex gap-2">
            <Input placeholder="Seu melhor email" className="flex-1" />
            <Button className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">Quero Receber</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
