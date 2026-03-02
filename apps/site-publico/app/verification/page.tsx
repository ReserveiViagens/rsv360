"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/providers/toast-wrapper';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Upload } from 'lucide-react';
import { PhotoUploader } from '@/components/verification/photo-uploader';

interface Verification {
  id: number;
  property_id: number;
  property_title?: string;
  submitted_by: number;
  status: 'pending' | 'approved' | 'rejected';
  documents: any;
  photos: any;
  notes?: string;
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: number;
}

export default function VerificationPage() {
  const { user, authenticatedFetch } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [propertyId, setPropertyId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);

  const loadVerifications = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch('/api/verification/pending?limit=50');
      const result = await response.json();

      if (result.success) {
        setVerifications(result.data || []);
      }
    } catch (error: any) {
      console.error('Erro ao carregar verificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitVerification = async () => {
    if (!propertyId) {
      toast({
        title: 'Erro',
        description: 'ID da propriedade é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await authenticatedFetch('/api/verification/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: parseInt(propertyId),
          notes: notes || undefined,
          documents: uploadedDocuments || [],
          photos: uploadedPhotos || [],
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Sucesso',
          description: 'Solicitação de verificação enviada com sucesso',
        });
        setShowForm(false);
        setPropertyId('');
        setNotes('');
        setUploadedPhotos([]);
        setUploadedDocuments([]);
        setPhotoFiles([]);
        setDocumentFiles([]);
        loadVerifications();
      } else {
        toast({
          title: 'Erro',
          description: result.error || 'Erro ao enviar solicitação',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao enviar solicitação',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadVerifications();
    }
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Aprovado
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rejeitado
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        );
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Verificação de Propriedades</h1>
          <p className="text-muted-foreground">
            Solicite verificação para suas propriedades ou gerencie solicitações pendentes
          </p>
        </div>
        {user?.role === 'admin' ? null : (
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : 'Nova Solicitação'}
          </Button>
        )}
      </div>

      {showForm && user?.role !== 'admin' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Nova Solicitação de Verificação</CardTitle>
            <CardDescription>
              Envie documentos e fotos para verificar sua propriedade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="property_id">ID da Propriedade</Label>
              <Input
                id="property_id"
                type="number"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                placeholder="Ex: 1"
              />
            </div>
            <div>
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicione informações adicionais sobre a propriedade..."
                rows={4}
              />
            </div>
            <div>
              <Label>Fotos da Propriedade</Label>
              <PhotoUploader
                onUploadComplete={(files) => {
                  setPhotoFiles(files);
                  // Extrair URLs dos arquivos enviados
                  files.forEach(async (file) => {
                    const formData = new FormData();
                    formData.append('files', file);
                    formData.append('folder', 'verification');
                    formData.append('type', 'photo');
                    try {
                      const uploadRes = await authenticatedFetch('/api/upload/files', {
                        method: 'POST',
                        body: formData,
                      });
                      const uploadResult = await uploadRes.json();
                      if (uploadResult.success && uploadResult.files) {
                        setUploadedPhotos((prev) => [
                          ...prev,
                          ...uploadResult.files.map((f: any) => f.url),
                        ]);
                      }
                    } catch (error) {
                      console.error('Erro ao fazer upload:', error);
                    }
                  });
                }}
                maxFiles={10}
                label="Fotos da Propriedade"
              />
            </div>
            <div>
              <Label>Documentos (PDF, DOC, DOCX)</Label>
              <PhotoUploader
                onUploadComplete={(files) => {
                  setDocumentFiles(files);
                  // Extrair URLs dos arquivos enviados
                  files.forEach(async (file) => {
                    const formData = new FormData();
                    formData.append('files', file);
                    formData.append('folder', 'verification');
                    formData.append('type', 'document');
                    try {
                      const uploadRes = await authenticatedFetch('/api/upload/files', {
                        method: 'POST',
                        body: formData,
                      });
                      const uploadResult = await uploadRes.json();
                      if (uploadResult.success && uploadResult.files) {
                        setUploadedDocuments((prev) => [
                          ...prev,
                          ...uploadResult.files.map((f: any) => f.url),
                        ]);
                      }
                    } catch (error) {
                      console.error('Erro ao fazer upload:', error);
                    }
                  });
                }}
                maxFiles={5}
                maxSizeMB={10}
                acceptedTypes={['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
                label="Documentos"
              />
            </div>
            <Button onClick={submitVerification} disabled={submitting} className="w-full">
              {submitting ? <LoadingSpinner /> : 'Enviar Solicitação'}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {user?.role === 'admin' ? 'Solicitações Pendentes' : 'Minhas Solicitações'}
          </CardTitle>
          <CardDescription>
            {user?.role === 'admin'
              ? 'Aprove ou rejeite solicitações de verificação'
              : 'Acompanhe o status das suas solicitações'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <LoadingSpinner />
            </div>
          ) : verifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma solicitação encontrada
            </div>
          ) : (
            <div className="space-y-4">
              {verifications.map((verification) => (
                <div
                  key={verification.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">
                        Propriedade #{verification.property_id}
                        {verification.property_title && ` - ${verification.property_title}`}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Enviado em {new Date(verification.submitted_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    {getStatusBadge(verification.status)}
                  </div>
                  {verification.notes && (
                    <p className="text-sm text-muted-foreground mt-2">{verification.notes}</p>
                  )}
                  {verification.reviewed_at && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Revisado em {new Date(verification.reviewed_at).toLocaleString('pt-BR')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

