import React, { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  showLoading?: boolean;
  loadingDelay?: number;
  transitionType?: 'fade' | 'slide' | 'scale' | 'slideUp' | 'slideDown';
  duration?: number;
  onTransitionStart?: () => void;
  onTransitionComplete?: () => void;
}

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className,
  showLoading = false,
  loadingDelay = 300,
  transitionType = 'fade',
  duration = 0.3,
  onTransitionStart,
  onTransitionComplete
}) => {
  const [isLoading, setIsLoading] = useState(showLoading);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (showLoading) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
        setShouldRender(true);
      }, loadingDelay);
      
      return () => clearTimeout(timer);
    } else {
      setShouldRender(true);
    }
  }, [showLoading, loadingDelay]);

  // Configurações de animação por tipo
  const getTransitionConfig = () => {
    const baseConfig = {
      duration,
      ease: [0.4, 0.0, 0.2, 1] // Easing suave
    };

    switch (transitionType) {
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: baseConfig
        };
      
      case 'slide':
        return {
          initial: { x: 100, opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: -100, opacity: 0 },
          transition: baseConfig
        };
      
      case 'scale':
        return {
          initial: { scale: 0.95, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 1.05, opacity: 0 },
          transition: baseConfig
        };
      
      case 'slideUp':
        return {
          initial: { y: 50, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: -50, opacity: 0 },
          transition: baseConfig
        };
      
      case 'slideDown':
        return {
          initial: { y: -50, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: 50, opacity: 0 },
          transition: baseConfig
        };
      
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: baseConfig
        };
    }
  };

  // Loading component
  const LoadingComponent = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center bg-gray-50"
    >
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="mx-auto mb-4"
        >
          <Loader2 className="w-8 h-8 text-primary-600" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600"
        >
          Carregando...
        </motion.p>
      </div>
    </motion.div>
  );

  // Se ainda está carregando, mostrar loading
  if (isLoading) {
    return <LoadingComponent />;
  }

  // Se não deve renderizar ainda, não mostrar nada
  if (!shouldRender) {
    return null;
  }

  const transitionConfig = getTransitionConfig();

  return (
    <AnimatePresence
      mode="wait"
      onExitComplete={() => onTransitionComplete?.()}
    >
      <motion.div
        key="page-content"
        className={className}
        initial={transitionConfig.initial}
        animate={transitionConfig.animate}
        exit={transitionConfig.exit}
        transition={transitionConfig.transition}
        onAnimationStart={() => onTransitionStart?.()}
        onAnimationComplete={() => onTransitionComplete?.()}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Hook para controlar transições de página
export const usePageTransition = (options: {
  showLoading?: boolean;
  loadingDelay?: number;
  onTransitionStart?: () => void;
  onTransitionComplete?: () => void;
} = {}) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionKey, setTransitionKey] = useState(0);

  const startTransition = () => {
    setIsTransitioning(true);
    setTransitionKey(prev => prev + 1);
    options.onTransitionStart?.();
  };

  const completeTransition = () => {
    setIsTransitioning(false);
    options.onTransitionComplete?.();
  };

  return {
    isTransitioning,
    transitionKey,
    startTransition,
    completeTransition
  };
};

// Componente de transição com loading automático
export const AutoPageTransition: React.FC<PageTransitionProps & {
  loadingText?: string;
  showProgressBar?: boolean;
}> = ({
  children,
  loadingText = "Carregando página...",
  showProgressBar = true,
  ...props
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (props.showLoading) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [props.showLoading, showProgressBar]);

  return (
    <PageTransition {...props}>
      {props.showLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-white flex items-center justify-center"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="mx-auto mb-4"
            >
              <Loader2 className="w-8 h-8 text-primary-600" />
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-600 mb-4"
            >
              {loadingText}
            </motion.p>
            
            {showProgressBar && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-2 bg-primary-200 rounded-full overflow-hidden"
              >
                <motion.div
                  className="h-full bg-primary-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
      {children}
    </PageTransition>
  );
};

export { PageTransition };
export type { PageTransitionProps };
