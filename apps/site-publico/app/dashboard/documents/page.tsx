'use client';

import { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  File,
  Image,
  FileSpreadsheet,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/providers/toast-wrapper';
import { getToken } from '@/lib/auth';
import { ErrorBoundary } from '@/components/ui/error-boundary';

interface DocItem {
  id: string;
  name: string;
  url: string;
  type?: string;
  size?: number;
  createdAt?: string;
}

function DocumentsPageContent() {
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const token = getToken();
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append('files', f));
      formData.append('folder', 'documents');
      formData.append('type', 'document');

      const response = await fetch('/api/upload/files', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const result = await response.json();
      if (result.success && result.files) {
        const newDocs = result.files.map((f: any) => ({
          id: f.id || f.url,
          name: f.name || f.originalName || 'Documento',
          url: f.url || f.path,
          type: f.type,
          size: f.size,
          createdAt: f.createdAt,
        }));
        setDocuments((prev) => [...newDocs, ...prev]);
        toast.success(`${result.files.length} arquivo(s) enviado(s) com sucesso`);
      } else {
        throw new Error(result.error || 'Erro ao enviar');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar documentos');
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return Image;
    if (['xlsx', 'xls', 'csv'].includes(ext || '')) return FileSpreadsheet;
    return FileText;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Documentos</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Contratos, comprovantes e outros arquivos
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Enviar documentos</CardTitle>
            <CardDescription>
              Arraste arquivos aqui ou clique para selecionar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleUpload(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                transition-colors
                ${dragOver ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'}
                ${uploading ? 'opacity-60 pointer-events-none' : ''}
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleUpload(e.target.files)}
              />
              {uploading ? (
                <p className="text-muted-foreground">Enviando...</p>
              ) : (
                <>
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Clique ou arraste arquivos (PDF, imagens, Excel)
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documentos enviados</CardTitle>
            <CardDescription>
              {documents.length === 0
                ? 'Nenhum documento ainda'
                : `${documents.length} documento(s)`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <File className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Envie contratos, comprovantes ou outros documentos.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => {
                  const Icon = getFileIcon(doc.name);
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className="w-8 h-8 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium truncate">{doc.name}</p>
                          {doc.size && (
                            <p className="text-xs text-muted-foreground">
                              {(doc.size / 1024).toFixed(1)} KB
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a href={doc.url} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() =>
                            setDocuments((prev) => prev.filter((d) => d.id !== doc.id))
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DocumentsDashboardPage() {
  return (
    <ErrorBoundary>
      <DocumentsPageContent />
    </ErrorBoundary>
  );
}
