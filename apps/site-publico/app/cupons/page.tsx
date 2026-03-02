/**
 * ✅ ITEM 72: FRONTEND DE CUPONS/DESCONTOS
 * Interface de gestão, aplicação e histórico
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/providers/toast-wrapper';
import { Plus, Search, Copy, Check, X, Calendar, Tag, DollarSign } from 'lucide-react';

interface Coupon {
  id: number;
  code: string;
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed' | 'free_night';
  discount_value: number;
  valid_from: string;
  valid_until: string;
  min_purchase_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  usage_limit_per_user?: number;
  is_active: boolean;
  is_public: boolean;
  total_uses: number;
  total_discount_given: number;
}

interface CouponUsage {
  id: number;
  code_used: string;
  discount_applied: number;
  original_amount: number;
  final_amount: number;
  used_at: string;
  booking_id?: number;
}

export default function CuponsPage() {
  const { success, error: showError } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [usageHistory, setUsageHistory] = useState<CouponUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed' | 'free_night',
    discount_value: 0,
    valid_from: '',
    valid_until: '',
    min_purchase_amount: 0,
    max_discount_amount: 0,
    usage_limit: 0,
    usage_limit_per_user: 1,
    is_active: true,
    is_public: true,
  });

  // Apply coupon states
  const [applyData, setApplyData] = useState({
    code: '',
    amount: 0,
    property_id: undefined as number | undefined,
  });

  useEffect(() => {
    loadCoupons();
    loadUsageHistory();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/coupons');
      const result = await response.json();
      
      if (result.success) {
        setCoupons(result.data || []);
      } else {
        showError(result.error || 'Erro ao carregar cupons');
      }
    } catch (err: any) {
      showError(err.message || 'Erro ao carregar cupons');
    } finally {
      setLoading(false);
    }
  };

  const loadUsageHistory = async () => {
    try {
      const response = await fetch('/api/coupons/usage');
      const result = await response.json();
      
      if (result.success) {
        setUsageHistory(result.data || []);
      } else {
        showError(result.error || 'Erro ao carregar histórico');
      }
    } catch (err: any) {
      console.error('Erro ao carregar histórico:', err);
      showError(err.message || 'Erro ao carregar histórico');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        success('Cupom criado com sucesso!');
        setShowCreateDialog(false);
        resetForm();
        loadCoupons();
      } else {
        showError(result.error || 'Erro ao criar cupom');
      }
    } catch (err: any) {
      showError(err.message || 'Erro ao criar cupom');
    }
  };

  const handleValidateCoupon = async () => {
    if (!applyData.code || !applyData.amount) {
      showError('Preencha o código do cupom e o valor');
      return;
    }

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applyData),
      });

      const result = await response.json();

      if (result.success && result.valid) {
        success(`Cupom válido! Desconto de R$ ${result.discount_amount?.toFixed(2)} aplicado`);
        setSelectedCoupon(result.coupon);
      } else {
        showError(result.error || 'Cupom não pode ser aplicado');
      }
    } catch (err: any) {
      showError(err.message || 'Erro ao validar cupom');
    }
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    success('Código do cupom copiado para a área de transferência');
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 0,
      valid_from: '',
      valid_until: '',
      min_purchase_amount: 0,
      max_discount_amount: 0,
      usage_limit: 0,
      usage_limit_per_user: 1,
      is_active: true,
      is_public: true,
    });
  };

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coupon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCoupons = filteredCoupons.filter(c => c.is_active);
  const inactiveCoupons = filteredCoupons.filter(c => !c.is_active);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Cupons e Descontos</h1>
          <p className="text-muted-foreground mt-1">Gerencie cupons e descontos do sistema</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Criar Cupom
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Cupom</DialogTitle>
              <DialogDescription>
                Preencha os dados para criar um novo cupom de desconto
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Código do Cupom *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="EXEMPLO10"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Desconto de 10%"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição do cupom..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discount_type">Tipo de Desconto *</Label>
                  <Select
                    value={formData.discount_type}
                    onValueChange={(value: any) => setFormData({ ...formData, discount_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentual (%)</SelectItem>
                      <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                      <SelectItem value="free_night">Noite Grátis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="discount_value">Valor do Desconto *</Label>
                  <Input
                    id="discount_value"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valid_from">Válido de *</Label>
                  <Input
                    id="valid_from"
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="valid_until">Válido até *</Label>
                  <Input
                    id="valid_until"
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min_purchase_amount">Valor Mínimo (R$)</Label>
                  <Input
                    id="min_purchase_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.min_purchase_amount}
                    onChange={(e) => setFormData({ ...formData, min_purchase_amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="max_discount_amount">Desconto Máximo (R$)</Label>
                  <Input
                    id="max_discount_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.max_discount_amount}
                    onChange={(e) => setFormData({ ...formData, max_discount_amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="usage_limit">Limite de Usos</Label>
                  <Input
                    id="usage_limit"
                    type="number"
                    min="0"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({ ...formData, usage_limit: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="usage_limit_per_user">Usos por Usuário</Label>
                  <Input
                    id="usage_limit_per_user"
                    type="number"
                    min="1"
                    value={formData.usage_limit_per_user}
                    onChange={(e) => setFormData({ ...formData, usage_limit_per_user: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">Criar Cupom</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="manage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="manage">Gerenciar</TabsTrigger>
          <TabsTrigger value="apply">Aplicar Cupom</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Cupons Disponíveis</CardTitle>
                  <CardDescription>Gerencie todos os cupons do sistema</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar cupons..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Carregando...</div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Cupons Ativos ({activeCoupons.length})</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {activeCoupons.map((coupon) => (
                        <Card key={coupon.id}>
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-lg">{coupon.name}</CardTitle>
                                <CardDescription className="flex items-center gap-2 mt-1">
                                  <Tag className="h-3 w-3" />
                                  {coupon.code}
                                </CardDescription>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => copyCouponCode(coupon.code)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Desconto:</span>
                                <span className="font-semibold">
                                  {coupon.discount_type === 'percentage' && `${coupon.discount_value}%`}
                                  {coupon.discount_type === 'fixed' && `R$ ${coupon.discount_value.toFixed(2)}`}
                                  {coupon.discount_type === 'free_night' && 'Noite Grátis'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Usos:</span>
                                <span>{coupon.total_uses} / {coupon.usage_limit || '∞'}</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Válido até:</span>
                                <span>{new Date(coupon.valid_until).toLocaleDateString('pt-BR')}</span>
                              </div>
                              <Badge variant={coupon.is_active ? 'default' : 'secondary'}>
                                {coupon.is_active ? 'Ativo' : 'Inativo'}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {inactiveCoupons.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Cupons Inativos ({inactiveCoupons.length})</h3>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {inactiveCoupons.map((coupon) => (
                          <Card key={coupon.id} className="opacity-60">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg">{coupon.name}</CardTitle>
                              <CardDescription>{coupon.code}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <Badge variant="secondary">Inativo</Badge>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredCoupons.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum cupom encontrado
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apply" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aplicar Cupom</CardTitle>
              <CardDescription>Valide e aplique um cupom de desconto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="apply_code">Código do Cupom</Label>
                <div className="flex gap-2">
                  <Input
                    id="apply_code"
                    value={applyData.code}
                    onChange={(e) => setApplyData({ ...applyData, code: e.target.value.toUpperCase() })}
                    placeholder="Digite o código do cupom"
                  />
                  <Button onClick={handleValidateCoupon}>Validar</Button>
                </div>
              </div>

              <div>
                <Label htmlFor="apply_amount">Valor da Compra (R$)</Label>
                <Input
                  id="apply_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={applyData.amount}
                  onChange={(e) => setApplyData({ ...applyData, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>

              {selectedCoupon && (
                <Card className="bg-green-50 dark:bg-green-950">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="h-5 w-5 text-green-600" />
                      <span className="font-semibold">Cupom válido!</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><strong>Cupom:</strong> {selectedCoupon.name}</p>
                      <p><strong>Desconto:</strong> R$ {selectedCoupon.discount_value?.toFixed(2)}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Uso</CardTitle>
              <CardDescription>Visualize o histórico de uso dos cupons</CardDescription>
            </CardHeader>
            <CardContent>
              {usageHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum uso registrado ainda
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Valor Original</TableHead>
                      <TableHead>Desconto</TableHead>
                      <TableHead>Valor Final</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usageHistory.map((usage) => (
                      <TableRow key={usage.id}>
                        <TableCell>{usage.code_used}</TableCell>
                        <TableCell>{new Date(usage.used_at).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>R$ {usage.original_amount.toFixed(2)}</TableCell>
                        <TableCell className="text-green-600">-R$ {usage.discount_applied.toFixed(2)}</TableCell>
                        <TableCell>R$ {usage.final_amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

