'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export { formatRestanteMs, propostaAceiteBloqueado } from '@/lib/proposta-validade-ui';

export interface ValidadeApiData {
  validoAte: string | null;
  servidorAgora: string;
  restanteMs: number | null;
  expirada: boolean;
  status: string;
  urgenciaEstilo?: string;
}

export const PROPOSTA_EXPIRADA_MSG =
  'Proposta expirada. Solicite a atualização das tarifas ao seu consultor.';

export function useRoteiroValidade(
  token: string,
  options?: { fallbackPollIntervalMs?: number },
) {
  const [restanteMs, setRestanteMs] = useState<number | null>(null);
  const [expirada, setExpirada] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [validoAte, setValidoAte] = useState<string | null>(null);
  const [urgenciaEstilo, setUrgenciaEstilo] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const anchorRef = useRef<{ syncedAt: number; restanteMs: number } | null>(null);
  const finalSyncRef = useRef(false);

  const applyValidade = useCallback((data: ValidadeApiData) => {
    const ms = data.restanteMs ?? 0;
    anchorRef.current = { syncedAt: Date.now(), restanteMs: ms };
    setRestanteMs(ms);
    setExpirada(Boolean(data.expirada) || ms <= 0);
    setStatus(data.status);
    setValidoAte(data.validoAte ?? null);
    setUrgenciaEstilo(data.urgenciaEstilo);
  }, []);

  const fetchValidade = useCallback(async () => {
    if (!token) return null;
    const res = await fetch(`/api/cotacao/proposta/${encodeURIComponent(token)}/validade`, {
      cache: 'no-store',
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json?.data) return null;
    applyValidade(json.data as ValidadeApiData);
    return json.data as ValidadeApiData;
  }, [applyValidade, token]);

  const markExpirada = useCallback(() => {
    anchorRef.current = { syncedAt: Date.now(), restanteMs: 0 };
    setRestanteMs(0);
    setExpirada(true);
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    finalSyncRef.current = false;
    setLoading(true);
    void fetchValidade().finally(() => setLoading(false));
  }, [fetchValidade, token]);

  useEffect(() => {
    if (!token) return;
    const tick = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;

      const remaining = Math.max(0, anchor.restanteMs - (Date.now() - anchor.syncedAt));
      setRestanteMs(remaining);

      if (remaining <= 0) {
        setExpirada(true);
        if (!finalSyncRef.current) {
          finalSyncRef.current = true;
          void fetchValidade();
        }
      }
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [fetchValidade, token]);

  useEffect(() => {
    const intervalMs = options?.fallbackPollIntervalMs ?? 0;
    if (!token || intervalMs <= 0) return;

    const id = window.setInterval(() => {
      void fetchValidade();
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [fetchValidade, options?.fallbackPollIntervalMs, token]);

  return {
    restanteMs,
    expirada,
    status,
    validoAte,
    urgenciaEstilo,
    loading,
    markExpirada,
    refresh: fetchValidade,
  };
}
