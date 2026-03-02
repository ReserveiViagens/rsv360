'use client';

/**
 * Componente: Formulário de Vistoria
 * Permite criar vistorias antes e depois do check-in/check-out
 */

import { useState } from 'react';
import { Camera, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface InspectionFormProps {
  checkinId: number;
  inspectionType: 'before_checkin' | 'after_checkout';
  onSuccess?: (inspection: any) => void;
}

const CONDITION_OPTIONS = [
  { value: 'excellent', label: 'Excelente', color: 'bg-green-500' },
  { value: 'good', label: 'Bom', color: 'bg-blue-500' },
  { value: 'fair', label: 'Regular', color: 'bg-yellow-500' },
  { value: 'poor', label: 'Ruim', color: 'bg-red-500' }
];

export function InspectionForm({ 
  checkinId, 
  inspectionType, 
  onSuccess 
}: InspectionFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    condition: '',
    notes: '',
    damages: '',
    missing_items: '',
    photos: [] as string[] // URLs de fotos (em produção, seriam arquivos)
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Você precisa estar autenticado');
      }

      const response = await fetch(`/api/checkin/${checkinId}/inspection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          checkin_id: checkinId,
          inspection_type: inspectionType,
          condition: formData.condition,
          notes: formData.notes,
          damages: formData.damages || null,
          missing_items: formData.missing_items || null,
          photos: formData.photos
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar vistoria');
      }

      const result = await response.json();
      setSuccess(true);

      if (onSuccess) {
        onSuccess(result.data);
      }

      // Reset form
      setFormData({
        condition: '',
        notes: '',
        damages: '',
        missing_items: '',
        photos: []
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          {inspectionType === 'before_checkin' ? 'Vistoria Pré-Check-in' : 'Vistoria Pós-Check-out'}
        </CardTitle>
        <CardDescription>
          {inspectionType === 'before_checkin' 
            ? 'Registre o estado da propriedade antes do check-in'
            : 'Registre o estado da propriedade após o check-out'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Vistoria registrada com sucesso!
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="condition">Estado Geral da Propriedade *</Label>
            <Select
              value={formData.condition}
              onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                {CONDITION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <Badge className={option.color}>{option.label}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {inspectionType === 'after_checkout' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="damages">Danos Identificados</Label>
                <Textarea
                  id="damages"
                  placeholder="Descreva quaisquer danos encontrados..."
                  value={formData.damages}
                  onChange={(e) => setFormData(prev => ({ ...prev, damages: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="missing_items">Itens Faltando</Label>
                <Textarea
                  id="missing_items"
                  placeholder="Liste itens que estão faltando..."
                  value={formData.missing_items}
                  onChange={(e) => setFormData(prev => ({ ...prev, missing_items: e.target.value }))}
                  rows={3}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Observações *</Label>
            <Textarea
              id="notes"
              placeholder="Adicione observações sobre a vistoria..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Fotos</Label>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // Em produção, abrir seletor de arquivos/câmera
                alert('Funcionalidade de upload de fotos será implementada');
              }}
            >
              <Camera className="mr-2 h-4 w-4" />
              Adicionar Fotos
            </Button>
            <p className="text-xs text-muted-foreground">
              {formData.photos.length} foto(s) adicionada(s)
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !formData.condition || !formData.notes}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Registrar Vistoria
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

