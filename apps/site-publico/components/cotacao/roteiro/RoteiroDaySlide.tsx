'use client';

import { type ReactNode } from 'react';
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'framer-motion';
import { RoteiroDaySkeleton } from './RoteiroDaySkeleton';

const SWIPE_THRESHOLD = 50;

interface RoteiroDaySlideProps {
  activeDay: number;
  direction: number;
  totalDays: number;
  isLoading?: boolean;
  onSwipeNavigate: (day: number) => void;
  children: ReactNode;
}

export function RoteiroDaySlide({
  activeDay,
  direction,
  totalDays,
  isLoading = false,
  onSwipeNavigate,
  children,
}: RoteiroDaySlideProps) {
  const shouldReduceMotion = useReducedMotion();

  const transition = shouldReduceMotion
    ? { type: 'tween' as const, duration: 0 }
    : { type: 'spring' as const, stiffness: 300, damping: 30 };

  const variants: Variants = shouldReduceMotion
    ? {
        enter: { opacity: 0 },
        center: { opacity: 1, x: 0 },
        exit: { opacity: 0 },
      }
    : {
        enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
        center: { x: 0, opacity: 1, zIndex: 1 },
        exit: (dir: number) => ({ x: dir < 0 ? 300 : -300, opacity: 0, zIndex: 0 }),
      };

  const dragEnabled = !shouldReduceMotion && totalDays > 1 && !isLoading;

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x < -SWIPE_THRESHOLD) {
      onSwipeNavigate(activeDay + 1);
    } else if (info.offset.x > SWIPE_THRESHOLD) {
      onSwipeNavigate(activeDay - 1);
    }
  };

  return (
    <div className="relative min-h-[280px] overflow-hidden" data-testid="roteiro-day-slide">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={activeDay}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={transition}
          className="w-full"
        >
          {isLoading ? <RoteiroDaySkeleton /> : children}
        </motion.div>
      </AnimatePresence>

      {dragEnabled && (
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          data-testid="roteiro-swipe-handle"
          aria-hidden
          className="absolute bottom-0 left-0 top-0 z-20 w-12 touch-pan-y cursor-grab active:cursor-grabbing"
        />
      )}
    </div>
  );
}
