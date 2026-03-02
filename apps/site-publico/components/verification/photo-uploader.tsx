"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/providers/toast-wrapper';
import { Upload, X, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface PhotoUploaderProps {
  onUploadComplete?: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  label?: string;
}

export function PhotoUploader({
  onUploadComplete,
  maxFiles = 10,
  maxSizeMB = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  label = 'Fotos da Propriedade',
}: PhotoUploaderProps) {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    // Validate file count
    if (files.length + selectedFiles.length > maxFiles) {
      toast({
        title: 'Erro',
        description: `Você pode enviar no máximo ${maxFiles} arquivos`,
        variant: 'destructive',
      });
      return;
    }

    // Validate file types and sizes
    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    selectedFiles.forEach((file) => {
      if (!acceptedTypes.includes(file.type)) {
        toast({
          title: 'Erro',
          description: `Tipo de arquivo não suportado: ${file.name}. Use: ${acceptedTypes.join(', ')}`,
          variant: 'destructive',
        });
        return;
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        toast({
          title: 'Erro',
          description: `Arquivo muito grande: ${file.name}. Tamanho máximo: ${maxSizeMB}MB`,
          variant: 'destructive',
        });
        return;
      }

      validFiles.push(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          validPreviews.push(e.target.result as string);
          if (validPreviews.length === validFiles.length) {
            setPreviews((prev) => [...prev, ...validPreviews]);
          }
        }
      };
      reader.readAsDataURL(file);
    });

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: 'Erro',
        description: 'Selecione pelo menos um arquivo',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('folder', 'verification');
      formData.append('type', 'photo');

      const response = await fetch('/api/upload/files', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Sucesso',
          description: `${result.files.length} arquivo(s) enviado(s) com sucesso`,
        });

        if (onUploadComplete) {
          onUploadComplete(files);
        }
      } else {
        toast({
          title: 'Erro',
          description: result.error || 'Erro ao enviar arquivos',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao enviar arquivos',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>{label}</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Envie até {maxFiles} fotos (máximo {maxSizeMB}MB cada)
        </p>
        <div className="flex gap-2">
          <Input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={files.length >= maxFiles}
          >
            <Upload className="h-4 w-4 mr-2" />
            Selecionar Fotos
          </Button>
          {files.length > 0 && (
            <Button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <LoadingSpinner />
                  Enviando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Enviar {files.length} Foto(s)
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border bg-muted">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {(files[index]?.size || 0) / 1024 / 1024 < 1
                  ? `${((files[index]?.size || 0) / 1024).toFixed(0)}KB`
                  : `${((files[index]?.size || 0) / 1024 / 1024).toFixed(1)}MB`}
              </div>
            </div>
          ))}
        </div>
      )}

      {files.length === 0 && (
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">
            Nenhuma foto selecionada. Clique em "Selecionar Fotos" para começar.
          </p>
        </div>
      )}
    </div>
  );
}

