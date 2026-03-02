'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { PlusCircle, Edit, Trash2, Save, XCircle, Search, Loader2, Clock, DollarSign, Users, Zap, Info, Percent } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useFlashDealsAdmin, FlashDeal, FlashDealFormData } from '@/hooks/useFlashDealsAdmin';

// Sub-componente para o formulário de flash deal
interface FlashDealFormProps {
  flashDeal: FlashDeal | null;
  onSave: (data: FlashDealFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const FlashDealForm = ({ flashDeal, onSave, onCancel, isLoading }: FlashDealFormProps) => {
  const [formData, setFormData] = useState<FlashDealFormData>({
    title: '',
    description: '',
    enterprise_id: 0,
    property_id: undefined,
    accommodation_id: undefined,
    original_price: 0,
    discount_percentage: 0,
    max_discount: 0,
    discount_increment: 0,
    increment_interval: 0,
    units_available: 0,
    start_date: '',
    end_date: '',
    status: 'scheduled',
  });

  useEffect(() => {
    if (flashDeal) {
      setFormData({
        title: flashDeal.title || '',
        description: flashDeal.description || '',
        enterprise_id: flashDeal.enterprise_id || 0,
        property_id: flashDeal.property_id,
        accommodation_id: flashDeal.accommodation_id,
        original_price: flashDeal.original_price || 0,
        discount_percentage: flashDeal.discount_percentage || 0,
        max_discount: flashDeal.max_discount || 0,
        discount_increment: flashDeal.discount_increment || 0,
        increment_interval: flashDeal.increment_interval || 0,
        units_available: flashDeal.units_available || 0,
        start_date: flashDeal.start_date ? new Date(flashDeal.start_date).toISOString().slice(0, 16) : '',
        end_date: flashDeal.end_date ? new Date(flashDeal.end_date).toISOString().slice(0, 16) : '',
        status: flashDeal.status || 'scheduled',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        enterprise_id: 0,
        property_id: undefined,
        accommodation_id: undefined,
        original_price: 0,
        discount_percentage: 0,
        max_discount: 0,
        discount_increment: 0,
        increment_interval: 0,
        units_available: 0,
        start_date: '',
        end_date: '',
        status: 'scheduled',
      });
    }
  }, [flashDeal]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes('price') || name.includes('discount') || name.includes('increment') || name.includes('interval') || name.includes('units') || name.includes('enterprise_id') || name.includes('property_id') || name.includes('accommodation_id')
        ? (value === '' ? undefined : parseFloat(value))
        : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave(formData);
    } catch (err) {
      // Error is handled by parent
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Título *</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="Ex: Flash Deal - Suíte Premium 50% OFF"
        />
      </div>
      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          placeholder="Descreva o flash deal..."
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start_date">Data/Hora de Início *</Label>
          <Input
            id="start_date"
            name="start_date"
            type="datetime-local"
            value={formData.start_date}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="end_date">Data/Hora de Fim *</Label>
          <Input
            id="end_date"
            name="end_date"
            type="datetime-local"
            value={formData.end_date}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="original_price">Preço Original (R$) *</Label>
          <Input
            id="original_price"
            name="original_price"
            type="number"
            step="0.01"
            min="0"
            value={formData.original_price}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="discount_percentage">Desconto Inicial (%) *</Label>
          <Input
            id="discount_percentage"
            name="discount_percentage"
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={formData.discount_percentage}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="max_discount">Desconto Máximo (%) *</Label>
          <Input
            id="max_discount"
            name="max_discount"
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={formData.max_discount}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="discount_increment">Incremento de Desconto (%) *</Label>
          <Input
            id="discount_increment"
            name="discount_increment"
            type="number"
            step="0.1"
            min="0"
            value={formData.discount_increment}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="increment_interval">Intervalo de Incremento (minutos) *</Label>
          <Input
            id="increment_interval"
            name="increment_interval"
            type="number"
            min="1"
            value={formData.increment_interval}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="units_available">Unidades Disponíveis *</Label>
          <Input
            id="units_available"
            name="units_available"
            type="number"
            min="1"
            value={formData.units_available}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="enterprise_id">ID do Empreendimento *</Label>
          <Input
            id="enterprise_id"
            name="enterprise_id"
            type="number"
            min="1"
            value={formData.enterprise_id}
            onChange={handleChange}
            required
            placeholder="Ex: 1"
          />
        </div>
        <div>
          <Label htmlFor="property_id">ID da Propriedade</Label>
          <Input
            id="property_id"
            name="property_id"
            type="number"
            min="1"
            value={formData.property_id || ''}
            onChange={handleChange}
            placeholder="Opcional"
          />
        </div>
        <div>
          <Label htmlFor="accommodation_id">ID da Acomodação</Label>
          <Input
            id="accommodation_id"
            name="accommodation_id"
            type="number"
            min="1"
            value={formData.accommodation_id || ''}
            onChange={handleChange}
            placeholder="Opcional"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => handleSelectChange('status', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="scheduled">Agendado</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="sold_out">Esgotado</SelectItem>
            <SelectItem value="expired">Expirado</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          <XCircle className="w-4 h-4 mr-2" /> Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {flashDeal ? 'Atualizar' : 'Criar'} Flash Deal
        </Button>
      </DialogFooter>
    </form>
  );
};

// Componente principal
export default function FlashDealManagement() {
  const { flashDeals, loading, error, loadFlashDeals, createFlashDeal, updateFlashDeal, deleteFlashDeal } = useFlashDealsAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFlashDeal, setEditingFlashDeal] = useState<FlashDeal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadFlashDeals();
  }, [loadFlashDeals]);

  const handleCreateClick = () => {
    setEditingFlashDeal(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (flashDeal: FlashDeal) => {
    setEditingFlashDeal(flashDeal);
    setIsModalOpen(true);
  };

  const handleSave = async (formData: FlashDealFormData) => {
    try {
      if (editingFlashDeal) {
        await updateFlashDeal(editingFlashDeal.id, formData);
        toast.success('Flash Deal atualizado com sucesso!');
      } else {
        await createFlashDeal(formData);
        toast.success('Flash Deal criado com sucesso!');
      }
      setIsModalOpen(false);
      setEditingFlashDeal(null);
      loadFlashDeals();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(`Erro ao salvar flash deal: ${errorMessage}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar este flash deal?')) {
      try {
        await deleteFlashDeal(id);
        toast.success('Flash Deal deletado com sucesso!');
        loadFlashDeals();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        toast.error(`Erro ao deletar flash deal: ${errorMessage}`);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      scheduled: { label: 'Agendado', variant: 'outline' },
      active: { label: 'Ativo', variant: 'default' },
      sold_out: { label: 'Esgotado', variant: 'secondary' },
      expired: { label: 'Expirado', variant: 'destructive' },
      cancelled: { label: 'Cancelado', variant: 'destructive' },
    };
    const statusInfo = statusMap[status] || { label: status, variant: 'outline' };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const filteredFlashDeals = flashDeals.filter(
    (flashDeal) =>
      flashDeal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (flashDeal.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error && flashDeals.length === 0) {
    return (
      <div className="text-red-500 p-4 bg-red-50 rounded-lg">
        Erro ao carregar flash deals: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6" />
            Gerenciamento de Flash Deals
          </CardTitle>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreateClick}>
                <PlusCircle className="w-4 h-4 mr-2" /> Novo Flash Deal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingFlashDeal ? 'Editar Flash Deal' : 'Criar Novo Flash Deal'}</DialogTitle>
                <DialogDescription>
                  {editingFlashDeal
                    ? 'Edite os detalhes do flash deal existente.'
                    : 'Preencha os detalhes para criar um novo flash deal com desconto progressivo.'}
                </DialogDescription>
              </DialogHeader>
              <FlashDealForm
                flashDeal={editingFlashDeal}
                onSave={handleSave}
                onCancel={() => {
                  setIsModalOpen(false);
                  setEditingFlashDeal(null);
                }}
                isLoading={loading}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Crie, edite e gerencie os flash deals com desconto progressivo.
          </p>

          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar flash deals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                <XCircle className="w-4 h-4 mr-2" /> Limpar
              </Button>
            )}
          </div>

          {loading && flashDeals.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredFlashDeals.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'Nenhum flash deal encontrado com o termo de busca.' : 'Nenhum flash deal encontrado.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredFlashDeals.map((flashDeal) => {
                const currentDiscount = flashDeal.discount_percentage + 
                  (flashDeal.units_sold * flashDeal.discount_increment);
                const finalDiscount = Math.min(currentDiscount, flashDeal.max_discount);
                const currentPrice = flashDeal.original_price * (1 - finalDiscount / 100);

                return (
                  <Card key={flashDeal.id} className="relative hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{flashDeal.title}</CardTitle>
                        {getStatusBadge(flashDeal.status)}
                      </div>
                      {flashDeal.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{flashDeal.description}</p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>Início: {new Date(flashDeal.start_date).toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>Fim: {new Date(flashDeal.end_date).toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-lg font-semibold text-primary">
                          <DollarSign className="w-5 h-5 mr-1" />
                          <span>R$ {currentPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center text-sm text-red-600 font-semibold">
                          <Percent className="w-4 h-4 mr-1" />
                          <span>-{finalDiscount.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="line-through">R$ {flashDeal.original_price.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{flashDeal.units_sold} / {flashDeal.units_available} vendidos</span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(flashDeal)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-1" /> Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(flashDeal.id)}
                          className="flex-1"
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Deletar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
