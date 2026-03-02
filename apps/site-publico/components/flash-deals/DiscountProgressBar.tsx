'use client';

interface DiscountProgressBarProps {
  currentDiscount: number;
  maxDiscount: number;
}

export function DiscountProgressBar({ currentDiscount, maxDiscount }: DiscountProgressBarProps) {
  const percentage = Math.min((currentDiscount / maxDiscount) * 100, 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Desconto Progressivo</span>
        <span className="font-semibold text-red-600">{currentDiscount}% / {maxDiscount}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-red-500 to-orange-500 h-3 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-gray-500 text-center">
        Quanto mais tempo passa, maior o desconto!
      </div>
    </div>
  );
}
