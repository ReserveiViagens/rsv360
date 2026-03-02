import React from 'react';
import { motion } from 'framer-motion';
import { useAnimations } from '../../hooks/useAnimations';
import { Loader2, Zap, Sparkles } from 'lucide-react';

interface AnimatedLoaderProps {
  type?: 'spinner' | 'pulse' | 'bounce' | 'dots' | 'bars' | 'custom';
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'gray';
  text?: string;
  className?: string;
}

export default function AnimatedLoader({ 
  type = 'spinner',
  size = 'md',
  color = 'blue',
  text,
  className = ''
}: AnimatedLoaderProps) {
  const { 
    loadingSpinner, 
    loadingPulse, 
    loadingBounce,
    isReducedMotion 
  } = useAnimations();

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    gray: 'text-gray-600'
  };

  const renderSpinner = () => (
    <motion.div
      animate={loadingSpinner.animate}
      className={`${sizeClasses[size]} ${colorClasses[color]}`}
    >
      <Loader2 className="h-full w-full" />
    </motion.div>
  );

  const renderPulse = () => (
    <motion.div
      animate={loadingPulse.animate}
      className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full bg-current`}
    />
  );

  const renderBounce = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          animate={loadingBounce.animate}
          transition={{
            ...loadingBounce.animate.transition,
            delay: index * 0.1
          }}
          className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full bg-current`}
        />
      ))}
    </div>
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.2,
            ease: 'easeInOut'
          }}
          className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full bg-current`}
        />
      ))}
    </div>
  );

  const renderBars = () => (
    <div className="flex space-x-1 items-end">
      {[0, 1, 2, 3].map((index) => (
        <motion.div
          key={index}
          animate={{
            height: ['20%', '100%', '20%']
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.1,
            ease: 'easeInOut'
          }}
          className={`w-1 ${colorClasses[color]} bg-current rounded-full`}
          style={{ height: '20px' }}
        />
      ))}
    </div>
  );

  const renderCustom = () => (
    <motion.div
      animate={{
        rotate: [0, 360],
        scale: [1, 1.1, 1]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      className={`${sizeClasses[size]} ${colorClasses[color]}`}
    >
      <Zap className="h-full w-full" />
    </motion.div>
  );

  const renderLoader = () => {
    switch (type) {
      case 'spinner':
        return renderSpinner();
      case 'pulse':
        return renderPulse();
      case 'bounce':
        return renderBounce();
      case 'dots':
        return renderDots();
      case 'bars':
        return renderBars();
      case 'custom':
        return renderCustom();
      default:
        return renderSpinner();
    }
  };

  if (isReducedMotion) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className={`${sizeClasses[size]} ${colorClasses[color]}`}>
          <Loader2 className="h-full w-full" />
        </div>
        {text && (
          <span className={`text-sm ${colorClasses[color]}`}>
            {text}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {renderLoader()}
      {text && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`text-sm ${colorClasses[color]}`}
        >
          {text}
        </motion.span>
      )}
    </div>
  );
}
