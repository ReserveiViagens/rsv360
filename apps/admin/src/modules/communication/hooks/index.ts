import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { communicationApi } from '../api/communication.api';

export function useTemplates() {
  return useQuery({ queryKey: ['communication', 'templates'], queryFn: communicationApi.listTemplates });
}

export function useTemplate(id?: string) {
  return useQuery({ queryKey: ['communication', 'templates', id], queryFn: () => communicationApi.getTemplate(String(id)), enabled: Boolean(id) });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: communicationApi.createTemplate,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['communication', 'templates'] });
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => communicationApi.updateTemplate(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['communication', 'templates'] });
    },
  });
}

export function useMessages() {
  return useQuery({ queryKey: ['communication', 'messages'], queryFn: communicationApi.listMessages });
}

export function useMessage(id?: string) {
  return useQuery({ queryKey: ['communication', 'messages', id], queryFn: () => communicationApi.getMessage(String(id)), enabled: Boolean(id) });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: communicationApi.sendMessage,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['communication', 'messages'] });
      await queryClient.invalidateQueries({ queryKey: ['communication', 'stats'] });
    },
  });
}

export function useAutomations() {
  return useQuery({ queryKey: ['communication', 'automations'], queryFn: communicationApi.listAutomations });
}

export function useCreateAutomation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: communicationApi.createAutomation,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['communication', 'automations'] });
    },
  });
}

export function useToggleAutomation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) => communicationApi.updateAutomation(id, { enabled }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['communication', 'automations'] });
    },
  });
}

export function useChannels() {
  return useQuery({ queryKey: ['communication', 'channels'], queryFn: communicationApi.getChannels });
}

export function useUpdateChannel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ channel, payload }: { channel: string; payload: Record<string, unknown> }) => communicationApi.updateChannel(channel, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['communication', 'channels'] });
    },
  });
}

export function useCommStats() {
  return useQuery({ queryKey: ['communication', 'stats'], queryFn: communicationApi.getStats });
}
