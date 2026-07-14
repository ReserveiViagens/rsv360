import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { CircleHelp, Loader2, Send, X } from 'lucide-react';
import { Button } from '../ui/button';
import { FASE1_API_BASE } from '../../src/lib/fase1-api';

type Msg = { role: 'user' | 'assistant' | 'system'; text: string };

function getAccessToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('access_token') || localStorage.getItem('token') || '';
}

export async function perguntarInstrutor(
  pergunta: string,
): Promise<{ ok: true; resposta: string; tier?: string } | { ok: false; status: number; error: string }> {
  const token = getAccessToken();
  if (!token) {
    return { ok: false, status: 401, error: 'Faça login para usar o Instrutor.' };
  }

  const res = await fetch(`${FASE1_API_BASE}/api/v1/agentes/instrutor/perguntar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ pergunta }),
  });

  const json = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    data?: { resposta?: string; tier?: string };
    error?: string;
  };

  if (res.status === 404) {
    return {
      ok: false,
      status: 404,
      error: 'Módulo agentes desligado. Peça à operação para ativar as flags.',
    };
  }
  if (res.status === 503) {
    return {
      ok: false,
      status: 503,
      error: json.error || 'Instrutor temporariamente indisponível',
    };
  }
  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      error: json.error || 'Não foi possível obter resposta.',
    };
  }

  return {
    ok: true,
    resposta: json.data?.resposta || 'Sem resposta.',
    tier: json.data?.tier,
  };
}

/**
 * Widget flutuante — Agente Instrutor (F2c-3).
 * Consome POST /api/v1/agentes/instrutor/perguntar (dupla flag + JWT no backend).
 */
export function InstrutorHelpWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: 'system',
      text: 'Sou o Instrutor RSV360. Pergunte como fazer algo no Turismo (orçamento, proposta, unidades…). Não invento preços — confirme no sistema.',
    },
  ]);
  const listRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, open, loading]);

  const send = useCallback(async () => {
    const pergunta = input.trim();
    if (!pergunta || loading) return;
    if (pergunta.length > 500) {
      setMsgs((m) => [...m, { role: 'system', text: 'Pergunta muito longa (máx. 500 caracteres).' }]);
      return;
    }

    setInput('');
    setMsgs((m) => [...m, { role: 'user', text: pergunta }]);
    setLoading(true);
    try {
      const result = await perguntarInstrutor(pergunta);
      if (result.ok) {
        setMsgs((m) => [...m, { role: 'assistant', text: result.resposta }]);
      } else {
        setMsgs((m) => [...m, { role: 'system', text: result.error }]);
      }
    } catch {
      setMsgs((m) => [
        ...m,
        { role: 'system', text: 'Falha de rede. Tente de novo em instantes.' },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3">
      {open && (
        <section
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          className="flex h-[min(70vh,520px)] w-[min(100vw-2rem,380px)] flex-col overflow-hidden rounded-lg border border-border bg-background text-foreground shadow-lg"
        >
          <header className="flex items-center justify-between gap-2 border-b border-border bg-primary px-3 py-2.5 text-primary-foreground">
            <div>
              <h2 id={titleId} className="text-sm font-semibold">
                Instrutor RSV360
              </h2>
              <p className="text-xs opacity-90">Ajuda passo a passo · Turismo</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10"
              aria-label="Fechar ajuda"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" aria-hidden />
            </Button>
          </header>

          <div
            ref={listRef}
            className="flex-1 space-y-3 overflow-y-auto bg-muted/40 px-3 py-3"
            aria-live="polite"
          >
            {msgs.map((msg, i) => (
              <div
                key={`${msg.role}-${i}`}
                className={
                  msg.role === 'user'
                    ? 'ml-8 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground'
                    : msg.role === 'assistant'
                      ? 'mr-4 whitespace-pre-wrap rounded-md border border-border bg-background px-3 py-2 text-sm'
                      : 'rounded-md border border-border bg-accent/60 px-3 py-2 text-xs text-muted-foreground'
                }
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                Pensando…
              </div>
            )}
          </div>

          <form
            className="flex gap-2 border-t border-border bg-background p-2"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <label className="sr-only" htmlFor="instrutor-pergunta">
              Sua pergunta
            </label>
            <input
              id="instrutor-pergunta"
              type="text"
              maxLength={500}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ex.: como criar um orçamento?"
              disabled={loading}
              className="min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()} aria-label="Enviar">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Send className="h-4 w-4" aria-hidden />
              )}
            </Button>
          </form>
        </section>
      )}

      <Button
        type="button"
        size="lg"
        className="h-12 rounded-full px-4 shadow-md"
        aria-expanded={open}
        aria-controls={open ? titleId : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        <CircleHelp className="mr-2 h-5 w-5" aria-hidden />
        Ajuda
      </Button>
    </div>
  );
}

export default InstrutorHelpWidget;
