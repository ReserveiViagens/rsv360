/**
 * RSV360 PMS/CRM — Reservei Viagens
 * Copyright (c) 2024-2026 Reservei Viagens LTDA. Todos os direitos reservados.
 * Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
 * @author Douglas P. Figueiredo
 * @license UNLICENSED
 */
export function QRCodePlaceholder({ code }: { code: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="grid grid-cols-6 gap-1">
        {Array.from({ length: 36 }, (_, index) => (
          <div
            key={index}
            className={`aspect-square rounded-[2px] ${index % 3 === 0 || index % 7 === 0 ? 'bg-slate-900' : 'bg-white'}`}
          />
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-slate-500">{code}</p>
    </div>
  );
}
