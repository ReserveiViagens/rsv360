'use client';

import { useState, useEffect } from 'react';
import { Image, Video, Plus, Edit, Trash2, GripVertical } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/providers/toast-wrapper';
import { getToken } from '@/lib/auth';
import { ErrorBoundary } from '@/components/ui/error-boundary';

interface SliderItem {
  id?: number;
  type: 'image' | 'video';
  url: string;
  title?: string;
}

function SliderPageContent() {
  const [slides, setSlides] = useState<SliderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<SliderItem | null>(null);
  const [formUrl, setFormUrl] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<'image' | 'video'>('image');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadSlider();
  }, []);

  const loadSlider = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch('/api/admin/website/header', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const result = await response.json();
      if (result.success && result.data) {
        const data = result.data;
        setSlides([
          {
            id: data.id,
            type: data.type || 'image',
            url: data.url || '',
            title: data.title,
          },
        ]);
      } else {
        setSlides([]);
      }
    } catch {
      setSlides([]);
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditingSlide(null);
    setFormUrl('');
    setFormTitle('');
    setFormType('image');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formUrl.trim()) {
      toast.warning('URL é obrigatória');
      return;
    }
    setSaving(true);
    try {
      const token = getToken();
      const response = await fetch('/api/admin/website/header', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          type: formType,
          url: formUrl.trim(),
          title: formTitle.trim() || null,
          autoplay: true,
          muted: true,
        }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Slider atualizado com sucesso');
        setDialogOpen(false);
        loadSlider();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
          <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Slider / Banner</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Imagem ou vídeo do cabeçalho do site
            </p>
          </div>
          <Button onClick={openNew} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Configurar
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Visualização do banner</CardTitle>
            <CardDescription>
              O banner exibido no topo da página inicial
            </CardDescription>
          </CardHeader>
          <CardContent>
            {slides.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-xl">
                <Image className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Nenhum slide configurado</p>
                <Button onClick={openNew}>
                  <Plus className="w-4 h-4 mr-2" />
                  Configurar banner
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {slides.map((slide) => (
                  <div
                    key={slide.id || slide.url}
                    className="flex items-center gap-4 p-4 rounded-lg border bg-card"
                  >
                    <GripVertical className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      {slide.type === 'image' ? (
                        <img
                          src={slide.url}
                          alt={slide.title || 'Slide'}
                          className="h-24 w-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="h-24 bg-muted rounded-lg flex items-center justify-center">
                          <Video className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      <p className="text-sm font-medium mt-2 truncate">
                        {slide.title || slide.url}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={openNew}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configurar banner</DialogTitle>
            <DialogDescription>
              Informe a URL da imagem ou vídeo para o cabeçalho
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formType === 'image' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormType('image')}
                >
                  Imagem
                </Button>
                <Button
                  type="button"
                  variant={formType === 'video' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormType('video')}
                >
                  Vídeo
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Título (opcional)</Label>
              <Input
                id="title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Título do banner"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function SliderDashboardPage() {
  return (
    <ErrorBoundary>
      <SliderPageContent />
    </ErrorBoundary>
  );
}
