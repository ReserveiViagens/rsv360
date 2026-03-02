'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ChevronLeft, ChevronRight, ArrowLeft, Settings2, ChevronUp, ChevronDown, Users } from 'lucide-react';
import { CoreHub } from './CoreHub';
import { ModuleOrbit } from './ModuleOrbit';
import { defaultRadialMenuConfig, GROUP_A_LABEL, GROUP_B_LABEL } from './radial-menu-config';
import { useProprietorDashboard } from '@/hooks/useProprietorDashboard';
import type { Role, RadialModule } from './radial-menu-types';

const HIDDEN_KEY = 'rsv360-radial-hidden-modules';
const ROTATION_A_KEY = 'rsv360-radial-rotation-a';
const ROTATION_B_KEY = 'rsv360-radial-rotation-b';
const ROLE_KEY = 'rsv360-radial-role';
const ORDER_KEY = 'rsv360-radial-order';
const CUSTOM_GROUP_A_KEY = 'rsv360-radial-custom-group-a';
const CUSTOM_GROUP_B_KEY = 'rsv360-radial-custom-group-b';

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const s = localStorage.getItem(key);
    return s ? (JSON.parse(s) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function loadRole(): Role {
  if (typeof window === 'undefined') return 'proprietario';
  try {
    const s = localStorage.getItem(ROLE_KEY);
    if (s && ['proprietario', 'operador', 'admin'].includes(s)) return s as Role;
  } catch {}
  return 'proprietario';
}

const containerVariants = {
  closed: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
  open: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const ORBIT_RADIUS = 140;
const SEMI_SIZE = 260;

export function RadialMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [rotationA, setRotationA] = useState(0);
  const [rotationB, setRotationB] = useState(0);
  const [activeCircle, setActiveCircle] = useState<'a' | 'b'>('a');
  const [role, setRole] = useState<Role>('proprietario');
  const [hiddenModules, setHiddenModules] = useState<string[]>([]);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [showGroupsModal, setShowGroupsModal] = useState(false);
  const [reorderDraft, setReorderDraft] = useState<string[]>([]);
  const [moduleOrder, setModuleOrder] = useState<string[] | null>(null);
  const [customGroupA, setCustomGroupA] = useState<string[]>([]);
  const [customGroupB, setCustomGroupB] = useState<string[]>([]);
  const orbitRefA = useRef<HTMLDivElement>(null);
  const orbitRefB = useRef<HTMLDivElement>(null);
  const { stats } = useProprietorDashboard();

  useEffect(() => {
    setRotationA(loadFromStorage(ROTATION_A_KEY, 0));
    setRotationB(loadFromStorage(ROTATION_B_KEY, 0));
    setRole(loadRole());
    setHiddenModules(loadFromStorage(HIDDEN_KEY, []));
    setCustomGroupA(loadFromStorage(CUSTOM_GROUP_A_KEY, []));
    setCustomGroupB(loadFromStorage(CUSTOM_GROUP_B_KEY, []));
  }, []);

  useEffect(() => {
    saveToStorage(ROTATION_A_KEY, rotationA);
  }, [rotationA]);

  useEffect(() => {
    saveToStorage(ROTATION_B_KEY, rotationB);
  }, [rotationB]);

  useEffect(() => {
    localStorage.setItem(ROLE_KEY, role);
  }, [role]);

  useEffect(() => {
    saveToStorage(HIDDEN_KEY, hiddenModules);
  }, [hiddenModules]);

  const config = defaultRadialMenuConfig;
  const coreMetrics = stats
    ? [
        { label: 'Reservas', value: stats.activeAuctions },
        { label: 'Ocupação', value: `${stats.occupancyRate}%` },
        { label: 'Receita', value: `R$ ${(stats.revenueToday / 1000).toFixed(1)}k` },
      ]
    : config.core.metrics ?? [{ label: 'Reservas', value: '-' }, { label: 'Ocupação', value: '-' }, { label: 'Receita', value: '-' }];

  const allModules = config.modules.filter((m) => !hiddenModules.includes(m.id));
  const visibleModules = allModules.filter((m) => m.roles.includes(role));
  const defaultIds = visibleModules.map((m) => m.id);
  const orderedIds = moduleOrder ?? loadFromStorage(ORDER_KEY, defaultIds);
  const orderedModules = orderedIds
    .map((id) => visibleModules.find((m) => m.id === id))
    .filter(Boolean) as RadialModule[];

  const useCustomGroups = customGroupA.length > 0 || customGroupB.length > 0;
  const modulesA: RadialModule[] = useCustomGroups
    ? customGroupA
        .map((id) => orderedModules.find((m) => m.id === id))
        .filter(Boolean) as RadialModule[]
    : orderedModules.filter((m) => m.roles.includes('proprietario'));
  const modulesB: RadialModule[] = useCustomGroups
    ? customGroupB
        .map((id) => orderedModules.find((m) => m.id === id))
        .filter(Boolean) as RadialModule[]
    : orderedModules.filter((m) => m.roles.includes('operador'));

  const handleHide = useCallback((id: string) => {
    setHiddenModules((prev) => {
      const next = [...prev, id];
      saveToStorage(HIDDEN_KEY, next);
      return next;
    });
  }, []);

  const handleReorder = useCallback((newOrder: string[]) => {
    saveToStorage(ORDER_KEY, newOrder);
    setModuleOrder(newOrder);
    setShowReorderModal(false);
  }, []);

  const handleSaveGroups = useCallback((idsA: string[], idsB: string[]) => {
    setCustomGroupA(idsA);
    setCustomGroupB(idsB);
    saveToStorage(CUSTOM_GROUP_A_KEY, idsA);
    saveToStorage(CUSTOM_GROUP_B_KEY, idsB);
    setShowGroupsModal(false);
  }, []);

  const handleRestoreDefaultGroups = useCallback(() => {
    setCustomGroupA([]);
    setCustomGroupB([]);
    saveToStorage(CUSTOM_GROUP_A_KEY, []);
    saveToStorage(CUSTOM_GROUP_B_KEY, []);
  }, []);

  const dragRefA = useRef<{ startX: number; startY: number; startRotation: number; centerX: number; centerY: number; isDragging: boolean } | null>(null);
  const dragRefB = useRef<{ startX: number; startY: number; startRotation: number; centerX: number; centerY: number; isDragging: boolean } | null>(null);
  const DRAG_THRESHOLD = 8;

  const makeDragHandlers = useCallback(
    (which: 'a' | 'b') => {
      const setRotation = which === 'a' ? setRotationA : setRotationB;
      const rotation = which === 'a' ? rotationA : rotationB;
      const ref = which === 'a' ? orbitRefA : orbitRefB;
      const key = which === 'a' ? ROTATION_A_KEY : ROTATION_B_KEY;
      const dragRef = which === 'a' ? dragRefA : dragRefB;

      const onPointerDown = (e: React.PointerEvent) => {
        if (!ref.current) return;
        if ((e.target as HTMLElement).closest('a, button, [data-module-orbit]')) return;
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        dragRef.current = {
          startX: e.clientX,
          startY: e.clientY,
          startRotation: rotation,
          centerX,
          centerY,
          isDragging: false,
        };
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      };

      const onPointerMove = (e: React.PointerEvent) => {
        if (!dragRef.current) return;
        const { startX, startY, startRotation, centerX, centerY } = dragRef.current;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (!dragRef.current.isDragging && distance < DRAG_THRESHOLD) return;
        dragRef.current.isDragging = true;
        const startAngle = Math.atan2(startY - centerY, startX - centerX);
        const currAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        const deltaDeg = ((currAngle - startAngle) * 180) / Math.PI;
        const next = (startRotation + deltaDeg + 360) % 360;
        setRotation(next);
        saveToStorage(key, next);
        dragRef.current.startX = e.clientX;
        dragRef.current.startY = e.clientY;
        dragRef.current.startRotation = next;
      };

      const onPointerUp = (e: React.PointerEvent) => {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
        dragRef.current = null;
      };

      return { onPointerDown, onPointerMove, onPointerUp };
    },
    [rotationA, rotationB]
  );

  const handlersA = makeDragHandlers('a');
  const handlersB = makeDragHandlers('b');

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as Node;
      if (orbitRefA.current?.contains(target)) {
        setRotationA((prev) => prev - e.deltaY * 0.3);
      } else if (orbitRefB.current?.contains(target)) {
        setRotationB((prev) => prev - e.deltaY * 0.3);
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  const setRotationActive = useCallback(
    (delta: number) => {
      if (activeCircle === 'a') {
        setRotationA((r) => {
          const next = (r + delta + 360) % 360;
          saveToStorage(ROTATION_A_KEY, next);
          return next;
        });
      } else {
        setRotationB((r) => {
          const next = (r + delta + 360) % 360;
          saveToStorage(ROTATION_B_KEY, next);
          return next;
        });
      }
    },
    [activeCircle]
  );

  return (
    <div className="relative w-full min-h-screen bg-[#0f172a] overflow-hidden" data-radial-design="two-semi-circles" data-radial-version="3.0">
      <div className="absolute top-4 left-4 z-50">
        <Link href="/dashboard/proprietario" className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Dashboard
        </Link>
      </div>

      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <button
          onClick={() => {
            setReorderDraft([...orderedIds]);
            setShowReorderModal(true);
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
          aria-label="Configurar ordem dos módulos"
        >
          <Settings2 className="w-4 h-4" />
          Ordem
        </button>
        <button
          onClick={() => setShowGroupsModal(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
          aria-label="Customizar grupos"
        >
          <Users className="w-4 h-4" />
          Grupos
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-[#334155]/80 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 right-0 h-[280px] sm:h-[300px] overflow-hidden pointer-events-none z-10 flex">
        <div className="w-1/2 h-full overflow-hidden pointer-events-none" style={{ pointerEvents: isOpen ? 'auto' : 'none' }}>
          <div
            ref={orbitRefA}
            className="absolute right-0 top-1/2 w-[520px] h-[520px] -mt-[260px] pointer-events-auto select-none cursor-grab active:cursor-grabbing"
            style={{ touchAction: 'none', WebkitTapHighlightColor: 'transparent' }}
            onPointerDown={handlersA.onPointerDown}
            onPointerMove={handlersA.onPointerMove}
            onPointerUp={handlersA.onPointerUp}
            onPointerLeave={handlersA.onPointerUp}
            onPointerCancel={handlersA.onPointerUp}
          >
            <motion.div
              animate={{ scale: isOpen ? 1 : 0.1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute inset-0 rounded-full bg-[#0066CC]"
              style={{ clipPath: 'inset(0 50% 0 0)' }}
            >
              <div className="absolute inset-0 rounded-full overflow-visible">
                <motion.div
                  animate={{ rotate: rotationA }}
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                  className="absolute inset-0"
                >
                  <motion.div variants={containerVariants} initial="closed" animate={isOpen ? 'open' : 'closed'} className="absolute inset-0">
                    {modulesA.map((module, i) => (
                      <ModuleOrbit
                        key={module.id}
                        module={module}
                        index={i}
                        total={modulesA.length}
                        radius={ORBIT_RADIUS}
                        onHide={handleHide}
                      />
                    ))}
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="w-1/2 h-full overflow-hidden pointer-events-none" style={{ pointerEvents: isOpen ? 'auto' : 'none' }}>
          <div
            ref={orbitRefB}
            className="absolute left-0 top-1/2 w-[520px] h-[520px] -mt-[260px] pointer-events-auto select-none cursor-grab active:cursor-grabbing"
            style={{ touchAction: 'none', WebkitTapHighlightColor: 'transparent' }}
            onPointerDown={handlersB.onPointerDown}
            onPointerMove={handlersB.onPointerMove}
            onPointerUp={handlersB.onPointerUp}
            onPointerLeave={handlersB.onPointerUp}
            onPointerCancel={handlersB.onPointerUp}
          >
            <motion.div
              animate={{ scale: isOpen ? 1 : 0.1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute inset-0 rounded-full bg-[#0ea5e9]"
              style={{ clipPath: 'inset(0 0 0 50%)' }}
            >
              <div className="absolute inset-0 rounded-full overflow-visible">
                <motion.div
                  animate={{ rotate: rotationB }}
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                  className="absolute inset-0"
                >
                  <motion.div variants={containerVariants} initial="closed" animate={isOpen ? 'open' : 'closed'} className="absolute inset-0">
                    {modulesB.map((module, i) => (
                      <ModuleOrbit
                        key={module.id}
                        module={module}
                        index={i}
                        total={modulesB.length}
                        radius={ORBIT_RADIUS}
                        onHide={handleHide}
                      />
                    ))}
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full bg-white text-[#0066CC] flex items-center justify-center shadow-xl border-4 border-[#0066CC]/30 min-w-[56px] min-h-[56px] touch-manipulation hover:bg-[#0066CC] hover:text-white transition-colors"
        style={{ touchAction: 'manipulation' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X className="w-8 h-8 sm:w-9 sm:h-9" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <Plus className="w-8 h-8 sm:w-9 sm:h-9" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <div className="fixed left-1/2 -translate-x-1/2 z-40 pointer-events-none" style={{ bottom: 180 }}>
        <CoreHub data={config.core} metrics={coreMetrics} isOpen={isOpen} />
      </div>

      <div className="fixed bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 flex flex-wrap items-center justify-center gap-3 sm:gap-4 bg-slate-800/90 backdrop-blur px-4 sm:px-6 py-3 rounded-full z-50 border border-slate-700">
        <button
          onClick={() => setActiveCircle('a')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${activeCircle === 'a' ? 'bg-[#0066CC] text-white' : 'bg-slate-700 text-slate-300 hover:text-white'}`}
        >
          {GROUP_A_LABEL}
        </button>
        <button
          onClick={() => setActiveCircle('b')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${activeCircle === 'b' ? 'bg-[#0ea5e9] text-white' : 'bg-slate-700 text-slate-300 hover:text-white'}`}
        >
          {GROUP_B_LABEL}
        </button>
        <button onClick={() => setRotationActive(-15)} className="p-2 rounded-full hover:bg-slate-700 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center text-white" aria-label="Girar esquerda">
          <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="bg-transparent text-white px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0066CC] min-h-[44px] touch-manipulation"
        >
          <option value="proprietario">Proprietário</option>
          <option value="operador">Operador</option>
          <option value="admin">Admin</option>
        </select>
        <button onClick={() => setRotationActive(15)} className="p-2 rounded-full hover:bg-slate-700 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center text-white" aria-label="Girar direita">
          <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
      </div>

      <p className="fixed bottom-2 left-1/2 -translate-x-1/2 text-xs text-slate-500 z-50 text-center">
        Arraste ou scroll em cada semi-círculo para girar • Setas giram o grupo selecionado • Perfil: {role}
      </p>

      {showReorderModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" aria-label="Configurar ordem dos módulos">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-800 rounded-xl shadow-2xl max-w-sm w-full mx-4 p-6 border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-white">Ordem dos módulos</h3>
              <button onClick={() => setShowReorderModal(false)} className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors" aria-label="Fechar">
                <X className="w-5 h-5" />
              </button>
            </div>
            <ul className="space-y-2">
              {reorderDraft.map((id, i) => {
                const m = visibleModules.find((mod) => mod.id === id);
                if (!m) return null;
                return (
                  <li key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50">
                    <span className="text-sm font-medium text-white">{m.label}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          if (i === 0) return;
                          const next = [...reorderDraft];
                          [next[i - 1], next[i]] = [next[i], next[i - 1]];
                          setReorderDraft(next);
                        }}
                        disabled={i === 0}
                        className="p-2 rounded hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label="Mover para cima"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (i === reorderDraft.length - 1) return;
                          const next = [...reorderDraft];
                          [next[i], next[i + 1]] = [next[i + 1], next[i]];
                          setReorderDraft(next);
                        }}
                        disabled={i === reorderDraft.length - 1}
                        className="p-2 rounded hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label="Mover para baixo"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <button onClick={() => handleReorder(reorderDraft)} className="mt-4 w-full py-3 rounded-lg bg-[#0066CC] hover:bg-[#0052a3] text-white font-medium transition-colors">
              Salvar ordem
            </button>
          </motion.div>
        </div>
      )}

      {showGroupsModal && (
        <GroupsModal
          visibleModules={visibleModules}
          customGroupA={customGroupA}
          customGroupB={customGroupB}
          onSave={handleSaveGroups}
          onRestoreDefault={handleRestoreDefaultGroups}
          onClose={() => setShowGroupsModal(false)}
        />
      )}
    </div>
  );
}

interface GroupsModalProps {
  visibleModules: RadialModule[];
  customGroupA: string[];
  customGroupB: string[];
  onSave: (idsA: string[], idsB: string[]) => void;
  onRestoreDefault: () => void;
  onClose: () => void;
}

function GroupsModal({ visibleModules, customGroupA, customGroupB, onSave, onRestoreDefault, onClose }: GroupsModalProps) {
  const [draftA, setDraftA] = useState<string[]>(() => customGroupA.length > 0 ? customGroupA : visibleModules.filter((m) => m.roles.includes('proprietario')).map((m) => m.id));
  const [draftB, setDraftB] = useState<string[]>(() => customGroupB.length > 0 ? customGroupB : visibleModules.filter((m) => m.roles.includes('operador')).map((m) => m.id));

  useEffect(() => {
    if (customGroupA.length > 0 || customGroupB.length > 0) {
      setDraftA(customGroupA);
      setDraftB(customGroupB);
    } else {
      setDraftA(visibleModules.filter((m) => m.roles.includes('proprietario')).map((m) => m.id));
      setDraftB(visibleModules.filter((m) => m.roles.includes('operador')).map((m) => m.id));
    }
  }, [visibleModules, customGroupA, customGroupB]);

  const moveToA = (id: string) => {
    setDraftB((b) => b.filter((x) => x !== id));
    setDraftA((a) => (a.includes(id) ? a : [...a, id]));
  };

  const moveToB = (id: string) => {
    setDraftA((a) => a.filter((x) => x !== id));
    setDraftB((b) => (b.includes(id) ? b : [...b, id]));
  };

  const handleRestore = () => {
    setDraftA(visibleModules.filter((m) => m.roles.includes('proprietario')).map((m) => m.id));
    setDraftB(visibleModules.filter((m) => m.roles.includes('operador')).map((m) => m.id));
    onRestoreDefault();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" aria-label="Customizar grupos">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4 p-6 border border-slate-700 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-white">Customizar grupos</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors" aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-slate-400 mb-4">Atribua cada módulo ao Grupo 1 ({GROUP_A_LABEL}) ou Grupo 2 ({GROUP_B_LABEL}). As setas giram o grupo selecionado na barra.</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-[#0066CC] mb-2">{GROUP_A_LABEL}</h4>
            <ul className="space-y-1 max-h-48 overflow-y-auto rounded-lg bg-slate-700/50 p-2">
              {draftA.map((id) => {
                const m = visibleModules.find((x) => x.id === id);
                if (!m) return null;
                return (
                  <li key={m.id} className="flex items-center justify-between p-2 rounded bg-slate-600/50">
                    <span className="text-sm text-white">{m.label}</span>
                    <button type="button" onClick={() => moveToB(m.id)} className="text-xs text-slate-400 hover:text-white" aria-label={`Mover ${m.label} para ${GROUP_B_LABEL}`}>
                      → {GROUP_B_LABEL}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-[#0ea5e9] mb-2">{GROUP_B_LABEL}</h4>
            <ul className="space-y-1 max-h-48 overflow-y-auto rounded-lg bg-slate-700/50 p-2">
              {draftB.map((id) => {
                const m = visibleModules.find((x) => x.id === id);
                if (!m) return null;
                return (
                  <li key={m.id} className="flex items-center justify-between p-2 rounded bg-slate-600/50">
                    <span className="text-sm text-white">{m.label}</span>
                    <button type="button" onClick={() => moveToA(m.id)} className="text-xs text-slate-400 hover:text-white" aria-label={`Mover ${m.label} para ${GROUP_A_LABEL}`}>
                      ← {GROUP_A_LABEL}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <button onClick={handleRestore} className="px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-white text-sm">
            Restaurar padrão por perfil
          </button>
          <button onClick={() => onSave(draftA, draftB)} className="px-4 py-2 rounded-lg bg-[#0066CC] hover:bg-[#0052a3] text-white text-sm font-medium">
            Salvar grupos
          </button>
        </div>
      </motion.div>
    </div>
  );
}
