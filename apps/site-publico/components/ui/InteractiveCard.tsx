'use client';

import React from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface InteractiveCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  hoverEffect?: boolean;
  clickEffect?: boolean;
  delay?: number;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  children,
  title,
  className = '',
  hoverEffect = true,
  clickEffect = true,
  delay = 0,
  icon,
  onClick,
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [30, -30]);
  const rotateY = useTransform(x, [-100, 100], [-30, 30]);

  const springConfig = { damping: 20, stiffness: 300 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!hoverEffect) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  };

  const handleMouseLeave = () => {
    if (!hoverEffect) return;

    x.set(0);
    y.set(0);
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hoverEffect ? { scale: 1.02 } : {}}
      whileTap={clickEffect ? { scale: 0.98 } : {}}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={cn(
        'cursor-pointer transition-all duration-200',
        className
      )}
      style={{
        perspective: 1000,
        transformStyle: 'preserve-3d',
      }}
    >
      <Card
        className={cn(
          'relative overflow-hidden border-0 shadow-lg transition-all duration-300',
          'hover:shadow-xl hover:shadow-primary/10',
          'bg-gradient-to-br from-background to-muted/50',
          'backdrop-blur-sm'
        )}
        style={{
          transform: hoverEffect ? 'rotateX(var(--rotate-x)) rotateY(var(--rotate-y))' : 'none',
          '--rotate-x': springRotateX,
          '--rotate-y': springRotateY,
        } as any}
      >
        {/* Efeito de brilho no hover */}
        {hoverEffect && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6 }}
            style={{ pointerEvents: 'none' }}
          />
        )}

        {/* Header com título e ícone */}
        {title && (
          <CardHeader className="relative z-10 pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
              {icon && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: delay + 0.1, duration: 0.3 }}
                  className="text-primary"
                >
                  {icon}
                </motion.div>
              )}
              <span>{title}</span>
            </CardTitle>
          </CardHeader>
        )}

        {/* Conteúdo */}
        <CardContent className="relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.2, duration: 0.3 }}
          >
            {children}
          </motion.div>
        </CardContent>

        {/* Borda animada */}
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-transparent"
          initial={{ borderColor: 'transparent' }}
          whileHover={{
            borderColor: 'hsl(var(--primary))',
            borderWidth: '2px'
          }}
          transition={{ duration: 0.3 }}
          style={{ pointerEvents: 'none' }}
        />
      </Card>
    </motion.div>
  );
};

// Card com efeito de glassmorphism
export const GlassCard: React.FC<InteractiveCardProps> = (props) => {
  return (
    <InteractiveCard
      {...props}
      className={cn(
        'bg-white/10 dark:bg-black/10',
        'backdrop-blur-md',
        'border border-white/20 dark:border-black/20',
        'shadow-2xl',
        props.className
      )}
    />
  );
};

// Card com efeito de neumorphism
export const NeumorphicCard: React.FC<InteractiveCardProps> = (props) => {
  return (
    <InteractiveCard
      {...props}
      className={cn(
        'bg-background',
        'shadow-[inset_-2px_-2px_6px_rgba(255,255,255,0.1),inset_2px_2px_6px_rgba(0,0,0,0.1)]',
        'dark:shadow-[inset_-2px_-2px_6px_rgba(255,255,255,0.05),inset_2px_2px_6px_rgba(0,0,0,0.3)]',
        'hover:shadow-[inset_-1px_-1px_3px_rgba(255,255,255,0.1),inset_1px_1px_3px_rgba(0,0,0,0.1)]',
        'dark:hover:shadow-[inset_-1px_-1px_3px_rgba(255,255,255,0.05),inset_1px_1px_3px_rgba(0,0,0,0.3)]',
        props.className
      )}
    />
  );
};
