import { api } from '@/src/lib/api';
import type { FileItem, UsageStats } from '../types';

type ApiList<T> = T[] | { data?: T[]; items?: T[] };
const unwrap = <T,>(response: ApiList<T>) => (Array.isArray(response) ? response : response.data ?? response.items ?? []);

export const cloudApi = {
  upload: (payload: FormData) =>
    apiFetchFormData<FileItem>('/api/cloud/upload', payload),
  uploadMultiple: (payload: FormData) =>
    apiFetchFormData<FileItem[]>('/api/cloud/upload/multiple', payload),
  listFiles: async () => unwrap(await api.get<ApiList<FileItem>>('/api/cloud/files')),
  getFile: (id: string | number) => api.get<FileItem>(`/api/cloud/files/${id}`),
  deleteFile: (id: string | number) => api.delete<void>(`/api/cloud/files/${id}`),
  downloadFile: (id: string | number) => api.get<string>(`/api/cloud/files/${id}/download`),
  getUsage: () => api.get<UsageStats>('/api/cloud/usage'),
};

async function apiFetchFormData<T>(path: string, body: FormData): Promise<T> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}${path}`, {
    method: 'POST',
    body,
    headers: {
      Authorization: `Bearer ${typeof window !== 'undefined' ? window.localStorage.getItem('token') || '' : ''}`,
      'X-Property-Id': typeof window !== 'undefined' ? window.localStorage.getItem('propertyId') || '1' : '1',
    },
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}`);
  }

  return response.json();
}
