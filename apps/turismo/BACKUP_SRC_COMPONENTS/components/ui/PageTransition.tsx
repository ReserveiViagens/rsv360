import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimations } from '../../hooks/useAnimations';

interface PageTransitionProps {
  children: React.ReactNode;
  type?: 'fade' | 'slide' | 'scale' | 'flip' | 'none';
  direction?: 'left' | 'right' | 'up' | 'down';
  className?: string;
}

export default function PageTransition({ 
  children, 
  type = 'fade',
  direction = 'up',
  className = ''
}: PageTransitionProps) {
  const { 
    pageTransition, 
    slideTransition,
    scaleIn,
    flipIn,
    isReducedMotion 
  } = useAnimations();

  if (isReducedMotion || type === 'none') {
    return <div className={className}>{children}</div>;
  }

  const getTransitionVariants = () => {
    switch (type) {
      case 'fade':
        return pageTransition;
      case 'slide':
        return {
          initial: { 
            x: direction === 'left' ? '-100%' : direction === 'right' ? '100%' : 0,
            y: direction === 'up' ? '-100%' : direction === 'down' ? '100%' : 0
          },
          animate: { 
            x: 0, 
            y: 0,
            transition: { duration: 0.3, easing: 'easeOut' }
          },
          exit: { 
            x: direction === 'left' ? '100%' : direction === 'right' ? '-100%' : 0,
            y: direction === 'up' ? '100%' : direction === 'down' ? '-100%' : 0,
            transition: { duration: 0.3, easing: 'easeIn' }
          }
        };
      case 'scale':
        return scaleIn;
      case 'flip':
        return flipIn;
      default:
        return pageTransition;
    }
  };

  const variants = getTransitionVariants();

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}
