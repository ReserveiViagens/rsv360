// Página de galeria de templates conforme documentação (linha 374-387)
// Grid cards, filtros categoria, busca, imagem capa, metadados, ações (usar, editar, copiar, excluir), versionamento

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Plus, Search, Eye, Edit, Copy, Trash2, Filter, Image as ImageIcon } from 'lucide-react';
import { BudgetTemplate } from '@/lib/types/budget';
import { templateStorage } from '@/lib/template-storage';
import { initializeDefaultTemplates } from '@/lib/default-templates';
import { MAIN_CATEGORIES, SUB_CATEGORIES } from '@/lib/budget-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function TemplatesGalleryPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<BudgetTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<BudgetTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    // Garantir que templates padrão estejam inicializados
    initializeDefaultTemplates();
    loadTemplates();

    // Expor função de testes no console do navegador para validação (apenas no cliente)
    // Usar import dinâmico para evitar problemas no SSR
    if (typeof window !== 'undefined') {
      // Aguardar um pouco para garantir que estamos no cliente
      setTimeout(async () => {
        try {
          const testModule = await import('@/lib/test-module');
          if (testModule) {
            (window as any).testModule = {
              runAllTests: testModule.runAllTests,
              testTemplateLoading: testModule.testTemplateLoading,
              testCreateBudgetFromTemplate: testModule.testCreateBudgetFromTemplate,
              testCalculations: testModule.testCalculations,
              testLocalStorage: testModule.testLocalStorage,
              testTemplateVersioning: testModule.testTemplateVersioning,
            };
            console.log('🧪 Testes disponíveis no console: window.testModule.runAllTests()');
          }
        } catch (error) {
          console.warn('⚠️ Não foi possível carregar módulo de testes:', error);
        }
      }, 100);
    }
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, selectedCategory, searchQuery]);

  const loadTemplates = () => {
    const all = templateStorage.getAll();
    setTemplates(all);
    
    // Log para debug/testes - verificar se templates estão carregados
    console.log('Templates carregados:', {
      total: all.length,
      porCategoria: {
        hotéis: all.filter(t => t.mainCategory === 'Hotéis').length,
        parques: all.filter(t => t.mainCategory === 'Parques').length,
        atrações: all.filter(t => t.mainCategory === 'Atrações').length,
        passeios: all.filter(t => t.mainCategory === 'Passeios').length,
      }
    });
  };

  const filterTemplates = () => {
    let filtered = templates;

    // Filtrar por categoria conforme documento (linha 380)
    if (selectedCategory !== 'Todos') {
      filtered = filtered.filter(t => t.mainCategory === selectedCategory);
    }

    // Busca por nome ou descrição conforme documento (linha 381)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.name?.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query) ||
        t.title?.toLowerCase().includes(query) ||
        t.templateDescription?.toLowerCase().includes(query)
      );
    }

    // Ordenar por data de atualização (mais recentes primeiro)
    filtered.sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || '').getTime();
      const dateB = new Date(b.updatedAt || b.createdAt || '').getTime();
      return dateB - dateA;
    });

    setFilteredTemplates(filtered);
  };

  const handleUseTemplate = (template: BudgetTemplate) => {
    // Fluxo completo conforme documento (linha 808-822): redirecionar para customização
    router.push(`/cotacoes/from-template/${template.id}`);
  };

  const handleEditTemplate = (template: BudgetTemplate) => {
    router.push(`/cotacoes/templates/${template.id}/edit`);
  };

  const handleCopyTemplate = (template: BudgetTemplate) => {
    const copied: BudgetTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      name: `${template.name} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    templateStorage.save(copied);
    loadTemplates();
    alert('Template copiado com sucesso!');
  };

  const handleDeleteTemplate = () => {
    if (!templateToDelete) return;
    
    const template = templateStorage.getById(templateToDelete);
    if (template && template.isDefault) {
      alert('Não é possível excluir templates padrão.');
      setTemplateToDelete(null);
      return;
    }

    templateStorage.delete(templateToDelete);
    loadTemplates();
    setTemplateToDelete(null);
    alert('Template excluído com sucesso!');
  };

  if (!isClient) {
    return null;
  }

  const categories = ['Todos', ...MAIN_CATEGORIES];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header conforme documento (linha 379) */}
        <div className="mb-8">
          <Link href="/cotacoes">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Cotações
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Galeria de Templates</h1>
              <p className="text-gray-600 mt-2">
                {templates.length} template{templates.length !== 1 ? 's' : ''} disponível{templates.length !== 1 ? 'eis' : ''}
              </p>
            </div>
            <Link href="/cotacoes/templates/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Template
              </Button>
            </Link>
          </div>
        </div>

        {/* Filtros e Busca conforme documento (linha 380-381) */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Busca por nome ou descrição */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar templates por nome ou descrição..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro por categoria */}
            <div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Grid de Templates conforme documento (linha 379, 382) */}
        {filteredTemplates.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum template encontrado
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedCategory !== 'Todos'
                ? 'Tente ajustar os filtros de busca.'
                : 'Crie seu primeiro template para começar.'}
            </p>
            <Link href="/cotacoes/templates/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Criar Template
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
              >
                {/* Imagem de Capa conforme documento (linha 382) */}
                {template.thumbnailUrl ? (
                  <div className="aspect-video w-full bg-gray-100 overflow-hidden">
                    <img
                      src={template.thumbnailUrl}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}

                <div className="p-4">
                  {/* Título e Categoria */}
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                      {template.name}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline">{template.mainCategory}</Badge>
                      {template.subCategory && (
                        <Badge variant="secondary" className="text-xs">
                          {template.subCategory}
                        </Badge>
                      )}
                      {template.isDefault && (
                        <Badge className="bg-blue-600">Padrão</Badge>
                      )}
                    </div>
                  </div>

                  {/* Descrição */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {template.description || template.templateDescription || 'Sem descrição'}
                  </p>

                  {/* Metadados conforme documento (linha 382) */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-4 border-b">
                    <div>
                      {template.createdAt && (
                        <div>
                          Criado: {new Date(template.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </div>
                    {template.usageCount !== undefined && (
                      <div>{template.usageCount} uso{template.usageCount !== 1 ? 's' : ''}</div>
                    )}
                  </div>

                  {/* Ações conforme documento (linha 383) */}
                  <div className="space-y-2">
                    <Button
                      onClick={() => handleUseTemplate(template)}
                      className="w-full"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Usar Template
                    </Button>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTemplate(template)}
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyTemplate(template)}
                        title="Copiar"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTemplateToDelete(template.id)}
                        disabled={template.isDefault}
                        title="Excluir"
                        className={template.isDefault ? 'opacity-50 cursor-not-allowed' : ''}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dialog de Confirmação de Exclusão */}
        <Dialog open={!!templateToDelete} onOpenChange={(open) => !open && setTemplateToDelete(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir este template? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setTemplateToDelete(null)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteTemplate}>
                Excluir
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

