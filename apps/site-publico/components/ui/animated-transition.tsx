"use client";

import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedTransitionProps {
  children: React.ReactNode;
  show?: boolean;
  variant?: 'fade' | 'slide' | 'scale' | 'slideUp' | 'slideDown';
  duration?: number;
  className?: string;
}

const variants: Record<string, Variants> = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },
  slideUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  slideDown: {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
};

export function AnimatedTransition({
  children,
  show = true,
  variant = 'fade',
  duration = 0.3,
  className,
}: AnimatedTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={variants[variant]}
          transition={{ duration }}
          className={cn(className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function FadeIn({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <AnimatedTransition variant="fade" className={className}>
      {children}
    </AnimatedTransition>
  );
}

export function SlideIn({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <AnimatedTransition variant="slide" className={className}>
      {children}
    </AnimatedTransition>
  );
}

export function ScaleIn({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <AnimatedTransition variant="scale" className={className}>
      {children}
    </AnimatedTransition>
  );
}

