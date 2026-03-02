"use client"

import { useState } from "react"
import { MessageSquare, Plus, Edit, Trash2, Star, User, Calendar, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Review {
  id?: string
  author: string
  rating: number
  date: string
  comment: string
  verified?: boolean
  helpful?: number
}

interface HotelReviewsManagerProps {
  reviews?: Review[]
  onChange: (reviews: Review[]) => void
}

export function HotelReviewsManager({ reviews = [], onChange }: HotelReviewsManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [formData, setFormData] = useState<Review>({
    author: "",
    rating: 5,
    date: new Date().toISOString().split("T")[0],
    comment: "",
    verified: false,
    helpful: 0
  })

  const handleAdd = () => {
    setEditingReview(null)
    setFormData({
      author: "",
      rating: 5,
      date: new Date().toISOString().split("T")[0],
      comment: "",
      verified: false,
      helpful: 0
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (review: Review) => {
    setEditingReview(review)
    setFormData(review)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta avaliação?")) {
      onChange(reviews.filter(r => r.id !== id))
    }
  }

  const handleSave = () => {
    if (!formData.author.trim() || !formData.comment.trim()) {
      alert("Preencha todos os campos obrigatórios")
      return
    }

    if (editingReview && editingReview.id) {
      // Editar existente
      onChange(reviews.map(r => r.id === editingReview.id ? { ...formData, id: editingReview.id } : r))
    } else {
      // Adicionar novo
      const newReview: Review = {
        ...formData,
        id: `review-${Date.now()}`
      }
      onChange([...reviews, newReview])
    }

    setIsDialogOpen(false)
    setEditingReview(null)
  }

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < count ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-semibold">Avaliações de Hóspedes</Label>
          <p className="text-sm text-gray-500 mt-1">
            {reviews.length} avaliação(ões) • Média: {averageRating.toFixed(1)} ⭐
          </p>
        </div>
        <Button type="button" onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Avaliação
        </Button>
      </div>

      {/* Lista de avaliações */}
      <div className="space-y-3">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Nenhuma avaliação cadastrada</p>
              <p className="text-sm">Clique em "Adicionar Avaliação" para começar</p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{review.author}</span>
                          {review.verified && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verificado
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(review.date)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                    {review.helpful && review.helpful > 0 && (
                      <p className="text-sm text-gray-500 mt-2">
                        Útil para {review.helpful} pessoas
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(review)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => review.id && handleDelete(review.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog de adicionar/editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingReview ? "Editar Avaliação" : "Adicionar Avaliação"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="review-author">Nome do Autor *</Label>
                <Input
                  id="review-author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Ex: Maria Silva"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="review-date">Data *</Label>
                <Input
                  id="review-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="review-rating">Avaliação *</Label>
              <Select
                value={formData.rating.toString()}
                onValueChange={(value) => setFormData({ ...formData, rating: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <SelectItem key={rating} value={rating.toString()}>
                      {renderStars(rating)} {rating} estrelas
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="review-comment">Comentário *</Label>
              <Textarea
                id="review-comment"
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="Comentário do hóspede..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="review-verified"
                  checked={formData.verified}
                  onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="review-verified">Avaliação verificada</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="review-helpful">Útil para (número)</Label>
                <Input
                  id="review-helpful"
                  type="number"
                  min="0"
                  value={formData.helpful || 0}
                  onChange={(e) => setFormData({ ...formData, helpful: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {editingReview ? "Salvar Alterações" : "Adicionar Avaliação"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
