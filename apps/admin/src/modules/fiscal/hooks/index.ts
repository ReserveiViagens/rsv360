import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fiscalApi } from '../api/fiscal.api';

export function useInvoices() {
  return useQuery({ queryKey: ['fiscal', 'invoices'], queryFn: fiscalApi.listInvoices });
}

export function useInvoice(id?: string) {
  return useQuery({ queryKey: ['fiscal', 'invoices', id], queryFn: () => fiscalApi.getInvoice(String(id)), enabled: Boolean(id) });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fiscalApi.createInvoice,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['fiscal'] });
    },
  });
}

export function useFNRH() {
  return useQuery({ queryKey: ['fiscal', 'fnrh'], queryFn: fiscalApi.listFNRH });
}

export function useFNRHRecord(id?: string) {
  return useQuery({ queryKey: ['fiscal', 'fnrh', id], queryFn: () => fiscalApi.getFNRH(String(id)), enabled: Boolean(id) });
}

export function useLGPDConsents(guestId?: string) {
  return useQuery({ queryKey: ['fiscal', 'lgpd', 'consents', guestId], queryFn: () => fiscalApi.listConsents(String(guestId)), enabled: Boolean(guestId) });
}

export function useLGPDRequests() {
  return useQuery({ queryKey: ['fiscal', 'lgpd', 'requests'], queryFn: fiscalApi.listRequests });
}

export function useLGPDAudit() {
  return useQuery({ queryKey: ['fiscal', 'lgpd', 'audit'], queryFn: fiscalApi.auditLog });
}

export function useFiscalStats() {
  return useQuery({ queryKey: ['fiscal', 'stats'], queryFn: fiscalApi.stats });
}
