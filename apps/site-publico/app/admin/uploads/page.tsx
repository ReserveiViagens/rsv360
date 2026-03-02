"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function UploadsManagerPage() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
  const [images, setImages] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Obter token de autenticação
  const getAuthToken = () => {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('admin_token='));
    if (tokenCookie) {
      const token = tokenCookie.split('=')[1];
      if (token) return `Bearer ${token}`;
    }
    const tokenFromStorage = localStorage.getItem('admin_token');
    return tokenFromStorage ? `Bearer ${tokenFromStorage}` : 'Bearer admin-token-123';
  };

  const load = async () => {
    setLoading(true);
    try {
      const authHeader = { Authorization: getAuthToken() };
      const [imgRes, vidRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/upload/images`, { headers: authHeader }),
        fetch(`${API_BASE_URL}/api/upload/videos`, { headers: authHeader }),
      ]);
      const img = await imgRes.json();
      const vid = await vidRes.json();
      setImages(img.images || []);
      setVideos(vid.videos || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const removeImage = async (filename: string) => {
    await fetch(`${API_BASE_URL}/api/upload/images/${filename}`, { method: 'DELETE', headers: { Authorization: getAuthToken() } });
    load();
  };

  const removeVideo = async (filename: string) => {
    await fetch(`${API_BASE_URL}/api/upload/videos/${filename}`, { method: 'DELETE', headers: { Authorization: getAuthToken() } });
    load();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Gerenciar Uploads</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Imagens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((img) => (
                <div key={img.filename} className="space-y-2">
                  <img src={`${API_BASE_URL}${img.thumbnailUrl || img.url}`} alt={img.filename} className="w-full h-32 object-cover rounded" />
                  <Button size="sm" variant="destructive" onClick={() => removeImage(img.filename)}>Excluir</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vídeos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videos.map((v) => (
                <div key={v.filename} className="space-y-2">
                  {v.thumbnailUrl ? (
                    <img src={`${API_BASE_URL}${v.thumbnailUrl}`} alt={v.filename} className="w-full h-32 object-cover rounded" />
                  ) : (
                    <video src={`${API_BASE_URL}${v.url}`} className="w-full h-32 object-cover rounded" />
                  )}
                  <Button size="sm" variant="destructive" onClick={() => removeVideo(v.filename)}>Excluir</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
