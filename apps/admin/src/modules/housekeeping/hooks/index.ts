import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { housekeepingApi } from '../api/housekeeping.api';

export function useRooms() {
  return useQuery({ queryKey: ['housekeeping', 'rooms'], queryFn: housekeepingApi.listRooms });
}

export function useFloorMap() {
  return useQuery({ queryKey: ['housekeeping', 'floor-map'], queryFn: housekeepingApi.getFloorMap });
}

export function useHousekeepingDashboard() {
  return useQuery({ queryKey: ['housekeeping', 'dashboard'], queryFn: housekeepingApi.getDashboard });
}

export function useTasks() {
  return useQuery({ queryKey: ['housekeeping', 'tasks'], queryFn: housekeepingApi.listTasks });
}

export function useTask(id?: string) {
  return useQuery({ queryKey: ['housekeeping', 'tasks', id], queryFn: () => housekeepingApi.getTask(String(id)), enabled: Boolean(id) });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: housekeepingApi.createTask,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['housekeeping'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => housekeepingApi.updateTask(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['housekeeping'] });
    },
  });
}

export function useMaintenance() {
  return useQuery({ queryKey: ['housekeeping', 'maintenance'], queryFn: housekeepingApi.listMaintenance });
}

export function useChecklists() {
  return useQuery({ queryKey: ['housekeeping', 'checklists'], queryFn: housekeepingApi.listChecklists });
}

export function useHousekeepingStats() {
  return useQuery({ queryKey: ['housekeeping', 'stats'], queryFn: housekeepingApi.getStats });
}
