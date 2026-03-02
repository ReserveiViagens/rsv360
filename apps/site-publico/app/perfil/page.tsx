"use client"

import { useState, useEffect } from "react"
import { 
  User, Mail, Phone, FileText, Edit, Save, X, LogOut, Calendar, MapPin,
  Globe, Building2, Camera, Image as ImageIcon, Link as LinkIcon,
  Star, TrendingUp, Award, Instagram, Facebook, Youtube, Linkedin,
  Map, Home, Briefcase, Tag, Settings, Coins, Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { getUser, logout, getToken } from "@/lib/auth"
import { ProfileImageUpload } from "@/components/profile-image-upload"
import { GoogleMapsPicker } from "@/components/google-maps-picker"
import { isValidUrl } from "@/lib/validations"
import LoadingSpinner from "@/components/ui/loading-spinner"
import FadeIn from "@/components/ui/fade-in"
import { useToast } from "@/components/providers/toast-wrapper"

interface ProfileData {
  // Dados básicos
  id: number;
  name: string;
  email: string;
  phone?: string;
  document?: string;
  
  // Perfil completo
  username?: string;
  avatar_url?: string;
  profile_picture?: string;
  company_logo?: string;
  bio?: string;
  description?: string;
  short_description?: string;
  tagline?: string;
  
  // Contato
  website_url?: string;
  booking_url?: string;
  whatsapp?: string;
  
  // Localização
  location?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  
  // Negócio
  business_name?: string;
  business_type?: string;
  tax_id?: string;
  verified?: boolean;
  
  // Arrays JSONB
  categories?: string[];
  services?: string[];
  amenities?: string[];
  social_media?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
  
  // Estatísticas
  rating?: number;
  review_count?: number;
  total_bookings?: number;
}

export default function PerfilPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("basico")
  const [error, setError] = useState("")
  const [loadError, setLoadError] = useState<string | null>(null)
  const toast = useToast()

  const [formData, setFormData] = useState<Partial<ProfileData>>({
    name: '',
    email: '',
    phone: '',
    document: '',
    username: '',
    bio: '',
    description: '',
    short_description: '',
    tagline: '',
    website_url: '',
    booking_url: '',
    whatsapp: '',
    location: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'Brasil',
    business_name: '',
    business_type: '',
    tax_id: '',
    categories: [],
    services: [],
    amenities: [],
    social_media: {},
  })

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.replace('/login?redirect=/perfil')
      return
    }
    loadProfile()
  }, [router])

  const loadProfile = async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const token = getToken()
      if (!token) {
        router.replace('/login?redirect=/perfil')
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setProfile(result.data)
        setFormData({
          name: result.data.name || '',
          email: result.data.email || '',
          phone: result.data.phone || '',
          document: result.data.document || '',
          username: result.data.username || '',
          bio: result.data.bio || '',
          description: result.data.description || '',
          short_description: result.data.short_description || '',
          tagline: result.data.tagline || '',
          website_url: result.data.website_url || '',
          booking_url: result.data.booking_url || '',
          whatsapp: result.data.whatsapp || '',
          location: result.data.location || '',
          address: result.data.address || '',
          city: result.data.city || '',
          state: result.data.state || '',
          zip_code: result.data.zip_code || '',
          country: result.data.country || 'Brasil',
          business_name: result.data.business_name || '',
          business_type: result.data.business_type || '',
          tax_id: result.data.tax_id || '',
          categories: result.data.categories || [],
          services: result.data.services || [],
          amenities: result.data.amenities || [],
          social_media: result.data.social_media || {},
        })
      } else {
        setProfile(null)
        if (response.status === 401) {
          setLoadError('Sua sessão expirou. Faça login novamente para acessar seu perfil.')
        } else if (response.status === 404) {
          setLoadError('Perfil não encontrado. Tente fazer login novamente.')
        } else {
          setLoadError(result.error || 'Erro ao carregar perfil. Tente novamente ou faça login.')
        }
      }
    } catch (err) {
      console.error('Erro ao carregar perfil:', err)
      setProfile(null)
      setLoadError('Erro de conexão ao carregar perfil. Verifique sua internet e tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError("")
    
    try {
      const token = getToken()
      if (!token) {
        setError("Você precisa estar logado para salvar")
        return
      }

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        await loadProfile()
        setIsEditing(false)
        toast.success('Perfil atualizado com sucesso!')
      } else {
        const errorMsg = result.error || 'Erro ao salvar perfil'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (error: any) {
      console.error('Erro ao salvar perfil:', error)
      const errorMsg = error.message || 'Erro ao salvar perfil'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    if (confirm('Deseja realmente sair?')) {
      logout()
    }
  }

  const addArrayItem = (field: 'categories' | 'services' | 'amenities', value: string) => {
    if (!value.trim()) return
    setFormData({
      ...formData,
      [field]: [...(formData[field] || []), value.trim()],
    })
  }

  const removeArrayItem = (field: 'categories' | 'services' | 'amenities', index: number) => {
    const newArray = [...(formData[field] || [])]
    newArray.splice(index, 1)
    setFormData({
      ...formData,
      [field]: newArray,
    })
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto bg-gray-50 min-h-screen flex items-center justify-center">
        <FadeIn>
          <LoadingSpinner size="lg" text="Carregando perfil..." />
        </FadeIn>
      </div>
    )
  }

  if (!profile) {
    const hasToken = !!getToken()
    return (
      <div className="max-w-4xl mx-auto bg-gray-50 min-h-screen">
        <header className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6 rounded-b-3xl shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-2">
                ←
              </Button>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Perfil</h1>
          </div>
        </header>
        <div className="p-6">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">{loadError ? '⚠️' : '👤'}</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {loadError ? 'Erro ao carregar perfil' : 'Faça login para acessar seu perfil'}
              </h2>
              <p className="text-gray-600 mb-6">
                {loadError || 'Entre ou cadastre-se para gerenciar suas reservas'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/login">
                  <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                    {hasToken && loadError ? 'Fazer login novamente' : 'Entrar / Cadastrar'}
                  </Button>
                </Link>
                {hasToken && loadError && (
                  <Button variant="outline" onClick={loadProfile}>
                    Tentar novamente
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
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
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight">Meu Perfil</h1>
                <Badge className="bg-amber-500/90 text-white border-0">
                  Gold Tier
                </Badge>
              </div>
              {profile.verified && (
                <Badge className="bg-green-500 text-white mt-1">
                  <Award className="w-3 h-3 mr-1" />
                  Verificado
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar Perfil
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false)
                    loadProfile()
                  }}
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Avatar e informações básicas */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            {profile.avatar_url || profile.profile_picture ? (
              <Image
                src={profile.avatar_url || profile.profile_picture || ''}
                alt={profile.name}
                width={80}
                height={80}
                className="rounded-full border-4 border-white"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center border-4 border-white">
                <User className="w-10 h-10 text-white" />
              </div>
            )}
            {isEditing && (
              <div className="absolute -bottom-1 -right-1 z-10">
                <ProfileImageUpload
                  type="avatar"
                  currentUrl={profile.avatar_url || profile.profile_picture}
                  onUploadComplete={(url) => {
                    setFormData({ ...formData, avatar_url: url, profile_picture: url })
                    loadProfile()
                  }}
                />
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile.name}</h2>
            {profile.tagline && <p className="text-blue-100">{profile.tagline}</p>}
            {profile.location && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{profile.location}</span>
              </div>
            )}
            {profile.rating && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">{profile.rating.toFixed(1)} ({profile.review_count} avaliações)</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="p-6 pb-24">
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Minhas Reservas - card de reserva (mock) */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Minhas Reservas</h2>
          <Link href="/minhas-reservas">
            <Card className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row">
                <div className="relative w-full sm:w-32 h-32 sm:h-auto sm:min-h-[100px] bg-gray-200 shrink-0">
                  <Image
                    src="https://images.unsplash.com/photo-1582719508461-905c673771fd?w=200&h=150&fit=crop"
                    alt="Resort"
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </div>
                <CardContent className="p-4 flex-1">
                  <h3 className="font-semibold text-gray-900">Resort Termas Paradise</h3>
                  <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    15/03/2025 - 18/03/2025
                  </p>
                  <p className="text-xs text-gray-500 mt-1">3 noites • 2 hóspedes</p>
                </CardContent>
              </div>
            </Card>
          </Link>
          <Link href="/minhas-reservas" className="text-sm text-blue-600 font-medium mt-2 inline-block hover:underline">
            Ver todas as reservas
          </Link>
        </div>

        {/* Meus Pontos */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Meus Pontos</h2>
          <Card className="border border-gray-200">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Coins className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">1.500</p>
                <p className="text-sm text-gray-600">pontos disponíveis</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basico">Básico</TabsTrigger>
            <TabsTrigger value="biografia">Biografia</TabsTrigger>
            <TabsTrigger value="contato">Contato</TabsTrigger>
            <TabsTrigger value="negocio">Negócio</TabsTrigger>
            <TabsTrigger value="servicos">Serviços</TabsTrigger>
            <TabsTrigger value="redes">Redes Sociais</TabsTrigger>
          </TabsList>

          {/* Aba: Informações Básicas */}
          <TabsContent value="basico">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nome Completo *</Label>
                    {isEditing ? (
                      <Input
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{profile.name || 'Não informado'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>Nome de Usuário</Label>
                    {isEditing ? (
                      <Input
                        value={formData.username || ''}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        placeholder="meu_usuario"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <Tag className="w-4 h-4 text-gray-400" />
                        <span>{profile.username || 'Não definido'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>E-mail</Label>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{profile.email}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">E-mail não pode ser alterado</p>
                  </div>

                  <div>
                    <Label>Telefone</Label>
                    {isEditing ? (
                      <Input
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(00) 00000-0000"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{profile.phone || 'Não informado'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>CPF/CNPJ</Label>
                    {isEditing ? (
                      <Input
                        value={formData.document || ''}
                        onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                        placeholder="000.000.000-00 ou 00.000.000/0000-00"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span>{profile.document || 'Não informado'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba: Biografia */}
          <TabsContent value="biografia">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Biografia e Descrição
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Tagline / Slogan</Label>
                  {isEditing ? (
                    <Input
                      value={formData.tagline || ''}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      placeholder="Sua frase de destaque"
                      maxLength={200}
                    />
                  ) : (
                    <p className="p-2 bg-gray-50 rounded">{profile.tagline || 'Não definido'}</p>
                  )}
                </div>

                <div>
                  <Label>Descrição Curta</Label>
                  {isEditing ? (
                    <Textarea
                      value={formData.short_description || ''}
                      onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                      placeholder="Uma descrição concisa sobre você/seus imóveis"
                      maxLength={500}
                      rows={3}
                    />
                  ) : (
                    <p className="p-2 bg-gray-50 rounded whitespace-pre-wrap">{profile.short_description || 'Não informado'}</p>
                  )}
                </div>

                <div>
                  <Label>Biografia Completa</Label>
                  {isEditing ? (
                    <Textarea
                      value={formData.bio || ''}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Conte sua história, experiência, o que te diferencia..."
                      rows={6}
                    />
                  ) : (
                    <p className="p-2 bg-gray-50 rounded whitespace-pre-wrap">{profile.bio || 'Não informado'}</p>
                  )}
                </div>

                <div>
                  <Label>Descrição Detalhada</Label>
                  {isEditing ? (
                    <Textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descrição completa dos seus imóveis, localização, diferenciais..."
                      rows={8}
                    />
                  ) : (
                    <p className="p-2 bg-gray-50 rounded whitespace-pre-wrap">{profile.description || 'Não informado'}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba: Contato e Localização */}
          <TabsContent value="contato">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Informações de Contato
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Website</Label>
                      {isEditing ? (
                        <Input
                          type="url"
                          value={formData.website_url || ''}
                          onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                          placeholder="https://seusite.com"
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <LinkIcon className="w-4 h-4 text-gray-400" />
                          {profile.website_url ? (
                            <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {profile.website_url}
                            </a>
                          ) : (
                            <span>Não informado</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label>Link de Reservas</Label>
                      {isEditing ? (
                        <Input
                          type="url"
                          value={formData.booking_url || ''}
                          onChange={(e) => setFormData({ ...formData, booking_url: e.target.value })}
                          placeholder="https://reservas.seusite.com"
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <LinkIcon className="w-4 h-4 text-gray-400" />
                          {profile.booking_url ? (
                            <a href={profile.booking_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {profile.booking_url}
                            </a>
                          ) : (
                            <span>Não informado</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label>WhatsApp</Label>
                      {isEditing ? (
                        <Input
                          value={formData.whatsapp || ''}
                          onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                          placeholder="(00) 00000-0000"
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {profile.whatsapp ? (
                            <a href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
                              {profile.whatsapp}
                            </a>
                          ) : (
                            <span>Não informado</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Localização
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Localização</Label>
                      {isEditing ? (
                        <Input
                          value={formData.location || ''}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="Caldas Novas, GO"
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{profile.location || 'Não informado'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label>Endereço</Label>
                      {isEditing ? (
                        <Input
                          value={formData.address || ''}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder="Rua, número"
                        />
                      ) : (
                        <p className="p-2 bg-gray-50 rounded">{profile.address || 'Não informado'}</p>
                      )}
                    </div>

                    <div>
                      <Label>Cidade</Label>
                      {isEditing ? (
                        <Input
                          value={formData.city || ''}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="Caldas Novas"
                        />
                      ) : (
                        <p className="p-2 bg-gray-50 rounded">{profile.city || 'Não informado'}</p>
                      )}
                    </div>

                    <div>
                      <Label>Estado</Label>
                      {isEditing ? (
                        <Input
                          value={formData.state || ''}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          placeholder="GO"
                        />
                      ) : (
                        <p className="p-2 bg-gray-50 rounded">{profile.state || 'Não informado'}</p>
                      )}
                    </div>

                    <div>
                      <Label>CEP</Label>
                      {isEditing ? (
                        <Input
                          value={formData.zip_code || ''}
                          onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                          placeholder="00000-000"
                        />
                      ) : (
                        <p className="p-2 bg-gray-50 rounded">{profile.zip_code || 'Não informado'}</p>
                      )}
                    </div>

                    <div>
                      <Label>País</Label>
                      {isEditing ? (
                        <Input
                          value={formData.country || 'Brasil'}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        />
                      ) : (
                        <p className="p-2 bg-gray-50 rounded">{profile.country || 'Brasil'}</p>
                      )}
                    </div>
                  </div>

                  {/* Google Maps Picker */}
                  {isEditing && (
                    <div className="col-span-full mt-4">
                      <Label>Localização no Mapa</Label>
                      <div className="mt-2">
                        <GoogleMapsPicker
                          value={{
                            address: formData.address || '',
                            city: formData.city || '',
                            state: formData.state || '',
                            zip_code: formData.zip_code || '',
                            country: formData.country || 'Brasil',
                            latitude: formData.latitude,
                            longitude: formData.longitude,
                          }}
                          onChange={(location) => {
                            setFormData({
                              ...formData,
                              address: location.address,
                              city: location.city,
                              state: location.state,
                              zip_code: location.zip_code,
                              country: location.country,
                              latitude: location.latitude,
                              longitude: location.longitude,
                            });
                          }}
                          apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                        />
                      </div>
                    </div>
                  )}

                  {/* Visualização do Mapa (modo visualização) */}
                  {!isEditing && (profile.latitude && profile.longitude) && (
                    <div className="col-span-full mt-4">
                      <Label>Localização</Label>
                      <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-700">
                            {profile.address}, {profile.city} - {profile.state}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Coordenadas: {profile.latitude?.toFixed(6)}, {profile.longitude?.toFixed(6)}
                        </div>
                        <div className="mt-2">
                          <a
                            href={`https://www.google.com/maps?q=${profile.latitude},${profile.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Ver no Google Maps →
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aba: Negócio */}
          <TabsContent value="negocio">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Informações do Negócio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nome da Empresa</Label>
                    {isEditing ? (
                      <Input
                        value={formData.business_name || ''}
                        onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                        placeholder="Minha Empresa LTDA"
                      />
                    ) : (
                      <p className="p-2 bg-gray-50 rounded">{profile.business_name || 'Não informado'}</p>
                    )}
                  </div>

                  <div>
                    <Label>Tipo de Negócio</Label>
                    {isEditing ? (
                      <Input
                        value={formData.business_type || ''}
                        onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                        placeholder="Aluguel por temporada, Hotel, Pousada..."
                      />
                    ) : (
                      <p className="p-2 bg-gray-50 rounded">{profile.business_type || 'Não informado'}</p>
                    )}
                  </div>

                  <div>
                    <Label>CNPJ</Label>
                    {isEditing ? (
                      <Input
                        value={formData.tax_id || ''}
                        onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                        placeholder="00.000.000/0000-00"
                      />
                    ) : (
                      <p className="p-2 bg-gray-50 rounded">{profile.tax_id || 'Não informado'}</p>
                    )}
                  </div>
                </div>

                {profile.verified && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded">
                    <Award className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-800">Conta Verificada</p>
                      <p className="text-sm text-green-600">Sua conta foi verificada e está ativa</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba: Categorias e Serviços */}
          <TabsContent value="servicos">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Categorias
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ex: Cabanas, Apartamentos, Casas"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              const input = e.target as HTMLInputElement
                              addArrayItem('categories', input.value)
                              input.value = ''
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={(e) => {
                            const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement
                            if (input) {
                              addArrayItem('categories', input.value)
                              input.value = ''
                            }
                          }}
                        >
                          Adicionar
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(formData.categories || []).map((cat, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {cat}
                            <button
                              onClick={() => removeArrayItem('categories', index)}
                              className="ml-1 hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {(profile.categories || []).length > 0 ? (
                        profile.categories!.map((cat, index) => (
                          <Badge key={index} variant="secondary">{cat}</Badge>
                        ))
                      ) : (
                        <p className="text-gray-500">Nenhuma categoria definida</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Serviços Extras
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ex: Limpeza, Transporte, Café da manhã"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              const input = e.target as HTMLInputElement
                              addArrayItem('services', input.value)
                              input.value = ''
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={(e) => {
                            const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement
                            if (input) {
                              addArrayItem('services', input.value)
                              input.value = ''
                            }
                          }}
                        >
                          Adicionar
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(formData.services || []).map((service, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {service}
                            <button
                              onClick={() => removeArrayItem('services', index)}
                              className="ml-1 hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {(profile.services || []).length > 0 ? (
                        profile.services!.map((service, index) => (
                          <Badge key={index} variant="secondary">{service}</Badge>
                        ))
                      ) : (
                        <p className="text-gray-500">Nenhum serviço definido</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    Comodidades
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ex: Piscina, WiFi, Ar condicionado"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              const input = e.target as HTMLInputElement
                              addArrayItem('amenities', input.value)
                              input.value = ''
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={(e) => {
                            const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement
                            if (input) {
                              addArrayItem('amenities', input.value)
                              input.value = ''
                            }
                          }}
                        >
                          Adicionar
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(formData.amenities || []).map((amenity, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {amenity}
                            <button
                              onClick={() => removeArrayItem('amenities', index)}
                              className="ml-1 hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {(profile.amenities || []).length > 0 ? (
                        profile.amenities!.map((amenity, index) => (
                          <Badge key={index} variant="secondary">{amenity}</Badge>
                        ))
                      ) : (
                        <p className="text-gray-500">Nenhuma comodidade definida</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aba: Redes Sociais */}
          <TabsContent value="redes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Redes Sociais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Facebook className="w-4 h-4 text-blue-600" />
                      Facebook
                    </Label>
                    {isEditing ? (
                      <Input
                        value={formData.social_media?.facebook || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          social_media: {
                            ...formData.social_media,
                            facebook: e.target.value
                          }
                        })}
                        placeholder="https://facebook.com/seu-perfil"
                        type="url"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        {profile.social_media?.facebook ? (
                          <a
                            href={profile.social_media.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-2"
                          >
                            <LinkIcon className="w-4 h-4" />
                            {profile.social_media.facebook}
                          </a>
                        ) : (
                          <p className="p-2 bg-gray-50 rounded text-gray-500">Não informado</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      <Instagram className="w-4 h-4 text-pink-600" />
                      Instagram
                    </Label>
                    {isEditing ? (
                      <Input
                        value={formData.social_media?.instagram || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          social_media: {
                            ...formData.social_media,
                            instagram: e.target.value
                          }
                        })}
                        placeholder="https://instagram.com/seu-perfil"
                        type="url"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        {profile.social_media?.instagram ? (
                          <a
                            href={profile.social_media.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pink-600 hover:underline flex items-center gap-2"
                          >
                            <LinkIcon className="w-4 h-4" />
                            {profile.social_media.instagram}
                          </a>
                        ) : (
                          <p className="p-2 bg-gray-50 rounded text-gray-500">Não informado</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      Twitter / X
                    </Label>
                    {isEditing ? (
                      <Input
                        value={formData.social_media?.twitter || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          social_media: {
                            ...formData.social_media,
                            twitter: e.target.value
                          }
                        })}
                        placeholder="https://twitter.com/seu-perfil"
                        type="url"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        {profile.social_media?.twitter ? (
                          <a
                            href={profile.social_media.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-800 hover:underline flex items-center gap-2"
                          >
                            <LinkIcon className="w-4 h-4" />
                            {profile.social_media.twitter}
                          </a>
                        ) : (
                          <p className="p-2 bg-gray-50 rounded text-gray-500">Não informado</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      <Linkedin className="w-4 h-4 text-blue-700" />
                      LinkedIn
                    </Label>
                    {isEditing ? (
                      <Input
                        value={formData.social_media?.linkedin || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          social_media: {
                            ...formData.social_media,
                            linkedin: e.target.value
                          }
                        })}
                        placeholder="https://linkedin.com/in/seu-perfil"
                        type="url"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        {profile.social_media?.linkedin ? (
                          <a
                            href={profile.social_media.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-700 hover:underline flex items-center gap-2"
                          >
                            <LinkIcon className="w-4 h-4" />
                            {profile.social_media.linkedin}
                          </a>
                        ) : (
                          <p className="p-2 bg-gray-50 rounded text-gray-500">Não informado</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      <Youtube className="w-4 h-4 text-red-600" />
                      YouTube
                    </Label>
                    {isEditing ? (
                      <Input
                        value={formData.social_media?.youtube || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          social_media: {
                            ...formData.social_media,
                            youtube: e.target.value
                          }
                        })}
                        placeholder="https://youtube.com/@seu-canal"
                        type="url"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        {profile.social_media?.youtube ? (
                          <a
                            href={profile.social_media.youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-600 hover:underline flex items-center gap-2"
                          >
                            <LinkIcon className="w-4 h-4" />
                            {profile.social_media.youtube}
                          </a>
                        ) : (
                          <p className="p-2 bg-gray-50 rounded text-gray-500">Não informado</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>Dica:</strong> Cole o link completo da sua página/perfil em cada rede social.
                      Os links serão validados automaticamente.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Ações Rápidas */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/minhas-reservas">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Minhas Reservas
              </Button>
            </Link>
            <Link href="/buscar">
              <Button variant="outline" className="w-full justify-start">
                <MapPin className="w-4 h-4 mr-2" />
                Buscar Hotéis
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bottom nav: Home, Busca, Reservas, Perfil */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb z-50 md:max-w-4xl md:left-1/2 md:right-auto md:-translate-x-1/2">
        <div className="flex justify-around items-center h-14">
          <Link href="/" className="flex flex-col items-center justify-center gap-0.5 py-2 px-4 text-gray-600 hover:text-blue-600">
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </Link>
          <Link href="/buscar" className="flex flex-col items-center justify-center gap-0.5 py-2 px-4 text-gray-600 hover:text-blue-600">
            <Search className="w-5 h-5" />
            <span className="text-xs">Busca</span>
          </Link>
          <Link href="/minhas-reservas" className="flex flex-col items-center justify-center gap-0.5 py-2 px-4 text-gray-600 hover:text-blue-600">
            <Calendar className="w-5 h-5" />
            <span className="text-xs">Reservas</span>
          </Link>
          <Link href="/perfil" className="flex flex-col items-center justify-center gap-0.5 py-2 px-4 text-blue-600 font-medium">
            <User className="w-5 h-5" />
            <span className="text-xs">Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
