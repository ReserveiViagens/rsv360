import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cloudApi } from '../api/cloud.api';

export function useCloudFiles() {
  return useQuery({ queryKey: ['cloud', 'files'], queryFn: cloudApi.listFiles });
}

export function useCloudUsage() {
  return useQuery({ queryKey: ['cloud', 'usage'], queryFn: cloudApi.getUsage });
}

export function useUploadFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cloudApi.upload,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['cloud'] });
    },
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cloudApi.deleteFile,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['cloud'] });
    },
  });
}
