"use client"

import { useState, useRef } from "react"
import { Camera, X, Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getToken } from "@/lib/auth"
import Image from "next/image"

interface ProfileImageUploadProps {
  type: 'avatar' | 'logo' | 'profile'
  currentUrl?: string
  onUploadComplete?: (url: string) => void
  label?: string
}

export function ProfileImageUpload({ 
  type, 
  currentUrl, 
  onUploadComplete,
  label 
}: ProfileImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl || null)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      setError('Tipo de arquivo não permitido. Use: JPEG, PNG, WEBP ou GIF')
      return
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Arquivo muito grande. Máximo: 5MB')
      return
    }

    // Preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload
    await handleUpload(file)
  }

  const handleUpload = async (file: File) => {
    setUploading(true)
    setError("")

    try {
      const token = getToken()
      if (!token) {
        setError("Você precisa estar logado")
        return
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch('/api/users/profile/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setPreview(result.data.url)
        onUploadComplete?.(result.data.url)
      } else {
        setError(result.error || 'Erro ao fazer upload')
      }
    } catch (error: any) {
      setError(error.message || 'Erro ao fazer upload')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Se não tiver label, renderizar apenas o botão compacto (para uso no header)
  if (!label) {
    return (
      <>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
        <Button
          type="button"
          size="sm"
          className="rounded-full p-2 bg-blue-500 hover:bg-blue-600 text-white border-2 border-white shadow-lg"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Alterar foto de perfil"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Camera className="w-4 h-4" />
          )}
        </Button>
        {error && (
          <div className="absolute top-full left-0 mt-2 p-2 bg-red-100 border border-red-300 rounded text-xs text-red-700 whitespace-nowrap z-50">
            {error}
          </div>
        )}
      </>
    )
  }

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      
      <div className="flex items-center gap-4">
        <div className="relative">
          {preview ? (
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
              />
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
              <Camera className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  {preview ? 'Alterar' : 'Upload'}
                </>
              )}
            </Button>

            {preview && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemove}
                disabled={uploading}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>
      </div>
    </div>
  )
}

