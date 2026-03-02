import React from 'react';
import { motion } from 'framer-motion';
import { useAnimations } from '../../hooks/useAnimations';
import { Card } from './Card';

interface AnimatedCardProps {
  children: React.ReactNode;
  animation?: 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'scaleIn' | 'slideInDown' | 'slideInUp' | 'rotateIn' | 'bounceIn' | 'flipIn';
  delay?: number;
  hover?: 'scale' | 'lift' | 'glow' | 'none';
  className?: string;
  onClick?: () => void;
}

export default function AnimatedCard({ 
  children, 
  animation = 'fadeInUp',
  delay = 0,
  hover = 'lift',
  className,
  onClick
}: AnimatedCardProps) {
  const { 
    fadeInUp, 
    fadeInLeft, 
    fadeInRight, 
    scaleIn, 
    slideInDown, 
    slideInUp, 
    rotateIn, 
    bounceIn, 
    flipIn,
    hoverScale,
    hoverLift,
    hoverGlow,
    getAnimationConfig
  } = useAnimations();

  const animationVariants = {
    fadeInUp,
    fadeInLeft,
    fadeInRight,
    scaleIn,
    slideInDown,
    slideInUp,
    rotateIn,
    bounceIn,
    flipIn
  };

  const hoverVariants = {
    scale: hoverScale,
    lift: hoverLift,
    glow: hoverGlow,
    none: {}
  };

  const selectedAnimation = animationVariants[animation];
  const selectedHover = hoverVariants[hover];

  // Adicionar delay se especificado
  const animationWithDelay = {
    ...selectedAnimation,
    hidden: {
      ...selectedAnimation.hidden,
      transition: getAnimationConfig({ 
        duration: 0.3, 
        easing: 'easeOut',
        delay: delay / 1000
      })
    }
  };

  return (
    <motion.div
      variants={animationWithDelay}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={selectedHover.whileHover}
      whileTap={selectedHover.whileTap}
      className={className}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <Card className="h-full">
        {children}
      </Card>
    </motion.div>
  );
}
