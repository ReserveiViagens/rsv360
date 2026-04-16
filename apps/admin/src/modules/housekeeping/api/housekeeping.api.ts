import { api } from '@/src/lib/api';
import type { ChecklistTemplate, HousekeepingStats, MaintenanceItem, RoomItem, TaskItem } from '../types';

type ApiList<T> = T[] | { data?: T[]; items?: T[] };
const unwrap = <T,>(response: ApiList<T>) => (Array.isArray(response) ? response : response.data ?? response.items ?? []);

export const housekeepingApi = {
  listRooms: async () => unwrap(await api.get<ApiList<RoomItem>>('/api/housekeeping/rooms')),
  updateRoomStatus: (id: number | string, status: string) => api.put<RoomItem>(`/api/housekeeping/rooms/${id}/status`, { status }),
  bulkRoomStatus: (payload: Record<string, unknown>) => api.post('/api/housekeeping/rooms/bulk-status', payload),
  getFloorMap: async () => {
    const response = await api.get<RoomItem[] | { floors?: RoomItem[] }>('/api/housekeeping/rooms/floor-map');
    return Array.isArray(response) ? response : response.floors ?? [];
  },
  getDashboard: () => api.get<HousekeepingStats>('/api/housekeeping/rooms/dashboard'),

  listTasks: async () => unwrap(await api.get<ApiList<TaskItem>>('/api/housekeeping/tasks')),
  getTask: (id: number | string) => api.get<TaskItem>(`/api/housekeeping/tasks/${id}`),
  createTask: (payload: Partial<TaskItem>) => api.post<TaskItem>('/api/housekeeping/tasks', payload),
  updateTask: (id: number | string, payload: Partial<TaskItem>) => api.put<TaskItem>(`/api/housekeeping/tasks/${id}`, payload),
  assignTask: (id: number | string, payload: Record<string, unknown>) => api.post(`/api/housekeeping/tasks/${id}/assign`, payload),
  startTask: (id: number | string) => api.post(`/api/housekeeping/tasks/${id}/start`, {}),
  completeTask: (id: number | string) => api.post(`/api/housekeeping/tasks/${id}/complete`, {}),
  inspectTask: (id: number | string) => api.post(`/api/housekeeping/tasks/${id}/inspect`, {}),

  listMaintenance: async () => unwrap(await api.get<ApiList<MaintenanceItem>>('/api/housekeeping/maintenance')),
  getMaintenance: (id: number | string) => api.get<MaintenanceItem>(`/api/housekeeping/maintenance/${id}`),
  createMaintenance: (payload: Partial<MaintenanceItem>) => api.post<MaintenanceItem>('/api/housekeeping/maintenance', payload),
  updateMaintenance: (id: number | string, payload: Partial<MaintenanceItem>) => api.put<MaintenanceItem>(`/api/housekeeping/maintenance/${id}`, payload),

  listChecklists: async () => unwrap(await api.get<ApiList<ChecklistTemplate>>('/api/housekeeping/checklists')),
  createChecklist: (payload: Partial<ChecklistTemplate>) => api.post<ChecklistTemplate>('/api/housekeeping/checklists', payload),

  getStats: () => api.get<HousekeepingStats>('/api/housekeeping/stats'),
};
