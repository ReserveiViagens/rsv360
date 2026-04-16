import Link from 'next/link';

export function DMCABadge() {
  return (
    <Link
      href="https://www.dmca.com/"
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm"
    >
      <span className="h-2 w-2 rounded-full bg-amber-500" />
      DMCA PROTEGIDO • ID PENDENTE
    </Link>
  );
}
