// Página de criação de template conforme documentação (linha 537-545)
// Formulário completo, categorização, thumbnail, todos campos BudgetTemplate

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { BudgetTemplate, BudgetItem, Photo, Highlight, Benefit, ImportantNote } from '@/lib/types/budget';
import { templateStorage } from '@/lib/template-storage';
import { generateId } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MAIN_CATEGORIES, SUB_CATEGORIES } from '@/lib/budget-types';

export default function NewTemplatePage() {
  const router = useRouter();
  const [template, setTemplate] = useState<Partial<BudgetTemplate>>({
    id: generateId(),
    name: '',
    mainCategory: 'Hotéis',
    subCategory: '',
    description: '',
    thumbnailUrl: '',
    title: '',
    templateDescription: '',
    items: [],
    photos: [],
    highlights: [],
    benefits: [],
    accommodationDetails: [],
    importantNotes: [],
    contacts: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const updateTemplate = (field: string, value: any) => {
    setTemplate({
      ...template,
      [field]: value,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSave = () => {
    // Validações conforme documento
    if (!template.name || !template.mainCategory || !template.title) {
      alert('Por favor, preencha pelo menos: Nome, Categoria Principal e Título');
      return;
    }

    try {
      const finalTemplate: BudgetTemplate = {
        ...template,
        id: template.id || generateId(),
        createdAt: template.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as BudgetTemplate;

      // Salvar template
      templateStorage.save(finalTemplate);
      
      console.log('Template criado com sucesso:', {
        id: finalTemplate.id,
        name: finalTemplate.name,
        mainCategory: finalTemplate.mainCategory,
        subCategory: finalTemplate.subCategory,
        itemsCount: finalTemplate.items?.length || 0,
      });

      alert('Template criado com sucesso!');
      router.push('/cotacoes/templates');
    } catch (error) {
      console.error('Erro ao criar template:', error);
      alert('Erro ao criar template. Por favor, tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/cotacoes/templates">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Templates
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Criar Novo Template</h1>
              <p className="text-gray-600 mt-2">Crie um template reutilizável para acelerar a criação de cotações</p>
            </div>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Salvar Template
            </Button>
          </div>
        </div>

        {/* Formulário conforme documento (linha 540-544) */}
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Informações Básicas */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Informações Básicas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome do Template *</Label>
                <Input
                  id="name"
                  value={template.name || ''}
                  onChange={(e) => updateTemplate('name', e.target.value)}
                  placeholder="Ex: Hotel Premium Caldas Novas"
                />
              </div>
              <div>
                <Label htmlFor="title">Título da Cotação *</Label>
                <Input
                  id="title"
                  value={template.title || ''}
                  onChange={(e) => updateTemplate('title', e.target.value)}
                  placeholder="Ex: Pacote Completo Resort"
                />
              </div>
              <div>
                <Label htmlFor="mainCategory">Categoria Principal *</Label>
                <Select value={template.mainCategory || 'Hotéis'} onValueChange={(value) => {
                  updateTemplate('mainCategory', value);
                  updateTemplate('subCategory', ''); // Reset subcategoria
                }}>
                  <SelectTrigger id="mainCategory">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MAIN_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subCategory">Subcategoria</Label>
                <Select 
                  value={template.subCategory || ''} 
                  onValueChange={(value) => updateTemplate('subCategory', value)}
                  disabled={!template.mainCategory || !SUB_CATEGORIES[template.mainCategory]}
                >
                  <SelectTrigger id="subCategory">
                    <SelectValue placeholder="Selecione uma subcategoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {template.mainCategory && SUB_CATEGORIES[template.mainCategory]?.map((sub) => (
                      <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Descrição do Template</Label>
                <Textarea
                  id="description"
                  value={template.description || ''}
                  onChange={(e) => updateTemplate('description', e.target.value)}
                  placeholder="Descreva o template e quando usá-lo"
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="templateDescription">Descrição da Cotação</Label>
                <Textarea
                  id="templateDescription"
                  value={template.templateDescription || ''}
                  onChange={(e) => updateTemplate('templateDescription', e.target.value)}
                  placeholder="Descrição detalhada que aparecerá na cotação gerada"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="thumbnailUrl">URL da Imagem de Capa</Label>
                <Input
                  id="thumbnailUrl"
                  type="url"
                  value={template.thumbnailUrl || ''}
                  onChange={(e) => updateTemplate('thumbnailUrl', e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
            </div>
          </div>

          {/* Campos específicos por categoria */}
          {template.mainCategory === 'Hotéis' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Informações do Hotel</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hotelName">Nome do Hotel</Label>
                  <Input
                    id="hotelName"
                    value={template.hotelName || ''}
                    onChange={(e) => updateTemplate('hotelName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="hotelCity">Cidade</Label>
                  <Input
                    id="hotelCity"
                    value={template.hotelCity || ''}
                    onChange={(e) => updateTemplate('hotelCity', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="hotelState">Estado</Label>
                  <Input
                    id="hotelState"
                    value={template.hotelState || ''}
                    onChange={(e) => updateTemplate('hotelState', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="maxGuests">Máximo de Hóspedes</Label>
                  <Input
                    id="maxGuests"
                    type="number"
                    value={template.maxGuests || ''}
                    onChange={(e) => updateTemplate('maxGuests', parseInt(e.target.value) || undefined)}
                  />
                </div>
                <div>
                  <Label htmlFor="roomCount">Quantidade de Quartos</Label>
                  <Input
                    id="roomCount"
                    type="number"
                    value={template.roomCount || ''}
                    onChange={(e) => updateTemplate('roomCount', parseInt(e.target.value) || undefined)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Resumo */}
          <div className="pt-6 border-t">
            <p className="text-sm text-gray-600">
              * Campos obrigatórios. Após criar o template, você poderá editá-lo para adicionar itens, fotos, benefícios, etc.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

