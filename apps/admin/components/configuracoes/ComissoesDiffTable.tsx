'use client';

type SplitRow = {
  label: string;
  atual: number;
  sugestao: number;
};

function deltaLabel(atual: number, sugestao: number) {
  const d = sugestao - atual;
  if (d === 0) return '—';
  return `${d > 0 ? '+' : ''}${d}%`;
}

export function ComissoesDiffTable({
  atual,
  sugestao,
}: {
  atual: { plataforma: number; corretor: number; proprietario: number };
  sugestao: { plataforma: number; corretor: number; proprietario: number };
}) {
  const rows: SplitRow[] = [
    { label: 'Plataforma RSV360', atual: atual.plataforma, sugestao: sugestao.plataforma },
    { label: 'Corretor Reservei', atual: atual.corretor, sugestao: sugestao.corretor },
    { label: 'Anfitrião (residual)', atual: atual.proprietario, sugestao: sugestao.proprietario },
  ];

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full min-w-[320px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
            <th className="px-3 py-2 font-medium">Papel</th>
            <th className="px-3 py-2 font-medium">Atual</th>
            <th className="px-3 py-2 font-medium">Sugestão</th>
            <th className="px-3 py-2 font-medium">Δ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const changed = row.atual !== row.sugestao;
            return (
              <tr key={row.label} className={changed ? 'bg-amber-50/60' : undefined}>
                <td className="px-3 py-2 font-medium text-slate-800">{row.label}</td>
                <td className="px-3 py-2 text-slate-600">{row.atual}%</td>
                <td className="px-3 py-2 text-slate-900">{row.sugestao}%</td>
                <td
                  className={`px-3 py-2 font-medium ${changed ? 'text-amber-800' : 'text-slate-400'}`}
                >
                  {deltaLabel(row.atual, row.sugestao)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
