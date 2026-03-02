"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, Save, Video, ImageIcon, RefreshCw, Upload } from "@/lib/lucide-icons";
import MediaUpload from "./MediaUpload";

// Usar rota local do Next.js (mesmo servidor)
const API_HEADER_URL = "/api/admin/website/header";

interface HeaderData {
  id?: number;
  type: "video" | "image";
  url: string;
  title?: string;
  autoplay?: boolean;
  muted?: boolean;
  updated_at?: string;
}

export default function HeaderManagement() {
  const [headerData, setHeaderData] = useState<HeaderData>({
    type: "video",
    url: "",
    title: "",
    autoplay: true,
    muted: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [typeManuallySet, setTypeManuallySet] = useState(false); // Flag para indicar se o tipo foi definido manualmente

  // Detectar tipo de mídia baseado na URL
  const detectMediaType = (url: string): "image" | "video" => {
    if (!url) return "image";
    
    const urlLower = url.toLowerCase();
    
    // Verificar extensão no final da URL primeiro (mais confiável)
    const urlPath = urlLower.split('?')[0]; // Remover query string
    const hasVideoExt = /\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv|m4v|3gp)$/i.test(urlPath);
    const hasImageExt = /\.(jpg|jpeg|png|gif|svg|webp|avif|bmp|ico|jfif)$/i.test(urlPath);
    
    if (hasVideoExt) {
      return "video";
    }
    
    if (hasImageExt) {
      return "image";
    }
    
    // URLs de plataformas de vídeo
    const videoPlatforms = ['youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com', 'twitch.tv'];
    const isVideoPlatform = videoPlatforms.some(platform => urlLower.includes(platform));
    
    if (isVideoPlatform) {
      return "video";
    }
    
    // Verificar se contém extensão de vídeo em qualquer lugar (fallback)
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.flv', '.wmv'];
    const isVideoExtension = videoExtensions.some(ext => urlLower.includes(ext));
    
    if (isVideoExtension) {
      return "video";
    }
    
    // Padrão: assumir imagem se não conseguir detectar
    return "image";
  };

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

  // Carregar header atual
  const loadHeader = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(API_HEADER_URL, {
        headers: {
          Authorization: getAuthToken(),
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao carregar header");
      }

      const result = await response.json();
      if (result.success && result.data) {
        // Detectar tipo automaticamente ao carregar
        const detectedType = detectMediaType(result.data.url);
        setTypeManuallySet(false); // Resetar flag ao carregar
        setHeaderData({
          ...result.data,
          type: detectedType, // Usar tipo detectado ao invés do salvo
        });
        setIsEditing(true);
        console.log("✅ Header carregado com tipo detectado:", detectedType);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao carregar header");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHeader();
  }, []);

  // Log quando headerData.url mudar para debug e corrigir tipo se necessário
  useEffect(() => {
    if (headerData.url && !typeManuallySet) {
      console.log("🔄 URL do header atualizada:", headerData.url);
      console.log("🔄 Tipo do header:", headerData.type);
      
      // Detectar tipo automaticamente e corrigir se necessário (apenas se não foi definido manualmente)
      const detectedType = detectMediaType(headerData.url);
      if (headerData.type !== detectedType) {
        console.warn(`⚠️ Tipo inconsistente detectado: salvo="${headerData.type}", detectado="${detectedType}". Corrigindo automaticamente...`);
        setHeaderData(prev => ({ ...prev, type: detectedType }));
      }
    }
  }, [headerData.url, typeManuallySet]);

  // Salvar header
  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Validar URL
      if (!headerData.url || !headerData.url.trim()) {
        setError("URL é obrigatória");
        setLoading(false);
        return;
      }

      // Normalizar URL (converter relativa para absoluta se necessário)
      let normalizedUrl = headerData.url.trim();
      
      // Se a URL já começa com http:// ou https://, usar como está
      if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
        // Se começa com /, é uma URL relativa ao servidor atual
        if (!normalizedUrl.startsWith("/")) {
          // Se não começa com / nem http, assumir que é relativo
          normalizedUrl = `/${normalizedUrl}`;
        }
        // URLs relativas começando com / serão resolvidas pelo navegador
      }

      console.log("💾 Salvando header:", {
        type: headerData.type,
        url: normalizedUrl,
        title: headerData.title,
      });

      const method = isEditing ? "PUT" : "POST";
      const response = await fetch(API_HEADER_URL, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: getAuthToken(),
        },
        body: JSON.stringify({
          type: headerData.type,
          url: normalizedUrl,
          title: headerData.title || "",
          autoplay: headerData.autoplay ?? true,
          muted: headerData.muted ?? true,
        }),
      });

      console.log("📡 Resposta do servidor:", response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: `Erro HTTP ${response.status}: ${response.statusText}`,
        }));
        console.error("❌ Erro ao salvar:", errorData);
        console.error("❌ Detalhes do erro:", errorData.details);
        console.error("❌ Dados enviados:", {
          type: headerData.type,
          url: normalizedUrl,
          title: headerData.title,
        });
        
        // Montar mensagem de erro mais detalhada
        let errorMessage = errorData.error || "Erro ao salvar header";
        if (errorData.details && Array.isArray(errorData.details)) {
          errorMessage += `: ${errorData.details.join(", ")}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("✅ Resultado:", result);
      
      if (result.success) {
        setHeaderData(result.data);
        setSuccess(true);
        setIsEditing(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error(result.error || "Erro ao salvar header");
      }
    } catch (err: any) {
      console.error("❌ Erro capturado:", err);
      setError(err.message || "Erro ao salvar header");
    } finally {
      setLoading(false);
    }
  };

  // Deletar/Resetar header
  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja resetar o header para o padrão?")) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(API_HEADER_URL, {
        method: "DELETE",
        headers: {
          Authorization: getAuthToken(),
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao resetar header");
      }

      const result = await response.json();
      if (result.success) {
        setHeaderData(result.data);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao resetar header");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Header</h2>
          <p className="text-gray-600 mt-1">
            Configure o vídeo ou imagem do header da página inicial
          </p>
        </div>
        <Button
          variant="outline"
          onClick={loadHeader}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Recarregar
        </Button>
      </div>

      {/* Alertas */}
      {error && (
        <Alert variant="destructive" className="border-red-500 bg-red-50">
          <AlertDescription className="text-red-800 font-semibold">
            ❌ {error}
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-500">
          <AlertDescription className="text-green-800 font-semibold">
            ✅ Alterações salvas com sucesso!
          </AlertDescription>
        </Alert>
      )}

      {/* Formulário */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração do Header</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tipo */}
          <div className="space-y-2">
            <Label>Tipo de Mídia</Label>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={headerData.type === "video" ? "default" : "outline"}
                onClick={() => {
                  console.log("🎬 Botão Vídeo clicado");
                  setTypeManuallySet(true);
                  setHeaderData(prev => ({ ...prev, type: "video" }));
                }}
                className="flex items-center gap-2"
              >
                <Video className="w-4 h-4" />
                Vídeo
              </Button>
              <Button
                type="button"
                variant={headerData.type === "image" ? "default" : "outline"}
                onClick={() => {
                  console.log("🖼️ Botão Imagem clicado");
                  setTypeManuallySet(true);
                  setHeaderData(prev => ({ ...prev, type: "image" }));
                }}
                className="flex items-center gap-2"
              >
                <ImageIcon className="w-4 h-4" />
                Imagem
              </Button>
            </div>
          </div>

          {/* Upload de Mídia */}
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                📤 Upload de Mídia
              </Label>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Faça upload de imagens (JPG, PNG, GIF, SVG, WebP), vídeos (MP4, WebM, MOV) ou cole uma URL
            </p>
            
            <MediaUpload
              onChange={(urls) => {
                console.log("📤 URLs recebidas do upload:", urls);
                if (urls && urls.length > 0) {
                  // Usar a primeira URL do upload
                  const uploadedUrl = urls[0];
                  console.log("🖼️ URL do upload:", uploadedUrl);
                  
                  // Detectar automaticamente o tipo de mídia
                  const detectedType = detectMediaType(uploadedUrl);
                  console.log("🔍 Tipo detectado:", detectedType);
                  
                  // Atualizar estado de forma segura
                  setTypeManuallySet(false); // Resetar flag ao fazer upload (permitir detecção automática)
                  setHeaderData((prev) => ({ 
                    ...prev, 
                    url: uploadedUrl,
                    type: detectedType
                  }));
                  
                  console.log("✅ HeaderData atualizado com URL:", uploadedUrl);
                  
                  // Mostrar feedback visual
                  setSuccess(true);
                  setTimeout(() => setSuccess(false), 3000);
                } else {
                  console.warn("⚠️ Nenhuma URL recebida do upload");
                }
              }}
              disabled={loading || isUploading}
            />
            
            <div className="mt-3 p-3 bg-white rounded border border-gray-200">
              <p className="text-xs text-gray-500 mb-2">
                <strong>Formatos suportados:</strong>
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <strong>Imagens:</strong> JPG, PNG, GIF, SVG, WebP, AVIF
                </div>
                <div>
                  <strong>Vídeos:</strong> MP4, WebM, MOV, AVI, OGG
                </div>
              </div>
            </div>
          </div>

          {/* URL Manual */}
          <div className="space-y-2">
            <Label htmlFor="url">
              Ou cole a URL {headerData.type === "video" ? "do Vídeo" : "da Imagem"} *
            </Label>
            <div className="flex gap-2">
              <Input
                id="url"
                type="url"
                value={headerData.url}
                onChange={(e) => {
                  const newUrl = e.target.value;
                  // Detectar tipo automaticamente quando URL muda (apenas se não foi definido manualmente)
                  if (!typeManuallySet) {
                    const detectedType = detectMediaType(newUrl);
                    setHeaderData(prev => ({ 
                      ...prev, 
                      url: newUrl,
                      type: detectedType
                    }));
                  } else {
                    // Se foi definido manualmente, apenas atualizar a URL
                    setHeaderData(prev => ({ 
                      ...prev, 
                      url: newUrl
                    }));
                  }
                }}
                placeholder={
                  headerData.type === "video"
                    ? "https://exemplo.com/video.mp4 ou https://youtube.com/watch?v=..."
                    : "https://exemplo.com/imagem.jpg"
                }
                required
                className="flex-1"
              />
            </div>
            <p className="text-sm text-gray-500">
              Use uma URL completa (http:// ou https://), caminho relativo (/images/...) ou URL do YouTube/Vimeo
            </p>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título (opcional)</Label>
            <Input
              id="title"
              type="text"
              value={headerData.title || ""}
              onChange={(e) =>
                setHeaderData({ ...headerData, title: e.target.value })
              }
              placeholder="Título descritivo da mídia"
            />
          </div>

          {/* Opções de Vídeo */}
          {headerData.type === "video" && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoplay"
                  checked={headerData.autoplay ?? true}
                  onChange={(e) =>
                    setHeaderData({ ...headerData, autoplay: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <Label htmlFor="autoplay" className="cursor-pointer">
                  Reproduzir automaticamente
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="muted"
                  checked={headerData.muted ?? true}
                  onChange={(e) =>
                    setHeaderData({ ...headerData, muted: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <Label htmlFor="muted" className="cursor-pointer">
                  Sem som (mudo)
                </Label>
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview {headerData.url ? "✅" : "⚠️ (URL necessária)"}</Label>
            {headerData.url ? (
              <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border-2 border-gray-300">
                {(() => {
                  // Detectar tipo novamente para garantir que está correto
                  const detectedType = detectMediaType(headerData.url);
                  const actualType = headerData.type || detectedType;
                  
                  // Se o tipo salvo não corresponde ao detectado, corrigir
                  if (headerData.type !== detectedType && detectedType !== "image") {
                    console.warn(`⚠️ Tipo inconsistente: salvo="${headerData.type}", detectado="${detectedType}". Corrigindo...`);
                    setHeaderData(prev => ({ ...prev, type: detectedType }));
                    return null; // Retornar null para forçar re-render
                  }
                  
                  return actualType === "video" ? (
                    // Verificar se é YouTube/Vimeo ou vídeo local
                    headerData.url.includes('youtube.com') || headerData.url.includes('youtu.be') || headerData.url.includes('vimeo.com') ? (
                    <iframe
                      src={headerData.url.includes('youtube.com') || headerData.url.includes('youtu.be') 
                        ? headerData.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')
                        : headerData.url.replace('vimeo.com/', 'player.vimeo.com/video/')}
                      title={headerData.title || "Preview do vídeo"}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    // Vídeo local (MP4, WebM, etc.)
                    <video
                      src={headerData.url}
                      className="w-full h-full object-cover"
                      controls
                      autoPlay={headerData.autoplay}
                      muted={headerData.muted}
                      loop
                      playsInline
                    >
                      Seu navegador não suporta o elemento de vídeo.
                    </video>
                  )
                ) : (
                  <img
                    src={headerData.url}
                    alt={headerData.title || "Preview da imagem"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Se falhar ao carregar como imagem, verificar se é vídeo
                      const detectedType = detectMediaType(headerData.url);
                      if (detectedType === "video") {
                        console.warn("⚠️ Tentando carregar vídeo como imagem. Corrigindo tipo...");
                        setHeaderData(prev => ({ ...prev, type: "video" }));
                      } else {
                        console.error("❌ Erro ao carregar imagem:", headerData.url);
                        (e.target as HTMLImageElement).src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23ddd' width='400' height='300'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='18' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3EImagem não encontrada%3C/text%3E%3C/svg%3E";
                      }
                    }}
                    onLoad={() => {
                      console.log("✅ Imagem carregada com sucesso:", headerData.url);
                    }}
                  />
                );
                })()}
                <p className="text-xs text-gray-500 truncate mt-2">
                  URL: {headerData.url}
                </p>
              </div>
            ) : (
              <div className="relative w-full aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                <p className="text-gray-400 text-sm">Nenhuma mídia selecionada</p>
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={(e) => {
                e.preventDefault();
                console.log("🔘 Botão Salvar clicado");
                console.log("📋 Estado atual:", {
                  url: headerData.url,
                  type: headerData.type,
                  loading,
                  isEditing,
                });
                handleSave();
              }}
              disabled={loading || !headerData.url || !headerData.url.trim()}
              className="flex items-center gap-2"
            >
              <Save className={`w-4 h-4 ${loading ? "animate-pulse" : ""}`} />
              {loading ? "Salvando..." : "Salvar"}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Resetar para Padrão
            </Button>
          </div>

          {/* Informações */}
          <div className="pt-4 border-t text-sm text-gray-500">
            <p>
              <strong>Nota:</strong> As alterações serão refletidas na página
              inicial (http://localhost:3000/) após salvar.
            </p>
            {headerData.updated_at && (
              <p className="mt-1">
                Última atualização:{" "}
                {new Date(headerData.updated_at).toLocaleString("pt-BR")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

