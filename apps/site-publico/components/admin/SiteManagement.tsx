"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  RefreshCw,
  FileText,
  Layout,
  Layers,
  GripVertical,
  Eye,
  X,
  History,
  RotateCcw,
  ImageIcon,
  Video,
} from "@/lib/lucide-icons";
import { API_BASE_URL } from "@/lib/config";

// API de páginas: usa backend se NEXT_PUBLIC_API_URL estiver definido, senão rota local Next.js
const PAGES_API_BASE = (typeof window !== "undefined" && API_BASE_URL) ? API_BASE_URL : (typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
import { motion, AnimatePresence } from "framer-motion";
import RichTextEditor from "./RichTextEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MediaUpload from "./MediaUpload";

interface PageData {
  id?: number;
  slug: string;
  title: string;
  type: "page" | "landing" | "tab";
  content: string;
  images?: string[];
  videos?: string[];
  metadata?: {
    description?: string;
    keywords?: string[];
    og_image?: string;
  };
  navigation?: {
    show_in_menu: boolean;
    menu_order: number;
    menu_label?: string;
    icon?: string;
  };
  status: "active" | "inactive" | "draft";
  created_at?: string;
  updated_at?: string;
}

export default function SiteManagement() {
  const [pages, setPages] = useState<PageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<PageData | null>(null);
  const [formData, setFormData] = useState<Partial<PageData>>({
    slug: "",
    title: "",
    type: "page",
    content: "",
    images: [],
    videos: [],
    metadata: {
      description: "",
      keywords: [],
      og_image: "",
    },
    navigation: {
      show_in_menu: true,
      menu_order: 0,
      menu_label: "",
      icon: "📄",
    },
    status: "draft",
  });
  const [keywordInput, setKeywordInput] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  
  // Estados para importação de dados
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [loadingItems, setLoadingItems] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  // Função para obter token de autenticação (mesma lógica dos outros componentes)
  const getAuthToken = () => {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('admin_token='));
    if (tokenCookie) {
      const token = tokenCookie.split('=')[1];
      if (token) return `Bearer ${token}`;
    }
    const tokenFromStorage = localStorage.getItem('admin_token');
    return tokenFromStorage ? `Bearer ${tokenFromStorage}` : 'Bearer admin-token-123';
  };

  // Carregar páginas
  const loadPages = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${PAGES_API_BASE}/api/admin/website/pages`, {
        headers: {
          Authorization: getAuthToken(),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        setPages(result.data || []);
      } else {
        throw new Error(result.error || "Erro ao carregar páginas");
      }
    } catch (err: any) {
      console.error("Erro ao carregar páginas:", err);
      setError(err.message || "Erro ao carregar páginas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

  // Abrir diálogo para criar/editar
  const handleOpenDialog = (page?: PageData) => {
    if (page) {
      setEditingPage(page);
      setFormData({
        slug: page.slug,
        title: page.title,
        type: page.type,
        content: page.content || "",
        images: page.images || [],
        videos: page.videos || [],
        metadata: {
          description: page.metadata?.description || "",
          keywords: page.metadata?.keywords || [],
          og_image: page.metadata?.og_image || "",
        },
        navigation: {
          show_in_menu: page.navigation?.show_in_menu ?? true,
          menu_order: page.navigation?.menu_order || 0,
          menu_label: page.navigation?.menu_label || page.title,
          icon: page.navigation?.icon || "📄",
        },
        status: page.status,
      });
    } else {
      setEditingPage(null);
      setFormData({
        slug: "",
        title: "",
        type: "page",
        content: "",
        images: [],
        videos: [],
        metadata: {
          description: "",
          keywords: [],
          og_image: "",
        },
        navigation: {
          show_in_menu: true,
          menu_order: pages.length + 1,
          menu_label: "",
          icon: "📄",
        },
        status: "draft",
      });
    }
    setIsDialogOpen(true);
  };

  // Salvar página
  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Validação básica
      if (!formData.slug || !formData.title) {
        setError("Slug e título são obrigatórios");
        return;
      }

      // Gerar slug do título se não fornecido
      if (!formData.slug && formData.title) {
        const generatedSlug = formData.title
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        setFormData({ ...formData, slug: generatedSlug });
      }

      const url = editingPage
        ? `${PAGES_API_BASE}/api/admin/website/pages/${editingPage.id}`
        : `${PAGES_API_BASE}/api/admin/website/pages`;
      const method = editingPage ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: getAuthToken(),
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao salvar página");
      }

      const result = await response.json();
      if (result.success) {
        setSuccess(true);
        setIsDialogOpen(false);
        await loadPages();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao salvar página");
    } finally {
      setLoading(false);
    }
  };

  // Carregar itens disponíveis para importação
  const loadAvailableItems = async (pageType: string) => {
    try {
      setLoadingItems(true);
      const slugToPageType: { [key: string]: string } = {
        "hoteis": "hotels",
        "hotels": "hotels",
        "ingressos": "tickets",
        "tickets": "tickets",
        "atracoes": "attractions",
        "attractions": "attractions",
        "promocoes": "promotions",
        "promotions": "promotions",
      };
      
      const mappedType = slugToPageType[pageType.toLowerCase()];
      if (!mappedType) {
        setAvailableItems([]);
        return;
      }
      
      const url = `${PAGES_API_BASE}/api/admin/website/content/${mappedType}/items`;
      console.log(`📡 Carregando itens de: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          Authorization: getAuthToken(),
        },
      });
      
      console.log(`📡 Resposta do servidor: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        // Tentar obter detalhes do erro do servidor
        let errorMessage = `Erro ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.error("❌ Detalhes do erro:", errorData);
        } catch (e) {
          const errorText = await response.text();
          console.error("❌ Resposta de erro (texto):", errorText);
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log(`✅ Resultado recebido:`, result);
      
      if (result.success) {
        setAvailableItems(result.data || []);
        console.log(`✅ ${result.data?.length || 0} itens carregados com sucesso`);
      } else {
        throw new Error(result.error || "Erro ao processar resposta do servidor");
      }
    } catch (err: any) {
      console.error("❌ Erro ao carregar itens:", err);
      setError(err.message || "Erro ao carregar itens disponíveis");
      setAvailableItems([]); // Limpar itens em caso de erro
    } finally {
      setLoadingItems(false);
    }
  };

  // Importar dados completos de um item
  const handleImportItem = async () => {
    if (!selectedItemId || !formData.slug) {
      setError("Selecione um item para importar");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const slugToPageType: { [key: string]: string } = {
        "hoteis": "hotels",
        "hotels": "hotels",
        "ingressos": "tickets",
        "tickets": "tickets",
        "atracoes": "attractions",
        "attractions": "attractions",
        "promocoes": "promotions",
        "promotions": "promotions",
      };
      
      const mappedType = slugToPageType[formData.slug.toLowerCase()];
      if (!mappedType) {
        throw new Error("Tipo de página não suportado para importação");
      }
      
      // Buscar dados completos do item
      const response = await fetch(`${PAGES_API_BASE}/api/admin/website/content/${mappedType}/items/${selectedItemId}`, {
        headers: {
          Authorization: getAuthToken(),
        },
      });
      
      if (!response.ok) {
        throw new Error("Erro ao importar item");
      }
      
      const result = await response.json();
      if (result.success && result.data) {
        const item = result.data;
        
        // Construir conteúdo HTML a partir dos dados do item
        let contentHTML = `<div class="container mx-auto px-4 py-8">`;
        contentHTML += `<h1 class="text-4xl font-bold mb-6">${item.title}</h1>`;
        
        if (item.description) {
          contentHTML += `<p class="text-xl text-gray-600 mb-8">${item.description}</p>`;
        }
        
        // Adicionar informações de metadata se existirem
        if (item.metadata) {
          contentHTML += `<div class="prose max-w-none mt-6">`;
          
          // Preço (para hotéis, atrações, ingressos)
          if (item.metadata.price !== undefined) {
            const price = typeof item.metadata.price === 'number' ? item.metadata.price.toFixed(2) : item.metadata.price;
            contentHTML += `<p class="text-2xl font-bold text-green-600 mb-4">Preço: R$ ${price}</p>`;
          }
          
          // Preço original e desconto (para hotéis e promoções)
          if (item.metadata.originalPrice !== undefined) {
            const originalPrice = typeof item.metadata.originalPrice === 'number' ? item.metadata.originalPrice.toFixed(2) : item.metadata.originalPrice;
            contentHTML += `<p class="text-lg text-gray-500 line-through mb-2">De: R$ ${originalPrice}</p>`;
          }
          
          if (item.metadata.discount !== undefined) {
            contentHTML += `<p class="text-xl font-semibold text-red-600 mb-4">Desconto: ${item.metadata.discount}% OFF</p>`;
          }
          
          // Estrelas (para hotéis)
          if (item.metadata.stars !== undefined) {
            const stars = '⭐'.repeat(item.metadata.stars);
            contentHTML += `<p class="text-lg mb-4">${stars} ${item.metadata.stars} Estrelas</p>`;
          }
          
          // Features/Características
          if (item.metadata.features && Array.isArray(item.metadata.features)) {
            contentHTML += `<h2 class="text-2xl font-semibold mt-6 mb-4">Características:</h2>`;
            contentHTML += `<ul class="list-disc list-inside space-y-2">`;
            item.metadata.features.forEach((feature: string) => {
              contentHTML += `<li>${feature}</li>`;
            });
            contentHTML += `</ul>`;
          }
          
          // Benefits (para promoções)
          if (item.metadata.benefits && Array.isArray(item.metadata.benefits)) {
            contentHTML += `<h2 class="text-2xl font-semibold mt-6 mb-4">Benefícios:</h2>`;
            contentHTML += `<ul class="list-disc list-inside space-y-2">`;
            item.metadata.benefits.forEach((benefit: string) => {
              contentHTML += `<li>${benefit}</li>`;
            });
            contentHTML += `</ul>`;
          }
          
          // Localização
          if (item.metadata.location) {
            contentHTML += `<p class="mt-4"><strong>📍 Localização:</strong> ${item.metadata.location}</p>`;
          }
          
          // Horário
          if (item.metadata.hours) {
            contentHTML += `<p class="mt-2"><strong>🕒 Horário:</strong> ${item.metadata.hours}</p>`;
          }
          
          // Capacidade (para hotéis)
          if (item.metadata.capacity) {
            contentHTML += `<p class="mt-2"><strong>👥 Capacidade:</strong> ${item.metadata.capacity}</p>`;
          }
          
          // Duração (para ingressos)
          if (item.metadata.duration) {
            contentHTML += `<p class="mt-2"><strong>⏱️ Duração:</strong> ${item.metadata.duration}</p>`;
          }
          
          // Faixa etária (para ingressos)
          if (item.metadata.ageGroup) {
            contentHTML += `<p class="mt-2"><strong>👶 Faixa Etária:</strong> ${item.metadata.ageGroup}</p>`;
          }
          
          // Categoria (para ingressos e atrações)
          if (item.metadata.category) {
            contentHTML += `<p class="mt-2"><strong>🏷️ Categoria:</strong> ${item.metadata.category}</p>`;
          }
          
          // Tipo (para atrações)
          if (item.metadata.type) {
            contentHTML += `<p class="mt-2"><strong>🎯 Tipo:</strong> ${item.metadata.type}</p>`;
          }
          
          // Válido até (para promoções)
          if (item.metadata.validUntil) {
            contentHTML += `<p class="mt-2"><strong>📅 Válido até:</strong> ${item.metadata.validUntil}</p>`;
          }
          
          contentHTML += `</div>`;
        }
        
        contentHTML += `</div>`;
        
        // Atualizar formData com dados importados
        setFormData({
          ...formData,
          title: item.title || formData.title,
          content: contentHTML,
          images: [...(formData.images || []), ...(item.images || [])].filter((v, i, a) => a.indexOf(v) === i), // Evitar duplicatas
          videos: [...(formData.videos || []), ...(item.videos || [])].filter((v, i, a) => a.indexOf(v) === i), // Evitar duplicatas
          metadata: {
            description: item.seo_data?.description || item.description || formData.metadata?.description || "",
            keywords: item.seo_data?.keywords || formData.metadata?.keywords || [],
            og_image: item.images?.[0] || formData.metadata?.og_image || "",
          },
        });
        
        setSuccess(true);
        setShowImportDialog(false);
        setSelectedItemId("");
        setTimeout(() => setSuccess(false), 3000);
        console.log(`✅ Dados importados com sucesso: ${item.title}`);
      }
    } catch (err: any) {
      console.error("Erro ao importar item:", err);
      setError(err.message || "Erro ao importar dados do item");
    } finally {
      setLoading(false);
    }
  };

  // Deletar página
  const handleDelete = async (page: PageData) => {
    if (!confirm(`Tem certeza que deseja deletar a página "${page.title}"?`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${PAGES_API_BASE}/api/admin/website/pages/${page.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: getAuthToken(),
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao deletar página");
      }

      await loadPages();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Erro ao deletar página");
    } finally {
      setLoading(false);
    }
  };

  // Adicionar keyword
  const handleAddKeyword = () => {
    if (keywordInput.trim() && formData.metadata) {
      const keywords = formData.metadata.keywords || [];
      if (!keywords.includes(keywordInput.trim())) {
        setFormData({
          ...formData,
          metadata: {
            ...formData.metadata,
            keywords: [...keywords, keywordInput.trim()],
          },
        });
      }
      setKeywordInput("");
    }
  };

  // Remover keyword
  const handleRemoveKeyword = (keyword: string) => {
    if (formData.metadata) {
      setFormData({
        ...formData,
        metadata: {
          ...formData.metadata,
          keywords: formData.metadata.keywords?.filter((k) => k !== keyword) || [],
        },
      });
    }
  };

  // Carregar versões
  const loadVersions = async (page: PageData) => {
    if (!page.id) return;
    
    try {
      setLoadingVersions(true);
      const response = await fetch(
        `${PAGES_API_BASE}/api/admin/website/pages/${page.id}/versions`,
        {
          headers: {
            Authorization: getAuthToken(),
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setVersions(result.data || []);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar versões:", err);
    } finally {
      setLoadingVersions(false);
    }
  };

  // Restaurar versão
  const handleRestoreVersion = async (page: PageData, version: number) => {
    if (!confirm(`Tem certeza que deseja restaurar a versão ${version}?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${PAGES_API_BASE}/api/admin/website/pages/${page.id}/versions/${version}/restore`,
        {
          method: "POST",
          headers: {
            Authorization: getAuthToken(),
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao restaurar versão");
      }

      const result = await response.json();
      if (result.success) {
        await loadPages();
        setShowVersions(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao restaurar versão");
    } finally {
      setLoading(false);
    }
  };

  // Obter ícone do tipo
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "landing":
        return <Layout className="w-4 h-4" />;
      case "tab":
        return <Layers className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  // Obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "inactive":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Gerenciamento de Páginas
          </h2>
          <p className="text-gray-600 mt-1">
            Crie e gerencie páginas, landing pages e abas do site
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadPages}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Recarregar
          </Button>
          <Button
            onClick={() => handleOpenDialog()}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Página
          </Button>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">
            ✅ Operação realizada com sucesso!
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de Páginas */}
      <div className="grid gap-4">
        {pages.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma página criada ainda</p>
              <Button
                onClick={() => handleOpenDialog()}
                className="mt-4"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Página
              </Button>
            </CardContent>
          </Card>
        ) : (
          pages.map((page) => (
            <motion.div
              key={page.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getTypeIcon(page.type)}
                        <h3 className="text-lg font-semibold">{page.title}</h3>
                        <Badge
                          className={`${getStatusColor(page.status)} text-white`}
                        >
                          {page.status}
                        </Badge>
                        <Badge variant="outline">{page.type}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Slug: <code className="bg-gray-100 px-1 rounded">{page.slug}</code>
                      </p>
                      {page.metadata?.description && (
                        <p className="text-sm text-gray-500 mb-2">
                          {page.metadata.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {page.navigation?.show_in_menu && (
                          <span className="flex items-center gap-1">
                            <GripVertical className="w-3 h-3" />
                            Ordem: {page.navigation.menu_order}
                          </span>
                        )}
                        {page.updated_at && (
                          <span>
                            Atualizado:{" "}
                            {new Date(page.updated_at).toLocaleDateString("pt-BR")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          loadVersions(page);
                          handleOpenDialog(page);
                        }}
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          loadVersions(page);
                          setEditingPage(page);
                          setShowVersions(true);
                        }}
                        title="Histórico de versões"
                      >
                        <History className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(page)}
                        disabled={loading}
                        title="Deletar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Dialog de Criar/Editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPage ? "Editar Página" : "Nova Página"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Tipo */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Página *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "page" | "landing" | "tab") =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="page">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Página Normal
                      </div>
                    </SelectItem>
                    <SelectItem value="landing">
                      <div className="flex items-center gap-2">
                        <Layout className="w-4 h-4" />
                        Landing Page
                      </div>
                    </SelectItem>
                    <SelectItem value="tab">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4" />
                        Aba
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "active" | "inactive" | "draft") =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="draft">Rascunho</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Título e Slug */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title || ""}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    // Gerar slug automaticamente se não estiver editando
                    if (!editingPage && !formData.slug) {
                      const slug = e.target.value
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/(^-|-$)/g, "");
                      setFormData({ ...formData, title: e.target.value, slug });
                    }
                  }}
                  placeholder="Título da página"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL) *</Label>
                <Input
                  id="slug"
                  value={formData.slug || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                    })
                  }
                  placeholder="exemplo-pagina"
                  required
                />
                <p className="text-xs text-gray-500">
                  URL: /{formData.slug || "exemplo-pagina"}
                </p>
              </div>
            </div>

            {/* Seção de Importação de Dados */}
            {(formData.slug === "hoteis" || formData.slug === "ingressos" || formData.slug === "atracoes" || formData.slug === "promocoes") && (
              <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <RefreshCw className="w-5 h-5" />
                    Importar Dados Existentes
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowImportDialog(!showImportDialog);
                      if (!showImportDialog && availableItems.length === 0) {
                        loadAvailableItems(formData.slug || "");
                      }
                    }}
                    disabled={loadingItems}
                  >
                    {showImportDialog ? "Ocultar" : "Mostrar"} Importação
                  </Button>
                </div>
                
                {showImportDialog && (
                  <div className="space-y-3 mt-3">
                    {loadingItems ? (
                      <p className="text-sm text-gray-600">Carregando itens disponíveis...</p>
                    ) : availableItems.length === 0 ? (
                      <p className="text-sm text-gray-600">Nenhum item disponível para importação.</p>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label>Selecione um item para importar:</Label>
                          <Select
                            value={selectedItemId}
                            onValueChange={setSelectedItemId}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um item..." />
                            </SelectTrigger>
                            <SelectContent>
                              {availableItems.map((item) => (
                                <SelectItem key={item.id || item.content_id} value={String(item.id || item.content_id)}>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{item.title}</span>
                                    {item.images && item.images.length > 0 && (
                                      <Badge variant="secondary" className="text-xs">
                                        {item.images.length} foto{item.images.length > 1 ? 's' : ''}
                                      </Badge>
                                    )}
                                    {item.videos && item.videos.length > 0 && (
                                      <Badge variant="secondary" className="text-xs">
                                        {item.videos.length} vídeo{item.videos.length > 1 ? 's' : ''}
                                      </Badge>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {selectedItemId && (
                          <div className="p-3 bg-white rounded-lg border border-blue-200">
                            {(() => {
                              const selectedItem = availableItems.find(
                                (item) => String(item.id || item.content_id) === selectedItemId
                              );
                              if (!selectedItem) return null;
                              
                              return (
                                <div className="space-y-2">
                                  <p className="text-sm font-semibold">{selectedItem.title}</p>
                                  {selectedItem.description && (
                                    <p className="text-xs text-gray-600 line-clamp-2">{selectedItem.description}</p>
                                  )}
                                  <div className="flex gap-2 flex-wrap">
                                    {selectedItem.images && selectedItem.images.length > 0 && (
                                      <Badge variant="outline" className="text-xs">
                                        📸 {selectedItem.images.length} imagem{selectedItem.images.length > 1 ? 'ens' : ''}
                                      </Badge>
                                    )}
                                    {selectedItem.videos && selectedItem.videos.length > 0 && (
                                      <Badge variant="outline" className="text-xs">
                                        🎥 {selectedItem.videos.length} vídeo{selectedItem.videos.length > 1 ? 's' : ''}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                        
                        <Button
                          type="button"
                          onClick={handleImportItem}
                          disabled={!selectedItemId || loading}
                          className="w-full"
                          variant="default"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Importar Dados e Galeria
                        </Button>
                        
                        <p className="text-xs text-gray-600 bg-blue-100 p-2 rounded border border-blue-300">
                          💡 <strong>Importação completa:</strong> Ao importar, serão adicionados automaticamente o título, descrição, conteúdo HTML, imagens, vídeos e metadados do item selecionado. As mídias serão mescladas com as existentes (sem duplicatas).
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Navegação */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold">Configurações de Navegação</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="show_in_menu"
                    checked={formData.navigation?.show_in_menu ?? true}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        navigation: {
                          ...formData.navigation!,
                          show_in_menu: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4"
                  />
                  <Label htmlFor="show_in_menu" className="cursor-pointer">
                    Mostrar no menu
                  </Label>
                </div>
                {formData.navigation?.show_in_menu && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="menu_order">Ordem no Menu</Label>
                      <Input
                        id="menu_order"
                        type="number"
                        value={formData.navigation?.menu_order || 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            navigation: {
                              ...formData.navigation!,
                              menu_order: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="menu_label">Label do Menu</Label>
                      <Input
                        id="menu_label"
                        value={formData.navigation?.menu_label || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            navigation: {
                              ...formData.navigation!,
                              menu_label: e.target.value,
                            },
                          })
                        }
                        placeholder={formData.title || "Label no menu"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="icon">Ícone (emoji)</Label>
                      <Input
                        id="icon"
                        value={formData.navigation?.icon || "📄"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            navigation: {
                              ...formData.navigation!,
                              icon: e.target.value,
                            },
                          })
                        }
                        placeholder="📄"
                        maxLength={10}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Conteúdo com Editor WYSIWYG e Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content">Conteúdo da Página</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {showPreview ? "Editar" : "Preview"}
                </Button>
              </div>
              
              {showPreview ? (
                <Card className="p-6 bg-white">
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: formData.content || "<p>Nenhum conteúdo ainda...</p>",
                    }}
                  />
                </Card>
              ) : (
                <RichTextEditor
                  value={formData.content || ""}
                  onChange={(value) => setFormData({ ...formData, content: value })}
                  placeholder="Digite o conteúdo da página aqui..."
                />
              )}
            </div>

            {/* Templates para Landing Pages */}
            {formData.type === "landing" && (
              <div className="space-y-2 p-4 bg-blue-50 rounded-lg">
                <Label>Templates de Landing Page</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      id: "hero-cta",
                      name: "Hero + CTA",
                      description: "Cabeçalho com chamada para ação",
                      content: `<div class="hero-section" style="text-align: center; padding: 60px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
  <h1 style="font-size: 3rem; margin-bottom: 20px;">Título Principal</h1>
  <p style="font-size: 1.25rem; margin-bottom: 30px;">Descrição impactante do seu produto ou serviço</p>
  <button style="background: white; color: #667eea; padding: 15px 40px; border: none; border-radius: 8px; font-size: 1.1rem; font-weight: bold; cursor: pointer;">Ação Principal</button>
</div>`,
                    },
                    {
                      id: "features",
                      name: "Features",
                      description: "Lista de características",
                      content: `<div style="padding: 60px 20px;">
  <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 50px;">Nossas Características</h2>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px;">
    <div style="text-align: center; padding: 30px;">
      <div style="font-size: 3rem; margin-bottom: 15px;">✨</div>
      <h3 style="font-size: 1.5rem; margin-bottom: 10px;">Característica 1</h3>
      <p>Descrição da característica</p>
    </div>
    <div style="text-align: center; padding: 30px;">
      <div style="font-size: 3rem; margin-bottom: 15px;">🚀</div>
      <h3 style="font-size: 1.5rem; margin-bottom: 10px;">Característica 2</h3>
      <p>Descrição da característica</p>
    </div>
    <div style="text-align: center; padding: 30px;">
      <div style="font-size: 3rem; margin-bottom: 15px;">💎</div>
      <h3 style="font-size: 1.5rem; margin-bottom: 10px;">Característica 3</h3>
      <p>Descrição da característica</p>
    </div>
  </div>
</div>`,
                    },
                    {
                      id: "testimonials",
                      name: "Depoimentos",
                      description: "Seção de depoimentos",
                      content: `<div style="padding: 60px 20px; background: #f9fafb;">
  <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 50px;">O que nossos clientes dizem</h2>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">
    <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <p style="font-style: italic; margin-bottom: 20px;">"Excelente serviço e atendimento!"</p>
      <p style="font-weight: bold;">- Cliente 1</p>
    </div>
    <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <p style="font-style: italic; margin-bottom: 20px;">"Superou minhas expectativas!"</p>
      <p style="font-weight: bold;">- Cliente 2</p>
    </div>
  </div>
</div>`,
                    },
                  ].map((template) => (
                    <Card
                      key={template.id}
                      className={`cursor-pointer hover:border-blue-500 transition-colors ${
                        selectedTemplate === template.id ? "border-blue-500 border-2" : ""
                      }`}
                      onClick={() => {
                        setSelectedTemplate(template.id);
                        setFormData({
                          ...formData,
                          content: template.content,
                        });
                      }}
                    >
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-1">{template.name}</h4>
                        <p className="text-xs text-gray-600">{template.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Clique em um template para aplicar ao conteúdo
                </p>
              </div>
            )}

            {/* Gerenciamento de Mídia - Imagens e Vídeos */}
            <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-lg">📸 Galeria de Mídias da Página</h4>
                {/* Botão para importar mídias existentes dos cards */}
                {(formData.slug === "hoteis" || formData.slug === "ingressos" || formData.slug === "atracoes" || formData.slug === "promocoes") && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        setLoading(true);
                        const response = await fetch(`${PAGES_API_BASE}/api/admin/website/pages/gallery/${formData.slug}`, {
                          headers: {
                            Authorization: getAuthToken(),
                          },
                        });
                        
                        if (!response.ok) {
                          throw new Error("Erro ao importar galeria");
                        }
                        
                        const result = await response.json();
                        if (result.success && result.data) {
                          const { images, videos } = result.data;
                          
                          // Adicionar imagens e vídeos importados às existentes (evitando duplicatas)
                          const existingImages = formData.images || [];
                          const existingVideos = formData.videos || [];
                          
                          const newImages = [...existingImages];
                          const newVideos = [...existingVideos];
                          
                          images.forEach((img: string) => {
                            if (!newImages.includes(img)) {
                              newImages.push(img);
                            }
                          });
                          
                          videos.forEach((vid: string) => {
                            if (!newVideos.includes(vid)) {
                              newVideos.push(vid);
                            }
                          });
                          
                          setFormData({
                            ...formData,
                            images: newImages,
                            videos: newVideos,
                          });
                          
                          setSuccess(true);
                          setTimeout(() => setSuccess(false), 3000);
                          console.log(`✅ Importadas ${images.length} imagens e ${videos.length} vídeos da galeria`);
                        }
                      } catch (err: any) {
                        console.error("Erro ao importar galeria:", err);
                        setError(err.message || "Erro ao importar galeria");
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Importar Mídias dos Cards
                  </Button>
                )}
              </div>
              
              {(formData.slug === "hoteis" || formData.slug === "ingressos" || formData.slug === "atracoes" || formData.slug === "promocoes") && (
                <p className="text-xs text-gray-600 bg-blue-50 p-2 rounded border border-blue-200">
                  💡 <strong>Dica:</strong> Clique em "Importar Mídias dos Cards" para importar automaticamente todas as imagens e vídeos das galerias dos cards desta página (Hotéis, Ingressos, Atrações ou Promoções).
                </p>
              )}
              
              {/* Upload de Imagens */}
              <div className="space-y-2">
                <Label>Imagens</Label>
                <MediaUpload
                  onChange={(urls) => {
                    // Adicionar novas imagens às existentes
                    const existingImages = formData.images || [];
                    const newImages = [...existingImages, ...urls];
                    setFormData({
                      ...formData,
                      images: newImages,
                    });
                  }}
                  disabled={loading}
                />
                
                {/* Lista de Imagens Existentes */}
                {formData.images && formData.images.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-semibold">
                        Imagens na Galeria ({formData.images.length})
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Tem certeza que deseja remover todas as ${formData.images?.length || 0} imagens?`)) {
                            setFormData({
                              ...formData,
                              images: [],
                            });
                          }
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Limpar Todas
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {formData.images.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={imageUrl}
                            alt={`Imagem ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150'%3E%3Crect fill='%23ddd' width='200' height='150'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='12' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3EImagem não encontrada%3C/text%3E%3C/svg%3E";
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => {
                                const newImages = formData.images?.filter((_, i) => i !== index) || [];
                                setFormData({
                                  ...formData,
                                  images: newImages,
                                });
                              }}
                              className="bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                              title="Remover imagem"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity truncate">
                            {imageUrl.length > 30 ? `${imageUrl.substring(0, 30)}...` : imageUrl}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Upload de Vídeos */}
              <div className="space-y-2 mt-4">
                <Label>Vídeos</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <MediaUpload
                    onChange={(urls) => {
                      // Filtrar apenas vídeos (URLs que terminam com extensões de vídeo)
                      const videoUrls = urls.filter(url => 
                        /\.(mp4|webm|ogg|mov|avi)$/i.test(url) || 
                        url.includes('youtube.com') || 
                        url.includes('youtu.be') ||
                        url.includes('vimeo.com')
                      );
                      setFormData({
                        ...formData,
                        videos: [...(formData.videos || []), ...videoUrls],
                      });
                    }}
                    disabled={loading}
                  />
                </div>
                
                {/* Lista de Vídeos Existentes */}
                {formData.videos && formData.videos.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-semibold">
                        Vídeos na Galeria ({formData.videos.length})
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Tem certeza que deseja remover todos os ${formData.videos?.length || 0} vídeos?`)) {
                            setFormData({
                              ...formData,
                              videos: [],
                            });
                          }
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Limpar Todos
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {formData.videos.map((videoUrl, index) => (
                        <div key={index} className="relative group">
                          {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') || videoUrl.includes('vimeo.com') ? (
                            <div className="relative w-full h-32 bg-gray-900 rounded-lg flex items-center justify-center border-2 border-gray-200 hover:border-blue-400 transition-colors">
                              <Video className="w-8 h-8 text-white" />
                              <p className="text-white text-xs mt-2 absolute bottom-2 left-2 right-2 truncate px-2">
                                {videoUrl.length > 40 ? `${videoUrl.substring(0, 40)}...` : videoUrl}
                              </p>
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newVideos = formData.videos?.filter((_, i) => i !== index) || [];
                                    setFormData({
                                      ...formData,
                                      videos: newVideos,
                                    });
                                  }}
                                  className="bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                  title="Remover vídeo"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="relative w-full h-32 bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-colors">
                              <video
                                src={videoUrl}
                                className="w-full h-full object-cover"
                                controls
                                onError={(e) => {
                                  console.error("Erro ao carregar vídeo:", videoUrl);
                                }}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newVideos = formData.videos?.filter((_, i) => i !== index) || [];
                                    setFormData({
                                      ...formData,
                                      videos: newVideos,
                                    });
                                  }}
                                  className="bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                  title="Remover vídeo"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-2">
                💡 Dica: Você pode adicionar múltiplas imagens e vídeos. Clique no X para remover.
              </p>
            </div>

            {/* Metadata */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold">SEO e Metadata</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição (SEO)</Label>
                  <Textarea
                    id="description"
                    value={formData.metadata?.description || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metadata: {
                          ...formData.metadata,
                          description: e.target.value,
                        },
                      })
                    }
                    placeholder="Descrição para SEO..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keywords">Palavras-chave</Label>
                  <div className="flex gap-2">
                    <Input
                      id="keywords"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddKeyword();
                        }
                      }}
                      placeholder="Adicionar palavra-chave"
                    />
                    <Button type="button" onClick={handleAddKeyword} variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {formData.metadata?.keywords && formData.metadata.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.metadata.keywords.map((keyword, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {keyword}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => handleRemoveKeyword(keyword)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="og_image">Imagem OG (Open Graph)</Label>
                  <Input
                    id="og_image"
                    type="url"
                    value={formData.metadata?.og_image || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metadata: {
                          ...formData.metadata,
                          og_image: e.target.value,
                        },
                      })
                    }
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setShowPreview(false);
                  setSelectedTemplate(null);
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Histórico de Versões */}
      <Dialog open={showVersions} onOpenChange={setShowVersions}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Histórico de Versões</DialogTitle>
          </DialogHeader>

          {loadingVersions ? (
            <div className="py-8 text-center">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-gray-600">Carregando versões...</p>
            </div>
          ) : versions.length === 0 ? (
            <div className="py-8 text-center">
              <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma versão anterior encontrada</p>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {versions.map((version, idx) => (
                <Card key={idx}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">Versão {version.version}</Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(version.updated_at).toLocaleString("pt-BR")}
                          </span>
                          {version.updated_by && (
                            <span className="text-sm text-gray-500">
                              por {version.updated_by}
                            </span>
                          )}
                        </div>
                        <div
                          className="text-sm text-gray-700 line-clamp-3"
                          dangerouslySetInnerHTML={{
                            __html: version.content || "<p>Sem conteúdo</p>",
                          }}
                        />
                      </div>
                      {editingPage && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestoreVersion(editingPage, version.version)}
                          disabled={loading}
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Restaurar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

