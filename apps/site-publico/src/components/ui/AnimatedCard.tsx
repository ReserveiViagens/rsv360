"use client";

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  scale?: boolean;
  glow?: boolean;
  glass?: boolean;
  onClick?: () => void;
}

const cardVariants: Variants = {
  hidden: (direction: string) => ({
    opacity: 0,
    y: direction === 'up' ? 20 : direction === 'down' ? -20 : 0,
    x: direction === 'left' ? 20 : direction === 'right' ? -20 : 0,
    scale: 0.95,
  }),
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
  hover: {
    y: -5,
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
};

const glowVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 0.3,
    transition: { duration: 0.3 }
  },
  hover: {
    opacity: 0.6,
    transition: { duration: 0.2 }
  },
};

export function AnimatedCard({
  children,
  className,
  hover = true,
  delay = 0,
  direction = 'up',
  duration = 0.6,
  scale = true,
  glow = false,
  glass = false,
  onClick,
}: AnimatedCardProps) {
  return (
    <motion.div
      className={cn(
        "relative rounded-lg border bg-card text-card-foreground shadow-sm",
        glass && "glass-card",
        glow && "hover-glow",
        hover && "cursor-pointer",
        className
      )}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={hover ? "hover" : undefined}
      custom={direction}
      transition={{
        delay,
        duration,
      }}
      onClick={onClick}
      whileTap={scale ? { scale: 0.98 } : undefined}
    >
      {glow && (
        <motion.div
          className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 blur-xl -z-10"
          variants={glowVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
        />
      )}
      {children}
    </motion.div>
  );
}

// Componente de lista animada
interface AnimatedListProps {
  children: React.ReactNode[];
  className?: string;
  stagger?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

const listVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: (direction: string) => ({
    opacity: 0,
    y: direction === 'up' ? 20 : direction === 'down' ? -20 : 0,
    x: direction === 'left' ? 20 : direction === 'right' ? -20 : 0,
  }),
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

export function AnimatedList({
  children,
  className,
  stagger = 0.1,
  direction = 'up',
}: AnimatedListProps) {
  return (
    <motion.div
      className={className}
      variants={listVariants}
      initial="hidden"
      animate="visible"
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          custom={direction}
          transition={{ delay: index * stagger }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// Componente de botão animado
interface AnimatedButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const buttonVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15,
    },
  },
  hover: {
    scale: 1.05,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
  tap: {
    scale: 0.95,
  },
  loading: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export function AnimatedButton({
  children,
  className,
  variant = 'default',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
}: AnimatedButtonProps) {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
  };

  const sizeClasses = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 py-2",
    lg: "h-11 px-8 text-lg",
  };

  return (
    <motion.button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      variants={buttonVariants}
      initial="hidden"
      animate={loading ? "loading" : "visible"}
      whileHover={!disabled && !loading ? "hover" : undefined}
      whileTap={!disabled && !loading ? "tap" : undefined}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
    >
      {loading ? (
        <motion.div
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      ) : (
        children
      )}
    </motion.button>
  );
}
