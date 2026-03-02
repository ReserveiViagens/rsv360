import { useState, useEffect } from 'react';
import { useAccessibility } from './useAccessibility';

export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  stagger?: number;
}

export interface AnimationVariants {
  hidden: any;
  visible: any;
  exit?: any;
}

export function useAnimations() {
  const { config } = useAccessibility();
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    setIsReducedMotion(config.reducedMotion);
  }, [config.reducedMotion]);

  // Configurações de animação baseadas em preferências
  const getAnimationConfig = (baseConfig: AnimationConfig): AnimationConfig => {
    if (isReducedMotion) {
      return {
        ...baseConfig,
        duration: 0.01,
        delay: 0,
        stagger: 0
      };
    }
    return baseConfig;
  };

  // Variantes de animação padrão
  const fadeInUp: AnimationVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      transition: getAnimationConfig({ duration: 0.3, easing: 'easeOut' })
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: getAnimationConfig({ duration: 0.3, easing: 'easeOut' })
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: getAnimationConfig({ duration: 0.2, easing: 'easeIn' })
    }
  };

  const fadeInLeft: AnimationVariants = {
    hidden: { 
      opacity: 0, 
      x: -20,
      transition: getAnimationConfig({ duration: 0.3, easing: 'easeOut' })
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: getAnimationConfig({ duration: 0.3, easing: 'easeOut' })
    },
    exit: { 
      opacity: 0, 
      x: 20,
      transition: getAnimationConfig({ duration: 0.2, easing: 'easeIn' })
    }
  };

  const fadeInRight: AnimationVariants = {
    hidden: { 
      opacity: 0, 
      x: 20,
      transition: getAnimationConfig({ duration: 0.3, easing: 'easeOut' })
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: getAnimationConfig({ duration: 0.3, easing: 'easeOut' })
    },
    exit: { 
      opacity: 0, 
      x: -20,
      transition: getAnimationConfig({ duration: 0.2, easing: 'easeIn' })
    }
  };

  const scaleIn: AnimationVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      transition: getAnimationConfig({ duration: 0.3, easing: 'easeOut' })
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: getAnimationConfig({ duration: 0.3, easing: 'easeOut' })
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: getAnimationConfig({ duration: 0.2, easing: 'easeIn' })
    }
  };

  const slideInDown: AnimationVariants = {
    hidden: { 
      opacity: 0, 
      y: -50,
      transition: getAnimationConfig({ duration: 0.4, easing: 'easeOut' })
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: getAnimationConfig({ duration: 0.4, easing: 'easeOut' })
    },
    exit: { 
      opacity: 0, 
      y: -50,
      transition: getAnimationConfig({ duration: 0.3, easing: 'easeIn' })
    }
  };

  const slideInUp: AnimationVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      transition: getAnimationConfig({ duration: 0.4, easing: 'easeOut' })
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: getAnimationConfig({ duration: 0.4, easing: 'easeOut' })
    },
    exit: { 
      opacity: 0, 
      y: 50,
      transition: getAnimationConfig({ duration: 0.3, easing: 'easeIn' })
    }
  };

  const rotateIn: AnimationVariants = {
    hidden: { 
      opacity: 0, 
      rotate: -180,
      scale: 0.8,
      transition: getAnimationConfig({ duration: 0.5, easing: 'easeOut' })
    },
    visible: { 
      opacity: 1, 
      rotate: 0,
      scale: 1,
      transition: getAnimationConfig({ duration: 0.5, easing: 'easeOut' })
    },
    exit: { 
      opacity: 0, 
      rotate: 180,
      scale: 0.8,
      transition: getAnimationConfig({ duration: 0.3, easing: 'easeIn' })
    }
  };

  const bounceIn: AnimationVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.3,
      transition: getAnimationConfig({ duration: 0.6, easing: 'easeOut' })
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: getAnimationConfig({ 
        duration: 0.6, 
        easing: [0.68, -0.55, 0.265, 1.55] // Bounce easing
      })
    },
    exit: { 
      opacity: 0, 
      scale: 0.3,
      transition: getAnimationConfig({ duration: 0.3, easing: 'easeIn' })
    }
  };

  const flipIn: AnimationVariants = {
    hidden: { 
      opacity: 0, 
      rotateY: -90,
      transition: getAnimationConfig({ duration: 0.6, easing: 'easeOut' })
    },
    visible: { 
      opacity: 1, 
      rotateY: 0,
      transition: getAnimationConfig({ duration: 0.6, easing: 'easeOut' })
    },
    exit: { 
      opacity: 0, 
      rotateY: 90,
      transition: getAnimationConfig({ duration: 0.3, easing: 'easeIn' })
    }
  };

  // Hover animations
  const hoverScale = {
    whileHover: isReducedMotion ? {} : { 
      scale: 1.05,
      transition: getAnimationConfig({ duration: 0.2, easing: 'easeOut' })
    },
    whileTap: isReducedMotion ? {} : { 
      scale: 0.95,
      transition: getAnimationConfig({ duration: 0.1, easing: 'easeOut' })
    }
  };

  const hoverLift = {
    whileHover: isReducedMotion ? {} : { 
      y: -5,
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      transition: getAnimationConfig({ duration: 0.2, easing: 'easeOut' })
    },
    whileTap: isReducedMotion ? {} : { 
      y: 0,
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
      transition: getAnimationConfig({ duration: 0.1, easing: 'easeOut' })
    }
  };

  const hoverGlow = {
    whileHover: isReducedMotion ? {} : { 
      boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
      transition: getAnimationConfig({ duration: 0.3, easing: 'easeOut' })
    },
    whileTap: isReducedMotion ? {} : { 
      boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)',
      transition: getAnimationConfig({ duration: 0.1, easing: 'easeOut' })
    }
  };

  // Stagger animations
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: isReducedMotion ? 0 : 0.1,
        delayChildren: isReducedMotion ? 0 : 0.1
      }
    }
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: getAnimationConfig({ duration: 0.3, easing: 'easeOut' })
    }
  };

  // Loading animations
  const loadingSpinner = {
    animate: isReducedMotion ? {} : {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }
    }
  };

  const loadingPulse = {
    animate: isReducedMotion ? {} : {
      scale: [1, 1.1, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  const loadingBounce = {
    animate: isReducedMotion ? {} : {
      y: [0, -20, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  // Page transition animations
  const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: getAnimationConfig({ duration: 0.4, easing: 'easeOut' })
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: getAnimationConfig({ duration: 0.3, easing: 'easeIn' })
    }
  };

  const slideTransition = {
    initial: { x: '100%' },
    animate: { 
      x: 0,
      transition: getAnimationConfig({ duration: 0.3, easing: 'easeOut' })
    },
    exit: { 
      x: '-100%',
      transition: getAnimationConfig({ duration: 0.3, easing: 'easeIn' })
    }
  };

  return {
    isReducedMotion,
    getAnimationConfig,
    
    // Basic animations
    fadeInUp,
    fadeInLeft,
    fadeInRight,
    scaleIn,
    slideInDown,
    slideInUp,
    rotateIn,
    bounceIn,
    flipIn,
    
    // Hover animations
    hoverScale,
    hoverLift,
    hoverGlow,
    
    // Stagger animations
    staggerContainer,
    staggerItem,
    
    // Loading animations
    loadingSpinner,
    loadingPulse,
    loadingBounce,
    
    // Page transitions
    pageTransition,
    slideTransition
  };
}
