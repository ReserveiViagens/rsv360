import { CheckCircle2, XCircle } from 'lucide-react';
import { fetchVoucherVerificacao } from '@/lib/voucher-verificar';

interface PageProps {
  params: Promise<{ qrToken: string }>;
}

function formatDateBR(iso: string | null): string {
  if (!iso) return '—';
  const d = iso.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return iso;
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

export default async function VerificarVoucherPage({ params }: PageProps) {
  const { qrToken } = await params;
  const result = await fetchVoucherVerificacao(qrToken);

  if (!result.ok) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-4 py-16">
        <XCircle className="h-14 w-14 text-red-500" aria-hidden />
        <h1 className="text-xl font-bold text-slate-900">Voucher inválido</h1>
        <p className="text-center text-slate-600">{result.error}</p>
        <p className="text-xs text-slate-400">Reservei Viagens — RSV360</p>
      </main>
    );
  }

  const v = result.data;

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 px-4 py-16">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="h-10 w-10 shrink-0 text-emerald-600" aria-hidden />
        <div>
          <h1 className="text-xl font-bold text-slate-900">Voucher válido</h1>
          <p className="text-sm text-slate-600">{v.titulo}</p>
        </div>
      </div>

      <dl className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-3 gap-2 px-4 py-3">
          <dt className="text-sm text-slate-500">Hóspede</dt>
          <dd className="col-span-2 text-sm font-medium text-slate-900">{v.hospede}</dd>
        </div>
        <div className="grid grid-cols-3 gap-2 px-4 py-3">
          <dt className="text-sm text-slate-500">Unidade</dt>
          <dd className="col-span-2 text-sm font-medium text-slate-900">{v.unidade ?? '—'}</dd>
        </div>
        <div className="grid grid-cols-3 gap-2 px-4 py-3">
          <dt className="text-sm text-slate-500">Check-in</dt>
          <dd className="col-span-2 text-sm font-medium text-slate-900">
            {formatDateBR(v.checkIn)}
          </dd>
        </div>
        <div className="grid grid-cols-3 gap-2 px-4 py-3">
          <dt className="text-sm text-slate-500">Check-out</dt>
          <dd className="col-span-2 text-sm font-medium text-slate-900">
            {formatDateBR(v.checkOut)}
          </dd>
        </div>
        <div className="grid grid-cols-3 gap-2 px-4 py-3">
          <dt className="text-sm text-slate-500">Status</dt>
          <dd className="col-span-2 text-sm font-medium capitalize text-slate-900">{v.status}</dd>
        </div>
      </dl>

      <p className="text-center text-xs text-slate-400">
        Verificação oficial RSV360 · leitura registrada em{' '}
        {new Date(v.validadoEm).toLocaleString('pt-BR')}
      </p>
    </main>
  );
}
