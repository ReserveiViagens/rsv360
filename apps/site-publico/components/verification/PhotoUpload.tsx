/**
 * ✅ FASE 6.2: PhotoUpload Component
 * 
 * Componente para upload de fotos com drag & drop
 */

'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onPhotosSelected: (photos: File[]) => void;
  maxPhotos?: number;
  minPhotos?: number;
  accept?: string;
}

export function PhotoUpload({ 
  onPhotosSelected, 
  maxPhotos = 10,
  minPhotos = 1,
  accept = 'image/*'
}: Props) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...selectedFiles, ...acceptedFiles].slice(0, maxPhotos);
    setSelectedFiles(newFiles);
    
    // Gerar previews
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
    
    onPhotosSelected(newFiles);
  }, [selectedFiles, maxPhotos, onPhotosSelected]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept === 'image/*' ? { 'image/*': [] } : undefined,
    maxFiles: maxPhotos
  });
  
  const removePhoto = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    // Liberar URLs de preview
    URL.revokeObjectURL(previews[index]);
    
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    onPhotosSelected(newFiles);
  };
  
  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${selectedFiles.length >= maxPhotos ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        
        {isDragActive ? (
          <p>Solte as fotos aqui...</p>
        ) : (
          <div>
            <p className="text-lg mb-2">
              Arraste fotos ou clique para selecionar
            </p>
            <p className="text-sm text-gray-500">
              {minPhotos > 1 && `Mínimo: ${minPhotos} fotos | `}
              Máximo: {maxPhotos} fotos
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {selectedFiles.length} / {maxPhotos} selecionadas
            </p>
          </div>
        )}
      </div>
      
      {selectedFiles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              {accept === 'image/*' ? (
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded"
                />
              ) : (
                <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                  <span className="ml-2 text-sm">{selectedFiles[index].name}</span>
                </div>
              )}
              
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full
                  opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

