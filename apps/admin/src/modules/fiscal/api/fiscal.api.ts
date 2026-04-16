import { api } from '@/src/lib/api';
import type { FiscalInvoice, FiscalStats, FNRHRecord, LGPDConsent, LGPDRequest, LGPDAuditLog } from '../types';

type ApiList<T> = T[] | { data?: T[]; items?: T[] };
const unwrap = <T,>(response: ApiList<T>) => (Array.isArray(response) ? response : response.data ?? response.items ?? []);

export const fiscalApi = {
  listInvoices: async () => unwrap(await api.get<ApiList<FiscalInvoice>>('/api/fiscal/invoices')),
  getInvoice: (id: string | number) => api.get<FiscalInvoice>(`/api/fiscal/invoices/${id}`),
  createInvoice: (payload: Record<string, unknown>) => api.post<FiscalInvoice>('/api/fiscal/invoices', payload),
  createInvoiceFromBooking: (payload: Record<string, unknown>) => api.post<FiscalInvoice>('/api/fiscal/invoices/from-booking', payload),
  updateInvoice: (id: string | number, payload: Record<string, unknown>) => api.put<FiscalInvoice>(`/api/fiscal/invoices/${id}`, payload),
  cancelInvoice: (id: string | number, payload: Record<string, unknown>) => api.delete<void>(`/api/fiscal/invoices/${id}`, { body: JSON.stringify(payload) }),
  getInvoicePdf: (id: string | number) => api.get<string>(`/api/fiscal/invoices/${id}/pdf`),
  prepareNFSe: (id: string | number) => api.post(`/api/fiscal/invoices/${id}/nfse`, {}),
  invoiceStats: () => api.get<Record<string, number>>('/api/fiscal/invoices/stats'),

  listFNRH: async () => unwrap(await api.get<ApiList<FNRHRecord>>('/api/fiscal/fnrh')),
  getFNRH: (id: string | number) => api.get<FNRHRecord>(`/api/fiscal/fnrh/${id}`),
  createFNRH: (payload: Record<string, unknown>) => api.post<FNRHRecord>('/api/fiscal/fnrh', payload),
  createFNRHFromCheckin: (payload: Record<string, unknown>) => api.post<FNRHRecord>('/api/fiscal/fnrh/from-checkin', payload),
  updateFNRH: (id: string | number, payload: Record<string, unknown>) => api.put<FNRHRecord>(`/api/fiscal/fnrh/${id}`, payload),
  getFNRHPdf: (id: string | number) => api.get<string>(`/api/fiscal/fnrh/${id}/pdf`),
  exportEmbratur: (payload: Record<string, unknown>) => api.post('/api/fiscal/fnrh/export-embratur', payload),
  fnrhStats: () => api.get<Record<string, number>>('/api/fiscal/fnrh/stats'),

  recordConsent: (payload: Record<string, unknown>) => api.post<LGPDConsent>('/api/fiscal/lgpd/consents', payload),
  listConsents: async (guestId: string | number) => unwrap(await api.get<ApiList<LGPDConsent>>(`/api/fiscal/lgpd/consents/${guestId}`)),
  consentSummary: (guestId: string | number) => api.get<Record<string, boolean>>(`/api/fiscal/lgpd/consents/${guestId}/summary`),
  revokeConsent: (guestId: string | number, type: string) => api.delete<void>(`/api/fiscal/lgpd/consents/${guestId}/${type}`),
  checkConsent: (guestId: string | number, type: string) => api.get<{ allowed: boolean }>(`/api/fiscal/lgpd/consents/${guestId}/check/${type}`),

  listRequests: async () => unwrap(await api.get<ApiList<LGPDRequest>>('/api/fiscal/lgpd/requests')),
  getRequest: (id: string | number) => api.get<LGPDRequest>(`/api/fiscal/lgpd/requests/${id}`),
  createRequest: (payload: Record<string, unknown>) => api.post<LGPDRequest>('/api/fiscal/lgpd/requests', payload),
  processRequest: (id: string | number, payload: Record<string, unknown>) => api.post(`/api/fiscal/lgpd/requests/${id}/process`, payload),
  overdueRequests: async () => unwrap(await api.get<ApiList<LGPDRequest>>('/api/fiscal/lgpd/requests/overdue')),
  exportGuestData: (guestId: string | number) => api.get<Record<string, unknown>>(`/api/fiscal/lgpd/export/${guestId}`),
  anonymizeGuest: (guestId: string | number) => api.post(`/api/fiscal/lgpd/anonymize/${guestId}`, {}),
  auditLog: async () => unwrap(await api.get<ApiList<LGPDAuditLog>>('/api/fiscal/lgpd/audit')),
  auditLogEntity: async (entityType: string, entityId: string | number) => unwrap(await api.get<ApiList<LGPDAuditLog>>(`/api/fiscal/lgpd/audit/${entityType}/${entityId}`)),

  stats: () => api.get<FiscalStats>('/api/fiscal/stats'),
};
