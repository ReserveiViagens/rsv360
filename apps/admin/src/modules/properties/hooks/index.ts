import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { propertiesApi } from '../api/properties.api';

export function useProperties() {
  return useQuery({ queryKey: ['properties', 'list'], queryFn: propertiesApi.list });
}

export function useProperty(id?: string) {
  return useQuery({ queryKey: ['properties', 'detail', id], queryFn: () => propertiesApi.get(String(id)), enabled: Boolean(id) });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: propertiesApi.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => propertiesApi.update(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

export function usePropertyUsers(id?: string) {
  return useQuery({ queryKey: ['properties', 'users', id], queryFn: () => propertiesApi.listUsers(String(id)), enabled: Boolean(id) });
}

export function useConsolidatedStats() {
  return useQuery({ queryKey: ['properties', 'consolidated'], queryFn: propertiesApi.consolidated });
}
