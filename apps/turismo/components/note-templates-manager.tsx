/**
 * Componente de gerenciamento de templates de notas reutilizáveis
 * 
 * Permite criar, editar, excluir e aplicar templates de notas que podem ser
 * reutilizados em múltiplos orçamentos, acelerando a criação de cotações.
 * 
 * Funcionalidades:
 * - Criar novos templates de notas
 * - Editar templates existentes
 * - Excluir templates
 * - Aplicar template a notas importantes do orçamento
 * 
 * @component
 * @example
 * ```tsx
 * <NoteTemplatesManager
 *   onSelect={(template) => {
 *     const newNote = {
 *       id: generateId(),
 *       note: template.content,
 *       checked: true,
 *     };
 *     updateBudget('importantNotes', [...notes, newNote]);
 *   }}
 * />
 * ```
 * 
 * @param {(template: NoteTemplate) => void} onSelect - Callback quando um template é selecionado para aplicar
 * @param {string} className - Classes CSS adicionais
 * 
 * Conforme documentação (linha 648-656)
 */
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { noteTemplatesStorage, NoteTemplate } from '@/lib/note-templates-storage';
import { Plus, Edit2, Trash2, FileText, X } from 'lucide-react';
import { generateId } from '@/lib/utils';

interface NoteTemplatesManagerProps {
  /** Callback quando um template é selecionado para aplicar */
  onSelect?: (template: NoteTemplate) => void;
  /** Classes CSS adicionais */
  className?: string;
}

export function NoteTemplatesManager({
  onSelect,
  className = '',
}: NoteTemplatesManagerProps) {
  const [templates, setTemplates] = useState<NoteTemplate[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NoteTemplate | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateContent, setTemplateContent] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    const allTemplates = noteTemplatesStorage.getAll();
    setTemplates(allTemplates);
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setTemplateName('');
    setTemplateContent('');
    setIsDialogOpen(true);
  };

  const handleEdit = (template: NoteTemplate) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setTemplateContent(template.content);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este template?')) {
      noteTemplatesStorage.delete(id);
      loadTemplates();
    }
  };

  const handleSave = () => {
    if (!templateName.trim() || !templateContent.trim()) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    const template: NoteTemplate = {
      id: editingTemplate?.id || generateId(),
      name: templateName.trim(),
      content: templateContent.trim(),
      createdAt: editingTemplate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    noteTemplatesStorage.save(template);
    loadTemplates();
    setIsDialogOpen(false);
    setEditingTemplate(null);
    setTemplateName('');
    setTemplateContent('');
  };

  const handleApply = (template: NoteTemplate) => {
    if (onSelect) {
      onSelect(template);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Templates de Notas</h3>
        <Button onClick={handleCreate} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Criar Template
        </Button>
      </div>

      {/* Lista de Templates */}
      {templates.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Nenhum template criado ainda</p>
          <p className="text-sm mt-2">Crie seu primeiro template para acelerar a criação de cotações</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold">{template.name}</h4>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(template)}
                    className="h-8 w-8"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(template.id)}
                    className="h-8 w-8 text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                {template.content}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleApply(template)}
                  className="flex-1"
                >
                  Aplicar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog de Criação/Edição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Editar Template' : 'Criar Template'}
            </DialogTitle>
            <DialogDescription>
              Crie um template reutilizável para acelerar a criação de cotações
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Nome do Template</label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Ex: Nota padrão para hotéis"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Conteúdo</label>
              <Textarea
                value={templateContent}
                onChange={(e) => setTemplateContent(e.target.value)}
                placeholder="Digite o conteúdo do template aqui..."
                rows={8}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {editingTemplate ? 'Salvar Alterações' : 'Criar Template'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

