'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type AmenidadeOpt = { code: string; label: string };

type CmsHotel = {
  id: number;
  content_id: string;
  title: string;
  description: string | null;
  images: string[];
  metadata: Record<string, unknown>;
  status: string | null;
  order_index: number | null;
  video_url: string | null;
  amenidades: string[];
};

const CSS_VARS = {
  '--cms-navy': '#1E40AF',
  '--cms-cyan': '#06B6D4',
  '--cms-orange': '#F59E0B',
  '--cms-bg': '#0B1220',
  '--cms-card': '#111827',
  '--cms-border': '#1F2937',
  '--cms-text': '#E5E7EB',
  '--cms-muted': '#9CA3AF',
} as import("react").CSSProperties;

function firstImage(h: CmsHotel): string {
  if (Array.isArray(h.images) && h.images[0]) return String(h.images[0]);
  const metaImgs = h.metadata?.images;
  if (Array.isArray(metaImgs) && metaImgs[0]) return String(metaImgs[0]);
  return '';
}

function featuresOf(h: CmsHotel): string {
  const f = h.metadata?.features;
  if (Array.isArray(f)) return f.map(String).join(', ');
  return '';
}

async function apiJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(init?.headers || {}),
    },
  });
  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(json.error || `HTTP ${res.status}`);
  }
  return json as T;
}

export function CmsVitrinePanel() {
  const [hotels, setHotels] = useState<CmsHotel[]>([]);
  const [amenidades, setAmenidades] = useState<AmenidadeOpt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Record<number, Partial<CmsHotel> & { featuresText?: string }>>({});
  const [showNew, setShowNew] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const debounceRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [listRes, amRes] = await Promise.all([
        apiJson<{ data: CmsHotel[] }>('/api/admin/cms/content?pageType=hotels'),
        apiJson<{ data: AmenidadeOpt[] }>('/api/admin/cms/amenidades'),
      ]);
      setHotels(listRes.data || []);
      setAmenidades(amRes.data || []);
      const next: typeof drafts = {};
      for (const h of listRes.data || []) {
        next[h.id] = {
          title: h.title,
          description: h.description,
          video_url: h.video_url,
          order_index: h.order_index,
          amenidades: h.amenidades || [],
          images: Array.isArray(h.images) ? h.images.map(String) : [],
          featuresText: featuresOf(h),
        };
      }
      setDrafts(next);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const sorted = useMemo(
    () => [...hotels].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)),
    [hotels],
  );

  const patchDraft = (id: number, patch: Partial<(typeof drafts)[number]>) => {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const saveHotel = async (id: number) => {
    const d = drafts[id];
    if (!d) return;
    setSavingId(id);
    setError(null);
    try {
      const features = String(d.featuresText ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const images = (d.images || []).map(String).filter(Boolean);
      const res = await apiJson<{ data: CmsHotel }>(`/api/admin/cms/content/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: d.title,
          description: d.description,
          features,
          images,
          videoUrl: d.video_url,
          amenidades: d.amenidades,
          orderIndex: d.order_index,
        }),
      });
      setHotels((prev) => prev.map((h) => (h.id === id ? res.data : h)));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSavingId(null);
    }
  };

  const reorder = (id: number, delta: number) => {
    const d = drafts[id];
    if (!d) return;
    const nextOrder = Math.max(0, Number(d.order_index ?? 0) + delta);
    patchDraft(id, { order_index: nextOrder });
    if (debounceRef.current[id]) clearTimeout(debounceRef.current[id]);
    debounceRef.current[id] = setTimeout(() => {
      void (async () => {
        try {
          await apiJson(`/api/admin/cms/content/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ orderIndex: nextOrder }),
          });
          await load();
        } catch (e) {
          setError((e as Error).message);
        }
      })();
    }, 500);
  };

  const uploadFor = async (id: number, file: File) => {
    const form = new FormData();
    form.append('file', file);
    setSavingId(id);
    try {
      const res = await apiJson<{ data: { url: string } }>('/api/admin/cms/upload', {
        method: 'POST',
        body: form,
      });
      const url = res.data.url;
      const abs =
        url.startsWith('http') || url.startsWith('/')
          ? url.startsWith('/')
            ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}${url}`
            : url
          : url;
      const images = [abs, ...((drafts[id]?.images || []).filter((u) => u !== abs))];
      patchDraft(id, { images });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSavingId(null);
    }
  };

  const softDelete = async (id: number) => {
    setSavingId(id);
    try {
      await apiJson(`/api/admin/cms/content/${id}`, { method: 'DELETE' });
      setConfirmDelete(null);
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSavingId(null);
    }
  };

  const createHotel = async (payload: {
    title: string;
    description: string;
    contentId?: string;
  }) => {
    setSavingId(-1);
    try {
      await apiJson('/api/admin/cms/content', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setShowNew(false);
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div style={CSS_VARS} className="min-h-screen bg-[var(--cms-bg)] text-[var(--cms-text)] px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[var(--cms-cyan)]">CMS Vitrine</h1>
            <p className="text-sm text-[var(--cms-muted)]">
              Gerencie fotos, textos, vÃ­deos, ordem e amenidades dos hotÃ©is da cotaÃ§Ã£o.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void load()}
              className="rounded-md border border-[var(--cms-border)] px-3 py-2 text-sm hover:border-[var(--cms-cyan)]"
            >
              Recarregar
            </button>
            <button
              type="button"
              onClick={() => setShowNew(true)}
              className="rounded-md bg-[var(--cms-navy)] px-3 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Novo Hotel
            </button>
          </div>
        </header>

        {error && (
          <div className="rounded-md border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-[var(--cms-muted)]">Carregandoâ€¦</p>
        ) : (
          <div className="space-y-4">
            {sorted.map((h) => {
              const d = drafts[h.id] || {};
              const preview = (d.images && d.images[0]) || firstImage(h);
              const selectedAmen = new Set(d.amenidades || []);
              return (
                <article
                  key={h.id}
                  className="rounded-xl border border-[var(--cms-border)] bg-[var(--cms-card)] p-4 shadow"
                >
                  <div className="grid gap-4 md:grid-cols-[140px_1fr]">
                    <div className="space-y-2">
                      <div className="aspect-[4/3] overflow-hidden rounded-lg bg-black/40">
                        {preview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={preview} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-[var(--cms-muted)]">
                            Sem foto
                          </div>
                        )}
                      </div>
                      <label className="block cursor-pointer rounded-md bg-[var(--cms-cyan)]/20 px-2 py-1 text-center text-xs text-[var(--cms-cyan)]">
                        Upload
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,video/mp4"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) void uploadFor(h.id, f);
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        className="w-full rounded-md border border-[var(--cms-border)] px-2 py-1 text-xs text-[var(--cms-muted)]"
                        onClick={() => patchDraft(h.id, { images: [] })}
                      >
                        Limpar foto
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs text-[var(--cms-muted)]">
                          {h.content_id} Â· #{h.id} Â· {h.status}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            aria-label="Subir ordem"
                            className="rounded border border-[var(--cms-border)] px-2 py-1 text-xs"
                            onClick={() => reorder(h.id, -10)}
                          >
                            â†‘
                          </button>
                          <input
                            type="number"
                            className="w-16 rounded border border-[var(--cms-border)] bg-black/30 px-2 py-1 text-sm"
                            value={d.order_index ?? 0}
                            onChange={(e) =>
                              patchDraft(h.id, { order_index: Number(e.target.value) })
                            }
                          />
                          <button
                            type="button"
                            aria-label="Descer ordem"
                            className="rounded border border-[var(--cms-border)] px-2 py-1 text-xs"
                            onClick={() => reorder(h.id, 10)}
                          >
                            â†“
                          </button>
                        </div>
                      </div>

                      <input
                        className="w-full rounded border border-[var(--cms-border)] bg-black/30 px-3 py-2 text-sm font-semibold"
                        value={d.title ?? ''}
                        onChange={(e) => patchDraft(h.id, { title: e.target.value })}
                        placeholder="TÃ­tulo"
                      />
                      <textarea
                        className="w-full rounded border border-[var(--cms-border)] bg-black/30 px-3 py-2 text-sm"
                        rows={2}
                        value={d.description ?? ''}
                        onChange={(e) => patchDraft(h.id, { description: e.target.value })}
                        placeholder="DescriÃ§Ã£o (1â€“2 frases)"
                      />
                      <input
                        className="w-full rounded border border-[var(--cms-border)] bg-black/30 px-3 py-2 text-sm"
                        value={d.featuresText ?? ''}
                        onChange={(e) => patchDraft(h.id, { featuresText: e.target.value })}
                        placeholder="Features (separar por vÃ­rgula)"
                      />
                      <input
                        className="w-full rounded border border-[var(--cms-border)] bg-black/30 px-3 py-2 text-sm"
                        value={(d.images && d.images[0]) || ''}
                        onChange={(e) => {
                          const v = e.target.value.trim();
                          patchDraft(h.id, { images: v ? [v] : [] });
                        }}
                        placeholder="Foto URL"
                      />
                      <input
                        className="w-full rounded border border-[var(--cms-border)] bg-black/30 px-3 py-2 text-sm"
                        value={d.video_url ?? ''}
                        onChange={(e) => patchDraft(h.id, { video_url: e.target.value })}
                        placeholder="VÃ­deo URL (YouTube/Vimeo/mp4)"
                      />

                      <div className="flex flex-wrap gap-2">
                        {amenidades.map((a) => {
                          const on = selectedAmen.has(a.code);
                          return (
                            <button
                              key={a.code}
                              type="button"
                              onClick={() => {
                                const next = new Set(selectedAmen);
                                if (on) next.delete(a.code);
                                else next.add(a.code);
                                patchDraft(h.id, { amenidades: Array.from(next) });
                              }}
                              className={`rounded-full px-2.5 py-1 text-xs ${
                                on
                                  ? 'bg-[var(--cms-orange)] text-black'
                                  : 'border border-[var(--cms-border)] text-[var(--cms-muted)]'
                              }`}
                            >
                              {a.label}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          type="button"
                          disabled={savingId === h.id}
                          onClick={() => void saveHotel(h.id)}
                          className="rounded-md bg-[var(--cms-navy)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                        >
                          {savingId === h.id ? 'Salvandoâ€¦' : 'Salvar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(h.id)}
                          className="rounded-md border border-red-500/50 px-4 py-2 text-sm text-red-300"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {showNew && (
        <NewHotelModal
          onClose={() => setShowNew(false)}
          onCreate={(p) => void createHotel(p)}
          busy={savingId === -1}
        />
      )}

      {confirmDelete != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-[var(--cms-border)] bg-[var(--cms-card)] p-5">
            <h2 className="text-lg font-semibold">Desativar hotel?</h2>
            <p className="mt-2 text-sm text-[var(--cms-muted)]">
              Soft delete (status inactive). HotÃ©is Etapa A nÃ£o podem ser apagados permanentemente.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-md border border-[var(--cms-border)] px-3 py-2 text-sm"
                onClick={() => setConfirmDelete(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="rounded-md bg-red-600 px-3 py-2 text-sm text-white"
                onClick={() => void softDelete(confirmDelete)}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NewHotelModal({
  onClose,
  onCreate,
  busy,
}: {
  onClose: () => void;
  onCreate: (p: { title: string; description: string; contentId?: string }) => void;
  busy: boolean;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentId, setContentId] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md space-y-3 rounded-xl border border-[var(--cms-border)] bg-[var(--cms-card)] p-5">
        <h2 className="text-lg font-semibold text-[var(--cms-cyan)]">Novo hotel</h2>
        <input
          className="w-full rounded border border-[var(--cms-border)] bg-black/30 px-3 py-2 text-sm"
          placeholder="TÃ­tulo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="w-full rounded border border-[var(--cms-border)] bg-black/30 px-3 py-2 text-sm"
          placeholder="DescriÃ§Ã£o"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          className="w-full rounded border border-[var(--cms-border)] bg-black/30 px-3 py-2 text-sm"
          placeholder="content_id (opcional)"
          value={contentId}
          onChange={(e) => setContentId(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button type="button" className="rounded-md border border-[var(--cms-border)] px-3 py-2 text-sm" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            disabled={!title.trim() || busy}
            className="rounded-md bg-[var(--cms-navy)] px-3 py-2 text-sm text-white disabled:opacity-50"
            onClick={() =>
              onCreate({
                title: title.trim(),
                description: description.trim(),
                contentId: contentId.trim() || undefined,
              })
            }
          >
            Criar
          </button>
        </div>
      </div>
    </div>
  );
}

