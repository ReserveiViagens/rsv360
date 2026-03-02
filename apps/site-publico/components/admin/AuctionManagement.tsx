'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { PlusCircle, Edit, Trash2, Save, XCircle, Search, Loader2, Clock, DollarSign, Users, Calendar, Info, Gavel } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useAuctionsAdmin, Auction, AuctionFormData } from '@/hooks/useAuctionsAdmin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Sub-componente para o formulário de leilão
interface AuctionFormProps {
  auction: Auction | null;
  onSave: (data: AuctionFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const AuctionForm = ({ auction, onSave, onCancel, isLoading }: AuctionFormProps) => {
  const [formData, setFormData] = useState<AuctionFormData>({
    title: '',
    description: '',
    enterprise_id: 0,
    property_id: undefined,
    accommodation_id: undefined,
    start_price: 0,
    min_increment: 0,
    reserve_price: undefined,
    start_date: '',
    end_date: '',
    status: 'scheduled',
  });

  useEffect(() => {
    if (auction) {
      setFormData({
        title: auction.title || '',
        description: auction.description || '',
        enterprise_id: auction.enterprise_id || 0,
        property_id: auction.property_id,
        accommodation_id: auction.accommodation_id,
        start_price: auction.start_price || 0,
        min_increment: auction.min_increment || 0,
        reserve_price: auction.reserve_price,
        start_date: auction.start_date ? new Date(auction.start_date).toISOString().slice(0, 16) : '',
        end_date: auction.end_date ? new Date(auction.end_date).toISOString().slice(0, 16) : '',
        status: auction.status || 'scheduled',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        enterprise_id: 0,
        property_id: undefined,
        accommodation_id: undefined,
        start_price: 0,
        min_increment: 0,
        reserve_price: undefined,
        start_date: '',
        end_date: '',
        status: 'scheduled',
      });
    }
  }, [auction]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'start_price' || name === 'min_increment' || name === 'reserve_price' || name === 'enterprise_id' || name === 'property_id' || name === 'accommodation_id'
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
          placeholder="Ex: Leilão de Suíte Premium - Hotel XYZ"
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
          placeholder="Descreva o leilão, incluindo detalhes da acomodação..."
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
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="start_price">Preço Inicial (R$) *</Label>
          <Input
            id="start_price"
            name="start_price"
            type="number"
            step="0.01"
            min="0"
            value={formData.start_price}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="min_increment">Incremento Mínimo (R$) *</Label>
          <Input
            id="min_increment"
            name="min_increment"
            type="number"
            step="0.01"
            min="0"
            value={formData.min_increment}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="reserve_price">Preço de Reserva (R$)</Label>
          <Input
            id="reserve_price"
            name="reserve_price"
            type="number"
            step="0.01"
            min="0"
            value={formData.reserve_price || ''}
            onChange={handleChange}
            placeholder="Opcional"
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
            <SelectItem value="finished">Finalizado</SelectItem>
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
          {auction ? 'Atualizar' : 'Criar'} Leilão
        </Button>
      </DialogFooter>
    </form>
  );
};

// Sub-componente para configuração de regras
const AuctionRulesConfig = () => {
  const [antiSniping, setAntiSniping] = useState(true);
  const [autoExtend, setAutoExtend] = useState(true);
  const [maxDuration, setMaxDuration] = useState(24);
  const [paymentWindow, setPaymentWindow] = useState(5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Gavel className="w-5 h-5" />
          Regras de Leilão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Configure as regras gerais para todos os leilões ou defina regras específicas por leilão.
        </p>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="anti-sniping">Anti-Sniping</Label>
            <p className="text-xs text-gray-500">Estende o tempo no último minuto se houver lance</p>
          </div>
          <Switch id="anti-sniping" checked={antiSniping} onCheckedChange={setAntiSniping} />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-extend">Extensão Automática</Label>
            <p className="text-xs text-gray-500">Estende o leilão se não houver lances</p>
          </div>
          <Switch id="auto-extend" checked={autoExtend} onCheckedChange={setAutoExtend} />
        </div>
        <div>
          <Label htmlFor="max-duration">Duração Máxima Padrão (horas)</Label>
          <Input
            id="max-duration"
            type="number"
            value={maxDuration}
            onChange={(e) => setMaxDuration(parseInt(e.target.value) || 24)}
            min="1"
            max="168"
          />
        </div>
        <div>
          <Label htmlFor="payment-window">Janela de Pagamento (minutos após vencer)</Label>
          <Input
            id="payment-window"
            type="number"
            value={paymentWindow}
            onChange={(e) => setPaymentWindow(parseInt(e.target.value) || 5)}
            min="1"
            max="60"
          />
        </div>
        <Button className="w-full">
          <Save className="w-4 h-4 mr-2" />
          Salvar Regras
        </Button>
      </CardContent>
    </Card>
  );
};

// Sub-componente para visualização ao vivo
const AuctionLiveView = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Visualização ao Vivo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Monitore os leilões ativos em tempo real. Os dados são atualizados automaticamente.
        </p>
        <div className="flex items-center justify-center h-32 bg-gray-100 rounded-md text-gray-500">
          <Info className="w-6 h-6 mr-2" />
          <span>Dados ao vivo aparecerão aqui quando houver leilões ativos.</span>
        </div>
        <p className="text-xs text-gray-500 text-center">
          Esta funcionalidade requer conexão WebSocket ativa.
        </p>
      </CardContent>
    </Card>
  );
};

// Componente principal
export default function AuctionManagement() {
  const { auctions, loading, error, loadAuctions, createAuction, updateAuction, deleteAuction } = useAuctionsAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAuction, setEditingAuction] = useState<Auction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAuctions();
  }, [loadAuctions]);

  const handleCreateClick = () => {
    setEditingAuction(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (auction: Auction) => {
    setEditingAuction(auction);
    setIsModalOpen(true);
  };

  const handleSave = async (formData: AuctionFormData) => {
    try {
      if (editingAuction) {
        await updateAuction(editingAuction.id, formData);
        toast.success('Leilão atualizado com sucesso!');
      } else {
        await createAuction(formData);
        toast.success('Leilão criado com sucesso!');
      }
      setIsModalOpen(false);
      setEditingAuction(null);
      loadAuctions();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(`Erro ao salvar leilão: ${errorMessage}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar este leilão?')) {
      try {
        await deleteAuction(id);
        toast.success('Leilão deletado com sucesso!');
        loadAuctions();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        toast.error(`Erro ao deletar leilão: ${errorMessage}`);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      scheduled: { label: 'Agendado', variant: 'outline' },
      active: { label: 'Ativo', variant: 'default' },
      finished: { label: 'Finalizado', variant: 'secondary' },
      cancelled: { label: 'Cancelado', variant: 'destructive' },
    };
    const statusInfo = statusMap[status] || { label: status, variant: 'outline' };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const filteredAuctions = auctions.filter(
    (auction) =>
      auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (auction.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error && auctions.length === 0) {
    return (
      <div className="text-red-500 p-4 bg-red-50 rounded-lg">
        Erro ao carregar leilões: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Lista de Leilões</TabsTrigger>
          <TabsTrigger value="rules">Regras</TabsTrigger>
          <TabsTrigger value="live">Ao Vivo</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Gavel className="w-6 h-6" />
                Gerenciamento de Leilões
              </CardTitle>
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleCreateClick}>
                    <PlusCircle className="w-4 h-4 mr-2" /> Novo Leilão
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingAuction ? 'Editar Leilão' : 'Criar Novo Leilão'}</DialogTitle>
                    <DialogDescription>
                      {editingAuction
                        ? 'Edite os detalhes do leilão existente.'
                        : 'Preencha os detalhes para criar um novo leilão.'}
                    </DialogDescription>
                  </DialogHeader>
                  <AuctionForm
                    auction={editingAuction}
                    onSave={handleSave}
                    onCancel={() => {
                      setIsModalOpen(false);
                      setEditingAuction(null);
                    }}
                    isLoading={loading}
                  />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Crie, edite e gerencie os leilões de acomodações.
              </p>

              <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar leilões..."
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

              {loading && auctions.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : filteredAuctions.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Gavel className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchTerm ? 'Nenhum leilão encontrado com o termo de busca.' : 'Nenhum leilão encontrado.'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredAuctions.map((auction) => (
                    <Card key={auction.id} className="relative hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{auction.title}</CardTitle>
                          {getStatusBadge(auction.status)}
                        </div>
                        {auction.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">{auction.description}</p>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>Início: {new Date(auction.start_date).toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>Fim: {new Date(auction.end_date).toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center text-lg font-semibold text-primary">
                          <DollarSign className="w-5 h-5 mr-1" />
                          <span>R$ {auction.start_price.toFixed(2)}</span>
                        </div>
                        {auction.current_price > auction.start_price && (
                          <div className="flex items-center text-sm text-green-600">
                            <DollarSign className="w-4 h-4 mr-1" />
                            <span>Lance Atual: R$ {auction.current_price.toFixed(2)}</span>
                          </div>
                        )}
                        {auction.total_bids !== undefined && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="w-4 h-4 mr-1" />
                            <span>{auction.total_bids} lance(s)</span>
                          </div>
                        )}
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(auction)}
                            className="flex-1"
                          >
                            <Edit className="w-4 h-4 mr-1" /> Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(auction.id)}
                            className="flex-1"
                          >
                            <Trash2 className="w-4 h-4 mr-1" /> Deletar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules">
          <AuctionRulesConfig />
        </TabsContent>

        <TabsContent value="live">
          <AuctionLiveView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
