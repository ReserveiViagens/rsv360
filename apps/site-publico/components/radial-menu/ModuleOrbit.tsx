'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Home,
  Plane,
  DollarSign,
  Calculator,
  FileSpreadsheet,
  ShoppingCart,
  Megaphone,
  Users,
  Image,
  Bot,
  Minus,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { RadialModule, SubmenuItem } from './radial-menu-types';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  Plane,
  DollarSign,
  Calculator,
  FileSpreadsheet,
  ShoppingCart,
  Megaphone,
  Users,
  Image,
  Bot,
};

const itemVariants = {
  closed: { scale: 0, opacity: 0 },
  open: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 220, damping: 22 },
  },
};

interface ModuleOrbitProps {
  module: RadialModule;
  index: number;
  total: number;
  radius?: number;
  onHide?: (id: string) => void;
  onHover?: () => void;
  onLeave?: () => void;
}

export function ModuleOrbit({
  module,
  index,
  total,
  radius = 180,
  onHide,
  onHover,
  onLeave,
}: ModuleOrbitProps) {
  const [open, setOpen] = useState(false);
  const Icon = iconMap[module.icon] || Home;
  const angle = index * (360 / total);

  return (
    <motion.div
      variants={itemVariants}
      className="absolute left-1/2 top-1/2 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16"
      style={{
        transform: `translate(-50%, -50%) rotate(${angle}deg) translate(0, -${radius}px) rotate(-${angle}deg)`,
        transformOrigin: 'center center',
      }}
      whileHover={{ scale: 1.1, zIndex: 50 }}
      whileTap={{ scale: 0.95 }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onFocus={onHover}
      onBlur={onLeave}
      data-module-orbit
    >
      <div className="relative group w-full h-full">
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <button
              className={`
                w-full h-full min-w-[44px] min-h-[44px] rounded-full
                flex items-center justify-center text-white
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:ring-offset-2 focus:ring-offset-slate-900
                touch-manipulation
              `}
              style={{ touchAction: 'manipulation' }}
              aria-label={`Módulo ${module.label} - Clique para ver submenus`}
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-white/15">
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="center"
            side="top"
            sideOffset={12}
            collisionPadding={16}
            className="min-w-[200px] sm:min-w-[220px] z-[100] bg-slate-800 text-white border-slate-700 rounded-lg shadow-2xl p-2"
          >
            {module.submenus.map((sub: SubmenuItem) => (
              <DropdownMenuItem key={sub.href} asChild className="px-4 py-3 hover:bg-slate-700 rounded cursor-pointer">
                {sub.external ? (
                  <a
                    href={sub.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    {sub.label}
                  </a>
                ) : (
                  <Link href={sub.href} onClick={() => setOpen(false)} className="flex items-center gap-3">
                    {sub.label}
                  </Link>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {module.badge && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#0066CC] text-white text-xs font-medium flex items-center justify-center">
            {module.badge}
          </span>
        )}

        {onHide && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onHide(module.id);
            }}
            className="absolute -top-1 -right-1 w-6 h-6 min-w-[44px] min-h-[44px] rounded-full bg-slate-600 hover:bg-slate-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            title="Ocultar módulo"
            aria-label="Ocultar módulo"
          >
            <Minus className="w-3 h-3" />
          </button>
        )}

        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-white/90">
          {module.label}
        </span>
      </div>
    </motion.div>
  );
}
